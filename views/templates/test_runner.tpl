<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>QTI 2.1 Test Driver</title>
                <link rel="stylesheet" href="<?= BASE_WWW ?>css/test_runner.css"/>
                <script type="text/javascript" src="<?=TAOBASE_WWW?>js/lib/require.js"></script>
                
                <?
                $ds = DIRECTORY_SEPARATOR;
                $expectedMathJaxPath = ROOT_PATH . 'taoQTI' . $ds . 'views' . $ds . 'js' . $ds . 'mathjax' . $ds . 'MathJax.js';
                $mathJax = is_readable($expectedMathJaxPath);
                ?>
                
                <? if ($mathJax === true): ?>
                <script type="text/x-mathjax-config">
                	MathJax.Hub.Config({
					  config: ["TeX-AMS-MML_HTMLorMML-full.js"],
					  jax: ["input/TeX","input/MathML","output/HTML-CSS","output/NativeMML"],
					  extensions: ["tex2jax.js","mml2jax.js","MathMenu.js","MathZoom.js"],
					  TeX: {
					    extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"]
					  }
					});
                </script>
                <script type="text/javascript" src="<?= TAOBASE_WWW ?>../../taoQTI/views/js/mathjax/MathJax.js?delayStartupUntil=configured"></script>
                <? endif; ?>
                
                <script type="text/javascript">
                (function(){
                    require(['<?=get_data('client_config_url')?>'], function(){
                        require(['taoQtiTest/controller/runtime/testRunner'], function(testRunner){
                        
                        	<? if ($mathJax === true): ?>
                        	MathJax.Hub.Configured();
                        	<? endif; ?>
                            testRunner.start(<?=json_encode(get_data('assessmentTestContext'), JSON_HEX_QUOT | JSON_HEX_APOS)?>);
                            
                        });
                    });
                }());
                </script>
	</head>
	<body>
		<div id="runner">
			<div id="qti-actions">
				<button id="move-backward" class="qti-navigation"><?= __("Previous"); ?></button>
				<button id="move-forward" class="qti-navigation"><?= __("Next"); ?></button>
				<button id="skip" class="qti-navigation"><?= __("Skip"); ?></button>
				<button id="comment" class="qti-tool"><?= __("Comment"); ?></button>
			</div>
			<div id="qti-comment">
				<textarea ><?= __("Your comment..."); ?></textarea>
				<button id="qti-comment-cancel"><?= __("Cancel"); ?></button>
			<button id="qti-comment-send"><?= __("Send"); ?></button></div>
			<iframe id="qti-item" frameborder="0" scrolling="no"></iframe>
		</div>
	</body>
</html>