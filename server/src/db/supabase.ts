import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
);

// Create a client with user's JWT token
export function supabaseWithAuth(token: string) {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    },
  );
}
