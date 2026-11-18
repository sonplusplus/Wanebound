# TASKS — việc cần làm theo mốc

Quy tắc: làm đúng một mục mỗi lần, theo thứ tự. Đọc tiêu chí nghiệm thu trước khi code. Xong thì đánh dấu `[x]` và ghi 2-3 dòng ghi chú dưới mục. Gặp luật thiếu hoặc mâu thuẫn: dừng và ghi vào `QUESTIONS.md`.

## Việc của người dùng (không giao agent)
- Ảnh nguồn đã nhận ngày 18/11/2026: `zhenyuan`, `sha_wujing`, `bull_demon`, `ne_zha`, `sun_wukong` nằm trong `assets/characters/<id>/concept.png`. Vẫn cần xử lý nền và xuất WebP để dùng trong trận.
- [ ] Dọn nền 5 ảnh còn sót (vòng tròn, mây), xuất sprite theo `art_style.md` §5 vào `packages/client/public/units/<id>/`.
- [ ] Vẽ chân dung gacha 3:4 và icon cho 5 quái.
- [ ] Vẽ texture hiệu ứng 5 hành (nền đen) và 2 nền map thử.
- [ ] Ghi sổ `prompts.md` cho từng asset (model, seed, license).
- [x] Trả lời các câu trong `QUESTIONS.md` (Q1-Q3 trước M1).

## M0 — Khởi tạo repo
- [x] pnpm workspace: `packages/sim`, `packages/client`, `packages/server` (rỗng ban đầu), `data/`, `tools/`.
- [x] TypeScript strict, Vitest, ESLint + Prettier; script gốc `test`, `typecheck`, `dev`, `sim:bot` (placeholder).
- [x] `.gitignore` (node_modules, dist, `assets/raw/`).
- [x] Tạo `data/*.json` rỗng theo schema trong `architecture.md` §4.

Ghi chú M0: Đã tạo workspace, cấu hình strict TypeScript, Vitest, ESLint và Prettier; các package và dữ liệu còn là khung rỗng theo phạm vi M0.
`pnpm install`, `pnpm test` và `pnpm typecheck` chạy qua trên máy này. pnpm dùng kho trong repo và cho phép build `esbuild`.

**Nghiệm thu:** `pnpm install && pnpm test && pnpm typecheck` chạy qua trên máy sạch.

## M1 — Lõi mô phỏng (packages/sim)
- [x] Kiểu dữ liệu và loader có validate (zod) cho `units`, `skills`, `hazards`; tạo `data/units.json`, `data/skills.json`, `data/hazards.json` từ `roster.md` và `rule.md` §7.
- [x] RNG có seed (mulberry32) kèm test.
- [x] Interface `Grid` (hex đỉnh nhọn, axial 7×5) và hàm khoảng cách hex không dùng `Math.hypot`.
- [x] Vòng lặp tick: đọc đầu tick, áp cuối tick, thứ tự đơn vị ổn định (`rule.md` §3).
- [x] Chọn mục tiêu theo nghề, di chuyển, đòn thường, công thức sát thương, hệ số khắc (`rule.md` §2-4.3).
- [x] Năng lượng và skill active; khung passive theo `trigger`; các effect `damage`, `heal`, `shield`, `taunt`, `slow`, `stat_mod`.
- [x] Hiệu ứng sinh giữa đồng đội (`rule.md` §4.4).
- [x] Viện trợ (`rule.md` §6).
- [x] Hazard 5 loại theo seed, 1–3 lần trong 60–120 giây không chồng nhau, cảnh báo 10 giây, kéo dài 6 giây (`rule.md` §7).
- [x] Điều kiện thắng và hết giờ phân định theo `damageDealt + healDone × 0,5` (`rule.md` §8).
- [x] Event log và `stateHash` mỗi 10 tick.
- [x] CLI `pnpm sim:bot -- --n 300`: lineup ngẫu nhiên, in tỉ lệ thắng theo quái, hành, nghề, thời lượng trung bình, % hết giờ, % hòa; xuất CSV.

**Nghiệm thu:**
- Chạy cùng config hai lần cho `finalHash` trùng nhau (test).
- Khắc gây ×1,20, bị khắc gây ×0,85, cùng hành ×1,00 (test).
- Viện trợ xuất hiện đúng một lần, đúng vị trí, bất tử 1,5 giây (test).
- `HazardWarn` phát ra 10 giây trước `HazardStart` (test).
- Hết giờ tính đúng công thức được chốt ở Q13 (test).
- `pnpm sim:bot -- --n 300` chạy xong và in bảng kết quả.

Ghi chú M1: Đã dựng sim xác định theo tick, 5 quái/10 skill/5 hazard, replay và golden hash; `pnpm test` (13 test), `pnpm typecheck`, `pnpm sim:bot -- --n 300` chạy qua.
Bot thử 300 trận có 98,7% hết giờ và thời lượng trung bình 179,6 giây; cần phân tích/cân bằng ở M5. Dùng zod theo kiến trúc và thêm tsx nhỏ để chạy CLI TypeScript, không đưa Node API vào sim.

## M2 — Hiển thị bàn đấu (packages/client)
- [x] Vite + React + PixiJS, bàn 7×5 co theo chiều rộng, giữ tỉ lệ 7:5.
- [x] Vẽ quân bằng hình khối màu theo hành, thanh máu, thanh năng lượng, khiên.
- [x] Hiển thị cảnh báo hazard (đếm ngược, overlay) và hazard đang chạy.
- [x] Điều khiển phát: tốc độ 1×, 2×, 4×, tạm dừng, phát lại từ event log.
- [x] Nội suy vị trí giữa hai tick.

