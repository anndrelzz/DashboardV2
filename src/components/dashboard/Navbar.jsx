import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MercadoWidget from './MercadoWidget'
import { fmt } from '../../lib/utils'

const LOGO = (
  <svg height="34" viewBox="0 0 1606 1126" fill="none">
    <path d="M1407.16 985.975C1378.74 1032.88 1329.4 1065.4 1272.17 1070.05H1022.27C975.625 1070.05 976.675 1029.48 976.675 1029.48V754.798C977.201 712.394 1016.89 712.289 1016.89 712.289L1424.45 712.394C1475.45 712.394 1508.74 704.559 1530.44 694.479L1407.18 985.993L1407.16 985.975ZM648.47 124.844C648.47 124.844 604.296 69.8195 542.831 67.8562C542.831 67.8562 572.549 56.4621 600.779 55.9187H945.4C945.4 55.9187 1001.91 55.1299 1035.57 93.0284L1509.86 572.51C1577.27 652.724 1453.98 655.213 1453.98 655.213H1102.95L648.47 124.844ZM469.43 655.196H132.754C132.754 655.196 19.1165 658.912 84.4146 572.51L456.076 137.097C456.076 137.097 520.499 67.6108 607.569 159.307L754.232 329.71L469.43 655.178V655.196ZM583.12 712.289C583.12 712.289 622.813 712.394 623.338 754.798V1029.48C623.338 1029.48 624.388 1070.05 577.712 1070.05H332.988C273.483 1067.07 221.959 1033.99 192.679 985.625L69.5558 694.462C91.2752 704.559 124.563 712.394 175.597 712.394L583.137 712.289H583.12ZM1573.46 559.608C1572.39 558.574 1571.53 557.382 1570.48 556.33L1077.34 55.0423C1028.74 1.54258 956.129 0.105176 945.208 0H599.711C562.433 0.718705 526.275 14.4092 522.179 15.7414C470.077 32.6572 429.491 81.5292 426.359 84.9299C425.764 85.596 425.169 86.2621 424.591 86.9457L26.5897 559.538C25.9421 560.309 25.3471 561.081 24.7345 561.869C-22.922 621.978 12.0634 704.19 17.0164 715.935L140.139 1007.12C141.189 1009.59 142.397 1011.97 143.797 1014.25C183.806 1080.34 253.461 1122.09 330.083 1125.93C331.028 1125.98 331.991 1126 332.971 1126H577.712C615.917 1126 639.544 1110.26 652.618 1097.06C678.293 1071.15 680.218 1038.74 680.218 1029.48V754.114C679.413 690.763 629.674 656.475 583.102 656.335H548.327L789.13 375.672L1029.76 656.335H1016.72C970.305 656.475 920.548 690.78 919.778 754.114C919.761 754.36 919.761 754.587 919.761 754.78V1029.47C919.761 1038.72 921.703 1071.13 947.343 1097.04C960.434 1110.24 984.061 1125.98 1022.25 1125.98H1272.17C1273.69 1125.98 1275.27 1125.91 1276.83 1125.79C1350.44 1119.85 1417.43 1078.27 1456.01 1014.6C1457.39 1012.3 1458.61 1009.92 1459.66 1007.45L1582.93 715.935C1588.06 703.84 1637.58 622.03 1573.44 559.591" fill="#E8000D"/>
  </svg>
)

const EMBERS = [
  { w:3, h:3, color:'#FF6600', bottom:2,  left:'8%',  dx:'-9px',  dur:'1.05s', delay:'0s'    },
  { w:2, h:2, color:'#FFD700', bottom:5,  left:'18%', dx:'11px',  dur:'1.30s', delay:'0.18s' },
  { w:4, h:4, color:'#FF4400', bottom:1,  left:'30%', dx:'-6px',  dur:'0.95s', delay:'0.38s' },
  { w:2, h:2, color:'#FFAA00', bottom:4,  left:'43%', dx:'8px',   dur:'1.20s', delay:'0.10s' },
  { w:3, h:3, color:'#FF3300', bottom:2,  left:'55%', dx:'-13px', dur:'1.10s', delay:'0.55s' },
  { w:2, h:2, color:'#FFD700', bottom:6,  left:'67%', dx:'7px',   dur:'1.40s', delay:'0.28s' },
  { w:3, h:3, color:'#FF6600', bottom:1,  left:'78%', dx:'-8px',  dur:'1.00s', delay:'0.45s' },
  { w:2, h:2, color:'#FF8800', bottom:5,  left:'88%', dx:'10px',  dur:'1.25s', delay:'0.08s' },
]

