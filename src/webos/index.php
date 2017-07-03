<script src="js/kernel.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/boot.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/graphics.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/engine.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/shell.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/keyboard.js?v=<?= rand(0, 1000) ?>" defer></script>

<script src="js/tools.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/status.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/dock.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/mem.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/window.js?v=<?= rand(0, 1000) ?>" defer></script>

<script src="js/test.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/weather.js?v=<?= rand(0, 1000) ?>" defer></script>
<script src="js/terminal.js?v=<?= rand(0, 1000) ?>" defer></script>

<?php

$w = isset($_GET["w"]) ? $_GET["w"] : 400;
$h = isset($_GET["h"]) ? $_GET["h"] : 700;
$mobile = isset($_GET["mobile"]) ? "true" : "false";

$full = isset($_GET["full"]);

if ($full) { ?>

<meta name="apple-mobile-web-app-capable" content="yes">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no" />

<?php } ?>

<div id="device">
	<div>
		<canvas height="<?= $h ?>" width="<?= $w ?>" id="main">*</canvas>
		<!--<canvas height="700" width="1000" id="main">*</canvas>-->
	</div>
<?php if (!$full) { ?>
	<a onclick="__save()">Save screenshot</a>
	<a onclick="kernel_fail()">Force bluescreen</a>
	<hr>
	<a href="?w=400&h=700&mobile">iPhone</a>
	<a href="?w=700&h=500&mobile">iPad Mini</a>
	<a href="?w=900&h=600&mobile">iPad</a>
	<a href="?w=1000&h=700">Laptop</a>
	<a href="?w=1080&h=720">Desktop</a>

	<a href="?full">Fullscreen</a>
	<a href="?full&mobile">Fullscreen (Mobile)</a>

</div>

<?php } ?>

<script>

onload = function () {
	var e = document.getElementById("main");
	<?php if ($full) { ?>
	
	e.height = window.innerHeight;
	e.width = window.innerWidth;
	
	<?php } ?>
	boot(e, <?= $mobile ?>);
}

function __save() {
	var image = document.getElementById("main").toDataURL("image/png");
	window.open(image);
}

function __gofull() {
	document.body.setAttribute("full");
}

</script>

<style>

<?php

if ($full) {
?>

body {
	margin: 0;
	padding: 0;
	cursor: crosshair;
	background: black;
}

canvas {
	position: fixed;
	top: 0;
	left: 0;
	user-select: none;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
}

#info {
	display: none;
}

<?php
} else {
?>

canvas {
	cursor: none;
	user-select: none;
	-webkit-touch-callout: none;
	-webkit-user-select: none;
}

#info {
	float: right;
	width: calc(100% - <?= $w ?>px - 100px);
	font-family: monospace;
}

table {
	width: 100%;
}

table {
	border-collapse: collapse;
}

#device {
	position: fixed;
	top: 0;
	left: 0;
	bottom: 0;
	padding: 50px;
	background: #eee;
	-webkit-tap-highlight-color: rgba(0,0,0,0);
}

#device a {
	display: inline-block;
	margin-right: 5px;
	margin-top: 5px;
	padding: 10px;
	background: #07f;
	color: white;
	border-radius: 5px;
	font-family: sans-serif;
}

#device a:hover {
	opacity: 0.8;
}

#kernel_debug div:nth-child(1) { opacity: 0.4; }
#kernel_debug div:nth-child(2) { opacity: 0.6; }
#kernel_debug div:nth-child(3) { opacity: 0.8; }

body[full] #device canvas {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

<?php
}
?>

</style>
