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
                        'label'         => __('Review Screen'),
                        'qtiCategory'   => 'x-tao-option-reviewScreen',
                        'description'   => __('Displays the review screen / navigator'),
                        'order'         => 100
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'markReview',
                        'label'         => __('Mark For Review Button'),
                        'qtiCategory'   => 'x-tao-option-markReview',
                        'description'   => __('Displays a mark for review button. Requires the Review Screen option'),
                        'order'         => 200
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'informational',
                        'label'         => __('Informational item'),
                        'qtiCategory'   => 'x-tao-itemusage-informational',
                        'description'   => __('Force the item to be considered as informational, so it does not increase the unanswered items counter'),
                        'order'         => 300
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'exit',
                        'label'         => __('Exit Button'),
                        'qtiCategory'   => 'x-tao-option-exit',
                        'description'   => __('Displays a button to exit the test'),
                        'order'         => 400
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'nextSection',
                        'label'         => __('Next Section Button'),
                        'qtiCategory'   => 'x-tao-option-nextSection',
                        'description'   => __('Displays a next section button'),
                        'order'         => 500
                    ])
                ]
            ],

            'warnings' => [
                'groupId'    => 'warnings',
                'groupLabel' => __('Navigation warnings'),
                'groupOrder' => 200,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'endTestWarning',
                        'label'         => __('End Test Warning'),
                        'qtiCategory'   => 'x-tao-option-endTestWarning',
                        'description'   => __('Displays a warning before the user finishes the test'),
                        'order'         => 100
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'nextPartWarning',
                        'label'         => __('Next Part Warning'),
                        'qtiCategory'   => 'x-tao-option-nextPartWarning',
                        'description'   => __('Displays a warning before the user finishes a part'),
                        'order'         => 200
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'nextSectionWarning',
                        'label'         => __('Next Section Warning'),
                        'qtiCategory'   => 'x-tao-option-nextSectionWarning',
                        'description'   => __('Displays a warning before changing section. Works only with the next section button.'),
                        'order'         => 300
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'noExitTimedSectionWarning',
                        'label'         => __('noExitTimedSectionWarning'),
                        'qtiCategory'   => 'x-tao-option-noExitTimedSectionWarning',
                        'description'   => __('Disable the warning automatically displayed upon exiting a timed section'),
                        'order'         => 400
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'unansweredWarning',
                        'label'         => __('Unanswered Warning'),
                        'qtiCategory'   => 'x-tao-option-unansweredWarning',
                        'description'   => __('Displays a warning before the user leaves the part, but only if there are unanswered/marked for review items. To display the warning in any case, use the Next Part Warning option'),
                        'order'         => 500
                    ]),
                ]
            ],

            'tools' => [
                'groupId'    => 'tools',
                'groupLabel' => __('Test Taker Tools '),
                'groupOrder' => 300,
                'presets'    => [
                    TestCategoryPreset::fromArray([
                        'id'            => 'eliminator',
                        'label'         => __('Answer Eliminator'),
                        'qtiCategory'   => 'x-tao-option-eliminator',
                        'description'   => __('Allow the test taker to eliminate answers in choices interactions'),
                        'order'         => 100
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'answerMasking',
                        'label'         => __('Answer Masking'),
                        'qtiCategory'   => 'x-tao-option-answerMasking',
                        'description'   => __('Allow the test taker to masks and reveal answers in choices interactions'),
                        'order'         => 200
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'areaMasking',
                        'label'         => __('Area Masking'),
                        'qtiCategory'   => 'x-tao-option-areaMasking',
                        'description'   => __('Allow the test taker to hide part of the items with a movable mask'),
                        'order'         => 300
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'calculator',
                        'label'         => __('Calculator'),
                        'qtiCategory'   => 'x-tao-option-calculator',
                        'description'   => __('Display a calculator'),
                        'order'         => 400
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'highlighter',
                        'label'         => __('Highlighter'),
                        'qtiCategory'   => 'x-tao-option-highlighter',
                        'description'   => __('Allow the test taker to highlight parts of the text'),
                        'order'         => 500
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'lineReader',
                        'label'         => __('Line Reader'),
                        'qtiCategory'   => 'x-tao-option-lineReader',
                        'description'   => __('Display a mask with a hole that allow the test taker to visually isolate a text line'),
                        'order'         => 600
                    ]),
                    TestCategoryPreset::fromArray([
                        'id'            => 'magnifier',
                        'label'         => __('Magnifier'),
                        'qtiCategory'   => 'x-tao-option-magnifier',
                        'description'   => __('Display a movable magnifier tool'),
                        'order'         => 700
                    ]),
                ]
            ],

        ];
    }

    public function getPresets() {
        if (empty($this->allPresets)) {
            $this->allPresets = $this->getDefaultPresets();
        }
        usort($this->allPresets, function($a, $b) {
            $aOrder = $a['groupOrder'];
            $bOrder = $b['groupOrder'];
            if ($aOrder == $bOrder) {
                return 0;
            }
            return ($aOrder < $bOrder) ? -1 : 1;
        });

        foreach($this->allPresets as &$presetGroup) {
            if (!empty($presetGroup)) {
                usort($presetGroup['presets'], function($a, $b) {
                    $aOrder = $a->getOrder();
                    $bOrder = $b->getOrder();
                    if ($aOrder == $bOrder) {
                        return 0;
                    }
                    return ($aOrder < $bOrder) ? -1 : 1;
                });
            }
        }

        return $this->allPresets;
    }

}