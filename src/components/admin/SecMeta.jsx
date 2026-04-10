import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { getMes, fmt } from '../../lib/utils'
import { toast } from '../ui/Toast'

export default function SecMeta({ meta, onRefresh }) {
  const [valor, setValor] = useState(meta || '')
  const [saving, setSaving] = useState(false)

  const salvar = async () => {
    const val = parseFloat(valor)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    setSaving(true)
    const { error } = await sb.from('metas').upsert({ mes: getMes(), valor: val }, { onConflict: 'mes' })
    setSaving(false)
    if (error) { toast('Erro ao salvar meta', false); return }
    await onRefresh()
    toast('Meta salva!')
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="font-bebas text-3xl tracking-[2px] mb-1">Meta do Mês</h1>
      <p className="text-sm text-muted mb-8">Defina a meta mensal de vendas</p>

      <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Configurar Meta</span>
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
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="Ex: 500000"
              min={0}
              className="rounded-lg px-4 py-3 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors"
              style={{ background:'#1F1F1F' }}
            />
          </div>
          <button onClick={salvar} disabled={saving}
            className="self-start px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white transition-colors disabled:opacity-60"
            style={{ background:'#E8000D' }}>
            {saving ? 'Salvando...' : 'Salvar Meta'}
          </button>
        </div>
      </div>
    </div>
  )
}
