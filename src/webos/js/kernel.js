var tasks = {};

var debugElement;
var tasksElement;

var kernel_net_task;
var kernel_task;

var kernel_mobile;

var kernel_boot_count = 0;

var kernel_keychain;

var kernel_window_element;

var kernel_ip;

var kernel_ip_info;

var kernel_info_functions = [];

function kernel_init(e) {
	
	kernel_info_functions = [];
	
	window.onerror = function(message, url, lineNumber) {
		kernel_fail(message + "\n\n\n" + url + "::" + lineNumber);
		return true;
	};
	
	mem_init();
	
	document.body.innerHTML += "<div id='info'><pre id='kernel_info'></pre><table><tbody id='kernel_tasks'></tbody></table><pre id='kernel_debug'></pre></div>";
	debugElement = document.getElementById("kernel_debug");
	tasksElement = document.getElementById("kernel_tasks");
	kernel_window_element = e;

	setInterval(function () {
		kernel_info();
	}, 100);

}

function kernel_info() {
	var text = Object.keys(tasks).length + " tasks overall\n";

	var inactive_tasks = 0;
	var active_tasks = 0;
	var tasks_mainthread = 0;

	for (i in tasks) {
		switch (tasks[i].state) {
			case 1:
				active_tasks++;
			case 2:
				inactive_tasks++;
		}
		
		if (tasks[i].mainthread) {
			tasks_mainthread++;
		}
	}
	
	text += active_tasks + " active, " + inactive_tasks + " inactive, " + tasks_mainthread + " mainthread";
	
	text += "\n" + kernel_apps.length + " registred apps";

	var e = document.getElementById("kernel_info");
	e.innerHTML = text;
	
	for (var i = 0; i < kernel_info_functions.length; i++) {
		e.innerHTML += "<hr>" + kernel_info_functions[i]();
	}
	
	for (var i = 0; i < kernel_apps.length; i++) {
		var app = kernel_apps[i];
		e.innerHTML += "<hr>\n" + app.name + "\t";
		for (var i in app.data) {
			e.innerHTML += "\n\t" + i + ": " + app.data[i];
		}
	}
}

function kernel_start_task(name, init) {
	var id = kernel_id_gen(name);
	
	tasks[id] = {
		init: init,
		name: name,
		id: id,
		start: Date.now(),
		state: 0
	};
	
	if (tasksElement) {
		
		/*var c = arguments.callee;
		var name = c.name;
		
		for (var i = 0; i < 10 && c.caller; i++) {
			name += "$" + c.name;
			c = c.caller.caller;
		}*/
		
		var name = "";//(new Error()).stack;
		
		tasksElement.innerHTML += "<tr id='" + id + "'><td id='" + id + "_status'>&#8986;</td><td>" + name + "</td><td>" + id + "</td><td>" + new Date(tasks[id].start).toLocaleTimeString() + "</td><td><pre>" + name + "</pre></td></tr>";
	}
	
	var scope = {
		task: tasks[id],
		log: function (text) {
			kernel_log(scope.task, text);
		},
		error: function (text) {
			kernel_log_error(scope.task, text);
		},
		get: function (url, fx) {
			net_get(scope.task, url, fx);
		},
		post: function (url, fx, data) {
			net_post(scope.task, url, fx, data);
		}
	};
	
	if (tasks[id].init) {
		tasks[id].state = 1;
		async(tasks[id].init(scope));
	}
	
	return tasks[id];
}

var start = kernel_start_task;

function kernel_task_end(id) {
	var e = document.getElementById(id + "_status");
	e.innerHTML = "&#10004;";

	tasks[id].state = 2;
	
	if (tasks[id].mainthread) {
		clearInterval(tasks[id].mainthread);
	}

	if (tasks[id].onquit) {
		tasks[id].onquit();
	}
	
	if (tasks[id].window) {
		gr_remove_drawer(tasks[id]);
	}
	
	setTimeout(function () {
		e.parentElement.style.display = "none";
	}, 1000);
}

function start_app(app) {
	
	status_items = app.status;
	var task = start(app.id, app.init);
	
	if (app.window) {
		task.window = create_window(task, app.window.title || app.name, 100, 100, app.window.w, app.window.h, app.window.style, app);
		
		if (app.load) {
			app.load(task.window);
		}
	}
	
	gr_register_drawer(app, task);
	
	kernel_log(kernel_task, "started app: " + app.id, "green");
	
	return task;
}

