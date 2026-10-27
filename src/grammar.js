// src/grammar.js
// Quản lý hệ thống học Ngữ pháp Tiếng Nhật LMS chuyên sâu, bố cục 3 cột sát lề, highlight từ khóa, lộ trình phân cấp, ghi chú dạng danh sách và tab kết quả

import { speakJapanese, triggerConfetti } from './ui.js';
import { getProjects } from './storage.js';
import { bindKanaInput, romajiToHiragana, removeVietnameseAccents } from './kana-ime.js';

export const GRAMMAR_CHAPTERS = [
  {
    id: "n5-chapter-1",
    level: "N5",
    title: "Chương 1: Khởi động & Giới thiệu bản thân",
    description: "Nhập môn ngữ pháp tiếng Nhật căn bản: Khẳng định, phủ định, nghi vấn và trợ từ 'cũng'",
    lessons: [
      {
        id: "n5-lesson-1",
        number: 1,
        title: "Bài 1: Giới thiệu bản thân (じこしょうかい)",
        subtitle: "Khẳng định (です) · Phủ định (じゃありません) · Nghi vấn (ですか) · Trợ từ cũng (も)",
        level: "N5",
        keyTakeaways: [
          "Trợ từ は viết là 'ha' nhưng BẮT BUỘC phát âm là 'wa'. Tuyệt đối không viết là わ.",
          "です đứng cuối câu khẳng định danh từ một cách lịch sự, phát âm nuốt nhẹ âm u giống 'des'.",
          "じゃありません dùng trong văn nói hàng ngày; ではありません dùng trong văn viết và trang trọng.",
          "Thêm か vào cuối câu để tạo thành câu hỏi nghi vấn xác nhận, ngữ điệu hơi lên giọng.",
          "Trợ từ も (cũng) THAY THẾ hoàn toàn cho は khi có cùng tính chất. Cấm kỵ: không nói 'A はも B'."
        ],
        patterns: [
          {
            id: "pattern-1",
            name: "A は B です",
            targetHighlight: "は ... です",
            meaning: "A là B (Câu khẳng định danh từ)",
            formula: "Danh từ 1 [ <span class=\"gp-mark gp-ha\">は</span> ] Danh từ 2 [ <span class=\"gp-mark gp-desu\">です</span> ]",
            explanation: "Mẫu câu khẳng định cơ bản và quan trọng nhất trong tiếng Nhật, dùng để giới thiệu tên, nghề nghiệp, quốc tịch, thân phận.",
            deepPoints: [
              "<strong>1. Khái niệm cốt lõi về 'Chủ đề của câu' (Topic):</strong><br>• <strong>Danh từ 1</strong> là đối tượng chính được người nói đưa ra làm chủ đề để bàn luận.<br>• Trợ từ <span class=\"gp-mark gp-ha\">は</span> đứng ngay sau Danh từ 1 để khoanh vùng chủ đề đó.",
              "<strong>2. Vì sao chữ は (ha) lại phát âm là 'wa'?</strong><br>• <em>Nguồn gốc lịch sử:</em> Trong tiếng Nhật cổ thế kỷ 11, chữ は từng phát âm là 'wa/fa'. Sau cải cách chữ viết thời Minh Trị, để bảo tồn ngữ pháp lịch sử, người Nhật quy định: Khi đóng vai trò <u>trợ từ ngữ pháp</u> thì BẮT BUỘC phát âm là <strong>wa</strong>.<br>• <em>Cảnh báo viết đúng:</em> Tuyệt đối <u>không được viết là わ</u> (viết <s>A わ B です</s> là sai chính tả hoàn toàn).",
              "<strong>3. Trợ động từ です (desu) và cách phát âm chuẩn người bản xứ:</strong><br>• Biểu thị thái độ tôn trọng, lịch sự với người đối diện.<br>• Khi phát âm, người Nhật nuốt nhẹ nguyên âm 'u' ở cuối, nghe dứt khoát và thanh lịch giống <strong>'des'</strong> chứ không đọc kéo dài thành 'de-su-u'.",
              "<strong>4. Quy tắc lược bỏ chủ ngữ trong giao tiếp thực tế:</strong><br>• Khi nói về chính mình hoặc người nghe đã biết rõ đang nói về ai, người Nhật thường lược bỏ hẳn <em>'わたしは'</em> để tránh lặp từ rườm rà (ví dụ: chỉ cần nói <em>'マイです。'</em> thay vì <em>'わたしはマイです。'</em>)."
            ],
            notes: "🔴 <u>Ghi nhớ vàng:</u> Công thức: <strong>A</strong> (Ai đó) + <span class=\"gp-mark gp-ha\">は (wa)</span> + <strong>B</strong> (Là gì) + <span class=\"gp-mark gp-desu\">です (desu)</span>.",
            examples: [
              { jp: "わたし <span class=\"gp-mark gp-ha\">は</span> マイ <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Watashi wa Mai desu.", vi: "Tôi là Mai.", audio: "わたしはマイです" },
              { jp: "タインさん <span class=\"gp-mark gp-ha\">は</span> ベトナムじん <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Thanh-san wa Betonamu-jin desu.", vi: "Anh Thanh là người Việt Nam.", audio: "タインさんはベトナムじんです" },
              { jp: "ミラーさん <span class=\"gp-mark gp-ha\">は</span> かいしゃいん <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Miraa-san wa kaishain desu.", vi: "Anh Miller là nhân viên công ty.", audio: "ミラーさんはかいしゃいんです" },
              { jp: "ワンさん <span class=\"gp-mark gp-ha\">は</span> いしゃ <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Wan-san wa isha desu.", vi: "Anh Wang là bác sĩ.", audio: "ワンさんはいしゃです" }
            ]
          },
          {
            id: "pattern-2",
            name: "A は B じゃありません",
            targetHighlight: "じゃありません / ではありません",
            meaning: "A không phải là B (Câu phủ định danh từ)",
            formula: "Danh từ 1 [ <span class=\"gp-mark gp-ha\">は</span> ] Danh từ 2 [ <span class=\"gp-mark gp-ja\">じゃありません</span> / <span class=\"gp-mark gp-ja\">ではありません</span> ]",
            explanation: "Thể phủ định lịch sự của です, dùng để bác bỏ hoặc đính chính thông tin về nghề nghiệp, quốc tịch, thân phận.",
            deepPoints: [
              "<strong>1. Bản chất ngữ pháp:</strong><br>• Đây là dạng phủ định lịch sự tương ứng của trợ động từ <em>です</em>.",
              "<strong>2. Phân biệt cặn kẽ 'じゃありません' và 'ではありません':</strong><br>• <span class=\"gp-mark gp-ja\">じゃありません</span> (ja arimasen): Là cách nói nuốt âm rút gọn của <em>では ➔ じゃ</em>. Cực kỳ phổ biến, tự nhiên nhất trong <u>đàm thoại giao tiếp hàng ngày</u>.<br>• <span class=\"gp-mark gp-ja\">ではありません</span> (dewa arimasen): Giữ nguyên thể gốc, mang sắc thái trang trọng, lịch sự chuẩn mực, dùng trong <u>văn viết, hợp đồng, email công sở hoặc phát biểu</u>.",
              "<strong>3. Lỗi sai người mới học hay mắc phải:</strong><br>• Tuyệt đối không dùng <em>ありません</em> đứng cộc lốc một mình sau danh từ (không nói <s>A は B ありません</s>). Bắt buộc phải có liên từ nối <em>じゃ</em> hoặc <em>では</em> ở phía trước!"
            ],
            notes: "💡 <u>Mẹo thực hành:</u> Khi đàm thoại cứ tự tin dùng <strong>じゃありません</strong> cho tự nhiên, khi viết bài kiểm tra hoặc email công việc thì dùng <strong>ではありません</strong>.",
            examples: [
              { jp: "わたし <span class=\"gp-mark gp-ha\">は</span> がくせい <span class=\"gp-mark gp-ja\">じゃありません</span>。", romaji: "Watashi wa gakusei ja arimasen.", vi: "Tôi không phải là học sinh.", audio: "わたしはがくせいじゃありません" },
              { jp: "サントスさん <span class=\"gp-mark gp-ha\">は</span> いしゃ <span class=\"gp-mark gp-ja\">じゃありません</span>。", romaji: "Santosu-san wa isha ja arimasen.", vi: "Anh Santos không phải là bác sĩ.", audio: "サントスさんはいしゃじゃありません" },
              { jp: "あのかた <span class=\"gp-mark gp-ha\">は</span> せんせい <span class=\"gp-mark gp-ja\">ではありません</span>。", romaji: "Ano kata wa sensei dewa arimasen.", vi: "Vị kia không phải là giáo viên. (Trang trọng)", audio: "あのかたはせんせいではありません" }
            ]
          },
          {
            id: "pattern-3",
            name: "A は B ですか",
            targetHighlight: "ですか",
            meaning: "A có phải là B không? (Câu hỏi nghi vấn)",
            formula: "Danh từ 1 [ <span class=\"gp-mark gp-ha\">は</span> ] Danh từ 2 [ <span class=\"gp-mark gp-ka\">ですか</span> ]",
            explanation: "Thêm trợ từ か vào cuối câu khẳng định để biến thành câu hỏi xác nhận thông tin.",
            deepPoints: [
              "<strong>1. Trợ từ か đóng vai trò như dấu hỏi chấm bằng lời nói:</strong><br>• Không cần đảo ngữ hay đổi trật tự từ như tiếng Anh (không cần đảo động từ lên đầu). Chỉ cần giữ nguyên câu khẳng định và thêm <span class=\"gp-mark gp-ka\">か</span> vào cuối.",
              "<strong>2. Dấu câu và ngữ điệu (Intonation):</strong><br>• Trong văn bản tiếng Nhật chuẩn, cuối câu dùng dấu chấm tròn <code>。</code> chứ không bắt buộc dùng dấu <code>?</code> (dù văn cảnh hiện đại vẫn chấp nhận <code>?</code>).<br>• Khi phát âm, âm <strong>か</strong> ở cuối câu được phát âm với ngữ điệu <u>hơi đi lên nhẹ nhàng</u>.",
              "<strong>3. Nghệ thuật trả lời câu hỏi:</strong><br>• <strong>Khi đồng ý:</strong> Nói <em>はい、[B] です。</em> (Vâng, đúng là B). Có thể lược bỏ chủ ngữ A để câu gọn gàng.<br>• <strong>Khi từ chối:</strong> Nói <em>いいえ、[B] じゃありません。</em> (Không, không phải là B). Sau đó nói thêm thông tin đúng (ví dụ: <em>いいえ、がくせいじゃありません。かいしゃいんです。</em>)."
            ],
            notes: "🗣️ <u>Cặp thoại mẫu:</u><br>Q: タインさん は エンジニア ですか。<br>A: はい、エンジニア です。(Đồng ý) / いいえ、エンジニア じゃありません。(Từ chối)",
            examples: [
              { jp: "タインさん <span class=\"gp-mark gp-ha\">は</span> エンジニア <span class=\"gp-mark gp-ka\">ですか</span>。", romaji: "Thanh-san wa enjinia desu ka.", vi: "Anh Thanh có phải là kỹ sư không? ➔ [はい、エンジニア です。]", audio: "タインさんはエンジニアですか" },
              { jp: "ミラーさん <span class=\"gp-mark gp-ha\">は</span> アメリカじん <span class=\"gp-mark gp-ka\">ですか</span>。", romaji: "Miraa-san wa Amerikajin desu ka.", vi: "Anh Miller có phải là người Mỹ không? ➔ [はい、アメリカじん です。]", audio: "ミラーさんはアメリカじんですか" },
              { jp: "あのかた <span class=\"gp-mark gp-ha\">は</span> しゃちょう <span class=\"gp-mark gp-ka\">ですか</span>。", romaji: "Ano kata wa shachou desu ka.", vi: "Vị kia có phải là giám đốc không? ➔ [いいえ、しゃちょう じゃありません。]", audio: "あのかたはしゃちょうですか" }
            ]
          },
          {
            id: "pattern-4",
            name: "A も B です",
            targetHighlight: "も",
            meaning: "A cũng là B (Trợ từ も - Cũng)",
            formula: "Danh từ 1 は C です。 Danh từ 2 [ <span class=\"gp-mark gp-mo\">も</span> ] C です。",
            explanation: "Trợ từ も (mo) mang nghĩa là 'cũng', dùng để biểu thị sự đồng nhất hoặc tương đồng về tính chất, quốc tịch, nghề nghiệp.",
            deepPoints: [
              "<strong>1. Bản chất cốt lõi của trợ từ も:</strong><br>• Dùng khi chủ ngữ thứ 2 có cùng tính chất, đặc điểm hoặc hành động với chủ ngữ trước đó đã được nhắc đến.",
              "<strong>2. Quy tắc thay thế tuyệt đối (CỰC KỲ QUAN TRỌNG):</strong><br>• Trợ từ <span class=\"gp-mark gp-mo\">も</span> sẽ <strong>thay thế hoàn toàn vị trí của trợ từ は</strong>.<br>• 🔴 <u>CẤM KỴ:</u> Tuyệt đối không dùng cả <em>は</em> và <em>も</em> cùng lúc (sai hoàn toàn: <s>A はも B です</s> hoặc <s>A もは B です</s>).",
              "<strong>3. Cách dùng も trong câu hỏi và trả lời:</strong><br>• Hỏi: <em>ナムさん <span class=\"gp-mark gp-mo\">も</span> ベトナムじん ですか。</em> (Anh Nam cũng là người VN à?)<br>• Trả lời khẳng định: <em>はい、ナムさん <span class=\"gp-mark gp-mo\">も</span> ベトナムじん です。</em><br>• Trả lời phủ định: <em>いいえ、ナムさん <span class=\"gp-mark gp-ha\">は</span> ベトナムじん じゃありません。</em> ➔ <u>Chú ý:</u> Khi phủ định, trợ từ lại quay trở về dùng <span class=\"gp-mark gp-ha\">は</span>!"
            ],
            notes: "🔴 <u>Công thức cần khắc cốt ghi tâm:</u> Câu trước dùng <strong>は</strong>, câu sau có cùng tính chất thì thay thế bằng <span class=\"gp-mark gp-mo\">も</span>.",
            examples: [
              { jp: "タインさん <span class=\"gp-mark gp-ha\">は</span> ベトナムじん です。ナムさん <span class=\"gp-mark gp-mo\">も</span> ベトナムじん <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Thanh-san wa Betonamu-jin desu. Nam-san mo Betonamu-jin desu.", vi: "Anh Thanh là người Việt Nam. Anh Nam CŨNG là người Việt Nam.", audio: "タインさんはベトナムじんです。ナムさんもベトナムじんです" },
              { jp: "わたし <span class=\"gp-mark gp-ha\">は</span> がくせい です。あのかた <span class=\"gp-mark gp-mo\">も</span> がくせい <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Watashi wa gakusei desu. Ano kata mo gakusei desu.", vi: "Tôi là học sinh. Vị kia CŨNG là học sinh.", audio: "わたしはがくせいです。あのかたもがくせいです" },
              { jp: "ミラーさん <span class=\"gp-mark gp-ha\">は</span> かいしゃいん です。グプタさん <span class=\"gp-mark gp-mo\">も</span> かいしゃいん <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Miraa-san wa kaishain desu. Guputa-san mo kaishain desu.", vi: "Anh Miller là nhân viên công ty. Anh Gupta CŨNG là nhân viên công ty.", audio: "ミラーさんはかいしゃいんです。グプタさんもかいしゃいんです" }
            ]
          }
        ],
        readingArticle: {
          title: "Đoạn văn & Hội thoại tự giới thiệu bản thân mẫu (じこしょうかい)",
          passageJp: "はじめまして。わたし <span class=\"gp-mark gp-ha\">は</span> タイン <span class=\"gp-mark gp-desu\">です</span>。ベトナム から きました。25さい <span class=\"gp-mark gp-desu\">です</span>。エンジニア <span class=\"gp-mark gp-desu\">です</span>。がくせい <span class=\"gp-mark gp-ja\">じゃありません</span>。ナムさん <span class=\"gp-mark gp-mo\">も</span> ベトナムじん <span class=\"gp-mark gp-desu\">です</span>。どうぞ よろしく おねがいします。",
          passageRomaji: "Hajimemashite. Watashi wa Thanh desu. Betonamu kara kimashita. 25-sai desu. Enjinia desu. Gakusei ja arimasen. Nam-san mo Betonamu-jin desu. Douzo yoroshiku onegaishimasu.",
          passageVi: "Rất vui được làm quen với bạn. Tôi là Thanh. Tôi đến từ Việt Nam. Tôi 25 tuổi. Tôi là kỹ sư. Tôi không phải là học sinh. Anh Nam cũng là người Việt Nam. Rất mong được sự giúp đỡ của bạn.",
          audio: "はじめまして。わたしはタインです。ベトナムからきました。にじゅうごさいです。エンジニアです。がくせいじゃありません。ナムさんもベトナムじんです。どうぞよろしくおねがいします"
        },
        exercises: [
          {
            id: "ex-1",
            type: "reading",
            typeLabel: "📖 Đọc hiểu",
            question: "Dựa vào đoạn văn giới thiệu ở trên: Anh Thanh làm nghề gì?",
            options: [
              "Học sinh (がくせい)",
              "Kỹ sư (エンジニア)",
              "Bác sĩ (いしゃ)",
              "Nhân viên công ty (かいしゃいん)"
            ],
            correct: 1,
            explanation: "Trong bài có câu: 'エンジニア です。がくせい じゃありません。' (Tôi là kỹ sư. Tôi không phải học sinh)."
          },
          {
            id: "ex-2",
            type: "listening",
            typeLabel: "🎧 Nghe hiểu",
            audioText: "ミラーさんはアメリカじんじゃありません",
            question: "Bấm nút 🔊 Nghe câu phát âm và chọn ý nghĩa chính xác nhất:",
            options: [
              "Anh Miller là người Mỹ.",
              "Anh Miller không phải là người Mỹ.",
              "Anh Miller có phải người Mỹ không?",
              "Anh Miller cũng là người Mỹ."
            ],
            correct: 1,
            explanation: "Câu phát âm: 'ミラーさんはアメリカじんじゃありません' kết thúc bằng 'じゃありません' là câu phủ định: Anh Miller không phải người Mỹ."
          },
          {
            id: "ex-3",
            type: "fill",
            typeLabel: "✏️ Điền trợ từ",
            question: "タインさん は ベトナムじん です。ナムさん [ ... ] ベトナムじん です。",
            options: ["は", "も", "か", "の"],
            correct: 1,
            explanation: "Cả Thanh và Nam đều là người Việt Nam nên câu thứ hai dùng trợ từ 'も' (cũng) để thay thế hoàn toàn cho 'は'."
          },
          {
            id: "ex-4",
            type: "grammar",
            typeLabel: "🔍 Ngữ pháp phủ định",
            question: "Cách nói phủ định của câu: 'サントスさん は いしゃ です' là gì?",
            options: [
              "サントスさん は いしゃ ですか",
              "サントスさん も いしゃ です",
              "サントスさん は いしゃ じゃありません",
              "サントスさん は いしゃ でした"
            ],
            correct: 2,
            explanation: "Phủ định của 'です' là 'じゃありません' hoặc 'ではありません'."
          },
          {
            id: "ex-5",
            type: "writing",
            typeLabel: "🧩 Sắp xếp câu",
            question: "Hãy chọn thứ tự ghép đúng để tạo câu hỏi: 'Bạn có phải là học sinh không?'",
            options: [
              "あなた は がくせい ですか",
              "がくせい は あなた ですか",
              "あなた も がくせい ですか",
              "あなた は ですか がくせい"
            ],
            correct: 0,
            explanation: "Cấu trúc câu hỏi nghi vấn: Chủ ngữ (あなた) + は + Danh từ (がくせい) + ですか."
          }
        ],
        testQuestions: [
          {
            id: "tq-1",
            q: "Trong câu 'わたし は マイ です', trợ từ 'は' được phát âm là gì?",
            options: ["ha", "wa", "ba", "ya"],
            correct: 1,
            explanation: "Trợ từ は trong ngữ pháp tiếng Nhật bắt buộc phát âm là 'wa'."
          },
          {
            id: "tq-2",
            q: "Câu 'あのかた は せんせい じゃありません' có nghĩa là gì?",
            options: [
              "Vị kia là giáo viên.",
              "Vị kia có phải giáo viên không?",
              "Vị kia không phải là giáo viên.",
              "Vị kia cũng là giáo viên."
            ],
            correct: 2,
            explanation: "じゃありません là thể phủ định của です: 'không phải là'."
          },
          {
            id: "tq-3",
            q: "Khi ai đó hỏi: 'タインさん は エンジニア ですか', nếu đồng ý bạn sẽ trả lời thế nào?",
            options: [
              "はい、エンジニア じゃありません。",
              "いいえ、エンジニア です。",
              "はい、エンジニア です。",
              "いいえ、エンジニア も です。"
            ],
            correct: 2,
            explanation: "Trả lời khẳng định: はい + danh từ + です."
          },
          {
            id: "tq-4",
            q: "Điền trợ từ: 'A: わたしはかいしゃいんです。 B: わたし [ ? ] かいしゃいんです。'",
            options: ["は", "も", "か", "に"],
            correct: 1,
            explanation: "B cũng là nhân viên công ty giống A nên dùng trợ từ 'も' (cũng)."
          },
          {
            id: "tq-5",
            q: "Cách nói phủ định trang trọng (dùng trong văn viết) của 'じゃありません' là gì?",
            options: [
              "ではありません",
              "ではありませんか",
              "でした",
              "じゃなかった"
            ],
            correct: 0,
            explanation: "ではありません mang sắc thái trang trọng, lịch sự chuẩn mực trong văn viết."
          },
          {
            id: "tq-6",
            q: "Bấm nút 🔊 Nghe phát âm và chọn ý nghĩa đúng:",
            audioText: "ワンさんはいしゃですか",
            options: [
              "Anh Wang là bác sĩ.",
              "Anh Wang không phải là bác sĩ.",
              "Anh Wang có phải là bác sĩ không?",
              "Anh Wang cũng là bác sĩ."
            ],
            correct: 2,
            explanation: "Câu kết thúc bằng 'ですか' là câu hỏi nghi vấn."
          },
          {
            id: "tq-7",
            q: "Chọn câu viết ĐÚNG ngữ pháp hoàn hảo nhất:",
            options: [
              "わたし はも ベトナムじん です。",
              "わたし も ベトナムじん です。",
              "わたし か ベトナムじん です。",
              "わたし は ベトナムじん も です。"
            ],
            correct: 1,
            explanation: "Trợ từ 'も' đứng ngay sau danh từ và thay thế cho 'は', tuyệt đối không được viết ghép 'はも'."
          },
          {
            id: "tq-8",
            q: "Để giới thiệu 'Tôi là học sinh', câu nào sau đây là chính xác?",
            options: [
              "わたし は がくせい です。",
              "わたし が がくせい ですか。",
              "わたし も がくせい じゃありません。",
              "わたし は がくせい ですか。"
            ],
            correct: 0,
            explanation: "Cấu trúc khẳng định danh từ: A は B です (Tôi là học sinh)."
          }
        ]
      },
      {
        id: "n5-lesson-2",
        number: 2,
        title: "Bài 2: Đồ vật xung quanh (これ・それ・あれ)",
        subtitle: "Đại từ chỉ thị đồ vật: Cái này, cái đó, cái kia",
        level: "N5",
        locked: true
      },
      {
        id: "n5-lesson-3",
        number: 3,
        title: "Bài 3: Địa điểm & Nơi chốn (ここ・そこ・あそこ)",
        subtitle: "Chỉ vị trí, nơi chốn, phương hướng và giá tiền",
        level: "N5",
        locked: true
      },
      {
        id: "n5-lesson-4",
        number: 4,
        title: "Bài 4: Thời gian & Động từ hàng ngày (~ます)",
        subtitle: "Hỏi giờ giấc, các ngày trong tuần và động từ chia thì",
        level: "N5",
        locked: true
      },
      {
        id: "n5-lesson-5",
        number: 5,
        title: "Bài 5: Đi lại & Phương tiện (〜へ 行きます)",
        subtitle: "Đi đâu, đi bằng phương tiện gì, đi cùng với ai",
        level: "N5",
        locked: true
      }
    ]
  }
];

