<?php
    $script = array("script" => file_get_contents("canarybc.min.js"),
                   "base" => $_GET['base']);
?>

canaryBlogCheck(
       <?= json_encode($script) ?>
);

