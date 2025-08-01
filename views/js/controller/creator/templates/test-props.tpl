<div class="test-props props clearfix">
    {{#if translation}}<hr />{{/if}}

    <!-- test properties -->
    <h3 data-bind="title"></h3>

    {{#if showIdentifier}}
    <!-- assessmentTest/identifier -->
        <div class="grid-row">
            <div class="col-5">
                <label for="test-identifier">{{__ 'Identifier'}} <abbr title="{{__ 'Required field'}}">*</abbr></label>
                <span id="props-{{identifier}}" data-bind="identifier" style="display: none;">{{identifier}}</span>
            </div>
            <div class="col-6">
                <input type="text" name="test-identifier"{{#if readonlyTestIdentifier}} readonly{{/if}} data-bind="identifier" data-validate="$notEmpty; $idFormat; $testIdAvailable(identifier={{identifier}});" />
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                {{__ 'The principle identifier of the test.'}}
                </div>
            </div>
        </div>
    {{/if}}

<!-- assessmentTest/title -->
{{#if translation}}
    <div class="grid-row">
        <div class="col-5">
            <label for="test-title">{{__ 'Translated title'}} <abbr title="{{__ 'Required field'}}">*</abbr></label>
        </div>
        <div class="col-6">
            <input type="text" name="test-title" data-bind="title" data-validate="$notEmpty" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
            {{__ 'The translated test title.'}}
            </div>
        </div>
    </div>
    <div class="grid-row">
        <div class="col-5">
            <label for="test-origin-title">{{__ 'Original title'}}</label>
        </div>
        <div class="col-6">
            <input type="text" name="test-origin-title" value="{{originTitle}}" readonly />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'The original title of the test.'}}
            </div>
        </div>
    </div>
{{else}}
    <div class="grid-row">
        <div class="col-5">
            <label for="test-title">{{__ 'Title'}} <abbr title="{{__ 'Required field'}}">*</abbr></label>
        </div>
        <div class="col-6">
            <input type="text" name="test-title" data-bind="title" data-validate="$notEmpty" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
            {{__ 'The test title.'}}
            </div>
        </div>
    </div>

    {{#if showTimeLimits}}
        <h4 class="toggler closed" data-toggle="~ .test-time-limits">{{__ 'Time Limits'}}</h4>

    <!-- assessmentTest/timeLimits -->
        <div class="test-time-limits toggled">

    {{!-- Property not yet available in delivery
    <!--assessmentTest/timeLimits/minTime -->
            <div class="grid-row">
                <div class="col-5">
                    <label for="test-min-time">{{__ 'Minimum Duration'}}</label>
                </div>
                <div class="col-6 duration-group">
                    <input type="text" name="test-min-time" value="00:00:00" data-duration="HH:mm:ss" data-bind="timeLimits.minTime" data-bind-encoder="time" />
                </div>
                <div class="col-1 help">
                    <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                    <div class="tooltip-content">
                    {{__ 'Minimum duration for the test.'}}
                    </div>
                </div>
            </div>
    --}}

    <!-- assessmentTest/timeLimits/maxTime -->
            <div class="grid-row">
                <div class="col-5">
                    <label for="test-max-time">{{__ 'Maximum Duration'}}</label>
                </div>
                <div class="col-6 duration-group">
                    <input type="text" name="max-time" value="00:00:00" data-duration="HH:mm:ss" data-bind="timeLimits.maxTime" data-bind-encoder="time" />
                </div>
                <div class="col-1 help">
                    <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                    <div class="tooltip-content">
                    {{__ 'Maximum duration for the all test.'}}
                    </div>
                </div>
            </div>

        {{#if lateSubmission}}
            <!-- assessmentTest/timeLimits/allowLateSubmission -->
                    <div class="grid-row pseudo-label-box checkbox-row">
                        <div class="col-5">
                            {{__ 'Late submission allowed'}}
                        </div>
                        <div class="col-6">
                            <label>
                                <input type="checkbox" name="test-allow-late-submission" value="true" data-bind="timeLimits.allowLateSubmission" data-bind-encoder="boolean" />
                                <span class="icon-checkbox"></span>
                            </label>
                        </div>
                        <div class="col-1 help">
                            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                            <div class="tooltip-content">
                            {{__ "Whether a candidate's response that is beyond the maximum duration should still be accepted."}}
                            </div>
                        </div>
                    </div>
        {{/if}}
        </div>
    {{/if}}

    <h4 class="toggler closed" data-toggle="~ .test-scoring">{{__ "Scoring"}}</h4>

<!-- assessmentTest/scoring -->
    {{#with scoring}}
    <div class="test-scoring toggled">

<!-- assessmentTest/scoring/outcomeProcessing -->
        <div class="grid-row">
            <div class="col-5">
                <label for="test-outcome-processing">{{__ 'Outcome processing'}}</label>
            </div>
            <div class="col-6">
                <select name="test-outcome-processing" class="select2" data-bind="scoring.outcomeProcessing" data-bind-encoder="string" data-has-search="false">
                {{#each modes}}
                    <option value="{{key}}" {{#if selected}}selected="selected"{{/if}}>{{label}}</option>
                {{/each}}
                </select>
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                    {{__ "Select the way the responses of your test should be processed"}}
                </div>
            </div>
        </div>

<!-- assessmentTest/scoring/categoryScore -->
        <div class="grid-row test-category-score checkbox-row">
            <div class="col-5">
                <label for="test-category-score">{{__ 'Category score'}}</label>
            </div>
            <div class="col-6">
                <label>
                    <input type="checkbox" name="test-category-score" value="true" data-bind="scoring.categoryScore" data-bind-encoder="boolean" />
                    <span class="icon-checkbox"></span>
                </label>
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                    {{__ "Also compute the score per categories"}}
                </div>
            </div>
        </div>

<!-- assessmentTest/scoring/cutScore -->
        <div class="grid-row test-cut-score">
            <div class="col-5">
                <label for="test-cut-score">{{__ 'Cut score (pass ratio)'}}</label>
            </div>
            <div class="col-6">
                <input type="text" name="test-cut-score" value="0" data-bind="scoring.cutScore" data-bind-encoder="float" data-validate="$numeric;" />
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                    {{__ "Set the cut score (or pass score ratio) associated to the test. It must be a float between 0 and 1."}}
                </div>
            </div>
        </div>

<!-- assessmentTest/scoring/weightIdentifier -->
        <div class="grid-row test-weight-identifier">
            <div class="col-5">
                <label for="test-weight-identifier">{{__ 'Weight'}}</label>
            </div>
            <div class="col-6">
                <input type="text" name="test-weight-identifier" data-bind="scoring.weightIdentifier" data-validate="$pattern(pattern=^([a-zA-Z_][a-zA-Z0-9_\.-]*)?$);" />
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                    {{__ "Set the weight identifier used to process the score"}}
                </div>
            </div>
        </div>

<!-- assessmentTest/scoring/description -->
        <div class="grid-row">
            <div class="col-12">
                {{#each modes}}
                <div class="feedback-info test-outcome-processing-description" data-key="{{key}}">
                    <span class="icon-info"></span>
                    {{description}}
                </div>
                {{#if error}}
                <div class="feedback-error test-outcome-processing-error hidden" data-key="{{key}}">
                    <span class="icon-error"></span>
                    {{error}}
                </div>
                {{/if}}
                {{/each}}
            </div>
        </div>
    </div>
    {{/with}}
    {{#if showOutcomeDeclarations}}
        <h4 class="toggler closed" data-toggle="~ .test-outcome-declarations">{{__ 'Outcome declarations'}}</h4>

        <!-- assessmentTest/outcomeDeclarations -->
        <div class="test-outcome-declarations toggled">
            <div class="grid-row test-outcomes-generate">
                <div class="col-12 align-right">
                    <button class="btn-info small" data-action="generate-outcomes"><span class="icon icon-reset"></span>{{__ 'Regenerate'}}</button>
                </div>
            </div>
            <div class="outcome-declarations"></div>
            <div class="outcome-declarations-manual"></div>
            <div class="grid-row test-outcomes-declaration">
                <div class="col-12">
                    <button type="button" class="adder feedbackRule-add btn-info small" data-action="add-outcome-declaration">
                        <span class="icon-add"></span>{{__ "Add an outcome declaration"}}
                    </button>
                </div>
            </div>
            <div class="grid-row">
                <div class="col-12">
                    <div class="test-manual-outcomes-declaration"></div>
                </div>
            </div>
        </div>
    {{/if}}
{{/if}}
</div>
