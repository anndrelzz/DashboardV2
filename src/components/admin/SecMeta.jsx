import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { getMes, fmt } from '../../lib/utils'
import { toast } from '../ui/Toast'

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
    <div className="p-8 max-w-2xl flex flex-col gap-8">
      {/* Meta do Mês */}
      <div>
        <h1 className="font-bebas text-3xl tracking-[2px] mb-1">Meta do Mês</h1>
        <p className="text-sm text-muted mb-6">Defina a meta mensal de vendas</p>

        <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
            <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Configurar Meta Mensal</span>
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
      </div>

      {/* Meta de Fechamento */}
      <div>
        <h1 className="font-bebas text-3xl tracking-[2px] mb-1">Meta de Fechamento</h1>
        <p className="text-sm text-muted mb-6">Defina a meta para o dia do fechamento</p>

        <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,140,0,0.2)' }}>
          <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor:'rgba(255,140,0,0.2)', background:'rgba(255,100,0,0.04)' }}>
            <span className="font-cond font-bold text-sm tracking-[2px] uppercase" style={{ color:'#FF8C00' }}>🔥 Configurar Meta de Fechamento</span>
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
