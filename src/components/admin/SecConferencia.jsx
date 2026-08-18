import { useState } from 'react'
import { sb } from '../../lib/supabase'
import useStore from '../../store/useStore'
import { fmt, getDiaFechamento, normalizarBusca, compararConferencia } from '../../lib/utils'
import { toast } from '../ui/Toast'
import Modal from '../ui/Modal'
import SectionHeader from './SectionHeader'
import { IconScale, IconSearch, IconCheck, IconX, IconHome, IconCar, IconWrench } from './icons'

const chaveStorage = mes => `vendamax_conferencia_${mes}`

const TIPOS = [
  { value:'Imovel',  label:'Imóvel',  Icon:IconHome },
  { value:'Veiculo', label:'Veículo', Icon:IconCar },
  { value:'Serviço', label:'Serviço', Icon:IconWrench },
]

const carregarInformado = mes => {
  try {
    const salvo = localStorage.getItem(chaveStorage(mes))
    return salvo ? JSON.parse(salvo) : {}
  } catch {
    return {}
  }
}

export default function SecConferencia({ vendedores, equipes, vendas, onRefresh }) {
  const mes = useStore(s => s.mes)
  const [busca, setBusca]         = useState('')
  const [informado, setInformado] = useState(() => carregarInformado(mes))
  const [mesCarregado, setMesCarregado] = useState(mes)
  const [soPendencias, setSoPendencias] = useState(false)

  const [lancando, setLancando]   = useState(null) // { v, diff }
  const [tipoLancar, setTipoLancar] = useState('')
  const [salvandoLancamento, setSalvandoLancamento] = useState(false)

  if (mes !== mesCarregado) {
    setMesCarregado(mes)
    setInformado(carregarInformado(mes))
  }

  const atualizarInformado = (vendedorId, valor) => {
    setInformado(prev => {
      const next = { ...prev, [vendedorId]: valor }
      if (!valor) delete next[vendedorId]
      localStorage.setItem(chaveStorage(mes), JSON.stringify(next))
      return next
    })
  }

  const limparConferencia = () => {
    if (!confirm(`Limpar os valores informados da conferência de ${mes}? Isso não afeta as vendas lançadas.`)) return
    localStorage.removeItem(chaveStorage(mes))
    setInformado({})
  }

  const abrirLancamento = (v, diff) => {
    setLancando({ v, diff })
    setTipoLancar('')
  }

  const confirmarLancamento = async () => {
    if (!tipoLancar) { toast('Selecione o tipo', false); return }
    setSalvandoLancamento(true)
    const data = getDiaFechamento()
    const { error } = await sb.from('vendas').insert({
      vendedor_id: lancando.v.id,
      valor: lancando.diff,
      data,
      descricao: 'Diferença da conferência',
      tipo: tipoLancar,
      mes: data.substring(0, 7),
    })
    setSalvandoLancamento(false)
    if (error) { toast('Erro ao lançar venda', false); return }
    setLancando(null)
    await onRefresh()
    toast('Diferença lançada!')
  }

  const buscaNorm = normalizarBusca(busca)

  const linhas = vendedores.map(v => {
    const eq = equipes.find(e => e.id === v.equipe_id)
    const dashboard = vendas.filter(x => x.vendedor_id === v.id).reduce((a, b) => a + Number(b.valor), 0)
    const bruto = informado[v.id]
    const { temInformado, diff, bate } = compararConferencia(dashboard, bruto)
    return { v, eq, dashboard, bruto: bruto ?? '', temInformado, diff, bate }
  })

  const filtradas = linhas.filter(l => {
    if (buscaNorm && !normalizarBusca(l.v.nome).includes(buscaNorm) && !normalizarBusca(l.v.empresa).includes(buscaNorm)) return false
    if (soPendencias && l.temInformado && l.bate) return false
    return true
  })

  const totalConferidos  = linhas.filter(l => l.temInformado).length
  const totalBatendo     = linhas.filter(l => l.temInformado && l.bate).length
  const totalDivergentes = linhas.filter(l => l.temInformado && !l.bate).length

  return (
    <div className="p-10 flex flex-col gap-8">
      <SectionHeader icon={<IconScale size={20} />} title="Conferência de Vendas"
        subtitle={`Compare o que cada vendedor informou com o que está lançado em ${mes}`}
        action={
          <button onClick={limparConferencia}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold tracking-[1.5px] uppercase border transition-colors text-muted border-white/15 hover:text-white hover:border-white/30">
            Limpar Conferência
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:'Vendedores',  value: vendedores.length },
          { label:'Conferidos',  value: totalConferidos },
          { label:'Batendo',     value: totalBatendo,     color:'#22C55E' },
          { label:'Divergentes', value: totalDivergentes, color:'#E8000D' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-5"
            style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
            <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-muted mb-2">{s.label}</p>
            <p className="font-bebas text-4xl leading-none" style={{ color: s.color || '#fff' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4.5 border-b flex items-center justify-between gap-4" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-5 flex-shrink-0">
            <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Vendedores</span>
            <label className="flex items-center gap-2 text-[12px] text-muted cursor-pointer select-none">
              <input type="checkbox" checked={soPendencias} onChange={e => setSoPendencias(e.target.checked)}
                className="accent-red" />
              Mostrar só pendências e divergências
            </label>
          </div>
          <div className="relative w-72">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'rgba(255,255,255,0.3)' }} />
            <input type="text" value={busca} onChange={e=>setBusca(e.target.value)}
              placeholder="Buscar por nome ou empresa..."
              className="w-full rounded-lg pl-9 pr-3 py-2 text-white text-[13px] outline-none border border-white/10 focus:border-red/40 transition-colors"
              style={{ background:'#1F1F1F' }} />
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background:'#1c1c1c' }}>
              {['Vendedor','Equipe','No Dashboard','Informado','Status'].map(h => (
                <th key={h} className="text-left px-6 py-3.5 text-[10.5px] font-bold tracking-[2px] uppercase text-muted border-b"
                  style={{ borderColor:'rgba(255,255,255,0.07)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendedores.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-14 text-muted text-[13px] tracking-wider uppercase">Nenhum vendedor cadastrado</td></tr>
            ) : filtradas.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-14 text-muted text-[13px] tracking-wider uppercase">Nada encontrado</td></tr>
            ) : filtradas.map(({ v, eq, dashboard, bruto, temInformado, diff, bate }) => (
              <tr key={v.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                <td className="px-6 py-3 text-[13.5px] font-semibold">{v.nome}</td>
                <td className="px-6 py-3">
                  {eq ? <span className="px-2.5 py-1 rounded text-[11px] font-bold text-red border border-red/25" style={{background:'rgba(232,0,13,0.08)'}}>{eq.nome}</span> : <span className="text-dim text-[12px]">—</span>}
                </td>
                <td className="px-6 py-3 font-bebas text-[16px] text-white">{fmt(dashboard)}</td>
                <td className="px-6 py-3">
                  <input type="number" value={bruto} onChange={e => atualizarInformado(v.id, e.target.value)}
                    placeholder="R$ 0"
                    className="w-36 rounded-lg px-3 py-1.5 text-white text-[13px] outline-none border border-white/10 focus:border-red/40 transition-colors"
                    style={{ background:'#1F1F1F' }} />
                </td>
                <td className="px-6 py-3">
                  {!temInformado ? (
                    <span className="text-dim text-[12px]">Aguardando</span>
                  ) : bate ? (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color:'#22C55E' }}>
                      <IconCheck size={13} />Bate
                    </span>
                  ) : diff > 0 ? (
                    <button onClick={() => abrirLancamento(v, diff)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-bold text-red border border-red/25 hover:bg-red/10 transition-colors"
                      style={{ background:'rgba(232,0,13,0.08)' }}
                      title="Lançar essa diferença como uma nova venda">
                      <IconX size={13} />Faltam {fmt(diff)}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-red">
                      <IconX size={13} />{fmt(Math.abs(diff))} a mais
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup lançar diferença */}
      <Modal open={!!lancando} onClose={() => setLancando(null)} title="Lançar Diferença">
        {lancando && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between px-4 py-3 rounded-lg border"
              style={{ background:'rgba(232,0,13,0.06)', borderColor:'rgba(232,0,13,0.2)' }}>
              <span className="text-sm text-muted">{lancando.v.nome}</span>
              <span className="font-bebas text-xl text-red">{fmt(lancando.diff)}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Tipo da Venda</label>
              <div className="grid grid-cols-3 gap-3">
                {TIPOS.map(t => (
                  <button key={t.value} onClick={() => setTipoLancar(t.value)}
                    className="flex flex-col items-center gap-2 py-4 rounded-lg border text-[13px] font-semibold transition-colors"
                    style={{
                      background: tipoLancar === t.value ? 'rgba(232,0,13,0.1)' : '#1F1F1F',
                      borderColor: tipoLancar === t.value ? 'rgba(232,0,13,0.5)' : 'rgba(255,255,255,0.1)',
                      color: tipoLancar === t.value ? '#fff' : 'rgba(255,255,255,0.6)',
                    }}>
                    <t.Icon size={20} />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={confirmarLancamento} disabled={salvandoLancamento}
                className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
                style={{ background:'#E8000D' }}>
                {salvandoLancamento ? 'Lançando...' : 'Lançar Venda'}
              </button>
              <button onClick={() => setLancando(null)}
                className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase border text-muted hover:text-white hover:border-white/25 transition-colors"
                style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
