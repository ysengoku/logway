import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const authMock = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: authMock,
  },
}));

import { useAuthStore } from '@/stores/auth';

describe('auth store error mapping', () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    authMock.signUp.mockResolvedValue({ error: null });
    authMock.signInWithPassword.mockResolvedValue({ error: null });
    authMock.signOut.mockResolvedValue({ error: null });
    authMock.resetPasswordForEmail.mockResolvedValue({ error: null });
    authMock.updateUser.mockResolvedValue({ data: null, error: null });
    authMock.getSession.mockResolvedValue({ data: { session: null } });
    authMock.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('maps email code to authError.email on signIn', async () => {
    authMock.signInWithPassword.mockResolvedValueOnce({
      error: { code: 'email_exists', message: 'email exists' },
    });

    const store = useAuthStore();
    await store.signIn('user@example.com', 'StrongPass123!');

    expect(store.authError.email).toBe('auth.errors.emailExists');
    expect(store.authError.password).toBeNull();
    expect(store.authError.auth).toBeNull();
  });

  it('maps password code to authError.password on signIn', async () => {
    authMock.signInWithPassword.mockResolvedValueOnce({
      error: { code: 'weak_password', message: 'weak password' },
    });

    const store = useAuthStore();
    await store.signIn('user@example.com', 'weak');

    expect(store.authError.email).toBeNull();
    expect(store.authError.password).toBe('auth.errors.weakPassword');
    expect(store.authError.auth).toBeNull();
  });

  it('maps rate-limit code to authError.auth on signIn', async () => {
    authMock.signInWithPassword.mockResolvedValueOnce({
      error: { code: 'over_request_rate_limit', message: 'rate limited' },
    });

    const store = useAuthStore();
    await store.signIn('user@example.com', 'StrongPass123!');

    expect(store.authError.email).toBeNull();
    expect(store.authError.password).toBeNull();
    expect(store.authError.auth).toBe('auth.errors.tooManyRequests');
  });

  it('maps validation_failed to both email and password', async () => {
    authMock.signInWithPassword.mockResolvedValueOnce({
      error: { code: 'validation_failed', message: 'invalid input' },
    });

    const store = useAuthStore();
    await store.signIn('user@example.com', 'StrongPass123!');

    expect(store.authError.email).toBe('auth.errors.validationFailed');
    expect(store.authError.password).toBe('auth.errors.validationFailed');
    expect(store.authError.auth).toBeNull();
  });
});
