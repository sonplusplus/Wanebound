# Rule v0.2 — Luật game

Nguồn sự thật duy nhất cho luật và số liệu. Giá trị ghi "khởi điểm" sẽ được chỉnh bằng bot mô phỏng (TASKS M5).

Thay đổi so với v0.1: chuyển từ theo lượt sang thời gian thực; thêm nghề; thêm chuẩn hóa PvP; hòa tính theo % máu đã mất; sinh áp dụng giữa đồng đội; thêm quy trình trước trận.

## 1. Trận đấu
- Thời gian thực, mô phỏng cố định 10 tick/giây (1 tick = 0,1 giây), tối đa 180 giây (1800 tick).
- Người chơi chọn đội và đặt quân trước trận. Trong trận quái tự đánh, không có điều khiển.
- Bàn 7 cột × 5 hàng, ô vuông, x 0..6, y 0..4. Phe A đặt quân ở cột 0-2, phe B ở cột 4-6, cột 3 trung lập. (Vuông hay hex: xem QUESTIONS Q1; code đặt sau interface `Grid`.)
- Mỗi phe có 3 quái chính + 1 viện trợ.

## 2. Chỉ số
HP, ATK, DEF, SPD (ô/giây), RANGE (ô), ASPD (đòn/giây), Năng lượng 0-100.

Sát thương = `max(1, ATK × skillMult × 100 / (100 + DEF) × elementMult)`.

Đòn thường không có chí mạng hay trượt (không ngẫu nhiên). Chỉ số trong `docs/roster.md` là chỉ số PvP chuẩn (xem mục 11).

## 3. Nghề và hành vi tự động
| Nghề | id | Tầm mặc định | Chọn mục tiêu | Chỉ số nghiêng |
|---|---|---|---|---|
| Tank | `tank` | 1 | địch gần nhất | HP, DEF cao; ATK thấp |
| Chiến binh | `warrior` | 1 | địch gần nhất | cân bằng, ATK cao |
| Xạ thủ | `archer` | 4 | địch có % máu thấp nhất trong tầm | ATK cao; HP, DEF thấp |
| Pháp sư | `mage` | 3 | địch gần nhất, skill thiên về diện rộng | ATK cao; DEF thấp |
| Hỗ trợ | `support` | 3 | đồng minh có % máu thấp nhất; nếu không ai bị thương thì địch gần nhất | HP vừa; ATK thấp |

Quy tắc mỗi tick:
1. Mọi quyết định đọc từ trạng thái đầu tick. Sát thương, hồi máu và hiệu ứng áp dụng cuối tick. Xử lý chết sau cùng (hai bên có thể cùng chết trong một tick).
2. Chọn mục tiêu theo nghề. Hòa thì chọn đơn vị có id nhỏ hơn (so sánh chuỗi).
3. Mục tiêu ngoài tầm: di chuyển thẳng về phía mục tiêu với tốc độ SPD, không vượt quá khoảng cách còn lại. Chưa có va chạm giữa các quân ở v0.2 (xem TASKS M5).
4. Trong tầm và hết hồi đòn: tấn công, hoặc dùng skill active nếu đủ năng lượng. Hồi đòn = 1 / ASPD giây.
5. Quân bị khiêu khích (taunt) buộc chọn kẻ khiêu khích làm mục tiêu nếu kẻ đó còn trong bán kính taunt.
6. Khoảng cách là Euclid tính bằng ô, không dùng `Math.hypot` (xem architecture.md).

## 4. Ngũ hành
- 4.1 Khắc: Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim.
- 4.2 Sinh: Kim sinh Thủy, Thủy sinh Mộc, Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim.
- 4.3 Giữa kẻ địch: bên khắc gây ×1,20 sát thương lên bên bị khắc; bên bị khắc gây ×0,85 lên bên khắc (khởi điểm, nằm trong khoảng 15-20%). Cùng hành hoặc quan hệ sinh: ×1,00.
- 4.4 Giữa đồng đội (kề nhau ≤ 1,5 ô):
  - "Được sinh": có đồng minh kề mà hành của họ sinh ra hành của mình ⇒ +15% tốc độ tích năng lượng.
  - "Đi sinh": có đồng minh kề mà hành của mình sinh ra hành của họ ⇒ −10% tốc độ tích năng lượng (hao).
  - Mỗi chiều tính tối đa một lần. (khởi điểm, xem QUESTIONS Q2)

