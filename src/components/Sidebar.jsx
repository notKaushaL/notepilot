import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Settings, 
  HelpCircle, 
  Archive
} from 'lucide-react';

const Sidebar = ({ 
  onCreateNote, 
  searchTerm, 
  onSearchChange, 
  onClose,
  showArchived,
  onToggleArchived
}) => {
  const [isCreating, setIsCreating] = useState(false);

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

      {/* Main content - empty space for future features */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Future features can be added here */}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium rounded-lg">
          <HelpCircle size={16} />
          Help
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors font-medium rounded-lg">
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
