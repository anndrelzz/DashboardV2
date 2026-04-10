import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-surface border border-white/10 border-t-4 border-t-red rounded-2xl p-8 w-full max-w-xl animate-celeb-in shadow-2xl">
        {title && (
          <h2 className="font-bebas text-xl tracking-[3px] text-white mb-6">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
