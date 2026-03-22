
DROP POLICY IF EXISTS "Allow insert escalations" ON public.escalations;
CREATE POLICY "Allow authenticated insert escalations"
ON public.escalations
FOR INSERT
TO authenticated
WITH CHECK (true);
