# Design v0.2 — Wanebound (Tây Du / Hồng Hoang)

## 1. Tổng quan
Game web tactical thời gian thực trên bàn cờ hex lục giác. Người chơi chọn đội (3 quái chính + 1 viện trợ) và đặt quân; trận bắt đầu thì quái tự đánh. Lõi chiến thuật là ngũ hành (sinh/khắc) kết hợp nghề, vị trí đặt quân và hazard báo trước. Có sưu tầm quái bằng gacha, đi ải PvE có cốt truyện và PvP xếp hạng. Free-to-play, không bán sức mạnh. Nền web: ưu tiên trình duyệt máy tính, sau đó tối ưu trình duyệt điện thoại. Quyết định chuyển client sang Godot ở `godot-migration.md`.

Cảm hứng cấu trúc: *Tactical Monsters Rumble Arena* (trận ngắn, vị trí quan trọng), nhưng đây là thời gian thực và tự đánh, không theo lượt.

## 2. Trụ cột
1. **Vị trí quyết định.** SPD là tốc độ di chuyển trên bàn, nên chỗ đặt quân quyết định ai chạm ai trước.
2. **Ngũ hành là lớp counter chính.** Mỗi quái một hành, khắc và sinh ảnh hưởng sát thương và nhịp năng lượng.
3. **Nghề cho vai trò rõ.** Tank, chiến binh, tầm xa (gộp xạ thủ/pháp sư), sát thủ, hỗ trợ; hình dáng và vũ khí giúp nhận ra nghề, màu giúp nhận ra hành. Cơ chế sát thủ cần chốt trước khi thêm quân.
4. **Thông tin công khai, bất ngờ nằm ở vị trí.** Hazard (loại và thời điểm) hiện từ bước đặt quân; ẩn vị trí của đối thủ đến khi tiết lộ.
5. **Công bằng.** PvP chuẩn hóa chỉ số; tiền thật không mua được sức mạnh.

## 3. Chế độ chơi
- **PvE (ải):** map tĩnh, quái nhỏ và boss, giới hạn thể lực không bán. Học cơ chế, kiếm quái và tài nguyên.
- **PvP realtime:** hai người chơi cùng lúc; chọn 3 quái chính, sau đó chọn viện trợ và đặt quân (ẩn nhau), rồi tiết lộ và chiến đấu. Chi tiết `rule.md` §9.
- **PvP bất đồng bộ:** đánh bản chụp đội phòng thủ của người chơi khác, không cần họ trực tuyến.
- **Về sau (chưa làm):** đấu chuẩn bằng đội mượn ngẫu nhiên, xếp hạng riêng, làm sân chơi hoàn toàn công bằng.

## 4. Vòng chơi
Đi ải kiếm quái và tài nguyên ⇒ quay gacha hoặc nâng sao, lên cấp, tiến bậc ⇒ xây đội theo từng map ⇒ PvP xếp hạng ⇒ mỗi mùa reset rank và đổi bộ map.

## 5. Map
- Asset map do AI vẽ rồi lưu sẵn, không sinh lúc chạy. Layout ô đi được định nghĩa bằng dữ liệu, AI vẽ nền khớp layout.
- PvE: map cố định theo ải, không hazard.
- PvP: map lấy ngẫu nhiên theo seed trong tập đã duyệt. MVP có Hỏa Diệm Sơn (+5% sát thương cho cả hai đội) và Thủy Liêm Động (+5% hồi máu thực nhận cho cả hai đội). Có 1–3 hazard theo seed; Sân băng ảnh hưởng ASPD của cả hai bên (xem `rule.md` §7).
- Về sau: map thuần hành, map hỗn hợp theo vùng, bộ map theo Can của ngày (Giáp/Ất Mộc, Bính/Đinh Hỏa, Mậu/Kỷ Thổ, Canh/Tân Kim, Nhâm/Quý Thủy).

## 6. Tiến trình và kinh tế (tóm tắt, chi tiết ở `rule.md`)
- Độ hiếm R → SR → SSR (ra mắt), UR dành cho Hồng Hoang.
- Quái trùng thành hồn phách để nâng sao; sao chỉ lệch nhỏ trong PvP.
- Lên cấp và tiến bậc chỉ ảnh hưởng PvE; PvP chuẩn hóa. Chừa chỗ cho việc cân bằng nếu sau này có người nạp.
- Năm loại tiền: Vàng, Linh thạch, Hồn phách, Tinh hoa (5 loại), Chiến công.

## 7. Chống P2W (nguyên tắc)
- Tiền chỉ mua bề rộng (cosmetic, tiết kiệm thời gian), không mua chiều cao (sức mạnh).
- PvP chuẩn hóa cấp và bậc; sao lệch tối đa khoảng 10%.
- Gacha công khai tỉ lệ, có pity cứng; mỗi hành có đủ quái kiếm được qua ải để dựng đội cạnh tranh.
- Thể lực không có cách mua lại hay rút ngắn.
- Ghép trận theo rating, không theo mức nạp hay lực chiến.

## 8. Cốt truyện
- **Arc 1 — Tây Du Ký:** roster thấp-trung, giới thiệu thế giới và cơ chế.
- **Arc 2 — Hồng Hoang (mở rộng):** Bàn Cổ, Tam Hoàng, yêu thần thượng cổ; lý do mở rộng roster và mở độ hiếm UR. Không tăng sức mạnh bằng cách nhân chỉ số; mở rộng bằng vai trò và cơ chế mới.

## 9. Art direction (tóm tắt)
Guofeng-anime, 2D cel-shaded, nét đen dày đều, màu hạn chế (đen, trắng, một màu hành). Chi tiết `art_style.md`; hiệu ứng skill và hazard: `skill_animation.md`. Hoạt ảnh nhân vật ở giai đoạn đầu là tween trên sprite tĩnh.

## 10. Phạm vi và mốc
- **Vertical slice:** 5 quái, 1 boss, 2 map, 5 hazard, hiệu ứng particle.
- **MVP chơi được:** 15 quái (3 mỗi hành), 1 chương PvE khoảng 10 ải, 4-5 map PvP.
- **Ra mắt:** 30-40 quái; sau đó thêm 4-6 quái mỗi mùa.

## 11. Rủi ro và giả định
- **License model AI:** một số model anime phổ biến cấm hoặc không rõ quyền thương mại. Ảnh hiện tại là bản thử; trước khi phát hành phải vẽ lại bằng model có license rõ ràng (TASKS cổng G1).
- **Hoạt ảnh:** rig xương cho hàng chục nhân vật là tốn kém; giai đoạn đầu dùng tween và particle.
- **Phạm vi:** một người làm, nên làm vertical slice trước khi mở rộng nội dung.
- **Hạ tầng:** gói AWS Free là gói dùng thử có thời hạn; dev local trước.
- **Bản quyền art AI:** khó bảo vệ; nhân vật chủ lực nên có bước tinh chỉnh tay.

## 12. Hạng mục còn mở
Xem `QUESTIONS.md`.
