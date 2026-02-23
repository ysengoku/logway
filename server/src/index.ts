import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { supabase } from './db/supabase'

const app = new Hono()

app.use('*', cors({
  origin: 'http://localhost:5173',
}))

app.get('/api/health', async (c) => {
  const { error } = await supabase.from('events').select('count').limit(1)
  return c.json({
    status: error ? 'error' : 'ok',
    db: error ? error.message : 'connected',
  })
})

const PORT = Number(process.env.PORT) || 3000

serve({
  fetch: app.fetch,
  port: PORT,
}, () => {
  console.log(`LogWay server running at http://localhost:${PORT}`)
})

export default app
