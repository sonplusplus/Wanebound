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

## Đã chốt bổ sung khi triển khai M3
**Q15. Dùng 5 ảnh `assets/characters/<id>/concept.png` hiện tại làm sprite thử nghiệm, tự động xóa nền và xuất WebP cho M3 được không?** Nền trắng và các họa tiết mây/trăng có thể cần dọn tay sau bước tự động; nguồn model và license thương mại vẫn cần ghi trong `docs/prompts.md` trước cổng G1.
Trả lời: Đồng ý thử. Tự động xóa nền và xuất WebP để kiểm tra trong M3; ảnh còn lỗi sẽ dọn tay sau.

**Q16. Ngưỡng năng lượng để dùng active tăng từ 100 lên bao nhiêu?**
Trả lời: 200 để giảm tốc độ ra chiêu; chạy lại bot để đánh giá, chỉnh tiếp ở M5 nếu cần.

## Đã chốt bổ sung cho map và hazard PvP

**Q17. Sân băng là map hay hazard, tác động bao lâu và lên ai?**
Trả lời: Hazard mới kéo dài 6 giây, giảm 20% ASPD của cả hai đội. Tham gia bộ chọn 1–3 hazard/trận; công bố từ bước đặt quân và cảnh báo 10 giây trước khi kích hoạt. Số liệu để thử nghiệm cân bằng.

**Q18. Map PvP có hiệu ứng vùng riêng hay hiệu ứng chung?**
Trả lời: MVP dùng hiệu ứng chung, áp dụng như nhau cho cả hai đội. Hai map đầu: Hỏa Diệm Sơn +5% sát thương gây ra; Thủy Liêm Động +5% lượng hồi máu thực nhận. Map do seed chọn, công bố trước bước đặt quân. Hiệu ứng vùng để nghiên cứu sau MVP.

## Cần quyết định trước khi mở rộng nội dung

**Q25. Nếu cả 5 hàng cột nhà đều bị chiếm khi viện trợ xuất hiện?** Chưa có luật cho trường hợp này. Mã đang tạm đợi tới tick có hàng trống, có `TODO(balance)`; cần duyệt hoặc thay bằng quy tắc khác trước nghiệm thu va chạm đầy đủ.

Q24 đã được người dùng đồng ý trong chat ngày 19/11/2026: áp dụng quy tắc thử nghiệm 0,8 ô, chặn cứng, thứ tự id và hàng trống gần nhất. Triển khai ở rule v0.4.2.

**Q24. Quy tắc va chạm để xử lý chồng quân trong M3?** Người dùng yêu cầu sửa chồng quân ngày 19/11/2026. Q7 đã chốt chặn cứng nhưng chưa có khoảng cách tối thiểu và cách xử lý viện trợ khi vị trí bị chiếm. Đề xuất thử nghiệm, chưa áp dụng: tâm quân cách tối thiểu 0,8 ô hex; bị chặn đứng lại và đánh nếu đủ tầm; tranh vị trí theo id ổn định; viện trợ chọn hàng trống gần nhất trên cột nhà. Chờ người dùng chốt trước khi sửa sim và rule.md. Phân lớp sprite theo chân có thể sửa độc lập ở client.

**Q19. Sau Sân băng, hazard nào nên thêm tiếp và tác động cụ thể ra sao?**
Gợi ý chưa triển khai: sấm sét làm gián đoạn tích năng lượng, sương mù giảm tầm nhìn/tầm đánh, hoặc động đất thay đổi vị trí quân. Cần chốt mục tiêu, cường độ và tính công bằng giữa hai đội trước khi đưa vào `data/hazards.json`.

**Q20. Map PvP tiếp theo dùng bối cảnh nào và hiệu ứng chung nào?**
Hai map MVP đã chốt ở Q18. Map hiệu ứng theo vùng được hoãn sau MVP; trước khi làm cần chốt vùng, mức ảnh hưởng và cách hiển thị để người chơi đọc được.

## Ghi nhận yêu cầu mới ngày 18/11/2026

**Q21. Lôi Kiếp tác động thế nào?** Người dùng muốn thêm hazard Lôi Kiếp. Chưa chốt tác động lên ai, tần suất đánh, sát thương/khống chế, thời lượng và cảnh báo. Chỉ đưa vào dữ liệu và sim sau khi chốt; hình ảnh gợi ý là sấm chớp báo trước, điểm rơi rõ để người chơi đọc được.

