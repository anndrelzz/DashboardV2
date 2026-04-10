import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { getMes, fmt, NIVEIS, NIVEL_CORES } from '../../lib/utils'
import { toast } from '../ui/Toast'
import Modal from '../ui/Modal'

const BUCKET = 'fotos-vendedores'

async function uploadFoto(file, vendedorId) {
  const ext  = file.name.split('.').pop()
  const path = `${vendedorId}.${ext}`
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) return null
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl + '?t=' + Date.now()
}

export default function SecVendedores({ equipes, vendedores, vendas, onRefresh }) {
  const [nome, setNome]       = useState('')
  const [empresa, setEmpresa] = useState('')
  const [nivel, setNivel]     = useState('')
  const [eqId, setEqId]       = useState('')
  const [foto, setFoto]       = useState(null)
  const [saving, setSaving]   = useState(false)

  const [editando, setEditando]     = useState(null) // vendedor em edição
  const [editNome, setEditNome]     = useState('')
  const [editEmpresa, setEditEmpresa] = useState('')
  const [editNivel, setEditNivel]   = useState('')
  const [editEqId, setEditEqId]     = useState('')
  const [editFoto, setEditFoto]     = useState(null)
  const [editSaving, setEditSaving] = useState(false)

  const getMes_ = getMes()

  const cadastrar = async () => {
    if (!nome.trim()) { toast('Informe o nome', false); return }
    if (!nivel) { toast('Selecione o nível', false); return }
    setSaving(true)
    const { data, error } = await sb.from('vendedores')
      .insert({ nome: nome.trim(), empresa: empresa.trim(), nivel, equipe_id: eqId || null })
      .select().single()
    if (error) { toast('Erro ao cadastrar', false); setSaving(false); return }

    if (foto && data) {
      const url = await uploadFoto(foto, data.id)
      if (url) await sb.from('vendedores').update({ foto_url: url }).eq('id', data.id)
    }
    setSaving(false)
    setNome(''); setEmpresa(''); setNivel(''); setEqId(''); setFoto(null)
    await onRefresh()
    toast('Vendedor cadastrado!')
  }

  const abrirEdicao = (v) => {
    setEditando(v)
    setEditNome(v.nome || '')
    setEditEmpresa(v.empresa || '')
    setEditNivel(v.nivel || '')
    setEditEqId(v.equipe_id || '')
    setEditFoto(null)
  }

  const salvarEdicao = async () => {
    if (!editNome.trim()) { toast('Informe o nome', false); return }
    setEditSaving(true)
    const upd = { nome: editNome.trim(), empresa: editEmpresa.trim(), nivel: editNivel, equipe_id: editEqId || null }
    if (editFoto) {
      const url = await uploadFoto(editFoto, editando.id)
      if (url) upd.foto_url = url
    }
    const { error } = await sb.from('vendedores').update(upd).eq('id', editando.id)
    setEditSaving(false)
    if (error) { toast('Erro ao salvar', false); return }
    setEditando(null)
    await onRefresh()
    toast('Vendedor atualizado!')
  }

  const remover = async (id) => {
    if (!confirm('Remover vendedor e suas vendas?')) return
    await sb.from('vendas').delete().eq('vendedor_id', id)
    await sb.from('vendedores').delete().eq('id', id)
    await onRefresh()
  }

  const inputCls = "rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors w-full"
  const inputBg  = { background:'#1F1F1F' }

  return (
    <div className="p-8 max-w-5xl flex flex-col gap-6">
      <div>
        <h1 className="font-bebas text-3xl tracking-[2px]">Vendedores</h1>
        <p className="text-sm text-muted mt-1">Cadastre e gerencie vendedores</p>
      </div>

      {/* Formulário cadastro */}
      <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Cadastrar Vendedor</span>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nome Completo</label>
              <input type="text" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: João Silva" className={inputCls} style={inputBg} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Empresa</label>
              <input type="text" value={empresa} onChange={e=>setEmpresa(e.target.value)} placeholder="Ex: AGS Consultoria" className={inputCls} style={inputBg} />
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

          {/* Upload foto */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Foto do Vendedor</label>
            <div className="flex items-center gap-4">
              {foto && <img src={URL.createObjectURL(foto)} className="w-14 h-14 rounded-full object-cover border-2 border-red/40" alt="preview" />}
              <label className="cursor-pointer px-4 py-2.5 rounded-lg border text-sm font-semibold text-muted hover:text-white hover:border-white/20 transition-colors"
                style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
                {foto ? 'Trocar foto' : '+ Selecionar foto'}
                <input type="file" accept="image/*" className="hidden" onChange={e => setFoto(e.target.files[0])} />
              </label>
              {foto && <span className="text-[12px] text-muted">{foto.name}</span>}
            </div>
          </div>

          <div>
            <button onClick={cadastrar} disabled={saving}
              className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
              style={{ background:'#E8000D' }}>
              {saving ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="rounded-xl border overflow-hidden" style={{ background:'#161616', borderColor:'rgba(255,255,255,0.08)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor:'rgba(255,255,255,0.08)' }}>
          <span className="font-cond font-bold text-sm tracking-[2px] uppercase">Lista de Vendedores</span>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ background:'#1F1F1F' }}>
              {['Foto','Nome','Empresa','Nível','Equipe','Vendas','Total',  ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-[2px] uppercase text-muted border-b"
                  style={{ borderColor:'rgba(255,255,255,0.08)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vendedores.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-10 text-muted text-[13px] tracking-wider uppercase">Nenhum vendedor cadastrado</td></tr>
            ) : vendedores.map(v => {
              const eq = equipes.find(e => e.id === v.equipe_id)
              const minhas = vendas.filter(x => x.vendedor_id === v.id)
              const total  = minhas.reduce((a, b) => a + Number(b.valor), 0)
              return (
                <tr key={v.id} className="border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                  style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                  <td className="px-4 py-3">
                    {v.foto_url
                      ? <img src={v.foto_url} className="w-9 h-9 rounded-full object-cover border border-white/10" alt={v.nome} />
                      : <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm" style={{background:'#282828'}}>👤</div>
                    }
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold">{v.nome}</td>
                  <td className="px-4 py-3 text-[13px] text-muted">{v.empresa || '—'}</td>
                  <td className="px-4 py-3">
                    {v.nivel ? <span className="text-[12px] font-bold" style={{color:NIVEL_CORES[v.nivel]||'#fff'}}>{v.nivel}</span> : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {eq ? <span className="px-2 py-0.5 rounded text-[11px] font-bold text-red border border-red/25" style={{background:'rgba(232,0,13,0.08)'}}>{eq.nome}</span> : <span className="text-dim text-[12px]">—</span>}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-muted">{minhas.length}</td>
                  <td className="px-4 py-3 font-bebas text-[15px] text-red">{fmt(total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => abrirEdicao(v)}
                        className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wide border text-muted border-white/15 hover:text-white hover:border-white/30 transition-colors"
                        style={{background:'#282828'}}>
                        Editar
                      </button>
                      <button onClick={() => remover(v.id)}
                        className="px-2.5 py-1 rounded text-[11px] font-bold tracking-wide border text-red border-red/20 hover:bg-red/10 transition-colors"
                        style={{background:'rgba(239,68,68,0.06)'}}>
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal edição */}
      <Modal open={!!editando} onClose={() => setEditando(null)} title="Editar Vendedor">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nome Completo</label>
              <input type="text" value={editNome} onChange={e=>setEditNome(e.target.value)} className={inputCls} style={inputBg} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Empresa</label>
              <input type="text" value={editEmpresa} onChange={e=>setEditEmpresa(e.target.value)} className={inputCls} style={inputBg} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nível</label>
              <select value={editNivel} onChange={e=>setEditNivel(e.target.value)} className={inputCls} style={inputBg}>
                <option value="">Selecione...</option>
                {NIVEIS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Equipe</label>
              <select value={editEqId} onChange={e=>setEditEqId(e.target.value)} className={inputCls} style={inputBg}>
                <option value="">Sem equipe</option>
                {equipes.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
              </select>
            </div>
          </div>

          {/* Foto no modal */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Foto</label>
            <div className="flex items-center gap-4">
              {(editFoto || editando?.foto_url) && (
                <img
                  src={editFoto ? URL.createObjectURL(editFoto) : editando?.foto_url}
                  className="w-14 h-14 rounded-full object-cover border-2 border-red/40"
                  alt="preview"
                />
              )}
              <label className="cursor-pointer px-4 py-2.5 rounded-lg border text-sm font-semibold text-muted hover:text-white hover:border-white/20 transition-colors"
                style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
                {editFoto ? 'Trocar foto' : editando?.foto_url ? 'Mudar foto' : '+ Selecionar foto'}
                <input type="file" accept="image/*" className="hidden" onChange={e => setEditFoto(e.target.files[0])} />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={salvarEdicao} disabled={editSaving}
              className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
              style={{ background:'#E8000D' }}>
              {editSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => setEditando(null)}
              className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase border text-muted hover:text-white hover:border-white/25 transition-colors"
              style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
              Cancelar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
