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
    DROP POLICY IF EXISTS "Users can allow all operations on their bleeds" ON public.bleeds;
    
    -- MEDICATIONS
    DROP POLICY IF EXISTS "Users can allow all operations on their medications" ON public.medications;
    
    -- INFUSIONS
    DROP POLICY IF EXISTS "Users can allow all operations on their infusions" ON public.infusions;
    
    -- TEAM MEMBERS
    DROP POLICY IF EXISTS "Users can allow all operations on their team members" ON public.team_members;
    
    -- APPOINTMENTS
    DROP POLICY IF EXISTS "Users can allow all operations on their appointments" ON public.appointments;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
