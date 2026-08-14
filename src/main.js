import './style.css';
import { initializeStorage } from './storage.js';
import { initUI } from './ui.js';

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
  
  console.log("Nihongo Flashcard App đã khởi chạy thành công!");
});
