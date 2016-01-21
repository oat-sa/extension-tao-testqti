<div class="timer-box">
    {{#each timers}}
        <span class="qti-timer qti-timer__type-{{type}} qti-controls lft{{#unless running}} disabled{{/unless}}" data-control="{{control}}" title="{{label}}">
            <span class="qti-timer_label truncate">{{label}}</span>
            <span class="qti-timer_time">{{value}}</span>
        </span>
    {{/each}}
</div>
