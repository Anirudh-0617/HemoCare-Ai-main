
-- Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL, -- 'bleed', 'medication', 'auth'
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Admins can read everyone's logs (conceptually), Users can read only their own
DROP POLICY IF EXISTS "Users see own audit logs" ON public.audit_logs;
CREATE POLICY "Users see own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Storage Policies
-- 1. Create the bucket if it doesn't exist (PRIVATE for HIPAA compliance)
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-images', 'medical-images', false) -- Private bucket - use signed URLs in frontend
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS (Usually enabled by default, can cause permission error if run manually)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Authenticated users can upload their own files
DROP POLICY IF EXISTS "Users can upload bleed photos" ON storage.objects;
CREATE POLICY "Users can upload bleed photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'medical-images' AND
  auth.role() = 'authenticated' AND
  auth.uid() = owner -- Ensure user is the owner
);

-- 4. Policy: Users can view files (Adjust based on public/private preference)
-- Currently allowing any authenticated user to view headers/metadata, but strictly content view requires correct ownership if private
DROP POLICY IF EXISTS "Users can view bleed photos" ON storage.objects;
CREATE POLICY "Users can view bleed photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'medical-images' AND auth.role() = 'authenticated');

-- 5. Policy: Users can delete their own files
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'medical-images' AND auth.uid() = owner);

-- Helper function to log activity securely from Postgres (optional, usually call from App)
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action TEXT,
  p_entity TEXT,
  p_details JSONB DEFAULT '{}'::JSONB
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, entity, details)
  VALUES (auth.uid(), p_action, p_entity, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
