/**
 * ============================================================================
 * OMENIHONGO - GHÉP ĐÔI GỌI VIDEO/VOICE RANDOM 1-1 & KHÁM PHÁ CỘNG ĐỒNG
 * Hỗ trợ 2 chế độ độc lập và minh bạch 100%:
 *   1. 👥 Ghép đôi Người Thật (Real WebRTC P2P OmeTV): Không giả lập bot,
 *      tìm người thật trực tuyến, hỗ trợ tạo link phòng mời bạn bè trực tiếp.
 *   2. 🤖 Luyện Kaiwa với Trợ Lý AI: Minh bạch luyện tập cùng Sensei ảo,
 *      không tìm ảo, nhận diện giọng nói qua mic & phản hồi tiếng Nhật bản xứ.
 * ============================================================================
 */

import { playSynthSound } from "./aquarium.js";
import { supabase } from "./supabase.js";

// Danh sách các Sensei AI (dành riêng cho chế độ Trợ Lý AI)
export const AI_KAIWA_SENSEIS = [
  {
    id: "sakura_tokyo",
    name: "Tanaka Sakura Sensei",
    japaneseName: "田中 さくら 先生",
    city: "Tokyo",
    avatarEmoji: "🌸",
    role: "Trợ giảng Kaiwa N5 - Sơ cấp",
    bio: "Kiên nhẫn, phát âm chậm rãi, chuyên hỗ trợ học viên Minna N5 sửa lỗi ngữ pháp.",
    greeting: "こんにちは！さくら先生です。緊張しないで、ゆっくり日本語で話してみましょうね！",
    greetingRomaji: "Konnichiwa! Sakura-sensei desu. Kinchou shinaide, yukkuri Nihongo de hanashite mimashou ne!",
    greetingVi: "Xin chào bạn! Cô Sakura đây. Đừng căng thẳng nhé, hãy cùng nói tiếng Nhật thật chậm rãi nào!"
  },
  {
    id: "kenji_kyoto",
    name: "Sato Kenji Sensei",
    japaneseName: "佐藤 健二 先生",
    city: "Kyoto",
    avatarEmoji: "⛩️",
    role: "Giáo viên Kaiwa N4 - Tự nhiên",
    bio: "Hướng dẫn ngữ điệu bản xứ tự nhiên, luyện tập giao tiếp hàng ngày và phỏng vấn.",
    greeting: "こんにちは！健二先生です。今日はどんな日本語の練習をしたいですか？何でも聞いてください！",
    greetingRomaji: "Konnichiwa! Kenji-sensei desu. Kyou wa donna Nihongo no renshuu wo shitai desu ka? Nan demo kiite kudasai!",
    greetingVi: "Chào bạn! Thầy Kenji đây. Hôm nay bạn muốn luyện tập chủ đề tiếng Nhật nào? Cứ thoải mái hỏi nhé!"
  },
  {
    id: "yuto_osaka",
    name: "Yamada Yuto Sensei",
    japaneseName: "山田 ゆうと 先生",
    city: "Osaka",
    avatarEmoji: "🐙",
    role: "Kaiwa Tự Do & Phản Xạ Hài Hước",
    bio: "Phong cách Kansai vui nhộn, giúp bạn bứt phá rào cản sợ nói sai khi học ngoại ngữ.",
    greeting: "まいど！ゆうと先生やで！間違えても全然気にせんと、大きな声で楽しく話そな！",
    greetingRomaji: "Maido! Yuto-sensei ya de! Machigaetemo zenzen ki ni sento, ookina koe de tanoshiku hanaso na!",
    greetingVi: "Chào em nha! Thầy Yuto đây! Nói sai cũng chẳng sao hết, cứ tự tin nói to và vui vẻ lên nhé!"
  },
  {
    id: "aoi_yokohama",
    name: "Suzuki Aoi Sensei",
    japaneseName: "鈴木 あおい 先生",
    city: "Yokohama",
    avatarEmoji: "🌊",
    role: "Giao tiếp Đời sống & Văn hóa",
    bio: "Rất yêu thích văn hóa Việt Nam, cùng đàm thoại về sở thích, ẩm thực và du lịch.",
    greeting: "はじめまして！あおい先生です。日本の文化やアニメについて、楽しくおしゃべりしましょう！",
    greetingRomaji: "Hajimemashite! Aoi-sensei desu. Nihon no bunka ya anime ni tsuite, tanoshiku oshaberi shimashou!",
    greetingVi: "Rất vui được gặp bạn! Cô Aoi đây. Chúng ta hãy cùng trò chuyện vui vẻ về văn hóa và Anime nhé!"
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
    this.mode = "real"; // "real" (Ghép người thật) | "ai" (Trợ lý AI Sensei)
    this.status = "idle"; // "idle" | "searching" | "connected"
    this.myPeerId = `user_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 5)}`;
    this.currentRoom = "public_lobby";
    this.matchedPeerId = null;
    this._myRoomCode = null;

    // WebRTC connection & Remote Media state
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.isMicMuted = false;
    this.isCameraOff = false;
    this.remoteCamOff = false;
    this.remoteMicMuted = false;
    this.layoutMode = "split"; // "split" (50:50 OmeTV) | "pip"

    // Signaling channels (BroadcastChannel cho cùng máy/2 tab + Supabase cho internet)
    this.broadcastChannel = null;
    this.supabaseChannel = null;

    // AI Mode specifics
    this.selectedSensei = AI_KAIWA_SENSEIS[0];
    this.speechSynthesisActive = false;
    this.speechRecognition = null;
    this.isListeningMic = false;
    this.avatarAnimationId = null;

    // UI state
    this.activeTab = "omenihongo";
    this.selectedLevel = "all";
    this.selectedTopic = "free";
    this.chatHistory = [];
    this.searchTimer = null;
    this.searchSeconds = 0;
    this.searchInterval = null;
  }

  init() {
    this.initSignaling();
    this.bindTabEvents();
    this.bindModeEvents();
    this.bindControlEvents();
    this.bindLayoutEvents();
    this.renderQuickPhrases();
    this.initLocalCameraPreview();
    this.setupRoomShareLink();
    this.initSpeechRecognition();
    this.renderSampleFeed();
    this.renderSampleRooms();

    // Kiểm tra query URL xem có link phòng trực tiếp không (vd: #/explore?room=xyz)
    this.checkDirectRoomUrl();
  }

  // 1. Khởi tạo Kênh Báo Hiệu (Signaling) cho WebRTC P2P Người Thật
  initSignaling() {
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        this.broadcastChannel = new BroadcastChannel("omenihongo_webrtc_signaling");
        this.broadcastChannel.onmessage = (event) => this.handleSignalingMessage(event.data);
      }
    } catch (e) {
      console.warn("BroadcastChannel không khả dụng:", e);
    }

    try {
      // Chỉ kết nối Supabase channel khi chạy trên trình duyệt thực tế (không giữ kết nối ngầm trong Node.js test)
      const isRealBrowser = typeof window !== "undefined" && typeof navigator !== "undefined" && typeof window.document?.createElement === "function" && !(typeof process !== "undefined" && process.env?.NODE_TEST_CONTEXT);
      if (isRealBrowser && supabase && typeof supabase.channel === "function") {
        this.supabaseChannel = supabase.channel("omenihongo_p2p_lobby", {
          config: { broadcast: { self: false } }
        });

        this.supabaseChannel
          .on("broadcast", { event: "signal" }, (payload) => {
            if (payload && payload.payload) {
              this.handleSignalingMessage(payload.payload);
            }
          })
          .subscribe();
      }
    } catch (e) {
      console.warn("Supabase Realtime không khả dụng:", e);
    }
  }

  sendSignal(data) {
    const payload = { ...data, senderId: this.myPeerId, room: this.currentRoom };
    if (this.broadcastChannel) {
      try { this.broadcastChannel.postMessage(payload); } catch (e) {}
    }
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: "broadcast",
          event: "signal",
          payload
        });
      } catch (e) {}
    }
  }

  handleSignalingMessage(data) {
    if (!data || data.senderId === this.myPeerId) return;
    if (this.mode !== "real") return;
    if (data.room !== this.currentRoom && this.currentRoom !== "public_lobby") return;

    if (data.type === "join_queue" && this.status === "searching") {
      // Có một người thật khác cũng đang tìm kiếm!
      // Peer có ID lớn hơn sẽ đóng vai trò Caller để tránh đụng độ
      if (this.myPeerId > data.senderId) {
        this.initiateRealCall(data.senderId);
      } else {
        this.sendSignal({ type: "queue_ack", targetId: data.senderId });
      }
    } else if (data.type === "queue_ack" && this.status === "searching" && data.targetId === this.myPeerId) {
      this.initiateRealCall(data.senderId);
    } else if (data.type === "offer" && data.targetId === this.myPeerId) {
      this.handleRealOffer(data);
    } else if (data.type === "answer" && data.targetId === this.myPeerId) {
      this.handleRealAnswer(data);
    } else if (data.type === "ice_candidate" && data.targetId === this.myPeerId) {
      this.handleRemoteIceCandidate(data.candidate);
    } else if (data.type === "peer_chat" && data.targetId === this.myPeerId) {
      this.receivePeerChatMessage(data.text, data.time);
    } else if (data.type === "media_state" && (data.targetId === this.myPeerId || data.senderId === this.matchedPeerId)) {
      this.handleRemoteMediaState(data);
    } else if (data.type === "peer_leave" && data.senderId === this.matchedPeerId) {
      this.handlePeerDisconnected();
    }
  }

  // 2. Chuyển đổi giữa 2 chế độ: Người Thật 100% vs Trợ Lý AI
  bindModeEvents() {
    const realPill = document.getElementById("ome-mode-btn-real");
    const aiPill = document.getElementById("ome-mode-btn-ai");

    if (realPill && aiPill) {
      realPill.onclick = () => {
        if (this.mode === "real") return;
        this.switchMode("real");
      };
      aiPill.onclick = () => {
        if (this.mode === "ai") return;
        this.switchMode("ai");
      };
    }

    // Chọn Sensei trong chế độ AI
    const senseiSelect = document.getElementById("ome-sensei-select");
    if (senseiSelect) {
      senseiSelect.onchange = (e) => {
        const id = e.target.value;
        const found = AI_KAIWA_SENSEIS.find(s => s.id === id);
        if (found) {
          this.selectedSensei = found;
          if (this.status === "connected" && this.mode === "ai") {
            this.renderSenseiScreen(this.selectedSensei);
            this.receiveSenseiGreeting();
          }
        }
      };
    }
  }

  switchMode(newMode) {
    this.stopCall();
    this.mode = newMode;

    const realPill = document.getElementById("ome-mode-btn-real");
    const aiPill = document.getElementById("ome-mode-btn-ai");
    const realBar = document.getElementById("ome-real-tools-bar");
    const aiBar = document.getElementById("ome-ai-tools-bar");

    if (newMode === "real") {
      if (realPill) realPill.classList.add("active");
      if (aiPill) aiPill.classList.remove("active");
      if (realBar) realBar.style.display = "flex";
      if (aiBar) aiBar.style.display = "none";
    } else {
      if (realPill) realPill.classList.remove("active");
      if (aiPill) aiPill.classList.add("active");
      if (realBar) realBar.style.display = "none";
      if (aiBar) aiBar.style.display = "flex";
    }

    this.updateStatusUI();
    playSynthSound("bubble");
  }

  // 3. Quản lý Camera Local
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
      console.warn("Không thể truy cập camera thực:", err);
      if (localVideo) localVideo.style.display = "none";
      if (localAvatar) localAvatar.style.display = "flex";
      this.isCameraOff = true;
      this.updateMediaButtonsState();
    }
  }

  // 4. Bắt đầu tìm kiếm
  startSearch() {
    this.clearChat();

    if (this.mode === "real") {
      this.status = "searching";
      this.searchSeconds = 0;
      this.updateStatusUI();
      playSynthSound("bubble");

      // Bắt đầu đếm thời gian chờ thực tế
      if (this.searchInterval) clearInterval(this.searchInterval);
      this.searchInterval = setInterval(() => {
        this.searchSeconds++;
        const timerEl = document.getElementById("ome-real-search-timer");
        if (timerEl) {
          const mins = String(Math.floor(this.searchSeconds / 60)).padStart(2, "0");
          const secs = String(this.searchSeconds % 60).padStart(2, "0");
          timerEl.textContent = `${mins}:${secs}`;
        }
      }, 1000);
      if (this.searchInterval && typeof this.searchInterval.unref === "function") {
        this.searchInterval.unref();
      }

      // Phát tín hiệu tìm người thật vào phòng
      this.sendSignal({
        type: "join_queue",
        level: this.selectedLevel,
        topic: this.selectedTopic
      });
    } else {
      // Chế độ Trợ Lý AI: Kết nối ngay với Sensei đã chọn một cách minh bạch
      this.status = "connected";
      this.updateStatusUI();
      playSynthSound("chime");
      this.renderSenseiScreen(this.selectedSensei);
      this.receiveSenseiGreeting();
    }
  }

  // 5. Kết nối WebRTC Người Thật (Caller Side)
  async initiateRealCall(targetPeerId) {
    if (this.status !== "searching") return;
    this.matchedPeerId = targetPeerId;
    this.status = "connected";
    if (this.searchInterval) clearInterval(this.searchInterval);

    this.createPeerConnection();

    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.sendSignal({
        type: "offer",
        targetId: targetPeerId,
        sdp: offer
      });
      this.updateStatusUI();
      this.broadcastMediaState();
      playSynthSound("chime");
      this.addSystemMessage(`🎉 Đã kết nối WebRTC P2P thành công với học viên trực tuyến! Hãy bật mic và chào nhau nhé.`);
    } catch (err) {
      console.error("Lỗi tạo WebRTC offer:", err);
    }
  }

  // 6. Xử lý Offer từ Peer khác (Callee Side)
  async handleRealOffer(data) {
    if (this.status !== "searching") return;
    this.matchedPeerId = data.senderId;
    this.status = "connected";
    if (this.searchInterval) clearInterval(this.searchInterval);

    this.createPeerConnection();

    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.sendSignal({
        type: "answer",
        targetId: data.senderId,
        sdp: answer
      });

      this.updateStatusUI();
      this.broadcastMediaState();
      playSynthSound("chime");
      this.addSystemMessage(`🎉 Đã kết nối WebRTC P2P thành công với học viên trực tuyến! Cùng nhau luyện Kaiwa nhé.`);
    } catch (err) {
      console.error("Lỗi trả lời WebRTC offer:", err);
    }
  }

  async handleRealAnswer(data) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        this.broadcastMediaState();
      }
    } catch (err) {
      console.error("Lỗi setRemoteDescription answer:", err);
    }
  }

  async handleRemoteIceCandidate(candidate) {
    try {
      if (this.peerConnection && candidate) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.warn("Lỗi thêm ICE Candidate:", err);
    }
  }

  createPeerConnection() {
    this.closePeerConnection();

    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    // Thêm tracks từ local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // Nhận stream từ người thật
    this.peerConnection.ontrack = (event) => {
      const remoteVideo = document.getElementById("ome-remote-video");
      const remoteCanvas = document.getElementById("ome-remote-canvas");
      if (remoteVideo && event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        remoteVideo.srcObject = event.streams[0];

        // Lắng nghe trạng thái track tắt/bật camera và mic đối phương
        const videoTracks = this.remoteStream.getVideoTracks();
        if (videoTracks.length > 0) {
          videoTracks[0].onmute = () => {
            this.remoteCamOff = true;
            this.updateRemoteMediaUI();
          };
          videoTracks[0].onunmute = () => {
            this.remoteCamOff = false;
            this.updateRemoteMediaUI();
          };
        }

        const audioTracks = this.remoteStream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioTracks[0].onmute = () => {
            this.remoteMicMuted = true;
            this.updateRemoteMediaUI();
          };
          audioTracks[0].onunmute = () => {
            this.remoteMicMuted = false;
            this.updateRemoteMediaUI();
          };
        }

        if (remoteCanvas) remoteCanvas.style.display = "none";
        this.updateRemoteMediaUI();
        remoteVideo.play().catch(() => {});
      }
    };

    // Gửi ICE Candidate
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.matchedPeerId) {
        this.sendSignal({
          type: "ice_candidate",
          targetId: this.matchedPeerId,
          candidate: event.candidate
        });
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection.connectionState === "disconnected" || this.peerConnection.connectionState === "failed") {
        this.handlePeerDisconnected();
      }
    };
  }

  handlePeerDisconnected() {
    this.closePeerConnection();
    this.status = "idle";
    this.remoteCamOff = false;
    this.remoteMicMuted = false;
    this.updateRemoteMediaUI();
    this.updateStatusUI();
    this.addSystemMessage("Bạn học trực tuyến đã ngắt kết nối. Bấm 'Bắt đầu tìm kiếm' để ghép đôi tiếp nhé!");
    playSynthSound("bubble");
  }

  closePeerConnection() {
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (e) {}
      this.peerConnection = null;
    }
    const remoteVideo = document.getElementById("ome-remote-video");
    if (remoteVideo) {
      remoteVideo.srcObject = null;
      remoteVideo.style.display = "none";
    }
    this.remoteCamOff = false;
    this.remoteMicMuted = false;
    this.updateRemoteMediaUI();
  }

  // 7. Chuyển người khác (Next / Skip)
  nextPartner() {
    playSynthSound("bubble");
    if (this.mode === "real") {
      if (this.matchedPeerId) {
        this.sendSignal({ type: "peer_leave", targetId: this.matchedPeerId });
      }
      this.closePeerConnection();
      this.startSearch();
    } else {
      // Đổi Sensei tiếp theo trong danh sách AI
      const currentIndex = AI_KAIWA_SENSEIS.findIndex(s => s.id === this.selectedSensei.id);
      const nextIndex = (currentIndex + 1) % AI_KAIWA_SENSEIS.length;
      this.selectedSensei = AI_KAIWA_SENSEIS[nextIndex];
      const senseiSelect = document.getElementById("ome-sensei-select");
      if (senseiSelect) senseiSelect.value = this.selectedSensei.id;
      this.renderSenseiScreen(this.selectedSensei);
      this.receiveSenseiGreeting();
    }
  }

  // 8. Dừng cuộc gọi
  stopCall() {
    if (this.searchInterval) clearInterval(this.searchInterval);
    if (this.mode === "real" && this.matchedPeerId) {
      this.sendSignal({ type: "peer_leave", targetId: this.matchedPeerId });
    }
    this.closePeerConnection();
    this.stopAvatarAnimation();
    this.status = "idle";
    this.matchedPeerId = null;
    this.remoteCamOff = false;
    this.remoteMicMuted = false;
    this.updateRemoteMediaUI();
    this.updateStatusUI();
    playSynthSound("bubble");
  }

  // 9. Cập nhật giao diện Status
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
        if (this.mode === "real") {
          statusOverlay.innerHTML = `
            <div class="ome-idle-hero">
              <div class="ome-radar-ring ring-static">👥</div>
              <h3>Ghép Đôi Người Thật 100% (P2P OmeTV)</h3>
              <p>Hệ thống WebRTC kết nối trực tiếp với học viên đang trực tuyến. Hoàn toàn không ghép với Bot giả lập!</p>
              <div class="ome-keyboard-hint">💡 Nhấn <kbd>Space</kbd> hoặc <kbd>Enter</kbd> để tìm kiếm người thật</div>
            </div>
          `;
        } else {
          statusOverlay.innerHTML = `
            <div class="ome-idle-hero">
              <div class="ome-radar-ring ring-static">🤖</div>
              <h3>Trợ Lý AI Luyện Nói Tiếng Nhật (Sensei)</h3>
              <p>Luyện phản xạ Kaiwa không chờ đợi cùng các Sensei bản xứ. Hỗ trợ nhận diện giọng nói qua Micro!</p>
              <button type="button" class="btn btn-primary" onclick="window.__startOmeSearch()">Bắt Đầu Luyện Kaiwa Ngay</button>
            </div>
          `;
        }
      }
      if (partnerInfoBar) partnerInfoBar.style.display = "none";
      if (startBtn) startBtn.style.display = "inline-flex";
      if (nextBtn) nextBtn.style.display = "none";
      if (stopBtn) stopBtn.style.display = "none";
    } else if (this.status === "searching") {
      if (statusPill) statusPill.innerHTML = `<span class="dot dot-searching"></span> Đang chờ người thật kết nối...`;
      if (statusOverlay) {
        statusOverlay.style.display = "flex";
        statusOverlay.innerHTML = `
          <div class="ome-searching-hero">
            <div class="ome-radar-ring ring-pulsing">📡</div>
            <h3>Đang đợi người dùng thật vào ghép đôi...</h3>
            <p>Thời gian chờ: <strong id="ome-real-search-timer">00:00</strong></p>
            <div class="ome-real-waiting-card">
              <div class="waiting-tip">
                💡 <em>Vì hệ thống ghép người thật 100%, bạn có thể gửi link mời bạn bè cùng vào call ngay:</em>
              </div>
              <div class="waiting-actions">
                <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-waiting-link">📋 Sao chép link mời bạn</button>
                <button type="button" class="btn btn-outline btn-sm" id="btn-switch-to-ai">🤖 Chuyển sang luyện với Bot AI</button>
              </div>
            </div>
          </div>
        `;

        const copyBtn = document.getElementById("btn-copy-waiting-link");
        if (copyBtn) {
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(this.getRoomInviteUrl());
            copyBtn.textContent = "Đã chép link ✓";
            setTimeout(() => { copyBtn.textContent = "📋 Sao chép link mời bạn"; }, 2000);
          };
        }

        const switchToAiBtn = document.getElementById("btn-switch-to-ai");
        if (switchToAiBtn) {
          switchToAiBtn.onclick = () => this.switchMode("ai");
        }
      }
      if (partnerInfoBar) partnerInfoBar.style.display = "none";
      if (startBtn) startBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (stopBtn) stopBtn.style.display = "inline-flex";
    } else if (this.status === "connected") {
      if (statusPill) statusPill.innerHTML = `<span class="dot dot-live"></span> Đang đàm thoại`;
      if (statusOverlay) statusOverlay.style.display = "none";
      if (partnerInfoBar) {
        partnerInfoBar.style.display = "flex";
        this.renderPartnerInfoBar();
      }
      if (startBtn) startBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "inline-flex";
      if (stopBtn) stopBtn.style.display = "inline-flex";
    }
  }

  renderPartnerInfoBar() {
    const nameEl = document.getElementById("ome-partner-name");
    const metaEl = document.getElementById("ome-partner-meta");
    const badgeEl = document.getElementById("ome-partner-badge");

    if (this.mode === "real") {
      if (nameEl) nameEl.textContent = `Học Viên Trực Tuyến (${this.matchedPeerId.substring(0, 10)}) 👥`;
      if (metaEl) metaEl.textContent = `Kết nối WebRTC P2P Trực tiếp • Mã phòng: ${this.currentRoom}`;
      if (badgeEl) badgeEl.textContent = "Người Thật 100%";
    } else {
      if (nameEl) nameEl.textContent = `${this.selectedSensei.name} (${this.selectedSensei.japaneseName}) 🤖`;
      if (metaEl) metaEl.textContent = `📍 ${this.selectedSensei.city} • ${this.selectedSensei.role}`;
      if (badgeEl) badgeEl.textContent = "Trợ Lý AI";
    }
  }

  // 10. Màn hình Canvas của Trợ Lý AI
  renderSenseiScreen(sensei) {
    const canvas = document.getElementById("ome-remote-canvas");
    const remoteVideo = document.getElementById("ome-remote-video");
    if (!canvas) return;

    if (remoteVideo) remoteVideo.style.display = "none";
    canvas.style.display = "block";
    const ctx = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 480;

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, 640, 480);

      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, "#1e293b");
      grad.addColorStop(0.5, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Shoji Screen background
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(60 + i * 140, 40, 100, 220);
      }

      const isSpeaking = this.speechSynthesisActive;
      const pulseSize = isSpeaking ? Math.sin(frame * 0.2) * 14 : Math.sin(frame * 0.05) * 4;

      // Aura
      ctx.save();
      ctx.beginPath();
      ctx.arc(320, 200, 95 + pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking ? "rgba(14, 165, 233, 0.28)" : "rgba(124, 58, 237, 0.15)";
      ctx.fill();
      ctx.restore();

      // Avatar circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(320, 200, 85, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = isSpeaking ? "#38bdf8" : "#8b5cf6";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(320, 200, 82, 0, Math.PI * 2);
      const innerGrad = ctx.createLinearGradient(240, 120, 400, 280);
      innerGrad.addColorStop(0, "#ede9fe");
      innerGrad.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = innerGrad;
      ctx.fill();

      ctx.font = "80px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(sensei.avatarEmoji, 320, 205);
      ctx.restore();

      // Info text
      ctx.font = "bold 22px -apple-system, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`${sensei.name} (AI Sensei)`, 320, 330);

      ctx.font = "14px -apple-system, sans-serif";
      ctx.fillStyle = isSpeaking ? "#38bdf8" : "#94a3b8";
      ctx.fillText(isSpeaking ? "🔊 Sensei đang nói..." : `📍 ${sensei.city} • ${sensei.role}`, 320, 360);

      // AI Badge
      ctx.fillStyle = "rgba(124, 58, 237, 0.4)";
      ctx.roundRect(20, 20, 160, 28, 6);
      ctx.fill();
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#c4b5fd";
      ctx.textAlign = "left";
      ctx.fillText("● AI Sensei Kaiwa", 32, 38);

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

  receiveSenseiGreeting() {
    setTimeout(() => {
      this.receivePartnerReply(
        this.selectedSensei.greeting,
        this.selectedSensei.greetingRomaji,
        this.selectedSensei.greetingVi
      );
    }, 600);
  }

  // 11. Nhận diện giọng nói tiếng Nhật qua Micro (Speech Recognition)
  initSpeechRecognition() {
    if (typeof window === "undefined") return;
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) return;

    this.speechRecognition = new SpeechClass();
    this.speechRecognition.lang = "ja-JP";
    this.speechRecognition.continuous = false;
    this.speechRecognition.interimResults = false;

    this.speechRecognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (text) {
        this.sendChatMessage(text);
      }
    };

    this.speechRecognition.onend = () => {
      this.isListeningMic = false;
      this.updateMicSpeakButton();
    };

    this.speechRecognition.onerror = () => {
      this.isListeningMic = false;
      this.updateMicSpeakButton();
    };

    const micSpeakBtn = document.getElementById("ome-voice-speak-btn");
    if (micSpeakBtn) {
      micSpeakBtn.onclick = () => {
        if (this.isListeningMic) {
          this.speechRecognition.stop();
        } else {
          try {
            this.speechRecognition.start();
            this.isListeningMic = true;
            this.updateMicSpeakButton();
          } catch (e) {}
        }
      };
    }
  }

  updateMicSpeakButton() {
    const micSpeakBtn = document.getElementById("ome-voice-speak-btn");
    if (!micSpeakBtn) return;
    if (this.isListeningMic) {
      micSpeakBtn.classList.add("is-listening");
      micSpeakBtn.innerHTML = `<span>🔴 Đang lắng nghe bạn nói tiếng Nhật...</span>`;
    } else {
      micSpeakBtn.classList.remove("is-listening");
      micSpeakBtn.innerHTML = `<span>🎙️ Nhấn để nói tiếng Nhật vào Micro</span>`;
    }
  }

  // 12. Gửi và nhận tin nhắn
  sendChatMessage(text) {
    if (this.status !== "connected") {
      this.addSystemMessage("Bạn cần bắt đầu kết nối trước khi gửi tin nhắn!");
      return;
    }

    const time = this.getCurrentTimeString();
    this.addChatMessage({ sender: "me", text, time });
    playSynthSound("bubble");

    if (this.mode === "real") {
      // Gửi tin nhắn sang peer người thật
      if (this.matchedPeerId) {
        this.sendSignal({
          type: "peer_chat",
          targetId: this.matchedPeerId,
          text,
          time
        });
      }
    } else {
      // Phản hồi từ Sensei AI
      setTimeout(() => {
        this.generateSmartSenseiReply(text);
      }, 1000 + Math.random() * 600);
    }
  }

  receivePeerChatMessage(text, time) {
    this.addChatMessage({
      sender: "partner",
      name: "Bạn học",
      text,
      time: time || this.getCurrentTimeString()
    });
    playSynthSound("chime");
  }

  generateSmartSenseiReply(userText) {
    const lower = userText.toLowerCase();
    let replyJa = "うん、とてもいいですね！日本語が上手です。";
    let replyRomaji = "Un, totemo ii desu ne! Nihongo ga jouzu desu.";
    let replyVi = "Hay lắm bạn ơi! Bạn phát âm tiếng Nhật rất chuẩn.";

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
      name: this.selectedSensei?.name || "Sensei",
      text: textJa,
      romaji: textRomaji,
      vi: textVi,
      time: this.getCurrentTimeString()
    });

    playSynthSound("chime");
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
      utterance.onend = () => { this.speechSynthesisActive = false; };
      utterance.onerror = () => { this.speechSynthesisActive = false; };
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

  // 13. Quản lý Mã Phòng & Link mời bạn bè trực tiếp
  getMyRoomCode() {
    if (!this._myRoomCode) {
      this._myRoomCode = "KAIWA_" + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
    return this._myRoomCode;
  }

  getRoomInviteUrl() {
    if (typeof window === "undefined" || !window.location) return "";
    const origin = window.location.origin || "";
    return `${origin}/explore?room=${this.getMyRoomCode()}`;
  }

  setupRoomShareLink() {
    const myCodeDisplay = document.getElementById("ome-my-room-code-display");
    const copyCodeBtn = document.getElementById("ome-copy-code-only-btn");
    const linkInput = document.getElementById("ome-room-share-link");
    const copyLinkBtn = document.getElementById("ome-copy-room-btn");
    const joinBtn = document.getElementById("ome-join-room-btn");
    const inputEl = document.getElementById("ome-direct-room-input");

    const myCode = this.getMyRoomCode();
    const inviteUrl = this.getRoomInviteUrl();

    if (myCodeDisplay) myCodeDisplay.textContent = myCode;
    if (linkInput) {
      if ("value" in linkInput) linkInput.value = inviteUrl;
      else linkInput.textContent = inviteUrl;
    }

    if (copyCodeBtn) {
      copyCodeBtn.onclick = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(myCode);
        }
        const originalText = copyCodeBtn.textContent;
        copyCodeBtn.textContent = "Đã chép mã ✓";
        playSynthSound("bubble");
        setTimeout(() => { copyCodeBtn.textContent = originalText; }, 2000);
      };
    }

    if (copyLinkBtn) {
      copyLinkBtn.onclick = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(this.getRoomInviteUrl());
        }
        const originalText = copyLinkBtn.textContent;
        copyLinkBtn.textContent = "Đã chép link ✓";
        playSynthSound("bubble");
        setTimeout(() => { copyLinkBtn.textContent = originalText; }, 2000);
      };
    }

    if (joinBtn && inputEl) {
      joinBtn.onclick = () => {
        const val = inputEl.value.trim();
        if (!val) return;
        this.joinDirectRoom(val);
      };
      inputEl.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const val = inputEl.value.trim();
          if (val) this.joinDirectRoom(val);
        }
      };
    }
  }

  joinDirectRoom(inputStr) {
    if (!inputStr) return;
    let roomName = String(inputStr).trim();
    // Tự động bóc tách mã phòng nếu người dùng dán cả đường link
    const match = roomName.match(/[?&]room=([^&#]+)/);
    if (match && match[1]) {
      roomName = decodeURIComponent(match[1]);
    }
    this.stopCall();
    this.currentRoom = roomName;
    const inputEl = document.getElementById("ome-direct-room-input");
    if (inputEl) inputEl.value = roomName;
    this.addSystemMessage(`Đã tham gia phòng gọi '${roomName}'. Đang chờ bạn học tham gia...`);
    this.startSearch();
  }

  checkDirectRoomUrl() {
    if (typeof window === "undefined" || !window.location) return;
    let room = null;
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("room")) {
        room = searchParams.get("room");
      } else if (window.location.hash) {
        const match = window.location.hash.match(/[?&]room=([^&#]+)/);
        if (match && match[1]) {
          room = decodeURIComponent(match[1]);
        }
      }
    } catch (e) {}

    if (room) {
      setTimeout(() => {
        this.joinDirectRoom(room);
      }, 500);
    }
  }

  // 13b. Bố cục màn hình (50:50 Split OmeTV vs PiP Khung Lớn)
  bindLayoutEvents() {
    const splitBtn = document.getElementById("btn-layout-split");
    const pipBtn = document.getElementById("btn-layout-pip");
    const videoPanel = document.querySelector(".ome-video-panel");

    const setLayout = (mode) => {
      this.layoutMode = mode;
      if (videoPanel) {
        videoPanel.classList.toggle("is-split-layout", mode === "split");
        videoPanel.classList.toggle("is-pip-layout", mode === "pip");
      }
      if (splitBtn) splitBtn.classList.toggle("active", mode === "split");
      if (pipBtn) pipBtn.classList.toggle("active", mode === "pip");
      playSynthSound("bubble");
    };

    if (splitBtn) splitBtn.onclick = () => setLayout("split");
    if (pipBtn) pipBtn.onclick = () => setLayout("pip");
    setLayout(this.layoutMode || "split");
  }

  // 13c. Trạng thái Media (Tắt/Bật Cam & Mic) đồng bộ qua WebRTC Signaling
  broadcastMediaState() {
    if (this.mode === "real") {
      this.sendSignal({
        type: "media_state",
        targetId: this.matchedPeerId,
        camOff: this.isCameraOff,
        micMuted: this.isMicMuted
      });
    }
  }

  handleRemoteMediaState(data) {
    if (data.camOff !== undefined) this.remoteCamOff = !!data.camOff;
    if (data.micMuted !== undefined) this.remoteMicMuted = !!data.micMuted;
    this.updateRemoteMediaUI();
  }

  updateLocalMediaUI() {
    const localMicBadge = document.getElementById("ome-local-mic-badge");
    if (localMicBadge) {
      localMicBadge.style.display = this.isMicMuted ? "inline-flex" : "none";
    }
  }

  updateRemoteMediaUI() {
    const remoteMicBadge = document.getElementById("ome-remote-mic-badge");
    if (remoteMicBadge) {
      remoteMicBadge.style.display = this.remoteMicMuted ? "inline-flex" : "none";
    }

    const remoteCamOffCard = document.getElementById("ome-remote-cam-off-card");
    const remoteVideo = document.getElementById("ome-remote-video");
    if (this.status === "connected" && this.mode === "real") {
      if (this.remoteCamOff) {
        if (remoteCamOffCard) remoteCamOffCard.style.display = "flex";
        if (remoteVideo) remoteVideo.style.display = "none";
      } else {
        if (remoteCamOffCard) remoteCamOffCard.style.display = "none";
        if (remoteVideo) remoteVideo.style.display = "block";
      }
    } else if (remoteCamOffCard) {
      remoteCamOffCard.style.display = "none";
    }
  }

  // 14. Event Binding khác
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
      t.classList.toggle("active", t.getAttribute("data-explore-tab") === tabName);
    });

    document.querySelectorAll(".explore-tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === `explore-pane-${tabName}`);
    });
  }

  bindControlEvents() {
    const startBtn = document.getElementById("ome-start-btn");
    if (startBtn) startBtn.onclick = () => this.startSearch();

    const nextBtn = document.getElementById("ome-next-btn");
    if (nextBtn) nextBtn.onclick = () => this.nextPartner();

    const stopBtn = document.getElementById("ome-stop-btn");
    if (stopBtn) stopBtn.onclick = () => this.stopCall();

    window.__startOmeSearch = () => this.startSearch();

    // Hotkeys: Space/Enter = Next, Esc = Stop
    window.addEventListener("keydown", (e) => {
      const exploreView = document.getElementById("explore-view");
      const isVisible = exploreView && exploreView.classList.contains("active");
      if (!isVisible || this.activeTab !== "omenihongo") return;

      if (document.activeElement && (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA")) {
        return;
      }

      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        if (this.status === "idle") this.startSearch();
        else this.nextPartner();
      } else if (e.key === "Escape") {
        this.stopCall();
      }
    });

    // Mic & Cam toggle
    const toggleMicBtn = document.getElementById("ome-toggle-mic-btn");
    if (toggleMicBtn) {
      toggleMicBtn.onclick = () => {
        this.isMicMuted = !this.isMicMuted;
        if (this.localStream) {
          this.localStream.getAudioTracks().forEach(t => { t.enabled = !this.isMicMuted; });
        }
        this.updateMediaButtonsState();
        this.updateLocalMediaUI();
        this.broadcastMediaState();
        playSynthSound("bubble");
      };
    }

    const toggleCamBtn = document.getElementById("ome-toggle-cam-btn");
    if (toggleCamBtn) {
      toggleCamBtn.onclick = () => {
        this.isCameraOff = !this.isCameraOff;
        const localVideo = document.getElementById("ome-local-video");
        const localAvatar = document.getElementById("ome-local-avatar");

        if (this.localStream) {
          this.localStream.getVideoTracks().forEach(t => { t.enabled = !this.isCameraOff; });
        }

        if (this.isCameraOff) {
          if (localVideo) localVideo.style.display = "none";
          if (localAvatar) localAvatar.style.display = "flex";
        } else {
          if (localVideo) localVideo.style.display = "block";
          if (localAvatar) localAvatar.style.display = "none";
        }

        this.updateMediaButtonsState();
        this.updateLocalMediaUI();
        this.broadcastMediaState();
        playSynthSound("bubble");
      };
    }

    // Chat form
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
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="21l-3.6-3.6M1 1l22 22M21 7l-5.3 4M23 7v10"/><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/></svg><span>Cam: Tắt</span>`
        : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg><span>Cam: Bật</span>`;
    }
  }

  getCurrentTimeString() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // 15. Dựng Bảng tin Facebook & Phòng học nhóm
  renderSampleFeed() {
    const container = document.getElementById("explore-feed-container");
    if (!container) return;

    container.innerHTML = `
      <div class="fb-feed-wrap">
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

export function getOmeNihongoInstance() {
  if (!omenihongoManagerInstance) {
    omenihongoManagerInstance = new OmeNihongoManager();
  }
  return omenihongoManagerInstance;
}

export function setupOmeNihongoUI(targetTab = "omenihongo") {
  if (!omenihongoManagerInstance) {
    omenihongoManagerInstance = new OmeNihongoManager();
    omenihongoManagerInstance.init();
  }
  if (targetTab) {
    omenihongoManagerInstance.switchExploreTab(targetTab);
  }
}

export { OmeNihongoManager };
