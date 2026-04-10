import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fmt } from '../../lib/utils'

const CORES = ['#E8000D','#FFB800','#22C55E','#3B82F6','#A855F7','#fff','#F97316','#EC4899']

function dispararConfetti() {
  document.querySelectorAll('.confetti-piece').forEach(e => e.remove())
  for (let i = 0; i < 120; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-piece'
    const size     = 5 + Math.random() * 12
    const delay    = Math.random() * 1.5
    const duration = 3 + Math.random() * 3
    const isCircle = Math.random() > 0.4
    el.style.cssText = `
      left:${Math.random()*100}vw;
      background:${CORES[Math.floor(Math.random()*CORES.length)]};
      width:${size}px; height:${isCircle ? size : size*0.4}px;
      border-radius:${isCircle ? '50%' : '2px'};
      animation-delay:${delay}s;
      animation-duration:${duration}s;
      opacity:0;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), (delay + duration) * 1000 + 200)
  }
}

export default function CelebracaoCard({ venda, vendedor, equipe, meta, totalAtual, onClose }) {
  const [barWidth, setBarWidth] = useState(0)
  const [secs, setSecs]         = useState(9)
  const timers                  = useRef([])

  const fechar = useCallback(() => {
    timers.current.forEach(t => { clearTimeout(t); clearInterval(t) })
    onClose()
  }, [onClose])

  useEffect(() => {
    dispararConfetti()
    timers.current.push(setTimeout(() => {
      const pct = meta > 0 ? Math.min(100, Math.round((totalAtual / meta) * 100)) : 0
      setBarWidth(pct)
    }, 300))
    const iv = setInterval(() => {
      setSecs(s => { if (s <= 1) { fechar(); return 0 } return s - 1 })
    }, 1000)
    timers.current.push(iv)
    return () => timers.current.forEach(t => { clearTimeout(t); clearInterval(t) })
  }, [])

  const pct      = meta > 0 ? Math.min(100, Math.round((totalAtual / meta) * 100)) : 0
  const tipoIcon = venda.tipo === 'Veiculo' ? '🚗' : '🏠'
  const tipoLabel= venda.tipo === 'Veiculo' ? 'Crédito em Veículos' : 'Crédito em Imóveis'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center cursor-pointer"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
      onClick={fechar}
    >
      {/* Card principal */}
      <motion.div
        initial={{ scale: 0.85, y: 40, opacity: 0 }}
        animate={{ scale: 1,    y: 0,  opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
        onClick={e => e.stopPropagation()}
        className="relative flex overflow-hidden rounded-3xl"
        style={{
          width: '88vw', maxWidth: 920,
          boxShadow: '0 0 0 1px rgba(232,0,13,0.2), 0 0 80px rgba(232,0,13,0.3), 0 40px 100px rgba(0,0,0,0.8)',
        }}
      >
        {/* ── Foto (esquerda) ── */}
        <div className="relative flex-shrink-0" style={{ width: 300 }}>
          {vendedor?.foto_url ? (
            <img src={vendedor.foto_url} alt={vendedor?.nome}
              className="w-full h-full object-cover"
              style={{ minHeight: 420 }} />
          ) : (
            <div className="w-full flex items-center justify-center"
              style={{ minHeight: 420, background: '#1a1a1a' }}>
              <span style={{ fontSize: 90 }}>👤</span>
            </div>
          )}
          {/* Gradiente lateral para blend */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, transparent 60%, rgba(12,12,12,1) 100%)' }} />
          {/* Gradiente inferior */}
          <div className="absolute bottom-0 left-0 right-0 h-32"
            style={{ background: 'linear-gradient(to top, rgba(12,12,12,0.9), transparent)' }} />
        </div>

        {/* ── Conteúdo (direita) ── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10 relative"
          style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #131313 100%)' }}>

          {/* Linha vermelha topo */}
          <motion.div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, #E8000D, rgba(232,0,13,0.3), transparent)' }}
            initial={{ scaleX:0, originX:0 }} animate={{ scaleX:1 }} transition={{ delay:0.3, duration:0.6 }} />

          {/* Tipo */}
          <motion.div
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25, duration:0.4 }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="text-2xl">{tipoIcon}</span>
            <span className="font-cond font-bold tracking-[4px] uppercase text-muted" style={{ fontSize: 13 }}>
              {tipoLabel}
            </span>
          </motion.div>

          {/* Valor — elemento central */}
          <motion.div
            initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }}
            transition={{ delay:0.35, duration:0.55, ease:[0.34,1.4,0.64,1] }}
            className="font-bebas leading-none mb-4"
            style={{
              fontSize: 'clamp(60px, 9vw, 100px)',
              color: '#E8000D',
              textShadow: '0 0 60px rgba(232,0,13,0.5), 0 0 120px rgba(232,0,13,0.2)',
              letterSpacing: 2,
            }}
          >
            {fmt(venda.valor)}
          </motion.div>

          {/* Nome */}
          <motion.div
            initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.45, duration:0.4 }}
            className="font-bebas text-white leading-none tracking-wide mb-1"
            style={{ fontSize: 38, letterSpacing:2 }}
          >
            {vendedor?.nome || 'Vendedor'}
          </motion.div>

          {/* Equipe */}
          {equipe && (
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }}
              className="font-cond font-bold tracking-[3px] uppercase mb-2"
              style={{ fontSize: 12, color:'rgba(255,255,255,0.4)' }}
            >
              {equipe.nome}
            </motion.div>
          )}

          {/* Descrição */}
          {venda.descricao && (
            <motion.p
              initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
              className="text-sm text-muted mb-6"
            >
              {venda.descricao}
            </motion.p>
          )}

          {/* Separador */}
          <motion.div className="h-px mb-6"
            style={{ background: 'rgba(255,255,255,0.07)' }}
            initial={{ scaleX:0, originX:0 }} animate={{ scaleX:1 }} transition={{ delay:0.5, duration:0.5 }} />

          {/* Progresso da meta */}
          <motion.div
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6, duration:0.4 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-cond font-bold tracking-[2px] uppercase text-muted" style={{ fontSize:10 }}>
                Progresso da Meta
              </span>
              <span className="font-bebas text-2xl text-red leading-none">{pct}%</span>
            </div>
            <div className="rounded-full overflow-hidden mb-2.5" style={{ height: 10, background:'rgba(255,255,255,0.07)' }}>
              <div className="h-full rounded-full progress-bar-animate"
                style={{
                  width: `${barWidth}%`,
                  background: 'linear-gradient(90deg, #9B0009, #E8000D, #FF4444)',
                  boxShadow: '0 0 12px rgba(232,0,13,0.5)',
                }} />
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Realizado: <strong className="text-white">{fmt(totalAtual)}</strong></span>
              <span>Meta: <strong className="text-white">{fmt(meta)}</strong></span>
            </div>
          </motion.div>

          {/* Timer */}
          <motion.p
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.8 }}
            className="mt-5 text-[10px] tracking-[2px] text-dim text-right"
          >
            Fechando em {secs}s — clique para fechar
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  )
}
