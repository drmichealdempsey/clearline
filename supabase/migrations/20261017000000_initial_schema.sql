-- =============================================================================
-- ClearLine Investigations: initial schema
--
-- Apply with `supabase db push` (Supabase CLI) or paste the whole file into
-- Supabase Dashboard -> SQL Editor and run it once.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('client', 'investigator');
create type public.service_type as enum ('infidelity', 'scam_recovery', 'background_check');
create type public.case_status as enum ('received', 'assigned', 'in_progress', 'report_ready', 'closed');
create type public.payment_status as enum ('pending', 'paid');
-- 'report' files are the investigator's final deliverable and are only
-- visible to the client once the case reaches report_ready (or closed).
create type public.file_kind as enum ('supporting', 'report');


-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text not null,
  role        public.user_role not null default 'client',
  created_at  timestamptz not null default now()
);

create table public.cases (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.profiles (id) on delete cascade,
  service_type  public.service_type not null,
  title         text not null check (char_length(title) between 3 and 200),
  description   text not null check (char_length(description) between 1 and 10000),
  status        public.case_status not null default 'received',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index cases_client_id_idx on public.cases (client_id);
create index cases_status_idx on public.cases (status);
create index cases_updated_at_idx on public.cases (updated_at desc);

create table public.case_updates (
  id          uuid primary key default gen_random_uuid(),
  case_id     uuid not null references public.cases (id) on delete cascade,
  author_id   uuid not null references public.profiles (id) on delete cascade,
  message     text not null check (char_length(message) between 1 and 5000),
  created_at  timestamptz not null default now()
);

create index case_updates_case_id_idx on public.case_updates (case_id, created_at desc);

create table public.case_files (
  id           uuid primary key default gen_random_uuid(),
  case_id      uuid not null references public.cases (id) on delete cascade,
  uploaded_by  uuid not null references public.profiles (id) on delete cascade,
  file_path    text not null unique,
  file_name    text not null,
  kind         public.file_kind not null default 'supporting',
  created_at   timestamptz not null default now()
);

create index case_files_case_id_idx on public.case_files (case_id);

create table public.payments (
  id              uuid primary key default gen_random_uuid(),
  case_id         uuid not null references public.cases (id) on delete cascade,
  milestone_name  text not null check (char_length(milestone_name) between 1 and 200),
  amount          numeric(12, 2) not null check (amount >= 0),
  status          public.payment_status not null default 'pending',
  created_at      timestamptz not null default now()
);

create index payments_case_id_idx on public.payments (case_id);


-- -----------------------------------------------------------------------------
-- Helper functions (security definer so policies can use them without
-- recursive RLS checks)
-- -----------------------------------------------------------------------------
create or replace function public.is_investigator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'investigator'
  );
$$;

create or replace function public.owns_case(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cases
    where id = p_case_id and client_id = auth.uid()
  );
$$;

