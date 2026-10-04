const { app, BrowserWindow, Tray, Menu, ipcMain, globalShortcut, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục userData luôn tồn tại
const userDataPath = app.getPath('userData');
try {
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }
} catch (e) {}

const fallbackLogFile = 'C:\\Users\\Minh\\app_runtime.log';
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.writeFileSync(fallbackLogFile, line, { flag: 'a' }); } catch (e) {}
}

log('=== App starting ===');

process.on('uncaughtException', (err) => {
  log(`UNCAUGHT: ${err ? (err.stack || err) : 'unknown'}`);
});

process.on('unhandledRejection', (reason) => {
  log(`UNHANDLED: ${reason ? (reason.stack || reason) : 'unknown'}`);
});

// App ID cho Windows
app.setAppUserModelId('app.nihongo.flashcard');

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  log('SingleInstanceLock failed: another instance is running. Quitting.');
  app.quit();
  process.exit(0);
}
log('SingleInstanceLock acquired.');

const { pathToFileURL } = require('url');

let romajiToHiragana = null;
try {
  const kanaImePath = path.join(__dirname, '../src/kana-ime.js');
  if (fs.existsSync(kanaImePath)) {
    import(pathToFileURL(kanaImePath).href).then((m) => {
      romajiToHiragana = m.romajiToHiragana;
      log('Loaded kana-ime successfully in main process');
    }).catch((err) => {
      log('Failed to import kana-ime: ' + err.message);
    });
  }
} catch (e) {
  log('Error resolving kana-ime path: ' + e.message);
}

let mainWindow = null;
let promptWindow = null;
let inputWindow = null;
let tray = null;
let isQuitting = false;

let stealthSession = null;
let stealthNextTimer = null;

const configPath = path.join(userDataPath, 'nihongo-stealth-config.json');

function loadConfig() {
  const defaults = {
    promptBounds: null,
    inputBounds: null,
    opacity: 92,
    theme: 'dark',
    wrongReminder: {
      enabled: true,
      intervalMinutes: 10
    },
    wrongWordsPool: []
  };

  try {
    if (fs.existsSync(configPath)) {
      const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return Object.assign({}, defaults, data);
    }
  } catch (err) {
    log('Error reading config: ' + err.message);
  }
  return defaults;
}

function saveConfig(updates) {
  try {
    const current = loadConfig();
    const merged = Object.assign({}, current, updates);
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');
  } catch (err) {
    log('Error saving config: ' + err.message);
  }
}

function getIconPath() {
  const unpackedIco = path.join(process.resourcesPath || '', 'app.asar.unpacked/src-tauri/icons/icon.ico');
  if (fs.existsSync(unpackedIco)) return unpackedIco;
  const localIco = path.join(__dirname, '../src-tauri/icons/icon.ico');
  if (fs.existsSync(localIco)) return localIco;
  return null;
}

function loadHtmlFile(win, filename) {
  const devUrl = `http://localhost:5173/${filename}`;
  const distFile = path.join(__dirname, `../dist/${filename}`);
  const rootFile = path.join(__dirname, `../${filename}`);

  if (process.env.ELECTRON_DEV === '1') {
    win.loadURL(devUrl).catch(() => {
      win.loadFile(distFile).catch(() => win.loadFile(rootFile));
    });
    return;
  }

  if (fs.existsSync(distFile)) {
    win.loadFile(distFile).catch(err => {
      log(`Failed to load ${distFile}: ${err}`);
    });
  } else {
    win.loadFile(rootFile).catch(() => {
      win.loadURL(devUrl).catch(() => {});
    });
  }
}

