<div data-control="item-theme-switcher" class="hidden">
    <ul class="menu" data-control="item-theme-switcher-list">
        {{#each themes}}
            <li class="small btn-info action menu-item" data-control="{{id}}">
                <a class="li-inner menu-inner">
                    <span class="icon icon-preview"></span>
                    <span class="label">{{label}}</span>
                </a>
            </li>
        {{/each}}
    </ul>
</div>
