# Chính sách bảo mật

> Cập nhật lần cuối: {{LAST_UPDATED}}

## Công nghệ & Nguyên tắc bảo vệ dữ liệu

Dữ liệu người dùng được xử lý an toàn với các biện pháp bảo vệ được áp dụng ở nhiều lớp, bao gồm mã hóa khi nghỉ và TLS khi truyền.

### Bảo vệ mật khẩu
**Mật khẩu người dùng không bao giờ được lưu trữ dưới dạng văn bản thuần túy và được bảo vệ bằng các công nghệ băm mới nhất.**
- **Thuật toán**: {{ENC_ALGO_PASSWORD}}
- **Lý do**: {{ENC_REASON_PASSWORD}}
- Một Salt duy nhất được áp dụng cho mỗi mật khẩu để ngăn chặn các cuộc tấn công bảng cầu vồng.

### Mã hóa dữ liệu
**Thông tin nhạy cảm được mã hóa ngay trước khi lưu trữ, với việc quản lý khóa được tách biệt nghiêm ngặt.**
- **Thuật toán**: {{ENC_ALGO_DATA}}
- **Lý do**: {{ENC_REASON_DATA}}
- **Dẫn xuất khóa**: {{ENC_ALGO_KDF}} - {{ENC_REASON_KDF}}
- Chúng tôi sử dụng Mã hóa phong bì (Envelope Encryption) để bảo vệ Khóa mã hóa dữ liệu (DEK) bằng các Khóa mã hóa khóa (KEK) riêng biệt.

### Toàn vẹn dữ liệu
**Các hàm băm hiệu suất cao được sử dụng để xác minh rằng dữ liệu hệ thống quan trọng chưa bị giả mạo.**
- **Thuật toán**: {{ENC_ALGO_INTEGRITY}}
- **Lý do**: {{ENC_REASON_INTEGRITY}}

### Bảo mật vận chuyển
**Mọi giao tiếp giữa người dùng và máy chủ được bảo vệ bởi một đường hầm được mã hóa sử dụng các giao thức bảo mật mới nhất.**
- **Giao thức**: {{ENC_ALGO_TRANSPORT}}
- **Lý do**: {{ENC_REASON_TRANSPORT}}
- HTTPS được thực thi cho mọi giao tiếp và HSTS được áp dụng để ngăn chặn nghiêm ngặt các cuộc tấn công hạ cấp.

## Bảo mật hành chính & vật lý

Ngoài các biện pháp kỹ thuật, chúng tôi quản lý kỹ lưỡng bảo mật liên quan đến con người và quy trình.

- **Kiểm soát truy cập nhân viên**: Truy cập dữ liệu chỉ được cấp cho nhân viên thiết yếu dựa trên 'Nguyên tắc đặc quyền tối thiểu'. Mọi lịch sử truy cập đều được ghi lại và kiểm toán. Truy cập không có lý do chính đáng bị nghiêm cấm.
- **Bảo mật vật lý**: Toàn bộ cơ sở hạ tầng đám mây của bên thứ ba hoạt động tại các trung tâm dữ liệu đã đạt được các chứng nhận bảo mật vật lý như ISO 27001.

## Bảo mật tài khoản & phiên

- **Bảo vệ đăng nhập**: Chúng tôi áp dụng giới hạn nỗ lực đăng nhập và cơ chế trì hoãn để chặn các cuộc tấn công vũ phu tự động.
- **Quản lý phiên**: Các phiên tự động hết hạn sau một khoảng thời gian không hoạt động và thông báo được gửi cho các thay đổi tài khoản quan trọng.
- **Xác thực hai yếu tố**: Chúng tôi dự định giới thiệu chức năng 2FA trong tương lai.

## Bảo mật ứng dụng

Chúng tôi thiết kế với các phương pháp bảo mật tốt nhất như OWASP Top 10 ngay từ giai đoạn phát triển.

- **Xác thực đầu vào**: Các câu lệnh đã chuẩn bị và ORM được sử dụng cho các truy vấn cơ sở dữ liệu và đầu vào của người dùng được xác thực trên cả phía máy chủ và máy khách.
- **Phòng thủ tấn công**: Mã thông báo CSRF, thuộc tính cookie SameSite và CSP (Chính sách bảo mật nội dung) được áp dụng để giảm thiểu tấn công chiếm quyền điều khiển phiên và tấn công tiêm nhiễm tập lệnh.

