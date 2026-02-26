import { Hono } from 'hono';
import { supabase } from '../db/supabase';
import type { TripInput } from '@shared/types/trip';

const trips = new Hono();

// GET /api/trips
trips.get('/', async (c) => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// GET /api/trips/:id
trips.get('/:id', async (c) => {
  const id = c.req.param('id');
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// POST /api/trips
trips.post('/', async (c) => {
  const body = await c.req.json<TripInput>();

  if (!body.title) return c.json({ error: 'Title is required.' }, 400);

  const { data, error } = await supabase
    .from('trips')
    .insert(body)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// PATCH /api/trips/:id
trips.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<TripInput>>();

  const { data, error } = await supabase
    .from('trips')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// DELETE /api/trips/:id
trips.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const { error } = await supabase
    .from('trips')
    .delete()
    .eq('id', id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

export default trips;
