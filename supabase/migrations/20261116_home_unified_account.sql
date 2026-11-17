-- HOME unified identity. Applied to Supabase project sckkacwskzgwqdkpvlku on 2026-11-16.
-- Existing auth.users and homehub_chats/homehub_messages are reused.
create table if not exists public.home_devices(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 client_id text not null check(char_length(client_id) between 8 and 128),
 display_name text not null check(char_length(display_name) between 1 and 80),
 platform text not null check(platform in ('android','windows','web')),
 last_seen_at timestamptz not null default now(),
 created_at timestamptz not null default now(),
 unique(user_id,client_id)
);
create index if not exists home_devices_user_seen on public.home_devices(user_id,last_seen_at desc);
alter table public.home_devices enable row level security;
create policy device_select_owner on public.home_devices for select to authenticated using ((select auth.uid())=user_id);
create policy device_insert_owner on public.home_devices for insert to authenticated with check ((select auth.uid())=user_id);
create policy device_update_owner on public.home_devices for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy device_delete_owner on public.home_devices for delete to authenticated using ((select auth.uid())=user_id);
grant select,insert,update,delete on public.home_devices to authenticated;
create table if not exists public.home_preferences(
 user_id uuid primary key references auth.users(id) on delete cascade,
 preferred_model text not null default 'auto' check(preferred_model in ('auto','qwen','glm','nemotron','gemma','llama','granite')),
 response_style text not null default 'equilibrado' check(response_style in ('objetivo','equilibrado','detalhado')),
 sync_chats boolean not null default false,
 sync_emotions boolean not null default false,
 updated_at timestamptz not null default now()
);
alter table public.home_preferences enable row level security;
create policy preferences_select_owner on public.home_preferences for select to authenticated using ((select auth.uid())=user_id);
create policy preferences_insert_owner on public.home_preferences for insert to authenticated with check ((select auth.uid())=user_id);
create policy preferences_update_owner on public.home_preferences for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy preferences_delete_owner on public.home_preferences for delete to authenticated using ((select auth.uid())=user_id);
grant select,insert,update,delete on public.home_preferences to authenticated;
