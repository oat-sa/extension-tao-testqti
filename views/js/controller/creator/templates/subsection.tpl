<div id="{{identifier}}" class="subsection">

    <h2><span class="title-index"></span> <span data-bind="title">{{title}}</span>
        <span class="icon-warning"></span>
        <div class="actions">
            <div class="tlb">
                <div class="tlb-top">
                    <span class="tlb-box">
                        <span class="tlb-bar">
                            <span class="tlb-start"></span>
                            <span class="tlb-group">
                                <a href="#" class="tlb-button-off add-subsection" title="{{__ 'Add Subsection'}}" data-testid="add-subsection"><span class="icon-add-subsection"></span></a>
                                <span class="tlb-separator"></span>
                                <a href="#" class="tlb-button-off rub-toggler" title="{{__ 'Manage Rubric Blocks'}}" data-toggle="#rublocks-{{identifier}}" data-testid="manage-rubric-blocks"><span class="icon-rubric"></span></a>
                                <span class="tlb-separator"></span>
                                <a href="#" class="tlb-button-off property-toggler" title="{{__ 'Section Properties'}}" data-testid="section-properties"><span class="icon-settings"></span></a>
                                <span class="tlb-separator"></span>
                                <a href="#" class="tlb-button-off move-up disabled" title="{{__ 'Move Up'}}" data-testid="move-up-subsection"><span class="icon-up"></span></a>
                                <a href="#" class="tlb-button-off move-down disabled" title="{{__ 'Move Down'}}" data-testid="move-down-subsection"><span class="icon-down"></span></a>
                                <span class="tlb-separator"></span>
                                <a href="#" class="tlb-button-off disabled delete-subsection" title="{{__ 'Remove Subsection'}}" data-delete=":parent .subsection" data-testid="remove-subsection"><span class="icon-bin"></span></a>
                            </span>
                            <span class="tlb-end"></span>
                        </span>
                    </span>
                </div>
            </div>
        </div>
    </h2>

    <div id="rublocks-{{identifier}}" class="rublocks clearfix toggled">
        <h3>
            <span class="title">{{__ 'Rubric Blocks'}}</span>
        </h3>
        <ol class="rubricblocks decimal" data-bind-each="rubricBlocks" data-bind-tmpl="rubricblock"></ol>
        <button class="btn-info small rublock-adder" data-testid="add-rubric-block">
            <span class="icon-add"></span>{{__ 'New Rubric Block'}}
        </button>
    </div>
    <div class="itemrefs-wrapper">
        <h3>
            <span class="title">{{__ 'Items'}}</span>
        </h3>
        <ol class="itemrefs decimal clearfix" data-bind-each="sectionParts" data-bind-tmpl="itemref" data-bind-filter="isItemRef" data-msg="{{__ 'Add selected item(s) here.'}}"></ol>
        <div class="itemref-placeholder" data-testid="add-items">
            {{__ 'Add selected item(s) here.'}}
        </div>
    </div>
     <div class="subsections" data-bind-each="sectionParts" data-bind-tmpl="subsection" data-bind-filter="isSection"></div>
</div>
