const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,

  // Quản lý cửa sổ chính & widget cũ
  openWidget: (quizData) => ipcRenderer.invoke('start-stealth-quiz', quizData || {}),
  hideWidget: () => ipcRenderer.invoke('hide-widget'),
  closeWidget: () => ipcRenderer.invoke('close-widget'),
  openMainWindow: () => ipcRenderer.invoke('open-main-window'),
  resizeWidget: (width, height) => ipcRenderer.invoke('resize-widget', { width, height }),
  setOpacity: (opacity) => ipcRenderer.invoke('set-opacity', opacity),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (data) => ipcRenderer.invoke('save-config', data),
  onToggleWidget: (callback) => {
    const sub = (_event, isVisible) => callback(isVisible);
    ipcRenderer.on('toggle-widget', sub);
    return () => ipcRenderer.removeListener('toggle-widget', sub);
  },

  // === CHẾ ĐỘ STEALTH 2 Ô (BOX 1: PROMPT, BOX 2: INPUT) ===
  startStealthQuiz: (quizData) => ipcRenderer.invoke('start-stealth-quiz', quizData),
  submitStealthAnswer: (answer) => ipcRenderer.invoke('stealth-submit-answer', answer),
  nextStealthQuestion: () => ipcRenderer.invoke('stealth-next-question'),
  closeStealthQuiz: () => ipcRenderer.invoke('stealth-close-quiz'),
  speakStealth: () => ipcRenderer.invoke('stealth-speak'),

  onStealthPromptUpdate: (callback) => {
    const sub = (_event, data) => callback(data);
    ipcRenderer.on('stealth-update-prompt', sub);
    return () => ipcRenderer.removeListener('stealth-update-prompt', sub);
  },
  onStealthInputUpdate: (callback) => {
    const sub = (_event, data) => callback(data);
    ipcRenderer.on('stealth-update-input', sub);
    return () => ipcRenderer.removeListener('stealth-update-input', sub);
  },
  onStealthAnswerFeedback: (callback) => {
    const sub = (_event, data) => callback(data);
    ipcRenderer.on('stealth-answer-feedback', sub);
    return () => ipcRenderer.removeListener('stealth-answer-feedback', sub);
  },
  onStealthSpeak: (callback) => {
    const sub = (_event) => callback();
    ipcRenderer.on('stealth-speak', sub);
    return () => ipcRenderer.removeListener('stealth-speak', sub);
  },
  onStealthQuizCompleted: (callback) => {
    const sub = (_event, data) => callback(data);
    ipcRenderer.on('stealth-quiz-completed', sub);
    return () => ipcRenderer.removeListener('stealth-quiz-completed', sub);
  },

  // === TỰ ĐỘNG NHẮC LẠI TỪ SAI ĐỊNH KỲ ===
  syncWrongWords: (words) => ipcRenderer.invoke('sync-wrong-words', words),
  setWrongReminderConfig: (config) => ipcRenderer.invoke('set-wrong-reminder-config', config),
  getWrongReminderConfig: () => ipcRenderer.invoke('get-wrong-reminder-config'),
  onWrongReminderAnswered: (callback) => {
    const sub = (_event, data) => callback(data);
    ipcRenderer.on('wrong-reminder-answered', sub);
    return () => ipcRenderer.removeListener('wrong-reminder-answered', sub);
  }
});