## Bảo mật chuỗi cung ứng phần mềm

- **Quản lý phụ thuộc**: Các thư viện và gói bên ngoài chỉ được cài đặt từ các cơ quan đăng ký chính thức và các phiên bản đã xác minh được đảm bảo thông qua các tệp khóa.
- **Kiểm tra lỗ hổng**: Các báo cáo lỗ hổng được xem xét thường xuyên và các phụ thuộc có rủi ro cao được ưu tiên cập nhật.

## Lưu giữ & Xóa dữ liệu

- **Xóa tài khoản**: Khi có yêu cầu xóa tài khoản, dữ liệu liên quan sẽ bị hủy vĩnh viễn sau thời gian ân hạn 30 ngày (để phục hồi xóa do vô tình).
- **Dữ liệu sao lưu**: Các bản sao lưu để ổn định hệ thống được lưu giữ tối đa 90 ngày và sau đó được xóa an toàn. Do các hạn chế về kỹ thuật, việc xóa hoàn toàn khỏi các hệ thống sao lưu có thể cần thêm thời gian.
- **Dữ liệu nhật ký**: Nhật ký truy cập được lưu giữ trong 1 năm để phân tích mối đe dọa bảo mật dài hạn và xác định xu hướng.
- **Ngoại lệ lưu giữ hợp pháp**: Dữ liệu được pháp luật yêu cầu lưu giữ trong một khoảng thời gian cụ thể có thể được lưu trữ riêng biệt trong thời gian áp dụng.

## Phản ứng sự cố

Trong trường hợp xảy ra sự cố bảo mật, chúng tôi tuân theo các quy trình này để phản ứng nhanh và giảm thiểu thiệt hại:

1. **Phát hiện & Ngăn chặn (Ngay lập tức)**: Cô lập các mối đe dọa và ngăn chặn thiệt hại thêm.
2. **Phân tích tác động**: Đánh giá phạm vi và mức độ nghiêm trọng càng nhanh càng tốt, thường trong vòng vài giờ.
3. **Thông báo cho người dùng**: Đối với các sự cố ảnh hưởng đến người dùng (ví dụ: rò rỉ dữ liệu), thông báo cho người dùng càng nhanh càng tốt và tuân thủ các thời hạn pháp lý (ví dụ: 72 giờ).
4. **Tiết lộ minh bạch**: Xuất bản một báo cáo chi tiết (nguyên nhân, hành động, biện pháp phòng ngừa) sau khi sự cố được giải quyết.

## Kiểm toán bảo mật & Dịch vụ bên thứ ba

- **Kiểm toán bảo mật**: Chúng tôi hiện đang trong giai đoạn ổn định dịch vụ và thực hiện các đánh giá mã nội bộ và kiểm tra bảo mật thường xuyên. Chúng tôi dự định giới thiệu các cuộc kiểm toán bảo mật bên thứ ba thường xuyên khi dịch vụ mở rộng quy mô.
- **Cơ sở hạ tầng bên thứ ba**: Chúng tôi tuân thủ nguyên tắc không lưu trữ trực tiếp thông tin nhạy cảm không được mã hóa. Đối với các chức năng cốt lõi như thanh toán và xác thực, chúng tôi sử dụng các dịch vụ đáng tin cậy ({{THIRD_PARTY_PROVIDERS}}, v.v.) đã đạt được các chứng nhận bảo mật được quốc tế công nhận (SOC 2, ISO 27001) hoặc trải qua các đánh giá bảo mật tương đương thường xuyên.

## Khuyến nghị bảo mật cho người dùng

Bảo mật tài khoản là trách nhiệm chung.

- **Mật khẩu mạnh**: Sử dụng mật khẩu duy nhất và phức tạp không được sử dụng trên các trang web khác.
- **Cẩn thận với lừa đảo**: Cảnh giác với các tin nhắn tự nhận là email chính thức và kiểm tra địa chỉ trước khi nhấp vào liên kết.

## Liên hệ

Nếu bạn có bất kỳ câu hỏi nào liên quan đến Chính sách bảo mật của chúng tôi, vui lòng liên hệ với chúng tôi tại [{{EMAIL}}](mailto:{{EMAIL}}).

Đối với các báo cáo lỗ hổng và chính sách bảo vệ nhà nghiên cứu, vui lòng tham khảo trang [Chương trình Bug Bounty](/vi/bug-bounty) của chúng tôi.
