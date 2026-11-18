# Architecture — kiến trúc kỹ thuật

## 1. Cấu trúc repo
```
ngu-hanh/
  AGENTS.md  CLAUDE.md
  docs/
  data/            units.json skills.json hazards.json maps.json vfx.json stages.json banners.json progression.json
  tools/           export_assets.py (xóa nền, cắt, scale, xuất WebP)
  assets/
    characters/<id>/  concept.png và nguồn nhân vật (commit)
    vfx/              texture hiệu ứng kỹ năng
    hazards/          texture/overlay thiên tai
    maps/             nền bản đồ
    ui/               hình giao diện dùng chung
  packages/
    sim/           lõi chiến đấu, TypeScript thuần
    client/        Vite + React + PixiJS
      public/units/<id>/  portrait.webp battle.webp icon.webp
      public/vfx/  public/maps/
      src/
    server/        Node + WebSocket + DB
```

## 2. Lõi mô phỏng (packages/sim)
API chính:
```ts
createMatch(config: MatchConfig): MatchState
step(state: MatchState): void              // 1 tick, thay đổi state tại chỗ
runToEnd(config: MatchConfig): MatchResult // chạy hết trận, trả log và kết quả
```
`MatchConfig`: `{ seed, lineupA, lineupB, mode: 'pvp' | 'pve', version }`. PvP chọn map và 1–3 hazard bằng seed trên server.
`MatchResult`: `{ mapId, winner: 'A'|'B'|'draw', reason, ticks, score: {A,B}, events, hashes, finalHash }`, với `score` gồm `damageDealt` và `healDone` theo `rule.md` §8.

### Xác định (determinism) — bắt buộc
- Chỉ dùng RNG có seed (mulberry32). Cấm `Date.now`, `Math.random`.
- Cấm `Math.hypot`, `Math.sin/cos/atan2` và mọi hàm có thể khác nhau giữa môi trường. Chỉ dùng `+ - * /`, `Math.sqrt`, `Math.floor/round/min/max`.
- Khuyến nghị lưu vị trí và HP dạng số nguyên cố định (vị trí theo 1/1000 ô, sát thương làm tròn xuống) để tránh sai số dấu phẩy động.
- Thứ tự xử lý đơn vị cố định (theo id). Đọc đầu tick, áp cuối tick (rule.md §3).
- Mỗi 10 tick sinh `stateHash`. Test: chạy cùng cấu hình hai lần, hash phải trùng; có golden replay trong `packages/sim/test/golden/`.
- `version` của luật ghi vào mọi bản phát lại. Đổi luật thì tăng version.

### Sự kiện (events)
Sim phát sự kiện theo tick để client hiển thị và để phát lại:
`Move`, `Attack`, `Cast`, `Damage`, `Heal`, `ShieldGain`, `Death`, `ReinforcementSpawn`, `HazardWarn`, `HazardStart`, `HazardEnd`, `MatchEnd`, `Snapshot`.
Mỗi sự kiện có `tick` và các id liên quan. Phát lại = `config` + `seed` + `version`, chạy lại sim.

## 3. Client
- PixiJS vẽ bàn đấu từ snapshot (nội suy giữa 2 tick), React làm giao diện (chọn đội, đặt quân, gacha, cửa hàng).
- Hiển thị tách khỏi logic: client không tự tính sát thương.
- Hoạt ảnh nhân vật bằng tween trên sprite tĩnh; hiệu ứng skill và hazard bằng particle theo `data/vfx.json` (xem `skill_animation.md`).
- Responsive: bàn đấu co theo chiều rộng, giữ tỉ lệ 7:5.
- Chữ hiển thị nằm trong `src/i18n/vi.ts`.

