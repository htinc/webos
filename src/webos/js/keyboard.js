function keyboard_begin(id) {

}

var keyboard_id = "";
var keyboard_shift = false;
var keyboard_cmd = false;
var keyboard_dark = false;
var keyboard_down = false;
var keyboard_interval = 10;

var keyboard_subscribers = [];

function keyboard_subscribe(fx) {
	var id = kernel_id_gen("keysub");
	keyboard_subscribers.push({
		fx: fx,
		buffer: "",
		id: id
	});
	
	if (keyboard_subscribers.length == 1) {
		keyboard_invoke();
	}
	
	return id;
}

function keyboard_unsubscribe(id) {
	for (var i = 0; i < keyboard_subscribers.length; i++) {
		if (keyboard_subscribers.id == id) {
			keyboard_subscribers.splice(i, 1);
		}
	}
	
	if (keyboard_subscribers.length == 0) {
		keyboard_hide();
	}
}

/*

CMD = CTRL | APPLE-CMD / WINDOWNS

CMD+SHIFT+B reboot
CMD+SHIFT+I stop drawing
CMD+SHIFT+P start terminal
CMD+SHIFT+F kernel fail

*/

function keyboard_handle_key(e) {
	var cmd = e.metaKey || e.ctrlKey;
	var shift = e.shiftKey;
	
	if (cmd && e.key == "B") {
		kernel_reboot();
		e.preventDefault();
	}
	
	if (cmd && e.key == "I") {
		gr_drawing_array = [];
		e.preventDefault();
	}

	if (cmd && e.key == "P") {
		start_app(terminal_app);
		e.preventDefault();
	}
	
	if (cmd && e.key == "F") {
		kernel_fail("user triggered fail");
		e.preventDefault();
	}
	
	for (var i = 0; i < keyboard_subscribers.length; i++) {
		var sub = keyboard_subscribers[i];
		
		if (e.key == "" && sub.buffer.length > 0) {
			sub.buffer = sub.buffer.substring(0, sub.buffer.length - 1);
		}
		
		sub.buffer += e.key;
		
		e.clear = function () {
			sub.buffer = "";
		}
		
		e.buffer = sub.buffer;
		sub.fx(e);
	}
	
	keyboard_shift = false;
}

var keyboard_visible = false;

function keyboard_invoke() {
	
	if (kernel_mobile) {
		keyboard_visible = true;
	}
		
}

keyboard_show = keyboard_invoke;

function keyboard_hide() {
	keyboard_visible = false;
}

var keyboard_locales = {
	"en-us": {
		layouts: [
			[
				"qwertyuiop",
				"asdfghjkl",
				"zxcvbnm"
			],
			[
				"1234567890",
				"-/:;()$&@\"",
				".,?!'"
			],
			[
				"[]{}#%^*+=",
				"_\\|~<>€£¥•",
				".,?!'"
			]
		],
		space: "space",
		enter: "return"
	}
}

var keyboard_locale = "en-us";

var keyboard_state = 0;

function keyboard_set_layout() {
	
	var locale = keyboard_locales[keyboard_locale];
	
	var layout = [ [], [], [],
			[
				{ 
					action: function () {
						if (keyboard_state == 0) {
							keyboard_state = 1;
						} else {
							keyboard_state = 0;
						}
						
						keyboard_set_layout();
					}, 
					label: keyboard_state == 0 ? "123" : "ABC",
					w: 15
				},
				{ 
					draw: function (x, y, w, h, kc) {
						gr_path(x + (w - 30) / 2, y + h / 2 - 1, gr_map_path(gr_logo_path, w - 30, w - 30), 0, kc);
					},
					label: " ⌘ ", 
					w: 10 
				},
				{ 
					value: " ", 
					label: locale.space, 
					w: 50 
				},
				{ 
					value: "\n", 
					label: locale.enter, w: 25 
				}
			]
	];
		
	var lines = locale.layouts[keyboard_state];
		
	for (var li = 0; li < lines.length; li++) {
		var l = lines[li];
		for (var k = 0; k < l.length; k++) {
			layout[li].push({ 
				value: l[k], 
					label: l[k], 
				w: 10,
				std: true
			});
		}
	}
		
	layout[2].unshift({ 
		action: function () {
			switch (keyboard_state) { 
				case 0:
					keyboard_shift = !keyboard_shift;
					return;
				case 1:
					keyboard_state = 2;
					return;
				case 2:
					keyboard_state = 1;
					return;
			}
		}, 
		c: function (c, tc, cc) {
			return keyboard_shift ? c : cc;
		},
		label: keyboard_state == 0 ? "⇧" : (keyboard_state == 1 ? "#+=" : "123"),
		w: 15
	});
		
	layout[2].push({ 
		value: "", 
		label: " ⌫ ",
		nopress: true,
		draw: function (x, y, w, h, kc) {
			gr_path(x + 4, y - 4, gr_map_path([
				[25,50],
				[40,63],
				[70,63],
				[70,37],
				[40,37]
			], w, h), 0, kc);
			
			gr_path(x + 2, y - 4, gr_map_path([
				[43,43],
				[57,57],
				[50,50],
				[43,57],
				[57,43],
				[50,50]
			], h, h), 0, kc);
		},
		w: 15
	});
	
	for (var li = 0; li < layout.length; li++) {
		var l = layout[li];
		var c = 0;
		var w = 0;
		var nw = 0;
		var fi = -1;
		for (var ki = 0; ki < l.length; ki++) {
			var k = l[ki];
			
			if (k.std) {
				if (fi == -1) {
					fi = ki;
				}
				c++;
				w += k.w;
			} else {
				nw += k.w;
			}
		}
		if (fi > -1 && nw + w < 100) {
			var back = [];
			var top = [];
			for (var i = 0; i < fi; i++) {
				back.push(l[0]);
				l.shift();
			}
			for (var i = 0; i < l.length - c; i++) {
				top.push(l[l.length - 1]);
				l.pop();
			}
			l.unshift({ 
				label: "",
				w: (100 - nw - w) / 2
			});
			l.push(l[0]);
			
			for (var i = 0; i < fi; i++) {
				l.unshift(back[i]);
			}
			for (var i = 0; i < top.length; i++) {
				l.push(top[i]);
			}
		}
	}
		
	keyboard_active_layout = layout;
}

