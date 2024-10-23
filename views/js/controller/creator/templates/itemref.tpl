<li id='{{identifier}}' data-uri='{{href}}' class='itemref'>
    <span class='title truncate'>{{{dompurify label}}}</span>
    <span class="icon-warning configuration-issue"></span>
    <div class="actions">
        <div class="tlb">
            <div class="tlb-top">
                <span class="tlb-box">
                    <span class="tlb-bar">
                        <span class="tlb-start"></span>
                        <span class="tlb-group">
                            <a href="#" class="tlb-button-off property-toggler" title="{{__ 'Item Reference Properties'}}" data-testid="item-properties"><span class="icon-settings"></span></a>
                            <span class="tlb-separator"></span>
                            <a href="#" class="tlb-button-off move-up" title="{{__ 'Move Up'}}" data-testid="move-up-item"><span class="icon-up"></span></a>
                            <a href="#" class="tlb-button-off move-down" title="{{__ 'Move Down'}}" data-testid="move-down-item"><span class="icon-down"></span></a>
                            <span class="tlb-separator"></span>
                            <a href="#" class="tlb-button-off" title="{{__ 'Remove Item Reference'}}" data-delete=":parent .itemref" data-testid="remove-item"><span class="icon-bin"></span></a>
                        </span>
                        <span class="tlb-end"></span>
                    </span>
                </span>
            </div>
        </div>
    </div>
</li>
