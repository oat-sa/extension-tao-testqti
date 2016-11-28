<?php
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
     * @type string
     */
    'progress-indicator' => 'percentage',

    /**
     * When the `progress-indicator` option is set to `position`, define the scope of progress
     * (i. e.: the number of items on which the ratio is computed). Can be:
     * - testSection : The progression within the current section
     * - testPart : The progression within the current part
     * - test : The progression within the current test
     * @type string
     */
    'progress-indicator-scope' => 'testSection',

    /**
     * Force the progress indicator to be always displayed
     * @type string
     */
    'progress-indicator-forced' => false,

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
     * Forces a unique title for all test items.
     * @type string
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
             * When the buttons are reduced, allow an expand when the mouse is over a button
             * @type bool
             */
            'hover' => false
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
     * The namespace of the TestSession class
     * @type string
     */
    'test-session' => '\taoQtiTest_helpers_TestSession',

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
    'enable-allow-skipping' => false,

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
            'toggle' => 'T',
            'loop' => 'Y',
            'select' => 'U'
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
        ]
    ],
);
