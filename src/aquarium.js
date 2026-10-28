/**
 * ============================================================================
 * MIW ZEN AQUARIUM & MMO SHARED POND
 * Bể cá Thủy sinh tương tác, Nuôi cá Koi Nhật Bản, Hồ cá Cộng đồng MMO & Shop
 * ============================================================================
 */

import { getAttendanceStats } from "./storage.js";

// Khóa lưu trữ dữ liệu Bể cá
const AQUARIUM_STORAGE_KEY = "miw_aquarium_profile_v1";

// Cấu hình các loài cá Nhật Bản trong Shop
export const FISH_SPECIES = {
  koi_kohaku: {
    id: "koi_kohaku",
    name: "Cá Koi Kohaku",
    japanese: "紅白 (Kohaku)",
    desc: "Thân trắng tuyết, khoang đỏ son truyền thống của Nhật Bản. Biểu tượng của may mắn & bình an.",
    price: 0, // Miễn phí ban đầu
    unlocked: true,
    rarity: "Phổ biến",
    rarityColor: "#0284c7",
    colorBase: "#ffffff",
    colorPattern: "#dc2626",
    colorFin: "rgba(255, 255, 255, 0.75)",
    baseSpeed: 1.2,
    size: 38
  },
  koi_showa: {
    id: "koi_showa",
    name: "Cá Koi Showa",
    japanese: "昭和三色 (Showa)",
    desc: "Thân đen tuyền mạnh mẽ kết hợp khoang đỏ son và trắng ngọc. Biểu tượng của ý chí kiên định.",
    price: 80,
    rarity: "Hiếm",
    rarityColor: "#7c3aed",
    colorBase: "#18181b",
    colorPattern: "#ea580c",
    colorSubPattern: "#f4f4f5",
    colorFin: "rgba(244, 244, 245, 0.65)",
    baseSpeed: 1.4,
    size: 40
  },
  fugu_mini: {
    id: "fugu_mini",
    name: "Cá Nóc Fugu",
    japanese: "河豚 (Fugu)",
    desc: "Cá nóc tí hon tròn xoe. Thỉnh thoảng giật mình phồng to gai nhím cực kỳ đáng yêu.",
    price: 120,
    rarity: "Độc lạ",
    rarityColor: "#f59e0b",
    colorBase: "#fde047",
    colorPattern: "#ca8a04",
    colorFin: "rgba(254, 240, 138, 0.8)",
    baseSpeed: 0.9,
    size: 30,
    isPuffer: true
  },
  ranchu_gold: {
    id: "ranchu_gold",
    name: "Cá Vàng Ranchu",
    japanese: "蘭鋳 (Ranchu)",
    desc: "Vua cá vàng Nhật Bản với đầu lân mập mạp, không vây lưng, bơi lắc lư duyên dáng.",
    price: 160,
    rarity: "Quý tộc",
    rarityColor: "#ea580c",
    colorBase: "#f97316",
    colorPattern: "#fdba74",
    colorFin: "rgba(254, 215, 170, 0.75)",
    baseSpeed: 0.8,
    size: 34,
    isChubby: true
  },
  golden_dragon_koi: {
    id: "golden_dragon_koi",
    name: "Koi Hoàng Gia Rồng Vàng",
    japanese: "金龍 (Kinryu)",
    desc: "Cá Koi huyền thoại dát vàng lấp lánh, phát quang ánh kim ngũ sắc khi bơi lội.",
    price: 300,
    rarity: "Thần thoại",
    rarityColor: "#eab308",
    colorBase: "#fef08a",
    colorPattern: "#eab308",
    colorFin: "rgba(254, 240, 138, 0.85)",
    baseSpeed: 1.6,
    size: 46,
    hasAura: true
  }
};

// Cấu hình vật phẩm Cảnh quan & Trang trí hồ
export const AQUARIUM_DECORATIONS = {
  torii_gate: {
    id: "torii_gate",
    name: "Cổng Torii Thủy Sinh",
    japanese: "鳥居 (Torii)",
    desc: "Cổng đền Thần đạo Nhật Bản chìm dưới làn nước trong xanh, mang lại vượng khí.",
    price: 90,
    icon: "⛩️"
  },
  stone_lantern: {
    id: "stone_lantern",
    name: "Đèn Đá Tōrō Rêu Phong",
    japanese: "灯籠 (Tōrō)",
    desc: "Đèn lồng đá cổ truyền thống phủ rêu xanh tự nhiên ở đáy hồ.",
    price: 60,
    icon: "🏮"
  },
  sakura_petals: {
    id: "sakura_petals",
    name: "Cánh Hoa Anh Đào Trôi",
    japanese: "桜 (Sakura)",
    desc: "Những cánh hoa anh đào hồng phấn nhẹ nhàng trôi bồng bềnh trên mặt nước.",
    price: 40,
    icon: "🌸"
  },
  treasure_chest: {
    id: "treasure_chest",
    name: "Hòm Kho Báu Chìm",
    japanese: "宝箱 (Takarabako)",
    desc: "Hòm châu báu cổ chìm nhả từng chùm bong bóng oxy lấp lánh.",
    price: 110,
    icon: "💎"
  }
};

// Cấu hình các gói Thức ăn trong Shop
export const AQUARIUM_FOOD_PACKAGES = [
  {
    id: "food_pack_20",
    name: "Gói 20 Hạt Thức Ăn Thường",
    desc: "Hạt chìm giàu đạm rong biển, kích thích cá bơi lội năng động.",
    price: 15,
    count: 20,
    isStar: false,
    icon: "🍱"
  },
  {
    id: "food_pack_50",
    name: "Gói 50 Hạt Thức Ăn Thường",
    desc: "Tiết kiệm 20% Xu, đủ nuôi đàn cá Koi suốt cả tuần.",
    price: 30,
    count: 50,
    isStar: false,
    icon: "🍱"
  },
  {
    id: "food_pack_star_10",
    name: "Gói 10 Mồi Sao Vàng VIP",
    desc: "Mồi phát quang lấp lánh giúp cá lớn nhanh và phát tỏa ánh hào quang rực rỡ.",
    price: 25,
    count: 10,
    isStar: true,
    icon: "⭐"
  }
];

// Cấu hình Bảng Vinh Danh Top Học Viên Nuôi Cá Tuần Này
export const HALL_OF_FAME_STUDENTS = [
  {
    id: "hof_1",
    displayName: "Yamato H.",
    email: "yamato.jp@study.io",
    title: "👑 Thủy Tộc Vương N5",
    streak: 62,
    words: 520,
    avatar: "🐉",
    fishCount: 7,
    likes: 184,
    featuredFish: "golden_dragon_koi",
    quote: "毎日少しずつ、千里の道も一歩から！",
    pondDecor: ["torii_gate", "stone_lantern", "sakura_petals"]
  },
  {
    id: "hof_2",
    displayName: "Sakura Lan",
    email: "lan.sakura@nihongo.vn",
    title: "💎 Bậc Thầy Nuôi Koi",
    streak: 45,
    words: 410,
    avatar: "🌸",
    fishCount: 5,
    likes: 142,
    featuredFish: "koi_showa",
    quote: "Học từ vựng cùng đàn cá bơi lội thư giãn cực kỳ!",
    pondDecor: ["torii_gate", "sakura_petals"]
  },
  {
    id: "hof_3",
    displayName: "Kenji Hoàng",
    email: "kenji.it@fpt.edu.vn",
    title: "⚡ Thợ Lặn Huyền Thoại",
    streak: 38,
    words: 365,
    avatar: "🥋",
    fishCount: 4,
    likes: 98,
    featuredFish: "ranchu_gold",
    quote: "Đã chinh phục hết Ngữ pháp Bài 1 N5!",
    pondDecor: ["stone_lantern", "treasure_chest"]
  }
];

