<?php
use oat\tao\helpers\Template;
use oat\tao\helpers\Layout;
?><!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="<?= Template::css('tao-3.css', 'tao') ?>"/>
    <script>
    (function(){
        window.itemRunnerOptions = {
            resultServer: {
                endpoint: <?=json_encode(get_data('resultServerEndpoint'))?>,
                module: 'taoQtiTest/ResultServerApi',
                params: <?=json_encode(get_data('resultServerParams'))?>
            },
            itemService: {
                module: 'taoQtiItem/runtime/QtiItemServiceImpl',
                params: {
                    contentVariables: <?=json_encode(get_data('contentVariableElements'))?>
                }
            },
            itemId: <?=json_encode(get_data('itemId'))?>,
            itemPath: <?=json_encode(get_data('itemPath'))?>,
            clientConfigUrl: <?=json_encode(get_data('client_config_url'))?>,
            timeout: <?=get_data('client_timeout')?>
        };
    }());
    </script>
    <?= Layout::getAmdLoader(Template::js('itemRunner.js', 'taoItems'), Template::js('itemRunner.min.js', 'taoItems'))  ?>
</head>
<body>
</body>
</html>
