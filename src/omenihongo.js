/**
 * ============================================================================
 * OMENIHONGO - GHÉP ĐÔI GỌI VIDEO/VOICE RANDOM 1-1 & KHÁM PHÁ CỘNG ĐỒNG
 * Tương tự OmeTV / Omegle chuyên biệt cho luyện tập Kaiwa tiếng Nhật
 * WebRTC P2P + Virtual Japanese AI Partner Fallback + Quick Phrases
 * ============================================================================
 */

import { playSynthSound } from "./aquarium.js";

// Danh sách các bạn học Nhật Bản ảo (AI Kaiwa Partners)
export const AI_KAIWA_PARTNERS = [
  {
    id: "sakura_tokyo",
    name: "Sakura Tanaka",
    japaneseName: "田中 さくら",
    age: 20,
    city: "Tokyo (Shibuya)",
    avatarEmoji: "🌸",
    avatarBg: "linear-gradient(135deg, #fbcfe8, #f43f5e)",
    title: "Sinh viên ĐH Waseda • Trợ giảng Kaiwa N5-N4",
    bio: "Rất vui được làm quen với các bạn Việt Nam! Mình thích Anime Jujutsu Kaisen và trà sữa.",
    jlptLevel: "Native (Bản xứ)",
    interests: ["Anime", "Nấu ăn", "Du lịch"],
    greeting: "こんにちは！はじめまして、さくらです。日本語の練習、一緒に楽しくお話ししましょう！",
    greetingRomaji: "Konnichiwa! Hajimemashite, Sakura desu. Nihongo no renshuu, issho ni tanoshiku ohanashi shimashou!",
    greetingVi: "Xin chào! Rất vui được gặp bạn, mình là Sakura. Cùng nhau luyện nói tiếng Nhật thật vui nhé!"
  },
  {
    id: "kenji_kyoto",
    name: "Kenji Sato",
    japaneseName: "佐藤 健二",
    age: 22,
    city: "Kyoto (Gion)",
    avatarEmoji: "⛩️",
    avatarBg: "linear-gradient(135deg, #fed7aa, #ea580c)",
    title: "Người bản xứ Kyoto • Đam mê Văn hóa & Lịch sử",
    bio: "Chào bạn! Mình có thể giúp bạn chỉnh phát âm ngữ điệu chuẩn Kansai và Tokyo.",
    jlptLevel: "Native (Bản xứ)",
    interests: ["Nhiếp ảnh", "Đền chùa cổ", "Trà đạo"],
    greeting: "やあ！こんにちは。京都の健二です。発音の練習でも雑談でも、何でも気軽に話してね！",
    greetingRomaji: "Yaa! Konnichiwa. Kyoto no Kenji desu. Hatsuon no renshuu demo zatsudan demo, nan demo kigaru ni hanashite ne!",
    greetingVi: "Chào bạn! Mình là Kenji ở Kyoto. Luyện phát âm hay trò chuyện tự do gì cũng thoải mái nhé!"
  },
  {
    id: "yuto_osaka",
    name: "Yuto Yamada",
    japaneseName: "山田 ゆうと",
    age: 19,
    city: "Osaka (Namba)",
    avatarEmoji: "🐙",
    avatarBg: "linear-gradient(135deg, #bae6fd, #0284c7)",
    title: "Vua trò chuyện Osaka • Vui tính & Năng động",
    bio: "Học ngoại ngữ thì không được sợ sai nha! Cứ tự tin chém gió tiếng Nhật hết mình!",
    jlptLevel: "Native (Bản xứ)",
    interests: ["Takoyaki", "Game RPG", "Manga One Piece"],
    greeting: "こんにちはー！大阪のゆうとやで！緊張せんと、リラックスして楽しく日本語しゃべろな！",
    greetingRomaji: "Konnichiwa! Oosaka no Yuto ya de! Kinchou sento, rirakkusu shite tanoshiku Nihongo shabero na!",
    greetingVi: "Xin chào nha! Mình là Yuto ở Osaka đây! Đừng căng thẳng, cứ thả lỏng nói tiếng Nhật nhé!"
  },
  {
    id: "aoi_yokohama",
    name: "Aoi Suzuki",
    japaneseName: "鈴木 あおい",
    age: 21,
    city: "Yokohama",
    avatarEmoji: "🌊",
    avatarBg: "linear-gradient(135deg, #ddd6fe, #7c3aed)",
    title: "Yêu thích Việt Nam • Rất mê Phở & Cà phê sữa đá",
    bio: "Mình từng đi du lịch Đà Nẵng và Hà Nội rồi, mê đồ ăn Việt Nam lắm! Cùng luyện tiếng Nhật nha.",
    jlptLevel: "Native (Bản xứ)",
    interests: ["Ẩm thực Việt", "Âm nhạc J-Pop", "Du lịch biển"],
    greeting: "初めまして！あおいです。ベトナムが大好きです。あなたの今日の日本語学習はどうですか？",
    greetingRomaji: "Hajimemashite! Aoi desu. Betonamu ga daisuki desu. Anata no kyou no Nihongo gakushuu wa dou desu ka?",
    greetingVi: "Chào bạn! Mình là Aoi. Mình thích Việt Nam lắm. Hôm nay bạn học tiếng Nhật thế nào rồi?"
  }
];

