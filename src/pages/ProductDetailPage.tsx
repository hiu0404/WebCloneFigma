import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { FiArrowRight, FiChevronLeft, FiChevronRight, FiDatabase, FiDownload, FiDroplet, FiFileText, FiImage, FiMonitor, FiPlayCircle, FiRadio, FiStar, FiX, FiZoomIn } from 'react-icons/fi'
import styles from './ProductDetailPage.module.css'
import type { Product } from '../lib/adminStore'
import { apiGetProducts } from '../services/productService'
import { apiGetMicroscopes } from '../services/microscopeService'
import { apiGetForensicProducts } from '../services/forensicProductService'
import { apiGetPiccProducts } from '../services/piccProductService'
import { apiGetCategories } from '../services/categoryService'
import { productMainImageUrl } from '../lib/productImages'
import {
  getChildCategoryLabel,
  findChildCategoryParent,
  getProductChildCategorySlug,
  getProductParentCategorySlug,
  normalizeProductCategoryFields,
  type AdminCategory,
} from '../data/categories'
import { SeoHead } from '../components/SeoHead'
import { productSeoDescription, productSeoTitle, type ProductKind } from '../lib/seo'
import { apiUrl } from '../lib/apiClient'
import { Breadcrumb, type BreadcrumbItem } from '../components/Breadcrumb'
import { productUrl } from '../lib/seo'
import { QuoteRequestModal } from '../components/QuoteRequestModal'
import { ProductFaqSection } from '../components/ProductFaqSection'
import { normalizeInstallationPhotos } from '../lib/installationPhotos'
import { normalizeProductHighlights } from '../lib/productHighlights'

function categoryPageUrl(parentSlug: string) {
  return ({ equipment: '/giai-phau-benh', consumables: '/vat-tu-tieu-hao', chemicals: '/hoa-chat', antibodies: '/khang-the', 'forensic-science': '/giam-dinh-hinh-su', 'intensive-care': '/hoi-suc-tich-cuc', microscopes: '/kinh-hien-vi' } as Record<string, string>)[parentSlug] || '/san-pham'
}

function subcategoryPageUrl(parentSlug: string, childSlug: string, categoryParentSlug?: string) {
  if (!childSlug) return categoryPageUrl(parentSlug)
  if (parentSlug === 'equipment') return `/giai-phau-benh/${encodeURIComponent(childSlug)}`
  if (parentSlug === 'forensic-science') return `/giam-dinh-hinh-su/${childSlug}`
  if (parentSlug === 'microscopes' && categoryParentSlug) return `/kinh-hien-vi/${encodeURIComponent(categoryParentSlug)}/${encodeURIComponent(childSlug)}`
  return `${categoryPageUrl(parentSlug)}/${childSlug}`
}

const homepageProducts: Product[] = [
  {
    id: 'vitrostainer-42',
    title: 'Máy nhuộm hóa mô miễn dịch tự động (công suất 42 slide)',
    sku: 'VitroStainer 42',
    brand: 'Vitro S.A',
    imageUrl: '/assetsFull/VT42.gif',
  },
  {
    id: 'uc-600',
    title: 'Máy in cassette tự động (600 cassette)',
    sku: 'UC-600',
    brand: 'Citotest',
    imageUrl: '/assetsFull/UC600.webp',
  },
  {
    id: 'us-100',
    title: 'Máy in lam kính tự động (100 lam kính)',
    sku: 'US-100',
    brand: 'Citotest',
    imageUrl: '/assetsFull/US100.webp',
  },
  {
    id: 'vx504',
    title: 'Máy quét tiêu bản tự động (200 slide/giờ)',
    sku: 'VX504',
    brand: 'Huron',
    imageUrl: '/assetsFull/VX504.webp',
  },
  {
    id: 'ht540',
    title: 'Máy quét tiêu bản tự động (360 slide/giờ)',
    sku: 'HT540',
    brand: 'Huron',
    imageUrl: '/assetsFull/HT540.webp',
  },
].map((product) => ({
  ...product,
  parentCategorySlug: 'equipment',
  status: 'active',
  featured: true,
  createdAt: 0,
  updatedAt: 0,
}))

function galleryImages(product: Product | undefined): string[] {
  if (!product) return []
  const urls = [product.imageUrl, ...(product.imageUrls ?? [])]
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
  return Array.from(new Set(urls))
}

