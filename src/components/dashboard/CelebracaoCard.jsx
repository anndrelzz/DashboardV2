import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { fmt } from '../../lib/utils'

// Brasas espalhadas na base do card
const EMBERS = [
  { left:'18%', delay:'0s',    dur:'1.1s',  size:3, color:'#FF4500', dx:'-8px'  },
  { left:'22%', delay:'0.6s',  dur:'1.4s',  size:2, color:'#FF6600', dx:'5px'   },
  { left:'27%', delay:'0.15s', dur:'0.88s', size:4, color:'#FFD700', dx:'-6px'  },
  { left:'31%', delay:'0.45s', dur:'1.2s',  size:3, color:'#FF4500', dx:'9px'   },
  { left:'35%', delay:'0.8s',  dur:'1.05s', size:5, color:'#FF3300', dx:'-5px'  },
  { left:'39%', delay:'0.25s', dur:'0.95s', size:2, color:'#FFAA00', dx:'7px'   },
  { left:'43%', delay:'0.55s', dur:'1.3s',  size:4, color:'#FF5500', dx:'-10px' },
  { left:'47%', delay:'0.1s',  dur:'1.0s',  size:6, color:'#FF4400', dx:'4px'   },
  { left:'50%', delay:'0.7s',  dur:'0.85s', size:3, color:'#FFD700', dx:'-7px'  },
  { left:'53%', delay:'0.35s', dur:'1.15s', size:2, color:'#FF6600', dx:'8px'   },
  { left:'57%', delay:'0.05s', dur:'1.25s', size:4, color:'#FF4500', dx:'-5px'  },
  { left:'61%', delay:'0.5s',  dur:'0.9s',  size:3, color:'#FF3300', dx:'11px'  },
  { left:'65%', delay:'0.2s',  dur:'1.35s', size:5, color:'#FFAA00', dx:'-8px'  },
  { left:'69%', delay:'0.75s', dur:'0.92s', size:2, color:'#FF6600', dx:'6px'   },
  { left:'73%', delay:'0.4s',  dur:'1.1s',  size:3, color:'#FF4500', dx:'-9px'  },
  { left:'77%', delay:'0.9s',  dur:'1.2s',  size:4, color:'#FFD700', dx:'5px'   },
  { left:'24%', delay:'1.0s',  dur:'1.05s', size:2, color:'#FF5500', dx:'-4px'  },
  { left:'44%', delay:'0.85s', dur:'0.95s', size:3, color:'#FF4400', dx:'7px'   },
  { left:'56%', delay:'1.1s',  dur:'1.15s', size:2, color:'#FFD700', dx:'-6px'  },
  { left:'71%', delay:'0.95s', dur:'1.08s', size:4, color:'#FF3300', dx:'5px'   },
]

function FireBase() {
  return (
    <>
      {/* Glow de fogo na base */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none" style={{
        height: '55vh',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(255,70,0,0.32) 0%, rgba(200,20,0,0.14) 45%, transparent 70%)',
      }} />

      {/* Linha de fogo na base */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: 3, background: 'linear-gradient(90deg, transparent 5%, #FF4500 20%, #FF8C00 50%, #FF4500 80%, transparent 95%)' }}
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0, 1, 0.8, 1], scaleX: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />

      {/* Brasas subindo */}
      {EMBERS.map((e, i) => (
        <div key={i} className="ember" style={{
          position:    'fixed',
          bottom:      'calc(50% - 215px)',
          left:         e.left,
          width:        e.size,
          height:       e.size,
          background:   e.color,
          boxShadow:   `0 0 ${e.size + 2}px ${e.color}`,
          '--ember-dx':    e.dx,
          '--ember-dur':   e.dur,
          '--ember-delay': e.delay,
        }} />
      ))}
    </>
  )
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
      {/* Efeito de fogo na base */}
      <FireBase />

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
