alter table public.vocab
  add column if not exists mode_memory_states jsonb not null default '{}'::jsonb,
  add column if not exists rescue_card jsonb not null default '{}'::jsonb;

alter table public.learning_goals
  add column if not exists schedule_settings jsonb not null default '{}'::jsonb,
  add column if not exists replanning jsonb not null default '{}'::jsonb,
  add column if not exists fsrs_profile jsonb not null default '{}'::jsonb,
  add column if not exists baseline_completed boolean not null default false;

alter table public.learning_goal_sessions
  add column if not exists anchor text not null default 'adaptive';

alter table public.learning_review_logs
  add column if not exists answer_signal text not null default '',
  add column if not exists baseline_class text not null default '';

alter table public.learning_review_logs
  drop constraint if exists learning_review_logs_answer_signal_check;

alter table public.learning_review_logs
  add constraint learning_review_logs_answer_signal_check
  check (answer_signal in ('', 'exact', 'accepted_variant', 'typo', 'wrong_knowledge', 'revealed', 'slow'));

create index if not exists vocab_mode_memory_gin_idx
  on public.vocab using gin (mode_memory_states);

comment on column public.vocab.mode_memory_states is
  'FSRS card state keyed by quiz mode; aggregate FSRS columns remain for backward-compatible summaries.';

comment on column public.learning_goals.schedule_settings is
  'Timezone, availability windows, quiet hours, wake/sleep times and notification policy.';
