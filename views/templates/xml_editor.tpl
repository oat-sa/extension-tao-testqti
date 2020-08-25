<?php
use oat\tao\helpers\Layout;
use oat\tao\helpers\Template;
?>
<script src="<?= Template::js('loader/taoQtiTestXMLEditor.min.js', 'taoQtiTest') ?>"></script>
<header class="flex-container-full">
     <h3><?=get_data('formTitle')?></h3>
</header>

<div class="main-container flex-container-full">
    <?=get_data('form')?>
</div>

<?php
Template::inc('footer.tpl', 'tao');
?>
