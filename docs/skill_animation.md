# Skill & Hazard Animation v0.2

Quy tắc hiệu ứng hình ảnh (VFX) cho skill và hazard, đồng bộ với `art_style.md` và khả thi cho web responsive với một người làm.

## 1. Nguyên tắc
- Ưu tiên chi phí sản xuất thấp: hiệu ứng làm bằng particle và hình 2D đơn giản trong code (PixiJS), không vẽ tay nhiều khung. Texture AI chỉ là phần bổ sung.
- Đọc được hành chỉ qua màu và hình dạng, không cần chữ.
- Giữ ngôn ngữ Hoa phong: mây, vệt cong như nét thư pháp, không dùng tia laser hay hạt lửa kiểu phương Tây.
- Ngân sách hiệu năng: tối đa khoảng 300 hạt cùng lúc trên điện thoại; hiệu ứng ngắn.

## 2. Ba giai đoạn của một skill
1. **Telegraph:** viền sáng nhẹ quanh quân thi triển hoặc vùng bị ảnh hưởng, màu theo hành, khoảng 0,4 giây trước khi đánh.
2. **Impact:** burst ngắn (glow bùng và hạt tỏa ra theo hướng), khoảng 0,25 giây.
3. **Aftermath:** nếu có buff/debuff, hiện icon trạng thái nhỏ và viền màu mờ quanh quân đang chịu hiệu ứng.

## 3. Ngôn ngữ hình ảnh theo hành (áp cho skill và hazard)
| Hành | Màu | Hình dạng | Chuyển động |
|---|---|---|---|
| Kim | trắng bạc, vàng kim | tia sắc cạnh, hình thoi, kiếm khí | thẳng, dứt khoát |
| Mộc | xanh lá | dây leo, lá cong | uốn lượn, mọc lan |
| Thủy | xanh dương | sóng, giọt lan tỏa | gợn sóng, chảy |
| Hỏa | đỏ, cam, vàng | ngọn lửa, tia nổ | bùng nổ, bốc lên |
| Thổ | nâu, vàng đất | mảng vỡ, bụi đất | rung, lún, dồn |

Màu hiển thị: Kim `#aab2c0`, Mộc `#3f9d5b`, Thủy `#3b7fd8`, Hỏa `#e4572e`, Thổ `#b98a48`.

## 4. Hazard (chỉ PvP)
- Pha cảnh báo bắt buộc: overlay mờ màu hành phủ bàn kèm đếm ngược, từ 10 giây trước khi kích hoạt (đồng bộ `rule.md` §7).
- Khi kích hoạt (6 giây): hiệu ứng phủ toàn vùng, particle lớn hơn skill thường để phân biệt ngay đó là hazard.
- Sau khi qua: để lại dấu vết nhẹ trên nền map đến hết trận (vết cháy cho Hỏa, vết nứt cho Thổ, ...).
- Quân chịu tác động hiện viền màu hazard trong thời gian hiệu ứng.

| Hazard | Tên | Hình ảnh gợi ý |
|---|---|---|
| Kim | mưa kiếm | vệt kiếm khí rơi chéo từ trên xuống |
| Mộc | dây leo | dây leo mọc từ rìa bàn lan vào |
| Thủy | nước lũ | sóng dâng từ một cạnh, gợn nước |
| Hỏa | hỏa hoạn | lửa bùng từng mảng, khói bốc lên |
| Thổ | bão cát | bụi cát quét ngang, tầm nhìn mờ nhẹ |
| Trung tính | sân băng | mặt sân phủ sương giá, mảnh băng nhỏ và viền lạnh quanh cả hai đội |

Lôi Kiếp là ứng viên tiếp theo (Q21): cần chốt luật trước khi làm VFX; telegraph nên cho thấy vị trí/đối tượng bị sét đánh.

## 5. Hoạt ảnh nhân vật (tween trên sprite tĩnh)
- Đứng yên: nhún nhẹ lên xuống.
- Di chuyển: nghiêng nhẹ theo hướng chạy.
- Tấn công: lao tới một đoạn ngắn rồi lùi.
- Trúng đòn: nháy trắng ngắn.
- Chết: mờ dần và hạ xuống.
- Xuất hiện (viện trợ): rơi xuống kèm glow, khoảng 0,3 giây, và viền bất tử trong 2 giây.

## 6. Schema `data/vfx.json`
```json
{
  "id": "jin_gu_bang_impact",
  "element": "metal",
  "layers": [
    { "type": "particles", "count": 24, "shape": "diamond", "speed": [120, 260], "life": 0.25, "color": "#aab2c0", "blend": "add" },
    { "type": "texture", "src": "vfx/metal_slash.webp", "scale": [0.8, 1.2], "life": 0.25, "blend": "add" }
  ],
  "telegraph": { "color": "#aab2c0", "duration": 0.4 }
}
```
Skill trỏ tới VFX bằng trường `vfx` trong `skills.json`. Hazard có mục riêng trong `hazards.json` với `warnOverlay`, `activeOverlay` và `trail`.

## 7. Texture AI cho hiệu ứng
Vẽ trên **nền đen**, phát sáng, rồi trộn cộng trong game để phần đen tự biến mất. Gợi ý prompt nền: `no humans, [hiệu ứng], glowing, black background`.
- Kim: `crescent sword energy slash, silver and gold, sharp edges`
- Mộc: `swirling vines and leaves, green glow`
- Thủy: `water ripple rings and droplets, blue glow`
- Hỏa: `fire burst, swirling flames, red and orange glow`
- Thổ: `rock shards and dust burst, brown and yellow`
Không dùng AI để sinh hiệu ứng nhiều khung (không nhất quán, không có nền trong suốt, nặng cho điện thoại).
