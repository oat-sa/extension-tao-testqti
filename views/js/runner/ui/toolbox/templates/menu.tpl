<li data-control="{{control}}" class="small btn-info action {{#if className}} {{className}}{{/if}}" title="{{title}}">
    <a class="li-inner" data-control="{{control}}-button" href="#">
        {{#if icon}}<span class="icon icon-{{icon}}{{#unless text}} no-label{{/unless}}"></span>{{/if}}
        {{#if text}}<span class="text">{{text}}</span>{{/if}}
        &nbsp; <span class="icon icon-up"></span>
    </a>
    <div data-control="{{control}}-menu" class="hidden {{control}}-menu" tabindex="1">
        <ul data-control="{{control}}-list" class="menu {{control}}-list"></ul>
    </div>
</li>
