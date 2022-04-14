<li
    class="small action menu-item {{#if className}} {{className}}{{/if}}"
    data-control="{{control}}"
    tabindex="-1"
    {{#if role}}
        role="{{role}}"
    {{/if}}
>
    <a class="li-inner menu-inner">
        <span class="icon icon-checkbox"></span><span class="icon icon-checkbox-checked"></span>
        <span class="label">{{text}}</span>
    </a>
</li>