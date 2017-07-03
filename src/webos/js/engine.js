var engine_create_app_queue = [];

function create_app(data) {
	engine_create_app_queue.push(data);
}

function engine_create_app(data) {

	eval("var xapp = " + data);

	var app = {
		id: xapp.info.id,
		name: xapp.info.name,
		background: "#fff",
		ui: true,
		data: {
			data: data,
			page: "index"
		},
		window: {
			w: gr_w / 2,
			h: gr_hh / 2,
		},
		data: {},
		init: function (win) {
			engine_init(app, win);
		},
		load: function (win) {
			engine_load(win, data);
		},
		draw: function (win) {
			engine_draw(app, win, win.data.data);
		}
	}
	
	kernel_register_app(app);
	
	engine_create_app_queue.splice(engine_create_app_queue.indexOf(data), 1);
}

function engine_init(app, win) {
}

function engine_load(win, input) {

	eval("var app = " + input);
	
	win.data.data = app;
	
	app.navigator = {
		history: [],
		push: function (page) {
			this.history.push(page);
			win.data.page = page;
		},
		pop: function () {
			this.push(this.history.pop());
		}
	}
	
	//_alert(app.navigator.push("index"));
	
	win.data.page = "index";
	
	var page = app[win.data.page];
	
	for (var i = 0; i < page.elements.length; i++) {
	
		var e = page.elements[i];
		
		if (e.list) {
			e.list.setItem = function (item, index) {
				e.list.__items[index] = item;
			}
			
			e.list.getItem = function (index) {
				return e.list.__items[index];
			}
			
			e.list.getItems = function () {
				return e.list.__items;
			}
		}
	}
}

function engine_draw(app, win, data) {
	
	var p = win.data.page;
	var page = data[p];
	
	var h = window_header_height;
	
	win.title = val(page.title);
	
	//_alert(win.task);
	
	for (var i = 0; i < page.elements.length; i++) {
	
		var e = page.elements[i];
		
		if (e.title) {
			
			gr_font(font_title);
			gr_text_l(win.x + 5, win.y + h + 5, val(e.title), "black");
			
			h += font_title * 1.2 + 10;
			
		}
		
		if (e.list) {
			
			h += engine_scrollview(win, win.x, win.y + h, win.w, win.h - h + window_header_height, function (x, y, scroller) {
				var template = val(e.list.template);
				
				if (e.list.__items) {
				
					var hh = val(template.height);
				
					var start = -Math.floor((y - h - win.y) / hh) - 1;
					
					if (start < 0) {
						start = 0;
					}
					
					var end = start + Math.ceil(win.h / hh) + 1;
					
					if (end >= e.list.__items.length) {
						end = e.list.__items.length;
					}
					
					var top = y;
					
					for (var z = 0; z < start; z++) {
						top += val(template.height, e.list.__items[z], z);
					}
					
					for (var z = start; z < end; z++) {
				
						var item = e.list.__items[z];
						
						hh = val(template.height, item, z);
					
						gr_rect(x, top, win.w, hh, "#fff");
				
						gr_line(x, top, x + win.w, top, "#ddd");
					
						if (template.main) {
							gr_font(font_text);
							gr_text_l(x + 8, top + 8, val(template.main, item, z), "black");
						} 
						
						if (template.value) {
							gr_font(font_text);
							gr_text_r(x + win.w - 8, top + 8, val(template.value, item, z), "gray");
						} 
					
						if (template.sub) {
							gr_font(font_small);
							gr_text_l(x + 8, top + (template.main ? 27 : 8), val(template.sub, item, z), "black");
						}
						
						if (!mouse_down && mouse_last_down && mouse_over(x, top, win.w, hh) && scroller && !scroller.moving) {
							e.list.select ? e.list.select(item, z) : '';
						}
						
						top += hh;
					
					}
				
					return {
						h: hh * e.list.__items.length,
						w: win.w
					}
					
				} else {
				
					e.list.__items = val(e.list.items);
					
					return {
						h: 0,
						w: win.w
					}
				
				}
				
			}, !win.active).h;
		}
	}
}

