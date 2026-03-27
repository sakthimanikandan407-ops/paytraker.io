import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let env = {};
try {
    const envFile = fs.readFileSync('.env', 'utf-8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            env[match[1]] = match[2] ? match[2].trim() : '';
        }
    });
} catch (e) {
    console.error("Could not read .env file");
    process.exit(1);
}

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAutomations() {
    console.log("==================================================");
    console.log("🚀 TESTING AUTOMATED BILLING & REMINDERS");
    console.log("==================================================\n");

    try {
        console.log("🔍 1. Checking for Due Recurring Invoices...");
        const { data: recurringData, error: recurringError } = await supabase.rpc('get_due_recurring_invoices');
        
        if (recurringError) throw recurringError;
        
        if (!recurringData || recurringData.length === 0) {
            console.log("   ⚠️ Result: 0 recurring invoices found for today.");
        } else {
            console.log(`   ✅ SUCCESS: Found ${recurringData.length} recurring invoice(s) due today!`);
            console.log("   📄 Invoice Data:");
            console.log(JSON.stringify(recurringData[0], null, 2).replace(/^/gm, '      '));
        }

        console.log("\n--------------------------------------------------\n");

        console.log("🔍 2. Checking for Pending Invoice Reminders...");
        const { data: reminderData, error: reminderError } = await supabase.rpc('get_pending_reminders');
        
        if (reminderError) throw reminderError;

        if (!reminderData || reminderData.length === 0) {
            console.log("   ⚠️ Result: 0 invoice reminders pending for today.");
        } else {
            console.log(`   ✅ SUCCESS: Found ${reminderData.length} pending reminder(s)!`);
            console.log("   ✉️ Reminder Data:");
            console.log(JSON.stringify(reminderData[0], null, 2).replace(/^/gm, '      '));
        }

        console.log("\n==================================================");
        console.log("✅ TEST COMPLETED SUCCESSFULLY");
        console.log("==================================================");

    } catch (error) {
        console.error("\n❌ TEST FAILED WITH DATABASE ERROR:");
        console.error(error);
    }
}

testAutomations();
