// src/spoken-notes.js
// Quản lý dữ liệu và giao diện Cẩm nang Lưu ý trong Văn nói tiếng Nhật (口語・話し言葉)

import { speakJapanese } from './ui.js';

export const SPOKEN_NOTES_DATA = [
  {
    id: "anata-anta",
    title: "Bạn / Mày: あなた (Anata) ➔ あんた (Anta)",
    shortFormula: "あなた ➔ あんた",
    category: "pronoun",
    categoryLabel: "Đại từ ngôi thứ 2",
    tag: "Nuốt âm · Thân mật & Suồng sã",
    warningLevel: "high", // high | medium | info
    summary: "Hiện tượng nuốt âm 'a' ở giữa trong văn nói nhanh. Thân mật, tự nhiên giữa bạn bè cực thân hoặc người trong gia đình, nhưng TUYỆT ĐỐI KHÔNG dùng với người lớn, thầy cô, cấp trên.",
    details: {
      explanation: `
        <div class="note-explanation-block">
          <h4>📌 Bản chất và Cơ chế biến đổi:</h4>
          <p>Trong giao tiếp đời thường nói nhanh, người Nhật có xu hướng <strong>nuốt nguyên âm</strong> để câu nói gọn và dứt khoát hơn. Âm <code>な (na)</code> bị nuốt âm <code>a</code> biến thành âm mũi <code>ん (n)</code>:</p>
          <div class="note-formula-box">
            <span class="formula-original">あ<span class="highlight-drop">な</span>た (Anata)</span>
            <span class="formula-arrow">➔</span>
            <span class="formula-result">あ<span class="highlight-change">ん</span>た (Anta)</span>
          </div>
        </div>

        <div class="note-context-block">
          <h4>🎭 Ai hay dùng và trong ngữ cảnh nào?</h4>
          <ul class="note-context-list">
            <li><strong>Vợ chồng / Cặp đôi lâu năm:</strong> Vợ gọi chồng hoặc chồng gọi vợ một cách thân thiết (<em>"Này anh/em ơi..."</em>).</li>
            <li><strong>Cha mẹ nói với con cái:</strong> Thường là mẹ nhắc nhở, giục giã hoặc mắng con (<em>"Mày đã làm bài tập chưa hả?"</em>).</li>
            <li><strong>Bạn bè chí cốt, cùng lứa:</strong> Tương tự như cách xưng hô <em>"mày - tao"</em> thân mật trong tiếng Việt giữa những người bạn cực kỳ thân.</li>
            <li><strong>Khi bực bội, giận dữ, cãi vã:</strong> Dùng để thể hiện sự bực mình, coi thường hoặc khiêu khích đối phương.</li>
          </ul>
        </div>

        <div class="note-warning-box">
          <div class="warning-title">⚠️ LƯU Ý SỐNG CÒN CHO NGƯỜI MỚI HỌC:</div>
          <p class="warning-text">
            🔴 <u style="text-decoration-color: #ef4444; font-weight: 700;">TUYỆT ĐỐI KHÔNG DÙNG "Anta" (và cả "Anata") với:</u> 
            <span class="danger-targets">Thầy cô giáo, Cấp trên/Sếp, Tiền bối (Senpai), Khách hàng hoặc người mới quen!</span>
          </p>
          <div class="tip-box">
            💡 <strong>Mẹo vàng của người bản xứ:</strong> Thay vì nói "Bạn/Cậu", người Nhật <u>gần như luôn luôn</u> gọi thẳng <strong>[Tên đối phương + さん (san)]</strong> hoặc chức danh (<em>先生 - Sensei, 部長 - Buchou</em>). Điều này thể hiện sự tinh tế và tôn trọng tuyệt đối.
          </div>
        </div>
      `,
      examples: [
        {
          jp: "あんた、何してるの？",
          romaji: "Anta, nani shiteru no?",
          meaning: "Cậu/Mày đang làm cái trò gì đấy? (Bạn thân hỏi đùa hoặc tò mò)",
          audioText: "あんたなにしているの"
        },
        {
          jp: "あんたも一緒に来る？",
          romaji: "Anta mo issho ni kuru?",
          meaning: "Mày cũng đi cùng chứ? (Rủ rê bạn bè thân mật)",
          audioText: "あんたもいっしょにくる"
        },
        {
          jp: "あんたには関係ないでしょ！",
          romaji: "Anta ni wa kankei nai desho!",
          meaning: "Không dính dáng gì đến cậu đâu nhé! (Giận dỗi, hơi gắt)",
          audioText: "あんたにはかんけいないでしょ"
        },
        {
          jp: "田中さん、明日は暇ですか？",
          romaji: "Tanaka-san, ashita wa hima desu ka?",
          meaning: "[Cách nói lịch sự chuẩn] Anh Tanaka ngày mai có rảnh không ạ? (Gọi tên + san thay vì dùng Anata/Anta)",
          audioText: "たなかさん、あしたはひまですか"
        }
      ]
    }
  },
  {
    id: "watashi-washi-watakushi",
    title: "Tôi / Tớ / Lão: わたし ➔ わし / わたくし / あたし / ぼく / 俺...",
    shortFormula: "わたし ➔ わし, わたくし, あたし...",
    category: "pronoun",
    categoryLabel: "Đại từ ngôi thứ 1",
    tag: "Đại từ nhân xưng · Đa dạng sắc thái",
    warningLevel: "medium",
    summary: "Trong tiếng Nhật, cách tự xưng 'Tôi' tiết lộ tuổi tác, giới tính, địa vị xã hội. Người già hay dùng 'わし', môi trường Keigo trang trọng dùng 'わたくし', nữ giới trẻ dùng 'あたし'.",
    details: {
      explanation: `
        <div class="note-explanation-block">
          <h4>📌 Bản đồ các đại từ ngôi thứ nhất (Cách tự xưng "Tôi"):</h4>
          <p>Tiếng Nhật không chỉ có <code>わたし (Watashi)</code>. Tùy theo <u>độ tuổi</u>, <u>giới tính</u> và <u>đẳng cấp xã hội</u>, người Nhật chọn các từ xưng hô khác nhau:</p>
          
          <div class="pronoun-grid">
            <div class="pronoun-card">
              <div class="pronoun-card-header">
                <span class="pronoun-badge badge-washi">👴 わし (Washi)</span>
                <span class="pronoun-user">Người già · Ông lão</span>
              </div>
              <p>Rất phổ biến ở <strong>người cao tuổi</strong> (đặc biệt là các cụ ông vùng Kansai hoặc nông thôn). Thường gặp ở các nhân vật cụ già, sư phụ, viện trưởng trong Anime/Manga. Mang lại cảm giác từng trải, đĩnh đạc, mộc mạc.</p>
            </div>

            <div class="pronoun-card">
              <div class="pronoun-card-header">
                <span class="pronoun-badge badge-watakushi">👔 わたくし (Watakushi)</span>
                <span class="pronoun-user">Trang trọng đỉnh cao · Keigo</span>
              </div>
              <p>Cách xưng hô <strong>lịch sự nhất</strong> của tiếng Nhật. Bắt buộc dùng trong <u>phỏng vấn xin việc</u>, phát biểu hội nghị, đàm phán thương mại, nhân viên phục vụ khách VIP. Cả nam lẫn nữ đều dùng.</p>
            </div>

            <div class="pronoun-card">
              <div class="pronoun-card-header">
                <span class="pronoun-badge badge-atashi">🌸 あたし (Atashi)</span>
                <span class="pronoun-user">Nữ giới · Ngọt ngào, nhẹ nhàng</span>
              </div>
              <p>Biến âm rút ngắn của <em>watashi</em>, chỉ dùng cho <strong>phái nữ</strong> trong giao tiếp đời thường với bạn bè, người thân. Mang sắc thái nữ tính, trẻ trung, đáng yêu.</p>
            </div>

            <div class="pronoun-card">
              <div class="pronoun-card-header">
                <span class="pronoun-badge badge-boku">👦 ぼく (Boku)</span>
                <span class="pronoun-user">Nam giới · Lịch thiệp, khiêm tốn</span>
              </div>
              <p>Cách tự xưng của <strong>nam giới</strong> (từ bé trai đến thanh niên, nhân viên công sở). Lịch sự vừa phải, hòa nhã, có thể dùng với cả bạn bè, tiền bối lẫn cấp trên thân thiện.</p>
            </div>

            <div class="pronoun-card">
              <div class="pronoun-card-header">
                <span class="pronoun-badge badge-ore">🦁 俺 / おれ (Ore)</span>
                <span class="pronoun-user">Nam giới · Thân mật, mạnh mẽ</span>
              </div>
              <p>Dùng giữa <strong>bạn bè thân thiết, đàn em, người trong gia đình</strong>. Thể hiện sự tự tin, mạnh mẽ. <span style="color:#ef4444; font-weight:700;">⚠️ Tuyệt đối không dùng khi nói chuyện với cấp trên hay nơi trang trọng!</span></p>
            </div>

            <div class="pronoun-card">
              <div class="pronoun-card-header">
                <span class="pronoun-badge badge-uchi">🍵 うち (Uchi)</span>
                <span class="pronoun-user">Nữ sinh & Vùng Kansai</span>
              </div>
              <p>Rất phổ biến trong giới <strong>nữ sinh học đường</strong> hoặc người dân vùng <strong>Osaka, Kyoto</strong>. Tự nhiên, gần gũi, ấm áp.</p>
            </div>
          </div>
        </div>

        <div class="note-warning-box">
          <div class="warning-title">⚠️ NGUYÊN TẮC VÀNG KHI CHỌN TỪ TỰ XƯNG:</div>
          <p class="warning-text">
            👉 Người mới bắt đầu học tiếng Nhật: Hãy luôn dùng <strong>「わたし (Watashi)」</strong> để an toàn 100% trong mọi tình huống.<br>
            👉 Khi đi làm công ty Nhật / Phỏng vấn: Hãy dùng <strong>「わたくし (Watakushi)」</strong> để ghi điểm chuyên nghiệp tối đa.<br>
            👉 <u style="text-decoration-color: #ef4444;">Đừng tùy tiện bắt chước "Ore" hay "Washi"</u> trong anime nếu chưa hiểu rõ quan hệ thứ bậc xã hội với người đối diện!
          </p>
        </div>
      `,
      examples: [
        {
          jp: "わしの若い頃は、毎日山を歩いたもんじゃ。",
          romaji: "Washi no wakai koro wa, mainichi yama o aruita mon ja.",
          meaning: "Hồi lão còn trẻ, ngày nào cũng leo núi đấy nhá. (Ông lão hồi tưởng chuyện xưa)",
          audioText: "わしのわかいころは、まいにちやまをあるいたもんじゃ"
        },
        {
          jp: "本日はわたくしがご案内いたします。",
          romaji: "Honjitsu wa watakushi ga go-annai itashimasu.",
          meaning: "Hôm nay tôi xin phép được đón tiếp và hướng dẫn quý khách ạ. (Trang trọng / Công sở)",
          audioText: "ほんじつはわたくしがごあんないいたします"
        },
        {
          jp: "あたしもそのケーキ食べたい！",
          romaji: "Atashi mo sono keeki tabetai!",
          meaning: "Tớ cũng muốn ăn miếng bánh kem đó nữa! (Nữ giới thân mật)",
          audioText: "あたしもそのけーきたべたい"
        },
        {
          jp: "俺がやるから、心配するな。",
          romaji: "Ore ga yaru kara, shinpai suru na.",
          meaning: "Để tao/anh làm cho, không phải lo đâu. (Nam giới nói với bạn thân/đàn em)",
          audioText: "おれがやるから、しんぱいするな"
        }
      ]
    }
  },
  {
    id: "desuka-nano",
    title: "Câu hỏi thân mật: ...ですか？ ➔ ...なの？ (nano?)",
    shortFormula: "Danh từ / Tính từ な + なの？",
    category: "grammar",
    categoryLabel: "Ngữ pháp & Trợ từ",
    tag: "Hỏi xác nhận · Tò mò & Gần gũi",
    warningLevel: "info",
    summary: "Văn nói thân mật thay vì dùng '...desu ka?', người Nhật dùng đuôi '...nano?' để hỏi xác nhận hoặc bày tỏ sự tò mò. Với Danh từ và Tính từ đuôi na, BẮT BUỘC phải có chữ 'な' nối.",
    details: {
      explanation: `
        <div class="note-explanation-block">
          <h4>📌 Nguồn gốc & Bản chất ngữ pháp:</h4>
          <p>Trong tiếng Nhật lịch sự, khi muốn hỏi làm rõ nguyên nhân hoặc xác nhận một sự thật, ta dùng cấu trúc <code>〜のですか (no desu ka)</code> hoặc <code>〜んですか (n desu ka)</code>.</p>
          <p>Khi chuyển sang <strong>văn nói thân mật (thể ngắn - 普通形)</strong>:</p>
          <ul>
            <li>Ta lược bỏ <code>desu ka</code>, thay bằng <strong>trợ từ cuối câu <code>の (no)</code></strong> kèm ngữ điệu <u>lên giọng ở cuối câu</u>.</li>
          </ul>

          <div class="note-formula-box">
            <span class="formula-original">先生ですか？ (Sensei desu ka?)</span>
            <span class="formula-arrow">➔</span>
            <span class="formula-result">先生<span class="highlight-change">なの？</span> (Sensei na no?)</span>
          </div>
        </div>

        <div class="note-context-block">
          <h4>⚙️ Quy tắc ghép nối chính xác:</h4>
          <div class="rule-table-container">
            <table class="note-rule-table">
              <thead>
                <tr>
                  <th>Từ loại</th>
                  <th>Công thức kết hợp</th>
                  <th>Ví dụ minh họa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Danh từ</strong></td>
                  <td><span class="rule-highlight">Danh từ + な + の？</span></td>
                  <td>先生 ➔ <strong>先生なの？</strong> (Là giáo viên à?)</td>
                </tr>
                <tr>
                  <td><strong>Tính từ đuôi な</strong></td>
                  <td><span class="rule-highlight">Tính từ (bỏ な) + な + の？</span></td>
                  <td>本当 ➔ <strong>本当なの？</strong> (Thật thế hả?)</td>
                </tr>
                <tr>
                  <td><strong>Tính từ đuôi い</strong></td>
                  <td>Tính từ giữ nguyên + <strong>の？</strong></td>
                  <td>暑い ➔ <strong>暑いの？</strong> (Nóng lắm à?)</td>
                </tr>
                <tr>
                  <td><strong>Động từ (thể ngắn)</strong></td>
                  <td>Động từ thể từ điển / thể quá khứ + <strong>の？</strong></td>
                  <td>行く ➔ <strong>行くの？</strong> (Đi đấy à?)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="note-warning-box">
          <div class="warning-title">⚠️ LỖI SAI KINH ĐIỂN CẦN TRÁNH (TÔ ĐỎ):</div>
          <p class="warning-text">
            🔴 <u style="text-decoration-color: #ef4444; font-weight: 700;">SAU DANH TỪ BẮT BUỘC PHẢI CÓ CHỮ "な":</u><br>
            ❌ <strong>SAI:</strong> <code>Sensei no? (先生の？)</code> ➔ Người Nhật sẽ hiểu là câu hỏi sở hữu: <em>"Của thầy giáo đấy à?"</em>.<br>
            ✅ <strong>ĐÚNG:</strong> <code>Sensei <span style="color:#ef4444; font-weight:800;">na</span> no? (先生なの？)</code> ➔ <em>"Cậu là giáo viên thật à?"</em>.
          </p>
        </div>

        <div class="note-context-block">
          <h4>💡 Các cách biến tấu câu hỏi cực tự nhiên trong văn nói:</h4>
          <ul class="note-context-list">
            <li><strong>1. Rút gọn tối đa (Lên giọng cuối câu):</strong>
              Người Nhật khi nói chuyện tán gẫu rất hay chỉ cần nói danh từ và lên giọng:
              <code>Thanh-san, 先生？ ⤴ (Sensei?)</code> ➔ Siêu ngắn gọn và tự nhiên!
            </li>
            <li><strong>2. Nhận ra thông tin mới (〜なんだ？ - nan da?):</strong>
              Dùng khi vừa phát hiện ra điều gì đó bất ngờ: 
              <code>へえ、先生なんだ！ (Hee, sensei nan da!)</code> ➔ <em>"Ồ, hóa ra cậu là giáo viên à!"</em>.
            </li>
          </ul>
        </div>
      `,
      examples: [
        {
          jp: "タインさん、先生なの？",
          romaji: "Thanh-san, sensei nano?",
          meaning: "Thanh ơi, cậu là giáo viên thật đấy à? (Hỏi xác nhận thân thiện)",
          audioText: "タインさん、せんせいなの"
        },
        {
          jp: "今日、仕事休みじゃないの？",
          romaji: "Kyou, shigoto yasumi ja nai no?",
          meaning: "Hôm nay không phải cậu được nghỉ làm à? (Dạng phủ định: ja nai no?)",
          audioText: "きょう、しごとやすみじゃないの"
        },
        {
          jp: "これ、本当に本物なの？",
          romaji: "Kore, hontou ni honmono nano?",
          meaning: "Cái này thật sự là hàng thật đấy hả? (Tò mò, hoài nghi nhẹ)",
          audioText: "これ、ほんとうにほんものなの"
        },
        {
          jp: "もう帰るの？",
          romaji: "Mou kaeru no?",
          meaning: "Cậu về luôn bây giờ đấy à? (Động từ + no?)",
          audioText: "もうかえるの"
        }
      ]
    }
  }
];

