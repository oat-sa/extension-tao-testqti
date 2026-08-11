<div class="translation-props clearfix">

    <!-- translation properties -->
    <h3>{{__ 'Test translation status'}}</h3>

    {{!-- <h4 class="toggler opened" data-toggle="~ .test-translation">{{__ 'Translation'}}</h4> --}}
    <div class="test-translation">
        <!-- translation/status -->
        <div class="grid-row">
            <div class="col-2">
                <label for="test-max-time">{{__ 'Status'}}</label>
            </div>
            <div class="col-9 translation-group">
                <label class="smaller-prompt">
                    <input type="radio" name="translationStatus" value="translating" {{#equal translationStatus "translating"
                        }}checked{{/equal}} id="translationStatus-translating" />
                    <span class="icon-radio"></span>
                    <label for="translationStatus-translating">{{__ 'In progress'}} </label>
                </label>
                <br>
                <label class="smaller-prompt">
                    <input type="radio" name="translationStatus" value="translated" {{#equal translationStatus "translated"
                        }}checked{{/equal}} id="translationStatus-translated" />
                    <span class="icon-radio"></span>
                    <label for="translationStatus-translated">{{__ 'Translation completed'}} </label>
                </label>
            </div>
            <div class="col-1 help">
                <span class="icon-help" data-tooltip="~ .tooltip-content" data-tooltip-theme="info"></span>
                <div class="tooltip-content">
                    {{__ 'Define the status of the translation.'}}
                </div>
            </div>
        </div>
    </div>
</div>
