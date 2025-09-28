/**
 * Mock Data and Testing Utilities for AI Summary System
 * Use this file to test the summary functionality without real notes
 */

// Mock notes for testing different content lengths and types
export const mockNotes = [
  {
    id: 'test-note-1',
    title: 'Machine Learning Fundamentals',
    content: `Machine learning is a subset of artificial intelligence (AI) that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.

The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide. The primary aim is to allow the computers to learn automatically without human intervention or assistance and adjust actions accordingly.

Some machine learning methods include supervised learning, unsupervised learning, semi-supervised learning, and reinforcement learning. Each method has its own advantages and is suitable for different types of problems and datasets.`,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    isPinned: false,
    isArchived: false,
    isEncrypted: false
  },
  
  {
    id: 'test-note-2', 
    title: 'Quick Meeting Notes',
    content: `Team standup meeting today at 2 PM. Discussed project timeline and upcoming deadlines. John will handle the backend API integration. Sarah is working on the frontend components. Need to review the database schema by Friday. Next meeting scheduled for Tuesday.`,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    isPinned: true,
    isArchived: false,
    isEncrypted: false
  },

  {
    id: 'test-note-3',
    title: 'Recipe Ideas',
    content: `Pasta with garlic and olive oil. Simple and delicious! Cook spaghetti according to package directions. Heat olive oil in a large pan, add sliced garlic and red pepper flakes. Toss with pasta and fresh parsley. Serve with parmesan cheese.`,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    isPinned: false,
    isArchived: false,
    isEncrypted: false
  },

  {
    id: 'test-note-4',
    title: 'JavaScript Best Practices',
    content: `<h2>Modern JavaScript Development</h2>
    <p>Always use <strong>const</strong> and <strong>let</strong> instead of var for variable declarations. This provides better scope control and prevents common errors.</p>
    
    <p>Utilize <em>arrow functions</em> for cleaner syntax, especially in callbacks and array methods like map, filter, and reduce.</p>
    
    <ul>
      <li>Use template literals for string interpolation</li>
      <li>Destructure objects and arrays when possible</li>
      <li>Implement proper error handling with try-catch blocks</li>
      <li>Write unit tests for critical functions</li>
    </ul>
    
    <p>Always validate user input and sanitize data before processing. Use modern async/await syntax instead of complex promise chains for better readability.</p>`,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    isPinned: false,
    isArchived: false,
    isEncrypted: false
  },

  {
    id: 'test-note-5',
    title: 'Short Note',
    content: `Just a quick reminder to buy groceries tomorrow.`,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19'),
    isPinned: false,
    isArchived: false,
    isEncrypted: false
  }
];

// Test scenarios for summary system
export const testScenarios = [
  {
    name: 'Long Technical Content',
    noteId: 'test-note-1',
    expectedProviders: ['HuggingFace', 'Cohere', 'Local'],
    expectedKeyPhrases: ['machine learning', 'artificial intelligence', 'supervised learning'],
    minSummaryLength: 50
  },
  
  {
    name: 'Medium Business Content', 
    noteId: 'test-note-2',
    expectedProviders: ['HuggingFace', 'Cohere', 'Local'],
    expectedKeyPhrases: ['meeting', 'project timeline', 'backend api'],
    minSummaryLength: 30
  },
  
  {
    name: 'HTML Content Processing',
    noteId: 'test-note-4', 
    expectedProviders: ['HuggingFace', 'Cohere', 'Local'],
    expectedKeyPhrases: ['javascript', 'arrow functions', 'async await'],
    minSummaryLength: 40
  },
  
  {
    name: 'Short Content Handling',
    noteId: 'test-note-5',
    expectedProviders: ['Local'],
    expectedKeyPhrases: [],
    minSummaryLength: 10
  }
];

// Utility functions for testing
export class SummaryTester {
  constructor(summaryService, useSummaryHook) {
    this.summaryService = summaryService;
    this.useSummaryHook = useSummaryHook;
    this.testResults = [];
  }

  async runAllTests() {
    console.log('🧪 Starting AI Summary System Tests');
    
    for (const scenario of testScenarios) {
      const result = await this.runScenarioTest(scenario);
      this.testResults.push(result);
    }
    
    this.generateTestReport();
    return this.testResults;
  }

  async runScenarioTest(scenario) {
    const note = mockNotes.find(n => n.id === scenario.noteId);
    if (!note) {
      return {
        scenario: scenario.name,
        success: false,
        error: 'Note not found'
      };
    }

    try {
      console.log(`🔍 Testing: ${scenario.name}`);
      
      const startTime = Date.now();
      const summary = await this.summaryService.getSummary(note.content, note.id);
      const endTime = Date.now();
      
      const result = {
        scenario: scenario.name,
        success: true,
        summary,
        performance: {
          duration: endTime - startTime,
          provider: summary.provider
        },
        validation: this.validateSummary(summary, scenario)
      };
      
      console.log(`✅ ${scenario.name} completed in ${result.performance.duration}ms using ${summary.provider}`);
      return result;
      
    } catch (error) {
      console.error(`❌ ${scenario.name} failed:`, error.message);
      return {
        scenario: scenario.name,
        success: false,
        error: error.message
      };
    }
  }

