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
                'description' => 'Display test rubric blocks',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'overlay',
                'name' => 'Overlay',
                'module' => 'taoQtiTest/runner/plugins/content/overlay/overlay',
                'description' => 'Add an overlay over items when disabled',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'dialog',
                'name' => 'Dialog',
                'module' =>'taoQtiTest/runner/plugins/content/dialog/dialog',
                'description' => 'Display popups that require user interactions',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'feedback',
                'name' => 'Feedback',
                'module' => 'taoQtiTest/runner/plugins/content/feedback/feedback',
                'description' => 'Display notifications into feedback popups',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'exitMessages',
                'name' => 'Exit Messages',
                'module' => 'taoQtiTest/runner/plugins/content/dialog/exitMessages',
                'description' => 'Display messages when a test taker leaves the test',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'loading',
                'name' => 'Loading bar',
                'module' => 'taoQtiTest/runner/plugins/content/loading/loading',
                'description' => 'Show a loading bar when the test is loading',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'title',
                'name' => 'Title indicator',
                'module' => 'taoQtiTest/runner/plugins/controls/title/title',
                'description' => 'Display the title of current test element',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'modalFeedback',
                'name' => 'QTI modal feedbacks',
                'module' => 'taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback',
                'description' => 'Display Qti modalFeedback element',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti', 'required' ]
            ], [
                'id' => 'responsesAccess',
                'name' => 'Shortcuts to access the item responses',
                'module' => 'taoQtiTest/runner/plugins/content/accessibility/responsesAccess',
                'description' => 'Provide a way to navigate between item responses using the keyboard',
                'category' => 'content',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ]
        ],
        'controls' => [
            [
                'id' => 'timer',
                'name' => 'Timer indicator',
                'module' => 'taoQtiTest/runner/plugins/controls/timer/timer',
                'description' => 'Add countdown when remaining time',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'progressbar',
                'name' => 'Progress indicator',
                'module' => 'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
                'description' => 'Display the current progression within the test',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'duration',
                'name' => 'Duration record',
                'module' => 'taoQtiTest/runner/plugins/controls/duration/duration',
                'description' => 'Record accurately time spent by the test taker',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ], [
                'id' => 'connectivity',
                'name' => 'Connectivity check',
                'module' => 'taoQtiTest/runner/plugins/controls/connectivity/connectivity',
                'description' => 'Pause the test when the network loose the connection',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'technical' ]
            ], [
                'id' => 'testState',
                'name' => 'Test state',
                'module' => 'taoQtiTest/runner/plugins/controls/testState/testState',
                'description' => 'Manage test state',
                'category' => 'controls',
                'active' => true,
                'tags' => [ 'core', 'technical', 'required' ]
            ]
        ],
        'navigation' => [
            [
                'id' => 'review',
                'name' => 'Navigation and review panel',
                'module' => 'taoQtiTest/runner/plugins/navigation/review/review',
                'description' => 'Enable a panel to handle navigation and item reviews',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'previous',
                'name' => 'Previous button',
                'module' => 'taoQtiTest/runner/plugins/navigation/previous',
                'description' => 'Enable to move backward',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti', 'required' ]
            ], [
                'id' => 'next',
                'name' => 'Next button',
                'module' => 'taoQtiTest/runner/plugins/navigation/next',
                'description' => 'Enable to move forward',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti', 'required' ]
            ], [
                'id' => 'nextSection',
                'name' => 'Next section button',
                'module' => 'taoQtiTest/runner/plugins/navigation/nextSection',
                'description' => 'Enable to move to the next available section',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'skip',
                'name' => 'Skip button',
                'module' => 'taoQtiTest/runner/plugins/navigation/skip',
                'description' => 'Skip the current item',
                'category' => 'navigation',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ]
        ],
        'tools' => [
            [
                'id' => 'comment',
                'name' => 'Comment tool',
                'module' => 'taoQtiTest/runner/plugins/tools/comment/comment',
                'description' => 'Allow test taker to comment an item',
                'category' => 'tools',
                'active' => true,
                'tags' => [ 'core', 'qti' ]
            ], [
                'id' => 'calculator',
                'name' => 'Caculator tool',
                'module' =>'taoQtiTest/runner/plugins/tools/calculator',
                'description' => 'Gives the student access to a basic calculator',
                'category' => 'tools',
                'active' => true,
                'tags' => [ 'core' ]
            ], [
                'id' => 'zoom',
                'name' => 'Zoom',
                'module' =>'taoQtiTest/runner/plugins/tools/zoom',
                'description' => 'Zoom in and out the item content',
                'category' => 'tools',
                'active' => false,
                'tags' => [ 'core' ]
            ], [
                'id' => 'itemThemeSwitcher',
                'name' => 'Item themes switcher',
                'module' => 'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher',
                'description' => 'Allow to switch between themes',
                'category' => 'tools',
                'active' => false,
                'tags' => [ 'core' ]
            ], [
                'id' => 'documentViewer',
                'name' => 'Document Viewer',
                'module' => 'taoQtiTest/runner/plugins/tools/documentViewer/documentViewer',
                'description' => 'Display a document as requested by an event',
                'category' => 'tools',
                'active' => false,
                'tags' => [ ]
            ], [
                'id' => 'highlighter',
                'name' => 'Text Highlighter',
                'module' => 'taoQtiTest/runner/plugins/tools/highlighter/plugin',
                'description' => 'Allows the test taker to highlight text',
                'category' => 'tools',
                'active' => true,
                'tags' => [ ]
            ]
        ],
        'security' => [
            [
                'id' => 'disableRightClick',
                'name' => 'Disable right click',
                'module' => 'taoQtiTest/runner/plugins/security/disableRightClick',
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

        foreach(self::$plugins as $category => $categoryPlugins) {
            foreach($categoryPlugins as $pluginData){
                if( $registry->register(TestPlugin::fromArray($pluginData)) ) {
                    $count++;
                }
            }
        }

        return new Report(Report::TYPE_SUCCESS, $count .  ' plugins registered.');
    }
}
