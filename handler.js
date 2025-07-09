const fs = require('fs');
const path = require('path');
const { MaskedAI } = require('masked-ai');
const axios = require('axios');

// Initialize masking engine
let masker = null;
let conversationHistory = new Map();

// Initialize masker with settings
function initializeMasker(settings) {
  const forbiddenWords = settings.forbidden_words ? 
    settings.forbidden_words.split(',').map(w => w.trim()).filter(w => w) : [];
  
  masker = new MaskedAI({
    customPatterns: forbiddenWords.map(word => ({
      pattern: new RegExp(`\\b${word}\\b`, 'gi'),
      type: 'FORBIDDEN_WORD'
    }))
  });
}

// Log masking operations
function logMaskingOperation(operation, original, masked, settings) {
  if (!settings.logging_enabled) return;
  
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const logFile = path.join(logDir, `masking-${new Date().toISOString().split('T')[0]}.log`);
  const logEntry = {
    timestamp: new Date().toISOString(),
    operation,
    original,
    masked,
    mappings: masker.getMappings()
  };
  
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// Call LLM API
async function callLLM(provider, prompt, settings, conversationId) {
  const apiKey = settings[`${provider}_api_key`];
  const model = settings[`${provider}_model`];
  
  if (!apiKey) {
    throw new Error(`API key for ${provider} not configured`);
  }
  
  // Get conversation history
  const history = conversationHistory.get(conversationId) || [];
  
  let response;
  
  switch (provider) {
    case 'openai':
      response = await callOpenAI(apiKey, model, prompt, history);
      break;
    case 'anthropic':
      response = await callAnthropic(apiKey, model, prompt, history);
      break;
    case 'google':
      response = await callGoogle(apiKey, model, prompt, history);
      break;
    case 'deepseek':
      response = await callDeepSeek(apiKey, model, prompt, history);
      break;
    case 'perplexity':
      response = await callPerplexity(apiKey, model, prompt, history);
      break;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
  
  // Update conversation history
  history.push({ role: 'user', content: prompt });
  history.push({ role: 'assistant', content: response });
  conversationHistory.set(conversationId, history);
  
  return response;
}

// OpenAI API call
async function callOpenAI(apiKey, model, prompt, history) {
  const messages = [
    ...history,
    { role: 'user', content: prompt }
  ];
  
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: model || 'gpt-4o',
    messages,
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

// Anthropic API call
async function callAnthropic(apiKey, model, prompt, history) {
  const messages = [
    ...history,
    { role: 'user', content: prompt }
  ];
  
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: model || 'claude-3-opus-20240229',
    messages,
    max_tokens: 4096
  }, {
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.content[0].text;
}

// Google API call
async function callGoogle(apiKey, model, prompt, history) {
  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })),
    {
      role: 'user',
      parts: [{ text: prompt }]
    }
  ];
  
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`,
    { contents }
  );
  
  return response.data.candidates[0].content.parts[0].text;
}

// DeepSeek API call
async function callDeepSeek(apiKey, model, prompt, history) {
  const messages = [
    ...history,
    { role: 'user', content: prompt }
  ];
  
  const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
    model: model || 'deepseek-chat',
    messages,
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

// Perplexity API call
async function callPerplexity(apiKey, model, prompt, history) {
  const messages = [
    ...history,
    { role: 'user', content: prompt }
  ];
  
  const response = await axios.post('https://api.perplexity.ai/chat/completions', {
    model: model || 'pplx-70b-online',
    messages
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

// Main handler function
module.exports.runtime = {
  handler: async function ({ provider, prompt }, settings = {}) {
    try {
      // Check if masking is enabled
      if (settings.enabled === false) {
        return "Data masking is disabled. Enable it in the plugin settings.";
      }
      
      // Validate provider
      const validProviders = ['openai', 'anthropic', 'google', 'deepseek', 'perplexity'];
      if (!provider || !validProviders.includes(provider.toLowerCase())) {
        return `Invalid provider. Use one of: ${validProviders.join(', ')}`;
      }
      
      // Initialize masker if needed
      if (!masker) {
        initializeMasker(settings);
      }
      
      // Generate conversation ID (simple timestamp-based)
      const conversationId = `conv_${Date.now()}`;
      
      // Mask the prompt
      const maskedPrompt = masker.mask(prompt);
      logMaskingOperation('mask_prompt', prompt, maskedPrompt, settings);
      
      // Call LLM with masked prompt
      const maskedResponse = await callLLM(provider.toLowerCase(), maskedPrompt, settings, conversationId);
      logMaskingOperation('llm_response', null, maskedResponse, settings);
      
      // Unmask the response
      const unmaskedResponse = masker.unmask(maskedResponse);
      logMaskingOperation('unmask_response', maskedResponse, unmaskedResponse, settings);
      
      return unmaskedResponse;
      
    } catch (error) {
      console.error('Data masking agent error:', error);
      return `Error: ${error.message}`;
    }
  }
};
