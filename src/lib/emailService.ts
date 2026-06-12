import { supabase } from './supabase';

export interface EmailOptions {
    to: string;
    subject: string;
    body: string;
    invoiceId: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
    try {
        const { data, error } = await supabase.functions.invoke('resend-email', {
            body: {
                to: options.to,
                subject: options.subject,
                body: options.body
            }
        });

        if (error) {
            console.error('[EDGE FUNCTION ERROR]', error);
            return false;
        }

        console.log('[EMAIL SUCCESS]', data);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        return false;
    }
};

export const sendInvoiceNotification = async (invoiceId: string): Promise<boolean> => {
    try {
        const { data, error } = await supabase.functions.invoke('process-automations', {
            body: {
                action: 'new_invoice',
                invoice_id: invoiceId
            }
        });

        if (error) {
            console.error('[EDGE FUNCTION ERROR]', error);
            return false;
        }

        console.log('[EMAIL SUCCESS]', data);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR]', error);
        return false;
    }
};
