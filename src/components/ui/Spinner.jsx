export default function Spinner({ size = 32 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full border-2 border-white/10 border-t-red animate-spin"
    />
  )
}
