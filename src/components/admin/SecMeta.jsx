import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { getMes, fmt } from '../../lib/utils'
import { toast } from '../../lib/toast'
import SectionHeader from './SectionHeader'
import { IconMeta, IconFlame } from './icons'

export default function SecMeta({ meta, metaFechamento, semanaFechamento, onRefresh }) {
  const [valorMes,       setValorMes]       = useState(meta           || '')
  const [valorFechamento, setValorFechamento] = useState(metaFechamento || '')
  const [dataInicio,      setDataInicio]      = useState(semanaFechamento?.dataInicio || '')
  const [dataFim,         setDataFim]         = useState(semanaFechamento?.dataFim    || '')
  const [metaSemana,      setMetaSemana]      = useState(semanaFechamento?.meta       || '')
  const [savingMes,       setSavingMes]       = useState(false)
  const [savingFech,      setSavingFech]      = useState(false)
  const [savingSemana,    setSavingSemana]    = useState(false)

  const salvarMes = async () => {
    const val = parseFloat(valorMes)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    setSavingMes(true)
    const { error } = await sb.from('metas').upsert({ mes: getMes(), valor: val }, { onConflict: 'mes' })
    setSavingMes(false)
    if (error) { toast(`Erro ao salvar meta: ${error.message}`, false); return }
    await onRefresh()
    toast('Meta do mês salva!')
  }

  const salvarFechamento = async () => {
    const val = parseFloat(valorFechamento)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    setSavingFech(true)
    const { error } = await sb.from('meta_fechamento').update({ valor: val }).eq('id', 1)
    setSavingFech(false)
    if (error) { toast(`Erro ao salvar meta de fechamento: ${error.message}`, false); return }
    await onRefresh()
    toast('Meta de fechamento salva!')
  }

  const salvarSemana = async () => {
    if (!dataInicio || !dataFim) { toast('Informe as duas datas', false); return }
    if (dataInicio > dataFim) { toast('Data início deve ser antes da data fim', false); return }
    const mes = getMes()
    // O dashboard só carrega as vendas de um mês por vez, então um período que
    // atravessa a virada do mês mostraria colunas sempre zeradas.
    if (dataInicio.slice(0, 7) !== mes || dataFim.slice(0, 7) !== mes) {
      toast('O período precisa estar dentro do mês atual', false); return
    }
    const valMeta = metaSemana === '' ? 0 : parseFloat(metaSemana)
    if (Number.isNaN(valMeta) || valMeta < 0) { toast('Meta da semana inválida', false); return }
    setSavingSemana(true)
    const { error } = await sb.from('semana_fechamento')
      .upsert({ mes, data_inicio: dataInicio, data_fim: dataFim, meta: valMeta }, { onConflict: 'mes' })
    setSavingSemana(false)
    if (error) { toast(`Erro ao salvar semana do fechamento: ${error.message}`, false); return }
    await onRefresh()
    toast('Semana do fechamento salva!')
  }

  return (
    <div className="p-10 flex flex-col gap-8">
      <SectionHeader icon={<IconMeta size={20} />} title="Metas" subtitle="Defina a meta mensal, a do dia de fechamento e a da semana do fechamento" />

      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Meta do Mês */}
        <div className="rounded-2xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.07)' }}>
          <div className="px-6 py-4.5 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
            <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Meta do Mês</span>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {meta > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg border"
                style={{ background:'rgba(232,0,13,0.06)', borderColor:'rgba(232,0,13,0.2)' }}>
                <span className="text-sm text-muted">Meta atual:</span>
                <span className="font-bebas text-xl text-red">{fmt(meta)}</span>
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
                className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors"
                style={{ background:'#1F1F1F' }}
              />
            </div>
            <button onClick={salvarMes} disabled={savingMes}
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
          <div className="px-6 py-4.5 border-b" style={{ borderColor:'rgba(255,255,255,0.07)' }}>
            <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Semana do Fechamento</span>
          </div>
          <div className="p-6 flex flex-col gap-5">
            {semanaFechamento?.dataInicio && semanaFechamento?.dataFim && (
              <div className="flex items-center gap-5 px-4 py-3 rounded-lg border flex-wrap"
                style={{ background:'rgba(232,0,13,0.06)', borderColor:'rgba(232,0,13,0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">Período atual:</span>
                  <span className="font-bebas text-xl text-red">
                    {semanaFechamento.dataInicio.slice(8,10)}/{semanaFechamento.dataInicio.slice(5,7)}
                    {' '}até{' '}
                    {semanaFechamento.dataFim.slice(8,10)}/{semanaFechamento.dataFim.slice(5,7)}
                  </span>
                </div>
                <div className="w-px h-5" style={{ background:'rgba(255,255,255,0.12)' }} />
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted">Meta da semana:</span>
                  <span className="font-bebas text-xl text-red">
                    {semanaFechamento.meta > 0 ? fmt(semanaFechamento.meta) : 'não definida'}
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
                  className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors"
                  style={{ background:'#1F1F1F' }}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Data Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors"
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
                  className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors"
                  style={{ background:'#1F1F1F' }}
                />
              </div>
            </div>
            <p className="text-xs text-muted">
              Define o período e a meta mostrados na aba "Semana do Fechamento" do dashboard — normalmente os últimos dias do mês. Deixe a meta em branco ou zero pra esconder a barra de progresso na TV.
            </p>
            <button onClick={salvarSemana} disabled={savingSemana}
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
