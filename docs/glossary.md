# Glossary — thuật ngữ và tên định danh

Dùng đúng các tên này trong code, dữ liệu và tên file.

| Tiếng Việt | Định danh | Ghi chú |
|---|---|---|
| Kim / Mộc / Thủy / Hỏa / Thổ | `metal` / `wood` / `water` / `fire` / `earth` | enum `Element` |
| Tương sinh | `generate` | metal → water → wood → fire → earth → metal |
| Tương khắc | `counter` | metal → wood → earth → water → fire → metal |
| Nghề | `role` | `tank` `warrior` `archer` `mage` `support` |
| Quái / tướng / champ | `unit` | định nghĩa trong data là `UnitDef`, thể hiện trong trận là `UnitState` |
| Viện trợ | `reinforcement` | ô thứ 4 của đội, xuất hiện khi quân chính đầu tiên chết. KHÁC với nghề hỗ trợ |
| Hỗ trợ (nghề) | `support` | nghề hồi máu và buff |
| Đội hình | `lineup` | 3 quái chính + 1 viện trợ + vị trí |
| Đặt quân | `deployment` | bước đặt vị trí trước trận |
| Trận | `match` | |
| Hazard (thiên tai ngũ hành) | `hazard` | chỉ có trong PvP |
| Ải / chương | `stage` / `chapter` | PvE |
| Cấp / bậc / sao | `level` / `tier` / `star` | sao đến từ quái trùng |
| Độ hiếm | `rarity` | `R` `SR` `SSR` `UR` |
| Vàng | `gold` | tiền lên cấp |
| Linh thạch | `spiritStone` | tiền quay gacha |
| Hồn phách | `soulShard` | từ quái trùng, dùng nâng sao |
| Tinh hoa (ngũ hành) | `essence` | 5 loại theo hành, dùng tiến bậc |
| Chiến công | `honor` | tiền thưởng PvP |
| Thể lực | `stamina` | giới hạn PvE |
| Lực chiến | `powerRating` | chỉ để ghép trận và hiển thị, không ảnh hưởng chiến đấu |
| Tick | `tick` | 0,1 giây |
| Seed | `seed` | số nguyên 32 bit cho RNG |

## Id quái (snake_case)
`sun_wukong`, `zhenyuan`, `sha_wujing`, `ne_zha`, `bull_demon`. Quái mới đặt theo tên tiếng Anh/pinyin, không dấu.

## Id file art
`units/<id>/portrait.webp`, `units/<id>/battle.webp`, `units/<id>/icon.webp`.
