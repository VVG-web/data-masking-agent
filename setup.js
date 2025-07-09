const { updateSettings, saveApiKeys } = require('./settings-manager');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n=== Data Masking Agent Setup ===\n');
  
  // API Keys setup
  console.log('Step 1: API Keys Configuration');
  console.log('Enter API keys for the providers you want to use (press Enter to skip):\n');
  
  const apiKeys = {};
  
  const providers = [
    { name: 'openai', display: 'OpenAI' },
    { name: 'anthropic', display: 'Anthropic' },
    { name: 'google', display: 'Google' },
    { name: 'deepseek', display: 'DeepSeek' },
    { name: 'perplexity', display: 'Perplexity' }
  ];
  
  for (const provider of providers) {
    const key = await question(`${provider.display} API Key: `);
    if (key.trim()) {
      apiKeys[provider.name] = key.trim();
    }
  }
  
  // Save API keys to .env
  if (Object.keys(apiKeys).length > 0) {
    saveApiKeys(apiKeys);
    console.log('\nAPI keys saved to .env file');
  }
  
  // Settings configuration
  console.log('\nStep 2: Settings Configuration\n');
  
  const settings = {};
  
  // Enable/disable masking
  const enableMasking = await question('Enable data masking? (yes/no) [yes]: ');
  settings.enabled = (!enableMasking || enableMasking.toLowerCase() === 'yes') ? 'true' : 'false';
  
  // Enable/disable logging
  const enableLogging = await question('Enable logging? (yes/no) [no]: ');
  settings.logging_enabled = (enableLogging.toLowerCase() === 'yes') ? 'true' : 'false';
  
  // Forbidden words
  const forbiddenWords = await question('Enter forbidden words (comma-separated): ');
  if (forbiddenWords.trim()) {
    settings.forbidden_words = forbiddenWords.trim();
  }
  
  // Model configurations
  console.log('\nStep 3: Model Configuration (press Enter to use defaults)\n');
  
  const modelDefaults = {
    openai: 'gpt-4o',
    anthropic: 'claude-3-opus-20240229',
    google: 'gemini-pro',
    deepseek: 'deepseek-chat',
    perplexity: 'pplx-70b-online'
  };
  
  for (const provider of providers) {
    const model = await question(`${provider.display} model [${modelDefaults[provider.name]}]: `);
    if (model.trim()) {
      settings[`${provider.name}_model`] = model.trim();
    }
  }
  
  // Save settings
  updateSettings(settings);
  
  console.log('\n=== Setup Complete ===');
  console.log('\nYou can now use the data masking agent with:');
  console.log('  @agent msk <provider> <your prompt>');
  console.log('\nExample:');
  console.log('  @agent msk anthropic Tell me about Егров working at ФНС in Шанхай\n');
  
  rl.close();
}

// Run setup if called directly
if (require.main === module) {
  setup().catch(console.error);
}

module.exports = { setup };
