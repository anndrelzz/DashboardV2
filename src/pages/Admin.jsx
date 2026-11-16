import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sb } from '../lib/supabase'
import useStore from '../store/useStore'
import useVendasConsulta from '../lib/useVendasConsulta'
import Sidebar from '../components/admin/Sidebar'
import SecResumo from '../components/admin/SecResumo'
import SecPerformance from '../components/admin/SecPerformance'
import SecMeta from '../components/admin/SecMeta'
import SecVendas from '../components/admin/SecVendas'
import SecVendedores from '../components/admin/SecVendedores'
import SecEquipes from '../components/admin/SecEquipes'
import SecConferencia from '../components/admin/SecConferencia'
import SecRankingSemana from '../components/admin/SecRankingSemana'
import Toast from '../components/ui/Toast'
import Spinner from '../components/ui/Spinner'

export default function Admin() {
  const navigate  = useNavigate()
  const [checking, setChecking] = useState(true)
  const [section, setSection]   = useState('resumo')
  // true/false = resposta do is_admin() do banco; null = não deu pra saber
  const [podeEditar, setPodeEditar] = useState(null)

  const { meta, metaFechamento, semanaFechamento, vendedores, equipes, unidades, vendas, mes, carregarDados } = useStore()

  // Mês escolhido no seletor de Vendedores / Lançar Venda (padrão: mês atual).
  // Fica aqui pra valer igual nas duas abas.
  const consulta = useVendasConsulta(mes, vendas, carregarDados)

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session || !sessionStorage.getItem('vendamax_dash_auth')) {
        await sb.auth.signOut()
        navigate('/')
        return
      }
      // Conta fora do is_admin() consegue ver tudo, mas o banco ignora as
      // alterações sem dar erro — avisa logo na entrada pra não confundir
      const [, adm] = await Promise.all([carregarDados(), sb.rpc('is_admin')])
      setPodeEditar(adm.error ? null : adm.data === true)
      setChecking(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {podeEditar === false && (
          <div className="sticky top-0 z-40 px-10 py-3 flex items-center gap-3 border-b text-[13px]"
            style={{ background:'#2A1A00', borderColor:'rgba(255,184,0,0.35)', color:'#FFD27A' }}>
            <span className="text-lg leading-none">⚠</span>
            <span>
              <strong className="text-[#FFB800]">Conta sem permissão de edição.</strong>{' '}
              Você consegue ver os dados, mas lançar, editar ou excluir não vai gravar. Saia e entre com a conta admin.
            </span>
          </div>
        )}
        {section === 'resumo'      && <SecResumo {...secProps} />}
        {section === 'performance' && <SecPerformance {...secProps} />}
        {section === 'meta'        && <SecMeta metaFechamento={metaFechamento} onRefresh={refresh} />}
        {section === 'vendas'      && <SecVendas {...secProps} mesAtual={mes} consulta={consulta} />}
        {section === 'vendedores'  && <SecVendedores {...secProps} mesAtual={mes} consulta={consulta} />}
        {section === 'equipes'     && <SecEquipes {...secProps} unidades={unidades} mesAtual={mes} consulta={consulta} />}
        {section === 'conferencia' && <SecConferencia {...secProps} />}
        {section === 'semana'      && <SecRankingSemana {...secProps} semanaFechamento={semanaFechamento} />}
      </div>

      <Toast />
    </div>
  )
}
