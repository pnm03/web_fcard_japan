import { 
  getProjects, 
  getProjectById, 
  addProject, 
  deleteProject, 
  updateProjectInfo,
  addVocabToProject, 
  updateVocabInProject, 
  deleteVocabFromProject,
  getWeakVocab,
  searchDictionary,
  saveToDictionaryCache,
  fetchAndSyncFromSupabase,
  setOnSyncStateChange
} from "./storage.js";
import { QuizSession } from "./quiz.js";
import { 
  HIRAGANA_LIST, 
  KATAKANA_LIST, 
  generateKanaDistractors, 
  evaluateDrawing 
} from "./kana.js";


// Khai báo các biến trạng thái giao diện toàn cục
let currentProjectId = null;
let activeQuizSession = null;
let quizTimerInterval = null;
let currentQuestionTime = 0;
let quizConfigBackup = null; // Dùng để làm lại bài kiểm tra
let quizSelectedVocabIds = [];
let tempSelectedVocabIds = [];

// Lọc bỏ Kanji, chỉ lấy phần chữ mềm Hiragana/Katakana
export function cleanToKanaOnly(japaneseText) {
  if (!japaneseText) return "";
  
  const match = japaneseText.match(/\(([^)]+)\)/) || japaneseText.match(/（([^）]+)）/);
  if (match) {
    const content = match[1].trim();
    const hasKanji = /[\u4E00-\u9FAF]/.test(content);
    if (!hasKanji) {
      return content;
    } else {
      return japaneseText.replace(/\([^)]+\)/g, "").replace(/（[^）]+）/g, "").trim();
    }
  }
  
  return japaneseText.trim();
}

// Hàm phát âm tiếng Nhật dùng Text-to-Speech của trình duyệt
export function speakJapanese(text) {
  if ('speechSynthesis' in window) {
    // Hủy các giọng đọc đang dang dở để tránh xếp hàng quá lâu
    window.speechSynthesis.cancel();
    
    // Loại bỏ các chữ Latinh/Romaji/chú thích ở trong ngoặc (nếu có) để chỉ phát âm chữ Nhật
    const cleanText = text.replace(/\([^)]*\)/g, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.85; // giọng đọc hơi chậm một chút để nghe rõ hơn
    
    // Tìm giọng đọc tiếng Nhật tốt nhất
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(voice => voice.lang.startsWith('ja') || voice.lang === 'ja_JP');
    if (jaVoice) {
      utterance.voice = jaVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

// Khởi tạo các sự kiện giao diện
export function initUI() {
  setupNavigation();
  setupProjectActions();
  setupVocabActions();
  setupQuizConfigEvents();
  setupQuizActiveEvents();
  setupReportEvents();
  setupJsonImportExport();
  setupDictionaryEvents();
  setupKanaEvents();
  
  // Tải danh sách giọng nói speechSynthesis một cách chủ động (khắc phục lỗi Chrome trả về mảng rỗng lần đầu)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }
  
  // Khởi tạo hiển thị trạng thái đồng bộ đám mây và chạy đồng bộ ngầm lần đầu
  setupCloudSyncUI();
  
  // Khôi phục view trước đó
  restoreActiveView();
}

function setupCloudSyncUI() {
  const syncStatusEl = document.getElementById("cloud-sync-status");
  if (!syncStatusEl) return;
  
  const iconEl = syncStatusEl.querySelector(".sync-icon");
  const textEl = syncStatusEl.querySelector(".sync-text");
  
  setOnSyncStateChange((state) => {
    syncStatusEl.className = "sync-status"; // reset classes
    
    if (state === "syncing") {
      syncStatusEl.classList.add("status-syncing");
      iconEl.textContent = "🔄";
      textEl.textContent = "Đang đồng bộ...";
    } else if (state === "synced") {
      syncStatusEl.classList.add("status-synced");
      iconEl.textContent = "☁️";
      textEl.textContent = "Đã đồng bộ";
    } else if (state === "error") {
      syncStatusEl.classList.add("status-error");
      iconEl.textContent = "⚠️";
      textEl.textContent = "Lỗi đồng bộ";
    }
  });
  
  // Kích hoạt đồng bộ ngầm từ Supabase về LocalStorage khi khởi động app
  fetchAndSyncFromSupabase().then(() => {
    const activeView = localStorage.getItem("web_fcard_active_view") || "dashboard-view";
    if (activeView === "dashboard-view") {
      renderDashboard();
    } else if (activeView === "projects-view") {
      renderProjectList();
    } else if (activeView === "project-detail-view") {
      renderProjectDetail();
    } else if (activeView === "weak-vocab-view") {
      renderWeakVocabView();
    }
  });
}

// 1. Quản lý Điều hướng (Navigation)
function setupNavigation() {
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-target");
      switchView(targetView);
    });
  });

  document.getElementById("logo-btn").addEventListener("click", (e) => {
    e.preventDefault();
    switchView("dashboard-view");
  });
}

export function restoreActiveView() {
  let activeView = localStorage.getItem("web_fcard_active_view") || "dashboard-view";
  const activeProjectId = localStorage.getItem("web_fcard_active_project_id");

  // Đưa các màn hình thực hành động về màn hình cài đặt tương ứng để tránh rỗng dữ liệu
  if (activeView === "quiz-active-view" || activeView === "quiz-report-view") {
    activeView = "quiz-setup-view";
  } else if (activeView === "kana-practice-view") {
    activeView = "kana-setup-view";
  }

  if (activeView === "project-detail-view" && activeProjectId) {
    showProjectDetail(activeProjectId);
  } else {
    switchView(activeView);
  }
}

export function switchView(viewId) {
  // Dừng timer của quiz nếu đang chạy mà người dùng thoát ra ngoài
  if (viewId !== "quiz-active-view" && quizTimerInterval) {
    clearInterval(quizTimerInterval);
  }

  // Lưu trạng thái view hiện tại vào localStorage
  localStorage.setItem("web_fcard_active_view", viewId);
  if (viewId === "project-detail-view" && currentProjectId) {
    localStorage.setItem("web_fcard_active_project_id", currentProjectId);
  } else if (viewId !== "project-detail-view" && viewId !== "quiz-active-view" && viewId !== "quiz-report-view" && viewId !== "kana-practice-view") {
    localStorage.removeItem("web_fcard_active_project_id");
  }

  // Cập nhật trạng thái active trên thanh nav
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    if (btn.getAttribute("data-target") === viewId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Ẩn tất cả các view, hiển thị view mục tiêu
  const views = document.querySelectorAll(".view-section");
  views.forEach(view => {
    if (view.id === viewId) {
      view.classList.add("active");
    } else {
      view.classList.remove("active");
    }
  });

  // Tải dữ liệu động tương ứng với view được hiển thị
  if (viewId === "dashboard-view") {
    renderDashboard();
  } else if (viewId === "projects-view") {
    renderProjectList();
  } else if (viewId === "weak-vocab-view") {
    renderWeakVocabView();
  } else if (viewId === "quiz-setup-view") {
    setupQuizConfig();
  } else if (viewId === "dictionary-view") {
    const input = document.getElementById("dict-search-input");
    if (input) {
      input.value = "";
      document.getElementById("dict-welcome-panel").style.display = "block";
      document.getElementById("dict-results-panel").style.display = "none";
      setTimeout(() => input.focus(), 150);
    }
  } else if (viewId === "kana-setup-view") {
    renderKanaSetup();
  }
}

// 2. Render Dashboard (Bảng điều khiển chính)
function renderDashboard() {
  const projects = getProjects();
  let totalWords = 0;
  let totalCorrect = 0;
  let totalWrong = 0;

  projects.forEach(p => {
    totalWords += p.vocab.length;
    p.vocab.forEach(v => {
      totalCorrect += v.correctCount || 0;
      totalWrong += v.wrongCount || 0;
    });
  });

  // Hiển thị số liệu thống kê
  document.getElementById("stat-projects-count").textContent = projects.length;
  document.getElementById("stat-words-count").textContent = totalWords;

  const totalTests = totalCorrect + totalWrong;
  const accuracy = totalTests > 0 ? Math.round((totalCorrect / totalTests) * 100) : 0;
  document.getElementById("stat-accuracy").textContent = accuracy + "%";

  // Hiển thị danh sách từ yếu xem trước (Weak Vocab Preview)
  const weakVocab = getWeakVocab(null, 5); // Lấy tối đa 5 từ yếu nhất
  const previewContainer = document.getElementById("dashboard-weak-vocab-preview");

  if (weakVocab.length === 0) {
    previewContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--ink-faint); font-family: var(--font-serif); font-size: 16px;">
        🎉 Tuyệt vời! Bạn không có từ vựng nào bị xếp vào nhóm yếu. Hãy tiếp tục phát huy!
      </div>
    `;
    document.getElementById("dashboard-start-weak-btn").style.display = "none";
  } else {
    document.getElementById("dashboard-start-weak-btn").style.display = "inline-flex";
    
    let tableHtml = `
      <div class="vocab-table-container">
        <table class="vocab-table">
          <thead>
            <tr>
              <th>Tiếng Nhật</th>
              <th>Romaji</th>
              <th>Nghĩa</th>
              <th>Dự án</th>
              <th style="text-align: center;">Độ Khó</th>
            </tr>
          </thead>
          <tbody>
    `;

    weakVocab.forEach(v => {
      // Xác định độ khó badge
      let difficultyBadge = `<span class="vocab-badge badge-easy">${v.difficultyScore} (Dễ)</span>`;
      if (v.difficultyScore > 70) {
        difficultyBadge = `<span class="vocab-badge badge-hard">${v.difficultyScore} (Quên nặng)</span>`;
      } else if (v.difficultyScore > 40) {
        difficultyBadge = `<span class="vocab-badge badge-medium">${v.difficultyScore} (Trung bình)</span>`;
      }

      tableHtml += `
        <tr>
          <td data-label="Tiếng Nhật" class="vocab-jp-cell">
            ${cleanToKanaOnly(v.japanese)}
            <button class="btn btn-secondary speak-row-btn" data-text="${cleanToKanaOnly(v.japanese)}" style="width:24px; height:24px; font-size:0.7rem; vertical-align:middle; padding:0; border:none; background:transparent; box-shadow:none; cursor:pointer;" title="Nghe phát âm">🔊</button>
          </td>
          <td data-label="Romaji" style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink-soft);">${v.romaji}</td>
          <td data-label="Ý nghĩa">${v.meaning}</td>
          <td data-label="Dự án" style="color: var(--ink-faint); font-family: var(--font-mono); font-size: 11px;">${v.projectName}</td>
          <td data-label="Độ khó" style="text-align: center;">${difficultyBadge}</td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </div>
    `;
    previewContainer.innerHTML = tableHtml;

    // Đăng ký phát âm cho dòng
    document.querySelectorAll(".speak-row-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        speakJapanese(btn.getAttribute("data-text"));
      };
    });
  }

  // Đăng ký sự kiện nút Ôn tập từ yếu nhanh từ dashboard
  document.getElementById("dashboard-start-weak-btn").onclick = () => {
    switchView("weak-vocab-view");
  };
}

// 3. Quản lý Dự án (Projects List)
function setupProjectActions() {
  const createModal = document.getElementById("project-modal");
  const openModalBtn = document.getElementById("open-create-project-modal-btn");
  const closeModalBtn = document.getElementById("close-project-modal-btn");
  const projectForm = document.getElementById("project-form");

  openModalBtn.addEventListener("click", () => {
    document.getElementById("project-modal-title").textContent = "➕ Tạo Dự Án Mới";
    document.getElementById("project-modal-id").value = "";
    projectForm.reset();
    createModal.classList.add("active");
  });

  closeModalBtn.addEventListener("click", () => {
    createModal.classList.remove("active");
  });

  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("project-modal-id").value;
    const name = document.getElementById("project-modal-name").value;
    const desc = document.getElementById("project-modal-desc").value;

    if (id) {
      updateProjectInfo(id, name, desc);
    } else {
      const newProj = addProject(name, desc);
      if (newProj && newProj.id) {
        localStorage.setItem("last_selected_project_id", newProj.id);
      }
    }

    createModal.classList.remove("active");
    renderProjectList();
  });
}

function renderProjectList() {
  const projects = getProjects();
  const container = document.getElementById("project-list-container");
  container.innerHTML = "";

  if (projects.length === 0) {
    container.innerHTML = `
      <div class="glass-panel" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="font-size: 1.2rem; color: var(--ink-soft); margin-bottom: 1.5rem; font-family: var(--font-serif);">Bạn chưa có dự án học tập nào.</p>
        <button class="btn btn-primary" onclick="document.getElementById('open-create-project-modal-btn').click()">Tạo dự án đầu tiên</button>
      </div>
    `;
    return;
  }

  projects.forEach(p => {
    const card = document.createElement("div");
    card.className = "glass-panel project-card";
    
    card.innerHTML = `
      <div class="project-card-header">
        <div>
          <h3 class="project-card-title">${p.name}</h3>
          <p class="project-card-desc">${p.description || "Không có mô tả."}</p>
        </div>
        <span class="project-card-badge">${p.vocab.length} từ</span>
      </div>
      <div class="project-card-footer">
        <span>Nhấp để quản lý chi tiết</span>
        <div class="project-actions" onclick="event.stopPropagation();">
          <button class="btn btn-secondary btn-icon edit-proj-btn" data-id="${p.id}" title="Sửa tên/mô tả" style="width:30px; height:30px;">✏️</button>
          <button class="btn btn-danger btn-icon delete-proj-btn" data-id="${p.id}" title="Xóa dự án" style="width:30px; height:30px;">🗑️</button>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      showProjectDetail(p.id);
    });

    container.appendChild(card);
  });

  // Đăng ký sự kiện Sửa/Xóa dự án trên card
  document.querySelectorAll(".edit-proj-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const projId = btn.getAttribute("data-id");
      const proj = getProjectById(projId);
      if (proj) {
        document.getElementById("project-modal-title").textContent = "✏️ Sửa Thông Tin Dự Án";
        document.getElementById("project-modal-id").value = proj.id;
        document.getElementById("project-modal-name").value = proj.name;
        document.getElementById("project-modal-desc").value = proj.description;
        document.getElementById("project-modal").classList.add("active");
      }
    });
  });

  document.querySelectorAll(".delete-proj-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const projId = btn.getAttribute("data-id");
      const proj = getProjectById(projId);
      if (proj) {
        if (confirm(`Bạn có chắc chắn muốn xóa dự án "${proj.name}"? Toàn bộ từ vựng bên trong sẽ bị mất.`)) {
          deleteProject(projId);
          renderProjectList();
        }
      }
    });
  });
}

