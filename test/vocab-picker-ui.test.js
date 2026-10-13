import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("Giao diện Vocab Picker modal có tiêu đề thu nhỏ và cấu trúc hàng nút tối ưu", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  // 1. Tiêu đề thu nhỏ
  assert.ok(
    html.includes('class="picker-modal-title">🔍 Chọn Từ Vựng Kiểm Tra</h2>'),
    "Phải có tiêu đề picker-modal-title"
  );

  // 2. Nút Chọn tất cả và Bỏ chọn hết nằm trong picker-main-actions-row cùng hàng với chọn đoạn
  const mainActionsMatch = html.match(/<div class="picker-main-actions-row">([\s\S]*?)<\/div>\s*<div id="picker-smart-filters-container"/);
  assert.ok(mainActionsMatch, "Phải tìm thấy picker-main-actions-row trước picker-smart-filters-container");
  const mainRowContent = mainActionsMatch[1];
  assert.ok(mainRowContent.includes('id="picker-select-range-btn"'), "Hàng chính phải có Chọn đoạn");
  assert.ok(mainRowContent.includes('id="picker-select-all-btn"'), "Hàng chính phải có Chọn tất cả");
  assert.ok(mainRowContent.includes('id="picker-select-none-btn"'), "Hàng chính phải có Bỏ chọn hết");
  assert.ok(mainRowContent.includes('id="picker-toggle-filters-btn"'), "Hàng chính phải có nút toggle bộ lọc");

  // 3. Nhóm nút lọc thông minh nằm trong container có thể ẩn/hiện
  const smartFiltersMatch = html.match(/<div id="picker-smart-filters-container" class="picker-smart-filters-container">([\s\S]*?)<\/div>/);
  assert.ok(smartFiltersMatch, "Phải có picker-smart-filters-container");
  const smartFiltersContent = smartFiltersMatch[1];
  assert.ok(smartFiltersContent.includes('id="picker-select-weak-btn"'), "Phải chứa Chọn từ yếu");
  assert.ok(smartFiltersContent.includes('id="picker-select-due-btn"'), "Phải chứa Đến hạn ôn");
  assert.ok(smartFiltersContent.includes('id="picker-select-overdue-btn"'), "Phải chứa Quá hạn");
  assert.ok(smartFiltersContent.includes('id="picker-select-stale-btn"'), "Phải chứa Lâu chưa học");
  assert.ok(smartFiltersContent.includes('id="picker-select-hard-correct-btn"'), "Phải chứa Khó vừa đúng");
});

test("CSS quy định font-size tiêu đề nhỏ hơn 50% và ẩn bộ lọc khi có class is-collapsed", () => {
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  // Kiểm tra font-size tiêu đề ~13px (nhỏ hơn 50% so với 24-26px)
  assert.ok(css.includes(".picker-modal-title"), "CSS phải định nghĩa .picker-modal-title");
  assert.ok(css.includes("font-size: 13px !important"), "Font size tiêu đề phải là 13px");

  // Kiểm tra trạng thái ẩn is-collapsed của smart filters
  assert.ok(
    css.includes(".picker-smart-filters-container.is-collapsed"),
    "Phải có rule .picker-smart-filters-container.is-collapsed"
  );
  assert.ok(
    css.includes("display: none !important"),
    "Class is-collapsed phải ẩn display: none !important"
  );
});

test("UI script quản lý bộ lọc thông minh lưu trạng thái vào localStorage", () => {
  const uiPath = path.resolve(__dirname, "../src/ui.js");
  const ui = fs.readFileSync(uiPath, "utf-8");

  assert.ok(
    ui.includes('STORAGE_KEY_PICKER_FILTERS_COLLAPSED = "nihongo_picker_filters_collapsed"'),
    "Phải có storage key nihongo_picker_filters_collapsed"
  );
  assert.ok(
    ui.includes("applyPickerSmartFiltersState"),
    "Phải có hàm applyPickerSmartFiltersState"
  );
  assert.ok(
    ui.includes("picker-toggle-filters-btn"),
    "Phải bắt sự kiện cho picker-toggle-filters-btn"
  );
});
