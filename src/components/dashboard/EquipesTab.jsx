import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Tooltip } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { fmt, fmtBarra, MEDALS } from '../../lib/utils'

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, ChartDataLabels)

const RANK_COLORS = ['#FFB800', '#C0C0C0', '#CD7F32']
const RANK_GLOW   = ['rgba(255,184,0,0.2)', 'rgba(192,192,192,0.12)', 'rgba(205,127,50,0.18)']

function makeGradient(ctx, chartArea) {
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
  g.addColorStop(0, '#E8000D')
  g.addColorStop(1, 'rgba(232,0,13,0.3)')
  return g
}

export default function EquipesTab({ equipes, vendedores, vendas }) {
  const chartRef = useRef(null)
  const chartObj = useRef(null)

  const tE = {}
  vendas.forEach(v => {
    const vend = vendedores.find(x => x.id === v.vendedor_id)
    if (vend?.equipe_id) tE[vend.equipe_id] = (tE[vend.equipe_id] || 0) + Number(v.valor)
  })

  const sorted = Object.entries(tE)
    .map(([id, val]) => ({ id, val, e: equipes.find(x => x.id === id) }))
    .filter(x => x.e)
    .sort((a, b) => b.val - a.val)

  const totalGeral = sorted.reduce((a, x) => a + x.val, 0)
  const maxVal     = sorted[0]?.val || 1

  useEffect(() => {
    if (!chartRef.current || !sorted.length) return
    const existing = Chart.getChart(chartRef.current)
    if (existing) existing.destroy()
    if (chartObj.current) { chartObj.current.destroy(); chartObj.current = null }

    chartObj.current = new Chart(chartRef.current, {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: sorted.map(x => x.e.nome),
        datasets: [{
          data: sorted.map(x => x.val),
          backgroundColor: ctx => {
            const ca = ctx.chart.chartArea
            return ca ? makeGradient(ctx.chart.ctx, ca) : '#E8000D'
          },
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor:'rgba(0,0,0,0.85)', borderColor:'rgba(232,0,13,0.3)', borderWidth:1,
            padding:10, cornerRadius:10,
            callbacks: { label: ctx => ' R$ ' + ctx.parsed.y.toLocaleString('pt-BR') }
          },
          datalabels: {
            anchor:'center', align:'center', color:'#fff',
            font: { family:"'Bebas Neue'", weight:'700', size:15 },
            formatter: v => fmtBarra(v),
            textShadowColor: 'rgba(0,0,0,0.9)', textShadowBlur: 8
          }
        },
        layout: { padding: { top:10 } },
        scales: {
          x: { ticks:{ color:'rgba(255,255,255,0.6)', font:{ size:12, weight:'700' } }, grid:{ display:false }, border:{ display:false } },
          y: { ticks:{ color:'rgba(255,255,255,0.35)', callback: v => 'R$ '+v.toLocaleString('pt-BR'), font:{size:11} }, grid:{ color:'rgba(255,255,255,0.04)' }, border:{ display:false } }
        }
      }
    })

    return () => { chartObj.current?.destroy(); chartObj.current = null }
  }, [JSON.stringify(sorted.map(x => ({ id: x.id, val: x.val })))])

  return (
    <div className="grid gap-5 h-full" style={{ gridTemplateColumns: '300px 1fr' }}>

      {/* ── Coluna esquerda — Ranking Equipes ── */}
      <div className="flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center gap-2.5">
          <motion.div className="h-5 rounded-full bg-red" style={{ width:3 }}
            initial={{ scaleY:0 }} animate={{ scaleY:1 }} transition={{ duration:0.4 }} />
          <span className="font-bebas text-sm tracking-[3px] text-muted uppercase">Performance por Equipe</span>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl flex flex-col gap-3 p-4"
          style={{
            background: 'linear-gradient(160deg, #141414 0%, #0f0f0f 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
          <div className="h-px border-anim"
            style={{ background: 'linear-gradient(90deg, #E8000D, rgba(232,0,13,0.2), transparent)' }} />

          {sorted.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">Sem dados ainda</div>
          ) : sorted.slice(0, 5).map((x, i) => {
            const pct   = (x.val / maxVal) * 100
            const color = RANK_COLORS[i] || 'rgba(255,255,255,0.7)'
            const isTop = i < 3
            return (
              <motion.div key={x.id}
                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.08, duration:0.4 }}
                className="flex items-center gap-3 px-3 py-3 rounded-xl"
                style={{
                  background: isTop ? `rgba(${i===0?'255,184,0':i===1?'192,192,192':'205,127,50'},0.05)` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isTop ? RANK_GLOW[i] : 'rgba(255,255,255,0.05)'}`,
                  boxShadow: isTop ? `0 0 20px ${RANK_GLOW[i]}` : 'none',
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
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: isTop ? color : 'rgba(232,0,13,0.6)' }}
                      initial={{ width:0 }} animate={{ width:`${pct}%` }}
                      transition={{ delay: i*0.08+0.3, duration:0.8, ease:'easeOut' }} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ── Coluna direita — Gráfico ── */}
      <div className="flex flex-col gap-3 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-0.5 h-5 rounded-full bg-red" />
            <span className="font-bebas text-sm tracking-[3px] text-muted uppercase">Ranking — Vendas por Equipe</span>
          </div>
          <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3 }}
            className="flex flex-col items-end">
            <span className="text-[9px] text-muted tracking-[1.5px] uppercase">Total Acumulado</span>
            <span className="font-bebas text-2xl text-red leading-none">{fmt(totalGeral)}</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.5 }}
          className="flex-1 overflow-hidden rounded-2xl flex flex-col p-4 gap-3"
          style={{
            background: 'linear-gradient(160deg, #141414 0%, #0f0f0f 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
          <div className="h-px border-anim"
            style={{ background: 'linear-gradient(90deg, #E8000D, rgba(232,0,13,0.2), transparent)' }} />
          {sorted.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted text-sm">Sem dados ainda</div>
          ) : (
            <div className="flex-1 relative min-h-0"><canvas ref={chartRef} /></div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
