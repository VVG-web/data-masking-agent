const { initializeMasker, maskText, unmaskText } = require('../../handler');
const { exec } = require('child_process');

jest.mock('child_process');

describe('Masking functionality', () => {
  beforeEach(() => {
    // Mock exec implementation
    exec.mockImplementation((command, callback) => {
      const mockMaskedText = 'masked-test-data';
      const mockMappings = { '<NamesMask_1>': 'John Doe' };
      if (command.includes('mask')) {
        callback(null, JSON.stringify({ masked_text: mockMaskedText, mappings: mockMappings }), '');
      } else if (command.includes('unmask')) {
        callback(null, 'unmasked-test-data', '');
      } else {
        callback(new Error('Unknown command'), '', '');
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize masker', () => {
    const settings = { forbidden_words: 'test' };
    initializeMasker(settings);
    // No direct return, but ensures the function runs without error
    expect(true).toBe(true);
  });

  test('should mask text', async () => {
    const settings = { forbidden_words: 'test' };
    const { masked_text, mappings } = await maskText('original-text', settings);
    expect(masked_text).toBe('masked-test-data');
    expect(mappings).toEqual({ '<NamesMask_1>': 'John Doe' });
    expect(exec).toHaveBeenCalledTimes(1);
  });

  test('should unmask text', async () => {
    const mappings = { '<NamesMask_1>': 'John Doe' };
    const unmasked_text = await unmaskText('masked-test-data', mappings);
    expect(unmasked_text).toBe('unmasked-test-data');
    expect(exec).toHaveBeenCalledTimes(1);
  });
});