// 4. Chi tiết dự án (Project Detail)
function showProjectDetail(projectId) {
  currentProjectId = projectId;
  // Đồng bộ dự án đang xem vào last_selected_project_id để mặc định khi tra từ điển
  localStorage.setItem("last_selected_project_id", projectId);
  switchView("project-detail-view");
  renderProjectDetail();
}

function renderProjectDetail() {
  const proj = getProjectById(currentProjectId);
  if (!proj) {
    switchView("projects-view");
    return;
  }

  document.getElementById("detail-project-title").textContent = proj.name;
  document.getElementById("detail-project-desc").textContent = proj.description || "Không có mô tả.";
  document.getElementById("detail-vocab-count").textContent = proj.vocab.length;

  const tableContainer = document.getElementById("vocab-table-container-placeholder");
  
  if (proj.vocab.length === 0) {
    tableContainer.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--ink-faint); font-family: var(--font-serif); font-size: 16px;">
        📭 Dự án này chưa có từ vựng nào. Hãy thêm từ vựng mới hoặc nhập hàng loạt từ file text!
      </div>
    `;
    document.getElementById("detail-start-quiz-btn").style.display = "none";
  } else {
    document.getElementById("detail-start-quiz-btn").style.display = "inline-flex";

    let tableHtml = `
      <div class="vocab-table-container">
        <table class="vocab-table">
          <thead>
            <tr>
              <th style="width: 60px; text-align: center;">STT</th>
              <th>Tiếng Nhật</th>
              <th>Romaji</th>
              <th>Nghĩa Tiếng Việt</th>
              <th style="text-align: center;">Đúng / Sai</th>
              <th style="text-align: center;">Độ Khó</th>
              <th style="text-align: right;">Hành động</th>
            </tr>
          </thead>
          <tbody>
    `;

    proj.vocab.forEach((v, index) => {
      let difficultyBadge = `<span class="vocab-badge badge-easy">${v.difficultyScore} (Dễ)</span>`;
      if (v.difficultyScore > 70) {
        difficultyBadge = `<span class="vocab-badge badge-hard">${v.difficultyScore} (Khó)</span>`;
      } else if (v.difficultyScore > 40) {
        difficultyBadge = `<span class="vocab-badge badge-medium">${v.difficultyScore} (Vừa)</span>`;
      }

      tableHtml += `
        <tr>
          <td data-label="STT" style="text-align: center; font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink-soft);">${index + 1}</td>
          <td data-label="Tiếng Nhật" class="vocab-jp-cell">
            ${cleanToKanaOnly(v.japanese)}
            <button class="btn btn-secondary speak-row-btn" data-text="${cleanToKanaOnly(v.japanese)}" style="width:24px; height:24px; font-size:0.7rem; vertical-align:middle; padding:0; border:none; background:transparent; box-shadow:none; cursor:pointer;" title="Nghe phát âm">🔊</button>
          </td>
          <td data-label="Romaji" style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink-soft);">${v.romaji}</td>
          <td data-label="Ý nghĩa">${v.meaning}</td>
          <td data-label="Đúng / Sai" style="text-align: center; font-size: 0.85rem; font-family: var(--font-mono);">
            <span style="color: var(--good); font-weight: bold;">✔️ ${v.correctCount}</span> / 
            <span style="color: var(--error); font-weight: bold;">❌ ${v.wrongCount}</span>
          </td>
          <td data-label="Độ khó" style="text-align: center;">${difficultyBadge}</td>
          <td data-label="Hành động" style="text-align: right;">
            <div style="display: flex; gap: 0.3rem; justify-content: flex-end;">
              <button class="btn btn-secondary btn-icon edit-vocab-btn" data-id="${v.id}" style="width:30px; height:30px;">✏️</button>
              <button class="btn btn-danger btn-icon delete-vocab-btn" data-id="${v.id}" style="width:30px; height:30px;">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableHtml += `
          </tbody>
        </table>
      </div>
    `;
    tableContainer.innerHTML = tableHtml;

    // Đăng ký sự kiện Sửa/Xóa từ vựng
    document.querySelectorAll(".edit-vocab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const vocabId = btn.getAttribute("data-id");
        const vocab = proj.vocab.find(v => v.id === vocabId);
        if (vocab) {
          document.getElementById("vocab-modal-title").textContent = "✏️ Sửa Từ Vựng";
          document.getElementById("vocab-modal-id").value = vocab.id;
          document.getElementById("vocab-modal-japanese").value = vocab.japanese;
          document.getElementById("vocab-modal-romaji").value = vocab.romaji;
          document.getElementById("vocab-modal-meaning").value = vocab.meaning;
          document.getElementById("vocab-modal").classList.add("active");
        }
      });
    });

    document.querySelectorAll(".delete-vocab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const vocabId = btn.getAttribute("data-id");
        const vocab = proj.vocab.find(v => v.id === vocabId);
        if (vocab) {
          if (confirm(`Bạn có chắc muốn xóa từ "${vocab.japanese}" khỏi dự án này?`)) {
            deleteVocabFromProject(currentProjectId, vocabId);
            renderProjectDetail();
          }
        }
      });
    });

    // Đăng ký phát âm cho dòng
    document.querySelectorAll(".speak-row-btn").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        speakJapanese(btn.getAttribute("data-text"));
      };
    });
  }
}

function setupVocabActions() {
  const vocabModal = document.getElementById("vocab-modal");
  const openVocabModalBtn = document.getElementById("open-add-vocab-modal-btn");
  const closeVocabModalBtn = document.getElementById("close-vocab-modal-btn");
  const vocabForm = document.getElementById("vocab-form");

  openVocabModalBtn.addEventListener("click", () => {
    document.getElementById("vocab-modal-title").textContent = "➕ Thêm Từ Vựng Mới";
    document.getElementById("vocab-modal-id").value = "";
    vocabForm.reset();
    vocabModal.classList.add("active");
    setTimeout(() => document.getElementById("vocab-modal-japanese").focus(), 100);
  });

  closeVocabModalBtn.addEventListener("click", () => {
    vocabModal.classList.remove("active");
  });

  vocabForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("vocab-modal-id").value;
    const japanese = document.getElementById("vocab-modal-japanese").value;
    const romaji = document.getElementById("vocab-modal-romaji").value;
    const meaning = document.getElementById("vocab-modal-meaning").value;

    const vocabData = { japanese, romaji, meaning };

    if (id) {
      updateVocabInProject(currentProjectId, id, vocabData);
    } else {
      addVocabToProject(currentProjectId, vocabData);
    }

    vocabModal.classList.remove("active");
    renderProjectDetail();
  });

  document.getElementById("back-to-projects-btn").onclick = () => {
    switchView("projects-view");
  };

  document.getElementById("detail-start-quiz-btn").onclick = () => {
    switchView("quiz-setup-view");
    setupQuizConfig(currentProjectId);
  };

  document.getElementById("detail-edit-project-btn").onclick = () => {
    const proj = getProjectById(currentProjectId);
    if (proj) {
      document.getElementById("project-modal-title").textContent = "✏️ Sửa Thông Tin Dự Án";
      document.getElementById("project-modal-id").value = proj.id;
      document.getElementById("project-modal-name").value = proj.name;
      document.getElementById("project-modal-desc").value = proj.description;
      document.getElementById("project-modal").classList.add("active");
    }
  };

  document.getElementById("detail-delete-project-btn").onclick = () => {
    const proj = getProjectById(currentProjectId);
    if (proj) {
      if (confirm(`Bạn có chắc chắn muốn xóa dự án "${proj.name}"? Toàn bộ từ vựng bên trong sẽ bị mất.`)) {
        deleteProject(currentProjectId);
        switchView("projects-view");
      }
    }
  };

  const importModal = document.getElementById("bulk-import-modal");
  const openImportBtn = document.getElementById("open-import-modal-btn");
  const closeImportBtn = document.getElementById("close-import-modal-btn");
  const importForm = document.getElementById("bulk-import-form");

  openImportBtn.onclick = () => {
    importForm.reset();
    importModal.classList.add("active");
  };

  closeImportBtn.onclick = () => {
    importModal.classList.remove("active");
  };

  importForm.onsubmit = (e) => {
    e.preventDefault();
    const data = document.getElementById("bulk-import-textarea").value;
    const lines = data.split("\n");
    let count = 0;

    lines.forEach(line => {
      if (!line.trim()) return;
      const parts = line.split("|");
      if (parts.length >= 3) {
        const japanese = parts[0].trim();
        const romaji = parts[1].trim();
        const meaning = parts[2].trim();

        if (japanese && romaji && meaning) {
          addVocabToProject(currentProjectId, { japanese, romaji, meaning });
          count++;
        }
      }
    });

    alert(`Đã nhập thành công ${count} từ vựng mới.`);
    importModal.classList.remove("active");
    renderProjectDetail();
  };
}

// 5. Ôn tập từ yếu (Weak Vocab Review View)
function renderWeakVocabView() {
  const weakVocab = getWeakVocab(null, 30);
  const tableContainer = document.getElementById("weak-vocab-table-container");
  const startBtn = document.getElementById("weak-start-quiz-btn");

  if (weakVocab.length === 0) {
    tableContainer.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: var(--ink-faint); font-family: var(--font-serif); font-size: 16px;">
        🎉 Bạn không có từ vựng nào yếu hoặc chưa nhớ! Hãy vào phần kiểm tra để khám phá thêm.
      </div>
    `;
    startBtn.style.display = "none";
    return;
  }

  startBtn.style.display = "inline-flex";

  let tableHtml = `
    <div class="vocab-table-container">
      <table class="vocab-table">
        <thead>
          <tr>
            <th>Tiếng Nhật</th>
            <th>Romaji</th>
            <th>Nghĩa Tiếng Việt</th>
            <th>Dự án nguồn</th>
            <th style="text-align: center;">Tỉ lệ Đúng / Sai</th>
            <th style="text-align: center;">Độ Khó</th>
          </tr>
        </thead>
        <tbody>
  `;

  weakVocab.forEach(v => {
    let difficultyBadge = `<span class="vocab-badge badge-easy">${v.difficultyScore} (Dễ)</span>`;
    if (v.difficultyScore > 70) {
      difficultyBadge = `<span class="vocab-badge badge-hard">${v.difficultyScore} (Quên nặng)</span>`;
    } else if (v.difficultyScore > 40) {
      difficultyBadge = `<span class="vocab-badge badge-medium">${v.difficultyScore} (Vừa)</span>`;
    }

    tableHtml += `
      <tr>
        <td data-label="Tiếng Nhật" class="vocab-jp-cell">
          ${cleanToKanaOnly(v.japanese)}
          <button class="btn btn-secondary speak-row-btn" data-text="${cleanToKanaOnly(v.japanese)}" style="width:24px; height:24px; font-size:0.7rem; vertical-align:middle; padding:0; border:none; background:transparent; box-shadow:none; cursor:pointer;" title="Nghe phát âm">🔊</button>
        </td>
        <td data-label="Romaji" style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink-soft);">${v.romaji}</td>
        <td data-label="Ý nghĩa">${v.meaning}</td>
        <td data-label="Dự án" style="color: var(--ink-faint); font-size: 13px;">${v.projectName}</td>
        <td data-label="Đúng / Sai" style="text-align: center; font-size: 0.85rem; font-family: var(--font-mono);">
          <span style="color: var(--good); font-weight: bold;">✔️ ${v.correctCount}</span> / 
          <span style="color: var(--error); font-weight: bold;">❌ ${v.wrongCount}</span>
        </td>
        <td data-label="Độ khó" style="text-align: center;">${difficultyBadge}</td>
      </tr>
    `;
  });

  tableHtml += `
        </tbody>
      </table>
    </div>
  `;
  tableContainer.innerHTML = tableHtml;

  document.querySelectorAll(".speak-row-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      speakJapanese(btn.getAttribute("data-text"));
    };
  });

  startBtn.onclick = () => {
    switchView("quiz-setup-view");
    alert("Hệ thống đã tự thiết lập bài kiểm tra từ yếu. Bạn chỉ cần chọn cấu hình và bấm Bắt đầu!");
  };
}

// 6. Cấu hình bài kiểm tra (Quiz Setup View)
let currentPickerProjectId = "all";

function updateQuizSelectedSummaryText() {
  const projects = getProjects();
  const allVocabs = [];
  projects.forEach(p => {
    if (p.vocab) {
      p.vocab.forEach(v => allVocabs.push(v));
    }
  });

  const selectedCount = quizSelectedVocabIds.length;
  const totalCount = allVocabs.length;

  const summarySpan = document.getElementById("quiz-selected-summary");
  const infoSpan = document.getElementById("quiz-selected-info");

  if (summarySpan) {
    if (selectedCount === 0) {
      summarySpan.textContent = "Không chọn từ nào";
    } else if (selectedCount === totalCount) {
      summarySpan.textContent = `Tất cả từ vựng (${selectedCount} từ)`;
    } else {
      summarySpan.textContent = `Đã chọn ${selectedCount}/${totalCount} từ`;
    }
  }

  if (infoSpan) {
    infoSpan.textContent = `(Hiện tại đang chọn: ${selectedCount} từ)`;
  }
}

function renderPickerProjects() {
  const projects = getProjects();
  const listContainer = document.getElementById("picker-projects-list");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  // 1. "Tất cả dự án" item
  const totalVocabCount = projects.reduce((acc, p) => acc + (p.vocab ? p.vocab.length : 0), 0);
  const allItem = document.createElement("button");
  allItem.className = `picker-project-item ${currentPickerProjectId === "all" ? "active" : ""}`;
  allItem.type = "button";
  allItem.innerHTML = `<span>🌐 Tất cả dự án</span> <span style="font-size: 11px; opacity: 0.7;">(${totalVocabCount})</span>`;
  allItem.addEventListener("click", () => {
    selectPickerProject("all");
  });
  listContainer.appendChild(allItem);

  // 2. Individual projects
  projects.forEach(p => {
    const vocabCount = p.vocab ? p.vocab.length : 0;
    const item = document.createElement("button");
    item.className = `picker-project-item ${currentPickerProjectId === p.id ? "active" : ""}`;
    item.type = "button";
    item.innerHTML = `<span>📁 ${p.name}</span> <span style="font-size: 11px; opacity: 0.7;">(${vocabCount})</span>`;
    item.addEventListener("click", () => {
      selectPickerProject(p.id);
    });
    listContainer.appendChild(item);
  });
}

function selectPickerProject(projectId) {
  currentPickerProjectId = projectId;
  
  const titleEl = document.getElementById("picker-current-project-title");
  const projects = getProjects();
  if (titleEl) {
    if (projectId === "all") {
      titleEl.textContent = "Tất cả dự án";
    } else {
      const p = projects.find(proj => proj.id === projectId);
      titleEl.textContent = p ? p.name : "";
    }
  }

  renderPickerProjects();
  renderPickerWords();
}

function renderPickerWords() {
  const projects = getProjects();
  const listContainer = document.getElementById("picker-words-list");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  let words = [];
  if (currentPickerProjectId === "all") {
    projects.forEach(p => {
      if (p.vocab) {
        p.vocab.forEach(v => {
          words.push({ ...v, projectId: p.id, projectName: p.name });
        });
      }
    });
  } else {
    const p = projects.find(proj => proj.id === currentPickerProjectId);
    if (p && p.vocab) {
      p.vocab.forEach(v => {
        words.push({ ...v, projectId: p.id, projectName: p.name });
      });
    }
  }

  if (words.length === 0) {
    listContainer.innerHTML = `<div style="text-align: center; color: var(--ink-faint); padding: 2rem; font-size: 14px;">Không có từ vựng nào trong danh mục này</div>`;
    return;
  }

  words.forEach((v, index) => {
    const isChecked = tempSelectedVocabIds.includes(v.id);
    
    const itemDiv = document.createElement("div");
    itemDiv.style.display = "flex";
    itemDiv.style.alignItems = "center";
    itemDiv.style.justifyContent = "space-between";
    itemDiv.style.padding = "3px 6px";
    itemDiv.style.borderBottom = "1px solid var(--line-light)";
    itemDiv.style.borderRadius = "4px";
    itemDiv.style.background = isChecked ? "var(--bg-light)" : "transparent";
    itemDiv.style.transition = "background 0.2s";

    const leftPart = document.createElement("label");
    leftPart.style.display = "flex";
    leftPart.style.alignItems = "center";
    leftPart.style.gap = "10px";
    leftPart.style.cursor = "pointer";
    leftPart.style.flex = "1";
    leftPart.style.margin = "0";
    leftPart.style.userSelect = "none";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = isChecked;
    cb.style.cursor = "pointer";
    cb.style.accentColor = "var(--accent)";
    cb.addEventListener("change", (e) => {
      if (e.target.checked) {
        if (!tempSelectedVocabIds.includes(v.id)) {
          tempSelectedVocabIds.push(v.id);
        }
        itemDiv.style.background = "var(--bg-light)";
      } else {
        tempSelectedVocabIds = tempSelectedVocabIds.filter(id => id !== v.id);
        itemDiv.style.background = "transparent";
      }
      updateTempSelectedCount();
    });

    const wordInfo = document.createElement("div");
    wordInfo.style.display = "flex";
    wordInfo.style.flexDirection = "column";

    const stt = `<span style="color: var(--ink-faint); font-size: 11px; margin-right: 4px;">#${index + 1}</span>`;
    
    const textSpan = document.createElement("span");
    textSpan.style.fontWeight = "600";
    textSpan.style.color = "var(--ink)";
    textSpan.innerHTML = `${stt} <span style="font-size: 15px; color: var(--accent);">${v.japanese}</span> <span style="color: var(--ink-soft); font-size: 12px; font-weight: normal; margin-left: 6px;">[${v.romaji}]</span>`;

    const meaningSpan = document.createElement("span");
    meaningSpan.style.fontSize = "12px";
    meaningSpan.style.color = "var(--ink-soft)";
    meaningSpan.textContent = v.meaning;

    wordInfo.appendChild(textSpan);
    wordInfo.appendChild(meaningSpan);

    leftPart.appendChild(cb);
    leftPart.appendChild(wordInfo);
    itemDiv.appendChild(leftPart);

    if (currentPickerProjectId === "all") {
      const projTag = document.createElement("span");
      projTag.style.fontSize = "10px";
      projTag.style.padding = "2px 6px";
      projTag.style.background = "var(--field)";
      projTag.style.border = "1px solid var(--line)";
      projTag.style.borderRadius = "10px";
      projTag.style.color = "var(--ink-soft)";
      projTag.style.maxWidth = "100px";
      projTag.style.overflow = "hidden";
      projTag.style.textOverflow = "ellipsis";
      projTag.style.whiteSpace = "nowrap";
      projTag.textContent = v.projectName;
      itemDiv.appendChild(projTag);
    }

    listContainer.appendChild(itemDiv);
  });
}

