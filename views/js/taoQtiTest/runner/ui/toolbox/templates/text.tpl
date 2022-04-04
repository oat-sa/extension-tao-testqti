<li
    {{#if className}}class="{{className}}"
    {{/if}} data-control="{{control}}"
    {{#each aria}}
        aria-{{@key}}="{{this}}"
    {{/each}}
>
    {{text}}
</li>
