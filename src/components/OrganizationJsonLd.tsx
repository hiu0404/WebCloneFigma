import { useEffect } from 'react'

export function OrganizationJsonLd() {
  useEffect(() => {
    const node = document.createElement('script')
    node.type = 'application/ld+json'
    node.dataset.ecolinkOrganization = 'true'
    node.text = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Organization', name: 'Ecolink', url: window.location.origin,
      logo: `${window.location.origin}/assetsFull/logo-trang%203.png`, email: 'info.ecolinkvn@gmail.com', telephone: '+84812119668',
    })
    document.head.appendChild(node)
    return () => node.remove()
  }, [])
  return null
}
