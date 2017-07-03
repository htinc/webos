{
	info: {
		name: "Weather",
		id: "com.test.weather"
	},
	data: {
		location: {}
	},
	location: {
		title: function () {
			return app.data.location.name;
		},
		elements: [
			{
				title: function () {
					return app.data.location.values[0];
				}
			},
			{
				list: {
					items: function () {
						return app.data.location.values.slice(1);
					},
					template: {
						height: 35,
						main: function (item, index) {
							return index;
						},
						value: function (item) {
							return item;
						}
					}
				}
			}
		]
	},
	index: {
		title: "Weather Test",
		elements: [
			{
				list: {
					items: function () {
						var is = [];
						
						for (var i = 0; i < 100; i++) {
							var vs = [];
							
							for (var v = 0; v < 10; v++) {
								vs.push(Math.random());
							}
							
							is.push({
								name: "Test" + Math.random(),
								values: vs
							});
						}
						
						return is;
					},
					select: function (item) {
						app.data.location = item;
						app.navigator.push("location");
					},
					template: {
						height: function (item, index) {
							return (item && item.open) ? 200 : 50;
						},
						main: function (item) {
							return item.name;
						},
						sub: function (item) {
							if (item.open) {
								return item.values.join("°\n");
							} else {
								return item.values[0] + "°";
							}
						}
					}
				}
			}
		]
	}
}