const displayWord = document.getElementById("display-word");
const displaySub = document.getElementById("display-sub");
const speakBtn = document.getElementById("speak-btn");
const counterBadge = document.getElementById("counter-badge");

const promptBox = document.getElementById("prompt-box");

let currentSoundText = "";
let cachedJaVoice = null;

let currentWidgetAudio = null;

function cleanJapaneseForSpeech(japaneseText) {
  if (!japaneseText) return "";
  let text = String(japaneseText).trim();
  text = text.replace(/\([^)]+\)/g, "").replace(/（[^）]+）/g, "").trim();
  text = text.replace(/[\[\]［］]/g, " ").trim();
  text = text.replace(/[~～〜]/g, " ").trim();
  text = text.replace(/([\u3040-\u30FF])-([\u3040-\u30FF])/g, "$1ー$2");
  text = text.replace(/([\u3040-\u30FF])-(?=\s|$)/g, "$1ー");
  return text.replace(/\s+/g, " ").trim();
}

function speakJapanese(text) {
  const clean = cleanJapaneseForSpeech(text);
  if (!clean) return;

  if (currentWidgetAudio) {
    try {
      currentWidgetAudio.pause();
      currentWidgetAudio.currentTime = 0;
    } catch {}
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  if (typeof Audio !== "undefined") {
    try {
      const audioUrl = "https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=" + encodeURIComponent(clean);
      const audio = new Audio(audioUrl);
      currentWidgetAudio = audio;
      audio.playbackRate = 0.92;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => speakJapaneseViaSpeechSynthesis(clean));
      }
      return;
    } catch {}
  }

  speakJapaneseViaSpeechSynthesis(clean);
}

function speakJapaneseViaSpeechSynthesis(clean) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !clean) return;
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
