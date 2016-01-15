<div class="test-runner-scope">
    <div class="action-bar content-action-bar horizontal-action-bar top-action-bar">

        <div class="control-box">
            {{!--
            <div class="title-box truncate">
                <span data-control="qti-test-title" class="qti-controls">On github pages use home button to toggle content</span>
                <span data-control="qti-test-position" class="qti-controls"> - Section 1</span>
            </div>
            <div class="item-number-box">
                <div data-control="item-number" class="qti-controls lft"></div>
            </div>
            <div class="timer-box">
                <div data-control="qti-timers" class="qti-controls lft"></div>
            </div>
            <div class="progress-box">
                <div data-control="progress-bar" class="qti-controls progressbar info"><span title="0%" style="width: 0%;"></span></div>
                <div data-control="progress-label" class="qti-controls">0%</div>
            </div>
            --}}
        </div>
    </div>

    <main>

        <!-- optional left sidebar -->
        {{!--
        <aside class="test-sidebar test-sidebar-left">
            <p>Left Sidebar</p>
        </aside>--}}

        <section class="content-wrapper">
            <div id="qti-content"></div>
        </section>


        {{!-- Optional right sidebar
        <aside class="test-sidebar test-sidebar-right">
            <p>Right Sidebar</p>
        </aside>
        --}}
    </main>

    <nav class="action-bar content-action-bar horizontal-action-bar bottom-action-bar">

        <div class="control-box size-wrapper">
            <div class="lft tools-box">
                <ul class="plain tools-box-list"></ul>
            </div>
            <div class="rgt navi-box">
                <ul class="plain navi-box-list">

                {{!--
                    <li data-control="move-backward" class="small btn-info action" title="Submit and go to the previous item">
                        <a class="li-inner" href="#">
                            <span class="icon-backward"></span>
                            <span class="text">Previous</span>
                        </a>
                    </li>
                    <li data-control="move-forward" class="small btn-info action forward" title="Submit and go to the next item">
                        <a class="li-inner" href="#">
                            <span class="icon-forward"></span>
                            <span class="text">Next</span>
                        </a>
                    </li>
                    <li data-control="move-end" class="small btn-info action forward" title="Submit and go to the end of the test">
                        <a class="li-inner" href="#">
                            <span class="icon-fast-forward"></span>
                            <span class="text">End Test</span>
                        </a>
                    </li>
                    <li data-control="next-section" class="small btn-info action" title="Skip to the next section">
                        <a class="li-inner" href="#">
                            <span class="icon-external"></span>
                            <span class="text">Next Section</span>
                        </a>
                    </li>
                    <li data-control="skip" class="small btn-info action skip" title="Skip to the next item">
                        <a class="li-inner" href="#">
                            <span class="icon-external"></span>
                            <span class="text">Skip</span>
                        </a>
                    </li>
                    <li data-control="skip-end" class="small btn-info action skip" title="Skip to the end of the test">
                        <a class="li-inner" href="#">
                            <span class="icon-external"></span>
                            <span class="text">Skip &amp; End Test</span>
                        </a>
                    </li>
                    --}}
                </ul>
            </div>
        </div>
    </nav>
</div>
