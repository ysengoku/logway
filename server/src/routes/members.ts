import { Hono } from 'hono';
import { supabaseWithAuth, supabaseAdmin } from '../db/supabase';

const members = new Hono();

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

// POST /api/trips/:tripId/members/invite
members.post('/join', async (c) => {
  // TODO
});

// DELETE /api/trips/:tripId/members/:userId
members.delete('/:userId', async (c) => {
  const token = c.get('token');
  const db = await supabaseWithAuth(token);
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
