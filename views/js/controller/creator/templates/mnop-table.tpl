{{#if hasData}}
<div class="grid-row">
    <div class="col-6 header">{{__ 'Points'}}</div>
    <div class="col-6 header">{{__ 'Total'}}</div>
</div>
<div class="grid-row">
    <div class="col-6 line">{{__ 'Total'}}</div>
    <div class="col-6 line"><strong>{{totalValue}}</strong></div>
</div>
{{else}}
<div class="grid-row">
    <div class="col-12 line">{{__ 'No items in this test yet.'}}</div>
</div>
{{/if}}