// Danh sách cá mẫu bơi trong Hồ Cá Cộng Đồng MMO
const MMO_PEER_FISH_TEMPLATES = [
  { owner: "Yamato H.", streak: 62, speciesId: "golden_dragon_koi", title: "Thủy Tộc Vương", aura: true },
  { owner: "Sakura Lan", streak: 45, speciesId: "koi_showa", title: "Bậc Thầy Nuôi Koi", aura: true },
  { owner: "Kenji Hoàng", streak: 38, speciesId: "ranchu_gold", title: "Chiến Binh N5", aura: false },
  { owner: "Minh Thu", streak: 21, speciesId: "koi_kohaku", title: "Tân Binh Chăm Chỉ", aura: false },
  { owner: "Đức Huy", streak: 15, speciesId: "fugu_mini", title: "Cá Nóc Tinh Nghịch", aura: false },
  { owner: "Hải Sensei", streak: 89, speciesId: "golden_dragon_koi", title: "Giáo Viên Tiếng Nhật", aura: true },
  { owner: "Thanh Trúc", streak: 12, speciesId: "koi_kohaku", title: "Minna Nihongo", aura: false }
];

// Trạng thái Bể cá mặc định
function createDefaultAquariumData() {
  return {
    coins: 150, // Xu ban đầu tặng học viên trải nghiệm
    foodCount: 30, // Hạt thức ăn thường
    starFoodCount: 5, // Mồi VIP sao vàng
    ownedFish: [
      {
        uid: "fish_default_kohaku",
        speciesId: "koi_kohaku",
        customName: "Kohaku Yêu Dấu",
        hunger: 80, // 0 - 100
        sizeMultiplier: 1.0,
        fedCount: 0
      }
    ],
    ownedDecorations: ["torii_gate"],
    likesReceived: 14,
    feedsReceived: 6,
    cheerMessages: [
      { from: "Sakura Lan", text: "頑張ってね！ Bể cá xinh quá!", time: "Hôm nay" }
    ],
    lastFedAt: Date.now()
  };
}

export function loadAquariumData() {
  try {
    const raw = localStorage.getItem(AQUARIUM_STORAGE_KEY);
    if (!raw) return createDefaultAquariumData();
    const data = JSON.parse(raw);
    return {
      ...createDefaultAquariumData(),
      ...data,
      coins: Math.max(0, Number(data.coins) || 0),
      foodCount: Math.max(0, Number(data.foodCount) || 0),
      starFoodCount: Math.max(0, Number(data.starFoodCount) || 0),
      ownedFish: Array.isArray(data.ownedFish) && data.ownedFish.length > 0 ? data.ownedFish : createDefaultAquariumData().ownedFish,
      ownedDecorations: Array.isArray(data.ownedDecorations) ? data.ownedDecorations : ["torii_gate"]
    };
  } catch (e) {
    console.warn("Lỗi đọc dữ liệu aquarium:", e);
    return createDefaultAquariumData();
  }
}

export function saveAquariumData(data) {
  try {
    localStorage.setItem(AQUARIUM_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Lỗi lưu dữ liệu aquarium:", e);
  }
}

export function addAquariumCoins(amount) {
  const data = loadAquariumData();
  data.coins += Math.max(0, amount);
  saveAquariumData(data);
  updateAquariumCoinDisplays(data.coins);
  return data.coins;
}

// Bộ tạo âm thanh tổng hợp siêu nhẹ (Web Audio API - 0 byte file audio)
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx && typeof window !== "undefined") {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  return audioCtx;
}

export function playSynthSound(type = "bubble") {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    if (type === "bubble") {
      // Bong bóng nước pop vui tai
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.1);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "eat") {
      // Âm thanh đớp mồi chóp chép
      osc.type = "triangle";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "chime") {
      // Âm thanh nhận thưởng / level-up lấp lánh
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }
  } catch (e) {
    // Không làm gián đoạn nếu trình duyệt chặn autoplay
  }
}

// ============================================================================
// SIMULATION ENGINE: CANVAS 2D PHYSICS & VECTOR KOI RENDERING
// ============================================================================

export class AquariumEngine {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.options = {
      isMmoPond: false,
      isVisiting: false,
      visitData: null,
      onCoinsUpdate: null,
      ...options
    };

    this.width = canvas.width || 800;
    this.height = canvas.height || 360;
    this.fishList = [];
    this.foodPellets = [];
    this.bubbles = [];
    this.floatingTexts = [];
    this.particles = [];
    this.animationFrameId = null;
    this.lastTime = performance.now();
    this.isRunning = false;
    this.mousePos = { x: -999, y: -999 };
    this.hoveredFish = null;

