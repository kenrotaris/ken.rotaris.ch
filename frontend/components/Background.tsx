'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Convert hex color to number format for Vanta (0xRRGGBB)
 */
function hexToVantaColor(hex: string): number {
  const cleaned = hex.replace('#', '');
  return parseInt(cleaned, 16);
}

interface BackgroundProps {
  accentColor: string;
}

export default function Background({ accentColor }: BackgroundProps) {
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {

    const initVanta = async () => {
      if (!vantaRef.current) return;

      // Dynamically import Vanta and Three.js
      const [{ default: FOG }, THREE] = await Promise.all([
        import('vanta/dist/vanta.fog.min'),
        import('three')
      ]);

      // Destroy existing effect if it exists
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }

      // Initialize Vanta Fog effect
      vantaEffect.current = FOG({
        el: vantaRef.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0x000000,
        midtoneColor: 0x000000,
        lowlightColor: hexToVantaColor(accentColor),
        baseColor: 0x000000,
        blurFactor: 0.90,
        speed: 1.00,
        zoom: 0.40
      });

      // Fade in after initialization
      setIsLoaded(true);
    };

    initVanta();

    // Cleanup on unmount
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, [accentColor]);

  return (
    <div
      ref={vantaRef}
      className={`fixed inset-0 pointer-events-none -z-50 transition-opacity duration-1000 overflow-hidden ${isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
    />
  );
}