// ==========================================
// CỬA SỔ CHÍNH (MAIN APP WINDOW)
// ==========================================
function createMainWindow() {
  log('createMainWindow starting');
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  mainWindow = new BrowserWindow({
    width: Math.min(1240, workArea.width - 80),
    height: Math.min(840, workArea.height - 80),
    minWidth: 920,
    minHeight: 600,
    center: true,
    title: 'Nihongo Flashcard',
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  loadHtmlFile(mainWindow, 'index.html');

  mainWindow.webContents.on('console-message', (_e, _level, message) => {
    log(`[mainWindow console] ${message}`);
  });

  mainWindow.on('close', (e) => {
    log('mainWindow close event');
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    log('mainWindow closed event');
    mainWindow = null;
  });

  log('createMainWindow completed');
}

// ==========================================
// Ô 1: PROMPT WINDOW (HIỂN THỊ CÂU HỎI)
// ==========================================
function createPromptWindow() {
  log('createPromptWindow starting');
  if (promptWindow && !promptWindow.isDestroyed()) {
    promptWindow.show();
    promptWindow.setAlwaysOnTop(true, 'screen-saver');
    return;
  }

  const config = loadConfig();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  let width = 290;
  let height = 54;
  let x = Math.round(workArea.x + (workArea.width / 2) - width - 12);
  let y = Math.round(workArea.y + 70);

  if (config.promptBounds && config.promptBounds.x !== undefined) {
    x = config.promptBounds.x;
    y = config.promptBounds.y;
    width = Math.max(290, config.promptBounds.width || 290);
    height = Math.max(54, config.promptBounds.height || 54);
  }

  promptWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    movable: true,
    hasShadow: true,
    show: false,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  promptWindow.setAlwaysOnTop(true, 'screen-saver');
  if (typeof promptWindow.setVisibleOnAllWorkspaces === 'function') {
    promptWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  loadHtmlFile(promptWindow, 'widget-prompt.html');

  promptWindow.once('ready-to-show', () => {
    promptWindow.show();
    promptWindow.setAlwaysOnTop(true, 'screen-saver');
    sendStealthUpdate();
  });

  promptWindow.on('blur', () => {
    if (promptWindow && !promptWindow.isDestroyed() && promptWindow.isVisible()) {
      promptWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });

  promptWindow.on('moved', () => {
    if (!promptWindow || promptWindow.isDestroyed()) return;
    const b = promptWindow.getBounds();
    saveConfig({ promptBounds: { x: b.x, y: b.y, width: b.width, height: b.height } });
  });

  promptWindow.on('closed', () => {
    promptWindow = null;
  });
  log('createPromptWindow completed');
}

// ==========================================
// Ô 2: INPUT WINDOW (Ô NHẬP ĐÁP ÁN)
// ==========================================
function createInputWindow() {
  log('createInputWindow starting');
  if (inputWindow && !inputWindow.isDestroyed()) {
    inputWindow.show();
    inputWindow.setAlwaysOnTop(true, 'screen-saver');
    inputWindow.focus();
    return;
  }

  const config = loadConfig();
  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  let width = 260;
  let height = 54;
  let x = Math.round(workArea.x + (workArea.width / 2) + 12);
  let y = Math.round(workArea.y + 70);

  if (config.inputBounds && config.inputBounds.x !== undefined) {
    x = config.inputBounds.x;
    y = config.inputBounds.y;
    width = Math.max(260, config.inputBounds.width || 260);
    height = Math.max(54, config.inputBounds.height || 54);
  }

  inputWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    resizable: true,
    movable: true,
    hasShadow: true,
    show: false,
    icon: getIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false
    }
  });

  inputWindow.setAlwaysOnTop(true, 'screen-saver');
  if (typeof inputWindow.setVisibleOnAllWorkspaces === 'function') {
    inputWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  loadHtmlFile(inputWindow, 'widget-input.html');

  inputWindow.once('ready-to-show', () => {
    inputWindow.show();
    inputWindow.setAlwaysOnTop(true, 'screen-saver');
    inputWindow.focus();
    sendStealthUpdate();
  });

  inputWindow.on('blur', () => {
    if (inputWindow && !inputWindow.isDestroyed() && inputWindow.isVisible()) {
      inputWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  });

  inputWindow.on('moved', () => {
    if (!inputWindow || inputWindow.isDestroyed()) return;
    const b = inputWindow.getBounds();
    saveConfig({ inputBounds: { x: b.x, y: b.y, width: b.width, height: b.height } });
  });

  inputWindow.on('closed', () => {
    inputWindow = null;
  });
  log('createInputWindow completed');
}

// ==========================================
// ĐIỀU PHỐI QUIZ STEALTH
// ==========================================
function removeVietnameseTones(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function checkIsAnswerCorrect(userAnswer, expected, mode) {
  const normalize = (s) => (s || "").trim().toLowerCase().replace(/\s+/g, " ");
  const u = normalize(userAnswer);
  const e = normalize(expected);
  if (!u || !e) return false;
  if (u === e) return true;

  if (mode === 'jp_to_meaning' || mode === 'romaji_to_meaning' || mode === 'audio_to_meaning') {
    if (removeVietnameseTones(u) === removeVietnameseTones(e)) return true;
    const parts = expected.split(/[,/;\n]+/).map(p => normalize(p)).filter(Boolean);
    for (const part of parts) {
      if (u === part || removeVietnameseTones(u) === removeVietnameseTones(part)) return true;
    }
  } else {
    const parts = expected.split(/[,/;\n]+/).map(p => normalize(p)).filter(Boolean);
    for (const part of parts) {
      if (u === part) return true;
    }
    if (mode === 'meaning_to_japanese' && romajiToHiragana) {
      try {
        const uKana = normalize(romajiToHiragana(u, { finalize: true }));
        for (const part of parts) {
          if (uKana === part) return true;
        }
      } catch (err) {}
    }
  }
  return false;
}

function generateHint(str) {
  if (!str) return "";
  const clean = str.trim();
  if (clean.length <= 2) return clean.charAt(0) + "*";
  const first = clean.charAt(0);
  const last = clean.charAt(clean.length - 1);
  const stars = "*".repeat(Math.max(1, Math.min(6, clean.length - 2)));
  return `${first}${stars}${last}`;
}

function recordWrongWordToPool(vocab) {
  if (!vocab || !vocab.id) return;
  try {
    const config = loadConfig();
    const pool = config.wrongWordsPool || [];
    const idx = pool.findIndex(w => w.id === vocab.id);
    if (idx >= 0) {
      pool[idx].wrongCount = (pool[idx].wrongCount || 1) + 1;
      pool[idx].lastFailed = Date.now();
      if (vocab.japanese) pool[idx].japanese = vocab.japanese;
      if (vocab.romaji) pool[idx].romaji = vocab.romaji;
      if (vocab.meaning) pool[idx].meaning = vocab.meaning;
    } else {
      pool.push({
        id: vocab.id,
        projectId: vocab.projectId,
        japanese: vocab.japanese || "",
        romaji: vocab.romaji || "",
        meaning: vocab.meaning || "",
        mode: vocab.mode || "meaning_to_romaji",
        wrongCount: 1,
        lastFailed: Date.now()
      });
    }
    saveConfig({ wrongWordsPool: pool });
  } catch (err) {
    log('recordWrongWordToPool error: ' + err.message);
  }
}

function handleWrongReminderSuccess(q) {
  try {
    const config = loadConfig();
    let pool = config.wrongWordsPool || [];
    // Khi đã ôn đúng từ sai này qua popup, tạm loại khỏi pool để xoay vòng từ khác
    pool = pool.filter(w => w.id !== q.id);
    saveConfig({ wrongWordsPool: pool });
  } catch (err) {
    log('handleWrongReminderSuccess error: ' + err.message);
  }
}

let wrongReminderIntervalId = null;

function setupWrongReminderTimer() {
  if (wrongReminderIntervalId) {
    clearInterval(wrongReminderIntervalId);
    wrongReminderIntervalId = null;
  }

  const config = loadConfig();
  const reminderConfig = config.wrongReminder || { enabled: true, intervalMinutes: 10 };

  if (!reminderConfig.enabled) {
    log('Wrong words reminder is currently disabled.');
    return;
  }

  const intervalMinutes = Math.max(1, parseInt(reminderConfig.intervalMinutes) || 10);
  const intervalMs = intervalMinutes * 60 * 1000;
  log(`Setting up wrong words reminder every ${intervalMinutes} mins (${intervalMs}ms).`);

  wrongReminderIntervalId = setInterval(() => {
    triggerWrongWordReminder();
  }, intervalMs);
}

function triggerWrongWordReminder() {
  // Không làm gián đoạn nếu đang trong phiên kiểm tra stealth chủ động
  if (stealthSession && stealthSession.questions && stealthSession.questions.length > 0 && stealthSession.currentIndex < stealthSession.questions.length) {
    log('Reminder deferred: stealth quiz session is active.');
    return;
  }

  // Không bật nếu các ô đang hiển thị
  if ((promptWindow && promptWindow.isVisible()) || (inputWindow && inputWindow.isVisible())) {
    log('Reminder deferred: widget windows already open.');
    return;
  }

  const config = loadConfig();
  const pool = config.wrongWordsPool || [];
  if (!pool || pool.length === 0) {
    log('Wrong words reminder: pool is empty.');
    return;
  }

  // Chọn ngẫu nhiên 1 từ sai từ pool
  const randomIndex = Math.floor(Math.random() * pool.length);
  const target = pool[randomIndex];

  const mode = target.mode || 'meaning_to_romaji';
  let prompt = target.meaning || target.japanese;
  let subPrompt = '⏰ Nhắc từ sai: Gõ Romaji';
  let expectedAnswer = target.romaji || target.meaning || target.japanese;

  if (mode === 'meaning_to_romaji') {
    prompt = target.meaning || 'Từ vựng';
    subPrompt = '⏰ Nhắc từ sai: Gõ Romaji';
    expectedAnswer = target.romaji || '';
  } else if (mode === 'meaning_to_japanese') {
    prompt = target.meaning || 'Từ vựng';
    subPrompt = '⏰ Nhắc từ sai: Gõ chữ Nhật';
    const kana = (romajiToHiragana && target.romaji) ? romajiToHiragana(target.romaji, { finalize: true }) : '';
    const cands = [target.japanese, kana, target.romaji].filter(Boolean);
    expectedAnswer = Array.from(new Set(cands)).join(', ');
  } else if (mode === 'jp_to_meaning') {
    prompt = target.japanese || '';
    subPrompt = target.romaji ? `⏰ Nhắc từ sai: [${target.romaji}]` : '⏰ Nhắc từ sai: Gõ nghĩa';
    expectedAnswer = target.meaning || '';
  }

  const question = {
    id: target.id,
    projectId: target.projectId,
    japanese: target.japanese || '',
    romaji: target.romaji || '',
    meaning: target.meaning || '',
    mode,
    prompt,
    subPrompt,
    expectedAnswer,
    isWrongReminder: true
  };

  stealthSession = {
    questions: [question],
    currentIndex: 0,
    results: [],
    mode,
    allowRetry: true,
    repeatWrongPractice: false,
    total: 1,
    isWrongReminder: true
  };

  createPromptWindow();
  createInputWindow();

  if (inputWindow && !inputWindow.isDestroyed()) {
    inputWindow.show();
    inputWindow.setAlwaysOnTop(true, 'screen-saver');
    inputWindow.focus();
  }
}

function sendStealthUpdate() {
  if (!stealthSession || !stealthSession.questions || stealthSession.currentIndex >= stealthSession.questions.length) {
    finishStealthQuiz();
    return;
  }

  const q = stealthSession.questions[stealthSession.currentIndex];
  const currentNum = stealthSession.currentIndex + 1;
  const total = stealthSession.total;
  const remaining = total - currentNum;

  const isReminder = stealthSession.isWrongReminder;
  const counterText = isReminder
    ? '⏰ Nhắc từ sai'
    : (remaining > 0 ? `Còn ${remaining} từ` : `Câu cuối (${currentNum}/${total})`);

  let word = q.prompt || q.japanese;
  let sub = q.subPrompt || (q.romaji ? `[${q.romaji}]` : '');
  let soundText = q.japanese || '';

  if (promptWindow && !promptWindow.isDestroyed()) {
    promptWindow.webContents.send('stealth-update-prompt', {
      word,
      sub,
      soundText,
      counterText
    });
  }

  if (inputWindow && !inputWindow.isDestroyed()) {
    let placeholder = 'Đáp án... ↵';
    if (q.mode === 'jp_to_meaning' || q.mode === 'romaji_to_meaning' || q.mode === 'audio_to_meaning') {
      placeholder = 'Nghĩa tiếng Việt... ↵';
    } else if (q.mode === 'meaning_to_romaji' || q.mode === 'jp_to_romaji') {
      placeholder = 'Gõ Romaji... ↵';
    } else if (q.mode === 'meaning_to_japanese') {
      placeholder = 'Gõ chữ Nhật... ↵';
    }

    inputWindow.webContents.send('stealth-update-input', {
      placeholder,
      mode: q.mode
    });
  }
}

function closeStealthQuiz() {
  if (stealthNextTimer) {
    clearTimeout(stealthNextTimer);
    stealthNextTimer = null;
  }
  if (promptWindow && !promptWindow.isDestroyed()) promptWindow.hide();
  if (inputWindow && !inputWindow.isDestroyed()) inputWindow.hide();
  if (mainWindow && !mainWindow.isDestroyed() && !stealthSession?.isWrongReminder) {
    mainWindow.show();
    mainWindow.focus();
  }
}

function finishStealthQuiz() {
  const results = stealthSession ? stealthSession.results : [];
  const isReminder = stealthSession && stealthSession.isWrongReminder;

  if (stealthNextTimer) {
    clearTimeout(stealthNextTimer);
    stealthNextTimer = null;
  }

  if (promptWindow && !promptWindow.isDestroyed()) promptWindow.hide();
  if (inputWindow && !inputWindow.isDestroyed()) inputWindow.hide();

  if (isReminder) {
    // Nếu là phiên nhắc từ sai định kỳ: Giữ không gian yên tĩnh, không ép bung to màn hình chính
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('stealth-quiz-completed', { results, isWrongReminder: true });
    }
  } else {
    // Phiên kiểm tra người dùng bấm bắt đầu: Hiện lại ứng dụng và báo kết quả
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('stealth-quiz-completed', { results, isWrongReminder: false });
    }
  }

  stealthSession = null;
}

// ==========================================
// IPC HANDLERS
// ==========================================
ipcMain.handle('open-main-window', () => {
  createMainWindow();
});

ipcMain.handle('start-stealth-quiz', (_event, quizData) => {
  log('start-stealth-quiz with ' + (quizData.questions ? quizData.questions.length : 0) + ' questions');
  stealthSession = {
    questions: quizData.questions || [],
    currentIndex: 0,
    results: [],
    mode: quizData.mode || 'jp_to_meaning',
    allowRetry: quizData.allowRetry !== false,
    repeatWrongPractice: quizData.repeatWrongPractice === true,
    total: quizData.questions ? quizData.questions.length : 0,
    isWrongReminder: false
  };

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }

  createPromptWindow();
  createInputWindow();
  return { success: true };
});

ipcMain.handle('stealth-submit-answer', (_event, userAnswer) => {
  if (!stealthSession || stealthSession.currentIndex >= stealthSession.questions.length) return;

  const q = stealthSession.questions[stealthSession.currentIndex];
  q.attempts = (q.attempts || 0) + 1;

  const expected = q.expectedAnswer || q.meaning || q.romaji || q.japanese;
  const isCorrect = checkIsAnswerCorrect(userAnswer, expected, q.mode);
  let solution = expected;
  if (q.mode === 'meaning_to_japanese') {
    solution = q.japanese || expected.split(',')[0].trim();
  }

  if (isCorrect) {
    stealthSession.results.push({
      vocabId: q.id,
      projectId: q.projectId,
      isCorrect: true,
      userAnswer,
      expectedAnswer: solution,
      attempts: q.attempts
    });

    if (q.isWrongReminder) {
      handleWrongReminderSuccess(q);
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('wrong-reminder-answered', {
          vocabId: q.id,
          projectId: q.projectId,
          isCorrect: true
        });
      }
    }

    if (inputWindow && !inputWindow.isDestroyed()) {
      inputWindow.webContents.send('stealth-answer-feedback', {
        isCorrect: true,
        solution,
        retryAllowed: false
      });
    }

    setTimeout(() => {
      if (stealthSession) {
        stealthSession.currentIndex++;
        sendStealthUpdate();
      }
    }, 280);
    return;
  }

  // TRẢ LỜI SAI:
  // 1. Kiểm tra nếu cho phép sai 1 lần (allowRetry) và đang ở lần thử 1
  if (stealthSession.allowRetry && q.attempts === 1) {
    const hint = generateHint(solution);
    if (inputWindow && !inputWindow.isDestroyed()) {
      inputWindow.webContents.send('stealth-answer-feedback', {
        isCorrect: false,
        retryAllowed: true,
        hint,
        message: `Sai rồi! Thử lại 1 lần nữa${hint ? ` (${hint})` : ''} ↵`
      });
    }
    return;
  }

  // 2. SAI HOÀN TOÀN:
  stealthSession.results.push({
    vocabId: q.id,
    projectId: q.projectId,
    isCorrect: false,
    userAnswer,
    expectedAnswer: solution,
    attempts: q.attempts
  });

  // Tự động lưu từ sai vào pool để nhắc lại định kỳ sau mỗi X phút
  recordWrongWordToPool({
    id: q.id,
    projectId: q.projectId,
    japanese: q.japanese,
    romaji: q.romaji,
    meaning: q.meaning,
    mode: q.mode
  });

  if (q.isWrongReminder) {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('wrong-reminder-answered', {
        vocabId: q.id,
        projectId: q.projectId,
        isCorrect: false
      });
    }
  }

  // Nếu người dùng chọn "Sai hoàn toàn thì làm lại ở cuối buổi" (repeatWrongPractice)
  if (stealthSession.repeatWrongPractice && !q.isRepeatPractice) {
    stealthSession.questions.push({
      ...q,
      attempts: 0,
      isRepeatPractice: true,
      subPrompt: `🔄 Làm lại: ${q.subPrompt || ''}`
    });
    stealthSession.total = stealthSession.questions.length;
  }

  // Gửi kết quả sai và đáp án đúng cho ô nhập
  if (inputWindow && !inputWindow.isDestroyed()) {
    inputWindow.webContents.send('stealth-answer-feedback', {
      isCorrect: false,
      retryAllowed: false,
      solution
    });
  }

  // QUAN TRỌNG: Không hẹn giờ tự động chuyển câu!
  // Bắt buộc người dùng ấn Enter để xác nhận mới sang câu tiếp theo.
});

