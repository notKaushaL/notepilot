// Simple and Reliable Translation Service - Works everywhere
class TranslationService {
  constructor() {
    // Reliable free translation providers that actually work
    this.providers = {
      mymemory: {
        name: 'MyMemory Translation',
        priority: 1,
        confidence: 0.85,
        url: 'https://api.mymemory.translated.net/get'
      },
      googleWeb: {
        name: 'Google Translate',
        priority: 2,
        confidence: 0.90,
        url: 'https://translate.googleapis.com/translate_a/single'
      }
    };
    
    this.cache = new Map();
    this.supportedLanguages = this.getSupportedLanguages();
    this.lastRequestTime = 0;
    this.rateLimitDelay = 500; // 500ms between requests
  }

  // Get supported languages
  getSupportedLanguages() {
    return {
      'auto': 'Auto-detect',
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French', 
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese (Simplified)',
      'zh-tw': 'Chinese (Traditional)',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'bn': 'Bengali',
      'ur': 'Urdu',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'pl': 'Polish',
      'cs': 'Czech',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'hr': 'Croatian',
      'sk': 'Slovak',
      'sl': 'Slovenian',
      'et': 'Estonian',
      'lv': 'Latvian',
      'lt': 'Lithuanian',
      'mt': 'Maltese',
      'el': 'Greek',
      'tr': 'Turkish',
      'he': 'Hebrew',
      'fa': 'Persian',
      'id': 'Indonesian',
      'ms': 'Malay',
      'tl': 'Filipino',
    };
  }

  // Advanced language detection
  async detectLanguage(text) {
    if (!text || text.length < 10) {
      return 'en'; // Default to English for short texts
    }

    const cleanText = text.replace(/[^\w\s]/g, ' ').trim();

    try {
      // Use franc for statistical language detection
      const { franc } = await import('franc');
      const detectedLang = franc(cleanText);
      
      // Map franc codes to our language codes
      const francToLangMap = {
        'eng': 'en', 'spa': 'es', 'fra': 'fr', 'deu': 'de', 'ita': 'it',
        'por': 'pt', 'rus': 'ru', 'jpn': 'ja', 'kor': 'ko', 'cmn': 'zh',
        'ara': 'ar', 'hin': 'hi', 'ben': 'bn', 'urd': 'ur', 'tha': 'th',
        'vie': 'vi', 'nld': 'nl', 'swe': 'sv', 'dan': 'da', 'nor': 'no',
        'fin': 'fi', 'pol': 'pl', 'ces': 'cs', 'hun': 'hu', 'ron': 'ro',
        'bul': 'bg', 'hrv': 'hr', 'slk': 'sk', 'slv': 'sl', 'est': 'et',
        'lav': 'lv', 'lit': 'lt', 'mlt': 'mt', 'ell': 'el', 'tur': 'tr',
        'heb': 'he', 'fas': 'fa', 'ind': 'id', 'msa': 'ms', 'fil': 'tl'
      };

      if (detectedLang && francToLangMap[detectedLang]) {
        console.log(`🎯 Franc detected language: ${francToLangMap[detectedLang]}`);
        return francToLangMap[detectedLang];
      }
    } catch (error) {
      console.warn('Franc language detection failed:', error);
    }

    // Fallback: Character-based pattern detection
    const patterns = {
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/,
      'ar': /[\u0600-\u06ff]/,
      'hi': /[\u0900-\u097f]/,
      'th': /[\u0e00-\u0e7f]/,
      'ru': /[\u0400-\u04ff]/,
      'el': /[\u0370-\u03ff]/,
      'he': /[\u0590-\u05ff]/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        console.log(`🔍 Pattern detected language: ${lang}`);
        return lang;
      }
    }

