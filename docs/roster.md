# Roster — dữ liệu quái

Chỉ số là chỉ số PvP chuẩn, giá trị khởi điểm lấy từ bản thử nghiệm và sẽ chỉnh bằng bot (TASKS M5). Agent tạo `data/units.json` và `data/skills.json` từ file này (TASKS M1).

## 1. Vertical slice (5 quái Tây Du)
| id | Tên | Hành | Nghề | Độ hiếm | HP | ATK | DEF | SPD | RANGE | ASPD |
|---|---|---|---|---|---|---|---|---|---|---|
| `sun_wukong` | Tôn Ngộ Không | Kim | chiến binh | SSR | 3000 | 78 | 20 | 2.4 | 1 | 1.1 |
| `zhenyuan` | Trấn Nguyên Đại Tiên | Mộc | hỗ trợ | SR | 3400 | 40 | 25 | 1.6 | 3 | 0.8 |
| `sha_wujing` | Sa Tăng | Thủy | tank | SR | 5400 | 45 | 55 | 1.4 | 1 | 0.9 |
| `red_boy` | Hồng Hài Nhi | Hỏa | pháp sư | SSR | 2600 | 70 | 15 | 1.8 | 3 | 0.9 |
| `bull_demon` | Ngưu Ma Vương | Thổ | chiến binh (hạng nặng) | SSR | 4600 | 65 | 40 | 1.7 | 1 | 0.9 |

## 2. Skill
| Quái | Passive | Active |
|---|---|---|
| `sun_wukong` | Hỏa Nhãn Kim Tinh (`huo_yan_jin_jing`): gây thêm 15% sát thương lên mục tiêu dưới 50% HP | Kim Cô Bổng (`jin_gu_bang`): 250% sát thương lên 1 mục tiêu |
| `zhenyuan` | Sinh Cơ (`sheng_ji`): mỗi 5 giây hồi 1,5% HP tối đa cho cả đội | Nhân Sâm Quả (`ren_shen_guo`): hồi 25% HP tối đa cho đồng minh có % máu thấp nhất |
| `sha_wujing` | Tĩnh Thủy (`jing_shui`): giảm 10% sát thương nhận từ đòn thường | Lưu Sa Hà (`liu_sha_he`): khiên 30% HP tối đa trong 4 giây, khiêu khích địch trong bán kính 2 ô trong 3 giây |
| `red_boy` | Nộ Hỏa (`nu_huo`): +20% ATK khi HP dưới 50% | Tam Muội Chân Hỏa (`san_mei_zhen_huo`): 140% sát thương diện rộng bán kính 1,5 quanh mục tiêu |
| `bull_demon` | Da Trâu (`niu_pi`): +10% DEF khi có từ 2 địch trở lên trong bán kính 1,5 | Chấn Địa (`zhen_di`): 130% sát thương diện rộng bán kính 1,5 quanh bản thân, làm chậm 30% SPD trong 2 giây |

## 3. Art
Mỗi quái cần `portrait.webp`, `battle.webp`, `icon.webp` (quy cách ở `art_style.md`). Ảnh hiện có là bản thử, sẽ vẽ lại đồng bộ hơn khi sản xuất.

## 4. Danh sách ứng viên cho các đợt sau
Chỉ là tên và nghề gợi ý, chưa có chỉ số. Việc gán hành dựa trên hình ảnh gợi nhớ.

- Kim: Lữ Bố (chiến binh), Triệu Vân (chiến binh), Mã Siêu (chiến binh), Hứa Chử (tank), Dương Tiễn (xạ thủ), Kim Giác Đại Vương (pháp sư), Đường Tăng (hỗ trợ), Bạch Hổ (tank), Hạ Hầu Uyên (xạ thủ), Kim Tra (chiến binh)
- Mộc: Quan Vũ (chiến binh), Hoàng Trung (xạ thủ), Gia Cát Lượng (pháp sư), Hoa Đà (hỗ trợ), Vương Mẫu Nương Nương (hỗ trợ), Thanh Long (tank), Hoàng Nguyệt Anh (pháp sư), Mộc Tra (chiến binh), Thụ Yêu Mộc Tiên Am (pháp sư)
- Thủy: Tiểu Bạch Long (chiến binh), Ngao Quảng (pháp sư), Huyền Vũ (tank), Tư Mã Ý (pháp sư), Cam Ninh (chiến binh), Linh Cảm Đại Vương (pháp sư), Thiết Phiến Công Chúa (pháp sư), Quan Âm Bồ Tát (hỗ trợ)
- Hỏa: Chu Du (pháp sư), Lục Tốn (pháp sư), Na Tra (chiến binh), Chúc Dung (xạ thủ), Chu Tước (hỗ trợ), Thái Thượng Lão Quân (hỗ trợ), Trương Phi (tank), Tôn Sách (chiến binh)
- Thổ: Điển Vi (tank), Mạnh Hoạch (chiến binh), Tào Tháo (pháp sư), Hoàng Phong Quái (pháp sư), Địa Dũng Phu Nhân (chiến binh), Thổ Địa Công (hỗ trợ), Kỳ Lân (tank)

Đội theo cốt truyện (thưởng nhẹ khi đủ): Ngũ Hổ Tướng, Đoàn thỉnh kinh, cặp Xích Bích (Chu Du + Gia Cát Lượng), bộ ba Kim Tra - Mộc Tra - Na Tra. Chưa thiết kế số liệu.
