import { useEffect, useState } from 'react'
import { setToastHandler } from '../../lib/toast'

export default function Toast() {
  const [item, setItem] = useState(null)

  useEffect(() => {
    setToastHandler(({ msg, ok }) => {
      setItem({ msg, ok })
      setTimeout(() => setItem(null), 3000)
    })
    return () => setToastHandler(null)
  }, [])

  if (!item) return null

  return (
    <div className={`fixed bottom-6 right-6 z-[99998] flex items-center gap-3 px-5 py-4 rounded-xl border text-sm font-semibold
      animate-slide-up shadow-2xl
      ${item.ok
        ? 'bg-surface border-green-500/30 text-green-400'
        : 'bg-surface border-red-DEFAULT/30 text-red-DEFAULT'
      }`}
      style={{ borderLeftWidth: 3 }}
    >
      <span>{item.ok ? '✓' : '✕'}</span>
      {item.msg}
    </div>
  )
}
