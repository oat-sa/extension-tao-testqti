<div class="rubricblock-props props clearfix">

    <h3>{{__ 'Rubric Block'}}: {{orderIndex}}</h3>

    <!--assessmentTest/testPart/assessmentSection/sectionPart/rubricBlock/views -->
    <!--
    <div class="grid-row">
        <div class="col-5">
            <label for="itemref-identifier">{{__ 'Views'}} <abbr title="{{__ 'Required field'}}">*</abbr></label>
        </div>
        <div class="col-6">
            <select name="view" multiple="multiple" data-bind="views">
                <option value="author">{{__ 'Author'}}</option>
                <option value="candidate">{{__ 'Candidate'}}</option>
                <option value="proctor">{{__ 'Proctor'}}</option>
                <option value="scorer">{{__ 'Scorer'}}</option>
                <option value="testConstructor">{{__ 'Test constructor'}}</option>
                <option value="tutor">{{__ 'Tutor'}}</option>
            </select>
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'Who can view the rubric block during the delivery.'}}
            </div>
        </div>
    </div>
    -->
    <!--assessmentTest/testPart/assessmentSection/sectionPart/rubricBlock/class -->
    <div class="grid-row">
        <div class="col-5">
            <label for="class">{{__ 'Class'}}</label>
        </div>
        <div class="col-6">
            <input type="text" name="class" data-bind="class" data-bind-encoder="string" data-validate="$pattern(pattern=^([a-zA-Z_\s][a-zA-Z0-9_\s-]*)?$);" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'Set the XHTML-QTI class of the rubric block.'}}
            </div>
        </div>
    </div>

    <!--assessmentTest/testPart/assessmentSection/sectionPart/rubricBlock/id -->
    <!--
    <div class="grid-row">
        <div class="col-5">
            <label for="id">{{__ 'Identifier'}}</label>
        </div>
        <div class="col-6">
            <input type="text" name="id" data-bind="id" data-bind-encoder="string" data-validate="$pattern(pattern=^([a-zA-Z_\s][a-zA-Z0-9_\s-]*)?$);" />
        </div>
        <div class="col-1 help">
            <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
            <div class="tooltip-content">
                {{__ 'Set the XHTML-QTI identifier of the rubric block.'}}
            </div>
        </div>
    </div>
    -->

    <h4 class="toggler closed" data-toggle="~ .rubric-feedback">{{__ "Feedback block"}}</h4>

    <!--assessmentTest/testPart/assessmentSection/sectionPart/rubricBlock/feedback -->
    {{#with feedback}}
    <div class="rubric-feedback toggled">

        <!--assessmentTest/testPart/assessmentSection/sectionPart/rubricBlock/feedback/activated -->
        <div class="grid-row rubric-feedback-activated">
            <div class="col-5">
                <label for="activated">{{__ 'Activated'}}</label>
            </div>
            <div class="col-6">
                <label>
                    <input type="checkbox" name="activated" value="true" data-bind="feedback.activated" data-bind-encoder="boolean" />
                    <span class="icon-checkbox"></span>
                </label>
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                    {{__ "Set the rubric block as a feedback block"}}
                </div>
            </div>
        </div>

        <!--assessmentTest/testPart/assessmentSection/sectionPart/rubricBlock/feedback/outcome -->
        <div class="grid-row rubric-feedback-outcome">
            <div class="col-5">
                <label for="feedback-outcome">{{__ 'Outcome'}}</label>
            </div>
            <div class="col-6">
                <input type="text" name="feedback-outcome" data-bind="feedback.outcome" data-bind-encoder="string" data-validate="$pattern(pattern=^([a-zA-Z_][a-zA-Z0-9_\.-]*)?$);" />
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                    {{__ "Set outcome identifier the feedback block is related to"}}
                </div>
            </div>
        </div>

        <!--assessmentTest/testPart/assessmentSection/sectionPart/rubricBlock/feedback/matchValue -->
        <div class="grid-row rubric-feedback-match-value">
            <div class="col-5">
                <label for="feedback-match-value">{{__ 'Match value'}}</label>
            </div>
            <div class="col-6">
                <input type="text" name="feedback-match-value" data-bind="feedback.matchValue" data-bind-encoder="string" data-validate="$pattern(pattern=^([a-zA-Z_][a-zA-Z0-9_\.-]*)?$);" />
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                    {{__ "Set the value of the outcome that will activate the feedback block"}}
                </div>
            </div>
        </div>
    </div>
    {{/with}}
</div>