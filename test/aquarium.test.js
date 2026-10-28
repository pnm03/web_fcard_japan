import test from "node:test";
import assert from "node:assert/strict";

import {
  FISH_SPECIES,
  AQUARIUM_DECORATIONS,
  AQUARIUM_FOOD_PACKAGES,
  HALL_OF_FAME_STUDENTS,
  loadAquariumData,
  saveAquariumData,
  addAquariumCoins,
  playSynthSound
} from "../src/aquarium.js";

// Thiết lập mock localStorage
function setupMockStorage() {
  const store = new Map();
  global.localStorage = {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
  global.document = {
    querySelectorAll: () => []
  };
}

test("FISH_SPECIES: Đầy đủ các giống cá Koi và cá Nhật Bản truyền thống", () => {
  assert.ok(FISH_SPECIES.koi_kohaku, "Có cá Koi Kohaku");
  assert.ok(FISH_SPECIES.koi_showa, "Có cá Koi Showa");
  assert.ok(FISH_SPECIES.fugu_mini, "Có cá nóc Fugu");
  assert.ok(FISH_SPECIES.ranchu_gold, "Có cá vàng Ranchu");
  assert.ok(FISH_SPECIES.golden_dragon_koi, "Có Koi Hoàng Gia Rồng Vàng");

  assert.equal(FISH_SPECIES.koi_kohaku.price, 0, "Kohaku tặng miễn phí ban đầu");
  assert.ok(FISH_SPECIES.golden_dragon_koi.price >= 300, "Rồng Vàng giá trị cao");
  assert.equal(FISH_SPECIES.fugu_mini.isPuffer, true, "Fugu có đặc tính phồng to");
});

test("AQUARIUM_DECORATIONS: Cảnh quan phong cách Zen Nhật Bản", () => {
  assert.ok(AQUARIUM_DECORATIONS.torii_gate, "Có cổng Torii");
  assert.ok(AQUARIUM_DECORATIONS.stone_lantern, "Có đèn đá Toro");
  assert.ok(AQUARIUM_DECORATIONS.sakura_petals, "Có cánh hoa anh đào");
  assert.ok(AQUARIUM_DECORATIONS.treasure_chest, "Có rương kho báu");
});

test("AQUARIUM_FOOD_PACKAGES: Cung cấp các gói thức ăn thường & sao vàng", () => {
  assert.ok(Array.isArray(AQUARIUM_FOOD_PACKAGES));
  assert.ok(AQUARIUM_FOOD_PACKAGES.length >= 3);
  const starPack = AQUARIUM_FOOD_PACKAGES.find(p => p.isStar);
  assert.ok(starPack, "Có gói mồi sao vàng VIP");
});

test("HALL_OF_FAME_STUDENTS: Vinh danh top 3 học viên chăm chỉ hàng tuần", () => {
  assert.equal(HALL_OF_FAME_STUDENTS.length, 3);
  const [first, second, third] = HALL_OF_FAME_STUDENTS;
  assert.ok(first.displayName && first.title);
  assert.ok(first.streak >= second.streak, "Top 1 có streak cao nhất");
  assert.ok(second.streak >= third.streak, "Top 2 có streak cao hơn Top 3");
});

test("loadAquariumData: Trả về dữ liệu mặc định chuẩn khi chưa có dữ liệu", () => {
  setupMockStorage();
  localStorage.clear();

  const data = loadAquariumData();
  assert.equal(data.coins, 150, "Tặng sẵn 150 Xu trải nghiệm");
  assert.equal(data.foodCount, 30, "Tặng sẵn 30 viên thức ăn");
  assert.equal(data.starFoodCount, 5, "Tặng 5 mồi sao vàng");
  assert.ok(data.ownedFish.length >= 1, "Có sẵn cá Koi Kohaku");
  assert.equal(data.ownedFish[0].speciesId, "koi_kohaku");
});

test("saveAquariumData & addAquariumCoins: Lưu trữ và cộng Xu chính xác", () => {
  setupMockStorage();
  localStorage.clear();

  const initialCoins = loadAquariumData().coins;
  const newCoins = addAquariumCoins(50);
  assert.equal(newCoins, initialCoins + 50);

  const reloaded = loadAquariumData();
  assert.equal(reloaded.coins, initialCoins + 50);
});

test("playSynthSound: Chạy an toàn không văng lỗi khi thiếu Web Audio API", () => {
  // Test môi trường Node.js không có AudioContext
  assert.doesNotThrow(() => {
    playSynthSound("bubble");
    playSynthSound("eat");
    playSynthSound("chime");
  });
});
