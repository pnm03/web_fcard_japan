// src/grammar.js
// Quản lý hệ thống học Ngữ pháp Tiếng Nhật có chia chương, tiến trình 2 bên, bài tập đa dạng và bài kiểm tra

import { speakJapanese, triggerConfetti } from './ui.js';

export const GRAMMAR_CHAPTERS = [
  {
    id: "n5-chapter-1",
    level: "N5",
    title: "Chương 1: Khởi động & Giới thiệu bản thân",
    description: "Nhập môn ngữ pháp tiếng Nhật căn bản: Khẳng định, phủ định, nghi vấn và trợ từ 'cũng'",
    lessons: [
      {
        id: "n5-lesson-1",
        number: 1,
        title: "Bài 1: Giới thiệu bản thân (自己紹介)",
        subtitle: "A は B です · A は B じゃありません · A は B ですか · A も B です",
        level: "N5",
        keyTakeaways: [
          "Trợ từ は viết là 'ha' nhưng PHẢI đọc là 'wa'.",
          "です đứng cuối câu khẳng định danh từ một cách lịch sự.",
          "じゃありません (văn nói) / ではありません (trang trọng) là thể phủ định của です.",
          "Thêm か vào cuối câu để thành câu hỏi nghi vấn.",
          "Trợ từ も (cũng) THAY THẾ cho は khi có cùng tính chất, không nói 'A はも B'."
        ],
        patterns: [
          {
            id: "pattern-1",
            name: "A は B です",
            meaning: "A là B (Câu khẳng định)",
            formula: "Danh từ 1 [ は ] Danh từ 2 [ です ]",
            explanation: "Mẫu câu khẳng định cơ bản nhất trong tiếng Nhật. Trợ từ <strong>は</strong> (đọc là <strong>wa</strong>) đánh dấu chủ đề của câu. <strong>です</strong> (desu) đứng ở cuối câu để khẳng định và thể hiện thái độ lịch sự với người nghe.",
            notes: "🔴 <u>Lưu ý phát âm:</u> Chữ cái viết là <strong>は (ha)</strong> nhưng khi đóng vai trò là <strong>trợ từ</strong> thì bắt buộc phải phát âm là <strong>wa</strong>.",
            examples: [
              { jp: "わたし は マイ です。", romaji: "Watashi wa Mai desu.", vi: "Tôi là Mai.", audio: "わたしはマイです" },
              { jp: "タインさん は ベトナム人 です。", romaji: "Thanh-san wa Betonamu-jin desu.", vi: "Anh Thanh là người Việt Nam.", audio: "タインさんはベトナムじんです" },
              { jp: "ミラーさん は 会社員 です。", romaji: "Miraa-san wa kaishain desu.", vi: "Anh Miller là nhân viên công ty.", audio: "ミラーさんはかいしゃいんです" },
              { jp: "ワンさん は 医者 です。", romaji: "Wan-san wa isha desu.", vi: "Anh Wang là bác sĩ.", audio: "ワンさんはいしゃです" }
            ]
          },
          {
            id: "pattern-2",
            name: "A は B じゃありません",
            meaning: "A không phải là B (Câu phủ định)",
            formula: "Danh từ 1 [ は ] Danh từ 2 [ じゃありません / ではありません ]",
            explanation: "Đây là thể phủ định lịch sự của <strong>です</strong>. Trong giao tiếp đời thường hàng ngày, người Nhật thường dùng <strong>じゃありません (ja arimasen)</strong>. Khi viết thư, phát biểu hoặc trong ngữ cảnh trang trọng, họ dùng <strong>ではありません (dewa arimasen)</strong>.",
            notes: "💡 <u>Mẹo thực tế:</u> Cả hai cách nói đều đúng, nhưng người mới bắt đầu nên luyện thành thạo <em>じゃありません</em> trước vì dùng nhiều nhất trong đàm thoại.",
            examples: [
              { jp: "わたし は 学生 じゃありません。", romaji: "Watashi wa gakusei ja arimasen.", vi: "Tôi không phải là học sinh.", audio: "わたしはがくせいじゃありません" },
              { jp: "サントスさん は 医者 じゃありません。", romaji: "Santosu-san wa isha ja arimasen.", vi: "Anh Santos không phải là bác sĩ.", audio: "サントスさんはいしゃじゃありません" },
              { jp: "あの方 は 先生 ではありません。", romaji: "Ano kata wa sensei dewa arimasen.", vi: "Vị kia không phải là giáo viên. (Trang trọng)", audio: "あのかたはせんせいではありません" }
            ]
          },
          {
            id: "pattern-3",
            name: "A は B ですか",
            meaning: "A có phải là B không? (Câu nghi vấn)",
            formula: "Danh từ 1 [ は ] Danh từ 2 [ ですか ]",
            explanation: "Thêm trợ từ <strong>か</strong> vào cuối câu để chuyển câu khẳng định thành câu hỏi. Trong tiếng Nhật chuẩn truyền thống, cuối câu dùng dấu chấm (。) chứ không dùng dấu hỏi (?), ngữ điệu cuối câu hơi <u>lên giọng</u>.",
            notes: "🗣️ <u>Cách trả lời câu hỏi nghi vấn:</u><br>• Đồng ý: <strong>はい、B です。</strong> (Vâng, là B)<br>• Từ chối: <strong>いいえ、B じゃありません。</strong> (Không, không phải là B)",
            examples: [
              { jp: "タインさん は エンジニア ですか。", romaji: "Thanh-san wa enjinia desu ka.", vi: "Anh Thanh có phải là kỹ sư không? ➔ [Trả lời: はい、エンジニア です。]", audio: "タインさんはエンジニアですか" },
              { jp: "ミラーさん は アメリカ人 ですか。", romaji: "Miraa-san wa Amerikajin desu ka.", vi: "Anh Miller có phải là người Mỹ không? ➔ [Trả lời: はい、アメリカ人 です。]", audio: "ミラーさんはアメリカじんですか" },
              { jp: "あの方 は 社長 ですか。", romaji: "Ano kata wa shachou desu ka.", vi: "Vị kia có phải là giám đốc không? ➔ [Trả lời: いいえ、社長 じゃありません。]", audio: "あのかたはしゃちょうですか" }
            ]
          },
          {
            id: "pattern-4",
            name: "A も B です",
            meaning: "A cũng là B (Trợ từ も - Cũng)",
            formula: "Danh từ 1 は C です。 Danh từ 2 [ も ] C です。",
            explanation: "Trợ từ <strong>も (mo)</strong> mang nghĩa là <em>'cũng'</em>. Nó được dùng để <strong>thay thế hoàn toàn cho trợ từ は</strong> khi chủ ngữ thứ hai có cùng đặc tính, nghề nghiệp hoặc quốc tịch với chủ ngữ trước đó.",
            notes: "🔴 <u>CẢNH BÁO LỖI SAI:</u> Tuyệt đối không dùng cả <em>は</em> và <em>も</em> cùng lúc (sai: <s>A はも B</s>). Phải thay thế: A は ➔ A も.",
            examples: [
              { jp: "タインさん は ベトナム人 です。ナムさん も ベトナム人 です。", romaji: "Thanh-san wa Betonamu-jin desu. Nam-san mo Betonamu-jin desu.", vi: "Anh Thanh là người Việt Nam. Anh Nam CŨNG là người Việt Nam.", audio: "タインさんはベトナムじんです。ナムさんもベトナムじんです" },
              { jp: "わたし は 学生 です。あの方 も 学生 です。", romaji: "Watashi wa gakusei desu. Ano kata mo gakusei desu.", vi: "Tôi là học sinh. Vị kia CŨNG là học sinh.", audio: "わたしはがくせいです。あのかたもがくせいです" },
              { jp: "ミラーさん は 会社員 です。グプタさん も 会社員 です。", romaji: "Miraa-san wa kaishain desu. Guputa-san mo kaishain desu.", vi: "Anh Miller là nhân viên công ty. Anh Gupta CŨNG là nhân viên công ty.", audio: "ミラーさんはかいしゃいんです。グプタさんもかいしゃいんです" }
            ]
          }
        ],
        readingArticle: {
          title: "Đoạn văn & Hội thoại tự giới thiệu bản thân mẫu (自己紹介)",
          passageJp: "初めまして。わたし は タイン です。ベトナム から 来ました。25歳 です。エンジニア です。学生 じゃありません。ナムさん も ベトナム人 です。どうぞ よろしく お願いします。",
          passageRomaji: "Hajimemashite. Watashi wa Thanh desu. Betonamu kara kimashita. 25-sai desu. Enjinia desu. Gakusei ja arimasen. Nam-san mo Betonamu-jin desu. Douzo yoroshiku onegaishimasu.",
          passageVi: "Rất vui được làm quen với bạn. Tôi là Thanh. Tôi đến từ Việt Nam. Tôi 25 tuổi. Tôi là kỹ sư. Tôi không phải là học sinh. Anh Nam cũng là người Việt Nam. Rất mong được sự giúp đỡ của bạn.",
          audio: "はじめまして。わたしはタインです。ベトナムからきました。にじゅうごさいです。エンジニアです。がくせいじゃありません。ナムさんもベトナムじんです。どうぞよろしくおねがいします"
        },
        exercises: [
          {
            id: "ex-1",
            type: "reading",
            typeLabel: "📖 Đọc hiểu",
            question: "Dựa vào bài giới thiệu ở trên: Anh Thanh làm nghề gì?",
            options: [
              "Học sinh (学生)",
              "Kỹ sư (エンジニア)",
              "Bác sĩ (医者)",
              "Nhân viên công ty (会社員)"
            ],
            correct: 1,
            explanation: "Trong bài có câu: 'エンジニア です。学生 じゃありません。' (Tôi là kỹ sư. Tôi không phải học sinh)."
          },
          {
            id: "ex-2",
            type: "listening",
            typeLabel: "🎧 Nghe hiểu",
            audioText: "ミラーさんはアメリカ人じゃありません",
            question: "Bấm nút 🔊 Nghe câu phát âm và chọn ý nghĩa chính xác nhất:",
            options: [
              "Anh Miller là người Mỹ.",
              "Anh Miller không phải là người Mỹ.",
              "Anh Miller có phải người Mỹ không?",
              "Anh Miller cũng là người Mỹ."
            ],
            correct: 1,
            explanation: "Câu phát âm: 'ミラーさんはアメリカ人じゃありません' kết thúc bằng 'じゃありません' là câu phủ định: Anh Miller không phải người Mỹ."
          },
          {
            id: "ex-3",
            type: "fill",
            typeLabel: "✏️ Điền trợ từ",
            question: "タインさん は ベトナム人 です。ナムさん [ ... ] ベトナム人 です。",
            options: ["は", "も", "か", "の"],
            correct: 1,
            explanation: "Cả Thanh và Nam đều là người Việt Nam nên câu thứ hai dùng trợ từ 'も' (cũng) để thay thế cho 'は'."
          },
          {
            id: "ex-4",
            type: "grammar",
            typeLabel: "🔍 Ngữ pháp phủ định",
            question: "Cách nói phủ định của câu: 'サントスさん は 医者 です' là gì?",
            options: [
              "サントスさん は 医者 ですか",
              "サントスさん も 医者 です",
              "サントスさん は 医者 じゃありません",
              "サントスさん は 医者 でした"
            ],
            correct: 2,
            explanation: "Phủ định của 'です' là 'じゃありません' hoặc 'ではありません'."
          },
          {
            id: "ex-5",
            type: "writing",
            typeLabel: "🧩 Sắp xếp câu",
            question: "Hãy chọn thứ tự ghép đúng để tạo câu hỏi: 'Bạn có phải là học sinh không?'",
            options: [
              "あなた は 学生 ですか",
              "学生 は あなた ですか",
              "あなた も 学生 ですか",
              "あなた は ですか 学生"
            ],
            correct: 0,
            explanation: "Cấu trúc câu hỏi nghi vấn: Chủ ngữ (あなた) + は + Danh từ (学生) + ですか."
          }
        ],
        testQuestions: [
          {
            id: "tq-1",
            q: "Trong câu 'わたし は マイ です', trợ từ 'は' được phát âm là gì?",
            options: ["ha", "wa", "ba", "ya"],
            correct: 1,
            explanation: "Trợ từ は trong ngữ pháp tiếng Nhật bắt buộc phát âm là 'wa'."
          },
          {
            id: "tq-2",
            q: "Câu 'あの方 は 先生 じゃありません' có nghĩa là gì?",
            options: [
              "Vị kia là giáo viên.",
              "Vị kia có phải giáo viên không?",
              "Vị kia không phải là giáo viên.",
              "Vị kia cũng là giáo viên."
            ],
            correct: 2,
            explanation: "じゃありません là thể phủ định của です: 'không phải là'."
          },
          {
            id: "tq-3",
            q: "Khi ai đó hỏi: 'タインさん は エンジニア ですか', nếu đồng ý bạn sẽ trả lời thế nào?",
            options: [
              "はい、エンジニア じゃありません。",
              "いいえ、エンジニア です。",
              "はい、エンジニア です。",
              "いいえ、エンジニア も です。"
            ],
            correct: 2,
            explanation: "Trả lời khẳng định: はい + danh từ + です."
          },
          {
            id: "tq-4",
            q: "Điền trợ từ: 'A: わたしは会社員です。 B: わたし [ ? ] 会社員です。'",
            options: ["は", "も", "か", "に"],
            correct: 1,
            explanation: "B cũng là nhân viên công ty giống A nên dùng trợ từ 'も' (cũng)."
          },
          {
            id: "tq-5",
            q: "Cách nói phủ định trang trọng (dùng trong văn viết) của 'じゃありません' là gì?",
            options: [
              "ではありません",
              "ではありませんか",
              "でした",
              "じゃなかった"
            ],
            correct: 0,
            explanation: "ではありません mang sắc thái trang trọng, lịch sự đỉnh cao."
          },
          {
            id: "tq-6",
            q: "Bấm nút 🔊 Nghe phát âm và chọn ý nghĩa đúng:",
            audioText: "ワンさんは医者ですか",
            options: [
              "Anh Wang là bác sĩ.",
              "Anh Wang không phải là bác sĩ.",
              "Anh Wang có phải là bác sĩ không?",
              "Anh Wang cũng là bác sĩ."
            ],
            correct: 2,
            explanation: "Câu kết thúc bằng 'ですか' là câu hỏi nghi vấn."
          },
          {
            id: "tq-7",
            q: "Chọn câu viết ĐÚNG ngữ pháp hoàn hảo nhất:",
            options: [
              "わたし はも ベトナム人 です。",
              "わたし も ベトナム人 です。",
              "わたし か ベトナム人 です。",
              "わたし は ベトナム人 も です。"
            ],
            correct: 1,
            explanation: "Trợ từ 'も' đứng ngay sau danh từ và thay thế cho 'は', không được viết ghép 'はも'."
          },
          {
            id: "tq-8",
            q: "Để giới thiệu 'Tôi là học sinh', câu nào sau đây là chính xác?",
            options: [
              "わたし は 学生 です。",
              "わたし が 学生 ですか。",
              "わたし も 学生 じゃありません。",
              "わたし は 学生 ですか。"
            ],
            correct: 0,
            explanation: "Cấu trúc khẳng định danh từ: A は B です (Tôi là học sinh)."
          }
        ]
      },
      {
        id: "n5-lesson-2",
        number: 2,
        title: "Bài 2: Đồ vật xung quanh (これ・それ・あれ)",
        subtitle: "Đại từ chỉ thị đồ vật: Cái này, cái đó, cái kia",
        level: "N5",
        locked: true
      },
      {
        id: "n5-lesson-3",
        number: 3,
        title: "Bài 3: Địa điểm & Nơi chốn (ここ・そこ・あそこ)",
        subtitle: "Chỉ vị trí, nơi chốn, phương hướng và giá tiền",
        level: "N5",
        locked: true
      },
      {
        id: "n5-lesson-4",
        number: 4,
        title: "Bài 4: Thời gian & Động từ hàng ngày (~ます)",
        subtitle: "Hỏi giờ giấc, các ngày trong tuần và động từ chia thì",
        level: "N5",
        locked: true
      },
      {
        id: "n5-lesson-5",
        number: 5,
        title: "Bài 5: Đi lại & Phương tiện (〜へ 行きます)",
        subtitle: "Đi đâu, đi bằng phương tiện gì, đi cùng với ai",
        level: "N5",
        locked: true
      }
    ]
  }
];