const STORAGE_KEY_GRAMMAR_PROGRESS = "nihongo_grammar_progress_v2";
const STORAGE_KEY_RIGHT_COLLAPSED = "nihongo_grammar_right_collapsed";
const STORAGE_KEY_CUSTOM_EXAMPLES_PREFIX = "nihongo_grammar_custom_examples_";
const STORAGE_KEY_AI_CONFIG = "nihongo_grammar_ai_config";

// Đọc toàn bộ tiến trình từ localStorage
export function loadAllGrammarProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GRAMMAR_PROGRESS);
    if (!raw) return getDefaultProgressState();
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Lỗi đọc tiến trình ngữ pháp:", e);
    return getDefaultProgressState();
  }
}

// Lưu tiến trình vào localStorage
export function saveAllGrammarProgress(data) {
  try {
    localStorage.setItem(STORAGE_KEY_GRAMMAR_PROGRESS, JSON.stringify(data));
  } catch (e) {
    console.warn("Lỗi lưu tiến trình ngữ pháp:", e);
  }
}

function getDefaultProgressState() {
  return {
    activeLessonId: "n5-lesson-1",
    activeSubStep: "theory", // theory | exercises | test | review
    unlockedAll: false,
    lessons: {
      "n5-lesson-1": {
        theoryDone: false,
        exercisesDone: false,
        exerciseScores: {},
        testPassed: false,
        testScore: 0,
        testTotal: 8,
        notesList: [],
        bookmarked: false,
        reviewDone: false,
        reviewQuizResult: null
      }
    }
  };
}

// Lấy tiến trình của 1 bài học cụ thể
export function getLessonProgress(lessonId) {
  const all = loadAllGrammarProgress();
  if (!all.lessons[lessonId]) {
    all.lessons[lessonId] = {
      theoryDone: false,
      exercisesDone: false,
      exerciseScores: {},
      testPassed: false,
      testScore: 0,
      testTotal: 8,
      notesList: [],
      bookmarked: false,
      reviewDone: false,
      reviewQuizResult: null
    };
  }
  return all.lessons[lessonId];
}

// Cập nhật tiến trình cho 1 bài học
export function updateLessonProgress(lessonId, partial) {
  const all = loadAllGrammarProgress();
  if (!all.lessons[lessonId]) {
    all.lessons[lessonId] = {
      theoryDone: false,
      exercisesDone: false,
      exerciseScores: {},
      testPassed: false,
      testScore: 0,
      testTotal: 8,
      notesList: [],
      bookmarked: false,
      reviewDone: false,
      reviewQuizResult: null
    };
  }
  all.lessons[lessonId] = { ...all.lessons[lessonId], ...partial };
  saveAllGrammarProgress(all);
  return all.lessons[lessonId];
}

// Tính % hoàn thành của 1 bài học (Lý thuyết: 30%, Bài tập: 30%, Kiểm tra: 40%)
export function calculateLessonPercent(lessonId) {
  const p = getLessonProgress(lessonId);
  let score = 0;
  if (p.theoryDone) score += 30;
  if (p.exercisesDone) score += 30;
  if (p.testPassed) score += 40;
  return score;
}

// Quản lý mẫu ví dụ tự tạo của người học
export function getCustomExamples(lessonId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_CUSTOM_EXAMPLES_PREFIX}${lessonId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Lỗi đọc custom examples:", e);
  }
  return [
    {
      id: "cust-ex-default-1",
      lessonId: "n5-lesson-1",
      patternId: "pattern-1",
      patternName: "A は B です",
      jp: "リンさん は 先生 です。",
      romaji: "Rin-san wa sensei desu.",
      vi: "Chị Linh là giáo viên.",
      audio: "リンさんはせんせいです",
      createdAt: "Mẫu khởi đầu"
    },
    {
      id: "cust-ex-default-2",
      lessonId: "n5-lesson-1",
      patternId: "pattern-2",
      patternName: "A は B じゃありません",
      jp: "ナムさん は 医者 じゃありません。",
      romaji: "Nam-san wa isha ja arimasen.",
      vi: "Anh Nam không phải là bác sĩ.",
      audio: "ナムさんはいしゃじゃありません",
      createdAt: "Mẫu khởi đầu"
    }
  ];
}

export function saveCustomExamples(lessonId, list) {
  try {
    localStorage.setItem(`${STORAGE_KEY_CUSTOM_EXAMPLES_PREFIX}${lessonId}`, JSON.stringify(list));
  } catch (e) {
    console.warn("Lỗi lưu custom examples:", e);
  }
}

export function addCustomExample(lessonId, example) {
  const list = getCustomExamples(lessonId);
  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`;
  const newEx = {
    id: `cust-ex-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    lessonId,
    createdAt: timeStr,
    ...example
  };
  list.unshift(newEx);
  saveCustomExamples(lessonId, list);
  return newEx;
}

export function deleteCustomExample(lessonId, exampleId) {
  const list = getCustomExamples(lessonId);
  const filtered = list.filter(item => item.id !== exampleId);
  saveCustomExamples(lessonId, filtered);
  return filtered;
}

// Quản lý cấu hình API AI (Gemini / OpenAI)
export function getAIConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AI_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    provider: "gemini",
    apiKey: "",
    model: "gemini-1.5-flash"
  };
}

export function saveAIConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.warn("Lỗi lưu AI config:", e);
  }
}

// Biến trạng thái runtime
let currentChapterIndex = 0;
let currentLessonId = "n5-lesson-1";
let currentSubStep = "theory"; // theory | exercises | test | review
let activeRightTab = "notes"; // notes | takeaways | results
let isRightPanelCollapsed = typeof localStorage !== "undefined" ? (localStorage.getItem(STORAGE_KEY_RIGHT_COLLAPSED) === "true") : false;

