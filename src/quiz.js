import { getProjectById, getProjects, updateVocabStats, removeVietnameseTones } from "./storage.js";

export function normalizeString(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " "); // thay thế nhiều dấu cách bằng 1 dấu cách
}

export function isSmartVietnameseMatch(userAnswer, correctAnswer) {
  const normUser = normalizeString(userAnswer);
  const normCorrect = normalizeString(correctAnswer);
  
  if (normUser === normCorrect) return true;

  const normUserNoTone = removeVietnameseTones(normUser);
  const normCorrectNoTone = removeVietnameseTones(normCorrect);
  if (normUserNoTone === normCorrectNoTone) return true;

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

// Tạo gợi ý (Hint) cho một chuỗi đáp án
export function generateHint(answer, mode) {
  if (!answer) return "";
  
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
    this.quizMode = config.quizMode || "mixed"; // 'jp_to_romaji', 'meaning_to_romaji', 'jp_to_meaning', 'mixed'
    this.order = config.order || "random"; // 'sequential', 'random'
    this.allowRetry = config.allowRetry !== false; // mặc định cho phép retry

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
        const modes = ["meaning_to_romaji", "romaji_to_meaning", "jp_to_meaning"];
        activeMode = modes[Math.floor(Math.random() * modes.length)];
      }

      return {
        sessionQuestionId: `q-${index}-${Date.now()}`,
        vocab: vocab,
        mode: activeMode,
        attempts: 0,
        answerState: "unanswered", // 'unanswered', 'correct', 'correct_retry', 'wrong'
        userAnswers: [],
        timeSpent: 0,
        hintShown: ""
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

    // Lấy đáp án đúng và chuẩn hóa
    let correctAnswer = "";
    let isCorrect = false;

    if (question.mode === "jp_to_meaning" || question.mode === "romaji_to_meaning") {
      correctAnswer = question.vocab.meaning;
      isCorrect = isSmartVietnameseMatch(userAnswer, correctAnswer);
    } else {
      // Nhập Romaji (meaning_to_romaji)
      correctAnswer = question.vocab.romaji;
      isCorrect = normalizeString(userAnswer) === normalizeString(correctAnswer);
    }

    if (isCorrect) {
      // Trả lời đúng
      const wasRetry = question.attempts > 1;
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

    const details = this.questions.map(q => {
      totalTimeSpent += q.timeSpent;
      if (q.answerState === "correct") correctCount++;
      else if (q.answerState === "correct_retry") correctRetryCount++;
      else if (q.answerState === "wrong") wrongCount++;

      // Xác định câu trả lời có bị coi là "Phản xạ chậm" hay không
      // Ngưỡng chậm: Trả lời mất trên 8 giây
      const isSlow = q.answerState.startsWith("correct") && q.timeSpent > 8.0;

      return {
        japanese: q.vocab.japanese,
        romaji: q.vocab.romaji,
        meaning: q.vocab.meaning,
        projectName: q.vocab.projectName,
        mode: q.mode,
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
        .map(q => q.vocab)
    };
  }
}
