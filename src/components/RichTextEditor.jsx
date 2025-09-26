import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Type, Undo, Redo, Palette, List, ListOrdered
} from 'lucide-react';
import GlossaryTooltip from './GlossaryTooltip';
import { useAI } from '../hooks/useAI';

const RichTextEditor = ({ content, onChange, glossaryTerms = [] }) => {
  const editorRef = useRef(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [formatStates, setFormatStates] = useState({});
  const { getWordCount } = useAI();

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content || '';
    }
  }, [content]);

  // Handle content changes with debouncing for better performance
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
      updateFormatStates();
    }
  }, [onChange]);

  // Handle paste events to clean up pasted content
  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  // Update format button states based on current selection
  const updateFormatStates = () => {
    const states = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      justifyLeft: document.queryCommandState('justifyLeft'),
      justifyCenter: document.queryCommandState('justifyCenter'),
      justifyRight: document.queryCommandState('justifyRight'),
    };
    setFormatStates(states);
  };

  // Format commands
  const executeCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    updateFormatStates();
    handleInput();
  };

  // Font size handler
  const handleFontSize = (size) => {
    executeCommand('fontSize', size);
  };

  // Color picker handler
  const handleColorChange = (color) => {
    executeCommand('foreColor', color);
  };

  // Handle selection change to update button states
  const handleSelectionChange = () => {
    if (isEditorFocused) {
      updateFormatStates();
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isEditorFocused]);

  // Highlight glossary terms
  const highlightGlossaryTerms = useCallback((text) => {
    if (!glossaryTerms.length || !text) return text;

    let highlightedText = text;
    glossaryTerms.forEach(term => {
      const regex = new RegExp(`\\b(${term.word})\\b`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="glossary-highlight" data-term="${term.word}" data-definition="${term.definition}">$1</span>`
      );
    });

    return highlightedText;
  }, [glossaryTerms]);

  // Toolbar component
  const Toolbar = () => (
    <div className="border-b border-gray-700 p-4 bg-gray-800 flex flex-wrap gap-3">
      {/* Text Formatting */}
      <div className="flex gap-2 border-r border-gray-600 pr-4">
        <button
          className={`toolbar-button ${formatStates.bold ? 'active' : ''}`}
          onClick={() => executeCommand('bold')}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.italic ? 'active' : ''}`}
          onClick={() => executeCommand('italic')}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.underline ? 'active' : ''}`}
          onClick={() => executeCommand('underline')}
          title="Underline"
        >
          <Underline size={16} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex gap-2 border-r border-gray-600 pr-4">
        <button
          className={`toolbar-button ${formatStates.justifyLeft ? 'active' : ''}`}
          onClick={() => executeCommand('justifyLeft')}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.justifyCenter ? 'active' : ''}`}
          onClick={() => executeCommand('justifyCenter')}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.justifyRight ? 'active' : ''}`}
          onClick={() => executeCommand('justifyRight')}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex gap-2 border-r border-gray-600 pr-4">
        <button
          className="toolbar-button"
          onClick={() => executeCommand('insertUnorderedList')}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={() => executeCommand('insertOrderedList')}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>

      {/* Font Size */}
      <div className="flex gap-2 border-r border-gray-600 pr-4">
        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="px-3 py-2 font-medium bg-gray-700 border border-gray-600 rounded-lg text-white"
          title="Font Size"
        >
          <option value="1">8pt</option>
          <option value="2">10pt</option>
          <option value="3" defaultValue>12pt</option>
          <option value="4">14pt</option>
          <option value="5">18pt</option>
          <option value="6">24pt</option>
          <option value="7">36pt</option>
        </select>
      </div>

      {/* Color Picker */}
      <div className="flex gap-2 border-r border-gray-600 pr-4">
        <input
          type="color"
          onChange={(e) => handleColorChange(e.target.value)}
          className="w-10 h-10 border border-gray-600 rounded-lg cursor-pointer"
          title="Text Color"
        />
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <button
          className="toolbar-button"
          onClick={() => executeCommand('undo')}
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          className="toolbar-button"
          onClick={() => executeCommand('redo')}
          title="Redo"
        >
          <Redo size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <Toolbar />
      <div className="flex-1 relative">
        <div
          ref={editorRef}
          className="note-editor h-full w-full"
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          suppressContentEditableWarning={true}
          style={{ minHeight: '400px' }}
          data-placeholder="Start writing your note..."
        />
        
        {/* Glossary Tooltips */}
        <GlossaryTooltip />
        
        {/* Word Count Display */}
        <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-90 px-3 py-1 rounded-lg border border-gray-600">
          <span className="text-sm text-gray-300">
            {getWordCount(content)} words
          </span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;