    this.initSize();
    this.initEntities();
    this.bindEvents();
  }

  initSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(300, rect.width || 800);
    this.height = Math.max(220, rect.height || 360);

    this.canvas.width = Math.floor(this.width * dpr);
    this.canvas.height = Math.floor(this.height * dpr);
    this.ctx.scale(dpr, dpr);
  }

  initEntities() {
    this.fishList = [];
    this.foodPellets = [];
    this.bubbles = [];
    this.floatingTexts = [];
    this.particles = [];

    // Khởi tạo bong bóng ngẫu nhiên
    for (let i = 0; i < 22; i++) {
      this.bubbles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: 2 + Math.random() * 4,
        speed: 0.6 + Math.random() * 1.2,
        wobbleSpeed: 1 + Math.random() * 2,
        wobbleAmp: 1 + Math.random() * 2,
        seed: Math.random() * 100
      });
    }

    if (this.options.isVisiting && this.options.visitData) {
      // Bể cá của bạn bè khi ghé thăm
      const vd = this.options.visitData;
      const speciesKey = vd.featuredFish || "koi_kohaku";
      const count = vd.fishCount || 4;

      for (let i = 0; i < count; i++) {
        const spec = i === 0 ? FISH_SPECIES[speciesKey] || FISH_SPECIES.koi_kohaku : this.getRandomSpecies();
        this.addFishInstance(spec, vd.displayName || "Bạn học", vd.streak || 30, i === 0 && spec.hasAura);
      }
    } else if (this.options.isMmoPond) {
      // Hồ Cá Đại Dương Chung MMO
      MMO_PEER_FISH_TEMPLATES.forEach((peer, idx) => {
        const spec = FISH_SPECIES[peer.speciesId] || FISH_SPECIES.koi_kohaku;
        this.addFishInstance(spec, peer.owner, peer.streak, peer.aura, idx);
      });

      // Thêm cá đại diện của chính người dùng
      const localData = loadAquariumData();
      const myFishItem = localData.ownedFish[0];
      const mySpec = myFishItem ? (FISH_SPECIES[myFishItem.speciesId] || FISH_SPECIES.koi_kohaku) : FISH_SPECIES.koi_kohaku;
      const att = getAttendanceStats();
      this.addFishInstance(mySpec, "Bạn (Tôi) ⭐", att.streak || 0, true, 999);
    } else {
      // Bể cá cá nhân của người dùng
      const localData = loadAquariumData();
      (localData.ownedFish || []).forEach((item, idx) => {
        const spec = FISH_SPECIES[item.speciesId] || FISH_SPECIES.koi_kohaku;
        this.addFishInstance(spec, item.customName || spec.name, null, spec.hasAura, idx, item.sizeMultiplier || 1);
      });
    }
  }

  getRandomSpecies() {
    const keys = Object.keys(FISH_SPECIES);
    const k = keys[Math.floor(Math.random() * keys.length)];
    return FISH_SPECIES[k];
  }

  addFishInstance(spec, ownerName = "", streak = null, hasAura = false, index = 0, sizeMult = 1) {
    const x = 60 + Math.random() * (this.width - 120);
    const y = 50 + Math.random() * (this.height - 120);
    const vx = (Math.random() > 0.5 ? 1 : -1) * (spec.baseSpeed * (0.8 + Math.random() * 0.4));
    const vy = (Math.random() - 0.5) * 0.4;

    this.fishList.push({
      spec,
      ownerName,
      streak,
      hasAura,
      x,
      y,
      vx,
      vy,
      targetAngle: vx >= 0 ? 0 : Math.PI,
      currentAngle: vx >= 0 ? 0 : Math.PI,
      size: spec.size * (sizeMult || 1),
      tailPhase: Math.random() * 10,
      tailFreq: 5 + Math.random() * 3,
      isPuffing: false,
      puffTimer: 0,
      targetFood: null,
      idleTimer: Math.random() * 200,
      seed: index
    });
  }

  bindEvents() {
    this.handleResize = () => this.initSize();
    window.addEventListener("resize", this.handleResize);

    this.handleMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
      this.checkHoverFish();
    };
    this.canvas.addEventListener("mousemove", this.handleMouseMove);

    this.handleMouseLeave = () => {
      this.mousePos.x = -999;
      this.mousePos.y = -999;
      this.hoveredFish = null;
    };
    this.canvas.addEventListener("mouseleave", this.handleMouseLeave);

    this.handleClick = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Nếu click vào một chú cá nóc Fugu -> giật mình phồng to
      const clickedFish = this.getFishAt(clickX, clickY);
      if (clickedFish && clickedFish.spec.isPuffer) {
        clickedFish.isPuffing = true;
        clickedFish.puffTimer = 90; // Phồng 90 frames (~1.5s)
        this.addFloatingText(clickedFish.x, clickedFish.y - 15, "🐡 Ơ kìa!", "#f59e0b");
        playSynthSound("bubble");
        return;
      }

      // Rải mồi thức ăn tại vị trí click
      this.dropFoodPellet(clickX, Math.min(clickY, 60));
    };
    this.canvas.addEventListener("click", this.handleClick);
  }

  getFishAt(x, y) {
    for (let i = this.fishList.length - 1; i >= 0; i--) {
      const f = this.fishList[i];
      const dist = Math.hypot(f.x - x, f.y - y);
      if (dist < f.size * 0.8) return f;
    }
    return null;
  }

  checkHoverFish() {
    this.hoveredFish = this.getFishAt(this.mousePos.x, this.mousePos.y);
    if (this.hoveredFish) {
      this.canvas.style.cursor = "pointer";
    } else {
      this.canvas.style.cursor = "crosshair"; // Con trỏ nhắm rải mồi
    }
  }

  dropFoodPellet(x, y = 30, isStar = false) {
    const data = loadAquariumData();
    if (!this.options.isMmoPond && !this.options.isVisiting) {
      if (data.foodCount <= 0 && data.starFoodCount <= 0) {
        this.addFloatingText(x, y + 20, "Hết thức ăn rồi! Hãy vào Shop mua thêm.", "#ef4444");
        playSynthSound("bubble");
        return;
      }
      if (data.foodCount > 0) {
        data.foodCount--;
      } else {
        data.starFoodCount--;
      }
      saveAquariumData(data);
      updateAquariumFoodDisplays(data.foodCount, data.starFoodCount);
    }

    this.foodPellets.push({
      x,
      y,
      vy: 1.2 + Math.random() * 0.6,
      vx: (Math.random() - 0.5) * 0.4,
      radius: isStar ? 5 : 3.5,
      isStar,
      color: isStar ? "#fbbf24" : "#f97316",
      life: 360 // frames
    });

    playSynthSound("bubble");

    // Tạo gợn sóng mặt nước
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + 2,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 1.5,
        radius: 2,
        color: "rgba(255, 255, 255, 0.7)",
        life: 25
      });
    }
  }

  addFloatingText(x, y, text, color = "#10b981") {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -0.9,
      life: 60
    });
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();

    const loop = (timestamp) => {
      if (!this.isRunning) return;
      const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
      this.lastTime = timestamp;

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener("resize", this.handleResize);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseleave", this.handleMouseLeave);
    this.canvas.removeEventListener("click", this.handleClick);
  }

  // ==========================================================================
  // UPDATE LOGIC (PHYSICS, BEHAVIOR & SENSING)
  // ==========================================================================

  update(dt) {
    const time = performance.now() * 0.001;

    // 1. Cập nhật thức ăn chìm
    for (let i = this.foodPellets.length - 1; i >= 0; i--) {
      const p = this.foodPellets[i];
      p.y += p.vy;
      p.x += p.vx;
      p.life--;

      // Chạm đáy thì dừng lại từ từ
      if (p.y >= this.height - 24) {
        p.y = this.height - 24;
        p.vy = 0;
        p.vx = 0;
      }

      if (p.life <= 0) {
        this.foodPellets.splice(i, 1);
      }
    }

    // 2. Cập nhật bong bóng nước
    this.bubbles.forEach(b => {
      b.y -= b.speed;
      b.x += Math.sin(time * b.wobbleSpeed + b.seed) * 0.4;
      if (b.y < -10) {
        b.y = this.height + 10;
        b.x = Math.random() * this.width;
      }
    });

    // 3. Cập nhật hành vi Cá (AI Wandering & Food Seeking)
    this.fishList.forEach(fish => {
      // Phồng gai nóc
      if (fish.isPuffing) {
        fish.puffTimer--;
        if (fish.puffTimer <= 0) fish.isPuffing = false;
      }

      // Tìm thức ăn gần nhất
      let closestFood = null;
      let closestDist = 260; // Phạm vi ngửi mùi mồi

      this.foodPellets.forEach(pellet => {
        const dist = Math.hypot(pellet.x - fish.x, pellet.y - fish.y);
        if (dist < closestDist) {
          closestDist = dist;
          closestFood = pellet;
        }
      });

      if (closestFood) {
        // Hướng về phía thức ăn
        const angle = Math.atan2(closestFood.y - fish.y, closestFood.x - fish.x);
        fish.targetAngle = angle;
        const targetSpeed = fish.spec.baseSpeed * 2.2;
        fish.vx += Math.cos(angle) * 0.12;
        fish.vy += Math.sin(angle) * 0.12;

        // Giới hạn tốc độ
        const curSpeed = Math.hypot(fish.vx, fish.vy);
        if (curSpeed > targetSpeed) {
          fish.vx = (fish.vx / curSpeed) * targetSpeed;
          fish.vy = (fish.vy / curSpeed) * targetSpeed;
        }

        // Kiểm tra đớp mồi
        if (closestDist < fish.size * 0.55) {
          const idx = this.foodPellets.indexOf(closestFood);
          if (idx !== -1) {
            const isStar = closestFood.isStar;
            this.foodPellets.splice(idx, 1);
            playSynthSound("eat");

            const rewardCoins = isStar ? 10 : 3;
            addAquariumCoins(rewardCoins);
            this.addFloatingText(fish.x, fish.y - 18, `+${rewardCoins} Xu 🪙`, "#f59e0b");

            // Hiệu ứng hạt nước khi đớp
            for (let k = 0; k < 6; k++) {
              this.particles.push({
                x: fish.x,
                y: fish.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 2.5,
                color: "#fde047",
                life: 30
              });
            }
          }
        }
      } else {
        // Bơi lội tự nhiên (Wandering)
        fish.idleTimer -= dt * 60;
        if (fish.idleTimer <= 0) {
          fish.idleTimer = 120 + Math.random() * 240;
          const randomDir = (Math.random() - 0.5) * Math.PI * 0.8;
          fish.targetAngle = (fish.vx >= 0 ? 0 : Math.PI) + randomDir;
        }

        fish.vx += Math.cos(fish.targetAngle) * 0.03;
        fish.vy += Math.sin(fish.targetAngle) * 0.03;

        // Giữ tốc độ lướt êm ái
        const curSpeed = Math.hypot(fish.vx, fish.vy);
        const normSpeed = fish.spec.baseSpeed;
        if (curSpeed > normSpeed) {
          fish.vx *= 0.98;
          fish.vy *= 0.98;
        }
      }

      // Giới hạn biên bể
      const margin = 50;
      if (fish.x < margin) {
        fish.vx += 0.08;
        fish.targetAngle = 0;
      } else if (fish.x > this.width - margin) {
        fish.vx -= 0.08;
        fish.targetAngle = Math.PI;
      }

      if (fish.y < margin) {
        fish.vy += 0.06;
      } else if (fish.y > this.height - margin - 20) {
        fish.vy -= 0.06;
      }

      // Di chuyển
      fish.x += fish.vx;
      fish.y += fish.vy;

      // Xoay góc cá mượt mà
      const desiredAngle = Math.atan2(fish.vy, fish.vx);
      let diff = desiredAngle - fish.currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      fish.currentAngle += diff * 0.08;

      // Quẫy đuôi tỷ lệ thuận với tốc độ
      const speed = Math.hypot(fish.vx, fish.vy);
      fish.tailPhase += speed * 0.18;
    });

    // 4. Cập nhật hạt nước & hiệu ứng
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    // 5. Cập nhật chữ nổi
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      ft.alpha = Math.max(0, ft.life / 60);
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }
  }

  // ==========================================================================
  // RENDER GRAPHICS (WATER, SUN RAYS, JAPANESE ZEN MOTIFS, KOI FISH)
  // ==========================================================================

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const time = performance.now() * 0.001;

    ctx.clearRect(0, 0, w, h);

    // 1. Nền nước sâu Gradient
    const waterGrad = ctx.createLinearGradient(0, 0, 0, h);
    waterGrad.addColorStop(0, "#0c3559");   // Xanh thẳm mặt hồ
    waterGrad.addColorStop(0.5, "#0d4d7a"); // Xanh ngọc bích giữa lòng hồ
    waterGrad.addColorStop(0.88, "#14608c"); // Xanh lục ngọc
    waterGrad.addColorStop(1, "#185a6e");   // Đáy hồ trầm lắng
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Tia nắng chiếu nghiêng xuyên qua mặt nước (Sun Caustics)
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    for (let i = 0; i < 4; i++) {
      const rayGrad = ctx.createLinearGradient(w * (0.2 + i * 0.22), 0, w * (0.1 + i * 0.22) + Math.sin(time + i) * 30, h);
      rayGrad.addColorStop(0, "rgba(255, 255, 255, 0.14)");
      rayGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.08)");
      rayGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(w * (0.15 + i * 0.22) + Math.sin(time * 0.8 + i) * 15, 0);
      ctx.lineTo(w * (0.25 + i * 0.22) + Math.sin(time * 0.8 + i) * 15, 0);
      ctx.lineTo(w * (0.35 + i * 0.22) + Math.sin(time * 0.5 + i) * 35, h);
      ctx.lineTo(w * (0.1 + i * 0.22) + Math.sin(time * 0.5 + i) * 35, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 3. Đáy cát vàng mịn màng
    const sandGrad = ctx.createLinearGradient(0, h - 35, 0, h);
    sandGrad.addColorStop(0, "rgba(217, 163, 98, 0.8)");
    sandGrad.addColorStop(1, "rgba(168, 114, 57, 0.95)");
    ctx.fillStyle = sandGrad;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, h - 26);
    ctx.bezierCurveTo(w * 0.25, h - 34, w * 0.65, h - 20, w, h - 28);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // 4. Cảnh quan Thủy Sinh Nhật Bản (Torii Gate & Stone Lantern)
    this.renderDecorations(ctx, w, h, time);

    // 5. Cây rong đuôi chó uốn lượn theo dòng nước (Seaweed)
    this.renderSeaweed(ctx, w, h, time);

    // 6. Bong bóng nước nổi lên
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
    ctx.lineWidth = 1;
    this.bubbles.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Đốm sáng trên bong bóng
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    });

    // 7. Thức ăn cá chìm
    this.foodPellets.forEach(p => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.isStar ? 12 : 4;
      ctx.fill();
      ctx.restore();
    });

    // 8. Đàn Cá Koi & Các loài cá bơi lội
    this.fishList.forEach(fish => {
      this.renderSingleFish(ctx, fish, time);
    });

    // 9. Hiệu ứng hạt nước (Splash / Gobble particles)
    this.particles.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.fill();
    });

    // 10. Chữ nổi (+Xu, Cảm xúc)
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillStyle = ft.color;
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText(ft.text, ft.x - 20, ft.y);
      ctx.restore();
    });

    // 11. Tooltip Avatar & Tên học viên khi rê chuột vào cá (Đặc biệt cho Hồ MMO)
    if (this.hoveredFish && this.hoveredFish.ownerName) {
      this.renderFishTooltip(ctx, this.hoveredFish);
    }
  }

  renderDecorations(ctx, w, h, time) {
    const data = loadAquariumData();
    const decors = this.options.visitData?.pondDecor || data.ownedDecorations || ["torii_gate"];

    // Cổng Torii chìm (Torii Gate) bên trái đáy hồ
    if (decors.includes("torii_gate")) {
      ctx.save();
      const tx = w * 0.16;
      const ty = h - 30;

      // Hai cột cổng đỏ vermillion
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(tx - 24, ty - 85, 7, 85);
      ctx.fillRect(tx + 17, ty - 85, 7, 85);

      // Chân cột đen
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(tx - 26, ty - 12, 11, 12);
      ctx.fillRect(tx + 15, ty - 12, 11, 12);

      // Xà ngang dưới
      ctx.fillStyle = "#dc2626";
      ctx.fillRect(tx - 32, ty - 70, 64, 6);

      // Mái cong trên cùng (Kasagi) màu đỏ chóp đen
      ctx.beginPath();
      ctx.moveTo(tx - 40, ty - 88);
      ctx.quadraticCurveTo(tx, ty - 96, tx + 40, ty - 88);
      ctx.lineTo(tx + 42, ty - 82);
      ctx.quadraticCurveTo(tx, ty - 89, tx - 42, ty - 82);
      ctx.closePath();
      ctx.fillStyle = "#1c1917";
      ctx.fill();

      // Bảng tên đền giữa cổng
      ctx.fillStyle = "#1c1917";
      ctx.fillRect(tx - 5, ty - 78, 10, 8);
      ctx.fillStyle = "#fef08a";
      ctx.font = "bold 6px sans-serif";
      ctx.fillText("神", tx - 3, ty - 72);

      ctx.restore();
    }

    // Đèn đá Nhật Bản (Stone Lantern) bên phải đáy hồ
    if (decors.includes("stone_lantern")) {
      ctx.save();
      const lx = w * 0.82;
      const ly = h - 28;

      ctx.fillStyle = "#57534e";
      // Chân đế
      ctx.fillRect(lx - 12, ly - 8, 24, 8);
      // Cột trụ
      ctx.fillRect(lx - 6, ly - 36, 12, 28);
      // Bệ đèn
      ctx.fillRect(lx - 14, ly - 42, 28, 6);
      // Lồng đèn phát sáng vàng nhạt
      ctx.fillStyle = "rgba(254, 240, 138, 0.75)";
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 10;
      ctx.fillRect(lx - 10, ly - 56, 20, 14);
      ctx.shadowBlur = 0;
      // Mái che lục giác
      ctx.fillStyle = "#44403c";
      ctx.beginPath();
      ctx.moveTo(lx - 18, ly - 56);
      ctx.lineTo(lx, ly - 68);
      ctx.lineTo(lx + 18, ly - 56);
      ctx.closePath();
      ctx.fill();

      // Đỉnh ngọc chóp
      ctx.beginPath();
      ctx.arc(lx, ly - 70, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Cánh hoa anh đào trôi bồng bềnh
    if (decors.includes("sakura_petals")) {
      ctx.save();
      ctx.fillStyle = "rgba(251, 207, 232, 0.85)";
      for (let i = 0; i < 6; i++) {
        const sx = ((w * 0.15 * i + time * 12) % w);
        const sy = 12 + Math.sin(time + i) * 6;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 5, 2.5, Math.sin(time + i), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  renderSeaweed(ctx, w, h, time) {
    ctx.save();
    const seaweeds = [
      { x: w * 0.05, height: 110, count: 5, color: "#15803d" },
      { x: w * 0.09, height: 140, count: 6, color: "#166534" },
      { x: w * 0.92, height: 130, count: 6, color: "#15803d" },
      { x: w * 0.95, height: 100, count: 4, color: "#166534" }
    ];

    seaweeds.forEach(sw => {
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sw.x, h - 25);

      const segments = sw.count;
      const segLen = sw.height / segments;
      for (let i = 1; i <= segments; i++) {
        const sway = Math.sin(time * 1.5 + i * 0.6 + sw.x) * (i * 3.5);
        ctx.lineTo(sw.x + sway, (h - 25) - i * segLen);
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  renderSingleFish(ctx, fish, time) {
    ctx.save();
    ctx.translate(fish.x, fish.y);
    ctx.rotate(fish.currentAngle);

    // Hào quang lấp lánh (Aura glow cho cá xịn / cá streak cao)
    if (fish.hasAura) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, fish.size * 0.9, 0, Math.PI * 2);
      const auraGrad = ctx.createRadialGradient(0, 0, fish.size * 0.3, 0, 0, fish.size * 1.1);
      auraGrad.addColorStop(0, "rgba(250, 204, 21, 0.45)");
      auraGrad.addColorStop(1, "rgba(250, 204, 21, 0)");
      ctx.fillStyle = auraGrad;
      ctx.fill();
      ctx.restore();
    }

    const size = fish.size;
    const tailWiggle = Math.sin(fish.tailPhase) * 6;

    if (fish.spec.isPuffer) {
      // 🐡 Render Cá Nóc Fugu tròn trĩnh
      const scalePuff = fish.isPuffing ? 1.45 : 1.0;
      ctx.scale(scalePuff, scalePuff);

      // Thân cá tròn
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.55, size * 0.48, 0, 0, Math.PI * 2);
      ctx.fillStyle = fish.spec.colorBase;
      ctx.fill();
      ctx.strokeStyle = fish.spec.colorPattern;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gai nhím nếu đang giật mình phồng to
      if (fish.isPuffing) {
        ctx.fillStyle = "#ca8a04";
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
          const gx = Math.cos(a) * (size * 0.55);
          const gy = Math.sin(a) * (size * 0.48);
          ctx.beginPath();
          ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Đuôi vẫy
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, 0);
      ctx.lineTo(-size * 0.75, -6 + tailWiggle);
      ctx.lineTo(-size * 0.7, 0);
      ctx.lineTo(-size * 0.75, 6 + tailWiggle);
      ctx.closePath();
      ctx.fillStyle = fish.spec.colorFin;
      ctx.fill();

      // Mắt tròn xoe
      ctx.beginPath();
      ctx.arc(size * 0.3, -size * 0.15, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.32, -size * 0.15, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#09090b";
      ctx.fill();

      // Miệng chúm chím
      ctx.beginPath();
      ctx.arc(size * 0.52, 2, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();

    } else {
      // 🐟 Render Cá Koi Nhật Bản (Bézier curves mượt mà)
      // 1. Đuôi cá nhiều lớp mềm mại
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-size * 0.5, 0);
      ctx.quadraticCurveTo(-size * 0.8, -10 + tailWiggle, -size * 1.05, -14 + tailWiggle * 1.5);
      ctx.quadraticCurveTo(-size * 0.85, 0, -size * 1.05, 14 + tailWiggle * 1.5);
      ctx.quadraticCurveTo(-size * 0.8, 10 + tailWiggle, -size * 0.5, 0);
      ctx.fillStyle = fish.spec.colorFin;
      ctx.fill();
      ctx.restore();

      // 2. Hai vây bơi hai bên (Pectoral fins)
      ctx.save();
      const finFlap = Math.sin(fish.tailPhase * 0.8) * 3;
      ctx.beginPath();
      ctx.ellipse(-size * 0.1, -size * 0.28 + finFlap, 9, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(-size * 0.1, size * 0.28 - finFlap, 9, 4, 0.4, 0, Math.PI * 2);
      ctx.fillStyle = fish.spec.colorFin;
      ctx.fill();
      ctx.restore();

      // 3. Thân cá Koi dạng khí động học hình thoi vuốt đuôi
      ctx.beginPath();
      ctx.moveTo(size * 0.55, 0); // Đầu cá
      ctx.bezierCurveTo(size * 0.35, -size * 0.32, -size * 0.2, -size * 0.28, -size * 0.55, 0);
      ctx.bezierCurveTo(-size * 0.2, size * 0.28, size * 0.35, size * 0.32, size * 0.55, 0);
      ctx.closePath();
      ctx.fillStyle = fish.spec.colorBase;
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 4. Các khoang đốm vảy đặc trưng (Kohaku / Showa / Kinryu pattern)
      ctx.save();
      ctx.clip(); // Giới hạn hoa văn nằm gọn trong thân cá
      ctx.fillStyle = fish.spec.colorPattern;
      ctx.beginPath();
      ctx.ellipse(size * 0.1, -size * 0.05, size * 0.24, size * 0.18, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-size * 0.25, size * 0.05, size * 0.18, size * 0.14, -0.3, 0, Math.PI * 2);
      ctx.fill();

      if (fish.spec.colorSubPattern) {
        ctx.fillStyle = fish.spec.colorSubPattern;
        ctx.beginPath();
        ctx.ellipse(size * 0.22, size * 0.08, size * 0.12, size * 0.08, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 5. Mắt cá Koi đen lay láy
      ctx.beginPath();
      ctx.arc(size * 0.36, -size * 0.13, 3, 0, Math.PI * 2);
      ctx.arc(size * 0.36, size * 0.13, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(size * 0.38, -size * 0.13, 1.8, 0, Math.PI * 2);
      ctx.arc(size * 0.38, size * 0.13, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();

      // 6. Râu cá Koi nhỏ xinh
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(size * 0.52, -2);
      ctx.lineTo(size * 0.62, -5);
      ctx.moveTo(size * 0.52, 2);
      ctx.lineTo(size * 0.62, 5);
      ctx.stroke();
    }

    // 7. Huy hiệu tên học viên bay theo trên đầu cá (Cho Hồ MMO)
    if (fish.ownerName && this.options.isMmoPond) {
      ctx.save();
      ctx.rotate(-fish.currentAngle); // Giữ chữ luôn thẳng đứng không bị lộn ngược
      ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
      ctx.roundRect(-45, -size - 22, 90, 18, 9);
      ctx.fill();
      ctx.strokeStyle = fish.hasAura ? "#f59e0b" : "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = "bold 10px -apple-system, sans-serif";
      ctx.fillStyle = fish.hasAura ? "#fef08a" : "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(fish.ownerName.slice(0, 11), 0, -size - 9);
      ctx.restore();
    }

    ctx.restore();
  }

  renderFishTooltip(ctx, fish) {
    ctx.save();
    const tx = Math.min(Math.max(fish.x, 80), this.width - 80);
    const ty = Math.max(fish.y - fish.size - 40, 20);

    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
    ctx.shadowBlur = 10;
    ctx.roundRect(tx - 75, ty - 32, 150, 48, 12);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(fish.ownerName || fish.spec.name, tx, ty - 14);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "11px -apple-system, sans-serif";
    const subText = fish.streak !== null ? `🔥 Chuỗi ${fish.streak} ngày • ${fish.spec.japanese}` : `${fish.spec.name} • Cấp 1`;
    ctx.fillText(subText, tx, ty + 4);
    ctx.restore();
  }
}

// ============================================================================
// UI ORCHESTRATION & SOCIAL MODALS
// ============================================================================

let currentAquariumEngine = null;
let currentAquariumMode = "my_pond"; // "my_pond" | "mmo_pond"

export function setupAquariumUI() {
  const canvas = document.getElementById("zen-aquarium-canvas");
  if (!canvas) return;

  // Khởi tạo Canvas Engine
  if (currentAquariumEngine) {
    currentAquariumEngine.destroy();
  }
  currentAquariumEngine = new AquariumEngine(canvas, { isMmoPond: false });
  currentAquariumEngine.start();

  // Khởi tạo dữ liệu hiển thị Xu & Thức ăn
  const data = loadAquariumData();
  updateAquariumCoinDisplays(data.coins);
  updateAquariumFoodDisplays(data.foodCount, data.starFoodCount);

  // Nút chuyển chế độ: Bể của tôi vs Đại dương MMO
  const myPondBtn = document.getElementById("aq-mode-my-pond");
  const mmoPondBtn = document.getElementById("aq-mode-mmo-pond");

  if (myPondBtn && mmoPondBtn) {
    myPondBtn.onclick = () => {
      if (currentAquariumMode === "my_pond") return;
      currentAquariumMode = "my_pond";
      myPondBtn.classList.add("active");
      mmoPondBtn.classList.remove("active");
      currentAquariumEngine.options.isMmoPond = false;
      currentAquariumEngine.initEntities();
    };

    mmoPondBtn.onclick = () => {
      if (currentAquariumMode === "mmo_pond") return;
      currentAquariumMode = "mmo_pond";
      mmoPondBtn.classList.add("active");
      myPondBtn.classList.remove("active");
      currentAquariumEngine.options.isMmoPond = true;
      currentAquariumEngine.initEntities();
      playSynthSound("chime");
    };
  }

  // Nút Mở Shop Thủy Sinh
  const openShopBtn = document.getElementById("aq-open-shop-btn");
  if (openShopBtn) {
    openShopBtn.onclick = () => openAquariumShopModal();
  }

  // Nút Khoe Bể Cá 1-Click (Story Card)
  const openShareBtn = document.getElementById("aq-share-card-btn");
  if (openShareBtn) {
    openShareBtn.onclick = () => generateAquariumShareCard();
  }

  // Quick Feed Buttons trên thanh điều khiển Canvas
  const quickFeedBtn = document.getElementById("aq-quick-feed-btn");
  if (quickFeedBtn) {
    quickFeedBtn.onclick = () => {
      if (currentAquariumEngine) {
        currentAquariumEngine.dropFoodPellet(currentAquariumEngine.width * 0.5 + (Math.random() - 0.5) * 120, 30, false);
      }
    };
  }

  const quickStarBtn = document.getElementById("aq-quick-star-btn");
  if (quickStarBtn) {
    quickStarBtn.onclick = () => {
      if (currentAquariumEngine) {
        currentAquariumEngine.dropFoodPellet(currentAquariumEngine.width * 0.5 + (Math.random() - 0.5) * 120, 30, true);
      }
    };
  }

  // Đăng ký sự kiện đóng các Modals
  const shopModal = document.getElementById("aq-shop-modal");
  const closeShopBtn = document.getElementById("aq-close-shop-modal-btn");
  if (closeShopBtn && shopModal) {
    closeShopBtn.onclick = () => shopModal.classList.remove("is-open");
  }

  const shareModal = document.getElementById("aq-share-modal");
  const closeShareBtn = document.getElementById("aq-close-share-modal-btn");
  const cancelShareBtn = document.getElementById("aq-cancel-share-modal-btn");
  if (closeShareBtn && shareModal) {
    closeShareBtn.onclick = () => shareModal.classList.remove("is-open");
  }
  if (cancelShareBtn && shareModal) {
    cancelShareBtn.onclick = () => shareModal.classList.remove("is-open");
  }

  // Đóng modal khi click ra ngoài vùng nền mờ
  document.querySelectorAll(".aq-modal").forEach(modal => {
    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.classList.remove("is-open");
      }
    };
  });

  // Đăng ký chuyển tab trong Cửa hàng Thủy sinh
  document.querySelectorAll(".aq-shop-tab").forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll(".aq-shop-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-shop-tab");
      document.querySelectorAll(".aq-shop-tab-pane").forEach(pane => pane.classList.remove("active"));
      const activePane = document.getElementById(`aq-shop-tab-pane-${target}`);
      if (activePane) activePane.classList.add("active");
    };
  });

  // Đăng ký các thẻ học viên trong Hall of Fame
  setupHallOfFameCards();
}

export function updateAquariumCoinDisplays(coins) {
  const elements = document.querySelectorAll(".aq-coin-display");
  elements.forEach(el => {
    el.textContent = coins;
  });
}

export function updateAquariumFoodDisplays(food, starFood) {
  const foodEl = document.getElementById("aq-food-count-display");
  if (foodEl) foodEl.textContent = food;
  const starEl = document.getElementById("aq-star-food-count-display");
  if (starEl) starEl.textContent = starFood;
}

// ----------------------------------------------------------------------------
// MODAL: SHOP THỦY SINH (MUA CÁ, THỨC ĂN, CẢNH QUAN)
// ----------------------------------------------------------------------------
export function openAquariumShopModal() {
  const modal = document.getElementById("aq-shop-modal");
  if (!modal) return;

  const data = loadAquariumData();
  renderAquariumShopTabs(data);
  modal.classList.add("is-open");
}

function renderAquariumShopTabs(data) {
  const fishContainer = document.getElementById("aq-shop-fish-list");
  if (fishContainer) {
    fishContainer.innerHTML = Object.values(FISH_SPECIES).map(species => {
      const isOwned = data.ownedFish.some(f => f.speciesId === species.id);
      const canAfford = data.coins >= species.price;

      return `
        <div class="aq-shop-item-card ${isOwned ? 'is-owned' : ''}">
          <div class="shop-item-badge" style="background: ${species.rarityColor};">${species.rarity}</div>
          <div class="shop-item-preview">
            <span style="font-size: 2.2rem;">${species.isPuffer ? '🐡' : '🐟'}</span>
          </div>
          <h4>${species.name}</h4>
          <p class="jp-sub">${species.japanese}</p>
          <p class="desc">${species.desc}</p>
          <div class="shop-item-footer">
            <strong class="price">🪙 ${species.price === 0 ? 'Miễn phí' : `${species.price} Xu`}</strong>
            ${isOwned ? `
              <button type="button" class="btn btn-secondary btn-sm" disabled>Đã sở hữu ✓</button>
            ` : `
              <button type="button" class="btn btn-primary btn-sm aq-buy-fish-btn" data-fish-id="${species.id}" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? 'Mua ngay' : 'Thiếu Xu'}
              </button>
            `}
          </div>
        </div>
      `;
    }).join("");

    fishContainer.querySelectorAll(".aq-buy-fish-btn").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-fish-id");
        buyFishSpecies(id);
      };
    });
  }

  // Cảnh quan Decorations
  const decorContainer = document.getElementById("aq-shop-decor-list");
  if (decorContainer) {
    decorContainer.innerHTML = Object.values(AQUARIUM_DECORATIONS).map(decor => {
      const isOwned = data.ownedDecorations.includes(decor.id);
      const canAfford = data.coins >= decor.price;

      return `
        <div class="aq-shop-item-card ${isOwned ? 'is-owned' : ''}">
          <div class="shop-item-preview">
            <span style="font-size: 2.2rem;">${decor.icon}</span>
          </div>
          <h4>${decor.name}</h4>
          <p class="jp-sub">${decor.japanese}</p>
          <p class="desc">${decor.desc}</p>
          <div class="shop-item-footer">
            <strong class="price">🪙 ${decor.price} Xu</strong>
            ${isOwned ? `
              <button type="button" class="btn btn-secondary btn-sm" disabled>Đã trang bị ✓</button>
            ` : `
              <button type="button" class="btn btn-primary btn-sm aq-buy-decor-btn" data-decor-id="${decor.id}" ${canAfford ? '' : 'disabled'}>
                ${canAfford ? 'Mua ngay' : 'Thiếu Xu'}
              </button>
            `}
          </div>
        </div>
      `;
    }).join("");

    decorContainer.querySelectorAll(".aq-buy-decor-btn").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-decor-id");
        buyDecoration(id);
      };
    });
  }

  // Mồi Thức Ăn Food Packages
  const foodContainer = document.getElementById("aq-shop-food-list");
  if (foodContainer) {
    foodContainer.innerHTML = AQUARIUM_FOOD_PACKAGES.map(pkg => {
      const canAfford = data.coins >= pkg.price;
      return `
        <div class="aq-shop-item-card">
          <div class="shop-item-preview">
            <span style="font-size: 2.2rem;">${pkg.icon}</span>
          </div>
          <h4>${pkg.name}</h4>
          <p class="desc">${pkg.desc}</p>
          <div class="shop-item-footer">
            <strong class="price">🪙 ${pkg.price} Xu</strong>
            <button type="button" class="btn btn-primary btn-sm aq-buy-food-btn" data-pack-id="${pkg.id}" ${canAfford ? '' : 'disabled'}>
              ${canAfford ? 'Mua ngay' : 'Thiếu Xu'}
            </button>
          </div>
        </div>
      `;
    }).join("");

    foodContainer.querySelectorAll(".aq-buy-food-btn").forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-pack-id");
        buyFoodPackage(id);
      };
    });
  }
}

