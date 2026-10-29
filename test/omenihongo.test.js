import test from "node:test";
import assert from "node:assert/strict";

import {
  AI_KAIWA_PARTNERS,
  QUICK_KAIWA_PHRASES,
  setupOmeNihongoUI
} from "../src/omenihongo.js";

test("AI_KAIWA_PARTNERS: Danh sách bạn học Nhật Bản đa dạng vùng miền và cấp độ", () => {
  assert.ok(Array.isArray(AI_KAIWA_PARTNERS));
  assert.ok(AI_KAIWA_PARTNERS.length >= 4, "Có ít nhất 4 bạn học AI");

  const [sakura, kenji, yuto, aoi] = AI_KAIWA_PARTNERS;
  assert.equal(sakura.name, "Sakura Tanaka");
  assert.ok(sakura.city.includes("Tokyo"));
  assert.ok(sakura.greeting && sakura.greetingRomaji && sakura.greetingVi);

  assert.equal(kenji.name, "Kenji Sato");
  assert.ok(kenji.city.includes("Kyoto"));

  assert.equal(yuto.name, "Yuto Yamada");
  assert.ok(yuto.city.includes("Osaka"));

  assert.equal(aoi.name, "Aoi Suzuki");
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

test("setupOmeNihongoUI: Chạy an toàn và không gây lỗi khi khởi tạo", () => {
  global.document = {
    querySelectorAll: () => [],
    getElementById: () => null,
    activeElement: null
  };
  global.window = {
    addEventListener: () => {}
  };

  assert.doesNotThrow(() => {
    setupOmeNihongoUI("omenihongo");
  });
});
