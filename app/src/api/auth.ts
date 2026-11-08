import { API_PATH } from './paths';
import type { Session } from '@/shared/types/auth';

export async function fetchSession(): Promise<Session | null> {
  try {
    const response = await fetch(API_PATH.AUTH_TOKEN, { method: 'POST' });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as Session;
    return data;
  } catch {
    return null;
  }
}

export async function logout(): Promise<boolean> {
  try {
    const response = await fetch(API_PATH.AUTH_LOGOUT, { method: 'POST' });
    if (!response.ok) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
