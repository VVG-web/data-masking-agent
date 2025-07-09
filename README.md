# Data Masking Agent Skill for AnythingLLM

A privacy-preserving agent skill that masks sensitive data before sending prompts to LLMs and unmasks the responses.

## Features

- **Automatic Data Masking**: Uses masked-ai library to mask sensitive information like names, phone numbers, and credit card numbers
- **Custom Dictionary**: Define your own forbidden words to mask
- **Multi-Provider Support**: Works with OpenAI, Anthropic, Google, DeepSeek, and Perplexity
- **Conversation Context**: Maintains conversation history
- **Secure API Key Storage**: API keys are stored in .env file, not in settings
- **Detailed Logging**: Optional logging of masking operations for debugging

## Installation

1. Clone this repository into your AnythingLLM agent-skills directory
2. Run `npm install` to install dependencies
3. Create a `.env` file in the plugin directory with your API keys:

```env
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
GOOGLE_API_KEY=AIza-your-google-api-key
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
PERPLEXITY_API_KEY=pplx-your-perplexity-api-key
```

**Note:** The `.env` file is excluded from git and should not be committed.


## Possible LLM providers
- openai
- anthropic
- google
- deepseek
- perplexity
