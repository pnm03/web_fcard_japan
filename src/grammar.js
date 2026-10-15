// src/grammar.js
// Quản lý hệ thống học Ngữ pháp Tiếng Nhật LMS chuyên sâu, bố cục 3 cột sát lề, highlight từ khóa, lộ trình phân cấp, ghi chú dạng danh sách và tab kết quả

import { speakJapanese, triggerConfetti } from './ui.js';

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
        title: "Bài 1: Giới thiệu bản thân (自己紹介)",
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
              { jp: "タインさん <span class=\"gp-mark gp-ha\">は</span> ベトナム人 <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Thanh-san wa Betonamu-jin desu.", vi: "Anh Thanh là người Việt Nam.", audio: "タインさんはベトナムじんです" },
              { jp: "ミラーさん <span class=\"gp-mark gp-ha\">は</span> 会社員 <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Miraa-san wa kaishain desu.", vi: "Anh Miller là nhân viên công ty.", audio: "ミラーさんはかいしゃいんです" },
              { jp: "ワンさん <span class=\"gp-mark gp-ha\">は</span> 医者 <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Wan-san wa isha desu.", vi: "Anh Wang là bác sĩ.", audio: "ワンさんはいしゃです" }
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
              { jp: "わたし <span class=\"gp-mark gp-ha\">は</span> 学生 <span class=\"gp-mark gp-ja\">じゃありません</span>。", romaji: "Watashi wa gakusei ja arimasen.", vi: "Tôi không phải là học sinh.", audio: "わたしはがくせいじゃありません" },
              { jp: "サントスさん <span class=\"gp-mark gp-ha\">は</span> 医者 <span class=\"gp-mark gp-ja\">じゃありません</span>。", romaji: "Santosu-san wa isha ja arimasen.", vi: "Anh Santos không phải là bác sĩ.", audio: "サントスさんはいしゃじゃありません" },
              { jp: "あの方 <span class=\"gp-mark gp-ha\">は</span> 先生 <span class=\"gp-mark gp-ja\">ではありません</span>。", romaji: "Ano kata wa sensei dewa arimasen.", vi: "Vị kia không phải là giáo viên. (Trang trọng)", audio: "あのかたはせんせいではありません" }
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
              "<strong>3. Nghệ thuật trả lời câu hỏi:</strong><br>• <strong>Khi đồng ý:</strong> Nói <em>はい、[B] です。</em> (Vâng, đúng là B). Có thể lược bỏ chủ ngữ A để câu gọn gàng.<br>• <strong>Khi từ chối:</strong> Nói <em>いいえ、[B] じゃありません。</em> (Không, không phải là B). Sau đó nói thêm thông tin đúng (ví dụ: <em>いいえ、学生じゃありません。会社員です。</em>)."
            ],
            notes: "🗣️ <u>Cặp thoại mẫu:</u><br>Q: タインさん は エンジニア ですか。<br>A: はい、エンジニア です。(Đồng ý) / いいえ、エンジニア じゃありません。(Từ chối)",
            examples: [
              { jp: "タインさん <span class=\"gp-mark gp-ha\">は</span> エンジニア <span class=\"gp-mark gp-ka\">ですか</span>。", romaji: "Thanh-san wa enjinia desu ka.", vi: "Anh Thanh có phải là kỹ sư không? ➔ [はい、エンジニア です。]", audio: "タインさんはエンジニアですか" },
              { jp: "ミラーさん <span class=\"gp-mark gp-ha\">は</span> アメリカ人 <span class=\"gp-mark gp-ka\">ですか</span>。", romaji: "Miraa-san wa Amerikajin desu ka.", vi: "Anh Miller có phải là người Mỹ không? ➔ [はい、アメリカ人 です。]", audio: "ミラーさんはアメリカじんですか" },
              { jp: "あの方 <span class=\"gp-mark gp-ha\">は</span> 社長 <span class=\"gp-mark gp-ka\">ですか</span>。", romaji: "Ano kata wa shachou desu ka.", vi: "Vị kia có phải là giám đốc không? ➔ [いいえ、社長 じゃありません。]", audio: "あのかたはしゃちょうですか" }
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
              "<strong>3. Cách dùng も trong câu hỏi và trả lời:</strong><br>• Hỏi: <em>ナムさん <span class=\"gp-mark gp-mo\">も</span> ベトナム人 ですか。</em> (Anh Nam cũng là người VN à?)<br>• Trả lời khẳng định: <em>はい、ナムさん <span class=\"gp-mark gp-mo\">も</span> ベトナム人 です。</em><br>• Trả lời phủ định: <em>いいえ、ナムさん <span class=\"gp-mark gp-ha\">は</span> ベトナム人 じゃありません。</em> ➔ <u>Chú ý:</u> Khi phủ định, trợ từ lại quay trở về dùng <span class=\"gp-mark gp-ha\">は</span>!"
            ],
            notes: "🔴 <u>Công thức cần khắc cốt ghi tâm:</u> Câu trước dùng <strong>は</strong>, câu sau có cùng tính chất thì thay thế bằng <span class=\"gp-mark gp-mo\">も</span>.",
            examples: [
              { jp: "タインさん <span class=\"gp-mark gp-ha\">は</span> ベトナム人 です。ナムさん <span class=\"gp-mark gp-mo\">も</span> ベトナム人 <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Thanh-san wa Betonamu-jin desu. Nam-san mo Betonamu-jin desu.", vi: "Anh Thanh là người Việt Nam. Anh Nam CŨNG là người Việt Nam.", audio: "タインさんはベトナムじんです。ナムさんもベトナムじんです" },
              { jp: "わたし <span class=\"gp-mark gp-ha\">は</span> 学生 です。あの方 <span class=\"gp-mark gp-mo\">も</span> 学生 <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Watashi wa gakusei desu. Ano kata mo gakusei desu.", vi: "Tôi là học sinh. Vị kia CŨNG là học sinh.", audio: "わたしはがくせいです。あのかたもがくせいです" },
              { jp: "ミラーさん <span class=\"gp-mark gp-ha\">は</span> 会社員 です。グプタさん <span class=\"gp-mark gp-mo\">も</span> 会社員 <span class=\"gp-mark gp-desu\">です</span>。", romaji: "Miraa-san wa kaishain desu. Guputa-san mo kaishain desu.", vi: "Anh Miller là nhân viên công ty. Anh Gupta CŨNG là nhân viên công ty.", audio: "ミラーさんはかいしゃいんです。グプタさんもかいしゃいんです" }
            ]
          }
        ],
        readingArticle: {
          title: "Đoạn văn & Hội thoại tự giới thiệu bản thân mẫu (自己紹介)",
          passageJp: "初めまして。わたし <span class=\"gp-mark gp-ha\">は</span> タイン <span class=\"gp-mark gp-desu\">です</span>。ベトナム から 来ました。25歳 <span class=\"gp-mark gp-desu\">です</span>。エンジニア <span class=\"gp-mark gp-desu\">です</span>。学生 <span class=\"gp-mark gp-ja\">じゃありません</span>。ナムさん <span class=\"gp-mark gp-mo\">も</span> ベトナム人 <span class=\"gp-mark gp-desu\">です</span>。どうぞ よろしく お願いします。",
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
              "Học sinh (学生)",
              "Kỹ sư (エンジニア)",
              "Bác sĩ (医者)",
              "Nhân viên công ty (会社員)"
            ],
            correct: 1,
            explanation: "Trong bài có câu: 'エンジニア です。学生 じゃありません。' (Tôi là kỹ sư. Tôi không phải học sinh)."
          },
          {
            id: "ex-2",
            type: "listening",
            typeLabel: "🎧 Nghe hiểu",
            audioText: "ミラーさんはアメリカ人じゃありません",
            question: "Bấm nút 🔊 Nghe câu phát âm và chọn ý nghĩa chính xác nhất:",
            options: [
              "Anh Miller là người Mỹ.",
              "Anh Miller không phải là người Mỹ.",
              "Anh Miller có phải người Mỹ không?",
              "Anh Miller cũng là người Mỹ."
            ],
            correct: 1,
            explanation: "Câu phát âm: 'ミラーさんはアメリカ人じゃありません' kết thúc bằng 'じゃありません' là câu phủ định: Anh Miller không phải người Mỹ."
          },
          {
            id: "ex-3",
            type: "fill",
            typeLabel: "✏️ Điền trợ từ",
            question: "タインさん は ベトナム人 です。ナムさん [ ... ] ベトナム人 です。",
            options: ["は", "も", "か", "の"],
            correct: 1,
            explanation: "Cả Thanh và Nam đều là người Việt Nam nên câu thứ hai dùng trợ từ 'も' (cũng) để thay thế hoàn toàn cho 'は'."
          },
          {
            id: "ex-4",
            type: "grammar",
            typeLabel: "🔍 Ngữ pháp phủ định",
            question: "Cách nói phủ định của câu: 'サントスさん は 医者 です' là gì?",
            options: [
              "サントスさん は 医者 ですか",
              "サントスさん も 医者 です",
              "サントスさん は 医者 じゃありません",
              "サントスさん は 医者 でした"
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
              "あなた は 学生 ですか",
              "学生 は あなた ですか",
              "あなた も 学生 ですか",
              "あなた は ですか 学生"
            ],
            correct: 0,
            explanation: "Cấu trúc câu hỏi nghi vấn: Chủ ngữ (あなた) + は + Danh từ (学生) + ですか."
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
            q: "Câu 'あの方 は 先生 じゃありません' có nghĩa là gì?",
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
            q: "Điền trợ từ: 'A: わたしは会社員です。 B: わたし [ ? ] 会社員です。'",
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
            audioText: "ワンさんは医者ですか",
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
              "わたし はも ベトナム人 です。",
              "わたし も ベトナム人 です。",
              "わたし か ベトナム人 です。",
              "わたし は ベトナム人 も です。"
            ],
            correct: 1,
            explanation: "Trợ từ 'も' đứng ngay sau danh từ và thay thế cho 'は', tuyệt đối không được viết ghép 'はも'."
          },
          {
            id: "tq-8",
            q: "Để giới thiệu 'Tôi là học sinh', câu nào sau đây là chính xác?",
            options: [
              "わたし は 学生 です。",
              "わたし が 学生 ですか。",
              "わたし も 学生 じゃありません。",
              "わたし は 学生 ですか。"
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
    activeSubStep: "theory", // theory | exercises | test
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
        bookmarked: false
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
      bookmarked: false
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
      bookmarked: false
    };
  }
  all.lessons[lessonId] = { ...all.lessons[lessonId], ...partial };
  saveAllGrammarProgress(all);
  return all.lessons[lessonId];
}

