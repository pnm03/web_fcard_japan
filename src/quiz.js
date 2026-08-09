import { getProjectById, getProjects, updateVocabStats, removeVietnameseTones } from "./storage.js";

export function normalizeString(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // thay thế nhiều dấu cách bằng 1 dấu cách
}

export function getAcceptedMeaningAnswers(meaning) {
  const original = String(meaning || "").trim();
  if (!original) return [];

  const withoutNotes = original
    .replace(/\([^()]*\)/g, " ")
    .replace(/（[^（）]*）/g, " ")
    .replace(/\s*[;；]\s*ví dụ.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const isExplanatoryDefinition = /^(?:hậu tố|đây là lời chào)|(?:thêm vào sau tên|không dùng khi|dùng kèm theo tên)/i.test(withoutNotes);
  const commaGroups = isExplanatoryDefinition
    ? [withoutNotes]
    : withoutNotes.split(/\s*(?:,|，|;|；)\s*|\s+(?:hoặc|hay)\s+/i);

  const conciseGroups = commaGroups.length > 1 && /cách nói|cách gọi|mang nghĩa/i.test(commaGroups[0])
    ? commaGroups.filter(group => !/cách nói|cách gọi|mang nghĩa/i.test(group))
    : commaGroups;

  const expandSlashGroup = (group) => {
    if (!group.includes("/")) return [group];

    if (/\s\/|\/\s/.test(group)) {
      return group.split(/\s*\/\s*/);
    }

    const parts = group.split("/").map(part => part.trim()).filter(Boolean);
    if (parts.length < 2) return [group];

    const firstMatch = parts[0].match(/^(.*\s)?([^\s]+)$/);
    const lastMatch = parts[parts.length - 1].match(/^([^\s]+)(\s.*)?$/);
    if (!firstMatch || !lastMatch || parts.slice(1, -1).some(part => /\s/.test(part))) {
      return parts;
    }

    const prefix = firstMatch[1] || "";
    const suffix = lastMatch[2] || "";
    const options = [firstMatch[2], ...parts.slice(1, -1), lastMatch[1]];
    return options.map(option => `${prefix}${option}${suffix}`);
  };

  const answers = conciseGroups
    .flatMap(expandSlashGroup)
    .map(answer => answer.trim().replace(/[.!?…]+$/g, ""))
    .filter(Boolean);

  return [...new Map(answers.map(answer => [removeVietnameseTones(normalizeString(answer)), answer])).values()];
}

const VIETNAMESE_NUMBER_FILLERS = new Set(["so", "con", "la", "bang", "gia", "tri"]);
const VIETNAMESE_DIGIT_WORDS = new Map([
  ["khong", 0],
  ["mot", 1],
  ["hai", 2],
  ["ba", 3],
  ["bon", 4],
  ["tu", 4],
  ["nam", 5],
  ["lam", 5],
  ["sau", 6],
  ["bay", 7],
  ["tam", 8],
  ["chin", 9]
]);

function tokenizeVietnameseNumberAnswer(value) {
  const normalized = removeVietnameseTones(String(value || "").normalize("NFKC").toLowerCase())
    .replace(/[()[\]{}]/g, " ")
    .replace(/[.,;:!?/\\|_+=~`'"“”‘’]/g, " ")
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized ? normalized.split(" ") : [];
}

function stripVietnameseNumberFillers(tokens) {
  const result = [...tokens];
  while (result.length > 0 && VIETNAMESE_NUMBER_FILLERS.has(result[0])) {
    result.shift();
  }
  return result;
}

function parseArabicIntegerTokens(tokens) {
  if (!tokens.length || !tokens.every(token => /^\d+$/.test(token))) {
    return null;
  }

  const value = Number(tokens.join(""));
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function parseVietnameseDigitToken(token) {
  return VIETNAMESE_DIGIT_WORDS.has(token) ? VIETNAMESE_DIGIT_WORDS.get(token) : null;
}

function parseVietnameseUnder100(tokens) {
  if (!tokens.length) return null;

  const numericValue = parseArabicIntegerTokens(tokens);
  if (numericValue !== null && numericValue < 100) {
    return numericValue;
  }

  if (tokens.length === 1) {
    if (tokens[0] === "muoi") return 10;
    return parseVietnameseDigitToken(tokens[0]);
  }

  if (tokens[0] === "muoi") {
    const ones = parseVietnameseDigitToken(tokens[1]);
    return ones !== null && tokens.length === 2 ? 10 + ones : null;
  }

  const tens = parseVietnameseDigitToken(tokens[0]);
  if (tens !== null && tokens[1] === "muoi") {
    if (tokens.length === 2) return tens * 10;
    const ones = parseVietnameseDigitToken(tokens[2]);
    return ones !== null && tokens.length === 3 ? tens * 10 + ones : null;
  }

  return null;
}

function parseVietnameseUnder1000(tokens) {
  if (!tokens.length) return null;

  const numericValue = parseArabicIntegerTokens(tokens);
  if (numericValue !== null && numericValue < 1000) {
    return numericValue;
  }

  const hundredIndex = tokens.indexOf("tram");
  if (hundredIndex === -1) {
    return parseVietnameseUnder100(tokens);
  }

  const hundredsTokens = tokens.slice(0, hundredIndex);
  if (hundredsTokens.length !== 1) return null;

  const hundreds = parseVietnameseDigitToken(hundredsTokens[0]);
  if (hundreds === null) return null;

  let restTokens = tokens.slice(hundredIndex + 1);
  if (restTokens[0] === "linh" || restTokens[0] === "le") {
    restTokens = restTokens.slice(1);
  }

  if (!restTokens.length) return hundreds * 100;

  const rest = parseVietnameseUnder100(restTokens);
  return rest !== null ? hundreds * 100 + rest : null;
}

function parseVietnameseNumberWords(tokens) {
  let remaining = [...tokens];
  let total = 0;
  let foundScale = false;

  const scales = [
    { names: ["ty"], value: 1000000000 },
    { names: ["trieu"], value: 1000000 },
    { names: ["nghin", "ngan"], value: 1000 }
  ];

  for (const scale of scales) {
    const index = remaining.findIndex(token => scale.names.includes(token));
    if (index === -1) continue;

    const segment = remaining.slice(0, index);
    const segmentValue = segment.length ? parseVietnameseUnder1000(segment) : 1;
    if (segmentValue === null) return null;

    total += segmentValue * scale.value;
    remaining = remaining.slice(index + 1);
    foundScale = true;
  }

  if (remaining.length) {
    const rest = parseVietnameseUnder1000(remaining);
    if (rest === null) return null;
    total += rest;
  }

  return foundScale || total > 0 || tokens.includes("khong") ? total : null;
}

function parseVietnameseNumberAnswer(value) {
  const tokens = stripVietnameseNumberFillers(tokenizeVietnameseNumberAnswer(value));
  if (!tokens.length) return null;

  const numericValue = parseArabicIntegerTokens(tokens);
  if (numericValue !== null) return numericValue;

  if (tokens.some(token => /^\d+$/.test(token))) {
    return parseVietnameseNumberWords(tokens);
  }

  return parseVietnameseNumberWords(tokens);
}

export function isSmartVietnameseMatch(userAnswer, correctAnswer) {
  const normUser = normalizeString(userAnswer);
  const normCorrect = normalizeString(correctAnswer);
  
  if (normUser === normCorrect) return true;

  const normUserNoTone = removeVietnameseTones(normUser);
  const normCorrectNoTone = removeVietnameseTones(normCorrect);
  if (normUserNoTone === normCorrectNoTone) return true;

  const userNumber = parseVietnameseNumberAnswer(normUser);
  const correctNumber = parseVietnameseNumberAnswer(normCorrect);
  if (userNumber !== null && correctNumber !== null && userNumber === correctNumber) {
    return true;
  }

  // Danh sách các lượng từ / từ chỉ loại có thể được lược bỏ trong tiếng Việt
  const classifiers = [
    "cai", "con", "qua", "trai", "chiec", "doa", "ngoi", "buc", "tam",
    "cay", "la", "soi", "hat", "quyen", "cuon", "bai", "su", "cuoc",
    "viec", "niem", "noi", "ve", "nguoi", "dua", "mau", "sac"
  ];

  // Danh sách các hậu tố bổ nghĩa không bắt buộc có thể lược bỏ
  const optionalSuffixes = [
    "an", "mac", "uong", "choi"
  ];

  // Hàm loại bỏ lượng từ đứng đầu và hậu tố bổ nghĩa đứng cuối
  const cleanTokens = (tokens) => {
    let result = [...tokens];
    while (result.length > 1) {
      if (classifiers.includes(result[0])) {
        result.shift();
      } else {
        break;
      }
    }
    while (result.length > 1) {
      const last = result[result.length - 1];
      if (optionalSuffixes.includes(last)) {
        result.pop();
      } else {
        break;
      }
    }
    return result;
  };

  const userTokens = normUserNoTone.split(/\s+/).filter(Boolean);
  const correctTokens = normCorrectNoTone.split(/\s+/).filter(Boolean);

  if (userTokens.length === 0 || correctTokens.length === 0) return false;

  const cleanedUser = cleanTokens(userTokens).join(" ");
  const cleanedCorrect = cleanTokens(correctTokens).join(" ");

  // Nếu sau khi tinh lọc, hai chuỗi khớp nhau và không rỗng
  if (cleanedUser === cleanedCorrect && cleanedUser.length > 0) {
    return true;
  }

  return false;
}

function normalizeVietnameseTypoText(value) {
  return removeVietnameseTones(String(value || "").normalize("NFKC").toLowerCase())
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getLevenshteinDistance(left, right) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + substitutionCost
      );
    }
    previous = current;
  }

  return previous[right.length];
}

export function getVietnameseAnswerMatch(userAnswer, correctAnswer) {
  if (isSmartVietnameseMatch(userAnswer, correctAnswer)) return "correct";

  const normalizedUser = normalizeVietnameseTypoText(userAnswer);
  const normalizedCorrect = normalizeVietnameseTypoText(correctAnswer);
  const correctLength = normalizedCorrect.replace(/\s/g, "").length;

  if (!normalizedUser || !normalizedCorrect || correctLength < 4) return "wrong";
  if (/\d/.test(normalizedUser) || /\d/.test(normalizedCorrect)) return "wrong";

  const threshold = correctLength <= 7 ? 1 : 2;
  if (Math.abs(normalizedUser.length - normalizedCorrect.length) > threshold) return "wrong";

  return getLevenshteinDistance(normalizedUser, normalizedCorrect) <= threshold
    ? "near"
    : "wrong";
}

function getClosestMeaningAnswerIndex(userAnswer, answers, candidateIndexes) {
  const normalizedUser = normalizeVietnameseTypoText(userAnswer);
  let closestIndex = candidateIndexes[0] ?? -1;
  let closestDistance = Number.POSITIVE_INFINITY;

  candidateIndexes.forEach(index => {
    const distance = getLevenshteinDistance(
      normalizedUser,
      normalizeVietnameseTypoText(answers[index])
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

function getJapaneseDisplayText(japaneseText) {
  if (!japaneseText) return "";

  const match = japaneseText.match(/\(([^)]+)\)/) || japaneseText.match(/（([^）]+)）/);
  if (match) {
    const content = match[1].trim();
    const hasKanji = /[\u4E00-\u9FAF]/.test(content);
    if (!hasKanji) {
      return content;
    }
  }

  return japaneseText.replace(/\([^)]+\)/g, "").replace(/（[^）]+）/g, "").trim();
}

function normalizeJapaneseAnswer(str) {
  return String(str || "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, "")
    .replace(/[、。，．・]/g, "");
}

function getJapaneseAnswerCandidates(vocab) {
  const raw = vocab?.japanese || "";
  const display = getJapaneseDisplayText(raw);
  const withoutAnnotation = raw.replace(/\([^)]+\)/g, "").replace(/（[^）]+）/g, "").trim();
  const annotationMatch = raw.match(/\(([^)]+)\)/) || raw.match(/（([^）]+)）/);
  const annotation = annotationMatch ? annotationMatch[1].trim() : "";

  return [...new Set([display, withoutAnnotation, annotation, raw].filter(Boolean))];
}

function isJapaneseAnswerMatch(userAnswer, vocab) {
  const normalizedUser = normalizeJapaneseAnswer(userAnswer);
  if (!normalizedUser) return false;

  return getJapaneseAnswerCandidates(vocab).some(candidate => {
    return normalizeJapaneseAnswer(candidate) === normalizedUser;
  });
}

function maskJapaneseAnswer(answer) {
  const chars = Array.from(answer || "").filter(char => char.trim() !== "");
  if (chars.length <= 1) return answer || "";

  return chars.map((char, index) => {
    if (index === 0) return char;
    return "*";
  }).join("");
}

function isMeaningAnswerMode(mode) {
  return mode === "jp_to_meaning" || mode === "romaji_to_meaning" || mode === "audio_to_meaning";
}

// Tạo gợi ý (Hint) cho một chuỗi đáp án
export function generateHint(answer, mode) {
  if (!answer) return "";

  if (mode === "meaning_to_japanese") {
    return maskJapaneseAnswer(answer);
  }
  
  function maskWord(word) {
    if (!word) return "";
    const L = word.length;
    if (L <= 1) return word;
    if (L === 2) {
      return Math.random() < 0.5 ? "*" + word[1] : word[0] + "*";
    }
    
    const M = Math.min(L - 1, Math.ceil(0.70 * L));
    let chars = word.split("");
    
    let maskableIndices = [];
    for (let i = 1; i < L; i++) {
      maskableIndices.push(i);
    }
    if (M > maskableIndices.length) {
      maskableIndices.push(0);
    }
    
    maskableIndices.sort(() => Math.random() - 0.5);
    const indicesToMask = maskableIndices.slice(0, M);
    indicesToMask.forEach(idx => {
      chars[idx] = "*";
    });
    
    return chars.join("");
  }

  const words = answer.split(" ");
  const hintedWords = words.map(word => {
    return word.replace(/[a-zA-Z0-9à-ỹÀ-ỸđĐ]+/g, match => maskWord(match));
  });
  
  return hintedWords.join(" ");
}

export class QuizSession {
  constructor(config) {
    this.projectIds = config.projectIds || ["all"];
    this.vocabIds = config.vocabIds || []; // Danh sách từ vựng được chọn cụ thể
    this.questionCount = parseInt(config.questionCount) || 10;
    this.quizMode = config.quizMode || "mixed";
    this.order = config.order || "random"; // 'sequential', 'random'
    this.allowRetry = config.allowRetry !== false; // mặc định cho phép retry
    this.repeatWrongPractice = config.repeatWrongPractice === true;

    this.vocabPool = [];
    this.questions = [];
    this.currentIndex = 0;
    this.startTime = null; // Bắt đầu tính giờ cho cả session
    this.questionStartTime = null; // Bắt đầu tính giờ cho câu hỏi hiện tại
    
    this.loadVocabPool();
    this.generateQuestions();
  }

  // Tải danh sách từ vựng từ các dự án đã chọn hoặc theo ID cụ thể
  loadVocabPool() {
    const projects = getProjects();
    let selectedVocab = [];

    if (this.vocabIds && this.vocabIds.length > 0) {
      // Nếu có danh sách ID từ chọn cụ thể (từ popup)
      projects.forEach(p => {
        p.vocab.forEach(v => {
          if (this.vocabIds.includes(v.id)) {
            selectedVocab.push({
              ...v,
              projectId: p.id,
              projectName: p.name
            });
          }
        });
      });
    } else {
      // Cách cũ: Lấy toàn bộ từ thuộc danh mục dự án
      projects.forEach(p => {
        if (this.projectIds.includes("all") || this.projectIds.includes(p.id)) {
          p.vocab.forEach(v => {
            selectedVocab.push({
              ...v,
              projectId: p.id,
              projectName: p.name
            });
          });
        }
      });
    }

    this.vocabPool = selectedVocab;
  }

  // Tạo danh sách câu hỏi (Weighted Spaced Repetition)
  // - Mỗi từ xuất hiện ít nhất 1 lần (nếu N >= M)
  // - Các slot thừa (N - M) được phân bổ theo trọng số: từ khó/hay quên ra nhiều hơn
  // - Không cho phép 2 từ liên tiếp giống nhau
  generateQuestions() {
    const M = this.vocabPool.length;
    const N = this.questionCount;

    if (M === 0) {
      this.questions = [];
      return;
    }

    // === TÍNH TRỌNG SỐ CHO TỪNG TỪ ===
    // Công thức trọng số: w = base + difficultyBonus + wrongBonus + freshnessBonus
    const now = Date.now();
    const weights = this.vocabPool.map(v => {
      const diff = v.difficultyScore || 0;        // 0-100
      const wrong = v.wrongCount || 0;
      const correct = v.correctCount || 0;
      const lastTested = v.lastTested || 0;
      const total = correct + wrong;
      const mastery = Number.isFinite(Number(v.masteryScore)) ? Number(v.masteryScore) : 0;
      const streak = v.streakCorrect || 0;
      const lastAnswerState = v.lastAnswerState || "unanswered";

      // Base weight: mọi từ đều có cơ hội tối thiểu
      let w = 1;

      // Difficulty bonus: từ có difficultyScore cao → trọng số cao hơn
      // diff=0 → +0, diff=50 → +2.5, diff=100 → +5
      w += (diff / 100) * 5;

      // Wrong ratio bonus: tỷ lệ sai cao → ưu tiên hơn
      if (total > 0) {
        const wrongRatio = wrong / total; // 0 đến 1
        w += wrongRatio * 3;
      } else {
        // Từ chưa bao giờ test → ưu tiên vừa phải (từ mới)
        w += 2;
      }

      // Mastery bonus: từ có điểm thuộc thấp sẽ được hỏi lại nhiều hơn
      w += ((100 - mastery) / 100) * 4;

      // Lần gần nhất sai / phải xem đáp án / đúng sau gợi ý thì cần ôn lại sớm hơn
      if (lastAnswerState === "wrong" || lastAnswerState === "revealed") {
        w += 4;
      } else if (lastAnswerState === "correct_retry") {
        w += 2;
      }

      // Freshness bonus: từ lâu không test → ưu tiên cao hơn
      if (lastTested > 0) {
        const daysSince = (now - lastTested) / (1000 * 60 * 60 * 24);
        // Từ lâu không test (>7 ngày) → bonus cao hơn, cap tại 3
        w += Math.min(3, daysSince / 7 * 1.5);
      } else {
        // Chưa từng test
        w += 2;
      }

      // Từ đã thuộc vững vẫn có cơ hội xuất hiện, nhưng giảm tần suất lặp
      if (mastery >= 80 && streak >= 3 && diff <= 30) {
        w *= 0.55;
      }

      return w;
    });

    let selectedList = [];

    if (N <= M) {
      // Số câu hỏi <= số từ: chọn N từ theo weighted sampling (không lặp)
      if (this.order === "random") {
        selectedList = this._weightedSampleWithoutReplacement(this.vocabPool, weights, N);
      } else {
        selectedList = this.vocabPool.slice(0, N);
      }
    } else {
      // N > M: Đảm bảo mỗi từ xuất hiện ít nhất 1 lần
      // Bước 1: Lấy toàn bộ M từ (đảm bảo xuất hiện đủ)
      selectedList = [...this.vocabPool];

      // Bước 2: Bổ sung N - M slot bằng weighted random (cho phép lặp theo trọng số)
      const extraCount = N - M;
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      for (let k = 0; k < extraCount; k++) {
        // Weighted random pick
        let r = Math.random() * totalWeight;
        let chosen = 0;
        for (let i = 0; i < M; i++) {
          r -= weights[i];
          if (r <= 0) {
            chosen = i;
            break;
          }
        }
        selectedList.push(this.vocabPool[chosen]);
      }

      // Bước 3: Fisher-Yates shuffle toàn bộ
      if (this.order === "random") {
        for (let i = selectedList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [selectedList[i], selectedList[j]] = [selectedList[j], selectedList[i]];
        }
      }
    }

    // === CHỐNG LẶP 2 TỪ LIÊN TIẾP GIỐNG NHAU ===
    if (this.order === "random" && selectedList.length > 1) {
      for (let i = 1; i < selectedList.length; i++) {
        if (selectedList[i].id === selectedList[i - 1].id) {
          let swapped = false;
          // Tìm phần tử khác phía sau để swap
          for (let j = i + 1; j < selectedList.length; j++) {
            if (selectedList[j].id !== selectedList[i - 1].id && 
                (i + 1 >= selectedList.length || selectedList[j].id !== selectedList[i + 1]?.id)) {
              [selectedList[i], selectedList[j]] = [selectedList[j], selectedList[i]];
              swapped = true;
              break;
            }
          }
          // Nếu không tìm được phía sau, chèn vào vị trí hợp lệ phía trước
          if (!swapped) {
            for (let j = 0; j < i - 1; j++) {
              if (selectedList[j].id !== selectedList[i].id &&
                  (j === 0 || selectedList[j - 1].id !== selectedList[i].id) &&
                  selectedList[j + 1].id !== selectedList[i].id) {
                const item = selectedList.splice(i, 1)[0];
                selectedList.splice(j + 1, 0, item);
                swapped = true;
                break;
              }
            }
          }
        }
      }
    }

    // Tạo các câu hỏi với chế độ tương ứng
    this.questions = selectedList.map((vocab, index) => {
      // Xác định chế độ của câu hỏi này
      let activeMode = this.quizMode;
      if (this.quizMode === "mixed") {
        const modes = ["meaning_to_romaji", "romaji_to_meaning", "jp_to_meaning", "meaning_to_japanese", "audio_to_meaning"];
        activeMode = modes[Math.floor(Math.random() * modes.length)];
      }

      const requiredMeaningAnswers = isMeaningAnswerMode(activeMode)
        ? getAcceptedMeaningAnswers(vocab.meaning)
        : [];

      return {
        sessionQuestionId: `q-${index}-${Date.now()}`,
        vocab: vocab,
        mode: activeMode,
        attempts: 0,
        answerState: "unanswered",
        userAnswers: [],
        timeSpent: 0,
        hintShown: "",
        promptRevealed: false,
        requiredMeaningAnswers,
        completedMeaningAnswerIndexes: [],
        revealedMeaningAnswerIndexes: [],
        meaningAnswerAttempts: requiredMeaningAnswers.map(() => 0),
        activeMeaningAnswerIndex: null,
        meaningAnswerHadMistake: false,
        practiceRepeatUsed: false,
        practiceRepeatActive: false,
        practiceRepeatAttempts: 0
      };
    });
  }

  // Chọn N phần tử từ pool theo trọng số, không lặp (weighted sampling without replacement)
  _weightedSampleWithoutReplacement(pool, weights, n) {
    const result = [];
    const remainingWeights = [...weights];
    const remainingIndices = pool.map((_, i) => i);

    for (let k = 0; k < n && remainingIndices.length > 0; k++) {
      const totalW = remainingWeights.reduce((sum, w) => sum + w, 0);
      let r = Math.random() * totalW;
      let chosenIdx = 0;

      for (let i = 0; i < remainingWeights.length; i++) {
        r -= remainingWeights[i];
        if (r <= 0) {
          chosenIdx = i;
          break;
        }
      }

      result.push(pool[remainingIndices[chosenIdx]]);
      remainingIndices.splice(chosenIdx, 1);
      remainingWeights.splice(chosenIdx, 1);
    }

    return result;
  }

  // Bắt đầu tính giờ cho câu hỏi hiện tại
  startQuestionTimer() {
    this.questionStartTime = Date.now();
    if (!this.startTime) {
      this.startTime = Date.now();
    }
  }

  // Lấy câu hỏi hiện tại
  getCurrentQuestion() {
    if (this.currentIndex >= 0 && this.currentIndex < this.questions.length) {
      return this.questions[this.currentIndex];
    }
    return null;
  }

  getCorrectAnswerForQuestion(question) {
    if (!question) return "";
    if (isMeaningAnswerMode(question.mode)) {
      return question.vocab.meaning;
    }
    if (question.mode === "meaning_to_japanese") {
      return getJapaneseDisplayText(question.vocab.japanese);
    }
    return question.vocab.romaji;
  }

  isAnswerCorrectForQuestion(question, userAnswer) {
    if (!question) return false;

    if (isMeaningAnswerMode(question.mode)) {
      const fullMeaning = question.vocab.meaning;
      return isSmartVietnameseMatch(userAnswer, fullMeaning)
        || getAcceptedMeaningAnswers(fullMeaning).some(answer => isSmartVietnameseMatch(userAnswer, answer));
    }
    if (question.mode === "meaning_to_japanese") {
      return isJapaneseAnswerMatch(userAnswer, question.vocab);
    }
    return normalizeString(userAnswer) === normalizeString(question.vocab.romaji);
  }

  canPracticeRepeatCurrentQuestion() {
    const question = this.getCurrentQuestion();
    return !!(
      this.repeatWrongPractice &&
      question &&
      question.answerState === "wrong" &&
      !question.practiceRepeatUsed
    );
  }

  startPracticeRepeat() {
    const question = this.getCurrentQuestion();
    if (!this.canPracticeRepeatCurrentQuestion()) {
      return false;
    }

    question.practiceRepeatUsed = true;
    question.practiceRepeatActive = true;
    question.practiceRepeatAttempts = 0;
    this.questionStartTime = Date.now();
    return true;
  }

  submitPracticeAnswer(userAnswer) {
    const question = this.getCurrentQuestion();
    if (!question || !question.practiceRepeatActive) {
      return { status: "error", message: "Không có lượt làm lại đang chạy." };
    }

    question.practiceRepeatAttempts += 1;
    const correctAnswer = this.getCorrectAnswerForQuestion(question);
    const isCorrect = this.isAnswerCorrectForQuestion(question, userAnswer);
    question.practiceRepeatActive = false;

    return {
      status: isCorrect ? "practice_correct" : "practice_wrong",
      isCorrect,
      correctAnswer,
      attempts: question.practiceRepeatAttempts
    };
  }

  submitMultiMeaningAnswer(question, userAnswer) {
    const requiredAnswers = question.requiredMeaningAnswers;
    const completedIndexes = question.completedMeaningAnswerIndexes;
    const completedSet = new Set(completedIndexes);
    const pendingIndexes = requiredAnswers
      .map((_, index) => index)
      .filter(index => !completedSet.has(index));
    const lockedIndex = pendingIndexes.includes(question.activeMeaningAnswerIndex)
      ? question.activeMeaningAnswerIndex
      : null;
    const candidateIndexes = lockedIndex === null ? pendingIndexes : [lockedIndex];

    const matchedIndex = candidateIndexes.find(index => (
      getVietnameseAnswerMatch(userAnswer, requiredAnswers[index]) === "correct"
    ));

    if (matchedIndex === undefined) {
      const duplicateIndex = requiredAnswers.findIndex((answer, index) => (
        completedSet.has(index) && isSmartVietnameseMatch(userAnswer, answer)
      ));

      if (duplicateIndex !== -1) {
        return {
          status: "meaning_duplicate",
          isCorrect: false,
          completed: completedIndexes.length,
          total: requiredAnswers.length,
          remaining: requiredAnswers.length - completedIndexes.length
        };
      }

      const nearIndex = candidateIndexes.find(index => (
        getVietnameseAnswerMatch(userAnswer, requiredAnswers[index]) === "near"
      ));
      if (nearIndex !== undefined) {
        question.activeMeaningAnswerIndex = nearIndex;
        question.attempts = Math.max(0, question.attempts - 1);
        return {
          status: "meaning_near",
          isCorrect: false,
          completed: completedIndexes.length,
          total: requiredAnswers.length,
          remaining: requiredAnswers.length - completedIndexes.length
        };
      }

      const targetIndex = lockedIndex ?? getClosestMeaningAnswerIndex(
        userAnswer,
        requiredAnswers,
        pendingIndexes
      );
      question.activeMeaningAnswerIndex = targetIndex;
      question.meaningAnswerAttempts[targetIndex] = (question.meaningAnswerAttempts[targetIndex] || 0) + 1;
      question.meaningAnswerHadMistake = true;

      const maxAttempts = this.allowRetry ? 2 : 1;
      if (question.meaningAnswerAttempts[targetIndex] < maxAttempts) {
        const hint = generateHint(requiredAnswers[targetIndex], question.mode);
        question.hintShown = hint;
        return {
          status: "meaning_retry",
          isCorrect: false,
          completed: completedIndexes.length,
          total: requiredAnswers.length,
          remaining: requiredAnswers.length - completedIndexes.length,
          attempt: question.meaningAnswerAttempts[targetIndex],
          maxAttempts,
          hint
        };
      }

      completedIndexes.push(targetIndex);
      question.revealedMeaningAnswerIndexes.push(targetIndex);
      question.activeMeaningAnswerIndex = null;

      const completed = completedIndexes.length;
      const total = requiredAnswers.length;
      if (completed < total) {
        return {
          status: "meaning_revealed",
          isCorrect: false,
          completed,
          total,
          remaining: total - completed,
          revealedAnswer: requiredAnswers[targetIndex]
        };
      }

      return this.finishMultiMeaningQuestion(question);
    }

    completedIndexes.push(matchedIndex);
    question.activeMeaningAnswerIndex = null;
    const completed = completedIndexes.length;
    const total = requiredAnswers.length;

    if (completed < total) {
      return {
        status: "meaning_progress",
        isCorrect: true,
        completed,
        total,
        remaining: total - completed,
        matchedAnswer: requiredAnswers[matchedIndex]
      };
    }

    return this.finishMultiMeaningQuestion(question);
  }

  finishMultiMeaningQuestion(question) {
    const completed = question.completedMeaningAnswerIndexes.length;
    const total = question.requiredMeaningAnswers.length;
    const wasRevealed = question.revealedMeaningAnswerIndexes.length > 0;
    const wasRetry = question.meaningAnswerHadMistake || question.promptRevealed;
    question.answerState = wasRevealed ? "wrong" : (wasRetry ? "correct_retry" : "correct");

    updateVocabStats(
      question.vocab.projectId,
      question.vocab.id,
      question.answerState === "correct",
      question.timeSpent,
      question.answerState
    );

    return {
      status: wasRevealed ? "wrong" : "correct",
      isCorrect: !wasRevealed,
      wasRetry,
      wasRevealed,
      attempts: question.attempts,
      correctAnswer: question.vocab.meaning,
      timeSpent: question.timeSpent,
      completed,
      total,
      remaining: 0
    };
  }

  // Gửi câu trả lời
  submitAnswer(userAnswer) {
    const question = this.getCurrentQuestion();
    if (!question || question.answerState !== "unanswered") {
      return { status: "error", message: "Câu hỏi này đã được trả lời hoặc không hợp lệ." };
    }

    question.attempts += 1;
    question.userAnswers.push(userAnswer);

    // Tính thời gian phản hồi tạm thời cho lượt này
    const now = Date.now();
    const currentAttemptTimeSec = (now - this.questionStartTime) / 1000;
    question.timeSpent += currentAttemptTimeSec;
    // Reset mốc thời gian để nếu nhập lại lần 2 thì cộng dồn tiếp
    this.questionStartTime = now;

    if (
      isMeaningAnswerMode(question.mode)
      && Array.isArray(question.requiredMeaningAnswers)
      && question.requiredMeaningAnswers.length > 1
    ) {
      return this.submitMultiMeaningAnswer(question, userAnswer);
    }

    // Lấy đáp án đúng và chuẩn hóa
    let correctAnswer = "";
    let isCorrect = false;

    correctAnswer = this.getCorrectAnswerForQuestion(question);
    if (isMeaningAnswerMode(question.mode)) {
      const meaningCandidates = [
        question.vocab.meaning,
        ...getAcceptedMeaningAnswers(question.vocab.meaning)
      ];
      const meaningMatches = meaningCandidates.map(candidate => (
        getVietnameseAnswerMatch(userAnswer, candidate)
      ));
      if (meaningMatches.includes("near") && !meaningMatches.includes("correct")) {
        question.attempts = Math.max(0, question.attempts - 1);
        return {
          status: "near_match",
          isCorrect: false,
          correctAnswer,
          timeSpent: question.timeSpent
        };
      }
      isCorrect = meaningMatches.includes("correct");
    } else {
      isCorrect = this.isAnswerCorrectForQuestion(question, userAnswer);
    }

    if (isCorrect) {
      // Trả lời đúng
      const wasRetry = question.attempts > 1 || question.promptRevealed;
      question.answerState = wasRetry ? "correct_retry" : "correct";
      
      // Cập nhật thống kê vào localStorage
      updateVocabStats(
        question.vocab.projectId,
        question.vocab.id,
        !wasRetry, // isCorrect
        question.timeSpent, // tổng thời gian qua các lượt thử
        question.answerState
      );

      return {
        status: "correct",
        isCorrect: true,
        wasRetry: wasRetry,
        attempts: question.attempts,
        correctAnswer: correctAnswer,
        timeSpent: question.timeSpent
      };
    } else {
      // Trả lời sai
      if (this.allowRetry && question.attempts === 1) {
        // Cho phép thử lại 1 lần nữa, sinh gợi ý
        const hint = generateHint(correctAnswer, question.mode);
        question.hintShown = hint;
        
        return {
          status: "retry_allowed",
          isCorrect: false,
          attempts: 1,
          hint: hint,
          message: "Chưa chính xác! Bạn còn 1 cơ hội nhập lại."
        };
      } else {
        // Sai hoàn toàn (hết lượt hoặc không bật retry)
        question.answerState = "wrong";

        // Cập nhật thống kê vào localStorage (sai)
        updateVocabStats(
          question.vocab.projectId,
          question.vocab.id,
          false, // isCorrect
          question.timeSpent,
          "wrong"
        );

        return {
          status: "wrong",
          isCorrect: false,
          attempts: question.attempts,
          correctAnswer: correctAnswer,
          timeSpent: question.timeSpent
        };
      }
    }
  }

  // Chuyển sang câu tiếp theo
  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex += 1;
      this.startQuestionTimer();
      return true;
    }
    return false;
  }

  // Lấy kết quả toàn bộ session để làm báo cáo
  getReport() {
    const totalQuestions = this.questions.length;
    let correctCount = 0;
    let correctRetryCount = 0;
    let wrongCount = 0;
    let totalTimeSpent = 0;
    const wrongVocabById = new Map();

    const details = this.questions.map(q => {
      totalTimeSpent += q.timeSpent;
      if (q.answerState === "correct") correctCount++;
      else if (q.answerState === "correct_retry") correctRetryCount++;
      else if (q.answerState === "wrong") {
        wrongCount++;
        if (q.vocab?.id) {
          wrongVocabById.set(q.vocab.id, q.vocab);
        }
      }

      // Xác định câu trả lời có bị coi là "Phản xạ chậm" hay không
      // Ngưỡng chậm: Trả lời mất trên 8 giây
      const isSlow = q.answerState.startsWith("correct") && q.timeSpent > 8.0;

      return {
        id: q.vocab.id,
        projectId: q.vocab.projectId,
        japanese: q.vocab.japanese,
        romaji: q.vocab.romaji,
        meaning: q.vocab.meaning,
        projectName: q.vocab.projectName,
        mode: q.mode,
        promptRevealed: q.promptRevealed,
        userAnswers: q.userAnswers,
        answerState: q.answerState,
        timeSpent: q.timeSpent,
        isSlow: isSlow
      };
    });

    const score = correctCount; // Chỉ gõ 1 lần đúng mới tính làm điểm số
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const averageTime = totalQuestions > 0 ? (totalTimeSpent / totalQuestions) : 0;

    return {
      totalQuestions,
      correctCount,
      correctRetryCount, // câu gõ lần 2 đúng (không tính vào điểm chính thức)
      wrongCount,
      accuracy, // tỉ lệ đúng %
      totalTimeSpent,
      averageTime,
      details,
      // Đề xuất các từ cần ôn tập lại (những từ trả lời sai, đúng nhờ gợi ý, hoặc trả lời quá chậm)
      weakWordsToReview: this.questions
        .filter(q => q.answerState === "wrong" || q.answerState === "correct_retry" || q.timeSpent > 8.0)
        .map(q => q.vocab),
      wrongWordsToReview: Array.from(wrongVocabById.values())
    };
  }
}
