# Nihongo Flashcard

Ứng dụng flashcard tiếng Nhật tập trung vào phản xạ, ghi nhớ dài hạn và ôn tập thông minh. App dùng Vite ở frontend, Supabase để đồng bộ dữ liệu, Vercel để deploy, kèm bản Tauri cho Windows và Chrome extension nhắc ôn từ đến hạn.

Live app: [web-fcard-japan.vercel.app](https://web-fcard-japan.vercel.app/)

## Điểm Nổi Bật

- Quản lý nhiều dự án từ vựng theo nhóm bài học.
- Kiểm tra từ theo nhiều chiều: Nhật -> nghĩa, romaji -> nghĩa, nghĩa -> romaji.
- Chọn từ kiểm tra thủ công bằng popup, hoặc chọn nhanh từ yếu, từ đến hạn, từ quá hạn, từ lâu chưa học.
- Lưu tiến độ học gồm số lần đúng/sai, thời gian phản xạ, lần kiểm tra gần nhất, trạng thái trả lời gần nhất, streak, mastery score và lịch ôn.
- Lịch ôn thông minh dựa trên spaced repetition, có `next_review_at`, khoảng ôn, stage, lapse, ease factor, memory stability và memory difficulty.
- Trang **Lịch ôn** riêng với đường cong lãng quên, hàng đợi ưu tiên, biểu đồ khả năng còn nhớ và nút kiểm tra nhanh.
- Trang **Từ yếu** có scoring 0-100, nhóm `Rất yếu / Yếu / Cần theo dõi / Ổn`, lý do xếp nhóm và popup phân tích chi tiết.
- Từ điển offline/online để tra nhanh và thêm từ vào dự án.
- Luyện bảng chữ cái Kana.
- Chrome extension nhắc ôn từ đến hạn từ Supabase.
- Desktop app Windows giữ nguyên giao diện web, chạy nền dưới system tray, hỗ trợ thông báo native và autostart.

## Logic Từ Yếu

Từ yếu không phải là một bảng riêng. App tính động từ dữ liệu học của từng từ.

Điểm yếu hiện tại là `Weakness Score` từ `0-100`:

| Tín hiệu | Điểm |
|---|---:|
| Sai gần nhất | +50 |
| Bấm xem đáp án | +50 |
| Đúng sau gợi ý | +35 |
| Tỷ lệ sai cao | +0 -> +25 |
| Phản xạ chậm gần đây | +0 -> +20 |
| Mastery thấp | +0 -> +25 |
| Quá hạn ôn theo lịch | +0 -> +20 |
| Lần trước đúng nhưng lần sau sai rất nhanh | +20 -> +45 |
| Đúng nhanh liên tiếp 2 lần | -25 |
| Đúng nhanh liên tiếp 3 lần trở lên | -40 |

Phần dữ liệu gần đây dùng trọng số `60% gần đây + 40% tổng thể`, để app phản ứng nhanh hơn khi người học vừa quên lại hoặc vừa tiến bộ.

Các nhóm:

| Điểm | Nhóm |
|---:|---|
| 80-100 | Rất yếu |
| 60-79 | Yếu |
| 30-59 | Cần theo dõi |
| 0-29 | Ổn |

## Logic Ôn Thông Minh

Sau mỗi lần kiểm tra, app cập nhật:

- `last_tested_at`: lần kiểm tra gần nhất.
- `last_time_spent_sec`: thời gian phản xạ gần nhất.
- `history_times`: lịch sử thời gian phản xạ.
- `answer_history`: lịch sử từng lần trả lời.
- `last_answer_state`: `correct`, `correct_retry`, `wrong`, `revealed`.
- `mastery_score`: điểm thuộc 0-100.
- `next_review_at`: thời điểm nên ôn lại.
- `review_interval_hours`: khoảng cách ôn tiếp theo.
- `review_stage`, `lapse_count`, `ease_factor`.
- `memory_stability`, `memory_difficulty`.

Trang **Lịch ôn** dùng các trường này để phân loại:

- Quá hạn.
- Sắp đến hạn trong 12 giờ.
- Lâu chưa học.
- Từ khó vừa trả lời đúng.
- Từ đang chờ lịch.
- Từ mới.

## Cấu Trúc Repo

```text
.
├── index.html
├── src/
│   ├── main.js          # Entry point
│   ├── ui.js            # Render giao diện và xử lý tương tác
│   ├── storage.js       # LocalStorage, Supabase sync, scoring, scheduling
│   ├── quiz.js          # Sinh câu hỏi và chấm bài kiểm tra
│   ├── kana.js          # Logic luyện Kana
│   ├── supabase.js      # Supabase client
│   └── style.css        # Giao diện
├── extension/           # Chrome extension nhắc ôn
├── src-tauri/           # Tauri/Rust shell cho desktop Windows
├── supabase/migrations/ # SQL migration cho schema
├── public/
├── vercel.json
└── package.json
```

## Chạy Local

Yêu cầu:

- Node.js
- Supabase project

Cài dependencies:

```bash
npm install
```

Tạo `.env` từ `.env.example`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Chạy dev server:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Desktop App Windows

Bản desktop dùng chung toàn bộ frontend và Supabase với website. Tính năng native chỉ được lazy-load khi chạy trong Tauri, vì vậy Vercel vẫn hoạt động như trước.

Yêu cầu bổ sung:

- Rust stable (`rustup`).
- Microsoft C++ Build Tools và Windows SDK.
- Microsoft Edge WebView2 Runtime.

Chạy desktop ở chế độ phát triển:

```bash
npm run desktop:dev
```

Build bộ cài Windows:

```bash
npm run desktop:build
```

Các file cài đặt được tạo trong:

```text
src-tauri/target/release/bundle/nsis/
src-tauri/target/release/bundle/msi/
```

Hành vi desktop:

- Đóng cửa sổ sẽ ẩn app xuống system tray, không kết thúc scheduler.
- Nhấn trái icon tray để mở lại cửa sổ.
- Menu tray có `Mở`, `Ôn từ đến hạn`, `Thoát hoàn toàn`.
- Menu tray có lối tắt `Học mục tiêu tiếp theo`.
- Autostart mở app với cờ `--hidden`, không làm bật cửa sổ khi đăng nhập Windows.
- Cài đặt tài khoản có công tắc thông báo Windows, autostart và nút gửi thử thông báo.
- Từ quá hạn thông thường được kiểm tra mỗi 15 phút và chống gửi trùng trong 60 phút.
- Lịch mục tiêu được lưu thêm vào `learning-schedule.json`; Rust kiểm tra độc lập với WebView mỗi 30 giây nên vẫn nhắc khi cửa sổ chạy nền.
- Người dùng đặt giới hạn thông báo/ngày và thời gian hoãn. Tắt thông báo sẽ xóa lịch đang chờ khỏi scheduler native.

## Mục Tiêu Học Theo Deadline

Trang `Mục tiêu` cho phép chọn một nhóm từ, đặt deadline từ trong ngày đến nhiều tuần và chọn tiêu chuẩn nhớ 85%, 90% hoặc 95%.

Luồng tạo mục tiêu:

1. Chọn từ, các dạng phải vượt qua, deadline, giờ ngủ/thức, khung giờ rảnh ngày thường và cuối tuần.
2. Làm bài đánh giá đầu vào để phân loại `đã biết nhanh`, `đã biết nhưng chậm`, `mới nhận diện` hoặc `chưa nhớ`.
3. Planner mới dựng lịch chính, có lượt trước ngủ/sau thức dậy và tự tính mức khả thi.
4. Nếu bỏ lỡ hoặc hoãn một buổi, toàn bộ phần chưa hoàn thành được lập lại; buổi đã xong vẫn giữ nguyên.

Hệ thống kết hợp:

- FSRS 6 (`ts-fsrs`) với một card riêng cho từng cặp `từ × dạng kiểm tra`, tránh việc giỏi Romaji làm tăng nhầm trí nhớ nghe/chữ Nhật.
- Profile FSRS cá nhân chỉ kích hoạt khi có ít nhất 200 log chất lượng; trước đó dùng tham số chuẩn.
- Learning steps ngắn để chặn quên nhanh trong ngày đầu.
- Retrieval practice: xem ngắn, che đáp án rồi chủ động gọi lại.
- Interleaving chống học thuộc thứ tự, tránh từ cùng hàng đứng cạnh nhau và trộn các cặp từng trả lời nhầm.
- Tín hiệu câu trả lời tách `exact`, `accepted_variant`, `typo`, `wrong_knowledge`, `revealed`, `slow`; lỗi gõ gần đúng không bị coi là quên.
- Thẻ cứu từ sau khi quên lặp: phát âm, ví dụ, bản dịch, mẹo nhớ cá nhân và danh sách từ dễ nhầm.
- Deadline planner: tự chia buổi, ưu tiên từ có nguy cơ và thêm lượt học bù sau khi sai/chậm.
- Bài kiểm tra xác nhận sát deadline. Một từ chỉ hoàn thành khi đủ buổi cách quãng, đủ các chiều đã chọn, vượt qua bài chốt và đạt xác suất nhớ yêu cầu.

Migration cần chạy cho tính năng này:

```text
supabase/migrations/202608100001_add_learning_goals_and_fsrs.sql
supabase/migrations/202608120001_expand_adaptive_learning.sql
```

## Supabase Schema

Các migration hiện có:

- `202606260001_add_vocab_learning_stats.sql`
- `202606260002_add_review_schedule_fields.sql`
- `202606280001_add_vocab_answer_history.sql`
- `202608100001_add_learning_goals_and_fsrs.sql`
- `202608120001_expand_adaptive_learning.sql`

Cột quan trọng của bảng `vocab`:

```text
history_times
answer_history
last_tested_at
last_time_spent_sec
last_answer_state
times_seen
streak_correct
mastery_score
next_review_at
review_interval_hours
review_stage
lapse_count
review_reason
ease_factor
memory_stability
memory_difficulty
fsrs_state
fsrs_due_at
fsrs_last_review_at
fsrs_reps
fsrs_lapses
fsrs_scheduled_days
fsrs_elapsed_days
fsrs_learning_steps
fsrs_stability
fsrs_difficulty
updated_at
```

Migration mới nhất để lưu lịch sử trả lời:

```sql
alter table public.vocab
  add column if not exists answer_history jsonb not null default '[]'::jsonb;
```

## Deploy

App deploy trên Vercel. Repo push lên `main` sẽ trigger deploy tự động.

```bash
git push origin main
```

URL production:

[https://web-fcard-japan.vercel.app/](https://web-fcard-japan.vercel.app/)

## Chrome Extension

Extension nằm trong thư mục `extension/`.

Chức năng:

- Kiểm tra Supabase theo chu kỳ.
- Nhận biết từ đến hạn ôn.
- Hiện notification hoặc mở cửa sổ ôn tập.
- Dùng Supabase anon key, không dùng service role key.

Cài local:

1. Mở `chrome://extensions`.
2. Bật `Developer mode`.
3. Chọn `Load unpacked`.
4. Trỏ tới thư mục `extension`.
5. Vào Options và nhập Supabase URL, Supabase anon key, Web app URL.

## Ghi Chú Vận Hành

- Không commit `.env` thật.
- Sau khi thêm migration mới, cần chạy SQL trên Supabase trước khi kỳ vọng dữ liệu mới sync lên cloud.
- Nếu app local chưa thấy dữ liệu mới sau khi sửa cloud, refresh trang để kéo Supabase về LocalStorage.
- `LocalStorage` là cache thao tác nhanh phía trình duyệt; Supabase là nguồn dữ liệu cloud để đồng bộ giữa máy/local/deploy.

## Roadmap Gợi Ý

- Thêm biểu đồ tiến bộ theo ngày/tuần.
- Thêm export toàn bộ dữ liệu học tập kèm lịch sử.
- Thêm dashboard streak học tập.
- Tách scoring config thành màn cài đặt để tự chỉnh trọng số.
- Đóng gói Android bằng Tauri Mobile hoặc Capacitor, dùng Firebase Cloud Messaging để nhận nhắc khi hệ điều hành đã dừng tiến trình.