// Tính % hoàn thành của 1 bài học
export function calculateLessonPercent(lessonId) {
  const p = getLessonProgress(lessonId);
  let score = 0;
  if (p.theoryDone) score += 30;
  if (p.exercisesDone) score += 30;
  if (p.testPassed) score += 40;
  return score;
}

// Biến trạng thái runtime
let currentChapterIndex = 0;
let currentLessonId = "n5-lesson-1";
let currentSubStep = "theory"; // theory | exercises | test
let activeRightTab = "notes"; // notes | takeaways | results
let isRightPanelCollapsed = typeof localStorage !== "undefined" ? (localStorage.getItem(STORAGE_KEY_RIGHT_COLLAPSED) === "true") : false;

// Khởi tạo các sự kiện giao diện
export function setupGrammarUI() {
  const state = loadAllGrammarProgress();
  if (state.activeLessonId) currentLessonId = state.activeLessonId;
  if (state.activeSubStep) currentSubStep = state.activeSubStep;

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

  // Render nội dung tương ứng theo bước lộ trình con đang chọn
  main.innerHTML = `
    <div class="workspace-header-bar">
      <div class="workspace-current-step-badge">
        <span class="step-num-pill">Bước ${currentSubStep === 'theory' ? '1/3' : (currentSubStep === 'exercises' ? '2/3' : '3/3')}</span>
        <h2 class="workspace-step-title">
          ${currentSubStep === 'theory' ? '📖 1. Lý Thuyết & Mẫu Câu Bài Giảng' : (currentSubStep === 'exercises' ? '✍️ 2. Luyện Tập Thực Hành Đa Dạng' : '🎯 3. Bài Kiểm Tra Đánh Giá Năng Lực')}
        </h2>
      </div>
      <div class="workspace-step-status">
        ${currentSubStep === 'theory' && progress.theoryDone ? '<span class="status-chip chip-done">✓ Đã học xong lý thuyết</span>' : ''}
        ${currentSubStep === 'exercises' && progress.exercisesDone ? '<span class="status-chip chip-done">✓ Đã làm xong bài tập</span>' : ''}
        ${currentSubStep === 'test' && progress.testPassed ? '<span class="status-chip chip-done">🏆 Đã đạt chuẩn chốt bài</span>' : ''}
      </div>
    </div>

    <div class="grammar-tab-content-container">
      ${currentSubStep === 'theory' ? renderTheoryTabHtml(lesson, progress) : ''}
      ${currentSubStep === 'exercises' ? renderExercisesTabHtml(lesson, progress) : ''}
      ${currentSubStep === 'test' ? renderTestTabHtml(lesson, progress) : ''}
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

        <div class="test-submit-box">
          <button type="submit" class="btn btn-primary btn-lg" id="g-submit-test-btn">
            Nộp bài & Chấm điểm tức thì 📝
          </button>
        </div>
      </form>
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
        alert(`🎉 XUẤT SẮC! Bạn đạt ${correctCount}/${total} điểm (${Math.round(correctCount / total * 100)}%).\nBạn đã xuất sắc hoàn thành Bài 1 và mở khóa Bài tiếp theo!`);
      } else {
        alert(`Bạn đạt ${correctCount}/${total} điểm (${Math.round(correctCount / total * 100)}%).\nCần đạt từ 80% (7/8 câu) trở lên để qua bài. Hãy thử lại nhé!`);
      }

      renderGrammarView();
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