// Khởi tạo các sự kiện và hiển thị danh sách
export function setupSpokenNotesUI() {
  const container = document.getElementById("spoken-notes-grid");
  if (!container) return;

  renderSpokenNotesList();

  // Sự kiện tìm kiếm
  const searchInput = document.getElementById("spoken-notes-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderSpokenNotesList(e.target.value.trim(), currentActiveCategory);
    });
  }

  // Sự kiện lọc theo danh mục
  const filterBtns = document.querySelectorAll(".spoken-category-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentActiveCategory = btn.getAttribute("data-category") || "all";
      const query = searchInput ? searchInput.value.trim() : "";
      renderSpokenNotesList(query, currentActiveCategory);
    });
  });

  // Sự kiện đóng modal
  const closeBtn = document.getElementById("close-spoken-modal-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeSpokenNoteModal);
  }

  const modalOverlay = document.getElementById("spoken-note-modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        closeSpokenNoteModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay?.classList.contains("active")) {
      closeSpokenNoteModal();
    }
  });
}

let currentActiveCategory = "all";

// Render danh sách các thẻ lưu ý
export function renderSpokenNotesList(filterQuery = "", category = "all") {
  const grid = document.getElementById("spoken-notes-grid");
  if (!grid) return;

  const query = filterQuery.toLowerCase();
  const filtered = SPOKEN_NOTES_DATA.filter(item => {
    const matchCat = category === "all" || item.category === category;
    if (!matchCat) return false;
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.shortFormula.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.tag.toLowerCase().includes(query) ||
      item.details.examples.some(ex => ex.jp.includes(query) || ex.meaning.toLowerCase().includes(query) || ex.romaji.toLowerCase().includes(query))
    );
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-spoken-notes">
        <span style="font-size: 2.2rem; display: block; margin-bottom: 8px;">🔍</span>
        <p>Không tìm thấy mục lưu ý nào phù hợp với từ khóa "<strong>${filterQuery}</strong>".</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(item => {
    const warningBadge = item.warningLevel === "high" 
      ? `<span class="note-pill pill-danger">⚠️ Cẩn trọng</span>`
      : item.warningLevel === "medium"
      ? `<span class="note-pill pill-warning">⚡ Lưu ý</span>`
      : `<span class="note-pill pill-info">💡 Bí quyết</span>`;

    return `
      <article class="spoken-note-card glass-panel" data-note-id="${item.id}" role="button" tabindex="0" title="Bấm để xem chi tiết và ví dụ phát âm">
        <header class="note-card-header">
          <div class="note-card-badges">
            <span class="note-pill pill-cat">${item.categoryLabel}</span>
            ${warningBadge}
          </div>
          <h3 class="note-card-title">${item.title}</h3>
          <div class="note-card-formula">${item.shortFormula}</div>
        </header>

        <div class="note-card-body">
          <p class="note-card-summary">${item.summary}</p>
        </div>

        <footer class="note-card-footer">
          <span class="note-preview-badge">${item.tag}</span>
          <button type="button" class="btn btn-secondary btn-sm open-note-btn" data-note-id="${item.id}">
            Xem chi tiết & Ví dụ ➔
          </button>
        </footer>
      </article>
    `;
  }).join("");

  // Bắt sự kiện click vào từng card
  grid.querySelectorAll(".spoken-note-card").forEach(card => {
    const noteId = card.getAttribute("data-note-id");
    card.addEventListener("click", () => openSpokenNoteDetail(noteId));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openSpokenNoteDetail(noteId);
      }
    });
  });
}

