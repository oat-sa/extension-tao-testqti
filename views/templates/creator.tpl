<div class="<?=get_data('translation') !== 'false' ? 'side-by-side-authoring' : ''?>" id="test-creator" data-content-target="wide">

<!-- left section: items selection -->
    <section class="test-creator-sidebar test-creator-area test-creator-items">
        <div class="action-bar plain content-action-bar horizontal-action-bar">
            <ul class="action-group plain clearfix authoring-back-box item-editor-menu">
                <li id="authoringBack" class="btn-info small" data-testid="manage-tests">
                    <span class="li-inner">
                    <span class="icon-left"></span>
                        <?= __('Manage Tests') ?>
                    </span>
                </li>
            </ul>
        </div>
        <h1><?=__('Select Items')?></h1>
        <div class='item-selection'></div>
    </section>

<!-- test editor  -->
    <section class="test-creator-test test-creator-area test-creator-content">
        <div class="action-bar plain content-action-bar horizontal-action-bar">
            <ul class="test-editor-menu action-group plain clearfix authoring-back-box item-editor-menu">
                <li id="saver" class="btn-info small" data-testid="save-test">
                    <span class="li-inner">
                        <span class="icon-save"></span>
                        <?=__('Save')?>
                    </span>
                </li>
            </ul>
        </div>
        <h1><span data-bind="title"></span>
            <span class="icon-warning configuration-issue"></span>
            <div class="actions">
                <div class="tlb">
                    <div class="tlb-top">
                        <span class="tlb-box">
                            <span class="test-actions tlb-bar">
                                <span class="tlb-start"></span>
                                <span class="tlb-group">
                                    <a href="#" class="tlb-button-off property-toggler" title="<?=__('Manage test properties')?>" data-testid="test-properties">
                                        <span class="icon-settings"></span>
                                    </a>
                                </span>
                                <span class="tlb-end"></span>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </h1>
        <div class="test-content">
            <div class="testparts" data-bind-each="testParts" data-bind-tmpl="testpart"> </div>
<?php if (get_data('translation') === 'false'): ?>
            <button class="btn-info small testpart-adder button-add" data-testid="add-test-part">
                <span class="icon-add"></span><?=__('New test part')?>
            </button>
<?php endif; ?>
        </div>
    </section>

    <section class="test-creator-sidebar test-creator-area test-creator-props">
        <div class="action-bar plain content-action-bar horizontal-action-bar">
            <ul id="test-creator-mode-tabs" class="plain clearfix test-creator-mode-tabs" role="tablist">
                <li
                    role="tab"
                    data-tab="properties"
                    class="active"
                    aria-selected="true"
                    title="<?=__('Properties')?>"
                    aria-label="<?=__('Properties')?>"
                >
                    <span class="li-inner">
                        <span class="icon-settings" aria-hidden="true"></span>
                        <span class="tab-label"><?=__('Properties')?></span>
                    </span>
                </li>
                <li
                    role="tab"
                    data-tab="comments"
                    data-label="<?=__('Comments')?>"
                    title="<?=__('Comments')?>"
                    aria-label="<?=__('Comments')?>"
                    aria-selected="false"
                >
                    <span class="li-inner">
                        <span class="icon-speech-bubble" aria-hidden="true"></span>
                        <span class="tab-label"><?=__('Comments')?></span>
                    </span>
                </li>
            </ul>
        </div>
        <div class="test-creator-props-panel" data-mode-panel="properties">
            <h1><?=__('Properties')?></h1>
            <div class="qti-widget-properties"></div>
        </div>
        <div
            id="test-creator-comments-bar"
            class="test-creator-comments-panel"
            data-mode-panel="comments"
            hidden
        >
            <p class="comments-guidance">
                <?=__('Comments apply to the whole test.')?>
            </p>
            <div class="test-comments-content-panel panel"></div>
        </div>
    </section>

</div>
<script type="text/javascript">
requirejs.config({
    config: {
        'taoQtiTest/controller/creator/creator' : {
            routes : {
                get  : '<?=get_data('loadUrl')?>',
                getOrigin  : '<?=get_data('loadOriginUrl')?>',
                save  : '<?=get_data('saveUrl')?>',
                blueprintsById : '<?=get_data('blueprintsByIdUrl')?>',
                blueprintByTestSection : '<?=get_data('blueprintsByTestSectionUrl')?>',
                identifier : '<?=get_data('identifierUrl')?>',
                getItemsMaxScores : '<?=get_data('getItemsMaxScoresUrl')?>'
            },
            translation : <?=get_data('translation')?>,
            originResourceUri : <?=get_data('originResourceUri')?>,
            categoriesPresets : <?=get_data('categoriesPresets')?>,
            scalesPresets: <?=get_data('scalesPresets')?>,
            testScales: <?=get_data('testScales')?>,
            labels : <?=get_data('labels')?>,
            guidedNavigation : <?=get_data('guidedNavigation')?>
       }
    }
});
</script>