const STORAGE_KEY_GRAMMAR_PROGRESS = "nihongo_grammar_progress_v1";

// Đọc toàn bộ tiến trình từ localStorage
export function loadAllGrammarProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GRAMMAR_PROGRESS);
    if (!raw) return getDefaultProgressState();
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Lỗi đọc tiến trình ngữ pháp:", e);
    return getDefaultProgressState();
  }
}

// Lưu tiến trình vào localStorage
export function saveAllGrammarProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY_GRAMMAR_PROGRESS, JSON.stringify(data));
  } catch (e) {
    console.warn("Lỗi lưu tiến trình ngữ pháp:", e);
  }
}

function getDefaultProgressState() {
  return {
    activeLessonId: "n5-lesson-1",
    activeTab: "theory", // theory | exercises | test
    unlockedAll: false,
    lessons: {
      "n5-lesson-1": {
        theoryDone: false,
        exercisesDone: false,
        exerciseScores: {},
        testPassed: false,
        testScore: 0,
        testTotal: 8,
        notes: "",
        bookmarked: false
      }
    }
  };
}

// Lấy tiến trình của 1 bài học cụ thể
export function getLessonProgress(lessonId) {
  const all = loadAllGrammarProgress();
  if (!all.lessons[lessonId]) {
    all.lessons[lessonId] = {
      theoryDone: false,
      exercisesDone: false,
      exerciseScores: {},
      testPassed: false,
      testScore: 0,
      testTotal: 8,
      notes: "",
      bookmarked: false
    };
  }
  return all.lessons[lessonId];
}

