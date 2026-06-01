export interface Profile {
    id: string
    full_name: string | null
    company_name: string | null
    avatar_url: string | null
    logo_url: string | null
    role: 'user' | 'admin'
    plan: 'free' | 'pro' | 'studio'
    default_currency: 'USD' | 'INR'
    gst_number: string | null
    subscription_status: string
    created_at: string
}

export interface Client {
    id: string
    user_id: string
    name: string
    email: string
    phone: string | null
    company: string | null
    address: string | null
    currency: 'USD' | 'INR'
    notes: string | null
    created_at: string
}

export interface Invoice {
    id: string
    user_id: string
    client_id: string
    invoice_number: string
    status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
    issue_date: string
    due_date: string
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    currency: 'USD' | 'INR'
    exchange_rate: number
    notes: string | null
    paid_at: string | null
    sent_at: string | null
    created_at: string
}

export interface InvoiceItem {
    id: string
    invoice_id: string
    description: string
    quantity: number
    rate: number
    amount: number
    sort_order: number
}

export interface ReminderRule {
    id: string
    user_id: string
    invoice_id: string | null
    trigger_type: 'before_due' | 'on_due' | 'after_due'
    days_offset: number
    channel: 'email' | 'whatsapp' | 'both'
    is_active: boolean
    created_at: string
}

export interface RecurringInvoice {
    id: string
    user_id: string
    client_id: string
    frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    next_issue_date: string
    subtotal: number
    tax_rate: number
    total: number
    currency: 'USD' | 'INR'
    description: string
    is_active: boolean
    created_at: string
}
