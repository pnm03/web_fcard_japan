import test from "node:test";
import assert from "node:assert/strict";

import { isDesktopApp, isLocalMode } from "../src/ui.js";

test("isDesktopApp phát hiện Electron khi window.electronAPI.isElectron = true", () => {
  global.window = { electronAPI: { isElectron: true } };
  assert.equal(isDesktopApp(), true);
  assert.equal(isLocalMode(), true);
  delete global.window;
});

test("isDesktopApp phát hiện Tauri khi __TAURI_INTERNALS__ in window", () => {
  global.window = { __TAURI_INTERNALS__: {} };
  assert.equal(isDesktopApp(), true);
  assert.equal(isLocalMode(), true);
  delete global.window;
});

test("isLocalMode trả về true trên web khi người dùng chọn Dùng ngay chế độ Local", () => {
  const storage = new Map();
  global.window = {};
  global.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val))
  };

  assert.equal(isDesktopApp(), false);
  assert.equal(isLocalMode(), false);

  global.localStorage.setItem("nihongo_local_mode", "true");
  assert.equal(isLocalMode(), true);

  delete global.window;
  delete global.localStorage;
});
