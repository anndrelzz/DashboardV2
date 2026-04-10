import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import MercadoWidget from './MercadoWidget'
import { fmt } from '../../lib/utils'

const LOGO = (
  <svg height="36" viewBox="0 0 1606 1126" fill="none">
    <path d="M1407.16 985.975C1378.74 1032.88 1329.4 1065.4 1272.17 1070.05H1022.27C975.625 1070.05 976.675 1029.48 976.675 1029.48V754.798C977.201 712.394 1016.89 712.289 1016.89 712.289L1424.45 712.394C1475.45 712.394 1508.74 704.559 1530.44 694.479L1407.18 985.993L1407.16 985.975ZM648.47 124.844C648.47 124.844 604.296 69.8195 542.831 67.8562C542.831 67.8562 572.549 56.4621 600.779 55.9187H945.4C945.4 55.9187 1001.91 55.1299 1035.57 93.0284L1509.86 572.51C1577.27 652.724 1453.98 655.213 1453.98 655.213H1102.95L648.47 124.844ZM469.43 655.196H132.754C132.754 655.196 19.1165 658.912 84.4146 572.51L456.076 137.097C456.076 137.097 520.499 67.6108 607.569 159.307L754.232 329.71L469.43 655.178V655.196ZM583.12 712.289C583.12 712.289 622.813 712.394 623.338 754.798V1029.48C623.338 1029.48 624.388 1070.05 577.712 1070.05H332.988C273.483 1067.07 221.959 1033.99 192.679 985.625L69.5558 694.462C91.2752 704.559 124.563 712.394 175.597 712.394L583.137 712.289H583.12ZM1573.46 559.608C1572.39 558.574 1571.53 557.382 1570.48 556.33L1077.34 55.0423C1028.74 1.54258 956.129 0.105176 945.208 0H599.711C562.433 0.718705 526.275 14.4092 522.179 15.7414C470.077 32.6572 429.491 81.5292 426.359 84.9299C425.764 85.596 425.169 86.2621 424.591 86.9457L26.5897 559.538C25.9421 560.309 25.3471 561.081 24.7345 561.869C-22.922 621.978 12.0634 704.19 17.0164 715.935L140.139 1007.12C141.189 1009.59 142.397 1011.97 143.797 1014.25C183.806 1080.34 253.461 1122.09 330.083 1125.93C331.028 1125.98 331.991 1126 332.971 1126H577.712C615.917 1126 639.544 1110.26 652.618 1097.06C678.293 1071.15 680.218 1038.74 680.218 1029.48V754.114C679.413 690.763 629.674 656.475 583.102 656.335H548.327L789.13 375.672L1029.76 656.335H1016.72C970.305 656.475 920.548 690.78 919.778 754.114C919.761 754.36 919.761 754.587 919.761 754.78V1029.47C919.761 1038.72 921.703 1071.13 947.343 1097.04C960.434 1110.24 984.061 1125.98 1022.25 1125.98H1272.17C1273.69 1125.98 1275.27 1125.91 1276.83 1125.79C1350.44 1119.85 1417.43 1078.27 1456.01 1014.6C1457.39 1012.3 1458.61 1009.92 1459.66 1007.45L1582.93 715.935C1588.06 703.84 1637.58 622.03 1573.44 559.591" fill="#E8000D"/>
  </svg>
)

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
    <div className="flex-shrink-0 flex flex-col items-center gap-0.5 px-5 py-2 rounded-2xl border border-white/[0.06]"
      style={{ background:'rgba(255,255,255,0.03)' }}>
      <span className="font-bebas leading-none tracking-[2px] text-white" style={{ fontSize: 48 }}>
        {h}:{mi}:<span className="text-red">{s}</span>
      </span>
      <span className="font-cond text-[10px] font-bold tracking-[2px] uppercase text-muted">
        {dias[now.getDay()]}, {now.getDate()} {meses[now.getMonth()]} {now.getFullYear()}
      </span>
    </div>
  )
}

export default function Navbar({ meta, totalVendas, mes, onMesChange }) {
  const pct = meta > 0 ? Math.min(100, Math.round((totalVendas / meta) * 100)) : 0

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex-shrink-0 flex items-center gap-3 px-4 relative z-10"
      style={{
        height: 88,
        background: 'linear-gradient(180deg,#121212 0%,#0d0d0d 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Linha vermelha animada no topo */}
      <motion.div
        className="absolute top-0 left-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg,#E8000D,rgba(232,0,13,0.2),transparent)' }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Logo */}
      <div className="flex-shrink-0 mr-1">{LOGO}</div>

      {/* Meta + Progresso */}
      <div className="flex-shrink-0 px-5 py-3 rounded-xl border border-white/[0.08]"
        style={{ background:'rgba(232,0,13,0.07)', minWidth: 280 }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold tracking-[2.5px] uppercase text-muted">Meta Mensal</span>
          <span className="font-bebas text-red leading-none" style={{ fontSize: 26 }}>{fmt(meta)}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.07)' }}>
          <motion.div className="h-full rounded-full"
            style={{ background:'linear-gradient(90deg,#9B0009,#E8000D,#FF4444)', boxShadow:'0 0 8px rgba(232,0,13,0.5)' }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted font-semibold">{fmt(totalVendas)}</span>
          <span className="text-[11px] font-bold text-red">{pct}%</span>
        </div>
      </div>

      {/* Mercado Financeiro */}
      <div className="flex-1 min-w-0">
        <MercadoWidget />
      </div>

      {/* Seletor de mês */}
      <div className="flex-shrink-0 px-3 py-2 rounded-xl border border-white/[0.06]"
        style={{ background:'rgba(255,255,255,0.03)' }}>
        <div className="text-[9px] font-bold tracking-[2px] uppercase text-muted mb-0.5">Mês</div>
        <input type="month" value={mes} onChange={e => onMesChange(e.target.value)}
          className="bg-transparent border-none text-white font-bebas text-[16px] tracking-wide outline-none cursor-pointer p-0 w-[130px]" />
      </div>

      {/* CDI */}
      <div className="flex-shrink-0 px-3 py-2 rounded-xl border border-white/[0.06] flex flex-col gap-0.5 items-center"
        style={{ background:'rgba(255,255,255,0.03)' }}>
        <span className="text-[9px] font-bold tracking-[2px] uppercase text-muted">CDI</span>
        <span className="font-bebas text-white leading-none" style={{ fontSize: 24 }}>14,65%</span>
        <span className="text-[8px] text-dim tracking-wide">a.a.</span>
      </div>

      {/* Relógio */}
      <Clock />

      {/* Link Admin */}
      <a href="/admin"
        className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border border-white/[0.06] transition-all hover:border-red/40 hover:bg-red/10"
        style={{ background:'rgba(255,255,255,0.03)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </a>
    </motion.nav>
  )
}