function buyFoodPackage(packId) {
  const pkg = AQUARIUM_FOOD_PACKAGES.find(p => p.id === packId);
  if (!pkg) return;
  const data = loadAquariumData();
  if (data.coins < pkg.price) return;

  data.coins -= pkg.price;
  if (pkg.isStar) {
    data.starFoodCount = (data.starFoodCount || 0) + pkg.count;
  } else {
    data.foodCount = (data.foodCount || 0) + pkg.count;
  }

  saveAquariumData(data);
  playSynthSound("chime");

  updateAquariumCoinDisplays(data.coins);
  updateAquariumFoodDisplays(data.foodCount, data.starFoodCount);
  renderAquariumShopTabs(data);
}

function buyFishSpecies(speciesId) {
  const spec = FISH_SPECIES[speciesId];
  if (!spec) return;
  const data = loadAquariumData();
  if (data.coins < spec.price) return;

  data.coins -= spec.price;
  data.ownedFish.push({
    uid: `fish_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    speciesId,
    customName: spec.name,
    hunger: 100,
    sizeMultiplier: 1.0,
    fedCount: 0
  });

  saveAquariumData(data);
  playSynthSound("chime");

  if (currentAquariumEngine && !currentAquariumEngine.options.isMmoPond) {
    currentAquariumEngine.initEntities();
  }

  updateAquariumCoinDisplays(data.coins);
  renderAquariumShopTabs(data);
}

function buyDecoration(decorId) {
  const decor = AQUARIUM_DECORATIONS[decorId];
  if (!decor) return;
  const data = loadAquariumData();
  if (data.coins < decor.price) return;

  data.coins -= decor.price;
  data.ownedDecorations.push(decorId);

  saveAquariumData(data);
  playSynthSound("chime");

  updateAquariumCoinDisplays(data.coins);
  renderAquariumShopTabs(data);
}

// ----------------------------------------------------------------------------
// MODAL & CANVAS RENDER: THẺ CĂN CƯỚC HỒ CÁ STORY 1-CLICK (POLAROID FLEX)
// ----------------------------------------------------------------------------
export function generateAquariumShareCard() {
  const modal = document.getElementById("aq-share-modal");
  const previewCanvas = document.getElementById("aq-share-preview-canvas");
  if (!modal || !previewCanvas) return;

  modal.classList.add("is-open");
  const ctx = previewCanvas.getContext("2d");

  // Thiết lập kích thước chuẩn Story 9:16 (540 x 960 px)
  previewCanvas.width = 540;
  previewCanvas.height = 960;

  const data = loadAquariumData();
  const att = getAttendanceStats();
  const streak = att.streak || 0;
  const wordsCount = document.getElementById("stat-words-count")?.textContent || "0";

  // 1. Nền nghệ thuật Gradient Nhật Bản
  const bgGrad = ctx.createLinearGradient(0, 0, 540, 960);
  bgGrad.addColorStop(0, "#0b253a");
  bgGrad.addColorStop(0.35, "#0d436a");
  bgGrad.addColorStop(0.7, "#115e80");
  bgGrad.addColorStop(1, "#f4f1ea"); // Chân giấy retro sang trọng
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 540, 960);

  // 2. Chữ Thủy Thần Thư Pháp Chìm (Watermark)
  ctx.save();
  ctx.font = "900 130px 'Noto Sans JP', sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
  ctx.textAlign = "center";
  ctx.fillText("水族館", 270, 240);
  ctx.restore();

  // 3. Header Card
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("MIW NIHONGO • ZEN AQUARIUM", 270, 70);

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "14px -apple-system, sans-serif";
  ctx.fillText("Thẻ Căn Cước Hồ Cá Học Tập", 270, 98);

  // 4. Khung Bể Cá Polaroid (Snapshot)
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 25;
  ctx.roundRect(40, 130, 460, 420, 20);
  ctx.fill();

  // Vẽ hình bể cá thực tế từ Canvas chính vào trong khung Polaroid
  const sourceCanvas = document.getElementById("zen-aquarium-canvas");
  if (sourceCanvas) {
    ctx.clip();
    ctx.drawImage(sourceCanvas, 50, 140, 440, 400);
  }
  ctx.restore();

  // 5. Khối Thông Số Học Tập Tự Hào (Bragging Stats)
  ctx.fillStyle = "#1e293b";
  ctx.font = "bold 22px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Học viên: @Minh Nihongo", 270, 600);

  // Badge Row
  ctx.fillStyle = "#ea580c";
  ctx.font = "bold 18px -apple-system, sans-serif";
  ctx.fillText(`🔥 Chuỗi Kỷ Luật: ${streak} Ngày Liên Tiếp`, 270, 638);

  ctx.fillStyle = "#0284c7";
  ctx.font = "bold 16px -apple-system, sans-serif";
  ctx.fillText(`📚 Đã Chinh Phục: ${wordsCount} Từ Vựng N5`, 270, 672);

  ctx.fillStyle = "#7c3aed";
  ctx.font = "bold 16px -apple-system, sans-serif";
  ctx.fillText(`🐟 Sở Hữu: ${data.ownedFish.length} Chú Cá Koi Quý Tộc`, 270, 706);

  // Câu châm ngôn Nhật Bản
  ctx.fillStyle = "#475569";
  ctx.font = "italic 15px Georgia, serif";
  ctx.fillText("「継続は力なり」 - Kiên trì ắt thành công", 270, 750);

  // 6. Chân Card: Mã QR & Link giới thiệu (Ref Flex)
  ctx.fillStyle = "#ffffff";
  ctx.roundRect(50, 790, 440, 120, 18);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 15px -apple-system, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Cùng Nuôi Cá & Học Tiếng Nhật Tại:", 150, 835);

  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 14px monospace";
  ctx.fillText("https://miwnihongo.com", 150, 862);

  ctx.fillStyle = "#64748b";
  ctx.font = "12px -apple-system, sans-serif";
  ctx.fillText("Quét mã QR để vào ngắm hồ cá ngay!", 150, 888);

  // Vẽ mô phỏng khung QR Code
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(72, 810, 64, 64);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(76, 814, 56, 56);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(82, 820, 20, 20);
  ctx.fillRect(106, 820, 20, 20);
  ctx.fillRect(82, 844, 20, 20);

  // Đăng ký nút Download Story Image
  const downloadBtn = document.getElementById("aq-download-story-btn");
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const link = document.createElement("a");
      link.download = `MIW-Aquarium-${Date.now()}.png`;
      link.href = previewCanvas.toDataURL("image/png");
      link.click();
    };
  }
}

// ----------------------------------------------------------------------------
// MODAL: GHÉ THĂM HỒ CÁ BẠN BÈ & TƯƠNG TÁC CHÉO
// ----------------------------------------------------------------------------
function setupHallOfFameCards() {
  const container = document.getElementById("aq-hall-of-fame-list");
  if (!container) return;

  container.innerHTML = HALL_OF_FAME_STUDENTS.map(student => {
    return `
      <div class="aq-hof-card" data-student-id="${student.id}" role="button" tabindex="0" title="Bấm để ghé thăm hồ cá của ${student.displayName}">
        <div class="hof-card-top">
          <span class="hof-avatar">${student.avatar}</span>
          <div class="hof-meta">
            <h4>${student.displayName}</h4>
            <span class="hof-title-pill">${student.title}</span>
          </div>
        </div>
        <div class="hof-stats-row">
          <span>🔥 ${student.streak} ngày</span>
          <span>🐟 ${student.fishCount} cá Koi</span>
          <span>❤️ ${student.likes} lượt thích</span>
        </div>
        <button type="button" class="btn btn-secondary btn-sm hof-visit-btn" data-student-id="${student.id}">
          Ghé thăm hồ ➔
        </button>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".hof-visit-btn, .aq-hof-card").forEach(el => {
    el.onclick = (e) => {
      e.stopPropagation();
      const id = el.getAttribute("data-student-id");
      const targetStudent = HALL_OF_FAME_STUDENTS.find(s => s.id === id);
      if (targetStudent) openFriendPondModal(targetStudent);
    };
  });
}

export function openFriendPondModal(student) {
  const modal = document.getElementById("aq-friend-pond-modal");
  const canvas = document.getElementById("aq-friend-canvas");
  if (!modal || !canvas) return;

  // Cập nhật thông tin tiêu đề modal
  const nameEl = document.getElementById("aq-friend-name");
  if (nameEl) nameEl.textContent = student.displayName;
  const quoteEl = document.getElementById("aq-friend-quote");
  if (quoteEl) quoteEl.textContent = student.quote;
  const likesEl = document.getElementById("aq-friend-likes-count");
  if (likesEl) likesEl.textContent = student.likes;

  modal.classList.add("is-open");

  // Khởi tạo Canvas xem hồ của bạn bè
  const friendEngine = new AquariumEngine(canvas, {
    isVisiting: true,
    visitData: student
  });
  friendEngine.start();

  // Nút Cho ăn hộ
  const feedBtn = document.getElementById("aq-friend-feed-btn");
  if (feedBtn) {
    feedBtn.textContent = "🍱 Cho ăn hộ (+10 Xu)";
    feedBtn.disabled = false;
    feedBtn.onclick = () => {
      friendEngine.dropFoodPellet(friendEngine.width * 0.5, 30, true);
      addAquariumCoins(10);
      playSynthSound("chime");
      feedBtn.textContent = "Đã cho ăn hộ (+10 Xu) ✓";
      feedBtn.disabled = true;
    };
  }

  // Nút Thả tim
  const likeBtn = document.getElementById("aq-friend-like-btn");
  if (likeBtn) {
    likeBtn.textContent = "❤️ Thả tim";
    likeBtn.disabled = false;
    likeBtn.onclick = () => {
      student.likes++;
      if (likesEl) likesEl.textContent = student.likes;
      playSynthSound("bubble");
      likeBtn.textContent = "Đã thả tim ❤️";
      likeBtn.disabled = true;
    };
  }

  // Nút đóng modal
  const closeBtn = document.getElementById("aq-close-friend-modal-btn");
  if (closeBtn) {
    closeBtn.onclick = () => {
      friendEngine.destroy();
      modal.classList.remove("is-open");
    };
  }
}
