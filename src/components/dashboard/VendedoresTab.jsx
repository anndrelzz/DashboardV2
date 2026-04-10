import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Chart, CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { fmt, MEDALS } from '../../lib/utils'

Chart.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip, Legend, ChartDataLabels)

const RANK_COLORS = ['#FFB800', '#C0C0C0', '#CD7F32']
const RANK_GLOW   = ['rgba(255,184,0,0.2)', 'rgba(192,192,192,0.12)', 'rgba(205,127,50,0.18)']

function RankItem({ item, index, maxVal }) {
  const pct   = maxVal > 0 ? (item.val / maxVal) * 100 : 0
  const color = RANK_COLORS[index] || 'rgba(255,255,255,0.7)'
  const isTop = index < 3

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="flex items-center gap-3 px-3 py-2 rounded-xl"
      style={{
        background: isTop
          ? `rgba(${index===0?'255,184,0':index===1?'192,192,192':'205,127,50'},0.05)`
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${isTop ? RANK_GLOW[index] : 'rgba(255,255,255,0.05)'}`,
      }}
    >
      <span className="font-bebas flex-shrink-0 w-6 text-center leading-none"
        style={{ fontSize: isTop ? 20 : 14, color }}>
        {MEDALS[index] || index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-[12px] font-semibold truncate pr-2 leading-none">{item.v.nome}</span>
          <span className="font-bebas text-[14px] leading-none flex-shrink-0"
            style={{ color: isTop ? color : '#fff' }}>
            {fmt(item.val)}
          </span>
        </div>
        <div className="h-[3px] rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background: isTop ? color : '#E8000D' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: index * 0.05 + 0.3, duration: 0.7, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function VendedoresTab({ vendedores, vendas }) {
  const chartRef = useRef(null)
  const chartObj = useRef(null)

  // ── Calcular totais ──
  const tV = {}, tVI = {}, tVV = {}
  vendas.forEach(v => {
    tV[v.vendedor_id]  = (tV[v.vendedor_id]  || 0) + Number(v.valor)
    if (v.tipo === 'Veiculo') tVV[v.vendedor_id] = (tVV[v.vendedor_id]||0) + Number(v.valor)
    else                      tVI[v.vendedor_id] = (tVI[v.vendedor_id]||0) + Number(v.valor)
  })

  const sorted = Object.entries(tV)
    .map(([id, val]) => ({ id, val, v: vendedores.find(x => x.id === id) }))
    .filter(x => x.v)
    .sort((a, b) => b.val - a.val)

  const totalGeral = sorted.reduce((a, x) => a + x.val, 0)
  const maxVal     = sorted[0]?.val || 1

  // ── Chart ──
  useEffect(() => {
    if (!chartRef.current || !sorted.length) return

    const existing = Chart.getChart(chartRef.current)
    if (existing) existing.destroy()
    if (chartObj.current) { chartObj.current.destroy(); chartObj.current = null }

    const BAR_H  = 62
    const totalH = Math.max(sorted.length * BAR_H, 200)
    const visH   = Math.min(10, sorted.length) * BAR_H

    const wrap  = chartRef.current.parentElement
    const wrapW = wrap.offsetWidth || 700

    // Set canvas intrinsic dimensions BEFORE creating chart or gradients
    wrap.style.height              = visH + 'px'
    wrap.style.overflowY           = 'auto'
    wrap.style.overflowX           = 'hidden'
    chartRef.current.width         = wrapW
    chartRef.current.height        = totalH
    chartRef.current.style.width   = wrapW + 'px'
    chartRef.current.style.height  = totalH + 'px'

    const ctx2 = chartRef.current.getContext('2d')

    // Build gradients using known canvas width
    const gradImovel = ctx2.createLinearGradient(0, 0, wrapW, 0)
    gradImovel.addColorStop(0, '#FF3535')
    gradImovel.addColorStop(1, '#8B0000')

    const gradVeiculo = ctx2.createLinearGradient(0, 0, wrapW, 0)
    gradVeiculo.addColorStop(0, '#60A5FA')
    gradVeiculo.addColorStop(1, '#1E3A8A')

    // Plugin: valor total à direita de cada barra
    const labelPlugin = {
      id: 'totalLabel',
      afterDatasetsDraw(chart) {
        const { ctx, scales: { x, y } } = chart
        ctx.save()
        ctx.font         = "bold 14px 'Bebas Neue', sans-serif"
        ctx.textAlign    = 'left'
        ctx.textBaseline = 'middle'
        ctx.shadowColor  = 'rgba(0,0,0,0.95)'
        ctx.shadowBlur   = 5
        sorted.forEach((item, i) => {
          if (!item.val) return
          const yPos  = y.getPixelForValue(i)
          const xEnd  = x.getPixelForValue(item.val)
          ctx.fillStyle = 'rgba(255,255,255,0.92)'
          ctx.fillText('R$ ' + Number(item.val).toLocaleString('pt-BR'), xEnd + 10, yPos)
        })
        ctx.shadowBlur = 0
        ctx.restore()
      }
    }

    chartObj.current = new Chart(chartRef.current, {
      type: 'bar',
      plugins: [ChartDataLabels, labelPlugin],
      data: {
        labels: sorted.map(x => {
          const nome  = x.v.nome.split(' ')[0]
          const extra = [x.v.empresa, x.v.nivel].filter(Boolean).join(' · ')
          return extra ? `${nome}  ·  ${extra}` : nome
        }),
        datasets: [
          {
            label: 'Imóvel',
            data: sorted.map(x => tVI[x.id] || 0),
            backgroundColor: gradImovel,
            hoverBackgroundColor: '#FF3535',
            borderRadius: { topLeft: 6, bottomLeft: 6, topRight: 0, bottomRight: 0 },
            borderSkipped: false,
            barThickness: 38,
            stack: 'total',
            datalabels: { display: false },
          },
          {
            label: 'Veículo',
            data: sorted.map(x => tVV[x.id] || 0),
            backgroundColor: gradVeiculo,
            hoverBackgroundColor: '#60A5FA',
            borderRadius: { topLeft: 0, bottomLeft: 0, topRight: 6, bottomRight: 6 },
            borderSkipped: false,
            barThickness: 38,
            stack: 'total',
            datalabels: { display: false },
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: false,
        maintainAspectRatio: false,
        animation: { duration: 700, easing: 'easeOutQuart' },
        plugins: {
          legend: {
            display: true, position: 'top', align: 'start',
            labels: {
              color: 'rgba(255,255,255,0.7)',
              font: { family:"'Barlow Condensed'", weight:'700', size: 12 },
              boxWidth: 14, boxHeight: 10, padding: 16,
              usePointStyle: false,
            }
          },
          tooltip: {
            backgroundColor: 'rgba(10,10,10,0.92)',
            borderColor: 'rgba(232,0,13,0.35)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 10,
            callbacks: {
              label: ctx => {
                const v = ctx.parsed.x
                if (!v) return null
                return `  ${ctx.dataset.label}: R$ ${Number(v).toLocaleString('pt-BR')}`
              }
            }
          },
          datalabels: { display: false },
        },
        layout: { padding: { right: 130, left: 4, top: 4, bottom: 4 } },
        scales: {
          x: {
            display: false,
            stacked: true,
            min: 0,
            max: maxVal * 1.3,
          },
          y: {
            stacked: true,
            ticks: {
              color: 'rgba(255,255,255,0.65)',
              font: { family:"'Barlow'", weight:'600', size: 12 },
              padding: 12,
            },
            grid:   { display: false },
            border: { display: false },
          },
        },
      },
    })

    return () => { chartObj.current?.destroy(); chartObj.current = null }
  }, [JSON.stringify(sorted.map(x => ({ id: x.id, val: x.val })))])

  return (
    <div className="grid gap-4 h-full" style={{ gridTemplateColumns: '290px 1fr' }}>

      {/* ── Top 10 ── */}
      <div className="flex flex-col gap-3 min-h-0">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-4 rounded-full bg-red" />
          <span className="font-bebas text-[12px] tracking-[3px] text-muted uppercase">Top 10 Vendedores</span>
        </div>

        <div className="flex-1 overflow-hidden rounded-2xl p-3 flex flex-col gap-2"
          style={{
            background: 'linear-gradient(160deg,#141414,#0f0f0f)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
          <div className="h-px rounded-full border-anim flex-shrink-0"
            style={{ background:'linear-gradient(90deg,#E8000D,rgba(232,0,13,0.15),transparent)' }} />

          {sorted.length === 0
            ? <div className="flex-1 flex items-center justify-center text-muted text-sm">Sem dados ainda</div>
            : sorted.slice(0,10).map((x,i) => <RankItem key={x.id} item={x} index={i} maxVal={maxVal} />)
          }
        </div>
      </div>

      {/* ── Gráfico ── */}
      <div className="flex flex-col gap-3 min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-[3px] h-4 rounded-full bg-red" />
            <span className="font-bebas text-[12px] tracking-[3px] text-muted uppercase">Ranking — Todos os Vendedores</span>
          </div>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
            className="flex flex-col items-end">
            <span className="text-[9px] text-muted tracking-[1.5px] uppercase">Total Geral</span>
            <span className="font-bebas text-xl text-red leading-none">{fmt(totalGeral)}</span>
          </motion.div>
        </div>

        <div className="flex-1 min-h-0 rounded-2xl flex flex-col p-4 gap-3"
          style={{
            background: 'linear-gradient(160deg,#141414,#0f0f0f)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
          <div className="h-px rounded-full border-anim flex-shrink-0"
            style={{ background:'linear-gradient(90deg,#E8000D,rgba(232,0,13,0.15),transparent)' }} />

          {sorted.length === 0
            ? <div className="flex-1 flex items-center justify-center text-muted text-sm">Sem dados ainda</div>
            : (
              <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
                style={{ scrollbarWidth:'thin', scrollbarColor:'rgba(232,0,13,0.25) transparent' }}>
                <canvas ref={chartRef} />
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}