function updateTempSelectedCount() {
  const el = document.getElementById("picker-total-selected-count");
  if (el) {
    el.textContent = tempSelectedVocabIds.length;
  }
}

function selectAllInCurrentPickerProject() {
  const projects = getProjects();
  let words = [];
  if (currentPickerProjectId === "all") {
    projects.forEach(p => {
      if (p.vocab) {
        p.vocab.forEach(v => words.push(v));
      }
    });
  } else {
    const p = projects.find(proj => proj.id === currentPickerProjectId);
    if (p && p.vocab) {
      p.vocab.forEach(v => words.push(v));
    }
  }

  words.forEach(v => {
    if (!tempSelectedVocabIds.includes(v.id)) {
      tempSelectedVocabIds.push(v.id);
    }
  });

  renderPickerWords();
  updateTempSelectedCount();
}

function deselectAllInCurrentPickerProject() {
  const projects = getProjects();
  let words = [];
  if (currentPickerProjectId === "all") {
    projects.forEach(p => {
      if (p.vocab) {
        p.vocab.forEach(v => words.push(v));
      }
    });
  } else {
    const p = projects.find(proj => proj.id === currentPickerProjectId);
    if (p && p.vocab) {
      p.vocab.forEach(v => words.push(v));
    }
  }

  const wordIds = words.map(v => v.id);
  tempSelectedVocabIds = tempSelectedVocabIds.filter(id => !wordIds.includes(id));

  renderPickerWords();
  updateTempSelectedCount();
}

function setupQuizConfig(preselectedProjectId = null) {
  const projects = getProjects();
  const allVocabs = [];
  projects.forEach(p => {
    if (p.vocab) {
      p.vocab.forEach(v => {
        allVocabs.push({
          ...v,
          projectId: p.id,
          projectName: p.name
        });
      });
    }
  });

  let restoredVocabIds = null;
  let restoredQuestionCount = null;
  let restoredQuizMode = "meaning_to_romaji";
  let restoredOrder = "random";
  let restoredAllowRetry = true;

  const savedConfigStr = localStorage.getItem("nihongo_quiz_config");
  if (savedConfigStr) {
    try {
      const savedConfig = JSON.parse(savedConfigStr);
      if (Array.isArray(savedConfig.vocabIds)) {
        restoredVocabIds = savedConfig.vocabIds.filter(id => allVocabs.some(v => v.id === id));
      } else if (savedConfig.projectIds && savedConfig.projectIds.length > 0) {
        const pIds = savedConfig.projectIds;
        if (pIds.includes("all")) {
          restoredVocabIds = allVocabs.map(v => v.id);
        } else {
          restoredVocabIds = allVocabs.filter(v => pIds.includes(v.projectId)).map(v => v.id);
        }
      }
      if (savedConfig.questionCount) {
        restoredQuestionCount = parseInt(savedConfig.questionCount);
      }
      if (savedConfig.quizMode) {
        restoredQuizMode = savedConfig.quizMode;
      }
      if (savedConfig.order) {
        restoredOrder = savedConfig.order;
      }
      if (savedConfig.allowRetry !== undefined) {
        restoredAllowRetry = savedConfig.allowRetry;
      }
    } catch (e) {
      console.error("Lỗi khi khôi phục cấu hình kiểm tra", e);
    }
  }

  if (preselectedProjectId) {
    const proj = projects.find(p => p.id === preselectedProjectId);
    if (proj && proj.vocab && proj.vocab.length > 0) {
      quizSelectedVocabIds = proj.vocab.map(v => v.id);
      restoredQuestionCount = quizSelectedVocabIds.length;
    } else {
      quizSelectedVocabIds = [];
      restoredQuestionCount = 0;
    }
  } else {
    if (!restoredVocabIds || restoredVocabIds.length === 0) {
      quizSelectedVocabIds = allVocabs.map(v => v.id);
    } else {
      quizSelectedVocabIds = restoredVocabIds;
    }
  }

  updateQuizSelectedSummaryText();

  const countInput = document.getElementById("quiz-setup-count");
  if (restoredQuestionCount !== null) {
    countInput.value = restoredQuestionCount;
  } else {
    countInput.value = quizSelectedVocabIds.length;
  }

  const modeCard = document.querySelector(`.radio-card input[name="quiz-mode"][value="${restoredQuizMode}"]`);
  if (modeCard) {
    modeCard.closest(".radio-card").click();
  }
  
  const orderCard = document.querySelector(`.radio-card input[name="quiz-order"][value="${restoredOrder}"]`);
  if (orderCard) {
    orderCard.closest(".radio-card").click();
  }

  document.getElementById("quiz-setup-retry").checked = restoredAllowRetry;
}

function setupQuizConfigEvents() {
  const radioCards = document.querySelectorAll(".radio-card");
  radioCards.forEach(card => {
    card.addEventListener("click", () => {
      const radioInput = card.querySelector('input[type="radio"]');
      const radioName = radioInput.name;
      
      document.querySelectorAll(`.radio-card input[name="${radioName}"]`).forEach(input => {
        input.closest(".radio-card").classList.remove("selected");
      });

      card.classList.add("selected");
      radioInput.checked = true;
    });
  });

  // Sự kiện mở modal chọn từ vựng
  const selectVocabBtn = document.getElementById("quiz-setup-select-vocab-btn");
  if (selectVocabBtn) {
    selectVocabBtn.addEventListener("click", () => {
      tempSelectedVocabIds = [...quizSelectedVocabIds];
      currentPickerProjectId = "all";
      
      document.getElementById("quiz-vocab-picker-modal").classList.add("active");
      selectPickerProject("all");
      updateTempSelectedCount();
    });
  }

  // Nút Hủy bỏ trong picker modal
  const closePickerBtn = document.getElementById("close-picker-modal-btn");
  if (closePickerBtn) {
    closePickerBtn.addEventListener("click", () => {
      document.getElementById("quiz-vocab-picker-modal").classList.remove("active");
    });
  }

  // Nút Đồng ý trong picker modal
  const confirmPickerBtn = document.getElementById("confirm-picker-modal-btn");
  if (confirmPickerBtn) {
    confirmPickerBtn.addEventListener("click", () => {
      quizSelectedVocabIds = [...tempSelectedVocabIds];
      updateQuizSelectedSummaryText();
      
      // Chọn bao nhiêu thì số lượng câu hỏi phải phản ánh lại bấy nhiêu
      document.getElementById("quiz-setup-count").value = quizSelectedVocabIds.length;
      
      document.getElementById("quiz-vocab-picker-modal").classList.remove("active");
    });
  }

  // Nút Chọn tất cả trong picker modal
  const selectAllBtn = document.getElementById("picker-select-all-btn");
  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      selectAllInCurrentPickerProject();
    });
  }

  // Nút Bỏ chọn hết trong picker modal
  const selectNoneBtn = document.getElementById("picker-select-none-btn");
  if (selectNoneBtn) {
    selectNoneBtn.addEventListener("click", () => {
      deselectAllInCurrentPickerProject();
    });
  }

  // Nút bắt đầu kiểm tra
  const startQuizBtn = document.getElementById("start-quiz-session-btn");
  if (startQuizBtn) {
    startQuizBtn.addEventListener("click", () => {
      const selectedMode = document.querySelector('input[name="quiz-mode"]:checked').value;
      const selectedOrder = document.querySelector('input[name="quiz-order"]:checked').value;
      const count = parseInt(document.getElementById("quiz-setup-count").value) || 10;
      const allowRetry = document.getElementById("quiz-setup-retry").checked;

      if (quizSelectedVocabIds.length === 0) {
        alert("Vui lòng chọn ít nhất 1 từ vựng để kiểm tra!");
        return;
      }

      if (count <= 0) {
        alert("Số lượng câu hỏi phải lớn hơn 0!");
        return;
      }

      const config = {
        vocabIds: quizSelectedVocabIds,
        questionCount: count,
        quizMode: selectedMode,
        order: selectedOrder,
        allowRetry: allowRetry
      };

      // Lưu cấu hình vào localStorage
      localStorage.setItem("nihongo_quiz_config", JSON.stringify(config));

      quizConfigBackup = config;
      startQuiz(config);
    });
  }
}

// 7. Khu vực kiểm tra đang diễn ra (Quiz Active Arena)
function startQuiz(config) {
  activeQuizSession = new QuizSession(config);
  
  if (activeQuizSession.questions.length === 0) {
    alert("Lỗi khi khởi tạo bài kiểm tra!");
    return;
  }

  switchView("quiz-active-view");
  activeQuizSession.startQuestionTimer();
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const question = activeQuizSession.getCurrentQuestion();
  if (!question) {
    finishQuiz();
    return;
  }

  const total = activeQuizSession.questions.length;
  const current = activeQuizSession.currentIndex + 1;
  document.getElementById("quiz-question-counter").textContent = `Câu hỏi ${current} / ${total}`;
  
  const percentage = Math.round(((current - 1) / total) * 100);
  document.getElementById("quiz-progress-fill").style.width = `${percentage}%`;

  const hintContainer = document.getElementById("quiz-hint-container");
  hintContainer.style.display = "none";
  
  const inputEl = document.getElementById("quiz-answer-input");
  inputEl.value = "";
  inputEl.className = "quiz-input";
  inputEl.disabled = false;
  inputEl.placeholder = question.mode === "jp_to_meaning" ? "Nhập nghĩa tiếng Việt (không dấu)..." : "Nhập cách đọc bằng Romaji...";
  
  setTimeout(() => inputEl.focus(), 150);

  const wordDisplay = document.getElementById("quiz-question-word-display");
  const promptEl = document.getElementById("quiz-question-prompt");

  if (question.mode === "meaning_to_romaji") {
    wordDisplay.textContent = question.vocab.meaning;
    wordDisplay.className = "quiz-question-word meaning-word";
    promptEl.textContent = "Từ này có Romaji là gì?";
  } else if (question.mode === "jp_to_romaji") {
    wordDisplay.textContent = cleanToKanaOnly(question.vocab.japanese);
    wordDisplay.className = "quiz-question-word";
    promptEl.textContent = "Từ này có Romaji là gì?";
  } else if (question.mode === "jp_to_meaning") {
    wordDisplay.textContent = cleanToKanaOnly(question.vocab.japanese);
    wordDisplay.className = "quiz-question-word";
    promptEl.textContent = "Từ này có nghĩa Tiếng Việt là gì?";
  }

  // Quản lý hiển thị nút phát âm dựa trên chế độ câu hỏi
  const speakBtn = document.getElementById("quiz-speak-btn");
  if (question.mode === "jp_to_romaji" || question.mode === "jp_to_meaning") {
    speakJapanese(cleanToKanaOnly(question.vocab.japanese));
    speakBtn.style.display = "inline-flex";
  } else {
    // Ẩn nút loa nếu hiển thị nghĩa Tiếng Việt (meaning_to_romaji) để không lộ đáp án
    speakBtn.style.display = "none";
  }

  // Gắn sự kiện cho nút loa trong Quiz
  speakBtn.onclick = () => {
    speakJapanese(cleanToKanaOnly(question.vocab.japanese));
  };

  document.getElementById("quiz-submit-btn").style.display = "inline-flex";
  document.getElementById("quiz-next-btn").style.display = "none";

  currentQuestionTime = 0;
  document.getElementById("quiz-question-timer-text").textContent = "0.0s";
  
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  
  const timerStart = Date.now();
  quizTimerInterval = setInterval(() => {
    currentQuestionTime = (Date.now() - timerStart) / 1000;
    document.getElementById("quiz-question-timer-text").textContent = `${currentQuestionTime.toFixed(1)}s`;
  }, 100);
}

