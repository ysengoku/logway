import { PROFILE_ICON_NAMES } from '@shared/types/profileIcon';
import {
  ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
  ERROR_CODE_PROFILE_ICON_INVALID,
} from '@shared/constants/errorCodes';
import { HEX_COLOR_REGEX } from '@shared/constants/regex';
import { supabaseWithAuth } from '../db/supabase';
import type { ProfileIconName } from '@shared/types/profileIcon';
import { Hono, type Context } from 'hono';

const profiles = new Hono();

type UpdateSelfProfileBody = {
  display_name?: string;
  preferred_locale?: string | null;
  icon?: ProfileIconName;
  icon_color?: string;
  icon_bg_color?: string;
};

type AuthContext = {
  token: string;
  userId: string;
  db: ReturnType<typeof supabaseWithAuth>;
};

function isProfileIconName(value: unknown): value is ProfileIconName {
  return typeof value === 'string' && PROFILE_ICON_NAMES.includes(value as ProfileIconName);
}

function getAuthContext(c: Context): AuthContext | null {
  const token = c.get('token') as unknown;
  const userId = c.get('userId') as unknown;

  if (typeof token !== 'string' || !token || typeof userId !== 'string' || !userId) {
    return null;
  }
  const db = supabaseWithAuth(token);
  return { token, userId, db };
}

// GET /api/profiles?user_ids=1,2,3
profiles.get('/', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const userIds = c.req.query('user_ids')?.split(',').filter(Boolean) ?? [];

  if (userIds.length === 0) {
    return c.json([]);
  }

  const { data, error } = await db.from('profiles').select('*').in('id', userIds);

  if (error) {
    return c.json({ error: error.message }, 500);
  }
  return c.json(data);
});

// GET /api/profiles/self
profiles.get('/self', async (c) => {
  const authContext = getAuthContext(c);
  if (!authContext) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const { userId, db } = authContext;
  const { data, error } = await db.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// PATCH /api/profiles/self
profiles.patch('/self', async (c) => {
  const authContext = getAuthContext(c);
  if (!authContext) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const { userId, db } = authContext;
  const rawBody = await c.req.json<unknown>();
  const body = rawBody && typeof rawBody === 'object' ? (rawBody as Record<string, unknown>) : {};

  const updates: UpdateSelfProfileBody = {};

  if (body.display_name !== undefined) {
    let trimmed = '';
    if (typeof body.display_name === 'string') {
      trimmed = body.display_name.trim();
    }
    if (!trimmed) {
      return c.json(
        {
          error: 'emptyDisplayName',
          code: ERROR_CODE_PROFILE_DISPLAY_NAME_EMPTY,
        },
        400,
      );
    }
    updates.display_name = trimmed;
  }

  if (body.preferred_locale !== undefined && typeof body.preferred_locale === 'string') {
    updates.preferred_locale = body.preferred_locale;
  }

  if (body.icon !== undefined) {
    if (!isProfileIconName(body.icon)) {
      return c.json(
        {
          error: 'invalidIcon',
          code: ERROR_CODE_PROFILE_ICON_INVALID,
        },
        400,
      );
    }
    updates.icon = body.icon;
  }

  if (body.icon_color !== undefined && typeof body.icon_color === 'string') {
    if (!HEX_COLOR_REGEX.test(body.icon_color)) {
      return c.json(
        {
          error: 'invalidIconColor',
          code: ERROR_CODE_PROFILE_ICON_INVALID,
        },
        400,
      );
    }
    updates.icon_color = body.icon_color;
  }

  if (body.icon_bg_color !== undefined && typeof body.icon_bg_color === 'string') {
    if (!HEX_COLOR_REGEX.test(body.icon_bg_color)) {
      return c.json(
        {
          error: 'invalidIconBgColor',
          code: ERROR_CODE_PROFILE_ICON_INVALID,
        },
        400,
      );
    }
    updates.icon_bg_color = body.icon_bg_color;
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: 'No updatable fields provided.' }, 400);
  }

  const { data, error } = await db
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

export default profiles;
