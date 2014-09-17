<button class="btn-info small test-authoring"><?=__('Author QTI test')?></button>
<script>
    require(['jquery', 'helpers'], function($, helpers) {

        $('.test-authoring').one('click', function(e) {
            e.preventDefault();
            var uri = '<?=_url('index', 'Creator', 'taoQtiTest', array('uri' => get_data('uri')))?>';
            if($("div#tabs ul.ui-tabs-nav li a").length > 1){
                 helpers.closeTab(1);
            }
            setTimeout(function(){
                helpers.openTab(<?=json_encode(__('Authoring %s', get_data('label')))?>, uri);
            }, 10);
        });
});
</script>
