const { initializeMasker, callLLM, runtime, conversationHistory } = require('../../handler');
const path = require('path');
const fs = require('fs');

const mockSettings = {
  enabled: true,
  logging_enabled: false,
  forbidden_words: '',
  openai_api_key: process.env.OPENAI_API_KEY || 'test-openai-key',
  openai_model: 'gpt-4o',
  anthropic_api_key: process.env.ANTHROPIC_API_KEY || 'test-anthropic-key',
  anthropic_model: 'claude-3-opus-20240229',
  google_api_key: process.env.GOOGLE_API_KEY || 'test-google-key',
  google_model: 'gemini-pro',
  deepseek_api_key: process.env.DEEPSEEK_API_KEY || 'test-deepseek-key',
  deepseek_model: 'deepseek-chat',
  perplexity_api_key: process.env.PERPLEXITY_API_KEY || 'test-perplexity-key',
  perplexity_model: 'pplx-70b-online'
};

describe('Agent Integration', () => {
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env;
    process.env = { ...process.env, ...mockSettings }; // Mock API keys
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env
  });

  beforeEach(() => {
    initializeMasker(mockSettings);
    conversationHistory.clear(); // Clear history before each test
  });

  test('should return data masking disabled message if disabled', async () => {
    const disabledSettings = { ...mockSettings, enabled: false };
    const result = await runtime.handler({
      provider: 'openai',
      prompt: 'Hello world'
    }, disabledSettings);
    expect(result).toBe("Data masking is disabled. Enable it in the plugin settings.");
  });

  test('should throw error for unsupported provider', async () => {
    await expect(runtime.handler({
      provider: 'unsupported',
      prompt: 'Hello world'
    }, mockSettings)).rejects.toThrow('Unsupported provider: unsupported');
  });
});
