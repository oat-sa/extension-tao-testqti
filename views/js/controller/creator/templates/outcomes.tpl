<div class="grid-row">
    <div class="col-6 header">{{__ 'Identifier'}}</div>
    <div class="col-3 header">{{__ 'Type'}}</div>
    <div class="col-3 header">{{__ 'Cardinality'}}</div>
</div>
{{#each outcomes}}
    <div class="grid-row">
        <div class="col-6 line">{{name}}</div>
        <div class="col-3 line">{{type}}</div>
        <div class="col-3 line">{{cardinality}}</div>
    </div>
{{else}}
    <div class="grid-row">
        <div class="col-12 line">{{__ 'no outcome declaration found'}}</div>
    </div>
{{/each}}