## 4. Schema dữ liệu (data/*.json, validate bằng zod khi nạp)
```ts
type Element = 'metal'|'wood'|'water'|'fire'|'earth';
type Role = 'tank'|'warrior'|'archer'|'mage'|'support';

interface UnitDef {
  id: string; name: string; element: Element; role: Role;
  rarity: 'R'|'SR'|'SSR'|'UR';
  stats: { hp: number; atk: number; def: number; spd: number; range: number; aspd: number };
  passive: string; active: string;                 // id trong skills.json
  art: { portrait: string; battle: string; icon: string };
}

interface SkillDef {
  id: string; kind: 'active'|'passive'; name: string;
  trigger?: { when: 'always'|'self_hp_below'|'target_hp_below'|'interval'|'adjacent_enemies_min'; value?: number };
  effects: Effect[];
  vfx?: string;                                     // id trong vfx.json
}

type Area = 'target' | { radius: number; around: 'target'|'self' };
type Effect =
  | { type: 'damage'; mult: number; area: Area }
  | { type: 'heal'; pct: number; target: 'lowest_ally'|'all_allies'|'self' }
  | { type: 'shield'; pct: number; duration: number }
  | { type: 'taunt'; duration: number; radius: number }
  | { type: 'slow'; pct: number; duration: number; area: Area }
  | { type: 'stat_mod'; stat: 'atk'|'def'|'spd'|'range'|'aspd'; pct: number; duration?: number }
  | { type: 'damage_bonus'; pct: number }
  | { type: 'basic_damage_reduction'; pct: number };
```
Ví dụ `units.json` (một phần tử):
```json
{ "id": "sun_wukong", "name": "Tôn Ngộ Không", "element": "metal", "role": "warrior",
  "rarity": "SSR",
  "stats": { "hp": 3000, "atk": 78, "def": 20, "spd": 2.4, "range": 1, "aspd": 1.1 },
  "passive": "huo_yan_jin_jing", "active": "jin_gu_bang",
  "art": { "portrait": "units/sun_wukong/portrait.webp", "battle": "units/sun_wukong/battle.webp", "icon": "units/sun_wukong/icon.webp" } }
```
`hazards.json`, `maps.json`, `stages.json`, `banners.json`, `progression.json`, `vfx.json` theo cùng cách: mỗi file là mảng đối tượng có `id`, schema đặt cạnh loader trong sim. Hazard có `target: 'all'` cho Sân băng; thiếu trường này mặc định chỉ tác động lên hành bị khắc. Map PvP có `effect` loại `damage_mod` hoặc `heal_mod`, áp dụng đồng đều cho hai đội. Hai effect cuối phục vụ passive trong roster; `adjacent_enemies_min` có thêm `radius`.

## 5. Server (M7 trở đi)
- Server quyết định mọi kết quả: client gửi lựa chọn (đội, vị trí), không bao giờ gửi kết quả trận.
- Bất đồng bộ: `POST /pvp/async/attack` với lineup tấn công ⇒ server lấy bản chụp phòng thủ, chạy `runToEnd`, lưu kết quả và trả events.
- Realtime (WebSocket): `join_queue`, `match_found`, `pick_main`, `pick_reinforcement_and_deploy` (commit), `reveal`, `events` (theo lô), `result`. Đặt quân dùng commit-reveal: server giữ vị trí hai bên đến khi cả hai khóa hoặc hết giờ.
- Lưu trữ: SQLite khi dev, Postgres khi triển khai. Bảng chính: `users`, `owned_units`, `lineups`, `matches`, `gacha_log`, `currency_ledger`.
- Gacha chạy trên server với RNG riêng, ghi log từng lượt (kết quả, pity trước và sau).
- Kiểm tra: lineup chỉ dùng quái người chơi sở hữu, giới hạn tần suất gọi API, từ chối đội hình không hợp lệ.

## 6. Kiểm thử
- Vitest. Bắt buộc: test xác định, test công thức sát thương, test ngũ hành, test viện trợ, test hazard, test điều kiện thắng, golden replay.
- `pnpm sim:bot` chạy hàng trăm trận ngẫu nhiên và in tỉ lệ thắng theo quái, hành, nghề (công cụ cân bằng).

## 7. Triển khai
- Làm việc local trước. Gói AWS Free mới là gói dùng thử có thời hạn (credit và sáu tháng), nên chỉ đưa server lên khi sắp cần nhiều người thử. Đặt cảnh báo chi phí ngay khi tạo tài khoản.