**Nghiệm thu:** chạy một trận từ config cố định, xem mượt trên điện thoại (màn hẹp) và máy tính; phát lại cùng log cho cùng hình.

Ghi chú M2: Trang xem trận seed 42 đọc `Snapshot` từ event log, nội suy quân giữa tick, có thanh trạng thái, hazard và điều khiển phát lại; đã kiểm tra ở panel hẹp và viewport desktop 1280 px.
`pnpm test` (13 test), `pnpm typecheck` và Vite build chạy qua. React, PixiJS, Vite theo stack đã chốt; chưa tích hợp sprite và VFX (M3).

## M3 — Tích hợp art và VFX
- [ ] `tools/export_assets.py`: cắt theo thân, scale theo chiều cao thân, xuất WebP nền trong suốt.
- [ ] Nạp sprite theo `units.json`, neo ở chân, lật ngang cho phe B.
- [ ] Hoạt ảnh tween (đứng, chạy, đánh, trúng đòn, chết, viện trợ xuất hiện) theo `skill_animation.md` §5.
- [ ] Hệ thống VFX particle đọc `data/vfx.json`; làm telegraph, impact, aftermath cho 5 active và 5 hazard.
- [ ] Giới hạn hạt cho điện thoại.

**Nghiệm thu:** 5 quái hiện đúng sprite; mỗi active có hiệu ứng nhận ra được hành; hazard có overlay, hiệu ứng và dấu vết; trận chạy ổn định trên điện thoại tầm trung.

## M4 — Khung giao diện game
- [ ] Router và bố cục responsive.
- [ ] Màn chọn đội: 3 chính + 1 viện trợ, hiện hành và nghề.
- [ ] Màn đặt quân: hiện hazard, hẹn giờ, kéo thả vị trí trên nửa sân của mình, nút khóa.
- [ ] Màn kết quả.
- [ ] i18n (`vi.ts`).

**Nghiệm thu:** chơi được một trận với bot cục bộ từ chọn đội đến kết quả, trên cả điện thoại và máy tính.

## M5 — Chất lượng mô phỏng và cân bằng
- [ ] Va chạm cứng giữa các quân (không đi xuyên hoặc đứng chồng; khi bị chặn thì đứng lại đánh).
- [ ] Giảm giật khi đổi mục tiêu (trễ chọn lại).
- [ ] Chạy bot nhiều lượt, ghi báo cáo cân bằng vào `docs/balance_report.md`.
- [ ] Đề xuất chỉnh số (không tự sửa `rule.md`; gửi đề xuất để người dùng duyệt).

**Nghiệm thu:** không quân nào có tỉ lệ thắng ngoài khoảng 40-60% khi tính theo từng quái trong bot ngẫu nhiên, hoặc có ghi chú giải thích; trận trung bình kéo dài 60-150 giây.

## M6 — Vòng chơi PvE (cục bộ)
- [ ] `stages.json`, chương 1 với khoảng 10 ải và 2 boss.
- [ ] Thể lực (`rule.md` §14), không có cách mua hay rút ngắn.
- [ ] Phần thưởng, lên cấp, tiến bậc, nâng sao (`rule.md` §11-12).
- [ ] Lưu cục bộ (IndexedDB).

**Nghiệm thu:** chơi hết chương 1; chỉ số PvE nhân theo cấp và bậc, PvP dùng chỉ số chuẩn.

## M7 — Server và tài khoản
- [ ] Node server, đăng nhập, DB (SQLite khi dev).
- [ ] Server chạy `sim` để quyết định kết quả; client chỉ gửi lựa chọn.
- [ ] Lưu đội phòng thủ, PvP bất đồng bộ (`architecture.md` §5).
- [ ] Log trận và bản phát lại.

**Nghiệm thu:** hai tài khoản đánh nhau bất đồng bộ; kết quả giống hệt khi phát lại; client không gửi kết quả trận.

## M8 — PvP realtime
- [ ] WebSocket phòng đấu, các pha trước trận có hẹn giờ, commit-reveal vị trí.
- [ ] Hàng đợi và ghép trận theo rating (Glicko-2).
- [ ] Xử lý mất kết nối.

**Nghiệm thu:** hai trình duyệt đánh nhau realtime từ ghép trận đến kết quả; vị trí không lộ trước khi tiết lộ.

## M9 — Gacha và kinh tế
- [ ] Banner, tỉ lệ, pity, hành vượng xoay vòng (`rule.md` §12).
- [ ] Sổ cái tiền tệ và log từng lượt quay trên server.
- [ ] Cửa hàng Chiến công.

**Nghiệm thu:** thống kê 10.000 lượt giả lập khớp tỉ lệ công bố; pity cứng luôn chạy đúng.

## M10 — Mở rộng nội dung
- [ ] Roster lên 15 rồi 30 quái; thêm map PvP; chương PvE 2.
- [ ] Quy trình thêm quái mới (dữ liệu + art + VFX) ghi thành hướng dẫn ngắn.

## M11 — Chuẩn bị phát hành
- [ ] **Cổng G1:** vẽ lại asset bằng model có license thương mại rõ ràng (`art_style.md` §8).
- [ ] Bảo mật, giới hạn tần suất, kiểm tra đầu vào, kiểm thử trên điện thoại thật.
- [ ] Triển khai và theo dõi chi phí hạ tầng.
- [ ] Điều khoản dịch vụ, chính sách riêng tư.
