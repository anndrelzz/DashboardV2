import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const LOGO = (
  <svg height="56" viewBox="0 0 1606 1126" fill="none">
    <path d="M1407.16 985.975C1378.74 1032.88 1329.4 1065.4 1272.17 1070.05H1022.27C975.625 1070.05 976.675 1029.48 976.675 1029.48V754.798C977.201 712.394 1016.89 712.289 1016.89 712.289L1424.45 712.394C1475.45 712.394 1508.74 704.559 1530.44 694.479L1407.18 985.993L1407.16 985.975ZM648.47 124.844C648.47 124.844 604.296 69.8195 542.831 67.8562C542.831 67.8562 572.549 56.4621 600.779 55.9187H945.4C945.4 55.9187 1001.91 55.1299 1035.57 93.0284L1509.86 572.51C1577.27 652.724 1453.98 655.213 1453.98 655.213H1102.95L648.47 124.844ZM469.43 655.196H132.754C132.754 655.196 19.1165 658.912 84.4146 572.51L456.076 137.097C456.076 137.097 520.499 67.6108 607.569 159.307L754.232 329.71L469.43 655.178V655.196ZM583.12 712.289C583.12 712.289 622.813 712.394 623.338 754.798V1029.48C623.338 1029.48 624.388 1070.05 577.712 1070.05H332.988C273.483 1067.07 221.959 1033.99 192.679 985.625L69.5558 694.462C91.2752 704.559 124.563 712.394 175.597 712.394L583.137 712.289H583.12ZM1573.46 559.608C1572.39 558.574 1571.53 557.382 1570.48 556.33L1077.34 55.0423C1028.74 1.54258 956.129 0.105176 945.208 0H599.711C562.433 0.718705 526.275 14.4092 522.179 15.7414C470.077 32.6572 429.491 81.5292 426.359 84.9299C425.764 85.596 425.169 86.2621 424.591 86.9457L26.5897 559.538C25.9421 560.309 25.3471 561.081 24.7345 561.869C-22.922 621.978 12.0634 704.19 17.0164 715.935L140.139 1007.12C141.189 1009.59 142.397 1011.97 143.797 1014.25C183.806 1080.34 253.461 1122.09 330.083 1125.93C331.028 1125.98 331.991 1126 332.971 1126H577.712C615.917 1126 639.544 1110.26 652.618 1097.06C678.293 1071.15 680.218 1038.74 680.218 1029.48V754.114C679.413 690.763 629.674 656.475 583.102 656.335H548.327L789.13 375.672L1029.76 656.335H1016.72C970.305 656.475 920.548 690.78 919.778 754.114C919.761 754.36 919.761 754.587 919.761 754.78V1029.47C919.761 1038.72 921.703 1071.13 947.343 1097.04C960.434 1110.24 984.061 1125.98 1022.25 1125.98H1272.17C1273.69 1125.98 1275.27 1125.91 1276.83 1125.79C1350.44 1119.85 1417.43 1078.27 1456.01 1014.6C1457.39 1012.3 1458.61 1009.92 1459.66 1007.45L1582.93 715.935C1588.06 703.84 1637.58 622.03 1573.44 559.591" fill="#fff" />
  </svg>
)

const HORARIOS_MANHA = [
  { type: 'slot',  inicio: '10h00', fim: '10h45' },
  { type: 'break', label: '15min – descanso', icon: '☕' },
  { type: 'slot',  inicio: '11h00', fim: '11h45' },
]

const HORARIOS_TARDE = [
  { type: 'slot',  inicio: '14h00', fim: '14h45' },
  { type: 'break', label: '15min – descanso', icon: '☕' },
  { type: 'slot',  inicio: '15h00', fim: '15h45' },
]

// Exibe manhã até 11h45, depois tarde
function getHorarios(min) {
  return min < 11 * 60 + 45 ? HORARIOS_MANHA : HORARIOS_TARDE
}

function toMin(str) {
  const [h, m] = str.split('h').map(Number)
  return h * 60 + m
}

function nowMin() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}

