import { useEffect, useRef } from 'react'

// Sem UI própria: só tenta evitar que o navegador da TV apague a tela por
// inatividade. Dois truques, cada um silencioso se o navegador não suportar.
export default function KeepAwake() {
  const wakeLockRef = useRef(null)

  useEffect(() => {
    let pixelIv = null
    let video = null

    // Vídeo "fantasma": muitas TVs não cortam a tela enquanto há mídia
    // tocando, então mantemos um vídeo de 1px sempre em reprodução.
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 2
      canvas.height = 2
      const ctx = canvas.getContext('2d')
      const stream = canvas.captureStream(1)

      video = document.createElement('video')
      video.muted = true
      video.autoplay = true
      video.playsInline = true
      video.srcObject = stream
      video.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;'
      document.body.appendChild(video)
      video.play().catch(() => {})

      pixelIv = setInterval(() => {
        ctx.fillStyle = Math.random() > 0.5 ? '#000000' : '#010101'
        ctx.fillRect(0, 0, 2, 2)
      }, 5000)
    } catch {
      // captureStream indisponível nesse navegador — segue só com o wake lock
    }

    const pedirWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch {
        // navegador não suporta ou negou o wake lock
      }
    }
    pedirWakeLock()

    const onVisibility = () => { if (document.visibilityState === 'visible') pedirWakeLock() }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      if (pixelIv) clearInterval(pixelIv)
      document.removeEventListener('visibilitychange', onVisibility)
      video?.remove()
      wakeLockRef.current?.release().catch(() => {})
    }
  }, [])

  return null
}
