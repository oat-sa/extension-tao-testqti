<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>QTI 2.1 Test Driver</title>
		<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/jquery-1.8.0.min.js"/></script>
		<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/spin.min.js"/></script>
		<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/serviceApi/StateStorage.js"></script>
		<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/serviceApi/ServiceApi.js"></script>
		<script type="text/javascript" src="<?= BASE_WWW ?>js/test_runner.js"></script>
		<?php include(dirname(__FILE__) . '/assessment_test_context.tpl'); ?>
		<link rel="stylesheet" href="<?= BASE_WWW ?>css/test_runner.css"/>
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
				<button id="qti-comment-cancel">Cancel</button>
			<button id="qti-comment-send">Send</button></div>
			<iframe id="qti-item" frameborder="0" scrolling="no"></iframe>
		</div>
	</body>
</html>