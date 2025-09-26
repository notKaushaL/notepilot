import React, { useState, useEffect } from 'react';
import { Pin, Trash2, Lock, Calendar, MoreVertical, Archive, Shield, Clock } from 'lucide-react';

const NotesList = ({ 
  notes, 
  currentNote, 
  onSelectNote, 
  onDeleteNote, 
  onTogglePin,
  onArchiveNote,
  searchTerm = ''
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

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
  const formatDate = (date) => {
    const now = new Date();
    const noteDate = new Date(date);
    const diffInHours = (now - noteDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return noteDate.toLocaleDateString();
    }
  };

  const getPreview = (content) => {
    // Remove HTML tags and get first 100 characters
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 100 
      ? textContent.substring(0, 100) + '...' 
      : textContent || 'No content';
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Pinned notes first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by updated date
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-900">
      {sortedNotes.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="text-gray-500" size={24} />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              {searchTerm ? 'No matching notes' : 'No notes yet'}
            </h3>
            <p className="text-gray-500 text-sm">
              {searchTerm 
                ? `No notes found matching "${searchTerm}"`
                : 'Create your first note to get started'
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-700">
          {sortedNotes.map((note) => (
            <div
              key={note.id}
              className={`
                p-4 cursor-pointer transition-colors border-l-4 relative group
                ${currentNote?.id === note.id 
                  ? 'bg-gray-800 border-l-white' 
                  : 'bg-gray-900 border-l-transparent hover:bg-gray-800 hover:border-l-gray-600'
                }
              `}
              onClick={() => onSelectNote(note)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2 mb-2">
                    {note.isPinned && (
                      <Pin className="text-yellow-400 fill-yellow-400" size={14} />
                    )}
                    {note.isEncrypted && (
                      <Lock className="text-gray-400" size={14} />
                    )}
                    <h3 className="font-semibold text-white truncate">
                      {note.title || 'Untitled Note'}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                    {getPreview(note.content)}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>

                  {/* Tags */}
                  {note.aiTags && note.aiTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.aiTags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.aiTags.length > 2 && (
                        <span className="inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded-full">
                          +{note.aiTags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions Menu */}
                <div className="dropdown-container relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === note.id ? null : note.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-700 transition-all rounded-lg"
                  >
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>

                  {activeDropdown === note.id && (
                    <div className="absolute top-10 right-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-36 py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePin(note.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-white"
                      >
                        <Pin size={14} className={note.isPinned ? 'text-yellow-400 fill-yellow-400' : ''} />
                        {note.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onArchiveNote(note.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 text-white"
                      >
                        <Archive size={14} />
                        Archive
                      </button>
                      
                      <hr className="border-gray-600 my-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this note?')) {
                            onDeleteNote(note.id);
                          }
                          setActiveDropdown(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-red-900 text-red-400 hover:text-red-300 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        }
        </div>
      )}
    </div>
  );
};

export default NotesList;