import test from "node:test";
import assert from "node:assert/strict";

import {
  AI_KAIWA_SENSEIS,
  QUICK_KAIWA_PHRASES,
  OmeNihongoManager,
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
    querySelector: () => null,
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

test("OmeNihongoManager: Quản lý mã phòng, link mời và trạng thái media", () => {
  global.document = {
    querySelectorAll: () => [],
    getElementById: () => null,
    querySelector: () => null,
    activeElement: null
  };
  global.window = {
    addEventListener: () => {},
    location: { href: "https://web-fcard-japan.vercel.app/explore", origin: "https://web-fcard-japan.vercel.app", pathname: "/explore" }
  };

  const mgr = new OmeNihongoManager();

  // 1. Mã phòng riêng có định dạng chuẩn KAIWA_...
  const roomCode = mgr.getMyRoomCode();
  assert.ok(typeof roomCode === "string");
  assert.ok(roomCode.startsWith("KAIWA_"), "Mã phòng bắt đầu bằng KAIWA_");
  assert.equal(mgr.getMyRoomCode(), roomCode, "Mã phòng được giữ cố định theo phiên");

  // 2. Link mời phòng chuẩn xác, không bị lặp /explore#/explore
  const inviteUrl = mgr.getRoomInviteUrl();
  assert.ok(!inviteUrl.includes("/explore#/explore"), "Không có đường dẫn kép /explore#/explore");
  assert.ok(inviteUrl.includes(`https://web-fcard-japan.vercel.app/explore?room=${roomCode}`), "Link mời chuẩn định dạng");

  // 3. Tự động bóc tách mã phòng khi người dùng dán URL đầy đủ
  mgr.joinDirectRoom(`https://web-fcard-japan.vercel.app/explore?room=KAIWA_TEST123`);
  assert.equal(mgr.currentRoom, "KAIWA_TEST123", "Bóc tách chính xác room parameter từ URL");

  // 4. Nhận và cập nhật trạng thái camera / mic của đối phương
  mgr.handleRemoteMediaState({ camOff: true, micMuted: true });
  assert.equal(mgr.remoteCamOff, true, "Ghi nhận đối phương tắt camera");
  assert.equal(mgr.remoteMicMuted, true, "Ghi nhận đối phương tắt mic");

  mgr.handleRemoteMediaState({ camOff: false, micMuted: false });
  assert.equal(mgr.remoteCamOff, false, "Ghi nhận đối phương bật lại camera");
  assert.equal(mgr.remoteMicMuted, false, "Ghi nhận đối phương bật lại mic");

  mgr.stopCall();
});
