import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import { TIPOS } from '../../lib/tiposVenda'
import Modal from '../ui/Modal'

const inputCls = "rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors w-full"
const inputBg  = { background:'#1F1F1F' }

// Modal de edição de venda, usado em Lançar Venda e na setinha de Vendedores.
// Monte com key={venda.id} pra reiniciar os campos a cada venda aberta.
function Form({ venda, vendedores, onClose, onSaved }) {
  const [vendId, setVendId] = useState(venda.vendedor_id)
  const [valor, setValor]   = useState(String(venda.valor))
  const [data, setData]     = useState(venda.data ? String(venda.data).slice(0, 10) : '')
  const [tipo, setTipo]     = useState(venda.tipo === 'Servico' ? 'Serviço' : venda.tipo)
  const [desc, setDesc]     = useState(venda.descricao || '')
  const [saving, setSaving] = useState(false)

  const salvar = async () => {
    if (!vendId) { toast('Selecione um vendedor', false); return }
    const val = parseFloat(valor)
    if (!val || val <= 0) { toast('Informe um valor válido', false); return }
    if (!tipo) { toast('Selecione o tipo', false); return }
    if (!data) { toast('Informe a data', false); return }
    setSaving(true)
    const { error } = await sb.from('vendas')
      .update({ vendedor_id:vendId, valor:val, data, descricao:desc.trim(), tipo, mes:data.substring(0, 7) })
      .eq('id', venda.id)
    setSaving(false)
    if (error) { toast('Erro ao salvar edição', false); return }
    onClose()
    await onSaved()
    toast('Venda atualizada!')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Vendedor</label>
          <select value={vendId} onChange={e=>setVendId(e.target.value)} className={inputCls} style={inputBg}>
            <option value="">Selecione...</option>
            {vendedores.map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Valor (R$)</label>
          <input type="number" value={valor} onChange={e=>setValor(e.target.value)} min={0} step={0.01} className={inputCls} style={inputBg} />
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
        <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} className={inputCls} style={inputBg} />
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={salvar} disabled={saving}
          className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
          style={{ background:'#E8000D' }}>
          {saving ? 'Salvando...' : 'Salvar Alterações'}
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

export default function EditarVendaModal({ venda, vendedores, onClose, onSaved }) {
  return (
    <Modal open={!!venda} onClose={onClose} title="Editar Venda">
      {venda && <Form key={venda.id} venda={venda} vendedores={vendedores} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}

