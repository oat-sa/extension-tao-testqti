{{#each this}}
<div class="grid-row">
    <div class="col-5">
        <label for="itemref-category-preset-{{id}}">{{label}}</label>
    </div>
    <div class="col-6">
        <label>
            <input type="checkbox" name="itemref-category-preset-{{id}}" />
            <span class="icon-checkbox"></span>
        </label>
    </div>
    <div class="col-1 help">
        <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
        <div class="tooltip-content">
            {{description}}
        </div>
    </div>
</div>
{{/each}}