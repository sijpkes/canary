<?php
    $script = array("script" => file_get_contents("canarybc.js"),
                   "base" => $_GET['base']);
?>

canaryBlogCheck(
       <?= json_encode($script) ?>
);

