# Godot web shell

Project Godot Engine bản thường 4.7.2 dùng GDScript và Compatibility renderer. Cảnh hiện tại đọc replay cố định từ `packages/sim`, vẽ bàn 7×5, quân, thanh trạng thái, map và trạng thái cảnh báo/hoạt động của hazard. Hoạt ảnh chiến đấu, skill và VFX hazard chi tiết thuộc mục M5G kế tiếp.

1. Cài web export template **4.7.2.stable** trong Godot Editor (Editor → Manage Export Templates).
2. Đặt `GODOT_BIN` tới executable Godot, hoặc để `godot` trên PATH.
3. Chạy `pnpm godot:replay` để xuất dữ liệu từ sim và đồng bộ asset MVP, sau đó `pnpm godot:export`.
4. Đảm bảo Vite đã dừng, rồi chạy `pnpm godot:preview` và mở `http://localhost:15173`.

Bản xuất nằm trong `godot/build/web/` và không commit. `pnpm godot:replay --check` so byte replay đã commit với dữ liệu sim hiện tại. Space tạm dừng, phím 1/2/4 đổi tốc độ, mũi tên tua 10 giây và có thể nhấp lên thanh thời gian. Server preview dùng Node sẵn có trong workspace; không thêm dependency.
