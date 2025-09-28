/**
 * AIPanel_Enhanced - Enhanced AI Panel with integrated summary functionality
 * Combines existing AI features with new summary system
 */

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Sparkles, 
  Tags, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Languages,
  Copy,
  Check,
  FileText,
  Pen,
  RotateCcw,
  Settings,
  TrendingUp,
  Zap,
  BookOpen
} from 'lucide-react';
import { useAI } from '../hooks/useAI';
import { useSummary } from '../hooks/useSummary';
import NoteSummary from './NoteSummary';

const AIPanel_Enhanced = ({ 
  note, 
  aiFeatures, 
  isLoading, 
  translateNote, 
  processNoteWithAI, 
  isContentValid, 
  streamingText, 
  isStreaming 
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [showSummary, setShowSummary] = useState(false);
  const [translationLang, setTranslationLang] = useState('es');
  const [copiedItems, setCopiedItems] = useState({});
  const [showApiStatus, setShowApiStatus] = useState(false);
  // Track which languages have been explicitly requested for translation
  const [requestedTranslations, setRequestedTranslations] = useState(new Set());

  // Handle language change without triggering translation
  const handleLanguageChange = (newLang) => {
    console.log('🌐 Language changed from', translationLang, 'to', newLang);
    setTranslationLang(newLang);
    // CRITICAL: Clear requested translations when language changes to prevent auto-display
    setRequestedTranslations(prev => {
      const newSet = new Set(prev);
      newSet.delete(newLang); // Remove the new language from requested to force button click
      console.log('� Cleared requested translation for', newLang, '- user must click translate button');
      return newSet;
    });
  };

  // Handle translation request
  const handleTranslateRequest = async () => {
    console.log('🔄 Translation explicitly requested for:', translationLang);
    // Clear and then mark this specific language as requested
    setRequestedTranslations(prev => {
      const newSet = new Set(prev);
      newSet.add(translationLang);
      console.log('✅ Added', translationLang, 'to requested translations:', Array.from(newSet));
      return newSet;
    });
    // Perform the actual translation
    if (translateNote && note?.content) {
      await translateNote(note.content, translationLang);
    }
  };
  
  const { getWordCount } = useAI();
  // AI hook functionality for summary generation
  const {
    generateSummary,
    getSummary,
    isSummaryLoading,
    getSummaryError,
    refreshSummary,
    summaries
  } = useSummary();

  // Get current summary state for the note (without auto-generation)
  const currentSummary = note && summaries ? summaries.get(note.id) : null;
  const summaryLoading = note ? isSummaryLoading(note.id) : false;
  const summaryError = note ? getSummaryError(note.id) : null;

  // Debug logging
  React.useEffect(() => {
    if (note) {
      console.log('📊 Summary State:', {
        noteId: note.id,
        hasSummary: !!currentSummary,
        isLoading: summaryLoading,
        hasError: !!summaryError,
        summariesSize: summaries?.size || 0
      });
    }
  }, [note?.id, currentSummary, summaryLoading, summaryError, summaries]);

  // Clear requested translations when note changes
  React.useEffect(() => {
    if (note?.id) {
      console.log('📝 Note changed, clearing requested translations for fresh start');
      setRequestedTranslations(new Set());
    }
  }, [note?.id]);

  // Clear requested translations when language changes (backup safety)
  React.useEffect(() => {
    console.log('🔄 Language effect: clearing requested for', translationLang, 'to prevent auto-display');
    // Don't clear all, just make sure current language is not in requested set
    setRequestedTranslations(prev => {
      const newSet = new Set(prev);
      newSet.delete(translationLang);
      return newSet;
    });
  }, [translationLang]);

  // Removed auto-generation - now using manual generation

  const copyToClipboard = async (text, itemKey) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => ({ ...prev, [itemKey]: true }));
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [itemKey]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Removed unused summary handlers - using manual generation now

  const languages = [
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'zh', name: 'Chinese (Simplified)' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'ar', name: 'Arabic' },
    { code: 'ru', name: 'Russian' },
    { code: 'nl', name: 'Dutch' }
  ];

  const tabs = [
    { id: 'summary', label: 'Summary', icon: Brain },
    { id: 'tags', label: 'Tags', icon: Tags },
    { id: 'translate', label: 'Translate', icon: Languages }
  ];

  const renderApiStatusModal = () => {
    if (!showApiStatus) return null;
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" 
           onClick={() => setShowApiStatus(false)}>
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md w-full mx-4" 
             onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">AI Status</h3>
            <button 
              onClick={() => setShowApiStatus(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="p-3 bg-green-500/20 rounded-lg w-fit mx-auto mb-3">
                <Brain className="text-green-400" size={24} />
              </div>
              <h4 className="font-medium text-white text-base mb-2">AI System Active</h4>
              <p className="text-gray-400 text-sm">
                Multi-provider AI system is running with fallback support
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (isLoading && activeTab === 'summary') {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-xl">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div className="mt-5 text-center">
            <h4 className="font-bold text-white text-lg mb-1 tracking-tight">AI is Processing</h4>
            <p className="text-gray-400 font-medium text-sm leading-relaxed">Analyzing your content with advanced algorithms...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'summary':
        return (
          <div className="h-full flex flex-col space-y-4">
            {/* Header with controls */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-600/40 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg shadow-lg">
                  <Brain className="text-black" size={16} />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">AI Summary</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApiStatus(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="API Status"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Generate Summary Button - Smaller Size */}
              {note?.content && (!currentSummary || summaryError) && !summaryLoading && (
                <button
                  onClick={async () => {
                    try {
                      console.log('🔥 Generate Summary clicked for note:', note.id);
                      await generateSummary(note.id, note.content);
                      console.log('✅ Summary generated successfully');
                    } catch (error) {
                      console.error('❌ Failed to generate summary:', error);
                    }
                  }}
                  disabled={summaryLoading}
                  className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-800 disabled:text-gray-500 text-sm font-medium rounded-lg transition-all duration-200 ease-out flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 disabled:border-gray-200 shadow-sm hover:shadow-md disabled:shadow-none"
                >
                  <FileText size={14} />
                  Generate Summary
                </button>
              )}
              
              {/* Debug info disabled */}

              {/* Loading State */}
              {summaryLoading && (
                <div className="flex items-center justify-center py-6">
                  <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-blue-400" size={20} />
                    <span className="text-white font-medium">Generating summary...</span>
                  </div>
                </div>
              )}
              
              {/* Summary Display */}
              {(currentSummary || summaryError) && !summaryLoading && (
                <div className="mt-4 space-y-3">
                  <NoteSummary
                    noteId={note?.id}
                    summary={currentSummary}
                    isLoading={summaryLoading}
                    error={summaryError}
                    onRefresh={() => refreshSummary(note.id, note.content)}
                    onGenerate={() => generateSummary(note.id, note.content, true)}
                    compact={false}
                    showControls={false}
                  />
                  
                  {/* Small Regenerate Button Below Summary */}
                  {currentSummary && !summaryLoading && (
                    <div className="flex justify-center">
                      <button
                        onClick={async () => {
                          try {
                            console.log('🔄 Regenerate Summary clicked for note:', note.id);
                            console.log('📝 Re-reading current content, length:', note.content?.length || 0);
                            
                            // Use refreshSummary which properly clears cache and regenerates
                            await refreshSummary(note.id, note.content);
                            console.log('✅ Summary regenerated successfully with fresh content');
                          } catch (error) {
                            console.error('❌ Failed to regenerate summary:', error);
                          }
                        }}
                        disabled={summaryLoading}
                        className="px-4 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-700 disabled:text-gray-500 text-sm font-medium rounded-lg transition-all duration-200 ease-out flex items-center gap-2 border border-gray-200 hover:border-gray-300 disabled:border-gray-200 shadow-sm hover:shadow-md disabled:shadow-none"
                      >
                        {summaryLoading ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <RotateCcw size={14} />
                        )}
                        {summaryLoading ? 'Regenerating...' : 'Regenerate'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* No Content State */}
              {(!note?.content || !isContentValid || !isContentValid(note.content)) && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-800/50 rounded-xl w-fit mx-auto mb-4">
                      <FileText className="text-gray-400" size={32} />
                    </div>
                    <h4 className="font-medium text-white text-lg mb-2">Ready for AI Summary</h4>
                    <p className="text-gray-400 text-sm max-w-xs mx-auto">
                      Write some content in your note to generate an intelligent AI summary
                    </p>
                  </div>
                </div>
              )}

              {/* Glossary Terms Section */}
              {aiFeatures?.glossaryTerms && aiFeatures.glossaryTerms.length > 0 && (
                <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/30 p-4 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                      <BookOpen size={14} className="text-blue-400" />
                    </div>
                    <h4 className="text-sm font-bold text-blue-300">Key Terms</h4>
                  </div>
                  <div className="space-y-2">
                    {aiFeatures.glossaryTerms.slice(0, 3).map((term, index) => (
                      <div key={index} className="group cursor-pointer">
                        <div className="text-xs font-semibold text-blue-200 glossary-highlight" 
                             data-term={term.word} 
                             data-definition={term.definition}>
                          {term.word}
                        </div>
                        <div className="text-xs text-gray-400 leading-relaxed truncate">
                          {term.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'tags':
        return (
            <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-600/40">
              <div className="p-2 bg-white rounded-lg shadow-lg">
                <Tags className="text-black" size={16} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Tags</h3>
            </div>            <div className="space-y-4">
              {/* Generate Tags Button */}
              {note?.content && isContentValid && isContentValid(note.content) && (
                <button
                  onClick={() => processNoteWithAI && processNoteWithAI(note.content, 'tags')}
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-800 disabled:text-gray-500 text-sm font-medium rounded-lg transition-all duration-200 ease-out flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 disabled:border-gray-200 shadow-sm hover:shadow-md disabled:shadow-none"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Generating Tags...
                    </>
                  ) : (
                    <>
                      <Tags size={14} />
                      Generate Tags
                    </>
                  )}
                </button>
              )}

              {/* Tags Result */}
              {aiFeatures?.tags && aiFeatures.tags.length > 0 ? (
                <>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg border border-gray-600/50 shadow-lg backdrop-blur-sm p-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <div className="flex flex-wrap gap-1.5">
                      {aiFeatures.tags.map((tag, index) => (
                        <button
                          key={index}
                          className={`group inline-flex items-center px-2.5 py-1.5 cursor-pointer transition-all duration-300 font-medium rounded-md shadow-md backdrop-blur-sm ${
                            copiedItems[`tag-${index}`] 
                              ? 'bg-yellow-500 text-white border border-yellow-400/50 shadow-yellow-500/30 shadow-lg' 
                              : 'bg-white/15 text-gray-100 hover:bg-white/25 hover:text-gray-200 border border-gray-500/50 hover:border-gray-400/70 hover:shadow-md'
                          }`}
                          onClick={() => copyToClipboard(tag, `tag-${index}`)}
                          title="Click to copy"
                        >
                          <span className="text-xs font-semibold">#{tag}</span>
                          {copiedItems[`tag-${index}`] ? (
                            <Check size={12} className="ml-1.5 text-white" />
                          ) : (
                            <Copy size={12} className="ml-1.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-md p-2 border border-gray-600/30">
                    <p className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                      Click on any tag to copy it to your clipboard
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="p-3 bg-gray-800/50 rounded-lg w-fit mx-auto mb-3">
                    <Tags className="text-gray-400" size={24} />
                  </div>
                  <h4 className="font-medium text-white text-base mb-2">AI Tags</h4>
                  <p className="text-gray-400 text-xs max-w-xs mx-auto mb-3">
                    {note?.content && isContentValid && isContentValid(note.content)
                      ? 'Generate intelligent tags for your content'
                      : 'Write content to enable tag generation'}
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center opacity-60">
                    <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">#tech</span>
                    <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">#notes</span>
                    <span className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">#ideas</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'translate':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-600/40">
              <div className="p-2 bg-white rounded-lg shadow-lg">
                <Languages className="text-black" size={16} />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">Translation</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    Select Language:
                  </label>
                  <select
                    value={translationLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/10 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 shadow-sm backdrop-blur-sm font-medium text-sm transition-all duration-200 hover:bg-white/15"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code} className="bg-gray-800 text-white">
                        🌐 {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {note?.content && (
                  <button
                    onClick={handleTranslateRequest}
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-800 disabled:text-gray-500 text-sm font-medium rounded-lg transition-all duration-200 ease-out flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 disabled:border-gray-200 shadow-sm hover:shadow-md disabled:shadow-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages size={14} />
                        Translate to {languages.find(l => l.code === translationLang)?.name}
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {(() => {
                const hasTranslation = aiFeatures?.translation && aiFeatures.translation[translationLang];
                const isRequested = requestedTranslations.has(translationLang);
                console.log('🔍 Translation display check:', {
                  language: translationLang,
                  hasTranslation: !!hasTranslation,
                  isRequested,
                  shouldShow: hasTranslation && isRequested
                });
                return hasTranslation && isRequested;
              })() ? (
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-600/50 shadow-lg backdrop-blur-sm overflow-hidden flex flex-col">
                    {/* Translation Info Header */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-600/30 bg-gray-700/50">
                      <div className="flex items-center gap-2">
                        <Languages size={16} className="text-blue-400" />
                        <span className="text-sm font-semibold text-blue-400">
                          {typeof aiFeatures.translation[translationLang] === 'object' 
                            ? `${aiFeatures.translation[translationLang].sourceLanguage || 'auto'} → ${translationLang}`
                            : `auto → ${translationLang}`
                          }
                        </span>
                        {typeof aiFeatures.translation[translationLang] === 'object' && aiFeatures.translation[translationLang].provider && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium">
                            {aiFeatures.translation[translationLang].provider}
                          </span>
                        )}
                      </div>
                      
                      {/* Copy Button */}
                      <button
                        onClick={() => copyToClipboard(
                          typeof aiFeatures.translation[translationLang] === 'object' 
                            ? aiFeatures.translation[translationLang].text 
                            : aiFeatures.translation[translationLang], 
                          'translation'
                        )}
                        className={`p-1.5 rounded-md transition-all duration-200 ${
                          copiedItems.translation 
                            ? 'bg-yellow-500 shadow-md shadow-yellow-500/30 shadow-lg' 
                            : 'bg-white/90 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-sm border border-gray-300/40 hover:border-gray-400/60'
                        }`}
                        title="Copy translation"
                      >
                        {copiedItems.translation ? (
                          <Check size={12} className="text-white" />
                        ) : (
                          <Copy size={12} className="text-gray-700" />
                        )}
                      </button>
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 p-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      <div className="text-sm text-gray-100 text-professional leading-relaxed">
                        {typeof aiFeatures.translation[translationLang] === 'object' 
                          ? aiFeatures.translation[translationLang].text 
                          : aiFeatures.translation[translationLang]
                        }
                      </div>
                    </div>
                    
                    {/* Translation Details Footer */}
                    <div className="flex items-center justify-between p-2 bg-gray-700/30 border-t border-gray-600/20">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                          {getWordCount(
                            typeof aiFeatures.translation[translationLang] === 'object' 
                              ? aiFeatures.translation[translationLang].text 
                              : aiFeatures.translation[translationLang]
                          )} words
                        </span>
                        {typeof aiFeatures.translation[translationLang] === 'object' && aiFeatures.translation[translationLang].confidence && (
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                            {Math.round(aiFeatures.translation[translationLang].confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      {typeof aiFeatures.translation[translationLang] === 'object' && aiFeatures.translation[translationLang].timestamp && (
                        <span className="text-xs text-gray-500">
                          {new Date(aiFeatures.translation[translationLang].timestamp).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="relative p-4 bg-gradient-to-br from-blue-800/30 to-purple-700/30 rounded-xl w-fit mx-auto mb-4 shadow-lg border border-blue-500/30">
                    <Languages className="text-blue-400" size={28} />
                    <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-blue-500 text-xs font-bold text-white rounded-full">12+</div>
                  </div>
                  <h4 className="font-semibold text-blue-300 text-base mb-2 tracking-tight">Multi-Language AI Translator</h4>
                  <p className="font-medium text-gray-400 text-sm max-w-xs mx-auto mb-3">
                    Professional-grade translation powered by advanced AI models
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center opacity-60">
                    <span className="text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-300 rounded">🇪🇸 ES</span>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-300 rounded">🇫🇷 FR</span>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-300 rounded">🇩🇪 DE</span>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-300 rounded">🇯🇵 JP</span>
                    <span className="text-xs px-1.5 py-0.5 bg-blue-600/20 text-blue-300 rounded">+8</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Handle case when no note is provided
  if (!note) {
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-16">
            <div className="p-6 bg-gray-800/50 rounded-xl w-fit mx-auto mb-6">
              <Brain className="text-gray-400" size={48} />
            </div>
            <h3 className="font-bold text-white text-xl mb-3">AI Assistant Ready</h3>
            <p className="text-gray-400 text-base max-w-sm mx-auto">
              Select a note to access AI-powered features like summaries, tags, and translations
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-750">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-lg">
            <Sparkles size={20} className="text-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-tight">AI Assistant</h2>
            <p className="text-gray-300 text-sm font-medium mt-1 leading-relaxed">
              Enhanced with multi-provider AI summary
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700/50 bg-gray-800/80 px-4">
        <div className="grid grid-cols-3 gap-2 py-3">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center justify-center gap-1 py-2.5 px-3 font-semibold text-sm rounded-lg transition-all duration-300 ease-out ${
                  activeTab === tab.id
                    ? 'text-black bg-white shadow-xl shadow-white/20'
                    : 'text-gray-300 bg-gray-700/60 hover:bg-gray-600/80 hover:text-white hover:shadow-lg border border-gray-600/50 hover:border-gray-500/70'
                }`}
              >
                <Icon size={18} className="flex-shrink-0 transition-all duration-200 group-hover:opacity-80" />
                <span className="whitespace-nowrap text-base font-bold tracking-wide">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-lg animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4 py-3">
        <div className="h-full">
          {renderTabContent()}
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="px-4 py-2 border-t border-gray-700/50 bg-gray-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${
              isLoading || summaryLoading ? 'bg-yellow-400 shadow-yellow-400/30' : 'bg-green-400 shadow-green-400/30'
            }`}></div>
            <p className="text-xs text-gray-400 font-medium">
              {isLoading || summaryLoading ? 'AI Processing...' : 'AI Ready'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Brain size={10} />
              {currentSummary ? '✓ Summary' : '- Summary'}
            </span>
            <span className="flex items-center gap-1">
              <Tags size={10} />
              {aiFeatures?.tags ? `✓ ${aiFeatures.tags.length} Tags` : '- Tags'}
            </span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default AIPanel_Enhanced;
