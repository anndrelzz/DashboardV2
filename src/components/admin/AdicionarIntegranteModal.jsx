import { useState } from 'react'
import { sb } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import { NIVEIS, NIVEL_CORES, normalizarBusca } from '../../lib/utils'
import { uploadFoto } from '../../lib/fotoVendedor'
import Modal from '../ui/Modal'
import { IconUser, IconCamera, IconSearch, IconPlus } from './icons'

const inputCls = "rounded-lg px-4 py-2.5 text-white text-sm outline-none border border-white/10 focus:border-red/40 transition-colors w-full"
const inputBg  = { background:'#1F1F1F' }

// Aba "Vendedor existente": coloca na equipe alguém já cadastrado (sem equipe
// ou vindo de outra equipe — nesse caso pede confirmação antes de mover).
function Existente({ equipe, equipes, vendedores, onSaved }) {
  const [busca, setBusca]   = useState('')
  const [salvando, setSalvando] = useState(null)

  const nomeEquipe = id => equipes.find(e => e.id === id)?.nome
  const buscaNorm = normalizarBusca(busca)
  const candidatos = vendedores
    .filter(v => v.equipe_id !== equipe.id)
    .filter(v => !buscaNorm || normalizarBusca(v.nome).includes(buscaNorm) || normalizarBusca(v.empresa).includes(buscaNorm))
    // sem equipe primeiro, depois por nome
    .sort((a, b) => (!!a.equipe_id - !!b.equipe_id) || a.nome.localeCompare(b.nome))

  const adicionar = async (v) => {
    if (v.equipe_id && !confirm(`${v.nome} está na equipe ${nomeEquipe(v.equipe_id) || '?'}. Mover pra ${equipe.nome}?`)) return
    setSalvando(v.id)
    const { data, error } = await sb.from('vendedores').update({ equipe_id: equipe.id }).eq('id', v.id).select('id')
    setSalvando(null)
    if (error) { toast('Erro ao adicionar na equipe', false); return }
    if (!data?.length) { toast('O banco não deixou alterar o vendedor (permissão)', false); return }
    await onSaved()
    toast(`${v.nome} adicionado à ${equipe.nome}`)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <IconSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:'rgba(255,255,255,0.3)' }} />
        <input type="text" autoFocus value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou empresa..." className={`${inputCls} pl-9`} style={inputBg} />
      </div>
      <div className="max-h-[45vh] overflow-y-auto rounded-xl border" style={{ background:'#121212', borderColor:'rgba(255,255,255,0.06)' }}>
        {candidatos.length === 0 ? (
          <div className="px-5 py-8 text-center text-muted text-[13px]">
            {buscaNorm ? `Nenhum vendedor encontrado para "${busca}"` : 'Todos os vendedores já estão nesta equipe'}
          </div>
        ) : candidatos.map(v => (
          <div key={v.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 hover:bg-white/[0.02]"
            style={{ borderColor:'rgba(255,255,255,0.04)' }}>
            {v.foto_url
              ? <img src={v.foto_url} className="w-8 h-8 rounded-full object-cover border border-white/10" alt={v.nome} />
              : <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:'#282828', color:'rgba(255,255,255,0.3)' }}><IconUser size={14} /></div>}
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold truncate">{v.nome}</div>
              <div className="text-[11.5px] text-muted truncate">
                {v.nivel && <span className="font-bold mr-1.5" style={{ color: NIVEL_CORES[v.nivel] }}>{v.nivel}</span>}
                {v.equipe_id ? `Equipe atual: ${nomeEquipe(v.equipe_id) || '—'}` : 'Sem equipe'}
              </div>
            </div>
            <button onClick={() => adicionar(v)} disabled={salvando === v.id}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-bold tracking-wide border text-white border-red/40 hover:bg-red/20 transition-colors disabled:opacity-50"
              style={{ background:'rgba(232,0,13,0.12)' }}>
              <IconPlus size={12} />{salvando === v.id ? '...' : v.equipe_id ? 'Mover pra cá' : 'Adicionar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Aba "Novo vendedor": cadastra já dentro da equipe
function Novo({ equipe, onSaved, onClose }) {
  const [nome, setNome]       = useState('')
  const [empresa, setEmpresa] = useState('')
  const [nivel, setNivel]     = useState('')
  const [foto, setFoto]       = useState(null)
  const [saving, setSaving]   = useState(false)

  const cadastrar = async () => {
    if (!nome.trim()) { toast('Informe o nome', false); return }
    if (!nivel) { toast('Selecione o nível', false); return }
    setSaving(true)
    const { data, error } = await sb.from('vendedores')
      .insert({ nome: nome.trim(), empresa: empresa.trim(), nivel, equipe_id: equipe.id })
      .select().single()
    if (error || !data) { setSaving(false); toast('Erro ao cadastrar (ou conta sem permissão)', false); return }
    if (foto) {
      const url = await uploadFoto(foto, data.id)
      if (url) await sb.from('vendedores').update({ foto_url: url }).eq('id', data.id)
      else toast('Vendedor cadastrado, mas a foto não subiu', false)
    }
    setSaving(false)
    onClose()
    await onSaved()
    toast(`${data.nome} cadastrado na ${equipe.nome}!`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold tracking-[1px] uppercase text-muted">Nome Completo</label>
          <input type="text" autoFocus value={nome} onChange={e=>setNome(e.target.value)} placeholder="Ex: João Silva" className={inputCls} style={inputBg} />
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
          <div className={`${inputCls} text-muted`} style={inputBg}>{equipe.nome}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {foto
          ? <img src={URL.createObjectURL(foto)} className="w-14 h-14 rounded-full object-cover border-2 border-red/40" alt="preview" />
          : <div className="w-14 h-14 rounded-full flex items-center justify-center border" style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.3)' }}><IconUser size={22} /></div>}
        <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-lg border text-sm font-semibold text-muted hover:text-white hover:border-white/20 transition-colors"
          style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>
          <IconCamera size={15} />{foto ? 'Trocar foto' : 'Selecionar foto'}
          <input type="file" accept="image/*" className="hidden" onChange={e => setFoto(e.target.files[0])} />
        </label>
      </div>
      <div className="flex gap-3 pt-1">
        <button onClick={cadastrar} disabled={saving}
          className="px-6 py-2.5 rounded-lg font-cond font-bold text-[13px] tracking-[2px] uppercase text-white disabled:opacity-60"
          style={{ background:'#E8000D' }}>
          {saving ? 'Cadastrando...' : 'Cadastrar na equipe'}
        </button>
      </div>
    </div>
  )
}

function Conteudo({ equipe, equipes, vendedores, onClose, onSaved }) {
  const [aba, setAba] = useState('existente')
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 -mt-1">
        <div>
          <h2 className="font-bebas text-xl tracking-[3px] text-white">Adicionar integrante</h2>
          <p className="text-[12.5px] text-muted mt-0.5">Equipe <strong className="text-white">{equipe.nome}</strong></p>
        </div>
        <button onClick={onClose} title="Fechar (Esc)"
          className="w-9 h-9 flex items-center justify-center rounded-lg border text-muted hover:text-white hover:border-white/25 transition-colors"
          style={{ background:'#1F1F1F', borderColor:'rgba(255,255,255,0.1)' }}>✕</button>
      </div>
      <div className="flex rounded-lg overflow-hidden border self-start" style={{ borderColor:'rgba(255,255,255,0.1)', background:'#111' }}>
        {[['existente', 'Vendedor existente'], ['novo', 'Novo vendedor']].map(([id, label]) => (
          <button key={id} onClick={() => setAba(id)}
            className="px-4 py-2 font-cond font-bold text-xs tracking-[1.5px] uppercase transition-all"
            style={{ background: aba === id ? 'rgba(232,0,13,0.8)' : 'transparent', color: aba === id ? '#fff' : 'rgba(255,255,255,0.4)' }}>
            {label}
          </button>
        ))}
      </div>
      {aba === 'existente'
        ? <Existente equipe={equipe} equipes={equipes} vendedores={vendedores} onSaved={onSaved} />
        : <Novo equipe={equipe} onSaved={onSaved} onClose={onClose} />}
    </div>
  )
}

export default function AdicionarIntegranteModal({ equipe, equipes, vendedores, onClose, onSaved }) {
  return (
    <Modal open={!!equipe} onClose={onClose} largura="max-w-2xl">
      {equipe && <Conteudo key={equipe.id} equipe={equipe} equipes={equipes} vendedores={vendedores} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}