create or replace function public.can_access_case(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_investigator() or public.owns_case(p_case_id);
$$;

create or replace function public.case_report_released(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.cases
    where id = p_case_id and status in ('report_ready', 'closed')
  );
$$;

-- Storage object paths look like:
--   {case_id}/{uuid}-{file name}          supporting files
--   {case_id}/reports/{uuid}-{file name}  final reports (investigators only)
create or replace function public.can_read_case_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  parts text[] := storage.foldername(object_name);
  v_case_id uuid;
begin
  if public.is_investigator() then
    return true;
  end if;
  if parts is null or array_length(parts, 1) is null then
    return false;
  end if;
  begin
    v_case_id := parts[1]::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  if not public.owns_case(v_case_id) then
    return false;
  end if;
  if parts[2] = 'reports' then
    return public.case_report_released(v_case_id);
  end if;
  return true;
end;
$$;

create or replace function public.can_write_case_object(object_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  parts text[] := storage.foldername(object_name);
  v_case_id uuid;
begin
  if public.is_investigator() then
    return true;
  end if;
  if parts is null or array_length(parts, 1) is null then
    return false;
  end if;
  begin
    v_case_id := parts[1]::uuid;
  exception when invalid_text_representation then
    return false;
  end;
  return public.owns_case(v_case_id) and coalesce(parts[2], '') <> 'reports';
end;
$$;


-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

-- Every new auth user gets a profile. The role is always 'client'; promote
-- investigators manually (see README). Never trust a role from signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    'client'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger cases_set_updated_at
  before update on public.cases
  for each row execute function public.set_updated_at();

-- Clients may edit their own case, but only the title and description, and
-- only while it is still 'received'. Status, owner and service type are
-- investigator-only. auth.uid() is null for the service role / SQL editor.
create or replace function public.guard_case_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_investigator() then
    return new;
  end if;

  if new.client_id is distinct from old.client_id
     or new.status is distinct from old.status
     or new.service_type is distinct from old.service_type
     or new.created_at is distinct from old.created_at then
    raise exception 'Only investigators can change case status, owner or service type';
  end if;

  if (new.title is distinct from old.title or new.description is distinct from old.description)
     and old.status <> 'received' then
    raise exception 'Case details can no longer be edited once work has started';
  end if;

  return new;
end;
$$;

create trigger cases_guard_update
  before update on public.cases
  for each row execute function public.guard_case_update();

-- New updates and files bump the parent case's updated_at so lists sort by activity.
create or replace function public.touch_parent_case()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cases set updated_at = now() where id = new.case_id;
  return new;
end;
$$;

create trigger case_updates_touch_case
  after insert on public.case_updates
  for each row execute function public.touch_parent_case();

create trigger case_files_touch_case
  after insert on public.case_files
  for each row execute function public.touch_parent_case();


-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_updates enable row level security;
alter table public.case_files enable row level security;
alter table public.payments enable row level security;

-- profiles ---------------------------------------------------------------------
create policy "Users can read their own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Investigators can read all profiles"
  on public.profiles for select to authenticated
  using (public.is_investigator());

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Users may only change their display name; role and email are not writable.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- cases ------------------------------------------------------------------------
create policy "Clients can read their own cases"
  on public.cases for select to authenticated
  using (client_id = auth.uid());

create policy "Investigators can read all cases"
  on public.cases for select to authenticated
  using (public.is_investigator());

create policy "Clients can create their own cases"
  on public.cases for insert to authenticated
  with check (client_id = auth.uid() and status = 'received');

create policy "Clients can update their own cases"
  on public.cases for update to authenticated
  using (client_id = auth.uid())
  with check (client_id = auth.uid());

create policy "Investigators can update all cases"
  on public.cases for update to authenticated
  using (public.is_investigator())
  with check (public.is_investigator());

-- case_updates -----------------------------------------------------------------
create policy "Case participants can read updates"
  on public.case_updates for select to authenticated
  using (public.can_access_case(case_id));

create policy "Case participants can post updates"
  on public.case_updates for insert to authenticated
  with check (author_id = auth.uid() and public.can_access_case(case_id));

-- case_files -------------------------------------------------------------------
create policy "Case participants can read files"
  on public.case_files for select to authenticated
  using (
    public.is_investigator()
    or (
      public.owns_case(case_id)
      and (kind = 'supporting' or public.case_report_released(case_id))
    )
  );

create policy "Clients can add supporting files to their cases"
  on public.case_files for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and kind = 'supporting'
    and public.owns_case(case_id)
    and split_part(file_path, '/', 1) = case_id::text
  );

create policy "Investigators can add files to any case"
  on public.case_files for insert to authenticated
  with check (uploaded_by = auth.uid() and public.is_investigator());

-- payments ---------------------------------------------------------------------
create policy "Case participants can read payment milestones"
  on public.payments for select to authenticated
  using (public.can_access_case(case_id));

create policy "Investigators can add payment milestones"
  on public.payments for insert to authenticated
  with check (public.is_investigator());

create policy "Investigators can update payment milestones"
  on public.payments for update to authenticated
  using (public.is_investigator())
  with check (public.is_investigator());

create policy "Investigators can delete payment milestones"
  on public.payments for delete to authenticated
  using (public.is_investigator());


-- -----------------------------------------------------------------------------
-- Storage: private bucket for case files
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('case-files', 'case-files', false, 26214400) -- 25 MB per file
on conflict (id) do nothing;

create policy "Case participants can read case objects"
  on storage.objects for select to authenticated
  using (bucket_id = 'case-files' and public.can_read_case_object(name));

create policy "Case participants can upload case objects"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'case-files' and public.can_write_case_object(name));
