<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/jquery-1.8.0.min.js"/></script>
<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/jquery-ui-1.8.23.custom.min.js"/></script>
<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/json2.js"></script>
<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/serviceApi/StateStorage.js"></script>
<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/serviceApi/ServiceApi.js"></script>
<script type="text/javascript" src="<?= BASE_WWW ?>js/test_runner.js"></script>

<?php include(dirname(__FILE__) . '/assessment_test_context.tpl'); ?>

<link rel="stylesheet" href="<?= BASE_WWW ?>css/test_runner.css"/>
<div id="qti-test-runner">
	<iframe id="qti-item" frameborder="0"/>
</div>