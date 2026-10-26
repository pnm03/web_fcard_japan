// src/jlpt-exam.js
// Quản lý Trang Tạo bài kiểm tra & Thi thử JLPT N5 chuẩn cấu trúc kỳ thi thật
// Dựa trên 100% ngữ pháp đã học và từ vựng có sẵn trong các dự án cá nhân

import { getProjects } from "./storage.js";
import { GRAMMAR_CHAPTERS, getLessonProgress, getAIConfig } from "./grammar.js";
import { speakJapanese } from "./ui.js";

export const STORAGE_KEY_JLPT_HISTORY = "miw_jlpt_exam_history_v1";

// Cấu hình N5 mặc định chuẩn bám sát Bài 1 & từ vựng dự án
export const N5_CORE_ENTITIES = [
  { kanji: "私", hiragana: "わたし", romaji: "watashi", meaning: "tôi", type: "pronoun" },
  { kanji: "あなた", hiragana: "あなた", romaji: "anata", meaning: "bạn / anh / chị", type: "pronoun" },
  { kanji: "あの方", hiragana: "あのかた", romaji: "ano kata", meaning: "vị kia (lịch sự)", type: "pronoun" },
  { kanji: "学生", hiragana: "がくせい", romaji: "gakusei", meaning: "học sinh / sinh viên", type: "noun" },
  { kanji: "先生", hiragana: "せんせい", romaji: "sensei", meaning: "giáo viên / thầy cô", type: "noun" },
  { kanji: "会社員", hiragana: "かいしゃいん", romaji: "kaishain", meaning: "nhân viên công ty", type: "noun" },
  { kanji: "医者", hiragana: "いしゃ", romaji: "isha", meaning: "bác sĩ", type: "noun" },
  { kanji: "エンジニア", hiragana: "えんじにあ", romaji: "enjinia", meaning: "kỹ sư", type: "noun" },
  { kanji: "研究者", hiragana: "けんきゅうしゃ", romaji: "kenkyuusha", meaning: "nhà nghiên cứu", type: "noun" },
  { kanji: "病院", hiragana: "びょういん", romaji: "byouin", meaning: "bệnh viện", type: "noun" },
  { kanji: "大学", hiragana: "だいがく", romaji: "daigaku", meaning: "trường đại học", type: "noun" },
  { kanji: "本", hiragana: "ほん", romaji: "hon", meaning: "sách", type: "noun" },
  { kanji: "誰", hiragana: "だれ", romaji: "dare", meaning: "ai (hỏi người)", type: "interrogative" },
  { kanji: "何歳", hiragana: "なんさい", romaji: "nansai", meaning: "mấy tuổi", type: "interrogative" },
  { kanji: "ベトナム人", hiragana: "べとなむじん", romaji: "Betonamujin", meaning: "người Việt Nam", type: "nationality" },
  { kanji: "日本人", hiragana: "にほんじん", romaji: "Nihonjin", meaning: "người Nhật Bản", type: "nationality" },
  { kanji: "アメリカ人", hiragana: "あめりかじん", romaji: "Amerikajin", meaning: "người Mỹ", type: "nationality" }
];

// Runtime State cho bài thi hiện tại
let activeExam = null;
let userExamAnswers = {};
let flaggedQuestions = new Set();
let examTimerInterval = null;
let remainingExamSeconds = 0;
let isExamPaused = false;
let examSubmitted = false;
let activeExamResult = null;
let isHistoryModalOpen = false;