  validateSummary(summary, scenario) {
    const validation = {
      hasValidSummary: Boolean(summary.summary && summary.summary.length >= scenario.minSummaryLength),
      hasProvider: Boolean(summary.provider),
      hasConfidence: typeof summary.confidence === 'number',
      hasKeyPhrases: Array.isArray(summary.keyPhrases),
      hasReadingTime: Boolean(summary.readingTime),
      providerValid: scenario.expectedProviders.includes(summary.provider)
    };

    validation.overallValid = Object.values(validation).every(Boolean);
    return validation;
  }

  generateTestReport() {
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.success).length;
    const failedCount = totalTests - successfulTests;
    
    console.group('📊 AI Summary Test Report');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Success Rate: ${Math.round((successfulTests / totalTests) * 100)}%`);
    
    // Provider usage statistics
    const providerStats = {};
    this.testResults
      .filter(r => r.success && r.summary)
      .forEach(r => {
        const provider = r.summary.provider;
        providerStats[provider] = (providerStats[provider] || 0) + 1;
      });
    
    console.log('\n🤖 Provider Usage:');
    Object.entries(providerStats).forEach(([provider, count]) => {
      console.log(`  ${provider}: ${count} tests`);
    });
    
    // Performance metrics
    const durations = this.testResults
      .filter(r => r.success && r.performance)
      .map(r => r.performance.duration);
    
    if (durations.length > 0) {
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      console.log('\n⏱️ Performance Metrics:');
      console.log(`  Average: ${Math.round(avgDuration)}ms`);
      console.log(`  Fastest: ${minDuration}ms`);
      console.log(`  Slowest: ${maxDuration}ms`);
    }
    
    // Failed test details
    const failedTests = this.testResults.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  ${test.scenario}: ${test.error}`);
      });
    }
    
    console.groupEnd();
  }

  // Test without API keys (local fallback only)
  async testLocalFallbackOnly() {
    console.log('🏠 Testing Local Fallback System Only');
    
    // Temporarily disable API providers
    const originalStatus = { ...this.summaryService.apiStatus };
    this.summaryService.apiStatus.huggingFace.available = false;
    this.summaryService.apiStatus.cohere.available = false;
    
    try {
      const results = [];
      for (const note of mockNotes) {
        const summary = await this.summaryService.getSummary(note.content, note.id);
        results.push({
          noteId: note.id,
          title: note.title,
          provider: summary.provider,
          summaryLength: summary.summary.length,
          keyPhrasesCount: summary.keyPhrases ? summary.keyPhrases.length : 0,
          readingTime: summary.readingTime
        });
      }
      
      console.table(results);
      return results;
      
    } finally {
      // Restore original API status
      this.summaryService.apiStatus = originalStatus;
    }
  }

  // Test batch operations
  async testBatchSummarization() {
    console.log('📦 Testing Batch Summarization');
    
    const startTime = Date.now();
    const results = await this.summaryService.batchSummarize(
      mockNotes,
      (current, total) => {
        console.log(`📝 Processing ${current}/${total} notes...`);
      }
    );
    const endTime = Date.now();
    
    const summary = {
      totalNotes: mockNotes.length,
      successfulSummaries: results.filter(r => r.success).length,
      failedSummaries: results.filter(r => !r.success).length,
      totalTime: endTime - startTime,
      averageTimePerNote: (endTime - startTime) / mockNotes.length
    };
    
    console.log('📦 Batch Test Results:', summary);
    return { results, summary };
  }
}

// Export a ready-to-use test function
export async function runSummaryTests(summaryService, useSummaryHook = null) {
  const tester = new SummaryTester(summaryService, useSummaryHook);
  
  console.log('🚀 Starting Comprehensive AI Summary Tests');
  
  // Run all standard tests
  await tester.runAllTests();
  
  // Test local fallback
  await tester.testLocalFallbackOnly();
  
  // Test batch operations
  await tester.testBatchSummarization();
  
  console.log('✨ All tests completed!');
  
  return tester.testResults;
}

// Quick test function for console usage
export function quickTest(summaryService) {
  console.log('⚡ Quick Test - Generating summary for sample note...');
  
  const sampleNote = mockNotes[0];
  return summaryService.getSummary(sampleNote.content, sampleNote.id)
    .then(summary => {
      console.log('✅ Quick test result:', {
        provider: summary.provider,
        summaryLength: summary.summary.length,
        keyPhrases: summary.keyPhrases,
        confidence: summary.confidence,
        readingTime: summary.readingTime
      });
      return summary;
    })
    .catch(error => {
      console.error('❌ Quick test failed:', error);
      throw error;
    });
}