// Cập nhật tiến trình cho 1 bài học
export function updateLessonProgress(lessonId, partial) {
  const all = loadAllGrammarProgress();
  if (!all.lessons[lessonId]) {
    all.lessons[lessonId] = {
      theoryDone: false,
      exercisesDone: false,
      exerciseScores: {},
      testPassed: false,
      testScore: 0,
      testTotal: 8,
      notes: "",
      bookmarked: false
    };
  }
  all.lessons[lessonId] = { ...all.lessons[lessonId], ...partial };
  saveAllGrammarProgress(all);
  return all.lessons[lessonId];
}

// Tính % hoàn thành của 1 bài học
export function calculateLessonPercent(lessonId) {
  const p = getLessonProgress(lessonId);
  let score = 0;
  if (p.theoryDone) score += 30;
  if (p.exercisesDone) score += 30;
  if (p.testPassed) score += 40;
  return score;
}

// Biến trạng thái runtime
let currentChapterIndex = 0;
let currentLessonId = "n5-lesson-1";
let currentTab = "theory"; // theory | exercises | test
let activeLeftSubTab = "notes"; // notes | takeaways | list

// Khởi tạo các sự kiện giao diện
export function setupGrammarUI() {
  const state = loadAllGrammarProgress();
  if (state.activeLessonId) currentLessonId = state.activeLessonId;
  if (state.activeTab) currentTab = state.activeTab;

  const grammarNavBtn = document.getElementById("nav-grammar");
  if (grammarNavBtn) {
    grammarNavBtn.addEventListener("click", () => {
      renderGrammarView();
    });
  }
}

