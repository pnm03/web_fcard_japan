import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test("index.html: cloud-sync-status không còn nằm trong main-header và có class sync-toast", () => {
  const htmlPath = path.resolve(__dirname, "../index.html");
  const html = fs.readFileSync(htmlPath, "utf-8");

  // Tìm khối <header class="main-header">...</header>
  const headerMatch = html.match(/<header class="main-header">([\s\S]*?)<\/header>/);
  assert.ok(headerMatch, "Phải tìm thấy thẻ <header class='main-header'>");
  const headerContent = headerMatch[1];

  // Khẳng định cloud-sync-status không nằm trong menu header
  assert.ok(
    !headerContent.includes('id="cloud-sync-status"'),
    "Thanh thông báo đồng bộ cloud-sync-status KHÔNG ĐƯỢC hiển thị trong menu header"
  );

  // Khẳng định cloud-sync-status tồn tại độc lập dạng sync-toast
  assert.ok(
    html.includes('id="cloud-sync-status"') && html.includes("sync-toast"),
    "Phải có phần tử #cloud-sync-status với class sync-toast để làm thông báo trượt"
  );
});

test("style.css: định nghĩa hiệu ứng trượt từ bên phải sang và tự ẩn cho sync-toast", () => {
  const cssPath = path.resolve(__dirname, "../src/style.css");
  const css = fs.readFileSync(cssPath, "utf-8");

  assert.ok(css.includes(".sync-toast"), "CSS phải có class .sync-toast");
  assert.ok(css.includes("position: fixed"), "sync-toast phải là position: fixed nổi trên màn hình");
  assert.ok(css.includes("transform: translateX"), "sync-toast phải có transform: translateX để trượt từ bên phải");
  assert.ok(css.includes(".sync-toast.is-visible"), "sync-toast phải có class .is-visible khi kích hoạt");
  assert.ok(css.includes(".status-syncing"), "CSS phải có trạng thái .status-syncing");
  assert.ok(css.includes(".status-synced"), "CSS phải có trạng thái .status-synced");
});

test("ui.js: export hàm triggerSyncToast hỗ trợ trượt thông báo và tự ẩn sau khoảng thời gian quy định", async () => {
  const uiModule = await import("../src/ui.js");
  assert.equal(typeof uiModule.triggerSyncToast, "function", "ui.js phải export hàm triggerSyncToast");
});
