import { supabase } from '../utils/supabaseClient';
import { Note, UserProfile } from '../types';

export interface SupabaseNote {
  id: string;
  title: string;
  content: string;
  type: string;
  tags: string[];
  category: string;
  created_at: string;
  updated_at: string;
  summary?: string;
  transcription?: string;
  is_starred: boolean;
  audio_url?: string;
  duration?: number;
  file_url?: string;
  source_file?: string;
  extracted_from?: string;
  user_id: string;
}

export class SupabaseService {
  // File Storage Methods
  static async uploadFile(file: File, userId: string, folder: string = 'uploads'): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('user-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-files')
        .getPublicUrl(fileName);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
    }
  }

  static async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from('user-files')
        .remove([filePath]);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('File deletion error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Deletion failed' };
    }
  }

  static async listUserFiles(userId: string, folder: string = ''): Promise<{ success: boolean; files?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .list(`${userId}/${folder}`, {
          limit: 100,
          offset: 0
        });

      if (error) throw error;
      return { success: true, files: data };
    } catch (error) {
      console.error('File listing error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Listing failed' };
    }
  }
  // Authentication Methods
  static async signUp(email: string, password: string, fullName: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await this.createUserProfile(data.user.id, fullName, email);
      }

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // User Profile Methods
  static async createUserProfile(userId: string, fullName: string, email: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: fullName,
          email: email,
          created_at: new Date().toISOString(),
        });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Create user profile error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update user profile error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Notes Methods
  static async saveNote(note: Note, userId: string) {
    try {
      const supabaseNote: Omit<SupabaseNote, 'user_id'> & { user_id: string } = {
        id: note.id,
        title: note.title,
        content: note.content,
        type: note.type,
        tags: note.tags,
        category: note.category,
        created_at: note.createdAt.toISOString(),
        updated_at: note.updatedAt.toISOString(),
        summary: note.summary,
        transcription: note.transcription,
        is_starred: note.isStarred,
        audio_url: note.audioUrl,
        duration: note.duration,
        file_url: note.fileUrl,
        source_file: note.sourceFile,
        extracted_from: note.extractedFrom,
        user_id: userId,
      };

      const { data, error } = await supabase
        .from('notes')
        .upsert(supabaseNote);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save note error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async saveNotes(notes: Note[], userId: string) {
    try {
      const supabaseNotes = notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        type: note.type,
        tags: note.tags,
        category: note.category,
        created_at: note.createdAt.toISOString(),
        updated_at: note.updatedAt.toISOString(),
        summary: note.summary,
        transcription: note.transcription,
        is_starred: note.isStarred,
        audio_url: note.audioUrl,
        duration: note.duration,
        file_url: note.fileUrl,
        source_file: note.sourceFile,
        extracted_from: note.extractedFrom,
        user_id: userId,
      }));

      const { data, error } = await supabase
        .from('notes')
        .upsert(supabaseNotes);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Save notes error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async loadNotes(userId: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data.map(supabaseNote => ({
        id: supabaseNote.id,
        title: supabaseNote.title,
        content: supabaseNote.content,
        type: supabaseNote.type as Note['type'],
        tags: supabaseNote.tags,
        category: supabaseNote.category,
        createdAt: new Date(supabaseNote.created_at),
        updatedAt: new Date(supabaseNote.updated_at),
        summary: supabaseNote.summary,
        transcription: supabaseNote.transcription,
        isStarred: supabaseNote.is_starred,
        audioUrl: supabaseNote.audio_url,
        duration: supabaseNote.duration,
        fileUrl: supabaseNote.file_url,
        sourceFile: supabaseNote.source_file,
        extractedFrom: supabaseNote.extracted_from,
      }));
    } catch (error) {
      console.error('Load notes error:', error);
      return [];
    }
  }

  static async deleteNote(noteId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete note error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async deleteNotes(noteIds: string[], userId: string) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .in('id', noteIds)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Delete notes error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Real-time subscription for notes
  static subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
    const subscription = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Reload notes when changes occur
          const notes = await this.loadNotes(userId);
          callback(notes);
        }
      )
      .subscribe();

    return subscription;
  }

  // Utility method to check connection
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) throw error;
      return { success: true, connected: true };
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return { success: false, connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
