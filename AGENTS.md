# Ngũ Hành Chiến — hướng dẫn cho coding agent

Game web tactical thời gian thực: người chơi chọn đội (3 quái chính + 1 viện trợ) và đặt quân, sau đó quái tự đánh trên bàn 7x5. Hệ ngũ hành (sinh/khắc) kết hợp nghề (tank, chiến binh, tầm xa, sát thủ, pháp sư, hỗ trợ). Bối cảnh Tây Du, sau mở rộng sang Hồng Hoang. Free-to-play, không bán sức mạnh.

## Đọc theo thứ tự
1. `docs/glossary.md` (thuật ngữ và tên định danh trong code)
2. `docs/rule.md` (luật game, nguồn sự thật duy nhất cho số liệu)
3. `docs/architecture.md` (cấu trúc kỹ thuật, schema dữ liệu)
4. `docs/roster.md` (dữ liệu quái)
5. `docs/TASKS.md` (việc cần làm, theo mốc)

`docs/design.md`, `docs/art_style.md`, `docs/skill_animation.md` đọc khi việc liên quan tới tầm nhìn, art hoặc hiệu ứng.

## Cách làm việc
- Mỗi lần chỉ làm MỘT mục trong `docs/TASKS.md`, theo thứ tự. Đọc tiêu chí nghiệm thu trước khi code.
- Xong việc: chạy `pnpm test` và `pnpm typecheck`, đánh dấu `[x]` trong TASKS.md, thêm 2-3 dòng ghi chú dưới mục đó.
- Thấy luật mâu thuẫn hoặc thiếu: DỪNG, ghi câu hỏi vào `docs/QUESTIONS.md` và hỏi người dùng. Không tự bịa số liệu cân bằng. Nếu buộc phải đặt tạm, ghi `TODO(balance)` trong code và liệt kê trong QUESTIONS.md.
- Không sửa `docs/rule.md` khi chưa được người dùng đồng ý.
- Giữ thay đổi nhỏ, commit theo từng mục TASKS.

## Stack
Node LTS, pnpm workspaces, TypeScript strict, Vitest. Lõi mô phỏng: `packages/sim`. Client đích: Godot Engine bản thường, GDScript, xuất web; ưu tiên trình duyệt máy tính rồi trình duyệt điện thoại. Client Vite + React + PixiJS hiện có là bản thử để đối chiếu trong quá trình chuyển dịch. Server: Node + WebSocket (thư viện chốt ở M7). Chi tiết: `docs/architecture.md` và `docs/godot-migration.md`.

## Chuyển dịch Godot
- Làm từng mục theo mốc Godot trong `docs/TASKS.md`; giữ lịch sử M0–M5 và không coi các dấu `[x]` của client PixiJS là nghiệm thu cho Godot.
- Godot chỉ hiển thị trận từ dữ liệu/event do sim hoặc server tạo; không viết lại luật chiến đấu trong GDScript.
- Preview web local dùng `http://localhost:15173`; không để Vite và preview Godot chiếm cổng này cùng lúc.

## Lệnh
`pnpm install` · `pnpm dev` · `pnpm test` · `pnpm typecheck` · `pnpm sim:bot -- --n 300`

## Quy tắc bắt buộc cho packages/sim
- TypeScript thuần: không import DOM, Pixi hay Node API; không dùng `Date.now`, `Math.random`, `Math.hypot`, hàm lượng giác.
- Ngẫu nhiên chỉ qua RNG có seed. Cùng phiên bản + cùng seed + cùng đội hình ⇒ cùng kết quả từng tick (có test).
- Số liệu quái, skill, hazard, màn chơi nằm trong `data/*.json` và được validate khi nạp. Không viết cứng trong code.
- Server quyết định kết quả trận; client chỉ hiển thị.

## Quy ước
- Tên định danh tiếng Anh theo `docs/glossary.md`. Chữ hiển thị tiếng Việt đặt trong `packages/client/src/i18n/vi.ts`.
- Không commit `assets/raw/`. Ảnh xuất cho game nằm ở `packages/client/public/`.
- Không thêm thư viện lớn khi chưa nêu lý do trong ghi chú của mục TASKS.
