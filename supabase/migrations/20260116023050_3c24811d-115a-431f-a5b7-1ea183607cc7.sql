-- Fix permissive RLS policy for nests INSERT
DROP POLICY IF EXISTS "Users can create nests" ON public.nests;

-- Authenticated users can create nests (they will then link via profiles)
CREATE POLICY "Authenticated users can create nests" ON public.nests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');