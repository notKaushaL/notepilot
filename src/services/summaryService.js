/**
 * SummaryService - Advanced AI-powered text summarization with multiple providers
 * Supports Hugging Face, Cohere APIs with intelligent local fallback
 */

class SummaryService {
  constructor() {
    this.cache = new Map();
    this.apiStatus = {
      huggingFace: { available: true, lastError: null, requestCount: 0 },
      cohere: { available: true, lastError: null, requestCount: 0 }
    };
    
    // Rate limiting
    this.rateLimiter = {
      huggingFace: { lastRequest: 0, minInterval: 500 }, // 500ms between requests
      cohere: { lastRequest: 0, minInterval: 500 }
    };

    // API endpoints and configuration
    this.config = {
      huggingFace: {
        endpoint: 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
        maxLength: 1000,
        summaryLength: 150
      },
      cohere: {
        endpoint: 'https://api.cohere.ai/v1/summarize',
        maxLength: 1000,
        summaryLength: 150
      }
    };

    // Stop words for local processing
    this.stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
      'have', 'had', 'what', 'said', 'each', 'which', 'she', 'do',
      'how', 'their', 'if', 'up', 'out', 'many', 'then', 'them'
    ]);
  }

  /**
   * Generate cache key based on content hash and note ID
   */
  generateCacheKey(content, noteId) {
    const contentHash = this.hashCode(content);
    return `${noteId}_${contentHash}`;
  }

  /**
   * Simple hash function for content
   */
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Rate limiting helper
   */
  async enforceRateLimit(provider) {
    const limiter = this.rateLimiter[provider];
    const now = Date.now();
    const timeSinceLastRequest = now - limiter.lastRequest;
    
    if (timeSinceLastRequest < limiter.minInterval) {
      const delay = limiter.minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    limiter.lastRequest = Date.now();
  }

  /**
   * Summarize using Hugging Face BART model
   */
  async summarizeWithHuggingFace(text) {
    try {
      const token = import.meta.env.VITE_HF_TOKEN;
      if (!token) {
        throw new Error('Hugging Face token not configured');
      }

      await this.enforceRateLimit('huggingFace');

      // Truncate text if too long
      const truncatedText = text.length > this.config.huggingFace.maxLength 
        ? text.substring(0, this.config.huggingFace.maxLength) + '...'
        : text;

      const response = await fetch(this.config.huggingFace.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: truncatedText,
          parameters: {
            max_length: this.config.huggingFace.summaryLength,
            min_length: 50,
            do_sample: false,
            early_stopping: true
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Hugging Face API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.summary_text) {
        this.apiStatus.huggingFace.available = true;
        this.apiStatus.huggingFace.lastError = null;
        this.apiStatus.huggingFace.requestCount++;
        return {
          summary: data[0].summary_text,
          provider: 'HuggingFace',
          confidence: 0.9
        };
      }

      throw new Error('Invalid response format from Hugging Face API');

    } catch (error) {
      console.error('Hugging Face summarization failed:', error);
      this.apiStatus.huggingFace.available = false;
      this.apiStatus.huggingFace.lastError = error.message;
      throw error;
    }
  }

  /**
   * Summarize using Cohere API
   */
  async summarizeWithCohere(text) {
    try {
      const token = import.meta.env.VITE_COHERE_TOKEN;
      if (!token) {
        throw new Error('Cohere token not configured');
      }

      await this.enforceRateLimit('cohere');

      // Truncate text if too long
      const truncatedText = text.length > this.config.cohere.maxLength 
        ? text.substring(0, this.config.cohere.maxLength) + '...'
        : text;

      const response = await fetch(this.config.cohere.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: truncatedText,
          length: 'medium',
          format: 'paragraph',
          model: 'summarize-medium',
          extractiveness: 'medium',
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Cohere API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.summary) {
        this.apiStatus.cohere.available = true;
        this.apiStatus.cohere.lastError = null;
        this.apiStatus.cohere.requestCount++;
        return {
          summary: data.summary,
          provider: 'Cohere',
          confidence: 0.85
        };
      }

      throw new Error('Invalid response format from Cohere API');

    } catch (error) {
      console.error('Cohere summarization failed:', error);
      this.apiStatus.cohere.available = false;
      this.apiStatus.cohere.lastError = error.message;
      throw error;
    }
  }

  /**
   * Extract key phrases from text using frequency analysis
   */
  extractKeyPhrases(text, maxPhrases = 3) {
    // Clean text and split into words
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.stopWords.has(word));

    // Count word frequency
    const wordFreq = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Extract 2-3 word phrases
    const phrases = [];
    for (let i = 0; i < words.length - 1; i++) {
      const phrase2 = `${words[i]} ${words[i + 1]}`;
      const phrase3 = i < words.length - 2 ? `${words[i]} ${words[i + 1]} ${words[i + 2]}` : null;
      
      if (phrase2) phrases.push(phrase2);
      if (phrase3) phrases.push(phrase3);
    }

    // Count phrase frequency
    const phraseFreq = {};
    phrases.forEach(phrase => {
      phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
    });

    // Sort and return top phrases
    const sortedPhrases = Object.entries(phraseFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxPhrases)
      .map(([phrase]) => phrase);

    return sortedPhrases.length > 0 ? sortedPhrases : Object.keys(wordFreq).slice(0, maxPhrases);
  }

  /**
   * Extract and score sentences for summarization
   */
  extractSentences(text, maxSentences = 2) {
    const sentences = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    
    if (sentences.length <= 1) {
      return text.trim();
    }

    // Advanced scoring algorithm
    const keyPhrases = this.extractKeyPhrases(text);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      const words = sentence.split(/\s+/);
      const wordCount = words.length;
      
      // Position scoring (first sentence most important)
      if (index === 0) score += 3;
      if (index === 1) score += 2; // Second sentence often has key info
      if (index === sentences.length - 1) score += 1;
      
      // Length scoring (prefer sentences close to average length)
      const lengthRatio = wordCount / avgSentenceLength;
      if (lengthRatio >= 0.7 && lengthRatio <= 1.3) score += 2;
      if (wordCount >= 10 && wordCount <= 30) score += 1;
      
      // Keyword density scoring
      const lowerSentence = sentence.toLowerCase();
      let keywordMatches = 0;
      keyPhrases.forEach(phrase => {
        if (lowerSentence.includes(phrase.toLowerCase())) {
          keywordMatches++;
          score += 3;
        }
      });
      
      // Avoid sentences that are too short or too long
      if (wordCount < 5) score -= 2;
      if (wordCount > 40) score -= 1;
      
      // Prefer sentences with numbers, proper nouns, or important indicators
      if (/\b\d+\b/.test(sentence)) score += 1; // Contains numbers
      if (/[A-Z][a-z]+\s[A-Z][a-z]+/.test(sentence)) score += 1; // Proper nouns
      if (/\b(important|key|main|primary|significant|essential)\b/i.test(sentence)) score += 2;
      
      return { sentence: sentence.trim(), score, index, keywordMatches };
    });

    // Select best sentences with diversity
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(maxSentences, Math.ceil(sentences.length * 0.4))) // Max 40% of sentences
      .sort((a, b) => a.index - b.index) // Restore original order
      .map(item => item.sentence);

    // Create a coherent summary by connecting sentences
    let summary = topSentences.join(' ');
    
    // Ensure summary is concise (max 150 chars)
    if (summary.length > 150) {
      summary = summary.substring(0, 147) + '...';
    }

    return summary;
  }

  /**
   * Calculate reading time for content
   */
  calculateReadingTime(text) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  }

  /**
   * Smart local summarization with advanced algorithms
   */
  summarizeLocally(content) {
    try {
      // Strip HTML tags if present
      const cleanText = content.replace(/<[^>]*>/g, '');
      
      if (!cleanText.trim()) {
        return {
          summary: 'Empty note - start writing to generate a summary',
          provider: 'Local',
          confidence: 1.0,
          keyPhrases: [],
          readingTime: '0 min read'
        };
      }

      if (cleanText.length < 50) {
        return {
          summary: cleanText.length > 20 ? cleanText : 'Note too short for meaningful summary',
          provider: 'Local',
          confidence: 0.7,
          keyPhrases: [],
          readingTime: this.calculateReadingTime(cleanText)
        };
      }

      // Generate abstractive summary instead of extractive
      const summary = this.generateAbstractiveSummary(cleanText);
      const keyPhrases = this.extractKeyPhrases(cleanText);
      const readingTime = this.calculateReadingTime(cleanText);

      return {
        summary: summary,
        provider: 'Local',
        confidence: 0.85,
        keyPhrases,
        readingTime
      };

    } catch (error) {
      console.error('Local summarization failed:', error);
      return {
        summary: 'Error generating summary',
        provider: 'Local',
        confidence: 0.0,
        keyPhrases: [],
        readingTime: '0 min read'
      };
    }
  }

  /**
   * Generate abstractive summary by analyzing content themes
   */
  generateAbstractiveSummary(text) {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const keyPhrases = this.extractKeyPhrases(text);
    const wordCount = text.split(/\s+/).length;
    
    // Analyze content type and themes
    const contentAnalysis = this.analyzeContentThemes(text, keyPhrases);
    
    // Generate summary based on content type
    let summary = '';
    
    if (contentAnalysis.isAbout.length > 0) {
      summary = `This note discusses ${contentAnalysis.isAbout.join(', ')}.`;
      
      if (contentAnalysis.actions.length > 0) {
        summary += ` It covers ${contentAnalysis.actions.join(', ')}.`;
      }
      
      if (contentAnalysis.keyPoints.length > 0) {
        summary += ` Key points include ${contentAnalysis.keyPoints.slice(0, 2).join(' and ')}.`;
      }
    } else {
      // Fallback to improved extractive method
      const topSentences = this.extractSentences(text, 1);
      const mainTopics = keyPhrases.slice(0, 2).join(' and ');
      
      if (mainTopics) {
        summary = `This note focuses on ${mainTopics}. ${topSentences}`;
      } else {
        summary = topSentences;
      }
    }
    
    // Ensure proper length
    if (summary.length > 150) {
      summary = summary.substring(0, 147) + '...';
    }
    
    return summary;
  }

  /**
   * Analyze content themes and extract semantic meaning
   */
  analyzeContentThemes(text, keyPhrases) {
    const lowerText = text.toLowerCase();
    
    // Common patterns for different content types
    const patterns = {
      about: [/(?:about|regarding|concerning|discusses?|focuses? on|deals? with)\s+([^.!?]+)/gi,
              /(?:is|are|was|were)\s+(?:a|an|the)?\s*([^.!?]+?)(?:\s+(?:that|which|who))/gi],
      actions: [/(?:will|should|must|need to|plan to|going to)\s+([^.!?]+)/gi,
                /(?:steps?|process|method|approach|way)\s+(?:to|for|of)\s+([^.!?]+)/gi],
      requirements: [/(?:requirement|need|must|should|require)s?\s+([^.!?]+)/gi,
                     /(?:use|implement|add|create|build)\s+([^.!?]+)/gi],
      features: [/(?:feature|capability|function|includes?)\s+([^.!?]+)/gi,
                 /(?:supports?|provides?|offers?)\s+([^.!?]+)/gi]
    };
    
    const analysis = {
      isAbout: [],
      actions: [],
      keyPoints: [],
      contentType: 'general'
    };
    
    // Extract semantic content
    Object.entries(patterns).forEach(([type, patternList]) => {
      patternList.forEach(pattern => {
        const matches = [...lowerText.matchAll(pattern)];
        matches.forEach(match => {
          if (match[1] && match[1].length > 3 && match[1].length < 50) {
            const cleaned = match[1].trim().replace(/\s+/g, ' ');
            if (type === 'about' || type === 'requirements') {
              analysis.isAbout.push(cleaned);
            } else if (type === 'actions') {
              analysis.actions.push(cleaned);
            } else {
              analysis.keyPoints.push(cleaned);
            }
          }
        });
      });
    });
    
    // Add key phrases as topics if no other topics found
    if (analysis.isAbout.length === 0 && keyPhrases.length > 0) {
      analysis.isAbout = keyPhrases.slice(0, 2);
    }
    
    // Determine content type
    if (lowerText.includes('requirement') || lowerText.includes('implement')) {
      analysis.contentType = 'requirements';
    } else if (lowerText.includes('meeting') || lowerText.includes('discuss')) {
      analysis.contentType = 'meeting';
    } else if (lowerText.includes('recipe') || lowerText.includes('cook')) {
      analysis.contentType = 'recipe';
    }
    
    return analysis;
  }

  /**
   * Main summary method with intelligent fallback logic
   */
  async getSummary(content, noteId) {
    const cacheKey = this.generateCacheKey(content, noteId);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('📋 Returning cached summary for note:', noteId);
      return this.cache.get(cacheKey);
    }

    // Strip HTML for processing
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    
    if (!cleanContent || cleanContent.length < 10) {
      const result = {
        summary: 'Start writing to generate a summary...',
        provider: 'Local',
        confidence: 1.0,
        keyPhrases: [],
        readingTime: '0 min read',
        cached: false
      };
      return result;
    }

    let result = null;
    const providers = ['huggingFace', 'cohere', 'local'];

    // Try each provider in order
    for (const provider of providers) {
      try {
        console.log(`🤖 Attempting ${provider} summarization for note:`, noteId);

        switch (provider) {
          case 'huggingFace':
            if (this.apiStatus.huggingFace.available) {
              result = await this.summarizeWithHuggingFace(cleanContent);
            }
            break;
            
          case 'cohere':
            if (this.apiStatus.cohere.available) {
              result = await this.summarizeWithCohere(cleanContent);
            }
            break;
            
          case 'local':
            result = this.summarizeLocally(cleanContent);
            break;
        }

        if (result) {
          // Add metadata
          result.cached = false;
          result.timestamp = new Date().toISOString();
          
          // Add local analysis for API results
          if (provider !== 'local') {
            const localAnalysis = this.summarizeLocally(cleanContent);
            result.keyPhrases = localAnalysis.keyPhrases;
            result.readingTime = localAnalysis.readingTime;
          }

          // Cache the result
          this.cache.set(cacheKey, result);
          console.log(`✅ ${provider} summarization successful for note:`, noteId);
          return result;
        }

      } catch (error) {
        console.log(`❌ ${provider} summarization failed for note ${noteId}:`, error.message);
        
        // Mark API as unavailable if it failed
        if (provider in this.apiStatus) {
          this.apiStatus[provider].available = false;
          this.apiStatus[provider].lastError = error.message;
        }
        
        // Continue to next provider
        continue;
      }
    }

    // If all providers failed, return a basic fallback
    console.log('⚠️ All summarization providers failed, returning basic fallback');
    const fallback = {
      summary: 'Unable to generate summary at this time',
      provider: 'Fallback',
      confidence: 0.1,
      keyPhrases: [],
      readingTime: this.calculateReadingTime(cleanContent),
      cached: false,
      timestamp: new Date().toISOString()
    };

    return fallback;
  }

  /**
   * Get API status and statistics
   */
  getStatus() {
    return {
      ...this.apiStatus,
      cacheSize: this.cache.size,
      hasHuggingFaceToken: Boolean(import.meta.env.VITE_HF_TOKEN),
      hasCohereToken: Boolean(import.meta.env.VITE_COHERE_TOKEN)
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Summary cache cleared');
  }

  /**
   * Reset API status (mark as available again)
   */
  resetApiStatus() {
    Object.keys(this.apiStatus).forEach(provider => {
      this.apiStatus[provider].available = true;
      this.apiStatus[provider].lastError = null;
    });
    console.log('🔄 API status reset');
  }

  /**
   * Batch summarize multiple notes
   */
  async batchSummarize(notes, onProgress = null) {
    const results = [];
    const total = notes.length;

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      try {
        const summary = await this.getSummary(note.content, note.id);
        results.push({
          noteId: note.id,
          success: true,
          summary
        });
      } catch (error) {
        results.push({
          noteId: note.id,
          success: false,
          error: error.message
        });
      }

      if (onProgress) {
        onProgress(i + 1, total);
      }

      // Small delay between batch operations
      if (i < notes.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

// Export singleton instance
export default new SummaryService();