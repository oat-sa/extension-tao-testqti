<?php
use oat\tao\helpers\Template;
?><!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="<?= Template::css('normalize.css', 'tao') ?>"/>
    <link rel="stylesheet" href="<?= Template::css('tao-3.css', 'tao') ?>"/>
    <script src="<?= Template::js('lib/require.js', 'tao') ?>"></script>
    <script>
        (function () {
            var clientConfigUrl = '<?=get_data('client_config_url')?>';
            requirejs.config({waitSeconds: <?=get_data('client_timeout')?>});
            require([clientConfigUrl], function () {
                require(['taoItems/controller/runtime/itemRunner'], function (itemRunner) {
                    itemRunner.start({
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
                        clientConfigUrl: clientConfigUrl,
                        timeout: <?=get_data('client_timeout')?>
                    });
                });
            });
        }());
    </script>
</head>
<body>
</body>
</html>