// Mở modal chi tiết một lưu ý
export function openSpokenNoteDetail(noteId) {
  const item = SPOKEN_NOTES_DATA.find(n => n.id === noteId);
  if (!item) return;

  const modal = document.getElementById("spoken-note-modal");
  const modalBody = document.getElementById("spoken-modal-content");
  const modalTitle = document.getElementById("spoken-modal-title");
  const modalFormula = document.getElementById("spoken-modal-formula");
  const modalBadge = document.getElementById("spoken-modal-badge");

  if (!modal || !modalBody) return;

  if (modalTitle) modalTitle.textContent = item.title;
  if (modalFormula) modalFormula.textContent = item.shortFormula;
  if (modalBadge) {
    modalBadge.textContent = item.categoryLabel;
    modalBadge.className = "note-pill pill-cat";
  }

  // Dựng danh sách ví dụ với nút phát âm SpeechSynthesis
  const examplesHtml = item.details.examples.map((ex, idx) => `
    <div class="note-example-item">
      <div class="example-header">
        <span class="example-index">Ví dụ ${idx + 1}</span>
        <button type="button" class="btn btn-secondary speak-note-btn" data-audio="${ex.audioText || ex.jp}" title="Nghe phát âm tự nhiên">
          🔊 Nghe
        </button>
      </div>
      <div class="example-jp">${ex.jp}</div>
      <div class="example-romaji">${ex.romaji}</div>
      <div class="example-vi">${ex.meaning}</div>
    </div>
  `).join("");

  modalBody.innerHTML = `
    <div class="modal-note-details">
      ${item.details.explanation}

      <div class="note-examples-section">
        <h4 class="examples-heading">🗣️ Các ví dụ thực tế trong đời sống (Bấm 🔊 để nghe phát âm):</h4>
        <div class="examples-list">
          ${examplesHtml}
        </div>
      </div>
    </div>
  `;

  // Gắn sự kiện nghe phát âm
  modalBody.querySelectorAll(".speak-note-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const textToSpeak = btn.getAttribute("data-audio");
      if (textToSpeak) {
        speakJapanese(textToSpeak, true);
      }
    });
  });

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

// Đóng modal
export function closeSpokenNoteModal() {
  const modal = document.getElementById("spoken-note-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}
