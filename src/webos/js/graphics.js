var gr_ctx;

var gr_h = 0;
var gr_w = 0;
var gr_hh = 0;
var gr_top = 0;
var gr_bottom = 50;

var gr_res = 2;

var gr_enabled = true;

var font_small = 13;
var font_text = 15;
var font_subtitle = 16;
var font_title = 20;

var gr_frame_rate = 60;
var gr_frame_delay = Math.floor(1000 / gr_frame_rate);
var gr_frame_index = 0;

var gr_system_font = "-apple-system, BlinkMacSystemFont, sans-serif";

var gr_drawing_array = [];
var gr_current_window = {};
var gr_main_thread;

var gr_logo_path = [
	[0, 0],
	[0, 75],
	[25, 100],
	[50, 75],
	[75, 100],
	[100, 75],
	[100, 0]
];

var mouse_style = 0;

var mouse_style_none = 0;
var mouse_style_cursor = -1;
var mouse_style_crosshair = 5;

var mouse_pos = {
	x: 0,
	y: 0,
	s: 1,
	r: 0
}

var mice = [];

var mouse_last_pos = {
	x: 0,
	y: 0,
	s: 1,
	r: 0
}

var mouse_start_pos = {
	x: 0,
	y: 0,
	s: 1,
	r: 0
}

var mouse_last_down;

function gr_register_drawer(app, task) {
	
	gr_drawing_array.push({
		app: app,
		task: task,
		zindex: app.zindex || gr_drawing_array.length + 2,
		performance: 0
	});
	
	if (app.focus) {
		app.focus(task.window);
	}
	
	//gr_order_dawing_array();

}

function gr_order_dawing_array() {
	var compare = function (a,b) {
	  if (a.zindex < b.zindex)
		return -1;
	  if (a.zindex > b.zindex)
		return 1;
	  return 0;
	}

	gr_drawing_array = gr_drawing_array.sort(compare);
}

function gr_remove_drawer(task) {
	var index = 0;
	
	for (var i = 0; i < gr_drawing_array.length; i++) {
		if (gr_drawing_array[i].task == task) {
			index = i;
		}
	}
	
	gr_drawing_array.splice(index, 1);
}

function gr_init() {

	el = document.getElementById("main");
	
	var ac = function(evt) {
		var rect = el.getBoundingClientRect();
		mouse_pos = {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		}
   }

	if (!kernel_mobile) {
	
		el.addEventListener('mousemove', ac, false);

		el.onmousedown = function() { 
			mouse_down = true;
		}
		
		el.onmouseup = function() {
			mouse_down = false;
		}
	
	}
	
	
	el.addEventListener("touchstart", function (e) {
		mouse_down = true;
		
		mice = [];
		
		for (var i = 0; i < e.touches.length; i++) {
			mice.push({
				x: e.touches[i].pageX,
				y: e.touches[i].pageY
			});
		}
		
		mouse_pos = {
			x: mice[0].x,
			y: mice[0].y,
			s: e.scale,
			r: e.roatation
		};
		
		mouse_start_pos = {
			x: mice[0].x,
			y: mice[0].y,
			s: e.scale,
			r: e.roatation
		};
		
		//e.preventDefault();
	}, false);
	
	el.addEventListener("touchend", function (e) {
		mouse_down = false;
	}, false);

	el.addEventListener("touchmove", function (e) {
		mouse_down = true;
		mouse_pos = {
			x: e.touches[0].pageX,
			y: e.touches[0].pageY,
			s: e.scale,
			r: e.roatation
		}
	}, false);


	gr_ctx = el.getContext("2d");
	
	if (!el.style.width) {
		el.style.width = el.width + 'px';
	}
	if (!el.style.height) {
		el.style.height = el.height + 'px';
	}
	
	el.width = Math.ceil(el.width * gr_res);
	
	el.height = Math.ceil(el.height * gr_res);
	gr_ctx.scale(gr_res, gr_res);
	
	gr_h = el.height / gr_res;
	gr_w = el.width / gr_res;
	gr_top = status_options.height + status_options.offset * 2;
	gr_hh = gr_h - gr_top - gr_bottom;
	
	gr_clear("#555");
	
	gr_drawing_array = [];

	kernel_info_functions.push(gr_info);
	kernel_info_functions.push(mouse_info);
	kernel_info_functions.push(animation_info);
	
	while (engine_create_app_queue.length > 0) {
		engine_create_app(engine_create_app_queue[0]);
	}
}

