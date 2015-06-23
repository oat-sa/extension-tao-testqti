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
    <script src="<?= Template::js('lib/require.js', 'tao') ?>"></script>

    <script>
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
<div id="feedback-box"></div>

<div class="plain action-bar content-action-bar horizontal-action-bar top-action-bar">
    <div class="control-box">
        <div class="grid-row">
            <div class="lft title-box txt-ctr">
                <span data-control="qti-test-title" class="qti-controls"></span>
                <span data-control="qti-test-position" class="qti-controls"></span>
				</div>


            <!--div class="rgt navi-box">
                <ul class="plain">
                    <li data-control="move-forward" class="small btn-info action" title="<?= __(
                        "Submit and go to the next item"
                    ); ?>">
                        <a class="li-inner" href="#">
                            <span class="icon-forward"></span>
                            <span class="text"><?= __("Next"); ?></span>
                        </a>
                    </li>

                    <li data-control="move-end" class="small btn-info action" title="<?= __(
                        "Submit and go to the end of the test"
                    ); ?>">
                        <a class="li-inner" href="#">
                            <span class="icon-fast-forward"></span>
                            <span class="text"><?= __("End Test"); ?></span>
                        </a>
                    </li>

                    <li data-control="move-backward" class="small btn-info action" title="<?= __(
                        "Submit and go to the previous item"
                    ); ?>">
                        <a class="li-inner" href="#">
                            <span class="icon-backward"></span>
                            <span class="text"><?= __("Previous"); ?></span>
                        </a>
                    </li>

                    <li data-control="skip" class="small btn-info action" title="<?= __("Skip to the next item"); ?>">
                        <a class="li-inner" href="#">
                            <span class="icon-external"></span>
                            <span class="text"><?= __("Skip"); ?></span>
                        </a>
                    </li>

                    <li data-control="skip-end" class="small btn-info action" title="<?= __(
                        "Skip to the end of the test"
                    ); ?>">
                        <a class="li-inner" href="#">
                            <span class="icon-external"></span>
                            <span class="text"><?= __("Skip &amp; End Test"); ?></span>
                        </a>
                    </li>
                </ul>
            </div-->

            <div class="rgt progress-box">
                <div data-control="progress-bar" class="qti-controls lft"></div>
                <div data-control="progress-label" class="qti-controls lft"></div>
				</div>
            <div class="rgt timer-box">
                <div data-control="qti-test-time" class="qti-controls"></div>
			</div>
			</div>
		</div>

</div>


<div id="qti-content"></div>

<div id="qti-navigation">
    <div class="plain action-bar content-action-bar horizontal-action-bar top-action-bar">
        <div class="control-box">
            <div class="grid-row">
                <div class="lft comment-toggle-box">
                    <ul class="plain">
                        <li data-control="comment-toggle" class="small btn-info action" title="<?= __("Comment"); ?>">
                            <a class="li-inner" href="#">
                                <span class="icon-tag"></span>
                                <?= __("Comment"); ?>
                            </a>
                        </li>
                    </ul>
		</div>


                <div class="rgt navi-box">
                    <ul class="plain">
                        <li data-control="move-forward" class="small btn-info action" title="<?= __(
                            "Submit and go to the next item"
                        ); ?>">
                            <a class="li-inner" href="#">
                                <span class="icon-forward"></span>
                                <span class="text"><?= __("Next"); ?></span>
                            </a>
                        </li>

                        <li data-control="move-end" class="small btn-info action" title="<?= __(
                            "Submit and go to the end of the test"
                        ); ?>">
                            <a class="li-inner" href="#">
                                <span class="icon-fast-forward"></span>
                                <span class="text"><?= __("End Test"); ?></span>
                            </a>
                        </li>

                        <li data-control="move-backward" class="small btn-info action" title="<?= __(
                            "Submit and go to the previous item"
                        ); ?>">
                            <a class="li-inner" href="#">
                                <span class="icon-backward"></span>
                                <span class="text"><?= __("Previous"); ?></span>
                            </a>
                        </li>

                        <li data-control="skip" class="small btn-info action" title="<?= __(
                            "Skip to the next item"
                        ); ?>">
                            <a class="li-inner" href="#">
                                <span class="icon-external"></span>
                                <span class="text"><?= __("Skip"); ?></span>
                            </a>
                        </li>

                        <li data-control="skip-end" class="small btn-info action" title="<?= __(
                            "Skip to the end of the test"
                        ); ?>">
                            <a class="li-inner" href="#">
                                <span class="icon-external"></span>
                                <span class="text"><?= __("Skip &amp; End Test"); ?></span>
                            </a>
                        </li>
                    </ul>
                </div>

            </div>
        </div>

    </div>

</div>
<div class="timeout-modal-feedback modal">
    <div class="modal-body clearfix">
        <p><?= __('Time is run out. The test section is ended.') ?></p>
        <div class="rgt">
            <button class="btn-info small js-timeout-confirm" type="button"><?= __('Ok') ?></button>
        </div>
    </div>
</div>
</body>
</html>
