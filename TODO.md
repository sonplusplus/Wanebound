# TODO — checklist nghiệm thu theo mốc

File này ghi việc cụ thể còn thiếu. Chỉ đánh dấu `[x]` khi đã xem kết quả thực tế; `docs/TASKS.md` giữ trạng thái mốc chính.

## M5G — Godot: trận mẫu, hoạt ảnh và VFX (đang làm)

- [x] Replay seed 42 đã mang event `Attack`, `Cast`, `Damage`, `Death`, `ReinforcementSpawn` từ sim sang Godot; không tính lại kết quả trong GDScript. Đã thấy đòn đánh, số sát thương và chuyển động lao tới trên web desktop.
- [x] Thay chữ logo tạm bằng asset Wanebound trong header Godot; thu nhỏ sprite, giữ vòng chân ở vị trí sim và sắp lớp theo chân. Đã xem trực tiếp: bớt đè hình, nhưng nhóm quân cận chiến vẫn khó tách ở vài tick.
- [x] Có lớp cảnh báo/đang diễn ra và nét chuyển động riêng cho sáu hazard trong code; đã xem Bão cát của replay seed 42 ở 1×. Replay này chỉ chứa Bão cát và Dây leo.
- [ ] Soát toàn bộ replay ở 1×: các quân đứng sát, đánh cùng tick, HP/energy và tên không che nhau. Phân biệt tâm quân đúng theo sim với phần ảnh/vũ khí trang trí chồng hình; dọn mây, trăng và viền trắng trong battle sprite trước khi tăng kích thước lại.
- [ ] Hoàn thiện hoạt ảnh đứng, chạy, đánh, trúng đòn, chết và viện trợ xuất hiện. Bản hiện tại mới có nhún, lao ngắn, nháy sáng và mờ khi chết; cần xem rõ cái chết/viện trợ ở tick 589, lật sprite phe B và kiểm tra từng chuyển động ở 1×.

### Năm active — cần telegraph, impact và aftermath riêng

Hiện tại `Cast` đã tạo vòng màu theo hành; một số skill có đường đánh, chấm lá hoặc vòng phụ. Đây là dấu hiệu tạm để thấy event, chưa đủ phân biệt skill trong trận.

- [ ] **Kim Cô Bổng / Ngộ Không:** viền báo trước quanh người, cung quét gậy sắc bạc/vàng tới đúng mục tiêu, chớp va chạm và số sát thương. Vòng/đường thẳng hiện tại còn giống đòn thường.
- [ ] **Nhân Sâm Quả / Trấn Nguyên:** dấu quả và lá trước khi dùng, luồng xanh tới đồng minh được chọn, bùng hồi máu và dấu hồi rõ trên thanh HP. Hiện mới có vòng và chấm xanh.
- [ ] **Lưu Sa Hà / Sa Tăng:** dòng nước cuộn quanh người, khiên nước bao thân và vùng khiêu khích đọc được bán kính; viền trạng thái còn trong thời gian hiệu lực. Hiện mới có hai vòng xanh.
- [ ] **Hỏa Tiêm Thương / Na Tra:** đường thương lửa có hướng, va chạm cam đỏ và dấu chậm trên mục tiêu. Hiện mới có đường sáng và vòng chung.
- [ ] **Chấn Địa / Ngưu Ma Vương:** telegraph vùng quanh bản thân, sóng nứt đất lan ra đúng vùng ảnh hưởng, bụi/đá va chạm và dấu chậm. Hiện mới có vòng lan.

### Sáu hazard — cần nghiệm thu riêng ở 1×

Mỗi loại cần cảnh báo đủ 10 giây, hiệu ứng hoạt động 6 giây, dấu vết sau khi hết và viền trên đúng quân chịu tác động theo dữ liệu sim. Nét phủ bàn hiện là hình 2D tạm, chưa có texture hoặc aftermath.

- [ ] **Mưa kiếm:** vệt kiếm rơi chéo; tạo replay/cảnh thử có hazard này và kiểm tra quân Mộc chịu tác động.
- [ ] **Dây leo:** dây mọc từ rìa bàn; tua tới hazard thứ hai của seed 42, rồi kiểm tra quân Thổ và dấu giảm SPD.
- [ ] **Nước lũ:** lớp sóng dâng; tạo cảnh thử và kiểm tra quân Hỏa cùng dấu giảm tích năng lượng.
- [ ] **Hỏa hoạn:** mảng lửa và khói; tạo cảnh thử, vết cháy còn lại và quân Kim chịu tác động.
- [ ] **Bão cát:** vệt cát đã thấy ở seed 42; tăng độ rõ vùng phủ, kiểm tra quân Thủy và dấu giảm tầm, thêm dấu vết sau hiệu ứng.
- [ ] **Sân băng:** sương và mảnh băng; tạo cảnh thử và kiểm tra viền lạnh trên cả hai đội cùng dấu giảm ASPD.
- [ ] Tạo texture VFX 5 hành khi hình 2D chưa đủ rõ; đo FPS/bộ nhớ trên desktop rồi trên điện thoại thật theo giới hạn hạt của `docs/skill_animation.md`.

## M3 — Logo, nhân vật, bản đồ, skill và VFX

