# Báo cáo cân bằng M5 — 19/11/2026

## Phạm vi

Chạy `pnpm sim:bot -- --n 300 --out reports/m5-bot-300.csv` với rule v0.4.5.
Bot chọn ngẫu nhiên 3 quân chính và 1 viện trợ từ 5 quái, vị trí cố định đối xứng, seed RNG cố định. Mỗi quân được ghi nhận là thắng nếu phe chứa quân đó thắng; trận hòa không tính là thắng. Vì đội hình có 4/5 quái, các tỉ lệ của từng quái có tương quan mạnh và chưa phản ánh tác động riêng của quái.

| Quái | Số lượt xuất hiện | Thắng |
|---|---:|---:|
| Ngưu Ma Vương | 478 | 46,4% |
| Na Tra | 491 | 46,6% |
| Sa Tăng | 481 | 56,5% |
| Tôn Ngộ Không | 474 | 47,9% |
| Trấn Nguyên Đại Tiên | 476 | 50,0% |

Theo hành: Thổ 46,4%, Hỏa 46,6%, Kim 47,9%, Thủy 56,5%, Mộc 50,0%.
Theo nghề: chiến binh 47,0%, tank 56,5%, hỗ trợ 50,0%. Roster chưa có tầm xa hoặc sát thủ, nên chưa thể đo hai nghề đó.

Thời lượng trung bình **176,7 giây**; **91,7%** trận hết giờ; **1,0%** hòa. Tỉ lệ từng quái nằm trong mục tiêu 40–60%, nhưng thời lượng không đạt mục tiêu 60–150 giây. Kết quả gần mốc 180 giây cho thấy đội thường không hạ hết đối phương. Số liệu này chưa đủ để kết luận quái nào mạnh yếu vì cỡ mẫu nhỏ và cách ghép đội của bot.

## Đề xuất cần duyệt

Ưu tiên giảm thời lượng bằng một phép thử có kiểm soát: tăng **ATK chuẩn của cả 5 quái thêm 25%**, giữ nguyên HP, DEF, ASPD và mốc 180 giây; chạy lại 300–1.000 trận, kiểm tra thời lượng và tỉ lệ từng quái. Đây là **đề xuất thử nghiệm**, chưa thay `docs/rule.md` hoặc `data/units.json`. Nếu vẫn quá dài, thử tiếp một mức cao hơn theo kết quả; nếu lệch thắng quá 40–60%, điều chỉnh riêng sau. Chưa nên đổi nhiều tham số cùng lúc vì khó xác định nguyên nhân.

## Giới hạn

- Bot dùng vị trí cố định, không đại diện cho chiến thuật đặt quân của người chơi.
- Chưa kiểm tra trên điện thoại tầm trung thật; hiệu năng art M3 vẫn chưa nghiệm thu.
- File CSV của lượt chạy nằm ở `reports/m5-bot-300.csv`.
