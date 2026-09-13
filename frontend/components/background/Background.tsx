'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

/** The subset of a vanta effect instance this component touches. */
interface VantaEffect {
  destroy(): void
  req?: number
  animationLoop?: FrameRequestCallback
  renderer?: { domElement?: HTMLCanvasElement }
}

type VantaFog = (options: Record<string, unknown>) => VantaEffect

/** Globals vanta and requestIdleCallback add, neither of which is in lib.dom. */
interface VantaWindow {
  VANTA?: { FOG?: VantaFog }
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
  cancelIdleCallback?: (id: number) => void
}

const vantaWindow = () => window as unknown as VantaWindow

/** Target frame rate for the fog. It is slow ambient motion; 60fps buys nothing. */
const FOG_FPS = 30

/**
 * Vanta divides devicePixelRatio by `scale`, so a larger number renders the
 * shader at a lower resolution. blurFactor 0.9 makes the result so soft that
 * the downscale is invisible, while the fragment shader runs far less.
 */
const FOG_SCALE = 3
const FOG_SCALE_MOBILE = 6

function hexToVantaColor(hex: string): number {
  const cleaned = hex.trim().replace('#', '')
  return parseInt(cleaned, 16)
}

/**
 * Probe for a usable WebGL context before loading three.js + vanta.
 * Headless/GPU-less browsers (Lighthouse, some VMs, blocked-WebGL profiles)
 * fail inside THREE.WebGLRenderer's constructor, which vanta does not guard.
 */
function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    if (!gl) return false
    // Release the probe context immediately; drivers cap concurrent contexts.
    const lose = (gl as WebGLRenderingContext).getExtension('WEBGL_lose_context')
    lose?.loseContext()
    return true
  } catch {
    return false
  }
}

/**
 * A fullscreen fragment shader is not worth its cost on a phone, a metered
 * connection, or a low-end machine. Those visitors get the static gradient,
 * which reads as the same design at a fraction of the main-thread cost:
 * compiling and running the shader was worth ~1.5s of main-thread work and
 * most of the page's blocking time on a mid-range device.
 */
function isConstrainedDevice(): boolean {
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean }
    deviceMemory?: number
  }
  if (window.matchMedia?.('(max-width: 767px)').matches) return true
  if (nav.connection?.saveData) return true
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) return true
  if (typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4) return true
  return false
}

/** Run `fn` once the main thread is idle, so the fog never competes with LCP. */
function whenIdle(fn: () => void): () => void {
  const ric = vantaWindow().requestIdleCallback

  if (ric) {
    const id = ric(fn, { timeout: 3000 })
    return () => vantaWindow().cancelIdleCallback?.(id)
  }
  const id = window.setTimeout(fn, 1200)
  return () => window.clearTimeout(id)
}

/**
 * Cap the effect's frame rate. Vanta reschedules itself by reading
 * `this.animationLoop` on every frame, so replacing that property is enough to
 * wrap the loop; the original still drives timing and reschedules through us.
 */
function throttleAnimationLoop(effect: VantaEffect, fps: number) {
  const original = effect?.animationLoop
  if (typeof original !== 'function') return

  const minDelta = 1000 / fps
  let last = 0

  const throttled = (time: number) => {
    const now = performance.now()
    if (now - last < minDelta) {
      effect.req = window.requestAnimationFrame(throttled)
      return
    }
    last = now
    original(time)
  }

  effect.animationLoop = throttled
}

type BackgroundProps = { accentColor: string }

export default function Background({ accentColor }: BackgroundProps) {
  const elRef = useRef<HTMLDivElement>(null)
  const effectRef = useRef<VantaEffect | null>(null)
  const [loaded, setLoaded] = useState(false)

  // re-init only if the numeric color actually changes
  const lowlightColor = useMemo(() => hexToVantaColor(accentColor), [accentColor])

  // Static stand-in for the fog: shown whenever the shader does not run, and
  // underneath it while it fades in, so the page is never flat black.
  const gradient = useMemo(
    () =>
      [
        `radial-gradient(60% 50% at 20% 15%, color-mix(in srgb, ${accentColor} 26%, transparent), transparent 70%)`,
        `radial-gradient(55% 45% at 85% 70%, color-mix(in srgb, ${accentColor} 18%, transparent), transparent 70%)`,
        `radial-gradient(70% 60% at 50% 110%, color-mix(in srgb, ${accentColor} 12%, transparent), transparent 70%)`,
        '#000000',
      ].join(', '),
    [accentColor]
  )

  useEffect(() => {
    let cancelled = false

    // Users who asked for less motion get the static gradient.
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || isConstrainedDevice() || !supportsWebGL()) return

    const start = async () => {
      const el = elRef.current
      if (!el || cancelled) return

      try {
        const [, THREE] = await Promise.all([import('./vanta-fog.js'), import('three')])
        if (cancelled) return

        const FOG = vantaWindow().VANTA?.FOG
        if (!FOG) return

        effectRef.current?.destroy()

        const effect = FOG({
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
          scale: FOG_SCALE,
          scaleMobile: FOG_SCALE_MOBILE,
        })
        effectRef.current = effect

        throttleAnimationLoop(effect, FOG_FPS)

        // A lost context (GPU reset, too many contexts) would otherwise spam
        // errors from vanta's animation loop forever.
        effect?.renderer?.domElement?.addEventListener(
          'webglcontextlost',
          () => {
            effectRef.current?.destroy()
            effectRef.current = null
            setLoaded(false)
          },
          { once: true }
        )

        if (!cancelled) setLoaded(true)
      } catch (err) {
        // No fog is a fine outcome, the gradient below is already painted.
        console.warn('[Background] fog effect unavailable:', err)
        effectRef.current = null
      }
    }

    const cancelIdle = whenIdle(start)

    return () => {
      cancelled = true
      cancelIdle()
      effectRef.current?.destroy()
      effectRef.current = null
    }
  }, [lowlightColor])

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -10 }}>
      {/* Static stand-in, always painted; the fog canvas fades in over it. */}
      <div className="absolute inset-0" style={{ background: gradient }} />
      <div
        ref={elRef}
        className="absolute inset-0"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 1s' }}
      />
    </div>
  )
}
