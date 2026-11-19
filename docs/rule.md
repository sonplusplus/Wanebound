# Rule v0.4.5 — Luật game

Nguồn sự thật duy nhất cho luật và số liệu. Giá trị ghi "khởi điểm" sẽ được chỉnh bằng bot mô phỏng (TASKS M5).

Thay đổi so với v0.1: chuyển từ theo lượt sang thời gian thực; thêm nghề; thêm chuẩn hóa PvP; hòa tính theo % máu đã mất; sinh áp dụng giữa đồng đội; thêm quy trình trước trận.

Thay đổi v0.3: bàn hex axial, tương sinh tăng ASPD, hazard 1–3 lần, hết giờ phân định theo sát thương và hồi máu, Na Tra thay Hồng Hài Nhi trong vertical slice.

Thay đổi v0.3.1: ngưỡng năng lượng dùng active tăng từ 100 lên 200 theo Q16.

Thay đổi v0.4.0: thêm Sân băng và hai map PvP có hiệu ứng chung theo Q17–Q18.

Thay đổi v0.4.1: đổi tên nghề Xạ thủ thành Tầm xa (`ranged`), thêm định danh Sát thủ (`assassin`). Sát thủ chưa có quái trong roster; luật ẩn thân/nhảy vọt cần chốt ở Q22 trước khi triển khai.

## 1. Trận đấu
- Thời gian thực, mô phỏng cố định 10 tick/giây (1 tick = 0,1 giây), tối đa 180 giây (1800 tick).
- Người chơi chọn đội và đặt quân trước trận. Trong trận quái tự đánh, không có điều khiển.
- Bàn 7 cột × 5 hàng, ô lục giác đỉnh nhọn theo tọa độ axial `q=x, r=y`, x 0..6, y 0..4. Phe A đặt quân ở cột 0-2, phe B ở cột 4-6, cột 3 trung lập. Code đặt sau interface `Grid`.
- PvP chọn map bằng seed chung và công bố trước khi đặt quân. Hỏa Diệm Sơn tăng 5% sát thương do cả hai đội gây ra; Thủy Liêm Động tăng 5% lượng hồi máu thực nhận của cả hai đội. Hazard vẫn chạy độc lập theo mục 7. PvE dùng map cố định theo ải.
- Mỗi phe có 3 quái chính + 1 viện trợ.

## 2. Chỉ số
HP, ATK, DEF, SPD (ô/giây), RANGE (ô), ASPD (đòn/giây), Năng lượng 0-200.

Sát thương = `max(1, ATK × skillMult × 100 / (100 + DEF) × elementMult)`.

Đòn thường không có chí mạng hay trượt (không ngẫu nhiên). Chỉ số trong `docs/roster.md` là chỉ số PvP chuẩn (xem mục 11).

## 3. Nghề và hành vi tự động
| Nghề | id | Tầm mặc định | Chọn mục tiêu | Chỉ số nghiêng |
|---|---|---|---|---|
| Tank | `tank` | 1 | địch gần nhất | HP, DEF cao; ATK thấp |
| Chiến binh | `warrior` | 1 | địch gần nhất | cân bằng, ATK cao |
| Tầm xa | `ranged` | 3 | địch gần nhất | ATK cao; HP, DEF thấp |
| Sát thủ | `assassin` | 1 | địch gần nhất; active tùy nhân vật | HP thấp, số liệu theo roster |
| Hỗ trợ | `support` | 3 | đánh thường chọn địch gần nhất; active chọn đối tượng theo skill (hồi máu hiện tại chọn đồng minh có % HP thấp nhất) | HP vừa; ATK thấp |