// Điều hướng chính: render toàn bộ workspace Ngữ pháp
export function renderGrammarView() {
  const view = document.getElementById("grammar-view");
  if (!view) return;

  const currentLesson = getCurrentLessonData();
  if (!currentLesson) return;

  renderLeftSidebar(currentLesson);
  renderCenterWorkspace(currentLesson);
  renderRightSidebar(currentLesson);
}

function getCurrentLessonData() {
  const chapter = GRAMMAR_CHAPTERS[currentChapterIndex];
  if (!chapter) return null;
  return chapter.lessons.find(l => l.id === currentLessonId) || chapter.lessons[0];
}

/* ==========================================================================
   CỘT TRÁI: TIỆN ÍCH & SỔ TAY GHI CHÚ
   ========================================================================== */
function renderLeftSidebar(lesson) {
  const sidebar = document.getElementById("grammar-sidebar-left");
  if (!sidebar) return;

  const progress = getLessonProgress(lesson.id);

  sidebar.innerHTML = `
    <div class="grammar-sidebar-header">
      <div class="grammar-tab-pills">
        <button type="button" class="g-subtab-btn ${activeLeftSubTab === 'notes' ? 'active' : ''}" data-subtab="notes" title="Sổ tay ghi chú">
          📝 Ghi chú
        </button>
        <button type="button" class="g-subtab-btn ${activeLeftSubTab === 'takeaways' ? 'active' : ''}" data-subtab="takeaways" title="Điểm cần nhớ">
          💡 Mẹo nhớ
        </button>
        <button type="button" class="g-subtab-btn ${activeLeftSubTab === 'list' ? 'active' : ''}" data-subtab="list" title="Mục lục bài học">
          📚 Bài học
        </button>
      </div>
    </div>

    <div class="grammar-sidebar-body">
      <!-- 1. Sổ tay ghi chú cá nhân -->
      <div class="g-subtab-panel ${activeLeftSubTab === 'notes' ? 'active' : ''}" id="g-panel-notes">
        <div class="notes-panel-desc">
          <small>Ghi chú của riêng bạn cho <strong>${lesson.title}</strong> (Tự động lưu vào máy):</small>
        </div>
        <textarea id="grammar-user-notes" class="form-control grammar-notes-textarea" placeholder="Viết những gì bạn học được, câu ví dụ của bạn, thắc mắc cần ôn lại...">${progress.notes || ''}</textarea>
        <div class="notes-panel-actions">
          <span id="grammar-notes-status" class="notes-save-status">Đã đồng bộ</span>
          <button type="button" class="btn btn-secondary btn-sm" id="grammar-save-notes-btn">💾 Lưu ghi chú</button>
        </div>

        <div class="bookmark-study-box">
          <label class="custom-checkbox-label">
            <input type="checkbox" id="grammar-bookmark-check" ${progress.bookmarked ? 'checked' : ''}>
            <span>⭐ Đánh dấu bài học này để ôn tập lại sau</span>
          </label>
        </div>
      </div>

      <!-- 2. Điểm cần nhớ / Mẹo vàng -->
      <div class="g-subtab-panel ${activeLeftSubTab === 'takeaways' ? 'active' : ''}" id="g-panel-takeaways">
        <h4 class="takeaways-title">⚡ Điểm mấu chốt của bài:</h4>
        <ul class="takeaways-list">
          ${(lesson.keyTakeaways || []).map(tip => `
            <li><span>🔹</span> <div>${tip}</div></li>
          `).join('')}
        </ul>
      </div>

      <!-- 3. Mục lục bài học trong chương -->
      <div class="g-subtab-panel ${activeLeftSubTab === 'list' ? 'active' : ''}" id="g-panel-list">
        <h4 class="takeaways-title">Danh sách bài học N5:</h4>
        <div class="lesson-quick-list">
          ${GRAMMAR_CHAPTERS[currentChapterIndex].lessons.map(l => {
            const isCurrent = l.id === lesson.id;
            const isLocked = isLessonLocked(l.id);
            return `
              <div class="lesson-quick-item ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}" data-lesson-id="${l.id}">
                <span class="quick-item-icon">${isLocked ? '🔒' : (isCurrent ? '👉' : '📖')}</span>
                <div class="quick-item-info">
                  <strong>${l.title}</strong>
                  <small>${l.subtitle || ''}</small>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  // Bắt sự kiện chuyển tab cột trái
  sidebar.querySelectorAll(".g-subtab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeLeftSubTab = btn.getAttribute("data-subtab");
      renderLeftSidebar(lesson);
    });
  });

  // Bắt sự kiện lưu ghi chú
  const notesTextarea = document.getElementById("grammar-user-notes");
  const saveNotesBtn = document.getElementById("grammar-save-notes-btn");
  const notesStatus = document.getElementById("grammar-notes-status");

  if (notesTextarea) {
    notesTextarea.addEventListener("input", () => {
      if (notesStatus) notesStatus.textContent = "Chưa lưu...";
    });
  }

  if (saveNotesBtn && notesTextarea) {
    saveNotesBtn.addEventListener("click", () => {
      const val = notesTextarea.value.trim();
      updateLessonProgress(lesson.id, { notes: val });
      if (notesStatus) {
        notesStatus.textContent = "✓ Đã lưu thành công!";
        setTimeout(() => { if (notesStatus) notesStatus.textContent = "Đã đồng bộ"; }, 2000);
      }
    });
  }

  // Đánh dấu bookmark
  const bookmarkCheck = document.getElementById("grammar-bookmark-check");
  if (bookmarkCheck) {
    bookmarkCheck.addEventListener("change", (e) => {
      updateLessonProgress(lesson.id, { bookmarked: e.target.checked });
    });
  }

  // Bắt sự kiện chuyển bài nhanh
  sidebar.querySelectorAll(".lesson-quick-item:not(.locked)").forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-lesson-id");
      if (targetId && targetId !== currentLessonId) {
        currentLessonId = targetId;
        const all = loadAllGrammarProgress();
        all.activeLessonId = targetId;
        saveAllGrammarProgress(all);
        renderGrammarView();
      }
    });
  });
}

