import { useState, useCallback, useRef } from 'react';

// AI Configuration - Multiple API Providers for Robust Summarization
const AI_PROVIDERS = {
  openai: {
    key: import.meta.env.VITE_OPENAI_API_KEY,
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    priority: 3,
    enabled: !!import.meta.env.VITE_OPENAI_API_KEY
  },
  groq: {
    key: import.meta.env.VITE_GROQ_API_KEY,
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.1-8b-instant',
    priority: 4,
    enabled: !!import.meta.env.VITE_GROQ_API_KEY
  },
  huggingface: {
    key: import.meta.env.VITE_HUGGINGFACE_API_KEY || null, // Free tier available without key
    url: 'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
    model: 'facebook/bart-large-cnn',
    priority: 1,
    enabled: true // Always available as fallback
  },
  cohere: {
    key: import.meta.env.VITE_COHERE_API_KEY || null, // Free tier available
    url: 'https://api.cohere.ai/v1/summarize',
    model: 'summarize-xlarge',
    priority: 2,
    enabled: true // Always available as fallback
  }
};

const enabledProviders = Object.entries(AI_PROVIDERS).filter(([_, config]) => config.enabled);
console.log('🤖 Multi-API AI System initialized with', enabledProviders.length, 'enabled providers:', enabledProviders.map(([name]) => name).join(', '));

// Debug API key availability
console.log('🔑 API Keys Status:');
Object.entries(AI_PROVIDERS).forEach(([name, config]) => {
  console.log(`  ${name}: ${config.key ? '✅ Available' : '❌ Missing'} (enabled: ${config.enabled})`);
  if (config.key) {
    console.log(`    Key preview: ${config.key.substring(0, 10)}...${config.key.slice(-4)}`);
  }
});

// Advanced OpenAI Model Configuration - Using GPT-4o for better summarization
const AI_MODELS = {
  summarization: { primary: 'gpt-4o', fallback: 'gpt-4o-mini' },
  tagging: { primary: 'gpt-4o-mini', fallback: 'gpt-3.5-turbo' },
  grammar: { primary: 'gpt-4o-mini', fallback: 'gpt-3.5-turbo' },
  translation: { primary: 'gpt-4o', fallback: 'gpt-4o-mini' }
};

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

