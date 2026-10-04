const displayWord = document.getElementById("display-word");
const displaySub = document.getElementById("display-sub");
const speakBtn = document.getElementById("speak-btn");
const counterBadge = document.getElementById("counter-badge");

const promptBox = document.getElementById("prompt-box");

let currentSoundText = "";
let cachedJaVoice = null;

function speakJapanese(text) {
  if (!("speechSynthesis" in window) || !text) return;
  window.speechSynthesis.cancel();

  const clean = text.replace(/\([^)]*\)/g, "").replace(/（[^）]*）/g, "").trim();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "ja-JP";
  utterance.rate = 0.92;

  if (!cachedJaVoice) {
    const voices = window.speechSynthesis.getVoices();
    cachedJaVoice = voices.find(v => v.lang.startsWith("ja") || v.lang === "ja_JP");
  }
  if (cachedJaVoice) utterance.voice = cachedJaVoice;

  window.speechSynthesis.speak(utterance);
}

function updateWordText(wordText, subText) {
  const text = wordText || "";
  displayWord.textContent = text;
  displayWord.title = text;
  displaySub.textContent = subText || "";
  displaySub.title = subText || "";
  if (promptBox) {
    promptBox.title = `${text}${subText ? " - " + subText : ""} (Kéo để di chuyển)`;
  }

  // Thu bé kích thước chữ linh hoạt theo độ dài để không bị tràn / cắt cụt chữ
  const len = text.length;
  if (len > 32) {
    displayWord.style.fontSize = "10.5px";
    displayWord.style.lineHeight = "1.15";
  } else if (len > 24) {
    displayWord.style.fontSize = "11.5px";
    displayWord.style.lineHeight = "1.2";
  } else if (len > 18) {
    displayWord.style.fontSize = "12.5px";
    displayWord.style.lineHeight = "1.2";
  } else if (len > 12) {
    displayWord.style.fontSize = "13.5px";
    displayWord.style.lineHeight = "1.25";
  } else {
    displayWord.style.fontSize = "14.5px";
    displayWord.style.lineHeight = "1.25";
  }
}

// Lắng nghe cập nhật câu hỏi từ main process
if (window.electronAPI && window.electronAPI.onStealthPromptUpdate) {
  window.electronAPI.onStealthPromptUpdate((data) => {
    if (!data) return;
    updateWordText(data.word, data.sub);
    counterBadge.textContent = data.counterText || "";
    currentSoundText = data.soundText || data.word || "";
  });
}

// Lắng nghe yêu cầu phát âm
if (window.electronAPI && window.electronAPI.onStealthSpeak) {
  window.electronAPI.onStealthSpeak(() => {
    if (currentSoundText) speakJapanese(currentSoundText);
  });
}

speakBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentSoundText) speakJapanese(currentSoundText);
});