ipcMain.handle('stealth-next-question', () => {
  if (stealthNextTimer) {
    clearTimeout(stealthNextTimer);
    stealthNextTimer = null;
  }
  if (stealthSession) {
    stealthSession.currentIndex++;
    sendStealthUpdate();
  }
});

ipcMain.handle('stealth-close-quiz', () => {
  closeStealthQuiz();
});

ipcMain.handle('stealth-speak', () => {
  if (promptWindow && !promptWindow.isDestroyed()) {
    promptWindow.webContents.send('stealth-speak');
  }
});

ipcMain.handle('get-config', () => {
  return loadConfig();
});

ipcMain.handle('save-config', (_event, data) => {
  saveConfig(data);
});

// IPC cho tính năng tự động nhắc lại từ sai định kỳ
ipcMain.handle('sync-wrong-words', (_event, words) => {
  if (!Array.isArray(words)) return { count: 0 };
  const config = loadConfig();
  const pool = config.wrongWordsPool || [];
  const map = new Map();
  pool.forEach(w => map.set(w.id, w));
  words.forEach(w => {
    if (w && w.id) {
      const existing = map.get(w.id);
      map.set(w.id, {
        id: w.id,
        projectId: w.projectId,
        japanese: w.japanese || (existing ? existing.japanese : ""),
        romaji: w.romaji || (existing ? existing.romaji : ""),
        meaning: w.meaning || (existing ? existing.meaning : ""),
        mode: w.mode || (existing ? existing.mode : "meaning_to_romaji"),
        wrongCount: Math.max(w.wrongCount || 1, existing ? existing.wrongCount || 1 : 1),
        lastFailed: Date.now()
      });
    }
  });
  const newPool = Array.from(map.values());
  saveConfig({ wrongWordsPool: newPool });
  return { count: newPool.length };
});