keyboard_set_layout();

function keyboard_draw() {
	
	if (keyboard_visible) {
	
		var c = keyboard_dark ? "rgb(104,104,104)" : "#fff";
		var tc = keyboard_dark ? "#fff" : "#000";
		var b = keyboard_dark ? "rgb(40,40,40)" : "rgb(210,213,220)";
		var bez = keyboard_dark ? "rgb(23,23,23)" : "rgb(136,137,141)";
		var cc = keyboard_dark ? "rgb(68,68,68)" : "rgb(180,183,190)";
		var o = 4;
		
		var radius = 5;
		
		var bottom = 0;
		
		var h = gr_h > 750 ? gr_h / 3 : 220;
		
		gr_rect(0, gr_h - h - bottom, gr_w, h, b);
		gr_line(0, gr_h - h - bottom, gr_w, gr_h - h - bottom, "rgba(0,0,0,0.1)");
		
		var layout = keyboard_active_layout;
		
		if (!mouse_last_down) {
			keyboard_down = false;
		}
		
		if (!mouse_down) {
			keyboard_interval = 100;
		}
		
		var rh = h / layout.length;
		
		for (var ri = 0; ri < layout.length; ri++) {
			var r = layout[ri];
			
			var w = 0;
			
			for (var ki = 0; ki < r.length; ki++) {
				var k = r[ki];
				var kww = gr_w / 100 * k.w;
				
				if (k.label) {
					var kx = w + o;
					var ky = gr_h - h + rh * ri + o - bottom;
					var kw = kww - o * 2;
					var kh = rh - o * 2;
					
					gr_rrect(kx, ky + 1, kw, kh, bez, radius);
					
					gr_rrect(kx, ky, kw, kh, k.c ? k.c(c, tc, cc) : (mouse_any_over(kx, ky, kw, kh) && mouse_down ? b : (k.label.length == 1 || k.w == 50) ? c : cc), radius);
					
					gr_font(k.label.length == 1 ? 25 : 16, null, null, 300);
					k.draw ? k.draw(kx, ky, kh, kw, tc) : gr_text_c(kx + kw / 2, ky + kh / 2 - 2, k.label, tc);
					
					if (mouse_any_over(kx - o, ky - o, kw + o * 2, kh + o * 2) && mouse_down && (!keyboard_down || (k.nopress && gr_frame_index % keyboard_interval == 1))) {
					
						k.action ? k.action() : keyboard_handle_key({
							key: keyboard_shift ? k.value.toUpperCase() : k.value,
							metaKey: keyboard_cmd,
							shiftKey: keyboard_shift
						});
						
						keyboard_down = true;
						
						if (k.nopress) {
							keyboard_interval /= 2;
							if (keyboard_interval < 4) {
								keyboard_interval = 4;
								
							}
						}
					}
				}
				
				w += kww;
			}
		}
	}
}


	
	/*
	Lol my calculator is so bad so i wrote this in math. fk off ;)
	var i = 10;
var g = 9.81;
var hg = -9.81 / 2;
var v = 20;
var t = Math.sqrt(v/g);
var res = [];
for (var z = 0; z < 10; z++) {
	
	res.push(i + ": " + Math.atan(
		(hg*Math.pow(t, 2))-
		(hg*Math.pow(t-i, 2))
	) * 180 / Math.PI) / (
		(t*v)
		-
		((t-i)*v)
	);
	
	i /= 10;
}

alert(res.join("\n"));*/
