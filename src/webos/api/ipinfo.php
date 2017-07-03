<?php

header("Content-Type: text/text");

$ip = isset($_GET["ip"]) ? $_GET["ip"] : $_SERVER["REMOTE_ADDR"];

$info = json_decode(file_get_contents("http://ipinfo.io/" . $ip . "/json"));

//$info = json_decode(file_get_contents("http://ip-api.com/php/$ip"));

if (count(explode(" ", $info->org)) > 1) {
	$info->head = explode(" ", $info->org)[1];
}

echo json_encode($info);

?>