alter table public.vocab
  add column if not exists history_times jsonb not null default '[]'::jsonb,
  add column if not exists last_tested_at timestamptz,
  add column if not exists last_time_spent_sec numeric not null default 0,
  add column if not exists last_answer_state text not null default 'unanswered',
  add column if not exists times_seen integer not null default 0,
  add column if not exists streak_correct integer not null default 0,
  add column if not exists mastery_score integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vocab_last_answer_state_check'
  ) then
    alter table public.vocab
      add constraint vocab_last_answer_state_check
      check (last_answer_state in ('unanswered', 'correct', 'correct_retry', 'wrong', 'revealed'))
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'vocab_mastery_score_range_check'
  ) then
    alter table public.vocab
      add constraint vocab_mastery_score_range_check
      check (mastery_score between 0 and 100)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'vocab_difficulty_score_range_check'
  ) then
    alter table public.vocab
      add constraint vocab_difficulty_score_range_check
      check (difficulty_score between 0 and 100)
      not valid;
  end if;
end $$;

create index if not exists vocab_learning_priority_idx
  on public.vocab (mastery_score, difficulty_score desc, last_tested_at);
