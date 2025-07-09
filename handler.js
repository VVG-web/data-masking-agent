const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { TokenMasker } = require('./masker');
const { callLLMProvider } = require('./llm-providers');
const { loadSettings, saveSettings, mergeSettings } = require('./settings-manager');
const { Logger } = require('./logger');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Initialize components
let masker = new TokenMasker();
let logger = null;
let conversationHistory = new Map();

// Initialize logger based on settings
function initializeLogger(settings) {
  if (settings.logging_enabled === 'true') {
    logger = new Logger(path.join(__dirname, 'logs'));
  } else {
    logger = null;
  }
}

// Parse forbidden words from settings
function getForbiddenWords(settings) {
  if (!settings.forbidden_words) return [];
  return settings.forbidden_words
    .split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0);
}

// Main handler function for AnythingLLM
module.exports.runtime = {
  handler: async function ({ provider, prompt }, runtimeSettings = {}) {
    try {
      console.log('\n=== DATA MASKING AGENT START ===');
      console.log('Provider:', provider);
      console.log('Original prompt:', prompt);
      
      // Load and merge settings
      const fileSettings = loadSettings();
      const settings = mergeSettings(fileSettings, runtimeSettings);
      
      // Save merged settings back to file
      if (Object.keys(runtimeSettings).length > 0) {
        saveSettings(settings);
      }
      
      // Initialize logger
      initializeLogger(settings);
      
      // Check if masking is enabled
      if (settings.enabled === 'false') {
        console.log('Data masking is disabled');
        return "Data masking is disabled. Enable it in the plugin settings.";
      }
      
      // Validate provider
      const validProviders = ['openai', 'anthropic', 'google', 'deepseek', 'perplexity'];
      if (!provider || !validProviders.includes(provider.toLowerCase())) {
        return `Invalid provider. Use one of: ${validProviders.join(', ')}`;
      }
      
      // Get forbidden words
      const forbiddenWords = getForbiddenWords(settings);
      console.log('Forbidden words:', forbiddenWords);
      
      // Create or get conversation ID
      const conversationId = `conv_${Date.now()}`;
      if (!conversationHistory.has(conversationId)) {
        conversationHistory.set(conversationId, []);
      }
      
      // Step 1: Mask the prompt
      console.log('\n--- MASKING PROMPT ---');
      const maskedPrompt = masker.mask(prompt, forbiddenWords);
      console.log('Masked prompt:', maskedPrompt);
      
      // Log masking operation
      if (logger) {
        logger.logMaskingOperation({
          operation: 'mask_prompt',
          original: prompt,
          masked: maskedPrompt,
          mappings: masker.getMappings(),
          forbiddenWords: forbiddenWords
        });
      }
      
      // Step 2: Call LLM with masked prompt
      console.log('\n--- CALLING LLM ---');
      const history = conversationHistory.get(conversationId);
      const maskedResponse = await callLLMProvider(
        provider.toLowerCase(),
        maskedPrompt,
        settings,
        history
      );
      console.log('LLM response (masked):', maskedResponse);
      
      // Log LLM response
      if (logger) {
        logger.logMaskingOperation({
          operation: 'llm_response',
          provider: provider,
          model: settings[`${provider.toLowerCase()}_model`],
          masked: maskedResponse
        });
      }
      
      // Step 3: Unmask the response
      console.log('\n--- UNMASKING RESPONSE ---');
      const unmaskedResponse = masker.unmask(maskedResponse);
      console.log('Final response (unmasked):', unmaskedResponse);
      
      // Log unmasking operation
      if (logger) {
        logger.logMaskingOperation({
          operation: 'unmask_response',
          masked: maskedResponse,
          unmasked: unmaskedResponse,
          mappings: masker.getMappings()
        });
      }
      
      // Update conversation history
      history.push({ role: 'user', content: prompt });
      history.push({ role: 'assistant', content: unmaskedResponse });
      
      // Keep only last 10 messages to prevent context overflow
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      console.log('=== DATA MASKING AGENT END ===\n');
      
      return unmaskedResponse;
      
    } catch (error) {
      console.error('Data masking agent error:', error);
      
      if (logger) {
        logger.logError({
          error: error.message,
          stack: error.stack,
          provider: provider,
          prompt: prompt
        });
      }
      
      return `Error: ${error.message}`;
    }
  }
};
