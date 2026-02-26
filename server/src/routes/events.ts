import { Hono } from 'hono';
import { supabase } from '../db/supabase';
import type { EventRow } from '@shared/types/event';

const events = new Hono();

// GET /api/events
events.get('/', async (c) => {
  const tripId = c.req.query('trip_id');

  let query = supabase.from('events').select('*').order('created_at', { ascending: true });

  if (tripId) {
    query = query.eq('trip_id', tripId);
  }

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// GET /api/events/:id
events.get('/:id', async (c) => {
  const id = c.req.param('id');
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// POST /api/events
events.post('/', async (c) => {
  const body = await c.req.json<Partial<EventRow>>();

  const { data, error } = await supabase.from('events').insert(body).select().single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// PATCH /api/events/:id
events.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<EventRow>>();

  const { data, error } = await supabase.from('events').update(body).eq('id', id).select().single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// DELETE /api/events/:id
events.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

export default events;
