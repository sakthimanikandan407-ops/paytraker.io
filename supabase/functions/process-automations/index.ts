import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import nodemailer from "npm:nodemailer";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import autoTable from "https://esm.sh/jspdf-autotable@3.6.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to generate a professional PDF
async function generateInvoicePDF(invoice: any, items: any[]) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text("INVOICE", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("PayTrack.io", 20, 30);
    doc.text("Automated Billing Service", 20, 35);
    
    // Invoice Meta
    doc.text(`Invoice #: ${invoice.invoice_number}`, 140, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 35);
    doc.text(`Due Date: ${invoice.due_date}`, 140, 40);
    
    // Client Info
    doc.setFontSize(14);
    doc.text("Bill To:", 20, 55);
    doc.setFontSize(12);
    doc.text(invoice.client_name, 20, 62);
    doc.text(invoice.client_email, 20, 68);
    
    // Table of Items
    const tableData = items.map(item => [
        item.description,
        item.quantity.toString(),
        `${invoice.currency} ${item.rate}`,
        `${invoice.currency} ${item.amount}`
    ]);
    
    autoTable(doc, {
        startY: 80,
        head: [['Description', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    
    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`Total Amount: ${invoice.currency} ${invoice.total}`, 140, finalY);
    
    return new Uint8Array(doc.output('arraybuffer'));
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const payload = await req.json().catch(() => ({}));
        const action = payload.action;

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: Deno.env.get('GMAIL_USER'),
                pass: Deno.env.get('GMAIL_APP_PASSWORD'),
            },
        });

        const logs: string[] = [];

        // 1. REAL-TIME INVOICE TRIGGER (Pushed from Database Webhook)
        if (action === 'new_invoice' && payload.invoice_id) {
            const { data: invoice, error: invError } = await supabase
                .from('invoices')
                .select('*, client:clients(*)')
                .eq('id', payload.invoice_id)
                .single();

            if (invError || !invoice) throw new Error('Invoice not found: ' + (invError?.message || 'Unknown error'));

            const { data: items } = await supabase
                .from('invoice_items')
                .select('*')
                .eq('invoice_id', payload.invoice_id);

            const pdfBytes = await generateInvoicePDF(Object.assign({}, invoice, { 
                client_name: invoice.client.name, 
                client_email: invoice.client.email 
            }), items || []);

            await transporter.sendMail({
                from: `"PayTrack" <${Deno.env.get('GMAIL_USER')}>`,
                to: invoice.client.email,
                subject: `Your Invoice ${invoice.invoice_number} from PayTrack`,
                text: `Hi ${invoice.client.name},\n\nPlease find your invoice ${invoice.invoice_number} attached. You can also view it online in your portal.\n\nThank you for choosing PayTrack!`,
                attachments: [{ filename: `${invoice.invoice_number}.pdf`, content: pdfBytes }]
            });
            logs.push(`Sent real-time invoice to ${invoice.client.email}`);
        }

        // 2. BILLING AUTOMATION
        if (action === 'billing' || action === 'all') {
            const { data: dueInvoices, error: rpcError } = await supabase.rpc('get_due_recurring_invoices');
            if (rpcError) throw new Error('Failed to fetch recurring: ' + rpcError.message);

            for (const item of (dueInvoices || [])) {
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

                if (invError) continue;

                const lineItem = {
                    invoice_id: invResult.id,
                    description: item.description + ' - Auto Billed',
                    quantity: 1,
                    rate: item.total,
                    amount: item.total
                };
                await supabase.from('invoice_items').insert(lineItem);

                const nextDate = new Date(item.next_issue_date);
                if (item.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                else if (item.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                else if (item.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
                await supabase.from('recurring_invoices').update({ next_issue_date: nextDate.toISOString() }).eq('id', item.recurring_id);

                // Generate PDF for the new invoice
                const pdfBytes = await generateInvoicePDF(Object.assign({}, invResult, { client_name: item.client_name, client_email: item.client_email }), [lineItem]);

                await transporter.sendMail({
                    from: `"PayTrack Billing" <${Deno.env.get('GMAIL_USER')}>`,
                    to: item.client_email,
                    subject: 'Your new automated invoice from PayTrack',
                    text: `Hi ${item.client_name},\n\nA new invoice for ${item.currency} ${item.total} has been generated within your PayTrack portal. Please see the attached PDF.\n\nThank you!`,
                    attachments: [{ filename: `${invNum}.pdf`, content: pdfBytes }]
                });
                logs.push(`Auto-billed ${item.client_email}`);
            }
        }

        // 3. REMINDER AUTOMATION
        if (action === 'reminders' || action === 'all') {
            const { data: pending, error: remError } = await supabase.rpc('get_pending_reminders');
            if (remError) throw new Error('Failed to fetch reminders: ' + remError.message);

            for (const item of (pending || [])) {
                // Fetch line items for the PDF
                const { data: invoiceItems } = await supabase.from('invoice_items').select('*').eq('invoice_id', item.invoice_id);

                const pdfBytes = await generateInvoicePDF(item, invoiceItems || []);

                await transporter.sendMail({
                    from: `"PayTrack Reminders" <${Deno.env.get('GMAIL_USER')}>`,
                    to: item.client_email,
                    subject: `Payment Reminder: Invoice ${item.invoice_number}`,
                    text: `Hi ${item.client_name},\n\nJust a quick reminder that invoice ${item.invoice_number} is due on ${item.due_date}. A copy of the invoice is attached for your reference.\n\nBest, PayTrack Team`,
                    attachments: [{ filename: `Invoice_${item.invoice_number}.pdf`, content: pdfBytes }]
                });

                await supabase.from('reminder_logs').insert({
                    invoice_id: item.invoice_id,
                    rule_id: item.rule_id,
                    channel: 'email',
                    recipient_email: item.client_email,
                    status: 'sent'
                });
                logs.push(`Reminded ${item.client_email}`);
            }
        }

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
