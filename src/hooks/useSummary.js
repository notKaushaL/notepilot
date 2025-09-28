/**
 * useSummary - React hook for AI summary functionality
 * Manages summary generation, caching, loading states, and batch operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import SummaryService from '../services/summaryService';

export const useSummary = () => {
  const [summaries, setSummaries] = useState(new Map());
  const [loadingStates, setLoadingStates] = useState(new Map());
  const [errors, setErrors] = useState(new Map());
  const [batchProgress, setBatchProgress] = useState(null);
  const [apiStatus, setApiStatus] = useState(SummaryService.getStatus());

  // Track active summary requests to prevent duplicates
  const activeRequests = useRef(new Set());

  /**
   * Update API status periodically
   */
  useEffect(() => {
    const updateStatus = () => {
      setApiStatus(SummaryService.getStatus());
    };

    // Update status every 30 seconds
    const interval = setInterval(updateStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Generate summary for a single note
   */
  const generateSummary = useCallback(async (noteId, content, force = false) => {
    // Prevent duplicate requests
    const requestKey = `${noteId}_${content.length}`;
    if (activeRequests.current.has(requestKey) && !force) {
      console.log('📋 Summary request already in progress for note:', noteId);
      return;
    }

    try {
      activeRequests.current.add(requestKey);
      
      // Set loading state
      setLoadingStates(prev => new Map(prev.set(noteId, true)));
      setErrors(prev => {
        const newErrors = new Map(prev);
        newErrors.delete(noteId);
        return newErrors;
      });

      console.log('🤖 Generating summary for note:', noteId);
      
      // Generate summary
      const result = await SummaryService.getSummary(content, noteId);
      
      // Update summaries
      setSummaries(prev => new Map(prev.set(noteId, result)));
      
      console.log('✅ Summary generated successfully for note:', noteId, result.provider);
      
      return result;

    } catch (error) {
      console.error('❌ Summary generation failed for note:', noteId, error);
      
      // Set error state
      setErrors(prev => new Map(prev.set(noteId, error.message)));
      
      // Return fallback summary
      const fallback = {
        summary: 'Unable to generate summary',
        provider: 'Error',
        confidence: 0,
        keyPhrases: [],
        readingTime: '0 min read',
        cached: false,
        error: error.message
      };
      
      setSummaries(prev => new Map(prev.set(noteId, fallback)));
      return fallback;

    } finally {
      activeRequests.current.delete(requestKey);
      setLoadingStates(prev => {
        const newStates = new Map(prev);
        newStates.delete(noteId);
        return newStates;
      });
      
      // Update API status after request
      setApiStatus(SummaryService.getStatus());
    }
  }, []);

  /**
   * Get cached summary or generate new one
   */
  const getSummary = useCallback((noteId, content) => {
    const cached = summaries.get(noteId);
    if (cached) {
      return cached;
    }

    // Auto-generate if not exists and content is sufficient
    if (content && content.replace(/<[^>]*>/g, '').trim().length > 10) {
      generateSummary(noteId, content);
    }

    return null;
  }, [summaries, generateSummary]);

  /**
   * Batch generate summaries for multiple notes
   */
  const batchGenerateSummaries = useCallback(async (notes) => {
    if (!notes || notes.length === 0) return;

    try {
      console.log('🚀 Starting batch summary generation for', notes.length, 'notes');
      
      setBatchProgress({ current: 0, total: notes.length, status: 'processing' });
      
      const results = await SummaryService.batchSummarize(
        notes,
        (current, total) => {
          setBatchProgress({ current, total, status: 'processing' });
        }
      );

      // Update summaries with results
      const newSummaries = new Map(summaries);
      const newErrors = new Map(errors);

      results.forEach(result => {
        if (result.success) {
          newSummaries.set(result.noteId, result.summary);
          newErrors.delete(result.noteId);
        } else {
          newErrors.set(result.noteId, result.error);
        }
      });

      setSummaries(newSummaries);
      setErrors(newErrors);
      
      setBatchProgress({ 
        current: results.length, 
        total: results.length, 
        status: 'completed',
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      console.log('✅ Batch summary generation completed:', results.length, 'processed');
      
      // Clear progress after delay
      setTimeout(() => setBatchProgress(null), 3000);

      return results;

    } catch (error) {
      console.error('❌ Batch summary generation failed:', error);
      setBatchProgress({ status: 'error', error: error.message });
      
      setTimeout(() => setBatchProgress(null), 5000);
      throw error;
    }
  }, [summaries, errors]);

  /**
   * Refresh summary for a note (force regenerate)
   */
  const refreshSummary = useCallback(async (noteId, content) => {
    console.log('🔄 Refreshing summary for note:', noteId);
    
    // Clear cached summary
    setSummaries(prev => {
      const newSummaries = new Map(prev);
      newSummaries.delete(noteId);
      return newSummaries;
    });
    
    // Clear any existing error
    setErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(noteId);
      return newErrors;
    });

    // Generate new summary
    return await generateSummary(noteId, content, true);
  }, [generateSummary]);

  /**
   * Clear all summaries from cache
   */
  const clearAllSummaries = useCallback(() => {
    console.log('🗑️ Clearing all summaries from cache');
    setSummaries(new Map());
    setErrors(new Map());
    setLoadingStates(new Map());
    SummaryService.clearCache();
  }, []);

  /**
   * Reset API status (retry failed APIs)
   */
  const resetApiStatus = useCallback(() => {
    console.log('🔄 Resetting API status');
    SummaryService.resetApiStatus();
    setApiStatus(SummaryService.getStatus());
    
    // Clear errors to allow retrying
    setErrors(new Map());
  }, []);

  /**
   * Check if summary exists for a note
   */
  const hasSummary = useCallback((noteId) => {
    return summaries.has(noteId);
  }, [summaries]);

  /**
   * Check if summary is loading for a note
   */
  const isSummaryLoading = useCallback((noteId) => {
    return loadingStates.get(noteId) || false;
  }, [loadingStates]);

  /**
   * Get summary error for a note
   */
  const getSummaryError = useCallback((noteId) => {
    return errors.get(noteId) || null;
  }, [errors]);

  /**
   * Get summary statistics
   */
  const getStatistics = useCallback(() => {
    const totalSummaries = summaries.size;
    const totalErrors = errors.size;
    const loadingCount = loadingStates.size;
    
    const providers = Array.from(summaries.values()).reduce((acc, summary) => {
      acc[summary.provider] = (acc[summary.provider] || 0) + 1;
      return acc;
    }, {});

    return {
      totalSummaries,
      totalErrors,
      loadingCount,
      providers,
      apiStatus,
      cacheSize: SummaryService.getStatus().cacheSize
    };
  }, [summaries, errors, loadingStates, apiStatus]);

  /**
   * Auto-generate summaries for notes that don't have them
   */
  const autoGenerateSummaries = useCallback(async (notes, options = {}) => {
    const { 
      minContentLength = 50, 
      skipEncrypted = true,
      batchSize = 5 
    } = options;

    // Filter notes that need summaries
    const notesNeedingSummaries = notes.filter(note => {
      if (skipEncrypted && note.isEncrypted) return false;
      if (summaries.has(note.id)) return false;
      
      const cleanContent = note.content.replace(/<[^>]*>/g, '').trim();
      return cleanContent.length >= minContentLength;
    });

    if (notesNeedingSummaries.length === 0) {
      console.log('📋 No notes need summary generation');
      return [];
    }

    console.log('🤖 Auto-generating summaries for', notesNeedingSummaries.length, 'notes');

    // Process in batches to avoid overwhelming APIs
    const batches = [];
    for (let i = 0; i < notesNeedingSummaries.length; i += batchSize) {
      batches.push(notesNeedingSummaries.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(note => generateSummary(note.id, note.content))
      );
      results.push(...batchResults);
      
      // Delay between batches
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }, [summaries, generateSummary]);

  return {
    // Core functionality
    generateSummary,
    getSummary,
    refreshSummary,
    
    // Batch operations
    batchGenerateSummaries,
    autoGenerateSummaries,
    
    // State management
    summaries,
    loadingStates,
    errors,
    batchProgress,
    
    // Utility functions
    hasSummary,
    isSummaryLoading,
    getSummaryError,
    getStatistics,
    
    // Cache management
    clearAllSummaries,
    resetApiStatus,
    
    // API status
    apiStatus
  };
};