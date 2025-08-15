import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../services/supabaseService';
import { Note, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  notes: Note[];
  loading: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  saveNote: (note: Note) => Promise<void>;
  saveNotes: (notes: Note[]) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  deleteNotes: (noteIds: string[]) => Promise<void>;
  loadNotes: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadFile: (file: File, folder?: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  deleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  listUserFiles: (folder?: string) => Promise<{ success: boolean; files?: any[]; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initializeAuth = async () => {
      try {
        const currentUser = await SupabaseService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await loadUserData(currentUser.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const userProfile = await SupabaseService.getUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
      }

      // Load user notes
      const userNotes = await SupabaseService.loadNotes(userId);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const result = await SupabaseService.signUp(email, password, fullName);
      
      if (result.success && result.user) {
        setUser(result.user);
        await loadUserData(result.user.id);
      }
      
      return result;
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Sign up failed' };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await SupabaseService.signIn(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        await loadUserData(result.user.id);
      }
      
      return result;
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Sign in failed' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await SupabaseService.signOut();
      setUser(null);
      setProfile(null);
      setNotes([]);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const saveNote = async (note: Note) => {
    if (!user) return;
    
    try {
      await SupabaseService.saveNote(note, user.id);
      
      // Update local state
      setNotes(prevNotes => {
        const existingIndex = prevNotes.findIndex(n => n.id === note.id);
        if (existingIndex >= 0) {
          const updated = [...prevNotes];
          updated[existingIndex] = note;
          return updated;
        } else {
          return [note, ...prevNotes];
        }
      });
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const saveNotes = async (notesToSave: Note[]) => {
    if (!user) return;
    
    try {
      await SupabaseService.saveNotes(notesToSave, user.id);
      
      // Update local state
      setNotes(prevNotes => {
        const updatedNotes = [...prevNotes];
        
        notesToSave.forEach(note => {
          const existingIndex = updatedNotes.findIndex(n => n.id === note.id);
          if (existingIndex >= 0) {
            updatedNotes[existingIndex] = note;
          } else {
            updatedNotes.unshift(note);
          }
        });
        
        return updatedNotes;
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;
    
    try {
      await SupabaseService.deleteNote(noteId, user.id);
      
      // Update local state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const deleteNotes = async (noteIds: string[]) => {
    if (!user) return;
    
    try {
      await SupabaseService.deleteNotes(noteIds, user.id);
      
      // Update local state
      setNotes(prevNotes => prevNotes.filter(note => !noteIds.includes(note.id)));
    } catch (error) {
      console.error('Error deleting notes:', error);
    }
  };

  const loadNotes = async () => {
    if (!user) return;
    
    try {
      const userNotes = await SupabaseService.loadNotes(user.id);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;
    
    try {
      await SupabaseService.updateUserProfile(user.id, updates);
      setProfile({ ...profile, ...updates });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // File management methods
  const uploadFile = async (file: File, folder: string = 'uploads') => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      return await SupabaseService.uploadFile(file, user.id, folder);
    } catch (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  };

  const deleteFile = async (filePath: string) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      return await SupabaseService.deleteFile(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Delete failed' };
    }
  };

  const listUserFiles = async (folder: string = '') => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      return await SupabaseService.listUserFiles(user.id, folder);
    } catch (error) {
      console.error('Error listing files:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Listing failed' };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    notes,
    loading,
    isLoading: loading,
    signUp,
    signIn,
    signOut,
    saveNote,
    saveNotes,
    deleteNote,
    deleteNotes,
    loadNotes,
    updateProfile,
    uploadFile,
    deleteFile,
    listUserFiles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
