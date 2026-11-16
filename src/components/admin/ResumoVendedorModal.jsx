import { useState } from 'react'
import { fmt } from '../../lib/utils'
import { excluirVenda } from '../../lib/excluirVenda'
import useVendasConsulta from '../../lib/useVendasConsulta'
import Modal from '../ui/Modal'
import MesSelector from './MesSelector'
import VendasDoVendedor from './VendasDoVendedor'
import EditarVendaModal from './EditarVendaModal'
import { IconUser } from './icons'

// Popup com as vendas de um vendedor no mês, aberto ao clicar no nome em
// Lançar Venda. Tem seletor de mês próprio: começa no mês que a página está
// mostrando, mas trocar aqui não mexe na página de trás.
function Conteudo({ vendedor, equipe, vendedores, mesAtual, vendasMesAtual, mesInicial, vendasMesInicial, recarregarPagina, onClose }) {
  const consulta = useVendasConsulta(mesAtual, vendasMesAtual, recarregarPagina, { mes: mesInicial, vendas: vendasMesInicial })
  const [editando, setEditando] = useState(null)

  const minhas = consulta.vendas.filter(v => v.vendedor_id === vendedor.id)
  const total  = minhas.reduce((a, b) => a + Number(b.valor), 0)

  return (
    <>
    {/* Enquanto o modal de edição estiver aberto, Esc fecha só ele */}
    <Modal open onClose={() => { if (!editando) onClose() }} largura="max-w-4xl">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          {vendedor.foto_url
            ? <img src={vendedor.foto_url} className="w-14 h-14 rounded-full object-cover border-2 border-red/40" alt={vendedor.nome} />
            : <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background:'#282828', color:'rgba(255,255,255,0.3)' }}><IconUser size={22} /></div>}
          <div className="flex-1 min-w-0">
            <h2 className="font-bebas text-[28px] leading-none tracking-[1.5px] truncate">{vendedor.nome}</h2>
            <div className="flex items-center gap-2 mt-1.5 text-[12.5px] text-muted">
              {equipe && <span className="px-2 py-0.5 rounded text-[11px] font-bold text-red border border-red/25" style={{ background:'rgba(232,0,13,0.08)' }}>{equipe.nome}</span>}
              {vendedor.empresa && <span>{vendedor.empresa}</span>}
            </div>
          </div>
          <button onClick={onClose} title="Fechar (Esc)"
            className="w-9 h-9 flex items-center justify-center rounded-lg border text-muted hover:text-white hover:border-white/25 transition-colors text-lg"
            style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>✕</button>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <MesSelector mes={consulta.mes} mesAtual={mesAtual} onChange={consulta.trocarMes} loading={consulta.loading} />
          <div className="flex items-baseline gap-3">
            <span className="text-[13px] text-muted">{minhas.length} {minhas.length === 1 ? 'venda' : 'vendas'}</span>
            <span className="font-bebas text-[30px] leading-none text-red">{fmt(total)}</span>
          </div>
        </div>

        {consulta.loading
          ? <div className="py-10 text-center text-muted text-[13px]">Carregando...</div>
          : <VendasDoVendedor vendas={minhas} mes={consulta.mes}
              onEditar={setEditando}
              onExcluir={id => excluirVenda(id, consulta.recarregar)} />}
      </div>
    </Modal>

    {/* Fora do popup: o popup tem animação (transform) e isso quebraria o position:fixed */}
    <EditarVendaModal venda={editando} vendedores={vendedores}
      onClose={() => setEditando(null)} onSaved={consulta.recarregar} />
    </>
  )
}

export default function ResumoVendedorModal({ vendedor, ...props }) {
  if (!vendedor) return null
  return <Conteudo key={vendedor.id} vendedor={vendedor} {...props} />
}
