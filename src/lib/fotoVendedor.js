import { sb } from './supabase'

const BUCKET = 'fotos-vendedores'

// Sobe a foto do vendedor e devolve a URL pública (com ?t= pra furar o cache).
// Devolve null se o upload falhar.
export async function uploadFoto(file, vendedorId) {
  const ext  = file.name.split('.').pop()
  const path = `${vendedorId}.${ext}`
  const { error } = await sb.storage.from(BUCKET).upload(path, file, { upsert: true })
  if (error) return null
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl + '?t=' + Date.now()
}
