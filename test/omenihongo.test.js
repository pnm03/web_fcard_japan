import test from "node:test";
import assert from "node:assert/strict";

import {
  AI_KAIWA_SENSEIS,
  QUICK_KAIWA_PHRASES,
  setupOmeNihongoUI
} from "../src/omenihongo.js";

test("AI_KAIWA_SENSEIS: Danh sách Sensei AI minh bạch, rõ ràng cho luyện Kaiwa", () => {
  assert.ok(Array.isArray(AI_KAIWA_SENSEIS));
  assert.ok(AI_KAIWA_SENSEIS.length >= 4, "Có ít nhất 4 Sensei AI");

  const [sakura, kenji, yuto, aoi] = AI_KAIWA_SENSEIS;
  assert.ok(sakura.name.includes("Sakura"));
  assert.ok(sakura.city.includes("Tokyo"));
  assert.ok(sakura.greeting && sakura.greetingRomaji && sakura.greetingVi);

  assert.ok(kenji.name.includes("Kenji"));
  assert.ok(kenji.city.includes("Kyoto"));

  assert.ok(yuto.name.includes("Yuto"));
  assert.ok(yuto.city.includes("Osaka"));

  assert.ok(aoi.name.includes("Aoi"));
  assert.ok(aoi.city.includes("Yokohama"));
});

test("QUICK_KAIWA_PHRASES: Bộ mẫu câu phản xạ nhanh đầy đủ Romaji và nghĩa tiếng Việt", () => {
  assert.ok(Array.isArray(QUICK_KAIWA_PHRASES));
  assert.ok(QUICK_KAIWA_PHRASES.length >= 5);

  QUICK_KAIWA_PHRASES.forEach(phrase => {
    assert.ok(phrase.ja, "Có tiếng Nhật");
    assert.ok(phrase.romaji, "Có phiên âm Romaji");
    assert.ok(phrase.vi, "Có dịch nghĩa tiếng Việt");
  });
});

test("setupOmeNihongoUI: Chạy an toàn và không gây lỗi khi khởi tạo trong môi trường mock", () => {
  global.document = {
    querySelectorAll: () => [],
    getElementById: () => null,
    activeElement: null
  };
  global.window = {
    addEventListener: () => {},
    location: { href: "http://localhost:5173/#/explore", origin: "http://localhost:5173", pathname: "/" }
  };

  assert.doesNotThrow(() => {
    setupOmeNihongoUI("omenihongo");
  });
});
