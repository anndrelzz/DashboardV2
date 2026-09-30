import { useState, useEffect } from 'react'
import { sb } from '../../lib/supabase'
import { getMes, fmt } from '../../lib/utils'
import { toast } from '../../lib/toast'
import SectionHeader from './SectionHeader'
import { IconMeta, IconFlame } from './icons'

const nomeDoMes = (mes) =>
  new Date(mes + '-01T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

export default function SecMeta({ metaFechamento, onRefresh }) {
  // Mês que está sendo editado — não precisa ser o mês corrente, dá pra
  // corrigir um mês passado ou já deixar o próximo pronto.
  const [mesEdicao, setMesEdicao] = useState(getMes())
  const mesAtual   = getMes()
  const editandoOutroMes = mesEdicao !== mesAtual

  // Valores já gravados no banco pro mês selecionado, pros banners de "atual"
  const [salvoMes,    setSalvoMes]    = useState(0)
  const [salvoSemana, setSalvoSemana] = useState(null)
  // Qual mês já terminou de carregar — serve de flag de "carregando" sem
  // precisar de um setState no corpo do efeito
  const [mesCarregado, setMesCarregado] = useState(null)
  const [recarga,      setRecarga]      = useState(0)
  const carregando = mesCarregado !== mesEdicao

  const [valorMes,        setValorMes]        = useState('')
  const [valorFechamento, setValorFechamento] = useState(metaFechamento || '')
  const [dataInicio,      setDataInicio]      = useState('')
  const [dataFim,         setDataFim]         = useState('')
  const [metaSemana,      setMetaSemana]      = useState('')
  const [savingMes,       setSavingMes]       = useState(false)
  const [savingFech,      setSavingFech]      = useState(false)
  const [savingSemana,    setSavingSemana]    = useState(false)

  // Lê direto do banco em vez do store: o store carrega um mês só (o do
  // dashboard) e aqui o mês é escolhido à parte.
  useEffect(() => {
    let cancelado = false
    ;(async () => {
      const [rMeta, rSemana] = await Promise.all([
        sb.from('metas').select('valor').eq('mes', mesEdicao).maybeSingle(),
        sb.from('semana_fechamento').select('data_inicio, data_fim, meta').eq('mes', mesEdicao).maybeSingle(),
      ])
      if (cancelado) return

      const erro = rMeta.error || rSemana.error
      if (erro) toast(`Erro ao carregar o mês: ${erro.message}`, false)

      setSalvoMes(rMeta.data?.valor || 0)
      setValorMes(rMeta.data?.valor || '')
      setSalvoSemana(rSemana.data || null)
      setDataInicio(rSemana.data?.data_inicio || '')
      setDataFim(rSemana.data?.data_fim || '')
      setMetaSemana(rSemana.data?.meta || '')
      setMesCarregado(mesEdicao)
    })()
    return () => { cancelado = true }
  }, [mesEdicao, recarga])

  // onRefresh mantém o dashboard/TV em dia; o recarga repõe os banners daqui
  const depoisDeSalvar = async () => {
    setRecarga(n => n + 1)
    await onRefresh()
  }

  const salvarMes = async () => {
    const val = parseFloat(valorMes)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    setSavingMes(true)
    const { error } = await sb.from('metas').upsert({ mes: mesEdicao, valor: val }, { onConflict: 'mes' })
    setSavingMes(false)
    if (error) { toast(`Erro ao salvar meta: ${error.message}`, false); return }
    await depoisDeSalvar()
    toast(`Meta de ${nomeDoMes(mesEdicao)} salva!`)
  }

  const salvarFechamento = async () => {
    const val = parseFloat(valorFechamento)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    setSavingFech(true)
    // upsert e não update: a linha id=1 pode não existir, e nesse caso o update
    // afeta 0 linhas sem devolver erro — dava "salvo!" sem ter gravado nada
    const { error } = await sb.from('meta_fechamento').upsert({ id: 1, valor: val }, { onConflict: 'id' })
    setSavingFech(false)
    if (error) { toast(`Erro ao salvar meta de fechamento: ${error.message}`, false); return }
    await onRefresh()
    toast('Meta de fechamento salva!')
  }

  const salvarSemana = async () => {
    if (!dataInicio || !dataFim) { toast('Informe as duas datas', false); return }
    if (dataInicio > dataFim) { toast('Data início deve ser antes da data fim', false); return }
    // O dashboard só carrega as vendas de um mês por vez, então um período que
    // atravessa a virada do mês mostraria colunas sempre zeradas.
    if (dataInicio.slice(0, 7) !== mesEdicao || dataFim.slice(0, 7) !== mesEdicao) {
      toast(`O período precisa estar dentro de ${nomeDoMes(mesEdicao)}`, false); return
    }
    const valMeta = metaSemana === '' ? 0 : parseFloat(metaSemana)
    if (Number.isNaN(valMeta) || valMeta < 0) { toast('Meta da semana inválida', false); return }
    setSavingSemana(true)
    const { error } = await sb.from('semana_fechamento')
      .upsert({ mes: mesEdicao, data_inicio: dataInicio, data_fim: dataFim, meta: valMeta }, { onConflict: 'mes' })
    setSavingSemana(false)
    if (error) { toast(`Erro ao salvar semana do fechamento: ${error.message}`, false); return }
    await depoisDeSalvar()
    toast('Semana do fechamento salva!')
  }

  const seletorMes = (
    <div className="flex flex-col items-end gap-1.5">
      <label className="text-[10px] font-bold tracking-[1.5px] uppercase text-muted">Mês em edição</label>
      <input
        type="month"
        value={mesEdicao}
        onChange={e => setMesEdicao(e.target.value || mesAtual)}
        className="rounded-lg px-4 py-2 text-white text-sm outline-none border transition-colors"
        style={{
          background: '#1F1F1F',
          borderColor: editandoOutroMes ? 'rgba(255,140,0,0.45)' : 'rgba(255,255,255,0.1)',
        }}
      />
    </div>
  )

  return (
    <div className="p-10 flex flex-col gap-8">
      <SectionHeader icon={<IconMeta size={20} />} title="Metas"
        subtitle="Defina a meta mensal, a do dia de fechamento e a da semana do fechamento"
        action={seletorMes} />

      {editandoOutroMes && (
        <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border"
          style={{ background:'rgba(255,100,0,0.07)', borderColor:'rgba(255,140,0,0.3)' }}>
          <IconFlame size={17} className="flex-shrink-0" style={{ color:'#FF8C00' }} />
          <span className="text-[13px]" style={{ color:'#FFB066' }}>
            Você está editando <strong className="capitalize">{nomeDoMes(mesEdicao)}</strong>, que não é o mês corrente.
            O dashboard continua mostrando <span className="capitalize">{nomeDoMes(mesAtual)}</span>.
          </span>
          <button onClick={() => setMesEdicao(mesAtual)}
            className="ml-auto flex-shrink-0 px-4 py-1.5 rounded-lg font-cond font-bold text-[11px] tracking-[1.5px] uppercase transition-colors"
            style={{ background:'rgba(255,140,0,0.16)', color:'#FF8C00' }}>
            Voltar pro mês atual
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Meta do Mês */}
        <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
          <div className="px-6 py-4.5 border-b flex items-baseline justify-between gap-3" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
            <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Meta do Mês</span>
            <span className="text-[11px] text-muted capitalize">{nomeDoMes(mesEdicao)}</span>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {salvoMes > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{ background:'rgba(232,0,13,0.06)', borderColor:'rgba(232,0,13,0.2)' }}>
                <span className="text-sm text-muted">Meta atual:</span>
                <span className="font-bebas text-xl text-red">{fmt(salvoMes)}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">
                Valor da Meta (R$)
              </label>
              <input
                type="number"
                value={valorMes}
                onChange={e => setValorMes(e.target.value)}
                placeholder="Ex: 500000"
                min={0}
                disabled={carregando}
                className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors disabled:opacity-50"
                style={{ background:'#1F1F1F' }}
              />
            </div>
            <button onClick={salvarMes} disabled={savingMes || carregando}
              className="self-start px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white transition-colors disabled:opacity-60"
              style={{ background:'#E8000D' }}>
              {savingMes ? 'Salvando...' : 'Salvar Meta'}
            </button>
          </div>
        </div>

        {/* Meta de Fechamento */}
        <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,140,0,0.2)' }}>
          <div className="px-6 py-4.5 border-b flex items-center gap-2.5" style={{ borderColor:'rgba(255,140,0,0.2)', background:'rgba(255,100,0,0.04)' }}>
            <IconFlame size={16} className="flex-shrink-0" style={{ color:'#FF8C00' }} />
            <span className="font-cond font-bold text-sm tracking-[2px] uppercase" style={{ color:'#FF8C00' }}>Meta de Fechamento</span>
            <span className="ml-auto text-[11px] text-muted">vale pra todo mês</span>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {metaFechamento > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{ background:'rgba(255,100,0,0.06)', borderColor:'rgba(255,140,0,0.25)' }}>
                <span className="text-sm text-muted">Meta atual:</span>
                <span className="font-bebas text-xl" style={{ color:'#FF8C00' }}>{fmt(metaFechamento)}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">
                Valor da Meta de Fechamento (R$)
              </label>
              <input
                type="number"
                value={valorFechamento}
                onChange={e => setValorFechamento(e.target.value)}
                placeholder="Ex: 800000"
                min={0}
                className="rounded-lg px-4 py-3 text-white text-sm outline-none border transition-colors"
                style={{ background:'#1F1F1F', borderColor:'rgba(255,140,0,0.2)' }}
              />
            </div>
            <button onClick={salvarFechamento} disabled={savingFech}
              className="self-start px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white transition-colors disabled:opacity-60"
              style={{ background:'#FF6600' }}>
              {savingFech ? 'Salvando...' : 'Salvar Meta de Fechamento'}
            </button>
          </div>
        </div>

        {/* Semana do Fechamento */}
        <div className="rounded-2xl border overflow-hidden col-span-2" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
          <div className="px-6 py-4.5 border-b flex items-baseline justify-between gap-3" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
            <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Semana do Fechamento</span>
            <span className="text-[11px] text-muted capitalize">{nomeDoMes(mesEdicao)}</span>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {salvoSemana?.data_inicio && salvoSemana?.data_fim && (
              <div className="flex items-center gap-5 px-4 py-3 rounded-lg border flex-wrap"
                style={{ background:'rgba(232,0,13,0.06)', borderColor:'rgba(232,0,13,0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">Período atual:</span>
                  <span className="font-bebas text-xl text-red">
                    {salvoSemana.data_inicio.slice(8,10)}/{salvoSemana.data_inicio.slice(5,7)}
                    {' '}até{' '}
                    {salvoSemana.data_fim.slice(8,10)}/{salvoSemana.data_fim.slice(5,7)}
                  </span>
                </div>
                <div className="w-px h-5" style={{ background:'rgba(255,255,255,0.12)' }} />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">Meta da semana:</span>
                  <span className="font-bebas text-xl text-red">
                    {salvoSemana.meta > 0 ? fmt(salvoSemana.meta) : 'não definida'}
                  </span>
                </div>
              </div>
            )}
            <div className="flex gap-6">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Data Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  disabled={carregando}
                  className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors disabled:opacity-50"
                  style={{ background:'#1F1F1F' }}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Data Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  disabled={carregando}
                  className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors disabled:opacity-50"
                  style={{ background:'#1F1F1F' }}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Meta da Semana (R$)</label>
                <input
                  type="number"
                  value={metaSemana}
                  onChange={e => setMetaSemana(e.target.value)}
                  placeholder="Ex: 9000000"
                  min={0}
                  disabled={carregando}
                  className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors disabled:opacity-50"
                  style={{ background:'#1F1F1F' }}
                />
              </div>
            </div>
            <p className="text-xs text-muted">
              Define o período e a meta mostrados na aba &quot;Semana do Fechamento&quot; do dashboard — normalmente os últimos dias do mês. Deixe a meta em branco ou zero pra esconder a barra de progresso na TV.
            </p>
            <button onClick={salvarSemana} disabled={savingSemana || carregando}
              className="self-start px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white transition-colors disabled:opacity-60"
              style={{ background:'#E8000D' }}>
              {savingSemana ? 'Salvando...' : 'Salvar Semana do Fechamento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
