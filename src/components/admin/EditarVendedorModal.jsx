import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import { NIVEIS } from '../../lib/utils'
import { uploadFoto } from '../../lib/fotoVendedor'
import Modal from '../ui/Modal'
import { IconUser, IconCamera } from './icons'

const inputCls = "rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors w-full"
const inputBg  = { background:'#1F1F1F' }

// Edição de vendedor (nome, empresa, nível, equipe, foto) — usado nas abas
// Vendedores e Equipes. Monte com key={vendedor.id} pra reiniciar os campos.
function Form({ vendedor, equipes, onClose, onSaved }) {
  const [nome, setNome]       = useState(vendedor.nome || '')
  const [empresa, setEmpresa] = useState(vendedor.empresa || '')
  const [nivel, setNivel]     = useState(vendedor.nivel || '')
  const [eqId, setEqId]       = useState(vendedor.equipe_id || '')
  const [foto, setFoto]       = useState(null)
  const [saving, setSaving]   = useState(false)

  const salvar = async () => {
    if (!nome.trim()) { toast('Informe o nome', false); return }
    setSaving(true)
    const upd = { nome: nome.trim(), empresa: empresa.trim(), nivel, equipe_id: eqId || null }
    if (foto) {
      const url = await uploadFoto(foto, vendedor.id)
      if (url) upd.foto_url = url
      else toast('Não deu pra enviar a foto; o resto será salvo', false)
    }
    const { data, error } = await sb.from('vendedores').update(upd).eq('id', vendedor.id).select('id')
    setSaving(false)
    if (error) { toast('Erro ao salvar', false); return }
    if (!data?.length) { toast('O banco não deixou alterar o vendedor (permissão)', false); return }
    onClose()
    await onSaved()
    toast('Vendedor atualizado!')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nome Completo</label>
          <input type="text" value={nome} onChange={e=>setNome(e.target.value)} className={inputCls} style={inputBg} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Empresa</label>
          <input type="text" value={empresa} onChange={e=>setEmpresa(e.target.value)} className={inputCls} style={inputBg} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nível</label>
          <select value={nivel} onChange={e=>setNivel(e.target.value)} className={inputCls} style={inputBg}>
            <option value="">Selecione...</option>
            {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Equipe</label>
          <select value={eqId} onChange={e=>setEqId(e.target.value)} className={inputCls} style={inputBg}>
            <option value="">Sem equipe</option>
            {equipes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Foto</label>
        <div className="flex items-center gap-4">
          {(foto || vendedor.foto_url) ? (
            <img src={foto ? URL.createObjectURL(foto) : vendedor.foto_url}
              className="w-14 h-14 rounded-full object-cover border-2 border-red/40" alt="preview" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center border" style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.3)' }}>
              <IconUser size={22} />
            </div>
          )}
          <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border text-sm font-semibold text-muted hover:text-white hover:border-white/20 transition-colors"
            style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
            <IconCamera size={15} />
            {foto ? 'Trocar foto' : vendedor.foto_url ? 'Mudar foto' : 'Selecionar foto'}
            <input type="file" accept="image/*" className="hidden" onChange={e => setFoto(e.target.files[0])} />
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={salvar} disabled={saving}
          className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
          style={{ background:'#E8000D' }}>
          {saving ? 'Salvando...' : 'Salvar'}
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

export default function EditarVendedorModal({ vendedor, equipes, onClose, onSaved }) {
  return (
    <Modal open={!!vendedor} onClose={onClose} title="Editar Vendedor">
      {vendedor && <Form key={vendedor.id} vendedor={vendedor} equipes={equipes} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}
