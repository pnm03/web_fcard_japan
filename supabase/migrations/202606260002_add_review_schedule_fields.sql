alter table public.vocab
  add column if not exists next_review_at timestamptz,
  add column if not exists review_interval_hours numeric not null default 0,
  add column if not exists review_stage integer not null default 0,
  add column if not exists lapse_count integer not null default 0,
  add column if not exists review_reason text not null default '',
  add column if not exists ease_factor numeric not null default 2.5,
  add column if not exists memory_stability numeric not null default 0,
  add column if not exists memory_difficulty numeric not null default 5;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vocab_review_interval_hours_check'
  ) then
    alter table public.vocab
      add constraint vocab_review_interval_hours_check
      check (review_interval_hours >= 0)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'vocab_review_stage_check'
  ) then
    alter table public.vocab
      add constraint vocab_review_stage_check
      check (review_stage >= 0)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'vocab_lapse_count_check'
  ) then
    alter table public.vocab
      add constraint vocab_lapse_count_check
      check (lapse_count >= 0)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'vocab_ease_factor_check'
  ) then
    alter table public.vocab
      add constraint vocab_ease_factor_check
      check (ease_factor between 1.3 and 3.2)
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'vocab_memory_difficulty_check'
  ) then
    alter table public.vocab
      add constraint vocab_memory_difficulty_check
      check (memory_difficulty between 1 and 10)
      not valid;
  end if;
end $$;

create index if not exists vocab_next_review_at_idx
  on public.vocab (next_review_at);

create index if not exists vocab_review_due_priority_idx
  on public.vocab (next_review_at, mastery_score, difficulty_score desc);