## 5. Năng lượng và skill
- Mỗi quái có 1 passive (luôn bật, kích hoạt theo điều kiện trong dữ liệu) và 1 active.
- Năng lượng: +12 khi gây đòn thường trúng, +6 khi bị đòn trúng (không tính hazard). Đạt 100: lần hành động tấn công kế tiếp thay bằng active, năng lượng về 0.
- Active hồi máu chỉ dùng khi có đồng minh bị thương; nếu không thì đánh thường và giữ năng lượng.
- Hiệu ứng skill mô tả bằng dữ liệu (architecture.md §4), không viết cứng.

## 6. Viện trợ
- Xuất hiện đúng một lần, khi quân chính đầu tiên của phe đó chết. Nếu nhiều quân chết cùng tick vẫn chỉ một viện trợ.
- Vị trí: cột ngoài cùng phía mình (cột 0 với phe A, cột 6 với phe B), hàng gần nhất với quân vừa chết.
- Bất tử 1,5 giây sau khi xuất hiện, kể cả với hazard.
- Chọn sau khi đã thấy 3 quái chính của đối thủ (xem mục 9).

## 7. Hazard (chỉ PvP)
- Mỗi trận 1 hazard (khởi điểm), hành và thời điểm sinh từ seed. Thời điểm kích hoạt nằm trong khoảng 60-120 giây.
- Cả hai bên thấy hazard (loại và thời điểm) ngay từ bước đặt quân. Cảnh báo đếm ngược hiện từ 10 giây trước. Hazard kéo dài 6 giây. Không có hazard thứ hai chồng lên.
- Hazard hành X tác động lên quân có hành mà X khắc, với hiệu ứng:

| Hazard | Tên | Tác động lên | Hiệu ứng (khởi điểm) |
|---|---|---|---|
| Kim | mưa kiếm | quân Mộc | mất 8% HP tối đa mỗi giây |
| Mộc | dây leo | quân Thổ | SPD −40% |
| Thủy | nước lũ | quân Hỏa | tốc độ tích năng lượng −50% |
| Hỏa | hỏa hoạn | quân Kim | mất 8% HP tối đa mỗi giây |
| Thổ | bão cát | quân Thủy | tầm đánh −1 (tối thiểu 1) |

- Khiên hấp thụ sát thương hazard như sát thương thường.

## 8. Điều kiện thắng
- Thắng khi tiêu diệt toàn bộ đội đối phương (kể cả viện trợ đã xuất hiện).
- Cả hai phe cùng bị diệt trong một tick: hòa.
- Hết 180 giây: so tỉ lệ máu đã mất. `lostPct = Σ(maxHP − max(0, HP)) / ΣmaxHP`, tính trên các quân đã ra sân (viện trợ chỉ tính nếu đã xuất hiện). Khiên không tính là máu. Bên có `lostPct` thấp hơn thắng; chênh dưới 0,1 điểm phần trăm là hòa.
- PvE: hết giờ tính là thua.

## 9. Quy trình trước trận (PvP)
Realtime:
1. Chọn 3 quái chính (20 giây). Khóa đồng thời, lộ cho đối thủ.
2. Hiện hazard của trận (seed chung do server cấp). Chọn viện trợ (không trùng 3 chính) và đặt vị trí 3 quái chính trên nửa sân mình (30 giây). Hai bên không thấy vị trí của nhau. Hết giờ hoặc bấm khóa thì chốt; quân chưa đặt được xếp tự động.
3. Tiết lộ 3 giây, rồi chiến đấu.

