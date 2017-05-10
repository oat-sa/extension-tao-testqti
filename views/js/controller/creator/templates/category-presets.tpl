{{#each this}}

<h4 class="toggler closed" data-toggle="~ .category-preset-group-{{groupId}}">{{groupLabel}}</h4>

<div class="category-preset-group-{{groupId}} toggled">
    {{#each presets}}
    <div class="grid-row pseudo-label-box category-preset" data-qti-category="{{qtiCategory}}">
        <div class="col-1">
            <label>
                <input type="checkbox" name="category-preset-{{id}}" value="{{qtiCategory}}"/>
                <span class="icon-checkbox"></span>
            </label>
        </div>
        <div class="col-10">
            <label for="category-preset-{{id}}">{{label}}</label>
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{description}}
            </div>
        </div>
    </div>
    {{/each}}
</div>

{{/each}}
