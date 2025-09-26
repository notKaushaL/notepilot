import React from 'react';
import { Pin, Trash2, Lock, Calendar } from 'lucide-react';

const NotesList = ({ notes, currentNote, onSelectNote, onDeleteNote, onTogglePin }) => {
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

  const sortedNotes = [...notes].sort((a, b) => {
    // Pinned notes first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by updated date
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  return (
    <div className="divide-y divide-gray-100">
      {sortedNotes.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <Calendar className="mx-auto mb-3 opacity-50" size={48} />
          <p>No notes yet</p>
          <p className="text-sm">Create your first note to get started</p>
        </div>
      ) : (
        sortedNotes.map((note) => (
          <div
            key={note.id}
            className={`note-card relative group ${
              currentNote?.id === note.id ? 'border-blue-300 bg-blue-50' : ''
            } ${note.isPinned ? 'pinned' : ''}`}
            onClick={() => onSelectNote(note)}
          >
            {/* Pin indicator */}
            {note.isPinned && (
              <Pin
                className="absolute top-2 right-2 text-yellow-600 fill-current"
                size={14}
              />
            )}

            {/* Lock indicator for encrypted notes */}
            {note.isEncrypted && (
              <Lock
                className="absolute top-2 right-8 text-red-600"
                size={12}
              />
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate mb-1">
                {note.title || 'Untitled Note'}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {getPreview(note.content)}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatDate(note.updatedAt)}</span>
                
                {/* Action buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePin(note.id);
                    }}
                    className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                      note.isPinned ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                    title={note.isPinned ? 'Unpin note' : 'Pin note'}
                  >
                    <Pin size={14} className={note.isPinned ? 'fill-current' : ''} />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to delete this note?')) {
                        onDeleteNote(note.id);
                      }
                    }}
                    className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Tags display */}
              {note.aiTags && note.aiTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {note.aiTags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {note.aiTags.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{note.aiTags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotesList;