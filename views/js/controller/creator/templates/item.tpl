{{#each .}}
     <li data-uri='{{uri}}' data-categories='{{categories}}' class='truncate'>
        {{label}}
        {{#if parent}}<span class='flag truncate' title="{{parent}}">{{parent}}</span>{{/if}}
     </li>
{{/each}}
