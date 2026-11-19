# M3 — sản xuất art ngày 19/11/2026

## Hai bản đồ
Góc máy cao cố định, cùng bố cục, nền liền mạch; vùng giao chiến trống và ít tương phản, cảnh vật tập trung ở rìa. Lưới hex do PixiJS vẽ, không nhờ AI vẽ lưới. Tham khảo cách TFT tách vùng chiến thuật khỏi cảnh quan ở rìa, không sao chép asset.

- Hỏa Diệm Sơn: sàn đá bazan ấm, dung nham và vách núi ở rìa, bậc đá cổ; tàn lửa chuyển động nhẹ. Giữ trung tâm đủ sáng để đọc sprite đen trắng.
- Thủy Liêm Động: sàn đá xanh xám trong hang, thác nước ở phía trên, suối bao rìa, rêu và cây; sương và gợn nước nhẹ. Không đặt cây/đá cao che quân hoặc ô đặt quân.

fal đã chọn `google/nano-banana-2.1`; yêu cầu ảnh WebP 2K, tỷ lệ 3:2 rồi căn vào viewport 700×500. Lần gửi Hỏa Diệm Sơn thất bại trước khi tạo ảnh do hết credit. Chưa có asset mới hoặc kết quả để nghiệm thu. Không ghi nhận license của asset chưa được sinh.

## Skill và hazard
Kim Cô Bổng: vệt bổng chém và vòng va đập tại địch. Nhân Sâm Quả: lá bay lên, vòng hồi máu tại đồng minh. Lưu Sa Hà: vòm nước quanh bản thân. Hỏa Tiêm Thương: vệt thương từ người đánh tới địch. Chấn Địa: vòng chấn động và nứt đất quanh bản thân.

Sân băng phủ mặt sân; bông tuyết trên đầu cả hai đội biểu thị debuff ASPD đã có. Bão cát có lốc ở rìa và dấu xoáy trên quân Thủy. Nước lũ có dòng sóng; dây leo bò trên nền; hỏa hoạn có từng cụm lửa; mưa kiếm rơi chéo. Dấu trạng thái chỉ hiện lên các hành bị tác động theo hazards.json.

Đã có mã hình học thử cho các hiệu ứng. Còn phải xem trực tiếp từng skill/hazard ở 1×, thay dấu vết chung bằng dấu riêng, làm sprite sạch nền, tích hợp map ảnh sau khi fal có credit, đo FPS trên điện thoại thật. Không coi test TypeScript là nghiệm thu mỹ thuật.
