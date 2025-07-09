const { TokenMasker } = require('./masker');
const { loadSettings, saveSettings } = require('./settings-manager');
const { Logger } = require('./logger');
const path = require('path');

// Test the masking functionality
async function runTests() {
  console.log('=== Data Masking Agent Tests ===\n');
  
  // Initialize components
  const masker = new TokenMasker();
  const logger = new Logger(path.join(__dirname, 'test-logs'));
  
  // Test cases
  const testCases = [
    {
      name: 'Forbidden words masking',
      input: 'Tell me about Егров working at ФНС in Шанхай',
      forbiddenWords: ['Егров', 'ФНС', 'Шанхай'],
      expected: 'Tell me about __FORBIDDEN_0__ working at __FORBIDDEN_1__ in __FORBIDDEN_2__'
    },
    {
      name: 'Credit card masking',
      input: 'My card number is 4532-1234-5678-9012',
      forbiddenWords: [],
      expected: 'My card number is __CREDITCARD_0__'
    },
    {
      name: 'Phone number masking',
      input: 'Call me at +1 (555) 123-4567 or 555-987-6543',
      forbiddenWords: [],
      expectedPattern: /__PHONE_\d+__/g
    },
    {
      name: 'Email masking',
      input: 'Contact john.doe@example.com for details',
      forbiddenWords: [],
      expected: 'Contact __EMAIL_0__ for details'
    },
    {
      name: 'Person name masking',
      input: 'John Smith and Иван Петров are colleagues',
      forbiddenWords: [],
      expectedPattern: /__PERSONNAME_\d+__/g
    },
    {
      name: 'Mixed masking',
      input: 'Егров (phone: 555-123-4567) works at ФНС, email: test@example.com',
      forbiddenWords: ['Егров', 'ФНС'],
      expectedMultiple: ['__FORBIDDEN_', '__PHONE_', '__EMAIL_']
    }
  ];
  
  // Run tests
  let passed = 0;
  let failed = 0;
  
  for (const test of testCases) {
    console.log(`\nTest: ${test.name}`);
    console.log(`Input: "${test.input}"`);
    console.log(`Forbidden words: [${test.forbiddenWords.join(', ')}]`);
    
    // Mask
    const masked = masker.mask(test.input, test.forbiddenWords);
    console.log(`Masked: "${masked}"`);
    
    // Unmask
    const unmasked = masker.unmask(masked);
    console.log(`Unmasked: "${unmasked}"`);
    
    // Verify
    let testPassed = false;
    
    if (test.expected) {
      testPassed = masked === test.expected && unmasked === test.input;
    } else if (test.expectedPattern) {
      testPassed = test.expectedPattern.test(masked) && unmasked === test.input;
    } else if (test.expectedMultiple) {
      testPassed = test.expectedMultiple.every(pattern => masked.includes(pattern)) && 
                   unmasked === test.input;
    }
    
    if (testPassed) {
      console.log('✅ PASSED');
      passed++;
    } else {
      console.log('❌ FAILED');
      failed++;
    }
    
    // Log test
    logger.logMaskingOperation({
      operation: 'test',
      testName: test.name,
      input: test.input,
      masked: masked,
      unmasked: unmasked,
      passed: testPassed
    });
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Total tests: ${testCases.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  
  // Test settings
  console.log('\n=== Testing Settings Management ===');
  
  const testSettings = {
    enabled: 'true',
    logging_enabled: 'true',
    forbidden_words: 'test1, test2, test3',
    openai_model: 'gpt-4-turbo',
    anthropic_model: 'claude-3-sonnet'
  };
  
  saveSettings(testSettings);
  const loadedSettings = loadSettings();
  
  console.log('Settings saved and loaded successfully:', 
    JSON.stringify(loadedSettings, null, 2));
  
  console.log('\n=== Tests Complete ===');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
