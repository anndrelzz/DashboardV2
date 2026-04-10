import { create } from 'zustand'
import { sb } from '../lib/supabase'
import { getMes } from '../lib/utils'

const useStore = create((set, get) => ({
  meta:       0,
  vendedores: [],
  equipes:    [],
  vendas:     [],
  mes:        getMes(),
  loading:    false,

  setMes: (mes) => set({ mes }),

  carregarDados: async (mesParam) => {
    const mes = mesParam || get().mes
    set({ loading: true })
    try {
      const [r1, r2, r3, r4] = await Promise.all([
        sb.from('equipes').select('*').order('nome'),
        sb.from('vendedores').select('*').order('nome'),
        sb.from('metas').select('*').eq('mes', mes).maybeSingle(),
        sb.from('vendas').select('*').eq('mes', mes).order('created_at', { ascending: false }),
      ])
      set({
        equipes:    r1.data || [],
        vendedores: r2.data || [],
        meta:       r3.data?.valor || 0,
        vendas:     r4.data || [],
        mes,
      })
    } finally {
      set({ loading: false })
    }
  },
}))

export default useStore
