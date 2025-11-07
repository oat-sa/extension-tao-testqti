{{#each outcomes}}
<div class="outcome-container panel subpanel{{#if readonly}} readonly{{else}} editable deletable{{/if}} {{#if hidden}}hidden{{/if}}" data-serial="{{serial}}">
    <div class="identifier-label" title="{{interpretation}}">
        <span class="label">{{identifier}}</span>
        <input class="identifier"
               name="identifier"
               value="{{identifier}}"
               type="text"
               placeholder="e.g. OUTCOME"
               data-validate="$notEmpty; $pattern(pattern=^([a-zA-Z_][a-zA-Z0-9_\\.-]*)$);">
    </div>
    <span class="trigger icon-bin" title="{{titleDelete}}" data-role="delete"></span>
    <span class="trigger icon-edit" title="{{titleEdit}}" data-role="edit"></span>
    <div class="outcome-properties-form">
        <div class="panel interpretation hidden">
            <label for="interpretation" class="has-icon">{{__ "Interpretation"}}</label>
            <span class="icon-help" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "A human interpretation of the variable's value."}}</div>
            <input name="interpretation" value="{{interpretation}}" type="text">
        </div>
        <div class="panel longinterpretation">
            <label for="longInterpretation" class="has-icon">{{__ "Long interpretation"}}</label>
            <span class="icon-help" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "An optional link to an extended interpretation of the outcome variable."}}</div>
            <input name="longInterpretation"
                   placeholder="https://www.example.com/doc.pdf"
                   value="{{longInterpretation}}"
                   type="text"
                   data-validate="$isValidUrl;">
        </div>
        <div class="panel scale-selector hidden">
            <label for="scale" class="has-icon">{{__ "Scale"}}</label>
            <span class="icon-help" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "Select or enter a scale for this outcome."}}</div>
            <input name="scale" value="" type="text">
        </div>
        <div class="panel rubric hidden">
            <label for="rubric" class="has-icon">{{__ "Rubric"}}</label>
            <span class="icon-help" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "Enter rubric content for this outcome scale."}}</div>
            <input name="rubric" value="" type="text">
        </div>
        <div class="panel externalscored">
            <label for="externalScored" class="has-icon">{{__ "External Scored"}}</label>
            <span class="icon-help" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "Select if you want the outcome declaration to be processed by an external system or human scorer. This is typically the case for items asking candidates to write an essay."}}</div>
            <select name="externalScored" class="select2" data-has-search="false" {{#if externalScoredDisabled}} disabled="disabled" {{/if}}>
                {{#each externalScored}}
                    <option value="{{@key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
                {{/each}}
            </select>
        </div>
        <div class="panel minimum-maximum">
            <label class="has-icon">{{__ "Value"}}</label>
            <span class="icon-help" data-tooltip="~ .tooltip-content:first" data-tooltip-theme="info"></span>
            <div class="tooltip-content">{{__ "Defines the maximum magnitude of numeric outcome variables, the maximum must be a positive value and the minimum may be negative."}}</div>
            <input name="normalMinimum" value="{{normalMinimum}}" data-increment="1" type="text" {{#if scale}}disabled{{/if}} />
            <label class="spinner">{{__ "to"}}</label>
            <input name="normalMaximum" value="{{normalMaximum}}" data-increment="1" data-min="0" type="text" {{#if scale}}disabled{{/if}} />
        </div>
    </div>
</div>
{{/each}}
