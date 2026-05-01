import {
  mapDisplayNameValidationErrorToCode,
  validateDisplayName,
} from '../../../src/routes/profileValidation';
import {
  ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
  ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID,
} from '@shared/constants/errorCodes';
import { describe, expect, it } from 'vitest';

describe('validateDisplayName', () => {
  it('rejects empty or whitespace-only values', () => {
    expect(validateDisplayName('')).toEqual({ valid: false, error: 'emptyDisplayName' });
    expect(validateDisplayName('   ')).toEqual({ valid: false, error: 'emptyDisplayName' });
    expect(validateDisplayName(null)).toEqual({ valid: false, error: 'emptyDisplayName' });
  });

  it('rejects leading/trailing spaces and consecutive spaces', () => {
    expect(validateDisplayName(' Alice')).toEqual({
      valid: false,
      error: 'displayNameLeadingOrTrailingSpaces',
    });
    expect(validateDisplayName('Alice ')).toEqual({
      valid: false,
      error: 'displayNameLeadingOrTrailingSpaces',
    });
    expect(validateDisplayName('Alice  Bob')).toEqual({
      valid: false,
      error: 'displayNameConsecutiveSpaces',
    });
  });

  it('enforces length and allowed characters', () => {
    expect(validateDisplayName('A')).toEqual({ valid: false, error: 'displayNameLength' });
    expect(validateDisplayName('A'.repeat(17))).toEqual({
      valid: false,
      error: 'displayNameLength',
    });
    expect(validateDisplayName('Alice!')).toEqual({
      valid: false,
      error: 'displayNameCharacters',
    });
  });

  it('rejects reserved names case-insensitively', () => {
    expect(validateDisplayName('admin')).toEqual({ valid: false, error: 'displayNameReserved' });
    expect(validateDisplayName('Support')).toEqual({
      valid: false,
      error: 'displayNameReserved',
    });
  });

  it('accepts valid names', () => {
    expect(validateDisplayName('John_Doe-1')).toEqual({ valid: true, value: 'John_Doe-1' });
  });
});

describe('mapDisplayNameValidationErrorToCode', () => {
  it('maps emptyDisplayName to EMPTY code', () => {
    expect(mapDisplayNameValidationErrorToCode('emptyDisplayName')).toBe(
      ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
    );
  });

  it('maps all other validation errors to INVALID code', () => {
    expect(mapDisplayNameValidationErrorToCode('displayNameLength')).toBe(
      ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID,
    );
    expect(mapDisplayNameValidationErrorToCode('displayNameCharacters')).toBe(
      ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID,
    );
  });
});