- [x] Lưu logo người dùng cung cấp ở `assets/others/wanebound-logo-source.png`, xuất WebP vào client và hiển thị trong trang xem trận.
- [x] Q23: đổi tên hiển thị thành `Wanebound` theo quyết định ngày 19/11/2026.
- [ ] Lấy thông tin model và quyền thương mại của logo trước phát hành.
- [ ] Dọn mây, trăng, viền trắng còn sót trên 5 battle sprite: Trấn Nguyên, Sa Tăng, Ngưu Ma Vương, Na Tra, Ngộ Không. Soát cả nền sáng và tối.
- [ ] Vẽ portrait gacha 3:4 và icon 128 px riêng cho từng nhân vật, thay bản crop tạm.
- [ ] Thiết kế Hỏa Diệm Sơn thành địa hình núi lửa và Thủy Liêm Động thành địa hình hang/suối đọc được từ góc bàn đấu; giữ lưới hex nhìn rõ, không có khe đen; kiểm tra quân không chìm vào nền.
- [ ] Thay nền procedural tạm bằng map art tối ưu WebP; căn tile hex và vùng đặt quân cho cả desktop/mobile.
- [ ] Xem telegraph, impact, aftermath riêng cho 5 active: Kim Cô Bổng, Nhân Sâm Quả, Lưu Sa Hà, Hỏa Tiêm Thương, Chấn Địa. Mỗi skill cần silhouette và màu dễ nhận ra khi xem ở tốc độ 1×.
- [ ] Xem riêng 6 hazard: Mưa kiếm, Dây leo, Nước lũ, Hỏa hoạn, Bão cát, Sân băng. Kiểm tra cảnh báo 10 giây, overlay 6 giây, dấu vết sau hiệu ứng và phân biệt được mục tiêu chịu tác động.
- [ ] Tạo texture VFX 5 hành nếu particle hiện tại chưa đủ rõ; giới hạn hạt và kích thước texture trên điện thoại.
- [ ] Kiểm tra animation đứng, chạy, đánh, trúng đòn, chết, viện trợ xuất hiện, bất tử; đặc biệt sprite không che thanh HP/mana hoặc đè lên quân khác.
- [ ] Đo FPS và bộ nhớ trên điện thoại tầm trung thật trong trận nhiều quân/VFX; ghi máy, trình duyệt, FPS tối thiểu và lỗi vào `docs/TASKS.md`.

## M4 — Từ chọn đội đến kết quả

- [ ] Router và màn chính dùng logo; bố cục responsive 320 px đến desktop.
- [ ] Chọn 3 quân chính và 1 viện trợ, hiển thị hành/nghề; báo lỗi đội hình trùng hoặc thiếu quân.
- [ ] Công bố map, hiệu ứng map, loại và thời điểm hazard trước khi đặt quân.
- [ ] Kéo thả 3 quân lên nửa sân hợp lệ; không cho đặt trùng; đếm giờ, khóa và xếp tự động khi hết giờ.
- [ ] Màn kết quả đọc từ sim, có phát lại, điểm sát thương/hồi máu và lý do thắng/hòa.
- [ ] Rà toàn bộ chữ Việt trong `i18n/vi.ts`, gồm Tầm xa và Sát thủ.

## M5 — Mô phỏng, va chạm, cân bằng

- [ ] **Ưu tiên lỗi:** thực thi chặn cứng ở sim; hai quân không xuyên/chồng cùng vị trí trong mỗi tick. Khi bị chặn, đứng lại và đánh nếu trong tầm.
- [ ] Quy định thứ tự tranh ô theo id/seed, trường hợp hai phe đối đầu, nhiều quân cùng mục tiêu và viện trợ xuất hiện; thêm test replay cùng seed và test va chạm.
- [ ] Sắp lớp sprite theo vị trí để giảm cảm giác chồng hình khi các quân đứng sát nhau; kiểm tra riêng va chạm thật và chồng do cách vẽ.
- [ ] Chốt luật sát thủ Q22 rồi thêm quân, skill ẩn thân/nhảy vọt, mục tiêu ưu tiên và cách bị khắc chế; không tự đặt số liệu.
- [ ] Chạy bot ít nhất 300 trận sau sửa va chạm; so tỉ lệ hết giờ (hiện 92%), thời lượng, win rate từng quân/map/hazard; ghi `docs/balance_report.md`.

## M6–M11 — Nội dung và phát hành

- [ ] M6: 10 ải chương 1, 2 boss, phần thưởng, tiến trình, IndexedDB và kiểm tra PvP chuẩn hóa.
- [ ] M7: server quyết định trận, tài khoản, DB, lưu đội phòng thủ và replay.
- [ ] M8: PvP realtime, commit-reveal, mất kết nối, map/hazard do server công bố.
- [ ] M9: gacha, pity, sổ cái và thống kê 10.000 lượt.
- [ ] M10: thêm nhân vật đủ năm nghề; thiết kế map mới và **Lôi Kiếp** sau khi Q21 được chốt; có art, VFX, test riêng từng nội dung.
- [ ] M11: xác minh license của logo và mọi asset, kiểm thử thiết bị thật, bảo mật, điều khoản và chi phí triển khai.
