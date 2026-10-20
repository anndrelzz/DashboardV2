import { create } from 'zustand'
import { sb } from '../lib/supabase'
import { getMes } from '../lib/utils'

// Último resultado do banco guardado no navegador: ao abrir o site a tela já
// aparece com esses dados e o carregarDados atualiza em segundo plano.
const CACHE_KEY = 'dash_cache_v1'

const lerCache = () => {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY))
    return c && c.mes === getMes() ? c : null
  } catch {
    return null
  }
}

const salvarCache = (dados) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(dados)) } catch { /* sem storage, segue sem cache */ }
}

// Chamar no logout, pra não deixar os dados de vendas no navegador
export const limparCache = () => {
  try { localStorage.removeItem(CACHE_KEY) } catch { /* nada a limpar */ }
}

const cache = lerCache()

const useStore = create((set, get) => ({
  meta:           cache?.meta           ?? 0,
  metaFechamento: cache?.metaFechamento ?? 0,
  vendedores:     cache?.vendedores     ?? [],
  equipes:        cache?.equipes        ?? [],
  vendas:         cache?.vendas         ?? [],
  mes:            getMes(),
  loading:        false,
  temCache:       !!cache,
  modoFechamento: false,
  semanaFechamento: cache?.semanaFechamento ?? { dataInicio: null, dataFim: null, meta: 0 },

  setMes:            (mes) => set({ mes }),
  setModoFechamento: (v)   => set({ modoFechamento: v }),

  carregarDados: async (mesParam, { showLoading = false } = {}) => {
    const mes = mesParam || get().mes
    if (showLoading) set({ loading: true })
    try {
      const [r1, r2, r3, r4, r5, r6] = await Promise.all([
        sb.from('equipes').select('*').order('nome'),
        sb.from('vendedores').select('*').order('nome'),
        sb.from('metas').select('*').eq('mes', mes).maybeSingle(),
        sb.from('vendas').select('*').eq('mes', mes).order('created_at', { ascending: false }),
        sb.from('meta_fechamento').select('*').eq('id', 1).maybeSingle(),
        sb.from('semana_fechamento').select('*').eq('mes', mes).maybeSingle(),
      ])
      // Se alguma consulta falhar (rede caiu, banco lento), mantém o que já
      // está na tela em vez de zerar tudo
      const erro = [r1, r2, r3, r4, r5, r6].find(r => r.error)
      if (erro) { console.error('Erro ao carregar dados:', erro.error); return }

      const dados = {
        equipes:        r1.data || [],
        vendedores:     r2.data || [],
        meta:           r3.data?.valor || 0,
        vendas:         r4.data || [],
        metaFechamento: r5.data?.valor || 0,
        semanaFechamento: {
          dataInicio: r6.data?.data_inicio || null,
          dataFim:    r6.data?.data_fim    || null,
          meta:       r6.data?.meta        || 0,
        },
        mes,
      }
      set(dados)
      // Só o mês corrente vai pro cache — é o que a TV abre
      if (mes === getMes()) salvarCache(dados)
    } finally {
      if (showLoading) set({ loading: false })
    }
  },
}))

export default useStore
