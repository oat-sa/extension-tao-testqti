<li data-control="{{id}}" class="small btn-info action"{{#if title}} title="{{title}}"{{/if}} data-order="{{order}}">
    <a class="li-inner" href="#">
        {{#if icon}}<span class="icon icon-{{icon}}"></span>{{/if}}
        {{#if label}}<span class="label">{{label}}</span>{{/if}}
    </a>
    {{#if items}}
    <ul class="menu hidden">
        {{#each ../items}}
        <li data-control="{{id}}" class="small btn-info action menu-item{{#if selected}} selected{{/if}}"{{#if title}} title="{{title}}"{{/if}}>
            <a class="li-inner menu-inner" href="#">
                {{#if icon}}<span class="icon icon-{{icon}}"></span>{{/if}}
                {{#if label}}<span class="label">{{label}}</span>{{/if}}
            </a>
        </li>
        {{/each}}
    </ul>
    {{/if}}
</li>
