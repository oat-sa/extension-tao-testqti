<div class="connectivity-box {{state}}{{#if message}} with-message{{/if}}">
    {{#if message}}<span class="message-connect">{{__ 'Online'}}</span>{{/if}}<span data-control="connectivity-connected" class="qti-controls icon-connect" title="{{__ 'Connected to server'}}"></span>
    {{#if message}}<span class="message-disconnected">{{__ 'Offline'}}</span>{{/if}}<span data-control="connectivity-disconnected" class="qti-controls icon-disconnect" title="{{__ 'Disconnected from server'}}"></span>
</div>
