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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

namespace oat\taoQtiTest\scripts\install;

use oat\oatbox\extension\InstallAction;

/**
 * This declares bundling options for requirejs to the extensions configuration
 */
class SetRequireJSBundlesConfig extends InstallAction
{
    public function __invoke($params)
    {
        $ext = common_ext_ExtensionsManager::singleton()->getExtensionById('taoQtiTest');
        $ext->setConfig('requirejsbundles', array(
            array(
                'name' => 'taoqtitest_bundle',
                'path' => ROOT_URL . 'taoQtiTest/views/dist/controllers.min',
                'modules' => array(
                    'taoQtiTest/controller/creator/creator',
                    'taoQtiTest/controller/creator/encoders/dom2qti',
                    'taoQtiTest/controller/creator/helpers/baseType',
                    'taoQtiTest/controller/creator/helpers/cardinality',
                    'taoQtiTest/controller/creator/helpers/category',
                    'taoQtiTest/controller/creator/helpers/categorySelector',
                    'taoQtiTest/controller/creator/helpers/ckConfigurator',
                    'taoQtiTest/controller/creator/helpers/outcome',
                    'taoQtiTest/controller/creator/helpers/outcomeValidator',
                    'taoQtiTest/controller/creator/helpers/processingRule',
                    'taoQtiTest/controller/creator/helpers/qtiElement',
                    'taoQtiTest/controller/creator/helpers/qtiTest',
                    'taoQtiTest/controller/creator/helpers/scoring',
                    'taoQtiTest/controller/creator/helpers/sectionBlueprints',
                    'taoQtiTest/controller/creator/helpers/sectionCategory',
                    'taoQtiTest/controller/creator/modelOverseer',
                    'taoQtiTest/controller/creator/templates/index',
                    'taoQtiTest/controller/creator/views/actions',
                    'taoQtiTest/controller/creator/views/item',
                    'taoQtiTest/controller/creator/views/itemref',
                    'taoQtiTest/controller/creator/views/property',
                    'taoQtiTest/controller/creator/views/rubricblock',
                    'taoQtiTest/controller/creator/views/section',
                    'taoQtiTest/controller/creator/views/test',
                    'taoQtiTest/controller/creator/views/testpart',
                    'taoQtiTest/controller/routes',
                    'taoQtiTest/controller/runtime/testRunner',
                )
            ),
            array(
                'name' => 'taoqtitest_runner_bundle',
                'path' => ROOT_URL . 'taoQtiTest/views/dist/controllers.min',
                'modules' => array(
                    'taoQtiTest/controller/runner/runner',
                    'taoQtiTest/runner/config/assetManager',
                    'taoQtiTest/runner/config/qtiServiceConfig',
                    'taoQtiTest/runner/helpers/currentItem',
                    'taoQtiTest/runner/helpers/map',
                    'taoQtiTest/runner/helpers/messages',
                    'taoQtiTest/runner/helpers/navigation',
                    'taoQtiTest/runner/helpers/stats',
                    'taoQtiTest/runner/navigator/navigator',
                    'taoQtiTest/runner/provider/qti',
                    'taoQtiTest/runner/proxy/cache/actionStore',
                    'taoQtiTest/runner/proxy/cache/assetLoader',
                    'taoQtiTest/runner/proxy/cache/itemStore',
                    'taoQtiTest/runner/proxy/cache/proxy',
                    'taoQtiTest/runner/proxy/loader',
                    'taoQtiTest/runner/proxy/qtiServiceProxy',
                    'taoQtiTest/runner/ui/toolbox/entry',
                    'taoQtiTest/runner/ui/toolbox/menu',
                    'taoQtiTest/runner/ui/toolbox/text',
                    'taoQtiTest/runner/ui/toolbox/toolbox',
                )
            ),
            array(
                'name' => 'taoqtitest_plugins_bundle',
                'path' => ROOT_URL . 'taoQtiTest/views/dist/controllers.min',
                'modules' => array(
                    'taoQtiTest/runner/plugins/content/accessibility/keyNavigation',
                    'taoQtiTest/runner/plugins/content/dialog/dialog',
                    'taoQtiTest/runner/plugins/content/dialog/exitMessages',
                    'taoQtiTest/runner/plugins/content/dialog/itemAlertMessage',
                    'taoQtiTest/runner/plugins/content/dialog/itemInlineMessage',
                    'taoQtiTest/runner/plugins/content/feedback/feedback',
                    'taoQtiTest/runner/plugins/content/loading/loading',
                    'taoQtiTest/runner/plugins/content/modalFeedback/modalFeedback',
                    'taoQtiTest/runner/plugins/content/overlay/overlay',
                    'taoQtiTest/runner/plugins/content/responsiveness/collapser',
                    'taoQtiTest/runner/plugins/content/rubricBlock/rubricBlock',
                    'taoQtiTest/runner/plugins/controls/connectivity/connectivity',
                    'taoQtiTest/runner/plugins/controls/duration/duration',
                    'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
                    'taoQtiTest/runner/plugins/controls/testState/testState',
                    'taoQtiTest/runner/plugins/controls/timer/timer',
                    'taoQtiTest/runner/plugins/controls/timer/timerComponent',
                    'taoQtiTest/runner/plugins/controls/title/title',
                    'taoQtiTest/runner/plugins/controls/trace/itemTraceVariables',
                    'taoQtiTest/runner/plugins/navigation/allowSkipping',
                    'taoQtiTest/runner/plugins/navigation/next',
                    'taoQtiTest/runner/plugins/navigation/next/nextWarningHelper',
                    'taoQtiTest/runner/plugins/navigation/nextSection',
                    'taoQtiTest/runner/plugins/navigation/previous',
                    'taoQtiTest/runner/plugins/navigation/review/navigator',
                    'taoQtiTest/runner/plugins/navigation/review/review',
                    'taoQtiTest/runner/plugins/navigation/skip',
                    'taoQtiTest/runner/plugins/navigation/validateResponses',
                    'taoQtiTest/runner/plugins/navigation/warnBeforeLeaving',
                    'taoQtiTest/runner/plugins/security/disableRightClick',
                    'taoQtiTest/runner/plugins/tools/answerElimination/eliminator',
                    'taoQtiTest/runner/plugins/tools/answerMasking/answerMasking',
                    'taoQtiTest/runner/plugins/tools/answerMasking/plugin',
                    'taoQtiTest/runner/plugins/tools/areaMasking/areaMasking',
                    'taoQtiTest/runner/plugins/tools/areaMasking/mask',
                    'taoQtiTest/runner/plugins/tools/calculator',
                    'taoQtiTest/runner/plugins/tools/comment/comment',
                    'taoQtiTest/runner/plugins/tools/documentViewer/documentViewer',
                    'taoQtiTest/runner/plugins/tools/highlighter/highlighter',
                    'taoQtiTest/runner/plugins/tools/highlighter/plugin',
                    'taoQtiTest/runner/plugins/tools/itemThemeSwitcher/itemThemeSwitcher',
                    'taoQtiTest/runner/plugins/tools/lineReader/compoundMask',
                    'taoQtiTest/runner/plugins/tools/lineReader/plugin',
                    'taoQtiTest/runner/plugins/tools/magnifier/magnifier',
                    'taoQtiTest/runner/plugins/tools/magnifier/magnifierPanel',
                    'taoQtiTest/runner/plugins/tools/textToSpeech/plugin',
                    'taoQtiTest/runner/plugins/tools/textToSpeech/textToSpeech',
                    'taoQtiTest/runner/plugins/tools/zoom',
                )
            ),
        ));
    }
}
