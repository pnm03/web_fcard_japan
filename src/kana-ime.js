/**
 * Bộ gõ tiếng Nhật thông minh (In-App Kana IME)
 * Tự động chuyển đổi phím gõ Romaji thành chữ Nhật (Hiragana / Katakana) trong thời gian thực.
 * Tự động triệt tiêu dấu tiếng Việt từ Telex/Unikey để người dùng không cần phải đổi bàn phím hệ điều hành.
 */

export const HIRAGANA_MAP = {
  // Nguyên âm
  "a": "あ", "i": "い", "u": "う", "e": "え", "o": "お",
  
  // Hàng K
  "ka": "か", "ki": "き", "ku": "く", "ke": "け", "ko": "こ",
  "kya": "きゃ", "kyu": "きゅ", "kye": "きぇ", "kyo": "きょ",
  
  // Hàng G (Đục K)
  "ga": "が", "gi": "ぎ", "gu": "ぐ", "ge": "げ", "go": "ご",
  "gya": "ぎゃ", "gyu": "ぎゅ", "gye": "ぎぇ", "gyo": "ぎょ",
  
  // Hàng S
  "sa": "さ", "si": "し", "shi": "し", "su": "す", "se": "せ", "so": "そ",
  "sha": "しゃ", "shu": "しゅ", "she": "しぇ", "sho": "しょ",
  "sya": "しゃ", "syu": "しゅ", "sye": "しぇ", "syo": "しょ",
  
  // Hàng Z / J (Đục S)
  "za": "ざ", "zi": "じ", "ji": "じ", "zu": "ず", "ze": "ぜ", "zo": "ぞ",
  "ja": "じゃ", "ju": "じゅ", "je": "じぇ", "jo": "じょ",
  "jya": "じゃ", "jyu": "じゅ", "jye": "じぇ", "jyo": "じょ",
  "zya": "じゃ", "zyu": "じゅ", "zye": "じぇ", "zyo": "じょ",
  
  // Hàng T
  "ta": "た", "ti": "ち", "chi": "ち", "tu": "つ", "tsu": "つ", "te": "て", "to": "と",
  "cha": "ちゃ", "chu": "ちゅ", "che": "ちぇ", "cho": "ちょ",
  "tya": "ちゃ", "tyu": "ちゅ", "tye": "ちぇ", "tyo": "ちょ",
  "cya": "ちゃ", "cyu": "ちゅ", "cye": "ちぇ", "cyo": "ちょ",
  "tsa": "つぁ", "tsi": "つぃ", "tse": "つぇ", "tso": "つぉ",
  
  // Hàng D (Đục T)
  "da": "だ", "di": "ぢ", "du": "づ", "de": "で", "do": "ど",
  "dya": "ぢゃ", "dyu": "ぢゅ", "dye": "ぢぇ", "dyo": "ぢょ",
  
  // Hàng N
  "na": "な", "ni": "に", "nu": "ぬ", "ne": "ね", "no": "の",
  "nya": "にゃ", "nyu": "にゅ", "nye": "にぇ", "nyo": "にょ",
  
  // Hàng H / F
  "ha": "は", "hi": "ひ", "hu": "ふ", "fu": "ふ", "he": "へ", "ho": "ほ",
  "hya": "ひゃ", "hyu": "ひゅ", "hye": "ひぇ", "hyo": "ひょ",
  "fa": "ふぁ", "fi": "ふぃ", "fe": "ふぇ", "fo": "ふぉ", "fyu": "ふゅ",
  
  // Hàng B (Đục H)
  "ba": "ば", "bi": "び", "bu": "ぶ", "be": "べ", "bo": "ぼ",
  "bya": "びゃ", "byu": "びゅ", "bye": "びぇ", "byo": "びょ",
  
  // Hàng P (Bán đục H)
  "pa": "ぱ", "pi": "ぴ", "pu": "ぷ", "pe": "ぺ", "po": "ぽ",
  "pya": "ぴゃ", "pyu": "ぴゅ", "pye": "ぴぇ", "pyo": "ぴょ",
  
  // Hàng M
  "ma": "ま", "mi": "み", "mu": "む", "me": "め", "mo": "も",
  "mya": "みゃ", "myu": "みゅ", "mye": "みぇ", "myo": "みょ",
  
  // Hàng Y
  "ya": "や", "yu": "ゆ", "yo": "よ",
  
  // Hàng R / L
  "ra": "ら", "ri": "り", "ru": "る", "re": "れ", "ro": "ろ",
  "la": "ら", "li": "り", "lu": "る", "le": "れ", "lo": "ろ",
  "rya": "りゃ", "ryu": "りゅ", "rye": "りぇ", "ryo": "りょ",
  
  // Hàng W
  "wa": "わ", "wo": "を", "wi": "うぃ", "we": "うぇ",
  
  // Hàng V
  "va": "ゔぁ", "vi": "ゔぃ", "vu": "ゔ", "ve": "ゔぇ", "vo": "ゔぉ",
  
  // Âm 'n' và trường âm
  "nn": "ん", "n'": "ん",
  "-": "ー",
  
  // Chữ nhỏ (sokuon & small kana)
  "xtu": "っ", "ltu": "っ",
  "xa": "ぁ", "xi": "ぃ", "xu": "ぅ", "xe": "ぇ", "xo": "ぉ",
  "la": "ぁ", "li": "ぃ", "lu": "ぅ", "le": "ぇ", "lo": "ぉ",
  "xya": "ゃ", "xyu": "ゅ", "xyo": "ょ",
  "lya": "ゃ", "lyu": "ゅ", "lyo": "ょ"
};

