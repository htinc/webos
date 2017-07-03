<?php

header("Content-Type: text/javascript");

$id = rand(0, 10000);

$app = file_get_contents("../apps/" . $_GET["id"] . ".hs");

$app = str_replace("\\", "\\\\", $app);
$app = str_replace("\"", "\\\"", $app);
$app = str_replace("\n", "\"\n + \"", $app);

echo "function install_$id() {" ?>

<?php echo "\ncreate_app(\"$app\"); } \n\ninstall_$id();";

?>