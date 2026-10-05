/**
 * Bộ chuyển đổi Kana chuyên dụng cho Electron Main Process (CommonJS).
 * Đồng bộ logic với src/kana-ime.js
 */

const HIRAGANA_MAP = {
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

function normalizeTelexAccents(str) {
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

function romajiToHiragana(text, { finalize = true } = {}) {
  if (!text) return "";
  const cleaned = normalizeTelexAccents(text).toLowerCase();
  let result = "";
  let i = 0;

  while (i < cleaned.length) {
    const char = cleaned[i];

    if ((char >= '\u3000' && char <= '\u9FAF') || char === ' ' || char === '　') {
      result += char;
      i++;
      continue;
    }

    if (i + 1 < cleaned.length && cleaned[i] === cleaned[i + 1] && !"aeioun".includes(cleaned[i])) {
      result += "っ";
      i++;
      continue;
    }

    if (cleaned[i] === 'n') {
      if (i + 1 < cleaned.length) {
        const next = cleaned[i + 1];
        if (next === 'n' && i + 2 < cleaned.length && "aeiou".includes(cleaned[i + 2])) {
          result += "ん";
          i += 1;
          continue;
        } else if (next === 'n' || next === "'") {
          result += "ん";
          i += 2;
          continue;
        } else if (!"aeiouy".includes(next)) {
          result += "ん";
          i += 1;
          continue;
        }
      } else if (finalize) {
        result += "ん";
        i++;
        continue;
      }
    }

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

module.exports = {
  HIRAGANA_MAP,
  normalizeTelexAccents,
  romajiToHiragana
};
