# Quyết định chuyển client web sang Godot — 20/11/2026

## Quyết định

- Dùng Godot Engine bản thường và GDScript để làm client mới, xuất lên web. Người chơi mở bằng trình duyệt, không cần cài app.
- Ưu tiên trình duyệt máy tính; trình duyệt điện thoại là bước tối ưu và nghiệm thu sau. Chưa chuyển mục tiêu sang bản Android/iOS native.
- Giữ `packages/sim` TypeScript và `data/*.json` làm nguồn luật, kết quả và dữ liệu. Client Godot nhận snapshot/event để hiển thị, không tự quyết định sát thương, mục tiêu hay thắng thua.
- Giữ `packages/client` PixiJS/React để so sánh và tra cứu trong quá trình chuyển. Chỉ bỏ khi luồng Godot được nghiệm thu; không diễn giải các mục client đã đánh dấu xong là đã hoàn thành trong Godot.
- Cổng preview web local cố định là `http://localhost:15173`. Khi thử Godot, dừng Vite trước để tránh trùng cổng. Bản web xuất ra sẽ được phục vụ qua HTTP local, không mở trực tiếp bằng `file://`.

## Vì sao chuyển

Bản web hiện tại chưa đạt chất lượng chuyển động nhân vật và độ rõ của skill theo đánh giá của người dùng. Godot cung cấp editor để dựng cảnh, timeline animation và VFX trực quan hơn. Chuyển engine không tự sửa được ảnh nguồn tĩnh, sprite còn nền và VFX thiếu texture; chất lượng asset vẫn là phần việc M3.

## Rà lại các mốc cũ

| Mốc | Kế thừa | Việc cần làm trong Godot |
|---|---|---|
| M0 | Workspace, công cụ kiểm tra, dữ liệu | Thêm project Godot và quy trình xuất web; không thay cấu trúc sim. |
| M1 | Sim xác định, loader, event, replay, bot | Định dạng dữ liệu truyền từ TypeScript sang Godot; so khớp tick, event và kết quả. Không port luật sang GDScript. |
| M2 | Bàn hex, snapshot, nội suy, replay | Dựng lại bàn và bộ điều khiển phát trong Godot. |
| M3 | Concept, WebP thử, hai map, mô tả VFX | Dựng lại animation/skill/hazard; dọn hoặc vẽ lại asset, đánh giá trực quan ở 1×. Việc chưa nghiệm thu vẫn mở. |
| M4 | Luồng chọn đội → đặt quân → trận → kết quả; chữ Việt | Dựng lại UI sau khi cảnh chiến đấu đạt yêu cầu; kiểm tra luồng trên trình duyệt. |
| M5 | Va chạm, đường đi, cân bằng trong sim | Giữ nguyên sim; kiểm tra Godot hiển thị đúng vị trí và không gây cảm giác chồng quân. Tiêu chí thời lượng trận vẫn chưa đạt. |
| M6–M11 | Kế hoạch nội dung/server/kinh tế | Chỉ bắt đầu sau mốc chuyển client; cập nhật điểm tích hợp Godot khi tới từng mốc. |

## Thứ tự triển khai

Theo `TASKS.md`: (1) project và bản xuất web tối thiểu tại cổng 15173; (2) truyền một replay cố định từ sim và dựng bàn; (3) làm một trận mẫu có animation, active và hazard đủ rõ để so với bản hiện tại; (4) chuyển UI và luồng chơi; (5) kiểm tra trình duyệt máy tính, rồi trình duyệt điện thoại. Mỗi lần làm một mục và nghiệm thu trước khi sang mục kế.

## Điểm kỹ thuật cần chốt trong lúc làm

- Godot web không nhập trực tiếp `packages/sim` TypeScript. Mốc replay đầu dùng dữ liệu xuất từ sim; trước khi chuyển luồng chơi tương tác phải xác định giao tiếp với sim/server mà vẫn giữ server quyết định kết quả trận.
- Kiểm tra dung lượng tải, thời gian khởi động, FPS và khả năng hiển thị trên trình duyệt máy tính trước; đo lại trên điện thoại sau. Không mặc định bản Godot sẽ nhanh hơn PixiJS.
- Dùng Godot renderer tương thích web và GDScript; tránh phụ thuộc .NET/C# cho client web.
