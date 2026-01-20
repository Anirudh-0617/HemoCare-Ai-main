-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- HELPER: DROP POLICIES IF THEY EXIST TO AVOID ERRORS
DO $$
BEGIN
    -- PROFILES
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    
    -- BLEEDS
    DROP POLICY IF EXISTS "Users can view their bleeds" ON public.bleeds;
    DROP POLICY IF EXISTS "Users can insert their bleeds" ON public.bleeds;
    DROP POLICY IF EXISTS "Users can update their bleeds" ON public.bleeds;
    DROP POLICY IF EXISTS "Users can delete their bleeds" ON public.bleeds;
    DROP POLICY IF EXISTS "Users can allow all operations on their bleeds" ON public.bleeds;
    
    -- MEDICATIONS
    DROP POLICY IF EXISTS "Users can view their medications" ON public.medications;
    DROP POLICY IF EXISTS "Users can insert their medications" ON public.medications;
    DROP POLICY IF EXISTS "Users can update their medications" ON public.medications;
    DROP POLICY IF EXISTS "Users can delete their medications" ON public.medications;
    DROP POLICY IF EXISTS "Users can allow all operations on their medications" ON public.medications;
    
    -- INFUSIONS
    DROP POLICY IF EXISTS "Users can view their infusions" ON public.infusions;
    DROP POLICY IF EXISTS "Users can insert their infusions" ON public.infusions;
    DROP POLICY IF EXISTS "Users can update their infusions" ON public.infusions;
    DROP POLICY IF EXISTS "Users can delete their infusions" ON public.infusions;
    DROP POLICY IF EXISTS "Users can allow all operations on their infusions" ON public.infusions;
    
    -- TEAM MEMBERS
    DROP POLICY IF EXISTS "Users can view their team members" ON public.team_members;
    DROP POLICY IF EXISTS "Users can insert their team members" ON public.team_members;
    DROP POLICY IF EXISTS "Users can update their team members" ON public.team_members;
    DROP POLICY IF EXISTS "Users can delete their team members" ON public.team_members;
    DROP POLICY IF EXISTS "Users can allow all operations on their team members" ON public.team_members;
    
    -- APPOINTMENTS
    DROP POLICY IF EXISTS "Users can view their appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Users can insert their appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Users can update their appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Users can delete their appointments" ON public.appointments;
    DROP POLICY IF EXISTS "Users can allow all operations on their appointments" ON public.appointments;

    -- CHAT USAGE
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'chat_usage') THEN
        DROP POLICY IF EXISTS "Users can view their chat usage" ON public.chat_usage;
        DROP POLICY IF EXISTS "Users can insert their chat usage" ON public.chat_usage;
        DROP POLICY IF EXISTS "Users can update their chat usage" ON public.chat_usage;
    END IF;

    -- AUDIT LOGS
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs') THEN
        DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
    END IF;
END
$$;

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    genetic_profile JSONB,
    insurance_profile JSONB,
    has_completed_onboarding BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. BLEEDS TABLE
CREATE TABLE IF NOT EXISTS public.bleeds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    severity NUMERIC,
    trigger TEXT,
    treatment TEXT,
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bleeds ENABLE ROW LEVEL SECURITY;

-- Explicitly defining policies for each operation is safer and clearer
CREATE POLICY "Users can view their bleeds" 
ON public.bleeds FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their bleeds" 
ON public.bleeds FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their bleeds" 
ON public.bleeds FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their bleeds" 
ON public.bleeds FOR DELETE 
USING (auth.uid() = user_id);

-- 3. MEDICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    dosage_base TEXT,
    frequency TEXT,
    start_date DATE,
    prescribing_htc TEXT,
    current_weight NUMERIC,
    vial_sizes INT[],
    stock_remaining NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their medications" 
ON public.medications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their medications" 
ON public.medications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their medications" 
ON public.medications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their medications" 
ON public.medications FOR DELETE 
USING (auth.uid() = user_id);

-- 4. INFUSIONS TABLE
CREATE TABLE IF NOT EXISTS public.infusions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    lot_number TEXT,
    site TEXT,
    reaction TEXT,
    notes TEXT,
    is_missed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.infusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their infusions" 
ON public.infusions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their infusions" 
ON public.infusions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their infusions" 
ON public.infusions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their infusions" 
ON public.infusions FOR DELETE 
USING (auth.uid() = user_id);

