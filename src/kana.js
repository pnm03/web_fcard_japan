export const HIRAGANA_LIST = [
  { kana: "あ", romaji: "a" }, { kana: "い", romaji: "i" }, { kana: "う", romaji: "u" }, { kana: "え", romaji: "e" }, { kana: "お", romaji: "o" },
  { kana: "か", romaji: "ka" }, { kana: "き", romaji: "ki" }, { kana: "く", romaji: "ku" }, { kana: "け", romaji: "ke" }, { kana: "こ", romaji: "ko" },
  { kana: "さ", romaji: "sa" }, { kana: "し", romaji: "shi" }, { kana: "す", romaji: "su" }, { kana: "せ", romaji: "se" }, { kana: "そ", romaji: "so" },
  { kana: "た", romaji: "ta" }, { kana: "ち", romaji: "chi" }, { kana: "つ", romaji: "tsu" }, { kana: "て", romaji: "te" }, { kana: "と", romaji: "to" },
  { kana: "な", romaji: "na" }, { kana: "に", romaji: "ni" }, { kana: "ぬ", romaji: "nu" }, { kana: "ね", romaji: "ne" }, { kana: "の", romaji: "no" },
  { kana: "は", romaji: "ha" }, { kana: "ひ", romaji: "hi" }, { kana: "ふ", romaji: "fu" }, { kana: "へ", romaji: "he" }, { kana: "ほ", romaji: "ho" },
  { kana: "ま", romaji: "ma" }, { kana: "み", romaji: "mi" }, { kana: "む", romaji: "mu" }, { kana: "め", romaji: "me" }, { kana: "も", romaji: "mo" },
  { kana: "や", romaji: "ya" }, { kana: "ゆ", romaji: "yu" }, { kana: "よ", romaji: "yo" },
  { kana: "ら", romaji: "ra" }, { kana: "り", romaji: "ri" }, { kana: "る", romaji: "ru" }, { kana: "れ", romaji: "re" }, { kana: "ろ", romaji: "ro" },
  { kana: "わ", romaji: "wa" }, { kana: "を", romaji: "wo" }, { kana: "ん", romaji: "n" }
];

export const KATAKANA_LIST = [
  { kana: "ア", romaji: "a" }, { kana: "イ", romaji: "i" }, { kana: "ウ", romaji: "u" }, { kana: "エ", romaji: "e" }, { kana: "オ", romaji: "o" },
  { kana: "カ", romaji: "ka" }, { kana: "キ", romaji: "ki" }, { kana: "ク", romaji: "ku" }, { kana: "ケ", romaji: "ke" }, { kana: "コ", romaji: "ko" },
  { kana: "サ", romaji: "sa" }, { kana: "シ", romaji: "shi" }, { kana: "ス", romaji: "su" }, { kana: "セ", romaji: "se" }, { kana: "ソ", romaji: "so" },
  { kana: "タ", romaji: "ta" }, { kana: "チ", romaji: "chi" }, { kana: "ツ", romaji: "tsu" }, { kana: "テ", romaji: "te" }, { kana: "ト", romaji: "to" },
  { kana: "ナ", romaji: "na" }, { kana: "ニ", romaji: "ni" }, { kana: "ヌ", romaji: "nu" }, { kana: "ネ", romaji: "ne" }, { kana: "ノ", romaji: "no" },
  { kana: "ハ", romaji: "ha" }, { kana: "ヒ", romaji: "hi" }, { kana: "フ", romaji: "fu" }, { kana: "ヘ", romaji: "he" }, { kana: "ホ", romaji: "ho" },
  { kana: "マ", romaji: "ma" }, { kana: "ミ", romaji: "mi" }, { kana: "ム", romaji: "mu" }, { kana: "メ", romaji: "me" }, { kana: "モ", romaji: "mo" },
  { kana: "ヤ", romaji: "ya" }, { kana: "ユ", romaji: "yu" }, { kana: "ヨ", romaji: "yo" },
  { kana: "ラ", romaji: "ra" }, { kana: "リ", romaji: "ri" }, { kana: "ル", romaji: "ru" }, { kana: "レ", romaji: "re" }, { kana: "ロ", romaji: "ro" },
  { kana: "ワ", romaji: "wa" }, { kana: "ヲ", romaji: "wo" }, { kana: "ン", romaji: "n" }
];

