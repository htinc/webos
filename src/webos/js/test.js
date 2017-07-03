var test_app = {
	id: "test.system.com",
	status: {
		"File": {
			"Save": function () {
				alert("Save!!!");
			}
		}
	},
	name: "test",
	background: "orange",
	ui: true,
	window: {
		w: 500,
		h: 300,
		title: "Test Application"
	},
	data: {
		files: [],
		text: ""
	},
	init: function ($) {
		tools_app.data.files = kernel_ui_apps();
		
		//io_get_files(io_desktop());
	},
	load: function (win) {
		var text = "";
		var chs = "abcdefghijklmnopqurstuvwxyz    \n";
		chs += chs.toUpperCase();
		
		for (var i = 0; i < 100; i++) {
			text += chs[Math.floor(Math.random() * (chs.length - 1))];
		}
		
		win.data.text = text;
	},
	draw: function (win) {
		win.rect(10, 10, win.w - 20, win.h - 20, "pink");
		
		gr_text_l(win.x, win.y + window_header_height, win.data.text, "red", win.w);
	}
};

kernel_register_app(test_app);
