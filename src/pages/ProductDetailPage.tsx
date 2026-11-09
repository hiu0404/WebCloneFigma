import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import styles from './ProductDetailPage.module.css'
import type { Product } from '../lib/adminStore'
import { apiGetProducts } from '../services/productService'
import { apiGetCategories } from '../services/categoryService'
import { productMainImageUrl } from '../lib/productImages'
import {
  getChildCategoryLabel,
  getProductChildCategorySlug,
  getProductParentCategorySlug,
  normalizeProductCategoryFields,
  type AdminCategory,
} from '../data/categories'
import { SeoHead } from '../components/SeoHead'
import { productSeoDescription, productSeoTitle } from '../lib/seo'
import { apiUrl } from '../lib/apiClient'
import { Breadcrumb, type BreadcrumbItem } from '../components/Breadcrumb'
import { productUrl } from '../lib/seo'
import { apiGetInstallations } from '../services/installationService'
import { installationUrl, type PublicInstallation } from '../data/installations'
import { QuoteRequestModal } from '../components/QuoteRequestModal'

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

export function ProductDetailPage() {
  const [search] = useSearchParams()
  const { slug } = useParams()
  const id = useMemo(() => search.get('id'), [search])
  const [catalog, setCatalog] = useState<Product[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [selectedImage, setSelectedImage] = useState<{ productId: string; url: string } | null>(null)
  const [installationResult, setInstallationResult] = useState<{ key: string; items: PublicInstallation[] }>({ key: '', items: [] })
  const [resolvedKey, setResolvedKey] = useState<string | null>(null)
  const [tabSelection, setTabSelection] = useState<{ key: string; tab: 'description' | 'specs' }>({ key: '', tab: 'description' })
  const [quoteFor, setQuoteFor] = useState<string | null>(null)
  const requestKey = slug ? `slug:${slug}` : `id:${id || ''}`
  const loading = resolvedKey !== requestKey
  const activeTab = tabSelection.key === requestKey ? tabSelection.tab : 'description'
  const quoteOpen = quoteFor === requestKey

  useEffect(() => {
    let alive = true
    if (slug) {
      Promise.all([fetch(apiUrl(`/api/public/products/${encodeURIComponent(slug)}`), { credentials: 'include' }), apiGetCategories(), apiGetProducts()])
        .then(async ([response, categoryList, productList]) => response.ok ? [await response.json(), categoryList, productList] : Promise.reject(new Error('Not found')))
        .then(([item, categoryList, productList]) => {
          if (!alive) return
          const current = { ...item, title: item.name } as Product
          setCatalog([current, ...(productList as Product[]).filter((product: Product) => product.id !== current.id).map(normalizeProductCategoryFields)])
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
  const installationKey = product ? `${product.type || 'product'}:${product.id}` : ''
  const installationKind = product?.type || 'product'
  const installationProductId = product?.id || ''
  const productInstallations = installationResult.key === installationKey ? installationResult.items : []

  useEffect(() => {
    if (!installationProductId) return
    let active = true
    const key = `${installationKind}:${installationProductId}`
    apiGetInstallations(installationKind, installationProductId)
      .then((items) => { if (active) setInstallationResult({ key, items }) })
      .catch(() => { if (active) setInstallationResult({ key, items: [] }) })
    return () => { active = false }
  }, [installationKind, installationProductId])
  const images = useMemo(() => galleryImages(product), [product])
  const mainImage = (selectedImage?.productId === product?.id ? selectedImage?.url : '') || images[0] || productMainImageUrl(product) || ''
  const parentSlug = product ? getProductParentCategorySlug(product) : ''
  const childSlug = product ? getProductChildCategorySlug(product) : ''
  const childLabel = product ? getChildCategoryLabel(categories, parentSlug, childSlug) : ''
  const youtube = youtubeEmbedUrl(product?.youtubeUrl)
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
      ...(resolvedChildLabel ? [{ label: resolvedChildLabel, to: subcategoryPageUrl(parentSlug, childSlug, product.categoryParentSlug) }] : []),
      { label: product.title },
    ]
  }, [product, categories, parentSlug, childSlug, childLabel])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return catalog
      .filter((item) => item.id !== product.id)
      .filter((item) => getProductParentCategorySlug(item) === parentSlug)
      .filter((item) => !childSlug || getProductChildCategorySlug(item) === childSlug)
      .slice(0, 4)
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
      <Header />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/page-banner-dna.png"
        alt=""
        ariaHidden
        width={1920}
        height={461}
      />
      <div className={styles.heroTitle}>
        <div>Sản phẩm chi tiết</div>
      </div>

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
                    {product.shortDescription ? <p className={styles.short}>{product.shortDescription}</p> : null}
                    <dl className={styles.metaGrid}>
                      {product.price ? <><dt>Giá</dt><dd>{product.price}</dd></> : null}
                      {product.sku ? <><dt>Mã sản phẩm</dt><dd>{product.sku}</dd></> : null}
                      {product.model ? <><dt>Model</dt><dd>{product.model}</dd></> : null}
                      {product.brand ? <><dt>Hãng sản xuất</dt><dd>{product.brand}</dd></> : null}
                      {product.origin ? <><dt>Xuất xứ</dt><dd>{product.origin}</dd></> : null}
                      {childSlug ? <><dt>Danh mục</dt><dd>{childLabel}</dd></> : null}
                    </dl>
                    <div className={styles.actions}>
                      <button className={styles.primaryButton} type="button" onClick={() => setQuoteFor(requestKey)}>Yêu cầu báo giá</button>
                      <Link className={styles.primaryButton} to="/lien-he">Liên hệ tư vấn</Link>
                      {product.pdfUrl ? (
                        <a className={styles.secondaryButton} href={product.pdfUrl} target="_blank" rel="noreferrer">
                          Tải PDF
                        </a>
                      ) : null}
                    </div>
                  </div>
                </section>

                {productInstallations.length > 0 && <section className={styles.installationsSection}>
                  <h2>Hình ảnh lắp đặt thực tế</h2>
                  <div className={styles.installationsGrid}>
                    {productInstallations.slice(0, 3).map((item) => <Link to={installationUrl(item)} key={item.id}>
                      <img src={item.imageUrls[0]} alt={`Hình ảnh lắp đặt ${product.title}`} loading="lazy" />
                      <span>{item.title}</span>
                    </Link>)}
                  </div>
                </section>}

                <section className={styles.tabsPanel}>
                  <div className={styles.tabs} role="tablist" aria-label="Thông tin sản phẩm">
                    <button className={`${styles.tab} ${activeTab === 'description' ? styles.tabActive : ''}`} type="button" role="tab" id="product-description-tab" aria-selected={activeTab === 'description'} aria-controls="product-description-panel" onClick={() => setTabSelection({ key: requestKey, tab: 'description' })}>Mô tả sản phẩm</button>
                    <button className={`${styles.tab} ${activeTab === 'specs' ? styles.tabActive : ''}`} type="button" role="tab" id="product-specs-tab" aria-selected={activeTab === 'specs'} aria-controls="product-specs-panel" onClick={() => setTabSelection({ key: requestKey, tab: 'specs' })}>Thông số kỹ thuật</button>
                  </div>
                  <div className={styles.tabBody} role="tabpanel" id="product-description-panel" aria-labelledby="product-description-tab" hidden={activeTab !== 'description'}>
                      <div className={styles.richText}>{product.description || product.shortDescription || 'Chưa có mô tả sản phẩm.'}</div>
                      {youtube ? (
                      <>
                        <h2>Video sản phẩm</h2>
                        <div className={styles.videoWrap}>
                          <iframe src={youtube} title={product.title} allowFullScreen />
                        </div>
                      </>
                      ) : null}
                  </div>
                  <div className={styles.tabBody} role="tabpanel" id="product-specs-panel" aria-labelledby="product-specs-tab" hidden={activeTab !== 'specs'}>
                    {product.specs?.trim() ? <pre className={styles.specs}>{product.specs}</pre> : <p className={styles.noSpecs}>Sản phẩm này chưa có thông số kỹ thuật được công bố.</p>}
                  </div>
                </section>
              </div>

              <aside className={styles.relatedSidebar}>
                <h2>Sản phẩm liên quan</h2>
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
              </aside>
            </div>
          </>
        )}
      </main>
      {product && quoteOpen ? <QuoteRequestModal product={product} onClose={() => setQuoteFor(null)} /> : null}
    </div>
  )
}

