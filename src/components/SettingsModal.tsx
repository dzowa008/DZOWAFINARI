import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Download, 
  Upload, 
  Trash2, 
  User, 
  Key, 
  Globe, 
  Mic, 
  Volume2,
  Eye,
  Database,
  Zap,
  Settings as SettingsIcon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

function SettingsModal({ isOpen, onClose, onLogout }: SettingsModalProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: {
      desktop: true,
      email: false,
      sound: true,
      aiSummaries: true
    },
    privacy: {
      analytics: false,
      crashReports: true,
      dataSharing: false
    },
    ai: {
      autoSummary: true,
      smartSearch: true,
      voiceTranscription: true,
      language: 'en'
    },
    storage: {
      autoBackup: true,
      syncAcrossDevices: true,
      localStorage: '2.4 GB',
      cloudStorage: '8.7 GB'
    },
    audio: {
      quality: 'high',
      noiseReduction: true,
      autoGainControl: true
    }
  });

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'ai', label: 'AI Features', icon: Zap },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'storage', label: 'Storage', icon: Database }
  ];

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const exportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smarta-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="w-full mt-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Log Out
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Auto-save</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save changes as you type</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Smart categorization</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Let AI automatically categorize your notes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Default note category</h4>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Personal</option>
                      <option>Work</option>
                      <option>Research</option>
                      <option>Ideas</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Appearance</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Theme</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => toggleTheme()}
                        className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                          theme === 'light'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <Sun className="w-6 h-6 text-yellow-500" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">Light</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Clean and bright</div>
                        </div>
                      </button>
                      <button
                        onClick={() => toggleTheme()}
                        className={`p-4 border-2 rounded-lg flex items-center space-x-3 transition-colors ${
                          theme === 'dark'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        <Moon className="w-6 h-6 text-purple-500" />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">Dark</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Easy on the eyes</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Font size</h4>
                    <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>Small</option>
                      <option>Medium</option>
                      <option>Large</option>
                    </select>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sidebar position</h4>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input type="radio" name="sidebar" className="mr-2" defaultChecked />
                        <span className="text-gray-900 dark:text-white">Left</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="sidebar" className="mr-2" />
                        <span className="text-gray-900 dark:text-white">Right</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.notifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'desktop' && 'Show desktop notifications'}
                          {key === 'email' && 'Send email notifications'}
                          {key === 'sound' && 'Play notification sounds'}
                          {key === 'aiSummaries' && 'Notify when AI summaries are ready'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={value}
                          onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy & Security</h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.privacy).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'analytics' && 'Help improve the app by sharing usage data'}
                          {key === 'crashReports' && 'Automatically send crash reports'}
                          {key === 'dataSharing' && 'Share anonymized data for research'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={value}
                          onChange={(e) => updateSetting('privacy', key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Danger Zone</h4>
                    <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                      These actions cannot be undone. Please be careful.
                    </p>
                    <div className="space-y-2">
                      <button
                        onClick={exportData}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export All Data</span>
                      </button>
                      <button
                        onClick={clearAllData}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear All Data</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI Features</h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.ai).filter(([key]) => key !== 'language').map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'autoSummary' && 'Automatically generate summaries for long notes'}
                          {key === 'smartSearch' && 'Use AI to understand search context'}
                          {key === 'voiceTranscription' && 'Convert speech to text automatically'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={value as boolean}
                          onChange={(e) => updateSetting('ai', key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}

                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">AI Language</h4>
                    <select 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={settings.ai.language}
                      onChange={(e) => updateSetting('ai', 'language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Audio Settings</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recording Quality</h4>
                    <select 
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={settings.audio.quality}
                      onChange={(e) => updateSetting('audio', 'quality', e.target.value)}
                    >
                      <option value="low">Low (32 kbps)</option>
                      <option value="medium">Medium (64 kbps)</option>
                      <option value="high">High (128 kbps)</option>
                      <option value="lossless">Lossless (WAV)</option>
                    </select>
                  </div>

                  {['noiseReduction', 'autoGainControl'].map(key => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'noiseReduction' && 'Reduce background noise in recordings'}
                          {key === 'autoGainControl' && 'Automatically adjust recording volume'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.audio[key as keyof typeof settings.audio] as boolean}
                          onChange={(e) => updateSetting('audio', key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Storage & Sync</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Storage Usage</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Local Storage</span>
                        <span className="font-medium text-gray-900 dark:text-white">{settings.storage.localStorage}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '24%' }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Cloud Storage</span>
                        <span className="font-medium text-gray-900 dark:text-white">{settings.storage.cloudStorage}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '58%' }}></div>
                      </div>
                    </div>
                  </div>

                  {['autoBackup', 'syncAcrossDevices'].map(key => (
                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {key === 'autoBackup' && 'Automatically backup your notes to the cloud'}
                          {key === 'syncAcrossDevices' && 'Keep your notes synced across all devices'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={settings.storage[key as keyof typeof settings.storage] as boolean}
                          onChange={(e) => updateSetting('storage', key, e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;