export default function AgendamentosTab() {
  const [cur, setCur] = useState(nowMin())

  useEffect(() => {
    const iv = setInterval(() => setCur(nowMin()), 30_000)
    return () => clearInterval(iv)
  }, [])

  const horarios = getHorarios(cur)

  const activeIdx = horarios.findIndex(
    h => h.type === 'slot' && cur >= toMin(h.inicio) && cur < toMin(h.fim)
  )

  return (
    <motion.div
      key="agendamentos"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full w-full flex flex-col items-center justify-start overflow-y-auto pt-10 pb-6 relative"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(232,0,13,0.13) 0%, transparent 70%)' }}
    >
      {/* grade de fundo sutil */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:
          'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(255,255,255,0.018) 40px),' +
          'repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(255,255,255,0.018) 40px)',
      }} />

      {/* Título */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.45 }}
        className="flex flex-col items-center gap-3 mb-10 w-full px-4"
        style={{ maxWidth: 700 }}
      >
        <motion.span
          animate={{ textShadow: ['0 0 30px rgba(232,0,13,0.6)', '0 0 60px rgba(232,0,13,0.9)', '0 0 30px rgba(232,0,13,0.6)'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="font-bebas tracking-[6px] uppercase whitespace-nowrap"
          style={{
            fontSize: 'clamp(30px, 4vw, 56px)',
            color: '#fff',
            textShadow: '0 0 40px rgba(232,0,13,0.7)',
          }}
        >
          Horário de Agendamentos
        </motion.span>
        <div className="flex items-center gap-3">
          <div className="h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg,transparent,rgba(232,0,13,0.8))' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: '#E8000D', boxShadow: '0 0 8px rgba(232,0,13,0.9)' }} />
          <div className="h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg,rgba(232,0,13,0.8),transparent)' }} />
        </div>
      </motion.div>

      {/* Lista */}
      <div className="flex flex-col items-center gap-4 w-full px-4" style={{ maxWidth: 700 }}>
        {horarios.map((item, i) => {
          if (item.type === 'break') {
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.035, duration: 0.4 }}
                className="flex items-center gap-3 py-0.5 select-none"
              >
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: item.icon === '🍽️' ? 20 : 18 }}>{item.icon}</span>
                <span
                  className="font-cond font-bold tracking-[3px] uppercase"
                  style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }}
                >
                  {item.label}
                </span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
              </motion.div>
            )
          }

          const isActive = i === activeIdx

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.035, duration: 0.4 }}
              className="relative w-full flex items-center justify-center rounded-2xl py-3 px-10 select-none overflow-hidden"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg,rgba(232,0,13,0.22),rgba(180,0,10,0.12))'
                  : 'rgba(255,255,255,0.028)',
                border: `1px solid ${isActive ? 'rgba(232,0,13,0.5)' : 'rgba(255,255,255,0.055)'}`,
                boxShadow: isActive ? '0 0 50px rgba(232,0,13,0.22), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
              }}
            >
              {/* barra lateral pulsante quando ativo */}
              {isActive && (
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                  style={{ background: '#E8000D', boxShadow: '0 0 12px rgba(232,0,13,0.8)' }}
                />
              )}

              <span
                className="font-bebas tracking-widest text-center"
                style={{
                  fontSize: 'clamp(40px, 5.5vw, 72px)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.78)',
                  textShadow: isActive ? '0 0 60px rgba(232,0,13,0.7)' : 'none',
                  letterSpacing: '0.12em',
                }}
              >
                {item.inicio} – {item.fim}
              </span>

              {/* badge "AGORA" */}
              {isActive && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute right-5 font-cond font-bold text-[11px] tracking-[2px] uppercase px-2.5 py-1 rounded-full"
                  style={{
                    background: 'rgba(232,0,13,0.3)',
                    color: '#FF5555',
                    border: '1px solid rgba(232,0,13,0.45)',
                    boxShadow: '0 0 10px rgba(232,0,13,0.3)',
                  }}
                >
                  ● AGORA
                </motion.span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* rodapé */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 font-cond font-bold tracking-[3px] uppercase text-center"
        style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}
      >
        ADEMICON · Unidade Joinville América
      </motion.p>
    </motion.div>
  )
}
