alter table public.vocab
  add column if not exists answer_history jsonb not null default '[]'::jsonb;