Quy tắc mỗi tick:
1. Mọi quyết định đọc từ trạng thái đầu tick. Sát thương, hồi máu và hiệu ứng áp dụng cuối tick. Xử lý chết sau cùng (hai bên có thể cùng chết trong một tick).
2. Chọn mục tiêu theo nghề. Hòa thì chọn đơn vị có id nhỏ hơn (so sánh chuỗi).
   Khi có địch gần hơn, giữ mục tiêu hiện tại thêm 3 tick rồi mới đổi nếu địch đó vẫn gần hơn. Đổi ngay nếu mục tiêu cũ chết hoặc bị khiêu khích buộc đổi (Q28, 19/11/2026).
3. Mục tiêu ngoài tầm: di chuyển thẳng về phía mục tiêu với tốc độ SPD, không vượt quá khoảng cách còn lại. Theo Q24 (19/11/2026): khoảng cách tối thiểu giữa tâm các quân là 0,8 ô hex, chặn cứng khi đường đi xâm phạm khoảng cách này. Xét di chuyển theo id ổn định; quân đánh nếu mục tiêu trong tầm; khi ngoài tầm và bị chặn thì tìm đường vòng qua vị trí trống (Q27), chỉ chờ khi không tìm được đường.
4. Trong tầm và hết hồi đòn: tấn công, hoặc dùng skill active nếu đủ năng lượng. Hồi đòn = 1 / ASPD giây.
5. Quân bị khiêu khích (taunt) buộc chọn kẻ khiêu khích làm mục tiêu nếu kẻ đó còn trong bán kính taunt.
6. Khoảng cách là số bước hex ngắn nhất giữa hai tọa độ axial, không dùng `Math.hypot` (xem architecture.md). 

## 4. Ngũ hành
- 4.1 Khắc: Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim.
- 4.2 Sinh: Kim sinh Thủy, Thủy sinh Mộc, Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim.
- 4.3 Giữa kẻ địch: bên khắc gây ×1,20 sát thương lên bên bị khắc; bên bị khắc gây ×0,85 lên bên khắc (khởi điểm, nằm trong khoảng 15-20%). Cùng hành hoặc quan hệ sinh: ×1,00.
- 4.4 Giữa đồng đội (kề nhau ≤ 1,5 ô):
  - "Được sinh": có đồng minh kề mà hành của họ sinh ra hành của mình ⇒ +15% tốc độ tích năng lượng và +15% tốc độ đánh.
  - "Đi sinh": có đồng minh kề mà hành của mình sinh ra hành của họ ⇒ −10% tốc độ tích năng lượng (hao).
  - Mỗi chiều tính tối đa một lần. (khởi điểm, xem QUESTIONS Q2)

## 5. Năng lượng và skill
- Mỗi quái có 1 passive (luôn bật, kích hoạt theo điều kiện trong dữ liệu) và 1 active. Nghề không giới hạn loại skill: tank có thể hồi máu hoặc khiêu khích; chiến binh có thể tăng tốc đánh; hỗ trợ có thể buff hoặc debuff. Đây là hướng thiết kế, chưa phải bộ skill hay số liệu mới cho roster. Tầm xa gộp xạ thủ và pháp sư, không bắt buộc skill diện rộng.
- Năng lượng: +12 khi gây đòn thường trúng, +6 khi bị đòn trúng (không tính hazard). Đạt 200: lần hành động tấn công kế tiếp thay bằng active, năng lượng về 0.
- Active hồi máu chỉ dùng khi có đồng minh bị thương; nếu không thì đánh thường và giữ năng lượng.
- Hiệu ứng skill mô tả bằng dữ liệu (architecture.md §4), không viết cứng.

## 6. Viện trợ
- Xuất hiện đúng một lần, khi quân chính đầu tiên của phe đó chết. Nếu nhiều quân chết cùng tick vẫn chỉ một viện trợ.
- Vị trí (Q25, 19/11/2026): xuất hiện ngay ở vị trí trống gần quân chết nhất. Ưu tiên chính vị trí chết nếu đủ khoảng cách 0,8 ô với mọi quân sống; nếu bị chiếm chọn tâm ô trống gần nhất trên bàn, hòa theo hàng rồi cột tăng dần. Giáng thế không gây sát thương hay hiệu ứng chiến đấu.
- Bất tử 2 giây (20 tick) sau khi xuất hiện, chống mọi sát thương kể cả hazard; không cộng thêm khiên. Hoạt ảnh đáp không trì hoãn xuất hiện trong sim.
- Chọn sau khi đã thấy 3 quái chính của đối thủ (xem mục 9).

