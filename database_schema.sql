-- Create tables

-- 1. Participants
create table participants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  score int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Quizzes (Stores the global quiz settings like the secret word)
create table quizzes (
  id uuid default gen_random_uuid() primary key,
  quiz_word text not null check (length(quiz_word) = 5),
  title text default 'ECELL Marketing Quiz',
  banner_url text default null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Questions
create table questions (
  id uuid default gen_random_uuid() primary key,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null, -- Store 'a', 'b', 'c', or 'd' or the full text. Storing 'option_a' etc is safer. Let's store the text value or the key. Let's use the key 'a', 'b', 'c', 'd'.
  quiz_id uuid references quizzes(id) on delete cascade
);

-- Row Level Security (RLS)
-- Enable RLS
alter table participants enable row level security;
alter table quizzes enable row level security;
alter table questions enable row level security;

-- Policies

-- Participants: Anyone can insert (start quiz), anyone can read (leaderboard/admin), any one can update (to save score)
create policy "Enable insert for everyone" on participants for insert with check (true);
create policy "Enable read for everyone" on participants for select using (true);
create policy "Enable update for everyone" on participants for update using (true);

-- Quizzes: Everyone can read the active quiz word (actually, frontend shouldn't see word directly easily, but we need it for validation or we validate server side. 
-- For this client-side app, we might need to fetch the word length or validate answers via RPC to be secure. 
-- But per requirements "5-letter word is controlled dynamically... reveal one letter...". The frontend needs to know the word or valid tokens.
-- Simplest approach: Frontend fetches word, but only reveals letters locally. 
-- Security Note: Real production apps should validate answers on server.
create policy "Enable read for everyone" on quizzes for select using (true);
create policy "Enable all for authenticated users" on quizzes for all using (auth.role() = 'authenticated');

-- Questions: Everyone can read
create policy "Enable read for everyone" on questions for select using (true);
create policy "Enable all for authenticated users" on questions for all using (auth.role() = 'authenticated');

-- Insert Initial Data
insert into quizzes (quiz_word, title) values ('BRAND', 'ECELL Marketing Code Quiz');

insert into questions (question, option_a, option_b, option_c, option_d, correct_answer, quiz_id)
select 
  'What does SEO stand for?', 
  'Search Engine Optimization', 
  'Social Engagement Online', 
  'Sales Executive Officer', 
  'Site External Offer', 
  'a',
  id
from quizzes limit 1;

-- Add 9 more dummy questions or let Admin add them.

-- 5. Storage Policies (Run this to enable Banner Uploads)
-- Create 'banners' bucket and allow public access
insert into storage.buckets (id, name, public)
values ('banners', 'banners', true)
on conflict (id) do update set public = true;

-- Allow public uploads to 'banners' bucket
create policy "Allow public uploads to banners"
on storage.objects for insert
to public
with check ( bucket_id = 'banners' );

-- Allow public updates to 'banners' bucket
create policy "Allow public updates to banners"
on storage.objects for update
to public
using ( bucket_id = 'banners' );
