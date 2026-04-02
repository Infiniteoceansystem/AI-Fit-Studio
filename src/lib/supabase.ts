import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ibjmyskskztrxfpegnsi.supabase.co';
const supabaseAnonKey = 'sb_publishable_LZ85bKUWx6Kjimw6qmGP6Q_RePoxfCg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a secondary client for admin to create users without logging themselves out
export const adminAuthClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