// Các mẫu câu phản xạ nhanh (Quick Kaiwa Phrases)
export const QUICK_KAIWA_PHRASES = [
  {
    ja: "こんにちは！はじめまして！",
    romaji: "Konnichiwa! Hajimemashite!",
    vi: "Xin chào! Rất vui được gặp bạn!"
  },
  {
    ja: "ベトナムから来ました。",
    romaji: "Betonamu kara kimashita.",
    vi: "Tôi đến từ Việt Nam."
  },
  {
    ja: "日本語を勉強して3ヶ月です。",
    romaji: "Nihongo wo benkyou shite sankagetsu desu.",
    vi: "Tôi đã học tiếng Nhật được 3 tháng rồi."
  },
  {
    ja: "もう一度ゆっくり言ってください。",
    romaji: "Mou ichido yukkuri itte kudasai.",
    vi: "Xin hãy nói lại chậm hơn một chút ạ."
  },
  {
    ja: "日本のアニメや文化が大好きです！",
    romaji: "Nihon no anime ya bunka ga daisuki desu!",
    vi: "Tôi rất thích Anime và văn hóa Nhật Bản!"
  },
  {
    ja: "それはとても面白いですね！",
    romaji: "Sore wa totemo omoshiroi desu ne!",
    vi: "Điều đó thú vị thật đấy!"
  },
  {
    ja: "今日はありがとう！また話しましょう！",
    romaji: "Kyou wa arigatou! Mata hanashimashou!",
    vi: "Hôm nay cảm ơn bạn nhiều! Hẹn gặp lại nhé!"
  }
];

// Quản lý trạng thái OmeNihongo
class OmeNihongoManager {
  constructor() {
    this.status = "idle"; // "idle" | "searching" | "connected"
    this.currentPartner = null;
    this.localStream = null;
    this.isMicMuted = false;
    this.isCameraOff = false;
    this.activeTab = "omenihongo"; // "omenihongo" | "feed" | "rooms"
    this.selectedLevel = "all";
    this.selectedTopic = "free";
    this.chatHistory = [];
    this.searchTimer = null;
    this.avatarAnimationId = null;
    this.speechSynthesisActive = false;
    this.lastPartnerIndex = -1;
  }

  init() {
    this.bindTabEvents();
    this.bindControlEvents();
    this.renderQuickPhrases();
    this.initLocalCameraPreview();
    this.renderSampleFeed();
    this.renderSampleRooms();
  }

