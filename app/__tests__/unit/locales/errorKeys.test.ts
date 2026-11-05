import { describe, expect, it } from 'vitest';
import { auth as enAuth, common as enCommon, form as enForm } from '@/locales/en';
import { auth as frAuth, common as frCommon, form as frForm } from '@/locales/fr';

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

const requiredEventFormErrorKeys = [
  'flightRequired',
  'transportRequired',
  'hotelRequired',
  'checkoutAfterCheckin',
  'restaurantRequired',
  'activityRequired',
  'linkRequired',
] as const;

describe('locale error key coverage', () => {
  it('contains required auth error keys in EN and FR', () => {
    for (const key of requiredAuthErrorKeys) {
      expect(enAuth.errors[key]).toBeTypeOf('string');
      expect(frAuth.errors[key]).toBeTypeOf('string');
    }
  });

  it('contains required form error keys in EN and FR', () => {
    for (const key of requiredEventFormErrorKeys) {
      expect(enForm.event.errors[key]).toBeTypeOf('string');
      expect(frForm.event.errors[key]).toBeTypeOf('string');
    }
    expect(enForm.trip.dateOrder).toBeTypeOf('string');
    expect(frForm.trip.dateOrder).toBeTypeOf('string');
  });

  it('contains the database error screen in EN and FR', () => {
    expect(Object.keys(frCommon.databaseError)).toEqual(Object.keys(enCommon.databaseError));
    expect(Object.keys(frCommon.databaseError.causes)).toEqual(
      Object.keys(enCommon.databaseError.causes),
    );
  });

  it('contains common unknownError fallback in EN and FR', () => {
    expect(enCommon.unknownError).toBeTypeOf('string');
    expect(frCommon.unknownError).toBeTypeOf('string');
  });
});
