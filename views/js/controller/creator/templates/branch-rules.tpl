{{#each branchRules}}
  <div class="branch-rules-table-item grid-row" data-index="{{@index}}">
    <div class="col-3">
      <select class="select2"
              name="branch-rules-target"
              data-bind="branchRules[{{@index}}].target"
              data-bind-encoder="string"
              data-has-search="false">
        {{#each ../branchOptions.targets}}
          {{#equal value ../target}}
            <option value="{{value}}" selected="selected">{{label}}</option>
          {{else}}
            <option value="{{value}}">{{label}}</option>
          {{/equal}}
        {{/each}}
      </select>
    </div>

    <div class="col-3">
      <select class="select2"
              name="branch-rules-variable"
              data-bind="branchRules[{{@index}}].variable"
              data-bind-encoder="string"
              data-has-search="false">
        {{#each ../branchOptions.variables}}
          {{#equal value ../variable}}
            <option value="{{value}}" selected="selected">{{label}}</option>
          {{else}}
            <option value="{{value}}">{{label}}</option>
          {{/equal}}
        {{/each}}
      </select>
    </div>

    <div class="col-2 custom-col">
      <select class="select2"
              name="branch-rules-operator"
              data-bind="branchRules[{{@index}}].operator"
              data-bind-encoder="string"
              data-has-search="false">
        {{#each ../branchOptions.operators}}
          {{#equal value ../operator}}
            <option value="{{value}}" selected="selected">{{label}}</option>
          {{else}}
            <option value="{{value}}">{{label}}</option>
          {{/equal}}
        {{/each}}
      </select>
    </div>

    <div class="col-1 custom-col">
      <input type="text"
             class="branch-rules-value"
             data-bind="branchRules[{{@index}}].value"
             value="{{value}}">
    </div>

    <div class="branch-rules-table-actions col-3">
      <div class="branch-rules-table-action {{#if @first}}disabled{{/if}}"
           data-testid="branch-rule-move-up"
           aria-disabled="{{#if @first}}true{{else}}false{{/if}}">
        <span class="icon-up"></span>
      </div>

      <div class="branch-rules-table-action {{#if @last}}disabled{{/if}}"
           data-testid="branch-rule-move-down"
           aria-disabled="{{#if @last}}true{{else}}false{{/if}}">
        <span class="icon-down"></span>
      </div>
      <span class="action-separator"></span>
      <div class="branch-rules-table-action" data-testid="branch-rule-delete"><span class="icon-bin"></span></div>
    </div>
  </div>
{{/each}}