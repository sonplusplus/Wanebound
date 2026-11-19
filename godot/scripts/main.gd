extends Control

const BOARD := Rect2(86, 126, 1108, 500)
const TICK_RATE := 10.0
const COLORS := {"metal": Color("aab2c0"), "wood": Color("3f9d5b"), "water": Color("3b7fd8"), "fire": Color("e4572e"), "earth": Color("b98a48")}
const HAZARD_NAMES := {"sword_rain": "Mưa kiếm", "vines": "Dây leo", "flood": "Nước lũ", "wildfire": "Hỏa hoạn", "sandstorm": "Bão cát", "ice_field": "Sân băng"}
const HAZARD_ELEMENTS := {"sword_rain": "metal", "vines": "wood", "flood": "water", "wildfire": "fire", "sandstorm": "earth", "ice_field": "water"}

var replay: Dictionary = {}
var definitions: Dictionary = {}
var sprites: Dictionary = {}
var map_texture: Texture2D
var playhead := 0.0
var speed := 1.0
var playing := true
var load_error := ""


func _ready() -> void:
	var file := FileAccess.open("res://replay/fixed_match.json", FileAccess.READ)
	if file == null:
		load_error = "Không mở được replay. Chạy pnpm godot:replay."
		return
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if not parsed is Dictionary or parsed.get("schema") != 1:
		load_error = "Định dạng replay không hợp lệ."
		return
	replay = parsed
	for definition in replay["units"]:
		definitions[definition["id"]] = definition
		sprites[definition["id"]] = load("res://assets/units/%s/battle.webp" % definition["id"])
	map_texture = load("res://assets/maps/%s.png" % replay["mapId"])
	queue_redraw()


func _process(delta: float) -> void:
	if not playing or replay.is_empty():
		return
	playhead = minf(playhead + delta * TICK_RATE * speed, float(replay["ticks"]))
	if playhead >= float(replay["ticks"]):
		playing = false
	queue_redraw()


func _unhandled_input(event: InputEvent) -> void:
	if replay.is_empty():
		return
	if event is InputEventKey and event.pressed and not event.echo:
		match event.keycode:
			KEY_SPACE: playing = not playing
			KEY_1: speed = 1.0
			KEY_2: speed = 2.0
			KEY_4: speed = 4.0
			KEY_LEFT: playhead = maxf(0.0, playhead - 100.0)
			KEY_RIGHT: playhead = minf(float(replay["ticks"]), playhead + 100.0)
			KEY_HOME: playhead = 0.0
		queue_redraw()
	elif event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		if event.position.y >= 660.0 and event.position.x >= 286.0 and event.position.x <= 1126.0:
			playhead = clampf((event.position.x - 286.0) / 840.0, 0.0, 1.0) * float(replay["ticks"])
			queue_redraw()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("08111b"))
	if not load_error.is_empty():
		text(load_error, Vector2(70, 120), 25, Color("ffb5a3"))
		return
	if replay.is_empty():
		return
	var tick := mini(int(floor(playhead)), int(replay["ticks"]))
	var frames: Array = replay["frames"]
	var current: Dictionary = frames[tick]
	var next: Dictionary = frames[mini(tick + 1, frames.size() - 1)]
	var next_by_id := {}
	for unit in next["units"]:
		next_by_id[unit["id"]] = unit
	draw_map()
	draw_grid()
	draw_hazard(tick, false)
	draw_units(current["units"], next_by_id, playhead - float(tick), tick)
	draw_header(tick)
	draw_hazard(tick, true)
	draw_footer(tick)


func draw_map() -> void:
	if map_texture != null:
		draw_texture_rect_region(map_texture, BOARD, Rect2(0, 195, map_texture.get_width(), 670))
	draw_rect(BOARD, Color(0.01, 0.025, 0.045, 0.24))
	draw_rect(BOARD, Color("d9b879", 0.55), false, 2.0)
	draw_rect(Rect2(94, 134, 1092, 484), Color("e4c889", 0.3), false, 1.0)


