alter table public.vocab
  add column if not exists fsrs_state integer not null default 0,
  add column if not exists fsrs_due_at timestamptz,
  add column if not exists fsrs_last_review_at timestamptz,
  add column if not exists fsrs_reps integer not null default 0,
  add column if not exists fsrs_lapses integer not null default 0,
  add column if not exists fsrs_scheduled_days integer not null default 0,
  add column if not exists fsrs_elapsed_days integer not null default 0,
  add column if not exists fsrs_learning_steps integer not null default 0,
  add column if not exists fsrs_stability numeric not null default 0,
  add column if not exists fsrs_difficulty numeric not null default 5;

create index if not exists vocab_fsrs_due_at_idx
  on public.vocab (user_id, fsrs_due_at);

create table if not exists public.learning_goals (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  deadline_at timestamptz not null,
  desired_retention numeric not null default 0.9,
  daily_minutes integer not null default 30,
  horizon_hours numeric not null default 24,
  modes jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  plan_estimate jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_goals_retention_check check (desired_retention between 0.8 and 0.97),
  constraint learning_goals_daily_minutes_check check (daily_minutes between 5 and 480),
  constraint learning_goals_status_check check (status in ('active', 'paused', 'completed', 'expired'))
);

create table if not exists public.learning_goal_vocab (
  goal_id text not null references public.learning_goals(id) on delete cascade,
  vocab_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_index integer not null default 0,
  status text not null default 'new',
  risk_score integer not null default 100,
  predicted_retention numeric not null default 0,
  correct_sessions integer not null default 0,
  required_sessions integer not null default 2,
  separated_recall boolean not null default false,
  mode_coverage numeric not null default 0,
  passed_modes jsonb not null default '[]'::jsonb,
  final_passed boolean not null default false,
  last_result text not null default 'unanswered',
  last_reviewed_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (goal_id, vocab_id)
);

create table if not exists public.learning_goal_sessions (
  id text primary key,
  goal_id text not null references public.learning_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence integer not null default 0,
  session_type text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 5,
  status text not null default 'pending',
  vocab_ids jsonb not null default '[]'::jsonb,
  modes jsonb not null default '[]'::jsonb,
  result_summary jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint learning_goal_sessions_status_check check (status in ('pending', 'completed', 'skipped'))
);

create table if not exists public.learning_review_logs (
  id text primary key,
  goal_id text not null references public.learning_goals(id) on delete cascade,
  session_id text not null references public.learning_goal_sessions(id) on delete cascade,
  vocab_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_type text not null,
  mode text not null default '',
  answer_state text not null,
  fsrs_rating integer not null,
  response_seconds numeric not null default 0,
  reviewed_at timestamptz not null default now()
);

create index if not exists learning_goals_user_deadline_idx
  on public.learning_goals (user_id, status, deadline_at);

create index if not exists learning_goal_sessions_due_idx
  on public.learning_goal_sessions (user_id, status, scheduled_at);

create index if not exists learning_review_logs_vocab_idx
  on public.learning_review_logs (user_id, vocab_id, reviewed_at desc);

alter table public.learning_goals enable row level security;
alter table public.learning_goal_vocab enable row level security;
alter table public.learning_goal_sessions enable row level security;
alter table public.learning_review_logs enable row level security;

drop policy if exists "learning_goals_own" on public.learning_goals;
create policy "learning_goals_own"
  on public.learning_goals for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "learning_goal_vocab_own" on public.learning_goal_vocab;
create policy "learning_goal_vocab_own"
  on public.learning_goal_vocab for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "learning_goal_sessions_own" on public.learning_goal_sessions;
create policy "learning_goal_sessions_own"
  on public.learning_goal_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "learning_review_logs_own" on public.learning_review_logs;
create policy "learning_review_logs_own"
  on public.learning_review_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