    // Advanced heuristic: Common word detection
    const commonWords = {
      'en': ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but'],
      'es': ['que', 'de', 'no', 'la', 'el', 'en', 'es', 'se', 'le', 'da'],
      'fr': ['que', 'de', 'je', 'est', 'pas', 'le', 'vous', 'la', 'tu', 'il'],
      'de': ['und', 'der', 'die', 'ich', 'das', 'ist', 'du', 'nicht', 'ein', 'zu'],
      'it': ['che', 'di', 'da', 'un', 'il', 'per', 'non', 'in', 'la', 'si'],
      'pt': ['que', 'de', 'não', 'do', 'da', 'em', 'um', 'para', 'com', 'se'],
      'ru': ['не', 'на', 'что', 'то', 'как', 'так', 'но', 'да', 'ты', 'от']
    };

    const words = cleanText.toLowerCase().split(/\s+/).slice(0, 50);
    let bestLang = 'en';
    let bestScore = 0;

    for (const [lang, commonList] of Object.entries(commonWords)) {
      const score = words.filter(word => commonList.includes(word)).length;
      if (score > bestScore) {
        bestScore = score;
        bestLang = lang;
      }
    }

    if (bestScore > 0) {
      console.log(`📝 Word pattern detected language: ${bestLang} (score: ${bestScore})`);
      return bestLang;
    }

