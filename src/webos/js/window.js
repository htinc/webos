var window_header_height = 50;
var window_snapping_size = 20;

function create_window(task, title, x, y, h, w, style, app) {

	var win = {
		task: task,
		title: title || "Unknown window",
		x: x,
		y: status_options.height + status_options.offset * 2 + y,
		h: h,
		w: w,
		moving: false,
		active: false,
		style: style || 2,
		last_mouse: {
			x:0,
			y:0
		},
		view: {
			frame: {
				x: 0, 
				y: 0, 
				w: 0, 
				h: 0
			},
			subview: {},
			render: function () {
				win.view.subview.render();
			}
		},
		button: function (x, y, w, h, c1, c2, fx) {
			create_button(win, x, y, w, h, c1, c2, fx)();
		},
		rect: function (px, py, pw, ph, color) {
			gr_rect(px + win.x, py + win.y + window_header_height, pw, ph, color);
		},
		draw: function () {
		
			if (win.style == 2) {
			
				win.view.frame = win.task.window;
				
				if (win.task.active && win.moving) {
				
					if (mouse_pos.x > gr_w - window_snapping_size) {
					
						gr_rect(gr_w / 2, gr_top, gr_w / 2, gr_hh, "rgba(0,0,0,0.2)");
						
						if (!mouse_down && mouse_last_down) {
							win.x = gr_w / 2;
							win.y = gr_top;
							win.w = gr_w / 2;
							win.h = gr_hh - window_header_height;
						}
					}
					
					if (mouse_pos.x < window_snapping_size) {
					
						gr_rect(0, gr_top, gr_w / 2, gr_hh, "rgba(0,0,0,0.2)");
						
						if (!mouse_down && mouse_last_down) {
							win.x = 0;
							win.y = gr_top;
							win.w = gr_w / 2;
							win.h = gr_hh - window_header_height;
						}
					}
					
					if (mouse_pos.y < window_snapping_size + gr_top) {
					
						gr_rect(0, gr_top, gr_w, gr_hh, "rgba(0,0,0,0.2)");
						
						if (!mouse_down && mouse_last_down) {
							win.x = 0;
							win.y = gr_top;
							win.w = gr_w;
							win.h = gr_hh - window_header_height;
						}
					}
				}
			
				gr_shadow(win.active ? 40 : 20);
				
				if ((over(win.x, win.y, win.w - window_header_height, window_header_height) || win.moving) && mouse_down && win.task.active && mouse_last_down) {
				 
					win.x += mouse_pos.x - mouse_last_pos.x;
					win.y += mouse_pos.y - mouse_last_pos.y;
					
					mouse_style = 2;
					
					win.view.frame = {
						x: win.x,
						y: win.y - status_options.height - status_options.offset * 2,
						w: win.w,
						h: win.h
					};
					
					if (win.x < 0) {
						win.x = 0;
					}
					
					if (win.y < status_options.height + status_options.offset * 2) {
						win.y = status_options.height + status_options.offset * 2;
					}
					
					gr_shadow(80);
					
					win.moving = true;
				
				} else {
					
					win.moving = false;
					
				}
				
				if (win.task.active && win.x + win.w > mouse_pos.x && win.x + win.w < mouse_pos.x + 20) {
					mouse_style = 5;
				}
				
				win.last_mouse = mouse_pos;
			
				gr_rect(win.x, win.y, win.w, win.h + window_header_height, app.background || "white");
				gr_shadow();
			
				gr_rect(win.x, win.y, win.w, window_header_height, "#ddd");
			
				var color = win.active ? "black" : "#666";
			
				win.button(win.w - window_header_height, -window_header_height, window_header_height, window_header_height, "#ddd", "red", function () {
					kernel_task_end(task.id);
					color = "white";
				});
			
				var offset = window_header_height / 3;
				gr_line(win.x + win.w - window_header_height + offset, win.y + offset, win.x + win.w - offset, win.y + window_header_height - offset, color);
				gr_line(win.x + win.w - offset, win.y + offset, win.x + win.w - window_header_height + offset, win.y + window_header_height - offset, color);
			
				gr_fontsize(window_header_height - offset * 2);
				gr_text_l(win.x + offset, win.y + offset - 2, win.title);
				
				/*gr_clip(win.x, win.y, win.w, win.h);
			
				win.view.render();
				win.view.subview.color = "transparent";*/
				
			}
			
		}
	}
	
	win.data = JSON.parse(JSON.stringify(app.data));
	
	win.view.subview = view(win.x, win.y + window_header_height, win.w, win.h, win.view, "black");
	
	/*if (kernel_mobile) {
		win.x = 0;
		win.y = 0;
		win.w = gr_w;
		win.h = gr_h;
	}*/
	
	return win;
}

function view(x, y, w, h, parent, color) {
	var v = {
		frame: {
			x: x,
			y: y,
			w: w,
			h: h
		},
		color: color,
		parent: parent,
		subviews: [],
		render: function () {
			if (v.color) {
				gr_rect(v.abs_x(), v.abs_y(), v.frame.w, v.frame.h, v.color);
			}
			
			for (var i = 0; i < v.subviews.length; i++) {
				v.subviews[i].render();
			}
		},
		abs_x: function () {
			var x = v.parent.frame.x;
			var e = v;
			do {
				x += e.frame.x;
				e = e.parent;
			} while (e.parent);
			return x;
		},
		abs_y: function () {
			var y = v.parent.frame.y;
			var e = v;
			do {
				y += e.frame.y;
				e = e.parent;
			} while (e.parent);
			return y;
		}
	}
	return v;
}

function create_button(win, x, y, w, h, c1, c2, fx) {
	return function () {
		var c = c1;
		if (win.active && mouse_over(x + win.x, y + win.y + window_header_height, w, h)) {
			c = c2;
			if (!mouse_down && mouse_last_down && win.active) {
				fx();
			}
		}
		win.rect(x, y, w, h, c);
	}
}
