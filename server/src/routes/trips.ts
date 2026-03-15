import { Hono } from 'hono';
import members from './members';
import { supabaseWithAuth } from '../db/supabase';
import type { TripInput } from '@shared/types/trip';

const trips = new Hono();

function normalizeInviteCode(raw: string | undefined): string {
  return (raw ?? '').trim().toUpperCase();
}

async function findTripByInviteCode(token: string, inviteCodeRaw: string | undefined) {
  const db = supabaseWithAuth(token);
  const inviteCode = normalizeInviteCode(inviteCodeRaw);

  if (!inviteCode) {
    return { trip: null, error: 'invite_code is required.', status: 400 as const };
  }

  const { data, error } = await db.rpc('find_trip_by_invite_code', {
    p_invite_code: inviteCode,
  });

  const trip = Array.isArray(data) ? data[0] : data;
  if (error || !trip) {
    return { trip: null, error: 'Trip not found for this invite code.', status: 404 as const };
  }

  return { trip, error: null, status: 200 as const };
}

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

trips.get('/by-invite', async (c) => {
  const token = c.get('token');
  const code = c.req.query('code');
  const { trip, error, status } = await findTripByInviteCode(token, code);

  if (!trip) {
    return c.json({ error }, status);
  }

  return c.json(trip);
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
  if (!body.title) {
    return c.json({ error: 'Title is required.' }, 400);
  }

  // Generate a human-friendly 8-char invite code and ensure uniqueness.
  const genInviteCode = (len = 8) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < len; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
    return out;
  };

  let trip = null;
  let tripError = null;
  const maxAttempts = 5;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const invite_code = genInviteCode(8);
    const insertBody = { ...body, invite_code, owner_id: userId } as any;
    const res = await db.from('trips').insert(insertBody).select().single();
    trip = res.data as any;
    tripError = res.error;
    if (trip) break;
    // If unique violation, retry with new code
    if (tripError && tripError.code === '23505') continue;
    // Return immediately on other errors
    if (tripError) {
      return c.json({ error: tripError.message }, 500);
    }
  }
  if (!trip) {
    return c.json({ error: 'Failed to create trip after multiple attempts.' }, 500);
  }

  const { error: memberError } = await db
    .from('trip_members')
    .insert({ trip_id: trip.id, user_id: userId, role: 'owner' });

  if (memberError) {
    await db.from('trips').delete().eq('id', trip.id);
    return c.json({ error: memberError.message }, 500);
  }

  return c.json(trip, 201);
});

trips.get('/by-invite/:inviteCode', async (c) => {
  const token = c.get('token');
  const code = c.req.param('inviteCode');
  const { trip, error, status } = await findTripByInviteCode(token, code);

  if (!trip) {
    return c.json({ error }, status);
  }

  return c.json(trip);
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

trips.route('/:tripId/members', members);

export default trips;