function youtubeEmbedUrl(url?: string) {
  const raw = url?.trim()
  if (!raw) return ''
  try {
    const parsed = new URL(raw)
    const host = parsed.hostname.replace(/^www\./, '')
    const videoId =
      host === 'youtu.be'
        ? parsed.pathname.slice(1)
        : parsed.searchParams.get('v') || parsed.pathname.match(/\/embed\/([^/]+)/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
  } catch {
    return ''
  }
}

async function productsInGroup(kind: ProductKind): Promise<Product[]> {
  if (kind === 'microscope') {
    return (await apiGetMicroscopes()).map((item) => ({ ...item, title: item.name, type: kind, parentCategorySlug: 'microscopes' }))
  }
  if (kind === 'forensic') {
    return (await apiGetForensicProducts()).map((item) => ({ ...item, title: item.name, type: kind, parentCategorySlug: 'forensic-science' }))
  }
  if (kind === 'picc') {
    return (await apiGetPiccProducts()).map((item) => ({ ...item, title: item.name, type: kind, parentCategorySlug: 'intensive-care' }))
  }
  return (await apiGetProducts()).map((item) => ({ ...normalizeProductCategoryFields(item), type: kind }))
}

export function ProductDetailPage() {
  const [search] = useSearchParams()
  const { slug } = useParams()
  const id = useMemo(() => search.get('id'), [search])
  const [catalog, setCatalog] = useState<Product[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [selectedImage, setSelectedImage] = useState<{ productId: string; url: string } | null>(null)
  const [resolvedKey, setResolvedKey] = useState<string | null>(null)
  const [tabSelection, setTabSelection] = useState<{ key: string; tab: 'description' | 'specs' }>({ key: '', tab: 'description' })
  const [quoteFor, setQuoteFor] = useState<string | null>(null)
  const [installationPreview, setInstallationPreview] = useState<{ productId: string; index: number } | null>(null)
  const requestKey = slug ? `slug:${slug}` : `id:${id || ''}`
  const loading = resolvedKey !== requestKey
  const activeTab = tabSelection.key === requestKey ? tabSelection.tab : 'description'
  const quoteOpen = quoteFor === requestKey

  useEffect(() => {
    let alive = true
    if (slug) {
      Promise.all([fetch(apiUrl(`/api/public/products/${encodeURIComponent(slug)}`), { credentials: 'include' }), apiGetCategories()])
        .then(async ([response, categoryList]) => {
          if (!response.ok) throw new Error('Not found')
          const item = await response.json() as Product & { name: string }
          const current = { ...item, title: item.name }
          const relatedCatalog = await productsInGroup(current.type || 'product').catch(() => [] as Product[])
          return { current, categoryList, relatedCatalog }
        })
        .then(({ current, categoryList, relatedCatalog }) => {
          if (!alive) return
          setCatalog([current, ...relatedCatalog.filter((item) => item.id !== current.id)])
          setCategories(categoryList)
        })
        .catch(() => alive && (setCatalog([]), setCategories([])))
        .finally(() => alive && setResolvedKey(requestKey))
      return () => { alive = false }
    }
    Promise.all([apiGetProducts(), apiGetCategories()])
      .then(([products, categoryList]) => {
        if (!alive) return
        setCatalog(products.map(normalizeProductCategoryFields))
        setCategories(categoryList)
      })
      .catch(() => {
        if (!alive) return
        setCatalog([])
        setCategories([])
      })
      .finally(() => {
        if (alive) setResolvedKey(requestKey)
      })
    return () => {
      alive = false
    }
  }, [slug, id, requestKey])

  const product = useMemo(
    () => slug ? catalog.find((item) => item.slug === slug) : (id ? catalog.find((item) => item.id === id) ?? homepageProducts.find((item) => item.id === id) : undefined),
    [catalog, id, slug],
  )
  const images = useMemo(() => galleryImages(product), [product])
  const mainImage = (selectedImage?.productId === product?.id ? selectedImage?.url : '') || images[0] || productMainImageUrl(product) || ''
  const parentSlug = product ? getProductParentCategorySlug(product) : ''
  const childSlug = product ? getProductChildCategorySlug(product) : ''
  const childLabel = product ? getChildCategoryLabel(categories, parentSlug, childSlug) : ''
  const nestedParent = parentSlug === 'intensive-care' ? findChildCategoryParent(categories, parentSlug, childSlug) : undefined
  const youtube = youtubeEmbedUrl(product?.youtubeUrl)
  const installationPhotos = normalizeInstallationPhotos(product?.installationPhotos)
  const highlights = normalizeProductHighlights(product?.highlights)
  const highlightIcons = [FiDatabase, FiDroplet, FiRadio, FiMonitor]
  const activeInstallationPhoto = installationPreview && installationPreview.productId === product?.id ? installationPhotos[installationPreview.index] : undefined
  const previewOpen = Boolean(activeInstallationPhoto)
  useEffect(() => {
    if (!previewOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setInstallationPreview(null)
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        const direction = event.key === 'ArrowLeft' ? -1 : 1
        setInstallationPreview((current) => current ? { ...current, index: (current.index + direction + installationPhotos.length) % installationPhotos.length } : current)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [previewOpen, installationPhotos.length])
  const breadcrumbs = useMemo<BreadcrumbItem[]>(() => {
    if (!product) return []
    const parentLabel = categories.find((item) => item.slug === parentSlug)?.label || product.parentCategoryLabel || (parentSlug === 'microscopes' ? 'Kính hiển vi' : 'Sản phẩm')
    const parentUrl = categoryPageUrl(parentSlug)
    const resolvedChildLabel = childLabel || product.categoryLabel || ''
    return [
      { label: 'Trang chủ', to: '/' },
      { label: parentLabel, to: parentUrl },
      ...(parentSlug === 'microscopes' && product.categoryParentSlug && product.categoryParentLabel
        ? [{ label: product.categoryParentLabel, to: `/kinh-hien-vi/${encodeURIComponent(product.categoryParentSlug)}` }]
        : []),
      ...(nestedParent ? [{ label: nestedParent.label, to: `/hoi-suc-tich-cuc/${encodeURIComponent(nestedParent.slug)}` }] : []),
      ...(resolvedChildLabel && resolvedChildLabel.trim().localeCompare(product.title.trim(), 'vi', { sensitivity: 'base' }) !== 0
        ? [{ label: resolvedChildLabel, to: subcategoryPageUrl(parentSlug, childSlug, product.categoryParentSlug) }]
        : []),
      { label: product.title },
    ]
  }, [product, categories, parentSlug, childSlug, childLabel, nestedParent])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return catalog
      .filter((item) => item.id !== product.id && (item.status ?? 'active') === 'active')
      .filter((item) => getProductParentCategorySlug(item) === parentSlug)
      .sort((a, b) => Number(getProductChildCategorySlug(b) === childSlug) - Number(getProductChildCategorySlug(a) === childSlug))
      .slice(0, 5)
  }, [catalog, parentSlug, childSlug, product])

  // The server redirects full page requests. Client-side visits to old links
  // need the same redirect because React Router does not request the server.
  const legacyProduct = !slug && id ? catalog.find((item) => item.id === id) : undefined
  if (legacyProduct) return <Navigate to={productUrl(legacyProduct)} replace />

  return (
    <div className={styles.page}>
      {product ? <SeoHead
        title={productSeoTitle(product.title, product.seoTitle)}
        description={productSeoDescription(product.title, product.description || product.shortDescription, product.seoDescription)}
        canonical={`/san-pham/${product.slug || slug || ''}`}
        image={product.imageUrl}
        jsonLd={{
          '@context': 'https://schema.org', '@graph': [
            { '@type': 'Product', name: product.title, description: productSeoDescription(product.title, product.description || product.shortDescription, product.seoDescription), url: `${window.location.origin}/san-pham/${product.slug || slug}`, ...(mainImage ? { image: new URL(mainImage, window.location.origin).href } : {}), ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand } } : {}), ...(product.sku ? { sku: product.sku } : {}) },
            { '@type': 'BreadcrumbList', itemListElement: breadcrumbs.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.label, item: `${window.location.origin}${item.to || `/san-pham/${product.slug || slug}`}` })) },
          ],
        }}
      /> : null}

      <main className={styles.container}>
        {breadcrumbs.length ? <Breadcrumb items={breadcrumbs} /> : null}
        {loading ? (
          <div className={styles.emptyState}>Đang tải sản phẩm...</div>
        ) : !product ? (
          <div className={styles.emptyState}>
            Không tìm thấy sản phẩm. <Link to="/san-pham">Quay lại danh sách sản phẩm</Link>
          </div>
        ) : (
          <>
            <div className={styles.layout}>
              <div className={styles.mainColumn}>
                <section className={styles.productHero}>
                  <div className={styles.gallery}>
                    <div className={styles.imageFrame}>
                      {mainImage ? <img src={mainImage} alt={product.title} /> : <div className={styles.imagePlaceholder} />}
                    </div>
                    {images.length > 0 ? (
                      <div className={styles.thumbs}>
                        {images.slice(0, 4).map((src) => (
                          <button
                            className={`${styles.thumb} ${src === mainImage ? styles.thumbActive : ''}`}
                            key={src}
                            type="button"
                            onClick={() => setSelectedImage({ productId: product.id, url: src })}
                          >
                            <img src={src} alt="" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className={styles.shareRow}>
                      <span>Share to:</span>
                      <Link to="/lien-he" aria-label="Liên hệ tư vấn">↗</Link>
                    </div>
                  </div>

                  <div className={styles.summary}>
                    <h1>{product.title}</h1>
                    {product.brand || product.origin ? <div className={styles.brandOrigin}>
                      {[product.brand, product.origin].filter(Boolean).join(' | ')}
                    </div> : null}
                    {product.shortDescription ? <p className={styles.short}>{product.shortDescription}</p> : null}
                    {highlights.length > 0 ? <div className={styles.highlights} aria-label="Điểm nổi bật của sản phẩm">
                      {highlights.map((highlight, index) => {
                        const Icon = highlightIcons[index]
                        return <div className={styles.highlightCard} key={`${highlight}-${index}`}>
                          <Icon aria-hidden="true" />
                          <span>{highlight}</span>
                        </div>
                      })}
                    </div> : null}
                    <div className={styles.actions}>
                      <button className={styles.primaryButton} type="button" onClick={() => setQuoteFor(requestKey)}>Yêu cầu báo giá <FiArrowRight aria-hidden="true" /></button>
                      {product.pdfUrl ? (
                        <a className={styles.secondaryButton} href={product.pdfUrl} target="_blank" rel="noreferrer">
                          <FiDownload aria-hidden="true" /> Tải tài liệu kỹ thuật
                        </a>
                      ) : <Link className={styles.secondaryButton} to="/lien-he"><FiFileText aria-hidden="true" /> Yêu cầu tài liệu</Link>}
                    </div>
                  </div>
                </section>

                <section className={styles.tabsPanel}>
                  <div className={styles.tabs} role="tablist" aria-label="Thông tin sản phẩm">
                    <button className={`${styles.tab} ${activeTab === 'description' ? styles.tabActive : ''}`} type="button" role="tab" id="product-description-tab" aria-selected={activeTab === 'description'} aria-controls="product-description-panel" onClick={() => setTabSelection({ key: requestKey, tab: 'description' })}>Mô tả sản phẩm</button>
                    <button className={`${styles.tab} ${activeTab === 'specs' ? styles.tabActive : ''}`} type="button" role="tab" id="product-specs-tab" aria-selected={activeTab === 'specs'} aria-controls="product-specs-panel" onClick={() => setTabSelection({ key: requestKey, tab: 'specs' })}>Thông số kỹ thuật</button>
                  </div>
                  <div className={styles.tabBody} role="tabpanel" id="product-description-panel" aria-labelledby="product-description-tab" hidden={activeTab !== 'description'}>
                    <div className={styles.richText}>{product.description || product.shortDescription || 'Chưa có mô tả sản phẩm.'}</div>
                  </div>
                  <div className={styles.tabBody} role="tabpanel" id="product-specs-panel" aria-labelledby="product-specs-tab" hidden={activeTab !== 'specs'}>
                    {product.specs?.trim() ? <pre className={styles.specs}>{product.specs}</pre> : <p className={styles.noSpecs}>Sản phẩm này chưa có thông số kỹ thuật được công bố.</p>}
                  </div>
                </section>

                {installationPhotos.length > 0 ? <section className={styles.installationSection} aria-labelledby="installation-photos-title">
                  <div className={styles.installationHeading}>
                    <div className={styles.installationHeadingCopy}>
                      <FiImage aria-hidden="true" />
                      <div>
                        <h2 id="installation-photos-title">HÌNH ẢNH LẮP ĐẶT THỰC TẾ</h2>
                        <p>Thiết bị Ecolink triển khai tại các phòng xét nghiệm và cơ sở y tế</p>
                      </div>
                    </div>
                    <button className={styles.viewAllPhotos} type="button" onClick={() => setInstallationPreview({ productId: product.id, index: 0 })}>
                      Xem tất cả hình ảnh <FiArrowRight aria-hidden="true" />
                    </button>
                  </div>
                  <div className={`${styles.installationGrid} ${installationPhotos.length >= 4 ? styles.installationGridFeatured : installationPhotos.length === 3 ? styles.installationGridTriplet : installationPhotos.length === 2 ? styles.installationGridPair : styles.installationGridSingle}`}>
                    {installationPhotos.slice(0, 4).map((photo, index) => <figure className={styles.installationCard} key={`${photo.url}-${index}`}>
                      <button type="button" onClick={() => setInstallationPreview({ productId: product.id, index })} aria-label={`Xem ảnh lắp đặt ${index + 1}`}>
                        <img src={photo.url} alt={photo.caption || `Hình ảnh lắp đặt thực tế ${index + 1}`} loading="lazy" />
                        <span className={styles.zoomIcon}><FiZoomIn aria-hidden="true" /></span>
                        {photo.caption ? <span className={styles.photoCaption}>{photo.caption}</span> : null}
                      </button>
                    </figure>)}
                  </div>
                </section> : null}

                {youtube ? <section className={styles.videoSection} aria-labelledby="product-video-title">
                  <h2 id="product-video-title"><FiPlayCircle aria-hidden="true" /> VIDEO SẢN PHẨM</h2>
                  <div className={styles.videoLayout}>
                    <div className={styles.videoWrap}><iframe src={youtube} title={`Video ${product.title}`} loading="lazy" allowFullScreen /></div>
                    <div className={styles.videoCopy}>
                      <h3>{product.sku || product.model || product.title} – {product.title}</h3>
                      <p>{product.shortDescription || product.description || 'Tìm hiểu thêm về sản phẩm qua video.'}</p>
                      <a href={product.youtubeUrl} target="_blank" rel="noopener noreferrer">Xem video trên YouTube <FiArrowRight aria-hidden="true" /></a>
                    </div>
                  </div>
                </section> : null}
              </div>

              <section className={styles.relatedSection} aria-labelledby="related-products-title">
                <h2 id="related-products-title"><FiStar aria-hidden="true" /> SẢN PHẨM LIÊN QUAN</h2>
                {relatedProducts.length > 0 ? (
                  <div className={styles.relatedList}>
                    {relatedProducts.map((item) => {
                      const src = productMainImageUrl(item)
                      return (
                        <Link
                          className={styles.relatedCard}
                          key={item.id}
                          to={productUrl(item)}
                        >
                          {src ? <img src={src} alt={item.title} loading="lazy" /> : <div className={styles.relatedPlaceholder} />}
                          <span>{item.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className={styles.relatedEmpty}>Chưa có sản phẩm liên quan.</div>
                )}
              </section>
            </div>

            <ProductFaqSection key={product.id} product={product} />
          </>
        )}
      </main>
      {activeInstallationPhoto ? createPortal(<div className={styles.lightbox} role="presentation" onClick={() => setInstallationPreview(null)}>
        <div className={styles.lightboxContent} role="dialog" aria-modal="true" aria-label="Hình ảnh lắp đặt thực tế" onClick={(event) => event.stopPropagation()}>
          <button className={styles.lightboxClose} type="button" aria-label="Đóng ảnh" autoFocus onClick={() => setInstallationPreview(null)}><FiX /></button>
          <img src={activeInstallationPhoto.url} alt={activeInstallationPhoto.caption || `Hình ảnh lắp đặt thực tế ${(installationPreview?.index ?? 0) + 1}`} />
          {activeInstallationPhoto.caption ? <p>{activeInstallationPhoto.caption}</p> : null}
          {installationPhotos.length > 1 ? <div className={styles.lightboxNav}>
            <button type="button" aria-label="Ảnh trước" onClick={() => setInstallationPreview((current) => current ? { ...current, index: (current.index - 1 + installationPhotos.length) % installationPhotos.length } : current)}><FiChevronLeft /></button>
            <span>{(installationPreview?.index ?? 0) + 1} / {installationPhotos.length}</span>
            <button type="button" aria-label="Ảnh tiếp theo" onClick={() => setInstallationPreview((current) => current ? { ...current, index: (current.index + 1) % installationPhotos.length } : current)}><FiChevronRight /></button>
          </div> : null}
        </div>
      </div>, document.body) : null}
      {product && quoteOpen ? <QuoteRequestModal product={product} onClose={() => setQuoteFor(null)} /> : null}
    </div>
  )
}