function handleQuizAnswerSubmit() {
  const inputEl = document.getElementById("quiz-answer-input");
  const answer = inputEl.value.trim();

  if (!answer) {
    alert("Vui lòng nhập câu trả lời!");
    return;
  }

  const question = activeQuizSession.getCurrentQuestion();
  const result = activeQuizSession.submitAnswer(answer);
  const speakBtn = document.getElementById("quiz-speak-btn");

  if (result.status === "correct") {
    inputEl.classList.add("input-correct");
    inputEl.classList.add("pulse-success");
    inputEl.disabled = true;

    if (quizTimerInterval) clearInterval(quizTimerInterval);

    // Phát âm từ tiếng Nhật khi trả lời đúng
    speakJapanese(cleanToKanaOnly(question.vocab.japanese));
    speakBtn.style.display = "inline-flex"; // luôn hiện loa sau khi trả lời xong

    document.getElementById("quiz-submit-btn").style.display = "none";
    
    const nextBtn = document.getElementById("quiz-next-btn");
    nextBtn.style.display = "inline-flex";
    nextBtn.textContent = "Đúng rồi! Câu tiếp theo (Enter)";
    nextBtn.focus();

    setTimeout(() => {
      if (activeQuizSession.getCurrentQuestion() && activeQuizSession.getCurrentQuestion().answerState !== "unanswered") {
        goToNextQuestion();
      }
    }, 1300);

  } else if (result.status === "retry_allowed") {
    inputEl.classList.add("input-wrong");
    inputEl.classList.add("shake");
    
    setTimeout(() => inputEl.classList.remove("shake"), 500);

    const hintContainer = document.getElementById("quiz-hint-container");
    const hintText = document.getElementById("quiz-hint-text");
    hintText.textContent = result.hint;
    hintContainer.style.display = "block";

    inputEl.value = "";
    inputEl.focus();
    inputEl.placeholder = "Gợi ý đã hiển thị, hãy gõ lại...";

  } else if (result.status === "wrong") {
    inputEl.classList.add("input-wrong");
    inputEl.classList.add("shake");
    inputEl.disabled = true;

    if (quizTimerInterval) clearInterval(quizTimerInterval);

    // Phát âm đáp án đúng và hiện nút loa
    speakJapanese(cleanToKanaOnly(question.vocab.japanese));
    speakBtn.style.display = "inline-flex";

    const hintContainer = document.getElementById("quiz-hint-container");
    hintContainer.innerHTML = `❌ Sai rồi! Đáp án đúng: <span style="font-weight: 800; font-family:var(--font-mono); color:var(--accent);">${result.correctAnswer}</span>`;
    hintContainer.style.display = "block";
    hintContainer.style.background = "var(--error-soft)";
    hintContainer.style.borderColor = "var(--error)";
    hintContainer.style.color = "var(--error)";

    document.getElementById("quiz-submit-btn").style.display = "none";
    
    const nextBtn = document.getElementById("quiz-next-btn");
    nextBtn.style.display = "inline-flex";
    nextBtn.textContent = "Xem đáp án & Tiếp tục (Enter)";
    nextBtn.focus();
  }
}

function goToNextQuestion() {
  const hintContainer = document.getElementById("quiz-hint-container");
  hintContainer.innerHTML = `Gợi ý: <span class="quiz-hint-text" id="quiz-hint-text">k*s*</span>`;
  hintContainer.style.background = "var(--warning-soft)";
  hintContainer.style.borderColor = "var(--warning)";
  hintContainer.style.color = "var(--warning)";

  const hasNext = activeQuizSession.nextQuestion();
  if (hasNext) {
    renderCurrentQuestion();
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  if (quizTimerInterval) clearInterval(quizTimerInterval);
  
  document.getElementById("quiz-progress-fill").style.width = `100%`;

  const report = activeQuizSession.getReport();
  renderQuizReport(report);
  switchView("quiz-report-view");
}

function setupQuizActiveEvents() {
  const submitBtn = document.getElementById("quiz-submit-btn");
  const nextBtn = document.getElementById("quiz-next-btn");
  const inputEl = document.getElementById("quiz-answer-input");

  submitBtn.onclick = handleQuizAnswerSubmit;
  nextBtn.onclick = goToNextQuestion;

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const isUnanswered = activeQuizSession.getCurrentQuestion()?.answerState === "unanswered";
      if (isUnanswered) {
        handleQuizAnswerSubmit();
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.getElementById("quiz-active-view").classList.contains("active")) {
      const nextBtnVisible = nextBtn.style.display !== "none";
      if (nextBtnVisible && document.activeElement !== inputEl) {
        e.preventDefault();
        goToNextQuestion();
      }
    }
  });

  document.getElementById("quiz-abort-btn").onclick = () => {
    if (confirm("Bạn có chắc chắn muốn hủy bài kiểm tra hiện tại? Mọi tiến trình chưa hoàn thành sẽ không được lưu.")) {
      if (quizTimerInterval) clearInterval(quizTimerInterval);
      switchView("quiz-setup-view");
    }
  };
}

// 8. Render Báo cáo kết quả kiểm tra (Quiz Report View)
function renderQuizReport(report) {
  document.getElementById("report-score-text").textContent = `${report.correctCount + report.correctRetryCount} / ${report.totalQuestions}`;
  document.getElementById("report-accuracy-text").textContent = `${report.accuracy}% CHÍNH XÁC`;

  const evalEl = document.getElementById("report-evaluation-text");
  if (report.accuracy >= 90) {
    evalEl.textContent = "🥇 Tuyệt vời! Bạn ghi nhớ từ vựng cực kỳ tốt.";
    evalEl.style.color = "var(--good)";
  } else if (report.accuracy >= 70) {
    evalEl.textContent = "🥈 Khá tốt! Hãy luyện tập thêm để tăng tốc độ phản xạ nhé.";
    evalEl.style.color = "var(--accent)";
  } else if (report.accuracy >= 50) {
    evalEl.textContent = "🥉 Khá ổn! Bạn nên ôn tập lại các từ đã trả lời sai.";
    evalEl.style.color = "var(--warning)";
  } else {
    evalEl.textContent = "⚠️ Cần cố gắng nhiều hơn! Hãy ôn tập lại các từ chưa nhớ.";
    evalEl.style.color = "var(--error)";
  }

  document.getElementById("report-total-time").textContent = `${Math.round(report.totalTimeSpent)} giây`;
  document.getElementById("report-avg-time").textContent = `${report.averageTime.toFixed(1)}s / câu`;
  
  const slowQuestions = report.details.filter(d => d.isSlow).length;
  document.getElementById("report-slow-count").textContent = `${slowQuestions} câu (>8s)`;

  const listContainer = document.getElementById("report-details-list");
  listContainer.innerHTML = "";

  report.details.forEach((q, index) => {
    const item = document.createElement("div");
    item.className = "report-detail-item";

    let statusText = "SAI";
    let statusClass = "status-wrong";
    if (q.answerState === "correct") {
      statusText = "ĐÚNG";
      statusClass = "status-correct";
    } else if (q.answerState === "correct_retry") {
      statusText = "ĐÚNG GỢI Ý";
      statusClass = "status-retry";
    }

    const slowWarning = q.isSlow ? ' <span style="color:var(--warning); font-size:0.75rem;">⚠️ Chậm</span>' : '';

    item.innerHTML = `
      <div class="report-detail-left">
        <div class="report-detail-words">
          <span>${cleanToKanaOnly(q.japanese)}</span> (${q.romaji})
          <button class="btn btn-secondary speak-row-btn" data-text="${cleanToKanaOnly(q.japanese)}" style="width:22px; height:22px; font-size:0.65rem; vertical-align:middle; padding:0; border:none; background:transparent; box-shadow:none; cursor:pointer;" title="Nghe phát âm">🔊</button>
        </div>
        <div class="report-detail-meaning">
          Nghĩa: ${q.meaning} | Chế độ: ${q.mode === "jp_to_meaning" ? "Dịch nghĩa" : "Gõ Romaji"}
        </div>
        <div style="font-size: 0.8rem; color: var(--ink-faint); margin-top:0.2rem; font-family: var(--font-mono);">
          Lịch sử gõ: "${q.userAnswers.join('" ➔ "')}"
        </div>
      </div>
      <div class="report-detail-right">
        <span class="report-detail-time" style="font-family: var(--font-mono);">⏱️ ${q.timeSpent.toFixed(1)}s${slowWarning}</span>
        <span class="report-badge-status ${statusClass}">${statusText}</span>
      </div>
    `;

    listContainer.appendChild(item);
  });

  // Gán sự kiện cho các loa trong report
  document.querySelectorAll(".report-detail-item .speak-row-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      speakJapanese(btn.getAttribute("data-text"));
    };
  });
}

function setupReportEvents() {
  document.getElementById("report-back-home-btn").onclick = () => {
    switchView("dashboard-view");
  };

  document.getElementById("report-restart-quiz-btn").onclick = () => {
    if (quizConfigBackup) {
      startQuiz(quizConfigBackup);
    } else {
      switchView("quiz-setup-view");
    }
  };
}

