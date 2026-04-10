import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sb } from '../lib/supabase'
import useStore from '../store/useStore'
import Sidebar from '../components/admin/Sidebar'
import SecResumo from '../components/admin/SecResumo'
import SecPerformance from '../components/admin/SecPerformance'
import SecMeta from '../components/admin/SecMeta'
import SecVendas from '../components/admin/SecVendas'
import SecVendedores from '../components/admin/SecVendedores'
import SecEquipes from '../components/admin/SecEquipes'
import Toast from '../components/ui/Toast'
import Spinner from '../components/ui/Spinner'

export default function Admin() {
  const navigate  = useNavigate()
  const [checking, setChecking] = useState(true)
  const [section, setSection]   = useState('resumo')

  const { meta, vendedores, equipes, vendas, carregarDados } = useStore()

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session || !sessionStorage.getItem('vendamax_dash_auth')) {
        await sb.auth.signOut()
        navigate('/')
        return
      }
      await carregarDados()
      setChecking(false)
    })()
  }, [])

  if (checking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center flex-col gap-4" style={{ background:'#0D0D0D' }}>
        <Spinner size={40} />
        <span className="font-bebas text-sm tracking-[3px] text-muted">Carregando...</span>
      </div>
    )
  }

  const refresh = () => carregarDados()

  const secProps = { meta, vendedores, equipes, vendas, onRefresh: refresh }

  return (
    <div className="flex min-h-screen" style={{ background:'#0D0D0D' }}>
      <Sidebar active={section} onChange={setSection} />

      <div className="flex-1 overflow-auto">
        {section === 'resumo'      && <SecResumo {...secProps} />}
        {section === 'performance' && <SecPerformance {...secProps} />}
        {section === 'meta'        && <SecMeta meta={meta} onRefresh={refresh} />}
        {section === 'vendas'      && <SecVendas {...secProps} />}
        {section === 'vendedores'  && <SecVendedores {...secProps} />}
        {section === 'equipes'     && <SecEquipes {...secProps} />}
      </div>

      <Toast />
    </div>
  )
}
