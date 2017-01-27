<div class="outcome-declarations">
    <div class="grid-row">
        <div class="col-6"><label>{{__ 'Identifier'}}</label></div>
        <div class="col-3">{{__ 'Type'}}</div>
        <div class="col-3">{{__ 'Cardinality'}}</div>
    </div>
{{#each this}}
    <div class="grid-row">
        <div class="col-6"><label>{{name}}</label></div>
        <div class="col-3">{{type}}</div>
        <div class="col-3">{{cardinality}}</div>
    </div>
{{/each}}
</div>