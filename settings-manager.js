const fs = require('fs');
const path = require('path');

const settingsPath = path.join(__dirname, 'config', 'settings.json');

// Default settings
const defaultSettings = {
  enabled: "true",
  logging_enabled: "false",
  forbidden_words: "",
  openai_model: "gpt-4o",
  anthropic_model: "claude-3-opus-20240229",
  google_model: "gemini-pro",
  deepseek_model: "deepseek-chat",
  perplexity_model: "pplx-70b-online"
};

// Load settings from file
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const content = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  // Return defaults if file doesn't exist or error
  return { ...defaultSettings };
}

// Save settings to file
function saveSettings(settings) {
  try {
    const configDir = path.dirname(settingsPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    console.log('Settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// Merge runtime settings with file settings
function mergeSettings(fileSettings, runtimeSettings) {
  return { ...fileSettings, ...runtimeSettings };
}

// Update specific settings
function updateSettings(updates) {
  const currentSettings = loadSettings();
  const newSettings = { ...currentSettings, ...updates };
  return saveSettings(newSettings);
}

// Get forbidden words as array
function getForbiddenWordsArray() {
  const settings = loadSettings();
  if (!settings.forbidden_words) return [];
  
  return settings.forbidden_words
    .split(',')
    .map(w => w.trim())
    .filter(w => w.length > 0);
}

// Add forbidden word
function addForbiddenWord(word) {
  const settings = loadSettings();
  const words = getForbiddenWordsArray();
  
  if (!words.includes(word.trim())) {
    words.push(word.trim());
    settings.forbidden_words = words.join(', ');
    return saveSettings(settings);
  }
  
  return true;
}

// Remove forbidden word
function removeForbiddenWord(word) {
  const settings = loadSettings();
  const words = getForbiddenWordsArray();
  const filtered = words.filter(w => w !== word.trim());
  
  settings.forbidden_words = filtered.join(', ');
  return saveSettings(settings);
}

// Save API keys to .env file
function saveApiKeys(apiKeys) {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    // Read existing .env if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add API keys
    Object.entries(apiKeys).forEach(([key, value]) => {
      const envKey = `${key.toUpperCase()}_API_KEY`;
      const regex = new RegExp(`^${envKey}=.*$`, 'm');
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${envKey}=${value}`);
      } else {
        envContent += `\n${envKey}=${value}`;
      }
    });
    
    // Write back to .env
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('API keys saved to .env');
    return true;
  } catch (error) {
    console.error('Error saving API keys:', error);
    return false;
  }
}

module.exports = {
  loadSettings,
  saveSettings,
  mergeSettings,
  updateSettings,
  getForbiddenWordsArray,
  addForbiddenWord,
  removeForbiddenWord,
  saveApiKeys
};
