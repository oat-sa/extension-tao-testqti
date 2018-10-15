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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\taoQtiTest\models\translation;

/**
 * Class ManualTranslations
 *
 * File to handle manually created translations
 *
 * @package oat\taoQtiTest\models\translation
 */
class ManualTranslations
{
    public function getManualTranslations()
    {
        return [
            __('Click to speak'),
            __('network'),
            __('Pause'),
            __('Play'),
            __('Settings'),
            __('Speech speed'),
            __('Stop'),
            __('technical'),
            __('Text to Speech'),
            __('The assessment has been created but is not already running.'),
            __('The assessment has been suspended by an authorized proctor. If you wish to resume your assessment, please relaunch it and contact your proctor if required.'),
            __('The assessment has been suspended. To resume your assessment, please relaunch it.'),
            __('The assessment has been terminated.'),
            __('The assessment has been terminated. You cannot interact with it anymore.'),
            __('The assessment is still running.'),
            __('The IMS QTI Item referenced as \"%s\" in the IMS Manifest file was already stored in the Item Bank.'),
            __('This test has been terminated'),
            __('Volume'),
            __('Time Remaining'),
            __('Tests'),
            __('Use Ctrl/Meta key or Lasso for multiple selection'),
            __('There is not outcomes!'),
            __('Manage tests'),
            __('Filter'),
            __('Export metadata'),
            __('Scratchpad'),
            __('Scratch pad'),
            __('Scratch Pad'),
            __('Black on white'),
            __('Black on white'),
            __('Black on cream'),
            __('Black on light blue'),
            __('Black on magenta'),
            __('White on black'),
            __('Light yellow on royal blue'),
            __('Gray on green (low contrast option)'),
            __('You answered all %s question(s) in this section'),
            __('You answered all %s question(s) in this test'),
            __('You answered only %s of the %s question(s) in this section'),
            __('and flagged %s of them'),
            __('Once you close this section, you cannot return to it or change your answers.'),
            __('Review my Answers'),
            __('Close this Section'),
            __('You have %s unanswered question(s)'),
            __('and you flagged %s item(s) that you can review now'),
            __('Connected to server'),
            __('Disconnected from server'),
            __('A response to every question in this item is required.'),
        ];
    }
}