function isLessonLocked(lessonId) {
  const all = loadAllGrammarProgress();
  if (all.unlockedAll) return false;
  if (lessonId === "n5-lesson-1") return false;
  const lesson = GRAMMAR_CHAPTERS[currentChapterIndex].lessons.find(l => l.id === lessonId);
  if (!lesson) return true;
  // Mở khóa bài 2 nếu bài 1 đã thi đỗ
  if (lessonId === "n5-lesson-2") {
    return !getLessonProgress("n5-lesson-1").testPassed;
  }
  return lesson.locked === true;
}

/* ==========================================================================
   KHU VỰC TRUNG TÂM: BÀI GIẢNG / BÀI TẬP / KIỂM TRA
   ========================================================================== */
function renderCenterWorkspace(lesson) {
  const main = document.getElementById("grammar-main-content");
  if (!main) return;

  const progress = getLessonProgress(lesson.id);

  main.innerHTML = `
    <!-- Thanh điều hướng Tab chính giữa -->
    <header class="grammar-main-tabs">
      <button type="button" class="g-main-tab-btn ${currentTab === 'theory' ? 'active' : ''}" data-tab="theory">
        <span>📖</span> Bài Giảng Lý Thuyết ${progress.theoryDone ? '✓' : ''}
      </button>
      <button type="button" class="g-main-tab-btn ${currentTab === 'exercises' ? 'active' : ''}" data-tab="exercises">
        <span>✍️</span> Luyện Tập Thực Hành ${progress.exercisesDone ? '✓' : ''}
      </button>
      <button type="button" class="g-main-tab-btn ${currentTab === 'test' ? 'active' : ''}" data-tab="test">
        <span>🎯</span> Kiểm Tra Đánh Giá ${progress.testPassed ? `(${progress.testScore}/${progress.testTotal})` : ''}
      </button>
    </header>

    <div class="grammar-tab-content-container">
      ${currentTab === 'theory' ? renderTheoryTabHtml(lesson, progress) : ''}
      ${currentTab === 'exercises' ? renderExercisesTabHtml(lesson, progress) : ''}
      ${currentTab === 'test' ? renderTestTabHtml(lesson, progress) : ''}
    </div>
  `;

  // Bắt sự kiện chuyển Tab chính
  main.querySelectorAll(".g-main-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentTab = btn.getAttribute("data-tab");
      const all = loadAllGrammarProgress();
      all.activeTab = currentTab;
      saveAllGrammarProgress(all);
      renderCenterWorkspace(lesson);
      renderRightSidebar(lesson);
    });
  });

  // Bắt sự kiện cho các nút trong nội dung tab
  attachWorkspaceEventListeners(lesson);
}

