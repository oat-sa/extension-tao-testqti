<div class="grid-row">
    <div class="info-card grid-row">
        <div class="col-2"><span class="icon-info"></span></div>
        <div class="col-10">
            {{__ "Each prerequisite below is evaluated by comparing the variable content with a specific value, using the operator. If all the prerequisites are fulfilled, this test part is presented. Otherwise, this test part is skipped."}}
        </div>
    </div>
</div>
<div class="preconditions-table">
    <div class="preconditions-table-header grid-row">
        <div class="col-5">{{__ 'Variable'}}</div>
        <div class="col-2 operator-col">{{__ 'Op.'}}</div>
        <div class="col-1 value-col">{{__ 'Value'}}</div>
        <div class="col-4"></div>
    </div>
    <div class="preconditions-table-body">
        {{#each preConditions}}
            <div class="precondition-table-item grid-row" data-index="{{@index}}">
                <div class="col-5">
                    <select class="select2"
                            name="precondition-variable"
                            aria-label="{{__ 'Variable'}}"
                            data-bind="preConditions[{{@index}}].variable"
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
                            name="precondition-operator"
                            aria-label="{{__ 'Operator'}}"
                            data-bind="preConditions[{{@index}}].operator"
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
                        class="precondition-value"
                        aria-label="{{__ 'Value'}}"
                        data-bind="preConditions[{{@index}}].value"
                        value="{{value}}">
                </div>

                <div class="col-3"></div>

                <div class="precondition-table-actions">
                    <a class="precondition-table-action"
                    role="button"
                    tabindex="0"
                    data-testid="precondition-delete"
                    aria-label="{{__ 'Delete prerequisite'}}">
                        <span class="icon-bin"></span>
                    </a>
                </div>
            </div>
        {{/each}}
    </div>
</div>
<div class="grid-row">
    <button type="button" class="precondition-add-btn btn-info small" data-action="add-precondition">
        <span class="icon-add"></span>
        {{__ 'Add a Prerequisite'}}
    </button>
</div>