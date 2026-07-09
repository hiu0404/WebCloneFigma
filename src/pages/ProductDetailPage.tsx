import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
  const navigate = useNavigate()
  const id = useMemo(() => search.get('id'), [search])
  const [catalog, setCatalog] = useState<Product[]>([])
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [selectedImage, setSelectedImage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
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
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const product = useMemo(() => (id ? catalog.find((item) => item.id === id) : undefined), [catalog, id])
  const images = useMemo(() => galleryImages(product), [product])
  const mainImage = selectedImage || images[0] || productMainImageUrl(product) || ''
  const parentSlug = product ? getProductParentCategorySlug(product) : ''
  const childSlug = product ? getProductChildCategorySlug(product) : ''
  const childLabel = product ? getChildCategoryLabel(categories, parentSlug, childSlug) : ''
  const youtube = youtubeEmbedUrl(product?.youtubeUrl)

  useEffect(() => {
    setSelectedImage('')
  }, [product?.id])

  const relatedProducts = useMemo(() => {
    if (!product) return []
    return catalog
      .filter((item) => item.id !== product.id)
      .filter((item) => getProductParentCategorySlug(item) === parentSlug)
      .slice(0, 4)
  }, [catalog, parentSlug, product])

  return (
    <div className={styles.page}>
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
        <div>Sáº£n pháº©m chi tiáº¿t</div>
        <div className={styles.heroTitleSmall}>Trang chá»§ / Sáº£n pháº©m chi tiáº¿t</div>
      </div>

      <main className={styles.container}>
        {loading ? (
          <div className={styles.emptyState}>Äang táº£i sáº£n pháº©m...</div>
        ) : !product ? (
          <div className={styles.emptyState}>
            KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m. <Link to="/san-pham">Quay láº¡i danh sÃ¡ch sáº£n pháº©m</Link>
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
                            onClick={() => setSelectedImage(src)}
                          >
                            <img src={src} alt="" />
                          </button>
                        ))}
                      </div>
                    ) : null}
                    <div className={styles.shareRow}>
                      <span>Share to:</span>
                      <Link to="/ContactPage" aria-label="LiÃªn há»‡ tÆ° váº¥n">â†—</Link>
                    </div>
                  </div>

                  <div className={styles.summary}>
                    <h1>{product.title}</h1>
                    {product.shortDescription ? <p className={styles.short}>{product.shortDescription}</p> : null}
                    <dl className={styles.metaGrid}>
                      {product.price ? <><dt>GiÃ¡</dt><dd>{product.price}</dd></> : null}
                      {product.sku ? <><dt>MÃ£ sáº£n pháº©m</dt><dd>{product.sku}</dd></> : null}
                      {product.brand ? <><dt>HÃ£ng sáº£n xuáº¥t</dt><dd>{product.brand}</dd></> : null}
                      {product.origin ? <><dt>Xuáº¥t xá»©</dt><dd>{product.origin}</dd></> : null}
                      {childSlug ? <><dt>Danh má»¥c</dt><dd>{childLabel}</dd></> : null}
                    </dl>
                    <div className={styles.actions}>
                      <Link className={styles.primaryButton} to="/ContactPage">LiÃªn há»‡ tÆ° váº¥n</Link>
                      {product.pdfUrl ? (
                        <a className={styles.secondaryButton} href={product.pdfUrl} target="_blank" rel="noreferrer">
                          Táº£i PDF
                        </a>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className={styles.tabsPanel}>
                  <div className={styles.tabs}>
                    <button type="button" className={styles.tabActive}>Product Description</button>
                    <span />
                  </div>
                  <div className={styles.tabBody}>
                    <div className={styles.richText}>{product.description || product.shortDescription || 'ChÆ°a cÃ³ mÃ´ táº£ sáº£n pháº©m.'}</div>
                    {product.specs ? (
                      <>
                        <h2>ThÃ´ng sá»‘ ká»¹ thuáº­t</h2>
                        <pre className={styles.specs}>{product.specs}</pre>
                      </>
                    ) : null}
                    {youtube ? (
                      <>
                        <h2>Video sáº£n pháº©m</h2>
                        <div className={styles.videoWrap}>
                          <iframe src={youtube} title={product.title} allowFullScreen />
                        </div>
                      </>
                    ) : null}
                  </div>
                </section>
              </div>

              <aside className={styles.relatedSidebar}>
                <h2>RELATED PRODUCTS</h2>
                {relatedProducts.length > 0 ? (
                  <div className={styles.relatedList}>
                    {relatedProducts.map((item) => {
                      const src = productMainImageUrl(item)
                      return (
                        <button
                          className={styles.relatedCard}
                          key={item.id}
                          type="button"
                          onClick={() => navigate(`/san-pham-chi-tiet?id=${encodeURIComponent(item.id)}`)}
                        >
                          {src ? <img src={src} alt="" /> : <div className={styles.relatedPlaceholder} />}
                          <span>{item.title}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className={styles.relatedEmpty}>ChÆ°a cÃ³ sáº£n pháº©m liÃªn quan.</div>
                )}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

