# Chương trình Bug Bounty

> Cập nhật lần cuối: {{LAST_UPDATED}}


## Giới thiệu

Tại {{SITE_NAME}}, chúng tôi hợp tác với các nhà nghiên cứu bảo mật để tạo ra một môi trường internet an toàn hơn. Nếu bạn tìm thấy lỗ hổng bảo mật trong dịch vụ của chúng tôi, vui lòng liên hệ với chúng tôi ngay lập tức.

Chương trình này hiện đang hoạt động như một **Kênh tiết lộ lỗ hổng (Vulnerability Disclosure Channel)** tập trung vào việc báo cáo có trách nhiệm và hợp tác thay vì phần thưởng tiền mặt. Chúng tôi đánh giá cao và hợp tác minh bạch với các nhà nghiên cứu tiết lộ lỗ hổng một cách có đạo đức.

## Phạm vi (In-Scope)

Các nhà nghiên cứu chỉ được phép kiểm tra các tên miền và dịch vụ sau:

- Trang web chính thức của {{SITE_NAME}} và các tên miền phụ của nó
- Các ứng dụng di động chính thức của {{SITE_NAME}} (khi có sẵn)
- Các điểm cuối API do {{SITE_NAME}} trực tiếp vận hành

Các tên miền và dịch vụ của bên thứ ba (cổng thanh toán, công cụ phân tích, nhà cung cấp dịch vụ lưu trữ, v.v.) không được liệt kê ở trên không thuộc phạm vi của chương trình này. Nếu bạn không chắc chắn liệu một mục tiêu có nằm trong phạm vi hay không, vui lòng liên hệ với chúng tôi trước khi kiểm tra.

## Chính sách phần thưởng

Hiện tại, Chương trình Bug Bounty của {{SITE_NAME}} không cung cấp phần thưởng tiền mặt thường xuyên. Tuy nhiên, để thể hiện sự cảm kích của chúng tôi đối với những đóng góp đáng kể, chúng tôi thực hiện những điều sau:

- **Bảng vinh danh (Hall of Fame)**: Liệt kê tên của các nhà nghiên cứu đã báo cáo các lỗ hổng hợp lệ (khi hoạt động).
- **Công nhận công khai**: Cung cấp sự công nhận công khai hoặc thư giới thiệu với sự đồng ý của nhà nghiên cứu.
- **Ưu tiên trong tương lai**: Cung cấp cơ hội tham gia ưu tiên nếu chúng tôi chuyển sang chương trình trả phí trong tương lai.

Chúng tôi có thể giới thiệu hệ thống tiền thưởng (Bounty) trong tương lai tùy thuộc vào ngân sách và quy mô dịch vụ, và chúng tôi sẽ thông báo trên trang này nếu được triển khai.

## Tiêu chí mức độ nghiêm trọng

| Mức độ nghiêm trọng | CVSS | Ví dụ |
|---|---|---|
| Critical | 9.0-10.0 | Thực thi mã từ xa (RCE), rò rỉ toàn bộ DB, chiếm đoạt tài khoản hàng loạt |
| High | 7.0-8.9 | SQL Injection, Stored XSS, bỏ qua xác thực |
| Medium | 4.0-6.9 | Reflected XSS, CSRF hành động nhạy cảm, tiết lộ thông tin |
| Low | 0.1-3.9 | Thiếu tiêu đề bảo mật, tiết lộ phiên bản |

Mức độ nghiêm trọng có thể được điều chỉnh dựa trên tác động thực tế.

## Báo cáo lỗ hổng

### Kênh báo cáo

- **Email**: [{{EMAIL}}](mailto:{{EMAIL}})
- **Tiêu đề**: `[Security Report] Vulnerability Summary` (Tóm tắt lỗ hổng)
- **Ngôn ngữ**: Vui lòng viết bằng tiếng Hàn, tiếng Anh hoặc tiếng Việt.

### Định dạng báo cáo

