<div class="grid-row itemref-weight">
    <div class="col-9">
        <input data-bind="identifier" data-validate="$notEmpty $testIdFormat; $testIdAvailable(original={{identifier}});" type="text" value="{{identifier}}" />
    </div>
    <div class="col-2">
        <input data-bind="value" data-validate="$notEmpty" type="text" value="{{value}}" />
    </div>
    <div class="col-1">
        <a class="itemref-weight-remove" data-delete=":parent .itemref-weight">
            <span class="icon-bin"></span>
        </a>
    </div>
</div>