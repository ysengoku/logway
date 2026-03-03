import { Hono } from 'hono/quick';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { supabase } from './db/supabase';
import trips from './routes/trips';
import events from './routes/events';

const app = new Hono();

app.use(
  '*',
  cors({
    origin: 'http://localhost:5173',
  }),
);

app.use('/api/*', async (c, next) => {
  if (c.req.path == '/api/health') {
    return next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', data.user.id);
  c.set('token', token);

  return next();
});

app.route('api/trips', trips);
app.route('/api/events', events);

app.get('/api/health', async (c) => {
  const { error } = await supabase.from('events').select('count').limit(1);
  return c.json({
    status: error ? 'error' : 'ok',
    db: error ? error.message : 'connected',
  });
});

const PORT = Number(process.env.PORT) || 3000;

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  () => {
    console.log(`LogWay server running at http://localhost:${PORT}`);
  },
);

export default app;
