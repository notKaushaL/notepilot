// Storage service for notes and user preferences

const STORAGE_KEYS = {
  NOTES: 'notepilot_notes',
  PREFERENCES: 'notepilot_preferences',
  AI_CACHE: 'notepilot_ai_cache'
};

class StorageService {
  // Notes management
  static getNotes() {
    try {
      const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
      return notes ? JSON.parse(notes) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  }

  static saveNotes(notes) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
      return true;
    } catch (error) {
      console.error('Error saving notes:', error);
      return false;
    }
  }

  static addNote(note) {
    const notes = this.getNotes();
    const newNote = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...note
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  }

  static updateNote(id, updates) {
    const notes = this.getNotes();
    const index = notes.findIndex(note => note.id === id);
    
    if (index !== -1) {
      notes[index] = {
        ...notes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveNotes(notes);
      return notes[index];
    }
    return null;
  }

  static deleteNote(id) {
    const notes = this.getNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    this.saveNotes(filteredNotes);
    return filteredNotes.length < notes.length;
  }

  static searchNotes(query) {
    const notes = this.getNotes();
    const lowerQuery = query.toLowerCase();
    
    return notes.filter(note => 
      note.title?.toLowerCase().includes(lowerQuery) ||
      note.content?.toLowerCase().includes(lowerQuery) ||
      note.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  // Preferences management
  static getPreferences() {
    try {
      const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return prefs ? JSON.parse(prefs) : {
        theme: 'dark',
        fontSize: 'medium',
        aiEnabled: true,
        autoSave: true,
        language: 'en'
      };
    } catch (error) {
      console.error('Error loading preferences:', error);
      return {};
    }
  }

  static savePreferences(preferences) {
    try {
      const currentPrefs = this.getPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPrefs));
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  // AI cache management
  static getAICache(key) {
    try {
      const cache = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
      const cacheObj = cache ? JSON.parse(cache) : {};
      
      // Check if cache entry exists and is not expired (24 hours)
      const entry = cacheObj[key];
      if (entry && (Date.now() - entry.timestamp) < 24 * 60 * 60 * 1000) {
        return entry.data;
      }
      return null;
    } catch (error) {
      console.error('Error loading AI cache:', error);
      return null;
    }
  }

  static setAICache(key, data) {
    try {
      const cache = localStorage.getItem(STORAGE_KEYS.AI_CACHE);
      const cacheObj = cache ? JSON.parse(cache) : {};
      
      cacheObj[key] = {
        data,
        timestamp: Date.now()
      };
      
      // Keep only last 100 entries to prevent storage bloat
      const entries = Object.entries(cacheObj);
      if (entries.length > 100) {
        const sortedEntries = entries.sort(([,a], [,b]) => b.timestamp - a.timestamp);
        const trimmedObj = Object.fromEntries(sortedEntries.slice(0, 100));
        localStorage.setItem(STORAGE_KEYS.AI_CACHE, JSON.stringify(trimmedObj));
      } else {
        localStorage.setItem(STORAGE_KEYS.AI_CACHE, JSON.stringify(cacheObj));
      }
      return true;
    } catch (error) {
      console.error('Error saving AI cache:', error);
      return false;
    }
  }

  static clearAICache() {
    try {
      localStorage.removeItem(STORAGE_KEYS.AI_CACHE);
      return true;
    } catch (error) {
      console.error('Error clearing AI cache:', error);
      return false;
    }
  }

  // Export/Import functionality
  static exportNotes() {
    const notes = this.getNotes();
    const preferences = this.getPreferences();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      notes,
      preferences
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notepilot-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  static importNotes(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          
          if (importData.notes && Array.isArray(importData.notes)) {
            this.saveNotes(importData.notes);
          }
          
          if (importData.preferences) {
            this.savePreferences(importData.preferences);
          }
          
          resolve(importData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Storage quota management
  static getStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate();
    }
    
    // Fallback for browsers that don't support the Storage API
    const used = new Blob(Object.values(localStorage)).size;
    return Promise.resolve({
      quota: 10 * 1024 * 1024, // Estimate 10MB
      usage: used
    });
  }

  static clearAllData() {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

export default StorageService;