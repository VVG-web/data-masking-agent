const axios = require('axios');

// Get API key from environment
function getApiKey(provider) {
  const envKey = `${provider.toUpperCase()}_API_KEY`;
  const apiKey = process.env[envKey];
  
  if (!apiKey) {
    throw new Error(`API key for ${provider} not found. Please set ${envKey} in .env file`);
  }
  
  return apiKey;
}

// OpenAI API
async function callOpenAI(apiKey, model, prompt, history) {
  const messages = [
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: prompt }
  ];
  
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: model || 'gpt-4o',
    messages: messages,
    temperature: 0.7,
    max_tokens: 4096
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

// Anthropic API
async function callAnthropic(apiKey, model, prompt, history) {
  const messages = [
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: prompt }
  ];
  
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: model || 'claude-3-opus-20240229',
    messages: messages,
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

// Google Gemini API
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

// DeepSeek API
async function callDeepSeek(apiKey, model, prompt, history) {
  const messages = [
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: prompt }
  ];
  
  const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
    model: model || 'deepseek-chat',
    messages: messages,
    temperature: 0.7
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

// Perplexity API
async function callPerplexity(apiKey, model, prompt, history) {
  const messages = [
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: prompt }
  ];
  
  const response = await axios.post('https://api.perplexity.ai/chat/completions', {
    model: model || 'pplx-70b-online',
    messages: messages
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.data.choices[0].message.content;
}

// Main function to call appropriate LLM
async function callLLMProvider(provider, prompt, settings, history = []) {
  const apiKey = getApiKey(provider);
  const model = settings[`${provider}_model`];
  
  console.log(`Calling ${provider} with model: ${model || 'default'}`);
  
  switch (provider) {
    case 'openai':
      return await callOpenAI(apiKey, model, prompt, history);
    case 'anthropic':
      return await callAnthropic(apiKey, model, prompt, history);
    case 'google':
      return await callGoogle(apiKey, model, prompt, history);
    case 'deepseek':
      return await callDeepSeek(apiKey, model, prompt, history);
    case 'perplexity':
      return await callPerplexity(apiKey, model, prompt, history);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

module.exports = { callLLMProvider };
