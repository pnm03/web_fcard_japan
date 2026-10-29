import test from "node:test";
import assert from "node:assert/strict";

import { isDesktopApp, isLocalMode, hasStoredAuthToken } from "../src/ui.js";

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

test("hasStoredAuthToken phát hiện token Supabase trong localStorage để chống chớp nháy login", () => {
  const storage = new Map();
  global.window = {};
  global.localStorage = {
    length: 0,
    key: (i) => Array.from(storage.keys())[i] || null,
    getItem: (key) => storage.get(key) || null,
    setItem: (key, val) => {
      storage.set(key, String(val));
      global.localStorage.length = storage.size;
    }
  };

  assert.equal(hasStoredAuthToken(), false);

  global.localStorage.setItem("sb-project-auth-token", JSON.stringify({ access_token: "mock_jwt_token", user: { id: "123" } }));
  assert.equal(hasStoredAuthToken(), true);

  delete global.window;
  delete global.localStorage;
});
