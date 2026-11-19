# Roster — dữ liệu quái

Chỉ số là chỉ số PvP chuẩn, giá trị khởi điểm lấy từ bản thử nghiệm và sẽ chỉnh bằng bot (TASKS M5). Agent tạo `data/units.json` và `data/skills.json` từ file này (TASKS M1).

## 1. Vertical slice (5 quái Tây Du)
| id | Tên | Hành | Nghề | Độ hiếm | HP | ATK | DEF | SPD | RANGE | ASPD |
|---|---|---|---|---|---|---|---|---|---|---|
| `sun_wukong` | Tôn Ngộ Không | Kim | chiến binh | SSR | 3400 | 82 | 24 | 2.4 | 1 | 1.1 |
| `zhenyuan` | Trấn Nguyên Đại Tiên | Mộc | hỗ trợ | SR | 3400 | 40 | 25 | 1.6 | 3 | 0.8 |
| `sha_wujing` | Sa Tăng | Thủy | tank | SR | 5400 | 45 | 55 | 1.4 | 1 | 0.9 |
| `ne_zha` | Na Tra | Hỏa | chiến binh | SSR | 3200 | 74 | 22 | 2.2 | 1 | 1.1 |
| `bull_demon` | Ngưu Ma Vương | Thổ | chiến binh (hạng nặng) | SSR | 4600 | 65 | 40 | 1.7 | 1 | 0.9 |

## 2. Skill
| Quái | Passive | Active |
|---|---|---|
| `sun_wukong` | Hỏa Nhãn Kim Tinh (`huo_yan_jin_jing`): gây thêm 15% sát thương lên mục tiêu dưới 50% HP | Kim Cô Bổng (`jin_gu_bang`): 250% sát thương lên 1 mục tiêu |
| `zhenyuan` | Sinh Cơ (`sheng_ji`): mỗi 5 giây hồi 1,5% HP tối đa cho cả đội | Nhân Sâm Quả (`ren_shen_guo`): hồi 25% HP tối đa cho đồng minh có % máu thấp nhất |
| `sha_wujing` | Tĩnh Thủy (`jing_shui`): giảm 10% sát thương nhận từ đòn thường | Lưu Sa Hà (`liu_sha_he`): khiên 30% HP tối đa trong 4 giây, khiêu khích địch trong bán kính 2 ô trong 3 giây |
| `ne_zha` | Phong Hỏa Luân (`phong_hoa_luan`): +20% SPD khi HP dưới 50% | Hỏa Tiêm Thương (`hoa_tiem_thuong`): 200% sát thương lên 1 mục tiêu và làm chậm 30% SPD trong 2 giây |
| `bull_demon` | Da Trâu (`niu_pi`): +10% DEF khi có từ 2 địch trở lên trong bán kính 1,5 | Chấn Địa (`zhen_di`): 130% sát thương diện rộng bán kính 1,5 quanh bản thân, làm chậm 30% SPD trong 2 giây |

## 3. Art
Mỗi quái cần `portrait.webp`, `battle.webp`, `icon.webp` (quy cách ở `art_style.md`). Ảnh hiện có là bản thử, sẽ vẽ lại đồng bộ hơn khi sản xuất.

## 4. Danh sách ứng viên cho các đợt sau
Chỉ là tên và nghề gợi ý, chưa có chỉ số. Việc gán hành dựa trên hình ảnh gợi nhớ.

- Kim: Lữ Bố (chiến binh), Triệu Vân (chiến binh), Mã Siêu (chiến binh), Hứa Chử (tank), Dương Tiễn (tầm xa), Kim Giác Đại Vương (tầm xa), Đường Tăng (hỗ trợ), Bạch Hổ (tank), Hạ Hầu Uyên (tầm xa), Kim Tra (chiến binh)
- Mộc: Quan Vũ (chiến binh), Hoàng Trung (tầm xa), Gia Cát Lượng (tầm xa), Hoa Đà (hỗ trợ), Vương Mẫu Nương Nương (hỗ trợ), Thanh Long (tank), Hoàng Nguyệt Anh (tầm xa), Mộc Tra (chiến binh), Thụ Yêu Mộc Tiên Am (tầm xa)
- Thủy: Tiểu Bạch Long (chiến binh), Ngao Quảng (tầm xa), Huyền Vũ (tank), Tư Mã Ý (tầm xa), Cam Ninh (chiến binh), Linh Cảm Đại Vương (tầm xa), Thiết Phiến Công Chúa (tầm xa), Quan Âm Bồ Tát (hỗ trợ)
- Hỏa: Chu Du (tầm xa), Lục Tốn (tầm xa), Na Tra (chiến binh), Chúc Dung (tầm xa), Chu Tước (hỗ trợ), Thái Thượng Lão Quân (hỗ trợ), Trương Phi (tank), Tôn Sách (chiến binh)
- Thổ: Điển Vi (tank), Mạnh Hoạch (chiến binh), Tào Tháo (tầm xa), Hoàng Phong Quái (tầm xa), Địa Dũng Phu Nhân (chiến binh), Thổ Địa Công (hỗ trợ), Kỳ Lân (tank)

Đội theo cốt truyện (thưởng nhẹ khi đủ): Ngũ Hổ Tướng, Đoàn thỉnh kinh, cặp Xích Bích (Chu Du + Gia Cát Lượng), bộ ba Kim Tra - Mộc Tra - Na Tra. Chưa thiết kế số liệu.
