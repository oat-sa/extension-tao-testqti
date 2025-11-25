<div class="grid-row">
    <div class="info-card grid-row">
        <div class="col-2"><span class="icon-info"></span></div>
        <div class="col-10">
            {{__ "Each condition below is evaluated, starting from the top, by comparing the variable content with a specific value, using the operator. As soon as condition is fulfilled, the test taker is redirected to the corresponding target. If no condition is fulfilled, the test taker is presented with the next test part in the natural order."}}
        </div>
    </div>
</div>
<div class="branch-rules-table">
    <div class="branch-rules-table-header grid-row">
        <div class="col-3 target-col">{{__ 'Target'}}</div>
        <div class="col-3 variable-col">{{__ 'Variable'}}</div>
        <div class="col-2 operator-col">{{__ 'Op.'}}</div>
        <div class="col-1 value-col">{{__ 'Value'}}</div>
        <div class="col-3"></div>
    </div>
    <div class="branch-rules-table-body">
      {{#each branchRules}}
        <div class="branch-rules-table-item grid-row" data-index="{{@index}}">
          <div class="col-3 target-col">
            <select class="select2"
                    name="branch-rules-target"
                    aria-label="{{__ 'Target'}}"
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

          <div class="col-3 variable-col">
            <select class="select2"
                    name="branch-rules-variable"
                    aria-label="{{__ 'Variable'}}"
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

          <div class="col-2 operator-col">
            <select class="select2"
                    name="branch-rules-operator"
                    aria-label="{{__ 'Operator'}}"
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

          <div class="col-1 value-col">
            <input type="text"
                  class="branch-rules-value"
                  aria-label="{{__ 'Value'}}"
                  data-bind="branchRules[{{@index}}].value"
                  value="{{value}}">
          </div>

          <div class="branch-rules-table-actions col-3">
            <a class="branch-rules-table-action {{#if @first}}br-action-disabled{{/if}}"
                role="button"
                tabindex="{{#if @first}}-1{{else}}0{{/if}}"
                data-testid="branch-rule-move-up"
                aria-disabled="{{#if @first}}true{{else}}false{{/if}}"
                aria-label="{{__ 'Move rule up'}}">
              <span class="icon-up"></span>
            </a>
            <a class="branch-rules-table-action {{#if @last}}br-action-disabled{{/if}}"
              role="button"
              tabindex="{{#if @last}}-1{{else}}0{{/if}}"
              data-testid="branch-rule-move-down"
              aria-disabled="{{#if @last}}true{{else}}false{{/if}}"
              aria-label="{{__ 'Move rule down'}}">
                <span class="icon-down"></span>
            </a>
            <span class="action-separator"></span>
            <a class="branch-rules-table-action"
              role="button"
              tabindex="0"
              data-testid="branch-rule-delete"
              aria-label="{{__ 'Delete rule'}}">
                <span class="icon-bin"></span>
            </a>
          </div>
        </div>
      {{/each}}
    </div>
</div>
<div class="grid-row">
    <button type="button" class="branch-rules-add-btn btn-info small" data-action="add-outcome-declaration">
        <span class="icon-add"></span>
        {{__ 'Add a Path'}}
    </button>
</div>