import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sb } from '../lib/supabase'
import useStore from '../store/useStore'
import LoginScreen from '../components/dashboard/LoginScreen'
import Navbar from '../components/dashboard/Navbar'
import VendedoresTab from '../components/dashboard/VendedoresTab'
import EquipesTab from '../components/dashboard/EquipesTab'
import CelebracaoCard from '../components/dashboard/CelebracaoCard'
import { getDiaFechamento } from '../lib/utils'

function Spinner() {
  return (
    <div style={{ width:40, height:40 }}
      className="rounded-full border-2 border-white/10 border-t-red animate-spin" />
  )
}

export default function Dashboard() {
  const {
    meta, metaFechamento,
    vendedores, equipes, vendas,
    mes, loading,
    modoFechamento, setModoFechamento,
    carregarDados, setMes,
  } = useStore()

  const [authed,           setAuthed]           = useState(false)
  const [checking,         setChecking]         = useState(true)
  const [tab,              setTab]              = useState('vendedores')
  const [celebracao,       setCelebracao]       = useState(null)
  const [agora,            setAgora]            = useState(() => new Date())

  // Relógio de minuto em minuto: faz o dia do fechamento virar sozinho na tela
  useEffect(() => {
    const iv = setInterval(() => setAgora(new Date()), 60_000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (session) {
        sessionStorage.setItem('vendamax_dash_auth', '1')
        setAuthed(true)
        await carregarDados(undefined, { showLoading: true })
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
    const poll = setInterval(() => carregarDados(), 120_000)
    return () => { sb.removeChannel(ch); clearInterval(poll) }
  }, [authed])

  const trocarMes = useCallback(async val => { setMes(val); await carregarDados(val) }, [])

  // Filtro de vendas: no modo fechamento mostra só as vendas do dia do fechamento
  const diaFechamento  = getDiaFechamento(agora)
  const vendasVisiveis = modoFechamento
    ? vendas.filter(v => String(v.data).slice(0, 10) === diaFechamento)
    : vendas

  // Depois da meia-noite o dia do fechamento pode cair no mês anterior:
  // garante que as vendas carregadas sejam as do mês desse dia
  useEffect(() => {
    if (!authed || !modoFechamento) return
    const mesFechamento = diaFechamento.slice(0, 7)
    if (mesFechamento !== mes) trocarMes(mesFechamento)
  }, [authed, modoFechamento, diaFechamento, mes, trocarMes])

  const metaAtiva    = modoFechamento ? metaFechamento : meta
  const totalVendas  = vendasVisiveis.reduce((a, b) => a + Number(b.valor), 0)

  const resumoCategorias = (() => {
    let imovel = 0, veiculo = 0, servico = 0
    vendasVisiveis.forEach(v => {
      const val = Number(v.valor)
      if      (v.tipo === 'Veiculo')                              veiculo += val
      else if (v.tipo === 'Serviço' || v.tipo === 'Servico')      servico += val
      else                                                        imovel  += val
    })
    return { imovel, veiculo, servico }
  })()

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
      <Navbar
        meta={meta}
        totalVendas={totalVendas}
        mes={mes}
        onMesChange={trocarMes}
        modoFechamento={modoFechamento}
        metaFechamento={metaFechamento}
      />

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
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                style={{ background: modoFechamento ? '#FF6600' : '#E8000D' }}
                transition={{ type:'spring', stiffness:400, damping:30 }} />
            )}
          </button>
        ))}

        {/* Toggle Dia-Dia / Fechamento + categorias + mês */}
        <div className="ml-auto flex items-center gap-4 pb-2">

          {/* Toggle */}
          <div className="flex items-center rounded-lg overflow-hidden border"
            style={{ borderColor: modoFechamento ? 'rgba(255,140,0,0.35)' : 'rgba(255,255,255,0.1)', background:'#111' }}>
            {[
              { id: false, label: 'Dia-Dia' },
              { id: true,  label: 'Fechamento' },
            ].map(({ id, label }) => {
              const isActive = modoFechamento === id
              return (
                <button key={String(id)}
                  onClick={() => setModoFechamento(id)}
                  className="px-4 py-1.5 font-cond font-bold text-xs tracking-[1.5px] uppercase transition-all"
                  style={{
                    background: isActive
                      ? (id ? 'linear-gradient(90deg,#C04400,#FF6600)' : 'rgba(232,0,13,0.8)')
                      : 'transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.35)',
                  }}>
                  {label}
                </button>
              )
            })}
          </div>

          <div className="w-px h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />

          {/* Resumo categorias */}
          {[
            { label: 'Imóvel',  val: resumoCategorias.imovel,   color: '#E8000D' },
            { label: 'Veículo', val: resumoCategorias.veiculo,  color: '#60A5FA' },
            { label: 'Serviço', val: resumoCategorias.servico,  color: '#FFD60A' },
          ].map(({ label, val, color }) => {
            const pct = totalVendas > 0 ? ((val / totalVendas) * 100).toFixed(1) : '0,0'
            return (
              <div key={label} className="flex items-center gap-2">
                <div className="w-[2px] h-5 rounded-full flex-shrink-0" style={{ background: color }} />
                <div className="flex flex-col leading-none gap-[3px]">
                  <span className="font-cond font-bold tracking-[1.5px] uppercase"
                    style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{label}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bebas" style={{ fontSize: 14, color }}>{val > 0 ? 'R$ ' + Number(val).toLocaleString('pt-BR') : '—'}</span>
                    <span className="font-cond font-semibold" style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{pct}%</span>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Seletor de mês — esconde no modo fechamento */}
          {!modoFechamento && (
            <>
              <div className="w-px h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <input
                type="month" value={mes} onChange={e => trocarMes(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer p-0"
                style={{ color:'rgba(255,255,255,0.35)', fontSize: 11, fontFamily:'inherit', letterSpacing:'1px', width: 110 }}
              />
            </>
          )}

          {/* Data de hoje — aparece no modo fechamento */}
          {modoFechamento && (
            <>
              <div className="w-px h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-cond font-bold text-[11px] tracking-[1px] uppercase"
                style={{ color:'rgba(255,140,0,0.6)' }}>
                {new Date(diaFechamento + 'T12:00:00').toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' })}
              </span>
            </>
          )}
        </div>
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
            {tab === 'vendedores' && <VendedoresTab vendedores={vendedores} vendas={vendasVisiveis} equipes={equipes} modoFechamento={modoFechamento} />}
            {tab === 'equipes'    && <EquipesTab equipes={equipes} vendedores={vendedores} vendas={vendasVisiveis} modoFechamento={modoFechamento} />}
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
            meta={metaAtiva}
            totalAtual={celebracao.totalAtual}
            onClose={() => setCelebracao(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
