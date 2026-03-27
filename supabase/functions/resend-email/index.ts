import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload = await req.json().catch(() => ({}));
        const action = payload.action;

        // Initialize Supabase Admin Client
        // Note: Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in your edge function secrets mapping!
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const client = new SmtpClient();
        await client.connectTLS({
            hostname: 'smtp.gmail.com',
            port: 465,
            username: Deno.env.get('GMAIL_USER'),
            password: Deno.env.get('GMAIL_APP_PASSWORD'),
        });

        const sendEmail = async (to: string, subject: string, body: string) => {
            console.log(`Sending email to ${to}`);
            await client.send({
                from: Deno.env.get('GMAIL_USER')!,
                to,
                subject,
                content: body,
                html: body.replace(/\n/g, '<br>'),
            });
        };

        const logs: string[] = [];

        // 1. BILLING AUTOMATION
        if (action === 'billing' || action === 'all') {
            const { data: dueClients, error: rpcError } = await supabase.rpc('get_due_recurring_invoices');
            if (rpcError) throw new Error('Failed to fetch recurring: ' + rpcError.message);

            for (const item of (dueClients || [])) {
                // Generate a simple dynamic invoice number
                const invNum = `INV-${new Date().toISOString().split('T')[0].replace(/-/g,'')}-${item.client_name.substring(0,3).toUpperCase()}`;
                
                const { data: invResult, error: invError } = await supabase.from('invoices').insert({
                    user_id: item.user_id,
                    client_id: item.client_id,
                    invoice_number: invNum,
                    status: 'sent',
                    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    subtotal: item.subtotal,
                    tax_rate: item.tax_rate,
                    total: item.total,
                    currency: item.currency
                }).select().single();

                if (invError) {
                    console.error("Invoice creation failed:", invError);
                    continue; // Skip this client if invoice generation fails
                }

                // Create the line items for the invoice
                await supabase.from('invoice_items').insert({
                    invoice_id: invResult.id,
                    description: item.description + ' - Auto Billed',
                    quantity: 1,
                    rate: item.total,
                    amount: item.total
                });

                // Compute the next billing date for this recurring client
                const nextDate = new Date(item.next_issue_date);
                if (item.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                else if (item.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                else if (item.frequency === 'quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
                else if (item.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

                await supabase.from('recurring_invoices').update({ next_issue_date: nextDate.toISOString() }).eq('id', item.recurring_id);

                // Send the Invoice Email!
                const body = `Hi ${item.client_name},\n\nPlease find your recurring invoice for ${item.currency} ${item.total} attached to your client portal.\n\nDescription: ${item.description}\n\nThank you for your business!`;
                await sendEmail(item.client_email, 'Your new invoice from PayTrack', body);
                logs.push(`Auto-billed ${item.client_email} for ${item.currency} ${item.total}`);
            }
        }

        // 2. REMINDER AUTOMATION
        if (action === 'reminders' || action === 'all') {
            const { data: pending, error: remError } = await supabase.rpc('get_pending_reminders');
            if (remError) throw new Error('Failed to fetch reminders: ' + remError.message);

            for (const item of (pending || [])) {
                // Send the Reminder Email
                const body = `Hi ${item.client_name},\n\nThis is a friendly reminder that Invoice ${item.invoice_number} for ${item.currency} ${item.total} is actively due on ${item.due_date}.\n\nPlease let us know if you need any assistance.\n\nThanks!`;
                await sendEmail(item.client_email, `Reminder: Invoice ${item.invoice_number} is due soon`, body);

                // Log it so we don't spam them again today
                await supabase.from('reminder_logs').insert({
                    invoice_id: item.invoice_id,
                    rule_id: item.rule_id,
                    channel: 'email',
                    recipient_email: item.client_email,
                    status: 'sent'
                });
                logs.push(`Reminded ${item.client_email} for INV ${item.invoice_number}`);
            }
        }

        // 3. REGULAR DIRECT SENDING (Backward Compatibility)
        if (payload.to && payload.subject && payload.body && !action) {
            await sendEmail(payload.to, payload.subject, payload.body);
            logs.push(`Direct email sent to ${payload.to}`);
        }

        await client.close();

        return new Response(JSON.stringify({ success: true, logs }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