function gr_start_main_thread() {

	gr_main_thread = setInterval(function () {
	
		gr_enabled = !document.hidden;
	
		if (gr_enabled) {
		
			mouse_style = -1;
			
			gr_order_dawing_array();
			
			for (var i = 0; i < gr_drawing_array.length; i++) {
			
				var item = gr_drawing_array[i];
				var task = item.task;
				var app = item.app;

				var start = Date.now();
				
				if (task.window) {
					task.window.draw(task);
					gr_noclip();
				}
				
				app.draw(task.window);
				
				var dif = Date.now() - start;
				
				if (dif > 100) {
					kernel_log(task, "long render time: " + dif, "orange");
				}
				
				if (dif > 5000) {
					kernel_fail("timeout: " + task.id + ", dif: " + dif);
					clearInterval(task["mainthread"]);
				}
				
				item.performance = dif;
				
			}
			
			if (!kernel_mobile) {
			switch (mouse_style) {
				case 0:
					break;
				case 1:
					gr_line(mouse_pos.x - 10, mouse_pos.y, mouse_pos.x + 10, mouse_pos.y, (mouse_down ? "blue" : "red"));
					gr_line(mouse_pos.x, mouse_pos.y - 10, mouse_pos.x, mouse_pos.y + 10, (mouse_down ? "blue" : "red"));
					break;
				case 2:
					gr_shadow(8, "rgba(0,0,0,0.4)");
					gr_ctx.lineWidth = 5;
					gr_line(mouse_pos.x - 10, mouse_pos.y, mouse_pos.x + 10, mouse_pos.y, (mouse_down ? "white" : "black"));
					gr_line(mouse_pos.x, mouse_pos.y - 10, mouse_pos.x, mouse_pos.y + 10, (mouse_down ? "white" : "black"));
					gr_shadow();
					gr_line(mouse_pos.x - 10, mouse_pos.y, mouse_pos.x + 10, mouse_pos.y, (mouse_down ? "white" : "black"));
					gr_line(mouse_pos.x, mouse_pos.y - 10, mouse_pos.x, mouse_pos.y + 10, (mouse_down ? "white" : "black"));
					gr_ctx.lineWidth = 2;
					gr_line(mouse_pos.x - 8, mouse_pos.y, mouse_pos.x + 8, mouse_pos.y, (mouse_down ? "black" : "white"));
					gr_line(mouse_pos.x, mouse_pos.y - 8, mouse_pos.x, mouse_pos.y + 8, (mouse_down ? "black" : "white"));
					gr_ctx.lineWidth = 1;
					break;
				case 5:
					gr_ctx.beginPath();
					gr_ctx.moveTo(mouse_pos.x, mouse_pos.y);
					
					gr_ctx.lineTo(mouse_pos.x - 6, mouse_pos.y - 5);
					gr_ctx.lineTo(mouse_pos.x - 6, mouse_pos.y - 2);
					gr_ctx.lineTo(mouse_pos.x + 6, mouse_pos.y + 5);
					gr_ctx.lineTo(mouse_pos.x + 6, mouse_pos.y + 2);
					gr_ctx.lineTo(mouse_pos.x, mouse_pos.y);
					
					gr_ctx.closePath();
					gr_ctx.lineWidth = 4;
					
					gr_shadow(8, "rgba(0,0,0,0.4)");
					gr_ctx.strokeStyle = mouse_down ? "black" : "white";
					gr_ctx.stroke();
					gr_shadow();
					
					gr_ctx.fillStyle = mouse_down ? "white" : "black";
					gr_ctx.fill();
					gr_ctx.lineWidth = 1;
					break;
				default:
					gr_ctx.beginPath();
					gr_ctx.moveTo(mouse_pos.x, mouse_pos.y);
					
					gr_ctx.lineTo(mouse_pos.x, mouse_pos.y + 13);
					gr_ctx.lineTo(mouse_pos.x + 3, mouse_pos.y + 10);
					gr_ctx.lineTo(mouse_pos.x + 6, mouse_pos.y + 16);
					gr_ctx.lineTo(mouse_pos.x + 8, mouse_pos.y + 15);
					gr_ctx.lineTo(mouse_pos.x + 5, mouse_pos.y + 9);
					gr_ctx.lineTo(mouse_pos.x + 9, mouse_pos.y + 9);
					gr_ctx.lineTo(mouse_pos.x, mouse_pos.y);
					
					gr_ctx.closePath();
					gr_shadow(8, "rgba(0,0,0,0.4)");
					gr_ctx.lineWidth = 4;
					gr_ctx.strokeStyle = mouse_down ? "black" : "white";
					gr_ctx.stroke();
					gr_shadow();
					
					gr_ctx.fillStyle = mouse_down ? "white" : "black";
					gr_ctx.fill();
					
					gr_ctx.lineWidth = 1;
				}
			}
			
			var over_window = gr_drawing_array[0];
			
			for (var i = 1; i < gr_drawing_array.length; i++) {
				
				var task = gr_drawing_array[i].task;
				
				if (task.window) {
					task.window.active = false;
					task.active = false;
					
					if (mouse_over(task.window.x, task.window.y, task.window.w, task.window.h + window_header_height)) {
						over_window = gr_drawing_array[i];
					}
				}
			}
			
			if (over_window && over_window.task && over_window.task.window && mouse_down) {
				over_window.task.window.active = true;
				over_window.task.active = true;
				
				if (over_window.app.focus) {
					over_window.app.focus(over_window.task.window);
					
				}
				
				//gr_rect(over_window.task.window.x, over_window.task.window.y, over_window.task.window.w, over_window.task.window.h + window_header_height, "rgba(255,0,0,0.3)");

				if (over_window != gr_current_window && gr_drawing_array.indexOf(over_window) > 0) {
					over_window.zindex = gr_current_window.zindex + 1 || 10;
					
					if (gr_current_window.app && gr_current_window.app.blur) {
						gr_current_window.app.blur(gr_current_window.task.window);
					}
					
					gr_current_window = over_window;
				}
			}
			
			if (gr_current_window && gr_current_window.task && gr_current_window.task.window) {
				gr_current_window.task.window.active = true;
				gr_current_window.task.active = true;
			}
			
			keyboard_draw();
			
			gr_frame_index++;
			
			gr_order_dawing_array();
			
			for (x in mouse_pos) {
				mouse_last_pos[x] = mouse_pos[x];
			}
			
			mouse_last_down = mouse_down;
	
		} else {
			
			gr_clear("#000");
			
		}
	
	}, gr_frame_delay);
}

