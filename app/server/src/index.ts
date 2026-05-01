import { Hono } from 'hono/quick';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { createSupabaseClient } from './db/supabase';
import events from './routes/events';
import profiles from './routes/profiles';
import trips from './routes/trips';

const app = new Hono();

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ??
  process.env.SITE_URL ??
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow requests with no Origin header (server-to-server, curl, health checks).
      if (!origin) {
        return origin;
      }
      return allowedOrigins.includes(origin) ? origin : '';
    },
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
  const supabase = createSupabaseClient();
  type AuthGetUserResult = { data: { user: { id: string } | null } | null; error: any };
  interface AuthWithGetUser {
    getUser(token?: string): Promise<AuthGetUserResult>;
  }
  const result = await (supabase.auth as unknown as AuthWithGetUser).getUser(token);
  const { data, error } = result;

  if (error || !data?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  c.set('userId', data.user.id);
  c.set('token', token);

  return next();
});

app.route('/api/events', events);
app.route('/api/profiles', profiles);
app.route('/api/trips', trips);

app.get('/api/health', async (c) => {
  const supabase = createSupabaseClient();
  const { error } = await supabase.from('events').select('count').limit(1);
  return c.json({
    status: error ? 'error' : 'ok',
    db: error ? error.message : 'connected',
  });
});

const PORT = Number(process.env.PORT) || 3000;

if (process.env.RUN_LOCAL === 'true' || process.env.NODE_ENV === 'development') {
  serve(
    {
      fetch: app.fetch,
      port: PORT,
    },
    () => {
      console.log(`Allowed CORS origins: ${allowedOrigins.join(', ') || '(none)'}`);
      console.log(`LogWay server running at http://localhost:${PORT}`);
    },
  );
}

export default app;
