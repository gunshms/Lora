begin;

create table if not exists public.thebest_costs (
  id text primary key,
  description text not null,
  amount numeric not null,
  buyer text not null,
  paid boolean default false,
  date date default current_date,
  installments_count integer,
  current_installment integer,
  installment_parent_id text,
  receipt text
);

create table if not exists public.thebest_ideas (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  color text not null,
  date date default current_date
);

create table if not exists public.thebest_stock (
  id text primary key,
  name text not null,
  quantity numeric not null default 0,
  status text not null default 'planned',
  price_cost numeric default 0,
  price_sell numeric default 0,
  barcode text,
  recipe jsonb,
  price_history jsonb,
  is_returnable boolean,
  deposit_fee numeric,
  batches jsonb,
  image_url text
);

create table if not exists public.thebest_fixed (
  id text primary key,
  description text not null,
  amount numeric not null,
  "dueDay" integer not null,
  "paidThisMonth" boolean default false,
  assignee text not null,
  receipt text
);

create table if not exists public.thebest_sales (
  id text primary key,
  items jsonb not null,
  total_amount numeric not null,
  payment_method text not null,
  profit numeric not null,
  date timestamp with time zone default now()
);

create table if not exists public.thebest_debts (
  id text primary key,
  customer_name text not null,
  amount numeric not null,
  items jsonb not null,
  date timestamp with time zone default now(),
  status text default 'pending'
);

create table if not exists public.thebest_audit (
  id text primary key,
  "user" text not null,
  action text not null,
  date timestamp with time zone default now()
);

alter table public.thebest_costs add column if not exists installments_count integer;
alter table public.thebest_costs add column if not exists current_installment integer;
alter table public.thebest_costs add column if not exists installment_parent_id text;
alter table public.thebest_costs add column if not exists receipt text;
alter table public.thebest_stock alter column quantity type numeric using quantity::numeric;
alter table public.thebest_stock add column if not exists recipe jsonb;
alter table public.thebest_stock add column if not exists price_history jsonb;
alter table public.thebest_stock add column if not exists is_returnable boolean;
alter table public.thebest_stock add column if not exists deposit_fee numeric;
alter table public.thebest_stock add column if not exists batches jsonb;
alter table public.thebest_stock add column if not exists image_url text;
alter table public.thebest_fixed add column if not exists receipt text;

create index if not exists thebest_stock_barcode_idx on public.thebest_stock (barcode) where barcode is not null;
create index if not exists thebest_sales_date_idx on public.thebest_sales (date desc);
create index if not exists thebest_costs_date_idx on public.thebest_costs (date desc);
create index if not exists thebest_debts_status_idx on public.thebest_debts (status);

alter table public.thebest_costs enable row level security;
alter table public.thebest_ideas enable row level security;
alter table public.thebest_stock enable row level security;
alter table public.thebest_fixed enable row level security;
alter table public.thebest_sales enable row level security;
alter table public.thebest_debts enable row level security;
alter table public.thebest_audit enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on public.thebest_costs, public.thebest_ideas, public.thebest_stock,
  public.thebest_fixed, public.thebest_sales, public.thebest_debts, public.thebest_audit from anon;
grant select on public.thebest_stock to anon;
grant select, insert, update, delete on public.thebest_costs, public.thebest_ideas, public.thebest_stock,
  public.thebest_fixed, public.thebest_sales, public.thebest_debts, public.thebest_audit to authenticated;

drop policy if exists "Publico visualiza estoque" on public.thebest_stock;
create policy "Publico visualiza estoque"
  on public.thebest_stock for select to anon using (true);

drop policy if exists "Operadores gerenciam custos" on public.thebest_costs;
create policy "Operadores gerenciam custos"
  on public.thebest_costs for all to authenticated using (true) with check (true);

drop policy if exists "Operadores gerenciam ideias" on public.thebest_ideas;
create policy "Operadores gerenciam ideias"
  on public.thebest_ideas for all to authenticated using (true) with check (true);

drop policy if exists "Operadores gerenciam estoque" on public.thebest_stock;
create policy "Operadores gerenciam estoque"
  on public.thebest_stock for all to authenticated using (true) with check (true);

drop policy if exists "Operadores gerenciam contas fixas" on public.thebest_fixed;
create policy "Operadores gerenciam contas fixas"
  on public.thebest_fixed for all to authenticated using (true) with check (true);

drop policy if exists "Operadores gerenciam vendas" on public.thebest_sales;
create policy "Operadores gerenciam vendas"
  on public.thebest_sales for all to authenticated using (true) with check (true);

drop policy if exists "Operadores gerenciam fiado" on public.thebest_debts;
create policy "Operadores gerenciam fiado"
  on public.thebest_debts for all to authenticated using (true) with check (true);

drop policy if exists "Operadores gerenciam auditoria" on public.thebest_audit;
create policy "Operadores gerenciam auditoria"
  on public.thebest_audit for all to authenticated using (true) with check (true);

commit;