function gr_clear(color) {
	gr_ctx.fillStyle = color;
	gr_ctx.fillRect(0, 0, gr_w, gr_h);
}

function gr_circle(x, y, r, color) {
	gr_ctx.beginPath();
	gr_ctx.arc(x, y, r, 360 * Math.PI/180, 0);
	gr_ctx.fillStyle = color;
	gr_ctx.fill();
}

function gr_font(s, f, st, w) {
	gr_ctx.font = (st || "normal") + " " + (w || "normal") + " " + s + "px " + (f ? f : gr_system_font);
}

function gr_fontsize(s, f) {
	gr_font(s, f);
}

function gr_text_c(x, y, text, color, max) {
	return gr_text_al(x, y, text, color, "center", "middle", max);
}

function gr_text_l(x, y, text, color, max) {
	return gr_text_al(x, y, text, color, "left", "top", max);
}

function gr_text_r(x, y, text, color, max) {
	return gr_text_al(x, y, text, color, "right", "top", max);
}

function gr_text_al(x, y, text, color, align, base, max) {
	max = max || gr_w;
		if (text) {
	
		text = text + "";
	
		var tt = text;
		
		if (text.includes("\n")) {
			
			var lines = text.split("\n");
			var h = 0;
			
			for (var i = 0; i < lines.length; i++) {
				h += gr_text_al(x, y + h, lines[i], color, align, base, max);
			}
			
			return h;
			
		} else {
		
			var lines = gr_fragment(text, max);
			
			var hdef = gr_ctx.font.split("p")[0] * 1.3;
			
			var h = 0;
			
			for (var i = 0; i < lines.length; i++) {
				
				gr_ctx.beginPath();
				gr_ctx.textAlign = align;
				gr_ctx.textBaseline = base;
				gr_ctx.fillStyle = color || "black";
				gr_ctx.fillText(lines[i], x, y + h, max);
				h += hdef;
				
			}
			
			return h;

		}
	
	}
}

