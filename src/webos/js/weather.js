/*create_app({
	info: {
		name: "Test weather",
		id: "com.test.weather"
	},
	index: {
		title: "Weather Test",
		elements: [
			{
				list: {
					source: "/api/w.php",
					height: 60,
					template: {
						main: function (item) {
							return item.name;
						},
						sub: function (item) {
							return item.value + "°";
						}
					}
				}
			}
		]
	}
});*/