// 9. Tích hợp tính năng Xuất/Nhập dữ liệu dự án dạng JSON
function setupJsonImportExport() {
  const importBtn = document.getElementById("import-json-btn");
  const fileInput = document.getElementById("json-file-input");

  // Xử lý nút Nhập JSON
  if (importBtn && fileInput) {
    importBtn.onclick = () => {
      fileInput.click();
    };

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(evt) {
        try {
          const importedProj = JSON.parse(evt.target.result);
          
          if (!importedProj.name || !Array.isArray(importedProj.vocab)) {
            alert("File JSON không đúng định dạng của một dự án Nihongo Flashcard.");
            return;
          }
          
          const projects = getProjects();
          
          // Chuẩn hóa và làm sạch từ vựng khi nhập
          const cleanedVocab = importedProj.vocab.map(v => ({
            id: "v-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
            japanese: v.japanese || "",
            romaji: (v.romaji || "").toLowerCase().trim(),
            meaning: v.meaning || "",
            correctCount: 0,
            wrongCount: 0,
            historyTimes: [],
            difficultyScore: 0
          }));

          const newProject = {
            id: "proj-" + Date.now(),
            name: importedProj.name + " (Nhập)",
            description: importedProj.description || "Dự án được nhập từ tệp tin JSON.",
            vocab: cleanedVocab
          };

          projects.push(newProject);
          localStorage.setItem("nihongo_flashcard_projects", JSON.stringify(projects));
          
          alert(`Đã nhập thành công dự án "${newProject.name}" với ${newProject.vocab.length} từ.`);
          renderProjectList();
        } catch (err) {
          alert("Không thể đọc tệp JSON: " + err.message);
        }
      };
      reader.readAsText(file);
      fileInput.value = ""; // reset
    };
  }

  // Xử lý nút Xuất JSON trong trang chi tiết dự án
  const exportBtn = document.getElementById("detail-export-project-btn");
  if (exportBtn) {
    exportBtn.onclick = () => {
      const proj = getProjectById(currentProjectId);
      if (!proj) return;

      // Chuẩn bị dữ liệu chỉ xuất các trường quan trọng (name, description, vocab)
      const exportData = {
        name: proj.name,
        description: proj.description,
        vocab: proj.vocab.map(v => ({
          japanese: v.japanese,
          romaji: v.romaji,
          meaning: v.meaning
        }))
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `duan_${proj.name.replace(/\s+/g, '_').toLowerCase()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }
}

// 10. Lập trình tính năng Tìm từ (Tra từ điển & Thêm nhanh)
// 10. Lập trình tính năng Tìm từ (Tra từ điển & Thêm nhanh)
function guessVocabFields(query) {
  const trimmed = query.trim();
  const fields = { japanese: "", romaji: "", meaning: "" };

  // Kiểm tra xem có chứa ký tự tiếng Nhật (Hiragana, Katakana, Kanji) hay không
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmed);

  // Kiểm tra xem có dấu tiếng Việt hay không
  const hasVietnameseTones = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(trimmed);
  const hasSpaces = trimmed.includes(" ");

  if (hasJapanese) {
    fields.japanese = trimmed;
  } else if (hasVietnameseTones || hasSpaces) {
    fields.meaning = trimmed;
  } else {
    fields.romaji = trimmed;
  }

  return fields;
}

// Chuyển đổi chữ Kana sang Romaji dựa trên danh sách ký tự cơ bản
function convertKanaToRomaji(kanaStr) {
  if (!kanaStr) return "";
  let result = "";
  let i = 0;
  
  const combinedList = [...HIRAGANA_LIST, ...KATAKANA_LIST];
  
  while (i < kanaStr.length) {
    const char = kanaStr[i];
    const nextChar = kanaStr[i + 1];
    
    // Xử lý súc âm っ / ッ (nhân đôi phụ âm tiếp theo)
    if (char === "っ" || char === "ッ") {
      if (nextChar) {
        const nextFound = combinedList.find(item => item.kana === nextChar);
        if (nextFound && nextFound.romaji) {
          result += nextFound.romaji[0];
        }
      }
      i++;
      continue;
    }

    // Xử lý âm ghép (youn)
    let isYoun = false;
    if (nextChar && (nextChar === "ゃ" || nextChar === "ゅ" || nextChar === "ょ" || nextChar === "ャ" || nextChar === "ュ" || nextChar === "ョ")) {
      const baseFound = combinedList.find(item => item.kana === char);
      if (baseFound) {
        const baseRomaji = baseFound.romaji;
        let consonant = baseRomaji.slice(0, -1);
        
        if (baseRomaji === "shi") consonant = "sh";
        else if (baseRomaji === "chi") consonant = "ch";
        else if (baseRomaji === "ji") consonant = "j";
        
        const younChar = nextChar === "ゃ" || nextChar === "ャ" ? "a" : (nextChar === "ゅ" || nextChar === "ュ" ? "u" : "o");
        result += consonant + "y" + younChar;
        isYoun = true;
      }
    }

    if (isYoun) {
      i += 2;
      continue;
    }

    // Tra âm đơn
    const found = combinedList.find(item => item.kana === char);
    if (found) {
      result += found.romaji;
    } else {
      if (char !== "ー") {
        result += char;
      }
    }
    i++;
  }
  
  return result
    .replace(/ou/g, "oo")
    .replace(/uu/g, "u")
    .replace(/aa/g, "a")
    .replace(/ee/g, "e")
    .replace(/ii/g, "i")
    .replace(/si/g, "shi")
    .replace(/ti/g, "chi")
    .replace(/tu/g, "tsu");
}

// Dịch thuật thông qua Google Translate API (có dự phòng MyMemory)
async function translateText(text, fromLang, toLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Google translation failed");
    const data = await res.json();
    if (data && data[0] && data[0][0]) {
      return data[0][0][0] || text;
    }
    return text;
  } catch (e) {
    console.warn("Lỗi dịch thuật Google, thử MyMemory...", e);
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("MyMemory translation failed");
      const data = await res.json();
      return data.responseData?.translatedText || text;
    } catch (err) {
      console.error("Tất cả các dịch vụ dịch thuật đều lỗi:", err);
      return text;
    }
  }
}

// Dịch thuật lấy cả kết quả dịch và phiên âm Romaji
async function translateTextAndRomaji(text, fromLang, toLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Google translation failed");
    const data = await res.json();
    
    let translation = text;
    let romaji = "";
    
    if (data && data[0]) {
      if (data[0][0]) {
        translation = data[0][0][0] || text;
      }
      if (data[0][1]) {
        romaji = data[0][1][2] || data[0][1][3] || "";
      }
    }
    return { translation, romaji };
  } catch (e) {
    console.warn("Lỗi dịch thuật Google Romaji, thử MyMemory...", e);
    const translation = await translateText(text, fromLang, toLang);
    return { translation, romaji: "" };
  }
}

// Chuyển đổi Romaji sang Hiragana sử dụng hMap tự tạo
function convertRomajiToHiragana(romajiStr) {
  if (!romajiStr) return "";
  let text = romajiStr.toLowerCase().trim()
    .replace(/ō/g, "o")
    .replace(/ā/g, "a")
    .replace(/ū/g, "u")
    .replace(/ē/g, "e")
    .replace(/ī/g, "i")
    .replace(/'/g, "")
    .replace(/-/g, " ");

  const hMap = {};
  
  // Nạp danh sách cơ bản từ HIRAGANA_LIST của ứng dụng
  if (typeof HIRAGANA_LIST !== "undefined") {
    HIRAGANA_LIST.forEach(item => {
      hMap[item.romaji] = item.kana;
    });
  }

  // Nạp thêm các âm đục, bán đục và âm ghép bổ sung
  const dakuon = {
    "ga":"が", "gi":"gi",
    "ga":"が", "gi":"gi", // wait
    "ga":"が", "gi":"ぎ", "gu":"ぐ", "ge":"げ", "go":"ご",
    "za":"ざ", "zi":"じ", "zu":"ず", "ze":"ぜ", "zo":"ぞ",
    "da":"だ", "di":"ぢ", "du":"づ", "de":"で", "do":"ど",
    "ba":"ば", "bi":"び", "bu":"ぶ", "be":"べ", "bo":"ぼ",
    "pa":"ぱ", "pi":"ぴ", "pu":"ぷ", "pe":"ぺ", "po":"ぽ"
  };
  
  const digraphs = {
    "tsu": "つ", "chi": "ち", "shi": "し",
    "sha": "しゃ", "shu": "しゅ", "sho": "しょ",
    "cha": "ちゃ", "chu": "ちゅ", "cho": "cho",
    "cho": "ちょ",
    "kya": "きゃ", "kyu": "きゅ", "kyo": "きょ",
    "gya": "ぎゃ", "gyu":"ぎゅ", "gyo":"ぎょ",
    "nya": "にゃ", "nyu":"にゅ", "nyo":"にょ",
    "hya": "ひゃ", "hyu":"ひゅ", "hyo":"ひょ",
    "bya": "びゃ", "byu":"びゅ", "byo":"びょ",
    "pya": "ぴゃ", "pyu":"ぴゅ", "pyo":"ぴょ",
    "mya": "みゃ", "myu":"みゅ", "myo":"みょ",
    "rya": "りゃ", "ryu":"りゅ", "ryo":"りょ",
    "dya": "ぢゃ", "dyu":"ぢゅ", "dyo":"ぢょ",
    "ja": "ja",
    "ja": "じゃ", "ju":"じゅ", "jo":"じょ", "ji":"じ",
    "fu": "fu",
    "fu": "ふ"
  };

  Object.assign(hMap, dakuon, digraphs);

  let result = "";
  let i = 0;
  
  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === nextChar && !"aeioun".includes(char)) {
      result += "っ";
      i++;
      continue;
    }

    let matched = false;
    for (const len of [3, 2, 1]) {
      if (i + len <= text.length) {
        const sub = text.substring(i, i + len);
        if (hMap[sub]) {
          result += hMap[sub];
          i += len;
          matched = true;
          break;
        }
      }
    }
    
    if (!matched) {
      result += char;
      i++;
    }
  }
  
  return result;
}

// Tra cứu Jisho API thông qua CORS Proxy (có cơ chế dự phòng tự động)
async function fetchJishoData(keyword) {
  const proxies = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://cors-anywhere.azm.workers.dev/${url}`
  ];

  const targetUrl = `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(keyword)}`;

  for (const getProxyUrl of proxies) {
    try {
      const proxyUrl = getProxyUrl(targetUrl);
      const res = await fetch(proxyUrl);
      if (!res.ok) continue;
      const data = await res.json();
      if (data && data.data) {
        return data.data;
      }
    } catch (e) {
      console.warn("Proxy CORS gặp lỗi, đang thử proxy tiếp theo...", e);
    }
  }
  
  console.error("Tất cả các proxy CORS đều thất bại cho keyword:", keyword);
  return [];
}

// Hàm điều phối tìm kiếm online (tích hợp dịch Việt-Nhật trực tiếp, đã tối ưu song song hóa API)
async function searchOnlineDictionary(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(trimmed);
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(trimmed);
  const hasSpaces = trimmed.includes(" ");

  let searchKeywords = [];
  let directTranslation = null;
  let translatedEn = "";
  let translatedJaRomaji = "";

  if (hasJapanese) {
    searchKeywords.push(trimmed);
  } else if (hasVietnamese) {
    // Chỉ kích hoạt dịch khi có chữ tiếng Việt thực sự
    const [jaResult, enResult] = await Promise.all([
      translateTextAndRomaji(trimmed, "vi", "ja"),
      translateTextAndRomaji(trimmed, "vi", "en")
    ]);
    
    const translatedJa = jaResult.translation;
    translatedJaRomaji = jaResult.romaji;
    translatedEn = enResult.translation;

    if (translatedJa && translatedJa !== trimmed) {
      // Chuyển đổi Romaji của Google sang Hiragana để hiển thị Kana-only cho từ trực tiếp
      const kanaReading = convertRomajiToHiragana(translatedJaRomaji);
      
      directTranslation = {
        japanese: kanaReading ? `${translatedJa} (${kanaReading})` : translatedJa,
        meaning: trimmed.toLowerCase(),
        romaji: translatedJaRomaji ? translatedJaRomaji.toLowerCase() : ""
      };
      searchKeywords.push(translatedJa);
    }
    
    if (translatedEn && translatedEn !== trimmed) {
      searchKeywords.push(translatedEn);
    }
  } else {
    // Tiếng Anh / Romaji (không có kí tự tiếng Việt)
    searchKeywords.push(trimmed);
    if (hasSpaces) {
      // Nếu có khoảng trắng (ví dụ: se kai), thêm phiên bản bỏ khoảng trắng (sekai) để tìm trên Jisho
      const stripped = trimmed.replace(/\s+/g, "");
      searchKeywords.push(stripped);
    }
  }

  searchKeywords = [...new Set(searchKeywords)];
  const processedResults = [];
  
  // Tra cứu Jisho song song cho tất cả từ khóa
  const jishoDataList = await Promise.all(searchKeywords.map(keyword => fetchJishoData(keyword)));

  // Gom các mục cần dịch ngược nghĩa từ tiếng Anh sang tiếng Việt
  const itemsToTranslate = [];

  for (let i = 0; i < searchKeywords.length; i++) {
    const jishoResults = jishoDataList[i];
    if (jishoResults && jishoResults.length > 0) {
      const limitResults = jishoResults.slice(0, 3);
      for (const item of limitResults) {
        const jpObj = item.japanese?.[0] || {};
        const reading = jpObj.reading || "";
        const japanese = jpObj.word ? `${jpObj.word} (${jpObj.reading})` : jpObj.reading;
        const romaji = convertKanaToRomaji(reading);
        const englishDef = item.senses?.[0]?.english_definitions?.join(", ") || "";

        itemsToTranslate.push({
          japanese,
          romaji,
          englishDef,
          fallbackMeaning: trimmed.toLowerCase()
        });
      }
    }
  }

  // Dịch ngược song song toàn bộ định nghĩa từ tiếng Anh sang tiếng Việt để tăng tốc
  const translatedMeanings = await Promise.all(
    itemsToTranslate.map(async (item) => {
      if (item.englishDef) {
        try {
          return await translateText(item.englishDef, "en", "vi");
        } catch (e) {
          return item.fallbackMeaning;
        }
      }
      return item.fallbackMeaning;
    })
  );

  // Lưu các kết quả đã qua xử lý Jisho
  for (let i = 0; i < itemsToTranslate.length; i++) {
    processedResults.push({
      japanese: itemsToTranslate[i].japanese,
      romaji: itemsToTranslate[i].romaji,
      meaning: translatedMeanings[i].toLowerCase()
    });
  }

  // 4. Nếu có bản dịch trực tiếp, ưu tiên đưa lên vị trí đầu tiên
  if (directTranslation) {
    // So khớp xem Jisho có trả về từ nào trùng với bản dịch trực tiếp hay không để lấy Romaji chuẩn
    const matchInJisho = processedResults.find(r => {
      const cleanR = cleanToKanaOnly(r.japanese);
      return cleanR === directTranslation.japanese || r.japanese.includes(directTranslation.japanese);
    });

    if (matchInJisho) {
      directTranslation.romaji = matchInJisho.romaji;
      // Đưa lên đầu danh sách
      const filtered = processedResults.filter(r => r !== matchInJisho);
      processedResults.unshift(matchInJisho);
    } else {
      // Nếu Jisho rỗng hoặc không khớp, ta tự chuyển đổi Kana sang Romaji
      directTranslation.romaji = convertKanaToRomaji(cleanToKanaOnly(directTranslation.japanese));
      
      // Nếu là chữ Kanji hoàn toàn, Romaji có thể bị rỗng hoặc chứa ký tự Nhật -> tái sử dụng translatedEn hoặc translatedJaRomaji
      const hasJpChars = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(directTranslation.romaji);
      if (hasJpChars || !directTranslation.romaji) {
        if (translatedJaRomaji) {
          directTranslation.romaji = translatedJaRomaji.toLowerCase();
        } else {
          if (!translatedEn) {
            translatedEn = await translateText(trimmed, "vi", "en");
          }
          directTranslation.romaji = translatedEn.toLowerCase().replace(/[^a-z\s]/g, "");
        }
      }
      processedResults.unshift(directTranslation);
    }
  }

  // Loại bỏ trùng lặp và giữ lại tối đa 5 kết quả
  const finalResults = [];
  const seen = new Set();
  for (const item of processedResults) {
    const key = cleanToKanaOnly(item.japanese) + "|" + item.romaji;
    if (!seen.has(key)) {
      seen.add(key);
      finalResults.push(item);
    }
  }

  return finalResults.slice(0, 5);
}

function convertKatakanaToHiragana(text) {
  if (!text) return "";
  return text.replace(/[\u30A1-\u30F6]/g, function(match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function setupDictionaryEvents() {
  const searchInput = document.getElementById("dict-search-input");
  const searchBtn = document.getElementById("dict-search-btn");
  const welcomePanel = document.getElementById("dict-welcome-panel");
  const resultsPanel = document.getElementById("dict-results-panel");
  const resultsContainer = document.getElementById("dict-results-container");
  const hiraganaOnlyCb = document.getElementById("dict-hiragana-only-cb");

  if (!searchInput) return;

  const performSearch = async () => {
    const query = searchInput.value;
    if (!query.trim()) {
      welcomePanel.style.display = "block";
      resultsPanel.style.display = "none";
      resultsContainer.innerHTML = "";
      return;
    }

    welcomePanel.style.display = "none";
    resultsPanel.style.display = "block";

    // 1. Tìm kiếm offline và hiển thị lập tức (đã gộp các kết quả tìm thấy trước đó)
    const offlineResults = searchDictionary(query);
    
    // Hiển thị trạng thái loading online
    renderDictionaryResultsCombined(offlineResults, [], true, query);

    // 2. Tra cứu online bất đồng bộ
    try {
      const onlineResults = await searchOnlineDictionary(query);
      // Tự động lưu toàn bộ từ online tìm thấy vào cache từ điển của app
      if (onlineResults && onlineResults.length > 0) {
        onlineResults.forEach(item => saveToDictionaryCache(item));
      }
      renderDictionaryResultsCombined(offlineResults, onlineResults, false, query);
    } catch (err) {
      console.error("Tìm kiếm trực tuyến thất bại:", err);
      renderDictionaryResultsCombined(offlineResults, [], false, query);
    }
  };

  // Khôi phục tùy chọn lưu chỉ hiển thị Hiragana từ localStorage
  if (hiraganaOnlyCb) {
    const saved = localStorage.getItem("dict_hiragana_only") === "true";
    hiraganaOnlyCb.checked = saved;
    hiraganaOnlyCb.addEventListener("change", () => {
      localStorage.setItem("dict_hiragana_only", hiraganaOnlyCb.checked);
      // Thực hiện tìm kiếm lại lập tức để cập nhật hiển thị
      performSearch();
    });
  }

  // Nhấn nút Tìm kiếm
  if (searchBtn) {
    searchBtn.addEventListener("click", performSearch);
  }

  // Nhấn phím Enter trong ô nhập liệu
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch();
    }
  });

  // Tự động xóa kết quả khi người dùng xóa trống ô tìm kiếm (trải nghiệm mượt mà)
  searchInput.addEventListener("input", (e) => {
    if (!e.target.value.trim()) {
      welcomePanel.style.display = "block";
      resultsPanel.style.display = "none";
      resultsContainer.innerHTML = "";
    }
  });
}

function renderDictionaryResultsCombined(offlineResults, onlineResults, isOnlineLoading, query) {
  const resultsContainer = document.getElementById("dict-results-container");
  const searchInput = document.getElementById("dict-search-input");
  const welcomePanel = document.getElementById("dict-welcome-panel");
  const resultsPanel = document.getElementById("dict-results-panel");
  
  const projects = getProjects();
  const hiraganaOnlyCb = document.getElementById("dict-hiragana-only-cb");
  const isHiraganaOnly = hiraganaOnlyCb ? hiraganaOnlyCb.checked : false;

  // Lấy dự án đã chọn lần trước để chọn mặc định
  let lastProjId = localStorage.getItem("last_selected_project_id") || "";
  
  // Nếu chưa có dự án được lưu hoặc dự án đó đã bị xóa, chọn dự án đầu tiên nếu có danh sách
  if (projects.length > 0) {
    const projectExists = projects.some(p => p.id === lastProjId);
    if (!projectExists) {
      lastProjId = projects[0].id;
      localStorage.setItem("last_selected_project_id", lastProjId);
    }
  }

  let optionsHtml = projects.map(p => {
    const isSelected = p.id === lastProjId ? "selected" : "";
    return `<option value="${p.id}" ${isSelected}>${p.name}</option>`;
  }).join("");

  if (projects.length === 0) {
    optionsHtml = `<option value="">(Chưa có dự án nào)</option>`;
  }

  // Nếu cả offline và online đều rỗng và đã tải xong, hiển thị Form tự tạo nhanh
  if (offlineResults.length === 0 && onlineResults.length === 0 && !isOnlineLoading) {
    const guessed = guessVocabFields(query);
    let displayGuessedJp = guessed.japanese;
    if (isHiraganaOnly) {
      displayGuessedJp = convertKatakanaToHiragana(displayGuessedJp);
    }

    resultsContainer.innerHTML = `
      <div class="glass-panel" style="max-width: 500px; margin: 20px auto; padding: 1.5rem; text-align: left; border: 2px solid var(--ink); box-shadow: var(--shadow); background: var(--paper);">
        <p style="text-align: center; color: var(--ink-soft); font-family: var(--font-serif); margin-bottom: 1rem;">
          🔍 Không tìm thấy từ khóa "${query}" trong từ điển. Bạn có muốn tự tạo nhanh từ này?
        </p>
        <div style="border-top: 1px dashed var(--line); margin: 1rem 0;"></div>
        <h3 style="font-size: 1.1rem; color: var(--accent); margin-bottom: 1rem; text-align: center; font-family: var(--font-display);">Tự Tạo Nhanh Từ Vựng</h3>
        
        <div class="form-group">
          <label style="font-size: 0.85rem;">Chọn dự án thêm vào *</label>
          <select class="form-control" id="quick-add-project" style="font-size: 0.9rem; height: 36px; padding: 5px 10px;">
            ${optionsHtml}
          </select>
        </div>
        <div class="form-group">
          <label style="font-size: 0.85rem;">Tiếng Nhật (Kanji/Kana) *</label>
          <input type="text" class="form-control" id="quick-add-japanese" value="${displayGuessedJp}" placeholder="Ví dụ: ねこ hoặc いぬ" style="font-size: 0.9rem; padding: 6px 12px;">
        </div>
        <div class="form-group">
          <label style="font-size: 0.85rem;">Romaji *</label>
          <input type="text" class="form-control" id="quick-add-romaji" value="${guessed.romaji}" placeholder="Ví dụ: neko" style="font-size: 0.9rem; padding: 6px 12px;">
        </div>
        <div class="form-group">
          <label style="font-size: 0.85rem;">Nghĩa Tiếng Việt *</label>
          <input type="text" class="form-control" id="quick-add-meaning" value="${guessed.meaning}" placeholder="Ví dụ: con mèo" style="font-size: 0.9rem; padding: 6px 12px;">
        </div>
        <button class="btn btn-primary" id="btn-quick-add-save" style="width: 100%; margin-top: 1rem; padding: 10px; font-size: 0.95rem;">➕ Lưu và thêm vào dự án</button>
      </div>
    `;

    const btnSave = document.getElementById("btn-quick-add-save");
    if (btnSave) {
      btnSave.onclick = () => {
        const projectId = document.getElementById("quick-add-project").value;
        if (!projectId) {
          alert("Vui lòng tạo một dự án mới trước khi thêm từ vựng!");
          return;
        }

        const japanese = document.getElementById("quick-add-japanese").value.trim();
        const romaji = document.getElementById("quick-add-romaji").value.trim().toLowerCase();
        const meaning = document.getElementById("quick-add-meaning").value.trim();

        if (!japanese || !romaji || !meaning) {
          alert("Vui lòng điền đầy đủ tất cả các trường!");
          return;
        }

        const added = addVocabToProject(projectId, { japanese, romaji, meaning });
        if (added) {
          // Lưu dự án đã chọn
          localStorage.setItem("last_selected_project_id", projectId);
          alert(`Đã thêm thành công từ "${japanese}" vào dự án.`);
          searchInput.value = "";
          welcomePanel.style.display = "block";
          resultsPanel.style.display = "none";
          resultsContainer.innerHTML = "";
        }
      };
    }

    const quickAddSelect = document.getElementById("quick-add-project");
    if (quickAddSelect) {
      quickAddSelect.onchange = (e) => {
        localStorage.setItem("last_selected_project_id", e.target.value);
      };
    }
    return;
  }

  // Khởi tạo bảng kết quả
  let html = `
    <div class="vocab-table-container">
      <table class="vocab-table">
        <thead>
          <tr>
            <th>Tiếng Nhật</th>
            <th>Romaji</th>
            <th>Nghĩa Tiếng Việt</th>
            <th style="width: 100px;">Nguồn</th>
            <th style="width: 250px; text-align: center;">Chọn dự án để thêm</th>
          </tr>
        </thead>
        <tbody>
  `;

  let itemIndex = 0;

  // 1. Render các dòng kết quả offline
  offlineResults.forEach(item => {
    let displayJp = cleanToKanaOnly(item.japanese);
    if (isHiraganaOnly) {
      displayJp = convertKatakanaToHiragana(displayJp);
    }

    html += `
      <tr style="background: rgba(79, 122, 74, 0.04);">
        <td data-label="Tiếng Nhật" class="vocab-jp-cell">
          ${displayJp}
          <button class="btn btn-secondary speak-row-btn" data-text="${displayJp}" style="width:24px; height:24px; font-size:0.7rem; vertical-align:middle; padding:0; border:none; background:transparent; box-shadow:none; cursor:pointer;" title="Nghe phát âm">🔊</button>
        </td>
        <td data-label="Romaji" style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink-soft);">${item.romaji}</td>
        <td data-label="Ý nghĩa">${item.meaning}</td>
        <td data-label="Nguồn"><span class="vocab-badge" style="background: var(--good-soft); color: var(--good); font-weight: bold;">Offline</span></td>
        <td data-label="Thao tác" style="text-align: center;">
          <div style="display: flex; gap: 0.4rem; justify-content: center; align-items: center;">
            <select class="form-control select-dict-project" data-index="${itemIndex}" style="padding: 4px 8px; font-size: 0.85rem; height: 30px; width: 140px; margin-bottom: 0;">
              ${optionsHtml}
            </select>
            <button class="btn btn-primary btn-add-dict-to-project" data-index="${itemIndex}" data-japanese="${displayJp}" data-romaji="${item.romaji}" data-meaning="${item.meaning}" style="height: 30px; padding: 0 10px; font-size: 10px;">➕ Thêm</button>
          </div>
        </td>
      </tr>
    `;
    itemIndex++;
  });

  // 2. Render các dòng kết quả online
  onlineResults.forEach(item => {
    // Tránh trùng lặp từ với kết quả offline
    const isDuplicate = offlineResults.some(off => {
      const cleanOffJp = cleanToKanaOnly(off.japanese).split(" ")[0].trim();
      const cleanItemJp = cleanToKanaOnly(item.japanese).split(" ")[0].trim();
      return cleanOffJp === cleanItemJp || off.romaji === item.romaji;
    });

    if (isDuplicate) return;

    let displayJp = cleanToKanaOnly(item.japanese);
    if (isHiraganaOnly) {
      displayJp = convertKatakanaToHiragana(displayJp);
    }

    html += `
      <tr>
        <td data-label="Tiếng Nhật" class="vocab-jp-cell">
          ${displayJp}
          <button class="btn btn-secondary speak-row-btn" data-text="${displayJp}" style="width:24px; height:24px; font-size:0.7rem; vertical-align:middle; padding:0; border:none; background:transparent; box-shadow:none; cursor:pointer;" title="Nghe phát âm">🔊</button>
        </td>
        <td data-label="Romaji" style="font-family: var(--font-mono); font-size: 0.95rem; color: var(--ink-soft);">${item.romaji}</td>
        <td data-label="Ý nghĩa">${item.meaning}</td>
        <td data-label="Nguồn"><span class="vocab-badge" style="background: var(--accent-soft); color: var(--accent); font-weight: bold;">Online</span></td>
        <td data-label="Thao tác" style="text-align: center;">
          <div style="display: flex; gap: 0.4rem; justify-content: center; align-items: center;">
            <select class="form-control select-dict-project" data-index="${itemIndex}" style="padding: 4px 8px; font-size: 0.85rem; height: 30px; width: 140px; margin-bottom: 0;">
              ${optionsHtml}
            </select>
            <button class="btn btn-primary btn-add-dict-to-project" data-index="${itemIndex}" data-japanese="${displayJp}" data-romaji="${item.romaji}" data-meaning="${item.meaning}" style="height: 30px; padding: 0 10px; font-size: 10px;">➕ Thêm</button>
          </div>
        </td>
      </tr>
    `;
    itemIndex++;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  // Thêm loading bar ở dưới cùng nếu đang tra cứu online
  if (isOnlineLoading) {
    html += `
      <div id="dict-online-loading" style="display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; color: var(--ink-soft); font-family: var(--font-serif); font-size: 13px; border: 1px solid var(--line-strong); border-top: none; border-radius: 0 0 var(--radius) var(--radius); background: var(--field);">
        <span class="spinner" style="width: 14px; height: 14px; border: 2px solid var(--line); border-top-color: var(--accent); border-radius: 50%; display: inline-block; animation: spin 0.8s linear infinite;"></span>
        <span>Đang tìm kiếm thêm trên từ điển trực tuyến...</span>
      </div>
    `;
  }

  resultsContainer.innerHTML = html;

  // Lắng nghe phát âm
  resultsContainer.querySelectorAll(".speak-row-btn").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      speakJapanese(btn.getAttribute("data-text"));
    };
  });

  // Lắng nghe nút Thêm vào dự án
  resultsContainer.querySelectorAll(".btn-add-dict-to-project").forEach(btn => {
    btn.onclick = (e) => {
      const index = btn.getAttribute("data-index");
      const selectEl = resultsContainer.querySelector(`.select-dict-project[data-index="${index}"]`);
      const projectId = selectEl.value;

      if (!projectId) {
        alert("Vui lòng tạo một dự án mới trước khi thêm từ vựng!");
        return;
      }

      const japanese = btn.getAttribute("data-japanese");
      const romaji = btn.getAttribute("data-romaji");
      const meaning = btn.getAttribute("data-meaning");

      const added = addVocabToProject(projectId, { japanese, romaji, meaning });
      if (added) {
        // Lưu dự án vừa thêm vào làm mặc định cho lần sau
        localStorage.setItem("last_selected_project_id", projectId);
        
        btn.textContent = "✔️ Đã thêm";
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-success");
        btn.disabled = true;
        selectEl.disabled = true;
      }
    };
  });

  // Lắng nghe sự thay đổi của các dropdown để lưu lại và đồng bộ tất cả các dòng khác trong bảng
  resultsContainer.querySelectorAll(".select-dict-project").forEach(select => {
    select.onchange = (e) => {
      const selectedValue = e.target.value;
      localStorage.setItem("last_selected_project_id", selectedValue);
      // Đồng bộ tất cả các select khác chưa bị vô hiệu hóa (chưa thêm thành công)
      resultsContainer.querySelectorAll(".select-dict-project").forEach(s => {
        if (!s.disabled) {
          s.value = selectedValue;
        }
      });
    };
  });
}