function gr_fragment(text, maxWidth) {
	var words = text.split(' ');
	var lines = [];
	var line = "";
	
	if (gr_ctx.measureText(text).width < maxWidth) {
		return [text];
	}
	
	while (words.length > 0) {
		var split = false;
		while (gr_ctx.measureText(words[0]).width >= maxWidth) {
			var tmp = words[0];
			words[0] = tmp.slice(0, -1);
			if (split) {
				words[1] = tmp.slice(-1) + words[1];
			} else {
				split = true;
				words.splice(1, 0, tmp.slice(-1));
			}
		}
		if (gr_ctx.measureText(line + words[0]).width < maxWidth) {
			line += words.shift() + " ";
		} else {
			lines.push(line);
			line = "";
		}
		if (words.length === 0) {
			lines.push(line);
		}
	}
	
	for (var i = 0; i < lines.length; i++) {
		var l = lines[i];
		while (gr_ctx.measureText(l).width > maxWidth) {
			l = l.substr(0, l.length - 2);
		}
		
		if (l != lines[i]) {
			lines.splice(i + 1, 0, lines[i].substr(l.length));
			lines[i] = l;
		}
	}
	
	return lines;
}

function gr_rect(x, y, w, h, color) {
	gr_ctx.beginPath();
	gr_ctx.fillStyle = color;
	gr_ctx.fillRect(x, y, w, h);
}

function gr_rrect(x, y, w, h, color, r) {
	if (w < 2 * r) {
		r = w / 2;
	}
	if (h < 2 * r) {
		r = h / 2;
	}
	
	gr_ctx.beginPath();
	gr_ctx.moveTo(x + r, y);
	gr_ctx.arcTo(x + w, y, x + w, y + h, r);
	gr_ctx.arcTo(x + w, y + h, x, y + h, r);
	gr_ctx.arcTo(x, y + h, x, y, r);
	gr_ctx.arcTo(x, y, x + w, y, r);
	gr_ctx.closePath();
	
	gr_ctx.fillStyle = color;
	gr_ctx.fill();
}

function gr_line(x1, y1, x2, y2, color) {
	gr_ctx.beginPath();
	gr_ctx.moveTo(x1, y1);
	gr_ctx.lineTo(x2, y2);
	gr_ctx.strokeStyle = color;
	gr_ctx.stroke();
}

function gr_shadow(radius, color) {
	gr_ctx.shadowBlur = radius || 0;
	gr_ctx.shadowColor = color || "rgba(0,0,0,0.5)";
}

