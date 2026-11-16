import { useState } from 'react'
import { fmt, fmtMesLabel, NIVEL_CORES } from '../../lib/utils'
import { TIPOS, tipoInfo } from '../../lib/tiposVenda'
import VendasDoVendedor from './VendasDoVendedor'
import { IconUser, IconPlus, IconEdit } from './icons'

// Conteúdo da setinha de Equipes: resumo do mês da equipe + integrantes.
// Clicar num integrante abre as vendas dele (editar/excluir); "+ Venda" lança
// uma venda já com ele preenchido.
export default function EquipeDetalhe({ equipe, membros, vendas, mes, onEditar, onExcluir, onNovaVenda, onEditarVendedor }) {
  const [abertos, setAbertos] = useState(() => new Set())
  const alternar = (id) => setAbertos(prev => {
    const n = new Set(prev)
    if (n.has(id)) n.delete(id); else n.add(id)
    return n
  })

  const ids = new Set(membros.map(m => m.id))
  const daEquipe = vendas.filter(v => ids.has(v.vendedor_id))
  const porTipo = TIPOS.map(t => {
    const lista = daEquipe.filter(v => tipoInfo(v.tipo)?.value === t.value)
    return { ...t, qtd: lista.length, total: lista.reduce((a, b) => a + Number(b.valor), 0) }
  }).filter(t => t.qtd > 0)

  // Integrantes do maior pro menor total no mês (gestor sempre primeiro)
  const linhas = membros.map(m => {
    const minhas = daEquipe.filter(v => v.vendedor_id === m.id)
    return { m, minhas, total: minhas.reduce((a, b) => a + Number(b.valor), 0) }
  }).sort((a, b) =>
    (b.m.id === equipe.gestor_id) - (a.m.id === equipe.gestor_id) || b.total - a.total || a.m.nome.localeCompare(b.m.nome))

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background:'#121212', borderColor:'rgba(255,255,255,0.06)' }}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <span className="text-[10.5px] font-bold tracking-[2px] uppercase text-muted mr-1">{fmtMesLabel(mes)}</span>
        <span className="text-[12.5px] text-muted">{daEquipe.length} {daEquipe.length === 1 ? 'venda' : 'vendas'}</span>
        {porTipo.map(t => (
          <span key={t.value} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-bold border"
            style={{ color:t.color, borderColor:t.color + '40', background:t.color + '12' }}>
            <t.Icon size={13} />{t.label} · {t.qtd} · {fmt(t.total)}
          </span>
        ))}
      </div>

      {linhas.length === 0 ? (
        <div className="px-5 py-6 text-center text-muted text-[13px]">Nenhum integrante nesta equipe</div>
      ) : (
        <table className="w-full">
          <tbody>
            {linhas.map(({ m, minhas, total }) => {
              const aberto = abertos.has(m.id)
              const gestor = m.id === equipe.gestor_id
              return [
                <tr key={m.id} onClick={() => alternar(m.id)}
                  className={`border-b cursor-pointer transition-colors ${aberto ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}`}
                  style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                  <td className="pl-5 pr-0 py-2.5 w-7">
                    <span className="inline-block text-muted text-[10px] transition-transform duration-200"
                      style={{ transform: aberto ? 'rotate(90deg)' : 'none' }}>▶</span>
                  </td>
                  <td className="px-3 py-2.5 w-11">
                    {m.foto_url
                      ? <img src={m.foto_url} className="w-8 h-8 rounded-full object-cover border border-white/10" alt={m.nome} />
                      : <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:'#282828', color:'rgba(255,255,255,0.3)' }}><IconUser size={14} /></div>}
                  </td>
                  <td className="px-3 py-2.5 text-[13.5px] font-semibold">
                    {m.nome}
                    {gestor && <span className="ml-2 px-1.5 py-0.5 rounded text-[9.5px] font-bold tracking-wide uppercase text-[#FFB800] border border-[#FFB800]/30" style={{ background:'rgba(255,184,0,0.08)' }}>Gestor</span>}
                  </td>
                  <td className="px-3 py-2.5 text-[12px] font-bold w-24" style={{ color: NIVEL_CORES[m.nivel] || 'rgba(255,255,255,0.4)' }}>{m.nivel || '—'}</td>
                  <td className="px-3 py-2.5 text-[13px] text-muted w-28">{minhas.length} {minhas.length === 1 ? 'venda' : 'vendas'}</td>
                  <td className="px-3 py-2.5 font-bebas text-[16px] text-red w-36">{fmt(total)}</td>
                  <td className="px-5 py-2.5 w-52 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onEditarVendedor(m)} title="Editar nome, foto, nível, equipe"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 mr-2 rounded text-[11px] font-bold tracking-wide border text-muted border-white/15 hover:text-white hover:border-white/30 transition-colors">
                      <IconEdit size={12} />Editar
                    </button>
                    <button onClick={() => onNovaVenda(m)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold tracking-wide border text-white border-red/40 hover:bg-red/20 transition-colors"
                      style={{ background:'rgba(232,0,13,0.12)' }}>
                      <IconPlus size={12} />Venda
                    </button>
                  </td>
                </tr>,
                aberto && (
                  <tr key={m.id + '-vendas'}>
                    <td colSpan={7} className="px-5 pb-4 pt-1">
                      <VendasDoVendedor vendas={minhas} mes={mes} onEditar={onEditar} onExcluir={onExcluir} />
                    </td>
                  </tr>
                ),
              ]
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