Để giúp chúng tôi phân tích và tái tạo vấn đề, vui lòng bao gồm những điều sau:

1. Loại lỗ hổng và mô tả chi tiết.
2. Các bước cụ thể để tái tạo vấn đề (bao gồm tập lệnh hoặc dòng lệnh).
3. Các URL, điểm cuối API hoặc thành phần bị ảnh hưởng.
4. Mã Proof of Concept (PoC) hoặc ảnh chụp màn hình.

### Tiêu chuẩn chất lượng báo cáo

- Các báo cáo không thể tái tạo hoặc thiếu chi tiết đầy đủ có thể không được chấp nhận.
- Các báo cáo từ đầu ra của máy quét tự động không được chấp nhận.
- **Trùng lặp**: Các lỗ hổng trùng lặp chỉ được ghi nhận cho người báo cáo đầu tiên. (Dựa trên dấu thời gian nhận của máy chủ email)

### Quy trình

1. **Xác nhận tiếp nhận**: Chúng tôi sẽ gửi email xác nhận trong vòng 72 giờ sau khi bạn báo cáo.
2. **Phân tích & Lập kế hoạch**: Sau khi lỗ hổng được xác minh, chúng tôi sẽ đánh giá mức độ nghiêm trọng của nó và thông báo cho bạn về thời gian sửa chữa ước tính. Nếu chúng tôi không thể đáp ứng thời hạn, chúng tôi sẽ giải thích lý do và cung cấp lịch trình cập nhật.
3. **Giải quyết & Thông báo**: Chúng tôi sẽ thông báo cho bạn sau khi bản vá hoàn tất. Việc giải quyết có thể mất thời gian nếu cần thay đổi cấu trúc để đảm bảo tính ổn định của dịch vụ.
4. **Tiết lộ & Công nhận**: Sau khi giải quyết, chúng tôi sẽ quyết định về việc tiết lộ với sự tham vấn của nhà nghiên cứu. Các báo cáo hợp lệ sẽ được công nhận theo 'Chính sách phần thưởng' ở trên.
5. **Cấp CVE**: Đối với các lỗ hổng đáng kể, chúng tôi có thể yêu cầu cấp số CVE với sự đồng ý của người báo cáo.

### Chính sách tiết lộ công khai (Public Disclosure)

- Chúng tôi khuyên bạn nên tiết lộ sau khi bản vá hoàn tất và yêu cầu bạn chia sẻ chi tiết tiết lộ với chúng tôi trước.
- Nếu không có hành động thích hợp nào được thực hiện trong vòng **60 ngày** kể từ ngày báo cáo, người báo cáo có quyền tiết lộ chi tiết lỗ hổng theo cách đã thỏa thuận chung. (Tuy nhiên, chúng tôi có thể yêu cầu điều chỉnh lịch trình cho các vấn đề phức tạp.)
- Trong các trường hợp khẩn cấp khi quan sát thấy việc khai thác tích cực trong tự nhiên, chúng tôi có thể phối hợp với bạn để tiết lộ sớm hơn.

## Chính sách & Hướng dẫn kiểm tra

Vui lòng tuân thủ các hướng dẫn sau để kiểm tra lỗ hổng an toàn.

### Hoạt động được phép

- Kiểm tra lỗ hổng bằng tài khoản bạn sở hữu hoặc tài khoản thử nghiệm bạn đã tạo.
- **Xác minh tối thiểu**: Chỉ truy cập dữ liệu tối thiểu cần thiết để chứng minh lỗ hổng. Nếu bạn vô tình truy cập thông tin nhạy cảm của người khác, hãy dừng lại ngay lập tức và chỉ đưa thông tin đã che giấu vào báo cáo của bạn.

### Môi trường kiểm tra