Bất đồng bộ:
- Đội phòng thủ là bản chụp (3 chính + vị trí + viện trợ) lưu khi người chơi cập nhật. Bản chụp dùng AI mặc định như mọi quân khác (v0.2 chưa có tùy chỉnh hành vi).
- Bên tấn công thấy 3 quái chính của bản chụp và hazard, rồi chọn viện trợ và đặt quân. Server chấp nhận tối đa 120 giây.
- Kết quả tính cho bên tấn công, bên phòng thủ nhận bản phát lại và thay đổi rating nhỏ.

## 10. PvE
- Mỗi ải có đội địch cố định (quái nhỏ + boss ở ải boss), vị trí cố định, map tĩnh, không hazard. Người chơi chọn đội và đặt quân như PvP.
- Xếp hạng ải: 3 sao nếu không mất quân nào, 2 sao nếu mất 1, 1 sao nếu thắng.
- Mỗi chương có nhiều ải và ải boss cuối. Độ khó tăng theo cốt truyện.

## 11. Tiến trình và chuẩn hóa PvP (chống P2W)
- Ba trục: cấp (level), bậc (tier, tiến bậc ở mốc cấp), sao (star, từ quái trùng).
- Chỉ số trong roster là chỉ số PvP chuẩn. Ngoài PvE: `chỉ số = chỉ số chuẩn × (1 + 0,03 × (cấp − 1))`, trần cấp theo bậc (bậc 0: 20, bậc 1: 30, bậc 2: 40, bậc 3: 50, bậc 4: 60). (khởi điểm)
- PvP chuẩn hóa: bỏ qua cấp và bậc, mọi quái dùng chỉ số chuẩn. Sao cộng tối đa +10% HP và ATK ở 5 sao (+2% mỗi sao). (khởi điểm, xem QUESTIONS Q3)
- Không có thứ gì mua được bằng tiền thật làm tăng chỉ số PvP.
- Lực chiến chỉ dùng để ghép trận bất đồng bộ và hiển thị.

## 12. Gacha và độ hiếm
- Độ hiếm: R, SR, SSR ở bản ra mắt; UR dành cho roster Hồng Hoang (bản mở rộng).
- Tỉ lệ công khai (khởi điểm): SSR 3%, SR 17%, R 80%. Soft pity từ lượt 60 (+6% mỗi lượt), hard pity ở lượt 80.
- Banner "hành vượng" xoay theo vòng sinh, mỗi 3 ngày một hành: trọng số của quái thuộc hành đó tăng ×1,5 trong cùng độ hiếm.
- Quái trùng đổi ra hồn phách: R 10, SR 30, SSR 100. Nâng sao tốn hồn phách: 20 / 40 / 80 / 160 / 320 cho sao 1-5 (khởi điểm).
- Mọi lượt quay chạy trên server và ghi log.

## 13. Tiền tệ
| Tiền | Kiếm từ | Dùng cho |
|---|---|---|
| Vàng | ải, nhiệm vụ, đăng nhập | lên cấp |
| Linh thạch | ải, thành tựu, nhiệm vụ | quay gacha |
| Hồn phách | quái trùng | nâng sao |
| Tinh hoa (5 loại) | ải PvE đúng hành | tiến bậc |
| Chiến công | PvP | cửa hàng PvP (skin, vật phẩm) |

Chưa có tiền tệ cao cấp. Nếu thêm sau này, chỉ bán skin và hiệu ứng, không bán sức mạnh.

## 14. Thể lực (PvE)
- Tối đa 60, hồi 1 mỗi 6 phút (đầy sau 6 giờ). Ải thường tốn 6, ải boss tốn 10. (khởi điểm)
- Không bán, không rút ngắn thời gian chờ bằng tiền thật hay tiền trong game.

## 15. Ghép trận và xếp hạng
- Xếp hạng ẩn dùng Glicko-2 cho PvP xếp hạng. Ghép trận realtime theo rating, bất đồng bộ chọn bản chụp trong khoảng rating gần.
- Thoát giữa trận realtime bị xử thua; mô phỏng vẫn chạy tới hết trận trên server.
