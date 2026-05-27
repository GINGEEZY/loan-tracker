-- Run this in Supabase: SQL Editor → New query → Run

create table if not exists public.loans (
  id text primary key,
  name text not null,
  phone text,
  principal numeric(14, 2) not null check (principal > 0),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.repayments (
  id text primary key,
  loan_id text not null references public.loans (id) on delete cascade,
  amount numeric(14, 2) not null check (amount > 0),
  payment_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists repayments_loan_id_idx on public.repayments (loan_id);

alter table public.loans enable row level security;
alter table public.repayments enable row level security;

-- Allow the public anon key (used by the web app). For a private app, add Supabase Auth later.
drop policy if exists "anon_all_loans" on public.loans;
drop policy if exists "anon_all_repayments" on public.repayments;

create policy "anon_all_loans"
	on public.loans for all to anon using (true) with check (true);

create policy "anon_all_repayments"
	on public.repayments for all to anon using (true) with check (true);
