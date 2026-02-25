import { Hono } from 'hono';
import { supabase } from '../db/supabase';
import type { EventRow } from '@shared/types/event';

const events = new Hono();

// GET /api/events - 全イベント取得
events.get('/', async (c) => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// GET /api/events/:id - 1件取得
events.get('/:id', async (c) => {
  const id = c.req.param('id');
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

// POST /api/events - 新規作成
events.post('/', async (c) => {
  const body = await c.req.json<Partial<EventRow>>();

  const { data, error } = await supabase.from('events').insert(body).select().single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// PATCH /api/events/:id - 更新
events.patch('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<EventRow>>();

  const { data, error } = await supabase.from('events').update(body).eq('id', id).select().single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// DELETE /api/events/:id - 削除
events.delete('/:id', async (c) => {
  const id = c.req.param('id');

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

export default events;
