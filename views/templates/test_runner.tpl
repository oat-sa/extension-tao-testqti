<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/jquery-1.8.0.min.js"/></script>
<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/json2.js"></script>
<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/serviceApi/StateStorage.js"></script>
<script type="text/javascript" src="<?= TAOBASE_WWW ?>js/serviceApi/ServiceApi.js"></script>
<script type="text/javascript" src="<?= BASE_WWW ?>js/test_runner.js"></script>

<?php include(dirname(__FILE__) . '/assessment_test_context.tpl'); ?>

<link rel="stylesheet" href="<?= BASE_WWW ?>css/test_runner.css"/>
<div id="runner">
	<button id="move-backward" class="qti-navigation">Previous</button>
	<button id="move-forward" class="qti-navigation">Next</button>
	<button id="skip" class="qti-navigation"/>Skip</button>
	<iframe id="qti-item" frameborder="0" scrolling="no"/>
</div>