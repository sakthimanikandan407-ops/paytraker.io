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
    const { data: invoice, error } = await supabase
        .from('invoices')
        .select('*, clients(*)')
        .eq('id', invoiceId)
        .single();

    if (error || !invoice) {
        console.error('Error fetching invoice for email:', error);
        return false;
    }

    const options: EmailOptions = {
        to: invoice.clients?.email,
        subject: `Invoice ${invoice.invoice_number} from PayTrack`,
        body: `Hello ${invoice.clients?.name},\n\nPlease find your invoice ${invoice.invoice_number} for the amount of ${invoice.currency} ${invoice.total}.\n\nThank you!`,
        invoiceId: invoice.id
    };

    return await sendEmail(options);
};
