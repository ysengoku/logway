import { describe, expect, it } from 'vitest';
import { auth as enAuth, settings as enSettings, common as enCommon } from '@/locales/en';
import { auth as frAuth, settings as frSettings, common as frCommon } from '@/locales/fr';

const requiredAuthErrorKeys = [
  'emailRequired',
  'invalidEmail',
  'emailExists',
  'emailNotConfirmed',
  'emailProviderDisabled',
  'emailSsoManaged',
  'weakPassword',
  'samePassword',
  'missingPassword',
  'passwordRequired',
  'passwordsDoNotMatch',
  'reauthenticationNeeded',
  'validationFailed',
  'tooManyRequests',
  'requestTimeout',
] as const;

const requiredSettingsErrorKeys = [
  'emptyDisplayName',
  'displayNameLength',
  'displayNameCharacters',
  'displayNameLeadingOrTrailingSpaces',
  'displayNameConsecutiveSpaces',
  'displayNameReserved',
] as const;

describe('locale error key coverage', () => {
  it('contains required auth error keys in EN and FR', () => {
    for (const key of requiredAuthErrorKeys) {
      expect(enAuth.errors[key]).toBeTypeOf('string');
      expect(frAuth.errors[key]).toBeTypeOf('string');
    }
  });

  it('contains required settings error keys in EN and FR', () => {
    for (const key of requiredSettingsErrorKeys) {
      expect(enSettings.errors[key]).toBeTypeOf('string');
      expect(frSettings.errors[key]).toBeTypeOf('string');
    }
  });

  it('contains common unknownError fallback in EN and FR', () => {
    expect(enCommon.unknownError).toBeTypeOf('string');
    expect(frCommon.unknownError).toBeTypeOf('string');
  });
});
