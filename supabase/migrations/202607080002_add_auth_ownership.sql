alter table public.projects
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.vocab
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists projects_user_id_idx
  on public.projects (user_id);

create index if not exists vocab_user_id_idx
  on public.vocab (user_id);

create index if not exists vocab_user_project_idx
  on public.vocab (user_id, project_id);

create or replace function public.assign_existing_learning_data_to_user(owner_email text default 'qminh203.fw@gmail.com')
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  owner_id uuid;
begin
  select id
    into owner_id
  from auth.users
  where lower(email) = lower(owner_email)
  order by created_at asc
  limit 1;

  if owner_id is null then
    raise notice 'No auth user found for %. Create/register the account first, then run select public.assign_existing_learning_data_to_user(%);', owner_email, quote_literal(owner_email);
    return;
  end if;

  update public.projects
  set user_id = owner_id
  where user_id is null;

  update public.vocab
  set user_id = owner_id
  where user_id is null;

  update public.vocab as vocab
  set user_id = projects.user_id
  from public.projects as projects
  where vocab.project_id = projects.id
    and projects.user_id is not null
    and vocab.user_id is distinct from projects.user_id;
end;
$$;

select public.assign_existing_learning_data_to_user('qminh203.fw@gmail.com');

alter table public.projects enable row level security;
alter table public.vocab enable row level security;

drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

drop policy if exists "vocab_select_own" on public.vocab;
drop policy if exists "vocab_insert_own" on public.vocab;
drop policy if exists "vocab_update_own" on public.vocab;
drop policy if exists "vocab_delete_own" on public.vocab;

create policy "vocab_select_own"
  on public.vocab for select
  using (auth.uid() = user_id);

create policy "vocab_insert_own"
  on public.vocab for insert
  with check (auth.uid() = user_id);

create policy "vocab_update_own"
  on public.vocab for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "vocab_delete_own"
  on public.vocab for delete
  using (auth.uid() = user_id);