const KANA_SETTINGS_KEY = "nihongo_kana_settings";

function getKanaSettings() {
  const defaults = {
    delay: 1.2,
    pauseOnWrong: true,
    soundEnabled: true,
    confettiEnabled: true,
    confettiThreshold: 80
  };
  
  try {
    const saved = localStorage.getItem(KANA_SETTINGS_KEY);
    if (saved) {
      return { ...defaults, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Lỗi khi đọc cài đặt Kana:", e);
  }
  return defaults;
}

function saveKanaSettings(settings) {
  try {
    localStorage.setItem(KANA_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Lỗi khi lưu cài đặt Kana:", e);
  }
}

// Hàm phát âm thanh phản hồi bằng Web Audio API
function playFeedbackSound(isCorrect) {
  const settings = getKanaSettings();
  if (!settings.soundEnabled) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (isCorrect) {
      // Âm thanh báo ĐÚNG: âm thanh tinh tinh vui tươi (2 nốt tăng dần)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      // Âm thanh báo SAI: âm thanh trầm rè buồn (1 nốt thấp kéo dài giảm dần tần số)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn("Lỗi khi phát âm thanh Web Audio API:", e);
  }
}

// Hiệu ứng tung hoa bằng canvas động
function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const resizeHandler = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  window.addEventListener("resize", resizeHandler);

  const colors = ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#9b5de5", "#f15bb5", "#00bbf9", "#00f5d4"];
  const particles = [];
  
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * -height - 20,
      r: Math.random() * 6 + 4,
      d: Math.random() * width,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0,
      speed: Math.random() * 3 + 2
    });
  }

  let animationFrameId;
  const startTime = Date.now();

  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    let active = false;
    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.speed;
      p.x += Math.sin(p.tiltAngle) * 0.5;
      p.tilt = Math.sin(p.tiltAngle - p.r / 2) * 5;

      if (p.y < height) {
        active = true;
      }

      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });

    const elapsed = Date.now() - startTime;
    if (active && elapsed < 4000) {
      animationFrameId = requestAnimationFrame(draw);
    } else {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeHandler);
      canvas.remove();
    }
  }

  draw();
}


