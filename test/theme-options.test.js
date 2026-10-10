import test from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_THEMES, normalizeAccountTheme } from "../src/account.js";

test("ACCOUNT_THEMES chứa đầy đủ giao diện duolingo và black-white", () => {
  const duolingo = ACCOUNT_THEMES.find(t => t.id === "duolingo");
  const blackWhite = ACCOUNT_THEMES.find(t => t.id === "black-white");

  assert.ok(duolingo, "Giao diện duolingo phải tồn tại trong ACCOUNT_THEMES");
  assert.equal(duolingo.name, "Duolingo");
  assert.ok(duolingo.colors.includes("#58cc02"), "Duolingo theme phải có màu xanh #58cc02");

  assert.ok(blackWhite, "Giao diện black-white phải tồn tại trong ACCOUNT_THEMES");
  assert.equal(blackWhite.name, "Đen Trắng");
  assert.ok(blackWhite.colors.includes("#000000"), "Black-White theme phải có màu #000000");
});

test("normalizeAccountTheme chuẩn hóa chính xác duolingo và black-white", () => {
  assert.equal(normalizeAccountTheme("duolingo"), "duolingo");
  assert.equal(normalizeAccountTheme("black-white"), "black-white");
  assert.equal(normalizeAccountTheme("paper"), "paper");
  assert.equal(normalizeAccountTheme("invalid-theme"), "paper");
});
