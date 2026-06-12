import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import nodemailer from "npm:nodemailer";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";
import autoTable from "https://esm.sh/jspdf-autotable@3.6.0";
import { encodeBase64 } from "https://deno.land/std@0.203.0/encoding/base64.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to generate a professional PDF
// Helper to generate a professional PDF
async function generateInvoicePDF(invoice: any, items: any[], profile?: any, logoBytes?: Uint8Array | null, logoContentType?: string) {
    const doc = new jsPDF();
    
    let senderX = 20;
    
    if (logoBytes) {
        try {
            const base64 = encodeBase64(logoBytes);
            const format = logoContentType?.includes('png') ? 'PNG' : 'JPEG';
            
            const imgProps = doc.getImageProperties(base64);
            const maxW = 60; // Improved free size limits for wider logos
            const maxH = 30; // Improved free size limits for taller logos
            let width = imgProps.width;
            let height = imgProps.height;
            const ratio = width / height;
            
            if (width > maxW) {
                width = maxW;
                height = width / ratio;
            }
            if (height > maxH) {
                height = maxH;
                width = height * ratio;
            }
            
            doc.addImage(base64, format, 20, 15, width, height);
            senderX = 20 + width + 5; // dynamic layout spacing
        } catch (e) {
            console.error('Failed to load logo image:', e);
        }
    }
    
    // Sender Details (Top Left)
    const companyName = profile?.company_name || profile?.full_name || "PayTraker.io";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text(companyName, senderX, 22);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    
    let currentY = 27;
    if (profile?.full_name && profile?.company_name) {
        doc.text(profile.full_name, senderX, currentY);
        currentY += 5;
    }
    if (profile?.gst_number) {
        doc.text(`GST: ${profile.gst_number}`, senderX, currentY);
    }
    
    // Invoice Title (Top Right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text("INVOICE", 190, 22, { align: "right" });

    // Invoice Meta (Top Right)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Invoice #: ${invoice.invoice_number}`, 190, 30, { align: "right" });
    doc.text(`Date: ${new Date(invoice.issue_date || Date.now()).toLocaleDateString()}`, 190, 35, { align: "right" });
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 190, 40, { align: "right" });
    
    // Horizontal Divider
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(20, 47, 190, 47);
    
    // Client Details (Bill To)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("BILL TO:", 20, 56);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text(invoice.client_name, 20, 62);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(invoice.client_email, 20, 67);
    
    const formatAmt = (val: number) => {
        const amtStr = val.toFixed(2);
        return invoice.currency === 'INR' ? `INR ${amtStr}` : `$ ${amtStr}`;
    };
    
    // Table of Items
    const tableData = items.map(item => [
        item.description,
        item.quantity.toString(),
        formatAmt(item.rate),
        formatAmt(item.amount)
    ]);
    
    autoTable(doc, {
        startY: 74,
        head: [['Description', 'Qty', 'Rate', 'Amount']],
        body: tableData,
        theme: 'striped',
        headStyles: { 
            fillColor: [79, 70, 229], // Indigo 500
            textColor: 255, 
            fontSize: 9, 
            fontStyle: 'bold',
            halign: 'left'
        },
        bodyStyles: { 
            fontSize: 9,
            textColor: [51, 65, 85] // Slate 700
        },
        columnStyles: {
            0: { cellWidth: 'auto', halign: 'left' },
            1: { halign: 'center', cellWidth: 15 },
            2: { halign: 'right', cellWidth: 30 },
            3: { halign: 'right', cellWidth: 30 }
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252] // Slate 50
        },
        margin: { left: 20, right: 20 },
    });
    
    // Totals Section
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    let currentYTotals = finalY;
    
    // Check if it fits on the page
    if (finalY > 260) {
        doc.addPage();
        currentYTotals = 25;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("Subtotal:", 140, currentYTotals, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text(formatAmt(invoice.subtotal || invoice.total), 190, currentYTotals, { align: "right" });

    if (invoice.tax_rate > 0) {
        currentYTotals += 6;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Tax (${invoice.tax_rate}%):`, 140, currentYTotals, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 65, 85);
        doc.text(formatAmt(invoice.tax_amount || 0), 190, currentYTotals, { align: "right" });
    }

    currentYTotals += 8;
    // Highlighted Total box
    doc.setFillColor(243, 244, 246); // Gray-100
    doc.rect(115, currentYTotals - 5, 75, 10, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text("Total Amount:", 140, currentYTotals + 1.5, { align: "right" });
    doc.setFontSize(11);
    doc.text(formatAmt(invoice.total), 190, currentYTotals + 1.5, { align: "right" });

    // Thank you / Note footer
    const footerY = Math.max(currentYTotals + 20, 250);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text("Thank you for your business!", 105, footerY, { align: "center" });
    doc.text("For any payment queries, contact the sender email directly.", 105, footerY + 5, { align: "center" });
    
    return new Uint8Array(doc.output('arraybuffer'));
}

function generateEmailHTML(options: {
    clientName: string;
    invoiceNumber: string;
    dueDate: string;
    total: number;
    currency: string;
    companyName: string;
    type: 'new' | 'billing' | 'reminder';
}) {
    const currencySymbol = options.currency === 'INR' ? 'INR ' : '$';
    const totalFormatted = `${currencySymbol}${options.total.toFixed(2)}`;
    const company = options.companyName || 'PayTraker';
    
    let headingText = '';
    let bodyText = '';
    
    if (options.type === 'new') {
        headingText = 'New Invoice Generated';
        bodyText = `A new invoice has been generated for your recent services. Please find the details below and the attached invoice copy.`;
    } else if (options.type === 'billing') {
        headingText = 'Automated Invoice Generated';
        bodyText = `This is an automated invoice for your subscription/recurring billing with ${company}. The invoice is attached to this email.`;
    } else {
        headingText = 'Payment Reminder';
        bodyText = `This is a reminder that invoice ${options.invoiceNumber} is due soon. Please review the details below to make your payment on time.`;
    }

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headingText}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      margin: 0;
      padding: 24px;
      background-color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    h2 {
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 16px;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 16px 0;
    }
    .details {
      margin: 24px 0;
      padding: 20px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .details-row {
      margin-bottom: 8px;
      font-size: 14px;
    }
    .details-row:last-child {
      margin-bottom: 0;
    }
    .label {
      color: #64748b;
      font-weight: 500;
      display: inline-block;
      width: 140px;
    }
    .value {
      color: #0f172a;
      font-weight: 600;
    }
    .total {
      color: #6366f1;
      font-weight: 700;
    }
    .footer {
      margin-top: 32px;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>${headingText}</h2>
    <p>Hi ${options.clientName},</p>
    <p>${bodyText}</p>
    
    <div class="details">
      <div class="details-row">
        <span class="label">Invoice Number:</span>
        <span class="value">${options.invoiceNumber}</span>
      </div>
      <div class="details-row">
        <span class="label">Due Date:</span>
        <span class="value">${options.dueDate}</span>
      </div>
      <div class="details-row">
        <span class="label">Amount Due:</span>
        <span class="value total">${totalFormatted}</span>
      </div>
    </div>
    
    <p>Please find the invoice copy attached to this email.</p>
    
    <p>Best regards,<br><strong>${company}</strong></p>
    
    <div class="footer">
      <p>Sent by ${company} • Powered by PayTraker.io</p>
    </div>
  </div>
</body>
</html>
    `;
}

async function runWithLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
    const active: Promise<void>[] = [];
    for (const item of items) {
        const p = fn(item).then(() => {
            const index = active.indexOf(p);
            if (index > -1) active.splice(index, 1);
        });
        active.push(p);
        if (active.length >= limit) {
            await Promise.race(active);
        }
    }
    await Promise.all(active);
}

async function sendInvoiceEmail({
    transporter,
    to,
    fromName,
    gmailUser,
    replyTo,
    subject,
    textBody,
    htmlBody,
    pdfBytes,
    pdfFilename
}: {
    transporter: any;
    to: string;
    fromName: string;
    gmailUser: string;
    replyTo?: string;
    subject: string;
    textBody: string;
    htmlBody: string;
    pdfBytes: Uint8Array;
    pdfFilename: string;
}) {
    const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
    const isGmailSmtp = smtpHost.includes('gmail.com') || gmailUser.endsWith('@gmail.com');

    const emailAttachments: any[] = [
        { filename: pdfFilename, content: pdfBytes }
    ];

    const mailOptions: any = {
        from: `"${fromName}" <${gmailUser}>`,
        to: to,
        subject: subject,
        attachments: emailAttachments
    };

    if (isGmailSmtp) {
        // Gmail Safe Mode: Plain text body to avoid spam flagging, no Reply-To header to avoid domain mismatch penalty
        mailOptions.text = textBody;
        mailOptions.html = textBody.replace(/\n/g, '<br>');
    } else {
        // Custom/Professional SMTP Mode: Enable full styled HTML, Reply-To
        mailOptions.html = htmlBody;
        if (replyTo) {
            mailOptions.replyTo = replyTo;
        }
    }

    await transporter.sendMail(mailOptions);
}


serve(async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    let transporter;
    try {
        const payload = await req.json().catch(() => ({}));
        const action = payload.action;

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') || '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        );

        const gmailUser = Deno.env.get('VITE_SENDER_EMAIL') || Deno.env.get('GMAIL_USER') || '';
        const gmailPass = Deno.env.get('VITE_GMAIL_APP_PASSWORD') || Deno.env.get('GMAIL_APP_PASSWORD') || '';

        const smtpHost = Deno.env.get('SMTP_HOST') || 'smtp.gmail.com';
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '465');
        const smtpSecure = Deno.env.get('SMTP_SECURE') !== 'false';
        const smtpUser = Deno.env.get('SMTP_USER') || gmailUser;
        const smtpPass = Deno.env.get('SMTP_PASS') || gmailPass;

        transporter = nodemailer.createTransport({
            pool: true,
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            maxConnections: 3,
            maxMessages: 100,
        });

        const logs: string[] = [];

        // 1. REAL-TIME INVOICE TRIGGER (Pushed from Database Webhook or manual dispatch)
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

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', invoice.user_id)
                .single();

            // Fetch owner user email for Reply-To
            let replyToEmail = undefined;
            try {
                const { data: userResp } = await supabase.auth.admin.getUser(invoice.user_id);
                if (userResp?.user?.email) {
                    replyToEmail = userResp.user.email;
                }
            } catch (err) {
                console.error('Failed to get user auth email:', err);
            }

            // Pre-fetch logo bytes if logo_url exists
            let logoBytes: Uint8Array | null = null;
            let logoContentType = '';
            if (profile?.logo_url) {
                try {
                    const resp = await fetch(profile.logo_url);
                    if (resp.ok) {
                        logoContentType = resp.headers.get('content-type') || 'image/png';
                        const arrayBuffer = await resp.arrayBuffer();
                        logoBytes = new Uint8Array(arrayBuffer);
                    }
                } catch (e) {
                    console.error('Failed to fetch logo:', e);
                }
            }

            const pdfBytes = await generateInvoicePDF(Object.assign({}, invoice, { 
                client_name: invoice.client.name, 
                client_email: invoice.client.email 
            }), items || [], profile, logoBytes, logoContentType);

            const fromName = profile?.company_name || profile?.full_name || 'PayTraker';
            const htmlBody = generateEmailHTML({
                clientName: invoice.client.name,
                invoiceNumber: invoice.invoice_number,
                dueDate: new Date(invoice.due_date).toLocaleDateString(),
                total: invoice.total,
                currency: invoice.currency,
                companyName: fromName,
                type: 'new'
            });

            const textBody = `Hi ${invoice.client.name},\n\nA new invoice (${invoice.invoice_number}) has been generated for your recent services.\n\nInvoice Details:\n- Invoice Number: ${invoice.invoice_number}\n- Due Date: ${new Date(invoice.due_date).toLocaleDateString()}\n- Amount Due: ${invoice.currency === 'INR' ? 'INR ' : '$'}${invoice.total.toFixed(2)}\n\nPlease find the invoice copy attached to this email.\n\nBest regards,\n${fromName}`;

            await sendInvoiceEmail({
                transporter,
                to: invoice.client.email,
                fromName,
                gmailUser,
                replyTo: replyToEmail,
                subject: `Your Invoice ${invoice.invoice_number} from ${fromName}`,
                textBody,
                htmlBody,
                pdfBytes,
                pdfFilename: `${invoice.invoice_number}.pdf`
            });
            logs.push(`Sent real-time invoice to ${invoice.client.email}`);
        }

        // 2. BILLING AUTOMATION
        if (action === 'billing' || action === 'all') {
            const { data: dueInvoices, error: rpcError } = await supabase.rpc('get_due_recurring_invoices');
            if (rpcError) throw new Error('Failed to fetch recurring: ' + rpcError.message);

            const batch = (dueInvoices || []).slice(0, 5);
            logs.push(`Found ${dueInvoices?.length || 0} due recurring invoices. Processing batch of ${batch.length}.`);

            await runWithLimit(batch, 3, async (item: any) => {
                try {
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
                        logs.push(`Failed to generate invoice for recurring ${item.recurring_id}: ${invError.message}`);
                        return;
                    }

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

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', item.user_id)
                        .single();

                    // Fetch user email for Reply-To
                    let replyToEmail = undefined;
                    try {
                        const { data: userResp } = await supabase.auth.admin.getUser(item.user_id);
                        if (userResp?.user?.email) replyToEmail = userResp.user.email;
                    } catch (err) {
                        console.error('Failed to get user auth email:', err);
                    }

                    // Pre-fetch logo bytes if logo_url exists
                    let logoBytes: Uint8Array | null = null;
                    let logoContentType = '';
                    if (profile?.logo_url) {
                        try {
                            const resp = await fetch(profile.logo_url);
                            if (resp.ok) {
                                logoContentType = resp.headers.get('content-type') || 'image/png';
                                const arrayBuffer = await resp.arrayBuffer();
                                logoBytes = new Uint8Array(arrayBuffer);
                            }
                        } catch (e) {
                            console.error('Failed to fetch logo:', e);
                        }
                    }

                    // Generate PDF for the new invoice
                    const pdfBytes = await generateInvoicePDF(Object.assign({}, invResult, { client_name: item.client_name, client_email: item.client_email }), [lineItem], profile, logoBytes, logoContentType);

                    const fromName = profile?.company_name || profile?.full_name || 'PayTraker';
                    const htmlBody = generateEmailHTML({
                        clientName: item.client_name,
                        invoiceNumber: invNum,
                        dueDate: new Date(invResult.due_date).toLocaleDateString(),
                        total: item.total,
                        currency: item.currency,
                        companyName: fromName,
                        type: 'billing'
                    });

                    const textBody = `Hi ${item.client_name},\n\nThis is an automated invoice for your subscription/recurring billing with ${fromName}.\n\nInvoice Details:\n- Invoice Number: ${invNum}\n- Due Date: ${new Date(invResult.due_date).toLocaleDateString()}\n- Amount Due: ${item.currency === 'INR' ? 'INR ' : '$'}${item.total.toFixed(2)}\n\nPlease find the invoice copy attached to this email.\n\nBest regards,\n${fromName}`;

                    await sendInvoiceEmail({
                        transporter,
                        to: item.client_email,
                        fromName,
                        gmailUser,
                        replyTo: replyToEmail,
                        subject: `New Automated Invoice from ${fromName}`,
                        textBody,
                        htmlBody,
                        pdfBytes,
                        pdfFilename: `${invNum}.pdf`
                    });
                    logs.push(`Auto-billed ${item.client_email}`);
                } catch (err: any) {
                    logs.push(`Failed auto-billing client ${item.client_email}: ${err.message}`);
                }
            });
        }

        // 3. REMINDER AUTOMATION
        if (action === 'reminders' || action === 'all') {
            const { data: pending, error: remError } = await supabase.rpc('get_pending_reminders');
            if (remError) throw new Error('Failed to fetch reminders: ' + remError.message);

            const batch = (pending || []).slice(0, 5);
            logs.push(`Found ${pending?.length || 0} pending reminders. Processing batch of ${batch.length}.`);

            await runWithLimit(batch, 3, async (item: any) => {
                try {
                    const { data: invoice } = await supabase
                        .from('invoices')
                        .select('user_id')
                        .eq('id', item.invoice_id)
                        .single();

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', invoice?.user_id)
                        .single();

                    // Fetch user email for Reply-To
                    let replyToEmail = undefined;
                    if (invoice?.user_id) {
                        try {
                            const { data: userResp } = await supabase.auth.admin.getUser(invoice.user_id);
                            if (userResp?.user?.email) replyToEmail = userResp.user.email;
                        } catch (err) {
                            console.error('Failed to get user auth email:', err);
                        }
                    }

                    // Pre-fetch logo bytes if logo_url exists
                    let logoBytes: Uint8Array | null = null;
                    let logoContentType = '';
                    if (profile?.logo_url) {
                        try {
                            const resp = await fetch(profile.logo_url);
                            if (resp.ok) {
                                logoContentType = resp.headers.get('content-type') || 'image/png';
                                const arrayBuffer = await resp.arrayBuffer();
                                logoBytes = new Uint8Array(arrayBuffer);
                            }
                        } catch (e) {
                            console.error('Failed to fetch logo:', e);
                        }
                    }

                    // Fetch line items for the PDF
                    const { data: invoiceItems } = await supabase.from('invoice_items').select('*').eq('invoice_id', item.invoice_id);

                    const pdfBytes = await generateInvoicePDF(item, invoiceItems || [], profile, logoBytes, logoContentType);

                    const fromName = profile?.company_name || profile?.full_name || 'PayTraker';
                    const htmlBody = generateEmailHTML({
                        clientName: item.client_name,
                        invoiceNumber: item.invoice_number,
                        dueDate: new Date(item.due_date).toLocaleDateString(),
                        total: parseFloat(item.total),
                        currency: item.currency,
                        companyName: fromName,
                        type: 'reminder'
                    });

                    const textBody = `Hi ${item.client_name},\n\nJust a quick reminder that invoice ${item.invoice_number} is due on ${new Date(item.due_date).toLocaleDateString()}.\n\nInvoice Details:\n- Invoice Number: ${item.invoice_number}\n- Due Date: ${new Date(item.due_date).toLocaleDateString()}\n- Amount Due: ${item.currency === 'INR' ? 'INR ' : '$'}${parseFloat(item.total).toFixed(2)}\n\nPlease find the invoice copy attached for your reference.\n\nBest regards,\n${fromName}`;

                    await sendInvoiceEmail({
                        transporter,
                        to: item.client_email,
                        fromName,
                        gmailUser,
                        replyTo: replyToEmail,
                        subject: `Payment Reminder: Invoice ${item.invoice_number} from ${fromName}`,
                        textBody,
                        htmlBody,
                        pdfBytes,
                        pdfFilename: `Invoice_${item.invoice_number}.pdf`
                    });

                    await supabase.from('reminder_logs').insert({
                        invoice_id: item.invoice_id,
                        rule_id: item.rule_id,
                        channel: 'email',
                        recipient_email: item.client_email,
                        status: 'sent'
                    });
                    logs.push(`Reminded ${item.client_email}`);
                } catch (err: any) {
                    logs.push(`Failed reminder to ${item.client_email} for invoice ${item.invoice_number}: ${err.message}`);
                }
            });
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
    } finally {
        if (transporter) {
            try {
                transporter.close();
            } catch (e) {
                console.error('Failed to close transporter pool:', e);
            }
        }
    }
})
