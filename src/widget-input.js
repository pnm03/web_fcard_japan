import { bindKanaInput } from "./kana-ime.js";

const inputBox = document.getElementById("input-box");
const answerInput = document.getElementById("answer-input");
const answerHintOverlay = document.getElementById("answer-hint-overlay");
const hintText = document.getElementById("hint-text");
const closeBtn = document.getElementById("close-btn");
const imeBadge = document.getElementById("widget-ime-badge");

let isLocked = false;
let currentMode = "meaning_to_romaji";

function updateWidgetImeBadge(mode, isControllerActive) {
  if (!imeBadge) return;
  imeBadge.className = "widget-ime-badge";
  if (mode === "meaning_to_japanese") {
    if (isControllerActive) {
      imeBadge.classList.add("mode-kana");
      imeBadge.textContent = "あ";
      imeBadge.title = "Bộ gõ tự động tiếng Nhật (F2 để chuyển gõ trực tiếp)";
    } else {
      imeBadge.classList.add("mode-raw");
      imeBadge.textContent = "A";
      imeBadge.title = "Gõ trực tiếp (F2 để bật lại gõ Kana tự động)";
    }
  } else if (mode === "meaning_to_romaji" || mode === "jp_to_romaji") {
    imeBadge.classList.add("mode-romaji");
    imeBadge.textContent = "RO";
    imeBadge.title = "Gõ Romaji";
  } else {
    imeBadge.classList.add("mode-vietnamese");
    imeBadge.textContent = "VI";
    imeBadge.title = "Gõ Tiếng Việt";
  }
}

const kanaController = bindKanaInput(answerInput, {
  mode: "raw",
  onStateChange: ({ isEnabled, mode }) => {
    updateWidgetImeBadge(currentMode, isEnabled && mode === "kana");
  }
});

if (imeBadge) {
  imeBadge.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentMode === "meaning_to_japanese" && kanaController) {
      kanaController.toggleMode();
    }
    answerInput.focus();
  });
}

// Audio feedback qua Web Audio API
function playChime(isSuccess) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isSuccess) {
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {}
}

// Cập nhật câu hỏi mới
if (window.electronAPI && window.electronAPI.onStealthInputUpdate) {
  window.electronAPI.onStealthInputUpdate((data) => {
    isLocked = false;
    inputBox.classList.remove("correct", "wrong", "retry");
    answerHintOverlay.classList.remove("show");
    answerInput.value = "";
    answerInput.disabled = false;
    if (data && data.placeholder) {
      answerInput.placeholder = data.placeholder;
    }
    if (data && data.mode) {
      currentMode = data.mode;
      if (currentMode === "meaning_to_japanese") {
        kanaController.setMode("kana");
        updateWidgetImeBadge(currentMode, true);
      } else {
        kanaController.setMode("raw");
        updateWidgetImeBadge(currentMode, false);
      }
    }
    setTimeout(() => answerInput.focus(), 30);
  });
}

// Phản hồi kết quả đáp án từ main process
if (window.electronAPI && window.electronAPI.onStealthAnswerFeedback) {
  window.electronAPI.onStealthAnswerFeedback(({ isCorrect, solution, retryAllowed, hint, message }) => {
    if (isCorrect) {
      inputBox.classList.remove("wrong", "retry");
      inputBox.classList.add("correct");
      playChime(true);
    } else if (retryAllowed) {
      // Cho phép thử lại 1 lần nữa!
      inputBox.classList.remove("correct");
      inputBox.classList.add("retry");
      setTimeout(() => inputBox.classList.remove("retry"), 800);
      playChime(false);
      answerInput.value = "";
      answerInput.placeholder = message || (hint ? `Thử lại (${hint})... ↵` : "Sai rồi! Nhập lại... ↵");
      answerInput.disabled = false;
      isLocked = false;
      answerInput.focus();
    } else {
      // Sai hoàn toàn -> hiển thị đáp án đúng, bắt buộc bấm Enter để qua câu tiếp
      inputBox.classList.remove("correct", "retry");
      inputBox.classList.add("wrong");
      playChime(false);
      hintText.textContent = `Đ/Á: ${solution || ""}`;
      answerHintOverlay.classList.add("show");
      isLocked = false; // Cho phép bấm Enter để tiếp tục
    }
  });
}

function submitCurrentAnswer() {
  if (answerHintOverlay.classList.contains("show")) {
    // Nếu đang hiển thị gợi ý đáp án sai, bấm Enter chuyển câu ngay
    answerHintOverlay.classList.remove("show");
    inputBox.classList.remove("wrong");
    if (window.electronAPI && window.electronAPI.nextStealthQuestion) {
      window.electronAPI.nextStealthQuestion();
    }
    return;
  }

  if (kanaController) {
    kanaController.finalize();
  }

  const val = answerInput.value.trim();
  if (!val || isLocked) return;

  isLocked = true;
  if (window.electronAPI && window.electronAPI.submitStealthAnswer) {
    window.electronAPI.submitStealthAnswer(val);
  }
}

// Sự kiện bàn phím
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    submitCurrentAnswer();
  } else if (e.key === "Tab") {
    e.preventDefault();
    if (window.electronAPI && window.electronAPI.speakStealth) {
      window.electronAPI.speakStealth();
    }
  } else if (e.key === "Escape") {
    if (window.electronAPI && window.electronAPI.closeStealthQuiz) {
      window.electronAPI.closeStealthQuiz();
    }
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (window.electronAPI && window.electronAPI.closeStealthQuiz) {
      window.electronAPI.closeStealthQuiz();
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
    if (window.electronAPI && window.electronAPI.speakStealth) {
      window.electronAPI.speakStealth();
    }
  }
});

closeBtn.addEventListener("click", () => {
  if (window.electronAPI && window.electronAPI.closeStealthQuiz) {
    window.electronAPI.closeStealthQuiz();
  }
});

// Tự động focus ô nhập khi mở
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => answerInput.focus(), 50);
});
