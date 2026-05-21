import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { fmt } from '../../lib/utils'

const FW_COLORS = [
  '#FF3355','#FF6600','#FFDD00','#00FF88','#44AAFF',
  '#BB44FF','#FF44CC','#00FFFF','#FFFFFF','#FFB300',
]

function FireworksCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let   raf    = null

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const rockets   = []
    const particles = []
    const rand  = (a, b) => a + Math.random() * (b - a)
    const pick  = arr  => arr[Math.floor(Math.random() * arr.length)]

    function explode(x, y, color) {
      const n = 90 + Math.floor(rand(0, 50))
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2
        const speed = rand(1.5, 5.5)
        particles.push({
          x, y, color,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size:  rand(1.5, 3.2),
          alpha: 1,
          decay: rand(0.010, 0.018),
          trail: [],
        })
      }
      for (let i = 0; i < 22; i++) {
        const angle = rand(0, Math.PI * 2)
        const speed = rand(0.5, 2.5)
        particles.push({
          x, y, color: '#FFFFFF',
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size:  rand(0.8, 1.8),
          alpha: 1,
          decay: rand(0.018, 0.030),
          trail: [],
        })
      }
    }

    function launchRocket() {
      const x       = rand(canvas.width * 0.08, canvas.width * 0.92)
      const targetY = rand(canvas.height * 0.08, canvas.height * 0.48)
      const dist    = canvas.height - targetY
      rockets.push({
        x, y: canvas.height,
        targetY,
        vy:    -dist / rand(28, 40),
        color: pick(FW_COLORS),
        trail: [],
      })
    }

    let last = 0
    const INTERVAL = 380

    function frame(ts) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (ts - last > INTERVAL) {
        launchRocket()
        if (Math.random() > 0.45) launchRocket()
        last = ts
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.trail.push({ x: r.x, y: r.y })
        if (r.trail.length > 10) r.trail.shift()
        r.vy += 0.035
        r.y  += r.vy

        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color)
          rockets.splice(i, 1)
          continue
        }

        r.trail.forEach((t, j) => {
          ctx.save()
          ctx.globalAlpha = (j / r.trail.length) * 0.5
          ctx.fillStyle   = r.color
          ctx.shadowColor = r.color
          ctx.shadowBlur  = 8
          ctx.beginPath()
          ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })
        ctx.save()
        ctx.globalAlpha = 1
        ctx.fillStyle   = '#ffffff'
        ctx.shadowColor = r.color
        ctx.shadowBlur  = 14
        ctx.beginPath()
        ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 4) p.trail.shift()
        p.vx   *= 0.97
        p.vy   += 0.06
        p.x    += p.vx
        p.y    += p.vy
        p.alpha -= p.decay
        p.size  *= 0.996

        if (p.alpha <= 0) { particles.splice(i, 1); continue }

        p.trail.forEach((t, j) => {
          ctx.save()
          ctx.globalAlpha = p.alpha * (j / p.trail.length) * 0.25
          ctx.fillStyle   = p.color
          ctx.beginPath()
          ctx.arc(t.x, t.y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        })
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle   = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur  = p.size * 2.5
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      raf = requestAnimationFrame(frame)
    }

    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
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
  const tipoIcon = venda.tipo === 'Veiculo' ? '🚗' : venda.tipo === 'Serviço' || venda.tipo === 'Servico' ? '🔧' : '🏠'
  const tipoLabel= venda.tipo === 'Veiculo' ? 'Crédito em Veículos' : venda.tipo === 'Serviço' || venda.tipo === 'Servico' ? 'Serviço' : 'Crédito em Imóveis'

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
      {/* Fogos de artifício */}
      <FireworksCanvas />

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
          boxShadow: '0 0 0 1px rgba(255,80,0,0.25), 0 0 80px rgba(255,60,0,0.35), 0 40px 100px rgba(0,0,0,0.8), 0 -2px 40px rgba(255,80,0,0.15)',
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
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, transparent 60%, rgba(12,12,12,1) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-32"
            style={{ background: 'linear-gradient(to top, rgba(12,12,12,0.9), transparent)' }} />
        </div>

        {/* ── Conteúdo (direita) ── */}
        <div className="flex-1 flex flex-col justify-center px-10 py-10 relative"
          style={{ background: 'linear-gradient(135deg, #0c0c0c 0%, #131313 100%)' }}>

          {/* Linha topo */}
          <motion.div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, #FF5500, rgba(255,80,0,0.3), transparent)' }}
            initial={{ scaleX:0, originX:0 }} animate={{ scaleX:1 }} transition={{ delay:0.3, duration:0.6 }} />

          {/* Linha base com glow de fogo */}
          <motion.div className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, #FF4500, #FF8C00, #FF4500, transparent)', boxShadow:'0 0 12px rgba(255,80,0,0.6)' }}
            initial={{ scaleX:0, originX:0.5 }} animate={{ scaleX:1 }} transition={{ delay:0.5, duration:0.7 }} />

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

          {/* Valor */}
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
