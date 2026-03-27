-- PayTrack.io Database Schema (Professional Light Mode Version)

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name text,
  company_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user','admin')),
  plan text DEFAULT 'free' CHECK (plan IN ('free','pro','studio')),
  default_currency text DEFAULT 'USD' CHECK (default_currency IN ('USD','INR')),
  gst_number text,
  dodo_customer_id text,
  dodo_subscription_id text,
  subscription_status text DEFAULT 'inactive',
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2. CLIENTS
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company text,
  address text,
  currency text DEFAULT 'USD' CHECK (currency IN ('USD','INR')),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft','sent','viewed','paid','overdue','cancelled')),
  issue_date date DEFAULT current_date,
  due_date date NOT NULL,
  subtotal numeric(12,2) DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 0,
  tax_amount numeric(12,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  exchange_rate numeric(10,4) DEFAULT 1,
  notes text,
  paid_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 4. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,2) DEFAULT 1,
  rate numeric(12,2) DEFAULT 0,
  amount numeric(12,2) DEFAULT 0,
  sort_order int DEFAULT 0
);

-- 5. REMINDER RULES
CREATE TABLE IF NOT EXISTS reminder_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  trigger_type text CHECK (trigger_type IN ('before_due','on_due','after_due')),
  days_offset int DEFAULT 0,
  channel text DEFAULT 'email' CHECK (channel IN ('email','whatsapp','both')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 6. REMINDER LOGS
CREATE TABLE IF NOT EXISTS reminder_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES reminder_rules(id),
  channel text,
  recipient_email text,
  status text CHECK (status IN ('sent','failed','skipped')),
  error_message text,
  sent_at timestamptz DEFAULT now()
);

-- 7. PAYMENT HISTORY
CREATE TABLE IF NOT EXISTS payment_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  dodo_payment_id text,
  amount numeric(12,2),
  currency text,
  plan text,
  status text,
  paid_at timestamptz DEFAULT now()
);

-- 8. CRON LOGS
CREATE TABLE IF NOT EXISTS cron_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ran_at date,
  sent int DEFAULT 0,
  failed int DEFAULT 0,
  status text,
  error text,
  created_at timestamptz DEFAULT now()
);

-- 9. RECURRING INVOICES
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  frequency text DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_issue_date date NOT NULL,
  subtotal numeric(12,2) DEFAULT 0,
  tax_rate numeric(5,2) DEFAULT 0,
  total numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'USD',
  description text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

-- POLICIES
DROP POLICY IF EXISTS "own_profile" ON profiles;
CREATE POLICY "own_profile" ON profiles FOR ALL USING (auth.uid() = id);

DROP POLICY IF EXISTS "own_clients" ON clients;
CREATE POLICY "own_clients" ON clients FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_invoices" ON invoices;
CREATE POLICY "own_invoices" ON invoices FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_items" ON invoice_items;
CREATE POLICY "own_items" ON invoice_items FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "own_rules" ON reminder_rules;
CREATE POLICY "own_rules" ON reminder_rules FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_logs" ON reminder_logs;
CREATE POLICY "own_logs" ON reminder_logs FOR ALL USING (
  invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "own_payments" ON payment_history;
CREATE POLICY "own_payments" ON payment_history FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "own_recurring" ON recurring_invoices;
CREATE POLICY "own_recurring" ON recurring_invoices FOR ALL USING (auth.uid() = user_id);

-- Profile creation trigger on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Insert default reminder rules for new user
  INSERT INTO public.reminder_rules (user_id, trigger_type, days_offset, channel)
  VALUES 
    (new.id, 'before_due', 3, 'email'),
    (new.id, 'before_due', 1, 'email'),
    (new.id, 'on_due', 0, 'email'),
    (new.id, 'after_due', 3, 'email'),
    (new.id, 'after_due', 7, 'email');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- n8n Automation Functions

-- 1. Automate Finding Due Reminders
CREATE OR REPLACE FUNCTION get_pending_reminders()
RETURNS TABLE (
  invoice_id uuid,
  invoice_number text,
  total numeric,
  currency text,
  due_date date,
  client_name text,
  client_email text,
  rule_id uuid,
  trigger_type text,
  days_offset int
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.invoice_number,
    i.total,
    i.currency,
    i.due_date,
    c.name,
    c.email,
    r.id,
    r.trigger_type,
    r.days_offset
  FROM invoices i
  JOIN clients c ON i.client_id = c.id
  JOIN reminder_rules r ON r.user_id = i.user_id 
    AND (r.invoice_id IS NULL OR r.invoice_id = i.id)
    AND r.is_active = true
  WHERE i.status IN ('sent', 'viewed', 'overdue')
    AND (
      (r.trigger_type = 'before_due' AND i.due_date - r.days_offset = CURRENT_DATE) OR
      (r.trigger_type = 'on_due' AND i.due_date = CURRENT_DATE) OR
      (r.trigger_type = 'after_due' AND i.due_date + r.days_offset = CURRENT_DATE)
    )
    AND NOT EXISTS (
      SELECT 1 FROM reminder_logs rl 
      WHERE rl.invoice_id = i.id 
        AND rl.rule_id = r.id 
        AND rl.status = 'sent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Automate Finding Due Recurring Invoices (Billing)
CREATE OR REPLACE FUNCTION get_due_recurring_invoices()
RETURNS TABLE (
  recurring_id uuid,
  user_id uuid,
  client_id uuid,
  client_name text,
  client_email text,
  subtotal numeric,
  tax_rate numeric,
  total numeric,
  currency text,
  description text,
  frequency text,
  next_issue_date date
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    c.id,
    c.name,
    c.email,
    r.subtotal,
    r.tax_rate,
    r.total,
    r.currency,
    r.description,
    r.frequency,
    r.next_issue_date
  FROM recurring_invoices r
  JOIN clients c ON r.client_id = c.id
  WHERE r.next_issue_date <= CURRENT_DATE
    AND r.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
