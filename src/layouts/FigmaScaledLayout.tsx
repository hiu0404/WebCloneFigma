import { type CSSProperties, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Footer } from '../components/Footer/Footer'
import styles from './FigmaScaledLayout.module.css'

export const FIGMA_LAYOUT_WIDTH_PX = 1920

function readViewportWidth(): number {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
}

function computeScale(width: number): number {
  if (width <= 0 || !Number.isFinite(width)) return 1
  return Math.min(1, width / FIGMA_LAYOUT_WIDTH_PX)
}

export function FigmaScaledLayout() {
  const [scale, setScale] = useState(() =>
    typeof document !== 'undefined' ? computeScale(readViewportWidth()) : 1,
  )

  useEffect(() => {
    const tick = () => setScale(computeScale(readViewportWidth()))

    tick()
    window.addEventListener('resize', tick)
    window.visualViewport?.addEventListener?.('resize', tick)
    return () => {
      window.removeEventListener('resize', tick)
      window.visualViewport?.removeEventListener?.('resize', tick)
    }
  }, [])

  const zoomOk =
    typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('zoom', '1')

  if (!zoomOk) {
    const clipW = FIGMA_LAYOUT_WIDTH_PX * scale
    return (
      <div className={styles.viewport}>
        <div className={`${styles.stageClip}`} style={{ width: clipW }}>
          <div
            className={styles.stageInner}
            style={{ transform: `scale(${scale})`, '--figma-scale': scale } as CSSProperties}
          >
            <Outlet />
          </div>
        </div>
        <Footer />
       
      </div>
    )
  }

  return (
    <div className={styles.viewport}>
      <div className={styles.stage} style={{ zoom: scale, '--figma-scale': scale } as CSSProperties}>
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
