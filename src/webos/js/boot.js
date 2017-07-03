function boot(e, mobile) {
	
	kernel_init(e);
	
	kernel_mobile = mobile;
	
	start("bootrd", function ($) {
	
		mouse_style = 0;
		boot_text_buffer = "";
		  
		gr_init();
		gr_clear("black");
		boot_status_text("graphics init");
		
		boot_status_text("starttask kkern");
		kernel_task = start("kkern");
		
		boot_status_text("starttask net");
		kernel_net_task = start("net");
		
		boot_status_text("loaded modules");
		
		if (window.performance.getEntries) {
		
		var ressources = window.performance.getEntries();
			for (var i = 0; i < ressources.length; i++) {
				var r = ressources[i];
				boot_status_text(" " + r.name + " [" + r.initiatorType + "/" + r.entryType + "] [" + r.encodedBodySize + "->" + r.decodedBodySize + "]");
			}
		
		}
		
		boot_status_text("keychains");
			  
		$.get("api/keychain.php", function (d) {
			boot_status_text("keychains " + d);
			kernel_keychain_set(JSON.parse(d));
			
			boot_status_text("keyboard");
			keyboard_begin(e.id);
			
			boot_status_text("ipadinf");
				
			$.get("api/ipinfo.php?ip=" + kernel_ip, function (d) {
					  
				boot_status_text("inpinfo " + d);
				
				if (window.performance.memory) {
					boot_status_text("mem usage " + window.performance.memory.usedJSHeapSize + " used " + window.performance.memory.totalJSHeapSize + " alloc " + window.performance.memory.jsHeapSizeLimit + " limit");
					
				}
				
				if (window.performance.timing) {
					boot_status_text("timing " + JSON.stringify(window.performance.timing, null, 2));
				}
				
				
				kernel_ip_info = JSON.parse(d);
				
				boot_status_text("");
				
				gr_animate(0, (gr_h > gr_w ? gr_h : gr_w), 1000, function (x) {
										
					gr_circle(gr_w / 2, gr_h / 2, x, "white");
										
					gr_fontsize(40);
					gr_text_c(gr_w / 2, gr_h / 2, "webOS", "black");
					
					
				}, function () {
					
					gr_start_main_thread();
					
					start_app(tools_app);
					start_app(dock_app);
					start_app(status_bar_app);
					kernel_task_end($.task.id);
				
				});
			});	
		});
	});
}

var boot_text_buffer = "";

function boot_status_text(text) {
	
	gr_fontsize(10, "monospace");
	gr_text_l(0, 0, boot_text_buffer + text, "white");
	
	for (var i = 0; i < text.split("\n").length; i++) {
		boot_text_buffer += "\n";
	}
	
	// gr_rect(0, gr_h - 50, gr_w, 50, "black");
	// gr_fontsize(15);
	// gr_text_c(gr_w / 2, gr_h - 25, text, "white");
}
