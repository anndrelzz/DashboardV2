import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { fmt, fmtDiaMes, diasEntre, filtrarVendasSemana, pctMeta, MEDALS } from '../../lib/utils'

const RANK_COLORS = ['#FFB800', '#C0C0C0', '#CD7F32']
const RANK_GLOW   = ['rgba(255,184,0,0.2)', 'rgba(192,192,192,0.12)', 'rgba(205,127,50,0.18)']

export default function EquipesSemanaTab({ equipes, vendedores, vendas, semanaFechamento }) {
  const { dataInicio, dataFim, meta: metaSemana = 0 } = semanaFechamento || {}

  // Recalcula só quando os dados mudam — o Dashboard re-renderiza de minuto em
  // minuto por causa do relógio e não precisa refazer a agregação toda vez.
  const { dias, sorted, totalGeral, maxVal, maxPorDia } = useMemo(() => {
    if (!dataInicio || !dataFim) return { dias: [], sorted: [], totalGeral: 0, maxVal: 1, maxPorDia: {} }
    const dias = diasEntre(dataInicio, dataFim)
    const vendasSemana = filtrarVendasSemana(vendas, dataInicio, dataFim)
    const equipePorVendedor = new Map(vendedores.map(v => [v.id, v.equipe_id]))

    // tE: total da equipe na semana. tED: total da equipe por dia.
    const tE = {}, tED = {}
    vendasSemana.forEach(v => {
      const equipeId = equipePorVendedor.get(v.vendedor_id)
      if (!equipeId) return
      const dia = String(v.data).slice(0, 10)
      tE[equipeId]  = (tE[equipeId]  || 0) + Number(v.valor)
      tED[equipeId] = tED[equipeId] || {}
      tED[equipeId][dia] = (tED[equipeId][dia] || 0) + Number(v.valor)
    })

    const sorted = equipes
      .map(e => ({ id: e.id, val: tE[e.id] || 0, e, porDia: tED[e.id] || {} }))
      .sort((a, b) => b.val - a.val)

    // Maior valor de cada coluna-dia, pra destacar
    const maxPorDia = {}
    dias.forEach(dia => {
      maxPorDia[dia] = Math.max(0, ...sorted.map(x => x.porDia[dia] || 0))
    })

    return {
      dias,
      sorted,
      totalGeral: sorted.reduce((a, x) => a + x.val, 0),
      maxVal:     sorted[0]?.val || 1,
      maxPorDia,
    }
  }, [equipes, vendedores, vendas, dataInicio, dataFim])

  const { pct, pctBarra } = pctMeta(totalGeral, metaSemana)
  const bateuMeta = metaSemana > 0 && totalGeral >= metaSemana
  const falta     = Math.max(0, metaSemana - totalGeral)

  if (!dataInicio || !dataFim) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted">
          <p className="font-bebas text-2xl tracking-[2px] mb-2">Semana do Fechamento não configurada</p>
          <p className="text-sm">Defina a data início e fim no painel admin, em Metas.</p>
        </div>
      </div>
    )
  }

  const cardStyle = {
    background: 'linear-gradient(160deg, #141414 0%, #0f0f0f 100%)',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  }
  const topLineStyle = { background: 'linear-gradient(90deg, #E8000D, rgba(232,0,13,0.2), transparent)' }

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between gap-6 flex-shrink-0">
        <span className="font-bebas text-2xl tracking-[3px] uppercase text-white flex-shrink-0">Unidade Joinville-América</span>

        {metaSemana > 0 ? (
          <div className="flex items-center gap-5 px-5 py-2.5 rounded-xl border flex-1 max-w-[820px]"
            style={{
              background: bateuMeta ? 'rgba(34,197,94,0.07)' : 'rgba(232,0,13,0.06)',
              borderColor: bateuMeta ? 'rgba(34,197,94,0.3)' : 'rgba(232,0,13,0.2)',
            }}>
            <div className="flex flex-col leading-none gap-1.5 flex-shrink-0">
              <span className="text-[9px] text-muted tracking-[1.5px] uppercase">Meta da Semana</span>
              <span className="font-bebas text-xl leading-none" style={{ color: bateuMeta ? '#22C55E' : '#E8000D' }}>
                {fmt(metaSemana)}
              </span>
            </div>

            <div className="w-px self-stretch" style={{ background: 'rgba(255,255,255,0.1)' }} />

            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-bebas text-[26px] leading-none" style={{ color: bateuMeta ? '#22C55E' : '#E8000D' }}>
                  {fmt(totalGeral)}
                </span>
                <span className="text-[10px] tracking-[1px] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {bateuMeta ? 'Meta batida! 🔥' : `Faltam ${fmt(falta)}`}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.09)' }}>
                <motion.div className="h-full rounded-full"
                  style={{
                    background: bateuMeta
                      ? 'linear-gradient(90deg,#15803D,#22C55E,#4ADE80)'
                      : 'linear-gradient(90deg,#9B0009,#E8000D,#FF4444)',
                    boxShadow: bateuMeta ? '0 0 10px rgba(34,197,94,0.5)' : '0 0 10px rgba(232,0,13,0.5)',
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pctBarra}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }} />
              </div>
            </div>

            <span className="font-bebas leading-none flex-shrink-0" style={{ fontSize: 44, color: bateuMeta ? '#22C55E' : '#E8000D' }}>
              {pct}%
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-muted tracking-[1.5px] uppercase">Total do Período</span>
            <span className="font-bebas text-2xl leading-none" style={{ color: '#E8000D' }}>{fmt(totalGeral)}</span>
          </div>
        )}
      </div>

      <div className="grid gap-5 flex-1 min-h-0" style={{ gridTemplateColumns: '300px 1fr' }}>

        {/* ── Coluna esquerda — Ranking Equipes ── */}
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center gap-2.5">
            <motion.div className="h-5 rounded-full" style={{ width: 3, background: '#E8000D' }}
              initial={{ scaleY:0 }} animate={{ scaleY:1 }} transition={{ duration:0.4 }} />
            <span className="font-bebas text-sm tracking-[3px] text-muted uppercase">Ranking da Semana</span>
          </div>

          <div className="flex-1 overflow-hidden rounded-2xl flex flex-col gap-3 p-4" style={cardStyle}>
            <div className="h-px border-anim" style={topLineStyle} />

            {sorted.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted text-sm">Sem dados ainda</div>
            ) : sorted.slice(0, 5).map((x, i) => {
              const largura = (x.val / maxVal) * 100
              const color = RANK_COLORS[i] || 'rgba(255,255,255,0.7)'
              const glow  = RANK_GLOW[i]   || 'rgba(255,255,255,0.05)'
              const isTop = i < 3
              return (
                <motion.div key={x.id}
                  initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.08, duration:0.4 }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl"
                  style={{
                    background: isTop ? `rgba(${i===0?'255,184,0':i===1?'192,192,192':'205,127,50'},0.05)` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isTop ? glow : 'rgba(255,255,255,0.05)'}`,
                    boxShadow: isTop ? `0 0 20px ${glow}` : 'none',
                  }}>
                  <span className="font-bebas flex-shrink-0 w-7 text-center leading-none"
                    style={{ fontSize: isTop ? 22 : 15, color }}>
                    {MEDALS[i] || i+1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[13px] font-semibold truncate pr-2">{x.e.nome}</span>
                      <span className="font-bebas text-[15px] flex-shrink-0" style={{ color: isTop ? color : '#fff' }}>
                        {fmt(x.val)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.25)' }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: isTop ? color : 'rgba(232,0,13,0.6)' }}
                        initial={{ width:0 }} animate={{ width:`${largura}%` }}
                        transition={{ delay: i*0.08+0.3, duration:0.8, ease:'easeOut' }} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* ── Coluna direita — Tabela equipes × dias ── */}
        <div className="flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-5 rounded-full" style={{ background: '#E8000D' }} />
            <span className="font-bebas text-sm tracking-[3px] text-muted uppercase">
              Vendas por Dia — {fmtDiaMes(dataInicio)} a {fmtDiaMes(dataFim)}
            </span>
          </div>

          <div className="flex-1 overflow-auto rounded-2xl p-4" style={cardStyle}>
            <div className="h-px border-anim mb-3" style={topLineStyle} />
            {sorted.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted text-sm">Sem dados ainda</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left pb-4 pr-3 font-cond font-bold text-[14px] tracking-[1.5px] uppercase text-white sticky left-0" style={{ background:'inherit' }}>
                      Equipe
                    </th>
                    {dias.map(dia => (
                      <th key={dia} className="text-right pb-4 px-2.5 font-cond font-bold text-[16px] tracking-[1px] uppercase text-white whitespace-nowrap">
                        {fmtDiaMes(dia)}
                      </th>
                    ))}
                    <th className="text-right pb-4 pl-3 font-cond font-bold text-[14px] tracking-[1.5px] uppercase" style={{ color:'#E8000D' }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((x, i) => (
                    <tr key={x.id} className="border-t-2" style={{ borderColor:'rgba(255,255,255,0.25)' }}>
                      <td className="py-5 pr-3 text-[18px] font-semibold whitespace-nowrap sticky left-0" style={{ background:'inherit', color: i < 3 ? RANK_COLORS[i] : '#fff' }}>
                        {x.e.nome}
                      </td>
                      {dias.map(dia => {
                        const val = x.porDia[dia] || 0
                        const isMax = val > 0 && val === maxPorDia[dia]
                        return (
                          <td key={dia} className="py-5 px-2.5 text-right font-bebas text-[20px] whitespace-nowrap"
                            style={{ color: isMax ? '#E8000D' : val > 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}>
                            {val > 0 ? Number(val).toLocaleString('pt-BR') : '—'}
                          </td>
                        )
                      })}
                      <td className="py-5 pl-3 text-right font-bebas text-[22px] whitespace-nowrap" style={{ color: i < 3 ? RANK_COLORS[i] : '#fff' }}>
                        {fmt(x.val)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
