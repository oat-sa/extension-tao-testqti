<div class="shortcuts-list-wrapper">
    <div class="shortcuts-list" role="dialog" aria-modal="true" aria-labelledby="jumplinks/shortcuts-heading"
        aria-describedby="jumplinks/shortcuts-description">
        <h2 class="shortcuts-list-title" id="jumplinks/shortcuts-heading">
            {{__ "Keyboard Navigation"}}
        </h2>
        <div id="jumplinks/shortcuts-description">
            <p class="shortcuts-list-description">
                {{__ "Keyboard shortcuts for the Accessibility Tools are available to the Test-taker."}}
            </p>
            <p class="shortcuts-list-description">
                {{__ "You can magnify the content by up to 200%. Check your browser settings to find out how to do it."}}
            </p>
        </div>
        <button aria-label="Close dialog" class="btn-close small" data-control="close-btn" type="button">
            <span class="icon-close"></span>
        </button>
        {{#each shortcutsGroups}}
        <div class="shortcuts-group-wrapper">
            <h3 class="shortcuts-group-title">{{label}}</h3>
            <ul class="shortcuts-group-list">
                {{#each shortcuts}}
                <li class="shortcut-item">
                    <span class="shortcut-item-shortcut">
                        <kbd>{{shortcut}}</kbd>
                    </span>
                    <span class="shortcut-item-action">
                        {{label}}
                    </span>
                </li>
                {{/each}}
            </ul>
        </div>
        {{/each}}
    </div>
</div>
