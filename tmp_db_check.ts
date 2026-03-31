import { supabase } from './src/lib/supabase';

async function checkReminders() {
    const { data: rules, error: rulesError } = await supabase.from('reminder_rules').select('*');
    const { data: invoices, error: invoicesError } = await supabase.from('invoices').select('*');
    const { data: logs, error: logsError } = await supabase.from('reminder_logs').select('*');

    console.log('--- DB Check ---');
    console.log('Rules count:', rules?.length || 0);
    console.log('Invoices count:', invoices?.length || 0);
    console.log('Logs count:', logs?.length || 0);

    if (rulesError || invoicesError || logsError) {
        console.error('Errors:', { rulesError, invoicesError, logsError });
    }
}

checkReminders();
