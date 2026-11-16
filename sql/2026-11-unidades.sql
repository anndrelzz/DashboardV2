-- Unidades (Joinville América, Santo Antônio, Jardins SP, Botucatu)
-- Cada equipe pertence a uma unidade; o vendedor herda a unidade da equipe.
-- Equipe sem unidade conta como a unidade de menor "ordem" (Joinville América).
-- Rodar uma vez no SQL Editor do Supabase.

create table if not exists public.unidades (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null unique,
  ordem      int  not null default 100,
  created_at timestamptz not null default now()
);

insert into public.unidades (nome, ordem) values
  ('Joinville América', 1),
  ('Santo Antônio',     2),
  ('Jardins SP',        3),
  ('Botucatu',          4)
on conflict (nome) do nothing;

alter table public.equipes
  add column if not exists unidade_id uuid references public.unidades(id) on delete set null;

-- Mesmas regras das outras tabelas: lê quem está logado, grava só admin
alter table public.unidades enable row level security;

drop policy if exists ler_logado   on public.unidades;
drop policy if exists admin_insere on public.unidades;
drop policy if exists admin_altera on public.unidades;
drop policy if exists admin_apaga  on public.unidades;

create policy ler_logado   on public.unidades for select to authenticated using (true);
create policy admin_insere on public.unidades for insert to authenticated with check (public.is_admin());
create policy admin_altera on public.unidades for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy admin_apaga  on public.unidades for delete to authenticated using (public.is_admin());
