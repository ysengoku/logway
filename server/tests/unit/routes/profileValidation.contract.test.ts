import { describe, expect, it } from 'vitest';
import { validateDisplayName } from '../../../src/routes/profileValidation';

const sharedCases: Array<{ input: string; expected: string | null }> = [
  { input: '', expected: 'emptyDisplayName' },
  { input: '   ', expected: 'emptyDisplayName' },
  { input: ' A', expected: 'displayNameLeadingOrTrailingSpaces' },
  { input: 'A ', expected: 'displayNameLeadingOrTrailingSpaces' },
  { input: 'A  B', expected: 'displayNameConsecutiveSpaces' },
  { input: 'A', expected: 'displayNameLength' },
  { input: 'A'.repeat(17), expected: 'displayNameLength' },
  { input: 'Alice!', expected: 'displayNameCharacters' },
  { input: 'admin', expected: 'displayNameReserved' },
  { input: 'John_Doe-1', expected: null },
];

describe('displayName policy contract', () => {
  it('matches expected policy outcomes', () => {
    for (const testCase of sharedCases) {
      const result = validateDisplayName(testCase.input);
      const actual = result.valid ? null : result.error;
      expect(actual).toBe(testCase.expected);
    }
  });
});