/**
 * Khử các dấu gõ tiếng Việt từ Unikey / EVKey Telex / VNI.
 * Ví dụ khi bật Unikey mà gõ: kás -> kas, nê -> ne, thô -> tho, ư -> u/w.
 */
export function normalizeTelexAccents(str) {
  if (!str) return "";
  return str
    .replace(/ưa/gi, "wa")
    .replace(/ươ/gi, "wo")
    .replace(/([bcdfghjklmnpqrstvwxyz])ư/gi, "$1u")
    .replace(/^ư/gi, "w")
    .replace(/\sư/gi, " w")
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/gi, "a")
    .replace(/[èéẹẻẽêềếệểễ]/gi, "e")
    .replace(/[ìíịỉĩ]/gi, "i")
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/gi, "o")
    .replace(/[ùúụủũưừứựửữ]/gi, "u")
    .replace(/[ỳýỵỷỹ]/gi, "y")
    .replace(/[đ]/gi, "d");
}

/**
 * Chuyển chuỗi Romaji sang Hiragana trong thời gian thực.
 * @param {string} text - Chuỗi romaji hoặc hỗn hợp cần chuyển
 * @param {Object} options - Tùy chọn (finalize: true khi hoàn tất câu hoặc gõ phím space/enter)
 */
export function romajiToHiragana(text, { finalize = true } = {}) {
  if (!text) return "";
  const cleaned = normalizeTelexAccents(text).toLowerCase();
  let result = "";
  let i = 0;

  while (i < cleaned.length) {
    const char = cleaned[i];

    // Giữ nguyên các ký tự đã là Kana (Hiragana/Katakana), Kanji hoặc dấu câu/khoảng trắng
    if ((char >= '\u3000' && char <= '\u9FAF') || char === ' ' || char === '　') {
      result += char;
      i++;
      continue;
    }

    // Xử lý sokuon (âm ngắt: chữ cái phụ âm lặp lại như tt, kk, pp, ss, dd, gg, vv)
    if (i + 1 < cleaned.length && cleaned[i] === cleaned[i + 1] && !"aeioun".includes(cleaned[i])) {
      result += "っ";
      i++;
      continue;
    }

    // Xử lý âm 'n'
    if (cleaned[i] === 'n') {
      if (i + 1 < cleaned.length) {
        const next = cleaned[i + 1];
        // Trường hợp 'nni' -> 'ん' + 'に', 'nna' -> 'ん' + 'な'
        if (next === 'n' && i + 2 < cleaned.length && "aeiou".includes(cleaned[i + 2])) {
          result += "ん";
          i += 1;
          continue;
        } else if (next === 'n' || next === "'") {
          result += "ん";
          i += 2;
          continue;
        } else if (!"aeiouy".includes(next)) {
          // n đứng trước một phụ âm (như nk, ns, nt, nm, nr, nb, np...) -> thành 'ん'
          result += "ん";
          i += 1;
          continue;
        }
      } else if (finalize) {
        // Ký tự 'n' ở cuối chuỗi khi finalize (ấn enter/space hoặc submit)
        result += "ん";
        i++;
        continue;
      }
    }

    // Thử khớp theo thứ tự ưu tiên độ dài 4, 3, 2, 1
    let matched = false;
    for (const len of [4, 3, 2, 1]) {
      if (i + len <= cleaned.length) {
        const sub = cleaned.substring(i, i + len);
        if (HIRAGANA_MAP[sub]) {
          result += HIRAGANA_MAP[sub];
          i += len;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      result += cleaned[i];
      i++;
    }
  }

  return result;
}

/**
 * Chuyển Hiragana sang Katakana
 */
export function hiraganaToKatakana(hiraganaText) {
  if (!hiraganaText) return "";
  return hiraganaText.replace(/[\u3041-\u3096]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  );
}

/**
 * Gắn bộ gõ Kana tự động vào một phần tử <input>
 * @param {HTMLInputElement} inputEl
 * @param {Object} options
 * @returns {Object} Controller điều khiển
 */
export function bindKanaInput(inputEl, options = {}) {
  if (!inputEl) return null;

  let isEnabled = options.enabled !== false;
  let mode = options.mode || "kana"; // "kana" | "raw"
  function update() {
    if (!isEnabled || mode !== "kana") return;
    const original = inputEl.value;
    const oldCursor = inputEl.selectionStart;

    const converted = romajiToHiragana(original, { finalize: false });
    if (converted !== original) {
      const diff = converted.length - original.length;
      inputEl.value = converted;
      const newPos = Math.max(0, Math.min(converted.length, oldCursor + diff));
      try {
        inputEl.setSelectionRange(newPos, newPos);
      } catch (e) {}
    }
  }

  const handleInput = () => {
    update();
  };

  const handleCompositionUpdate = () => {
    update();
  };

  const handleCompositionEnd = () => {
    update();
  };

  const handleKeyUp = (e) => {
    if (e.key && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Shift", "Control", "Alt", "Meta", "Escape", "Tab"].includes(e.key)) {
      return;
    }
    update();
  };

  const handleKeyDown = (e) => {
    // Phím F2 để bật/tắt nhanh chế độ tự động gõ Kana
    if (e.key === "F2") {
      e.preventDefault();
      controller.toggleMode();
      return;
    }

    // Khi ấn phím Space: nếu chuỗi kết thúc bằng âm 'n' lẻ thì biến ngay thành 'ん'
    if (e.key === " " && isEnabled && mode === "kana") {
      const val = inputEl.value;
      if (val.endsWith("n")) {
        e.preventDefault();
        const finalized = val.slice(0, -1) + "ん";
        inputEl.value = finalized;
        inputEl.setSelectionRange(finalized.length, finalized.length);
      }
    }
  };

  inputEl.addEventListener("input", handleInput);
  inputEl.addEventListener("compositionupdate", handleCompositionUpdate);
  inputEl.addEventListener("compositionend", handleCompositionEnd);
  inputEl.addEventListener("keyup", handleKeyUp);
  inputEl.addEventListener("keydown", handleKeyDown);

  const controller = {
    enable() {
      isEnabled = true;
      if (typeof options.onStateChange === "function") {
        options.onStateChange({ isEnabled, mode });
      }
    },
    disable() {
      isEnabled = false;
      if (typeof options.onStateChange === "function") {
        options.onStateChange({ isEnabled, mode });
      }
    },
    setMode(newMode) {
      mode = newMode === "raw" ? "raw" : "kana";
      if (mode === "kana") isEnabled = true;
      if (typeof options.onStateChange === "function") {
        options.onStateChange({ isEnabled, mode });
      }
    },
    getMode() {
      return isEnabled ? mode : "raw";
    },
    toggleMode() {
      if (mode === "kana") {
        this.setMode("raw");
      } else {
        this.setMode("kana");
      }
    },
    finalize() {
      if (isEnabled && mode === "kana") {
        const val = inputEl.value;
        const finalized = romajiToHiragana(val, { finalize: true });
        if (finalized !== val) {
          inputEl.value = finalized;
        }
        return finalized;
      }
      return inputEl.value;
    },
    destroy() {
      inputEl.removeEventListener("input", handleInput);
      inputEl.removeEventListener("compositionupdate", handleCompositionUpdate);
      inputEl.removeEventListener("compositionend", handleCompositionEnd);
      inputEl.removeEventListener("keyup", handleKeyUp);
      inputEl.removeEventListener("keydown", handleKeyDown);
    }
  };

  return controller;
}