// Biến runtime cho phần Ôn tập & Sinh đề
let currentReviewMode = "translate"; // translate | cloze | reading
let currentReviewQuestions = null;
let currentReviewAnswers = {};
let currentReviewEvaluation = null;
let isCustomExampleFormOpen = false;
let isAIModalOpen = false;

// Trích xuất từ vựng từ các dự án của người dùng + từ vựng trọng tâm bài 1
export function extractLessonAndProjectVocab(lesson) {
  let userVocab = [];
  try {
    const projects = getProjects() || [];
    projects.forEach(p => {
      if (Array.isArray(p.vocab)) {
        p.vocab.forEach(v => {
          if (v && v.japanese && v.meaning) {
            userVocab.push({
              japanese: v.japanese.split(/[\(\/]/)[0].trim(),
              romaji: v.romaji || "",
              meaning: v.meaning.split(/[\(\/]/)[0].trim(),
              projectName: p.name || "Dự án cá nhân"
            });
          }
        });
      }
    });
  } catch (e) {
    console.warn("Lỗi lấy từ vựng từ getProjects:", e);
  }

  const baseSubjects = [
    { jp: "わたし", romaji: "watashi", vi: "tôi" },
    { jp: "あなた", romaji: "anata", vi: "bạn" },
    { jp: "あのかた", romaji: "ano kata", vi: "vị kia" },
    { jp: "タインさん", romaji: "Thanh-san", vi: "anh Thanh" },
    { jp: "マイさん", romaji: "Mai-san", vi: "chị Mai" },
    { jp: "ミラーさん", romaji: "Miraa-san", vi: "anh Miller" },
    { jp: "ナムさん", romaji: "Nam-san", vi: "anh Nam" },
    { jp: "ワンさん", romaji: "Wan-san", vi: "anh Wang" }
  ];

  const baseNouns = [
    { jp: "がくせい", romaji: "gakusei", vi: "học sinh" },
    { jp: "せんせい", romaji: "sensei", vi: "giáo viên" },
    { jp: "かいしゃいん", romaji: "kaishain", vi: "nhân viên công ty" },
    { jp: "エンジニア", romaji: "enjinia", vi: "kỹ sư" },
    { jp: "いしゃ", romaji: "isha", vi: "bác sĩ" },
    { jp: "ベトナムじん", romaji: "Betonamu-jin", vi: "người Việt Nam" },
    { jp: "にほんじん", romaji: "Nihon-jin", vi: "người Nhật" },
    { jp: "アメリカじん", romaji: "Amerika-jin", vi: "người Mỹ" }
  ];

  return { userVocab, baseSubjects, baseNouns };
}

// Chuẩn hóa câu để so sánh kết quả dịch
export function normalizeSentenceForComparison(str) {
  if (!str) return "";
  let s = String(str).trim();
  s = s.replace(/[。\.!?！？]+$/g, "");
  s = s.replace(/\u3000/g, " ");
  return s.replace(/\s+/g, "").toLowerCase();
}

// Kiểm tra câu trả lời người dùng nhập
export function checkTranslationAnswer(userAnswer, targetJp, targetRomaji, acceptedVariations = []) {
  if (!userAnswer || !userAnswer.trim()) {
    return { isCorrect: false, matchType: "empty" };
  }
  const normUser = normalizeSentenceForComparison(userAnswer);
  const normTargetJp = normalizeSentenceForComparison(targetJp);
  const normTargetRomaji = normalizeSentenceForComparison(targetRomaji);
  const userAsKana = normalizeSentenceForComparison(romajiToHiragana(userAnswer));

  if (normUser === normTargetJp || userAsKana === normTargetJp) {
    return { isCorrect: true, matchType: "exact_jp" };
  }
  if (normUser === normTargetRomaji) {
    return { isCorrect: true, matchType: "exact_romaji" };
  }
  for (const variation of acceptedVariations) {
    const normVar = normalizeSentenceForComparison(variation);
    if (normUser === normVar || userAsKana === normVar) {
      return { isCorrect: true, matchType: "variation" };
    }
  }
  return { isCorrect: false, matchType: "mismatch" };
}

// Bộ sinh câu hỏi luyện tập thông minh nội bộ (100% ngữ pháp Bài 1 & từ vựng dự án)
export function generateLessonReviewQuestions(lesson, mode) {
  const { userVocab, baseSubjects, baseNouns } = extractLessonAndProjectVocab(lesson);

  if (mode === "translate") {
    return {
      mode: "translate",
      questions: [
        {
          id: "q-tr-1",
          type: "translate",
          pattern: "A は B です",
          prompt: "Dịch sang tiếng Nhật: 'Tôi là kỹ sư.'",
          vi: "Tôi là kỹ sư.",
          targetJp: "わたしはエンジニアです",
          targetRomaji: "watashi wa enjinia desu",
          acceptedVariations: [
            "わたしはエンジニアです",
            "わたし は エンジニア です",
            "watashi wa enjinia desu",
            "わたしはえんじにあです"
          ],
          explanation: "Mẫu câu khẳng định danh từ cơ bản: わたし (Tôi) + は (wa) + エンジニア (kỹ sư) + です (desu)."
        },
        {
          id: "q-tr-2",
          type: "translate",
          pattern: "A は B じゃありません",
          prompt: "Dịch sang tiếng Nhật: 'Anh Miller không phải là bác sĩ.'",
          vi: "Anh Miller không phải là bác sĩ.",
          targetJp: "ミラーさんはいしゃじゃありません",
          targetRomaji: "miraa-san wa isha ja arimasen",
          acceptedVariations: [
            "ミラーさんはいしゃじゃありません",
            "ミラーさんは医者じゃありません",
            "ミラーさんはいしゃではありません",
            "ミラーさんは医者ではありません",
            "miraa-san wa isha ja arimasen",
            "miraa san wa isha ja arimasen"
          ],
          explanation: "Mẫu câu phủ định danh từ: ミラーさん + は + いしゃ + じゃありません (hoặc ではありません trong văn viết)."
        },
        {
          id: "q-tr-3",
          type: "translate",
          pattern: "A は B ですか",
          prompt: "Dịch sang tiếng Nhật: 'Bạn có phải là học sinh không?'",
          vi: "Bạn có phải là học sinh không?",
          targetJp: "あなたはがくせいですか",
          targetRomaji: "anata wa gakusei desu ka",
          acceptedVariations: [
            "あなたはがくせいですか",
            "あなたは学生ですか",
            "あなた は がくせい ですか",
            "あなた は 学生 ですか",
            "anata wa gakusei desu ka",
            "anata wa gakusei desuka"
          ],
          explanation: "Mẫu câu hỏi xác nhận thông tin: あなた + は + がくせい + ですか (ngữ điệu trợ từ か lên giọng nhẹ)."
        },
        {
          id: "q-tr-4",
          type: "translate",
          pattern: "A も B です",
          prompt: "Dịch sang tiếng Nhật: 'Anh Thanh là người Việt Nam. Tôi cũng là người Việt Nam.'",
          vi: "Anh Thanh là người Việt Nam. Tôi cũng là người Việt Nam.",
          targetJp: "タインさんはベトナムじんです。わたしもベトナムじんです",
          targetRomaji: "thanh-san wa betonamujin desu. watashi mo betonamujin desu",
          acceptedVariations: [
            "タインさんはベトナムじんです。わたしもベトナムじんです",
            "タインさんはベトナム人です。わたしもベトナム人です",
            "タインさんはベトナムじんです。わたしもベトナムじんです。",
            "タインさんはベトナム人です。わたしもベトナム人です。",
            "thanh-san wa betonamujin desu. watashi mo betonamujin desu",
            "thanh san wa betonamu jin desu. watashi mo betonamu jin desu"
          ],
          explanation: "Trợ từ も (cũng) thay thế hoàn toàn cho は ở câu thứ hai khi có cùng tính chất 'ベトナムじん'."
        },
        {
          id: "q-tr-5",
          type: "translate",
          pattern: "A は B ではありません",
          prompt: "Dịch sang tiếng Nhật (dạng trang trọng): 'Vị kia không phải là giáo viên.'",
          vi: "Vị kia không phải là giáo viên.",
          targetJp: "あのかたはせんせいではありません",
          targetRomaji: "ano kata wa sensei dewa arimasen",
          acceptedVariations: [
            "あのかたはせんせいではありません",
            "あの方は先生ではありません",
            "あのかたはせんせいじゃありません",
            "あの方は先生じゃありません",
            "ano kata wa sensei dewa arimasen",
            "ano kata wa sensei ja arimasen"
          ],
          explanation: "Dạng phủ định trang trọng (văn viết hoặc phát biểu): あのかた + は + せんせい + ではありません."
        }
      ]
    };
  }

  if (mode === "cloze") {
    return {
      mode: "cloze",
      questions: [
        {
          id: "q-cl-1",
          type: "cloze",
          question: "タインさん [ ... ] ベトナムじん です。",
          options: ["は", "も", "か", "の"],
          correct: 0,
          explanation: "Trợ từ 'は' (phát âm là wa) đứng sau chủ ngữ タインさん để xác định chủ đề của câu khẳng định."
        },
        {
          id: "q-cl-2",
          type: "cloze",
          question: "マイさん は がくせい です。ナムさん [ ... ] がくせい です。",
          options: ["は", "も", "が", "か"],
          correct: 1,
          explanation: "Cả Mai và Nam đều là học sinh, câu thứ hai dùng trợ từ 'も' (cũng) để biểu thị tính tương đồng, thay thế cho は."
        },
        {
          id: "q-cl-3",
          type: "cloze",
          question: "ワンさん は いしゃ [ ... ]。エンジニア です。",
          options: ["です", "じゃありません", "ですか", "も"],
          correct: 1,
          explanation: "Vế sau đính chính 'エンジニア です' nên vế trước phải phủ định bằng 'じゃありません' (không phải là bác sĩ)."
        },
        {
          id: "q-cl-4",
          type: "cloze",
          question: "ミラーさん は アメリカじん です [ ... ]。 ➔ はい、アメリカじん です。",
          options: ["ね", "か", "よ", "も"],
          correct: 1,
          explanation: "Câu đối thoại kết thúc bằng 'ですか' để hỏi xác nhận: 'Anh Miller có phải người Mỹ không?'."
        },
        {
          id: "q-cl-5",
          type: "cloze",
          question: "あのかた は せんせい [ ... ]。（Dạng văn viết lịch sự chuẩn mực）",
          options: ["ではありません", "じゃありませんか", "でした", "もではありません"],
          correct: 0,
          explanation: "ではありません mang sắc thái trang trọng, chuẩn mực nhất trong văn viết và phát biểu công sở."
        }
      ]
    };
  }

  // mode === "reading"
  return {
    mode: "reading",
    passage: {
      jp: "はじめまして。わたしはマイです。ベトナムじんです。23さいです。エンジニアです。いしゃじゃありません。ナムさんもベトナムじんです。ナムさんはかいしゃいんです。どうぞよろしくおねがいします。",
      romaji: "Hajimemashite. Watashi wa Mai desu. Betonamu-jin desu. 23-sai desu. Enjinia desu. Isha ja arimasen. Nam-san mo Betonamu-jin desu. Nam-san wa kaishain desu. Douzo yoroshiku onegaishimasu.",
      vi: "Rất vui được gặp bạn. Tôi là Mai. Tôi là người Việt Nam. Tôi 23 tuổi. Tôi là kỹ sư. Tôi không phải là bác sĩ. Anh Nam cũng là người Việt Nam. Anh Nam là nhân viên công ty. Rất mong nhận được sự giúp đỡ."
    },
    questions: [
      {
        id: "q-rd-1",
        type: "reading",
        question: "マイさんの仕事（職業）は何ですか？",
        options: ["がくせい", "いしゃ", "エンジニア", "せんせい"],
        correct: 2,
        explanation: "Trong đoạn văn giới thiệu rõ: 'エンジニアです。いしゃじゃありません。' (Mai là kỹ sư, không phải bác sĩ)."
      },
      {
        id: "q-rd-2",
        type: "reading",
        question: "マイさんはどの国の人ですか？",
        options: ["ベトナムじん", "にほんじん", "アメリカじん", "ちゅうごくじん"],
        correct: 0,
        explanation: "Trong bài giới thiệu: 'わたしはマイです。ベトナムじんです。' (Mai là người Việt Nam)."
      },
      {
        id: "q-rd-3",
        type: "reading",
        question: "ナムさんについて、đoạn văn trên cho biết điều gì đúng nhất?",
        options: [
          "ナムさんはいしゃです。",
          "ナムさんもベトナムじんです。",
          "ナムさんはアメリカじんです。",
          "ナムさんはがくせいです。"
        ],
        correct: 1,
        explanation: "Trong bài có câu: 'ナムさんもベトナムじんです。ナムさんはかいしゃいんです。' (Anh Nam cũng là người Việt Nam)."
      },
      {
        id: "q-rd-4",
        type: "reading",
        question: "[Điền từ vào chỗ trống theo ngữ cảnh đoạn văn] マイさんはエンジニアです。いしゃ [ ... ]。",
        options: ["です", "じゃありません", "ですか", "も"],
        correct: 1,
        explanation: "Theo mạch văn tự giới thiệu: 'エンジニアです。いしゃじゃありません。' để bác bỏ việc mình là bác sĩ."
      }
    ]
  };
}

// Gọi API AI ngoài (Gemini hoặc OpenAI) để sinh đề thi tùy biến
export async function callAIReviewAPI({ lesson, mode, userVocab, config }) {
  const { provider, apiKey, model } = config;
  if (!apiKey) {
    throw new Error("Chưa có API Key. Vui lòng bấm '⚙️ Cài đặt AI API' để nhập key của bạn.");
  }

  const vocabListStr = (userVocab || []).slice(0, 20).map(v => `${v.japanese} (${v.meaning})`).join(', ');

  const prompt = `
Bạn là chuyên gia khảo thí tiếng Nhật JLPT N5.
Hãy tạo đề ôn tập ngữ pháp cho Bài 1: Giới thiệu bản thân (N5).
Cấu trúc ngữ pháp Bài 1 gồm đúng 4 mẫu:
1. Khẳng định: A は B です
2. Phủ định: A は B じゃありません (hoặc ではありません)
3. Nghi vấn: A は B ですか
4. Trợ từ cũng: A も B です

RÀNG BUỘC NGHIÊM NGẶT:
- Chỉ sử dụng 4 cấu trúc ngữ pháp trên.
- Sử dụng các từ vựng sau từ dự án học viên: ${vocabListStr || "わたし, あなた, タインさん, マイさん, ミラーさん, 学生, 会社員, エンジニア, 医者, ベトナム人, 日本人, アメリカ人"}.
- Yêu cầu sinh duy nhất 1 dạng bài: "${mode}".

TRẢ VỀ DUY NHẤT MỘT ĐỐI TƯỢNG JSON HỢP LỆ (không bọc trong markdown tick hay text nào khác):
{
  "mode": "${mode}",
  "passage": ${mode === 'reading' ? '{"jp": "...", "romaji": "...", "vi": "..."}' : 'null'},
  "questions": [
    {
      "id": "ai-1",
      "type": "${mode}",
      "prompt": "Dịch sang tiếng Nhật: '...'",
      "sentence": "Câu điền từ [ ... ]",
      "question": "Câu hỏi đọc hiểu",
      "targetJp": "Câu tiếng Nhật chuẩn",
      "targetRomaji": "Câu romaji",
      "acceptedVariations": ["..."],
      "options": ["A", "B", "C", "D"],
      "correct": 0,
      "explanation": "Giải thích ngữ pháp Bài 1"
    }
  ]
}
`;

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || "";
    const cleanJson = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } else {
    // Gemini
    const geminiModel = model || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanJson = content.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  }
}

export const STORAGE_KEY_GRAMMAR_FONT_SIZE = "miw_grammar_content_font_size";

// Phát âm tự động cho từ vựng / trợ từ ngữ pháp khi bấm vào
export function playGrammarWordAudio(word, markEl) {
  if (!word) return;
  const cleanWord = String(word).trim();
  if (!cleanWord) return;

  if (markEl && markEl.classList) {
    markEl.classList.add("gp-speaking");
    setTimeout(() => markEl.classList.remove("gp-speaking"), 600);
  }

  // Trợ từ は: khi đứng một mình TTS trong tiếng Nhật hay đọc là 'ha',
  // nhưng khi đóng vai trò trợ từ ngữ pháp, bắt buộc phát âm là 'wa'.
  if (cleanWord === "は" || markEl?.classList?.contains("gp-ha")) {
    speakJapanese("わ", true);
  } else {
    speakJapanese(cleanWord, true);
  }
}

// Điều chỉnh cỡ chữ nội dung bài học linh hoạt
export function applyGrammarFontSize(sizePx) {
  const size = parseFloat(sizePx) || 18.5;
  const grammarMain = document.getElementById("grammar-main-content");
  if (grammarMain) {
    grammarMain.style.setProperty("--grammar-content-font-size", `${size}px`);
  }
  const grammarView = document.getElementById("grammar-view");
  if (grammarView) {
    grammarView.style.setProperty("--grammar-content-font-size", `${size}px`);
  }

  // Cập nhật text badge hiển thị cỡ chữ
  const badge = document.getElementById("grammar-font-size-indicator");
  if (badge) {
    let label = "Vừa";
    if (size <= 15) label = "Nhỏ";
    else if (size <= 17) label = "Vừa";
    else if (size <= 19.5) label = "Lớn";
    else label = "Rất lớn";
    badge.textContent = `${size}px · ${label}`;
  }

  const slider = document.getElementById("grammar-font-slider");
  if (slider) slider.value = size;

  if (typeof document !== "undefined") {
    document.querySelectorAll(".font-size-preset-btn").forEach(btn => {
      const btnSize = parseFloat(btn.dataset.size);
      if (Math.abs(btnSize - size) < 1) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY_GRAMMAR_FONT_SIZE, String(size));
  }
}

let isGrammarSettingsInitialized = false;

export function initGrammarSettings() {
  const savedSize = (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY_GRAMMAR_FONT_SIZE)) || "18.5";
  applyGrammarFontSize(savedSize);

  if (isGrammarSettingsInitialized) return;
  isGrammarSettingsInitialized = true;

  const settingsBtn = document.getElementById("grammar-settings-btn");
  const popover = document.getElementById("grammar-settings-popover");
  const closeBtn = document.getElementById("grammar-close-settings-btn");
  const slider = document.getElementById("grammar-font-slider");

  if (settingsBtn && popover) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      popover.classList.toggle("hidden");
    });
  }

  if (closeBtn && popover) {
    closeBtn.addEventListener("click", () => {
      popover.classList.add("hidden");
    });
  }

  // Bấm ra ngoài popover để đóng
  document.addEventListener("click", (e) => {
    if (popover && !popover.classList.contains("hidden")) {
      if (!popover.contains(e.target) && !settingsBtn?.contains(e.target)) {
        popover.classList.add("hidden");
      }
    }
  });

  // Kéo thanh trượt thay đổi cỡ chữ tức thì
  if (slider) {
    slider.addEventListener("input", (e) => {
      applyGrammarFontSize(e.target.value);
    });
  }

  // Các nút chọn nhanh preset cỡ chữ
  document.querySelectorAll(".font-size-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const size = btn.dataset.size;
      applyGrammarFontSize(size);
    });
  });

  // Tự động phát âm khi bấm vào bất kỳ từ khóa ngữ pháp in đậm / có màu
  document.getElementById("grammar-view")?.addEventListener("click", (e) => {
    const mark = e.target.closest(".gp-mark, .gp-speak-target, [data-speak]");
    if (mark) {
      e.stopPropagation();
      const textToSpeak = mark.getAttribute("data-speak") || mark.innerText;
      playGrammarWordAudio(textToSpeak, mark);
    }
  });
}