function FireText() {
  return (
    <motion.div
      key="fire"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex items-center justify-center"
      style={{ flex: '1 1 0', minWidth: 0 }}
    >
      <div className="relative inline-block select-none">
        <span className="fire-text" style={{ fontFamily:"'Anton', sans-serif", fontSize: 44, letterSpacing: '4px' }}>
          DIA DO FECHAMENTO
        </span>
        {EMBERS.map((e, i) => (
          <div key={i} className="ember"
            style={{
              width:  e.w,
              height: e.h,
              background: e.color,
              bottom: e.bottom,
              left:   e.left,
              '--ember-dx':    e.dx,
              '--ember-dur':   e.dur,
              '--ember-delay': e.delay,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function Clock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])
  const dias  = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const h  = String(now.getHours()).padStart(2,'0')
  const mi = String(now.getMinutes()).padStart(2,'0')
  const s  = String(now.getSeconds()).padStart(2,'0')
  return (
    <div className="flex-shrink-0 flex flex-col items-end justify-between" style={{ alignSelf: 'stretch', paddingTop: 8, paddingBottom: 8 }}>
      <span className="font-bebas leading-none tracking-[1px] text-white" style={{ fontSize: 80 }}>
        {h}:{mi}:<span className="text-red">{s}</span>
      </span>
      <span className="font-cond text-[11px] font-bold tracking-[2px] uppercase text-muted leading-none">
        {dias[now.getDay()]}, {now.getDate()} {meses[now.getMonth()]} {now.getFullYear()}
      </span>
    </div>
  )
}

function Divider() {
  return <div className="flex-shrink-0 w-px self-stretch my-3" style={{ background:'rgba(255,255,255,0.08)' }} />
}

export default function Navbar({ meta, totalVendas, modoFechamento, metaFechamento }) {
  const metaAtiva = modoFechamento ? metaFechamento : meta
  const pct = metaAtiva > 0 ? Math.min(100, Math.round((totalVendas / metaAtiva) * 100)) : 0

  const barColor = modoFechamento
    ? 'linear-gradient(90deg,#8B4000,#FF6600,#FF9900)'
    : 'linear-gradient(90deg,#9B0009,#E8000D,#FF4444)'
  const barGlow = modoFechamento
    ? '0 0 10px rgba(255,100,0,0.5)'
    : '0 0 10px rgba(232,0,13,0.5)'

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex-shrink-0 flex items-stretch gap-4 px-5 relative z-10 overflow-hidden"
      style={{
        height: 108,
        background: 'linear-gradient(180deg,#121212 0%,#0d0d0d 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Linha animada no topo — vermelha normal, laranja no fechamento */}
      <motion.div
        className="absolute top-0 left-0 h-[2px]"
        style={{
          background: modoFechamento
            ? 'linear-gradient(90deg,#FF6600,rgba(255,100,0,0.2),transparent)'
            : 'linear-gradient(90deg,#E8000D,rgba(232,0,13,0.2),transparent)',
        }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Logo */}
      <a href="/admin" className="flex-shrink-0 flex items-center opacity-90 hover:opacity-100 transition-opacity">
        {LOGO}
      </a>

      <Divider />

      {/* Meta + Progresso */}
      <div className="flex flex-col justify-center gap-2 px-5 py-2 rounded-xl border transition-colors"
        style={{
          width: 460, minWidth: 300, flexShrink: 1,
          background: modoFechamento ? 'rgba(255,100,0,0.06)' : 'rgba(232,0,13,0.06)',
          borderColor: modoFechamento ? 'rgba(255,140,0,0.2)' : 'rgba(255,255,255,0.08)',
        }}>
        <div className="flex items-baseline justify-between">
          <span className="text-[9px] font-bold tracking-[2.5px] uppercase text-muted">
            {modoFechamento ? 'Meta de Fechamento' : 'Meta Mensal'}
          </span>
          <span className="font-bebas leading-none" style={{ fontSize: 28, color: modoFechamento ? '#FF8C00' : '#E8000D' }}>
            {fmt(metaAtiva)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 text-[8px] font-bold tracking-[2px] uppercase text-muted">Progresso</span>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: barColor, boxShadow: barGlow }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
            />
          </div>
          <span className="flex-shrink-0 font-bebas leading-none" style={{ fontSize: 20, color: modoFechamento ? '#FF8C00' : '#E8000D' }}>
            {pct}%
          </span>
          <span className="flex-shrink-0 text-[9px] text-muted">{fmt(totalVendas)}</span>
        </div>
      </div>

      <Divider />

      {/* Mercado Financeiro ou DIA DO FECHAMENTO */}
      <div className="flex items-center" style={{ flex: '1 1 0', minWidth: 0, maxWidth: 520 }}>
        <AnimatePresence mode="wait">
          {modoFechamento
            ? <FireText key="fire" />
            : (
              <motion.div key="mercado"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-w-0">
                <MercadoWidget />
              </motion.div>
            )
          }
        </AnimatePresence>
      </div>

      <Divider />

      {/* Identificação da unidade */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1">
        <span className="font-bebas leading-none tracking-[4px] text-white" style={{ fontSize: 28 }}>ADEMICON</span>
        <span className="font-cond text-[10px] font-bold tracking-[2px] uppercase leading-none" style={{ color:'rgba(255,255,255,0.35)' }}>Unidade · Joinville América</span>
      </div>

      <Divider />

      {/* Relógio */}
      <div className="ml-auto flex-shrink-0">
        <Clock />
      </div>
    </motion.nav>
  )
}
