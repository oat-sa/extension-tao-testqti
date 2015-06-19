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

    <li data-control="comment-toggle" class="small btn-info action" title="<?= __("Comment"); ?>">
        <a class="li-inner" href="#">
            <?= __("Comment"); ?>
        </a>
    </li>

    <li data-control="move-forward" class="small btn-info action" title="<?= __("Submit and go to the next item"); ?>">
        <a class="li-inner" href="#">
            <?= __("Next"); ?>
            <span class="icon-forward r"></span>
        </a>
    </li>

    <li data-control="move-end" class="small btn-info action" title="<?= __("Submit and go to the end of the test"); ?>">
        <a class="li-inner" href="#">
            <?= __("End Test"); ?>
            <span class="icon-fast-forward r"></span>
        </a>
    </li>

    <li data-control="move-backward" class="small btn-info action" title="<?= __("Submit and go to the previous item"); ?>">
        <a class="li-inner" href="#">
            <span class="icon-backward"></span>
            <?= __("Previous"); ?>
        </a>
    </li>

    <li data-control="skip" class="small btn-info action" title="<?= __("Skip to the next item"); ?>">
        <a class="li-inner" href="#">
            <span class="icon-external"></span>
            <?= __("Skip"); ?>
        </a>
    </li>

    <li data-control="skip-end" class="small btn-info action" title="<?= __("Skip to the end of the test"); ?>">
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
            <div data-control="progress-label"></div>
            <div data-control="progress-bar"></div>
        </div>
    </div>
    <div id="qti-content"></div>
    <div id="qti-navigation" class="grid-row">

    </div>
</div>
<div data-control="comment-area">
    <textarea data-control="comment-text" placeholder="Your comment here&hellip;"></textarea>
    <button data-control="comment-cancel" class="small btn-info"><span class="icon-close"></span><?= __("Cancel"); ?></button>
    <button data-control="comment-send" class="small btn-info"><span class="icon-success"></span><?= __("Send"); ?></button>
</div>
</body>
</html>
