import { Hono } from 'hono';
import { supabaseWithAuth } from '../db/supabase';
import type { EventRow } from '@shared/types/event';

const events = new Hono();

// GET /api/events
events.get('/', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const tripId = c.req.query('trip_id');

  let query = db.from('events').select('*').order('created_at', { ascending: true });

  if (tripId) {
    query = query.eq('trip_id', tripId);
  }

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// GET /api/events/:id
events.get('/:id', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const id = c.req.param('id');

  const { data, error } = await db.from('events').select('*').eq('id', id).single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// POST /api/events
events.post('/', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const body = await c.req.json<Partial<EventRow>>();

  const { data, error } = await db.from('events').insert(body).select().single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// PATCH /api/events/:id
events.patch('/:id', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const id = c.req.param('id');
  const body = await c.req.json<Partial<EventRow>>();

  const { data, error } = await db.from('events').update(body).eq('id', id).select().single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// DELETE /api/events/:id
events.delete('/:id', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const id = c.req.param('id');

  const { error } = await db.from('events').delete().eq('id', id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

export default events;
