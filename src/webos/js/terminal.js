var terminal_app = {
	id: "com.system.terminal",
	name: "Terminal",
	ui: true,
	background: "rgba(0,0,0,0.6)",
	path: [
		[10,10],
		[15,10],
		[30,30],
		[15,50],
		[10,50],
		[25,30],
		[10,10],
		[10,10],
		[10,10],
	],
	window: {
		w: 300,
		h: 300
	},
	data: {
		inputs: [],
		output: "",
		input: "",
		view: "",
		keyboardId: 0
	},
	init: function(win) {},
	load: function (win) {
		terminal_app.login(win);
		
		win.key = function (e) {
			
			if (e.key == "\n") {
				
				win.title = win.data.input;
				
				async(function () {
					shell_exec(win.data.input, function (res) {
						win.data.output += win.data.input + "\n" + res + "\n$ ";
						
						win.title = terminal_app.name;
					});
				
					win.data.input = "";
				
					e.clear();
				});
			} else {
			
				win.data.input = e.buffer;
				
			}
			
			win.data.view = win.data.output + win.data.input;
			
		}
	},
	draw: function (win) {
		//win.rect(0, 0, win.w - 5, win.h, "black");
		gr_fontsize(15, "monospace");
		gr_text_l(win.x + 3, win.y + window_header_height, win.data.view, "white", win.w);
	},
	login: function (win) {
		win.data.output = kernel_user_info().name + "@" + net.ip() + " at " + time() + "\n$ ";
		win.data.view = win.data.output;
	},
	focus: function (win) {
		//alert(1);
		win.data.keyboardId = keyboard_subscribe(win.key);
	},
	blur: function (win) {
		//alert(2);
		keyboard_unsubscribe(win.data.keyboardId);
	}
}

kernel_register_app(terminal_app);
