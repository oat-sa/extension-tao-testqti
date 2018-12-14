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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
namespace oat\taoQtiTest\models;


class QtiCategoryPresetProvider implements TestCategoryPresetProviderInterface
{
    /**
     * @param TestCategoryPresetProvider $presetService
     * @throws \common_exception_InconsistentData
     */
    public function registerPresets(TestCategoryPresetProvider $presetService)
    {
        $presetService->register(
            TestCategoryPresetProvider::GROUP_NAVIGATION,
            [
                TestCategoryPreset::fromArray([
                    'id'            => 'reviewScreen',
                    'label'         => __('Enable Review Screen'),
                    'qtiCategory'   => 'x-tao-option-reviewScreen',
                    'description'   => __('Enable the item review screen / navigator.'),
                    'order'         => 100,
                    'pluginId'      => 'review'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'markReview',
                    'label'         => __('Enable Mark for Review'),
                    'qtiCategory'   => 'x-tao-option-markReview',
                    'description'   => __('Enable mark for review of items. Requires the Review Screen option.'),
                    'order'         => 200,
                    'pluginId'      => 'review'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'informational',
                    'label'         => __('Informational Item Usage'),
                    'qtiCategory'   => 'x-tao-itemusage-informational',
                    'description'   => __('Force the item to be considered as informational and not taken into account in (un)answered / flagged counters.'),
                    'order'         => 300,
                    'pluginId'      => 'review'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'nextSection',
                    'label'         => __('Allow Section Skipping'),
                    'qtiCategory'   => 'x-tao-option-nextSection',
                    'description'   => __('Allow skipping of the current section.'),
                    'order'         => 400,
                    'pluginId'      => 'nextSection',
                    'featureFlag'   => 'next-section'
                ])
            ]
        );

        $presetService->register(
            TestCategoryPresetProvider::GROUP_WARNING,
            [
                TestCategoryPreset::fromArray([
                    'id'            => 'endTestWarning',
                    'label'         => __('Display End Test Warning'),
                    'qtiCategory'   => 'x-tao-option-endTestWarning',
                    'description'   => __('Display a warning before the test-taker ends the test.'),
                    'order'         => 100,
                    'pluginId'      => 'next'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'nextPartWarning',
                    'label'         => __('Display Next Part Warning'),
                    'qtiCategory'   => 'x-tao-option-nextPartWarning',
                    'description'   => __('Display a warning before the test-taker ends the test part.'),
                    'order'         => 200,
                    'pluginId'      => 'next'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'nextSectionWarning',
                    'label'         => __('Display Next Section Warning'),
                    'qtiCategory'   => 'x-tao-option-nextSectionWarning',
                    'description'   => __('Display a warning before the test-taker skips the section. Requires the Section Skipping option.'),
                    'order'         => 300,
                    'pluginId'      => 'nextSection'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'noExitTimedSectionWarning',
                    'label'         => __('Hide Timed Section Warning'),
                    'qtiCategory'   => 'x-tao-option-noExitTimedSectionWarning',
                    'description'   => __('Hide the warning automatically displayed when a test-taker exit a timed section.'),
                    'order'         => 400,
                    'pluginId'      => 'next'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'unansweredWarning',
                    'label'         => __('Display Unanswered Warning'),
                    'qtiCategory'   => 'x-tao-option-unansweredWarning',
                    'description'   => __('Display a warning before the test-taker ends a test part and there are still items left unanswered or marked for review.'),
                    'order'         => 500,
                    'pluginId'      => 'next'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'noAlertTimeout',
                    'label'         => __('Do not show alert on timeout'),
                    'qtiCategory'   => 'x-tao-option-noAlertTimeout',
                    'description'   => __('Moving to the next item without time limit reached message.'),
                    'order'         => 600,
                    'pluginId'      => 'next'
                ]),
            ]
        );

        $presetService->register(
            TestCategoryPresetProvider::GROUP_TOOLS,
            [
                TestCategoryPreset::fromArray([
                    'id'            => 'eliminator',
                    'label'         => __('Answer Eliminator'),
                    'qtiCategory'   => 'x-tao-option-eliminator',
                    'description'   => __('Allow the test-taker to eliminate / strikethrough answers in choice interactions.'),
                    'order'         => 100,
                    'pluginId'      => 'eliminator'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'answerMasking',
                    'label'         => __('Answer Masking'),
                    'qtiCategory'   => 'x-tao-option-answerMasking',
                    'description'   => __('Allow the test-taker to mask and unmask answers in choice interactions.'),
                    'order'         => 200,
                    'pluginId'      => 'answerMasking'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'areaMasking',
                    'label'         => __('Area Masking'),
                    'qtiCategory'   => 'x-tao-option-areaMasking',
                    'description'   => __('Allow the test-taker to mask parts of the item with a movable mask.'),
                    'order'         => 300,
                    'pluginId'      => 'area-masking'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'calculator',
                    'label'         => __('Calculator'),
                    'qtiCategory'   => 'x-tao-option-calculator',
                    'description'   => __('Allow the test-taker to use a basic calculator.'),
                    'order'         => 400,
                    'pluginId'      => 'calculator'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'calculatorBodmas',
                    'label'         => __('Calculator BODMAS'),
                    'qtiCategory'   => 'x-tao-option-calculatorBodmas',
                    'description'   => __('Allow the test-taker to use a calculator respecting the order of operations (BODMAS).'),
                    'order'         => 400,
                    'pluginId'      => 'calculator'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'calculatorScientific',
                    'label'         => __('Scientific Calculator'),
                    'qtiCategory'   => 'x-tao-option-calculator-scientific',
                    'description'   => __('Allow the test-taker to use a scientific calculator.'),
                    'order'         => 400,
                    'pluginId'      => 'calculator'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'highlighter',
                    'label'         => __('Highlighter'),
                    'qtiCategory'   => 'x-tao-option-highlighter',
                    'description'   => __('Allow the test-taker to highlight parts of the item text.'),
                    'order'         => 500,
                    'pluginId'      => 'highlighter'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'lineReader',
                    'label'         => __('Line Reader'),
                    'qtiCategory'   => 'x-tao-option-lineReader',
                    'description'   => __('Allow the test-taker to visually isolate a line of text.'),
                    'order'         => 600,
                    'pluginId'      => 'lineReader'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'magnifier',
                    'label'         => __('Magnifier'),
                    'qtiCategory'   => 'x-tao-option-magnifier',
                    'description'   => __('Allow the test-taker to use a movable magnifier tool.'),
                    'order'         => 700,
                    'pluginId'      => 'magnifier'
                ]),
                TestCategoryPreset::fromArray([
                    'id'            => 'zoom',
                    'label'         => __('Zoom'),
                    'qtiCategory'   => 'x-tao-option-zoom',
                    'description'   => __('Allows Test-taker to zoom in and out the item content.'),
                    'order'         => 700,
                    'pluginId'      => 'zoom'
                ])
            ]
        );

        //TAO-7239, register new feature category only if it is enabled in config
        /** @var \common_ext_ExtensionsManager $tt */
        $extManager = $presetService->getServiceLocator()->get(\common_ext_ExtensionsManager::SERVICE_ID);
        $testRunnerConfig = $extManager->getExtensionById('taoQtiTest')->getConfig('testRunner');

        $isSkipaheadEnabled = isset($testRunnerConfig['test-taker-review-skipahead']) && $testRunnerConfig['test-taker-review-skipahead'];
        if ($isSkipaheadEnabled) {
            $presetService->register(
                TestCategoryPresetProvider::GROUP_NAVIGATION,
                [
                    TestCategoryPreset::fromArray([
                        'id'            => 'skipAhead',
                        'label'         => __('Enable Skipping Ahead'),
                        'qtiCategory'   => 'x-tao-option-review-skipahead',
                        'description'   => __('Enables skipping to items within this section. Requires the review screen option.'),
                        'order'         => 250,
                        'pluginId'      => 'review',
                        'featureFlag'   => 'skip-ahead'
                    ]),
                ]
            );
        }
    }

}