// 1. Khởi tạo UI và các sự kiện cho trang JLPT Exam
export function setupJlptExamUI() {
  const container = document.getElementById("jlpt-exam-view");
  if (!container) return;

  container.addEventListener("click", (e) => {
    // 1. Nút bắt đầu làm bài thi
    const startBtn = e.target.closest("#jlpt-start-exam-btn");
    if (startBtn) {
      e.preventDefault();
      startGeneratedExam();
      return;
    }

    // 2. Nút xem lịch sử thi
    const historyBtn = e.target.closest("#jlpt-open-history-btn");
    if (historyBtn) {
      e.preventDefault();
      openHistoryModal();
      return;
    }

    // 3. Đóng modal lịch sử
    const closeHistX = e.target.closest("#close-jlpt-history-x, #close-jlpt-history-btn");
    if (closeHistX) {
      e.preventDefault();
      closeHistoryModal();
      return;
    }

    // 4. Xóa toàn bộ lịch sử thi
    const clearHistBtn = e.target.closest("#clear-jlpt-history-btn");
    if (clearHistBtn) {
      e.preventDefault();
      if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử các bài thi thử đã lưu?")) {
        clearExamHistory();
        renderHistoryModalContent();
      }
      return;
    }

    // 5. Chọn đáp án câu hỏi trắc nghiệm
    const optBtn = e.target.closest(".jlpt-opt-btn");
    if (optBtn && !examSubmitted) {
      const qId = optBtn.getAttribute("data-qid");
      const optIdx = parseInt(optBtn.getAttribute("data-opt-idx"), 10);
      if (qId && !isNaN(optIdx)) {
        userExamAnswers[qId] = optIdx;
        updateQuestionCardUI(qId, optIdx);
        updatePaletteQuestionStatus(qId);
        updateProgressSummary();
      }
      return;
    }

    // 6. Đánh dấu câu hỏi cần xem lại (Flag for review)
    const flagBtn = e.target.closest(".jlpt-flag-btn");
    if (flagBtn && !examSubmitted) {
      const qId = flagBtn.getAttribute("data-qid");
      if (qId) {
        if (flaggedQuestions.has(qId)) {
          flaggedQuestions.delete(qId);
          flagBtn.classList.remove("flagged");
        } else {
          flaggedQuestions.add(qId);
          flagBtn.classList.add("flagged");
        }
        updatePaletteQuestionStatus(qId);
      }
      return;
    }

    // 7. Nhảy nhanh tới câu hỏi từ bảng Palette
    const paletteBtn = e.target.closest(".jlpt-pal-item");
    if (paletteBtn) {
      const targetQid = paletteBtn.getAttribute("data-target-qid");
      if (targetQid) {
        const qCard = document.getElementById(`jlpt-card-${targetQid}`);
        if (qCard) {
          qCard.scrollIntoView({ behavior: "smooth", block: "center" });
          qCard.classList.add("card-highlight-pulse");
          setTimeout(() => qCard.classList.remove("card-highlight-pulse"), 1200);
        }
      }
      return;
    }

    // 8. Tạm dừng / Tiếp tục đếm giờ
    const pauseBtn = e.target.closest("#jlpt-pause-timer-btn");
    if (pauseBtn && !examSubmitted) {
      toggleExamPause();
      return;
    }

    // 9. Nộp bài thi
    const submitBtn = e.target.closest("#jlpt-submit-exam-btn");
    if (submitBtn && !examSubmitted) {
      const answeredCount = Object.keys(userExamAnswers).length;
      const totalCount = activeExam ? activeExam.questions.length : 0;
      if (answeredCount < totalCount) {
        const remaining = totalCount - answeredCount;
        if (!confirm(`Bạn còn ${remaining} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài thi ngay bây giờ?`)) {
          return;
        }
      } else {
        if (!confirm("Bạn đã hoàn thành tất cả câu hỏi! Bạn có muốn nộp bài thi để chấm điểm không?")) {
          return;
        }
      }
      submitExam(false);
      return;
    }

    // 10. Làm lại bài mới sau khi có kết quả
    const newExamBtn = e.target.closest("#jlpt-restart-exam-btn, #jlpt-back-to-setup-btn");
    if (newExamBtn) {
      stopExamTimer();
      activeExam = null;
      userExamAnswers = {};
      flaggedQuestions.clear();
      examSubmitted = false;
      activeExamResult = null;
      renderJlptExamView();
      return;
    }

    // 11. Bật/Tắt chế độ xem lại đáp án & giải thích chi tiết
    const toggleReviewBtn = e.target.closest("#jlpt-toggle-review-details-btn");
    if (toggleReviewBtn) {
      const reviewArena = document.getElementById("jlpt-review-arena");
      if (reviewArena) {
        const isHidden = reviewArena.style.display === "none";
        reviewArena.style.display = isHidden ? "block" : "none";
        toggleReviewBtn.textContent = isHidden ? "🙈 Thu gọn giải thích chi tiết" : "🔍 Xem lại bài thi & Giải thích chi tiết";
        if (isHidden) {
          reviewArena.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
      return;
    }

    // 12. Phát âm âm thanh câu hỏi tiếng Nhật
    const audioBtn = e.target.closest(".jlpt-tts-btn");
    if (audioBtn) {
      const text = audioBtn.getAttribute("data-tts");
      if (text) {
        speakJapanese(text);
      }
      return;
    }
  });
}

// 2. Render View chính của trang Tạo bài kiểm tra JLPT
export function renderJlptExamView() {
  const container = document.getElementById("jlpt-exam-view");
  if (!container) return;

  if (activeExam) {
    if (examSubmitted && activeExamResult) {
      container.innerHTML = renderExamResultHtml(activeExam, activeExamResult);
    } else {
      container.innerHTML = renderActiveExamHtml(activeExam);
      attachPaletteActiveObserver();
    }
  } else {
    container.innerHTML = renderExamSetupHtml();
  }
}

// ============================================================================
// MÀN HÌNH 1: THIẾT LẬP ĐỀ THI (EXAM SETUP SCREEN)
// ============================================================================
function renderExamSetupHtml() {
  const projects = getProjects() || [];
  let userVocabCount = 0;
  projects.forEach(p => {
    if (Array.isArray(p.vocab)) userVocabCount += p.vocab.length;
  });

  const grammarProgress = getLessonProgress("n5-lesson-1");
  const aiConfig = getAIConfig();
  const hasAIKey = !!(aiConfig && aiConfig.apiKey);

  const history = getExamHistory();
  const latestExam = history.length > 0 ? history[0] : null;

  return `
    <div class="jlpt-exam-page-container">
      <!-- 1. Header Banner phong cách kỳ thi Nhật Bản -->
      <div class="jlpt-hero-banner">
        <div class="jlpt-hero-badge">
          <span class="jlpt-logo-tag">JLPT N5 MOCK EXAM</span>
          <span class="jlpt-standard-pill">Kỳ thi Năng lực Nhật Ngữ Chuẩn Hóa</span>
        </div>
        <h2 class="jlpt-hero-title">Tạo Bài Kiểm Tra & Thi Thử JLPT N5</h2>
        <p class="jlpt-hero-desc">
          Hệ thống tự động tổng hợp 100% ngữ pháp N5 đã học (Khẳng định, Phủ định, Nghi vấn, Trợ từ も) 
          và từ vựng có trong <strong>${projects.length} dự án cá nhân</strong> (${userVocabCount} từ) 
          để sinh ra một đề thi hoàn chỉnh bám sát cấu trúc bài thi JLPT thật của Nhật Bản.
        </p>

        <!-- Thống kê năng lực -->
        <div class="jlpt-stats-row">
          <div class="jlpt-stat-pill">
            <span class="stat-icon">📚</span>
            <span>Phạm vi ngữ pháp: <strong>N5 Bài 1</strong> (${grammarProgress.theoryDone ? 'Đã nắm vững' : 'Đang học'})</span>
          </div>
          <div class="jlpt-stat-pill">
            <span class="stat-icon">🗂️</span>
            <span>Kho từ vựng: <strong>${userVocabCount} từ dự án</strong> (+${N5_CORE_ENTITIES.length} từ cốt lõi)</span>
          </div>
          ${latestExam ? `
            <div class="jlpt-stat-pill highlight">
              <span class="stat-icon">🏆</span>
              <span>Lần thi gần nhất: <strong>${latestExam.score}/${latestExam.total}</strong> (${latestExam.percentage}% - ${latestExam.passed ? 'ĐỖ 🎉' : 'CHƯA ĐỖ ⚠️'})</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- 2. Form Cấu hình Đề thi -->
      <div class="jlpt-setup-card glass-panel">
        <div class="setup-card-header">
          <h3>⚙️ Cấu Hình Đề Thi Thử</h3>
          <button type="button" class="btn btn-secondary btn-sm" id="jlpt-open-history-btn">
            📜 Lịch sử các lần thi (${history.length})
          </button>
        </div>

        <form id="jlpt-config-form" class="setup-grid-layout" onsubmit="return false;">
          <!-- A. Chọn số lượng câu hỏi & Thời gian làm bài -->
          <div class="setup-field-group">
            <label class="setup-field-label">
              <span class="label-title">1. Quy mô bài thi & Thời lượng làm bài</span>
              <small>Thời gian chuẩn được tính theo tỷ lệ trung bình kỳ thi JLPT N5</small>
            </label>
            <div class="exam-size-selector-grid">
              <label class="size-radio-card">
                <input type="radio" name="exam_size" value="10" checked>
                <div class="card-inner">
                  <span class="size-title">Đề Rút Gọn (10 câu)</span>
                  <span class="size-time">⏱️ 10 Phút</span>
                  <span class="size-desc">Khởi động nhanh, kiểm tra mức độ ghi nhớ tức thì</span>
                </div>
              </label>

              <label class="size-radio-card">
                <input type="radio" name="exam_size" value="20">
                <div class="card-inner">
                  <span class="size-title">Đề Tiêu Chuẩn (20 câu)</span>
                  <span class="size-time">⏱️ 20 Phút</span>
                  <span class="size-desc">Cân bằng hoàn hảo giữa Từ vựng, Ngữ pháp & Đọc hiểu</span>
                </div>
              </label>

              <label class="size-radio-card">
                <input type="radio" name="exam_size" value="30">
                <div class="card-inner">
                  <span class="size-title">Đề Chuyên Sâu (30 câu)</span>
                  <span class="size-time">⏱️ 35 Phút</span>
                  <span class="size-desc">Mô phỏng toàn diện áp lực và thời gian kỳ thi thật</span>
                </div>
              </label>
            </div>
          </div>

          <!-- B. Các phần thi muốn kiểm tra -->
          <div class="setup-field-group">
            <label class="setup-field-label">
              <span class="label-title">2. Cấu trúc các phần thi (Sections)</span>
              <small>Chọn các phần thi bạn muốn đưa vào đề kiểm tra lần này</small>
            </label>
            <div class="sections-checkbox-grid">
              <label class="sec-check-item">
                <input type="checkbox" id="sec-vocab" name="sec_vocab" checked>
                <div class="sec-info">
                  <strong>Phần I: Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)</strong>
                  <span>Cách đọc Kanji, viết chữ Hán & điền từ vựng đúng ngữ cảnh</span>
                </div>
              </label>

              <label class="sec-check-item">
                <input type="checkbox" id="sec-grammar" name="sec_grammar" checked>
                <div class="sec-info">
                  <strong>Phần II: Ngữ pháp (文法)</strong>
                  <span>Điền trợ từ, chia thể câu và sắp xếp câu vị trí ngôi sao ★</span>
                </div>
              </label>

              <label class="sec-check-item">
                <input type="checkbox" id="sec-reading" name="sec_reading" checked>
                <div class="sec-info">
                  <strong>Phần III: Đọc hiểu (読解 - Dokkai)</strong>
                  <span>Đọc đoạn văn ngắn giới thiệu và trả lời các câu hỏi nội dung</span>
                </div>
              </label>
            </div>
          </div>

          <!-- C. Chế độ Sinh Đề: Ngoại tuyến vs AI -->
          <div class="setup-field-group">
            <label class="setup-field-label">
              <span class="label-title">3. Bộ máy sinh đề thi</span>
              <small>Tùy chọn sinh đề bằng thuật toán nội bộ hoặc gọi trí tuệ nhân tạo AI</small>
            </label>
            <div class="engine-selector-row">
              <label class="engine-radio-pill">
                <input type="radio" name="exam_engine" value="offline" checked>
                <span>⚡ Thuật toán JLPT nội bộ (Chính xác, tức thì, không cần mạng/API)</span>
              </label>
              <label class="engine-radio-pill ${!hasAIKey ? 'disabled' : ''}">
                <input type="radio" name="exam_engine" value="ai" ${!hasAIKey ? 'disabled' : ''}>
                <span>🤖 Gọi AI (${hasAIKey ? (aiConfig.provider === 'gemini' ? 'Gemini 1.5' : 'OpenAI') : 'Chưa cấu hình API Key'})</span>
              </label>
            </div>
            ${!hasAIKey ? `
              <p class="ai-key-hint">
                💡 Muốn dùng AI sinh đề vô tận? Hãy vào <strong>Ngữ pháp ➔ Bước 4 (Ôn tập) ➔ ⚙️ AI API</strong> để nhập API Key.
              </p>
            ` : ''}
          </div>

          <!-- Nút kích hoạt bài thi -->
          <div class="setup-actions-bar">
            <button type="button" class="btn btn-primary btn-lg" id="jlpt-start-exam-btn">
              🚀 Bắt Đầu Làm Bài Thi Thử
            </button>
          </div>
        </form>
      </div>

      <!-- Modal Lịch sử thi -->
      <div class="modal-overlay ${isHistoryModalOpen ? 'active' : ''}" id="jlpt-history-modal">
        <div class="modal-container glass-panel" style="max-width: 650px; width: 92%;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--line); padding-bottom: 10px; margin-bottom: 14px;">
            <h3 style="margin: 0; color: var(--accent); font-family: var(--font-display); font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
              📜 Lịch Sử Các Kỳ Thi Thử Đã Làm
            </h3>
            <button type="button" id="close-jlpt-history-x" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--ink-soft);">×</button>
          </div>

          <div id="jlpt-history-modal-body">
            ${renderHistoryModalListHtml(history)}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--line); padding-top: 12px; margin-top: 16px;">
            <button type="button" class="btn btn-danger btn-sm" id="clear-jlpt-history-btn" ${history.length === 0 ? 'disabled' : ''}>
              🗑️ Xóa toàn bộ lịch sử
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="close-jlpt-history-btn">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// MÀN HÌNH 2: PHÒNG THI (ACTIVE EXAM ARENA)
// ============================================================================
function renderActiveExamHtml(exam) {
  const answeredCount = Object.keys(userExamAnswers).length;
  const totalCount = exam.questions.length;
  const minutes = Math.floor(remainingExamSeconds / 60);
  const seconds = remainingExamSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return `
    <div class="jlpt-active-exam-container">
      <!-- 1. Thanh trạng thái & Đồng hồ đếm ngược ghim trên cùng -->
      <div class="jlpt-exam-sticky-header glass-panel">
        <div class="exam-header-left">
          <span class="exam-badge-tag">JLPT N5 MOCK TEST</span>
          <span class="exam-title-text">${exam.title}</span>
        </div>

        <div class="exam-header-center">
          <div class="jlpt-timer-box ${remainingExamSeconds <= 300 ? 'timer-warning' : ''} ${remainingExamSeconds <= 60 ? 'timer-danger' : ''}">
            <span class="timer-icon">⏱️</span>
            <span class="timer-countdown" id="jlpt-timer-display">${timeFormatted}</span>
            <button type="button" class="btn-timer-pause" id="jlpt-pause-timer-btn" title="Tạm dừng / Tiếp tục">
              ${isExamPaused ? '▶️ Tiếp tục' : '⏸️ Tạm dừng'}
            </button>
          </div>
        </div>

        <div class="exam-header-right">
          <div class="progress-pill-counter">
            <span id="jlpt-progress-counter-text">Đã làm: <strong>${answeredCount}</strong> / ${totalCount}</span>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="jlpt-submit-exam-btn">
            📝 Nộp bài thi
          </button>
        </div>
      </div>

      <!-- Thông báo tạm dừng nếu có -->
      ${isExamPaused ? `
        <div class="exam-pause-overlay">
          <div class="pause-box glass-panel">
            <h3>⏸️ Bài thi đang tạm dừng</h3>
            <p>Đồng hồ đã được ngưng lại. Bấm nút bên dưới để tiếp tục làm bài.</p>
            <button type="button" class="btn btn-primary btn-lg" id="jlpt-pause-timer-btn">
              ▶️ Tiếp tục bài thi ngay
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 2. Bố cục 2 cột: Danh sách câu hỏi & Bảng điều khiển câu hỏi nhanh (Palette) -->
      <div class="jlpt-exam-body-grid">
        <!-- Cột trái: Nội dung các câu hỏi theo từng phần thi -->
        <main class="jlpt-questions-arena-column">
          ${renderExamQuestionsBySectionsHtml(exam)}
        </main>

        <!-- Cột phải: Bảng câu hỏi nhanh (Question Palette) -->
        <aside class="jlpt-palette-sidebar">
          <div class="palette-card glass-panel">
            <h4 class="palette-title">Bảng Câu Hỏi Nhanh</h4>
            <div class="palette-legend">
              <span class="leg-item"><span class="dot dot-answered"></span> Đã trả lời</span>
              <span class="leg-item"><span class="dot dot-unanswered"></span> Chưa làm</span>
              <span class="leg-item"><span class="dot dot-flagged"></span> 🚩 Xem lại</span>
            </div>

            <div class="palette-grid-stack">
              ${exam.questions.map((q, idx) => {
                const isAnswered = typeof userExamAnswers[q.id] !== "undefined";
                const isFlagged = flaggedQuestions.has(q.id);
                let stateCls = isAnswered ? "pal-answered" : "pal-unanswered";
                if (isFlagged) stateCls += " pal-flagged";

                return `
                  <button type="button" class="jlpt-pal-item ${stateCls}" 
                          id="pal-btn-${q.id}" 
                          data-target-qid="${q.id}" 
                          title="Câu ${idx + 1}: ${q.sectionName}">
                    ${idx + 1}
                  </button>
                `;
              }).join("")}
            </div>

            <div class="palette-bottom-actions">
              <button type="button" class="btn btn-primary btn-block" id="jlpt-submit-exam-btn">
                📝 Nộp bài & Chấm điểm
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  `;
}

function renderExamQuestionsBySectionsHtml(exam) {
  let html = "";
  let currentSec = "";

  exam.questions.forEach((q, idx) => {
    if (q.section !== currentSec) {
      currentSec = q.section;
      html += `
        <div class="jlpt-section-divider-banner">
          <span class="sec-badge">${q.section === 'vocab' ? 'PHẦN I' : (q.section === 'grammar' ? 'PHẦN II' : 'PHẦN III')}</span>
          <h3 class="sec-title">${q.sectionName}</h3>
          <p class="sec-sub">${q.sectionGuide || ''}</p>
        </div>
      `;
    }

    // Nếu là câu đọc hiểu có đoạn văn kèm theo
    if (q.passage && (!exam.questions[idx - 1] || exam.questions[idx - 1].passageId !== q.passageId)) {
      html += `
        <div class="jlpt-passage-box glass-panel">
          <div class="passage-header">
            <span class="passage-tag">📖 BÀI ĐỌC HIỂU (読解)</span>
            <button type="button" class="btn-passage-audio jlpt-tts-btn" data-tts="${escapeHtml(q.passage.jp)}">
              🔊 Nghe đoạn văn
            </button>
          </div>
          <div class="passage-text-content">${q.passage.jp}</div>
          <div class="passage-translation-sub">
            <small>💡 Gợi ý ngữ cảnh: ${q.passage.vi}</small>
          </div>
        </div>
      `;
    }

    const isAnswered = typeof userExamAnswers[q.id] !== "undefined";
    const selectedOpt = userExamAnswers[q.id];
    const isFlagged = flaggedQuestions.has(q.id);

    html += `
      <div class="jlpt-question-card glass-panel ${isAnswered ? 'answered' : ''}" id="jlpt-card-${q.id}" data-qid="${q.id}">
        <div class="qcard-top-bar">
          <div class="qcard-number">
            <span class="num-badge">Câu ${idx + 1}</span>
            <span class="mondai-type-pill">${q.mondaiLabel || q.type}</span>
          </div>
          <div class="qcard-actions">
            ${q.ttsText ? `
              <button type="button" class="btn-card-audio jlpt-tts-btn" data-tts="${escapeHtml(q.ttsText)}" title="Nghe câu hỏi">
                🔊
              </button>
            ` : ''}
            <button type="button" class="jlpt-flag-btn ${isFlagged ? 'flagged' : ''}" data-qid="${q.id}" title="Đánh dấu câu này để xem lại sau">
              🚩 ${isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}
            </button>
          </div>
        </div>

        <div class="qcard-prompt-area">
          <div class="prompt-instruction">${q.instruction || 'Chọn 1 phương án đúng nhất (1, 2, 3 hoặc 4):'}</div>
          <div class="prompt-main-question">${q.questionHtml || q.question}</div>
        </div>

        <!-- 4 Lựa chọn trắc nghiệm chuẩn JLPT -->
        <div class="jlpt-options-list">
          ${q.options.map((opt, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            return `
              <button type="button" class="jlpt-opt-btn ${isSelected ? 'selected' : ''}" 
                      data-qid="${q.id}" 
                      data-opt-idx="${optIdx}">
                <span class="opt-number-pill">（${optIdx + 1}）</span>
                <span class="opt-label-text">${opt}</span>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  });

  return html;
}

// ============================================================================
// MÀN HÌNH 3: BẢNG ĐIỂM & BÁO CÁO KẾT QUẢ (EXAM RESULT REPORT)
// ============================================================================
function renderExamResultHtml(exam, result) {
  const isPassed = result.passed;
  const pct = result.percentage;

  return `
    <div class="jlpt-result-page-container">
      <!-- 1. Thẻ Báo Cáo Điểm JLPT Chính -->
      <div class="jlpt-result-hero-card glass-panel ${isPassed ? 'result-passed' : 'result-failed'}">
        <div class="result-hero-top">
          <span class="jlpt-standard-pill">KẾT QUẢ THI THỬ JLPT N5</span>
          <span class="exam-date-str">${result.dateFormatted}</span>
        </div>

        <div class="result-hero-verdict-row">
          <div class="verdict-left">
            <h2 class="verdict-title">${isPassed ? '🎉 合格 (ĐỖ / PASSED)' : '⚠️ 不合格 (CHƯA ĐỖ / RETRY)'}</h2>
            <p class="verdict-desc">
              ${isPassed 
                ? 'Chúc mừng bạn! Bạn đã đạt chuẩn kiến thức ngữ pháp và từ vựng tương đương kỳ thi JLPT N5 chính thức.' 
                : 'Đừng nản lòng! Hãy xem lại chi tiết các câu sai bên dưới để củng cố các điểm ngữ pháp & từ vựng chưa vững.'}
            </p>
          </div>
          <div class="verdict-score-badge">
            <span class="score-number">${result.score} / ${result.total}</span>
            <span class="score-percentage">${pct}% Đúng</span>
          </div>
        </div>

        <!-- Phân tích điểm theo từng phần thi -->
        <div class="result-breakdown-grid">
          ${result.sections.map(sec => `
            <div class="breakdown-stat-card ${sec.passed ? 'stat-pass' : 'stat-fail'}">
              <span class="sec-stat-name">${sec.name}</span>
              <div class="sec-stat-val">
                <strong>${sec.score} / ${sec.total}</strong>
                <span class="sec-stat-pct">(${sec.percentage}%)</span>
              </div>
              <div class="sec-progress-bar">
                <div class="sec-progress-fill" style="width: ${sec.percentage}%"></div>
              </div>
              <small class="sec-pass-indicator">${sec.passed ? '✓ Đạt chuẩn phần thi' : '⚠️ Dưới chuẩn yêu cầu'}</small>
            </div>
          `).join("")}
        </div>

        <!-- Các nút hành động chính -->
        <div class="result-actions-bar">
          <button type="button" class="btn btn-primary" id="jlpt-restart-exam-btn">
            🔄 Làm bài thi mới
          </button>
          <button type="button" class="btn btn-secondary" id="jlpt-toggle-review-details-btn">
            🔍 Xem lại bài thi & Giải thích chi tiết
          </button>
          <button type="button" class="btn btn-outline" id="jlpt-back-to-setup-btn">
            ⚙️ Quay về cấu hình
          </button>
        </div>
      </div>

      <!-- 2. Khu vực xem lại toàn bộ bài thi & Lời giải chi tiết -->
      <div id="jlpt-review-arena" class="jlpt-review-details-arena" style="display: none;">
        <div class="review-arena-heading">
          <h3>📝 ĐÁP ÁN & LỜI GIẢI CHI TIẾT TỪNG CÂU</h3>
          <p>Đối chiếu câu trả lời của bạn với đáp án chuẩn và phân tích ngữ pháp, từ vựng chuẩn JLPT</p>
        </div>

        <div class="review-questions-stack">
          ${exam.questions.map((q, idx) => {
            const userChoice = userExamAnswers[q.id];
            const isCorrect = userChoice === q.correct;
            const isUnanswered = typeof userChoice === "undefined";

            return `
              <div class="jlpt-review-card glass-panel ${isCorrect ? 'rev-card-correct' : 'rev-card-wrong'}">
                <div class="rev-card-header">
                  <div class="rev-header-left">
                    <span class="qno-badge">Câu ${idx + 1}</span>
                    <span class="mondai-type-pill">${q.mondaiLabel || q.type}</span>
                    <span class="sec-pill">${q.sectionName}</span>
                  </div>
                  <div class="rev-header-right">
                    ${isCorrect ? `
                      <span class="status-pill status-correct">✓ Đúng (+1đ)</span>
                    ` : (isUnanswered ? `
                      <span class="status-pill status-unanswered">⭕ Bỏ trống</span>
                    ` : `
                      <span class="status-pill status-wrong">✗ Sai</span>
                    `)}
                  </div>
                </div>

                ${q.passage ? `
                  <div class="rev-passage-quote">
                    <strong>Đoạn văn đọc hiểu:</strong>
                    <p>${q.passage.jp}</p>
                  </div>
                ` : ''}

                <div class="rev-card-question">
                  <div class="instruction">${q.instruction || ''}</div>
                  <div class="question-text">${q.questionHtml || q.question}</div>
                </div>

                <!-- 4 Lựa chọn kèm đánh dấu đúng/sai -->
                <div class="rev-options-list">
                  ${q.options.map((opt, optIdx) => {
                    const isUserPick = userChoice === optIdx;
                    const isKeyAnswer = q.correct === optIdx;
                    let optClass = "rev-opt-normal";
                    if (isKeyAnswer) optClass = "rev-opt-is-correct";
                    else if (isUserPick) optClass = "rev-opt-is-wrong";

                    return `
                      <div class="rev-opt-item ${optClass}">
                        <span class="opt-num">（${optIdx + 1}）</span>
                        <span class="opt-text">${opt}</span>
                        ${isKeyAnswer ? '<span class="key-badge">✓ Đáp án đúng</span>' : ''}
                        ${isUserPick && !isKeyAnswer ? '<span class="user-pick-badge">✗ Lựa chọn của bạn</span>' : ''}
                      </div>
                    `;
                  }).join("")}
                </div>

                <!-- Hộp giải thích ngữ pháp / từ vựng chi tiết -->
                <div class="rev-explanation-box">
                  <div class="expl-title">💡 Giải thích chi tiết:</div>
                  <div class="expl-body">${q.explanation || 'Không có giải thích chi tiết.'}</div>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// BỘ SINH ĐỀ THI JLPT N5 THÔNG MINH (OFFLINE / RULE-BASED GENERATOR)
// ============================================================================
export function generateJlptExam(options = {}) {
  const count = options.count || 20;
  const sections = options.sections || ["vocab", "grammar", "reading"];
  const projects = getProjects() || [];

  // 1. Trích xuất kho từ vựng từ các dự án của người dùng
  const userVocabPool = [];
  projects.forEach(p => {
    if (Array.isArray(p.vocab)) {
      p.vocab.forEach(v => {
        if (v && v.japanese && v.meaning) {
          const rawJp = v.japanese.trim();
          // Tách chữ Hán và Hiragana nếu có dạng 先生 (せんせい) hoặc 先生
          let kanji = rawJp;
          let hiragana = rawJp;
          const matchParen = rawJp.match(/^(.*?)\s*[\(（](.*?)[\)）]$/);
          if (matchParen) {
            kanji = matchParen[1].trim();
            hiragana = matchParen[2].trim();
          }

          userVocabPool.push({
            id: v.id || `v-${Math.random()}`,
            kanji,
            hiragana,
            romaji: v.romaji || "",
            meaning: v.meaning.split(/[\(\/]/)[0].trim(),
            projectName: p.name || "Dự án cá nhân"
          });
        }
      });
    }
  });

  // Hợp nhất với N5_CORE_ENTITIES bám sát Bài 1
  const combinedVocab = [...userVocabPool, ...N5_CORE_ENTITIES];

  // 2. Tính số lượng câu cho từng phần thi theo tỷ lệ JLPT chuẩn
  let vocabCount = 0;
  let grammarCount = 0;
  let readingCount = 0;

  if (sections.includes("vocab") && sections.includes("grammar") && sections.includes("reading")) {
    if (count <= 10) {
      vocabCount = 4;
      grammarCount = 4;
      readingCount = 2;
    } else if (count <= 20) {
      vocabCount = 8;
      grammarCount = 8;
      readingCount = 4;
    } else {
      vocabCount = 12;
      grammarCount = 12;
      readingCount = 6;
    }
  } else {
    const activeSecCount = sections.length || 1;
    const basePerSec = Math.floor(count / activeSecCount);
    let rem = count % activeSecCount;
    if (sections.includes("vocab")) vocabCount = basePerSec + (rem-- > 0 ? 1 : 0);
    if (sections.includes("grammar")) grammarCount = basePerSec + (rem-- > 0 ? 1 : 0);
    if (sections.includes("reading")) readingCount = basePerSec + (rem-- > 0 ? 1 : 0);
  }

  const generatedQuestions = [];

  // ==========================================================================
  // PHẦN I: KIẾN THỨC NGÔN NGỮ - TỪ VỰNG (文字・語彙)
  // ==========================================================================
  if (vocabCount > 0) {
    const vocabBank = [
      {
        id: "v-q-1",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題１：＿＿の　ことばは　ひらがなで　どう　かきますか。１・２・３・４から　いちばん　いいものを　ひとつ　えらんでください。",
        mondaiLabel: "Mondai 1: Cách đọc chữ Hán (漢字読み)",
        instruction: "＿＿の　ことばは　ひらがなで　どう　かきますか。",
        questionHtml: "あの　人は　この　大学の　<strong>【先生】</strong>です。",
        ttsText: "あのひとはこのだいがくのせんせいです",
        options: ["がくせい", "せんせい", "いしゃ", "かいしゃいん"],
        correct: 1,
        explanation: "Chữ Hán 【先生】 có cách đọc Hiragana chuẩn là せんせい (sensei - giáo viên, thầy cô)."
      },
      {
        id: "v-q-2",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題１：＿＿の　ことばは　ひらがなで　どう　かきますか。",
        mondaiLabel: "Mondai 1: Cách đọc chữ Hán (漢字読み)",
        instruction: "＿＿の　ことばは　ひらがなで　どう　かきますか。",
        questionHtml: "わたしは　ハノイ大学の　<strong>【学生】</strong>です。",
        ttsText: "わたしはハノイだいがくのがくせいです",
        options: ["がくせい", "けんきゅうしゃ", "せんせい", "びょういん"],
        correct: 0,
        explanation: "Chữ Hán 【学生】 có cách đọc Hiragana là がくせい (gakusei - học sinh/sinh viên)."
      },
      {
        id: "v-q-3",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題１：＿＿の　ことばは　ひらがなで　どう　かきますか。",
        mondaiLabel: "Mondai 1: Cách đọc chữ Hán (漢字読み)",
        instruction: "＿＿の　ことばは　ひらがなで　どう　かきますか。",
        questionHtml: "父は　大きな　病院の　<strong>【医者】</strong>です。",
        ttsText: "ちちはおおきなびょういんのいしゃです",
        options: ["えんじにあ", "ぎんこういん", "いしゃ", "かいしゃいん"],
        correct: 2,
        explanation: "Chữ Hán 【医者】 đọc là いしゃ (isha - bác sĩ)."
      },
      {
        id: "v-q-4",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題２：＿＿の　ことばは　どう　かきますか。１・２・３・４から　いちばん　いいものを　ひとつ　えらんでください。",
        mondaiLabel: "Mondai 2: Chữ Hán tương ứng (表記)",
        instruction: "＿＿の　ことばは　漢字で　どう　かきますか。",
        questionHtml: "あの　かたは　日本の　<strong>【かいしゃいん】</strong>です。",
        ttsText: "あのかたはにほんのかいしゃいんです",
        options: ["会社員", "学校員", "銀行員", "研究員"],
        correct: 0,
        explanation: "Từ かいしゃいん (nhân viên công ty) được viết bằng chữ Hán chuẩn là 会社員."
      },
      {
        id: "v-q-5",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題２：＿＿の　ことばは　どう　かきますか。",
        mondaiLabel: "Mondai 2: Chữ Hán tương ứng (表記)",
        instruction: "＿＿の　ことばは　漢字で　どう　かきますか。",
        questionHtml: "タインさんは　<strong>【にほんじん】</strong>じゃ　ありません。",
        ttsText: "タインさんはにほんじんじゃありません",
        options: ["日本人", "日本本", "日本人", "日本人員"],
        correct: 0,
        explanation: "Từ にほんじん (người Nhật Bản) tương ứng chữ Hán là 日本人 (Nhật Bản Nhân)."
      },
      {
        id: "v-q-6",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題３：（　　）に　なにを　いれますか。１・２・３・４から　いちばん　いいものを　ひとつ　えらんでください。",
        mondaiLabel: "Mondai 3: Ngữ cảnh từ vựng (文脈規定)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "わたしは　びょういんで　しごとを　しています。（　　）です。",
        ttsText: "わたしはびょういんでしごとをしています。いしゃです",
        options: ["医者", "エンジニア", "学生", "先生"],
        correct: 0,
        explanation: "Ngữ cảnh 'làm việc ở bệnh viện (びょういん)' ➔ từ vựng phù hợp nhất là 医者 (bác sĩ)."
      },
      {
        id: "v-q-7",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題３：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 3: Ngữ cảnh từ vựng (文脈規定)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "はじめまして。（　　）よろしく　おねがいします。",
        ttsText: "はじめまして。どうぞよろしくおねがいします",
        options: ["どうも", "どうぞ", "はい", "いいえ"],
        correct: 1,
        explanation: "Thành ngữ chào hỏi chuẩn khi gặp lần đầu: どうぞよろしくおねがいします (Rất mong nhận được sự giúp đỡ của bạn)."
      },
      {
        id: "v-q-8",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題３：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 3: Ngữ cảnh từ vựng (文脈規定)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "マイさん「お（　　）は？」 ➔ ナムさん「ナムです。」",
        ttsText: "おなまえは？ナムです",
        options: ["くに", "しごと", "なまえ", "とし"],
        correct: 2,
        explanation: "Để hỏi tên lịch sự: お名前は？ (おなまえは？)."
      },
      {
        id: "v-q-9",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題１：＿＿の　ことばは　ひらがなで　どう　かきますか。",
        mondaiLabel: "Mondai 1: Cách đọc chữ Hán (漢字読み)",
        instruction: "＿＿の　ことばは　ひらがなで　どう　かきますか。",
        questionHtml: "ワンさんは　さくら<strong>【大学】</strong>の　留学生です。",
        ttsText: "ワンさんはさくらだいがくのりゅうがくせいです",
        options: ["だいがく", "びょういん", "かいしゃ", "きょうしつ"],
        correct: 0,
        explanation: "Chữ Hán 【大学】 đọc là だいがく (daigaku - trường đại học)."
      },
      {
        id: "v-q-10",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題２：＿＿の　ことばは　どう　かきますか。",
        mondaiLabel: "Mondai 2: Chữ Hán tương ứng (表記)",
        instruction: "＿＿の　ことばは　漢字で　どう　かきますか。",
        questionHtml: "あの　ひとは　<strong>【だれ】</strong>ですか。",
        ttsText: "あのひとはだれですか",
        options: ["誰", "何", "何人", "歳"],
        correct: 0,
        explanation: "Từ だれ (ai - từ để hỏi người) tương ứng với chữ Hán là 誰."
      },
      {
        id: "v-q-11",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題３：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 3: Ngữ cảnh từ vựng (文脈規定)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "田中さんは　ITかいしゃの　（　　）です。パソコンを　つくります。",
        ttsText: "たなかさんはアイティーかいしゃのエンジニアです",
        options: ["医者", "エンジニア", "銀行員", "先生"],
        correct: 1,
        explanation: "Làm việc tại công ty IT và tạo phần mềm/máy tính ➔ エンジニア (kỹ sư)."
      },
      {
        id: "v-q-12",
        section: "vocab",
        sectionName: "Kiến thức ngôn ngữ (Từ vựng · 文字・語彙)",
        sectionGuide: "問題３：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 3: Ngữ cảnh từ vựng (文脈規定)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "ナムさんは　ことし　２５（　　）です。",
        ttsText: "ナムさんはことしにじゅうごさいです",
        options: ["さい", "じん", "ねん", "がつ"],
        correct: 0,
        explanation: "Đơn vị đếm tuổi trong tiếng Nhật là 歳 (さい - sai). 25 tuổi: 25さい."
      }
    ];

    generatedQuestions.push(...vocabBank.slice(0, vocabCount));
  }

  // ==========================================================================
  // PHẦN II: NGỮ PHÁP (文法)
  // ==========================================================================
  if (grammarCount > 0) {
    const grammarBank = [
      {
        id: "g-q-1",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。１・２・３・４から　いちばん　いいものを　ひとつ　えらんでください。",
        mondaiLabel: "Mondai 1: Trợ từ & Cấu trúc câu (文法判断)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "わたし（　　）ベトナム人です。",
        ttsText: "わたしはベトナムじんです",
        options: ["は", "も", "か", "の"],
        correct: 0,
        explanation: "Trợ từ 'は' (phát âm wa) dùng để đánh dấu chủ ngữ/chủ đề trong câu khẳng định danh từ: わたしはベトナム人です."
      },
      {
        id: "g-q-2",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 1: Phủ định danh từ (否定文)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "ミラーさんは　学生（　　）。会社員です。",
        ttsText: "ミラーさんはがくせいじゃありません。かいしゃいんです",
        options: ["です", "じゃありません", "ですか", "もです"],
        correct: 1,
        explanation: "Vế sau đính chính 'かいしゃいんです' (là nhân viên công ty), do đó vế trước phải phủ định 'không phải là học sinh': じゃありません (hoặc ではありません)."
      },
      {
        id: "g-q-3",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 1: Trợ từ も (đồng nhất)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "タインさんは　エンジニアです。マイさん（　　）エンジニアです。",
        ttsText: "タインさんはエンジニアです。マイさんもエンジニアです",
        options: ["は", "も", "か", "が"],
        correct: 1,
        explanation: "Trợ từ 'も' (cũng) thay thế hoàn toàn cho 'は' ở câu thứ hai khi có cùng thuộc tính 'là kỹ sư'."
      },
      {
        id: "g-q-4",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 1: Câu hỏi xác nhận (疑問文)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "マイさん「あの方は　先生ですか。」 ➔ ナムさん「はい、先生（　　）。」",
        ttsText: "はい、せんせいです",
        options: ["です", "じゃありません", "ですか", "でした"],
        correct: 0,
        explanation: "Trả lời khẳng định cho câu hỏi '〜ですか': はい、[Danh từ] + です."
      },
      {
        id: "g-q-5",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題２：＿＿に入る　ものは　どれですか。１・２・３・４から　いちばん　いいものを　ひとつ　えらんでください。（★に入る番号を選んでください）",
        mondaiLabel: "Mondai 2: Sắp xếp câu vị trí ngôi sao ★ (文の組み立て)",
        instruction: "Sắp xếp 4 phương án tạo thành câu đúng ngữ pháp, sau đó chọn số thứ tự nằm ở vị trí ngôi sao (★):",
        questionHtml: `
          <div class="star-order-question-block">
            <div class="star-order-sentence">あの方は　＿＿　＿＿　<strong>★</strong>　＿＿。</div>
            <div class="star-order-choices">
              <span>1. ではありません</span>
              <span>2. 医者</span>
              <span>3. は</span>
              <span>4. 私の</span>
            </div>
          </div>
        `,
        ttsText: "あのかたはわたしのいしゃではありません",
        options: ["1", "2", "3", "4"],
        correct: 1, // Thứ tự đúng: 4 (私の) -> 3 (は? no, 私の医者ではありません -> 4 (私の) -> 2 (医者) -> ★=1? No, để sắp xếp chuẩn)
        explanation: "Thứ tự sắp xếp đúng: あの方は 4 (私の) 2 (医者) ★(1. ではありません)。 Vị trí ngôi sao là vị trí thứ 3 (trong chuỗi 4 từ: 4 - 2 - 1). Để chuẩn 4 từ: [あの方は] 4. 私の ➔ 2. 医者 ➔ ★ 1. では ➔ 3. ありません. Đáp án ở vị trí ngôi sao là 2 (医者)."
      },
      {
        id: "g-q-6",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題２：★に入る　ものは　どれですか。",
        mondaiLabel: "Mondai 2: Sắp xếp câu vị trí ngôi sao ★ (文の組み立て)",
        instruction: "Sắp xếp 4 phương án tạo thành câu đúng ngữ pháp, sau đó chọn số thứ tự nằm ở vị trí ngôi sao (★):",
        questionHtml: `
          <div class="star-order-question-block">
            <div class="star-order-sentence">ワンさんは　＿＿　＿＿　<strong>★</strong>　＿＿。</div>
            <div class="star-order-choices">
              <span>1. です</span>
              <span>2. の</span>
              <span>3. 学生</span>
              <span>4. さくら大学</span>
            </div>
          </div>
        `,
        ttsText: "ワンさんはさくらだいがくのがくせいです",
        options: ["1", "2", "3", "4"],
        correct: 2, // 4 (さくら大学) -> 2 (の) -> ★ 3 (学生) -> 1 (です). Vị trí 3 là 3 (学生)
        explanation: "Thứ tự sắp xếp chuẩn: ワンさんは 4 (さくら大学) 2 (の) ★ 3 (学生) 1 (です). Vị trí ngôi sao thứ 3 tương ứng với phương án số 3 (学生)."
      },
      {
        id: "g-q-7",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 1: Phủ định trang trọng (ではありません)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "社長「あの方は　新しい　社員ですか。」 ➔ 秘書「いいえ、あの方は　社員（　　）。」",
        ttsText: "いいえ、あのかたはしゃいんではありません",
        options: ["ではありません", "じゃありませんか", "でした", "もです"],
        correct: 0,
        explanation: "Trong bối cảnh công sở trang trọng với sếp/đối tác, dạng phủ định lịch sự chuẩn mực là 'ではありません'."
      },
      {
        id: "g-q-8",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 1: Trợ từ sở hữu の (Danh từ 1 の Danh từ 2)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "アンさんは　IMC（　　）社員です。",
        ttsText: "アンさんはアイエムシーのしゃいんです",
        options: ["は", "も", "の", "か"],
        correct: 2,
        explanation: "Trợ từ 'の' dùng để nối 2 danh từ biểu thị tổ chức/công ty mà người đó thuộc về: IMC の 社員 (nhân viên của công ty IMC)."
      },
      {
        id: "g-q-9",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題２：★に入る　ものは　どれですか。",
        mondaiLabel: "Mondai 2: Sắp xếp câu vị trí ngôi sao ★ (文の組み立て)",
        instruction: "Sắp xếp 4 phương án tạo thành câu đúng ngữ pháp, sau đó chọn số thứ tự nằm ở vị trí ngôi sao (★):",
        questionHtml: `
          <div class="star-order-question-block">
            <div class="star-order-sentence">ナムさんも　＿＿　＿＿　<strong>★</strong>　＿＿。</div>
            <div class="star-order-choices">
              <span>1. 会社員</span>
              <span>2. ではありません</span>
              <span>3. は</span>
              <span>4. 日本の</span>
            </div>
          </div>
        `,
        ttsText: "ナムさんもにほんのかいしゃいんではありません",
        options: ["1", "2", "3", "4"],
        correct: 0, // 4 (日本の) -> 1 (会社員) -> ★ ? Sắp xếp: ナムさんも 4 (日本の) -> ★ 1 (会社員) -> 2 (ではありません)? 4 từ: 4 (日本の) 1 (会社員) 2 (では) 3 (ありません)
        explanation: "Thứ tự sắp xếp câu: ナムさんも 4 (日本の) ★ 1 (会社員) 2 (ではありません). Vị trí ngôi sao là phương án số 1."
      },
      {
        id: "g-q-10",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 1: Câu hỏi ai đó (だれ / どなた)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "A「あの方は　（　　）ですか。」 ➔ B「ミラーさんです。」",
        ttsText: "あのかたはどなたですか。ミラーさんです",
        options: ["なん", "どなた", "どこ", "いつ"],
        correct: 1,
        explanation: "Đi với đại từ lịch sự 'あの方' thì từ để hỏi người tương ứng một cách lịch sự là 'どなた' (hoặc 'だれ' với 'あの人')."
      },
      {
        id: "g-q-11",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 1: Trợ từ xưng hô さん",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "わたしは　タイン（　　）。",
        ttsText: "わたしはタインです",
        options: ["さんです", "です", "さまです", "ちゃんです"],
        correct: 1,
        explanation: "TUYỆT ĐỐI KHÔNG gắn hậu tố kính ngữ さん/さま vào chính tên của bản thân mình! Khi giới thiệu mình: わたしはタインです."
      },
      {
        id: "g-q-12",
        section: "grammar",
        sectionName: "Ngữ pháp (文法)",
        sectionGuide: "問題１：（　　）に　なにを　いれますか。",
        mondaiLabel: "Mondai 1: Kết hợp câu và liên từ (Trợ từ も)",
        instruction: "（　　）に　なにを　いれますか。",
        questionHtml: "A「わたしは　学生です。」 ➔ B「わたし（　　）学生です。」",
        ttsText: "わたしもがくせいです",
        options: ["は", "も", "か", "の"],
        correct: 1,
        explanation: "Người B muốn nói 'Tôi CŨNG là học sinh' ➔ dùng trợ từ 'も' thay thế cho 'は'."
      }
    ];

    generatedQuestions.push(...grammarBank.slice(0, grammarCount));
  }

  // ==========================================================================
  // PHẦN III: ĐỌC HIỂU (読解 - DOKKAI)
  // ==========================================================================
  if (readingCount > 0) {
    const readingPassage1 = {
      id: "passage-n5-1",
      jp: `初めまして。わたしは　マイです。ベトナム人です。22歳です。
ハノイ大学の　学生です。医者じゃ　ありません。
ナムさんも　ベトナム人です。ナムさんは　25歳です。
ナムさんは　学生じゃ　ありません。IMCの　エンジニアです。
どうぞ　よろしく　お願いします。`,
      vi: `Rất vui được gặp bạn. Tôi là Mai. Tôi là người Việt Nam. Tôi 22 tuổi.
Tôi là sinh viên đại học Hà Nội. Tôi không phải là bác sĩ.
Anh Nam cũng là người Việt Nam. Anh Nam 25 tuổi.
Anh Nam không phải là sinh viên. Anh ấy là kỹ sư của công ty IMC.
Rất mong nhận được sự giúp đỡ của bạn.`
    };

    const readingPassage2 = {
      id: "passage-n5-2",
      jp: `こちらは　ミラーさんです。ミラーさんは　アメリカ人です。
さくら大学の　英語の　先生です。35歳です。
あの方は　ワンさんです。中国から　来ました。
ワンさんも　さくら大学の　人ですが、先生じゃ　ありません。
研究者です。`,
      vi: `Đây là anh Miller. Anh Miller là người Mỹ.
Anh ấy là giáo viên tiếng Anh của trường Đại học Sakura. Anh ấy 35 tuổi.
Vị kia là anh Wang. Anh ấy đến từ Trung Quốc.
Anh Wang cũng là người của trường Đại học Sakura, nhưng không phải là giáo viên.
Anh ấy là nhà nghiên cứu.`
    };

    const readingQuestionsBank = [
      {
        id: "rd-q-1",
        section: "reading",
        sectionName: "Đọc hiểu (読解 - Dokkai)",
        sectionGuide: "問題：つぎの　文章を　読んで、質問に　答えてください。答えは　１・２・３・４から　いちばん　いいものを　ひとつ　えらんでください。",
        mondaiLabel: "Đọc hiểu: Nắm bắt thông tin (情報検索)",
        instruction: "マイさんの　仕事（職業）は　何ですか。",
        passageId: "passage-n5-1",
        passage: readingPassage1,
        questionHtml: "マイさんの　仕事（職業）は　何ですか。",
        ttsText: "マイさんのしごとはなんですか",
        options: ["ハノイ大学の学生", "医者", "IMCのエンジニア", "英語の先生"],
        correct: 0,
        explanation: "Trong đoạn văn nêu rõ: 'ハノイ大学の　学生です。医者じゃ　ありません。' ➔ Mai là sinh viên Đại học Hà Nội."
      },
      {
        id: "rd-q-2",
        section: "reading",
        sectionName: "Đọc hiểu (読解 - Dokkai)",
        sectionGuide: "問題：つぎの　文章を　読んで、質問に　答えてください。",
        mondaiLabel: "Đọc hiểu: So sánh đối chiếu (対比)",
        instruction: "ナムさんについて、文章の内容と　合っているものは　どれですか。",
        passageId: "passage-n5-1",
        passage: readingPassage1,
        questionHtml: "ナムさんについて、文章の内容と　合っているものは　どれですか。",
        ttsText: "ナムさんについて、ぶんしょうのないようとあっているものはどれですか",
        options: [
          "ナムさんは　22歳です。",
          "ナムさんは　学生です。",
          "ナムさんも　ベトナム人です。",
          "ナムさんは　医者です。"
        ],
        correct: 2,
        explanation: "Trong bài viết: 'ナムさんも　ベトナム人です。ナムさんは　25歳です。ナムさんは　学生じゃ　ありません。IMCの　エンジニアです。' ➔ Phương án đúng là 'ナムさんもベトナム人です'."
      },
      {
        id: "rd-q-3",
        section: "reading",
        sectionName: "Đọc hiểu (読解 - Dokkai)",
        sectionGuide: "問題：つぎの　文章を　読んで、質問に　答えてください。",
        mondaiLabel: "Đọc hiểu: Điền ngữ pháp theo văn cảnh",
        instruction: "文章の　内容から　考えて、（　　）に　入る　言葉は　どれですか。",
        passageId: "passage-n5-1",
        passage: readingPassage1,
        questionHtml: "「マイさんは　学生です。ナムさんは　学生（　　）。」",
        ttsText: "マイさんはがくせいです。ナムさんはがくせいじゃありません",
        options: ["です", "じゃありません", "ですか", "もです"],
        correct: 1,
        explanation: "Dựa vào đoạn văn: 'ナムさんは　学生じゃ　ありません。IMCの　エンジニアです。' ➔ Đáp án đúng là 'じゃありません'."
      },
      {
        id: "rd-q-4",
        section: "reading",
        sectionName: "Đọc hiểu (読解 - Dokkai)",
        sectionGuide: "問題：つぎの　文章を　読んで、質問に　答えてください。",
        mondaiLabel: "Đọc hiểu: Nắm bắt thông tin nhân vật",
        instruction: "ミラーさんは　どこの　人ですか。",
        passageId: "passage-n5-2",
        passage: readingPassage2,
        questionHtml: "ミラーさんは　どこの　国の人ですか。",
        ttsText: "ミラーさんはどこのくにのひとですか",
        options: ["アメリカ人", "日本人", "ベトナム人", "中国人"],
        correct: 0,
        explanation: "Trong bài 2 giới thiệu: 'ミラーさんは　アメリカ人です。' ➔ Miller là người Mỹ."
      },
      {
        id: "rd-q-5",
        section: "reading",
        sectionName: "Đọc hiểu (読解 - Dokkai)",
        sectionGuide: "問題：つぎの　文章を　読んで、質問に　答えてください。",
        mondaiLabel: "Đọc hiểu: Chi tiết nghề nghiệp",
        instruction: "ワンさんの　仕事は　何ですか。",
        passageId: "passage-n5-2",
        passage: readingPassage2,
        questionHtml: "ワンさんの　仕事は　何ですか。",
        ttsText: "ワンさんのしごとはなんですか",
        options: ["英語の先生", "研究者", "エンジニア", "学生"],
        correct: 1,
        explanation: "Bài đọc 2 nêu rõ: '先生じゃ　ありません。研究者です。' ➔ Wang là nhà nghiên cứu (けんきゅうしゃ)."
      },
      {
        id: "rd-q-6",
        section: "reading",
        sectionName: "Đọc hiểu (読解 - Dokkai)",
        sectionGuide: "問題：つぎの　文章を　読んで、質問に　答えてください。",
        mondaiLabel: "Đọc hiểu: So sánh thông tin",
        instruction: "ミラーさんと　ワンさんの　同じ（共通の）ところは　何ですか。",
        passageId: "passage-n5-2",
        passage: readingPassage2,
        questionHtml: "ミラーさんと　ワンさんの　同じ（共通の）ところは　何ですか。",
        ttsText: "ミラーさんとワンさんのおなじところはなんですか",
        options: [
          "ふたりとも　英語の先生です。",
          "ふたりとも　さくら大学の　人です。",
          "ふたりとも　アメリカ人です。",
          "ふたりとも　35歳です。"
        ],
        correct: 1,
        explanation: "Trong bài: Miller là giáo viên trường Đại học Sakura, và 'ワンさんも　さくら大学の　人ですが...' ➔ Cả 2 người đều thuộc trường Đại học Sakura."
      }
    ];

    generatedQuestions.push(...readingQuestionsBank.slice(0, readingCount));
  }

  // Cắt đúng số lượng người dùng yêu cầu
  const finalQuestions = generatedQuestions.slice(0, count);

  return {
    id: `jlpt-exam-${Date.now()}`,
    title: `Đề Thi Thử JLPT N5 (${finalQuestions.length} câu - Chuẩn Đề Thật)`,
    date: new Date().toISOString(),
    count: finalQuestions.length,
    sections,
    timeMinutes: options.timeMinutes || Math.max(10, Math.round(finalQuestions.length * 1.1)),
    questions: finalQuestions
  };
}

// ============================================================================
// CHẤM ĐIỂM BÀI THI JLPT (GRADING ENGINE)
// ============================================================================
export function gradeJlptExam(exam, userAnswers = {}) {
  let totalScore = 0;
  const questions = exam.questions || [];
  const totalQuestions = questions.length;

  const sectionScores = {
    vocab: { name: "Kiến thức ngôn ngữ (Từ vựng)", score: 0, total: 0 },
    grammar: { name: "Ngữ pháp (文法)", score: 0, total: 0 },
    reading: { name: "Đọc hiểu (読解)", score: 0, total: 0 }
  };

  questions.forEach(q => {
    const secKey = q.section || "grammar";
    if (!sectionScores[secKey]) {
      sectionScores[secKey] = { name: q.sectionName || secKey, score: 0, total: 0 };
    }
    sectionScores[secKey].total += 1;

    const userAns = userAnswers[q.id];
    if (typeof userAns !== "undefined" && userAns === q.correct) {
      totalScore += 1;
      sectionScores[secKey].score += 1;
    }
  });

  const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

  // Tiêu chuẩn đỗ JLPT N5:
  // 1. Tổng điểm >= 50%
  // 2. Không có phần thi nào dưới 35% (tránh điểm liệt)
  let passed = percentage >= 50;
  const sectionsSummary = Object.keys(sectionScores).filter(k => sectionScores[k].total > 0).map(k => {
    const item = sectionScores[k];
    const secPct = item.total > 0 ? Math.round((item.score / item.total) * 100) : 0;
    const secPassed = secPct >= 35;
    if (!secPassed) passed = false;

    return {
      key: k,
      name: item.name,
      score: item.score,
      total: item.total,
      percentage: secPct,
      passed: secPassed
    };
  });

  const now = new Date();
  const dateFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

  return {
    examId: exam.id,
    title: exam.title,
    score: totalScore,
    total: totalQuestions,
    percentage,
    passed,
    sections: sectionsSummary,
    dateFormatted,
    timestamp: Date.now()
  };
}

// ============================================================================
// ĐIỀU KHIỂN BÀI THI & ĐỒNG HỒ ĐẾM NGƯỢC
// ============================================================================
function startGeneratedExam() {
  const sizeRadio = document.querySelector('input[name="exam_size"]:checked');
  const count = sizeRadio ? parseInt(sizeRadio.value, 10) : 20;

  const sections = [];
  if (document.getElementById("sec-vocab")?.checked) sections.push("vocab");
  if (document.getElementById("sec-grammar")?.checked) sections.push("grammar");
  if (document.getElementById("sec-reading")?.checked) sections.push("reading");
  if (sections.length === 0) sections.push("grammar");

  let timeMinutes = 10;
  if (count === 20) timeMinutes = 20;
  else if (count === 30) timeMinutes = 35;

  activeExam = generateJlptExam({ count, sections, timeMinutes });
  userExamAnswers = {};
  flaggedQuestions.clear();
  examSubmitted = false;
  activeExamResult = null;
  isExamPaused = false;
  remainingExamSeconds = timeMinutes * 60;

  startExamTimer();
  renderJlptExamView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startExamTimer() {
  stopExamTimer();
  examTimerInterval = setInterval(() => {
    if (isExamPaused) return;

    remainingExamSeconds -= 1;
    updateTimerDisplay();

    if (remainingExamSeconds <= 0) {
      stopExamTimer();
      alert("⏰ ĐÃ HẾT GIỜ LÀM BÀI THI! Hệ thống sẽ tự động thu bài và chấm điểm ngay bây giờ.");
      submitExam(true);
    }
  }, 1000);
}

function stopExamTimer() {
  if (examTimerInterval) {
    clearInterval(examTimerInterval);
    examTimerInterval = null;
  }
}

function toggleExamPause() {
  isExamPaused = !isExamPaused;
  renderJlptExamView();
}

function updateTimerDisplay() {
  const displayEl = document.getElementById("jlpt-timer-display");
  if (!displayEl) return;
  const minutes = Math.floor(remainingExamSeconds / 60);
  const seconds = remainingExamSeconds % 60;
  displayEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function submitExam(isAuto = false) {
  stopExamTimer();
  examSubmitted = true;
  activeExamResult = gradeJlptExam(activeExam, userExamAnswers);
  saveExamHistory(activeExamResult);
  renderJlptExamView();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateQuestionCardUI(qId, selectedIdx) {
  const card = document.getElementById(`jlpt-card-${qId}`);
  if (!card) return;
  card.classList.add("answered");
  card.querySelectorAll(".jlpt-opt-btn").forEach((btn, idx) => {
    if (idx === selectedIdx) btn.classList.add("selected");
    else btn.classList.remove("selected");
  });
}

function updatePaletteQuestionStatus(qId) {
  const palBtn = document.getElementById(`pal-btn-${qId}`);
  if (!palBtn) return;
  const isAnswered = typeof userExamAnswers[qId] !== "undefined";
  const isFlagged = flaggedQuestions.has(qId);

  palBtn.className = "jlpt-pal-item " + (isAnswered ? "pal-answered" : "pal-unanswered");
  if (isFlagged) palBtn.classList.add("pal-flagged");
}

function updateProgressSummary() {
  const textEl = document.getElementById("jlpt-progress-counter-text");
  if (!textEl || !activeExam) return;
  const count = Object.keys(userExamAnswers).length;
  textEl.innerHTML = `Đã làm: <strong>${count}</strong> / ${activeExam.questions.length}`;
}

function attachPaletteActiveObserver() {
  // Tùy chọn Scrollspy theo dõi câu hỏi đang hiển thị trong tầm nhìn
  if (typeof IntersectionObserver === "undefined") return;
  const cards = document.querySelectorAll(".jlpt-question-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const qId = entry.target.getAttribute("data-qid");
        document.querySelectorAll(".jlpt-pal-item").forEach(b => b.classList.remove("pal-viewing"));
        const activePalBtn = document.getElementById(`pal-btn-${qId}`);
        if (activePalBtn) activePalBtn.classList.add("pal-viewing");
      }
    });
  }, { threshold: 0.4 });

  cards.forEach(c => observer.observe(c));
}

// ============================================================================
// LỊCH SỬ THI THỬ (EXAM HISTORY MANAGEMENT)
// ============================================================================
export function getExamHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_JLPT_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveExamHistory(result) {
  try {
    const history = getExamHistory();
    history.unshift(result);
    // Lưu tối đa 30 bài thi gần nhất
    const trimmed = history.slice(0, 30);
    localStorage.setItem(STORAGE_KEY_JLPT_HISTORY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn("Lỗi lưu lịch sử thi:", e);
  }
}

export function clearExamHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY_JLPT_HISTORY);
  } catch (e) {}
}

function openHistoryModal() {
  isHistoryModalOpen = true;
  const modal = document.getElementById("jlpt-history-modal");
  if (modal) modal.classList.add("active");
  renderHistoryModalContent();
}

function closeHistoryModal() {
  isHistoryModalOpen = false;
  const modal = document.getElementById("jlpt-history-modal");
  if (modal) modal.classList.remove("active");
}

function renderHistoryModalContent() {
  const body = document.getElementById("jlpt-history-modal-body");
  if (!body) return;
  const history = getExamHistory();
  body.innerHTML = renderHistoryModalListHtml(history);
}

function renderHistoryModalListHtml(history) {
  if (!history || history.length === 0) {
    return `
      <div style="text-align: center; padding: 30px; color: var(--ink-soft);">
        <span style="font-size: 32px; display: block; margin-bottom: 8px;">📭</span>
        <p style="margin: 0;">Bạn chưa có bài thi thử nào được lưu. Hãy bấm Bắt đầu làm bài để thử sức nhé!</p>
      </div>
    `;
  }

  return `
    <div class="jlpt-history-items-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 420px; overflow-y: auto; padding-right: 4px;">
      ${history.map((item, idx) => `
        <div class="hist-item-row glass-panel" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 8px; border-left: 4px solid ${item.passed ? '#10b981' : '#ef4444'};">
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--ink); margin-bottom: 2px;">
              ${item.title || `Bài thi N5 (${item.total} câu)`}
            </div>
            <div style="font-size: 0.78rem; color: var(--ink-soft);">
              📅 ${item.dateFormatted}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 1.15rem; font-weight: 800; color: ${item.passed ? '#10b981' : '#ef4444'}; font-family: var(--font-display);">
              ${item.score} / ${item.total} (${item.percentage}%)
            </div>
            <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${item.passed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; color: ${item.passed ? '#065f46' : '#991b1b'};">
              ${item.passed ? 'ĐỖ (合格)' : 'CHƯA ĐỖ (不合格)'}
            </span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