func draw_grid() -> void:
	for row in range(5):
		for column in range(7):
			var center := point(float(column), float(row))
			var corners := PackedVector2Array()
			for index in range(6):
				var angle := deg_to_rad(60.0 * float(index) - 90.0)
				corners.append(center + Vector2(cos(angle) * 45.0, sin(angle) * 45.0))
			corners.append(corners[0])
			var tint := Color("edce89")
			if column < 3: tint = Color("6dd4cb")
			elif column > 3: tint = Color("f0856d")
			draw_colored_polygon(corners, Color(tint, 0.035))
			draw_polyline(corners, Color(tint, 0.32), 1.2, true)


func draw_hazard(tick: int, banner: bool) -> void:
	for hazard in replay["hazards"]:
		if tick < int(hazard["warnTick"]) or tick >= int(hazard["endTick"]):
			continue
		var active := tick >= int(hazard["startTick"])
		var hazard_id: String = hazard["id"]
		var color: Color = COLORS[HAZARD_ELEMENTS[hazard_id]]
		if banner:
			draw_rect(Rect2(414, 112, 452, 42), Color("0b1820", 0.95))
			var remaining := (int(hazard["endTick"]) - tick if active else int(hazard["startTick"]) - tick) / 10.0
			var status := "ĐANG DIỄN RA" if active else "SẮP XUẤT HIỆN"
			text("%s · %s · %.1f s" % [status, HAZARD_NAMES[hazard_id], remaining], Vector2(640, 139), 19, color, HORIZONTAL_ALIGNMENT_CENTER, 430)
		else:
			draw_rect(BOARD, Color(color, 0.22 if active else 0.11))
		break


func draw_units(units: Array, next_by_id: Dictionary, alpha: float, tick: int) -> void:
	var ordered := []
	for unit in units:
		if not unit["alive"]: continue
		var following: Dictionary = next_by_id.get(unit["id"], unit)
		ordered.append({"unit": unit, "position": point(lerpf(float(unit["x"]), float(following["x"]), alpha), lerpf(float(unit["y"]), float(following["y"]), alpha))})
	ordered.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a["position"].y < b["position"].y)
	for entry in ordered:
		var unit: Dictionary = entry["unit"]
		var position: Vector2 = entry["position"]
		var definition: Dictionary = definitions[unit["unitId"]]
		var team_color := Color("6ce6cc") if unit["side"] == "A" else Color("ff8b76")
		draw_set_transform(position)
		draw_circle(Vector2(0, 17), 34, Color("07131b", 0.50))
		draw_arc(Vector2(0, 17), 32, 0, TAU, 28, team_color, 2.5, true)
		var texture: Texture2D = sprites.get(unit["unitId"])
		if texture != null:
			var sprite_height := 130.0
			var sprite_width := minf(112.0, sprite_height * float(texture.get_width()) / float(texture.get_height()))
			draw_texture_rect(texture, Rect2(-sprite_width / 2.0, -sprite_height + 21.0, sprite_width, sprite_height), false)
		else:
			draw_circle(Vector2.ZERO, 26, COLORS[definition["element"]])
		if float(unit["shield"]) > 0.0:
			draw_arc(Vector2(0, -22), 49, 0, TAU, 32, Color("9ee9ff"), 3.0, true)
		if unit["reinforcement"] and tick <= int(unit["invulnerableUntil"]):
			draw_arc(Vector2(0, -22), 53, 0, TAU, 32, Color("ffe4a0"), 2.0, true)
		var hp := clampf(float(unit["hp"]) / float(definition["maxHp"]), 0.0, 1.0)
		var energy := clampf(float(unit["energy"]) / 200.0, 0.0, 1.0)
		draw_rect(Rect2(-31, -126, 62, 8), Color("07111a"))
		draw_rect(Rect2(-30, -125, 60.0 * hp, 6), team_color)
		draw_rect(Rect2(-31, -115, 62, 5), Color("07111a"))
		draw_rect(Rect2(-30, -114, 60.0 * energy, 3), Color("8bbfff"))
		text(definition["name"], Vector2(0, 48), 14, Color("f1eee4"), HORIZONTAL_ALIGNMENT_CENTER, 140)
		draw_set_transform(Vector2.ZERO)


