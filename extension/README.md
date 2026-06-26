# Nihongo Review Sentinel

Chrome extension nhắc ôn từ vựng theo lịch lặp lại ngắt quãng của Nihongo Flashcard.

## Cài đặt local

1. Mở Chrome và vào `chrome://extensions`.
2. Bật `Developer mode`.
3. Chọn `Load unpacked`.
4. Chọn thư mục `extension` trong repo này.
5. Mở `Options` của extension và nhập:
   - Supabase URL
   - Supabase anon key
   - Web app URL

Không nhập service role key vào extension.

## Cách hoạt động

- Extension kiểm tra Supabase theo chu kỳ cấu hình.
- Nếu có từ đến hạn, extension hiện notification và có thể tự mở cửa sổ ôn.
- Phiên strict yêu cầu trả lời đúng các từ trong phiên để hoàn tất, nhưng vẫn có nút hoãn và thoát khẩn cấp.