// 1. Render Tab Lý Thuyết
function renderTheoryTabHtml(lesson, progress) {
  return `
    <div class="theory-view-wrapper">
      <div class="theory-intro-banner">
        <h3>Bài học: ${lesson.title}</h3>
        <p>Học kỹ 4 cấu trúc dưới đây, bấm nút 🔊 Loa để nghe phát âm từng câu ví dụ thực tế:</p>
      </div>

      <div class="grammar-patterns-stack">
        ${(lesson.patterns || []).map((p, idx) => `
          <article class="grammar-pattern-card">
            <header class="pattern-header">
              <span class="pattern-index">Mẫu ${idx + 1}</span>
              <h3 class="pattern-title">${p.name}</h3>
              <span class="pattern-meaning">${p.meaning}</span>
            </header>

            <div class="pattern-formula-bar">
              <code>${p.formula}</code>
            </div>

            <div class="pattern-desc">
              <p>${p.explanation}</p>
              ${p.notes ? `<div class="pattern-note-box">${p.notes}</div>` : ''}
              ${p.reply ? `<div class="pattern-reply-box">${p.reply.replace(/\n/g, '<br>')}</div>` : ''}
            </div>

            <div class="pattern-examples-box">
              <h4>🗣️ Ví dụ minh họa (Bấm 🔊 để nghe phát âm):</h4>
              <div class="pattern-examples-list">
                ${p.examples.map(ex => `
                  <div class="pattern-example-row">
                    <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${ex.audio || ex.jp}" title="Nghe phát âm">
                      🔊
                    </button>
                    <div class="example-content">
                      <div class="ex-jp">${ex.jp}</div>
                      <div class="ex-romaji">${ex.romaji}</div>
                      <div class="ex-vi">${ex.vi}</div>
                      ${ex.reply ? `<div class="ex-reply">👉 ${ex.reply}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </article>
        `).join('')}
      </div>

      ${lesson.readingArticle ? `
        <article class="grammar-pattern-card reading-article-card">
          <header class="pattern-header">
            <span class="pattern-index">Ứng dụng</span>
            <h3 class="pattern-title">${lesson.readingArticle.title}</h3>
          </header>
          <div class="reading-passage-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong>Đoạn văn hoàn chỉnh:</strong>
              <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${lesson.readingArticle.audio || lesson.readingArticle.passageJp}" title="Nghe toàn bộ đoạn văn">
                🔊 Nghe toàn bài
              </button>
            </div>
            <p class="reading-jp">${lesson.readingArticle.passageJp}</p>
            <p class="reading-romaji">${lesson.readingArticle.passageRomaji}</p>
            <p class="reading-vi">${lesson.readingArticle.passageVi}</p>
          </div>
        </article>
      ` : ''}

      <div class="theory-footer-actions">
        <button type="button" class="btn btn-primary btn-lg" id="g-mark-theory-done-btn">
          ${progress.theoryDone ? '✓ Đã hoàn thành Lý thuyết ➔ Sang làm Bài tập' : 'Đã học xong lý thuyết ➔ Bắt đầu luyện tập'}
        </button>
      </div>
    </div>
  `;
}

// 2. Render Tab Bài Tập Thực Hành
function renderExercisesTabHtml(lesson, progress) {
  const exercises = lesson.exercises || [];
  const exerciseScores = progress.exerciseScores || {};
  const completedCount = Object.keys(exerciseScores).length;

  return `
    <div class="exercises-view-wrapper">
      <div class="exercises-header-bar">
        <div>
          <h3>Luyện tập thực hành (${completedCount}/${exercises.length} câu đã trả lời)</h3>
          <p>Bài tập đa dạng kiểm tra đọc hiểu, nghe hiểu, ngữ pháp và ghép câu:</p>
        </div>
      </div>

      <div class="exercises-stack">
        ${exercises.map((ex, idx) => {
          const userChoice = exerciseScores[ex.id];
          const isAnswered = typeof userChoice !== "undefined";
          const isCorrect = userChoice === ex.correct;

          return `
            <div class="exercise-item-card ${isAnswered ? (isCorrect ? 'answered-correct' : 'answered-wrong') : ''}" id="ex-card-${ex.id}">
              <div class="ex-card-head">
                <span class="ex-badge">${ex.typeLabel || 'Bài tập'}</span>
                <span class="ex-num">Câu ${idx + 1}</span>
                ${isAnswered ? (isCorrect ? '<span class="status-badge badge-pass">✓ Chính xác</span>' : '<span class="status-badge badge-fail">✗ Chưa đúng</span>') : ''}
              </div>

              ${ex.audioText ? `
                <div class="ex-audio-player">
                  <button type="button" class="btn btn-primary btn-sm g-speak-btn" data-audio="${ex.audioText}">
                    🔊 Bấm để nghe câu hỏi
                  </button>
                </div>
              ` : ''}

              <div class="ex-question-text">${ex.question}</div>

              <div class="ex-options-grid">
                ${ex.options.map((opt, optIdx) => {
                  let optClass = "ex-opt-btn";
                  if (isAnswered) {
                    if (optIdx === ex.correct) optClass += " opt-correct";
                    else if (optIdx === userChoice) optClass += " opt-wrong";
                  }
                  return `
                    <button type="button" class="${optClass}" data-ex-id="${ex.id}" data-opt-idx="${optIdx}" ${isAnswered ? 'disabled' : ''}>
                      <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
                      <span class="opt-label">${opt}</span>
                    </button>
                  `;
                }).join('')}
              </div>

              ${isAnswered ? `
                <div class="ex-explanation-panel">
                  <strong>💡 Giải thích:</strong> ${ex.explanation}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="exercises-footer-actions">
        <button type="button" class="btn btn-secondary" id="g-reset-exercises-btn">Làm lại bài tập</button>
        <button type="button" class="btn btn-primary" id="g-go-to-test-btn">Tiến đến Bài kiểm tra đánh giá ➔</button>
      </div>
    </div>
  `;
}

// 3. Render Tab Bài Kiểm Tra
function renderTestTabHtml(lesson, progress) {
  const questions = lesson.testQuestions || [];
  const hasPassed = progress.testPassed;

  return `
    <div class="test-view-wrapper">
      <div class="test-banner ${hasPassed ? 'banner-passed' : ''}">
        <div>
          <h3>🎯 Bài Kiểm Tra Đánh Giá Năng Lực (8 câu hỏi)</h3>
          <p>Đạt từ <strong>80% (7/8 câu)</strong> trở lên để được chứng nhận hoàn thành bài học và mở khóa bài tiếp theo!</p>
        </div>
        ${hasPassed ? `
          <div class="test-score-badge">
            <span class="score-number">${progress.testScore} / ${progress.testTotal}</span>
            <span class="score-label">⭐⭐⭐ ĐÃ ĐẠT CHUẨN</span>
          </div>
        ` : ''}
      </div>

      <form id="grammar-test-form" class="grammar-test-form">
        <div class="test-questions-stack">
          ${questions.map((q, qIdx) => `
            <div class="test-question-card" id="tq-card-${q.id}">
              <div class="tq-header">
                <span class="tq-index">Câu ${qIdx + 1}</span>
                ${q.audioText ? `
                  <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${q.audioText}">
                    🔊 Nghe phát âm
                  </button>
                ` : ''}
              </div>
              <div class="tq-text">${q.q}</div>
              <div class="tq-options">
                ${q.options.map((opt, optIdx) => `
                  <label class="tq-option-label">
                    <input type="radio" name="tq-${q.id}" value="${optIdx}" required>
                    <span class="tq-radio-custom"></span>
                    <span class="tq-option-text">${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="test-submit-box">
          <button type="submit" class="btn btn-primary btn-lg" id="g-submit-test-btn">
            Nộp bài & Chấm điểm tức thì 📝
          </button>
        </div>
      </form>
    </div>
  `;
}

// Bắt các sự kiện tương tác trong khu vực trung tâm
function attachWorkspaceEventListeners(lesson) {
  // Phát âm âm thanh
  document.querySelectorAll(".g-speak-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.getAttribute("data-audio");
      if (text) speakJapanese(text, true);
    });
  });

  // Hoàn thành lý thuyết
  const markTheoryDoneBtn = document.getElementById("g-mark-theory-done-btn");
  if (markTheoryDoneBtn) {
    markTheoryDoneBtn.addEventListener("click", () => {
      updateLessonProgress(lesson.id, { theoryDone: true });
      currentTab = "exercises";
      renderGrammarView();
    });
  }

  // Tương tác bài tập
  document.querySelectorAll(".ex-opt-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      const exId = btn.getAttribute("data-ex-id");
      const optIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
      const ex = (lesson.exercises || []).find(e => e.id === exId);
      if (!ex) return;

      const progress = getLessonProgress(lesson.id);
      const scores = { ...(progress.exerciseScores || {}) };
      scores[exId] = optIdx;

      const allExercisesDone = Object.keys(scores).length >= (lesson.exercises || []).length;
      updateLessonProgress(lesson.id, { exerciseScores: scores, exercisesDone: allExercisesDone });

      renderCenterWorkspace(lesson);
      renderRightSidebar(lesson);
    });
  });

  // Reset bài tập
  const resetExBtn = document.getElementById("g-reset-exercises-btn");
  if (resetExBtn) {
    resetExBtn.addEventListener("click", () => {
      if (confirm("Bạn có muốn làm lại toàn bộ bài tập của bài này không?")) {
        updateLessonProgress(lesson.id, { exerciseScores: {}, exercisesDone: false });
        renderCenterWorkspace(lesson);
        renderRightSidebar(lesson);
      }
    });
  }

  // Chuyển sang bài kiểm tra
  const goToTestBtn = document.getElementById("g-go-to-test-btn");
  if (goToTestBtn) {
    goToTestBtn.addEventListener("click", () => {
      currentTab = "test";
      renderCenterWorkspace(lesson);
      renderRightSidebar(lesson);
    });
  }

  // Nộp bài kiểm tra
  const testForm = document.getElementById("grammar-test-form");
  if (testForm) {
    testForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const questions = lesson.testQuestions || [];
      let correctCount = 0;

      questions.forEach(q => {
        const selected = testForm.querySelector(`input[name="tq-${q.id}"]:checked`);
        if (selected && parseInt(selected.value, 10) === q.correct) {
          correctCount++;
        }
      });

      const total = questions.length;
      const passed = (correctCount / total) >= 0.8; // >= 80%

      updateLessonProgress(lesson.id, {
        testScore: correctCount,
        testTotal: total,
        testPassed: passed
      });

      if (passed) {
        try { triggerConfetti(); } catch (err) {}
        alert(`🎉 XUẤT SẮC! Bạn đạt ${correctCount}/${total} điểm (${Math.round(correctCount / total * 100)}%).\nBạn đã xuất sắc hoàn thành Bài 1 và mở khóa Bài tiếp theo!`);
      } else {
        alert(`Bạn đạt ${correctCount}/${total} điểm (${Math.round(correctCount / total * 100)}%).\nCần đạt từ 80% (7/8 câu) trở lên để qua bài. Hãy ôn lại lý thuyết và thử lại nhé!`);
      }

      renderCenterWorkspace(lesson);
      renderRightSidebar(lesson);
    });
  }
}

