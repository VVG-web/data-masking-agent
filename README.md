# Data Masking Agent for AnythingLLM

## Description
This custom agent skill masks sensitive data in user inputs before sending them to the LLM and unmasks the responses before displaying them to users.

## Features
- Configurable masking patterns via JSON dictionary
- Automatic detection of common sensitive data types (email, phone, SSN, etc.)
- Session-based masking/unmasking with unique tokens
- Debug logging support

## Configuration
- **MASKING_DICTIONARY**: JSON object with regex patterns as keys and mask tokens as values
- **ENABLE_LOGGING**: Enable debug logging (true/false)

## Usage
The agent supports three actions:
- `mask`: Only mask sensitive data
- `unmask`: Only unmask previously masked data
- `process`: Full cycle - mask then unmask (default)

## Examples
@agent use data-masking-agent with text "User email: john@example.com" and action "mask"
@agent use data-masking-agent with text "Contact info: phone 555-1234, email test@domain.com" and action "process"