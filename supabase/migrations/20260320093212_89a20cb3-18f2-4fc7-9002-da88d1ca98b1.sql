
CREATE TABLE public.escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  query TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  category TEXT DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'pending',
  merchant_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;

-- Merchants need to read all pending escalations (no user_id auth for merchants currently)
-- Using a permissive read policy since merchant auth is localStorage-based
CREATE POLICY "Allow authenticated read escalations"
  ON public.escalations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow insert escalations"
  ON public.escalations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow update escalations"
  ON public.escalations FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_escalations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_escalations_updated_at
  BEFORE UPDATE ON public.escalations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_escalations_updated_at();
