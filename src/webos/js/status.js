/*var status_options = {
	offset: 3,
	height: 24
}*/

var status_options = {
	offset: 0,
	height: 0
}

var status_bar_app = {
	id: "status-bar.system.com",
	name: "status bar",
	ui: false,
	init: function () {},
	draw: status_draw,
	zindex: 1001
}

var status_color = "white";

var status_items = {};

function status_draw() {
	
	gr_fontsize(status_options.height - status_options.offset * 2);
	
	gr_rect(0, 0, gr_w, status_options.height + status_options.offset * 2, "rgba(0,0,0,0.8)");
	
	gr_text_l(status_options.offset, status_options.offset, net.ip(), "rgba(255,255,255,0.2)");
	gr_text_r(gr_w - status_options.offset * 2, status_options.offset, kernel_ip_info.org, "rgba(255,255,255,0.2)");
	
	gr_text_r(gr_w - status_options.offset, status_options.offset, time(), status_color);
	
	gr_text_l(status_options.offset * 3 + status_options.height, status_options.offset, (status_items ? Object.keys(status_items) : ""), status_color);
	
	gr_path(status_options.offset * 2, status_options.offset * 2, gr_map_path(gr_logo_path, status_options.height - status_options.offset * 2, status_options.height - status_options.offset * 2), 0, status_color);
	
	if (!mouse_down && mouse_last_down && mouse_over(status_options.offset * 2, status_options.offset * 2, status_options.height - status_options.offset * 2, status_options.height - status_options.offset * 2)) {
		
		dock_app.data.open = !dock_app.data.open;
		
	}
}