/* ==========================================================================
   CỘT PHẢI: TIẾN TRÌNH & LỘ TRÌNH MỞ KHÓA
   ========================================================================== */
function renderRightSidebar(lesson) {
  const sidebar = document.getElementById("grammar-sidebar-right");
  if (!sidebar) return;

  const progress = getLessonProgress(lesson.id);
  const percent = calculateLessonPercent(lesson.id);
  const allState = loadAllGrammarProgress();

  sidebar.innerHTML = `
    <div class="progress-sidebar-header">
      <h4>Tiến Trình Học Tập</h4>
    </div>

    <!-- Thanh tiến độ tổng quan -->
    <div class="progress-meter-card">
      <div class="progress-meter-info">
        <span>Hoàn thành bài:</span>
        <strong>${percent}%</strong>
      </div>
      <div class="progress-bar-track">
        <div class="progress-bar-fill" style="width: ${percent}%;"></div>
      </div>
      <div class="progress-stars">
        <span class="star-item ${progress.theoryDone ? 'active' : ''}">⭐ Lý thuyết</span>
        <span class="star-item ${progress.exercisesDone ? 'active' : ''}">⭐ Bài tập</span>
        <span class="star-item ${progress.testPassed ? 'active' : ''}">⭐ Kiểm tra</span>
      </div>
    </div>

    <!-- Cột mốc 3 bước trong bài -->
    <div class="milestones-card">
      <h5>Lộ trình trong bài học:</h5>
      <div class="milestone-step ${progress.theoryDone ? 'completed' : 'current'}" data-tab="theory">
        <span class="m-icon">${progress.theoryDone ? '✓' : '📖'}</span>
        <div class="m-text">
          <strong>Bước 1: Lý thuyết bài giảng</strong>
          <small>${progress.theoryDone ? 'Đã xem xong' : 'Đang học'}</small>
        </div>
      </div>

      <div class="milestone-step ${progress.exercisesDone ? 'completed' : (progress.theoryDone ? 'unlocked' : 'pending')}" data-tab="exercises">
        <span class="m-icon">${progress.exercisesDone ? '✓' : '✍️'}</span>
        <div class="m-text">
          <strong>Bước 2: Luyện tập thực hành</strong>
          <small>${progress.exercisesDone ? 'Đã hoàn thành các câu hỏi' : '5 bài tập thực tế'}</small>
        </div>
      </div>

      <div class="milestone-step ${progress.testPassed ? 'completed' : (progress.exercisesDone ? 'unlocked' : 'locked')}" data-tab="test">
        <span class="m-icon">${progress.testPassed ? '🏆' : (progress.exercisesDone ? '🎯' : '🔒')}</span>
        <div class="m-text">
          <strong>Bước 3: Bài kiểm tra chốt bài</strong>
          <small>${progress.testPassed ? `Đạt ${progress.testScore}/${progress.testTotal} điểm` : 'Đạt ≥ 80% để mở bài sau'}</small>
        </div>
      </div>
    </div>

    <!-- Lộ trình toàn bộ Chương N5 -->
    <div class="chapter-roadmap-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <h5>Lộ trình N5:</h5>
        <button type="button" class="btn btn-secondary btn-sm" id="grammar-unlock-all-toggle" style="font-size: 10px; padding: 2px 6px;">
          ${allState.unlockedAll ? '🔓 Đang mở hết' : '🔓 Mở khóa tất cả'}
        </button>
      </div>

      <div class="roadmap-lessons-stack">
        ${GRAMMAR_CHAPTERS[currentChapterIndex].lessons.map(l => {
          const isCurr = l.id === lesson.id;
          const isLock = isLessonLocked(l.id);
          const p = getLessonProgress(l.id);
          const pct = calculateLessonPercent(l.id);

          return `
            <div class="roadmap-item ${isCurr ? 'curr' : ''} ${isLock ? 'lock' : 'open'}" data-lesson-id="${l.id}">
              <div class="roadmap-item-head">
                <span class="roadmap-badge">${isLock ? '🔒' : (p.testPassed ? '✓' : 'Bài ' + l.number)}</span>
                <span class="roadmap-title">${l.title}</span>
              </div>
              <div class="roadmap-sub">
                <small>${isLock ? 'Cần vượt qua bài trước' : (pct + '% hoàn thành')}</small>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Bắt sự kiện chuyển tab từ cột mốc
  sidebar.querySelectorAll(".milestone-step").forEach(step => {
    step.addEventListener("click", () => {
      const tab = step.getAttribute("data-tab");
      if (tab) {
        currentTab = tab;
        renderCenterWorkspace(lesson);
        renderRightSidebar(lesson);
      }
    });
  });

  // Bắt sự kiện chuyển bài từ lộ trình N5
  sidebar.querySelectorAll(".roadmap-item.open").forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-lesson-id");
      if (targetId && targetId !== currentLessonId) {
        currentLessonId = targetId;
        const all = loadAllGrammarProgress();
        all.activeLessonId = targetId;
        saveAllGrammarProgress(all);
        renderGrammarView();
      }
    });
  });

  // Toggle mở khóa tất cả bài
  const unlockAllBtn = document.getElementById("grammar-unlock-all-toggle");
  if (unlockAllBtn) {
    unlockAllBtn.addEventListener("click", () => {
      const all = loadAllGrammarProgress();
      all.unlockedAll = !all.unlockedAll;
      saveAllGrammarProgress(all);
      renderGrammarView();
    });
  }
}
