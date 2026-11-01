import { DISPLAY_NAME_ALLOWED_REGEX, RESERVED_DISPLAY_NAMES } from '@/shared/constants/regex';

export type DisplayNameValidationKey =
  | 'emptyDisplayName'
  | 'displayNameLeadingOrTrailingSpaces'
  | 'displayNameConsecutiveSpaces'
  | 'displayNameLength'
  | 'displayNameCharacters'
  | 'displayNameReserved';

export function validateDisplayName(value: string): DisplayNameValidationKey | null {
  if (!value.trim()) {
    return 'emptyDisplayName';
  }

  if (value !== value.trim()) {
    return 'displayNameLeadingOrTrailingSpaces';
  }

  if (value.includes('  ')) {
    return 'displayNameConsecutiveSpaces';
  }

  if (value.length < 2 || value.length > 16) {
    return 'displayNameLength';
  }

  if (!DISPLAY_NAME_ALLOWED_REGEX.test(value)) {
    return 'displayNameCharacters';
  }

  if (RESERVED_DISPLAY_NAMES.has(value.toLowerCase())) {
    return 'displayNameReserved';
  }

  return null;
}
