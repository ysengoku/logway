import { Hono } from 'hono';
import { supabaseWithAuth } from '../db/supabase';
import type { TripInput } from '@shared/types/trip';

const trips = new Hono();

trips.get('/', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);

  const { data, error } = await db
    .from('trips')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

trips.get('/:id', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const id = c.req.param('id');

  const { data, error } = await db
    .from('trips')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

trips.post('/', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const userId = c.get('userId');
  const body = await c.req.json<TripInput>();

  if (!body.title) return c.json({ error: 'Title is required.' }, 400);

  const { data, error } = await db
    .from('trips')
    .insert({ ...body, owner_id: userId })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

trips.patch('/:id', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const id = c.req.param('id');
  const body = await c.req.json<Partial<TripInput>>();

  const { data, error } = await db
    .from('trips')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

trips.delete('/:id', async (c) => {
  const token = c.get('token');
  const db = supabaseWithAuth(token);
  const id = c.req.param('id');

  const { error } = await db
    .from('trips')
    .delete()
    .eq('id', id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

export default trips;
