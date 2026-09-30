import { create } from 'zustand'
import { sb } from '../lib/supabase'
import { getMes } from '../lib/utils'

const useStore = create((set, get) => ({
  meta:           0,
  metaFechamento: 0,
  vendedores:     [],
  equipes:        [],
  vendas:         [],
  mes:            getMes(),
  loading:        false,
  modoFechamento: false,
  semanaFechamento: { dataInicio: null, dataFim: null, meta: 0 },

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
      set({
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
      })
    } finally {
      if (showLoading) set({ loading: false })
    }
  },
}))

export default useStore
