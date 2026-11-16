import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import { getDiaFechamento } from '../../lib/utils'
import { TIPOS } from '../../lib/tiposVenda'
import Modal from '../ui/Modal'

const inputCls = "rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors w-full"
const inputBg  = { background:'#1F1F1F' }

// Lançar venda já com o vendedor escolhido (usado na setinha de Equipes).
// Monte com key={vendedor.id} pra reiniciar os campos.
function Form({ vendedor, onClose, onSaved }) {
  const [valor, setValor]   = useState('')
  const [data, setData]     = useState(getDiaFechamento())
  const [tipo, setTipo]     = useState('')
  const [desc, setDesc]     = useState('')
  const [saving, setSaving] = useState(false)

  const lancar = async () => {
    const val = parseFloat(valor)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    if (!tipo) { toast('Selecione o tipo', false); return }
    if (!data) { toast('Informe a data', false); return }
    setSaving(true)
    const { data: ins, error } = await sb.from('vendas')
      .insert({ vendedor_id: vendedor.id, valor: val, data, descricao: desc.trim(), tipo, mes: data.substring(0, 7) })
      .select('id')
    setSaving(false)
    if (error) { toast('Erro ao lançar venda', false); return }
    if (!ins?.length) { toast('O banco não deixou lançar a venda (permissão)', false); return }
    onClose()
    await onSaved()
    toast('Venda lançada!')
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13px] text-muted -mt-3">Vendedor: <strong className="text-white">{vendedor.nome}</strong></p>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Valor (R$)</label>
          <input type="number" autoFocus value={valor} onChange={e=>setValor(e.target.value)} placeholder="Ex: 15000" min={0} step={0.01} className={inputCls} style={inputBg} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Data</label>
          <input type="date" value={data} onChange={e=>setData(e.target.value)} className={inputCls} style={inputBg} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Tipo</label>
          <select value={tipo} onChange={e=>setTipo(e.target.value)} className={inputCls} style={inputBg}>
            <option value="">Selecione...</option>
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Descrição (opcional)</label>
        <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} onKeyDown={e => e.key === 'Enter' && lancar()}
          placeholder="Ex: Apartamento 3 quartos" className={inputCls} style={inputBg} />
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={lancar} disabled={saving}
          className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
          style={{ background:'#E8000D' }}>
          {saving ? 'Lançando...' : 'Lançar Venda'}
        </button>
        <button onClick={onClose}
          className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase border text-muted hover:text-white hover:border-white/25 transition-colors"
          style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default function NovaVendaModal({ vendedor, onClose, onSaved }) {
  return (
    <Modal open={!!vendedor} onClose={onClose} title="Lançar Venda">
      {vendedor && <Form key={vendedor.id} vendedor={vendedor} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}
