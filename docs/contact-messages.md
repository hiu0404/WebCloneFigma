# Yêu cầu liên hệ trong Admin

- Form `/ContactPage` gửi họ tên, số điện thoại, tiêu đề và nội dung đến `POST /api/contact-messages`.
- Server chỉ tạo `server/data/contact-messages.json` khi có yêu cầu hợp lệ đầu tiên. File này chứa thông tin liên hệ của khách hàng, nằm ngoài Git và cần được giữ lại/backup khi cập nhật website. Không có migration hay thay đổi nào đối với dữ liệu sản phẩm hoặc tài khoản admin.
- Admin đăng nhập có thể xem yêu cầu tại `/admin/contact-messages`, đánh dấu đã đọc và thấy số yêu cầu chưa đọc ở menu (tự cập nhật khoảng 30 giây). API danh sách, số chưa đọc và đánh dấu đã đọc đều yêu cầu phiên admin hiện có.
- Form có giới hạn độ dài, trường chống bot và giới hạn 5 yêu cầu hợp lệ mỗi IP trong 15 phút trên một tiến trình server. Nếu chạy nhiều tiến trình, cần giải pháp rate-limit dùng chung để chống spam mạnh hơn.
- Đây là thông báo **trong Admin**, chưa gửi email/SMS và không tự trả lời khách hàng.

Khi triển khai, cần cập nhật cả frontend build và các file server (`server/index.js`, `server/contact-messages.js`); chỉ chép `dist/` sẽ không tạo được API. Không ghi đè hoặc xóa `server/data/` trong quá trình triển khai. Sau triển khai, gửi một yêu cầu thử trên trang liên hệ, đăng nhập Admin kiểm tra badge và nội dung, rồi đánh dấu đã đọc.
