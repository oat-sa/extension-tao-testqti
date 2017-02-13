<li data-control="{{control}}" class="small btn-info action{{#if className}} {{className}}{{/if}}" title="{{title}}">
    <a class="li-inner" href="#">
        {{#if icon}}<span class="icon icon-{{icon}}{{#unless text}} no-label{{/unless}}"></span>{{/if}}
        {{#if text}}<span class="text">{{text}}</span>{{/if}}
    </a>
</li>
