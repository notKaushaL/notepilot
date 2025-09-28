import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Settings, 
  HelpCircle, 
  Archive,
  ChevronRight,
  Trash2,
  Pin,
  Clock
} from 'lucide-react';

const Sidebar = ({ 
  onCreateNote, 
  searchTerm, 
  onSearchChange, 
  onClose,
  showArchived,
  onToggleArchived,
  notes = [],
  selectedNote,
  onSelectNote,
  onDeleteNote,
  onPinNote,
  onArchiveNote,
  pinnedNotes = [],
  onExport,
  onImport
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateNote = async () => {
    setIsCreating(true);
    
    // Add a brief delay for visual feedback
    setTimeout(() => {
      onCreateNote();
      setIsCreating(false);
      
      // Close sidebar on mobile after creating note
      if (window.innerWidth < 1024 && onClose) {
        onClose();
      }
    }, 200);
  };

  return (
    <div className="w-full h-full bg-gradient-sidebar flex flex-col relative overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
      
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-4 border-b border-gray-700/30 relative z-10">
        <div className="flex items-center gap-2 mb-8">
          <img 
            src="/NotePilot-Logo.png" 
            alt="NotePilot Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-2xl font-bold text-white tracking-tight">NotePilot</h1>
        </div>

        {/* Create Note Button */}
        <button
          onClick={handleCreateNote}
          disabled={isCreating}
          className={`
            w-full mx-auto flex items-center gap-2 px-4 py-3 bg-gradient-button text-gray-900 
            hover:bg-gradient-button transition-all duration-300 font-medium rounded-xl
            transform hover:translate-y-[-1px] hover:shadow-2xl group relative overflow-hidden
            border border-white/20 hover:border-white/40 shadow-lg text-sm
            ${isCreating ? 'animate-glow opacity-90' : ''}
            active:animate-button-press disabled:opacity-70
          `}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
            ${isCreating ? 'animate-shimmer' : 'group-hover:animate-shimmer'} -skew-x-12`} />
          <Plus size={16} className={`transition-transform duration-300 
            ${isCreating ? 'animate-spin' : 'group-hover:rotate-90'}`} />
          <span className="relative z-10">
            {isCreating ? 'Creating...' : 'Create Note'}
          </span>
        </button>

        {/* Search */}
        <div className="relative mt-6 w-full mx-auto group">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
            <Search className="text-gray-400 group-hover:text-gray-300 transition-colors duration-200" size={16} />
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-3 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/8 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/30 focus:bg-white/10 font-medium text-sm text-white placeholder:text-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-white/5"
          />
        </div>

        {/* Archives Toggle */}
        <button 
          onClick={onToggleArchived}
          className={`w-full mx-auto flex items-center gap-2 px-3 py-2.5 transition-all duration-200 mt-5 font-medium rounded-xl hover:bg-gray-700/50 text-sm whitespace-nowrap ${
            showArchived 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Archive size={16} />
          <span className="truncate">{showArchived ? 'Show Active Notes' : 'Show Archived Notes'}</span>
        </button>
      </div>





      {/* Notes List */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Pin size={14} className="text-yellow-400" />
              <span className="text-sm font-medium text-gray-300">Pinned</span>
            </div>
            <div className="space-y-2">
              {pinnedNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote?.id === note.id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Pin size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium text-white truncate">
                      {note.title || 'Untitled Note'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Notes */}
        {notes.length > 0 ? (
          <div className="p-4">
            <div className="space-y-2">
              {notes.map(note => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote?.id === note.id ? 'bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {note.isPinned && <Pin size={14} className="text-yellow-400 fill-yellow-400" />}
                      {note.isEncrypted && <Lock size={14} className="text-gray-400" />}
                      <span className="text-sm font-medium text-white truncate">
                        {note.title || 'Untitled Note'}
                      </span>
                    </div>
                    <Clock size={12} className="text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {note.content.replace(/<[^>]*>/g, '').substring(0, 50) || 'No content'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 h-full">
            {/* Empty state - no content */}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50 space-y-3 bg-gray-900/50">

        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="w-11/12 mx-auto flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-gray-700/50 text-sm"
        >
          <Settings size={18} />
          Settings
          <ChevronRight size={16} className={`ml-auto transition-transform ${showSettings ? 'rotate-90' : ''}`} />
        </button>
        
        {showSettings && (
          <div className="ml-4 space-y-2 border-l border-gray-700 pl-4">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm rounded-lg">
              <Clock size={14} />
              Auto-save: On
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm rounded-lg">
              <Trash2 size={14} />
              Clear Trash
            </button>
          </div>
        )}
        
        <button className="w-11/12 mx-auto flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 font-medium rounded-xl border border-transparent hover:border-gray-700/50 text-sm">
          <HelpCircle size={18} />
          Help & Support
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
