alter table public.vocab
  add column if not exists order_index integer not null default 0;

with ranked_vocab as (
  select
    id,
    row_number() over (
      partition by project_id
      order by order_index asc, id asc
    ) - 1 as next_order_index
  from public.vocab
)
update public.vocab as vocab
set order_index = ranked_vocab.next_order_index
from ranked_vocab
where vocab.id = ranked_vocab.id
  and vocab.order_index = 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'vocab_order_index_check'
  ) then
    alter table public.vocab
      add constraint vocab_order_index_check
      check (order_index >= 0)
      not valid;
  end if;
end $$;

create index if not exists vocab_project_order_idx
  on public.vocab (project_id, order_index);
