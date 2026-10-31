import {
  ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
  ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID,
} from '@shared/constants/errorCodes';
import { DISPLAY_NAME_ALLOWED_REGEX, RESERVED_DISPLAY_NAMES } from '@shared/constants/regex';

export type DisplayNameValidationError =
  | 'emptyDisplayName'
  | 'displayNameLeadingOrTrailingSpaces'
  | 'displayNameConsecutiveSpaces'
  | 'displayNameLength'
  | 'displayNameCharacters'
  | 'displayNameReserved';

export function validateDisplayName(
  value: unknown,
): { valid: true; value: string } | { valid: false; error: DisplayNameValidationError } {
  if (typeof value !== 'string') {
    return { valid: false, error: 'emptyDisplayName' };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, error: 'emptyDisplayName' };
  }

  if (value !== trimmed) {
    return { valid: false, error: 'displayNameLeadingOrTrailingSpaces' };
  }

  if (trimmed.includes('  ')) {
    return { valid: false, error: 'displayNameConsecutiveSpaces' };
  }

  if (trimmed.length < 2 || trimmed.length > 16) {
    return { valid: false, error: 'displayNameLength' };
  }

  if (!DISPLAY_NAME_ALLOWED_REGEX.test(trimmed)) {
    return { valid: false, error: 'displayNameCharacters' };
  }

  if (RESERVED_DISPLAY_NAMES.has(trimmed.toLowerCase())) {
    return { valid: false, error: 'displayNameReserved' };
  }

  return { valid: true, value: trimmed };
}

export function mapDisplayNameValidationErrorToCode(error: DisplayNameValidationError): string {
  if (error === 'emptyDisplayName') {
    return ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY;
  }

  return ERROR_CODE_PROFILE_DISPLAY_NAME_INVALID;
}
