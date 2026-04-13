create table if not exists public.peace_checkins (
  id uuid primary key default gen_random_uuid(),
  family_key text not null,
  sender_name text not null,
  receiver_name text not null,
  checkin_date date not null,
  status text not null default '平安',
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_key, sender_name, receiver_name, checkin_date)
);

alter table public.peace_checkins enable row level security;

drop policy if exists "Allow public read checkins" on public.peace_checkins;
create policy "Allow public read checkins"
on public.peace_checkins
for select
to anon
using (true);

drop policy if exists "Allow public insert checkins" on public.peace_checkins;
create policy "Allow public insert checkins"
on public.peace_checkins
for insert
to anon
with check (true);

drop policy if exists "Allow public update checkins" on public.peace_checkins;
create policy "Allow public update checkins"
on public.peace_checkins
for update
to anon
using (true)
with check (true);