function engine_scrollview(ctx, ix, iy, w, h, fx, scrolllock) {
	if (!ctx.scroller) {
		gr_clip(ix, iy, w, h);
		
		ctx.scroller = {
			pos: {
				x: 0,
				y: 0
			},
			max: fx(ix, iy, ctx.scroller),
			bounce: {
				x: 0,
				y: 0
			},
			bouncing: false,
			moving: false
		}
		
		gr_noclip();
	}
	
	var x = ix + ctx.scroller.pos.x;
	var y = iy + ctx.scroller.pos.y;
	
	if (!scrolllock && mouse_down && mouse_last_down && (ctx.scroller.max.h > h || ctx.scroller.max.w || w) && mouse_over(ix, iy, w, h)) {
		ctx.scroller.pos.x -= w == ctx.scroller.max.w ? 0 : Math.pow(mouse_last_pos.x - mouse_pos.x, 2);
		
		ctx.scroller.pos.y -= h == ctx.scroller.max.h ? 0 : (Math.abs(mouse_last_pos.y - mouse_pos.y) > 10 ?Math.pow(Math.abs(mouse_last_pos.y - mouse_pos.y) / 5, 2) * (mouse_last_pos.y - mouse_pos.y > 0 ? 1 : -1) : mouse_last_pos.y - mouse_pos.y);
		
		ctx.scroller.bounce.y = mouse_last_pos.y - mouse_pos.y;
		ctx.scroller.bounce.x = mouse_last_pos.x - mouse_pos.x;
		
		if (Math.abs(mouse_last_pos.y - mouse_pos.y) > 2 || Math.abs(mouse_last_pos.x - mouse_pos.x) > 2) {
			ctx.scroller.moving = true;
		}
		
	}
	
	if (!mouse_down && !mouse_last_down && !ctx.scroller.bouncing) {
		ctx.scroller.moving = false;
	}
	
	if (!scrolllock && mouse_last_down && !mouse_down) {
		ctx.scroller.bouncing = true;
	}
	
	if (ctx.scroller.bouncing) {
		ctx.scroller.pos.y -= ctx.scroller.bounce.y;
		ctx.scroller.bounce.y /= 1.2;
		
		if (Math.abs(ctx.scroller.bounce.y) < 0.1) {
			ctx.scroller.bouncing = false;
		}
	}
	
	var over = false;
	
	if (ctx.scroller.pos.y > 0) {
		if (!mouse_down) {
			ctx.scroller.pos.y = 0;
		}
		
		y = iy;
		over = true;
	}
	
	if (-ctx.scroller.pos.y > ctx.scroller.max.h - h) {
		if (!mouse_down) {
			ctx.scroller.pos.y = -(ctx.scroller.max.h - h);
		}
		
		y = iy - ctx.scroller.max.h + h;
		over = true;
	}
		
	gr_clip(ix, iy, w, h);
	ctx.scroller.max = fx(x, y, ctx.scroller);
	
	if (over) {
		if (ctx.scroller.pos.y > 0) {
			gr_rect(ix, iy, w, ctx.scroller.pos.y, "rgba(0,0,0,0.4)");
		}
	
		if (-ctx.scroller.pos.y > ctx.scroller.max.h - h && ctx.scroller.max.h > h) {
			gr_rect(ix, iy + h, w, ctx.scroller.pos.y + ctx.scroller.max.h - h, "rgba(0,0,0,0.4)");
		}
	}
	
	var bar = {
		w: 10,
		h: 10,
		c: "red"
	}
	
	// gr_shadow(20);
	// gr_line(ix, iy, ix + w, iy);
	// gr_shadow();
	
	// gr_rect(ix + w - bar.w, iy - y * (h / ctx.scroller.max.h), bar.w, (h / ctx.scroller.max.h), bar.c);
	
	gr_noclip();

	return {
		w: w > ctx.scroller.max.w ? w : ctx.scroller.max.w,
		h: h > ctx.scroller.max.h ? h : ctx.scroller.max.h
	}
}

function _alert(o) {
	try {
		alert(JSON.stringify(o));
	}
	catch (er) {
		alert(er + "\n\n" + Object.keys(o));
	}
}

function val(x, a, b, c, d, e, f, g, h, i) {
	try {
		return x(a, b, c, d, e, f, g, h, i);
	} catch (e) {
		return x;
	}
}

function load_shop_app(id) {
	var imported = document.createElement('script');
	imported.src = 'api/app.php?id=' + id;
	document.head.appendChild(imported);
}

load_shop_app("xtest");
