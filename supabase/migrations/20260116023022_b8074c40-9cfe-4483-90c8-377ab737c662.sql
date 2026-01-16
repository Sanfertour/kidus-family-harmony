-- Create nests (family groups) table
CREATE TABLE public.nests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Mi Nido',
  share_code TEXT UNIQUE NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nest members table (adults and children)
CREATE TABLE public.nest_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nest_id UUID NOT NULL REFERENCES public.nests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('adult', 'child')),
  color TEXT NOT NULL DEFAULT '#007AFF',
  avatar_url TEXT,
  school TEXT,
  grade TEXT,
  class TEXT,
  custody_days INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nest_id UUID NOT NULL REFERENCES public.nests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  member_id UUID NOT NULL REFERENCES public.nest_members(id) ON DELETE CASCADE,
  assigned_to_id UUID REFERENCES public.nest_members(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('school', 'activity', 'medical', 'family', 'work', 'meal')),
  notes TEXT,
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create school menus table
CREATE TABLE public.school_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nest_id UUID NOT NULL REFERENCES public.nests(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES public.nest_members(id) ON DELETE CASCADE,
  file_url TEXT,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table (links auth users to nests)
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nest_id UUID REFERENCES public.nests(id) ON DELETE SET NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.nests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nest_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nests
CREATE POLICY "Users can view their nest" ON public.nests
  FOR SELECT USING (
    id IN (SELECT nest_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their nest" ON public.nests
  FOR UPDATE USING (
    id IN (SELECT nest_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create nests" ON public.nests
  FOR INSERT WITH CHECK (true);

-- RLS Policies for nest_members
CREATE POLICY "Users can view nest members" ON public.nest_members
  FOR SELECT USING (
    nest_id IN (SELECT nest_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage nest members" ON public.nest_members
  FOR ALL USING (
    nest_id IN (SELECT nest_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for events
CREATE POLICY "Users can view nest events" ON public.events
  FOR SELECT USING (
    nest_id IN (SELECT nest_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage nest events" ON public.events
  FOR ALL USING (
    nest_id IN (SELECT nest_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for school_menus
CREATE POLICY "Users can view nest menus" ON public.school_menus
  FOR SELECT USING (
    nest_id IN (SELECT nest_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage nest menus" ON public.school_menus
  FOR ALL USING (
    nest_id IN (SELECT nest_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.nest_members;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_nests_updated_at BEFORE UPDATE ON public.nests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nest_members_updated_at BEFORE UPDATE ON public.nest_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');