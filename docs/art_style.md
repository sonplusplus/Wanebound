# Art Style v0.2 — Guofeng-anime

Rule-set cố định để dán vào prompt khi nhờ AI (SeaArt / Civitai / local) vẽ quái mới, giữ phong cách đồng nhất xuyên suốt roster.

## 1. Hướng phong cách
- Anime 2D cel-shaded, nét đen dày đều, màu phẳng; "chất Hoa phong" đẩy vào họa tiết mây, hoa văn trang phục, vũ khí.
- Ảnh neo (mẫu chuẩn): **Tôn Ngộ Không** (trắng, đen, vàng). Các quái khác kéo về cùng gu này.
- Quy tắc màu: **đen + trắng + một màu theo hành**, màu điểm tối đa một.
- Đọc rõ ở kích thước nhỏ trên web responsive.

## 2. Bảng màu theo hành
| Hành | Màu chủ đạo | Màu điểm |
|---|---|---|
| Kim | trắng bạc / vàng kim loại | xám ánh kim |
| Mộc | xanh lá | nâu gỗ |
| Thủy | xanh dương / đen | bạc ánh nước |
| Hỏa | đỏ / cam | vàng lửa |
| Thổ | nâu / vàng đất | xanh rêu nhạt |

## 3. Style lock

### 3.1 Dạng tag (checkpoint họ SDXL anime như NoobAI/Illustrious) — dán sau dòng nhân vật
```
masterpiece, best quality, newest, absurdres, highres, 1boy, male focus, solo, adult, masculine, full body, standing, looking at viewer, [NHÂN VẬT], 2d anime cel shading, bold black outlines, flat color, clean lineart, chinese guofeng aesthetic, ornate cloud pattern on clothing, light grey gradient background, large pale moon circle, stylized white clouds, limited palette of black, white and [MÀU HÀNH]
```
Prompt âm dùng chung:
```
1girl, girl, female, breasts, loli, child, chibi, lowres, worst quality, low quality, bad anatomy, bad hands, extra fingers, text, watermark, signature, logo, 3d, realistic, photorealistic, painterly, blurry, multiple characters, frame, border, dark background, black background, vignette, silhouette
```
Thiết lập đã dùng được: khổ 3:4 hoặc 2:3, CFG khoảng 5,5, 25-28 steps, Euler a, một ảnh mỗi lần thử rồi chọn.

### 3.2 Dạng văn xuôi (model đọc câu tốt như Z Image Turbo)
```
2D anime cel-shaded illustration with Chinese guofeng aesthetic influence. Bold black outlines, flat colors, limited palette of black, white and one accent color. Chinese mythological ornament such as clouds and dragon motifs. Mythic, ancient, slightly stylized, not chibi. Single character, no text, no watermark.
```

## 4. Bài học đã rút ra
- Từ "silhouette" trong prompt làm mặt nhân vật thành bóng đen: không dùng, thêm vào prompt âm.
- "Vines", "ornament" dễ tạo khung viền quanh ảnh: ghi rõ `no frame, no border`.
- Model họ NoobAI/Illustrious mặc định ra nhân vật nữ: luôn đặt `1boy, male focus` đầu prompt và `1girl, female` vào prompt âm.
- Nền tối làm nhân vật lẫn vào nền: dùng nền sáng.
- Với sprite, vẽ nền trơn trắng (không trăng, không mây) để xóa nền sạch.

## 5. Quy cách asset
| Loại | Cách vẽ | Xuất |
|---|---|---|
| Sprite trong trận | toàn thân, đứng, nhìn sang phải, nền trơn trắng, tỉ lệ 2:3 (khoảng 832×1216) | WebP nền trong suốt, chiều cao thân khoảng 512 px, chân chạm đáy ảnh |
| Chân dung gacha | nửa người, góc 3/4, tỉ lệ 3:4 (khoảng 896×1152) | WebP |
| Icon | cắt vuông từ chân dung | 128×128 WebP |
| Texture hiệu ứng | vẽ trên nền đen, phát sáng | WebP, trộn cộng (additive) trong game |
| Nền map | AI vẽ nền khớp layout ô | WebP, 3:2 hoặc theo tỉ lệ bàn |

Quy tắc xuất sprite: scale theo **chiều cao thân** để các quái cùng cỡ, vũ khí dài được phép vượt khung; neo ở chân; quân phe B lật ngang trong code.

## 6. Quy trình tạo quái mới
1. Chọn dòng nhân vật (tên, nghề, vũ khí, màu hành); nghề quyết định vũ khí và dáng (tank khiên/giáp nặng, chiến binh kiếm/gậy, tầm xa cung/ám khí/trượng/quạt, sát thủ vũ khí gọn, hỗ trợ gậy/bầu).
2. Ghép style lock + prompt âm, cùng model, CFG và khổ ảnh với ảnh neo.
3. Tạo 2-4 ảnh, chọn ảnh gần ảnh neo nhất. Nếu có Fixed Seed hoặc ảnh tham chiếu, dùng để kéo về cùng gu.
4. Ghi vào `prompts.md`: model, phiên bản, seed, CFG, khổ, prompt đầy đủ, license, ngày.
5. Ảnh người dùng cung cấp lưu ở `assets/characters/<id>/concept.png`; xóa nền (rembg hoặc công cụ của nền tảng), dọn bằng Krita, xuất theo bảng ở mục 5 vào `packages/client/public/units/<id>/`.
   Bản thử M3 dùng `tools/export_assets.py` với Pillow trong `.venv` để xóa vùng trắng nối biên; mây/trăng khép kín và viền trắng quanh nét vẫn cần dọn tay. Portrait/icon xuất từ concept chỉ là placeholder.
6. Chạy checklist mục 7.

## 7. Checklist đồng nhất (chạy sau mỗi 5 quái mới)
- [ ] Cùng độ dày nét viền?
- [ ] Cùng khung hình (toàn thân cho sprite, nửa người 3/4 cho chân dung)?
- [ ] Màu đúng bảng hành, tối đa một màu điểm?
- [ ] Không lệch sang chibi, tả thực hoặc truyện tranh phương Tây (đổ bóng nặng)?
- [ ] Nền đã xóa sạch, không sót vòng tròn hay mây?
- [ ] Vũ khí đúng nghề?

## 8. Cổng phát hành G1 (bắt buộc trước khi ra mắt)
Một số model anime phổ biến có điều khoản cấm hoặc không rõ quyền thương mại (ví dụ NoobAI cấm thương mại hóa cả sản phẩm do model tạo). Ảnh hiện có là **bản thử**. Trước khi phát hành:
1. Chọn checkpoint có license cho phép dùng thương mại, đọc kỹ điều khoản của chính phiên bản đó.
2. Vẽ lại toàn bộ asset bằng model đó từ cùng prompt.
3. Không dùng ảnh sinh từ model cấm thương mại để huấn luyện LoRA cho bản phát hành.
4. Lưu sổ model, phiên bản, license, ngày trong `prompts.md`.
