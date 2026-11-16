-- Gestor (dono) de cada equipe — usado pra separar o ranking da aba Vendedores
-- em Gestores x Aut./Prévias. Se o vendedor for removido, a equipe fica sem gestor.
-- Rodar uma vez no SQL Editor do Supabase.

alter table public.equipes
  add column if not exists gestor_id uuid references public.vendedores(id) on delete set null;

-- Faz a API do Supabase enxergar a coluna nova na hora
notify pgrst, 'reload schema';
