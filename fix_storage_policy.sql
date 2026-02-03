-- RUN THIS IN SUPABASE SQL EDITOR TO FIX UPLOAD ISSUES

-- 1. Ensure the 'banners' bucket exists and is public
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do update set public = true;

-- 2. Drop existing policies to avoid conflicts (clean slate)
drop policy if exists "Give me access to banners 1" on storage.objects;
drop policy if exists "Give me access to banners 2" on storage.objects;
drop policy if exists "Allow public uploads to banners" on storage.objects;
drop policy if exists "Allow public updates to banners" on storage.objects;
drop policy if exists "Allow public select to banners" on storage.objects;

-- 3. Create Permissive Policies for the 'banners' bucket

-- ALLOW INSERT (Uploads) for everyone (anon users included)
create policy "Allow public uploads to banners"
on storage.objects for insert
to public
with check ( bucket_id = 'banners' );

-- ALLOW UPDATE (Overwriting) for everyone
create policy "Allow public updates to banners"
on storage.objects for update
to public
using ( bucket_id = 'banners' );

-- ALLOW SELECT (Viewing) for everyone
create policy "Allow public select to banners"
on storage.objects for select
to public
using ( bucket_id = 'banners' );

-- 4. Ensure RLS is enabled on storage.objects (Supabase default, but good to check)
alter table storage.objects enable row level security;