function mouse_over(x, y, w, h) {
	return (x + w > mouse_pos.x && x < mouse_pos.x && y + h > mouse_pos.y && y < mouse_pos.y);
}

function over(x, y, w, h) {
	return mouse_over(x, y, w, h) && (!kernel_mobile || mouse_start_over(x, y, w, h));
}

function mouse_start_over(x, y, w, h) {
	return (x + w > mouse_start_pos.x && x < mouse_start_pos.x && y + h > mouse_start_pos.y && y < mouse_start_pos.y);
}

function mouse_any_over(x, y, w, h) {
	for (var i = 0; i < mice.length; i++) {
		if (x + w > mouse_pos.x && x < mouse_pos.x && y + h > mouse_pos.y && y < mouse_pos.y) {
			return true;
		}
	}
	return false;
}

function mouse_info() {
	var text = "mouse\nx: " + mouse_pos.x + "px, y: " + mouse_pos.y + "px " + (mouse_down ? "down" : "not down");
	return text;
}

function gr_path(x, y, path, fill, stroke) {
	if (path.length > 0) {
		gr_ctx.beginPath();
		gr_ctx.moveTo(path[0][0] + x, path[0][1] + y);
		
		for (var i = 1; i < path.length; i++) {
			gr_ctx.lineTo(path[i][0] + x, path[i][1] + y);
		}
		
		gr_ctx.lineTo(path[0][0] + x, path[0][1] + y);
		gr_ctx.closePath();
		
		if (stroke) {
			gr_ctx.strokeStyle = stroke;
			gr_ctx.stroke();
		}
		
		if (fill) {
			gr_ctx.fillStyle = fill;
			gr_ctx.fill();
		}
		
	} else {
		console.info("empty path");
	}
}

function gr_info() {
	var text = "graphics\nw: " + gr_w + "px, h: " + gr_h + "px, frame: " + gr_frame_index + ", fps: " + gr_frame_rate + ", frame-delay: " + gr_frame_delay + "\n" +  gr_drawing_array.length + " drawing apps";
	
	var total = 0;
	
	for (var i = 0; i <  gr_drawing_array.length; i++) {
		var item =  gr_drawing_array[i];
		text += "\n " + (item.app.ui ? "⦿ " : "⦸ ") + (item.task.active ? "<b>" : "") + item.app.id + " (" + item.performance + "ms)" + (item.task.window ? " [" + item.task.window.x + ", " + item.task.window.y + ", " + item.zindex + " ]" : " [ no window ]") + (item.task.active ? "</b>" : "");
		
		total += item.performance;
	}
	
	
	return text + "\nTotal rendering time: " + total + "ms";
}

var mouse_down = false;

var gr_anim_curr = 0;
var gr_anim_done = 0;

function animation_info() {
	return "animations\ncurrent: " + gr_anim_curr + ", done: " + gr_anim_done;
}

function gr_clip(x, y, w, h) {
	gr_ctx.save();
	gr_ctx.rect(x, y, w, h);
	gr_ctx.clip();
}

function gr_noclip() {
	gr_ctx.restore();
}

function gr_map_path(path, w, h) {
	var mpath = [];
			
	for (var p = 0; p < path.length; p++) {
		mpath.push([
			path[p][0] / 100 * w,
			path[p][1] / 100 * h
		]);
	}
	
	return mpath;
}

function gr_animate(from, to, dur, fx, end) {
	var x = from;
	var run = true;
	gr_anim_curr++;
	var i = setInterval(function (i) {
		if (run) {
			fx(x);
		
			if ((from > to ? x < to : x > to)) {
				gr_anim_curr--;
				gr_anim_done++;
				clearInterval(i);
				run = false;
				if (end) { end(); }
			}
		
			x += (to - from) / dur * gr_frame_delay;
			
		}
		
	}, gr_frame_delay, i);
}