// Hàm lấy danh sách distractors ngẫu nhiên
export function generateKanaDistractors(correctItem, fullList, count = 3) {
  const filtered = fullList.filter(item => item.romaji !== correctItem.romaji);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const STROKE_COUNTS = {
  // Hiragana
  "あ": 3, "い": 2, "う": 2, "え": 2, "お": 3,
  "か": 3, "き": 4, "く": 1, "け": 3, "こ": 2,
  "さ": 3, "し": 1, "す": 2, "せ": 3, "そ": 1,
  "た": 4, "ち": 2, "つ": 1, "て": 1, "と": 2,
  "な": 4, "に": 3, "ぬ": 2, "ね": 2, "の": 1,
  "la": 2, "ri": 2, "ru": 1, "re": 2, "ro": 1, 
  "は": 3, "ひ": 1, "ふ": 4, "へ": 1, "ほ": 4,
  "ま": 3, "mi": 2, "み": 2, "む": 3, "め": 2, "も": 3,
  "や": 3, "ゆ": 2, "よ": 2,
  "ら": 2, "り": 2, "る": 1, "れ": 2, "ろ": 1,
  "わ": 2, "を": 3, "ん": 1,
  // Katakana
  "ア": 2, "イ": 2, "ウ": 3, "エ": 3, "オ": 3,
  "カ": 2, "キ": 3, "ク": 2, "ケ": 3, "コ": 2,
  "サ": 3, "シ": 3, "ス": 2, "セ": 2, "ソ": 2,
  "タ": 3, "チ": 3, "ツ": 3, "テ": 3, "ト": 2,
  "ナ": 2, "ニ": 2, "ヌ": 2, "ネ": 4, "ノ": 1,
  "ハ": 2, "ヒ": 2, "フ": 1, "ヘ": 1, "ホ": 4,
  "マ": 2, "ミ": 3, "ム": 2, "メ": 2, "モ": 3,
  "ヤ": 2, "ユ": 2, "ヨ": 3,
  "ラ": 2, "リ": 2, "ル": 2, "レ": 1, "ロ": 3,
  "ワ": 2, "ヲ": 3, "ン": 2
};

const KANA_STROKE_DIRECTIONS = {
  "あ": [["R"], ["D", "DL"], ["D", "DR", "DL"]],
  "い": [["D", "DL"], ["D", "DL", "DR"]],
  "う": [["R", "DR", "DOT"], ["D", "DR", "DL"]],
  "え": [["R", "DR", "DOT"], ["R", "DR"]],
  "お": [["R"], ["D", "DR"], ["DR", "D", "DOT"]],
  "か": [["DR", "D", "R"], ["DL", "D"], ["DR", "D", "DOT"]],
  "き": [["R"], ["R"], ["DL", "D"], ["R", "DR"]],
  "く": [["DR", "D", "DL"]],
  "け": [["D", "DL"], ["R"], ["D", "DL", "DR"]],
  "こ": [["R", "DR"], ["R", "UR"]],
  "さ": [["R"], ["DL", "D"], ["R", "DR"]],
  "し": [["D", "DR"]],
  "す": [["R"], ["D", "DL", "DR"]],
  "せ": [["R"], ["D", "DL"], ["D", "DR"]],
  "そ": [["DR", "D", "R"]],
  "た": [["R"], ["DL", "D"], ["R", "DOT"], ["R", "DR", "DOT"]],
  "ち": [["R"], ["D", "DL", "DR"]],
  "つ": [["R", "DR", "D", "DL"]],
  "て": [["R", "DR", "D", "DL"]],
  "と": [["DL", "D", "DOT"], ["DR", "R"]],
  "な": [["R"], ["DL", "D"], ["DR", "D", "DOT"], ["D", "DR"]],
  "に": [["D", "DL"], ["R", "DOT"], ["R", "DR", "DOT"]],
  "ぬ": [["DR", "D"], ["D", "DL", "DR"]],
  "ね": [["D", "DL"], ["DR", "R", "D"]],
  "の": [["DR", "D", "R"]],
  "は": [["D", "DL"], ["R"], ["D", "DR"]],
  "ひ": [["R", "DR"]],
  "ふ": [["DR", "D", "DOT"], ["D", "DL"], ["DL", "D", "DOT"], ["DR", "D", "DOT"]],
  "へ": [["DR", "R"]],
  "ほ": [["D", "DL"], ["R"], ["R"], ["D", "DR"]],
  "ま": [["R"], ["R"], ["D", "DR"]],
  "み": [["R", "DR"], ["DL", "D"]],
  "む": [["R"], ["D", "DR"], ["DR", "D", "DOT"]],
  "め": [["DR", "D"], ["D", "DL", "DR"]],
  "も": [["D", "DR"], ["R"], ["R"]],
  "や": [["R", "DR", "D"], ["DL", "D", "DOT"], ["DL", "D"]],
  "ゆ": [["D", "DR", "R"], ["D", "DL"]],
  "よ": [["R"], ["D", "DR"]],
  "ら": [["R", "DR", "DOT"], ["DR", "D"]],
  "り": [["D", "DL"], ["D", "DL", "DR"]],
  "る": [["D", "DR"]],
  "れ": [["D", "DL"], ["DR", "R", "D"]],
  "ろ": [["D", "DR"]],
  "わ": [["D", "DL"], ["DR", "R", "D"]],
  "を": [["R"], ["DL", "D"], ["R", "DR"]],
  "ん": [["DR", "R", "D"]],
  "ア": [["R", "DR"], ["DL", "D"]],
  "イ": [["DL", "D"], ["D", "DL"]],
  "ウ": [["D", "DOT"], ["D", "DOT"], ["R", "DR", "DL"]],
  "エ": [["R"], ["D"], ["R"]],
  "オ": [["R"], ["D", "DL"], ["DL", "D"]],
  "カ": [["R", "DR", "DL"], ["DL", "D"]],
  "キ": [["R"], ["R"], ["DL", "D"]],
  "ク": [["DL", "D"], ["R", "DR", "DL"]],
  "ケ": [["DL", "D"], ["R"], ["DL", "D"]],
  "コ": [["R", "DR", "D"], ["R"]],
  "サ": [["R"], ["D", "DL"], ["D", "DL", "DR"]],
  "シ": [["R", "DR", "DOT"], ["R", "DR", "DOT"], ["UR", "R"]],
  "ス": [["R", "DR", "DL"], ["DR", "D"]],
  "セ": [["R", "DR", "D"], ["D", "DR", "R"]],
  "ソ": [["DR", "D", "DOT"], ["DL", "D"]],
  "タ": [["DL", "D"], ["R", "DR", "DL"], ["R"]],
  "チ": [["DL", "D"], ["R"], ["DL", "D"]],
  "ツ": [["DR", "D", "DOT"], ["DR", "D", "DOT"], ["DL", "D"]],
  "テ": [["R"], ["R"], ["DL", "D"]],
  "ト": [["D"], ["DR", "R"]],
  "ナ": [["R"], ["DL", "D"]],
  "ニ": [["R"], ["R"]],
  "ヌ": [["DL", "DR", "D"], ["DR", "D"]],
  "ネ": [["D", "DOT"], ["R", "DR", "DL"], ["D"], ["DR", "D"]],
  "ノ": [["DL", "D"]],
  "ハ": [["DL", "D"], ["DR", "D"]],
  "ヒ": [["R"], ["D", "DR", "R"]],
  "フ": [["R", "DR", "DL"]],
  "ヘ": [["DR", "R"]],
  "ホ": [["R"], ["D"], ["DL", "D"], ["DR", "D"]],
  "マ": [["R", "DR", "DL"], ["DR", "R"]],
  "ミ": [["DR", "D"], ["DR", "D"], ["DR", "D"]],
  "ム": [["DL", "R"], ["DR", "D"]],
  "メ": [["DL", "D"], ["DR", "D"]],
  "モ": [["R"], ["R"], ["D", "DR", "R"]],
  "ヤ": [["R", "DR", "DL"], ["D", "DL"]],
  "ユ": [["R", "DR", "D"], ["R"]],
  "ヨ": [["R", "DR", "D"], ["R"], ["R"]],
  "ラ": [["R"], ["D", "DR", "R"]],
  "リ": [["D"], ["D", "DL", "DR"]],
  "ル": [["D", "DL"], ["D", "DR", "R"]],
  "レ": [["D", "DR", "R"]],
  "ロ": [["D"], ["R", "DR", "D"], ["R"]],
  "ワ": [["D"], ["R", "DR", "DL"]],
  "ヲ": [["R"], ["R"], ["DL", "D"]],
  "ン": [["DR", "D", "DOT"], ["UR", "R"]]
};

function getValidUserStrokes(userStrokes) {
  if (!userStrokes) return [];
  return userStrokes.filter(stroke => {
    if (stroke.length < 2) return false;
    const start = stroke[0];
    const end = stroke[stroke.length - 1];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let pathLen = 0;
    for (let i = 1; i < stroke.length; i++) {
      const p1 = stroke[i - 1];
      const p2 = stroke[i];
      pathLen += Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }
    return dist >= 8 || pathLen >= 12;
  });
}

function getStrokeDirection(points) {
  if (!points || points.length < 2) return "DOT";
  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 12) return "DOT";
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  if (angle >= -22.5 && angle < 22.5) return "R";
  if (angle >= 22.5 && angle < 67.5) return "DR";
  if (angle >= 67.5 && angle < 112.5) return "D";
  if (angle >= 112.5 && angle < 157.5) return "DL";
  if (angle >= 157.5 || angle < -157.5) return "L";
  if (angle >= -157.5 && angle < -112.5) return "UL";
  if (angle >= -112.5 && angle < -67.5) return "U";
  if (angle >= -67.5 && angle < -22.5) return "UR";
  return "R";
}

