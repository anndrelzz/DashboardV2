export default function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-6 pb-6 border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
            style={{ background:'rgba(232,0,13,0.08)', borderColor:'rgba(232,0,13,0.2)', color:'#E8000D' }}>
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-bebas text-[32px] leading-none tracking-[1.5px]">{title}</h1>
          {subtitle && <p className="text-[13px] text-muted mt-1.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
