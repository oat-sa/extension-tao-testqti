<div data-control="item-theme-switcher" class="hidden item-theme-switcher">
    <ul class="menu item-theme-switcher-list" data-control="item-theme-switcher-list">
        {{#each themes}}
            <li class="small btn-info action menu-item {{id}}" data-control="{{id}}">
                <a class="li-inner menu-inner">
                    <span class="icon icon-preview"></span>
                    <span class="label">{{label}}</span>
                </a>
            </li>
        {{/each}}
    </ul>
</div>
