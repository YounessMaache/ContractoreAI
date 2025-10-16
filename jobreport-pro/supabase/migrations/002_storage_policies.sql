-- Create storage buckets (run these in Supabase Dashboard Storage section first)
-- Then apply these policies

-- Policies for company-logos bucket
create policy "Public can view logos"
  on storage.objects for select
  using (bucket_id = 'company-logos');

create policy "Users can upload own logo"
  on storage.objects for insert
  with check (
    bucket_id = 'company-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own logo"
  on storage.objects for update
  using (
    bucket_id = 'company-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own logo"
  on storage.objects for delete
  using (
    bucket_id = 'company-logos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for document-photos bucket
create policy "Users can view own photos"
  on storage.objects for select
  using (
    bucket_id = 'document-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'document-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own photos"
  on storage.objects for update
  using (
    bucket_id = 'document-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'document-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies for generated-pdfs bucket
create policy "Users can view own PDFs"
  on storage.objects for select
  using (
    bucket_id = 'generated-pdfs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'generated-pdfs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own PDFs"
  on storage.objects for update
  using (
    bucket_id = 'generated-pdfs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'generated-pdfs' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
