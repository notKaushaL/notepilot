import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen } from 'lucide-react';
import Sidebar from './components/Sidebar';
import NotesGrid from './components/NotesGrid';
import TimeFilter from './components/TimeFilter';
import RichTextEditor from './components/RichTextEditor';
import AIPanel from './components/AIPanel';
import { useNotes } from './hooks/useNotes';
import { useAI } from './hooks/useAI';

function App() {
  const {
    notes,
    currentNote,
    setCurrentNote,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    toggleArchive,
    encryptNote,
    decryptNote,
    searchTerm,
    setSearchTerm,
    filteredNotes,
    showArchived,
    setShowArchived
  } = useNotes();

  const {
    aiFeatures,
    isLoading: aiLoading,
    processNoteWithAI,
    clearAIFeatures,
    isContentValid,
    getGlossaryTerms,
    translateNote,
    streamingText,
    isStreaming
  } = useAI();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'editor'

  // Clear AI features when switching notes
  useEffect(() => {
    if (currentNote) {
      clearAIFeatures();
    }
  }, [currentNote?.id, clearAIFeatures]);

  const handleNoteContentChange = (content) => {
    if (currentNote) {
      const updatedNote = { ...currentNote, content, updatedAt: new Date() };
      updateNote(updatedNote);
      setCurrentNote(updatedNote);
    }
  };

  const handleNoteTitleChange = (title) => {
    if (currentNote) {
      const updatedNote = { ...currentNote, title, updatedAt: new Date() };
      updateNote(updatedNote);
      setCurrentNote(updatedNote);
    }
  };

  const handleNoteSelect = (note) => {
    setCurrentNote(note);
    setViewMode('editor');
  };

  const handleBackToGrid = () => {
    setViewMode('grid');
    setCurrentNote(null);
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

  // Debug: Verify all functions are available
  console.log('🔍 App.jsx functions verification:', {
    deleteNote: typeof deleteNote,
    togglePin: typeof togglePin,
    toggleArchive: typeof toggleArchive,
    encryptNote: typeof encryptNote,
    decryptNote: typeof decryptNote
  });

  return (
    <div className="h-screen flex bg-gray-900 relative overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-70 z-30" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Professional fixed sidebar pattern */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 
        fixed lg:relative 
        z-40 lg:z-0 
        transition-transform duration-300 ease-in-out
        h-screen w-60 flex-shrink-0
        border-r border-gray-700
      `}>
        <Sidebar
          onCreateNote={createNote}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onClose={() => setSidebarOpen(false)}
          showArchived={showArchived}
          onToggleArchived={() => setShowArchived(!showArchived)}
        />
      </div>

      {/* Main Content Area - Professional content container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {viewMode === 'grid' ? (
          <>
            {/* Header - Professional layout with proper spacing */}
            <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700 px-3 sm:px-4 lg:px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="pl-12 lg:pl-0 min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-white truncate">
                    {showArchived ? 'Archived Notes' : 'My Notes'}
                  </h1>
                  <p className="text-gray-400 font-medium text-sm mt-1">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                    {showArchived && ' archived'}
                    {!showArchived && filteredNotes.some(note => note.isPinned) && (
                      <span className="ml-2 text-yellow-400">
                        • {filteredNotes.filter(note => note.isPinned).length} pinned
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <TimeFilter
                    selectedFilter={timeFilter}
                    onFilterChange={setTimeFilter}
                  />
                </div>
              </div>
            </div>

            {/* Notes Grid - Professional scrollable content area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <NotesGrid
                notes={filteredNotes}
                currentNote={currentNote}
                onSelectNote={handleNoteSelect}
                onDeleteNote={deleteNote}
                onTogglePin={togglePin}
                onToggleArchive={toggleArchive}
                onEncryptNote={encryptNote}
                onDecryptNote={decryptNote}
                timeFilter={timeFilter}
                showArchived={showArchived}
                onCreateFirstNote={createNote}
              />
            </div>
          </>
        ) : (
          /* Editor View */
          <div className="flex-1 flex h-full overflow-hidden">
            {/* Editor */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {currentNote ? (
                <>
                  {/* Note Header - Professional editor header */}
                  <div className="flex-shrink-0 bg-gray-800 p-4 lg:p-5 border-b border-gray-700">
                    <div className="flex items-center gap-4 mb-6">
                      <button
                        onClick={handleBackToGrid}
                        className="text-gray-300 hover:text-white flex items-center gap-2 font-semibold bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-xl transition-all duration-200 hover:shadow-md"
                      >
                        ← Back to Notes
                      </button>
                    </div>
                    <input
                      type="text"
                      value={currentNote.title}
                      onChange={(e) => handleNoteTitleChange(e.target.value)}
                      placeholder="Note title..."
                      className="text-xl lg:text-2xl font-bold text-white w-full outline-none bg-transparent border-b border-gray-600 focus:border-gray-400 pb-2 placeholder:text-gray-500 transition-colors"
                    />
                    <div className="text-sm text-gray-400 font-medium mt-3">
                      Last edited: {new Date(currentNote.updatedAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Rich Text Editor - Proper scrollable container */}
                  <div className="flex-1 bg-gray-800 overflow-y-auto overflow-x-hidden">
                    <RichTextEditor
                      content={currentNote.content}
                      onChange={handleNoteContentChange}
                      glossaryTerms={getGlossaryTerms()}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-800">
                  <div className="text-center text-white">
                    <BookOpen size={64} className="mx-auto mb-4 opacity-50" />
                    <h2 className="text-2xl font-bold mb-2">Welcome to NotePilot</h2>
                    <p className="font-medium text-gray-300">Create a new note or select an existing one to get started</p>
                  </div>
                </div>
              )}
            </div>

            {/* AI Panel - Enhanced with summary functionality */}
            {currentNote && (
              <div className="w-[368px] bg-gray-800 border-l border-gray-700 flex-shrink-0 overflow-y-auto overflow-x-hidden">
                <AIPanel
                  note={currentNote}
                  aiFeatures={aiFeatures}
                  isLoading={aiLoading}
                  translateNote={translateNote}
                  processNoteWithAI={processNoteWithAI}
                  isContentValid={isContentValid}
                  streamingText={streamingText}
                  isStreaming={isStreaming}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Sidebar Toggle Button - Professional positioning */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-gray-800 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-200 border border-gray-600"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>
    </div>
  );
}

export default App;