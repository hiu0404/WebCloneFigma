# Kết nối Google Analytics 4 cho Ecolink

1. GA4 Account **Ecolink**, Property **Ecolink Website** và Web stream `https://eco-link.vn` đã được tạo. Measurement ID của stream là `G-JF10P3GNXS` (không phải Property ID dạng số).
2. Bản build production của Ecolink đã dùng Measurement ID này theo mặc định. Chỉ đặt `VITE_GA_MEASUREMENT_ID=G-...` trong môi trường build nếu cần trỏ một bản triển khai khác sang stream khác. Vite đóng ID vào JavaScript khi chạy `npm run build`; chỉ thay biến môi trường trên server mà không build lại sẽ không có tác dụng. Bản chạy development không gửi sự kiện GA4.
3. Trong Web stream của GA4, vào **Enhanced measurement → Page views → Show advanced settings** và **tắt “Page changes based on browser history events”**. Code dùng `send_page_view: false` cho lượt xem khởi đầu; route change được gửi thủ công. Việc tắt history tracking là bắt buộc để tránh đếm trùng. Không gắn thêm Google tag/GTM khác với cùng Measurement ID nếu chưa kiểm tra cấu hình đếm trùng.
4. Build và triển khai bản build theo quy trình deploy của bạn. Mở trang chủ, vào một danh mục và một sản phẩm. Trong GA4, kiểm tra **Reports → Realtime**: mỗi lần chuyển trang public chỉ có một `page_view`, đúng URL. Có thể dùng DebugView nếu đã bật debug mode. `/admin` và `/admin/login` không được gửi `page_view` từ mã này.
5. Xem lượt truy cập tại **Reports → Engagement → Pages and screens** và số người dùng tại các báo cáo Acquisition/Realtime. GA4 không khôi phục được số lượt truy cập trước lúc cài tag.

Nếu ID override không có dạng `G-...`, mã sẽ không tải Google tag và không gửi dữ liệu. Không cần gửi mật khẩu Google cho người triển khai; chỉ Measurement ID là đủ để cấu hình code.

Tham khảo: https://support.google.com/analytics/answer/14183469 và https://developers.google.com/analytics/devguides/collection/ga4/views
