import { createClient } from './node_modules/@supabase/supabase-js/dist/main/index.js';
import fs from 'fs';

// Manual env parsing
const env = fs.readFileSync('.env', 'utf8');
const lines = env.split('\n');
const envVars = {};
lines.forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.join('=').trim();
    }
});

const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);

async function cleanup() {
  console.log('Starting standalone cleanup...');
  const { data: rules, error } = await supabase.from('reminder_rules').select('*');
  if (error) {
     console.error('Error fetching rules:', error);
     return;
  }
  
  const seen = new Set();
  const toDelete = [];

  for (const rule of rules) {
    const key = `${rule.user_id}-${rule.trigger_type}-${rule.days_offset}`;
    if (seen.has(key)) {
      toDelete.push(rule.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    console.log(`Found ${toDelete.length} duplicates. Deleting...`);
    const { error: delError } = await supabase.from('reminder_rules').delete().in('id', toDelete);
    if (delError) console.error('Delete error:', delError);
    else console.log('Successfully deleted duplicates.');
  } else {
    console.log('No duplicates found.');
  }
}

cleanup();
