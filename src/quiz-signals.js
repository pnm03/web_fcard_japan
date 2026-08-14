function normalizeRomajiAnswer(value) {
  return String(value || "")
    .normalize("NFKC")
    .toLowerCase()
    .replaceAll("ā", "aa")
    .replaceAll("ī", "ii")
    .replaceAll("ū", "uu")
    .replaceAll("ē", "ei")
    .replaceAll("ō", "ou")
    .replace(/[^a-z0-9]/g, "");
}

function getLevenshteinDistance(left, right) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitutionCost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
      current[rightIndex] = Math.min(current[rightIndex - 1] + 1, previous[rightIndex] + 1, previous[rightIndex - 1] + substitutionCost);
    }
    previous = current;
  }
  return previous[right.length];
}

function canonicalRomaji(value) {
  return normalizeRomajiAnswer(value)
    .replace(/shi/g, "si")
    .replace(/chi/g, "ti")
    .replace(/tsu/g, "tu")
    .replace(/fu/g, "hu")
    .replace(/ji/g, "zi")
    .replace(/([aeiou])\1/g, "$1")
    .replace(/ou/g, "o");
}

export function getRomajiAnswerMatch(userAnswer, correctAnswer) {
  const user = normalizeRomajiAnswer(userAnswer);
  const correct = normalizeRomajiAnswer(correctAnswer);
  if (!user || !correct) return "wrong";
  if (user === correct) return "correct";
  if (canonicalRomaji(user) === canonicalRomaji(correct)) return "variant";
  return correct.length >= 5 && getLevenshteinDistance(user, correct) <= 1 ? "near" : "wrong";
}

function seedVocab(seed) {
  return seed?.vocab || seed;
}

function seedMode(seed, modes, fallbackMode, index) {
  if (seed?.forcedMode) return seed.forcedMode;
  if (fallbackMode !== "mixed") return fallbackMode;
  return modes[index % Math.max(1, modes.length)] || "meaning_to_romaji";
}

function relatedSeed(left, right) {
  const a = seedVocab(left);
  const b = seedVocab(right);
  if (!a || !b) return false;
  if (a.id === b.id) return true;
  if (a.projectId !== b.projectId) return false;
  return Math.abs(Number(a.orderIndex) - Number(b.orderIndex)) <= 1;
}

export function interleaveQuestionSeeds(seeds, modes = [], fallbackMode = "mixed") {
  const remaining = [...seeds];
  const output = [];
  while (remaining.length) {
    const previous = output.at(-1);
    const previousMode = previous ? seedMode(previous, modes, fallbackMode, output.length - 1) : "";
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    remaining.forEach((seed, index) => {
      const mode = seedMode(seed, modes, fallbackMode, output.length);
      let score = index * 0.01;
      if (previous && seedVocab(seed)?.id === seedVocab(previous)?.id) score += 100;
      else if (previous && relatedSeed(seed, previous)) score += 20;
      if (previousMode && mode === previousMode) score += 8;
      const confusionIds = new Set(seedVocab(previous)?.rescueCard?.confusionPairIds || []);
      if (previous && confusionIds.has(seedVocab(seed)?.id)) score -= 5;
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    output.push(remaining.splice(bestIndex, 1)[0]);
  }
  return output.map((seed, index) => fallbackMode !== "mixed" || seed?.forcedMode
    ? seed
    : { vocab: seedVocab(seed), forcedMode: seedMode(seed, modes, fallbackMode, index) });
}
