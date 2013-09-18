<script type="text/javascript">
var assessmentTestContext = <?php echo json_encode(get_data('assessmentTestContext'), JSON_HEX_QUOT | JSON_HEX_APOS); ?>;
<? if (has_data('itemServiceApi')): ?>
itemServiceApi = <?=get_data('itemServiceApi')?>;
<? endif; ?>
</script>