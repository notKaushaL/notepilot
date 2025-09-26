import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Settings, 
  HelpCircle, 
  Archive,
  Grid,
  List,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
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
  viewMode = 'editor',
  onViewModeChange,
  sortBy = 'modified',
  onSortChange,
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
    <div className="w-full h-full bg-gray-900 flex flex-col">
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 p-6 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <img 
            src="/NotePilot-Logo.png" 
            alt="NotePilot Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold text-white">NotePilot</h1>
        </div>

        {/* Create Note Button */}
        <button
          onClick={handleCreateNote}
          disabled={isCreating}
          className={`
            w-full flex items-center gap-3 px-4 py-3 bg-white text-gray-900 
            hover:bg-gray-100 transition-all duration-300 font-semibold rounded-lg
            transform hover:scale-105 hover:shadow-xl group relative overflow-hidden
            ${isCreating ? 'animate-pulseSuccess scale-95' : ''}
            active:scale-95 disabled:opacity-70
          `}
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent 
            ${isCreating ? 'animate-shimmer' : ''} -skew-x-12`} />
          <Plus size={18} className={`transition-transform duration-300 
            ${isCreating ? 'animate-spin' : 'group-hover:rotate-90'}`} />
          <span className="relative z-10">
            {isCreating ? 'Creating...' : 'Create Note'}
          </span>
        </button>

        {/* Search */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 font-medium text-white placeholder:text-gray-400"
          />
        </div>

        {/* Archives Toggle */}
        <button 
          onClick={onToggleArchived}
          className={`w-full flex items-center gap-3 px-3 py-3 transition-colors mt-4 font-medium rounded-lg ${
            showArchived 
              ? 'bg-gray-700 text-white' 
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <Archive size={16} />
          {showArchived ? 'Show Active Notes' : 'Show Archived Notes'}
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center gap-2 p-1 bg-gray-800 rounded-lg">
          <button
            onClick={() => onViewModeChange('editor')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
              viewMode === 'editor' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Edit3 size={14} />
            <span className="text-sm font-medium">Editor</span>
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Grid size={14} />
            <span className="text-sm font-medium">Grid</span>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            <List size={14} />
            <span className="text-sm font-medium">List</span>
          </button>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="px-6 py-3 border-b border-gray-700">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-white text-sm"
        >
          <option value="modified">Recently Modified</option>
          <option value="created">Recently Created</option>
          <option value="title">Alphabetical</option>
          <option value="pinned">Pinned First</option>
        </select>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
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
        <div className="p-4">
          {notes.length > 0 ? (
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
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                {showArchived ? 'No archived notes' : 'No notes yet'}
              </div>
              {!showArchived && (
                <button
                  onClick={handleCreateNote}
                  className="text-white hover:text-gray-300 text-sm underline"
                >
                  Create your first note
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <div className="flex gap-2">
          <button 
            onClick={() => onExport && onExport()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium rounded-lg text-sm"
          >
            <Download size={14} />
            Export
          </button>
          <button 
            onClick={() => onImport && onImport()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium rounded-lg text-sm"
          >
            <Upload size={14} />
            Import
          </button>
        </div>
        
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium rounded-lg"
        >
          <Settings size={16} />
          Settings
          <ChevronRight size={14} className={`ml-auto transition-transform ${showSettings ? 'rotate-90' : ''}`} />
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
        
        <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium rounded-lg">
          <HelpCircle size={16} />
          Help & Support
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
