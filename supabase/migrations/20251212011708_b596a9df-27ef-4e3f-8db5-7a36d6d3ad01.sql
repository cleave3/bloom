-- Create mood enum
CREATE TYPE public.mood_type AS ENUM ('great', 'good', 'okay', 'bad', 'awful');

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  share_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cycle data table (cloud backup)
CREATE TABLE public.cycle_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_length INTEGER NOT NULL DEFAULT 28,
  period_length INTEGER NOT NULL DEFAULT 5,
  last_period_start DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Day logs table (includes mood, symptoms, temperature, flow)
CREATE TABLE public.day_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood mood_type,
  symptoms TEXT[] DEFAULT '{}',
  flow_intensity TEXT,
  temperature DECIMAL(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Period logs table
CREATE TABLE public.period_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  flow_intensity TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partner shares table
CREATE TABLE public.partner_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_email TEXT,
  share_code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.period_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_shares ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Cycle data policies
CREATE POLICY "Users can view own cycle data" ON public.cycle_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cycle data" ON public.cycle_data FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cycle data" ON public.cycle_data FOR UPDATE USING (auth.uid() = user_id);

-- Day logs policies
CREATE POLICY "Users can view own day logs" ON public.day_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own day logs" ON public.day_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own day logs" ON public.day_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own day logs" ON public.day_logs FOR DELETE USING (auth.uid() = user_id);

-- Period logs policies
CREATE POLICY "Users can view own period logs" ON public.period_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own period logs" ON public.period_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Partner shares policies
CREATE POLICY "Users can view own shares" ON public.partner_shares FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create shares" ON public.partner_shares FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own shares" ON public.partner_shares FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own shares" ON public.partner_shares FOR DELETE USING (auth.uid() = owner_id);

-- Public read policy for partner viewing via share code
CREATE POLICY "Anyone can view via share code" ON public.cycle_data FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.partner_shares 
    WHERE partner_shares.owner_id = cycle_data.user_id 
    AND partner_shares.is_active = true
  )
);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Trigger for new user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cycle_data_updated_at BEFORE UPDATE ON public.cycle_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_day_logs_updated_at BEFORE UPDATE ON public.day_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();