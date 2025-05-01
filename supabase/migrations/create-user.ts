// create-user.ts
import { createClient } from '@supabase/supabase-js';

// Tu URL y KEY del proyecto (usa la pública ANON_KEY)
const supabase = createClient(
  'https://zkmshgdczwetmyfdsmix.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprbXNoZ2RjendldG15ZmRzbWl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MjA0MjgsImV4cCI6MjA2MTA5NjQyOH0.XOXDLjUJQd4IN_1n7v5H21J7xFxTl24RsiSM-arUHAQ'
);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@example.com',
    password: 'password123',
  });

  if (error) {
    console.error('❌ Error al crear usuario:', error.message);
  } else {
    console.log('✅ Usuario creado correctamente:', data);
  }
}

main();
