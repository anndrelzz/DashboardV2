import { useCallback, useRef, useState } from 'react'
import { sb } from './supabase'

// Vendas do mês escolhido no seletor do admin (Vendedores e Lançar Venda).
// Mês atual: usa as vendas que o store já carregou, sem consulta extra.
// Mês anterior: busca só as vendas daquele mês, uma vez, e guarda em memória
// enquanto o admin estiver aberto (economiza IO do Supabase).
// inicial (opcional): { mes, vendas } pra já começar num mês que outra tela carregou.
export default function useVendasConsulta(mesAtual, vendasAtual, recarregarStore, inicial = null) {
  const [mes, setMes]         = useState(inicial?.mes || mesAtual)
  const [porMes, setPorMes]   = useState(() =>
    inicial && inicial.mes !== mesAtual ? { [inicial.mes]: inicial.vendas } : {})
  const [loading, setLoading] = useState(false)
  const ultimoPedido = useRef(null)

  const buscar = useCallback(async (m) => {
    ultimoPedido.current = m
    setLoading(true)
    const { data, error } = await sb.from('vendas').select('*').eq('mes', m).order('created_at', { ascending: false })
    if (ultimoPedido.current !== m) return // usuário já trocou de mês
    setLoading(false)
    if (error) { console.error('Erro ao buscar vendas do mês:', error); return }
    setPorMes(p => ({ ...p, [m]: data || [] }))
  }, [])

  // forcar: ignora o que estiver guardado (usado logo depois de lançar uma venda)
  const trocarMes = useCallback((m, forcar = false) => {
    setMes(m)
    if (m === mesAtual) { ultimoPedido.current = null; setLoading(false); return }
    if (forcar || !porMes[m]) buscar(m)
  }, [mesAtual, porMes, buscar])

  // Depois de lançar/editar/excluir: recarrega o mês atual (store) e, se estiver
  // olhando outro mês, busca ele de novo. Uma edição pode mudar a venda de mês,
  // então descarta o que estava guardado dos outros meses.
  // Mantém o mês na tela enquanto recarrega, pra lista não piscar vazia.
  const recarregar = useCallback(async () => {
    setPorMes(p => (mes !== mesAtual && p[mes] ? { [mes]: p[mes] } : {}))
    await Promise.all([recarregarStore(), mes !== mesAtual ? buscar(mes) : null])
  }, [mes, mesAtual, recarregarStore, buscar])

  const ehAtual = mes === mesAtual
  return {
    mes,
    trocarMes,
    recarregar,
    ehAtual,
    loading: !ehAtual && loading,
    vendas: ehAtual ? vendasAtual : (porMes[mes] || []),
  }
}
