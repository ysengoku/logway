import { Hono } from 'hono';
import { supabaseWithAuth } from '../db/supabase';

const profiles = new Hono();

type UpdateSelfProfileBody = {
  display_name?: string;
  preferred_locale?: string | null;
};

// GET /api/profiles?user_ids=1,2,3
profiles.get('/', async (c) => {
  const token = c.get('token');
  const db = await supabaseWithAuth(token);
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
  const token = c.get('token');
  const userId = c.get('userId');
  const db = await supabaseWithAuth(token);

  const { data, error } = await db.from('profiles').select('*').eq('id', userId).single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(data);
});

// PATCH /api/profiles/self
profiles.patch('/self', async (c) => {
  const token = c.get('token');
  const userId = c.get('userId');
  const db = await supabaseWithAuth(token);
  const body = await c.req.json<UpdateSelfProfileBody>();

  const updates: UpdateSelfProfileBody = {};

  if (typeof body.display_name === 'string') {
    const trimmed = body.display_name.trim();
    if (!trimmed) {
      return c.json({ error: 'display_name cannot be empty.' }, 400);
    }
    updates.display_name = trimmed;
  }

  if (body.preferred_locale === null || typeof body.preferred_locale === 'string') {
    updates.preferred_locale = body.preferred_locale;
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
