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
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */

namespace oat\taoQtiTest\models;


use oat\oatbox\service\ConfigurableService;

class TestCategoryPresetProvider extends ConfigurableService
{
    const SERVICE_ID = 'taoQtiTest/CategoryPresetProvider';

    private $allPresets;

    public function __construct(array $options = [], $allPresets = []) {
        $this->allPresets = $allPresets;

        parent::__construct($options);
    }

    protected function getDefaultPresets() {
        return [
            'navigation' => [
                'groupId'    => 'navigation',
                'groupLabel' => __('Test Navigation'),
                'groupOrder' => 100,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'reviewScreen',
                        'label'         => __('Enable Review Screen'),
                        'qtiCategory'   => 'x-tao-option-reviewScreen',
                        'description'   => __('Enable the item review screen / navigator.'),
                        'order'         => 100
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'markReview',
                        'label'         => __('Enable Mark for Review'),
                        'qtiCategory'   => 'x-tao-option-markReview',
                        'description'   => __('Enable mark for review of items. Requires the Review Screen option.'),
                        'order'         => 200
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'informational',
                        'label'         => __('Informational Item Usage'),
                        'qtiCategory'   => 'x-tao-itemusage-informational',
                        'description'   => __('Force the item to be considered as informational and not taken into account in (un)answered / flagged counters.'),
                        'order'         => 300
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'nextSection',
                        'label'         => __('Allow Section Skipping'),
                        'qtiCategory'   => 'x-tao-option-nextSection',
                        'description'   => __('Allow skipping of the current section.'),
                        'order'         => 400
                    ])
                ]
            ],

            'warnings' => [
                'groupId'    => 'warnings',
                'groupLabel' => __('Navigation Warnings'),
                'groupOrder' => 200,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'endTestWarning',
                        'label'         => __('Display End Test Warning'),
                        'qtiCategory'   => 'x-tao-option-endTestWarning',
                        'description'   => __('Display a warning before the test-taker ends the test.'),
                        'order'         => 100
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'nextPartWarning',
                        'label'         => __('Display Next Part Warning'),
                        'qtiCategory'   => 'x-tao-option-nextPartWarning',
                        'description'   => __('Display a warning before the test-taker ends the test part.'),
                        'order'         => 200
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'nextSectionWarning',
                        'label'         => __('Display Next Section Warning'),
                        'qtiCategory'   => 'x-tao-option-nextSectionWarning',
                        'description'   => __('Display a warning before the test-taker skips the section. Requires the Section Skipping option.'),
                        'order'         => 300
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'noExitTimedSectionWarning',
                        'label'         => __('Hide Timed Section Warning'),
                        'qtiCategory'   => 'x-tao-option-noExitTimedSectionWarning',
                        'description'   => __('Hide the warning automatically displayed when a test-taker exit a timed section.'),
                        'order'         => 400
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'unansweredWarning',
                        'label'         => __('Display Unanswered Warning'),
                        'qtiCategory'   => 'x-tao-option-unansweredWarning',
                        'description'   => __('Display a warning before the test-taker ends a test part and there are still items left unanswered or marked for review.'),
                        'order'         => 500
                    ]),
                ]
            ],

            'tools' => [
                'groupId'    => 'tools',
                'groupLabel' => __('Test Taker Tools'),
                'groupOrder' => 300,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'eliminator',
                        'label'         => __('Answer Eliminator'),
                        'qtiCategory'   => 'x-tao-option-eliminator',
                        'description'   => __('Allow the test-taker to eliminate / strikethrough answers in choice interactions.'),
                        'order'         => 100
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'answerMasking',
                        'label'         => __('Answer Masking'),
                        'qtiCategory'   => 'x-tao-option-answerMasking',
                        'description'   => __('Allow the test-taker to mask and unmask answers in choice interactions.'),
                        'order'         => 200
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'areaMasking',
                        'label'         => __('Area Masking'),
                        'qtiCategory'   => 'x-tao-option-areaMasking',
                        'description'   => __('Allow the test-taker to mask parts of the item with a movable mask.'),
                        'order'         => 300
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'calculator',
                        'label'         => __('Calculator'),
                        'qtiCategory'   => 'x-tao-option-calculator',
                        'description'   => __('Allow the test-taker to use a basic calculator.'),
                        'order'         => 400
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'highlighter',
                        'label'         => __('Highlighter'),
                        'qtiCategory'   => 'x-tao-option-highlighter',
                        'description'   => __('Allow the test-taker to highlight parts of the item text.'),
                        'order'         => 500
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'lineReader',
                        'label'         => __('Line Reader'),
                        'qtiCategory'   => 'x-tao-option-lineReader',
                        'description'   => __('Allow the test-taker to visually isolate a line of text.'),
                        'order'         => 600
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'magnifier',
                        'label'         => __('Magnifier'),
                        'qtiCategory'   => 'x-tao-option-magnifier',
                        'description'   => __('Allow the test-taker to use a movable magnifier tool.'),
                        'order'         => 700
                    ]),
                ]
            ],

        ];
    }

    private function compareNum($a, $b) {
        if ($a == $b) {
            return 0;
        }
        return ($a < $b) ? -1 : 1;
    }

    /**
     * @return array - the sorted preset list
     */
    public function getPresets() {
        if (empty($this->allPresets)) {
            $this->allPresets = $this->getDefaultPresets();
        }
        // sort groups
        usort($this->allPresets, function($a, $b) {
            return $this->compareNum($a['groupOrder'], $b['groupOrder']);
        });

        // sort categories
        foreach($this->allPresets as &$presetGroup) {
            if (!empty($presetGroup)) {
                usort($presetGroup['presets'], function($a, $b) {
                    return $this->compareNum($a->getOrder(), $b->getOrder());
                });
            }
        }

        return $this->allPresets;
    }

}
