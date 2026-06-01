import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function cleanup() {
  console.log('Starting cleanup (ESM)...');
  
  const { data: rules, error } = await supabase.from('reminder_rules').select('*');
  if (error) {
     console.error('Error fetching rules:', error);
     return;
  }
  if (!rules) return;

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
