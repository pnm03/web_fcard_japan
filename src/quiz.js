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

  // Tạo danh sách câu hỏi
  generateQuestions() {
    const M = this.vocabPool.length;
    const N = this.questionCount;

    if (M === 0) {
      this.questions = [];
      return;
    }

    let selectedList = [];

    // Luật 1: Đảm bảo toàn bộ từ trong pool được xuất hiện ít nhất một lần
    let basePool = [...this.vocabPool];
    
    if (this.order === "random") {
      // Fisher-Yates shuffle (đảm bảo random đều)
      for (let i = basePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [basePool[i], basePool[j]] = [basePool[j], basePool[i]];
      }
    }

    if (N <= M) {
      selectedList = basePool.slice(0, N);
    } else {
      // Nếu số câu hỏi N lớn hơn số từ M
      selectedList = [...basePool];

      // Bổ sung thêm N - M từ
      const remainingCount = N - M;
      for (let i = 0; i < remainingCount; i++) {
        const randomVocab = this.vocabPool[Math.floor(Math.random() * M)];
        selectedList.push(randomVocab);
      }

      if (this.order === "random") {
        // Fisher-Yates shuffle
        for (let i = selectedList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [selectedList[i], selectedList[j]] = [selectedList[j], selectedList[i]];
        }
      }
    }

    // === CHỐNG LẶP 2 TỪ LIÊN TIẾP GIỐNG NHAU ===
    // Dùng thuật toán greedy: duyệt từng vị trí, nếu trùng với phần tử trước đó 
    // thì tìm phần tử khác phía sau để hoán đổi
    if (this.order === "random" && selectedList.length > 1) {
      for (let i = 1; i < selectedList.length; i++) {
        if (selectedList[i].id === selectedList[i - 1].id) {
          // Tìm phần tử khác phía sau để swap
          let swapped = false;
          for (let j = i + 1; j < selectedList.length; j++) {
            if (selectedList[j].id !== selectedList[i - 1].id && 
                (i + 1 >= selectedList.length || selectedList[j].id !== selectedList[i + 1]?.id)) {
              [selectedList[i], selectedList[j]] = [selectedList[j], selectedList[i]];
              swapped = true;
              break;
            }
          }
          // Nếu không tìm được phía sau, tìm phía trước (trước i-1)
          if (!swapped) {
            for (let j = 0; j < i - 1; j++) {
              if (selectedList[j].id !== selectedList[i].id &&
                  (j === 0 || selectedList[j - 1].id !== selectedList[i].id) &&
                  selectedList[j + 1].id !== selectedList[i].id) {
                // Chèn selectedList[i] vào vị trí j+1
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
        question.timeSpent // tổng thời gian qua các lượt thử
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
          question.timeSpent
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
