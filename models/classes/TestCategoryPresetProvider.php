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

    public function getCategories() {
        return [
            TestCategoryPreset::fromArray([
                'id'            => 'endTestWarning',
                'label'         => __('End Test Warning'),
                'qtiCategory'   => 'x-tao-option-endTestWarning',
                'description'   => __('displays a warning before the user finishes the test'),
                'order'         => 100
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'nextPartWarning',
                'label'         => __('Next Part Warning'),
                'qtiCategory'   => 'x-tao-option-nextPartWarning',
                'description'   => __('displays a warning before the user finishes the part'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'nextSectionWarning',
                'label'         => __('Next Section Warning'),
                'qtiCategory'   => 'x-tao-option-nextSectionWarning',
                'description'   => __('displays a next section button that warns the user that they will not be able to return to the section'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'nextSection',
                'label'         => __('Next Section Button'),
                'qtiCategory'   => 'x-tao-option-nextSection',
                'description'   => __('displays a next section button'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'unansweredWarning',
                'label'         => __('Unanswered Warning'),
                'qtiCategory'   => 'x-tao-option-unansweredWarning',
                'description'   => __('displays a warning before the user finishes the part, only if there are unanswered/marked for review items'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'noExitTimedSectionWarning',
                'label'         => __('noExitTimedSectionWarning'),
                'qtiCategory'   => 'x-tao-option-noExitTimedSectionWarning',
                'description'   => __('disable the warning automatically displayed upon exiting a timed section'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'exit',
                'label'         => __('Exit Button'),
                'qtiCategory'   => 'x-tao-option-exit',
                'description'   => __('displays an exit button'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'markReview',
                'label'         => __('Mark For Review'),
                'qtiCategory'   => 'x-tao-option-markReview',
                'description'   => __('displays a mark for review button. This option requires requires the x-tao-option-reviewScreen option'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'reviewScreen',
                'label'         => __('Review Screen'),
                'qtiCategory'   => 'x-tao-option-reviewScreen',
                'description'   => __('displays the review screen / navigator'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'calculator',
                'label'         => __('Calculator'),
                'qtiCategory'   => 'x-tao-option-calculator',
                'description'   => __('Enable calculator'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'answerMasking',
                'label'         => __('Answer Masking'),
                'qtiCategory'   => 'x-tao-option-answerMasking',
                'description'   => __('enable answer masking tool'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'areaMasking',
                'label'         => __('Area Masking'),
                'qtiCategory'   => 'x-tao-option-areaMasking',
                'description'   => __('enable area masking tool'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'highlighter',
                'label'         => __('Highlighter'),
                'qtiCategory'   => 'x-tao-option-highlighter',
                'description'   => __('enable highlighter tool'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'lineReader',
                'label'         => __('Line Reader'),
                'qtiCategory'   => 'x-tao-option-lineReader',
                'description'   => __('enable line reader tool'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'magnifier',
                'label'         => __('Magnifier'),
                'qtiCategory'   => 'x-tao-option-magnifier',
                'description'   => __('enable magnifier tool'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'eliminator',
                'label'         => __('Answer Eliminator'),
                'qtiCategory'   => 'x-tao-option-eliminator',
                'description'   => __('enable eliminator tool'),
                'order'         => 50
            ]),
            TestCategoryPreset::fromArray([
                'id'            => 'informational',
                'label'         => __('Informational item'),
                'qtiCategory'   => 'x-tao-itemusage-informational',
                'description'   => __('describe the item as informational'),
                'order'         => 50
            ])
        ];
    }
}