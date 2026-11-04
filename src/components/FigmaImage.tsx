import { type CSSProperties, useMemo, useState } from 'react'

type Props = {
  /** Example: "/assets/Aus240.png" */
  src: string
  /** Optional fallback: "/assets/Aus240.svg" */
  fallbackSrc?: string
  className?: string
  style?: CSSProperties
  alt?: string
  ariaHidden?: boolean
  width?: number
  height?: number
  loading?: 'eager' | 'lazy'
}

function toSvgFallback(pngPath: string) {
  if (!pngPath.toLowerCase().endsWith('.png')) return undefined
  return pngPath.replace(/\.png$/i, '.svg')
}

function ImageWithFallback({
  src,
  fallbackSrc,
  className,
  style,
  alt = '',
  ariaHidden,
  width,
  height,
  loading = 'eager',
}: Props) {
  const fallbacks = useMemo(() => {
    const autoSvg = toSvgFallback(src)
    return [fallbackSrc, autoSvg].filter(Boolean) as string[]
  }, [fallbackSrc, src])

  const [activeSrc, setActiveSrc] = useState(src)
  const [attempt, setAttempt] = useState(0)

  return (
    <img
      src={activeSrc}
      className={className}
      style={style}
      alt={alt}
      aria-hidden={ariaHidden || undefined}
      width={width}
      height={height}
      loading={loading}
      onError={() => {
        const nextAttempt = attempt + 1
        setAttempt(nextAttempt)
        const next = fallbacks[nextAttempt - 1]
        if (next) setActiveSrc(next)
      }}
    />
  )
}

export function FigmaImage(props: Props) {
  return <ImageWithFallback key={props.src} {...props} />
}