  // 1. Điều khiển Tab trong trang Khám Phá
  bindTabEvents() {
    const tabs = document.querySelectorAll(".explore-nav-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-explore-tab");
        this.switchExploreTab(target);
      });
    });
  }

  switchExploreTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll(".explore-nav-tab").forEach(t => {
      if (t.getAttribute("data-explore-tab") === tabName) {
        t.classList.add("active");
      } else {
        t.classList.remove("active");
      }
    });

    document.querySelectorAll(".explore-tab-pane").forEach(pane => {
      pane.classList.remove("active");
    });
    const activePane = document.getElementById(`explore-pane-${tabName}`);
    if (activePane) {
      activePane.classList.add("active");
    }
  }

  // 2. Camera Local Preview
  async initLocalCameraPreview() {
    const localVideo = document.getElementById("ome-local-video");
    const localAvatar = document.getElementById("ome-local-avatar");
    if (!localVideo) return;

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });
        this.localStream = stream;
        localVideo.srcObject = stream;
        localVideo.play().catch(() => {});
        if (localAvatar) localAvatar.style.display = "none";
        localVideo.style.display = "block";
      }
    } catch (err) {
      console.warn("Không thể truy cập camera thực (hoặc người dùng từ chối):", err);
      // Fallback sang avatar sóng âm cho local
      if (localVideo) localVideo.style.display = "none";
      if (localAvatar) localAvatar.style.display = "flex";
      this.isCameraOff = true;
      this.updateMediaButtonsState();
    }
  }

  // 3. Đăng ký các sự kiện nút điều khiển OmeTV
  bindControlEvents() {
    // Nút Bắt đầu tìm kiếm
    const startBtn = document.getElementById("ome-start-btn");
    if (startBtn) {
      startBtn.onclick = () => this.startSearch();
    }

    // Nút Next (Tìm bạn khác)
    const nextBtn = document.getElementById("ome-next-btn");
    if (nextBtn) {
      nextBtn.onclick = () => this.nextPartner();
    }

    // Nút Dừng lại (Stop)
    const stopBtn = document.getElementById("ome-stop-btn");
    if (stopBtn) {
      stopBtn.onclick = () => this.stopCall();
    }

    // Phím tắt bàn phím: Phím Space hoặc Enter để bấm Next nhanh như OmeTV
    window.addEventListener("keydown", (e) => {
      const exploreView = document.getElementById("explore-view");
      const isVisible = exploreView && exploreView.classList.contains("active");
      if (!isVisible || this.activeTab !== "omenihongo") return;

      // Tránh bắt phím khi đang gõ vào input chat
      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
        return;
      }

      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        if (this.status === "idle") {
          this.startSearch();
        } else {
          this.nextPartner();
        }
      } else if (e.key === "Escape") {
        this.stopCall();
      }
    });

    // Nút Toggle Mic
    const toggleMicBtn = document.getElementById("ome-toggle-mic-btn");
    if (toggleMicBtn) {
      toggleMicBtn.onclick = () => {
        this.isMicMuted = !this.isMicMuted;
        if (this.localStream) {
          this.localStream.getAudioTracks().forEach(track => {
            track.enabled = !this.isMicMuted;
          });
        }
        this.updateMediaButtonsState();
        playSynthSound("bubble");
      };
    }

    // Nút Toggle Camera
    const toggleCamBtn = document.getElementById("ome-toggle-cam-btn");
    if (toggleCamBtn) {
      toggleCamBtn.onclick = () => {
        this.isCameraOff = !this.isCameraOff;
        const localVideo = document.getElementById("ome-local-video");
        const localAvatar = document.getElementById("ome-local-avatar");

        if (this.localStream) {
          this.localStream.getVideoTracks().forEach(track => {
            track.enabled = !this.isCameraOff;
          });
        }

        if (this.isCameraOff) {
          if (localVideo) localVideo.style.display = "none";
          if (localAvatar) localAvatar.style.display = "flex";
        } else {
          if (localVideo) localVideo.style.display = "block";
          if (localAvatar) localAvatar.style.display = "none";
        }

        this.updateMediaButtonsState();
        playSynthSound("bubble");
      };
    }

    // Bộ lọc Cấp độ & Chủ đề
    const levelSelect = document.getElementById("ome-level-filter");
    if (levelSelect) {
      levelSelect.onchange = (e) => {
        this.selectedLevel = e.target.value;
      };
    }

    const topicSelect = document.getElementById("ome-topic-filter");
    if (topicSelect) {
      topicSelect.onchange = (e) => {
        this.selectedTopic = e.target.value;
      };
    }

    // Khung Chat tin nhắn
    const chatForm = document.getElementById("ome-chat-form");
    const chatInput = document.getElementById("ome-chat-input");
    if (chatForm && chatInput) {
      chatForm.onsubmit = (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;
        this.sendChatMessage(text);
        chatInput.value = "";
      };
    }

    // Nút thả tim phản hồi cho bạn học
    const heartBtn = document.getElementById("ome-send-heart-btn");
    if (heartBtn) {
      heartBtn.onclick = () => {
        if (this.status !== "connected") return;
        this.triggerHeartFloating();
        playSynthSound("chime");
        if (this.currentPartner) {
          this.addSystemMessage(`Bạn vừa gửi tặng ❤️ yêu thương đến ${this.currentPartner.name}!`);
          setTimeout(() => {
            this.receivePartnerReply("ありがとう！とても嬉しいです (Cảm ơn bạn nhé! Mình rất vui) ✨");
          }, 1200);
        }
      };
    }
  }

  updateMediaButtonsState() {
    const micBtn = document.getElementById("ome-toggle-mic-btn");
    if (micBtn) {
      micBtn.classList.toggle("is-muted", this.isMicMuted);
      micBtn.innerHTML = this.isMicMuted
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg><span>Mic: Tắt</span>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg><span>Mic: Bật</span>`;
    }

    const camBtn = document.getElementById("ome-toggle-cam-btn");
    if (camBtn) {
      camBtn.classList.toggle("is-muted", this.isCameraOff);
      camBtn.innerHTML = this.isCameraOff
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21l-3.6-3.6M1 1l22 22M21 7l-5.3 4M23 7v10"/><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg><span>Cam: Tắt</span>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg><span>Cam: Bật</span>`;
    }
  }

  // 4. Bắt đầu tìm bạn ngẫu nhiên
  startSearch() {
    this.status = "searching";
    playSynthSound("bubble");
    this.updateStatusUI();
    this.clearChat();

    // Giả lập thời gian quét ghép đôi 1.2 - 2.0 giây
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.connectRandomPartner();
    }, 1400);
  }

  // 5. Chuyển sang bạn khác (Next / Skip)
  nextPartner() {
    playSynthSound("bubble");
    if (this.currentPartner) {
      this.addSystemMessage(`Đã ngắt kết nối với ${this.currentPartner.name}. Đang tìm bạn mới...`);
    }
    this.stopAvatarAnimation();
    this.startSearch();
  }

  // 6. Dừng cuộc gọi
  stopCall() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.stopAvatarAnimation();
    this.status = "idle";
    this.currentPartner = null;
    this.updateStatusUI();
    this.addSystemMessage("Cuộc đàm thoại đã kết thúc. Nhấn 'Bắt đầu ghép đôi' để tìm bạn mới!");
    playSynthSound("bubble");
  }

  // 7. Kết nối với Bạn học ngẫu nhiên
  connectRandomPartner() {
    this.status = "connected";

    // Chọn ngẫu nhiên bạn học từ Roster (tránh trùng người vừa gặp)
    let partnerIndex;
    do {
      partnerIndex = Math.floor(Math.random() * AI_KAIWA_PARTNERS.length);
    } while (partnerIndex === this.lastPartnerIndex && AI_KAIWA_PARTNERS.length > 1);
    this.lastPartnerIndex = partnerIndex;

    this.currentPartner = AI_KAIWA_PARTNERS[partnerIndex];
    playSynthSound("chime");

    this.updateStatusUI();
    this.renderPartnerVideoScreen(this.currentPartner);

    // Chào hỏi ban đầu
    this.addSystemMessage(`🎉 Đã kết nối thành công với ${this.currentPartner.name} từ ${this.currentPartner.city}!`);
    setTimeout(() => {
      this.receivePartnerReply(this.currentPartner.greeting, this.currentPartner.greetingRomaji, this.currentPartner.greetingVi);
    }, 800);
  }

  // 8. Cập nhật giao diện theo trạng thái (idle, searching, connected)
  updateStatusUI() {
    const statusOverlay = document.getElementById("ome-remote-overlay");
    const statusPill = document.getElementById("ome-status-pill");
    const partnerInfoBar = document.getElementById("ome-partner-info-bar");
    const startBtn = document.getElementById("ome-start-btn");
    const nextBtn = document.getElementById("ome-next-btn");
    const stopBtn = document.getElementById("ome-stop-btn");

    if (this.status === "idle") {
      if (statusPill) statusPill.innerHTML = `<span class="dot dot-idle"></span> Sẵn sàng`;
      if (statusOverlay) {
        statusOverlay.style.display = "flex";
        statusOverlay.innerHTML = `
          <div class="ome-idle-hero">
            <div class="ome-radar-ring ring-static">📹</div>
            <h3>OmeNihongo - Ghép Đôi Kaiwa 1-1</h3>
            <p>Bấm nút bên dưới để ghép cặp ngẫu nhiên với bạn học Nhật Bản! Cùng nhau luyện phản xạ giao tiếp tự tin.</p>
            <div class="ome-keyboard-hint">💡 Nhấn <kbd>Space</kbd> hoặc <kbd>Enter</kbd> để tìm bạn mới nhanh</div>
          </div>
        `;
      }
      if (partnerInfoBar) partnerInfoBar.style.display = "none";
      if (startBtn) startBtn.style.display = "inline-flex";
      if (nextBtn) nextBtn.style.display = "none";
      if (stopBtn) stopBtn.style.display = "none";
    } else if (this.status === "searching") {
      if (statusPill) statusPill.innerHTML = `<span class="dot dot-searching"></span> Đang quét tìm bạn học...`;
      if (statusOverlay) {
        statusOverlay.style.display = "flex";
        statusOverlay.innerHTML = `
          <div class="ome-searching-hero">
            <div class="ome-radar-ring ring-pulsing">📡</div>
            <h3>Đang tìm bạn học phù hợp...</h3>
            <p>Bộ lọc: <strong>${this.getLevelLabel(this.selectedLevel)}</strong> • <strong>${this.getTopicLabel(this.selectedTopic)}</strong></p>
          </div>
        `;
      }
      if (partnerInfoBar) partnerInfoBar.style.display = "none";
      if (startBtn) startBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "inline-flex";
      if (stopBtn) stopBtn.style.display = "inline-flex";
    } else if (this.status === "connected") {
      if (statusPill) statusPill.innerHTML = `<span class="dot dot-live"></span> Đang kết nối trực tiếp`;
      if (statusOverlay) statusOverlay.style.display = "none";
      if (partnerInfoBar) {
        partnerInfoBar.style.display = "flex";
        this.renderPartnerInfoBar(this.currentPartner);
      }
      if (startBtn) startBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "inline-flex";
      if (stopBtn) stopBtn.style.display = "inline-flex";
    }
  }

  getLevelLabel(level) {
    const map = {
      all: "Mọi cấp độ",
      n5: "N5 (Minna sơ cấp)",
      n4: "N4 (Giao tiếp cơ bản)",
      n3: "N3 (Hội thoại tự nhiên)",
      free: "Kaiwa tự do"
    };
    return map[level] || "Tự do";
  }

  getTopicLabel(topic) {
    const map = {
      free: "Chủ đề tự do",
      intro: "Tự giới thiệu bản thân",
      hobbies: "Sở thích & Anime",
      travel: "Du lịch Nhật Bản",
      qa: "Hỏi đáp bài tập"
    };
    return map[topic] || "Tự do";
  }

  renderPartnerInfoBar(partner) {
    const nameEl = document.getElementById("ome-partner-name");
    const metaEl = document.getElementById("ome-partner-meta");
    const badgeEl = document.getElementById("ome-partner-badge");

    if (nameEl) nameEl.textContent = `${partner.name} (${partner.japaneseName})`;
    if (metaEl) metaEl.textContent = `📍 ${partner.city} • 🎂 ${partner.age} tuổi • ${partner.title}`;
    if (badgeEl) badgeEl.textContent = partner.jlptLevel;
  }

  // 9. Vẽ màn hình Canvas video mô phỏng động của bạn học Nhật Bản
  renderPartnerVideoScreen(partner) {
    const canvas = document.getElementById("ome-remote-canvas");
    if (!canvas) return;

    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, 640, 480);

      // Nền phòng học kiểu Nhật Bản ấm cúng
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, "#1e293b");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Khung rèm cửa gỗ Shoji mờ ảo phía sau
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(60 + i * 140, 40, 100, 220);
      }

      // Vòng tròn hào quang sóng âm (nếu đang phát âm)
      const isSpeaking = this.speechSynthesisActive;
      const pulseSize = isSpeaking ? Math.sin(frame * 0.2) * 14 : Math.sin(frame * 0.05) * 4;

      ctx.save();
      ctx.beginPath();
      ctx.arc(320, 200, 95 + pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking ? "rgba(14, 165, 233, 0.25)" : "rgba(244, 63, 94, 0.15)";
      ctx.fill();
      ctx.restore();

      // Vòng tròn avatar chính
      ctx.save();
      ctx.beginPath();
      ctx.arc(320, 200, 85, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = isSpeaking ? "#38bdf8" : "#f43f5e";
      ctx.stroke();

      // Nền bên trong avatar
      ctx.beginPath();
      ctx.arc(320, 200, 82, 0, Math.PI * 2);
      const innerGrad = ctx.createLinearGradient(240, 120, 400, 280);
      innerGrad.addColorStop(0, "#fde047");
      innerGrad.addColorStop(1, "#f43f5e");
      ctx.fillStyle = innerGrad;
      ctx.fill();

      // Icon biểu cảm lớn
      ctx.font = "80px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(partner.avatarEmoji, 320, 205);
      ctx.restore();

      // Chữ hiển thị tên & trạng thái dưới video
      ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`${partner.name} 🇯🇵`, 320, 330);

      ctx.font = "14px -apple-system, sans-serif";
      ctx.fillStyle = isSpeaking ? "#38bdf8" : "#94a3b8";
      ctx.fillText(isSpeaking ? "🔊 Đang nói chuyện cùng bạn..." : `📍 ${partner.city} • Đang lắng nghe bạn`, 320, 360);

      // Huy hiệu HD Peer-to-Peer
      ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
      ctx.roundRect(20, 20, 160, 28, 6);
      ctx.fill();
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#10b981";
      ctx.textAlign = "left";
      ctx.fillText("● HD P2P • 24ms", 32, 38);

      this.avatarAnimationId = requestAnimationFrame(animate);
    };

    this.stopAvatarAnimation();
    animate();
  }

  stopAvatarAnimation() {
    if (this.avatarAnimationId) {
      cancelAnimationFrame(this.avatarAnimationId);
      this.avatarAnimationId = null;
    }
  }

  // 10. Gửi và nhận tin nhắn Chat
  sendChatMessage(text) {
    if (this.status !== "connected") {
      this.addSystemMessage("Bạn cần bấm 'Bắt đầu ghép đôi' để kết nối với bạn học trước khi chat!");
      return;
    }

    this.addChatMessage({
      sender: "me",
      text,
      time: this.getCurrentTimeString()
    });
    playSynthSound("bubble");

    // Bạn học AI phản hồi lại tin nhắn
    setTimeout(() => {
      this.generateSmartPartnerReply(text);
    }, 1000 + Math.random() * 800);
  }

  generateSmartPartnerReply(userText) {
    if (!this.currentPartner) return;
    const lower = userText.toLowerCase();

    let replyJa = "うん、よく分かります！日本語がとても上手ですね。";
    let replyRomaji = "Un, yoku wakarimasu! Nihongo ga totemo jouzu desu ne.";
    let replyVi = "Vâng, mình hiểu rồi! Tiếng Nhật của bạn tốt thật đấy.";

    if (lower.includes("konnichiwa") || lower.includes("chào") || lower.includes("hello") || lower.includes("こんにちは")) {
      replyJa = `こんにちは！お会いできて嬉しいです。調子はどうですか？`;
      replyRomaji = "Konnichiwa! Oaidekite ureshii desu. Choushi wa dou desu ka?";
      replyVi = "Chào bạn nha! Rất vui được gặp bạn. Hôm nay tâm trạng bạn thế nào?";
    } else if (lower.includes("vietnam") || lower.includes("betonamu") || lower.includes("ベトナム")) {
      replyJa = "ベトナムですか！フォーやバインミーが大好きです。いつかハノイに行ってみたいです！";
      replyRomaji = "Betonamu desu ka! Foo ya bainmii ga daisuki desu. Itsuka Hanoi ni itte mitai desu!";
      replyVi = "Việt Nam hả bạn! Mình mê Phở với Bánh mì lắm. Khi nào nhất định mình sẽ tới Hà Nội du lịch!";
    } else if (lower.includes("anime") || lower.includes("manga") || lower.includes("アニメ")) {
      replyJa = "アニメが好きなんですか！最近のおすすめは『呪術廻戦』と『鬼滅の刃』ですよ。何が好きですか？";
      replyRomaji = "Anime ga suki nan desu ka! Saikin no osusume wa Jujutsu Kaisen to Kimetsu no Yaiba desu yo.";
      replyVi = "Bạn cũng mê Anime à! Gần đây mình ghiền Jujutsu Kaisen và Kimetsu no Yaiba lắm. Bạn thích bộ nào?";
    } else if (lower.includes("jlpt") || lower.includes("n5") || lower.includes("n4") || lower.includes("học")) {
      replyJa = "JLPTに向けて頑張っているんですね！毎日のコツコツ練習が一番大切ですよ。応援しています！";
      replyRomaji = "JLPT ni mukete ganbatte irun desu ne! Mainichi no kotsukotsu renshuu ga ichiban taisetsu desu yo.";
      replyVi = "Bạn đang ôn luyện thi JLPT đó hả! Học mỗi ngày một chút là chìa khóa quan trọng nhất. Cố lên nhé!";
    } else if (lower.includes("arigatou") || lower.includes("cảm ơn") || lower.includes("ありがとう")) {
      replyJa = "どういたしまして！またいつでも気軽に話しかけてくださいね！";
      replyRomaji = "Douitashimashite! Mata itsudemo kigaru ni hanashikakete kudasai ne!";
      replyVi = "Không có chi đâu bạn! Lần sau cứ thoải mái trò chuyện cùng mình nhé!";
    }

    this.receivePartnerReply(replyJa, replyRomaji, replyVi);
  }

  receivePartnerReply(textJa, textRomaji = "", textVi = "") {
    this.addChatMessage({
      sender: "partner",
      name: this.currentPartner?.name || "Bạn học",
      text: textJa,
      romaji: textRomaji,
      vi: textVi,
      time: this.getCurrentTimeString()
    });

    playSynthSound("chime");

    // Đọc bằng giọng tiếng Nhật Web Speech Synthesis
    this.speakJapaneseText(textJa);
  }

  speakJapaneseText(text) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.95;

      this.speechSynthesisActive = true;
      utterance.onend = () => {
        this.speechSynthesisActive = false;
      };
      utterance.onerror = () => {
        this.speechSynthesisActive = false;
      };
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.speechSynthesisActive = false;
    }
  }

  addChatMessage(msg) {
    this.chatHistory.push(msg);
    const container = document.getElementById("ome-chat-messages");
    if (!container) return;

    const isMe = msg.sender === "me";
    const msgEl = document.createElement("div");
    msgEl.className = `ome-msg-bubble ${isMe ? 'msg-me' : 'msg-partner'}`;

    msgEl.innerHTML = `
      <div class="msg-meta">
        <strong>${isMe ? 'Bạn' : msg.name}</strong>
        <span class="msg-time">${msg.time}</span>
      </div>
      <div class="msg-body-ja">${msg.text}</div>
      ${msg.romaji ? `<div class="msg-body-romaji">${msg.romaji}</div>` : ''}
      ${msg.vi ? `<div class="msg-body-vi">💡 ${msg.vi}</div>` : ''}
    `;

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  addSystemMessage(text) {
    const container = document.getElementById("ome-chat-messages");
    if (!container) return;

    const sysEl = document.createElement("div");
    sysEl.className = "ome-msg-system";
    sysEl.innerHTML = `<span>🔔 ${text}</span>`;
    container.appendChild(sysEl);
    container.scrollTop = container.scrollHeight;
  }

  clearChat() {
    this.chatHistory = [];
    const container = document.getElementById("ome-chat-messages");
    if (container) container.innerHTML = "";
  }

  renderQuickPhrases() {
    const container = document.getElementById("ome-quick-phrases-list");
    if (!container) return;

    container.innerHTML = QUICK_KAIWA_PHRASES.map(p => {
      return `
        <button type="button" class="btn-quick-phrase" data-phrase="${p.ja}" title="${p.vi}">
          <span class="phrase-ja">${p.ja}</span>
          <span class="phrase-sub">${p.romaji}</span>
        </button>
      `;
    }).join("");

    container.querySelectorAll(".btn-quick-phrase").forEach(btn => {
      btn.onclick = () => {
        const phrase = btn.getAttribute("data-phrase");
        this.sendChatMessage(phrase);
      };
    });
  }

  triggerHeartFloating() {
    const viewport = document.querySelector(".ome-video-panel");
    if (!viewport) return;

    for (let i = 0; i < 6; i++) {
      const heart = document.createElement("div");
      heart.className = "floating-heart-anim";
      heart.textContent = "❤️";
      heart.style.left = `${30 + Math.random() * 40}%`;
      heart.style.bottom = "80px";
      heart.style.fontSize = `${20 + Math.random() * 16}px`;
      heart.style.animationDuration = `${1.2 + Math.random() * 0.8}s`;
      viewport.appendChild(heart);

      setTimeout(() => heart.remove(), 2000);
    }
  }

  getCurrentTimeString() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // 11. Render demo Bảng tin Facebook (Nihongo Community Feed)
  renderSampleFeed() {
    const container = document.getElementById("explore-feed-container");
    if (!container) return;

    container.innerHTML = `
      <div class="fb-feed-wrap">
        <!-- Post Composer -->
        <div class="fb-composer-card glass-panel">
          <div class="composer-top">
            <span class="composer-avatar">🦊</span>
            <input type="text" id="fb-composer-input" placeholder="Hôm nay bạn học được từ vựng tiếng Nhật gì mới? Chia sẻ cùng lớp nhé..." />
          </div>
          <div class="composer-actions">
            <button type="button" class="btn-composer-tag"><span class="icon">🖼️</span> Ảnh/Video</button>
            <button type="button" class="btn-composer-tag"><span class="icon">🏷️</span> #HỏiĐápN5</button>
            <button type="button" class="btn-composer-tag"><span class="icon">🐟</span> #KhoeBểCá</button>
            <button type="button" class="btn btn-primary btn-sm" id="fb-post-submit-btn">Đăng bài</button>
          </div>
        </div>

        <!-- Sample Post 1 -->
        <div class="fb-post-card glass-panel">
          <div class="post-header">
            <div class="post-author-box">
              <span class="author-avatar">🐉</span>
              <div class="author-meta">
                <h4>Yamato H. <span class="verified-badge">✓ Top Tuần</span></h4>
                <span class="post-time">25 phút trước • 🌐 Công khai</span>
              </div>
            </div>
            <span class="post-topic-tag">#KhoeBểCá</span>
          </div>
          <div class="post-content">
            Vừa rước được em Koi Hoàng Gia Rồng Vàng sau chuỗi 60 ngày cày N5 không nghỉ ngày nào các bác ạ! Bể bơi phát quang lấp lánh nhìn mê thực sự ✨ Mọi người ghé qua bể mình cho ăn hộ lấy Xu nhé!
          </div>
          <div class="post-media-box">
            <div class="sample-media-card">
              <span>🐟✨ <strong>Bể Cá Zen: Yamato H.</strong> • 7 Chú Koi • 184 Lượt Thích</span>
            </div>
          </div>
          <div class="post-stats-strip">
            <span>👍❤️😮 42 lượt thích</span>
            <span>💬 8 bình luận</span>
          </div>
          <div class="post-action-bar">
            <button type="button" class="post-action-btn">👍 Thích</button>
            <button type="button" class="post-action-btn">💬 Bình luận</button>
            <button type="button" class="post-action-btn">↗ Chia sẻ</button>
          </div>
        </div>

        <!-- Sample Post 2 -->
        <div class="fb-post-card glass-panel">
          <div class="post-header">
            <div class="post-author-box">
              <span class="author-avatar">🌸</span>
              <div class="author-meta">
                <h4>Sakura Lan</h4>
                <span class="post-time">1 giờ trước • 🌐 Minna N5</span>
              </div>
            </div>
            <span class="post-topic-tag">#HỏiĐápNgữPháp</span>
          </div>
          <div class="post-content">
            Mn cho mình hỏi phân biệt trợ từ 「に」 và 「へ」 khi đi với động từ chỉ phương hướng 行きます với ạ, trong bài 5 Minna nhiều câu dùng cả 2 mà mình hơi rối 😭
          </div>
          <div class="post-comments-wrap">
            <div class="post-comment-item">
              <span class="comment-avatar">🥋</span>
              <div class="comment-bubble">
                <strong>Kenji Hoàng:</strong> Về cơ bản 「へ」 nhấn mạnh phương hướng/hướng tới, còn 「に」 nhấn mạnh đích đến cuối cùng nha bạn ơi! Cả hai đều dùng được với 行きます nhen.
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Nút đăng bài giả lập
    const postSubmitBtn = document.getElementById("fb-post-submit-btn");
    const inputEl = document.getElementById("fb-composer-input");
    if (postSubmitBtn && inputEl) {
      postSubmitBtn.onclick = () => {
        const val = inputEl.value.trim();
        if (!val) return;
        playSynthSound("chime");
        alert("Bài viết của bạn đã được đăng lên Bảng Tin Cộng Đồng!");
        inputEl.value = "";
      };
    }
  }

  // 12. Render demo Phòng Học & Chill Nhóm (Study & Chill Rooms)
  renderSampleRooms() {
    const container = document.getElementById("explore-rooms-container");
    if (!container) return;

    container.innerHTML = `
      <div class="study-rooms-wrap">
        <div class="rooms-header-strip">
          <div>
            <h3>🎧 Không Gian Học Tập &amp; Lofi Nhóm</h3>
            <p>Tham gia các phòng học tự do, bật nhạc Lofi cùng nhau, Pomodoro tập trung và giao lưu đàm thoại.</p>
          </div>
          <button type="button" class="btn btn-primary" id="btn-create-room">
            + Tạo Phòng Mới
          </button>
        </div>

        <div class="rooms-grid">
          <div class="room-card glass-panel">
            <div class="room-top">
              <span class="room-icon">☕</span>
              <span class="room-live-pill">LIVE 8 bạn</span>
            </div>
            <h4>Phòng Pomodoro Tự Học N5 (Chế độ Im Lặng)</h4>
            <p>Mở nhạc Lofi Beats nhẹ nhàng, đếm ngược 25 phút học tập nghiêm túc không sao nhãng.</p>
            <div class="room-host">👑 Chủ phòng: <strong>Yamato Sensei</strong></div>
            <div class="room-footer">
              <span class="room-music-tag">🎵 Lofi Chill Beats</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="alert('Đã tham gia phòng học Pomodoro!')">Tham gia ➔</button>
            </div>
          </div>

          <div class="room-card glass-panel">
            <div class="room-top">
              <span class="room-icon">🌸</span>
              <span class="room-live-pill">LIVE 5 bạn</span>
            </div>
            <h4>Đàm Thoại Kaiwa Minna Bài 1 - Bài 10</h4>
            <p>Chủ phòng mở mic cho từng thành viên thực hành chào hỏi và hỏi thăm quê quán.</p>
            <div class="room-host">👑 Chủ phòng: <strong>Sakura Lan</strong></div>
            <div class="room-footer">
              <span class="room-music-tag">🎙️ Bật mic tự do</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="alert('Đã tham gia phòng đàm thoại Kaiwa!')">Tham gia ➔</button>
            </div>
          </div>

          <div class="room-card glass-panel">
            <div class="room-top">
              <span class="room-icon">🎮</span>
              <span class="room-live-pill">LIVE 12 bạn</span>
            </div>
            <h4>Góc Game Vui: Đấu Trí Kanji N5</h4>
            <p>Cùng nhau lật thẻ và thi đấu trả lời ý nghĩa Kanji, người thắng nhận Xu bể cá.</p>
            <div class="room-host">👑 Chủ phòng: <strong>Kenji Hoàng</strong></div>
            <div class="room-footer">
              <span class="room-music-tag">🏆 Đua Top Xu</span>
              <button type="button" class="btn btn-secondary btn-sm" onclick="alert('Đã tham gia phòng game Kanji!')">Tham gia ➔</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const createBtn = document.getElementById("btn-create-room");
    if (createBtn) {
      createBtn.onclick = () => {
        alert("Tính năng Tạo Phòng Riêng: Chủ phòng có quyền bật/tắt nhạc Lofi và cấp quyền phát biểu cho thành viên!");
      };
    }
  }
}

// Singleton Manager
let omenihongoManagerInstance = null;

export function setupOmeNihongoUI(targetTab = "omenihongo") {
  if (!omenihongoManagerInstance) {
    omenihongoManagerInstance = new OmeNihongoManager();
    omenihongoManagerInstance.init();
  }
  if (targetTab) {
    omenihongoManagerInstance.switchExploreTab(targetTab);
  }
}