// Advanced text summarization algorithm
const createIntelligentSummary = (text) => {
  try {
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 15);
    
    if (sentences.length <= 1) {
      return cleanText.length > 150 ? cleanText.substring(0, 147) + '...' : cleanText;
    }
    
    if (sentences.length <= 3) {
      return sentences.join('. ').trim() + '.';
    }
    
    // Advanced sentence scoring
    const words = cleanText.toLowerCase().split(/\s+/);
    const wordFreq = {};
    words.forEach(word => {
      if (word.length > 3 && !/^(the|and|but|for|are|was|were|been|have|has|had|will|would|could|should|might|must|shall)$/.test(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    // Score sentences based on multiple factors
    const scoredSentences = sentences.map((sentence, index) => {
      const sentWords = sentence.toLowerCase().split(/\s+/);
      let score = 0;
      
      // Word frequency score
      sentWords.forEach(word => {
        if (wordFreq[word]) score += wordFreq[word];
      });
      
      // Position bonus (first and last sentences often important)
      if (index === 0) score += 30;
      if (index === sentences.length - 1) score += 15;
      
      // Length bonus (medium-length sentences preferred)
      const wordCount = sentWords.length;
      if (wordCount >= 8 && wordCount <= 25) score += 20;
      
      // Proper noun bonus
      const properNouns = sentence.match(/\b[A-Z][a-z]+\b/g) || [];
      score += properNouns.length * 10;
      
      // Date/number bonus
      if (/\d{4}|\b\d{1,2}[a-zA-Z]{2}\b/.test(sentence)) score += 15;
      
      return {
        text: sentence.trim(),
        score: Math.round(score / sentWords.length), // Normalize by length
        index
      };
    });
    
    // Select best sentences (2-4 depending on text length)
    const numSentences = Math.min(Math.max(2, Math.floor(sentences.length / 3)), 4);
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, numSentences)
      .sort((a, b) => a.index - b.index) // Maintain original order
      .map(s => s.text);
    
    let summary = topSentences.join('. ') + '.';
    
    // Clean up the summary
    summary = summary.replace(/\.\./g, '.').replace(/\s+/g, ' ').trim();
    
    // Ensure reasonable length
    if (summary.length > 500) {
      summary = summary.substring(0, 497) + '...';
    }
    
    return summary;
  } catch (error) {
    return 'Unable to create summary from the provided text.';
  }
};

export const useAI = () => {
  const [aiFeatures, setAiFeatures] = useState({
    summary: null,
    tags: null,
    glossaryTerms: null,
    grammarIssues: null,
    translation: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: '' });
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Cache and rate limiting refs
  const cacheRef = useRef(new Map());
  const lastRequestTime = useRef(0);
  const requestQueue = useRef([]);
  const isProcessingQueue = useRef(false);

  // REMOVED: Static summarization functions - now using OpenAI only
  // All summarization is now handled by generateSummary() which calls multiple AI providers with automatic fallbacks

  // Advanced text preprocessing
  const preprocessText = (text) => {
    return text
      .replace(/\s+/g, ' ')                    // Normalize whitespace
      .replace(/[^\w\s.,!?;:()-]/g, '')       // Remove special chars
      .replace(/\b(um|uh|like|you know)\b/gi, '') // Remove filler words
      .trim();
  };

  // Improved sentence tokenization
  const sentenceTokenize = (text) => {
    return text
      .split(/(?<=[.!?])\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && /[a-zA-Z]/.test(s))
      .slice(0, 50); // Limit for performance
  };

  // Extractive Summarization using TF-IDF and sentence ranking
  const extractiveSummarization = (sentences, fullText) => {
    if (sentences.length <= 3) return sentences;
    
    const sentenceScores = calculateSentenceScores(sentences, fullText);
    const topSentences = selectTopSentences(sentenceScores, sentences);
    
    return topSentences;
  };

  // Calculate sentence importance scores
  const calculateSentenceScores = (sentences, fullText) => {
    const wordFreq = calculateWordFrequency(fullText);
    const tfIdfScores = calculateTFIDF(sentences, wordFreq);
    const positionScores = calculatePositionScores(sentences);
    const lengthScores = calculateLengthScores(sentences);
    const keywordScores = calculateKeywordScores(sentences);
    
    return sentences.map((sentence, index) => ({
      sentence,
      index,
      score: (
        tfIdfScores[index] * 0.4 +           // Content relevance
        positionScores[index] * 0.25 +       // Position importance  
        lengthScores[index] * 0.15 +         // Optimal length
        keywordScores[index] * 0.2           // Keyword presence
      )
    }));
  };

  // TF-IDF calculation for sentences
  const calculateTFIDF = (sentences, wordFreq) => {
    const vocabularySize = Object.keys(wordFreq).length;
    
    return sentences.map(sentence => {
      const words = tokenizeWords(sentence);
      const sentenceLength = words.length;
      
      if (sentenceLength === 0) return 0;
      
      let tfIdfSum = 0;
      const wordCounts = {};
      
      // Calculate TF for sentence
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
      
      // Calculate TF-IDF for each word in sentence
      Object.entries(wordCounts).forEach(([word, count]) => {
        const tf = count / sentenceLength;
        const idf = Math.log(vocabularySize / (wordFreq[word] || 1));
        tfIdfSum += tf * idf;
      });
      
      return tfIdfSum / sentenceLength;
    });
  };

  // Position-based scoring (beginning and end are more important)
  const calculatePositionScores = (sentences) => {
    return sentences.map((_, index) => {
      const relativePos = index / sentences.length;
      // U-shaped curve: high at beginning and end
      return relativePos <= 0.3 ? 1.0 : 
             relativePos >= 0.7 ? 0.8 : 0.5;
    });
  };

  // Length-based scoring (prefer medium-length sentences)
  const calculateLengthScores = (sentences) => {
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    
    return sentences.map(sentence => {
      const ratio = sentence.length / avgLength;
      // Prefer sentences close to average length
      return ratio >= 0.6 && ratio <= 1.5 ? 1.0 : 0.7;
    });
  };

  // Keyword-based scoring
  const calculateKeywordScores = (sentences) => {
    const keywords = ['important', 'key', 'main', 'primary', 'significant', 
                     'essential', 'critical', 'major', 'fundamental', 'core'];
    
    return sentences.map(sentence => {
      const lowerSentence = sentence.toLowerCase();
      const keywordCount = keywords.filter(keyword => 
        lowerSentence.includes(keyword)).length;
      return Math.min(keywordCount * 0.3, 1.0);
    });
  };

  // Select top sentences maintaining original order
  const selectTopSentences = (sentenceScores, sentences) => {
    const targetLength = Math.min(Math.max(2, Math.ceil(sentences.length * 0.3)), 4);
    
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, targetLength)
      .sort((a, b) => a.index - b.index) // Maintain original order
      .map(item => item.sentence);
      
    return topSentences;
  };

  // Abstractive Summarization using paraphrasing and compression
  const abstractiveSummarization = (sentences, fullText) => {
    const keyPhrases = extractKeyPhrases(fullText);
    const mainThemes = identifyMainThemes(sentences);
    const compressedContent = compressContent(sentences, keyPhrases);
    
    return generateAbstractiveText(keyPhrases, mainThemes, compressedContent);
  };

  // Extract key phrases using n-gram analysis
  const extractKeyPhrases = (text) => {
    const words = tokenizeWords(text);
    const bigrams = [];
    const trigrams = [];
    
    // Generate bigrams
    for (let i = 0; i < words.length - 1; i++) {
      bigrams.push(words[i] + ' ' + words[i + 1]);
    }
    
    // Generate trigrams  
    for (let i = 0; i < words.length - 2; i++) {
      trigrams.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
    }
    
    // Count frequencies and return top phrases
    const phraseFreq = {};
    [...bigrams, ...trigrams].forEach(phrase => {
      if (phrase.length > 6) { // Filter meaningful phrases
        phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
      }
    });
    
    return Object.entries(phraseFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([phrase]) => phrase);
  };

  // Identify main themes using clustering
  const identifyMainThemes = (sentences) => {
    const themes = [];
    const processedSentences = sentences.map(s => tokenizeWords(s));
    
    // Simple theme extraction based on word overlap
    processedSentences.forEach((words, index) => {
      const significantWords = words.filter(w => w.length > 4);
      if (significantWords.length > 0) {
        themes.push(significantWords.slice(0, 3).join(' '));
      }
    });
    
    return [...new Set(themes)].slice(0, 3);
  };

  // Content compression using information density
  const compressContent = (sentences, keyPhrases) => {
    return sentences
      .map(sentence => {
        // Check if sentence contains key phrases
        const hasKeyPhrase = keyPhrases.some(phrase => 
          sentence.toLowerCase().includes(phrase.toLowerCase()));
        
        if (hasKeyPhrase || sentence.length < 80) {
          return sentence;
        }
        
        // Compress longer sentences
        const words = sentence.split(/\s+/);
        const compressed = words
          .filter((word, index) => {
            // Keep important words and every other word
            return word.length > 4 || index % 2 === 0 || 
                   ['is', 'are', 'was', 'were', 'the', 'and'].includes(word.toLowerCase());
          })
          .slice(0, 15)
          .join(' ');
          
        return compressed + (words.length > 15 ? '...' : '');
      })
      .filter(s => s.length > 20);
  };

  // Generate abstractive summary text
  const generateAbstractiveText = (keyPhrases, themes, compressedContent) => {
    const summaryParts = [];
    
    if (themes.length > 0) {
      summaryParts.push(`This content discusses ${themes[0]}`);
    }
    
    if (keyPhrases.length > 0) {
      summaryParts.push(`focusing on ${keyPhrases.slice(0, 2).join(' and ')}`);
    }
    
    if (compressedContent.length > 0) {
      const mainPoint = compressedContent[0];
      summaryParts.push(`The main point emphasizes ${mainPoint.toLowerCase()}`);
    }
    
    return summaryParts.join(', ') + '.';
  };

  // Hybrid summarization combining extractive and abstractive
  const hybridSummarization = (extractive, abstractive, originalText) => {
    const wordCount = originalText.split(/\s+/).length;
    
    // Choose strategy based on content length and type
    if (wordCount < 100) {
      return extractive.join(' ');
    } else if (wordCount < 300) {
      // Mix extractive and abstractive
      const mainExtractives = extractive.slice(0, 2).join(' ');
      return `${abstractive} ${mainExtractives}`;
    } else {
      // Prefer abstractive for longer content
      const topExtractive = extractive[0] || '';
      return `${abstractive} ${topExtractive}`.trim();
    }
  };

  // Enhanced word tokenization
  const tokenizeWords = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !isStopWord(word))
      .slice(0, 200); // Performance limit
  };

  // Calculate word frequency for entire document
  const calculateWordFrequency = (text) => {
    const words = tokenizeWords(text);
    const frequency = {};
    
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });
    
    return frequency;
  };

  // Enhanced stop word detection
  const isStopWord = (word) => {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'
    ]);
    
    return stopWords.has(word.toLowerCase());
  };

  // Fallback summary for error cases
  const fallbackSummary = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const firstSentence = sentences[0] || '';
    const wordCount = text.split(/\s+/).length;
    
    if (wordCount < 50) {
      return firstSentence.substring(0, 100) + '...';
    }
    
    return `Document contains ${wordCount} words covering various topics. ${firstSentence.substring(0, 80)}...`;
  };

  // Create technical summary
  const createTechnicalSummary = (text, sentences, wordCount) => {
    const techTerms = extractTechnicalTerms(text);
    const mainConcept = sentences[0].split(',')[0].trim();
    
    if (wordCount < 50) {
      return `Technical note covering ${techTerms.slice(0, 2).join(' and ')}.`;
    } else if (wordCount < 150) {
      return `${mainConcept} with focus on ${techTerms.slice(0, 3).join(', ')}.`;
    } else {
      const keyPoints = extractKeyPoints(sentences);
      return `Comprehensive technical documentation on ${mainConcept.toLowerCase()}. ${keyPoints}`;
    }
  };

  // Create planning summary  
  const createPlanningSummary = (text, sentences, wordCount) => {
    const objectives = extractObjectives(text);
    const timeline = extractTimelineInfo(text);
    
    if (wordCount < 50) {
      return `Planning document outlining ${objectives[0] || 'project objectives'}.`;
    } else {
      const timeInfo = timeline ? ` ${timeline}` : '';
      return `Strategic plan addressing ${objectives.slice(0, 2).join(' and ')}.${timeInfo}`;
    }
  };

  // Create meeting summary
  const createMeetingSummary = (text, sentences, wordCount) => {
    const decisions = extractDecisions(text);
    const participants = extractParticipants(text);
    
    if (decisions.length > 0) {
      return `Meeting summary covering ${decisions.join(', ')} with key decisions documented.`;
    } else {
      return `Meeting notes discussing ${extractMainTopics(sentences).slice(0, 2).join(' and ')}.`;
    }
  };

  // Create general intelligent summary
  const createGeneralSummary = (text, sentences, wordCount) => {
    const mainSubject = extractMainSubject(sentences[0]);
    const keyFacts = extractKeyFacts(sentences);
    
    if (wordCount < 50) {
      return `Brief note about ${mainSubject}.`;
    } else if (wordCount < 150) {
      return `Document about ${mainSubject} covering ${keyFacts.slice(0, 2).join(' and ')}.`;
    } else {
      const conclusion = extractConclusion(sentences);
      return `Comprehensive overview of ${mainSubject}. ${keyFacts.slice(0, 3).join(', ')} are discussed.${conclusion ? ` ${conclusion}` : ''}`;
    }
  };

  // Helper functions for intelligent extraction
  const extractMainSubject = (firstSentence) => {
    // Extract the main subject from the first sentence
    const match = firstSentence.match(/^([^,.(]+)/);
    return match ? match[1].trim().toLowerCase() : 'the topic';
  };

  const extractKeyFacts = (sentences) => {
    const facts = [];
    sentences.slice(1, 4).forEach(sentence => {
      // Look for factual statements (dates, numbers, specific terms)
      if (sentence.match(/\b\d{4}\b|\b(was|is|were|are|became)\b/)) {
        const key = sentence.split(/[,.]/, 1)[0].trim();
        if (key.length < 50) facts.push(key.toLowerCase());
      }
    });
    return facts.length > 0 ? facts : ['key information', 'important details'];
  };

  const extractTechnicalTerms = (text) => {
    const terms = [];
    const techPatterns = /\b(API|database|server|component|framework|algorithm|function|method|class|interface)\b/gi;
    const matches = text.match(techPatterns) || [];
    return [...new Set(matches.map(m => m.toLowerCase()))];
  };

  const extractObjectives = (text) => {
    const objectives = [];
    const objectivePatterns = /\b(goal|objective|plan|strategy|target|aim)\s+(?:is\s+)?(?:to\s+)?([^.]+)/gi;
    let match;
    while ((match = objectivePatterns.exec(text)) !== null && objectives.length < 3) {
      objectives.push(match[2].trim().split(',')[0]);
    }
    return objectives.length > 0 ? objectives : ['project goals'];
  };

  const extractKeyPoints = (sentences) => {
    try {
      if (sentences && sentences.length > 3) {
        return `Key points include implementation details and best practices.`;
      }
      return `Main concepts and methodologies are outlined.`;
    } catch (error) {
      return `Key information documented.`;
    }
  };

  const extractTimelineInfo = (text) => {
    try {
      const timePattern = /\b(deadline|due|by|until|before)\s+([^.]+)/gi;
      const match = timePattern.exec(text);
      return match ? match[2].trim() : null;
    } catch (error) {
      return null;
    }
  };

  const extractDecisions = (text) => {
    try {
      const decisions = [];
      const decisionPatterns = /\b(decided|agreed|concluded|resolved)\s+([^.]+)/gi;
      let match;
      while ((match = decisionPatterns.exec(text)) !== null && decisions.length < 2) {
        decisions.push(match[2].trim().split(',')[0]);
      }
      return decisions;
    } catch (error) {
      return [];
    }
  };

  const extractParticipants = (text) => {
    try {
      const participants = [];
      const namePattern = /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g;
      const matches = text.match(namePattern) || [];
      return [...new Set(matches)].slice(0, 3);
    } catch (error) {
      return [];
    }
  };

  const extractMainTopics = (sentences) => {
    try {
      if (!sentences || sentences.length === 0) return ['general topics'];
      const topics = [];
      sentences.slice(0, 3).forEach(sentence => {
        const words = sentence.split(/\s+/).filter(w => w.length > 5);
        if (words.length > 0) topics.push(words[0].toLowerCase());
      });
      return topics.length > 0 ? topics : ['discussion points'];
    } catch (error) {
      return ['topics'];
    }
  };

  const extractConclusion = (sentences) => {
    try {
      if (!sentences || sentences.length < 2) return null;
      const lastSentence = sentences[sentences.length - 1];
      if (lastSentence && lastSentence.includes('therefore') || lastSentence.includes('conclusion')) {
        return 'Key conclusions are provided.';
      }
      return null;
    } catch (error) {
      return null;
    }
  };
  
  // Extract key topics using keyword density and co-occurrence
  const extractKeyTopics = (text) => {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    
    // Common stop words to exclude
    const stopWords = new Set([
      'this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'were', 
      'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could',
      'other', 'more', 'very', 'what', 'know', 'just', 'first', 'into'
    ]);
    
    // Filter meaningful words
    const meaningfulWords = words.filter(word => !stopWords.has(word));
    
    // Calculate word frequency
    const wordFreq = {};
    meaningfulWords.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    // Extract high-frequency meaningful words as topics
    const topics = Object.entries(wordFreq)
      .filter(([word, freq]) => freq > 1 || word.length > 6)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    return topics;
  };

  // Advanced content analysis for better AI processing
  const analyzeContent = (content) => {
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const words = textContent.split(/\s+/).filter(w => w.length > 0);
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 5);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
      complexity: words.filter(w => w.length > 7).length / words.length,
      hasQuestions: /\?/.test(textContent),
      hasExclamations: /!/.test(textContent),
      hasLists: /[-•*]|\d+\./.test(textContent),
      hasTechnicalTerms: /\b(function|component|api|database|server|framework|algorithm)\b/i.test(textContent),
      contentType: determineContentType(textContent)
    };
  };

  // Determine content type for better summarization
  const determineContentType = (text) => {
    const lowerText = text.toLowerCase();
    
    if (/\b(todo|task|deadline|complete|finish)\b/.test(lowerText)) return 'task-list';
    if (/\b(meeting|discussion|agenda|action item)\b/.test(lowerText)) return 'meeting-notes';
    if (/\b(idea|concept|brainstorm|creative)\b/.test(lowerText)) return 'creative';
    if (/\b(code|function|api|bug|debug)\b/.test(lowerText)) return 'technical';
    if (/\b(project|plan|strategy|goal)\b/.test(lowerText)) return 'planning';
    if (/\b(research|analysis|data|study)\b/.test(lowerText)) return 'research';
    
    return 'general';
  };

  const generateStaticTags = (content) => {
    const textContent = content.toLowerCase().replace(/<[^>]*>/g, '');
    const words = textContent.split(/\s+/).filter(word => word.length > 3);
    const tags = new Set();
    
    // Technology keywords
    const techTerms = {
      'react': 'react', 'javascript': 'javascript', 'typescript': 'typescript',
      'frontend': 'frontend', 'backend': 'backend', 'fullstack': 'fullstack',
      'api': 'api', 'database': 'database', 'server': 'server',
      'component': 'components', 'function': 'functions', 'class': 'classes'
    };
    
    // Business keywords
    const businessTerms = {
      'project': 'project', 'task': 'tasks', 'meeting': 'meeting',
      'plan': 'planning', 'strategy': 'strategy', 'goal': 'goals',
      'requirement': 'requirements', 'deadline': 'deadline', 'client': 'client'
    };
    
    // Personal keywords
    const personalTerms = {
      'idea': 'ideas', 'thought': 'thoughts', 'reminder': 'reminder',
      'personal': 'personal', 'note': 'notes', 'important': 'important'
    };
    
    // Extract relevant terms
    words.forEach(word => {
      if (techTerms[word]) tags.add(techTerms[word]);
      if (businessTerms[word]) tags.add(businessTerms[word]);
      if (personalTerms[word]) tags.add(personalTerms[word]);
    });
    
    // Add contextual tags based on content patterns
    if (textContent.includes('todo') || textContent.includes('to do')) tags.add('todo');
    if (textContent.includes('bug') || textContent.includes('error')) tags.add('debugging');
    if (textContent.includes('design') || textContent.includes('ui')) tags.add('design');
    if (textContent.includes('code') || textContent.includes('function')) tags.add('coding');
    
    // Fallback intelligent tags based on content analysis
    if (tags.size === 0) {
      const contentLength = words.length;
      if (contentLength > 100) tags.add('detailed');
      if (contentLength > 50) tags.add('comprehensive');
      if (textContent.includes('?')) tags.add('questions');
      if (textContent.includes('!')) tags.add('important');
      tags.add('notes');
    }
    
    return Array.from(tags).slice(0, 5);
  };

  const generateStaticGlossary = (content) => {
    const textContent = content.toLowerCase().replace(/<[^>]*>/g, '');
    const foundTerms = [];
    
    // Comprehensive glossary database with intelligent matching
    const glossaryDatabase = {
      // Technology terms
      'react': 'A JavaScript library for building user interfaces with reusable components',
      'javascript': 'A programming language that enables interactive web functionality',
      'typescript': 'A typed superset of JavaScript that compiles to plain JavaScript',
      'frontend': 'The client-side part of web applications that users directly interact with',
      'backend': 'The server-side logic and infrastructure that powers web applications',
      'api': 'Application Programming Interface - a set of protocols for building software',
      'component': 'A reusable piece of code that encapsulates functionality and UI elements',
      'framework': 'A platform providing foundation and structure for developing applications',
      'database': 'An organized collection of structured information stored electronically',
      'server': 'A computer system that provides data and services to other computers',
      
      // Business terms
      'project': 'A temporary endeavor undertaken to create a unique product or service',
      'task': 'A specific piece of work required to be done as part of a larger project',
      'strategy': 'A plan of action designed to achieve long-term or overall goals',
      'implementation': 'The process of putting a decision or plan into execution',
      'requirement': 'A condition or capability needed by a user to solve a problem',
      'deadline': 'The latest time or date by which something should be completed',
      'milestone': 'A significant point or event in the progress of a project',
      
      // Development terms
      'algorithm': 'A step-by-step procedure for solving a problem or completing a task',
      'debugging': 'The process of finding and resolving defects in computer programs',
      'optimization': 'The process of making something as effective or functional as possible',
      'deployment': 'The process of installing and configuring applications in production',
      'testing': 'The process of evaluating software to ensure it meets requirements',
      'refactoring': 'The process of restructuring existing code without changing functionality'
    };
    
    // Extract terms that appear in the content
    Object.entries(glossaryDatabase).forEach(([term, definition]) => {
      if (textContent.includes(term)) {
        foundTerms.push({
          word: term.charAt(0).toUpperCase() + term.slice(1),
          definition: definition
        });
      }
    });
    
    // If no specific terms found, extract capitalized words as potential terms
    if (foundTerms.length === 0) {
      const capitalizedWords = content.match(/\b[A-Z][a-z]+\b/g) || [];
      const uniqueWords = [...new Set(capitalizedWords)].slice(0, 3);
      
      uniqueWords.forEach(word => {
        foundTerms.push({
          word: word,
          definition: `A key concept mentioned in this note that may require further explanation`
        });
      });
    }
    
    return foundTerms.slice(0, 4);
  };

  // Smart Multi-Provider AI API with Automatic Fallbacks
  const callAI = async (messages, maxTokens = 1500, taskType = 'summarization') => {
    const providers = Object.entries(AI_PROVIDERS)
      .filter(([name, config]) => {
        // OpenAI and Groq need valid API keys
        if ((name === 'openai' || name === 'groq') && (!config.key || config.key.length < 20)) {
          return false;
        }
        // Hugging Face and Cohere can work without keys (free tier)
        return config.enabled;
      })
      .sort((a, b) => a[1].priority - b[1].priority);
    
    console.log('🎯 Available providers for this request:', providers.map(([name]) => name).join(', '));
    
    if (providers.length === 0) {
      throw new Error('No valid AI providers available');
    }
    
    for (const [providerName, config] of providers) {
      try {
        console.log(`🤖 Trying ${providerName.toUpperCase()} API...`);
        
        switch (providerName) {
          case 'openai':
            return await callOpenAIProvider(messages, maxTokens, config);
          case 'huggingface':
            return await callHuggingFaceProvider(messages, maxTokens, config);
          case 'groq':
            return await callGroqProvider(messages, maxTokens, config);
          case 'cohere':
            return await callCohereProvider(messages, maxTokens, config);
          default:
            continue;
        }
      } catch (error) {
        console.warn(`❌ ${providerName.toUpperCase()} failed:`, error.message);
        
        // If quota exceeded or auth error, try next provider immediately
        if (error.message.includes('quota') || error.message.includes('429') || 
            error.message.includes('401') || error.message.includes('402')) {
          console.log(`⚠️ ${providerName.toUpperCase()} quota/auth issue, trying next provider...`);
          continue;
        }
        
        // For other errors, also continue to next provider
        continue;
      }
    }
    
    // If all AI providers fail, create an intelligent summary
    console.log('🔄 All AI providers failed, creating intelligent summary...');
    return createIntelligentSummary(messages[1]?.content || messages[0]?.content || '');
  };

  // OpenAI Provider
  const callOpenAIProvider = async (messages, maxTokens, config) => {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  };

  // Hugging Face Provider (Free)
  const callHuggingFaceProvider = async (messages, maxTokens, config) => {
    const text = messages[1]?.content || messages[0]?.content || '';
    
    // Clean and prepare text for summarization
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    if (cleanText.length < 50) {
      throw new Error('Text too short for Hugging Face summarization');
    }
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Add auth header if API key is available
    if (config.key && config.key !== 'free') {
      headers['Authorization'] = `Bearer ${config.key}`;
    }
    
    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        inputs: cleanText,
        parameters: {
          max_length: Math.min(maxTokens, 150),
          min_length: 20,
          do_sample: false,
          temperature: 0.3
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face Error ${response.status}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data[0]?.summary_text) {
      return data[0].summary_text;
    } else if (data.summary_text) {
      return data.summary_text;
    }
    
    throw new Error('Invalid Hugging Face response format');
  };

  // Groq Provider (Your backup)
  const callGroqProvider = async (messages, maxTokens, config) => {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  };

  // Cohere Provider (Free tier)
  const callCohereProvider = async (messages, maxTokens, config) => {
    const text = messages[1]?.content || messages[0]?.content || '';
    const cleanText = text.replace(/<[^>]*>/g, '').trim();
    
    if (cleanText.length < 100) {
      throw new Error('Text too short for Cohere summarization');
    }
    
    // Use Cohere's free trial endpoint
    const response = await fetch('https://api.cohere.ai/v1/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer DEMO_KEY', // Demo key for testing
      },
      body: JSON.stringify({
        text: cleanText.substring(0, 2000), // Cohere free tier limit
        length: maxTokens > 200 ? 'long' : 'medium',
        format: 'paragraph',
        model: 'summarize-medium',
        additional_command: 'Create a comprehensive summary covering main points.',
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cohere Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.summary || 'Summary generation failed';
  };

  // Simple, Effective AI Summarization - Following OpenAI Best Practices
  const generateSummary = useCallback(async (content, onProgressUpdate = null) => {
    try {
      // Clean text thoroughly but preserve ALL content
      let textContent = content
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[a-zA-Z0-9#]+;/g, '') // Remove HTML entities
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/\r?\n/g, ' ') // Replace line breaks with spaces
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      if (!textContent || textContent.length < 20) {
        console.log('❌ Text too short for summarization:', textContent.length);
        return '';
      }

      console.log('🚀 COMPREHENSIVE SUMMARIZATION STARTING...');
      console.log('📝 COMPLETE TEXT TO PROCESS:');
      console.log('Full text:', textContent);
      console.log('Text length:', textContent.length, 'characters');
      
      const wordCount = textContent.split(/\s+/).length;
      console.log('📊 Total word count:', wordCount);
      
      // Set generous token limits for comprehensive summaries
      let maxTokens = 300; // Generous default
      
      if (wordCount > 800) maxTokens = 500;      // Very long texts get very comprehensive summaries
      else if (wordCount > 500) maxTokens = 400; // Long texts get comprehensive summaries
      else if (wordCount > 300) maxTokens = 350; // Medium-long texts 
      else if (wordCount > 150) maxTokens = 250; // Medium texts
      else if (wordCount > 50) maxTokens = 200;  // Short texts
      else maxTokens = 150;

      console.log('🎯 Max tokens allocated:', maxTokens);

      // NEVER truncate - send complete text to AI for full processing
      console.log('📤 Sending ENTIRE TEXT to OpenAI (no truncation)');
      console.log('Final text being processed:', textContent.substring(0, 100) + '... [FULL TEXT SENT]');

      // Create comprehensive prompts that ensure complete text processing
      const systemPrompt = `You are an expert text analyst and summarizer. Your task is to read the ENTIRE text thoroughly and create comprehensive summaries that capture:
1. All main ideas and key points
2. Important events and chronological information  
3. Key people, places, and dates mentioned
4. Overall significance and context
5. The complete narrative from start to finish

IMPORTANT: Process the ENTIRE text provided, not just the beginning. Create summaries that demonstrate understanding of the complete content.`;

      let userPrompt = "";

      if (wordCount <= 100) {
        userPrompt = `Read this COMPLETE text thoroughly and summarize ALL the main points in 2-3 clear sentences:\n\n${textContent}`;
      } else if (wordCount <= 300) {
        userPrompt = `Analyze this ENTIRE passage carefully and create a comprehensive summary in 3-4 sentences. Make sure to include ALL key information, important details, and the complete story:\n\n${textContent}`;
      } else if (wordCount <= 500) {
        userPrompt = `Read through this COMPLETE text from beginning to end and provide a thorough summary in 4-5 sentences. Cover the main narrative, all key events, important details, people involved, and overall significance:\n\n${textContent}`;
      } else {
        userPrompt = `Carefully read this ENTIRE text and create a comprehensive summary in 5-7 sentences. Include background information, key events in chronological order, important people and places, achievements, and historical significance. Process the complete content from start to finish:\n\n${textContent}`;
      }

      console.log('📋 Prompt created for', wordCount, 'words');
      console.log('System prompt:', systemPrompt.substring(0, 100) + '...');
      console.log('User prompt length:', userPrompt.length);

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ];

      console.log('📡 Calling AI providers with', maxTokens, 'max tokens...');
      const enabledProviders = Object.entries(AI_PROVIDERS).filter(([_, config]) => config.enabled);
      console.log('🔑 Available providers:', enabledProviders.map(([name]) => name).join(', '));
      
      // Generate summary with streaming
      console.log('📤 About to call generateStreamingSummary with multi-provider fallbacks...');
      const aiSummary = await generateStreamingSummary(messages, maxTokens, onProgressUpdate);
      console.log('📥 Received AI summary:', aiSummary?.substring(0, 100) + '...');
      
      if (aiSummary && aiSummary.length > 5) {
        // Clean the response but preserve all content
        let cleanedSummary = aiSummary
          .replace(/^(Summary:|Here's a summary:|In summary:?|The summary is:?)\s*/i, '')
          .replace(/^(This text|The text|The passage|This passage)\s+(is about|describes|discusses|tells about)\s*/i, '')
          .replace(/^(Based on the text,?|According to the passage,?)\s*/i, '')
          .replace(/\s+/g, ' ') // Normalize internal spacing
          .trim();

        // Ensure first letter is capitalized
        if (cleanedSummary.length > 0) {
          cleanedSummary = cleanedSummary.charAt(0).toUpperCase() + cleanedSummary.slice(1);
        }
        
        // Validate summary quality - ensure it's comprehensive
        const summaryWordCount = cleanedSummary.split(/\s+/).length;
        const compressionRatio = summaryWordCount / wordCount;
        
        console.log('✅ COMPLETE SUMMARY ANALYSIS:');
        console.log('  📊 Original text:', wordCount, 'words,', textContent.length, 'characters');
        console.log('  📝 Generated summary:', summaryWordCount, 'words,', cleanedSummary.length, 'characters');
        console.log('  📈 Compression ratio:', (compressionRatio * 100).toFixed(1) + '%');
        console.log('  🎯 FULL SUMMARY:', cleanedSummary);
        
        // Ensure summary has reasonable length (not too short for long texts)
        if (wordCount > 100 && summaryWordCount < 10) {
          console.warn('⚠️ Summary seems too short for input length. Requesting more comprehensive summary...');
          throw new Error('Summary too brief - retry needed');
        }
        
        return cleanedSummary;
      }
      
      throw new Error('No valid summary generated');
      
    } catch (error) {
      console.error('❌ AI Summarization failed:', error);
      
      // All AI providers failed, use intelligent fallback
      console.error('❌ All AI providers failed, using intelligent fallback:', error);
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      return createIntelligentSummary(textContent);
    }
  }, []);

  // Check if summary is too similar to original (indicates copying rather than summarizing)
  const isSummaryTooSimilar = (summary, originalText) => {
    const summaryLower = summary.toLowerCase().replace(/[^\w\s]/g, '');
    const originalLower = originalText.toLowerCase().replace(/[^\w\s]/g, '');
    
    console.log('🔍 Checking similarity...');
    console.log('Summary:', summaryLower.substring(0, 100));
    console.log('Original:', originalLower.substring(0, 100));
    
    // Check for exact phrase matches (4+ words)
    const summaryWords = summaryLower.split(/\s+/);
    let exactMatches = 0;
    
    for (let i = 0; i < summaryWords.length - 3; i++) {
      const phrase = summaryWords.slice(i, i + 4).join(' ');
      if (originalLower.includes(phrase)) {
        exactMatches++;
        console.log('🚨 Found exact match:', phrase);
      }
    }
    
    // Check for HTML remnants or formatting issues
    if (summary.includes('<') || summary.includes('>') || summary.includes('&')) {
      console.log('🚨 HTML artifacts detected in summary');
      return true;
    }
    
    // If ANY 4-word sequences match exactly, it's copying
    const isCopying = exactMatches > 0;
    console.log('🔍 Exact matches found:', exactMatches, 'Is copying:', isCopying);
    
    return isCopying;
  };

  // Force a more aggressive summarization when first attempt fails
  const generateForcedSummary = async (textContent, wordCount) => {
    try {
      console.log('🎯 FORCING aggressive summarization...');
      
      const systemPrompt = `You are an expert who explains complex topics in simple terms. 

CRITICAL INSTRUCTION: You must write an ORIGINAL explanation using your own words. Imagine someone asks you "What was this text about?" - explain it naturally in your own way.

FORBIDDEN:
❌ Do NOT copy any sentences from the source
❌ Do NOT use the same phrases or word order
❌ Do NOT include HTML tags or brackets

REQUIRED:
✅ Explain the main points in your own words
✅ Use simple, everyday language
✅ Be very brief (maximum 2-3 sentences)
✅ Focus only on the most important information`;

      const userPrompt = `Someone asks you: "What is this text about?" Explain it briefly in your own natural words:

TEXT CONTENT:
${textContent.substring(0, 800)}

YOUR EXPLANATION (in your own words):`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const maxTokens = Math.min(120, Math.max(40, Math.ceil(wordCount * 0.15)));
      const forcedSummary = await callOpenAI(messages, 'summarization', maxTokens);
      
      console.log('🎯 Aggressive summary generated:', forcedSummary);
      return cleanupAISummary(forcedSummary);
      
    } catch (error) {
      console.error('Error in forced summarization:', error);
      return generateBasicExplanation(textContent);
    }
  };

  // Generate a basic explanation when all else fails
  const generateBasicExplanation = (textContent) => {
    console.log('📝 Generating basic fallback explanation...');
    
    // Extract key information manually
    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const firstSentence = sentences[0] ? sentences[0].trim() : '';
    
    // Try to identify key elements
    const dateMatch = textContent.match(/\b\d{4}\b/);
    const nameMatch = textContent.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/);
    
    let explanation = '';
    if (nameMatch && dateMatch) {
      explanation = `This text discusses ${nameMatch[0]} and events from ${dateMatch[0]}.`;
    } else if (firstSentence) {
      // Create a very simple rewrite of the first sentence
      explanation = `This discusses ${firstSentence.toLowerCase().substring(0, 100)}...`.replace(/\b\w+\b/g, (word, index) => {
        if (index < 20) return word; // Keep first few words for context
        // Simple word substitution
        if (word === 'was') return 'became';
        if (word === 'said') return 'stated';
        if (word === 'made') return 'created';
        return word;
      });
    } else {
      explanation = 'This text contains information about historical events and people.';
    }
    
    return explanation.length > 200 ? explanation.substring(0, 200) + '...' : explanation;
  };

  // Generate streaming AI summary with line-by-line animation using OpenAI
  const generateStreamingSummary = async (messages, maxTokens, onProgressUpdate) => {
    try {
      console.log('🤖 Starting AI streaming summary generation (multi-provider)...');
      
      // Call Multi-Provider AI API for complete response
      const fullSummary = await callAI(messages, maxTokens, 'summarization');
      
      if (!fullSummary) {
        throw new Error('No summary generated from AI providers');
      }

      // Check if response is actually a prompt (contains "Analyze this" or similar)
      if (fullSummary.includes('Analyze this') || fullSummary.includes('create a comprehensive summary') || 
          fullSummary.includes('Make sure to include') || fullSummary.length > 800) {
        console.log('🚨 Detected prompt response instead of summary, using fallback...');
        throw new Error('Received prompt instead of summary');
      }

      console.log('🤖 AI Summary Generated:', fullSummary.substring(0, 100) + '...');

      // If no progress callback, return immediately
      if (!onProgressUpdate) {
        return fullSummary;
      }

      // Break summary into sentences for streaming effect
      const sentences = fullSummary.match(/[^\.!?]+[\.!?]+/g) || [fullSummary];
      let streamedText = '';
      
      console.log(`🤖 Streaming ${sentences.length} sentences...`);
      
      // Initial progress update
      onProgressUpdate('');

      // Stream each sentence with realistic timing
      for (let i = 0; i < sentences.length; i++) {
        const sentence = sentences[i].trim();
        const words = sentence.split(' ');
        
        // Stream word by word within each sentence
        for (let j = 0; j < words.length; j++) {
          streamedText += (j === 0 ? '' : ' ') + words[j];
          
          // Update progress with current streamed text
          onProgressUpdate(streamedText);
          
          // Realistic typing delay (30-60ms per word for faster experience)
          const delay = Math.random() * 30 + 30;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Pause between sentences (150-300ms)
        if (i < sentences.length - 1) {
          const sentencePause = Math.random() * 150 + 150;
          await new Promise(resolve => setTimeout(resolve, sentencePause));
        }
      }

      console.log('🤖 Streaming complete!');
      return fullSummary;
      
    } catch (error) {
      console.error('Error in AI streaming summary:', error);
      console.log('🔄 Falling back to intelligent summary algorithm...');
      
      // Extract text from messages for fallback
      const originalText = messages[1]?.content || messages[0]?.content || '';
      const fallbackSummary = createIntelligentSummary(originalText);
      
      // If streaming is enabled, stream the fallback summary
      if (onProgressUpdate && fallbackSummary) {
        const words = fallbackSummary.split(' ');
        let streamedText = '';
        
        onProgressUpdate('');
        
        for (let i = 0; i < words.length; i++) {
          streamedText += (i === 0 ? '' : ' ') + words[i];
          onProgressUpdate(streamedText);
          await new Promise(resolve => setTimeout(resolve, 50)); // Slower for fallback
        }
      }
      
      return fallbackSummary || 'Unable to generate summary at this time.';
    }
  };

  // Advanced content analysis for better AI prompting
  const performAdvancedContentAnalysis = (text) => {
    const sentences = sentenceTokenize(text);
    const words = tokenizeWords(text);
    
    return {
      contentType: determineAdvancedContentType(text, sentences),
      complexity: calculateContentComplexity(words, sentences),
      entities: extractNamedEntities(text),
      themes: extractSemanticThemes(sentences),
      structure: analyzeTextStructure(sentences),
      keyPhrases: extractSignificantPhrases(text)
    };
  };

  // Enhanced content type detection
  const determineAdvancedContentType = (text, sentences) => {
    const indicators = {
      academic: /\b(research|study|analysis|methodology|conclusion|hypothesis)\b/gi,
      technical: /\b(implementation|algorithm|system|architecture|framework|API)\b/gi,
      business: /\b(strategy|market|revenue|customer|stakeholder|ROI)\b/gi,
      meeting: /\b(discussed|agreed|action item|next steps|decision|agenda)\b/gi,
      tutorial: /\b(step|follow|guide|instruction|procedure|example)\b/gi,
      news: /\b(reported|announced|sources|according to|yesterday|today)\b/gi
    };

    let maxScore = 0;
    let contentType = 'general';
    
    Object.entries(indicators).forEach(([type, regex]) => {
      const matches = text.match(regex) || [];
      if (matches.length > maxScore) {
        maxScore = matches.length;
        contentType = type;
      }
    });
    
    return contentType;
  };

  // Calculate content complexity for better AI handling
  const calculateContentComplexity = (words, sentences) => {
    const avgWordsPerSentence = words.length / sentences.length;
    const longWordRatio = words.filter(w => w.length > 6).length / words.length;
    const technicalTermRatio = words.filter(w => 
      /^[A-Z]{2,}$/.test(w) || w.includes('_') || w.length > 10
    ).length / words.length;
    
    const complexityScore = (avgWordsPerSentence / 15) + longWordRatio + technicalTermRatio;
    
    if (complexityScore > 0.8) return 'high';
    if (complexityScore > 0.4) return 'medium';
    return 'low';
  };

  // Extract named entities (people, places, organizations)
  const extractNamedEntities = (text) => {
    const entities = [];
    
    // Proper nouns (capitalized words)
    const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    
    // Organizations and companies
    const orgPattern = /\b[A-Z][a-z]+(?:\s+(?:Inc|Corp|LLC|Ltd|Company|Organization|University|Institute))\b/gi;
    const orgs = text.match(orgPattern) || [];
    
    // Technologies and brands
    const techPattern = /\b(?:React|JavaScript|Python|AWS|Google|Microsoft|Apple|GitHub|API|SQL|HTML|CSS)\b/gi;
    const tech = text.match(techPattern) || [];
    
    return [...new Set([...properNouns, ...orgs, ...tech])].slice(0, 10);
  };

  // Extract semantic themes using advanced NLP
  const extractSemanticThemes = (sentences) => {
    const themes = new Map();
    
    sentences.forEach(sentence => {
      const words = tokenizeWords(sentence);
      const concepts = words.filter(w => w.length > 4 && !isStopWord(w));
      
      concepts.forEach(concept => {
        themes.set(concept, (themes.get(concept) || 0) + 1);
      });
    });
    
    return Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([theme]) => theme);
  };

  // Analyze text structure for better summarization
  const analyzeTextStructure = (sentences) => {
    return {
      hasIntroduction: /\b(introduction|overview|begin|start)\b/i.test(sentences[0] || ''),
      hasConclusion: /\b(conclusion|summary|final|end|result)\b/i.test(sentences[sentences.length - 1] || ''),
      hasLists: sentences.some(s => /^\s*[-•*]|\d+\.\s/.test(s)),
      hasQuestions: sentences.some(s => s.includes('?')),
      paragraphCount: Math.ceil(sentences.length / 3)
    };
  };

  // Extract significant phrases using linguistic patterns
  const extractSignificantPhrases = (text) => {
    const phrases = [];
    
    // Noun phrases
    const nounPhrases = text.match(/\b(?:the\s+)?[A-Z][a-z]+(?:\s+[a-z]+){1,3}/g) || [];
    
    // Verb phrases indicating actions/outcomes
    const verbPhrases = text.match(/\b(?:will|can|should|must)\s+[a-z]+(?:\s+[a-z]+){1,2}/gi) || [];
    
    // Causal relationships
    const causalPhrases = text.match(/\b(?:because|due to|results in|leads to|causes)\s+[^.]{10,50}/gi) || [];
    
    return [...nounPhrases, ...verbPhrases, ...causalPhrases].slice(0, 5);
  };

  // Advanced extractive summarization as fallback
  const performExtractiveSummarization = (text, analysis) => {
    const sentences = sentenceTokenize(text);
    if (sentences.length <= 2) return sentences.join(' ');
    
    const scores = sentences.map((sentence, index) => {
      let score = 0;
      
      // Position score (beginning and end matter)
      if (index === 0) score += 0.3;
      if (index === sentences.length - 1) score += 0.2;
      
      // Entity score
      analysis.entities.forEach(entity => {
        if (sentence.toLowerCase().includes(entity.toLowerCase())) score += 0.1;
      });
      
      // Theme score
      analysis.themes.forEach(theme => {
        if (sentence.toLowerCase().includes(theme.toLowerCase())) score += 0.05;
      });
      
      // Length score (prefer medium length)
      const wordCount = sentence.split(/\s+/).length;
      if (wordCount >= 8 && wordCount <= 25) score += 0.1;
      
      // Significance indicators
      if (/\b(important|key|main|significant|critical|essential)\b/i.test(sentence)) score += 0.15;
      
      return { sentence, score, index };
    });
    
    const topSentences = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(3, Math.ceil(sentences.length * 0.3)))
      .sort((a, b) => a.index - b.index)
      .map(item => item.sentence);
    
    return topSentences.join(' ');
  };

  // Evaluate summary quality with advanced metrics
  const evaluateSummaryQuality = (summary, original, extractiveBase) => {
    const summaryWords = new Set(summary.toLowerCase().split(/\W+/));
    const originalWords = new Set(original.toLowerCase().split(/\W+/));
    const extractiveWords = new Set(extractiveBase.toLowerCase().split(/\W+/));
    
    // Check for direct copying (bad)
    const directOverlap = Array.from(summaryWords).filter(word => 
      originalWords.has(word) && word.length > 5
    ).length / summaryWords.size;
    
    // Check for information preservation (good)
    const informationPreserved = Array.from(extractiveWords).filter(word =>
      summaryWords.has(word) && word.length > 3
    ).length / extractiveWords.size;
    
    // Check for abstraction (good)
    const isAbstractive = summary.length < original.length * 0.5 && 
                         !original.toLowerCase().includes(summary.toLowerCase().substring(0, 30));
    
    const qualityScore = {
      directOverlap,
      informationPreserved,
      isAbstractive,
      isAcceptable: directOverlap < 0.6 && informationPreserved > 0.3 && isAbstractive
    };
    
    return qualityScore;
  };

  // Advanced AI Tag Generation with Intelligent Categorization
  const generateTags = useCallback(async (content) => {
    try {
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      if (!textContent || textContent.length < 15) return [];

      // Pre-analyze content for better tagging
      const tagAnalysis = analyzeContentForTags(textContent);
      
      const systemPrompt = `You are an expert content taxonomist specializing in intelligent tag generation. Create precise, actionable tags that help organize and categorize content effectively.

🏷️ TAG GENERATION RULES:
• Generate 4-6 specific, relevant tags
• Include content type, main topics, and key themes
• Use professional terminology when appropriate
• Make tags discoverable and searchable
• Avoid generic terms, be specific
• Consider the content's purpose and audience

📋 CONTENT INSIGHTS:
Length: ${tagAnalysis.wordCount} words
Type: ${tagAnalysis.contentType}
Domain: ${tagAnalysis.domain}
Topics Detected: ${tagAnalysis.topics.slice(0, 5).join(', ')}

Return ONLY the tags as a clean, comma-separated list. No explanations or additional text.`;

      const userPrompt = `Generate intelligent tags for this content:\n\n"${textContent.substring(0, 1000)}${textContent.length > 1000 ? '...' : ''}"\n\nTags:`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await callOpenAI(messages, 'tagging', 120);
      
      // Parse and clean tags
      const tags = response
        .split(/[,;\n]/) // Split by comma, semicolon, or newline
        .map(tag => tag.trim().toLowerCase())
        .map(tag => tag.replace(/^(\d+\.|[-•*#]|tag:)\s*/i, '')) // Remove prefixes
        .map(tag => tag.replace(/["'\[\](){}]/g, '')) // Remove quotes and brackets
        .filter(tag => tag && tag.length >= 2 && tag.length <= 25) // Filter valid lengths
        .filter(tag => !tag.match(/^(the|and|or|but|in|on|at|to|for|of|with|by)$/)) // Remove stop words
        .slice(0, 6); // Limit to 6 tags

      return tags.length > 0 ? tags : generateFallbackTags(textContent);
      
    } catch (error) {
      console.error('Error generating AI tags:', error);
      return generateFallbackTags(content);
    }
  }, []);

  // Generate intelligent glossary terms  
  const generateGlossaryTerms = useCallback(async (content) => {
    try {
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      if (!textContent || textContent.length < 50) return [];

      const messages = [
        {
          role: 'system',
          content: 'You are an expert glossary creator. Find 2-4 important technical terms, concepts, or specialized words from the text that would benefit from definitions. Return ONLY a valid JSON array with objects containing "word" and "definition" properties. Each definition should be concise (under 50 words).'
        },
        {
          role: 'user',
          content: `Extract key terms needing definitions from:\n\n${textContent}`
        }
      ];

      const response = await callOpenAI(messages, 'summarization', 400);
      
      try {
        const parsed = JSON.parse(response);
        return Array.isArray(parsed) ? parsed : [];
      } catch (parseError) {
        // Fallback: extract terms from plain text response
        const lines = response.split('\n').filter(line => line.includes(':'));
        return lines.slice(0, 5).map(line => {
          const [word, ...defParts] = line.split(':');
          return {
            word: word.trim().replace(/[^a-zA-Z\s]/g, ''),
            definition: defParts.join(':').trim()
          };
        }).filter(item => item.word && item.definition);
      }
    } catch (error) {
      console.error('Error generating glossary terms:', error);
      return [];
    }
  }, []);

  // Professional Grammar & Style Analysis with AI
  const checkGrammar = useCallback(async (content) => {
    try {
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      if (!textContent || textContent.length < 10) return [];

      const grammarAnalysis = analyzeTextForGrammar(textContent);
      
      const systemPrompt = `You are an expert writing coach and grammar specialist. Perform a comprehensive analysis of the text for:

📝 ANALYSIS AREAS:
• Grammar errors and syntax issues
• Spelling and punctuation mistakes
• Clarity and readability problems
• Style and flow improvements
• Tone and consistency issues
• Word choice and vocabulary enhancement

🎯 RESPONSE FORMAT:
Return a valid JSON array. Each issue should be an object with:
- "type": Category of issue (Grammar, Spelling, Style, Clarity, etc.)
- "message": Clear description of the problem
- "suggestion": Specific recommendation for improvement

If the text is perfect, return an empty array: []

📊 TEXT METRICS:
Sentences: ${grammarAnalysis.sentenceCount}
Complexity: ${grammarAnalysis.complexity}
Readability: ${grammarAnalysis.readability}`;

      const userPrompt = `Analyze this text for grammar, style, and clarity issues:\n\n"${textContent}"\n\nProvide detailed feedback in JSON format:`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await callOpenAI(messages, 'grammar', 500);
      
      // Parse JSON response
      let issues = [];
      try {
        // Clean the response to ensure valid JSON
        const cleanedResponse = response
          .replace(/^[^\[]*\[/, '[') // Remove text before first [
          .replace(/\][^\]]*$/, ']') // Remove text after last ]
          .trim();
          
        issues = JSON.parse(cleanedResponse);
        
        if (!Array.isArray(issues)) {
          throw new Error('Response is not an array');
        }
        
        // Validate and clean each issue
        issues = issues
          .filter(issue => issue && typeof issue === 'object')
          .map(issue => ({
            type: String(issue.type || 'Writing Issue'),
            message: String(issue.message || issue.description || 'Issue detected'),
            suggestion: String(issue.suggestion || issue.fix || '')
          }))
          .slice(0, 5); // Limit to 5 issues
          
      } catch (parseError) {
        console.log('Grammar JSON parse failed, extracting from text');
        
        // Fallback: extract issues from text response
        if (response.toLowerCase().includes('no issues') || 
            response.toLowerCase().includes('no errors') ||
            response.toLowerCase().includes('looks good')) {
          return [];
        }
        
        issues = parseGrammarFromText(response);
      }
      
      return issues;
      
    } catch (error) {
      console.error('Error in grammar analysis:', error);
      return [];
    }
  }, []);

  // Professional AI Translation with Cultural Context
  const translateText = useCallback(async (content, targetLanguage) => {
    try {
      const textContent = content.replace(/<[^>]*>/g, '').trim();
      if (!textContent) return '';

      const languageConfig = {
        es: { name: 'Spanish', region: 'Latin America', formal: true },
        fr: { name: 'French', region: 'France', formal: true },
        de: { name: 'German', region: 'Germany', formal: true },
        it: { name: 'Italian', region: 'Italy', formal: true },
        pt: { name: 'Portuguese', region: 'Brazil', formal: false },
        hi: { name: 'Hindi', region: 'India', formal: true },
        zh: { name: 'Chinese (Simplified)', region: 'China', formal: true },
        ja: { name: 'Japanese', region: 'Japan', formal: true },
        ko: { name: 'Korean', region: 'South Korea', formal: true },
        ar: { name: 'Arabic', region: 'Middle East', formal: true },
        ru: { name: 'Russian', region: 'Russia', formal: true }
      };

      const config = languageConfig[targetLanguage] || { name: targetLanguage, formal: true };
      const translationAnalysis = analyzeContentForTranslation(textContent);
      
      const systemPrompt = `You are a professional translator with expertise in ${config.name} language and culture. Provide accurate, culturally appropriate translations that:

🌐 TRANSLATION OBJECTIVES:
• Maintain original meaning and context
• Preserve tone and style (${translationAnalysis.tone})
• Use culturally appropriate expressions
• Apply proper formality level (${config.formal ? 'formal' : 'casual'})
• Ensure grammatical accuracy
• Consider regional preferences (${config.region})

📋 CONTENT ANALYSIS:
Type: ${translationAnalysis.type}
Complexity: ${translationAnalysis.complexity}
Special Terms: ${translationAnalysis.specialTerms.length > 0 ? translationAnalysis.specialTerms.join(', ') : 'None'}

Provide ONLY the translation, no additional text or explanations.`;

      const userPrompt = `Translate this text to ${config.name}:\n\n"${textContent}"\n\nTranslation:`;

      const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const maxTokens = Math.min(1200, Math.max(200, textContent.split(/\s+/).length * 2));
      const translation = await callOpenAI(messages, 'translation', maxTokens);
      
      // Clean and validate translation
      const cleanedTranslation = translation
        .replace(/^(Translation:|Here's the translation:|In ${config.name}:)/i, '')
        .replace(/^["'`]|["'`]$/g, '') // Remove surrounding quotes
        .trim();
      
      return cleanedTranslation || 'Translation unavailable';
      
    } catch (error) {
      console.error('Error in AI translation:', error);
      return 'Translation failed. Please try again.';
    }
  }, []);

  // Clear all AI features
  const clearAIFeatures = useCallback(() => {
    setAiFeatures({
      summary: null,
      tags: null,
      glossaryTerms: null,
      grammarIssues: null,
      translation: {}
    });
  }, []);

  // Manual AI processing function - only called when user clicks button
  const processNoteWithAI = useCallback(async (content, featureType = 'all') => {
    console.log('🚀 processNoteWithAI called with:', { featureType, contentLength: content?.length });
    
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    
    console.log(`🤖 AI ${featureType} processing started for`, textContent.length, 'characters');
    
    if (textContent.length < 10) {
      console.log('🤖 Content too short, minimum 10 characters required');
      return false;
    }

    setIsLoading(true);
    console.log('🤖 Loading state set to true');
    
    try {
      // Validate content first
      if (!content || typeof content !== 'string') {
        console.log('🤖 Invalid content provided');
        setIsLoading(false);
        return false;
      }

      // Limit processing for very large content
      const processableContent = content.length > 5000 ? content.substring(0, 5000) + '...' : content;
      
      // Check if any AI provider is available
      const hasAvailableProvider = Object.entries(AI_PROVIDERS).some(([name, provider]) => {
        if ((name === 'openai' || name === 'groq') && (!provider.key || provider.key.length < 20)) {
          return false;
        }
        return provider.enabled;
      });
      console.log('🤖 Available provider check:', hasAvailableProvider);
      
      if (hasAvailableProvider) {
        console.log('🤖 Processing with Multi-Provider AI system');
        
        // Process specific feature or all features
        if (featureType === 'summary' || featureType === 'all') {
          try {
            setIsStreaming(true);
            setStreamingText('');
            
            const onProgressUpdate = (text) => {
              setStreamingText(text);
            };
            
            const summary = await generateSummary(processableContent, onProgressUpdate);
            
            if (summary && summary.length > 0) {
              setAiFeatures(prev => ({ ...prev, summary }));
            }
          } catch (error) {
            console.error('Summary generation failed:', error);
          } finally {
            setIsStreaming(false);
          }
        }
        
        if (featureType === 'tags' || featureType === 'all') {
          try {
            const tags = await generateTags(processableContent);
            if (Array.isArray(tags) && tags.length > 0) {
              setAiFeatures(prev => ({ ...prev, tags }));
            }
          } catch (error) {
            console.error('Tag generation failed:', error);
          }
        }
        
        if (featureType === 'glossary' || featureType === 'all') {
          try {
            const glossaryTerms = await generateGlossaryTerms(processableContent);
            if (Array.isArray(glossaryTerms) && glossaryTerms.length > 0) {
              setAiFeatures(prev => ({ ...prev, glossaryTerms }));
            }
          } catch (error) {
            console.error('Glossary generation failed:', error);
          }
        }
        
        if (featureType === 'grammar' || featureType === 'all') {
          try {
            const grammarIssues = await checkGrammar(processableContent);
            if (Array.isArray(grammarIssues)) {
              setAiFeatures(prev => ({ ...prev, grammarIssues }));
            }
          } catch (error) {
            console.error('Grammar check failed:', error);
          }
        }
        
        console.log('🤖 AI Processing completed successfully');
        return true;
        
      } else {
        console.error('🤖 No AI providers available');
        setAiFeatures(prev => ({ 
          ...prev, 
          summary: 'No AI services are currently available. Please check your API key configuration or try again later.' 
        }));
        return false;
      }
      
    } catch (error) {
      console.error('🤖 Critical AI Processing error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [generateSummary, generateTags, generateGlossaryTerms, checkGrammar]);

  // Check if content is valid for processing
  const isContentValid = useCallback((content) => {
    if (!content) return false;
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length >= 10;
  }, []);

  // Get glossary terms for highlighting
  const getGlossaryTerms = useCallback(() => {
    return aiFeatures.glossaryTerms || [];
  }, [aiFeatures.glossaryTerms]);

  // Enhanced helper functions for AI processing
  
  // Preprocess content for better summarization
  const preprocessForSummarization = (text) => {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Fix sentence spacing
      .replace(/\b(um|uh|like|you know|well|basically)\b/gi, '') // Remove filler words
      .replace(/(.)\1{3,}/g, '$1$1') // Reduce repeated characters
      .trim();
  };

  // Analyze content for summarization insights
  const analyzeContentForSummarization = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    
    // Content type detection
    const typeIndicators = {
      technical: /\b(code|function|api|database|algorithm|framework|implementation)\b/gi,
      business: /\b(strategy|market|revenue|customer|stakeholder|meeting|project)\b/gi,
      academic: /\b(research|study|analysis|theory|hypothesis|conclusion|methodology)\b/gi,
      personal: /\b(think|feel|believe|opinion|experience|remember|note)\b/gi,
      tutorial: /\b(step|guide|how|instruction|procedure|example|tutorial)\b/gi
    };

    let contentType = 'general';
    let maxMatches = 0;
    
    Object.entries(typeIndicators).forEach(([type, regex]) => {
      const matches = (text.match(regex) || []).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        contentType = type;
      }
    });

    // Extract key topics
    const keyTopics = extractKeyTopics(text).slice(0, 5);

    // Determine tone
    const toneIndicators = {
      formal: /\b(therefore|furthermore|consequently|moreover|however)\b/gi,
      casual: /\b(gonna|wanna|yeah|cool|awesome|pretty)\b/gi,
      technical: /\b(configure|implement|optimize|debug|deploy)\b/gi,
      urgent: /\b(urgent|asap|immediately|critical|emergency)\b/gi
    };

    let tone = 'neutral';
    let maxToneMatches = 0;
    
    Object.entries(toneIndicators).forEach(([toneType, regex]) => {
      const matches = (text.match(regex) || []).length;
      if (matches > maxToneMatches) {
        maxToneMatches = matches;
        tone = toneType;
      }
    });

    return {
      type: contentType,
      complexity: calculateTextComplexity(words, sentences),
      keyTopics,
      tone,
      sentenceCount: sentences.length,
      wordCount: words.length
    };
  };

  // Calculate text complexity
  const calculateTextComplexity = (words, sentences) => {
    const avgWordsPerSentence = words.length / sentences.length;
    const longWordRatio = words.filter(w => w.length > 7).length / words.length;
    const technicalTermRatio = words.filter(w => 
      w.match(/^[A-Z]+$/) || w.includes('_') || w.length > 12
    ).length / words.length;
    
    const complexityScore = (avgWordsPerSentence / 20) + longWordRatio + (technicalTermRatio * 2);
    
    if (complexityScore > 0.7) return 'high';
    if (complexityScore > 0.4) return 'medium';
    return 'low';
  };

  // Clean up AI-generated summary aggressively
  const cleanupAISummary = (summary) => {
    return summary
      .replace(/^(here's|here is|this is|the text|summary:|in summary|the summary is)/i, '')
      .replace(/^(the content|this content|the document|this document|this passage|this article)/i, '')
      .replace(/^(based on the text|according to the text|from the text)/i, '')
      .replace(/\s*\([^)]*\)\s*/g, ' ') // Remove parenthetical content
      .replace(/\s*\[[^\]]*\]\s*/g, ' ') // Remove bracketed content  
      .replace(/<[^>]*>/g, '') // Remove any HTML tags
      .replace(/&[a-zA-Z]+;/g, '') // Remove HTML entities
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => p1 + ' ' + p2.toUpperCase()) // Fix capitalization
      .replace(/^\s*[""''`]/g, '') // Remove leading quotes
      .replace(/[""''`]\s*$/g, '') // Remove trailing quotes
      .trim();
  };

  // Validate summary quality
  const validateSummaryQuality = (summary, originalText) => {
    if (!summary || summary.length < 10) return false;
    
    // Check if it's too similar to original (poor abstraction)
    const summaryWords = new Set(summary.toLowerCase().split(/\W+/));
    const originalWords = new Set(originalText.toLowerCase().split(/\W+/));
    const overlap = Array.from(summaryWords).filter(word => 
      originalWords.has(word) && word.length > 5
    ).length;
    
    const overlapRatio = overlap / summaryWords.size;
    
    // Good summary should have moderate overlap (not too high or too low)
    return overlapRatio > 0.2 && overlapRatio < 0.8 && summary.length < originalText.length * 0.6;
  };

  // Generate extractive summary as fallback
  const generateExtractiveSummary = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length <= 2) return sentences.join('. ') + '.';
    
    // Score sentences based on position and content
    const scoredSentences = sentences.map((sentence, index) => {
      let score = 0;
      
      // Position score (beginning and end are important)
      if (index === 0) score += 0.3;
      if (index === sentences.length - 1) score += 0.2;
      
      // Length score (prefer medium-length sentences)
      const wordCount = sentence.split(/\s+/).length;
      if (wordCount >= 8 && wordCount <= 25) score += 0.2;
      
      // Keyword score
      const keywords = ['important', 'key', 'main', 'significant', 'essential', 'critical'];
      keywords.forEach(keyword => {
        if (sentence.toLowerCase().includes(keyword)) score += 0.1;
      });
      
      return { sentence: sentence.trim(), score, index };
    });
    
    // Select top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(3, Math.ceil(sentences.length * 0.4)))
      .sort((a, b) => a.index - b.index)
      .map(item => item.sentence);
    
    return topSentences.join('. ') + '.';
  };

  // Analyze content for intelligent tagging
  const analyzeContentForTags = (text) => {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const wordCount = words.length;
    
    // Detect content domain
    const domainIndicators = {
      technology: /\b(code|programming|software|app|web|api|database|server|framework|javascript|react|python|java|css|html)\b/gi,
      business: /\b(meeting|project|strategy|client|revenue|market|sales|customer|budget|plan|goal|objective)\b/gi,
      design: /\b(ui|ux|interface|layout|color|font|design|wireframe|mockup|prototype|visual|graphic)\b/gi,
      education: /\b(learn|study|course|lesson|tutorial|guide|education|training|knowledge|skill)\b/gi,
      personal: /\b(personal|diary|journal|thought|idea|reflection|reminder|note|memory|experience)\b/gi,
      research: /\b(research|analysis|data|study|report|findings|results|conclusion|hypothesis|methodology)\b/gi
    };

    let domain = 'general';
    let maxMatches = 0;
    
    Object.entries(domainIndicators).forEach(([domainType, regex]) => {
      const matches = (text.match(regex) || []).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        domain = domainType;
      }
    });

    // Detect content type
    let contentType = 'note';
    if (text.includes('todo') || text.includes('task')) contentType = 'task';
    else if (text.includes('meeting') || text.includes('discussion')) contentType = 'meeting';
    else if (text.includes('idea') || text.includes('brainstorm')) contentType = 'idea';
    else if (text.includes('bug') || text.includes('error')) contentType = 'debug';
    else if (text.includes('plan') || text.includes('strategy')) contentType = 'planning';

    // Extract meaningful topics
    const topics = extractMeaningfulTopics(text);

    return {
      wordCount,
      contentType,
      domain,
      topics
    };
  };

  // Extract meaningful topics for tagging
  const extractMeaningfulTopics = (text) => {
    // Extract capitalized words (proper nouns, technologies, etc.)
    const capitalizedWords = (text.match(/\b[A-Z][a-z]+\b/g) || [])
      .filter(word => word.length > 3 && !['This', 'That', 'Then', 'When', 'Where'].includes(word));

    // Extract technical terms
    const technicalTerms = (text.match(/\b[a-zA-Z]+[A-Z][a-zA-Z]*\b/g) || []) // camelCase
      .concat(text.match(/\b[a-z]+[-_][a-z]+\b/gi) || []); // kebab-case, snake_case

    // Extract quoted terms
    const quotedTerms = (text.match(/"([^"]+)"/g) || [])
      .map(term => term.replace(/"/g, ''));

    // Extract frequent meaningful words
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    const wordFreq = {};
    words.forEach(word => {
      if (!isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    const frequentWords = Object.entries(wordFreq)
      .filter(([word, freq]) => freq > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word]) => word);

    return [...new Set([...capitalizedWords, ...technicalTerms, ...quotedTerms, ...frequentWords])]
      .slice(0, 10);
  };

  // Generate fallback tags when AI fails
  const generateFallbackTags = (text) => {
    const analysis = analyzeContentForTags(text);
    const tags = [];

    // Add domain tag
    if (analysis.domain !== 'general') {
      tags.push(analysis.domain);
    }

    // Add content type tag
    tags.push(analysis.contentType);

    // Add topic-based tags
    tags.push(...analysis.topics.slice(0, 3));

    // Add contextual tags
    if (text.includes('important') || text.includes('urgent')) tags.push('important');
    if (text.includes('todo') || text.includes('task')) tags.push('todo');
    if (text.includes('?')) tags.push('question');
    if (text.length > 500) tags.push('detailed');

    return [...new Set(tags)].slice(0, 5);
  };

  // Analyze text for grammar checking
  const analyzeTextForGrammar = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    const avgWordsPerSentence = words.length / sentences.length;
    const longSentenceCount = sentences.filter(s => s.split(/\s+/).length > 25).length;
    
    let complexity = 'low';
    if (avgWordsPerSentence > 20 || longSentenceCount > sentences.length * 0.3) {
      complexity = 'high';
    } else if (avgWordsPerSentence > 12) {
      complexity = 'medium';
    }

    let readability = 'good';
    if (complexity === 'high') readability = 'complex';
    else if (avgWordsPerSentence < 8) readability = 'simple';

    return {
      sentenceCount: sentences.length,
      wordCount: words.length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence),
      complexity,
      readability
    };
  };

  // Parse grammar issues from text response
  const parseGrammarFromText = (response) => {
    const lines = response.split('\n').filter(line => line.trim());
    const issues = [];

    lines.forEach(line => {
      // Look for patterns indicating grammar issues
      if (line.match(/\b(error|mistake|issue|problem|incorrect|wrong)\b/i)) {
        let type = 'Grammar Issue';
        if (line.match(/\b(spell|spelling)\b/i)) type = 'Spelling';
        else if (line.match(/\b(punct|punctuation)\b/i)) type = 'Punctuation';
        else if (line.match(/\b(style|clarity|clear)\b/i)) type = 'Style';

        issues.push({
          type,
          message: line.replace(/^\d+\.|^[-•*]/, '').trim(),
          suggestion: ''
        });
      }
    });

    return issues.slice(0, 5);
  };

  // Analyze content for translation
  const analyzeContentForTranslation = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
    const words = text.split(/\s+/).filter(w => w.length > 0);

    // Detect tone
    let tone = 'neutral';
    if (text.match(/\b(please|thank you|kindly|appreciate|grateful)\b/gi)) tone = 'polite';
    else if (text.match(/\b(urgent|asap|immediately|critical|important)\b/gi)) tone = 'urgent';
    else if (text.match(/\b(awesome|cool|great|amazing|fantastic)\b/gi)) tone = 'casual';
    else if (text.match(/\b(therefore|furthermore|consequently|moreover)\b/gi)) tone = 'formal';

    // Detect special terms (technical, proper nouns, etc.)
    const specialTerms = [
      ...(text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []), // Proper nouns
      ...(text.match(/\b[a-zA-Z]+[A-Z][a-zA-Z]*\b/g) || []), // camelCase
      ...(text.match(/\b[A-Z]{2,}\b/g) || []) // Acronyms
    ];

    // Determine content type
    let type = 'general';
    if (text.match(/\b(code|function|api|programming)\b/gi)) type = 'technical';
    else if (text.match(/\b(meeting|project|business|strategy)\b/gi)) type = 'business';
    else if (text.match(/\b(personal|diary|thought|feeling)\b/gi)) type = 'personal';

    return {
      type,
      tone,
      complexity: sentences.length > 5 && words.length > 100 ? 'high' : words.length > 30 ? 'medium' : 'low',
      specialTerms: [...new Set(specialTerms)].slice(0, 5)
    };
  };

  // Translate current note with enhanced processing
  const translateNote = useCallback(async (content, targetLanguage) => {
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your-groq-api-key-here') {
      console.warn('Groq API key not configured');
      return;
    }

    try {
      setIsLoading(true);
      const translation = await translateText(content, targetLanguage);
      
      setAiFeatures(prev => ({
        ...prev,
        translation: {
          ...prev.translation,
          [targetLanguage]: translation
        }
      }));
    } catch (error) {
      console.error('Error translating note:', error);
    } finally {
      setIsLoading(false);
    }
  }, [translateText]);

  return {
    aiFeatures,
    isLoading,
    processNoteWithAI,
    clearAIFeatures,
    isContentValid,
    getGlossaryTerms,
    translateNote,
    generateSummary,
    generateTags,
    generateGlossaryTerms,
    checkGrammar,
    translateText,
    streamingText,
    isStreaming,
    setStreamingText,
    setIsStreaming
  };
};