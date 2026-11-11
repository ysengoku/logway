import { API_PATH } from './paths';
import type { Session } from '@/shared/types/auth';

type SessionResult =
  { status: 'ok'; session: Session } | { status: 'unauthenticated' } | { status: 'unavailable' };

export async function fetchSession(): Promise<SessionResult> {
  try {
    const response = await fetch(API_PATH.AUTH_TOKEN, { method: 'POST' });
    switch (response.status) {
      case 200: {
        const session = (await response.json()) as Session;
        return { status: 'ok', session };
      }
      case 401:
        return { status: 'unauthenticated' };
      default:
        return { status: 'unavailable' };
    }
  } catch {
    return { status: 'unavailable' };
  }
}

export async function logout(allDevices: boolean): Promise<boolean> {
  try {
    const response = await fetch(API_PATH.AUTH_LOGOUT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allDevices }),
    });
    if (!response.ok) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
