import { useMemo, useState } from 'react'
import { fmt, fmtDiaMes, diasEntre, filtrarVendasSemana, pctMeta, normalizarBusca } from '../../lib/utils'
import SectionHeader from './SectionHeader'
import { IconTrophy, IconSearch } from './icons'

const RANK_COLORS = ['#FFB800', '#C0C0C0', '#CD7F32']
const NIVEL_CORES = { 'Prévia':'#A855F7','AUT.':'#3B82F6','Pleno':'#22C55E','Sênior':'#FFB800' }

export default function SecRankingSemana({ equipes, vendedores, vendas, semanaFechamento }) {
  const { dataInicio, dataFim, meta: metaSemana = 0 } = semanaFechamento || {}
  const [busca, setBusca] = useState('')

  const { dias, ranking, totalGeral, totalQtd } = useMemo(() => {
    if (!dataInicio || !dataFim) return { dias: [], ranking: [], totalGeral: 0, totalQtd: 0 }

    const dias = diasEntre(dataInicio, dataFim)
    const vendasSemana = filtrarVendasSemana(vendas, dataInicio, dataFim)

    // tV: total do vendedor no período. tVD: total do vendedor por dia. qtd: nº de vendas.
    const tV = {}, tVD = {}, qtd = {}
    vendasSemana.forEach(v => {
      const dia = String(v.data).slice(0, 10)
      tV[v.vendedor_id]  = (tV[v.vendedor_id] || 0) + Number(v.valor)
      qtd[v.vendedor_id] = (qtd[v.vendedor_id] || 0) + 1
      tVD[v.vendedor_id] = tVD[v.vendedor_id] || {}
      tVD[v.vendedor_id][dia] = (tVD[v.vendedor_id][dia] || 0) + Number(v.valor)
    })

    const nomeEquipe = new Map(equipes.map(e => [e.id, e.nome]))

    // Só quem vendeu no período — o ranking é do fechamento, não do cadastro
    const ranking = vendedores
      .filter(v => tV[v.id] > 0)
      .map(v => ({
        ...v,
        equipeNome: nomeEquipe.get(v.equipe_id) || '—',
        total:      tV[v.id],
        qtd:        qtd[v.id] || 0,
        porDia:     tVD[v.id] || {},
      }))
      .sort((a, b) => b.total - a.total)
      .map((v, i) => ({ ...v, pos: i + 1 }))

    return {
      dias,
      ranking,
      totalGeral: ranking.reduce((a, v) => a + v.total, 0),
      totalQtd:   ranking.reduce((a, v) => a + v.qtd,   0),
    }
  }, [equipes, vendedores, vendas, dataInicio, dataFim])

  const { pct } = pctMeta(totalGeral, metaSemana)
  const bateuMeta = metaSemana > 0 && totalGeral >= metaSemana

  const buscaNorm = normalizarBusca(busca)
  // Filtra só a exibição: a posição no ranking continua sendo a do período inteiro
  const visiveis = buscaNorm
    ? ranking.filter(v => normalizarBusca(v.nome).includes(buscaNorm) || normalizarBusca(v.equipeNome).includes(buscaNorm))
    : ranking

  if (!dataInicio || !dataFim) {
    return (
      <div className="p-10 flex flex-col gap-8">
        <SectionHeader icon={<IconTrophy size={20} />} title="Ranking da Semana"
          subtitle="Quem mais vendeu no período do fechamento" />
        <div className="rounded-2xl border p-14 text-center"
          style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
          <p className="font-bebas text-2xl tracking-[2px] mb-2">Semana do Fechamento não configurada</p>
          <p className="text-[13px] text-muted">Defina o período em Metas para ver o ranking.</p>
        </div>
      </div>
    )
  }

  const cards = [
    { label:'Total do Período', value: fmt(totalGeral), color:'#E8000D' },
    metaSemana > 0
      ? { label:'Meta da Semana', value: `${pct}%`, sub: fmt(metaSemana), color: bateuMeta ? '#22C55E' : '#E8000D' }
      : { label:'Meta da Semana', value: '—', sub:'não definida' },
    { label:'Vendedores que Venderam', value: ranking.length },
    { label:'Volume de Vendas', value: totalQtd },
  ]

  return (
    <div className="p-10 flex flex-col gap-8">
      <SectionHeader icon={<IconTrophy size={20} />} title="Ranking da Semana"
        subtitle={`Quem mais vendeu de ${fmtDiaMes(dataInicio)} a ${fmtDiaMes(dataFim)}`} />

      <div className="grid grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="rounded-2xl border p-5"
            style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
            <p className="text-[10.5px] font-bold tracking-[2px] uppercase text-muted mb-2">{c.label}</p>
            <p className="font-bebas text-4xl leading-none" style={{ color: c.color || '#fff' }}>{c.value}</p>
            {c.sub && <p className="text-[12px] text-muted mt-1.5">{c.sub}</p>}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
        <div className="px-6 py-4.5 border-b flex items-center justify-between gap-6" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Ranking por Vendedor</span>
          <div className="relative w-72">
            <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar vendedor ou equipe..."
              className="w-full rounded-lg pl-9 pr-4 py-2 text-white text-[13px] outline-none border border-white/10 focus:border-red/40 transition-colors"
              style={{ background:'#1F1F1F' }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background:'#1c1c1c' }}>
                {['Pos.','Vendedor','Equipe','Nível','Vendas'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10.5px] font-bold tracking-[2px] uppercase text-muted border-b whitespace-nowrap"
                    style={{ borderColor:'rgba(255,255,255,0.07)' }}>{h}</th>
                ))}
                {dias.map(dia => (
                  <th key={dia} className="text-right px-4 py-3.5 text-[10.5px] font-bold tracking-[1px] uppercase text-muted border-b whitespace-nowrap"
                    style={{ borderColor:'rgba(255,255,255,0.07)' }}>{fmtDiaMes(dia)}</th>
                ))}
                {['Total','% do Total'].map(h => (
                  <th key={h} className="text-right px-5 py-3.5 text-[10.5px] font-bold tracking-[2px] uppercase border-b whitespace-nowrap"
                    style={{ borderColor:'rgba(255,255,255,0.07)', color:'#E8000D' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.length === 0 ? (
                <tr>
                  <td colSpan={5 + dias.length + 2} className="text-center py-14 text-muted text-[13px] tracking-wider uppercase">
                    {ranking.length === 0 ? 'Nenhuma venda no período' : 'Nenhum resultado para essa busca'}
                  </td>
                </tr>
              ) : visiveis.map(v => {
                const cor   = RANK_COLORS[v.pos - 1] || '#fff'
                const share = totalGeral > 0 ? ((v.total / totalGeral) * 100).toFixed(1) : '0,0'
                return (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                    style={{ borderColor:'rgba(255,255,255,0.05)' }}>
                    <td className="px-5 py-3.5 font-bebas text-lg whitespace-nowrap" style={{ color: cor }}>{v.pos}º</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {v.foto_url
                          ? <img src={v.foto_url} className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0" alt={v.nome} />
                          : <div className="w-8 h-8 rounded-full flex-shrink-0 border border-white/10" style={{ background:'#242424' }} />}
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-semibold truncate">{v.nome}</p>
                          {v.empresa && <p className="text-[11px] text-muted truncate">{v.empresa}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-muted whitespace-nowrap">{v.equipeNome}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {v.nivel ? <span className="text-[12px] font-bold" style={{ color: NIVEL_CORES[v.nivel] || '#fff' }}>{v.nivel}</span> : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[13.5px] text-muted">{v.qtd}</td>
                    {dias.map(dia => {
                      const val = v.porDia[dia] || 0
                      return (
                        <td key={dia} className="px-4 py-3.5 text-right font-bebas text-[15px] whitespace-nowrap"
                          style={{ color: val > 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}>
                          {val > 0 ? Number(val).toLocaleString('pt-BR') : '—'}
                        </td>
                      )
                    })}
                    <td className="px-5 py-3.5 text-right font-bebas text-lg whitespace-nowrap" style={{ color: cor }}>{fmt(v.total)}</td>
                    <td className="px-5 py-3.5 text-right text-[13px] text-muted whitespace-nowrap">{share}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
