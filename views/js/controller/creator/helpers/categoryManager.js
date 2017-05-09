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
define([
    'jquery',
    'lodash',
    'i18n',
    'core/eventifier',
    'taoQtiTest/controller/creator/templates/index'
], function($, _, __, eventifier, templates) {
    'use strict';

    var allPresets = [];

    function categoryManagerFactory($container, selectedCategories, partiallySelected) {
        var categoryManager,
            allCategories,

            $presetsContainer = $container.find('.category-presets'),
            $presetsCheckboxes,
            $customCategoriesSelect = $container.find('[name=itemref-category-custom]');

        partiallySelected = partiallySelected || [];

        function updateCategories() {
            var $selectedCheckboxes = $container.find('.category-preset input:checked'),
                presetCategories = [],
                customCategories = $customCategoriesSelect
                    .val()
                    .split(',')
                    .filter(function(val) {
                        return !!val;
                    });

            $selectedCheckboxes.each(function() {
                presetCategories.push($(this).val());
            });

            allCategories = presetCategories.concat(customCategories);

            /**
             * @event modelOverseer#category-change
             * @param {Array} categories
             */
            this.trigger('category-change', allCategories);
            console.table(allCategories);
        }

        categoryManager = {
            createForm: function createForm() {
                var self = this,
                    presetsTpl = templates.properties.categorypresets,

                    instancePresets = _.cloneDeep(allPresets); //todo: gnnn


                // categories presets
                instancePresets.forEach(function (preset) {
                    //todo: refactor this to allow indeterminate
                    preset.checked = (selectedCategories.indexOf(preset.qtiCategory) !== -1);
                });

                $presetsContainer.append(
                    presetsTpl(instancePresets)
                );

                $presetsContainer.on('click', function() {
                    _.defer(function() {
                        updateCategories.call(self);
                    });
                });

                // init custom categories field
                $customCategoriesSelect.select2({
                    width: '100%',
                    tags : [],
                    multiple : true,
                    tokenSeparators: [",", " ", ";"],
                    formatNoMatches : function(){
                        return __('Enter a custom category');
                    },
                    maximumInputLength : 32
                }).on('change', function(){
                    updateCategories.call(self);
                });
            },

            initForm: function initForm() {
                var presetListId = _.pluck(allPresets, 'qtiCategory'),
                    customCategories = _.difference(selectedCategories, presetListId);

                $presetsCheckboxes = $container.find('.category-preset input:checked');

                $presetsCheckboxes.each(function() {
                    var $checkbox = $(this),
                        category = $checkbox.val();

                    if (selectedCategories.indexOf(category) !== -1) {
                        $checkbox.prop('checked', true);

                    } else if (partiallySelected.indexOf(category) !== -1) {
                        $checkbox.prop('indeterminate', true);
                    }
                });

                $customCategoriesSelect.select2('val', customCategories);
            }
        };

        eventifier(categoryManager);

        return categoryManager;
    }

    categoryManagerFactory.setPresets = function setPresets(presets) {
        if (_.isArray(presets)) {
            allPresets = presets;
        }
    };

    return categoryManagerFactory;
});