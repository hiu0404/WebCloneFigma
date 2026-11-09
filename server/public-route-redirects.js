const legacyPublicBases = {
  equipmentpage: '/giai-phau-benh', giamdinhkhoahocthuathinhsu: '/giam-dinh-hinh-su',
  microscopepage: '/kinh-hien-vi', chemicalspage: '/hoa-chat', antibodiespage: '/khang-the',
  picc: '/hoi-suc-tich-cuc', supportservice: '/dich-vu-ho-tro', contactpage: '/lien-he',
}

const legacyCategoryPages = {
  trimmingtech: '/giai-phau-benh/trimmingtech', tissueprocessing: '/giai-phau-benh/tissue-processing',
  scaning: '/giai-phau-benh/scaning', lasercassette: '/giai-phau-benh/laser-cassette',
  immunohistochemistry: '/giai-phau-benh/immunohistochemistry', dyeingmachine: '/giai-phau-benh/dyeing-machine',
  cuttingmachine: '/giai-phau-benh/cutting-machine', casting: '/giai-phau-benh/casting',
  dryingtable: '/giai-phau-benh/drying-table', tissuetension: '/giai-phau-benh/tissue-tension',
  laminatingmachine: '/giai-phau-benh/laminating-machine',
  giamdinhtruyenthongcohocsungdan: '/giam-dinh-hinh-su/giam-dinh-truyen-thong-co-hoc-sung-dan',
  giamdinhtailieuchuviettientem: '/giam-dinh-hinh-su/giam-dinh-tai-lieu-chu-viet-tien-tem',
  giamdinhsinhhoc: '/giam-dinh-hinh-su/giam-dinh-sinh-hoc', giamdinhadn: '/giam-dinh-hinh-su/giam-dinh-adn',
}

export function legacyPublicRedirect(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  const base = legacyPublicBases[segments[0]?.toLowerCase()]
  if (base) return `${base}${segments.length > 1 ? `/${segments.slice(1).join('/')}` : ''}`
  return segments.length === 1 ? legacyCategoryPages[segments[0]?.toLowerCase()] || null : null
}
