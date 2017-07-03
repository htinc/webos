function mem_init() {
	kernel_info_functions.push(function () {
		var text = kernel_apps;
		
		mem_save("k", 1);
		text += mem_load("k");
		
		return text;
	});
}

function mem_save(key, data) {
	localStorage.setItem(key, data);
}

function mem_load(key) {
	return localStorage.getItem(key);
}

var mem_get = mem_load;
var mem_set = mem_save;