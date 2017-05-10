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

    function categoryManagerFactory($container) {
        var categoryManager,
            allCategories,

            $presetsContainer = $container.find('.category-presets'),
            $presetsCheckboxes,
            $customCategoriesSelect = $container.find('[name=category-custom]');

        function updateCategories() {
            var presetSelected = $container
                    .find('.category-preset input:checked')
                    .toArray()
                    .map(function(categoryEl) {
                        return categoryEl.value;
                    }),
                presetIndeterminate = $container
                    .find('.category-preset input:indeterminate')
                    .toArray()
                    .map(function(categoryEl) {
                        return categoryEl.value;
                    }),
                customSelected = $customCategoriesSelect
                    .val()
                    .split(',')
                    .filter(function(val) {
                        return !!val;
                    });

            allCategories = presetSelected
                .concat(presetIndeterminate)
                .concat(customSelected);

            /**
             * @event modelOverseer#category-change
             * @param {Array} categories
             */
            this.trigger('category-change', allCategories, presetIndeterminate);
        }

        categoryManager = {
            createForm: function createForm() {
                var self = this,
                    presetsTpl = templates.properties.categorypresets;

                // add preset checkboxes
                $presetsContainer.append(
                    presetsTpl(allPresets)
                );

                $presetsContainer.on('click', function(e) {
                    var $preset = $(e.target).closest('.category-preset'),
                        $checkbox;

                    if ($preset.length) {
                        $checkbox = $preset.find('input');
                        $checkbox.prop('indeterminate', false);

                        _.defer(function() {
                            updateCategories.call(self);
                        });
                    }
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

            updateFormState: function updateFormState(selectedCategories, partiallySelected) {
                var presetListId = _.pluck(allPresets, 'qtiCategory'),
                    customCategories = _.difference(selectedCategories, presetListId);

                partiallySelected = partiallySelected || [];

                $presetsCheckboxes = $container.find('.category-preset input');
                $presetsCheckboxes.each(function() {
                    var category = this.value;

                    if (partiallySelected.indexOf(category) !== -1) {
                        this.indeterminate = true;
                        this.checked = false;
                    } else if (selectedCategories.indexOf(category) !== -1) {
                        this.indeterminate = false;
                        this.checked = true;
                    } else {
                        this.indeterminate = false;
                        this.checked = false;
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