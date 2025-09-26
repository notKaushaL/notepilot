import React, { useState } from 'react';
import { 
  Pin, 
  Archive, 
  Trash2, 
  Lock, 
  Unlock,
  MoreVertical,
  Clock,
  FileText,
  Tag
} from 'lucide-react';
import { formatDate } from '../utils/textUtils';

const NoteCard = ({ 
  note, 
  isActive, 
  onClick, 
  onDelete, 
  onTogglePin, 
  onToggleArchive, 
  onEncrypt, 
  onDecrypt,
  className = '' 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showDecryptForm, setShowDecryptForm] = useState(false);
  const [password, setPassword] = useState('');

  const handleDecrypt = (e) => {
    e.stopPropagation();
    if (password.trim()) {
      onDecrypt(note.id, password);
      setPassword('');
      setShowDecryptForm(false);
    }
  };

  const getPreviewContent = () => {
    if (note.isEncrypted) {
      return note.previewContent || 'This note is encrypted';
    }
    
    // Remove HTML tags and get first 100 characters
    const textContent = note.content?.replace(/<[^>]*>/g, '') || '';
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
  };

  const getWordCount = () => {
    if (note.isEncrypted) return 0;
    const textContent = note.content?.replace(/<[^>]*>/g, '') || '';
    return textContent.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div 
      className={`
        relative group cursor-pointer p-4 rounded-xl border transition-all duration-200 hover:shadow-lg
        ${isActive 
          ? 'bg-blue-600/20 border-blue-500 shadow-md' 
          : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
        }
        ${note.isPinned ? 'ring-2 ring-yellow-500/30' : ''}
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-lg leading-tight truncate
            ${note.isEncrypted ? 'text-gray-400 italic' : 'text-white'}
          `}>
            {note.isEncrypted ? (note.previewTitle || 'Encrypted Note') : note.title}
          </h3>
          
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
            <Clock size={12} />
            <span>{formatDate(note.updatedAt || note.createdAt)}</span>
            
            {!note.isEncrypted && (
              <>
                <FileText size={12} />
                <span>{getWordCount()} words</span>
              </>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-1 ml-2">
          {note.isPinned && (
            <Pin 
              size={16} 
              className="text-yellow-500 fill-current" 
              title="Pinned" 
            />
          )}
          {note.isArchived && (
            <Archive 
              size={16} 
              className="text-gray-500" 
              title="Archived" 
            />
          )}
          {note.isEncrypted && (
            <Lock 
              size={16} 
              className="text-red-400" 
              title="Encrypted" 
            />
          )}
        </div>
      </div>

      {/* Content Preview */}
      <p className={`
        text-sm leading-relaxed mb-3 line-clamp-3
        ${note.isEncrypted ? 'text-gray-500 italic' : 'text-gray-300'}
      `}>
        {getPreviewContent()}
      </p>

      {/* Tags */}
      {note.aiTags && note.aiTags.length > 0 && (
        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <Tag size={12} className="text-gray-500" />
          {note.aiTags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="inline-block px-2 py-1 text-xs bg-blue-600/30 text-blue-300 rounded-md"
            >
              {tag}
            </span>
          ))}
          {note.aiTags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{note.aiTags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Decrypt Form */}
      {showDecryptForm && note.isEncrypted && (
        <div 
          className="mb-3 p-3 bg-gray-700 rounded-lg border border-gray-600"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleDecrypt(e)}
              autoFocus
            />
            <button
              onClick={handleDecrypt}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              <Unlock size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Actions Menu */}
      <div className={`
        absolute top-2 right-2 transition-opacity duration-200
        ${showActions || isActive ? 'opacity-100' : 'opacity-0'}
      `}>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(note.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Pin size={14} />
                {note.isPinned ? 'Unpin' : 'Pin'}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchive(note.id);
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 transition-colors"
              >
                <Archive size={14} />
                {note.isArchived ? 'Unarchive' : 'Archive'}
              </button>

              {!note.isEncrypted ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEncrypt(note.id);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Lock size={14} />
                  Encrypt
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDecryptForm(true);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Unlock size={14} />
                  Decrypt
                </button>
              )}

              <div className="border-t border-gray-600 my-1"></div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this note?')) {
                    onDelete(note.id);
                  }
                  setShowActions(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-600/20 text-red-400 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;