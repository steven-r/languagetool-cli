import { customMarkdownInterpreter } from './language-tool';

import { describe, expect, test } from 'vitest'

describe('custom markup', () => {
    test('Test empty string', () => {
        expect(customMarkdownInterpreter('')).toBe('');
      });
});
