<h3>Tools</h3>
{{#each this}}
<div class="grid-row pseudo-label-box category-preset" data-qti-category="{{qtiCategory}}">
    <div class="col-1">
        <label>
            <input type="checkbox" name="itemref-category-preset-{{id}}" value="{{qtiCategory}}"{{#if checked}} checked="checked"{{/if}}"/>
            <span class="icon-checkbox"></span>
        </label>
    </div>
    <div class="col-10">
        <label for="itemref-category-preset-{{id}}">{{label}}</label>
    </div>
    <div class="col-1 help">
        <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <div class="tooltip-content">
            {{description}}
        </div>
    </div>
</div>
{{/each}}