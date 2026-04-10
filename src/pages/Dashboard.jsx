import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sb } from '../lib/supabase'
import useStore from '../store/useStore'
import LoginScreen from '../components/dashboard/LoginScreen'
import Navbar from '../components/dashboard/Navbar'
import VendedoresTab from '../components/dashboard/VendedoresTab'
import EquipesTab from '../components/dashboard/EquipesTab'
import CelebracaoCard from '../components/dashboard/CelebracaoCard'

function Spinner() {
  return (
    <div style={{ width:40, height:40 }}
      className="rounded-full border-2 border-white/10 border-t-red animate-spin" />
  )
}

export default function Dashboard() {
  const { meta, vendedores, equipes, vendas, mes, loading, carregarDados, setMes } = useStore()
  const [authed,    setAuthed]    = useState(false)
  const [checking,  setChecking]  = useState(true)
  const [tab,       setTab]       = useState('vendedores')
  const [celebracao,setCelebracao]= useState(null)

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (session) {
        sessionStorage.setItem('vendamax_dash_auth', '1')
        setAuthed(true)
        await carregarDados()
      }
      setChecking(false)
    })()
  }, [])

  useEffect(() => {
    if (!authed) return
    const ch = sb.channel('realtime-dash-v2')
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'vendas' }, async (payload) => {
        await carregarDados()
        const st = useStore.getState()
        const novaVenda = payload.new
        const vend = st.vendedores.find(x => x.id === novaVenda.vendedor_id)
        const eq   = vend ? st.equipes.find(e => e.id === vend.equipe_id) : null
        const totalAtual = st.vendas.reduce((a, b) => a + Number(b.valor), 0)
        setCelebracao({ venda: novaVenda, vendedor: vend, equipe: eq, totalAtual })
      })
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'vendas' },     async () => carregarDados())
      .on('postgres_changes', { event:'DELETE', schema:'public', table:'vendas' },     async () => carregarDados())
      .on('postgres_changes', { event:'*',      schema:'public', table:'metas' },      async () => carregarDados())
      .on('postgres_changes', { event:'*',      schema:'public', table:'vendedores' }, async () => carregarDados())
      .on('postgres_changes', { event:'*',      schema:'public', table:'equipes' },    async () => carregarDados())
      .subscribe()
    const poll = setInterval(() => carregarDados(), 20_000)
    return () => { sb.removeChannel(ch); clearInterval(poll) }
  }, [authed])

  const trocarMes = useCallback(async val => { setMes(val); await carregarDados(val) }, [])
  const totalVendas = vendas.reduce((a, b) => a + Number(b.valor), 0)

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-4" style={{ background:'#080808' }}>
        <Spinner />
        <span className="font-bebas text-sm tracking-[3px] text-muted animate-pulse">Carregando...</span>
      </div>
    )
  }

  if (!authed) {
    return <LoginScreen onLogin={async () => { setAuthed(true); await carregarDados() }} />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background:'#080808' }}>
      <Navbar meta={meta} totalVendas={totalVendas} mes={mes} onMesChange={trocarMes} />

      {/* Tab bar */}
      <div className="flex-shrink-0 flex items-end px-6 gap-1 relative"
        style={{ background:'#0a0a0a', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        {[
          { id:'vendedores', label:'Vendedores' },
          { id:'equipes',    label:'Equipes' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="relative font-cond font-bold text-sm tracking-[2.5px] uppercase py-3.5 px-7 transition-all"
            style={{ color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.35)' }}
          >
            {t.label}
            {tab === t.id && (
              <motion.div layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red rounded-t-full"
                transition={{ type:'spring', stiffness:400, damping:30 }} />
            )}
          </button>
        ))}
      </div>

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center flex-col gap-4"
          style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }}>
          <Spinner />
          <span className="font-bebas text-sm tracking-[3px] text-muted">Carregando dados...</span>
        </div>
      )}

      {/* Conteúdo das tabs */}
      <main className="flex-1 overflow-hidden p-5">
        <AnimatePresence mode="wait">
          <motion.div key={tab} className="h-full"
            initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
            transition={{ duration:0.25, ease:'easeOut' }}>
            {tab === 'vendedores' && <VendedoresTab vendedores={vendedores} vendas={vendas} equipes={equipes} />}
            {tab === 'equipes'    && <EquipesTab equipes={equipes} vendedores={vendedores} vendas={vendas} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Card de comemoração */}
      <AnimatePresence>
        {celebracao && (
          <CelebracaoCard
            venda={celebracao.venda}
            vendedor={celebracao.vendedor}
            equipe={celebracao.equipe}
            meta={meta}
            totalAtual={celebracao.totalAtual}
            onClose={() => setCelebracao(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
