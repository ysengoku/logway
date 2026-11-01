import { describe, expect, it } from 'vitest';
import { validateDisplayName } from '@/validators';

describe('validateDisplayName', () => {
  it('returns emptyDisplayName for empty or whitespace-only input', () => {
    expect(validateDisplayName('')).toBe('emptyDisplayName');
    expect(validateDisplayName('   ')).toBe('emptyDisplayName');
  });

  it('rejects leading or trailing spaces', () => {
    expect(validateDisplayName(' Alice')).toBe('displayNameLeadingOrTrailingSpaces');
    expect(validateDisplayName('Alice ')).toBe('displayNameLeadingOrTrailingSpaces');
  });

  it('rejects consecutive spaces', () => {
    expect(validateDisplayName('Alice  Bob')).toBe('displayNameConsecutiveSpaces');
  });

  it('enforces length 2..16', () => {
    expect(validateDisplayName('A')).toBe('displayNameLength');
    expect(validateDisplayName('A'.repeat(17))).toBe('displayNameLength');
    expect(validateDisplayName('AB')).toBeNull();
    expect(validateDisplayName('A'.repeat(16))).toBeNull();
  });

  it('rejects disallowed characters', () => {
    expect(validateDisplayName('Alice!')).toBe('displayNameCharacters');
    expect(validateDisplayName('あいうえお')).toBe('displayNameCharacters');
  });

  it('rejects reserved names case-insensitively', () => {
    expect(validateDisplayName('admin')).toBe('displayNameReserved');
    expect(validateDisplayName('Support')).toBe('displayNameReserved');
  });

  it('accepts valid display names', () => {
    expect(validateDisplayName('John_Doe-1')).toBeNull();
  });
});