// ================= KANA PRACTICE LOGIC =================

// Trạng thái luyện tập bảng chữ cái
let selectedKanaList = [];
let activeKanaQuizList = [];
let currentKanaQuizIndex = 0;
let correctKanaQuizCount = 0;

let currentKanaCardIndex = 0;
let isCardFlipped = false;

let currentKanaDrawIndex = 0;
let isDrawingOnCanvas = false;
let canvasLastX = 0;
let canvasLastY = 0;
let userStrokeCount = 0; // Đếm số nét vẽ thực tế của người dùng
let userStrokes = []; // Lưu trữ tọa độ chi tiết các nét vẽ
let isCanvasEventsBound = false; // Tránh bind trùng sự kiện canvas

// Hàm helper lưu danh sách chữ cái Kana đã chọn vào localStorage
function saveKanaSelection(kanaType) {
  const checkedBoxes = document.querySelectorAll(".kana-checkbox:checked");
  const checkedRomajis = Array.from(checkedBoxes).map(cb => cb.value);
  localStorage.setItem(`web_fcard_selected_${kanaType}`, JSON.stringify(checkedRomajis));
}

// Khởi tạo các sự kiện cho bảng chữ cái
function setupKanaEvents() {
  const selectAllBtn = document.getElementById("kana-select-all");
  const selectNoneBtn = document.getElementById("kana-select-none");
  const startBtn = document.getElementById("start-kana-practice-btn");
  
  // Đăng ký thay đổi bảng chữ cái (Hiragana / Katakana)
  document.getElementById("kana-type-hira").onclick = () => renderKanaSetup();
  document.getElementById("kana-type-kata").onclick = () => renderKanaSetup();

  // Chọn tất cả
  if (selectAllBtn) {
    selectAllBtn.onclick = () => {
      document.querySelectorAll(".kana-checkbox").forEach(cb => cb.checked = true);
      document.querySelectorAll(".kana-row-select-all").forEach(cb => cb.checked = true);
      const kanaType = document.querySelector('input[name="kana-type"]:checked').value;
      saveKanaSelection(kanaType);
    };
  }

  // Bỏ chọn hết
  if (selectNoneBtn) {
    selectNoneBtn.onclick = () => {
      document.querySelectorAll(".kana-checkbox").forEach(cb => cb.checked = false);
      document.querySelectorAll(".kana-row-select-all").forEach(cb => cb.checked = false);
      const kanaType = document.querySelector('input[name="kana-type"]:checked').value;
      saveKanaSelection(kanaType);
    };
  }

  // Bấm bắt đầu luyện tập
  if (startBtn) {
    startBtn.onclick = () => {
      const checkedBoxes = document.querySelectorAll(".kana-checkbox:checked");
      if (checkedBoxes.length === 0) {
        alert("Vui lòng chọn ít nhất 1 kí tự để luyện tập!");
        return;
      }

      // Thu thập danh sách chữ cái đã chọn
      selectedKanaList = [];
      const kanaType = document.querySelector('input[name="kana-type"]:checked').value;
      const listSource = kanaType === "hiragana" ? HIRAGANA_LIST : KATAKANA_LIST;

      checkedBoxes.forEach(cb => {
        const romaji = cb.value;
        const found = listSource.find(item => item.romaji === romaji);
        if (found) {
          selectedKanaList.push(found);
        }
      });

      // Trộn ngẫu nhiên danh sách luyện tập
      selectedKanaList.sort(() => Math.random() - 0.5);

      // Chuyển sang màn hình luyện tập
      switchView("kana-practice-view");
      
      // Đặt tiêu đề
      document.getElementById("kana-practice-title").textContent = `Luyện ${kanaType === "hiragana" ? "Hiragana" : "Katakana"}`;

      // Bật mặc định sub-tab trắc nghiệm
      switchKanaSubTab("quiz");
    };
  }

  // Đăng ký chuyển đổi sub-tab trong đấu trường luyện chữ cái
  document.getElementById("sub-tab-quiz").onclick = () => switchKanaSubTab("quiz");
  document.getElementById("sub-tab-card").onclick = () => switchKanaSubTab("card");
  document.getElementById("sub-tab-draw").onclick = () => switchKanaSubTab("draw");

  // Nút quay lại trang setup chữ cái
  document.getElementById("back-to-kana-setup-btn").onclick = () => {
    switchView("kana-setup-view");
  };

  // Đăng ký Cài đặt Luyện chữ cái
  const settingsBtn = document.getElementById("kana-settings-btn");
  const settingsModal = document.getElementById("kana-settings-modal");
  const closeSettingsBtn = document.getElementById("close-kana-settings-modal-btn");
  const settingsForm = document.getElementById("kana-settings-form");
  const confettiCb = document.getElementById("kana-settings-confetti");

  if (settingsBtn && settingsModal) {
    settingsBtn.onclick = () => {
      const settings = getKanaSettings();
      document.getElementById("kana-settings-delay").value = settings.delay;
      document.getElementById("kana-settings-pause-on-wrong").checked = settings.pauseOnWrong;
      document.getElementById("kana-settings-sound").checked = settings.soundEnabled;
      confettiCb.checked = settings.confettiEnabled;
      
      const thresholdInput = document.getElementById("kana-settings-confetti-threshold");
      const thresholdGroup = document.getElementById("kana-settings-confetti-threshold-group");
      thresholdInput.value = settings.confettiThreshold;
      thresholdGroup.style.display = settings.confettiEnabled ? "block" : "none";
      
      settingsModal.classList.add("active");
    };
  }

  if (confettiCb) {
    confettiCb.onchange = () => {
      const thresholdGroup = document.getElementById("kana-settings-confetti-threshold-group");
      thresholdGroup.style.display = confettiCb.checked ? "block" : "none";
    };
  }

  if (closeSettingsBtn && settingsModal) {
    closeSettingsBtn.onclick = () => {
      settingsModal.classList.remove("active");
    };
  }

  if (settingsForm && settingsModal) {
    settingsForm.onsubmit = (e) => {
      e.preventDefault();
      const delay = parseFloat(document.getElementById("kana-settings-delay").value) || 0;
      const pauseOnWrong = document.getElementById("kana-settings-pause-on-wrong").checked;
      const soundEnabled = document.getElementById("kana-settings-sound").checked;
      const confettiEnabled = confettiCb.checked;
      const confettiThreshold = parseInt(document.getElementById("kana-settings-confetti-threshold").value) || 0;
      
      saveKanaSettings({
        delay,
        pauseOnWrong,
        soundEnabled,
        confettiEnabled,
        confettiThreshold
      });
      
      settingsModal.classList.remove("active");
    };
  }

  // Thiết lập sự kiện cho trắc nghiệm và flashcard
  setupKanaQuizEvents();
  setupKanaCardEvents();
  setupKanaDrawEvents();
}

// Vẽ danh sách chữ cái có checkbox phân theo hàng
function renderKanaSetup() {
  const kanaType = document.querySelector('input[name="kana-type"]:checked').value;
  const grid = document.getElementById("kana-selection-grid");
  if (!grid) return;

  const list = kanaType === "hiragana" ? HIRAGANA_LIST : KATAKANA_LIST;
  grid.innerHTML = "";

  // Tùy chỉnh style của grid để phục vụ layout flex phân hàng ngang
  grid.style.display = "flex";
  grid.style.flexDirection = "column";
  grid.style.gap = "12px";
  grid.style.maxHeight = "350px";
  grid.style.overflowY = "auto";
  grid.style.padding = "12px";

  // Đọc danh sách đã lưu từ localStorage
  let savedSelection = null;
  try {
    const savedStr = localStorage.getItem(`web_fcard_selected_${kanaType}`);
    if (savedStr) {
      savedSelection = JSON.parse(savedStr);
    }
  } catch (e) {
    console.error("Lỗi khi đọc danh sách chữ cái đã chọn:", e);
  }

  const KANA_ROWS = [
    { rowName: "Hàng A", keys: ["a", "i", "u", "e", "o"] },
    { rowName: "Hàng KA", keys: ["ka", "ki", "ku", "ke", "ko"] },
    { rowName: "Hàng SA", keys: ["sa", "shi", "su", "se", "so"] },
    { rowName: "Hàng TA", keys: ["ta", "chi", "tsu", "te", "to"] },
    { rowName: "Hàng NA", keys: ["na", "ni", "nu", "ne", "no"] },
    { rowName: "Hàng HA", keys: ["ha", "hi", "fu", "he", "ho"] },
    { rowName: "Hàng MA", keys: ["ma", "mi", "mu", "me", "mo"] },
    { rowName: "Hàng YA", keys: ["ya", "yu", "yo"] },
    { rowName: "Hàng RA", keys: ["ra", "ri", "ru", "re", "ro"] },
    { rowName: "Hàng WA", keys: ["wa", "wo", "n"] }
  ];

  KANA_ROWS.forEach(row => {
    // Lọc danh sách chữ mẫu thuộc hàng này
    const rowItems = row.keys.map(key => list.find(item => item.romaji === key)).filter(Boolean);
    if (rowItems.length === 0) return;

    const rowContainer = document.createElement("div");
    rowContainer.className = "kana-row";
    
    // Header của hàng chứa checkbox Chọn cả hàng
    const rowHeader = document.createElement("div");
    rowHeader.className = "kana-row-header";

    const rowCheckboxId = `row-select-${row.rowName.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Xác định trạng thái check của hàng
    const totalRowItems = rowItems.length;
    const checkedRowItems = rowItems.filter(item => savedSelection ? savedSelection.includes(item.romaji) : true).length;
    const isRowAllChecked = totalRowItems === checkedRowItems;

    rowHeader.innerHTML = `
      <input type="checkbox" id="${rowCheckboxId}" class="kana-row-select-all" ${isRowAllChecked ? "checked" : ""} style="accent-color: var(--accent); cursor: pointer; width: 15px; height: 15px;">
      <label for="${rowCheckboxId}" style="font-weight: bold; cursor: pointer; font-size: 13px; color: var(--accent); font-family: var(--font-serif); user-select: none; margin-bottom: 0; text-transform: none; letter-spacing: normal;">${row.rowName}</label>
    `;

    // Nhóm chứa các ô checkbox của từng chữ cái
    const rowItemsContainer = document.createElement("div");
    rowItemsContainer.style.display = "flex";
    rowItemsContainer.style.flexWrap = "wrap";
    rowItemsContainer.style.gap = "8px";
    rowItemsContainer.style.flex = "1";

    rowItems.forEach(item => {
      const isChecked = savedSelection ? savedSelection.includes(item.romaji) : true;
      const itemEl = document.createElement("label");
      itemEl.style.display = "flex";
      itemEl.style.alignItems = "center";
      itemEl.style.gap = "6px";
      itemEl.style.cursor = "pointer";
      itemEl.style.padding = "4px 8px";
      itemEl.style.borderRadius = "4px";
      itemEl.style.border = "1px solid var(--line)";
      itemEl.style.background = "var(--paper)";
      itemEl.style.fontFamily = "var(--font-mono)";
      itemEl.style.fontSize = "13px";
      itemEl.style.margin = "0";

      itemEl.innerHTML = `
        <input type="checkbox" class="kana-checkbox" value="${item.romaji}" ${isChecked ? "checked" : ""} style="accent-color: var(--accent); margin: 0; width: 14px; height: 14px;">
        <span style="font-family: var(--font-jp); font-size: 16px; font-weight: bold; color: var(--accent); margin-right: 2px;">${item.kana}</span>
        <span>${item.romaji}</span>
      `;

      rowItemsContainer.appendChild(itemEl);
    });

    rowContainer.appendChild(rowHeader);
    rowContainer.appendChild(rowItemsContainer);
    grid.appendChild(rowContainer);

    // Lắng nghe sự kiện tick/untick của checkbox Chọn cả hàng
    const rowSelectAllCb = rowHeader.querySelector(".kana-row-select-all");
    rowSelectAllCb.addEventListener("change", (e) => {
      const isChecked = e.target.checked;
      rowItemsContainer.querySelectorAll(".kana-checkbox").forEach(cb => {
        cb.checked = isChecked;
      });
      saveKanaSelection(kanaType);
    });

    // Cập nhật trạng thái checkbox Chọn cả hàng dựa trên các checkbox con
    rowItemsContainer.querySelectorAll(".kana-checkbox").forEach(cb => {
      cb.addEventListener("change", () => {
        const totalCbs = rowItemsContainer.querySelectorAll(".kana-checkbox").length;
        const checkedCbs = rowItemsContainer.querySelectorAll(".kana-checkbox:checked").length;
        rowSelectAllCb.checked = totalCbs === checkedCbs;
        saveKanaSelection(kanaType);
      });
    });
  });
}

// Chuyển đổi các tab con trong Luyện tập
function switchKanaSubTab(subTabId) {
  // Active tab button
  document.getElementById("sub-tab-quiz").classList.remove("active-sub-tab");
  document.getElementById("sub-tab-card").classList.remove("active-sub-tab");
  document.getElementById("sub-tab-draw").classList.remove("active-sub-tab");
  document.getElementById(`sub-tab-${subTabId}`).classList.add("active-sub-tab");

  // Show/Hide các sub view tương ứng
  document.getElementById("kana-sub-view-quiz").style.display = "none";
  document.getElementById("kana-sub-view-card").style.display = "none";
  document.getElementById("kana-sub-view-draw").style.display = "none";
  document.getElementById(`kana-sub-view-${subTabId}`).style.display = "block";

  // Khởi chạy logic tương ứng cho sub tab
  if (subTabId === "quiz") {
    startKanaQuiz();
  } else if (subTabId === "card") {
    startKanaCard();
  } else if (subTabId === "draw") {
    startKanaDraw();
  }
}

// --- SUB-VIEW 1: TRẮC NGHIỆM ---
function setupKanaQuizEvents() {
  document.getElementById("kana-quiz-mode-select").onchange = () => {
    startKanaQuiz();
  };
}

function startKanaQuiz() {
  // Clone danh sách được chọn và trộn ngẫu nhiên để làm câu hỏi
  activeKanaQuizList = [...selectedKanaList].sort(() => Math.random() - 0.5);
  currentKanaQuizIndex = 0;
  correctKanaQuizCount = 0;

  renderKanaQuizQuestion();
}

function renderKanaQuizQuestion() {
  if (currentKanaQuizIndex >= activeKanaQuizList.length) {
    // Kết thúc lượt trắc nghiệm, hiển thị thông báo điểm
    const grid = document.getElementById("kana-quiz-options-container");
    grid.innerHTML = "";
    document.getElementById("kana-quiz-question-word").textContent = "Xong!";
    document.getElementById("kana-quiz-question-word").className = "quiz-question-word meaning-word";
    document.getElementById("kana-quiz-counter").textContent = "Hoàn thành!";
    
    const accuracy = Math.round((correctKanaQuizCount / activeKanaQuizList.length) * 100);
    grid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 1.5rem; text-align:center;">
        <p style="font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem;">Lượt trắc nghiệm hoàn tất!</p>
        <p style="font-size: 1.1rem; color: var(--ink-soft); margin-bottom: 1.5rem;">Kết quả: <strong style="color: var(--accent); font-size:1.5rem;">${correctKanaQuizCount} / ${activeKanaQuizList.length}</strong> (${accuracy}% chính xác)</p>
        <button class="btn btn-primary" id="restart-kana-quiz-btn" style="width:200px; margin: 0 auto;">Luyện tập lại</button>
      </div>
    `;
    
    // Kiểm tra và tung hoa chúc mừng nếu đạt điều kiện
    const settings = getKanaSettings();
    if (settings.confettiEnabled && accuracy >= settings.confettiThreshold) {
      triggerConfetti();
    }

    document.getElementById("restart-kana-quiz-btn").onclick = () => {
      startKanaQuiz();
    };
    return;
  }

  // Ẩn nút "Tiếp theo" của câu hỏi trước (nếu có)
  const nextContainer = document.getElementById("kana-quiz-next-container");
  if (nextContainer) {
    nextContainer.style.display = "none";
  }

  const currentItem = activeKanaQuizList[currentKanaQuizIndex];
  const total = activeKanaQuizList.length;
  
  document.getElementById("kana-quiz-counter").textContent = `Câu hỏi ${currentKanaQuizIndex + 1} / ${total}`;
  document.getElementById("kana-quiz-score").textContent = `Đúng: ${correctKanaQuizCount}`;

  // Xác định chế độ trắc nghiệm
  let mode = document.getElementById("kana-quiz-mode-select").value;
  if (mode === "mixed") {
    mode = Math.random() < 0.5 ? "kana_to_romaji" : "romaji_to_kana";
  }

  // Render câu hỏi
  const wordDisplay = document.getElementById("kana-quiz-question-word");
  wordDisplay.className = "quiz-question-word";
  
  if (mode === "kana_to_romaji") {
    wordDisplay.textContent = currentItem.kana;
  } else {
    wordDisplay.textContent = currentItem.romaji;
    wordDisplay.className = "quiz-question-word meaning-word";
  }

  // Chuẩn bị 4 đáp án (1 đúng + 3 nhiễu)
  const kanaType = document.querySelector('input[name="kana-type"]:checked').value;
  const fullList = kanaType === "hiragana" ? HIRAGANA_LIST : KATAKANA_LIST;
  const distractors = generateKanaDistractors(currentItem, fullList, 3);
  
  const options = [currentItem, ...distractors].sort(() => Math.random() - 0.5);

  // Render các nút đáp án
  const container = document.getElementById("kana-quiz-options-container");
  container.innerHTML = "";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "btn btn-secondary";
    btn.style.padding = "14px";
    btn.style.fontSize = mode === "kana_to_romaji" ? "1.2rem" : "1.5rem";
    btn.style.fontFamily = mode === "kana_to_romaji" ? "var(--font-mono)" : "var(--font-jp)";
    
    btn.textContent = mode === "kana_to_romaji" ? opt.romaji : opt.kana;

    btn.onclick = () => {
      // Khóa tất cả các nút
      container.querySelectorAll("button").forEach(b => b.disabled = true);

      const isCorrect = opt.romaji === currentItem.romaji;
      
      if (isCorrect) {
        correctKanaQuizCount++;
        btn.style.background = "var(--good-soft)";
        btn.style.color = "var(--good)";
        btn.style.borderColor = "var(--good)";
      } else {
        btn.style.background = "var(--error-soft)";
        btn.style.color = "var(--error)";
        btn.style.borderColor = "var(--error)";
        
        // Tìm và highlight đáp án đúng
        container.querySelectorAll("button").forEach(b => {
          const val = b.textContent;
          if (mode === "kana_to_romaji" && val === currentItem.romaji) {
            b.style.background = "var(--good-soft)";
            b.style.color = "var(--good)";
            b.style.borderColor = "var(--good)";
          } else if (mode === "romaji_to_kana" && val === currentItem.kana) {
            b.style.background = "var(--good-soft)";
            b.style.color = "var(--good)";
            b.style.borderColor = "var(--good)";
          }
        });
      }

      // Phát âm thanh phản hồi
      playFeedbackSound(isCorrect);

      // Đọc cấu hình cài đặt
      const settings = getKanaSettings();
      const delayMs = settings.delay * 1000;

      // Xử lý chuyển câu tiếp theo
      if (!isCorrect && settings.pauseOnWrong) {
        // Trả lời sai và có bật tạm dừng
        const nextContainer = document.getElementById("kana-quiz-next-container");
        const nextBtn = document.getElementById("kana-quiz-next-btn");
        if (nextContainer && nextBtn) {
          nextContainer.style.display = "block";
          nextBtn.onclick = () => {
            nextContainer.style.display = "none";
            currentKanaQuizIndex++;
            renderKanaQuizQuestion();
          };
        } else {
          // Fallback tự chuyển câu
          setTimeout(() => {
            currentKanaQuizIndex++;
            renderKanaQuizQuestion();
          }, Math.max(1200, delayMs));
        }
      } else {
        // Trả lời đúng hoặc làm sai nhưng không tạm dừng
        if (delayMs <= 0) {
          currentKanaQuizIndex++;
          renderKanaQuizQuestion();
        } else {
          setTimeout(() => {
            currentKanaQuizIndex++;
            renderKanaQuizQuestion();
          }, delayMs);
        }
      }
    };

    container.appendChild(btn);
  });
}

