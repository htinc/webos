var dock_app = {
	id: "dock.system.com",
	name: "dockd",
	zindex: 1000,
	data: {
		apps: [],
		open: false,
		last_mouse_down: false,
		list_index: 0,
		color: "rgba(0,0,0,0.8)",
		height: gr_bottom
	},
	ui: false,
	window: {
		x: 0,
		y: 0,
		w: gr_w,
		h: gr_h,
		style: 1
	},
	init: function () {
		dock_app.data.apps = ["a", "b", "c"];
		dock_app.data.open = false;
		dock_app.data.last_mouse_down = false;
		dock_app.data.list_index = 0;
	},
	draw: function () {

		var height = dock_app.data.height;
	
		gr_rect(0, gr_h - height, gr_w, height, dock_app.data.color);

		if (over(0, gr_h - height, gr_w, height) && !mouse_down && mouse_last_down && !keyboard_visible) {
			dock_app.data.open = !dock_app.data.open;
		}
	
		if (dock_app.data.open) {
			gr_rect(0, 0, gr_w, gr_h, dock_app.data.color);
			dock_app.data.list_index = 0;
			dock_app.list_item("Command Prompt", function () {
				start_app(terminal_app);
				dock_app.data.open = false;
			});
			dock_app.list_item("Reboot", function () {
				kernel_reboot();
			});
			dock_app.list_item("Tasklist", function () {
				alert("tlist");
			});
		} else {
	
			gr_line(height, gr_h - height, height, gr_h, "#666");
	
			//gr_line(height / 4, height / 4 + gr_h - height, height / 4 + height - height / 2, gr_h - height / 4, "white");
	
			for (var i = 0; i < dock_app.data.apps.length; i++) {
				
			}
		}
	
		dock_app.data.last_mouse_down = mouse_down;
	},
	list_item: function (name, fx) {
		var s = 20;
		var o = 10;
		gr_fontsize(s);
		var x = o;
		var y = dock_app.data.list_index * (s + o * 2) + o + status_options.height + status_options.offset * 2;
		gr_text_l(x, y, name, mouse_over(x, y, gr_w, s + o * 2) ? "#ddd" : "white");
		if (mouse_down && mouse_over(x, y, gr_w, s + o * 2) && !dock_app.data.last_mouse_down) {
			fx();
		}
		dock_app.data.list_index++;
	},
	onquit: function () {
		
	}
}

kernel_register_app(dock_app);