ipcMain.handle('set-wrong-reminder-config', (_event, reminderConfig) => {
  saveConfig({ wrongReminder: reminderConfig });
  setupWrongReminderTimer();
  return { success: true };
});

ipcMain.handle('get-wrong-reminder-config', () => {
  const config = loadConfig();
  return {
    wrongReminder: config.wrongReminder || { enabled: true, intervalMinutes: 10 },
    wrongPoolCount: (config.wrongWordsPool || []).length
  };
});

// ==========================================
// TRAY & SHORTCUTS
// ==========================================
function createTray() {
  try {
    const iconPath = getIconPath();
    if (!iconPath) return;

    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.isEmpty() ? iconPath : icon);
    tray.setToolTip('Nihongo Flashcard - Desktop App');

    const updateTrayMenu = () => {
      const isStealthActive = (promptWindow && promptWindow.isVisible()) || (inputWindow && inputWindow.isVisible());
      const config = loadConfig();
      const reminder = config.wrongReminder || { enabled: true, intervalMinutes: 10 };
      const poolCount = (config.wrongWordsPool || []).length;

      const contextMenu = Menu.buildFromTemplate([
        {
          label: '📖 Mở Bảng Học Đầy Đủ',
          click: () => createMainWindow()
        },
        { type: 'separator' },
        {
          label: isStealthActive ? '👁️ Ẩn 2 Ô Mini (Esc)' : '📌 Hiện 2 Ô Mini',
          click: () => {
            if (isStealthActive) {
              closeStealthQuiz();
            } else if (stealthSession) {
              createPromptWindow();
              createInputWindow();
            } else {
              createMainWindow();
            }
          }
        },
        {
          label: reminder.enabled
            ? `⏰ Nhắc từ sai: Bật (${reminder.intervalMinutes}p - ${poolCount} từ)`
            : '⏰ Nhắc từ sai: Đang tắt',
          click: () => {
            reminder.enabled = !reminder.enabled;
            saveConfig({ wrongReminder: reminder });
            setupWrongReminderTimer();
            updateTrayMenu();
          }
        },
        { type: 'separator' },
        {
          label: '❌ Thoát hoàn toàn',
          click: () => {
            isQuitting = true;
            app.quit();
          }
        }
      ]);
      tray.setContextMenu(contextMenu);
    };

    updateTrayMenu();
    tray.on('click', () => {
      if (promptWindow && promptWindow.isVisible()) {
        closeStealthQuiz();
      } else {
        createMainWindow();
      }
    });
    log('createTray completed');
  } catch (err) {
    log('Failed to create tray: ' + err.message);
  }
}

// Khi người dùng click lại icon trên Desktop
app.on('second-instance', () => {
  log('second-instance event received');
  if (inputWindow && !inputWindow.isDestroyed() && inputWindow.isVisible()) {
    inputWindow.focus();
    if (promptWindow && !promptWindow.isDestroyed()) promptWindow.show();
  } else {
    createMainWindow();
  }
});

// ==========================================
// KHỞI ĐỘNG APP
// ==========================================
app.whenReady().then(() => {
  log('app.whenReady reached');
  createTray();
  setupWrongReminderTimer();
  // Khởi động vào Cửa Sổ Chính để người dùng chọn bài, số từ, chế độ kiểm tra trước
  createMainWindow();

  try {
    globalShortcut.register('CommandOrControl+Shift+H', () => {
      if ((promptWindow && promptWindow.isVisible()) || (inputWindow && inputWindow.isVisible())) {
        closeStealthQuiz();
      } else if (stealthSession) {
        createPromptWindow();
        createInputWindow();
      } else {
        createMainWindow();
      }
    });
    log('globalShortcut registered');
  } catch (err) {
    log('Could not register shortcut: ' + err.message);
  }

  app.on('activate', () => {
    createMainWindow();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
