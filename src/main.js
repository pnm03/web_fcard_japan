import './style.css';
import { initializeStorage } from './storage.js';
import { initUI, switchView } from './ui.js';

// Đợi DOM load hoàn toàn rồi khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo kho dữ liệu local
  initializeStorage();
  
  // 2. Khởi tạo giao diện người dùng và các sự kiện
  initUI();

  // Lazy-load để website Vercel không tải các API native của Tauri.
  if ("__TAURI_INTERNALS__" in window) {
    import('./desktop.js')
      .then(({ initDesktopRuntime }) => initDesktopRuntime())
      .catch(error => console.error("Không tải được tính năng desktop:", error));
  }
  
  // 3. Nút mở Mini Widget trên thanh điều hướng
  const widgetBtn = document.getElementById("open-stealth-widget-btn");
  if (widgetBtn) {
    widgetBtn.addEventListener("click", () => {
      switchView("quiz-setup-view");
      const stealthBtn = document.getElementById("start-stealth-quiz-btn");
      if (stealthBtn) {
        stealthBtn.scrollIntoView({ behavior: "smooth", block: "center" });
        stealthBtn.classList.add("highlight-pulse");
        setTimeout(() => stealthBtn.classList.remove("highlight-pulse"), 2500);
      }
    });
  }

  console.log("Nihongo Flashcard App đã khởi chạy thành công!");
});
