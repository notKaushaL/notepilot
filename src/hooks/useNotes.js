import { useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';

const STORAGE_KEY = 'ai-notes-app';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  // Load notes from localStorage on initial mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        
        // Validate parsed notes structure
        if (Array.isArray(parsedNotes)) {
          // Ensure all notes have required properties
          const validatedNotes = parsedNotes.map(note => ({
            id: note.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
            title: typeof note.title === 'string' ? note.title : 'Untitled Note',
            content: typeof note.content === 'string' ? note.content : '',
            createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
            updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
            isPinned: Boolean(note.isPinned),
            isArchived: Boolean(note.isArchived),
            isEncrypted: Boolean(note.isEncrypted),
            aiTags: Array.isArray(note.aiTags) ? note.aiTags : [],
            aiSummary: typeof note.aiSummary === 'string' ? note.aiSummary : '',
            previewTitle: note.previewTitle || null,
            previewContent: note.previewContent || null
          }));
          
          setNotes(validatedNotes);
          
          // Set the first note as current if exists and not encrypted
          const firstUnencryptedNote = validatedNotes.find(note => !note.isEncrypted);
          if (firstUnencryptedNote) {
            setCurrentNote(firstUnencryptedNote);
          }
        }
      }
    } catch (error) {
      console.error('Error loading notes from localStorage:', error);
      // Initialize with empty array if corrupted data
      setNotes([]);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    try {
      // Only save if notes is not empty on initial load
      if (notes.length > 0 || localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
      }
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded. Please delete some notes to continue.');
      }
    }
  }, [notes]);

  // Generate unique ID for new notes
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Create a new note
  const createNote = useCallback(() => {
    const newNote = {
      id: generateId(),
      title: 'New Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isArchived: false,
      isEncrypted: false,
      aiTags: [],
      aiSummary: '',
    };

    setNotes(prevNotes => [newNote, ...prevNotes]);
    setCurrentNote(newNote);
  }, []);

  // Update an existing note
  const updateNote = useCallback((updatedNote) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === updatedNote.id
          ? { ...updatedNote, updatedAt: new Date() }
          : note
      )
    );
  }, []);

  // Delete a note
  const deleteNote = useCallback((noteId) => {
    console.log('🗑️ deleteNote called with noteId:', noteId);
    
    setNotes(prevNotes => {
      const noteToDelete = prevNotes.find(n => n.id === noteId);
      console.log('🗑️ Note to delete:', noteToDelete ? { id: noteToDelete.id, title: noteToDelete.title } : 'NOT FOUND');
      
      if (!noteToDelete) {
        console.error('🗑️ Note not found with ID:', noteId);
        return prevNotes;
      }

      const filtered = prevNotes.filter(note => note.id !== noteId);
      console.log('🗑️ Remaining notes after deletion:', filtered.length);
      
      // If the deleted note was current, set a new current note
      if (currentNote?.id === noteId) {
        setCurrentNote(filtered.length > 0 ? filtered[0] : null);
      }
      
      return filtered;
    });
  }, [currentNote]);

  // Toggle pin status of a note
  const togglePin = useCallback((noteId) => {
    console.log('🔥 togglePin called with noteId:', noteId);
    
    setNotes(prevNotes => {
      const noteToToggle = prevNotes.find(n => n.id === noteId);
      console.log('🔥 Note to toggle:', noteToToggle ? { id: noteToToggle.id, title: noteToToggle.title, isPinned: noteToToggle.isPinned } : 'NOT FOUND');
      
      if (!noteToToggle) {
        console.error('🔥 Note not found with ID:', noteId);
        return prevNotes;
      }

      const updatedNotes = prevNotes.map(note =>
        note.id === noteId
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
          : note
      );
      
      const updatedNote = updatedNotes.find(n => n.id === noteId);
      console.log('🔥 Updated note after pin toggle:', updatedNote ? { id: updatedNote.id, title: updatedNote.title, isPinned: updatedNote.isPinned } : 'NOT FOUND');
      
      return updatedNotes;
    });
    
    // Update current note if it's the one being pinned/unpinned
    if (currentNote?.id === noteId) {
      setCurrentNote(prevCurrent => ({
        ...prevCurrent,
        isPinned: !prevCurrent.isPinned,
        updatedAt: new Date()
      }));
    }
  }, [currentNote]);

  // Toggle archive status of a note
  const toggleArchive = useCallback((noteId) => {
    console.log('📁 toggleArchive called with noteId:', noteId);
    
    setNotes(prevNotes => {
      const noteToToggle = prevNotes.find(n => n.id === noteId);
      console.log('📁 Note to toggle:', noteToToggle ? { id: noteToToggle.id, title: noteToToggle.title, isArchived: noteToToggle.isArchived } : 'NOT FOUND');
      
      if (!noteToToggle) {
        console.error('📁 Note not found with ID:', noteId);
        return prevNotes;
      }

      const updatedNotes = prevNotes.map(note =>
        note.id === noteId
          ? { ...note, isArchived: !note.isArchived, updatedAt: new Date() }
          : note
      );
      
      const updatedNote = updatedNotes.find(n => n.id === noteId);
      console.log('📁 Updated note after archive toggle:', updatedNote ? { id: updatedNote.id, title: updatedNote.title, isArchived: updatedNote.isArchived } : 'NOT FOUND');
      
      return updatedNotes;
    });
    
    // If archiving the current note, clear it
    if (currentNote?.id === noteId) {
      setCurrentNote(null);
    }
  }, [currentNote]);

  // Encrypt a note
  const encryptNote = useCallback(async (noteId, password) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || note.isEncrypted) return false;

    try {
      // Store original data for backup
      const originalContent = note.content;
      const originalTitle = note.title;
      
      const encryptedContent = CryptoJS.AES.encrypt(originalContent, password).toString();
      const encryptedTitle = CryptoJS.AES.encrypt(originalTitle, password).toString();
      
      const encryptedNote = {
        ...note,
        content: encryptedContent,
        title: encryptedTitle,
        isEncrypted: true,
        updatedAt: new Date(),
        // Store preview for display purposes
        previewTitle: originalTitle.length > 20 ? originalTitle.substring(0, 20) + '...' : originalTitle,
        previewContent: 'This note is encrypted and requires a password to view.'
      };

      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === noteId ? encryptedNote : n
        )
      );
      
      if (currentNote?.id === noteId) {
        setCurrentNote(null); // Clear current note after encryption
      }
      
      return true;
    } catch (error) {
      console.error('Error encrypting note:', error);
      return false;
    }
  }, [notes, currentNote]);

  // Decrypt a note
  const decryptNote = useCallback(async (noteId, password) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.isEncrypted) return false;

    try {
      const decryptedContent = CryptoJS.AES.decrypt(note.content, password).toString(CryptoJS.enc.Utf8);
      const decryptedTitle = CryptoJS.AES.decrypt(note.title, password).toString(CryptoJS.enc.Utf8);
      
      if (!decryptedContent || !decryptedTitle) {
        return false; // Invalid password
      }

      const decryptedNote = {
        ...note,
        content: decryptedContent,
        title: decryptedTitle,
        isEncrypted: false,
        updatedAt: new Date()
      };

      // Update the note in the list
      setNotes(prevNotes =>
        prevNotes.map(n =>
          n.id === noteId ? decryptedNote : n
        )
      );

      // Set as current note
      setCurrentNote(decryptedNote);

      return true;
    } catch (error) {
      console.error('Error decrypting note:', error);
      return false;
    }
  }, [notes]);

  // Filter notes based on search term, archive status
  const filteredNotes = notes.filter(note => {
    // Archive filter - show archived notes only when showArchived is true
    if (showArchived && !note.isArchived) return false;
    if (!showArchived && note.isArchived) return false;
    
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = note.title.toLowerCase().includes(searchLower);
      
      // For encrypted notes, we can't search content
      if (note.isEncrypted) {
        return titleMatch;
      }
      
      // Remove HTML tags from content for search
      const contentText = note.content.replace(/<[^>]*>/g, '');
      const contentMatch = contentText.toLowerCase().includes(searchLower);
      
      return titleMatch || contentMatch;
    }
    
    return true;
  });

  // Export/Import functionality
  const exportNotes = useCallback(() => {
    try {
      const exportData = {
        notes: notes,
        exportDate: new Date(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-notes-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting notes:', error);
    }
  }, [notes]);

  const importNotes = useCallback((fileContent) => {
    try {
      const importData = JSON.parse(fileContent);
      
      if (importData.notes && Array.isArray(importData.notes)) {
        setNotes(importData.notes);
        
        if (importData.notes.length > 0) {
          setCurrentNote(importData.notes[0]);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing notes:', error);
      return false;
    }
  }, []);

  return {
    notes,
    currentNote,
    setCurrentNote,
    searchTerm,
    setSearchTerm,
    filteredNotes,
    showArchived,
    setShowArchived,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    encryptNote,
    decryptNote,
    exportNotes,
    importNotes
  };
};