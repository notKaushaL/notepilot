import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Undo, Redo, Palette
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



  // Handle content changes
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
      justifyFull: document.queryCommandState('justifyFull'),
    };
    setFormatStates(states);
  };

  // Format commands
  const executeCommand = (command, value = null) => {
    // Ensure editor is focused and has selection
    editorRef.current.focus();
    
    // If no selection, create one at cursor position
    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.isCollapsed) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    
    document.execCommand(command, false, value);
    handleInput();
    
    // Update format states immediately and after delay
    updateFormatStates();
    setTimeout(() => {
      updateFormatStates();
    }, 50);
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
    if (isEditorFocused && document.activeElement === editorRef.current) {
      setTimeout(() => {
        updateFormatStates();
      }, 10);
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [isEditorFocused]);

  // Apply grammar error highlighting to text


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
          onMouseDown={(e) => { e.preventDefault(); executeCommand('bold'); }}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.italic ? 'active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); executeCommand('italic'); }}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.underline ? 'active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); executeCommand('underline'); }}
          title="Underline"
        >
          <Underline size={16} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex gap-2 border-r border-gray-600 pr-4">
        <button
          className={`toolbar-button ${formatStates.justifyLeft ? 'active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyLeft'); }}
          title="Align Left"
        >
          <AlignLeft size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.justifyCenter ? 'active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyCenter'); }}
          title="Align Center"
        >
          <AlignCenter size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.justifyRight ? 'active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyRight'); }}
          title="Align Right"
        >
          <AlignRight size={16} />
        </button>
        <button
          className={`toolbar-button ${formatStates.justifyFull ? 'active' : ''}`}
          onMouseDown={(e) => { e.preventDefault(); executeCommand('justifyFull'); }}
          title="Justify"
        >
          <AlignJustify size={16} />
        </button>
      </div>

      {/* Font Size */}
      <div className="flex gap-2 border-r border-gray-600 pr-4">
        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="px-3 py-2 font-medium bg-gray-700 border border-gray-600 rounded-lg text-white min-w-[80px]"
          title="Font Size"
          style={{ fontFamily: 'monospace' }}
        >
          <option value="1" style={{ fontSize: '8px', fontFamily: 'inherit' }}>8pt</option>
          <option value="2" style={{ fontSize: '10px', fontFamily: 'inherit' }}>10pt</option>
          <option value="3" style={{ fontSize: '12px', fontFamily: 'inherit' }} defaultValue>12pt</option>
          <option value="4" style={{ fontSize: '14px', fontFamily: 'inherit' }}>14pt</option>
          <option value="5" style={{ fontSize: '18px', fontFamily: 'inherit' }}>18pt</option>
          <option value="6" style={{ fontSize: '24px', fontFamily: 'inherit' }}>24pt</option>
          <option value="7" style={{ fontSize: '36px', fontFamily: 'inherit' }}>36pt</option>
        </select>
      </div>

      {/* Color Picker */}
      <div className="flex gap-2 border-r border-gray-600 pr-4">
        <div className="relative">
          <input
            type="color"
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-10 h-10 border border-gray-600 rounded-lg cursor-pointer bg-transparent"
            title="Text Color"
            defaultValue="#ffffff"
          />
        </div>
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1 border-r border-gray-600 pr-4">
        <button
          className="toolbar-button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('undo'); }}
          title="Undo"
        >
          <Undo size={16} />
        </button>
        <button
          className="toolbar-button"
          onMouseDown={(e) => { e.preventDefault(); executeCommand('redo'); }}
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
      <div className="flex-1 relative overflow-hidden">
        <div
          ref={editorRef}
          className="note-editor h-full w-full overflow-y-auto"
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsEditorFocused(true)}
          onBlur={() => setIsEditorFocused(false)}
          onMouseUp={updateFormatStates}
          onKeyUp={updateFormatStates}
          suppressContentEditableWarning={true}
          style={{ minHeight: '400px', padding: '20px' }}
          data-placeholder="Start writing your note..."
        />
        
        {/* Glossary Tooltips */}
        <GlossaryTooltip />
        
        {/* Word Count Display */}
        <div className="absolute bottom-4 right-4 bg-gray-800 bg-opacity-90 px-3 py-1 rounded-lg border border-gray-600 z-10">
          <span className="text-sm text-gray-300">
            {getWordCount(content)} words
          </span>
        </div>
      </div>


    </div>
  );
};

export default RichTextEditor;