func draw_header(tick: int) -> void:
	draw_rect(Rect2(0, 0, 1280, 110), Color("0b1924"))
	draw_rect(Rect2(0, 108, 1280, 2), Color("c6a66c", 0.55))
	text("WANEBOUND", Vector2(66, 46), 34, Color("f4dfae"))
	text("BẢN PHÁT LẠI · SEED %d" % int(replay["seed"]), Vector2(68, 78), 15, Color("9cb2b9"))
	var map_name := "Hỏa Diệm Sơn" if replay["mapId"] == "flaming_mountain" else "Thủy Liêm Động"
	text(map_name, Vector2(640, 45), 29, Color("f4efe3"), HORIZONTAL_ALIGNMENT_CENTER, 470)
	text("BÀN HEX 7 × 5  ·  RULE %s" % replay["version"], Vector2(640, 76), 15, Color("b7c4c3"), HORIZONTAL_ALIGNMENT_CENTER, 470)
	text("%02d:%02d" % [tick / 600, (tick / 10) % 60], Vector2(1178, 49), 31, Color("f4dfae"), HORIZONTAL_ALIGNMENT_RIGHT, 120)
	text("ĐỘI A  ·  XANH NGỌC", Vector2(104, 154), 16, Color("6ce6cc"))
	text("ĐỘI B  ·  ĐỎ CAM", Vector2(1176, 154), 16, Color("ff8b76"), HORIZONTAL_ALIGNMENT_RIGHT, 220)
	if tick >= int(replay["ticks"]):
		var winner_text := "HÒA" if replay["winner"] == "draw" else "ĐỘI %s THẮNG" % replay["winner"]
		draw_rect(Rect2(454, 306, 372, 82), Color("0b1924", 0.94))
		draw_rect(Rect2(454, 306, 372, 82), Color("f4dfae"), false, 2.0)
		text(winner_text, Vector2(640, 358), 30, Color("f4dfae"), HORIZONTAL_ALIGNMENT_CENTER, 340)


func draw_footer(tick: int) -> void:
	draw_rect(Rect2(0, 642, 1280, 78), Color("0b1924"))
	draw_rect(Rect2(0, 642, 1280, 2), Color("c6a66c", 0.55))
	text("%s  ·  %d×" % ["PHÁT" if playing else "TẠM DỪNG", int(speed)], Vector2(72, 687), 19, Color("f4dfae"))
	draw_rect(Rect2(286, 674, 840, 6), Color("34505b"))
	draw_rect(Rect2(286, 674, 840.0 * float(tick) / float(replay["ticks"]), 6), Color("d3b474"))
	for hazard in replay["hazards"]:
		var x := 286.0 + 840.0 * float(hazard["startTick"]) / float(replay["ticks"])
		draw_rect(Rect2(x, 669, 3, 16), COLORS[HAZARD_ELEMENTS[hazard["id"]]])
	text("SPACE tạm dừng  ·  1/2/4 tốc độ  ·  ← → tua 10 giây", Vector2(286, 706), 14, Color("aabfc1"))
	text("%d / %d TICK" % [tick, int(replay["ticks"])], Vector2(1190, 704), 14, Color("b7c4c3"), HORIZONTAL_ALIGNMENT_RIGHT, 165)


func point(x: float, y: float) -> Vector2:
	return Vector2(290.0 + x * 90.0 + y * 45.0, 264.0 + y * 74.0)


func text(value: String, position: Vector2, font_size: int, color: Color, alignment: HorizontalAlignment = HORIZONTAL_ALIGNMENT_LEFT, width: float = -1.0) -> void:
	var origin := position
	if alignment == HORIZONTAL_ALIGNMENT_CENTER:
		origin.x -= width / 2.0
	elif alignment == HORIZONTAL_ALIGNMENT_RIGHT:
		origin.x -= width
	draw_string(ThemeDB.fallback_font, origin, value, alignment, width, font_size, color)
