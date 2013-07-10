<div id="item-container" class="data-container" >
	<div class="ui-widget ui-state-default ui-widget-header ui-corner-top container-title" >
		<?=__('Authoring')?>
	</div>
	<div class="ui-widget ui-widget-content ui-state-default ui-corner-bottom" style="text-align:center; padding:4px;">
		<input id='authoringButton' name='authoring' type='button' value='<?=__('Author QTI test')?>'/>
	</div>
</div>
<script type="text/javascript">
$(function(){
	require(['require', 'jquery'], function(req, $) {
		$('#authoringButton').click(function(e) {
			//e.preventDefault();
			uri = '<?=_url('index', 'Authoring', 'taoQtiTest', array('uri' => get_data('uri')))?>';
			helpers.openTab('<?=get_data('label')?>', uri);
		});
	});
});
</script>
