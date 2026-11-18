# prompts.md — sổ prompt và license

Mỗi asset một mục. Ghi đủ để vẽ lại được và để chứng minh nguồn gốc.

Mẫu:
```
## <id> — <tên>
- Loại: sprite | portrait | icon | vfx | map
- Nền tảng và model: (tên, phiên bản)
- License tại thời điểm dùng: (ghi rõ, kèm đường dẫn trang model)
- Seed / CFG / steps / sampler / khổ:
- Prompt:
- Prompt âm:
- Ngày:
- Ghi chú (ảnh tham chiếu, chỉnh tay):
```

Lưu ý: ảnh tạo bằng model có nêu tên trong promp wukong hoặc model có điều khoản cấm thương mại là **bản thử**, phải vẽ lại trước khi phát hành (cổng G1 trong `art_style.md` §8).

## Ảnh concept người dùng cung cấp cho M3 (18/11/2026)
- `zhenyuan`, `sha_wujing`, `bull_demon`, `ne_zha`, `sun_wukong`: ảnh PNG do người dùng gửi, lưu ở `assets/characters/<id>/concept.png`.
- Model, seed, prompt đầy đủ và license thương mại của các ảnh này chưa được xác nhận; WebP xuất bởi `tools/export_assets.py` chỉ dùng thử trong game, chưa qua cổng G1.

## sun_wukong — Tôn Ngộ Không (ảnh neo)
- Prompt: 
- Model, seed, CFG, khổ: WAI-illustrious-SDXL, seed 

## zhenyuan — Trấn Nguyên Đại Tiên
```
masterpiece, best quality, newest, absurdres, highres, 1boy, male focus, solo, adult, masculine, full body, standing, looking at viewer, zhenyuan daxian, taoist sage, long black hair, topknot, jade hairpin, calm gentle expression, visible face, dark green robe, gold trim, holding wooden staff, glowing green orb, 2d anime cel shading, bold black outlines, flat color, clean lineart, chinese guofeng aesthetic, ornate cloud pattern on clothing, light grey gradient background, large pale moon circle, stylized white clouds, limited palette of black, white and green
```

## sha_wujing — Sa Tăng
```
masterpiece, best quality, newest, absurdres, highres, 1boy, male focus, solo, adult, masculine, full body, standing, looking at viewer, sha wujing, bald monk, broad shoulders, thick neck, bulky muscular build, barrel chest, stocky hulking frame, short beard, prayer bead necklace, dark blue and black monk robe, thick heavy armor plates, silver trim, holding long wooden polearm taller than character, crescent-shaped blade on top end, flat moon-shaped spade blade on bottom end, stern expression, 2d anime cel shading, bold black outlines, flat color, clean lineart, chinese guofeng aesthetic, ornate cloud pattern on clothing, light grey gradient background, large pale moon circle, stylized white clouds, limited palette of black, white and blue
```

## ne_zha — Na Tra
```
masterpiece, best quality, newest, absurdres, highres, 1boy, male focus, solo, (male:1.4), nezha third prince, teenager boy, short messy silver hair, red hairband, fitted red and gold armor covering chest, red sash at waist, gold cosmic ring bracelets, two spinning discs of swirling fire beneath feet, holding flaming-tip spear, flames at spearhead, fierce confident smirk, 2d anime cel shading, bold black outlines, flat color, clean lineart, chinese guofeng aesthetic, ornate cloud pattern, light grey gradient background, large pale moon circle, stylized white clouds, limited palette of black, white and red-orange
```

## bull_demon — Ngưu Ma Vương
```
masterpiece, best quality, newest, absurdres, highres, 1boy, male focus, solo, adult, masculine, full body, standing, looking at viewer, bull demon king, tan brown skin, reddish-brown bull head, large curved bull horns, bull nose ring, thick bull-like neck, broad muscular build, heavy dark brown armor, thick cape, holding massive iron rod weapon, stern commanding expression, 2d anime cel shading, bold black outlines, flat color, clean lineart, chinese guofeng aesthetic, ornate cloud pattern on clothing, light grey gradient background, large pale moon circle, stylized white clouds, limited palette of black, white and earth yellow
```

## Prompt âm dùng chung
```
1girl, girl, female, breasts, loli, child, chibi, lowres, worst quality, low quality, bad anatomy, bad hands, extra fingers, text, watermark, signature, logo, 3d, realistic, photorealistic, painterly, blurry, multiple characters, frame, border, dark background, black background, vignette
```
