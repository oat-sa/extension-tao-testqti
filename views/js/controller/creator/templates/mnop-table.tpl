{{#if hasData}}
<div class="mnop-table-wrapper">
    <div class="grid-row">
        <div class="col-6 header">{{__ 'Points'}}</div>
        <div class="col-3 header">{{__ 'Total'}}</div>
        {{#if hasWeighted}}
        <div class="col-3 header">{{__ 'Weighted'}}</div>
        {{/if}}
    </div>

    <div class="grid-row mnop-total-row">
        <div class="col-6 line"><strong>{{__ 'Total'}}</strong></div>
        <div class="col-3 line mnop-value"><strong>{{totalValue}}</strong></div>
        {{#if hasWeighted}}
        <div class="col-3 line mnop-value"><strong>{{weightedValue}}</strong></div>
        {{/if}}
    </div>

    {{#if hasCategories}}
        {{#each categoryRows}}
        <div class="grid-row mnop-category-row">
            <div class="col-6 line">{{categoryName}}</div>
            <div class="col-3 line mnop-value">{{total}}</div>
            {{#if ../hasWeighted}}
            <div class="col-3 line mnop-value">{{weighted}}</div>
            {{/if}}
        </div>
        {{/each}}
    {{/if}}
</div>
{{else}}
<div class="grid-row">
    <div class="col-12 line">{{__ 'No items in this test yet.'}}</div>
</div>
{{/if}}
