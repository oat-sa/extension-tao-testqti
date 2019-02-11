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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA;
 */

namespace oat\taoQtiTest\scripts\install;

use common_ext_action_InstallAction as InstallAction;
use common_report_Report as Report;
use oat\taoTests\models\runner\plugins\PluginRegistry;
use oat\taoTests\models\runner\plugins\TestPlugin;

/**
 * Installation action that registers the test runner plugins
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
class RegisterTestRunnerPlugins extends InstallAction
{

    public static $plugins = [
        'content' => [
            [
                'id' => 'rubricBlock',
                'name' => 'Rubric Block',
                'module' => 'taoQtiTest/runner/plugins/content/rubricBlock/rubricBlock',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display test rubric blocks',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'overlay',
                'name' => 'Overlay',
                'module' => 'taoQtiTest/runner/plugins/content/overlay/overlay',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Add an overlay over items when disabled',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'dialog',
                'name' => 'Dialog',
                'module' =>'taoQtiTest/runner/plugins/content/dialog/dialog',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display popups that require user interactions',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'feedback',
                'name' => 'Feedback',
                'module' => 'taoQtiTest/runner/plugins/content/feedback/feedback',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display notifications into feedback popups',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'exitMessages',
                'name' => 'Exit Messages',
                'module' => 'taoQtiTest/runner/plugins/content/dialog/exitMessages',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display messages when a test taker leaves the test',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'loading',
                'name' => 'Loading bar',
                'module' => 'taoQtiTest/runner/plugins/content/loading/loading',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Show a loading bar when the test is loading',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'title',
                'name' => 'Title indicator',
                'module' => 'taoQtiTest/runner/plugins/controls/title/title',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display the title of current test element',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'modalFeedback',
                'name' => 'QTI modal feedbacks',
                'module' => 'taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display Qti modalFeedback element',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti', 'required' ]
            ], [
                'id' => 'keyNavigation',
                'name' => 'Using key to navigate test runner',
                'module' => 'taoQtiTest/runner/plugins/content/accessibility/keyNavigation',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Provide a way to navigate within the test runner with the keyboard',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ],
            [
                'id' => 'collapser',
                'name' => 'Collapser',
                'module' => 'taoQtiTest/runner/plugins/content/responsiveness/collapser',
                'description' => 'Reduce the size of the tools when the available space is not enough',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core' ]
            ],
            [
                'id' => 'focusOnFirstField',
                'name' => 'Focus on first form field',
                'module'     => 'taoQtiTest/runner/plugins/content/accessibility/focusOnFirstField',
                'bundle'      => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Sets focus on first form field',
                'category' => 'content',
                'active' => true,
                'tags' => []
            ]
        ],
        'controls' => [
            [
                'id' => 'timer',
                'name' => 'Timer indicator',
                'module' => 'taoQtiTest/runner/plugins/controls/timer/plugin',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Add countdown when remaining time',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'progressbar',
                'name' => 'Progress indicator',
                'module' => 'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display the current progression within the test',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'duration',
                'name' => 'Duration record',
                'module' => 'taoQtiTest/runner/plugins/controls/duration/duration',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Record accurately time spent by the test taker',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'connectivity',
                'name' => 'Connectivity check',
                'module' => 'taoQtiTest/runner/plugins/controls/connectivity/connectivity',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Pause the test when the network loose the connection',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'technical' ]
            ], [
                'id' => 'testState',
                'name' => 'Test state',
                'module' => 'taoQtiTest/runner/plugins/controls/testState/testState',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Manage test state',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'itemTraceVariables',
                'name' => 'Item trace variables',
                'module' => 'taoQtiTest/runner/plugins/controls/trace/itemTraceVariables',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Send item trace variables',
                'category' => 'controls',
                'active' => false,
                'tags' => [ 'core', 'technical' ]
            ]
        ],
        'navigation' => [
            [
                'id' => 'review',
                'name' => 'Navigation and review panel',
                'module' => 'taoQtiTest/runner/plugins/navigation/review/review',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Enable a panel to handle navigation and item reviews',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'previous',
                'name' => 'Previous button',
                'module' => 'taoQtiTest/runner/plugins/navigation/previous',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Enable to move backward',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti', 'required' ]
            ], [
                'id' => 'next',
                'name' => 'Next button',
                'module' => 'taoQtiTest/runner/plugins/navigation/next',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Enable to move forward',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti', 'required' ]
            ], [
                'id' => 'nextSection',
                'name' => 'Next section button',
                'module' => 'taoQtiTest/runner/plugins/navigation/nextSection',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Enable to move to the next available section',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'skip',
                'name' => 'Skip button',
                'module' => 'taoQtiTest/runner/plugins/navigation/skip',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Skip the current item',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'allowSkipping',
                'name' => 'Allow Skipping',
                'module' => 'taoQtiTest/runner/plugins/navigation/allowSkipping',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Prevent submission of default/null responses',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'validateResponses',
                'name' => 'Validate Responses',
                'module' => 'taoQtiTest/runner/plugins/navigation/validateResponses',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Prevent submission of invalid responses',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'warnBeforeLeaving',
                'name' => 'Warn before leaving',
                'module' => 'taoQtiTest/runner/plugins/navigation/warnBeforeLeaving',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Warn the test taker when closing the browser',
                'category' => 'navigation',
                'active' => false,
                'tags' => [ ]
            ], [
                'id' => 'linearNextItemWarning',
                'name' => 'Linear next item warning',
                'module' => 'taoQtiTest/runner/plugins/navigation/next/linearNextItemWarning',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Displays a dialog before next item in linear test parts',
                'category' => 'navigation',
                'active' => false,
                'tags' => [ ]
            ]
        ],
        'tools' => [
            [
                'id' => 'comment',
                'name' => 'Comment tool',
                'module' => 'taoQtiTest/runner/plugins/tools/comment/comment',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Allow test taker to comment an item',
                'category' => 'tools',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'calculator',
                'name' => 'Caculator tool',
                'module' =>'taoQtiTest/runner/plugins/tools/calculator',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Gives the student access to a basic calculator',
                'category' => 'tools',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'zoom',
                'name' => 'Zoom',
                'module' =>'taoQtiTest/runner/plugins/tools/zoom',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Zoom in and out the item content',
                'category' => 'tools',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'itemThemeSwitcher',
                'name' => 'Item themes switcher',
                'module' => 'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Allow to switch between themes',
                'category' => 'tools',
                'active' => false,
                'tags' => [ 'core' ]
            ], [
                'id' => 'documentViewer',
                'name' => 'Document Viewer',
                'module' => 'taoQtiTest/runner/plugins/tools/documentViewer/documentViewer',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display a document as requested by an event',
                'category' => 'tools',
                'active' => false,
                'tags' => [ ]
            ], [
                'id' => 'highlighter',
                'name' => 'Text Highlighter',
                'module' => 'taoQtiTest/runner/plugins/tools/highlighter/plugin',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Allows the test taker to highlight text',
                'category' => 'tools',
                'active' => true,
                'tags' => [ ]
            ], [
                'id' => 'magnifier',
                'name' => 'Magnifier',
                'module' => 'taoQtiTest/runner/plugins/tools/magnifier/magnifier',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Gives student access to a magnification tool',
                'category' => 'tools',
                'active' => true,
                'tags' => [  ]
            ], [
                'id' => 'lineReader',
                'name' => 'Line Reader',
                'module' => 'taoQtiTest/runner/plugins/tools/lineReader/plugin',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Display a customisable mask with a customisable hole in it!',
                'category' => 'tools',
                'active' => true,
                'tags' => [  ]
            ], [
                'id' => 'answerMasking',
                'name' => 'Answer Masking',
                'module' => 'taoQtiTest/runner/plugins/tools/answerMasking/plugin',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Hide all answers of a choice interaction and allow revealing them',
                'category' => 'tools',
                'active' => true,
                'tags' => [  ]
            ], [
                'id' => 'eliminator',
                'name' => 'Eliminate choices',
                'module' => 'taoQtiTest/runner/plugins/tools/answerElimination/eliminator',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Allows student to eliminate choices',
                'category' => 'tools',
                'active' => true,
                'tags' => [  ]
            ], [
                'id'          => 'area-masking',
                'name'        => 'Area Masking',
                'module'      => 'taoQtiTest/runner/plugins/tools/areaMasking/areaMasking',
                'bundle'      => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Mask areas of the item',
                'category'    => 'tools',
                'active'      => true,
                'tags'        => [  ]
            ]
        ],
        'security' => [
            [
                'id' => 'disableRightClick',
                'name' => 'Disable right click',
                'module' => 'taoQtiTest/runner/plugins/security/disableRightClick',
                'bundle' => 'taoQtiTest/loader/testPlugins.min',
                'description' => 'Disable right click context menu on items',
                'category' => 'security',
                'active' => false,
                'tags' => [ 'core' ]
            ]
        ]
    ];

    public function __invoke($params)
    {
        $registry = PluginRegistry::getRegistry();
        $count = 0;

        foreach(self::$plugins as $categoryPlugins) {
            foreach($categoryPlugins as $pluginData){
                if( $registry->register(TestPlugin::fromArray($pluginData)) ) {
                    $count++;
                }
            }
        }

        return new Report(Report::TYPE_SUCCESS, $count .  ' plugins registered.');
    }
}
