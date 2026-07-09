import { Header } from '../components/Header/Header'
import { FigmaImage } from '../components/FigmaImage'
import styles from './ContactPage.module.css'

function PhoneIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M19.3 7.5h7.2c1.2 0 2.2.9 2.4 2.1l1 6.3c.2 1.1-.4 2.2-1.4 2.7l-3.7 1.9c2.4 5.5 6.8 9.9 12.3 12.3l1.9-3.7c.5-1 1.6-1.6 2.7-1.4l6.3 1c1.2.2 2.1 1.2 2.1 2.4v7.2c0 1.4-1.1 2.5-2.5 2.5C29.8 42.1 17.9 30.2 16.8 10c0-1.4 1.1-2.5 2.5-2.5Z"
        fill="#187093"
      />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M10 18c0-2.2 1.8-4 4-4h32c2.2 0 4 1.8 4 4v24c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V18Zm4 0 16 12 16-12H14Zm32 24V22L30.9 33.6c-.5.4-1.2.4-1.7 0L14 22v20h32Z"
        fill="#187093"
      />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M14 48V12c0-1.1.9-2 2-2h20c1.1 0 2 .9 2 2v36h6V24c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v24h-6v-4H20v4H14Zm10-30h4v4h-4v-4Zm0 8h4v4h-4v-4Zm0 8h4v4h-4v-4Zm10-16h4v4h-4v-4Zm0 8h4v4h-4v-4Zm0 8h4v4h-4v-4Z"
        fill="#187093"
      />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden="true">
      <path
        d="M30 54s16-14.7 16-30c0-8.8-7.2-16-16-16S14 15.2 14 24c0 15.3 16 30 16 30Zm0-23a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z"
        fill="#187093"
      />
    </svg>
  )
}

const contactItems = [
  {
    icon: <PhoneIcon />,
    title: 'Số điện thoại',
    text: 'Tổng đài chăm sóc khách; tư vấn dịch vụ',
    linkText: '+84 812.119.668',
    href: 'tel:+84812119668',
  },
  {
    icon: <EmailIcon />,
    title: 'E - mail',
    text: 'Công ty cổ phần đầu tư và phát triển Ecolink',
    linkText: 'info.ecolinkvn@gmail.com',
    href: 'mailto:info.ecolinkvn@gmail.com',
  },
  {
    icon: <BuildingIcon />,
    title: 'Trụ sở Hà Nội',
    text: 'Số 67, Ngõ 281, Phố Đội Cấn, P. Liễu Giai, Q. Ba Đình, TP. Hà Nội',
    linkText: 'Xem trên Google Maps',
    href: '#',
  },
  {
    icon: <LocationIcon />,
    title: 'Chi nhánh HCM',
    text: 'Số 2, đường S3, P. Tây Thạnh, Q. Tân Phú, TP. Hồ Chí Minh',
    linkText: 'Xem trên Google Maps',
    href: '#',
  },
]

export function ContactPage() {
  return (
    <div className={styles.page}>
      <Header />

      <FigmaImage
        className={styles.hero}
        src="/assetsFull/testimonial.png"
        alt=""
        ariaHidden
        width={1920}
        height={461}
      />

      <div className={styles.heroTitle}>
        <div>Liên hệ</div>
        <div className={styles.heroTitleSmall}>Trang chủ / Liên hệ</div>
      </div>

      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          {contactItems.map((item) => (
            <article className={styles.infoCard} key={item.title}>
              <div className={styles.infoIcon}>{item.icon}</div>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <a href={item.href}>{item.linkText}</a>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.consultSection}>
        <div className={styles.consultHeader}>
          <h2>Yêu cầu tư vấn</h2>
          <p>Bạn hãy nhập thông tin và gửi tin nhắn cho chúng tôi để được tư vấn miễn phí</p>
        </div>

        <form className={styles.consultForm}>
          <div className={styles.inputRow}>
            <input className={styles.input} placeholder="Họ và tên" />
            <input className={styles.input} placeholder="Số điện thoại" />
            <input className={styles.input} placeholder="Tiêu đề" />
          </div>
          <textarea className={styles.textarea} placeholder="Nội dung cần tư vấn" />
          <button className={styles.submitBtn} type="submit">Gửi yêu cầu</button>
        </form>
      </section>

      <FigmaImage className={styles.map} src="/assetsFull/image.png" alt="" ariaHidden />
    </div>
  )
}
