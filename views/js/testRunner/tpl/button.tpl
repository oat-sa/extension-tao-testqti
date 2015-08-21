<li data-control="{{id}}" class="small btn-info action"{{#if title}} title="{{title}}"{{/if}} data-order="{{order}}">
    <a class="li-inner" href="#">
        <span class="icon icon-{{icon}}"></span>
        <span class="label">{{label}}</span>
    </a>
    {{#if items}}
    <ul class="menu hidden">
        {{#each ../items}}
        <li data-control="{{id}}" class="small btn-info action menu-item"{{#if title}} title="{{title}}"{{/if}}>
            <a class="li-inner menu-inner" href="#">
                <span class="icon icon-{{icon}}"></span>
                <span class="label">{{label}}</span>
            </a>
        </li>
        {{/each}}
    </ul>
    {{/if}}
</li>
