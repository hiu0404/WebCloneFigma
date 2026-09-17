import { useEffect } from 'react'

type Props = {
  title: string
  description: string
  canonical?: string
  image?: string
  jsonLd?: Record<string, unknown>
}

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
  let node = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null
  if (!node) {
    node = document.createElement('meta')
    node.setAttribute(attribute, key)
    document.head.appendChild(node)
  }
  node.content = content
}

export function SeoHead({ title, description, canonical, image, jsonLd }: Props) {
  useEffect(() => {
    document.title = title
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', title)
    setMeta('property', 'og:description', description)
    if (image) setMeta('property', 'og:image', image)
    let canonicalNode = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonicalNode) {
      canonicalNode = document.createElement('link')
      canonicalNode.rel = 'canonical'
      document.head.appendChild(canonicalNode)
    }
    canonicalNode.href = canonical || window.location.href.split('?')[0]
    let jsonLdNode = document.head.querySelector('script[data-ecolink-seo]') as HTMLScriptElement | null
    if (jsonLd) {
      if (!jsonLdNode) {
        jsonLdNode = document.createElement('script')
        jsonLdNode.type = 'application/ld+json'
        jsonLdNode.dataset.ecolinkSeo = 'true'
        document.head.appendChild(jsonLdNode)
      }
      jsonLdNode.text = JSON.stringify(jsonLd)
    }
    return () => { jsonLdNode?.remove() }
  }, [title, description, canonical, image, jsonLd])
  return null
}
