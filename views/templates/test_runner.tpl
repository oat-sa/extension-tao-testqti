<?php
use oat\tao\helpers\Template;
use oat\tao\helpers\Layout;
?><!doctype html>
<html class="no-js" lang="<?= tao_helpers_I18n::getLangCode() ?>">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo __("QTI 2.1 Test Driver"); ?></title>
    <link rel="stylesheet" href="<?= Template::css('tao-main-style.css', 'tao') ?>"/>
    <link rel="stylesheet" href="<?= Template::css('tao-3.css', 'tao') ?>"/>
    <link rel="stylesheet" href="<?= Template::css('test_runner.css') ?>"/>
    <link rel="stylesheet" href="<?= Template::css('delivery.css', 'taoDelivery') ?>"/>

    <?php if (($themeUrl = Layout::getThemeUrl()) !== null): ?>
        <link rel="stylesheet" href="<?= $themeUrl ?>"/>
    <?php endif; ?>
    <script type="text/javascript" src="<?= Template::js('lib/require.js', 'tao') ?>"></script>

    <script type="text/javascript">
        (function () {
            requirejs.config({waitSeconds: <?=get_data('client_timeout')?> });
            require(['<?=get_data('client_config_url')?>'], function () {
                require(['taoQtiTest/controller/runtime/testRunner', 'mathJax'], function (testRunner, MathJax) {
                    if (MathJax) {
                        MathJax.Hub.Configured();
                    }
                    testRunner.start(<?=json_encode(get_data('assessmentTestContext'), JSON_HEX_QUOT | JSON_HEX_APOS)?>);
                });
            });
        }());
    </script>
</head>
<body class="delivery-scope">

<ul class="plain action-bar content-action-bar horizontal-action-bar">


    <li id="qti-tools" class="small btn-info action" title="<?= __("Comment"); ?>">
        <a class="li-inner" href="#">
            <?= __("Comment"); ?>
        </a>
    </li>

    <li id="move-forward" class="small btn-info action" title="<?= __("Submit and go to the next item"); ?>">
        <a class="li-inner" href="#">
            <?= __("Next"); ?>
            <span class="icon-forward r"></span>
        </a>
    </li>

    <li id="move-end" class="small btn-error action" title="<?= __("Submit and go to the end of the test"); ?>">
        <a class="li-inner" href="#">
            <?= __("End Test"); ?>
            <span class="icon-fast-forward r"></span>
        </a>
    </li>

    <li id="move-backward" class="small btn-info action" title="<?= __("Submit and go to the previous item"); ?>">
        <a class="li-inner" href="#">
            <span class="icon-backward"></span>
            <?= __("Previous"); ?>
        </a>
    </li>

    <li id="skip" class="small btn-warning action" title="<?= __("Skip to the next item"); ?>">
        <a class="li-inner" href="#">
            <span class="icon-external"></span>
            <?= __("Skip"); ?>
        </a>
    </li>

    <li id="skip-end" class="small btn-error action" title="<?= __("Skip to the end of the test"); ?>">
        <a class="li-inner" href="#">
            <span class="icon-external"></span>
            <?= __("Skip &amp; End Test"); ?>
        </a>
    </li>
</ul>

<div id="runner" class="tao-scope">
    <div id="qti-actions">
        <div class="col-4" id="qti-test-context">
            <div id="qti-test-title"></div>
            <div id="qti-test-position"></div>
        </div>


        <div class="col-4" id="qti-test-time"></div>
        <div class="col-4" id="qti-test-progress">
            <div id="qti-progress-label"></div>
            <div id="qti-progressbar"></div>
        </div>
    </div>
    <div id="qti-content"></div>
    <div id="qti-navigation" class="grid-row">

    </div>
</div>
<div id="qti-comment">
    <textarea></textarea>
    <button id="qti-comment-cancel" class="btn-info"><span class="icon-close"></span><?= __("Cancel"); ?></button>
    <button id="qti-comment-send" class="btn-info"><span class="icon-success"></span><?= __("Send"); ?></button>
</div>
</body>
</html>
