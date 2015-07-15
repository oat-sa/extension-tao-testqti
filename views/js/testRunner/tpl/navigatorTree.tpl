                <ul class="qti-navigator-parts plain">
                    {{#each parts}}
                    <li class="qti-navigator-part collapsible {{#if active}}active{{else}}collapsed{{/if}}" data-id="{{id}}">
                        <span class="qti-navigator-label">{{label}}<span class="icon-up"></span><span class="icon-down"></span></span>
                        {{#if sections.length}}
                        <ul class="qti-navigator-sections collapsible-panel plain">
                            {{#each sections}}
                            <li class="qti-navigator-section collapsible {{#if active}}active{{else}}collapsed{{/if}}" data-id="{{id}}">
                                <span class="qti-navigator-label">{{label}}<span class="qti-navigator-counter">{{answered}}/{{items.length}}</span></span>
                                <ul class="qti-navigator-items collapsible-panel plain">
                                    {{#each items}}
                                    <li class="qti-navigator-item{{#if active}} active{{/if}}{{#if flagged}} flagged{{/if}}{{#if answered}} answered{{/if}}{{#if viewed}} viewed{{else}} unseen{{/if}}" data-id="{{id}}" data-position="{{position}}">
                                        <span class="qti-navigator-label truncate"><span class="qti-navigator-icon icon-{{#if flagged}}flagged{{else}}{{#if answered}}answered{{else}}{{#if viewed}}viewed{{else}}unseen{{/if}}{{/if}}{{/if}}"></span>{{label}}</span>
                                    </li>
                                    {{/each}}
                                </ul>
                            </li>
                            {{/each}}
                        </ul>
                        {{else}}
                        <div class="qti-navigator-linear-part collapsible-panel">
                            <h3 class="qti-navigator-title"><span class="icon icon-warning"></span>{{__ 'Warning'}}</h3>
                            <p class="qti-navigator-message">
                                {{__ 'In this part of the test navigation is not allowed.'}}
                            </p>
                            <p class="qti-navigator-actions">
                                <button class="btn-info small" data-id="{{itemId}}" data-position="{{position}}">{{__ 'Start Test-part'}}<span class="icon-forward r"></span></button>
                            </p>
                        </div>
                        {{/if}}
                    </li>
                    {{/each}}
                </ul>
