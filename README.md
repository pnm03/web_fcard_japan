# Nihongo Flashcard

Ứng dụng flashcard tiếng Nhật tập trung vào phản xạ, ghi nhớ dài hạn và ôn tập thông minh. App dùng Vite ở frontend, Supabase để đồng bộ dữ liệu, Vercel để deploy, kèm một Chrome extension nhắc ôn từ đến hạn.

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

## Supabase Schema

Các migration hiện có:

- `202606260001_add_vocab_learning_stats.sql`
- `202606260002_add_review_schedule_fields.sql`
- `202606280001_add_vocab_answer_history.sql`

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
- Thêm test tự động cho scoring từ yếu và scheduling.