// Khởi tạo các sự kiện giao diện
export function setupGrammarUI() {
  const state = loadAllGrammarProgress();
  if (state.activeLessonId) currentLessonId = state.activeLessonId;
  if (state.activeSubStep) currentSubStep = state.activeSubStep;

  initGrammarSettings();

  const grammarNavBtn = document.getElementById("nav-grammar");
  if (grammarNavBtn) {
    grammarNavBtn.addEventListener("click", () => {
      renderGrammarView();
    });
  }
}

// Điều hướng chính: render toàn bộ workspace Ngữ pháp
export function renderGrammarView() {
  const view = document.getElementById("grammar-view");
  if (!view) return;

  if (typeof document !== "undefined" && document.body) {
    document.body.classList.add("view-grammar-active");
  }

  // Phục hồi và áp dụng cỡ chữ đã lưu
  const savedSize = (typeof localStorage !== "undefined" && localStorage.getItem(STORAGE_KEY_GRAMMAR_FONT_SIZE)) || "18.5";
  applyGrammarFontSize(savedSize);

  const currentLesson = getCurrentLessonData();
  if (!currentLesson) return;

  renderLeftCourseMenu(currentLesson);
  renderCenterWorkspace(currentLesson);
  renderRightToolsPanel(currentLesson);
}

function getCurrentLessonData() {
  const chapter = GRAMMAR_CHAPTERS[currentChapterIndex];
  if (!chapter) return null;
  return chapter.lessons.find(l => l.id === currentLessonId) || chapter.lessons[0];
}

/* ==========================================================================
   CỘT TRÁI (SÁT LỀ): MENU KHÓA HỌC & LỘ TRÌNH BÀI 1
   ========================================================================== */
