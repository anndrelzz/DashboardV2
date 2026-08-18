import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { getMes, fmt } from '../../lib/utils'
import { toast } from '../ui/Toast'
import SectionHeader from './SectionHeader'
import { IconMeta, IconFlame } from './icons'

export default function SecMeta({ meta, metaFechamento, onRefresh }) {
  const [valorMes,       setValorMes]       = useState(meta           || '')
  const [valorFechamento, setValorFechamento] = useState(metaFechamento || '')
  const [savingMes,       setSavingMes]       = useState(false)
  const [savingFech,      setSavingFech]      = useState(false)

  const salvarMes = async () => {
    const val = parseFloat(valorMes)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    setSavingMes(true)
    const { error } = await sb.from('metas').upsert({ mes: getMes(), valor: val }, { onConflict: 'mes' })
    setSavingMes(false)
    if (error) { toast('Erro ao salvar meta', false); return }
    await onRefresh()
    toast('Meta do mês salva!')
  }

  const salvarFechamento = async () => {
    const val = parseFloat(valorFechamento)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    setSavingFech(true)
    const { error } = await sb.from('meta_fechamento').update({ valor: val }).eq('id', 1)
    setSavingFech(false)
    if (error) { toast('Erro ao salvar meta de fechamento', false); return }
    await onRefresh()
    toast('Meta de fechamento salva!')
  }

  return (
    <div className="p-10 flex flex-col gap-8">
      <SectionHeader icon={<IconMeta size={20} />} title="Metas" subtitle="Defina a meta mensal e a meta do dia de fechamento" />

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
      </div>
    </div>
  )
}
