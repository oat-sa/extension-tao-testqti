        <div id="qti-navigator" class="test-sidebar test-sidebar-{{region}} flex-container-navi qti-navigator">
            <div id="qti-navigator-info" class="qti-navigator-info collapsible">
                <span class="qti-navigator-label">{{__ 'Test status'}}<span class="icon-up"></span><span class="icon-down"></span></span>
                <ul class="collapsible-panel plain">
                    <li id="qti-navigator-answered">
                        <span class="qti-navigator-label"><span class="qti-navigator-icon icon-answered"></span>{{__ 'Answered'}}<span class="qti-navigator-counter">-/-</span></span>
                    </li>
                    <li id="qti-navigator-viewed">
                        <span class="qti-navigator-label"><span class="qti-navigator-icon icon-viewed"></span>{{__ 'Viewed'}}<span class="qti-navigator-counter">-/-</span></span>
                    </li>
                    <li id="qti-navigator-unanswered">
                        <span class="qti-navigator-label"><span class="qti-navigator-icon icon-unanswered"></span>{{__ 'Unanswered'}}<span class="qti-navigator-counter">-/-</span></span>
                    </li>
                    <li id="qti-navigator-flagged">
                        <span class="qti-navigator-label"><span class="qti-navigator-icon icon-flagged"></span>{{__ 'Flagged'}}<span class="qti-navigator-counter">-/-</span></span>
                    </li>
                </ul>
            </div>

            <div id="qti-navigator-filters" class="qti-navigator-filters">
                <ul class="plain clearfix">
                    <li class="qti-navigator-filter active" data-mode="all">
                        <span title="{{__ 'Reset filters'}}">{{__ 'All'}}</span>
                    </li>
                    <li class="qti-navigator-filter" data-mode="unanswered">
                        <span class="icon-unanswered" title="{{__ 'Only display the unanswered items'}}"></span>
                    </li>
                    <li class="qti-navigator-filter" data-mode="flagged">
                        <span class="icon-flagged" title="{{__ 'Only display the items marked for review'}}"></span>
                    </li>
                </ul>
            </div>

            <div id="qti-navigator-tree" class="qti-navigator-tree">
            </div>

            <div id="qti-navigator-linear" class="qti-navigator-linear">
                <h3 class="qti-navigator-title"><span class="icon icon-warning"></span>{{__ 'Warning'}}</h3>
                <p class="qti-navigator-message">
                    {{__ 'In this part of the test navigation is not allowed.'}}
                </p>
            </div>
        </div>
