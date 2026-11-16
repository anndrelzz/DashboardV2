import { sb } from './supabase'
import { toast } from './toast'

// Exclusão de venda com confirmação — usada em Lançar Venda e em Vendedores
export async function excluirVenda(id, onDone) {
  if (!confirm('Remover esta venda?')) return
  const { error } = await sb.from('vendas').delete().eq('id', id)
  if (error) { toast('Erro ao remover venda', false); return }
  await onDone()
  toast('Venda removida')
}