// --- SUB-VIEW 2: FLASHCARD ---
function setupKanaCardEvents() {
  const cardBox = document.getElementById("kana-flashcard-box");
  const prevBtn = document.getElementById("kana-card-prev");
  const nextBtn = document.getElementById("kana-card-next");

  // Click để lật thẻ
  cardBox.onclick = flipKanaCard;

  // Nút lùi/tiến thẻ
  prevBtn.onclick = prevKanaCard;
  nextBtn.onclick = nextKanaCard;

  // Bàn phím: Enter để lật, Trái/Phải để chuyển thẻ
  window.onkeydown = (e) => {
    if (!document.getElementById("kana-practice-view").classList.contains("active")) return;
    const isCardTab = document.getElementById("sub-tab-card").classList.contains("active-sub-tab");
    if (!isCardTab) return;

    if (e.key === "Enter") {
      e.preventDefault();
      flipKanaCard();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevKanaCard();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextKanaCard();
    }
  };
}

function startKanaCard() {
  currentKanaCardIndex = 0;
  renderKanaCard();
}

function renderKanaCard() {
  const total = selectedKanaList.length;
  document.getElementById("kana-card-counter").textContent = `Thẻ ${currentKanaCardIndex + 1} / ${total}`;

  const currentItem = selectedKanaList[currentKanaCardIndex];
  
  const frontEl = document.getElementById("kana-card-front");
  const backEl = document.getElementById("kana-card-back");

  frontEl.textContent = currentItem.kana;
  backEl.textContent = currentItem.romaji;

  // Reset về mặt trước
  frontEl.style.display = "block";
  backEl.style.display = "none";
  isCardFlipped = false;
}

function flipKanaCard() {
  const frontEl = document.getElementById("kana-card-front");
  const backEl = document.getElementById("kana-card-back");
  const currentItem = selectedKanaList[currentKanaCardIndex];

  if (isCardFlipped) {
    // Lật lại mặt trước
    frontEl.style.display = "block";
    backEl.style.display = "none";
    isCardFlipped = false;
  } else {
    // Lật mặt sau và phát âm chữ Nhật
    frontEl.style.display = "none";
    backEl.style.display = "block";
    isCardFlipped = true;
    speakJapanese(currentItem.kana);
  }
}

function nextKanaCard() {
  if (currentKanaCardIndex < selectedKanaList.length - 1) {
    currentKanaCardIndex++;
    renderKanaCard();
  }
}

function prevKanaCard() {
  if (currentKanaCardIndex > 0) {
    currentKanaCardIndex--;
    renderKanaCard();
  }
}

// --- SUB-VIEW 3: TẬP VIẾT (DRAWING CANVAS) ---
function setupKanaDrawEvents() {
  document.getElementById("kana-draw-clear").onclick = clearKanaCanvas;
  document.getElementById("kana-draw-check").onclick = checkKanaDrawing;

  document.getElementById("kana-draw-prev-char").onclick = () => {
    if (currentKanaDrawIndex > 0) {
      currentKanaDrawIndex--;
      renderKanaDrawChar();
    }
  };

  document.getElementById("kana-draw-next-char").onclick = () => {
    if (currentKanaDrawIndex < selectedKanaList.length - 1) {
      currentKanaDrawIndex++;
      renderKanaDrawChar();
    }
  };

  // Lắng nghe sự kiện checkbox ẩn chữ mẫu mờ
  const hideTemplateCb = document.getElementById("kana-draw-hide-template-cb");
  const templateEl = document.getElementById("kana-draw-template");
  if (hideTemplateCb && templateEl) {
    hideTemplateCb.onchange = () => {
      if (hideTemplateCb.checked) {
        templateEl.style.display = "none";
      } else {
        templateEl.style.display = "flex";
      }
    };
  }
}

function startKanaDraw() {
  currentKanaDrawIndex = 0;
  
  // Khởi tạo Canvas và bind sự kiện vẽ tay nếu chưa làm
  initKanaCanvas();
  
  renderKanaDrawChar();
}

function initKanaCanvas() {
  const canvas = document.getElementById("kana-draw-canvas");
  if (!canvas || isCanvasEventsBound) return;

  const ctx = canvas.getContext("2d");

  // Thiết lập nét vẽ
  ctx.strokeStyle = "#1c1a17"; // màu mực sẫm Noto
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const getCoordinates = (e) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    isDrawingOnCanvas = true;
    userStrokeCount++; // Tăng đếm số nét vẽ thực tế
    const coords = getCoordinates(e);
    canvasLastX = coords.x;
    canvasLastY = coords.y;
    userStrokes.push([{ x: coords.x, y: coords.y }]); // Khởi tạo nét vẽ mới
  };

  const draw = (e) => {
    if (!isDrawingOnCanvas) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(canvasLastX, canvasLastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();

    canvasLastX = coords.x;
    canvasLastY = coords.y;
    
    if (userStrokes.length > 0) {
      userStrokes[userStrokes.length - 1].push({ x: coords.x, y: coords.y }); // Thêm tọa độ vào nét hiện tại
    }
  };

  const stopDrawing = () => {
    isDrawingOnCanvas = false;
  };

  // Chuột
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // Cảm ứng điện thoại
  canvas.addEventListener("touchstart", startDrawing, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);

  isCanvasEventsBound = true;
}

function renderKanaDrawChar() {
  const currentItem = selectedKanaList[currentKanaDrawIndex];
  
  // Hiển thị chữ mờ và tên kí tự (chỉ hiển thị Romaji ở nhãn để làm bài test viết thực tế)
  document.getElementById("kana-draw-template").textContent = currentItem.kana;
  document.getElementById("kana-draw-char-name").textContent = `Hãy viết kí tự: ${currentItem.romaji}`;

  // Đồng bộ trạng thái ẩn/hiện chữ mẫu theo checkbox hiện tại
  const hideTemplateCb = document.getElementById("kana-draw-hide-template-cb");
  const templateEl = document.getElementById("kana-draw-template");
  if (hideTemplateCb && templateEl) {
    if (hideTemplateCb.checked) {
      templateEl.style.display = "none";
    } else {
      templateEl.style.display = "flex";
    }
  }

  // Ẩn bảng đánh giá cũ
  document.getElementById("kana-draw-result-box").style.display = "none";

  // Reset nút bấm chuyển tiếp
  document.getElementById("kana-draw-prev-char").disabled = currentKanaDrawIndex === 0;
  document.getElementById("kana-draw-next-char").disabled = currentKanaDrawIndex === selectedKanaList.length - 1;

  // Xóa canvas cũ
  clearKanaCanvas();

  // Phát âm kí tự gốc để học
  speakJapanese(currentItem.kana);
}

function clearKanaCanvas() {
  const canvas = document.getElementById("kana-draw-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  document.getElementById("kana-draw-result-box").style.display = "none";
  userStrokeCount = 0; // Reset số lượng nét vẽ thực tế
  userStrokes = []; // Reset các nét vẽ
}

function checkKanaDrawing() {
  const canvas = document.getElementById("kana-draw-canvas");
  const currentItem = selectedKanaList[currentKanaDrawIndex];
  if (!canvas || !currentItem) return;

  const result = evaluateDrawing(canvas, currentItem.kana, userStrokeCount, userStrokes);

  // Hiển thị bảng kết quả
  const box = document.getElementById("kana-draw-result-box");
  const scoreEl = document.getElementById("kana-draw-score-text");
  const remarkEl = document.getElementById("kana-draw-remark-text");
  const statusEl = document.getElementById("kana-draw-status-text");

  scoreEl.textContent = `${result.score}%`;
  remarkEl.textContent = result.text;
  
  // Xác định ĐÚNG hoặc CHƯA ĐÚNG (ngưỡng >= 60%)
  const isCorrect = result.score >= 60;
  if (isCorrect) {
    statusEl.textContent = "ĐÚNG ✔️";
    statusEl.style.color = "var(--good)";
  } else {
    statusEl.textContent = "CHƯA ĐÚNG ❌";
    statusEl.style.color = "var(--error)";
  }

  // Đổi màu điểm số dựa trên chất lượng vẽ
  if (result.score >= 75) {
    scoreEl.style.color = "var(--good)";
  } else if (result.score >= 50) {
    scoreEl.style.color = "var(--warning)";
  } else {
    scoreEl.style.color = "var(--accent)";
  }

  box.style.display = "block";
}