**Q22. Nghề sát thủ hoạt động theo luật nào?** Người dùng chốt bỏ tên nghề Xạ thủ, thay bằng Tầm xa và thêm Sát thủ có thể ẩn thân/biến ảo hoặc nhảy vọt bắt chủ lực. Cần chốt điều kiện kích hoạt, mục tiêu ưu tiên (ví dụ pháp sư/hỗ trợ hay máu thấp), vị trí đáp, thời lượng ẩn thân, cách bị khắc chế và chỉ số trước khi đưa skill vào sim. Nghề Tầm xa kế thừa hành vi của Xạ thủ hiện có cho đến khi chốt lại.

**Q23. Tên thương hiệu trên logo là `Wanebound — Tân Nguyệt`, còn tên trong game hiện là `Ngũ Hành Chiến`.** Có đổi tên hiển thị game và tài liệu sang Wanebound không? Logo đính kèm đã đưa vào bản thử; nguồn tạo, model và quyền thương mại chưa được cung cấp.

## Cập nhật ngày 19/11/2026

- Q23: đã chốt tên game **Wanebound**, cập nhật UI và tiêu đề trình duyệt.
- Q25: viện trợ giáng thế ngay khi quân đầu tiên chết, không gây sát thương hay hiệu ứng chiến đấu khi đáp. Chờ chốt vị trí đáp và chọn bất tử 2 giây hay khiên; không tiếp tục coi cách đợi cột nhà là phương án đã duyệt.
- Q22: sát thủ máu mỏng; ý tưởng active đột kích địch có % HP thấp nhất trong bán kính giới hạn. Chưa có bán kính, vị trí đáp, passive hoặc số liệu nhân vật.
- Q26: gộp pháp sư và xạ thủ thành ranged; skill độc lập với nghề. Chờ xác nhận tầm mặc định và cách chọn mục tiêu. Roster hiện chưa có ranged nên thay enum không đổi bộ skill hiện hành.

### Đã chốt tiếp ngày 19/11/2026 (thay các phương án chờ duyệt phía trên)
- Q25: vị trí trống gần quân chết nhất, giáng thế ngay, không gây sát thương/hiệu ứng chiến đấu; bất tử 2 giây. Bỏ đợi cột nhà.
- Q26: ranged gộp xạ thủ/pháp sư; tầm mặc định 3 ô, địch gần nhất.
- Q22: duyệt bộ thử nghiệm trong rule.md §16: cận chiến 1 ô; đột kích địch % HP thấp nhất trong 3 ô, 180% ATK; passive +15% sát thương khi địch dưới 50% HP. Chưa có nhân vật và chỉ số cơ bản để triển khai.

**Q27 — đã duyệt 19/11/2026:** Cho tìm đường vòng khi quân chưa đủ tầm và bị đồng đội/địch chặn. Giữ khoảng cách 0,8 ô, không xuyên quân; chỉ đứng chờ khi không có đường. Triển khai tìm đường xác định trên lưới nửa ô, kiểm tra cả đoạn di chuyển.

**Q28 — đã duyệt 19/11/2026:** Giữ mục tiêu hiện tại thêm 0,3 giây (3 tick) khi có mục tiêu gần hơn; đổi ngay nếu mục tiêu cũ chết hoặc bị khiêu khích buộc đổi. Đã cập nhật rule v0.4.5.

**Q29 — đã duyệt 19/11/2026:** Người dùng nhận thấy Tôn Ngộ Không yếu hơn Na Tra về sát thương và độ cứng. Trong bot 300 trận rule v0.4.7, khi là quân chính, Ngộ Không có trung bình 6.481 sát thương ghi trong Damage events và sống đến cuối 25,9%; Na Tra tương ứng 6.024 và 28,8%. Chỉ số gốc Ngộ Không HP 3.000/DEF 20/ATK 78, Na Tra HP 3.200/DEF 22/ATK 74. Người dùng chốt tăng Ngộ Không lên HP 3.400/DEF 24/ATK 82; đã cập nhật roster, units.json và rule v0.4.8.
