'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

function hexToVantaColor(hex: string): number {
  const cleaned = hex.trim().replace('#', '')
  return parseInt(cleaned, 16)
}

type BackgroundProps = { accentColor: string }

export default function Background({ accentColor }: BackgroundProps) {
  const elRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)

  // re-init only if the numeric color actually changes
  const lowlightColor = useMemo(() => hexToVantaColor(accentColor), [accentColor])

  useEffect(() => {
    let cancelled = false

      ; (async () => {
        const el = elRef.current
        if (!el) return

        const [{ }, THREE] = await Promise.all([import('./vanta-fog.js'), import('three')])
        if (cancelled) return

        const FOG = (window as any).VANTA?.FOG
        if (!FOG) return

        effectRef.current?.destroy()

        effectRef.current = FOG({
          el,
          THREE,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          highlightColor: 0x000000,
          midtoneColor: 0x000000,
          lowlightColor,
          baseColor: 0x000000,
          blurFactor: 0.9,
          speed: 1.0,
          zoom: 0.4,
        })

        setLoaded(true)
      })()

    return () => {
      cancelled = true
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [lowlightColor])

  return (
    <div
      ref={elRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: -10,
        opacity: loaded ? 1 : 0,
        transition: 'opacity 1s'
      }}
    />
  )
}
