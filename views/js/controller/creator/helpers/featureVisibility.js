/*
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
 * Copyright (c) 2022 (original work) Open Assessment Technologies SA
 *
 */

define(['services/features'], function (features) {
    'use strict';

    /**
     * Adds visibility properties for test model which allow to toggle test properties presence in interface
     * @param {Object} model
     */
    function addTestVisibilityProps(model) {
        if (features.isVisible('taoQtiTest/creator/test/property/timeLimits')) {
            model.showTimeLimits = true;
        }
        if (features.isVisible('taoQtiTest/creator/test/property/identifier')) {
            model.showIdentifier = true;
        }
        if (features.isVisible('taoQtiTest/creator/test/property/lateSubmission')) {
            model.showIdentifier = true;
        }
    }

    /**
     * Adds visibility properties for testPart model which allow to toggle testPart properties presence in interface
     * @param {Object} model
     */
    function addTestPartVisibilityProps(model) {
        const propertyNamespace = 'taoQtiTest/creator/testPart/property/';
        if (features.isVisible(`${propertyNamespace}timeLimits`)) {
            model.showTimeLimits = true;
        }
        if (features.isVisible('taoQtiTest/creator/testPart/property/identifier')) {
            model.showIdentifier = true;
        }
        if (features.isVisible('taoQtiTest/creator/testPart/property/lateSubmission')) {
            model.showIdentifier = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/showFeedback`)) {
            model.itemSessionShowFeedback = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/allowComment`)) {
            model.itemSessionAllowComment = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/allowSkipping`)) {
            model.itemSessionAllowSkipping = true;
        }
    }

    /**
     * Adds visibility properties for section model which allow to toggle section properties presence in interface
     * @param {Object} model
     */
    function addSectionVisibilityProps(model) {
        const propertyNamespace = 'taoQtiTest/creator/section/property/';
        if (features.isVisible(`${propertyNamespace}timeLimits`)) {
            model.showTimeLimits = true;
        }
        if (features.isVisible('taoQtiTest/creator/section/property/identifier')) {
            model.showIdentifier = true;
        }
        if (features.isVisible('taoQtiTest/creator/section/property/lateSubmission')) {
            model.showIdentifier = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/showFeedback`)) {
            model.itemSessionShowFeedback = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/allowComment`)) {
            model.itemSessionAllowComment = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/allowSkipping`)) {
            model.itemSessionAllowSkipping = true;
        }
    }

    /**
     * Adds visibility properties for item model which allow to toggle item properties presence in interface
     * @param {Object} model
     */
    function addItemRefVisibilityProps(model) {
        const propertyNamespace = 'taoQtiTest/creator/itemRef/property/';
        if (features.isVisible(`${propertyNamespace}timeLimits`)) {
            model.showTimeLimits = true;
        }
        if (features.isVisible('taoQtiTest/creator/itemRef/property/identifier')) {
            model.showIdentifier = true;
        }
        if (features.isVisible('taoQtiTest/creator/itemRef/property/lateSubmission')) {
            model.showIdentifier = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/showFeedback`)) {
            model.itemSessionShowFeedback = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/allowComment`)) {
            model.itemSessionAllowComment = true;
        }
        if (features.isVisible(`${propertyNamespace}itemSessionControl/allowSkipping`)) {
            model.itemSessionAllowSkipping = true;
        }
    }

    /**
     * Filters the presets and preset groups based on visibility config
     * @param {Array} presetGroups array of presetGroups
     * @param {string} [level='all'] testPart, section of itemRef
     * @returns {Array} filtered presetGroups array
     */
    function filterVisiblePresets(presetGroups, level = 'all') {
        const categoryGroupNamespace = `taoQtiTest/creator/${level}/category/presetGroup/`;
        const categoryPresetNamespace = `taoQtiTest/creator/${level}/category/preset/`;
        let filteredGroups;
        if (presetGroups && presetGroups.length) {
            filteredGroups = presetGroups.filter(presetGroup => {
                return features.isVisible(`${categoryGroupNamespace}${presetGroup.groupId}`);
            });
            if (filteredGroups.length) {
                filteredGroups.forEach(filteredGroup => {
                    if (filteredGroup.presets && filteredGroup.presets.length) {
                        const filteredPresets = filteredGroup.presets.filter(preset => {
                            return features.isVisible(`${categoryPresetNamespace}${preset.id}`);
                        });
                        filteredGroup.presets = filteredPresets;
                    }
                });
            }
        }
        return filteredGroups;
    }

    return {
        addTestVisibilityProps,
        addTestPartVisibilityProps,
        addSectionVisibilityProps,
        addItemRefVisibilityProps,
        filterVisiblePresets
    };
});
