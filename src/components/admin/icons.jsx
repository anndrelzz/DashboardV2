const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }

const Icon = ({ children, size = 18, className = '', style, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style} {...base} {...rest}>{children}</svg>
)

export const IconResumo = (p) => (
  <Icon {...p}><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></Icon>
)

export const IconPerformance = (p) => (
  <Icon {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></Icon>
)

export const IconMeta = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.8" fill="currentColor"/></Icon>
)

export const IconVendas = (p) => (
  <Icon {...p}><rect x="2.5" y="6" width="19" height="13" rx="2"/><path d="M2.5 10.5h19"/><path d="M6 15h4"/></Icon>
)

export const IconVendedores = (p) => (
  <Icon {...p}><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c1.4-3.8 4.4-5.8 7.5-5.8s6.1 2 7.5 5.8"/></Icon>
)

export const IconEquipes = (p) => (
  <Icon {...p}><circle cx="8.5" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M2.8 19.5c1.1-3.3 3.2-5 5.7-5s4.6 1.7 5.7 5"/><path d="M14.7 15c2 .3 3.6 1.8 4.5 4.5"/></Icon>
)

export const IconLogout = (p) => (
  <Icon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></Icon>
)

export const IconArrowLeft = (p) => (
  <Icon {...p}><path d="M19 12H5"/><path d="M11 18l-6-6 6-6"/></Icon>
)

export const IconPlus = (p) => (
  <Icon {...p}><path d="M12 5v14"/><path d="M5 12h14"/></Icon>
)

export const IconEdit = (p) => (
  <Icon {...p}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></Icon>
)

export const IconTrash = (p) => (
  <Icon {...p}><path d="M4 7h16"/><path d="M9 7V4.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V7"/><path d="M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5L17.5 7"/></Icon>
)

export const IconCamera = (p) => (
  <Icon {...p}><path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.4"/></Icon>
)

export const IconUser = (p) => (
  <Icon {...p}><circle cx="12" cy="8.2" r="3.4"/><path d="M5 19.5c1.2-3.4 3.7-5 7-5s5.8 1.6 7 5"/></Icon>
)

export const IconHome = (p) => (
  <Icon {...p}><path d="M4 11.5 12 4l8 7.5"/><path d="M6 10v9.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V10"/></Icon>
)

export const IconCar = (p) => (
  <Icon {...p}><path d="M4 16.5V12l2-4.5h12L20 12v4.5"/><path d="M4 16.5h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></Icon>
)

export const IconWrench = (p) => (
  <Icon {...p}><path d="M14.7 6.3a4 4 0 0 0-5.6 4.9L4 16.3l2.7 2.7 5.1-5.1a4 4 0 0 0 4.9-5.6l-2.6 2.6-2-2Z"/></Icon>
)

export const IconSearch = (p) => (
  <Icon {...p}><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></Icon>
)

export const IconScale = (p) => (
  <Icon {...p}><path d="M12 3v18"/><path d="M7 21h10"/><path d="M4 7h6"/><path d="M14 7h6"/><path d="M4 7l-2.5 5a2.5 2.5 0 0 0 5 0Z"/><path d="M20 7l-2.5 5a2.5 2.5 0 0 0 5 0Z"/></Icon>
)

export const IconCheck = (p) => (
  <Icon {...p}><path d="M4 12.5l5 5L20 6"/></Icon>
)

export const IconX = (p) => (
  <Icon {...p}><path d="M6 6l12 12"/><path d="M18 6L6 18"/></Icon>
)

export const IconFlame = (p) => (
  <Icon {...p}><path d="M12 21c4 0 6.5-2.6 6.5-6 0-3-2-4.8-2.9-7.2-.4 1.6-1.4 2.6-2.3 2.6.4-2.3-.3-4.7-2.3-6.4-.3 3.2-1.9 4.6-3.6 6.6C5.9 12.4 5.5 14 5.5 15c0 3.4 2.5 6 6.5 6Z"/></Icon>
)
