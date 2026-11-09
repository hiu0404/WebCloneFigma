import assert from 'node:assert/strict'
import { test } from 'node:test'
import { legacyPublicRedirect } from './public-route-redirects.js'

test('old public category links keep their matching destination', () => {
  assert.equal(legacyPublicRedirect('/EquipmentPage'), '/giai-phau-benh')
  assert.equal(legacyPublicRedirect('/EquipmentPage/tissue-processing'), '/giai-phau-benh/tissue-processing')
  assert.equal(legacyPublicRedirect('/MicroscopePage/light-microscopes/upright'), '/kinh-hien-vi/light-microscopes/upright')
  assert.equal(legacyPublicRedirect('/ChemicalsPage/reagents'), '/hoa-chat/reagents')
  assert.equal(legacyPublicRedirect('/ContactPage'), '/lien-he')
  assert.equal(legacyPublicRedirect('/SupportService'), '/dich-vu-ho-tro')
  assert.equal(legacyPublicRedirect('/Trimmingtech'), '/giai-phau-benh/trimmingtech')
  assert.equal(legacyPublicRedirect('/GiamDinhADN'), '/giam-dinh-hinh-su/giam-dinh-adn')
  assert.equal(legacyPublicRedirect('/admin/products'), null)
  assert.equal(legacyPublicRedirect('/san-pham/example'), null)
})
