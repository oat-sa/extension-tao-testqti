<ol class="qti-navigator-sections plain">
{{#if displaySectionTitles}}
    {{#each parts}}
        {{#each sections}}
            <li class="qti-navigator-section">
                <div class="qti-navigator-label" title="{{label}}">
                    {{label}}
                </div>
                <div class="qti-navigator-items"></div>
            </li>
        {{/each}}
    {{/each}}
{{else}}
    <li class="qti-navigator-section">
        <div class="qti-navigator-items"></div>
    </li>
{{/if}}
</ol>
