import './style.css';
import { initializeStorage } from './storage.js';
import { initUI } from './ui.js';

// Đợi DOM load hoàn toàn rồi khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
  // 1. Khởi tạo kho dữ liệu local
  initializeStorage();
  
  // 2. Khởi tạo giao diện người dùng và các sự kiện
  initUI();
  
  console.log("Nihongo Flashcard App đã khởi chạy thành công!");
});