function renderLeftCourseMenu(lesson) {
  const sidebar = document.getElementById("grammar-sidebar-left");
  if (!sidebar) return;

  const progress = getLessonProgress(lesson.id);
  const percent = calculateLessonPercent(lesson.id);
  const allState = loadAllGrammarProgress();

  sidebar.innerHTML = `
    <div class="course-menu-header">
      <div class="course-menu-level-badge">JLPT N5</div>
      <h3 class="course-menu-title">Khóa Học Ngữ Pháp</h3>
      <small class="course-menu-sub">Chương 1: Giới Thiệu Bản Thân</small>
    </div>

    <div class="course-lessons-accordion">
      <!-- Bài 1: Đang học (sổ ra các phần con) -->
      <div class="accordion-lesson-card current-active-lesson">
        <div class="acc-lesson-head">
          <div class="acc-lesson-title-row">
            <span class="acc-num-badge">Bài 1</span>
            <strong>Giới Thiệu Bản Thân</strong>
          </div>
          <span class="acc-progress-pill">${percent}%</span>
        </div>

        <!-- Các bước lộ trình con trong Bài 1 (sổ ra từ menu Bài 1) -->
        <div class="acc-sub-steps-tree">
          <!-- Bước 1: Lý thuyết -->
          <div class="acc-step-item ${currentSubStep === 'theory' ? 'active-step' : ''} ${progress.theoryDone ? 'completed-step' : ''}" data-step="theory">
            <span class="step-indicator-icon">${progress.theoryDone ? '✓' : '📖'}</span>
            <div class="step-info">
              <span class="step-label">1. Lý thuyết bài giảng</span>
              <small>${progress.theoryDone ? 'Đã hoàn thành' : 'Đang học'}</small>
            </div>
          </div>

          <!-- Bước 2: Bài tập (phải xong lý thuyết mới đi tiếp) -->
          <div class="acc-step-item ${currentSubStep === 'exercises' ? 'active-step' : ''} ${progress.exercisesDone ? 'completed-step' : ''} ${!progress.theoryDone && !allState.unlockedAll ? 'locked-step' : ''}" data-step="exercises">
            <span class="step-indicator-icon">${progress.exercisesDone ? '✓' : (!progress.theoryDone && !allState.unlockedAll ? '🔒' : '✍️')}</span>
            <div class="step-info">
              <span class="step-label">2. Luyện tập thực hành</span>
              <small>${progress.exercisesDone ? 'Đã làm xong' : (!progress.theoryDone && !allState.unlockedAll ? 'Khóa (cần xong bước 1)' : '5 bài tập đa dạng')}</small>
            </div>
          </div>

          <!-- Bước 3: Bài kiểm tra (phải xong bài tập mới mở) -->
          <div class="acc-step-item ${currentSubStep === 'test' ? 'active-step' : ''} ${progress.testPassed ? 'completed-step' : ''} ${!progress.exercisesDone && !allState.unlockedAll ? 'locked-step' : ''}" data-step="test">
            <span class="step-indicator-icon">${progress.testPassed ? '🏆' : (!progress.exercisesDone && !allState.unlockedAll ? '🔒' : '🎯')}</span>
            <div class="step-info">
              <span class="step-label">3. Kiểm tra đánh giá</span>
              <small>${progress.testPassed ? `Đạt ${progress.testScore}/${progress.testTotal} điểm` : (!progress.exercisesDone && !allState.unlockedAll ? 'Khóa (cần làm bài tập)' : 'Đạt ≥ 80% để qua bài')}</small>
            </div>
          </div>

          <!-- Bước 4: Ôn tập & Sinh đề luyện tập (mở sau khi vượt qua bài kiểm tra) -->
          <div class="acc-step-item ${currentSubStep === 'review' ? 'active-step' : ''} ${progress.reviewDone ? 'completed-step' : ''} ${!progress.testPassed && !allState.unlockedAll ? 'locked-step' : ''}" data-step="review">
            <span class="step-indicator-icon">${progress.reviewDone ? '🌟' : (!progress.testPassed && !allState.unlockedAll ? '🔒' : '🔥')}</span>
            <div class="step-info">
              <span class="step-label">4. Ôn tập & Sinh đề luyện tập</span>
              <small>${progress.reviewDone ? 'Đã hoàn thành ôn tập' : (!progress.testPassed && !allState.unlockedAll ? 'Khóa (cần xong Bài kiểm tra)' : 'Tự tạo ví dụ & Đề JLPT N5')}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Các bài học tiếp theo (Bài 2, 3, 4, 5...) -->
      ${GRAMMAR_CHAPTERS[currentChapterIndex].lessons.filter(l => l.id !== "n5-lesson-1").map(l => {
        const isLock = isLessonLocked(l.id);
        const p = getLessonProgress(l.id);
        return `
          <div class="accordion-lesson-card ${isLock ? 'locked-lesson' : 'open-lesson'}" data-lesson-id="${l.id}">
            <div class="acc-lesson-head">
              <div class="acc-lesson-title-row">
                <span class="acc-num-badge">${isLock ? '🔒' : 'Bài ' + l.number}</span>
                <strong>${l.title.replace(/^Bài \d+:\s*/, '')}</strong>
              </div>
              <small class="acc-lock-hint">${isLock ? 'Khóa' : (p.testPassed ? '✓ Đã xong' : 'Mở')}</small>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="course-menu-footer">
      <button type="button" class="btn btn-secondary btn-sm" id="g-unlock-all-btn" style="width: 100%; font-size: 11px;">
        ${allState.unlockedAll ? '🔓 Đang mở tự do' : '🔓 Mở khóa tự do toàn bộ'}
      </button>
    </div>
  `;

  // Bắt sự kiện chuyển bước lộ trình con trong bài 1
  sidebar.querySelectorAll(".acc-step-item:not(.locked-step)").forEach(item => {
    item.addEventListener("click", () => {
      const step = item.getAttribute("data-step");
      if (step) {
        currentSubStep = step;
        const all = loadAllGrammarProgress();
        all.activeSubStep = step;
        saveAllGrammarProgress(all);
        renderGrammarView();
      }
    });
  });

  // Bắt sự kiện click vào bước bị khóa -> thông báo hướng dẫn
  sidebar.querySelectorAll(".acc-step-item.locked-step").forEach(item => {
    item.addEventListener("click", () => {
      const step = item.getAttribute("data-step");
      if (step === "exercises") {
        alert("🔒 Bước này đang bị khóa!\nBạn cần đọc qua '1. Lý thuyết bài giảng' và bấm nút '✓ Đã học xong lý thuyết' để mở khóa phần Luyện tập.");
      } else if (step === "test") {
        alert("🔒 Bài kiểm tra đang bị khóa!\nBạn cần hoàn thành phần '2. Luyện tập thực hành' trước khi làm Bài kiểm tra.");
      } else if (step === "review") {
        alert("🔒 Phần Ôn tập đang bị khóa!\nBạn cần vượt qua '3. Bài kiểm tra đánh giá' (đạt ≥ 80%) trước khi mở khóa Ôn tập & Sinh đề luyện tập.");
      }
    });
  });

  // Toggle mở khóa tất cả
  const unlockBtn = document.getElementById("g-unlock-all-btn");
  if (unlockBtn) {
    unlockBtn.addEventListener("click", () => {
      const all = loadAllGrammarProgress();
      all.unlockedAll = !all.unlockedAll;
      saveAllGrammarProgress(all);
      renderGrammarView();
    });
  }
}

function isLessonLocked(lessonId) {
  const all = loadAllGrammarProgress();
  if (all.unlockedAll) return false;
  if (lessonId === "n5-lesson-1") return false;
  if (lessonId === "n5-lesson-2") {
    return !getLessonProgress("n5-lesson-1").testPassed;
  }
  const lesson = GRAMMAR_CHAPTERS[currentChapterIndex].lessons.find(l => l.id === lessonId);
  return lesson?.locked === true;
}

/* ==========================================================================
   KHU VỰC TRUNG TÂM: BÀI GIẢNG / BÀI TẬP / KIỂM TRA
   ========================================================================== */
function renderCenterWorkspace(lesson) {
  const main = document.getElementById("grammar-main-content");
  if (!main) return;

  const progress = getLessonProgress(lesson.id);
  const stepNums = { theory: '1/4', exercises: '2/4', test: '3/4', review: '4/4' };
  const stepTitles = {
    theory: '📖 1. Lý Thuyết & Mẫu Câu Bài Giảng',
    exercises: '✍️ 2. Luyện Tập Thực Hành Đa Dạng',
    test: '🎯 3. Bài Kiểm Tra Đánh Giá Năng Lực',
    review: '🔥 4. Ôn Tập Chuyên Sâu, Tạo Mẫu Câu & Luyện Đề JLPT'
  };

  // Render nội dung tương ứng theo bước lộ trình con đang chọn
  main.innerHTML = `
    <div class="workspace-header-bar">
      <div class="workspace-current-step-badge">
        <span class="step-num-pill">Bước ${stepNums[currentSubStep] || '1/4'}</span>
        <h2 class="workspace-step-title">
          ${stepTitles[currentSubStep] || '📖 1. Lý Thuyết & Mẫu Câu Bài Giảng'}
        </h2>
      </div>
      <div class="workspace-step-status">
        ${currentSubStep === 'theory' && progress.theoryDone ? '<span class="status-chip chip-done">✓ Đã học xong lý thuyết</span>' : ''}
        ${currentSubStep === 'exercises' && progress.exercisesDone ? '<span class="status-chip chip-done">✓ Đã làm xong bài tập</span>' : ''}
        ${currentSubStep === 'test' && progress.testPassed ? '<span class="status-chip chip-done">🏆 Đã đạt chuẩn chốt bài</span>' : ''}
        ${currentSubStep === 'review' && progress.reviewDone ? '<span class="status-chip chip-done">🌟 Đã hoàn thành ôn tập</span>' : ''}
      </div>
    </div>

    <div class="grammar-tab-content-container">
      ${currentSubStep === 'theory' ? renderTheoryTabHtml(lesson, progress) : ''}
      ${currentSubStep === 'exercises' ? renderExercisesTabHtml(lesson, progress) : ''}
      ${currentSubStep === 'test' ? renderTestTabHtml(lesson, progress) : ''}
      ${currentSubStep === 'review' ? renderReviewTabHtml(lesson, progress) : ''}
    </div>
  `;

  attachWorkspaceEventListeners(lesson);
}

// 1. Render Tab Lý Thuyết (đào sâu, gạch đầu dòng, highlight từ khóa, có các đoạn ngắt giữa các phần)
function renderTheoryTabHtml(lesson, progress) {
  const dividerPhases = [
    {
      id: "sec-khang-dinh",
      exId: "sec-khang-dinh-examples",
      tag: "Bắt đầu",
      title: "Phần 1: Dạng khẳng định (A は B です)",
      phaseClass: "divider-phase-1"
    },
    {
      id: "sec-phu-dinh",
      exId: "sec-phu-dinh-examples",
      tag: "Tiếp tục",
      title: "Phần 2: Dạng phủ định (A は B じゃありません)",
      phaseClass: "divider-phase-2"
    },
    {
      id: "sec-nghi-van",
      exId: "sec-nghi-van-examples",
      tag: "Mở rộng",
      title: "Phần 3: Dạng câu hỏi nghi vấn (A は B ですか)",
      phaseClass: "divider-phase-3"
    },
    {
      id: "sec-tro-tu-mo",
      exId: "sec-tro-tu-mo-examples",
      tag: "Nâng cao",
      title: "Phần 4: Trợ từ đồng nhất (A も B です)",
      phaseClass: "divider-phase-4"
    }
  ];

  return `
    <div class="theory-view-wrapper">
      <div class="theory-intro-banner">
        <h3>Bài 1: Giới Thiệu Bản Thân (自己紹介)</h3>
        <p>Học kỹ 4 cấu trúc nền tảng. Các từ khóa ngữ pháp chính (<span class="gp-mark gp-ha">は</span>, <span class="gp-mark gp-desu">です</span>, <span class="gp-mark gp-ja">じゃありません</span>, <span class="gp-mark gp-ka">ですか</span>, <span class="gp-mark gp-mo">も</span>) đã được gạch chân và tô màu nổi bật. Bấm nút 🔊 Loa để nghe phát âm tự nhiên:</p>
      </div>

      <div class="grammar-patterns-stack">
        ${(lesson.patterns || []).map((p, idx) => {
          const divInfo = dividerPhases[idx] || {
            id: `sec-pattern-${idx + 1}`,
            exId: `sec-pattern-${idx + 1}-examples`,
            tag: `Phần ${idx + 1}`,
            title: `Mẫu ${idx + 1}: ${p.name}`,
            phaseClass: `divider-phase-${(idx % 4) + 1}`
          };

          return `
            <!-- Đoạn ngắt phân cách phần học -->
            <div class="grammar-section-divider ${divInfo.phaseClass}" id="${divInfo.id}">
              <div class="divider-line divider-line-left"></div>
              <div class="divider-pill">
                <span class="divider-step-tag">${divInfo.tag}</span>
                <span class="divider-title">${divInfo.title}</span>
              </div>
              <div class="divider-line divider-line-right"></div>
            </div>

            <article class="grammar-pattern-card">
              <header class="pattern-header">
                <span class="pattern-index">Mẫu ${idx + 1}</span>
                <h3 class="pattern-title">${p.name}</h3>
                <span class="pattern-meaning">${p.meaning}</span>
              </header>

              <div class="pattern-formula-bar">
                <code>${p.formula}</code>
              </div>

              <div class="pattern-desc">
                <p class="pattern-main-summary">${p.explanation}</p>

                <!-- Các gạch đầu dòng đào sâu cặn kẽ -->
                <div class="deep-points-box">
                  <h4 class="deep-heading">🔍 Phân tích chi tiết từng điểm cốt lõi:</h4>
                  <ul class="deep-points-list">
                    ${p.deepPoints.map(point => `<li>${point}</li>`).join('')}
                  </ul>
                </div>

                ${p.notes ? `<div class="pattern-note-box">${p.notes}</div>` : ''}
              </div>

              <div class="pattern-examples-box" id="${divInfo.exId}">
                <h4>🗣️ Các câu ví dụ thực tế (Bấm 🔊 để nghe phát âm):</h4>
                <div class="pattern-examples-list">
                  ${p.examples.map(ex => `
                    <div class="pattern-example-row">
                      <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${ex.audio || ex.jp}" title="Nghe phát âm">
                        🔊
                      </button>
                      <div class="example-content">
                        <div class="ex-jp">${ex.jp}</div>
                        <div class="ex-romaji">${ex.romaji}</div>
                        <div class="ex-vi">${ex.vi}</div>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </article>
          `;
        }).join('')}
      </div>

      ${lesson.readingArticle ? `
        <!-- Đoạn ngắt phân cách phần ứng dụng thực tế -->
        <div class="grammar-section-divider divider-phase-reading" id="sec-ung-dung">
          <div class="divider-line divider-line-left"></div>
          <div class="divider-pill">
            <span class="divider-step-tag">Ứng dụng</span>
            <span class="divider-title">Phần 5: Tổng kết hội thoại & Đoạn văn thực tế</span>
          </div>
          <div class="divider-line divider-line-right"></div>
        </div>

        <article class="grammar-pattern-card reading-article-card" id="sec-ung-dung-card">
          <header class="pattern-header">
            <span class="pattern-index">Ứng dụng</span>
            <h3 class="pattern-title">${lesson.readingArticle.title}</h3>
          </header>
          <div class="reading-passage-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <strong>Đoạn văn hoàn chỉnh:</strong>
              <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${lesson.readingArticle.audio || lesson.readingArticle.passageJp}" title="Nghe toàn bộ đoạn văn">
                🔊 Nghe toàn bài
              </button>
            </div>
            <p class="reading-jp">${lesson.readingArticle.passageJp}</p>
            <p class="reading-romaji">${lesson.readingArticle.passageRomaji}</p>
            <p class="reading-vi">${lesson.readingArticle.passageVi}</p>
          </div>
        </article>
      ` : ''}

      <div class="theory-footer-actions">
        <button type="button" class="btn btn-primary btn-lg" id="g-mark-theory-done-btn">
          ${progress.theoryDone ? '✓ Đã hoàn thành Lý thuyết ➔ Sang làm Bài tập' : '✓ Tôi đã hiểu bài ➔ Mở khóa làm bài tập'}
        </button>
      </div>
    </div>
  `;
}

// 2. Render Tab Bài Tập Thực Hành
function renderExercisesTabHtml(lesson, progress) {
  const exercises = lesson.exercises || [];
  const exerciseScores = progress.exerciseScores || {};
  const completedCount = Object.keys(exerciseScores).length;

  return `
    <div class="exercises-view-wrapper">
      <div class="exercises-header-bar">
        <div>
          <h3>Luyện tập thực hành (${completedCount}/${exercises.length} câu đã trả lời)</h3>
          <p>Bài tập đa dạng: Đọc hiểu, Nghe hiểu (có loa 🔊), Điền trợ từ, Ngữ pháp và Sắp xếp câu:</p>
        </div>
      </div>

      <div class="exercises-stack">
        ${exercises.map((ex, idx) => {
          const userChoice = exerciseScores[ex.id];
          const isAnswered = typeof userChoice !== "undefined";
          const isCorrect = userChoice === ex.correct;

          return `
            <div class="exercise-item-card ${isAnswered ? (isCorrect ? 'answered-correct' : 'answered-wrong') : ''}" id="ex-card-${ex.id}">
              <div class="ex-card-head">
                <span class="ex-badge">${ex.typeLabel || 'Bài tập'}</span>
                <span class="ex-num">Câu ${idx + 1}</span>
                ${isAnswered ? (isCorrect ? '<span class="status-badge badge-pass">✓ Chính xác</span>' : '<span class="status-badge badge-fail">✗ Chưa đúng</span>') : ''}
              </div>

              ${ex.audioText ? `
                <div class="ex-audio-player">
                  <button type="button" class="btn btn-primary btn-sm g-speak-btn" data-audio="${ex.audioText}">
                    🔊 Bấm để nghe câu hỏi
                  </button>
                </div>
              ` : ''}

              <div class="ex-question-text">${ex.question}</div>

              <div class="ex-options-grid">
                ${ex.options.map((opt, optIdx) => {
                  let optClass = "ex-opt-btn";
                  if (isAnswered) {
                    if (optIdx === ex.correct) optClass += " opt-correct";
                    else if (optIdx === userChoice) optClass += " opt-wrong";
                  }
                  return `
                    <button type="button" class="${optClass}" data-ex-id="${ex.id}" data-opt-idx="${optIdx}" ${isAnswered ? 'disabled' : ''}>
                      <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
                      <span class="opt-label">${opt}</span>
                    </button>
                  `;
                }).join('')}
              </div>

              ${isAnswered ? `
                <div class="ex-explanation-panel">
                  <strong>💡 Giải thích:</strong> ${ex.explanation}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>

      <div class="exercises-footer-actions">
        <button type="button" class="btn btn-secondary" id="g-reset-exercises-btn">Làm lại bài tập</button>
        <button type="button" class="btn btn-primary" id="g-go-to-test-btn">Tiến đến Bài kiểm tra đánh giá ➔</button>
      </div>
    </div>
  `;
}

// 3. Render Tab Bài Kiểm Tra
function renderTestTabHtml(lesson, progress) {
  const questions = lesson.testQuestions || [];
  const hasPassed = progress.testPassed;

  return `
    <div class="test-view-wrapper">
      <div class="test-banner ${hasPassed ? 'banner-passed' : ''}">
        <div>
          <h3>🎯 Bài Kiểm Tra Đánh Giá Năng Lực (8 câu hỏi)</h3>
          <p>Đạt từ <strong>80% (7/8 câu)</strong> trở lên để được chứng nhận hoàn thành bài học và mở khóa bài tiếp theo!</p>
        </div>
        ${hasPassed ? `
          <div class="test-score-badge">
            <span class="score-number">${progress.testScore} / ${progress.testTotal}</span>
            <span class="score-label">⭐⭐⭐ ĐÃ ĐẠT CHUẨN</span>
          </div>
        ` : ''}
      </div>

      <form id="grammar-test-form" class="grammar-test-form">
        <div class="test-questions-stack">
          ${questions.map((q, qIdx) => `
            <div class="test-question-card" id="tq-card-${q.id}">
              <div class="tq-header">
                <span class="tq-index">Câu ${qIdx + 1}</span>
                ${q.audioText ? `
                  <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${q.audioText}">
                    🔊 Nghe phát âm
                  </button>
                ` : ''}
              </div>
              <div class="tq-text">${q.q}</div>
              <div class="tq-options">
                ${q.options.map((opt, optIdx) => `
                  <label class="tq-option-label">
                    <input type="radio" name="tq-${q.id}" value="${optIdx}" required>
                    <span class="tq-radio-custom"></span>
                    <span class="tq-option-text">${opt}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="test-submit-box" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button type="submit" class="btn btn-primary btn-lg" id="g-submit-test-btn">
            ${hasPassed ? 'Nộp bài & Chấm điểm lại 📝' : 'Nộp bài & Chấm điểm tức thì 📝'}
          </button>
          ${hasPassed ? `
            <button type="button" class="btn btn-primary btn-lg" id="g-go-to-review-btn" style="background: linear-gradient(135deg, #b5482e, #e05b38); border: none;">
              🔥 Tiến vào Bước 4: Ôn tập & Sinh đề luyện tập ➔
            </button>
          ` : ''}
        </div>
      </form>
    </div>
  `;
}

// 4. Render Tab Ôn Tập & Sinh Đề Luyện Tập Thông Minh
function renderReviewTabHtml(lesson, progress) {
  if (!currentReviewQuestions) {
    currentReviewQuestions = generateLessonReviewQuestions(lesson, currentReviewMode);
  }

  const customExamples = getCustomExamples(lesson.id);
  const { userVocab } = extractLessonAndProjectVocab(lesson);
  const aiConfig = getAIConfig();
  const hasResult = currentReviewEvaluation && currentReviewEvaluation.submitted;

  return `
    <div class="review-view-wrapper">
      <!-- 1. Header Banner -->
      <div class="review-intro-banner">
        <div class="review-banner-left">
          <span class="review-badge-step">Bước 4/4</span>
          <h3>Ôn Tập Chuyên Sâu, Tạo Mẫu Câu & Luyện Thi Thông Minh</h3>
          <p>
            Rèn luyện toàn diện theo cấu trúc đề thi JLPT N5. Bạn có thể tự tạo các mẫu câu của riêng mình, 
            hoặc để hệ thống tự động sinh đề kiểm tra bám sát <strong>ngữ pháp Bài 1</strong> và <strong>từ vựng trong dự án</strong> của bạn!
          </p>
        </div>
        <div class="review-banner-right">
          ${progress.reviewDone ? '<span class="status-badge badge-pass">🌟 Đã hoàn thành ôn tập</span>' : '<span class="status-badge badge-doing">⚡ Đang rèn luyện</span>'}
        </div>
      </div>

      <!-- 2. Phần: Kho Mẫu Ví Dụ Của Riêng Bạn -->
      <div class="custom-examples-container glass-panel">
        <div class="custom-examples-header">
          <div class="cust-header-left">
            <h4>📚 Kho Ví Dụ Của Riêng Bạn</h4>
            <span class="badge-count">${customExamples.length} mẫu câu đã tạo</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" id="toggle-add-cust-ex-btn">
            ${isCustomExampleFormOpen ? '✖ Đóng khung nhập' : '➕ Thêm ví dụ của bạn'}
          </button>
        </div>

        ${isCustomExampleFormOpen ? `
          <div class="add-cust-ex-form-card">
            <h5 style="margin: 0 0 10px 0; color: var(--accent); font-size: 13px;">✍️ Tạo mẫu câu ví dụ mới cho Bài 1</h5>
            <div class="form-grid-row" style="margin-bottom: 8px;">
              <div class="form-group-item">
                <label style="font-size: 11.5px; font-weight: 700; display: block; margin-bottom: 3px;">Áp dụng cấu trúc ngữ pháp:</label>
                <select id="new-ex-pattern" class="form-control" style="font-size: 12.5px;">
                  <option value="pattern-1">Mẫu 1: A は B です (Khẳng định)</option>
                  <option value="pattern-2">Mẫu 2: A は B じゃありません (Phủ định)</option>
                  <option value="pattern-3">Mẫu 3: A は B ですか (Nghi vấn)</option>
                  <option value="pattern-4">Mẫu 4: A も B です (Trợ từ も - Cũng)</option>
                </select>
              </div>
            </div>

            <div class="form-grid-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 8px;">
              <div class="form-group-item">
                <label style="font-size: 11.5px; font-weight: 700; display: block; margin-bottom: 3px;">Câu tiếng Nhật (Gõ Romaji tự chuyển Kana):</label>
                <input type="text" id="new-ex-jp" class="form-control review-kana-input" placeholder="Ví dụ: わたし は エンジニア です。" autocomplete="off">
              </div>
              <div class="form-group-item">
                <label style="font-size: 11.5px; font-weight: 700; display: block; margin-bottom: 3px;">Cách đọc Romaji:</label>
                <input type="text" id="new-ex-romaji" class="form-control" placeholder="Ví dụ: Watashi wa enjinia desu.">
              </div>
            </div>

            <div class="form-grid-row" style="margin-bottom: 10px;">
              <div class="form-group-item">
                <label style="font-size: 11.5px; font-weight: 700; display: block; margin-bottom: 3px;">Ý nghĩa Tiếng Việt (Cho phép gõ có dấu đầy đủ):</label>
                <input type="text" id="new-ex-vi" class="form-control" placeholder="Ví dụ: Tôi là kỹ sư.">
              </div>
            </div>

            <div class="form-actions-row" style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary btn-sm" id="cancel-cust-ex-btn">Hủy</button>
              <button type="button" class="btn btn-primary btn-sm" id="save-cust-ex-btn">💾 Lưu mẫu ví dụ này</button>
            </div>
          </div>
        ` : ''}

        <div class="custom-examples-list">
          ${customExamples.length === 0 ? `
            <div class="empty-custom-ex-hint">Chưa có ví dụ tự tạo nào. Hãy bấm '➕ Thêm ví dụ của bạn' để tạo câu thực tế theo từ vựng bạn yêu thích!</div>
          ` : customExamples.map(ex => `
            <div class="custom-example-item-card">
              <div class="ex-card-left">
                <div class="ex-card-top-row">
                  <span class="cust-ex-pattern-badge">${escapeHtml(ex.patternName || 'Ngữ pháp Bài 1')}</span>
                  <small class="cust-ex-time">${escapeHtml(ex.createdAt || '')}</small>
                </div>
                <div class="cust-ex-jp">${ex.jp}</div>
                <div class="cust-ex-romaji">${escapeHtml(ex.romaji || '')}</div>
                <div class="cust-ex-vi">${escapeHtml(ex.vi || '')}</div>
              </div>
              <div class="ex-card-right-actions">
                <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${ex.audio || ex.jp}" title="Nghe phát âm">
                  🔊
                </button>
                <button type="button" class="btn-delete-cust-ex" data-ex-id="${ex.id}" title="Xóa ví dụ này">
                  🗑️
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 3. Phần: Bộ Sinh Đề Luyện Tập Thông Minh ("chỉ gen ra đúng 1 dạng thôi") -->
      <div class="review-generator-container glass-panel">
        <div class="review-generator-header">
          <div class="gen-header-title-box">
            <h4>⚡ Bộ Sinh Đề Luyện Tập Thông Minh Chuẩn JLPT</h4>
            <span class="gen-scope-pill">🎯 100% ngữ pháp Bài 1 & ${userVocab.length} từ vựng từ các dự án của bạn</span>
          </div>

          <div class="review-action-toolbar">
            <button type="button" class="btn btn-secondary btn-sm" id="rev-regen-btn" title="Sinh ngẫu nhiên đề mới">
              🎲 Sinh đề mới
            </button>
            <button type="button" class="btn btn-secondary btn-sm" id="rev-ai-btn" title="Sinh câu hỏi với AI">
              ✨ Sinh bằng AI
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="rev-ai-config-btn" title="Cấu hình Gemini/OpenAI API">
              ⚙️ AI API
            </button>
          </div>
        </div>

        <!-- Mode Selector: Chọn duy nhất 1 dạng bài như yêu cầu: "chỉ gen ra đúng 1 dạng thôi" -->
        <div class="review-mode-selector-bar">
          <button type="button" class="rev-mode-btn ${currentReviewMode === 'translate' ? 'active' : ''}" data-mode="translate">
            <span class="mode-icon">🔤</span>
            <span class="mode-title">Dạng 1: Dịch câu & Gõ chữ Nhật (Kana IME)</span>
          </button>
          <button type="button" class="rev-mode-btn ${currentReviewMode === 'cloze' ? 'active' : ''}" data-mode="cloze">
            <span class="mode-icon">✏️</span>
            <span class="mode-title">Dạng 2: Điền từ vào chỗ trống (JLPT Mondai)</span>
          </button>
          <button type="button" class="rev-mode-btn ${currentReviewMode === 'reading' ? 'active' : ''}" data-mode="reading">
            <span class="mode-icon">📖</span>
            <span class="mode-title">Dạng 3: Đọc hiểu đoạn văn & Khuyết từ (Dokkai)</span>
          </button>
        </div>

        <!-- Nội dung đề bài tương ứng với dạng đang chọn -->
        <div class="review-arena-questions-stack">
          ${renderReviewQuestionsArena(lesson, currentReviewQuestions, currentReviewMode, currentReviewAnswers, currentReviewEvaluation)}
        </div>

        <!-- Tổng kết điểm & Nộp bài -->
        <div class="review-submit-section">
          ${hasResult ? `
            <div class="review-result-panel ${currentReviewEvaluation.passed ? 'panel-pass' : 'panel-tryagain'}">
              <div class="result-score-heading">
                <span class="score-main">${currentReviewEvaluation.score} / ${currentReviewEvaluation.total}</span>
                <span class="score-percent">(${Math.round(currentReviewEvaluation.score / currentReviewEvaluation.total * 100)}%)</span>
                <strong>${currentReviewEvaluation.passed ? '🎉 XUẤT SẮC! BẠN ĐÃ ĐẠT CHUẨN ÔN TẬP BÀI 1' : '⚠️ Hãy xem lại giải thích chi tiết bên dưới và thử lại nhé!'}</strong>
              </div>
              <div class="result-actions" style="margin-top: 10px; display: flex; gap: 8px;">
                <button type="button" class="btn btn-primary btn-sm" id="rev-retry-btn">Làm lại dạng này</button>
                <button type="button" class="btn btn-secondary btn-sm" id="rev-next-mode-btn">Đổi sang dạng khác ➔</button>
              </div>
            </div>
          ` : `
            <button type="button" class="btn btn-primary btn-lg" id="rev-submit-all-btn">
              📝 Nộp bài & Chấm điểm tức thì
            </button>
          `}
        </div>
      </div>

      <!-- Modal Cấu hình AI API -->
      <div class="modal-overlay ${isAIModalOpen ? 'active' : ''}" id="grammar-ai-config-modal">
        <div class="modal-container glass-panel" style="max-width: 480px; width: 92%;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid var(--line); padding-bottom: 8px;">
            <h3 style="margin: 0; color: var(--accent); font-family: var(--font-display); font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
              ⚙️ Cấu Hình AI API Sinh Đề Thi
            </h3>
            <button type="button" id="close-ai-modal-x" style="background: none; border: none; font-size: 22px; cursor: pointer; color: var(--ink-soft);">×</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
            <div>
              <label style="font-size: 12.5px; font-weight: 700; display: block; margin-bottom: 4px;">Nhà cung cấp AI:</label>
              <select id="ai-provider-select" class="form-control">
                <option value="gemini" ${aiConfig.provider === 'gemini' ? 'selected' : ''}>Google Gemini (Gemini 1.5 Flash - Miễn phí/Nhanh)</option>
                <option value="openai" ${aiConfig.provider === 'openai' ? 'selected' : ''}>OpenAI (GPT-4o mini)</option>
              </select>
            </div>

            <div>
              <label style="font-size: 12.5px; font-weight: 700; display: block; margin-bottom: 4px;">API Key:</label>
              <input type="password" id="ai-api-key-input" class="form-control" placeholder="Nhập API Key của bạn..." value="${aiConfig.apiKey || ''}">
              <small style="color: var(--ink-soft); font-size: 11px; display: block; margin-top: 3px;">
                🔒 Key được lưu an toàn trực tiếp trên trình duyệt của bạn (Local Storage) để gọi sinh câu hỏi.
              </small>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--line); padding-top: 10px;">
            <button type="button" class="btn btn-secondary btn-sm" id="close-ai-modal-btn">Đóng</button>
            <button type="button" class="btn btn-primary btn-sm" id="save-ai-modal-btn">Lưu cấu hình</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderReviewQuestionsArena(lesson, reviewData, mode, answers, evaluation) {
  if (!reviewData) return '<div class="empty-arena" style="padding: 16px; text-align: center; color: var(--ink-soft);">Chưa có câu hỏi. Bấm Sinh đề mới để bắt đầu.</div>';
  const questions = reviewData.questions || [];
  const isSubmitted = evaluation && evaluation.submitted;

  if (mode === "translate") {
    return questions.map((q, idx) => {
      const userAns = answers[q.id] || "";
      let isCorrect = false;
      if (userAns) {
        const checkObj = checkTranslationAnswer(userAns, q.targetJp, q.targetRomaji, q.acceptedVariations);
        isCorrect = checkObj.isCorrect;
      }

      return `
        <div class="review-question-card ${isSubmitted ? (isCorrect ? 'card-correct' : 'card-wrong') : ''}" id="rev-card-${q.id}">
          <div class="rev-q-head">
            <span class="rev-q-badge">Câu ${idx + 1} · Dịch câu</span>
            <span class="rev-q-pattern">${escapeHtml(q.pattern || 'A は B です')}</span>
            ${isSubmitted ? (isCorrect ? '<span class="status-badge badge-pass">✓ Chính xác</span>' : '<span class="status-badge badge-fail">✗ Chưa đúng</span>') : ''}
          </div>

          <div class="rev-prompt-text">
            <strong>Tiếng Việt:</strong> <span>${escapeHtml(q.prompt || q.vi || '')}</span>
          </div>

          <div class="rev-typing-input-group">
            <input type="text" 
              class="form-control review-kana-input" 
              id="rev-input-${q.id}" 
              data-qid="${q.id}" 
              value="${escapeHtml(userAns)}" 
              placeholder="Gõ tiếng Nhật (tự chuyển Kana tức thì)..." 
              autocomplete="off" 
              autocorrect="off"
              ${isSubmitted ? 'readonly' : ''}>
            <button type="button" class="btn btn-primary btn-sm check-typing-btn" data-qid="${q.id}" ${isSubmitted ? 'disabled' : ''}>
              Kiểm tra
            </button>
          </div>

          ${(isSubmitted || userAns) ? `
            <div class="rev-answer-reveal">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <div><strong>Đáp án chuẩn:</strong> <span class="revealed-jp">${escapeHtml(q.targetJp)}</span> <span class="revealed-romaji">(${escapeHtml(q.targetRomaji)})</span></div>
                <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${q.targetJp}" title="Nghe phát âm chuẩn">
                  🔊
                </button>
              </div>
              <div class="rev-explanation-text">💡 <strong>Giải thích ngữ pháp:</strong> ${escapeHtml(q.explanation || '')}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  if (mode === "cloze") {
    return questions.map((q, idx) => {
      const userChoice = answers[q.id];
      const isAnswered = typeof userChoice !== "undefined";
      const isCorrect = userChoice === q.correct;

      return `
        <div class="review-question-card ${isSubmitted ? (isCorrect ? 'card-correct' : 'card-wrong') : ''}" id="rev-card-${q.id}">
          <div class="rev-q-head">
            <span class="rev-q-badge">Câu ${idx + 1} · Điền từ JLPT</span>
            ${isSubmitted ? (isCorrect ? '<span class="status-badge badge-pass">✓ Đúng</span>' : '<span class="status-badge badge-fail">✗ Sai</span>') : ''}
          </div>

          <div class="rev-cloze-sentence">${escapeHtml(q.question || q.sentence || '')}</div>

          <div class="rev-options-grid">
            ${(q.options || []).map((opt, optIdx) => {
              let optClass = "rev-opt-btn";
              if (userChoice === optIdx) optClass += " opt-selected";
              if (isSubmitted) {
                if (optIdx === q.correct) optClass += " opt-correct";
                else if (userChoice === optIdx) optClass += " opt-wrong";
              }
              return `
                <button type="button" class="${optClass}" data-qid="${q.id}" data-opt-idx="${optIdx}" ${isSubmitted ? 'disabled' : ''}>
                  <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
                  <span class="opt-text">${escapeHtml(opt)}</span>
                </button>
              `;
            }).join('')}
          </div>

          ${isSubmitted ? `
            <div class="rev-answer-reveal">
              <div class="rev-explanation-text">💡 <strong>Giải thích:</strong> ${escapeHtml(q.explanation || '')}</div>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  // mode === "reading"
  const passage = reviewData.passage || {};
  return `
    <div class="dokkai-passage-card">
      <div class="dokkai-head" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span class="dokkai-tag">📖 Đoạn văn đọc hiểu & ngữ cảnh</span>
        ${passage.jp ? `
          <button type="button" class="btn btn-secondary btn-sm g-speak-btn" data-audio="${passage.jp}">
            🔊 Nghe đoạn văn
          </button>
        ` : ''}
      </div>
      <p class="dokkai-jp">${passage.jp || ''}</p>
      <p class="dokkai-romaji">${passage.romaji || ''}</p>
      <p class="dokkai-vi">${passage.vi || ''}</p>
    </div>

    <div class="dokkai-questions-list">
      ${questions.map((q, idx) => {
        const userChoice = answers[q.id];
        const isAnswered = typeof userChoice !== "undefined";
        const isCorrect = userChoice === q.correct;

        return `
          <div class="review-question-card ${isSubmitted ? (isCorrect ? 'card-correct' : 'card-wrong') : ''}" id="rev-card-${q.id}">
            <div class="rev-q-head">
              <span class="rev-q-badge">Câu hỏi ${idx + 1}</span>
              ${isSubmitted ? (isCorrect ? '<span class="status-badge badge-pass">✓ Đúng</span>' : '<span class="status-badge badge-fail">✗ Sai</span>') : ''}
            </div>

            <div class="rev-cloze-sentence">${escapeHtml(q.question || q.prompt || '')}</div>

            <div class="rev-options-grid">
              ${(q.options || []).map((opt, optIdx) => {
                let optClass = "rev-opt-btn";
                if (userChoice === optIdx) optClass += " opt-selected";
                if (isSubmitted) {
                  if (optIdx === q.correct) optClass += " opt-correct";
                  else if (userChoice === optIdx) optClass += " opt-wrong";
                }
                return `
                  <button type="button" class="${optClass}" data-qid="${q.id}" data-opt-idx="${optIdx}" ${isSubmitted ? 'disabled' : ''}>
                    <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
                    <span class="opt-text">${escapeHtml(opt)}</span>
                  </button>
                `;
              }).join('')}
            </div>

            ${isSubmitted ? `
              <div class="rev-answer-reveal">
                <div class="rev-explanation-text">💡 <strong>Giải thích:</strong> ${escapeHtml(q.explanation || '')}</div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function attachWorkspaceEventListeners(lesson) {
  // Phát âm âm thanh
  document.querySelectorAll(".g-speak-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const text = btn.getAttribute("data-audio");
      if (text) speakJapanese(text, true);
    });
  });

  // Hoàn thành lý thuyết -> Mở khóa bài tập
  const markTheoryDoneBtn = document.getElementById("g-mark-theory-done-btn");
  if (markTheoryDoneBtn) {
    markTheoryDoneBtn.addEventListener("click", () => {
      updateLessonProgress(lesson.id, { theoryDone: true });
      currentSubStep = "exercises";
      const all = loadAllGrammarProgress();
      all.activeSubStep = "exercises";
      saveAllGrammarProgress(all);
      renderGrammarView();
    });
  }

  // Tương tác bài tập
  document.querySelectorAll(".ex-opt-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      const exId = btn.getAttribute("data-ex-id");
      const optIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
      const ex = (lesson.exercises || []).find(e => e.id === exId);
      if (!ex) return;

      const progress = getLessonProgress(lesson.id);
      const scores = { ...(progress.exerciseScores || {}) };
      scores[exId] = optIdx;

      const allExercisesDone = Object.keys(scores).length >= (lesson.exercises || []).length;
      updateLessonProgress(lesson.id, { exerciseScores: scores, exercisesDone: allExercisesDone });

      renderCenterWorkspace(lesson);
      renderLeftCourseMenu(lesson);
      renderRightToolsPanel(lesson);
    });
  });

  // Reset bài tập
  const resetExBtn = document.getElementById("g-reset-exercises-btn");
  if (resetExBtn) {
    resetExBtn.addEventListener("click", () => {
      if (confirm("Bạn có muốn làm lại toàn bộ bài tập của bài này không?")) {
        updateLessonProgress(lesson.id, { exerciseScores: {}, exercisesDone: false });
        renderCenterWorkspace(lesson);
        renderLeftCourseMenu(lesson);
        renderRightToolsPanel(lesson);
      }
    });
  }

  // Chuyển sang bài kiểm tra
  const goToTestBtn = document.getElementById("g-go-to-test-btn");
  if (goToTestBtn) {
    goToTestBtn.addEventListener("click", () => {
      currentSubStep = "test";
      const all = loadAllGrammarProgress();
      all.activeSubStep = "test";
      saveAllGrammarProgress(all);
      renderGrammarView();
    });
  }

  // Nộp bài kiểm tra
  const testForm = document.getElementById("grammar-test-form");
  if (testForm) {
    testForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const questions = lesson.testQuestions || [];
      let correctCount = 0;

      questions.forEach(q => {
        const selected = testForm.querySelector(`input[name="tq-${q.id}"]:checked`);
        if (selected && parseInt(selected.value, 10) === q.correct) {
          correctCount++;
        }
      });

      const total = questions.length;
      const passed = (correctCount / total) >= 0.8;

      updateLessonProgress(lesson.id, {
        testScore: correctCount,
        testTotal: total,
        testPassed: passed
      });

      if (passed) {
        try { triggerConfetti(); } catch (err) {}
        alert(`🎉 XUẤT SẮC! Bạn đạt ${correctCount}/${total} điểm (${Math.round(correctCount / total * 100)}%).\nBạn đã xuất sắc hoàn thành Bài 1! Hãy tiến vào Bước 4: Ôn tập & Sinh đề luyện tập.`);
      } else {
        alert(`Bạn đạt ${correctCount}/${total} điểm (${Math.round(correctCount / total * 100)}%).\nCần đạt từ 80% (7/8 câu) trở lên để qua bài. Hãy thử lại nhé!`);
      }

      renderGrammarView();
    });
  }

  // Chuyển sang Bước 4: Ôn tập & Sinh đề
  const goToReviewBtn = document.getElementById("g-go-to-review-btn");
  if (goToReviewBtn) {
    goToReviewBtn.addEventListener("click", () => {
      currentSubStep = "review";
      const all = loadAllGrammarProgress();
      all.activeSubStep = "review";
      saveAllGrammarProgress(all);
      renderGrammarView();
    });
  }

  // Gắn bộ gõ Kana thông minh cho tất cả ô nhập tiếng Nhật trong phần ôn tập & tạo ví dụ
  document.querySelectorAll(".review-kana-input").forEach(inputEl => {
    bindKanaInput(inputEl, { mode: "kana" });

    inputEl.addEventListener("input", () => {
      const qid = inputEl.getAttribute("data-qid");
      if (qid) {
        currentReviewAnswers[qid] = inputEl.value;
      }
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const qid = inputEl.getAttribute("data-qid");
        const checkBtn = document.querySelector(`.check-typing-btn[data-qid="${qid}"]`);
        if (checkBtn) checkBtn.click();
      }
    });
  });

  // Toggle mở/đóng form thêm ví dụ mới của người học
  const toggleCustExBtn = document.getElementById("toggle-add-cust-ex-btn");
  if (toggleCustExBtn) {
    toggleCustExBtn.addEventListener("click", () => {
      isCustomExampleFormOpen = !isCustomExampleFormOpen;
      renderCenterWorkspace(lesson);
    });
  }

  const cancelCustExBtn = document.getElementById("cancel-cust-ex-btn");
  if (cancelCustExBtn) {
    cancelCustExBtn.addEventListener("click", () => {
      isCustomExampleFormOpen = false;
      renderCenterWorkspace(lesson);
    });
  }

  // Lưu mẫu ví dụ tự tạo mới
  const saveCustExBtn = document.getElementById("save-cust-ex-btn");
  if (saveCustExBtn) {
    saveCustExBtn.addEventListener("click", () => {
      const patSelect = document.getElementById("new-ex-pattern");
      const jpInput = document.getElementById("new-ex-jp");
      const romajiInput = document.getElementById("new-ex-romaji");
      const viInput = document.getElementById("new-ex-vi");
      if (!jpInput || !viInput) return;

      const jp = jpInput.value.trim();
      const vi = viInput.value.trim();
      const romaji = romajiInput ? romajiInput.value.trim() : "";
      const patternId = patSelect ? patSelect.value : "pattern-1";
      const patternName = patSelect ? patSelect.options[patSelect.selectedIndex].text : "A は B です";

      if (!jp || !vi) {
        alert("Vui lòng nhập đầy đủ câu tiếng Nhật và ý nghĩa tiếng Việt.");
        return;
      }

      addCustomExample(lesson.id, {
        patternId,
        patternName,
        jp,
        romaji: romaji || romajiToHiragana(jp),
        vi,
        audio: jp
      });

      isCustomExampleFormOpen = false;
      renderCenterWorkspace(lesson);
    });
  }

  // Xóa ví dụ tự tạo
  document.querySelectorAll(".btn-delete-cust-ex").forEach(btn => {
    btn.addEventListener("click", () => {
      const exId = btn.getAttribute("data-ex-id");
      if (exId && confirm("Bạn có chắc muốn xóa ví dụ tự tạo này không?")) {
        deleteCustomExample(lesson.id, exId);
        renderCenterWorkspace(lesson);
      }
    });
  });

  // Chuyển chế độ sinh đề (chỉ chọn 1 dạng duy nhất)
  document.querySelectorAll(".rev-mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      if (mode && mode !== currentReviewMode) {
        currentReviewMode = mode;
        currentReviewQuestions = generateLessonReviewQuestions(lesson, currentReviewMode);
        currentReviewAnswers = {};
        currentReviewEvaluation = null;
        renderCenterWorkspace(lesson);
      }
    });
  });

  // Sinh đề mới nội bộ (Offline)
  const regenBtn = document.getElementById("rev-regen-btn");
  if (regenBtn) {
    regenBtn.addEventListener("click", () => {
      currentReviewQuestions = generateLessonReviewQuestions(lesson, currentReviewMode);
      currentReviewAnswers = {};
      currentReviewEvaluation = null;
      renderCenterWorkspace(lesson);
    });
  }

  // Mở/đóng cấu hình AI API
  const aiConfigBtn = document.getElementById("rev-ai-config-btn");
  if (aiConfigBtn) {
    aiConfigBtn.addEventListener("click", () => {
      isAIModalOpen = true;
      renderCenterWorkspace(lesson);
    });
  }

  const closeAiModalBtn = document.getElementById("close-ai-modal-btn");
  const closeAiModalX = document.getElementById("close-ai-modal-x");
  [closeAiModalBtn, closeAiModalX].forEach(b => {
    if (b) {
      b.addEventListener("click", () => {
        isAIModalOpen = false;
        renderCenterWorkspace(lesson);
      });
    }
  });

  const saveAiModalBtn = document.getElementById("save-ai-modal-btn");
  if (saveAiModalBtn) {
    saveAiModalBtn.addEventListener("click", () => {
      const providerSelect = document.getElementById("ai-provider-select");
      const apiKeyInput = document.getElementById("ai-api-key-input");
      if (providerSelect && apiKeyInput) {
        saveAIConfig({
          provider: providerSelect.value,
          apiKey: apiKeyInput.value.trim(),
          model: providerSelect.value === "openai" ? "gpt-4o-mini" : "gemini-1.5-flash"
        });
        alert("✓ Đã lưu cấu hình AI API thành công!");
        isAIModalOpen = false;
        renderCenterWorkspace(lesson);
      }
    });
  }

  // Sinh đề bằng AI API
  const aiGenBtn = document.getElementById("rev-ai-btn");
  if (aiGenBtn) {
    aiGenBtn.addEventListener("click", async () => {
      const cfg = getAIConfig();
      if (!cfg.apiKey) {
        alert("Bạn chưa cấu hình API Key. Vui lòng nhập API Key để kết nối AI.");
        isAIModalOpen = true;
        renderCenterWorkspace(lesson);
        return;
      }

      aiGenBtn.disabled = true;
      aiGenBtn.textContent = "🤖 Đang gọi AI...";

      try {
        const { userVocab } = extractLessonAndProjectVocab(lesson);
        const aiRes = await callAIReviewAPI({ lesson, mode: currentReviewMode, userVocab, config: cfg });
        if (aiRes && aiRes.questions && aiRes.questions.length > 0) {
          currentReviewQuestions = aiRes;
          currentReviewAnswers = {};
          currentReviewEvaluation = null;
          alert(`✨ Đã sinh thành công ${aiRes.questions.length} câu hỏi ôn tập bằng AI!`);
          renderCenterWorkspace(lesson);
        } else {
          throw new Error("Dữ liệu trả về từ AI không đúng cấu trúc.");
        }
      } catch (err) {
        console.warn("AI generation error, fallback to local:", err);
        alert(`⚠️ Không thể kết nối AI (${err.message}).\nHệ thống đã tự động chuyển sang Bộ sinh đề thông minh Offline để không làm gián đoạn bài học của bạn!`);
        currentReviewQuestions = generateLessonReviewQuestions(lesson, currentReviewMode);
        currentReviewAnswers = {};
        currentReviewEvaluation = null;
        renderCenterWorkspace(lesson);
      }
    });
  }

  // Chọn đáp án trắc nghiệm trong câu hỏi ôn tập
  document.querySelectorAll(".rev-opt-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      const qid = btn.getAttribute("data-qid");
      const optIdx = parseInt(btn.getAttribute("data-opt-idx"), 10);
      if (qid && !isNaN(optIdx)) {
        currentReviewAnswers[qid] = optIdx;
        renderCenterWorkspace(lesson);
      }
    });
  });

  // Nút kiểm tra câu dịch riêng lẻ
  document.querySelectorAll(".check-typing-btn:not([disabled])").forEach(btn => {
    btn.addEventListener("click", () => {
      const qid = btn.getAttribute("data-qid");
      const inputEl = document.getElementById(`rev-input-${qid}`);
      if (qid && inputEl) {
        currentReviewAnswers[qid] = inputEl.value;
        renderCenterWorkspace(lesson);
      }
    });
  });

  // Nộp bài & Chấm điểm toàn diện cho đề ôn tập
  const revSubmitBtn = document.getElementById("rev-submit-all-btn");
  if (revSubmitBtn) {
    revSubmitBtn.addEventListener("click", () => {
      if (!currentReviewQuestions) return;
      const questions = currentReviewQuestions.questions || [];
      let correctCount = 0;

      questions.forEach(q => {
        if (q.type === "translate") {
          const inputEl = document.getElementById(`rev-input-${q.id}`);
          const userVal = inputEl ? inputEl.value : (currentReviewAnswers[q.id] || "");
          currentReviewAnswers[q.id] = userVal;
          const checkObj = checkTranslationAnswer(userVal, q.targetJp, q.targetRomaji, q.acceptedVariations);
          if (checkObj.isCorrect) correctCount++;
        } else {
          const userChoice = currentReviewAnswers[q.id];
          if (userChoice === q.correct) correctCount++;
        }
      });

      const total = questions.length;
      const passed = total > 0 && (correctCount / total) >= 0.8;

      if (passed) {
        updateLessonProgress(lesson.id, {
          reviewDone: true,
          reviewQuizResult: { score: correctCount, total, date: new Date().toISOString() }
        });
        try { triggerConfetti(); } catch (e) {}
      }

      currentReviewEvaluation = {
        submitted: true,
        score: correctCount,
        total,
        passed
      };

      renderCenterWorkspace(lesson);
      renderLeftCourseMenu(lesson);
      renderRightToolsPanel(lesson);
    });
  }

  // Làm lại bài ôn tập
  const revRetryBtn = document.getElementById("rev-retry-btn");
  if (revRetryBtn) {
    revRetryBtn.addEventListener("click", () => {
      currentReviewAnswers = {};
      currentReviewEvaluation = null;
      renderCenterWorkspace(lesson);
    });
  }

  // Chuyển sang dạng tiếp theo
  const revNextModeBtn = document.getElementById("rev-next-mode-btn");
  if (revNextModeBtn) {
    revNextModeBtn.addEventListener("click", () => {
      const modes = ["translate", "cloze", "reading"];
      const nextIdx = (modes.indexOf(currentReviewMode) + 1) % modes.length;
      currentReviewMode = modes[nextIdx];
      currentReviewQuestions = generateLessonReviewQuestions(lesson, currentReviewMode);
      currentReviewAnswers = {};
      currentReviewEvaluation = null;
      renderCenterWorkspace(lesson);
    });
  }
}

/* ==========================================================================
   CỘT PHẢI (SÁT LỀ): SỔ TAY, MẸO NHỚ, KẾT QUẢ & CÓ THỂ THU GỌN
   ========================================================================== */
function renderRightToolsPanel(lesson) {
  const sidebar = document.getElementById("grammar-sidebar-right");
  if (!sidebar) return;

  const grid = document.querySelector(".grammar-workspace-grid");
  if (grid) {
    grid.classList.toggle("right-panel-collapsed", isRightPanelCollapsed);
  }

  const progress = getLessonProgress(lesson.id);
  const percent = calculateLessonPercent(lesson.id);
  const notesList = progress.notesList || [];

  if (isRightPanelCollapsed) {
    sidebar.classList.add("is-collapsed");
    sidebar.innerHTML = `
      <button type="button" class="btn-expand-panel" id="g-expand-right-btn" title="Mở rộng bảng tiện ích & ghi chú">
        <span>◀</span>
        <span class="expand-vertical-text">Ghi chú · Kết quả</span>
      </button>
    `;
    const expandBtn = document.getElementById("g-expand-right-btn");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        isRightPanelCollapsed = false;
        localStorage.setItem(STORAGE_KEY_RIGHT_COLLAPSED, "false");
        sidebar.classList.remove("is-collapsed");
        renderRightToolsPanel(lesson);
      });
    }
    return;
  }

  sidebar.classList.remove("is-collapsed");

  sidebar.innerHTML = `
    <!-- WIDGET LỘ TRÌNH BÀI HỌC VỚI ĐƯỜNG THẲNG ĐỨNG & CÁC DẤU CHẤM ĐỒNG BỘ CUỘN -->
    <div class="grammar-roadmap-widget" id="grammar-roadmap-widget">
      <div class="roadmap-widget-header">
        <div class="roadmap-widget-title">
          <span class="roadmap-icon">🧭</span>
          <span>Lộ trình bài học</span>
        </div>
        <span class="roadmap-badge-progress" id="roadmap-badge-progress">Phần 1/5</span>
      </div>

      <div class="roadmap-timeline">
        <div class="roadmap-line-track">
          <div class="roadmap-line-progress" id="roadmap-line-progress"></div>
        </div>

        <div class="roadmap-steps-list" id="roadmap-steps-list">
          ${generateRoadmapStepsHtml(lesson)}
        </div>
      </div>
    </div>

    <div class="right-panel-header">
      <div class="right-tab-pills">
        <button type="button" class="r-tab-btn ${activeRightTab === 'notes' ? 'active-highlight' : ''}" data-rtab="notes">
          📝 Ghi chú
        </button>
        <button type="button" class="r-tab-btn ${activeRightTab === 'takeaways' ? 'active-highlight' : ''}" data-rtab="takeaways">
          💡 Mẹo nhớ
        </button>
        <button type="button" class="r-tab-btn ${activeRightTab === 'results' ? 'active-highlight' : ''}" data-rtab="results">
          📊 Kết quả
        </button>
      </div>
      <button type="button" class="btn-collapse-panel" id="g-collapse-right-btn" title="Thu gọn bảng tiện ích vào lề phải">
        ▶
      </button>
    </div>

    <div class="right-panel-body">
      <!-- 1. Ghi chú cá nhân (ô nhỏ gọn + thêm vào danh sách bên dưới) -->
      <div class="r-tab-panel ${activeRightTab === 'notes' ? 'active-panel' : ''}" id="r-panel-notes">
        <div class="add-note-box">
          <textarea id="g-note-input" class="form-control g-compact-note-input" placeholder="Viết ghi chú ngắn cho bài này..."></textarea>
          <button type="button" class="btn btn-primary btn-sm" id="g-add-note-btn">+ Thêm ghi chú</button>
        </div>

        <div class="user-notes-list-header">
          <span>Ghi chú của bạn (${notesList.length})</span>
        </div>

        <div class="user-notes-stream" id="user-notes-stream">
          ${notesList.length === 0 ? `
            <div class="empty-notes-hint">
              <small>Chưa có ghi chú nào. Hãy ghi lại những từ mới hoặc lưu ý của bạn!</small>
            </div>
          ` : notesList.map((item, idx) => `
            <div class="user-note-card">
              <div class="user-note-content">${escapeHtml(item.text)}</div>
              <div class="user-note-footer">
                <small class="note-time">${item.createdAt || 'Gần đây'}</small>
                <button type="button" class="delete-note-btn" data-note-idx="${idx}" title="Xóa ghi chú này">×</button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="bookmark-study-box">
          <label class="custom-checkbox-label">
            <input type="checkbox" id="g-bookmark-check" ${progress.bookmarked ? 'checked' : ''}>
            <span>⭐ Đánh dấu bài này để ôn lại</span>
          </label>
        </div>
      </div>

      <!-- 2. Điểm cần nhớ / Mẹo vàng -->
      <div class="r-tab-panel ${activeRightTab === 'takeaways' ? 'active-panel' : ''}" id="r-panel-takeaways">
        <h4 class="takeaways-title">⚡ Điểm mấu chốt của bài:</h4>
        <ul class="takeaways-list">
          ${(lesson.keyTakeaways || []).map(tip => `
            <li><span>🔹</span> <div>${tip}</div></li>
          `).join('')}
        </ul>
      </div>

      <!-- 3. Kết quả học tập thực tế của bài học này -->
      <div class="r-tab-panel ${activeRightTab === 'results' ? 'active-panel' : ''}" id="r-panel-results">
        <div class="results-overview-card">
          <div class="res-progress-top">
            <span>Tiến độ bài học:</span>
            <strong>${percent}%</strong>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${percent}%;"></div>
          </div>
        </div>

        <div class="results-breakdown-card">
          <h4 class="res-sub-heading">📊 Trạng thái chi tiết từng phần:</h4>
          
          <div class="res-item-row ${progress.theoryDone ? 'done' : 'doing'}">
            <div class="res-icon">${progress.theoryDone ? '✓' : '📖'}</div>
            <div class="res-info">
              <strong>1. Lý thuyết bài giảng</strong>
              <small>${progress.theoryDone ? 'Đã xem xong toàn bộ' : 'Chưa hoàn thành'}</small>
            </div>
          </div>

          <div class="res-item-row ${progress.exercisesDone ? 'done' : 'doing'}">
            <div class="res-icon">${progress.exercisesDone ? '✓' : '✍️'}</div>
            <div class="res-info">
              <strong>2. Luyện tập thực hành</strong>
              <small>${progress.exercisesDone ? `Đã làm xong (${Object.keys(progress.exerciseScores || {}).length}/5 câu)` : 'Chưa hoàn thành đủ 5 câu'}</small>
            </div>
          </div>

          <div class="res-item-row ${progress.testPassed ? 'done' : (progress.testScore > 0 ? 'failed' : 'doing')}">
            <div class="res-icon">${progress.testPassed ? '🏆' : (progress.testScore > 0 ? '⚠️' : '🎯')}</div>
            <div class="res-info">
              <strong>3. Bài kiểm tra đánh giá</strong>
              <small>${progress.testPassed ? `Đạt ${progress.testScore}/${progress.testTotal} điểm (Xuất sắc ⭐⭐⭐)` : (progress.testScore > 0 ? `Đạt ${progress.testScore}/${progress.testTotal} (Chưa đạt ≥80%)` : 'Chưa nộp bài')}</small>
            </div>
          </div>

          <div class="res-item-row ${progress.reviewDone ? 'done' : 'doing'}">
            <div class="res-icon">${progress.reviewDone ? '🌟' : '🔥'}</div>
            <div class="res-info">
              <strong>4. Ôn tập & Sinh đề luyện tập</strong>
              <small>${progress.reviewDone ? 'Đã hoàn thành ôn tập & luyện đề' : 'Chưa hoàn thành'}</small>
            </div>
          </div>
        </div>

        <div class="res-unlock-status-card">
          <strong>Trạng thái mở khóa:</strong>
          <p>${progress.testPassed ? '🎉 Đã mở khóa Bài 2: Đồ vật xung quanh (これ・それ・あれ)!' : 'Vượt qua bài kiểm tra để mở khóa bài tiếp theo.'}</p>
        </div>
      </div>
    </div>
  `;

  // Bắt sự kiện chuyển Tab bên phải
  sidebar.querySelectorAll(".r-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      activeRightTab = btn.getAttribute("data-rtab");
      renderRightToolsPanel(lesson);
    });
  });

  // Thu gọn panel phải
  const collapseBtn = document.getElementById("g-collapse-right-btn");
  if (collapseBtn) {
    collapseBtn.addEventListener("click", () => {
      isRightPanelCollapsed = true;
      localStorage.setItem(STORAGE_KEY_RIGHT_COLLAPSED, "true");
      renderRightToolsPanel(lesson);
    });
  }

  // Thêm ghi chú mới
  const addNoteBtn = document.getElementById("g-add-note-btn");
  const noteInput = document.getElementById("g-note-input");
  if (addNoteBtn && noteInput) {
    addNoteBtn.addEventListener("click", () => {
      const text = noteInput.value.trim();
      if (!text) return;
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}`;
      const updatedList = [
        { text, createdAt: timeStr, lessonId: lesson.id },
        ...(progress.notesList || [])
      ];
      updateLessonProgress(lesson.id, { notesList: updatedList });
      noteInput.value = "";
      renderRightToolsPanel(lesson);
    });
  }

  // Xóa ghi chú
  sidebar.querySelectorAll(".delete-note-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-note-idx"), 10);
      const currentList = [...(progress.notesList || [])];
      currentList.splice(idx, 1);
      updateLessonProgress(lesson.id, { notesList: currentList });
      renderRightToolsPanel(lesson);
    });
  });

  // Đánh dấu bookmark
  const bookmarkCheck = document.getElementById("g-bookmark-check");
  if (bookmarkCheck) {
    bookmarkCheck.addEventListener("change", (e) => {
      updateLessonProgress(lesson.id, { bookmarked: e.target.checked });
    });
  }

  // Lộ trình bài học: Bấm vào mốc nhảy mượt mà tới phần đó
  sidebar.querySelectorAll(".roadmap-step-item").forEach(item => {
    item.addEventListener("click", () => {
      const targetId = item.getAttribute("data-target");
      if (currentSubStep !== "theory") {
        currentSubStep = "theory";
        renderCenterWorkspace(lesson);
        renderLeftCourseMenu(lesson);
      }
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const yOffset = -90;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 60);
    });
  });

  initGrammarRoadmapScrollspy();
}

export function generateRoadmapStepsHtml(lesson) {
  const defaultPhases = [
    { id: "sec-khang-dinh", exId: "sec-khang-dinh-examples", title: "Khẳng định", sub: "A は B です" },
    { id: "sec-phu-dinh", exId: "sec-phu-dinh-examples", title: "Phủ định", sub: "じゃありません" },
    { id: "sec-nghi-van", exId: "sec-nghi-van-examples", title: "Nghi vấn", sub: "A は B ですか" },
    { id: "sec-tro-tu-mo", exId: "sec-tro-tu-mo-examples", title: "Trợ từ も (Cũng)", sub: "A も B です" }
  ];

  const patterns = lesson.patterns || [];
  let html = "";

  patterns.forEach((p, idx) => {
    const meta = defaultPhases[idx] || {
      id: `sec-pattern-${idx + 1}`,
      exId: `sec-pattern-${idx + 1}-examples`,
      title: p.name,
      sub: p.targetHighlight || ""
    };

    html += `
      <div class="roadmap-step-item ${idx === 0 ? 'active' : ''}" data-target="${meta.id}">
        <div class="roadmap-dot dot-main"><span class="dot-inner">${idx + 1}</span></div>
        <div class="roadmap-text-box">
          <span class="roadmap-step-title">${meta.title}</span>
          <span class="roadmap-step-sub">${meta.sub}</span>
        </div>
      </div>
      <div class="roadmap-step-item step-sub" data-target="${meta.exId}">
        <div class="roadmap-dot dot-sub"></div>
        <div class="roadmap-text-box">
          <span class="roadmap-step-title">Ví dụ minh họa</span>
        </div>
      </div>
    `;
  });

  if (lesson.readingArticle) {
    html += `
      <div class="roadmap-step-item" data-target="sec-ung-dung">
        <div class="roadmap-dot dot-main dot-finish"><span class="dot-inner">★</span></div>
        <div class="roadmap-text-box">
          <span class="roadmap-step-title">Ứng dụng thực tế</span>
          <span class="roadmap-step-sub">Hội thoại & Đoạn văn</span>
        </div>
      </div>
    `;
  }

  return html;
}

let grammarScrollspyHandler = null;

export function initGrammarRoadmapScrollspy() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (grammarScrollspyHandler) {
    window.removeEventListener("scroll", grammarScrollspyHandler);
    document.removeEventListener("scroll", grammarScrollspyHandler);
    grammarScrollspyHandler = null;
  }

  const steps = document.querySelectorAll(".roadmap-step-item");
  if (!steps.length) return;

  function updateRoadmapActiveStep() {
    if (currentSubStep !== "theory") return;
    const offset = 170;
    let activeIdx = 0;

    steps.forEach((step, idx) => {
      const targetId = step.dataset.target;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const rect = targetEl.getBoundingClientRect();
        if (rect.top <= offset) {
          activeIdx = idx;
        }
      }
    });

    steps.forEach((step, idx) => {
      if (idx === activeIdx) {
        step.classList.add("active");
        step.classList.remove("passed");
      } else if (idx < activeIdx) {
        step.classList.remove("active");
        step.classList.add("passed");
      } else {
        step.classList.remove("active", "passed");
      }
    });

    // Cập nhật độ dài đường thẳng tiến độ
    const trackEl = document.querySelector(".roadmap-line-track");
    const progressLine = document.getElementById("roadmap-line-progress");
    const activeStep = steps[activeIdx];
    if (trackEl && progressLine && activeStep) {
      const dot = activeStep.querySelector(".roadmap-dot");
      if (dot) {
        const trackRect = trackEl.getBoundingClientRect();
        const dotRect = dot.getBoundingClientRect();
        const fillHeight = Math.max(0, dotRect.top + dotRect.height / 2 - trackRect.top);
        progressLine.style.height = `${fillHeight}px`;
      }
    }

    // Cập nhật pill tiến độ
    const progressPill = document.getElementById("roadmap-badge-progress");
    if (progressPill) {
      const phaseMap = ["1/5", "1/5", "2/5", "2/5", "3/5", "3/5", "4/5", "4/5", "5/5"];
      progressPill.textContent = `Phần ${phaseMap[activeIdx] || '1/5'}`;
    }
  }

  let ticking = false;
  grammarScrollspyHandler = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateRoadmapActiveStep();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", grammarScrollspyHandler, { passive: true });
  document.addEventListener("scroll", grammarScrollspyHandler, { passive: true });

  setTimeout(updateRoadmapActiveStep, 80);
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}
