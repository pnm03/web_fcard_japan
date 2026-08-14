drop policy if exists "Cho phép mọi người thao tác projects" on public.projects;
drop policy if exists "Cho phép mọi người đọc projects" on public.projects;
drop policy if exists "Cho phép mọi người thao tác vocab" on public.vocab;
drop policy if exists "Cho phép mọi người đọc vocab" on public.vocab;

alter table public.projects enable row level security;
alter table public.vocab enable row level security;

comment on table public.projects is
  'Learning projects protected by per-user row level security.';

comment on table public.vocab is
  'Vocabulary protected by per-user row level security.';
