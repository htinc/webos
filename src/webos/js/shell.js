function shell_exec(cmd, fx) {
	var cs = cmd.split(" ");
	
	if (cs.length == 0 || cmd == "") {
		fx("");
		return;
	}
	
	try {
	switch (cs[0]) {
		
		case "sleep":
			setTimeout(fx, cs[1], "");
			return;
		case "echo":
			fx(cs.slice(1).join(" "));
			return;
		case "tor":
			shell_tor(cs, fx);
			return;
		case "help":
			fx("webosSHELL HELP\n\n" +
				"echo <text>\n" +
				"sleep <ms>");
		case "lorem":
			var l = cs[1] || 100;
			
			var lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus ac nisl sodales, volutpat arcu et, pharetra metus. Sed porttitor, mauris vitae sagittis feugiat, sapien dolor egestas sapien, non molestie diam dui sit amet nibh. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Sed lacinia risus nec purus feugiat interdum. Integer quis nibh at nunc iaculis blandit et in tellus. Maecenas pretium diam purus, ac fringilla lacus consectetur non. Phasellus ut dui nec mauris eleifend pretium non sed libero. Pellentesque pretium tortor at augue volutpat volutpat. Mauris varius ac sem in suscipit. Nunc ante lacus, venenatis non dictum nec, tempus quis ipsum.\n\nVestibulum ipsum sapien, rutrum id sodales vitae, rutrum quis eros. Vivamus malesuada arcu sed ornare bibendum. Suspendisse mi sem, rutrum vitae tellus non, viverra accumsan tortor. Praesent auctor non nulla in condimentum. Donec eget purus dignissim turpis laoreet dignissim. Maecenas sagittis congue ipsum eu tincidunt. Mauris dictum arcu odio, nec lobortis tellus consequat a. Duis faucibus eros ut mi dictum, at cursus sem ornare. Nullam efficitur erat faucibus, tincidunt ante vitae, volutpat nulla. Ut dictum nec felis vitae venenatis. Nunc tellus orci, scelerisque eget mauris eu, aliquam aliquet eros. Etiam tincidunt viverra gravida.\n\nDuis et faucibus lectus. Praesent neque lectus, scelerisque sed dignissim non, placerat pretium arcu. Sed vehicula elit sem, eu suscipit libero fringilla vitae. In vitae quam molestie, facilisis ligula nec, efficitur odio. Ut bibendum feugiat ante et maximus. Fusce eleifend libero mauris, at scelerisque leo semper in. Aenean ultricies eu tellus sed ultricies. Curabitur tellus ipsum, aliquam ac pellentesque vitae, lobortis at eros. Nunc mattis leo nisi, in semper sem commodo et. Cras tempus ligula et nunc mattis volutpat. Donec quis elementum quam, nec volutpat metus. Aliquam erat volutpat. Vestibulum bibendum felis sed erat sodales bibendum. Vivamus vel tortor quis augue iaculis congue. Vestibulum faucibus elit laoreet turpis semper vehicula.\n\nMaecenas maximus ipsum vel consectetur euismod. Ut ac malesuada lectus. Duis ultricies magna sem, ut ultricies erat vulputate quis. Aenean arcu mauris, finibus fringilla neque in, rhoncus molestie libero. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas lacinia metus volutpat nisl elementum hendrerit. Sed nec lectus non ligula pharetra euismod nec sed diam. Sed imperdiet felis at diam efficitur sodales. Praesent fermentum id erat id pulvinar. Cras auctor neque id orci dapibus finibus.\n\nMaecenas faucibus velit et sollicitudin aliquam. Morbi ac nulla dui. Maecenas dapibus aliquet dui, lacinia lacinia urna porttitor at. Mauris facilisis urna tortor, ac aliquet justo pellentesque nec. Etiam ultricies est interdum enim viverra, sed sollicitudin orci aliquam. Curabitur vitae mattis risus, ut volutpat tortor. Fusce non lorem mauris. Nam vehicula odio eu lacinia fringilla. Phasellus ut euismod massa. Aenean tincidunt velit nulla. In condimentum aliquet diam. Praesent sem dui, posuere in posuere quis, facilisis ut nisl. Mauris rutrum lobortis lorem, vitae placerat purus ultrices id. Aenean at augue sed metus congue vulputate vel non sapien.";
			
			fx(lorem.substr(0, l));
			return;
			
		case "kernel": 
			var o = "";
			for (k in kernel) {
				o += k + "\n";
			}
			fx(o);
			return;
		case "top":
			var o = "";
			for (var t in tasks) {
				o += "\n" + tasks[t];
			}
			fx(o);
			return;
		case "rel": 
		case "reload":
			window.location += "";
			return;
		default:
			fx("command '" + cmd + "' not found");
		
	}
	} catch (e) {
		fx(e);
	}
	
}

var shell_task = start("shell");

var shell_data = {};

function shell_tor(cs, fx) {
	switch (cs[1]) {
		case "get":
			net.get(shell_task, "api/tors.php", function (d) {
				shell_data["torlist"] = d.split("\n");
				fx("ok");
			});
			return;
		case "top": 
			var t = cs[2] || 100;
			var o = "top " + t + " records";
			for (var i = 0; i < t; i++) {
				o += "\n" + shell_data["torlist"][i];
			}
			
			fx(o);
			return;
		case "is": 
			var o = "checking " + shell_data["torlist"].length + " records";
			
			for (var i = 0; i < shell_data["torlist"].length; i++) {
				if (shell_data["torlist"][i] == cs[2]) {
					fx(o + "\ntrue");
					return;
				}
			}
			fx(o + "\nfalse");
			return;
		default:
			
	}
	
	fx("tor\n\n" + 
		"list     get all tor end nodes" +
		"is <ip>  is tor end node?");
	return;
}