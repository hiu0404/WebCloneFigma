import assert from 'node:assert/strict'
import test from 'node:test'
import { isPublishedInstallationImage, toPublicInstallations } from './installation-public.js'

test('drafts, private references and hidden products never reach public output', () => {
  const base = {
    id: 'case-1', slug: 'case-1', title: 'Thiết bị A', summary: '',
    internalReference: 'Tên đơn vị bí mật', privacyReviewedAt: 123,
    productType: 'product', productId: 'product-1', imageUrls: ['/api/installation-images/photo.webp'],
    sortOrder: 1, updatedAt: 1,
  }
  const products = [{ type: 'product', id: 'product-1', name: 'Thiết bị A', status: 'active', canonicalPath: '/san-pham/thiet-bi-a' }]
  assert.deepEqual(toPublicInstallations([{ ...base, status: 'draft' }], products), [])
  const published = toPublicInstallations([{ ...base, status: 'published' }], products)
  assert.equal(published.length, 1)
  assert.equal(published[0].product.url, '/san-pham/thiet-bi-a')
  assert.equal(JSON.stringify(published).includes('Tên đơn vị bí mật'), false)
  assert.equal(JSON.stringify(published).includes('privacyReviewedAt'), false)
  assert.equal('publicRegion' in published[0], false)
  const withRegion = toPublicInstallations([{ ...base, status: 'published', publicRegion: 'central', imageCaptions: { [base.imageUrls[0]]: 'Thiết bị sau khi lắp đặt', unused: 'Không công khai' } }], products)[0]
  assert.equal(withRegion.publicRegion, 'central')
  assert.deepEqual(withRegion.imageCaptions, { [base.imageUrls[0]]: 'Thiết bị sau khi lắp đặt' })
  assert.equal(JSON.stringify(withRegion).includes('Không công khai'), false)
  assert.deepEqual(toPublicInstallations([{ ...base, status: 'published' }], [{ ...products[0], status: 'hidden' }]), [])
  assert.deepEqual(toPublicInstallations([{ ...base, status: 'published', imageUrls: [] }], products), [])
  assert.equal(isPublishedInstallationImage([{ ...base, status: 'draft' }], base.imageUrls[0]), false)
  assert.equal(isPublishedInstallationImage([{ ...base, status: 'published' }], base.imageUrls[0]), true)
  assert.equal(isPublishedInstallationImage([{ ...base, status: 'published', imageUrls: [] }], base.imageUrls[0]), false)
})