    console.log('🔤 Defaulting to English');
    return 'en'; // Final fallback
  }

  // Calculate text similarity
  calculateSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  // Main translation function with intelligent provider selection
  async translateText(text, targetLang, sourceLang = 'auto') {
    if (!text || text.trim().length === 0) {
      throw new Error('No text to translate');
    }

    if (!this.supportedLanguages[targetLang]) {
      throw new Error(`Unsupported target language: ${targetLang}`);
    }

    // Clean text: Remove HTML tags and extra whitespace
    const cleanText = text
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();

    if (!cleanText || cleanText.length === 0) {
      throw new Error('No translatable text found after cleaning HTML');
    }

    // Check cache first
    const cacheKey = `${cleanText.substring(0, 100)}-${sourceLang}-${targetLang}`;
    if (this.cache.has(cacheKey)) {
      console.log('📋 Using cached translation');
      return this.cache.get(cacheKey);
    }

    // Auto-detect source language if needed
    if (sourceLang === 'auto') {
      sourceLang = await this.detectLanguage(cleanText);
      console.log(`🔍 Detected source language: ${sourceLang}`);
    }

    // If source and target are the same, return original clean text
    if (sourceLang === targetLang) {
      return {
        translatedText: cleanText,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        provider: 'No Translation Needed',
        confidence: 1.0
      };
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastRequestTime < this.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
    }
    this.lastRequestTime = now;

    // All providers are free and available
    const availableProviders = Object.entries(this.providers)
      .sort((a, b) => a[1].priority - b[1].priority);

    console.log(`🌐 Available providers: ${availableProviders.map(([name]) => name).join(', ')}`);

    // Try translation providers in order of priority
    for (const [providerName, provider] of availableProviders) {
      try {
        console.log(`🔄 Trying ${provider.name}...`);
        const result = await this.translateWithProvider(cleanText, sourceLang, targetLang, providerName);
        
        if (result && result.translatedText && result.translatedText.trim() !== cleanText.trim()) {
          // Ensure no HTML tags in the result
          result.translatedText = result.translatedText.replace(/<[^>]*>/g, '').trim();
          
          // Cache successful translation
          result.timestamp = new Date().toISOString();
          this.cache.set(cacheKey, result);
          
          // Limit cache size to prevent memory issues
          if (this.cache.size > 50) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
          }
          
          console.log(`✅ ${provider.name} translation successful (${result.confidence * 100}% confidence)`);
          return result;
        }
      } catch (error) {
        console.warn(`❌ ${provider.name} failed:`, error.message);
        continue;
      }
    }

    // Final fallback: Try Vercel API route (works on deployment)
    try {
      console.log('🔄 Trying Vercel API fallback...');
      const result = await this.translateWithVercelAPI(cleanText, sourceLang, targetLang);
      if (result && result.translatedText && result.translatedText.trim() !== cleanText.trim()) {
        // Ensure no HTML tags in the result
        result.translatedText = result.translatedText.replace(/<[^>]*>/g, '').trim();
        result.timestamp = new Date().toISOString();
        this.cache.set(cacheKey, result);
        console.log('✅ Vercel API translation successful');
        return result;
      }
    } catch (error) {
      console.warn('❌ Vercel API fallback failed:', error.message);
    }

    throw new Error('All translation providers failed. Please check your internet connection.');
  }

  // Translate using specific provider
  async translateWithProvider(text, sourceLang, targetLang, providerName) {
    switch (providerName) {
      case 'mymemory':
        return await this.translateWithMyMemory(text, sourceLang, targetLang);
      case 'googleWeb':
        return await this.translateWithGoogleWeb(text, sourceLang, targetLang);
      default:
        throw new Error(`Unknown provider: ${providerName}`);
    }
  }

  // MyMemory API - Reliable and works everywhere
  async translateWithMyMemory(text, sourceLang, targetLang) {
    const provider = this.providers.mymemory;
    
    try {
      // MyMemory API format
      const langPair = `${sourceLang === 'auto' ? 'en' : sourceLang}|${targetLang}`;
      const url = `${provider.url}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
      
      console.log(`🔄 MyMemory API call: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`MyMemory API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('MyMemory response:', data);
      
      if (data.responseData && data.responseData.translatedText) {
        const translatedText = data.responseData.translatedText
          .replace(/<[^>]*>/g, '') // Remove any HTML tags
          .trim();
        
        // Check if translation is meaningful (not just a copy)
        if (translatedText && translatedText.trim() !== text.trim()) {
          return {
            translatedText: translatedText,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            provider: provider.name,
            confidence: Math.min(parseFloat(data.responseData.match) || 0.8, provider.confidence)
          };
        }
      }
      
      throw new Error('MyMemory returned empty or identical translation');
    } catch (error) {
      console.error('MyMemory translation failed:', error);
      throw error;
    }
  }

  // Google Translate Web - Simple and reliable
  async translateWithGoogleWeb(text, sourceLang, targetLang) {
    const provider = this.providers.googleWeb;
    
    try {
      // Simple Google Translate URL format
      const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
      const url = `${provider.url}?client=gtx&sl=${sl}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      
      console.log(`🔄 Google Web API call: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(`Google Translate error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Google Web response:', data);
      
      if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
        const translatedText = data[0]
          .filter(item => item && item[0])
          .map(item => item[0])
          .join('')
          .replace(/<[^>]*>/g, '') // Remove any HTML tags
          .trim();

        if (translatedText && translatedText.trim() !== text.trim()) {
          return {
            translatedText: translatedText,
            sourceLanguage: data[2] || sourceLang,
            targetLanguage: targetLang,
            provider: provider.name,
            confidence: provider.confidence
          };
        }
      }
      
      throw new Error('Google Translate returned empty or identical translation');
    } catch (error) {
      console.error('Google Web translation failed:', error);
      throw error;
    }
  }

  // LibreTranslate API (Free, open source)
  async translateWithLibreTranslate(text, sourceLang, targetLang) {
    const provider = this.providers.libretranslate;
    
    // Try multiple LibreTranslate instances for reliability
    const instances = [
      'https://libretranslate.de/translate',
      'https://translate.argosopentech.com/translate',
      'https://libretranslate.com/translate'
    ];

    for (const url of instances) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLang === 'auto' ? 'auto' : sourceLang,
            target: targetLang,
            format: 'text'
          }),
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
          continue; // Try next instance
        }

        const data = await response.json();
        
        if (!data.translatedText || data.translatedText.trim() === '') {
          continue; // Try next instance
        }

        return {
          translatedText: data.translatedText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          provider: provider.name,
          confidence: provider.confidence
        };
      } catch (error) {
        console.warn(`LibreTranslate instance ${url} failed:`, error.message);
        continue;
      }
    }

    throw new Error('All LibreTranslate instances failed');
  }

  // MyMemory API (Free with good quality)
  async translateWithMyMemory(text, sourceLang, targetLang) {
    const provider = this.providers.mymemory;
    
    // Split long texts into chunks to respect API limits
    const maxLength = 500;
    if (text.length > maxLength) {
      const chunks = this.splitTextIntoChunks(text, maxLength);
      const translations = [];
      
      for (const chunk of chunks) {
        const result = await this.translateWithMyMemory(chunk, sourceLang, targetLang);
        translations.push(result.translatedText);
      }
      
      return {
        translatedText: translations.join(' '),
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        provider: provider.name,
        confidence: provider.confidence
      };
    }

    const langPair = sourceLang === 'auto' ? `autodetect|${targetLang}` : `${sourceLang}|${targetLang}`;
    const url = `${provider.url}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.responseData || !data.responseData.translatedText) {
      throw new Error('No translation returned from MyMemory');
    }

    // Check if the translation is meaningful (not just copied)
    if (data.responseData.translatedText === text) {
      throw new Error('MyMemory returned unchanged text');
    }

    return {
      translatedText: data.responseData.translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      provider: provider.name,
      confidence: Math.min(parseFloat(data.responseData.match) || provider.confidence, provider.confidence)
    };
  }

  // Google Translate Free API (Unofficial but reliable)
  async translateWithGoogleFree(text, sourceLang, targetLang) {
    const provider = this.providers.googleFree;
    
    // Handle long texts by chunking
    const maxLength = 1000;
    if (text.length > maxLength) {
      const chunks = this.splitTextIntoChunks(text, maxLength);
      const translations = [];
      
      for (const chunk of chunks) {
        const result = await this.translateWithGoogleFree(chunk, sourceLang, targetLang);
        translations.push(result.translatedText);
        // Add delay between chunks
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      return {
        translatedText: translations.join(' '),
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        provider: provider.name,
        confidence: provider.confidence
      };
    }

    const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Google Translate Free API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || !data[0] || !Array.isArray(data[0])) {
      throw new Error('Invalid response from Google Translate Free API');
    }

    const translatedText = data[0]
      .filter(item => item && item[0])
      .map(item => item[0])
      .join('');

    if (!translatedText || translatedText.trim() === '') {
      throw new Error('Empty translation from Google Translate Free API');
    }

    return {
      translatedText: translatedText,
      sourceLanguage: data[2] || sourceLang,
      targetLanguage: targetLang,
      provider: provider.name,
      confidence: provider.confidence
    };
  }

  // Vercel API Route Fallback (works on deployment)
  async translateWithVercelAPI(text, sourceLang, targetLang) {
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang
        }),
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        throw new Error(`Vercel API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.translatedText) {
        throw new Error('No translation returned from Vercel API');
      }

      return {
        translatedText: data.translatedText,
        sourceLanguage: data.sourceLanguage || sourceLang,
        targetLanguage: targetLang,
        provider: data.provider || 'Vercel API',
        confidence: data.confidence || 0.85
      };
    } catch (error) {
      throw new Error(`Vercel API translation failed: ${error.message}`);
    }
  }

  // Helper method to split text into chunks
  splitTextIntoChunks(text, maxLength) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length + 1 <= maxLength) {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk + '.');
        }
        currentChunk = trimmedSentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk + (currentChunk.endsWith('.') ? '' : '.'));
    }

    return chunks.length > 0 ? chunks : [text];
  }

  // Get available languages for UI
  getAvailableLanguages() {
    return this.supportedLanguages;
  }

  // Clear translation cache
  clearCache() {
    this.cache.clear();
  }

  // Get translation statistics
  getStats() {
    return {
      cacheSize: this.cache.size,
      supportedLanguages: Object.keys(this.supportedLanguages).length,
      providers: Object.keys(this.providers).length
    };
  }
}

// Export a ready-to-use instance
const translationService = new TranslationService();
export default translationService;