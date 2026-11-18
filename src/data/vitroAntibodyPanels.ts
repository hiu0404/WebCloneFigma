export const VITRO_ANTIBODY_SOURCE = 'https://vitro.bio/en/anatomical-pathology-reagent/anatomical-pathology-immunohistochemistry-reagents-antibodies/'
export const VITRO_ANTIBODY_DESCRIPTION = 'Tìm hiểu tám nhóm kháng thể hóa mô miễn dịch được Vitro giới thiệu, xem tài liệu nhà sản xuất và các sản phẩm hiện có tại Ecolink.'
export const vitroPanelUrl = (slug: string) => `/khang-the/khang-the-vitro/${slug}`

export const VITRO_ANTIBODY_PANELS = [
  {
    slug: 'benh-ly-than-kinh', title: 'Bệnh lý thần kinh', original: 'Neuropathology',
    description: 'Nhóm kháng thể cho bệnh lý hệ thần kinh trung ương và ngoại biên.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Neuropatologia.pdf',
  },
  {
    slug: 'benh-truyen-nhiem', title: 'Bệnh truyền nhiễm', original: 'Infectious Diseases',
    description: 'Nhóm kháng thể phục vụ khảo sát tác nhân nhiễm trùng trong mô.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Enfermedades-infecciosas.pdf',
  },
  {
    slug: 'benh-ly-mo-mem', title: 'Bệnh lý mô mềm', original: 'Soft Tissue Pathology',
    description: 'Nhóm dấu ấn cho việc phân loại và khảo sát tổn thương mô mềm.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Patologia-de-tejidos-blandos.pdf',
  },
  {
    slug: 'benh-ly-tuyen-yen', title: 'Bệnh lý tuyến yên', original: 'Pituitary Pathology',
    description: 'Nhóm kháng thể liên quan đến tổn thương tuyến yên và vùng yên.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-patologia-de-la-hipofisis.pdf',
  },
  {
    slug: 'benh-ly-mo-lympho', title: 'Bệnh lý mô lympho', original: 'Lymphoid Pathology',
    description: 'Nhóm dấu ấn cho khảo sát mô lympho và bệnh lý huyết học.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Patologia-del-tejido-linfatico.pdf',
  },
  {
    slug: 'benh-ly-tiet-nieu', title: 'Bệnh lý tiết niệu', original: 'Uropathology',
    description: 'Nhóm dấu ấn liên quan đến thận, tuyến tiền liệt và đường tiết niệu.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Uropatologia.pdf',
  },
  {
    slug: 'benh-ly-phoi-mang-phoi', title: 'Bệnh lý phổi và màng phổi', original: 'Pleuropulmonary Pathology',
    description: 'Nhóm kháng thể cho các tổn thương phổi, màng phổi và lồng ngực.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Patologia-pleuropulmonar.pdf',
  },
  {
    slug: 'benh-ly-tuyen-giap', title: 'Bệnh lý tuyến giáp', original: 'Thyroid Pathology',
    description: 'Nhóm kháng thể liên quan đến tổn thương và bệnh lý tuyến giáp.',
    pdf: 'https://vitro.bio/wp-content/uploads/2026/07/Panel-Patologia-tiroidea.pdf',
  },
]

