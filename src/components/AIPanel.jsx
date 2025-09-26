import React, { useState } from 'react';
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
  BookOpen
} from 'lucide-react';

const AIPanel = ({ note, aiFeatures, isLoading, translateNote, processNoteWithAI, isContentValid, streamingText, isStreaming }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [translationLang, setTranslationLang] = useState('es');
  const [copiedItems, setCopiedItems] = useState({});

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
    { id: 'grammar', label: 'Grammar', icon: CheckCircle },
    { id: 'translate', label: 'Translate', icon: Languages }
  ];

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl">
              <Loader2 className="animate-spin text-white" size={40} />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div className="mt-5 text-center">
            <h4 className="font-bold text-white text-xl mb-2 tracking-tight">AI is Processing</h4>
            <p className="text-gray-400 font-medium text-base leading-relaxed">Analyzing your content with advanced algorithms...</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'summary':
        return (
          <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-600/40 flex-shrink-0">
              <div className="p-2.5 bg-white rounded-lg shadow-lg">
                <Brain className="text-black" size={20} />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">AI Summary</h3>
            </div>
            
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Summarize Button */}
              {note?.content && isContentValid && isContentValid(note.content) && (
                <button
                  onClick={() => processNoteWithAI && processNoteWithAI(note.content, 'summary')}
                  disabled={isLoading || isStreaming}
                  className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {isLoading || isStreaming ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      {isStreaming ? 'AI Writing Summary...' : 'Generating Summary...'}
                    </>
                  ) : (
                    <>
                      <Brain size={18} />
                      Generate AI Summary
                    </>
                  )}
                </button>
              )}

              {/* Summary Result */}
              {(aiFeatures?.summary || isStreaming) ? (
                <>
                  <div className="relative flex-1">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl border border-gray-600/50 shadow-xl backdrop-blur-sm h-full flex flex-col">
                      {/* Copy Button - Small, Right Corner - Only show when not streaming */}
                      {!isStreaming && aiFeatures?.summary && (
                        <button
                          onClick={() => copyToClipboard(aiFeatures.summary, 'summary')}
                          className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 z-30 ${
                            copiedItems.summary 
                              ? 'bg-yellow-500 shadow-md shadow-yellow-500/30 scale-105' 
                              : 'bg-white/90 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-sm border border-gray-300/40 hover:scale-105'
                          }`}
                          title="Copy summary"
                        >
                          {copiedItems.summary ? (
                            <Check size={12} className="text-white" />
                          ) : (
                            <Copy size={12} className="text-gray-700" />
                          )}
                        </button>
                      )}
                      
                      {/* Streaming Animation Indicator */}
                      {isStreaming && (
                        <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600/90 to-purple-600/90 rounded-lg backdrop-blur-sm border border-white/30 shadow-lg">
                          <div className="ai-writing-dots flex space-x-1">
                            <div className="dot w-1.5 h-1.5 bg-white rounded-full"></div>
                            <div className="dot w-1.5 h-1.5 bg-white rounded-full"></div>
                            <div className="dot w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                          <span className="text-xs font-semibold text-white">AI Writing...</span>
                        </div>
                      )}
                      
                      {/* Text Content - Real-time Streaming or Final Result */}
                      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-700/50 p-5 pr-10">
                        <div className="text-base text-gray-100 text-summary-premium">
                          {isStreaming ? (
                            <div className="relative ai-streaming-text">
                              <span className="inline-block">{streamingText}</span>
                              {/* Professional typing cursor animation */}
                              <span className="ai-cursor inline-block w-0.5 h-5 bg-gradient-to-t from-blue-400 to-purple-400 ml-1 rounded-full"></span>
                            </div>
                          ) : (
                            aiFeatures.summary
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
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
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <div className="relative p-5 bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl w-fit mx-auto mb-5 shadow-xl">
                    <Brain className="text-gray-400" size={38} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <h4 className="font-bold text-white text-xl mb-2 tracking-tight">
                    {note?.content && isContentValid && isContentValid(note.content) 
                      ? 'Ready to Summarize' 
                      : 'AI Summary Generator'}
                  </h4>
                  <p className="font-medium text-gray-400 max-w-sm mx-auto text-base leading-6 text-center">
                    {note?.content && isContentValid && isContentValid(note.content)
                      ? 'Click the button above to generate an intelligent AI summary'
                      : 'Write at least 10 characters to enable AI summarization'}
                  </p>
                  <div className="mt-4 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                    <p className="text-xs text-blue-300 font-medium">🤖 Powered by Advanced AI</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-600/40">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <Tags className="text-black" size={22} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Smart Tags</h3>
            </div>
            
            <div className="space-y-5">
              {/* Generate Tags Button */}
              {note?.content && isContentValid && isContentValid(note.content) && (
                <button
                  onClick={() => processNoteWithAI && processNoteWithAI(note.content, 'tags')}
                  disabled={isLoading}
                  className="w-full p-4 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Generating Tags...
                    </>
                  ) : (
                    <>
                      <Tags size={18} />
                      Generate Smart Tags
                    </>
                  )}
                </button>
              )}

              {/* Tags Result */}
              {aiFeatures?.tags && aiFeatures.tags.length > 0 ? (
                <>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl border border-gray-600/50 shadow-xl backdrop-blur-sm p-6 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <div className="flex flex-wrap gap-3">
                      {aiFeatures.tags.map((tag, index) => (
                        <button
                          key={index}
                          className={`group inline-flex items-center px-4 py-3 cursor-pointer transition-all duration-300 font-semibold rounded-lg shadow-lg backdrop-blur-sm ${
                            copiedItems[`tag-${index}`] 
                              ? 'bg-yellow-500 text-white border border-yellow-400/50 shadow-yellow-500/30 scale-105' 
                              : 'bg-white/15 text-gray-100 hover:bg-white hover:text-black border border-gray-500/50 hover:border-white hover:shadow-xl hover:scale-105'
                          }`}
                          onClick={() => copyToClipboard(tag, `tag-${index}`)}
                          title="Click to copy"
                        >
                          <span className="text-lg font-bold">#{tag}</span>
                          {copiedItems[`tag-${index}`] ? (
                            <Check size={18} className="ml-3 text-white" />
                          ) : (
                            <Copy size={18} className="ml-3 opacity-70 group-hover:opacity-100 transition-opacity" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-gray-600/30">
                    <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      Click on any tag to copy it to your clipboard
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="relative p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl w-fit mx-auto mb-6 shadow-xl">
                    <Tags className="text-gray-400" size={40} />
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-green-500 text-xs font-bold text-white rounded-full animate-bounce">AI</div>
                  </div>
                  <h4 className="font-bold text-white text-2xl mb-3 tracking-tight">Smart Tagging System</h4>
                  <p className="font-medium text-gray-400 max-w-sm mx-auto text-lg leading-relaxed mb-4">
                    {note?.content && isContentValid && isContentValid(note.content)
                      ? 'Click the button above to generate intelligent tags for your content'
                      : 'Write content to enable AI-powered tag generation'}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center opacity-50">
                    <span className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm">#technology</span>
                    <span className="px-3 py-1 bg-green-600/30 text-green-300 rounded-full text-sm">#project</span>
                    <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm">#ideas</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'grammar':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-600/40">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <CheckCircle className="text-black" size={22} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Grammar Check</h3>
            </div>
            
            <div className="space-y-5">
              {/* Check Grammar Button */}
              {note?.content && isContentValid && isContentValid(note.content) && (
                <button
                  onClick={() => processNoteWithAI && processNoteWithAI(note.content, 'grammar')}
                  disabled={isLoading}
                  className="w-full p-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Checking Grammar...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Check Grammar & Style
                    </>
                  )}
                </button>
              )}

              {/* Grammar Result */}
              {aiFeatures?.grammarIssues !== null ? (
                aiFeatures.grammarIssues.length > 0 ? (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl border border-gray-600/50 shadow-xl backdrop-blur-sm p-6 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <div className="space-y-4">
                      {aiFeatures.grammarIssues.map((issue, index) => (
                        <div key={index} className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-xl p-5 backdrop-blur-sm">
                          <div className="flex items-start gap-4">
                            <div className="p-2 bg-orange-500/20 rounded-lg flex-shrink-0">
                              <AlertCircle className="text-orange-400" size={18} />
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-orange-500/30 text-orange-200 text-xs font-semibold rounded-full uppercase tracking-wide">
                                  {issue.type}
                                </span>
                              </div>
                              <p className="text-gray-200 font-medium leading-relaxed text-professional">{issue.message}</p>
                              {issue.suggestion && (
                                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
                                  <p className="text-gray-300 font-medium text-professional">
                                    <span className="text-green-400 font-semibold">💡 Suggestion:</span> {issue.suggestion}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative p-6 bg-gradient-to-br from-green-800/30 to-emerald-700/30 rounded-2xl w-fit mx-auto mb-6 shadow-xl border border-green-500/30">
                      <CheckCircle className="text-green-400" size={40} />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    </div>
                    <h4 className="font-bold text-green-300 text-2xl mb-3 tracking-tight">Excellent Writing!</h4>
                    <p className="font-medium text-gray-400 max-w-sm mx-auto text-lg leading-relaxed mb-4">
                      Your content has been analyzed by AI and no grammar issues were detected
                    </p>
                    <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-xs text-green-300 font-medium">AI Analysis Complete</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-16">
                  <div className="relative p-6 bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl w-fit mx-auto mb-6 shadow-xl">
                    <CheckCircle className="text-gray-400" size={40} />
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-orange-500 text-xs font-bold text-white rounded-full">AI</div>
                  </div>
                  <h4 className="font-bold text-white text-2xl mb-3 tracking-tight">Grammar & Style Checker</h4>
                  <p className="font-medium text-gray-400 max-w-sm mx-auto text-lg leading-relaxed mb-4">
                    {note?.content && isContentValid && isContentValid(note.content)
                      ? 'Click the button above to analyze your writing for grammar, spelling, and style improvements'
                      : 'Write content to enable AI-powered grammar and style checking'}
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'translate':
        return (
          <div className="space-y-8">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-600/40">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <Languages className="text-black" size={22} />
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Translation</h3>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Select Language:
                  </label>
                  <select
                    value={translationLang}
                    onChange={(e) => setTranslationLang(e.target.value)}
                    className="w-full p-4 bg-white/10 border border-gray-500/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/50 shadow-lg backdrop-blur-sm font-semibold text-base transition-all duration-300 hover:bg-white/20"
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
                    onClick={() => translateNote && translateNote(note.content, translationLang)}
                    disabled={isLoading}
                    className="w-full p-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Translating...
                      </>
                    ) : (
                      <>
                        <Languages size={18} />
                        Translate to {languages.find(l => l.code === translationLang)?.name}
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {aiFeatures?.translation && aiFeatures.translation[translationLang] ? (
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-2xl border border-gray-600/50 shadow-xl backdrop-blur-sm overflow-hidden flex flex-col">
                    {/* Copy Button - Small, Right Corner */}
                    <button
                      onClick={() => copyToClipboard(aiFeatures.translation[translationLang], 'translation')}
                      className={`absolute top-2 right-2 p-1.5 rounded-md transition-all duration-200 z-30 ${
                        copiedItems.translation 
                          ? 'bg-yellow-500 shadow-md shadow-yellow-500/30 scale-105' 
                          : 'bg-white/90 hover:bg-white shadow-md hover:shadow-lg backdrop-blur-sm border border-gray-300/40 hover:scale-105'
                      }`}
                      title="Copy translation"
                    >
                      {copiedItems.translation ? (
                        <Check size={12} className="text-white" />
                      ) : (
                        <Copy size={12} className="text-gray-700" />
                      )}
                    </button>
                    
                    {/* Text Content */}
                    <div className="flex-1 p-5 pr-10 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                      <div className="text-base text-gray-100 text-professional">
                        {aiFeatures.translation[translationLang]}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="relative p-6 bg-gradient-to-br from-blue-800/30 to-purple-700/30 rounded-2xl w-fit mx-auto mb-6 shadow-xl border border-blue-500/30">
                    <Languages className="text-blue-400" size={40} />
                    <div className="absolute -top-2 -right-2 px-2 py-1 bg-blue-500 text-xs font-bold text-white rounded-full">12+</div>
                  </div>
                  <h4 className="font-bold text-blue-300 text-xl mb-2 tracking-tight">Multi-Language AI Translator</h4>
                  <p className="font-medium text-gray-400 max-w-xs mx-auto mb-4">
                    Professional-grade translation powered by advanced AI models
                  </p>
                  <div className="flex flex-wrap gap-1 justify-center opacity-60">
                    <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">🇪🇸 ES</span>
                    <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">🇫🇷 FR</span>
                    <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">🇩🇪 DE</span>
                    <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">🇯🇵 JP</span>
                    <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-300 rounded">+8</span>
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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-750">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-xl shadow-lg">
            <Sparkles size={26} className="text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">AI Assistant</h2>
            <p className="text-gray-300 text-base font-medium mt-1 leading-relaxed">
              Enhance your notes with intelligent AI
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700/50 bg-gray-800/80 px-5">
        <div className="grid grid-cols-2 gap-3 py-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center justify-center gap-2 py-3.5 px-4 font-semibold text-base rounded-lg transition-all duration-300 ease-out ${
                  activeTab === tab.id
                    ? 'text-black bg-white shadow-xl shadow-white/20'
                    : 'text-gray-300 bg-gray-700/60 hover:bg-gray-600/80 hover:text-white hover:shadow-lg border border-gray-600/50 hover:border-gray-500/70'
                }`}
              >
                <Icon size={18} className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
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
      <div className="flex-1 overflow-hidden px-6 py-5">
        <div className="h-full">
          {renderTabContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-700/50 bg-gray-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${
              isLoading ? 'bg-yellow-400 shadow-yellow-400/30' : 'bg-green-400 shadow-green-400/30'
            }`}></div>
            <p className="text-xs text-gray-400 font-medium">
              {isLoading ? 'AI Processing...' : 'AI Ready'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Brain size={10} />
              {aiFeatures?.summary ? '✓ Summary' : '- Summary'}
            </span>
            <span className="flex items-center gap-1">
              <Tags size={10} />
              {aiFeatures?.tags ? `✓ ${aiFeatures.tags.length} Tags` : '- Tags'}
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle size={10} />
              {aiFeatures?.grammarIssues !== null ? '✓ Grammar' : '- Grammar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPanel;