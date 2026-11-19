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
var logo_texture: Texture2D
var events_by_tick: Dictionary = {}
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
	for event in replay.get("events", []):
		var event_tick: int = event["tick"]
		if not events_by_tick.has(event_tick):
			events_by_tick[event_tick] = []
		events_by_tick[event_tick].append(event)
	map_texture = load("res://assets/maps/%s.png" % replay["mapId"])
	logo_texture = load("res://assets/branding/wanebound-logo.webp")
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
	draw_combat_fx(tick, playhead - float(tick), current["units"])
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
			if active:
				draw_hazard_pattern(hazard_id, color, tick)
		break


func draw_hazard_pattern(hazard_id: String, color: Color, tick: int) -> void:
	var drift := float(tick % 30)
	match hazard_id:
		"sword_rain":
			for index in range(18):
				var x := BOARD.position.x + float((index * 73 + tick * 7) % 1100)
				var y := BOARD.position.y + float((index * 113 + tick * 14) % 495)
				draw_line(Vector2(x - 16, y - 32), Vector2(x + 12, y + 26), Color(color, 0.65), 3.0, true)
		"vines":
			for index in range(11):
				var x := BOARD.position.x + 28.0 + float(index) * 102.0
				var growth := 62.0 + drift * 4.0
				var root := Vector2(x, BOARD.end.y)
				draw_polyline(PackedVector2Array([root, root + Vector2(18, -growth * 0.4), root + Vector2(-12, -growth)]), Color(color, 0.7), 4.0, true)
		"flood":
			for row in range(8):
				var points := PackedVector2Array()
				for column in range(23):
					var x := BOARD.position.x + float(column) * 50.0
					var y := BOARD.position.y + 85.0 + float(row) * 54.0 + sin(float(column) * 0.8 + drift * 0.25) * 9.0
					points.append(Vector2(x, y))
				draw_polyline(points, Color(color, 0.42), 3.0, true)
		"wildfire":
			for index in range(18):
				var x := BOARD.position.x + float(index) * 63.0
				var y := BOARD.end.y - 28.0 - float((index * 37) % 240)
				var height := 20.0 + sin(float(tick + index * 5) * 0.4) * 10.0
				draw_colored_polygon(PackedVector2Array([Vector2(x - 13, y + 15), Vector2(x, y - height), Vector2(x + 14, y + 15)]), Color(color, 0.42))
		"sandstorm":
			for index in range(26):
				var x := BOARD.position.x + float((index * 97 + tick * 17) % 1090)
				var y := BOARD.position.y + float((index * 59) % 485)
				draw_line(Vector2(x - 30, y), Vector2(x + 31, y - 10), Color(color, 0.45), 2.0, true)
		"ice_field":
			for index in range(22):
				var x := BOARD.position.x + float((index * 83) % 1080)
				var y := BOARD.position.y + float((index * 131) % 480)
				var center := Vector2(x, y)
				draw_line(center + Vector2(-8, 0), center + Vector2(8, 0), Color(color, 0.68), 2.0, true)
				draw_line(center + Vector2(0, -8), center + Vector2(0, 8), Color(color, 0.68), 2.0, true)


func draw_units(units: Array, next_by_id: Dictionary, alpha: float, tick: int) -> void:
	var ordered := []
	for unit in units:
		var death := recent_event(unit["id"], "Death", tick, 4, false)
		if not unit["alive"] and death.is_empty(): continue
		var following: Dictionary = next_by_id.get(unit["id"], unit)
		ordered.append({"unit": unit, "position": point(lerpf(float(unit["x"]), float(following["x"]), alpha), lerpf(float(unit["y"]), float(following["y"]), alpha))})
	ordered.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a["position"].y < b["position"].y)
	for entry in ordered:
		var unit: Dictionary = entry["unit"]
		var position: Vector2 = entry["position"]
		var definition: Dictionary = definitions[unit["unitId"]]
		var team_color := Color("6ce6cc") if unit["side"] == "A" else Color("ff8b76")
		var attack := recent_event(unit["id"], "Attack", tick, 3, true)
		var cast := recent_event(unit["id"], "Cast", tick, 4, true)
		var hit := recent_event(unit["id"], "Damage", tick, 3, false)
		var spawn := recent_event(unit["id"], "ReinforcementSpawn", tick, 4, true)
		var death := recent_event(unit["id"], "Death", tick, 4, false)
		var action := attack if cast.is_empty() or (not attack.is_empty() and int(attack["tick"]) > int(cast["tick"])) else cast
		var lunge := Vector2.ZERO
		if not action.is_empty():
			var target_position := event_target_position(action, units)
			var phase := clampf((float(tick) + alpha - float(action["tick"])) / 3.0, 0.0, 1.0)
			lunge = (target_position - position).normalized() * sin(phase * PI) * 13.0
		var bob := sin(playhead * 2.6 + float(unit["id"].hash() % 7)) * 1.5
		var drop := 0.0
		if not spawn.is_empty():
			drop = -26.0 * (1.0 - clampf((float(tick) + alpha - float(spawn["tick"])) / 4.0, 0.0, 1.0))
		var fade := 1.0
		if not death.is_empty():
			fade = 1.0 - clampf((float(tick) + alpha - float(death["tick"])) / 4.0, 0.0, 1.0)
		draw_set_transform(position)
		draw_circle(Vector2(0, 13), 26, Color("07131b", 0.50 * fade))
		draw_arc(Vector2(0, 13), 26, 0, TAU, 28, Color(team_color, fade), 2.3, true)
		draw_set_transform(position + lunge + Vector2(0, bob + drop))
		var texture: Texture2D = sprites.get(unit["unitId"])
		if texture != null:
			var sprite_height := 94.0
			var sprite_width := minf(74.0, sprite_height * float(texture.get_width()) / float(texture.get_height()))
			var flash := not hit.is_empty() and tick - int(hit["tick"]) <= 1
			draw_texture_rect(texture, Rect2(-sprite_width / 2.0, -sprite_height + 17.0, sprite_width, sprite_height), false, Color(1.6, 1.6, 1.6, fade) if flash else Color(1, 1, 1, fade))
		else:
			draw_circle(Vector2.ZERO, 24, Color(COLORS[definition["element"]], fade))
		draw_set_transform(position)
		if float(unit["shield"]) > 0.0:
			draw_arc(Vector2(0, -15), 35, 0, TAU, 32, Color("9ee9ff"), 2.0, true)
		if unit["reinforcement"] and tick <= int(unit["invulnerableUntil"]):
			draw_arc(Vector2(0, -15), 39, 0, TAU, 32, Color("ffe4a0"), 2.0, true)
		var hp := clampf(float(unit["hp"]) / float(definition["maxHp"]), 0.0, 1.0)
		var energy := clampf(float(unit["energy"]) / 200.0, 0.0, 1.0)
		draw_rect(Rect2(-25, -94, 50, 7), Color("07111a"))
		draw_rect(Rect2(-24, -93, 48.0 * hp, 5), team_color)
		draw_rect(Rect2(-25, -85, 50, 4), Color("07111a"))
		draw_rect(Rect2(-24, -84, 48.0 * energy, 2), Color("8bbfff"))
		text(unit["id"].get_slice("_", 0), Vector2(0, 34), 12, team_color, HORIZONTAL_ALIGNMENT_CENTER, 70)
		draw_set_transform(Vector2.ZERO)


func recent_event(instance_id: String, event_type: String, tick: int, age: int, source: bool) -> Dictionary:
	var field := "sourceId" if source else "targetId"
	for sample_tick in range(tick, maxi(-1, tick - age) - 1, -1):
		for event in events_by_tick.get(sample_tick, []):
			if event["type"] == event_type and event[field] == instance_id:
				return event
	return {}


func event_target_position(event: Dictionary, units: Array) -> Vector2:
	for unit in units:
		if unit["id"] == event["targetId"]:
			return point(float(unit["x"]), float(unit["y"]))
	return Vector2.ZERO


func event_position(instance_id: String, units: Array) -> Vector2:
	for unit in units:
		if unit["id"] == instance_id:
			return point(float(unit["x"]), float(unit["y"]))
	return Vector2.ZERO


func draw_combat_fx(tick: int, alpha: float, units: Array) -> void:
	for sample_tick in range(maxi(0, tick - 3), tick + 1):
		for event in events_by_tick.get(sample_tick, []):
			var phase := clampf((float(tick) + alpha - float(event["tick"])) / 4.0, 0.0, 1.0)
			var opacity := 1.0 - phase
			var source := event_position(event["sourceId"], units)
			var target := event_position(event["targetId"], units)
			if event["type"] == "Attack" and source != Vector2.ZERO and target != Vector2.ZERO:
				var direction := (target - source).normalized()
				var center := source.lerp(target, 0.65)
				draw_line(center - direction * 19.0, center + direction * 21.0, Color("fff3cf", opacity), 4.0, true)
				draw_line(center - direction * 21.0 + Vector2(0, -8), center + direction * 17.0 + Vector2(0, -8), Color("ffffff", opacity * 0.65), 1.8, true)
			elif event["type"] == "Cast" and target != Vector2.ZERO:
				var skill: String = event["skillId"]
				var color := Color("f0d6a1")
				if source != Vector2.ZERO:
					for unit in units:
						if unit["id"] == event["sourceId"]:
							color = COLORS[definitions[unit["unitId"]]["element"]]
							break
				var radius := 20.0 + phase * 44.0
				draw_arc(target + Vector2(0, -18), radius, 0, TAU, 32, Color(color, opacity * 0.9), 3.0, true)
				if skill == "hoa_tiem_thuong" or skill == "jin_gu_bang":
					draw_line(source + Vector2(0, -35), target + Vector2(0, -26), Color(color, opacity), 5.0, true)
				elif skill == "ren_shen_guo":
					for index in range(5):
						var angle := TAU * float(index) / 5.0 + phase
						draw_circle(target + Vector2(cos(angle), sin(angle)) * radius + Vector2(0, -18), 4.0, Color(color, opacity))
				elif skill == "liu_sha_he":
					draw_arc(target + Vector2(0, -18), radius + 9.0, 0, TAU, 32, Color("9ee9ff", opacity), 2.0, true)
				elif skill == "zhen_di":
					draw_arc(source + Vector2(0, 10), radius + 18.0, 0, TAU, 32, Color(color, opacity), 5.0, true)
			elif event["type"] == "Damage" and target != Vector2.ZERO and float(event["amount"]) > 0.0:
				text("−%d" % int(event["amount"]), target + Vector2(0, -88 - phase * 20.0), 16, Color("ffe9cf", opacity), HORIZONTAL_ALIGNMENT_CENTER, 75)


func draw_header(tick: int) -> void:
	draw_rect(Rect2(0, 0, 1280, 110), Color("0b1924"))
	draw_rect(Rect2(0, 108, 1280, 2), Color("c6a66c", 0.55))
	if logo_texture != null:
		draw_texture_rect(logo_texture, Rect2(26, 0, 108, 108), false)
	text("WANEBOUND", Vector2(142, 47), 31, Color("f4dfae"))
	text("BẢN PHÁT LẠI · SEED %d" % int(replay["seed"]), Vector2(144, 78), 15, Color("9cb2b9"))
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
