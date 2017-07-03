<?php

header("Content-Type: text/text");

echo '{"rag":' . rand(0, 100000) . ',"address":"' . $_SERVER["REMOTE_ADDR"] . '"}';

?>