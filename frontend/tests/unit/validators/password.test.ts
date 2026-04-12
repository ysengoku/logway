import { describe, expect, it } from 'vitest';
import { validatePassword } from '@/validators';

describe('validatePassword', () => {
  it('requires both fields when password is required', () => {
    expect(validatePassword('', '', true)).toBe('missingPassword');
    expect(validatePassword('Password123!', '', true)).toBe('missingPassword');
    expect(validatePassword('', 'Password123!', true)).toBe('missingPassword');
  });

  it('allows both empty fields when password is optional', () => {
    expect(validatePassword('', '', false)).toBeNull();
  });

  it('detects mismatch', () => {
    expect(validatePassword('Password123!', 'Password124!', true)).toBe('passwordsDoNotMatch');
  });

  it('requires complexity and minimum length', () => {
    expect(validatePassword('Short1!', 'Short1!', true)).toBe('weakPassword');
    expect(validatePassword('lowercase123!', 'lowercase123!', true)).toBe('weakPassword');
    expect(validatePassword('UPPERCASE123!', 'UPPERCASE123!', true)).toBe('weakPassword');
    expect(validatePassword('NoNumber!!!!', 'NoNumber!!!!', true)).toBe('weakPassword');
    expect(validatePassword('NoSymbol12345', 'NoSymbol12345', true)).toBe('weakPassword');
  });

  it('accepts a strong password', () => {
    expect(validatePassword('StrongPass123!', 'StrongPass123!', true)).toBeNull();
  });
});
