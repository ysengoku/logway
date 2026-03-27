import { Hono } from 'hono';
import { supabaseWithAuth } from '../db/supabase';

const profiles = new Hono();

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

export default profiles;