function async(fx) {
	var task = start("async-x");
	setTimeout(function () {
		kernel_log(task, "async start");
		if (fx) { 
			fx();
		}
		kernel_log(task, "async end");
		kernel_task_end(task.id);
	}, 0);
}

function net_get(task, url, fx) {
	net_request(task, "GET", url, fx);
}

function net_post(task, url, fx, data) {
	net_request(task, "POST", url, fx, data);
}

function net_request(task, method, url, fx, data) {

	kernel_log(task, method + ": " + url);
	
	var oReq = new XMLHttpRequest();
	oReq.addEventListener("load", function () {
	
		fx(this.responseText);
		
	});
	oReq.onerror = function () {
		
		kernel_log_error(task, "error loading " + method + ": " + url);
		
	};
	oReq.open(method, url, data, true);
	oReq.send();
}

function kernel_get_tasks(name) {
	var tasks = [];
	for (i in tasks) {
		if (i.includes(name + "_")) {
			tasks.push(tasks[i]);
		}
	}
	return tasks;
}

function kernel_log_error(task, text) {
	kernel_log(task, text, "red");
}

function kernel_log(task, text, color) {
	if (debugElement.children.length > 32) {
		debugElement.removeChild(debugElement.children[0]);
	}
	debugElement.innerHTML += "<div>[ <span style='color: " + (color || "#444") + "'>" + task.id + "</span> ] " + text + "</div>";
}

function kernel_id_gen(name) {
	var symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	name += "_";
	while (name.length < 32) {
		name += symbols[Math.floor(Math.random() * (symbols.length - 1))];
	}
	return name;
}

function kernel_keychain_set(kc) {
	kernel_log(kernel_task, "kc installed");
	kernel_keychain = kc;
	kernel_log(kernel_task, "addrx: " + kc.address);
	
	kernel_ip = kernel_keychain.address;
}

function kernel_fail(message) {
	gr_drawing_array = [];
	clearInterval(gr_main_thread);
	mouse_style = 1;
	gr_fontsize(14, "courier");
	gr_clear("blue");
	gr_text_l(0, 0, "System shutdown\nYes. It failed. What a wonder\n\nError " + message + "\n\n\n" + (new Error()).stack, "white", gr_w);
	kernel_log_error(kernel_task, "KERNEL FAIL: " + message);
	
	if (confirm(message) + "\n\n\n" + (new Error()).stack) {
		shell_exec("rel");
	}
}

function kernel_reboot() {

	console.info("\n\n%cNot a page load. Just a VM-reboot (" + (kernel_boot_count + 1) + ")\n\n\n", "font-weight: bold");

	kernel_force_reboot();

	boot(kernel_window_element, kernel_mobile);
	
}

function kernel_force_reboot() {

	kernel_boot_count++;

	for (id in tasks) {
		kernel_task_end(id);
	}

	var id = window.setTimeout(function() {}, 0);
	while (id--) { window.clearTimeout(id); }
	
	id = window.clearInterval(function() {}, 10000);
	while (id--) { window.clearInterval(id); }

	tasks = {};
	
	gr_clear("black");

}

var kernel_apps = [];

function kernel_register_app(app) {
	kernel_apps.push(app);
}

function kernel_ui_apps() {
	var apps = [];
	for (var i = 0; i < kernel_apps.length; i++) {
		if (kernel_apps[i].ui) {
			apps.push(kernel_apps[i]);
		}
	}
	return apps;
}

function kernel_user_info() {
	return {
		name: "Levi"
	}
}

function time() {
	return dt_fill((new Date()).getHours()) + ":" + dt_fill((new Date()).getMinutes());
}

function dt_fill(t) {
	return t > 9 ? t : "0" + t;
}

var kernel = {
	tasks: tasks,
	genId: kernel_id_gen,
	log: kernel_log,
	error: kernel_log_error,
	taskByName: kernel_get_tasks,
	start: start,
	task: kernel_task
}

var launchd = {
	start: start
}

var net = {
	task: kernel_net_task,
	get: net_get,
	post: net_post,
	request: net_request,
	ip: function () {
		return kernel_ip;
	}
}
