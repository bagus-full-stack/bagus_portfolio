INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('cv', 'cv', true) ON CONFLICT DO NOTHING;

-- Avatars: public read
CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- Avatars: admin write
CREATE POLICY "Avatar Admin Write" ON storage.objects FOR ALL TO authenticated USING (
  bucket_id = 'avatars' AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
) WITH CHECK (
  bucket_id = 'avatars' AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- CV: admin write
CREATE POLICY "CV Admin Write" ON storage.objects FOR ALL TO authenticated USING (
  bucket_id = 'cv' AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
) WITH CHECK (
  bucket_id = 'cv' AND EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- CV: public read
CREATE POLICY "CV Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'cv');
