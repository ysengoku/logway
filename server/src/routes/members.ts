import { Hono } from 'hono';
import { supabaseWithAuth } from '../db/supabase';
import { ERROR_CODE_ALREADY_JOINED } from '@shared/constants/errorCodes';

const members = new Hono();
// PostgreSQL unique_violation: duplicate key value violates unique constraint.
const PG_UNIQUE_VIOLATION = '23505';

// GET /api/trips/:tripId/members
members.get('/', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const tripId = c.req.param('tripId');

  const { data, error } = await db
    .from('trip_members')
    .select('*')
    .eq('trip_id', tripId);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// POST /api/trips/:tripId/members
members.post('/', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const tripId = c.req.param('tripId');
  const userId = c.get('userId');

  const { data, error } = await db
    .from('trip_members')
    .insert({ trip_id: tripId, user_id: userId, role: 'member' })
    .select()
    .single();

  if (error?.code === PG_UNIQUE_VIOLATION) {
    return c.json({ error: 'Already joined.', code: ERROR_CODE_ALREADY_JOINED }, 409);
  }
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// DELETE /api/trips/:tripId/members/:userId
members.delete('/:userId', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const tripId = c.req.param('tripId');
  const userId = c.req.param('userId');

  const { error } = await db
    .from('trip_members')
    .delete()
    .eq('trip_id', tripId)
    .eq('user_id', userId);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

export default members;
