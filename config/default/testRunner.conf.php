<?php
use oat\taoQtiTest\models\runner\session\TestSession;

/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 */

/**
 * Default test runner config
 */
return array(
    /**
     * Show warning messages if time remaining less than defined (in seconds) in key.
     * Also you should define type of warning message in value.
     * Example:
     * 'assessmentItemRef' => array(
     *     999 => 'info',
     *     300 => 'warning',
     *     120 => 'error'
     * )
     * Available warning types: info (blue), warning (yellow), danger (red orange)
     * @type array
     */
    'timerWarning' => array(
        'assessmentItemRef' => null,
        'assessmentSection' => null,
        'testPart'          => null,
        'assessmentTest'    => null
    ),

    /**
     * Tells what type of progress bar to use? Can be:
     * - percentage : Classic progress bar displaying the percentage of answered items
     * - position : Progress bar displaying the position of the current item within the test session
     * - questions : Progress bar displaying the position of the last viewed question (informational items will be ignored)
     * - sections : Progress bar displaying the position of the last reached answerable section
     * - categories : Progress bar displaying the position of the last reached item only for defined categories (in the 'categories' configuration)
     * @type string
     */
    'progress-indicator' => 'percentage',

    /**
     * List of categories which will be used in progress bar
     * If empty then all categories will be used (items without categories are include)
     */
    'progress-categories' => [],

    /**
     * Tells what type of progress indicator renderer to use:
     * - percentage : Classic progress bar displaying a linear percentage bar
     * - position : Progress bar displaying a point by available element in the scope
     * @type string
     */
    'progress-indicator-renderer' => 'percentage',

    /**
     * Defines the scope of the progress bar
     * (i. e.: the number of items on which the ratio is computed). Can be:
     * - testSection : The progression within the current section
     * - testPart : The progression within the current part
     * - test : The progression within the current test
     * @type string
     */
    'progress-indicator-scope' => 'test',

    /**
     * Force the progress indicator to be always displayed
     * @type boolean
     */
    'progress-indicator-forced' => false,

    /**
     * Display the label of the progress indicator
     * @type boolean
     */
    'progress-indicator-show-label' => true,

    /**
     * Display 'item x of y' rather than 'item x'
     * @type boolean
     */
    'progress-indicator-show-total' => true,

    /**
     * Enables the test taker review screen
     * @type boolean
     */
    'test-taker-review' => true,

    /**
     * Position of the test taker review screen. Can be:
     * - left
     * - right
     * @type string
     */
    'test-taker-review-region' => 'left',

    /**
     * Show legend on review panel
     *
     * @type boolean
     */
    'test-taker-review-show-legend' => true,

    /**
     * Show review panel open on launch
     *
     * @type boolean
     */
    'test-taker-review-default-open' => true,

    /**
     * Use item title instead of item label.
     * @type boolean
     */
    'test-taker-review-use-title' => true,

    /**
     * Forces a unique title for all test items.
     * @type boolean
     */
    'test-taker-review-force-title' => false,

    /**
     * A unique title for all test items, when the option `test-taker-review-force-title` is enabled.
     * This title will be processed through a sprintf() call, with the item sequence number as argument,
     * so you can easily insert the sequence number inside the title.
     * @type string
     */
    'test-taker-review-item-title' => 'Item %d',

    /**
     * For a unique title for all informational items.
     * This will also change the items numbering sequence in the following way:
     * - item 1
     * - item 2
     * - instructions // does not impact the numbering
     * - item 3
     * - instructions // does not impact the numbering
     * - item 4
     * @type boolean
     */
    'test-taker-review-force-informational-title' => false,

    /**
     * Specify the unique title for informational items
     * if this parameter set to `false` - default label from the item will be used
     */
    'test-taker-review-informational-item-title' => 'Instructions',

    /**
     * Limits the test taker review screen to a particular scope. Can be:
     * - test : the whole test
     * - testPart : the current test part
     * - testSection : the current test section
     * @type string
     */
    'test-taker-review-scope' => 'test',

    /**
     * Prevents the test taker to access unseen items.
     * @type boolean
     */
    'test-taker-review-prevents-unseen' => true,

    /**
     * Allows the test taker to collapse the review screen: when collapsed the component is reduced to one tiny column.
     * @type boolean
     */
    'test-taker-review-can-collapse' => false,

    /**
     * Option to display to the test taker the title of subsection
     * If it's define to true, test taker will see the immediate section of item (last on the hierarchy)
     * If it's define to false, test taker will see the top section of item (first on the hierarchy)
     * @type boolean
     */
    'test-taker-review-display-subsection-title' => true,

    /**
     * Option to display to the test developer the Skipahead option
     * If it's set to true, test developer will see and be able to allow skipahead inside the selected section
     * If it's set to false, test won't see and won't be able to allow skipahead inside the selected section
     * Also, if some tests will have skipahead enabled for some sections and this option is set to false, then
     * skipahead won't work until this config value is set to true
     *
     * @type boolean
     */
    'test-taker-review-skipahead' => false,

    /**
     * Enable/Disable warning message about unanswered items at the end of the test.
     * @type boolean
     */
    'test-taker-unanswered-items-message' => true,

    /**
     * Replace logout to exit button...
     * @type boolean
     */
    'exitButton' => false,

    /**
     * Allows the next section button...
     * @type boolean
     */
    'next-section' => false,

    /**
     * After resuming test session timers will be reset to the time when the last item has been submitted.
     * @type boolean
     */
    'reset-timer-after-resume' => false,

    /**
     * Sets an extra AssessmentTestContext builder class.
     * This class have to implements \oat\taoQtiTest\models\TestContextBuilder
     * @type string
     */
    'extraContextBuilder' => null,

    /**
     * A collection of plugins related config sets
     * @type array
     */
    'plugins' => [
        /**
         * The plugin responsible for the answer masking functionality in choice interactions
         */
        'answer-masking' => [
            /**
             * if the mask state should be restored each time the tool is toggled on/off
             */
            'restoreStateOnToggle' => true,

            /**
             * if the mask state should be restored when navigating between items. Require previous option.
             */
            'restoreStateOnMove' => true
        ],

        /**
         * The plugin responsible of the runner's overlay mask
         */
        'overlay' => [
            /**
             * When set to `true`, completely obfuscate the current item when displayed
             * @type bool
             */
            'full' => false
        ],

        /**
         * The plugin responsible of the tools bar size in order to ensure it is always displayed well.
         */
        'collapser' => [
            /**
             * Manage the size of the tools bar
             * @type bool
             */
            'collapseTools' => true,

            /**
             * Manage the size of the navigation bar
             * @type bool
             */
            'collapseNavigation' => false,

            /**
             * Manually manage the size of the bottom bar by specifying which tools to collapse and in which order
             * @type bool
             */
            'collapseInOrder' => false,

            /**
             * When the buttons are reduced, allow an expand when the mouse is over a button
             * @type bool
             */
            'hover' => false,

            /**
             * Allow to set manually which buttons should collapse and in which order
             */
            'collapseOrder' => []
        ],

        /**
         * A student tool that provides a magnifier glass
         */
        'magnifier' => [
            /**
             * Smallest magnification factor
             * @type int
             */
            'zoomMin' => 2,

            /**
             * Biggest magnification factor
             * @type int
             */
            'zoomMax' => 8,

            /**
             * Increment between min an max
             * @type int
             */
            'zoomStep' => .5
        ],

        /**
         * A student tool that provides a simple calculator
         */
        'calculator' => [
            /**
             * The optional amd path to an alternative template, e.g. myExtension/runner/plugins/tool/calculator/template.tpl
             */
            'template' => ''
        ]
    ],

    /**
     * Enable the cross site request forgery token
     * @type boolean
     */
    'csrf-token' => true,

    /**
     * Config for the runner's timer
     * @type array
     */
    'timer' => [
        /**
         * The target from which computes the durations. Could be either 'client' or 'server'.
         * This config tells on which TimeLine to rely to compute the assessment test durations.
         * Caution, if the server TimeLine is always filled, the client TimeLine must be explicitly
         * provided by the implementation. If the client TimeLine is missing, the durations will be zeroed.
         * @type string
         */
        'target' => 'server'
    ],

    /**
     * The FQCN of the TestSession class
     * @type string
     */
    'test-session' => TestSession::class,

    /**
     * The FQCN of the TestSessionStorage class
     * @type string
     */
    'test-session-storage' => '\taoQtiTest_helpers_TestSessionStorage',

    /**
     * A config set that will be provided though the bootstrap
     * @type array
     */
    'bootstrap' => [
        /**
         * The extension containing the controller used as test runner service
         * @type string
         */
        'serviceExtension' => 'taoQtiTest',

        /**
         * The name of the controller used as test runner service
         * @type string
         */
        'serviceController' => 'Runner',

        /**
         * The network timeout, in seconds.
         * @type int
         */
        'timeout' => 0,

        /**
         * Config for the communication channel
         * @type array
         */
        'communication' => [
            /**
             * Enables the communication channel
             * @type boolean
             */
            'enabled' => false,

            /**
             * The type of communication channel to use. For now the only available type is 'poll'.
             * @type string
             */
            'type' => 'poll',

            /**
             * The extension containing the remote service to connect
             * @type string
             */
            'extension' => null,

            /**
             * The controller containing the remote service to connect
             * @type string
             */
            'controller' => null,

            /**
             * The action corresponding to the remote service to connect
             * @type string
             */
            'action' => 'messages',

            /**
             * List of actions which can be send to server using common communication channel
             * @type array
             */
            'syncActions' => ['move', 'skip', 'storeTraceData', 'timeout', 'exitTest'],

            /**
             * The address of the remote service to connect.
             * When this address is provided it is used instead of url building from extension/controller/action.
             * @type string
             */
            'service' => null,

            /**
             * Some additional parameters to setup the communication channel
             * @type array
             */
            'params' => []
        ],
    ],
    /*
     * Enable Allow/Disallow Skipping feature.
     * @type boolean
     */
    'enable-allow-skipping' => true,

    /*
     * Enable Allow/Disallow Validate Responses feature.
     * @type boolean
     */
    'enable-validate-responses' => true,

    /*
     * Force branch rules to be executed even if the current navigation mode is non-linear.
     * @type boolean
     */
    'force-branchrules' => false,

    /*
     * Force preconditions to be executed even if the current navigation mode is non-linear.
     * @type boolean
     */
    'force-preconditions' => false,

    /**
     * Enable path tracking (consider taken route items, rather than default route item flow for navigation).
     * @type boolean
     */
    'path-tracking' => false,

    /**
     * Always allow jumps, even if the current navigation mode is linear.
     * @type boolean
     */
    'always-allow-jumps' => false,

    /**
     * Checks if items are informational. This will change the behavior of the review panel:
     * the informational items are not taken into account in the answered/flagged counters
     * @type boolean
     */
    'check-informational' => true,

    /**
     * Keep the timer when the test taker leaves a section, in order to restore it when he/she goes back
     * @type boolean
     */
    'keep-timer-up-to-timeout' => false,

    /**
     * Allows to use keyboard shortcuts to interact with the test runner
     * @type boolean
     */
    'allow-shortcuts' => true,

    /**
     * Shortcuts scheme applied to the test runner
     * @type array
     */
    'shortcuts' => [
        'calculator' => [
            'toggle' => 'C',
        ],
        'zoom' => [
            'in' => 'I',
            'out' => 'O'
        ],
        'comment' => [
            'toggle' => 'A',
        ],
        'itemThemeSwitcher' => [
            'toggle' => 'T'
        ],
        'review' => [
            'toggle' => 'R',
            'flag' => 'M'
        ],
        'keyNavigation' => [
            'previous' => 'Shift+Tab',
            'next' => 'Tab'
        ],
        'next' => [
            'trigger' => 'J'
        ],
        'previous' => [
            'trigger' => 'K'
        ],
        'dialog' => [],
        'magnifier' => array(
            'toggle' => 'L',
            'in' => 'Shift+I',
            'out' => 'Shift+O',
            'close' => 'esc'
        ),
        'highlighter' => array(
            'toggle' => 'Shift+U'
        ),
        'area-masking' => array(
            'toggle' => 'Y'
        ),
        'line-reader' => array(
            'toggle' => 'G'
        ),
        'answer-masking' => array(
            'toggle' => 'D'
        )
    ],

    /**
     * Allows to browse the next item (before it is displayed).
     * This is required for caching scenarios
     * @type boolean
     */
    'allow-browse-next-item' => false,

    /**
     * Defines the number of items to cache, when the feature is allowed (allow-browse-next-item).
     * This is required for caching scenarios
     * @type integer
     */
    'item-cache-size' => 3,


    /**
     * Enables to run automatic navigation on items when timeLimits.minTime = timeLimits.maxTime
     */
    'guidedNavigation' => false,

    /**
     * Specifies runner tools that should keep its states in backend storage
     */
    'tool-state-server-storage' => [],

    /**
     * Defines whether to always show a warning dialog before moving to next item
     * Only applies to *linear* test parts, and only when *linearNextItemWarning* plugin is enabled
     * @type boolean
     */
    'force-enable-linear-next-item-warning' => false,

    /**
     * If 'force-enable-linear-next-item-warning' is true, should the dialog contain a "don't show again" checkbox?
     * Only applies to *linear* test parts, and only when *linearNextItemWarning* plugin is enabled
     * @type boolean
     */
    'enable-linear-next-item-warning-checkbox' => true,

);
