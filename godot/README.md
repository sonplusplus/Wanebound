# Godot web shell

Project tối thiểu cho Godot Engine bản thường 4.7.2, dùng GDScript và Compatibility renderer. Đây chỉ là màn khung; replay, bàn đấu, quân, skill và hazard thuộc các mục M5G tiếp theo.

1. Cài web export template **4.7.2.stable** trong Godot Editor (Editor → Manage Export Templates).
2. Đặt `GODOT_BIN` tới executable Godot, hoặc để `godot` trên PATH.
3. Chạy `pnpm godot:export` ở thư mục repo.
4. Đảm bảo Vite đã dừng, rồi chạy `pnpm godot:preview` và mở `http://localhost:15173`.

Bản xuất nằm trong `godot/build/web/` và không commit. Server preview dùng Node sẵn có trong workspace; không thêm dependency. `packages/sim` không tham gia màn khung này.
