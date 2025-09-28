/**
 * NoteSummary - AI-powered summary display component
 * Shows summary with provider info, loading states, and interactive controls
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Clock, 
  Tag,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Brain,
  Zap,
  Globe
} from 'lucide-react';

const NoteSummary = ({ 
  noteId,
  summary,
  isLoading = false,
  error = null,
  onRefresh,
  onGenerate,
  compact = false,
  showControls = true
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Provider-specific styling and icons
  const getProviderInfo = (provider) => {
    const providers = {
      'HuggingFace': {
        icon: Brain,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400/10',
        borderColor: 'border-yellow-400/20',
        name: '🤗 Hugging Face'
      },
      'Cohere': {
        icon: Zap,
        color: 'text-blue-400',
        bgColor: 'bg-blue-400/10',
        borderColor: 'border-blue-400/20',
        name: '⚡ Cohere'
      },
      'Local': {
        icon: Globe,
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        borderColor: 'border-green-400/20',
        name: '🧠 Local AI'
      },
      'Fallback': {
        icon: AlertTriangle,
        color: 'text-orange-400',
        bgColor: 'bg-orange-400/10',
        borderColor: 'border-orange-400/20',
        name: '⚠️ Fallback'
      },
      'Error': {
        icon: AlertTriangle,
        color: 'text-red-400',
        bgColor: 'bg-red-400/10',
        borderColor: 'border-red-400/20',
        name: '❌ Error'
      }
    };
    
    return providers[provider] || providers['Local'];
  };

  const renderLoadingState = () => (
    <div className={`
      ${compact ? 'p-3' : 'p-4'} 
      bg-gray-800/50 border border-gray-700 rounded-xl
    `}>
      <div className="flex items-center gap-3">
        <Loader2 size={compact ? 16 : 20} className="text-blue-400 animate-spin" />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-300 mb-1">
            Generating AI Summary...
          </div>
          <div className="text-xs text-gray-500">
            This may take a few seconds
          </div>
        </div>
      </div>
      
      {/* Loading animation */}
      <div className="mt-3 space-y-2">
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" 
               style={{ width: '60%' }} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-3 bg-gray-700 rounded animate-pulse" 
                 style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className={`
      ${compact ? 'p-3' : 'p-4'} 
      bg-red-400/10 border border-red-400/20 rounded-xl
    `}>
      <div className="flex items-start gap-3">
        <AlertTriangle size={compact ? 16 : 20} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-red-300 mb-1">
            Summary Generation Failed
          </div>
          <div className="text-xs text-red-400/80 break-words">
            {error}
          </div>
        </div>
        {showControls && (
          <button
            onClick={() => onGenerate?.(noteId)}
            className="flex-shrink-0 p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
            title="Retry"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>
    </div>
  );

  const renderEmptyState = () => null; // Don't render anything when empty

  // Show loading state
  if (isLoading) {
    return renderLoadingState();
  }

  // Show error state
  if (error && !summary) {
    return renderErrorState();
  }

  // Show empty state
  if (!summary) {
    return renderEmptyState();
  }

  const providerInfo = getProviderInfo(summary.provider);
  const ProviderIcon = providerInfo.icon;

  return (
    <div className={`
      ${compact ? 'p-3' : 'p-4'} 
      ${providerInfo.bgColor} 
      border ${providerInfo.borderColor} 
      rounded-xl transition-all duration-200 hover:shadow-lg
    `}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <ProviderIcon 
            size={compact ? 16 : 18} 
            className={`${providerInfo.color} flex-shrink-0`} 
          />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">
              AI Summary
            </div>
            <div className={`text-xs ${providerInfo.color} truncate`}>
              {providerInfo.name}
            </div>
          </div>
        </div>


      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Summary text */}
          <div className="text-sm text-gray-200 leading-relaxed">
            {summary.summary}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {/* Confidence indicator */}
            {summary.confidence !== undefined && (
              <div className="flex items-center gap-1">
                <CheckCircle size={12} className={
                  summary.confidence > 0.8 ? 'text-green-400' :
                  summary.confidence > 0.6 ? 'text-yellow-400' :
                  'text-orange-400'
                } />
                <span>
                  {Math.round(summary.confidence * 100)}% confidence
                </span>
              </div>
            )}

            {/* Reading time */}
            {summary.readingTime && (
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{summary.readingTime}</span>
              </div>
            )}

            {/* Cached indicator */}
            {summary.cached && (
              <div className="flex items-center gap-1 text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>Cached</span>
              </div>
            )}
          </div>



          {/* Error indicator for partial failures */}
          {error && summary && (
            <div className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded-lg p-2">
              <div className="flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>Fallback summary used due to API error</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteSummary;