import React, { useState, useEffect, useRef } from 'react';
import { Pin, MoreVertical, Clock, Lock, Shield, Trash2, Archive, ArchiveRestore } from 'lucide-react';
import EncryptionModal from './EncryptionModal';

const NotesGrid = ({ 
  notes = [], 
  currentNote, 
  onSelectNote, 
  onDeleteNote, 
  onTogglePin,
  onToggleArchive,
  onEncryptNote,
  onDecryptNote,
  timeFilter = 'all',
  showArchived = false
}) => {
  console.log('🔍 NotesGrid render - Functions check:', {
    onTogglePin: typeof onTogglePin,
    onToggleArchive: typeof onToggleArchive,
    onDeleteNote: typeof onDeleteNote,
    onEncryptNote: typeof onEncryptNote,
    notesCount: notes.length
  });

  const [encryptionModal, setEncryptionModal] = useState({ 
    isOpen: false, 
    note: null, 
    mode: 'encrypt' 
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [newNoteIds, setNewNoteIds] = useState(new Set());
  const prevNotesLength = useRef(notes.length);

  // Track newly created notes for animations
  useEffect(() => {
    if (notes.length > prevNotesLength.current) {
      const newestNote = notes.find(note => {
        const noteTime = new Date(note.updatedAt).getTime();
        const oneSecondAgo = Date.now() - 1000;
        return noteTime > oneSecondAgo;
      });
      
      if (newestNote) {
        setNewNoteIds(prev => new Set([...prev, newestNote.id]));
        setTimeout(() => {
          setNewNoteIds(prev => {
            const updated = new Set(prev);
            updated.delete(newestNote.id);
            return updated;
          });
        }, 1000);
      }
    }
    prevNotesLength.current = notes.length;
  }, [notes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdown && !event.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeDropdown]);

  const handleDropdownToggle = (noteId, event) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveDropdown(activeDropdown === noteId ? null : noteId);
  };

  const handlePinClick = (noteId, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('🚀 Pin clicked for note:', noteId);
    
    if (onTogglePin) {
      onTogglePin(noteId);
      console.log('🚀 Pin function executed!');
    } else {
      console.error('🚀 onTogglePin is not available!');
    }
    setActiveDropdown(null);
  };

  const handleArchiveClick = (noteId, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('📁 Archive clicked for note:', noteId);
    
    if (onToggleArchive) {
      onToggleArchive(noteId);
      console.log('📁 Archive function executed!');
    } else {
      console.error('📁 onToggleArchive is not available!');
    }
    setActiveDropdown(null);
  };

  const handleDeleteClick = (noteId, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('🗑️ Delete clicked for note:', noteId);
    
    if (confirm('Are you sure you want to delete this note?')) {
      if (onDeleteNote) {
        onDeleteNote(noteId);
        console.log('🗑️ Delete function executed!');
      } else {
        console.error('🗑️ onDeleteNote is not available!');
      }
    }
    setActiveDropdown(null);
  };

  const handleEncryptClick = (note, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔒 Encrypt clicked for note:', note.id);
    
    setEncryptionModal({
      isOpen: true,
      note: note,
      mode: 'encrypt'
    });
    setActiveDropdown(null);
  };

  const handleDecryptClick = (note, event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('🔓 Decrypt clicked for note:', note.id);
    
    setEncryptionModal({
      isOpen: true,
      note: note,
      mode: 'decrypt'
    });
    setActiveDropdown(null);
  };

  const formatTime = (date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffInHours = (now - noteDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return noteDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: noteDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTimeDetailed = (date) => {
    const noteDate = new Date(date);
    return noteDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPreview = (note) => {
    if (note.isEncrypted) {
      return note.previewContent || 'This note is encrypted and requires a password to view.';
    }
    
    const textContent = note.content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 120 
      ? textContent.substring(0, 120) + '...' 
      : textContent || 'No content';
  };

  const handleNoteClick = (note) => {
    if (note.isEncrypted) {
      setEncryptionModal({
        isOpen: true,
        note: note,
        mode: 'decrypt'
      });
    } else {
      onSelectNote(note);
    }
  };

  const handleEncrypt = async (noteId, password) => {
    const success = await onEncryptNote(noteId, password);
    if (success) {
      setEncryptionModal({ isOpen: false, note: null, mode: 'encrypt' });
    }
    return success;
  };

  const handleDecrypt = async (noteId, password) => {
    const success = await onDecryptNote(noteId, password);
    if (success) {
      setEncryptionModal({ isOpen: false, note: null, mode: 'decrypt' });
    }
    return success;
  };

  const filterNotesByTime = (notes) => {
    if (timeFilter === 'all') return notes;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return notes.filter(note => {
      const noteDate = new Date(note.updatedAt);
      
      switch (timeFilter) {
        case 'today':
          return noteDate >= today;
        case 'thisWeek':
          return noteDate >= thisWeekStart;
        case 'thisMonth':
          return noteDate >= thisMonthStart;
        default:
          return true;
      }
    });
  };

  const filteredNotes = filterNotesByTime(notes);
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  if (sortedNotes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="text-center text-white max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-2xl flex items-center justify-center shadow-lg">
            <Clock size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No notes yet</h3>
          <p className="text-gray-400 font-medium">
            Create your first note to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 auto-rows-max">
        {sortedNotes.map((note, index) => {
          const isNewNote = newNoteIds.has(note.id);
          const cardColor = 'bg-gray-800 border-gray-700';
          
          return (
            <div
              key={note.id}
              className={`
                relative group cursor-pointer rounded-xl p-6 transition-all duration-300 
                hover:shadow-2xl hover:transform hover:scale-105 shadow-lg border
                ${note.isEncrypted ? 'bg-gray-800 border-gray-600' : cardColor}
                ${currentNote?.id === note.id ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}
                ${isNewNote ? 'animate-scaleIn animate-slideUp' : ''}
              `}
              onClick={() => handleNoteClick(note)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  {note.isEncrypted && (
                    <Lock className="text-gray-400 flex-shrink-0" size={16} />
                  )}
                  <h3 className="font-bold text-white truncate text-lg leading-tight">
                    {note.isEncrypted ? (note.previewTitle || 'Encrypted Note') : (note.title || 'Untitled Note')}
                  </h3>
                </div>
                
                <div className="dropdown-container flex items-center gap-1 ml-2 relative">
                  {note.isPinned && (
                    <Pin 
                      className="text-yellow-400 fill-yellow-400" 
                      size={16} 
                    />
                  )}
                  {note.isArchived && (
                    <Archive 
                      className="text-gray-400" 
                      size={14} 
                    />
                  )}
                  <button
                    onClick={(e) => handleDropdownToggle(note.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-700 transition-all rounded-lg"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === note.id && (
                    <div className="absolute top-10 right-0 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 min-w-40 py-2">
                      <button
                        onClick={(e) => handlePinClick(note.id, e)}
                        className="w-full px-4 py-2 text-left font-medium hover:bg-gray-700 flex items-center gap-2 text-white"
                      >
                        <Pin size={14} className={note.isPinned ? 'text-yellow-400 fill-yellow-400' : ''} />
                        {note.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      
                      {!note.isEncrypted ? (
                        <button
                          onClick={(e) => handleEncryptClick(note, e)}
                          className="w-full px-4 py-2 text-left font-medium hover:bg-gray-700 flex items-center gap-2 text-white"
                        >
                          <Shield size={14} />
                          Encrypt
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleDecryptClick(note, e)}
                          className="w-full px-4 py-2 text-left font-medium hover:bg-gray-700 flex items-center gap-2 text-white"
                        >
                          <Lock size={14} />
                          Decrypt
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => handleArchiveClick(note.id, e)}
                        className="w-full px-4 py-2 text-left font-medium hover:bg-gray-700 flex items-center gap-2 text-white"
                      >
                        {note.isArchived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                        {note.isArchived ? 'Unarchive' : 'Archive'}
                      </button>
                      
                      <hr className="border-gray-600 my-1" />
                      <button
                        onClick={(e) => handleDeleteClick(note.id, e)}
                        className="w-full px-4 py-2 text-left font-medium hover:bg-red-900 text-red-400 hover:text-red-300 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Preview */}
              <div className="mb-6">
                <p className={`font-medium leading-relaxed line-clamp-4 ${
                  note.isEncrypted ? 'text-gray-400 italic' : 'text-gray-300'
                }`}>
                  {getPreview(note)}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <Clock size={12} />
                  <span>{formatTime(note.updatedAt)}</span>
                </div>
                <span>
                  {formatTimeDetailed(note.updatedAt)}
                </span>
              </div>

              {/* Tags */}
              {note.aiTags && note.aiTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                  {note.aiTags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-block px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.aiTags.length > 2 && (
                    <span className="inline-block px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded-full font-medium">
                      +{note.aiTags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Pinned indicator overlay */}
              {note.isPinned && (
                <div className="absolute top-4 right-4 w-2 h-2 bg-yellow-400 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Encryption Modal */}
      <EncryptionModal
        isOpen={encryptionModal.isOpen}
        onClose={() => setEncryptionModal({ isOpen: false, note: null, mode: 'encrypt' })}
        onEncrypt={handleEncrypt}
        onDecrypt={handleDecrypt}
        note={encryptionModal.note}
        mode={encryptionModal.mode}
      />
    </div>
  );
};

export default NotesGrid;
