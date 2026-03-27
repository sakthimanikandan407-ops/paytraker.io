import { supabase } from './supabase';

export interface ReminderResult {
    sent: number;
    failed: number;
    skipped: number;
}

export const runReminderEngine = async (): Promise<ReminderResult> => {
    const result: ReminderResult = { sent: 0, failed: 0, skipped: 0 };

    try {
        // 1. Fetch all active reminder rules
        const { data: rules, error: rulesError } = await supabase
            .from('reminder_rules')
            .select('*')
            .eq('is_active', true);

        if (rulesError) throw rulesError;
        if (!rules || rules.length === 0) return result;

        // 2. Fetch all unpaid/sent invoices
        const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('*, clients(*)')
            .in('status', ['sent', 'viewed', 'overdue']);

        if (invError) throw invError;
        if (!invoices || invoices.length === 0) return result;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const invoice of invoices) {
            const dueDate = new Date(invoice.due_date);
            dueDate.setHours(0, 0, 0, 0);

            for (const rule of rules) {
                // Only process rules belonging to the invoice owner
                if (rule.user_id !== invoice.user_id) continue;

                let targetDate = new Date(dueDate);
                if (rule.trigger_type === 'before_due') {
                    targetDate.setDate(dueDate.getDate() - rule.days_offset);
                } else if (rule.trigger_type === 'after_due') {
                    targetDate.setDate(dueDate.getDate() + rule.days_offset);
                }
                // 'on_due' means targetDate is exactly dueDate

                targetDate.setHours(0, 0, 0, 0);

                // Check if today is the target day
                if (today.getTime() === targetDate.getTime()) {
                    // 3. Check if already sent today for this rule/invoice
                    const { data: existingLog } = await supabase
                        .from('reminder_logs')
                        .select('id')
                        .eq('invoice_id', invoice.id)
                        .eq('rule_id', rule.id)
                        .gte('sent_at', today.toISOString())
                        .single();

                    if (existingLog) {
                        result.skipped++;
                        continue;
                    }

                    const { sendInvoiceNotification } = await import('./emailService');
                    const success = await sendInvoiceNotification(invoice.id);

                    // 5. Log the result
                    await supabase.from('reminder_logs').insert({
                        invoice_id: invoice.id,
                        rule_id: rule.id,
                        channel: rule.channel,
                        recipient_email: invoice.clients?.email,
                        status: success ? 'sent' : 'failed',
                        sent_at: new Date().toISOString()
                    });

                    if (success) result.sent++;
                    else result.failed++;
                }
            }
        }
    } catch (error) {
        console.error('Error running reminder engine:', error);
        throw error;
    }

    return result;
};
