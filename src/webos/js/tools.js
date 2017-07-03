function io_get_files(path) {
	var files = [];
	for (var i = 0; i < 100; i++) {
		files.push(i + ".html");
	}
	return files;
}

function io_desktop() { return "/desktop"; }

var tools_app = {

	id: "tools.system.com",
	status: {},
	name: "tools",
	background: "#eee",
	ui: false,
	window: {
		x: 0,
		y: 0,
		w: gr_w,
		h: gr_h,
		style: -1
	},
	data: {
		files: [],
		present: true
	},
	init: function ($) {
		tools_app.data.files = kernel_ui_apps();
		tools_app.data.present = true;
		//io_get_files(io_desktop());
	},
	draw: function ($) {
		
		gr_clear(tools_app.background);
		
		tools_app.data.files = kernel_ui_apps();
		
		var space = 5;
		var rows = 3;
		var s = gr_w / rows - space * 2;
		rows = (s > 200 ? Math.floor(gr_w / 100) - 1 : rows)
		s = (s > 200 ? 100 : s);
		var topoffset = status_options.height + status_options.offset * 2;

		for (var i = 0; i < tools_app.data.files.length; i++) {
			var item = tools_app.data.files[i];
			
			var x = s * (i % rows) + space * 2 * (i % rows) + space;
			var y = Math.floor(i / rows) * s + status_options.height + status_options.offset + space * 2 * Math.floor(i / rows) + space;
			
			if (mouse_over(x, y, s, s)) {
				gr_rect(x, y, s, s, "rgba(0, 122, 250, 0.1)");
			}
			
			var path = item.path || [[0, 0], [0, 100], [100, 100], [100, 0]];
			
			
			gr_path(x + 18, y + 4, gr_map_path(path, s - 40, s - 40), "#007afa");
			
			gr_fontsize(15);
			gr_text_c(x + s / 2, y + s - 16, item.name, "black");
			
			if (mouse_over(x, y, s, s) && !mouse_down && mouse_last_down && $.active) {
				$.active = false;
				var task = start_app(item);
				task.window.active = true;
			}
		}
	}
}

kernel_register_app(tools_app);