- **Yêu cầu tài khoản kiểm tra**: Nếu bạn cần tài khoản kiểm tra, bạn có thể yêu cầu tại [{{EMAIL}}](mailto:{{EMAIL}}).
- **Quét tự động**: Cho phép quét nhẹ, nhưng quét tải cao tạo ra quá nhiều yêu cầu mỗi giây hoặc ảnh hưởng đến chất lượng dịch vụ cần có sự phối hợp trước.

### Hoạt động bị cấm (Ngoài phạm vi)

Các hoạt động sau đây bị nghiêm cấm và có thể không được bảo vệ hợp pháp nếu vi phạm:

- Chạy **quét tự động quá mức** (ở mức gây tải dịch vụ) mà không có sự phối hợp trước.
- Bất kỳ hoạt động nào cố ý làm cạn kiệt tài nguyên máy chủ (CPU, bộ nhớ, đĩa, băng thông mạng).
- Truy cập hoặc sửa đổi tài khoản, dữ liệu hoặc thông tin cá nhân của người dùng khác.
- Kỹ thuật xã hội (lừa đảo, v.v.) hoặc các cuộc tấn công bảo mật vật lý.

### Rõ ràng ngoài phạm vi (Out-of-Scope)

- Các lỗ hổng được tìm thấy trong các dịch vụ hoặc cơ sở hạ tầng của bên thứ ba.
- Bảo mật vật lý, hệ thống nhân sự, mạng nội bộ.
- Các lỗ hổng đã được công khai hoặc báo cáo trùng lặp.
- Các vấn đề chỉ do gửi thư rác hoặc email lừa đảo.

### Lỗ hổng rủi ro thấp (Không được chấp nhận)

Những điều sau đây bị loại khỏi chương trình vì chúng gây ra rủi ro bảo mật thấp hoặc là hành vi có chủ đích:

- CSRF có tác động thấp như CSRF đăng xuất
- Clickjacking trên các trang không có thông tin nhạy cảm
- Tiết lộ phiên bản đơn giản (banner grabbing)
- Thiếu cài đặt bảo mật mà không có đường dẫn khai thác đã được chứng minh (ví dụ: thiếu tiêu đề bảo mật không có tác động trực tiếp, chính sách gửi email chưa được định cấu hình, v.v.)
- Đã bật tự động điền của trình duyệt

Tuy nhiên, ngay cả các mục trên cũng có thể được đánh giá nếu chúng được chuỗi với các lỗ hổng khác để chứng minh một kịch bản tấn công thực tế.

### Bảo vệ nhà nghiên cứu (Safe Harbor)

Nếu bạn nghiên cứu và báo cáo các lỗ hổng một cách thiện chí và tuân thủ chính sách này, chúng tôi hứa những điều sau **trong phạm vi luật pháp hiện hành cho phép**:

1. Chúng tôi coi các hoạt động nghiên cứu của bạn là nghiên cứu bảo mật được ủy quyền và sẽ không thực hiện bất kỳ hành động pháp lý dân sự hoặc hình sự nào chống lại bạn.
2. Chúng tôi sẽ không tự nguyện báo cáo bạn với cơ quan thực thi pháp luật hoặc nộp đơn khiếu nại.
3. Nếu bên thứ ba bắt đầu hành động pháp lý liên quan đến các hoạt động nghiên cứu của bạn, chúng tôi sẽ hỗ trợ trong phạm vi hợp lý, chẳng hạn như cung cấp tài liệu chứng minh bạn là nhà nghiên cứu tuân thủ.

Tuy nhiên, Safe Harbor không áp dụng trong các trường hợp sau:
- Vi phạm rõ ràng các hoạt động bị cấm trong tài liệu này.
- Kiểm tra trái phép các hệ thống hoặc cơ sở hạ tầng của bên thứ ba nằm ngoài tầm kiểm soát của chúng tôi.

## Liên hệ

Nếu bạn có bất kỳ câu hỏi nào về Chương trình Bug Bounty của chúng tôi, vui lòng liên hệ với chúng tôi tại [{{EMAIL}}](mailto:{{EMAIL}}).
