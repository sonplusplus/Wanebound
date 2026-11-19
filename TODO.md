# TODO — checklist nghiệm thu theo mốc

File này ghi việc cụ thể còn thiếu. Chỉ đánh dấu `[x]` khi đã xem kết quả thực tế; `docs/TASKS.md` giữ trạng thái mốc chính.

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