export function evaluateDrawing(userCanvas, targetChar, userStrokeCount = 0, userStrokes = [], fontName = "Noto Sans JP") {
  const size = userCanvas.width;
  const validStrokes = getValidUserStrokes(userStrokes);
  const actualStrokeCount = validStrokes.length > 0 ? validStrokes.length : userStrokeCount;
  const templateCanvas = document.createElement("canvas");
  templateCanvas.width = size;
  templateCanvas.height = size;
  const tCtx = templateCanvas.getContext("2d");
  tCtx.fillStyle = "black";
  tCtx.strokeStyle = "black";
  tCtx.lineWidth = 14;
  tCtx.lineCap = "round";
  tCtx.lineJoin = "round";
  tCtx.font = `bold 140px ${fontName}`;
  tCtx.textAlign = "center";
  tCtx.textBaseline = "middle";
  tCtx.fillText(targetChar, size / 2, size / 2);
  tCtx.strokeText(targetChar, size / 2, size / 2);
  const uCtx = userCanvas.getContext("2d");
  const userData = uCtx.getImageData(0, 0, size, size).data;
  const templateData = tCtx.getImageData(0, 0, size, size).data;
  let minX = size, maxX = 0, minY = size, maxY = 0;
  let totalUserPixels = 0;
  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      const idx = (y * size + x) * 4;
      if (userData[idx + 3] > 20) {
        totalUserPixels++;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (totalUserPixels === 0) return { score: 0, text: "Bạn chưa vẽ nét nào!" };
  let tMinX = size, tMaxX = 0, tMinY = size, tMaxY = 0;
  let totalTemplatePixels = 0;
  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      const idx = (y * size + x) * 4;
      if (templateData[idx + 3] > 20) {
        totalTemplatePixels++;
        if (x < tMinX) tMinX = x; if (x > tMaxX) tMaxX = x;
        if (y < tMinY) tMinY = y; if (y > tMaxY) tMaxY = y;
      }
    }
  }
  if (totalTemplatePixels === 0) return { score: 0, text: "Lỗi tải chữ mẫu hệ thống!" };
  const userCenterX = (minX + maxX) / 2;
  const userCenterY = (minY + maxY) / 2;
  const templateCenterX = (tMinX + tMaxX) / 2;
  const templateCenterY = (tMinY + tMaxY) / 2;
  const maxShift = 45;
  const shiftX = Math.max(-maxShift, Math.min(maxShift, Math.round(templateCenterX - userCenterX)));
  const shiftY = Math.max(-maxShift, Math.min(maxShift, Math.round(templateCenterY - userCenterY)));
  const gridSize = 10;
  const cellSize = size / gridSize;
  const templateGrid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
  const userGrid = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      const idx = (y * size + x) * 4;
      if (templateData[idx + 3] > 20) {
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) templateGrid[row][col]++;
      }
    }
  }
  let matchPixels = 0, strayPixels = 0;
  for (let y = 0; y < size; y += 3) {
    for (let x = 0; x < size; x += 3) {
      const idx = (y * size + x) * 4;
      if (userData[idx + 3] <= 20) continue;
      const tx = x + shiftX, ty = y + shiftY;
      let hasTemplate = false;
      if (tx >= 0 && tx < size && ty >= 0 && ty < size) {
        hasTemplate = templateData[(ty * size + tx) * 4 + 3] > 20;
        const col = Math.floor(tx / cellSize), row = Math.floor(ty / cellSize);
        if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) userGrid[row][col]++;
      }
      if (hasTemplate) matchPixels++; else strayPixels++;
    }
  }
  const missPixels = Math.max(0, totalTemplatePixels - matchPixels);
  let activeTemplateCells = 0, coveredCells = 0;
  const pixelThreshold = 3;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (templateGrid[r][c] >= pixelThreshold) {
        activeTemplateCells++;
        if (userGrid[r][c] >= 1) coveredCells++;
      }
    }
  }
  let coverageRate = activeTemplateCells > 0 ? coveredCells / activeTemplateCells : 1.0;
  const precision = matchPixels / (matchPixels + strayPixels);
  const recall = matchPixels / (matchPixels + missPixels);
  const targetRecall = Math.min(1.0, recall * 3.2);
  let f1Score = (precision + targetRecall > 0) ? (2 * precision * targetRecall) / (precision + targetRecall) : 0;
  let percentage = Math.round(f1Score * 100);
  percentage = Math.round(percentage * Math.pow(coverageRate, 2.2));
  const expectedStrokeCount = STROKE_COUNTS[targetChar] || 0;
  let strokePenalty = 1.0, strokeRemark = "";
  if (actualStrokeCount > 0 && expectedStrokeCount > 0) {
    const diff = Math.abs(actualStrokeCount - expectedStrokeCount);
    if (diff > 0) {
      if (actualStrokeCount < expectedStrokeCount) {
        strokePenalty = Math.pow(actualStrokeCount / expectedStrokeCount, 1.8);
        strokeRemark = ` (Thiếu nét: ${actualStrokeCount}/${expectedStrokeCount})`;
      } else {
        strokePenalty = Math.pow(expectedStrokeCount / actualStrokeCount, 0.7);
        strokeRemark = ` (Nét rời rạc/thừa: ${actualStrokeCount}/${expectedStrokeCount})`;
      }
    }
  }
  percentage = Math.round(percentage * strokePenalty);
  
  // 12. Phạt nếu vẽ sai hướng nét hoặc sai thứ tự vẽ
  const expectedDirs = KANA_STROKE_DIRECTIONS[targetChar];
  let directionPenalty = 1.0;
  let directionRemark = "";
  
  if (expectedDirs && validStrokes.length > 0) {
    const userDirs = validStrokes.map(stroke => getStrokeDirection(stroke));
    const expectedCount = expectedDirs.length;
    const actualCount = userDirs.length;
    
    // Khớp hướng linh hoạt (không phụ thuộc thứ tự)
    let flexMatched = 0;
    const usedUserIdx = new Set();
    for (let i = 0; i < expectedCount; i++) {
      const allowed = expectedDirs[i];
      for (let j = 0; j < actualCount; j++) {
        if (usedUserIdx.has(j)) continue;
        const userDir = userDirs[j];
        if (allowed.includes(userDir) || allowed.includes("ANY")) {
          flexMatched++;
          usedUserIdx.add(j);
          break;
        }
      }
    }
    
    // Khớp hướng chính xác theo thứ tự viết nét chuẩn
    let orderMatched = 0;
    for (let i = 0; i < Math.min(expectedCount, actualCount); i++) {
      const allowed = expectedDirs[i];
      const userDir = userDirs[i];
      if (allowed.includes(userDir) || allowed.includes("ANY")) {
        orderMatched++;
      }
    }
    
    // Tính tỉ lệ phạt hướng
    const dirMatchRate = flexMatched / expectedCount;
    directionPenalty = Math.pow(dirMatchRate, 1.5);
    
    if (flexMatched < expectedCount) {
      directionRemark = ` (Nét vẽ sai hướng)`;
    } else if (orderMatched < expectedCount) {
      // Đúng hết nét nhưng sai thứ tự viết nét -> phạt nhẹ 10% để giáo khoa
      directionPenalty *= 0.9;
      directionRemark = ` (Viết sai thứ tự nét)`;
    }
  }
  percentage = Math.round(percentage * directionPenalty);
  
  // 13. Nhận xét dựa trên số điểm cuối cùng
  let remark = "";
  if (percentage >= 80) {
    remark = "Tuyệt vời! Nét vẽ cực kỳ chính xác và đầy đủ.";
  } else if (percentage >= 60) {
    remark = "Rất tốt. Nét vẽ chuẩn và tương đối cân đối.";
  } else if (percentage >= 40) {
    remark = "Vẽ hơi thiếu nét hoặc lệch nhiều ở các góc.";
  } else if (percentage >= 20) {
    remark = "Chưa chính xác. Thiếu các nét hoặc hướng đi quan trọng.";
  } else {
    remark = "Sai nét hoặc vẽ nguệch ngoạc quá nhiều!";
  }
  
  // Ghép các ghi chú phạt
  const penaltyRemarks = [strokeRemark, directionRemark].filter(Boolean).join(",");
  if (penaltyRemarks && percentage < 80) {
    remark += ` [Lưu ý:${penaltyRemarks.replace(/\s*[()]\s*/g, " ").trim()}]`;
  }
  
  return {
    score: percentage,
    text: remark,
    matchRate: Math.round((matchPixels / totalTemplatePixels) * 100),
    strayRate: Math.round((strayPixels / totalUserPixels) * 100)
  };
}
