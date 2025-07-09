# Data Masking Agent for AnythingLLM
  
A privacy-preserving agent that masks sensitive data before sending prompts to LLMs and unmasks the responses.

## Features
  
- **Token-based masking**: Reliable masking/unmasking of sensitive data
- **Automatic detection**: Identifies credit cards, phone numbers, emails, and person names
- **Custom forbidden words**: Define your own list of words to mask
- **Multiple LLM providers**: Supports OpenAI, Anthropic, Google, DeepSeek, and Perplexity
- **Conversation context**: Maintains conversation history for coherent dialogues
- **Comprehensive logging**: Track all masking operations for audit purposes
- **Cyrillic support**: Works with both Latin and Cyrillic text


## Installation

1. Clone this repository into your AnythingLLM agents directory:

```bash
cd /path/to/anythingllm/agents
git clone <repository-url> data-masking-agent
cd data-masking-agent
```

2. Install dependencies:

```bash
npm install
```

3. Run the setup script:

```bash
npm run setup
```

4. Follow the prompts to:

- Enter API keys for LLM providers
- Configure default settings
- Set up forbidden words
- Choose default models

## Configuration

### Environment Variables (.env)

```env
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
PERPLEXITY_API_KEY=your_key_here
```

### Settings (config/settings.json)

```JSON
{
  "enabled": "true",
  "logging_enabled": "true",
  "forbidden_words": "Егров, ФНС, Шанхай",
  "openai_model": "gpt-4o",
  "anthropic_model": "claude-3-opus-20240229",
  "google_model": "gemini-pro",
  "deepseek_model": "deepseek-chat",
  "perplexity_model": "pplx-70b-online"
}
```

### Usage

In AnythingLLM, use the agent with the following syntax:

```text
@agent msk <provider> <your prompt>
```

### Examples:

```text
@agent msk anthropic Tell me about Егров working at ФНС in Шанхай

@agent msk openai My credit card 4532-1234-5678-9012 was charged incorrectly

@agent msk google Contact John Smith at john@example.com or call 555-123-4567
```

## How It Works

1. Masking Phase:
  - Identifies forbidden words from your configuration
  - Detects patterns (credit cards, phones, emails, names)
  - Replaces sensitive data with unique tokens
  - Logs the masking operation
2. LLM Communication:
  - Sends masked prompt to selected LLM provider
  - Maintains conversation context
  - Receives masked response
3. Unmasking Phase:
  - Replaces tokens with original sensitive data
  - Logs the unmasking operation
  - Returns clean response to user

## Logging

When logging is enabled, the agent creates detailed logs in the `logs/` directory:

- JSON logs: Machine-readable format for processing
- Text logs: Human-readable format for review

Example log entry:

```text
[2024-01-15T10:30:45.123Z] MASK_PROMPT
================================================================================
Original: Tell me about Егров working at ФНС in Шанхай
Masked: Tell me about __FORBIDDEN_0__ working at __FORBIDDEN_1__ in __FORBIDDEN_2__
Forbidden Words: Егров, ФНС, Шанхай

Mappings:
  __FORBIDDEN_0__ => Егров
  __FORBIDDEN_1__ => ФНС
  __FORBIDDEN_2__ => Шанхай
```
  
## Testing

Run the test suite to verify functionality:

```BASH
npm test
```

## Troubleshooting

### Agent not responding

- Check that the agent is enabled in settings
- Verify API keys are correctly set in .env
- Check logs for error messages

### Masking not working

- Ensure forbidden words are properly configured
- Check that words are comma-separated
- Verify logging to see what's being masked

### API errors

- Confirm API keys are valid
- Check provider service status
- Verify model names are correct

### Security Considerations

- API keys are stored in .env file (add to .gitignore)
- Masked data uses unique tokens per session
- Logs may contain sensitive data - secure appropriately
- Token mappings are kept in memory only

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Installation Script (install.sh)

```bash
#!/bin/bash
  

echo "=== Data Masking Agent Installation ==="
echo

  
# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi
  

# Install dependencies
echo "Installing dependencies..."
npm install
  

# Create necessary directories
echo "Creating directories..."
mkdir -p config
mkdir -p logs
  

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please edit .env file and add your API keys"
fi

  
# Run setup
echo
echo "Running setup..."
npm run setup
  

echo
echo "=== Installation Complete ==="
echo
echo "You can now use the data masking agent in AnythingLLM with:"
echo "  @agent msk <provider> <your prompt>"
echo
```

Make the install script executable:

```BASH
chmod +x install.sh
```

## Summary

This complete implementation provides:

1. Reliable token-based masking that handles Cyrillic text and various data patterns
2. Support for all requested LLM providers with proper API implementations
3. Comprehensive logging in both JSON and human-readable formats
4. Persistent settings management with .env for API keys
5. Conversation context preservation for coherent dialogues
6. Extensive testing suite to verify functionality
7. Easy setup process with interactive configuration
8. Full documentation for users and developers

The agent integrates seamlessly with AnythingLLM and provides the privacy protection you need while maintaining the quality of LLM interactions.

## Possible LLM providers

- openai
- anthropic
- google
- deepseek
- perplexity