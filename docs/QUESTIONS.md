# QUESTIONS — câu hỏi còn mở

Người dùng trả lời bằng cách sửa ngay dưới câu hỏi, rồi cập nhật `rule.md`. Agent gặp chỗ thiếu thì thêm câu hỏi mới ở cuối, không tự quyết.

## Đã chốt ngày 18/11/2026
**Q1. Bàn đấu dùng ô vuông hay lục giác (hex)?**
Đề xuất: ô vuông 7×5 cho bản đầu (đơn giản, dễ làm, dễ đọc trên điện thoại); code đặt sau interface `Grid` để đổi sau.
Trả lời: Lục giác, theo cảm hứng Tactical Monster PvP.

**Q2. Quy tắc "sinh" giữa đồng đội có đúng ý bạn không?**
Hiện tại: được sinh +15% tốc độ tích năng lượng, đi sinh −10% (kề nhau ≤ 1,5 ô). Bạn từng nói sinh tăng/giảm 15-20%; bản này chuyển phần "sinh" sang đồng đội và đổi thành tốc độ năng lượng thay vì sát thương.
Trả lời: Được sinh tăng 15% tốc độ tích năng lượng; thêm tác động lên tốc độ đánh, chi tiết xem Q11. Một số quái nghề hỗ trợ có thể có skill buff tốc độ đánh.

**Q3. Chuẩn hóa PvP: sao lệch tối đa +10% có ổn không, hay bỏ hẳn sao khỏi PvP?**
Đề xuất: giữ +2% mỗi sao, tối đa +10%.
Trả lời: Giữ +2% HP và ATK mỗi sao, tối đa +10%.

## Có thể trả lời sau
**Q4. Quân phòng thủ (bất đồng bộ) có cho người chơi tùy chỉnh hành vi (ưu tiên mục tiêu, thời điểm dùng skill) không?** Trả lời: Tự động theo luật chọn mục tiêu và dùng skill, không cần huấn luyện model. Không cần mức độ khó riêng. Khả năng tùy chỉnh chưa được yêu cầu.

**Q5. Số hazard mỗi trận: 1 hay 2 (mỗi cái ở nửa trận)?** Trả lời: Số lượng ngẫu nhiên, không cố định. Cần chốt miền chọn và lịch ở Q12.

**Q6. Hòa trong PvP xếp hạng: tính 0 điểm, hay có cách phân định thêm (ví dụ bên phòng thủ thắng)?** Trả lời: Khi hết giờ mà hai đội còn sống, dùng sát thương gây ra và máu hồi với hệ số sẽ chỉnh bằng thử nghiệm. Cần chốt công thức ban đầu ở Q13.

**Q7. Va chạm giữa các quân: tách mềm, chặn cứng, hay cho chồng lên nhau?** Trả lời: Chặn cứng, đứng lại đánh. Chi tiết khi hai quân tranh một ô xử lý ở M5.

**Q8. Thời lượng trận tối đa 180 giây có hợp lý sau khi chạy bot không?** Trả lời: 180 giây hợp lý; vẫn kiểm tra thời lượng thực tế ở M5.

**Q9. Có làm chế độ đấu chuẩn bằng đội mượn không, và khi nào?** Chưa lên lịch theo trả lời người dùng.

## Agent ghi thêm bên dưới

## Đã chốt bổ sung ngày 18/11/2026
**Q10. Bàn hex 7×5 dùng hướng nào và cách đo tầm?** Đề xuất: hex đỉnh nhọn, 7 cột × 5 hàng theo tọa độ axial `q=x, r=y`, khoảng cách hex là số bước ngắn nhất. Điều này thay cho khoảng cách Euclid hiện ghi ở `rule.md` §3 và ảnh hưởng tầm, di chuyển, kề nhau.
Trả lời: Đồng ý.

**Q11. Tương sinh ảnh hưởng tốc độ đánh như thế nào?** Đề xuất: "được sinh" thêm +15% ASPD, "đi sinh" chỉ hao −10% tốc độ tích năng lượng như trước. Buff tốc độ đánh của nghề hỗ trợ nằm trong skill data riêng, cần số liệu của từng skill trước khi thêm.
Trả lời: Đồng ý đề xuất.

**Q12. Hazard ngẫu nhiên chọn bao nhiêu cái, ở khoảng thời gian nào, có lặp hành và công bố trước trận không?** Đề xuất để thử: 1–3 hazard, không chồng thời gian, chọn thời điểm trong 30–150 giây, loại và thời điểm đều lộ ở bước đặt quân. Nếu muốn bất ngờ hoàn toàn, chỉ công bố 10 giây trước khi kích hoạt.
Trả lời: 1–3 hazard, không chồng nhau, trong 60–120 giây, loại và thời điểm công bố từ bước đặt quân. Có thể lặp loại; nếu hai lần liên tiếp cùng loại, xác suất loại đó lần tiếp theo giảm một nửa, phần xác suất chuyển chia đều cho bốn loại khác. Đây là giá trị thử nghiệm.

**Q13. Công thức ban đầu để phân định khi hết giờ là gì?** Đề xuất để thử: điểm `damageDealt + healDone × 0,5`, chỉ tính sát thương thực nhận và hồi máu thực tế; hòa nếu chênh dưới 0,1% tổng HP tối đa của hai đội. Có cần chuẩn hóa theo HP đội hoặc theo quái đã ra sân không?
Trả lời: Dùng công thức đề xuất để thử nghiệm: `damageDealt + healDone × 0,5`, sát thương và hồi máu thực tế; hòa nếu chênh dưới 0,1% tổng HP tối đa của hai đội. Chưa chuẩn hóa theo HP riêng mỗi đội.

**Q14. Na Tra thay Hồng Hài Nhi trong 5 quái vertical slice hay là quái thứ sáu?** Ảnh Na Tra đã được đưa vào `assets/characters/ne_zha/concept.png`; `docs/roster.md` hiện chỉ có chỉ số và skill của Hồng Hài Nhi. Nếu Na Tra thay thế, cần chốt role, chỉ số và skill trước khi đưa vào M1.
Trả lời: Na Tra thay Hồng Hài Nhi trong vertical slice. Đã duyệt bộ số liệu khởi điểm: Hỏa, chiến binh, SSR; HP 3200, ATK 74, DEF 22, SPD 2,2, RANGE 1, ASPD 1,1; passive Phong Hỏa Luân tăng 20% SPD khi dưới 50% HP; active Hỏa Tiêm Thương gây 200% sát thương 1 mục tiêu và làm chậm 30% trong 2 giây.
