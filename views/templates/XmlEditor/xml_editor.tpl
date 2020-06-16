<?php
use oat\tao\helpers\Template;
?>
<section class="content-container">
    <?php if(get_data('isLocked')):?>
        <h2><?=get_data('lockMessage')?></h2>
    <?php else : ?>
        <h2>XML Content</h2>
        <div class="content-block">
            <div class="content">
                <textarea name="text"><?=get_data('xmlBody')?></textarea>
            </div>
        </div>
    <?php endif; ?>
</section>