## 7. Hazard (chỉ PvP)
- Mỗi trận chọn 1–3 hazard bằng seed; thời điểm kích hoạt trong khoảng 60–120 giây, không chồng nhau. Cả hai bên thấy loại và thời điểm từ bước đặt quân. Có thể lặp loại; nếu hai hazard liên tiếp cùng loại, xác suất loại đó ở lượt kế tiếp giảm một nửa, phần còn lại chia đều cho các loại khác (giá trị thử nghiệm).
- Cảnh báo đếm ngược hiện từ 10 giây trước. Mỗi hazard kéo dài 6 giây.
- Hazard hành X tác động lên quân có hành mà X khắc, với hiệu ứng:

| Hazard | Tên | Tác động lên | Hiệu ứng (khởi điểm) |
|---|---|---|---|
| Kim | mưa kiếm | quân Mộc | mất 8% HP tối đa mỗi giây |
| Mộc | dây leo | quân Thổ | SPD −40% |
| Thủy | nước lũ | quân Hỏa | tốc độ tích năng lượng −50% |
| Hỏa | hỏa hoạn | quân Kim | mất 8% HP tối đa mỗi giây |
| Thổ | bão cát | quân Thủy | tầm đánh −1 (tối thiểu 1) |
| Trung tính | sân băng | cả hai đội | ASPD −20% |

- Khiên hấp thụ sát thương hazard như sát thương thường.

## 8. Điều kiện thắng
- Thắng khi tiêu diệt toàn bộ đội đối phương (kể cả viện trợ đã xuất hiện).
- Cả hai phe cùng bị diệt trong một tick: hòa.
- Hết 180 giây: tính điểm `damageDealt + healDone × 0,5`, chỉ tính sát thương thực nhận và hồi máu thực tế. Bên điểm cao hơn thắng; chênh dưới 0,1% tổng HP tối đa của hai đội là hòa. Đây là công thức thử nghiệm, điều chỉnh sau chạy bot M5.
- PvE: hết giờ tính là thua.

## 9. Quy trình trước trận (PvP)
Realtime:
1. Chọn 3 quái chính (20 giây). Khóa đồng thời, lộ cho đối thủ.
2. Hiện map và hazard của trận (seed chung do server cấp). Chọn viện trợ (không trùng 3 chính) và đặt vị trí 3 quái chính trên nửa sân mình (30 giây). Hai bên không thấy vị trí của nhau. Hết giờ hoặc bấm khóa thì chốt; quân chưa đặt được xếp tự động.
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

## 16. Bộ thử nghiệm sát thủ đầu tiên — duyệt 19/11/2026
- Bộ skill riêng cho sát thủ đầu tiên, không bắt buộc mọi sát thủ. Chưa có nhân vật và chỉ số cơ bản trong roster.
- Đánh thường cận chiến 1 ô, đuổi địch gần nhất.
- Active đủ 200 năng lượng: đột kích địch có % HP thấp nhất trong 3 ô hex; hòa theo id. Đáp vào vị trí trống kề mục tiêu ưu tiên phía lưng (phía cột nhà đối thủ), tôn trọng va chạm. Gây 180% ATK qua công thức sát thương hiện hành.
- Không có mục tiêu/chỗ đáp: đánh thường nếu có thể và giữ năng lượng. Không tàng hình hoặc miễn sát thương.
- Passive: +15% sát thương lên mục tiêu dưới 50% HP.
- Trước khi triển khai cần nhân vật/chỉ số cụ thể và xử lý đột kích đồng tick, tương tác khiêu khích.