-- 5. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    specialty TEXT,
    phone TEXT,
    email TEXT,
    type TEXT DEFAULT 'medical',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team members" 
ON public.team_members FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their team members" 
ON public.team_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their team members" 
ON public.team_members FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their team members" 
ON public.team_members FOR DELETE 
USING (auth.uid() = user_id);

-- 6. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    provider TEXT,
    location TEXT,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their appointments" 
ON public.appointments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their appointments" 
ON public.appointments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their appointments" 
ON public.appointments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their appointments" 
ON public.appointments FOR DELETE 
USING (auth.uid() = user_id);

-- TRIGGER FOR NEW USERS (Idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, has_completed_onboarding)
  VALUES (new.id, FALSE)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 7. CHAT USAGE TABLE (For AI Chatbot Credit Limits)
CREATE TABLE IF NOT EXISTS public.chat_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    daily_messages INT DEFAULT 0,
    monthly_messages INT DEFAULT 0,
    last_daily_reset DATE DEFAULT CURRENT_DATE,
    last_monthly_reset DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE)::DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.chat_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their chat usage" 
ON public.chat_usage FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their chat usage" 
ON public.chat_usage FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their chat usage" 
ON public.chat_usage FOR UPDATE 
USING (auth.uid() = user_id);

-- Helper function to get or create usage record and check/reset counters
CREATE OR REPLACE FUNCTION public.get_chat_usage()
RETURNS TABLE (
  daily_messages INT,
  monthly_messages INT,
  daily_limit INT,
  monthly_limit INT
) AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_record RECORD;
  v_today DATE := CURRENT_DATE;
  v_month_start DATE := DATE_TRUNC('month', CURRENT_DATE)::DATE;
BEGIN
  -- Insert if not exists
  INSERT INTO public.chat_usage (user_id, daily_messages, monthly_messages, last_daily_reset, last_monthly_reset)
  VALUES (v_user_id, 0, 0, v_today, v_month_start)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get record and reset if needed
  SELECT * INTO v_record FROM public.chat_usage WHERE user_id = v_user_id;
  
  -- Daily reset
  IF v_record.last_daily_reset < v_today THEN
    UPDATE public.chat_usage 
    SET daily_messages = 0, last_daily_reset = v_today 
    WHERE user_id = v_user_id;
    v_record.daily_messages := 0;
  END IF;
  
  -- Monthly reset
  IF v_record.last_monthly_reset < v_month_start THEN
    UPDATE public.chat_usage 
    SET monthly_messages = 0, last_monthly_reset = v_month_start 
    WHERE user_id = v_user_id;
    v_record.monthly_messages := 0;
  END IF;
  
  RETURN QUERY SELECT 
    v_record.daily_messages,
    v_record.monthly_messages,
    15::INT AS daily_limit,
    200::INT AS monthly_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Function to record a message usage
CREATE OR REPLACE FUNCTION public.record_chat_message()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  UPDATE public.chat_usage 
  SET 
    daily_messages = daily_messages + 1,
    monthly_messages = monthly_messages + 1
  WHERE user_id = v_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- 8. AUDIT LOGS (HIPAA Compliance)
-- Track who accessed/modified what and when

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    performed_by UUID REFERENCES auth.users(id),
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only Allow System/Admins to View/Insert (No public access)
-- For this simple app, we just restrict to authenticated users but normally this would be admin-only
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        record_id,
        operation,
        performed_by,
        old_data,
        new_data
    )
    VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NULL; -- Return value is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Apply Triggers to Sensitive Tables

-- Profiles
DROP TRIGGER IF EXISTS on_profile_change ON public.profiles;
CREATE TRIGGER on_profile_change
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Bleeds
DROP TRIGGER IF EXISTS on_bleed_change ON public.bleeds;
CREATE TRIGGER on_bleed_change
AFTER INSERT OR UPDATE OR DELETE ON public.bleeds
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Medications
DROP TRIGGER IF EXISTS on_medication_change ON public.medications;
CREATE TRIGGER on_medication_change
AFTER INSERT OR UPDATE OR DELETE ON public.medications
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- Infusions
DROP TRIGGER IF EXISTS on_infusion_change ON public.infusions;
CREATE TRIGGER on_infusion_change
AFTER INSERT OR UPDATE OR DELETE ON public.infusions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
