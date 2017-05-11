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

    var allQtiCategoriesPresets = [];

    function categorySelectorFactory($container) {
        var categorySelector,
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
                customSelected = $customCategoriesSelect.siblings('.select2-container').find('.select2-search-choice').not('.partial')
                    .toArray()
                    .map(function(categoryEl) {
                        return categoryEl.textContent && categoryEl.textContent.trim();
                    }),
                customIndeterminate = $customCategoriesSelect.siblings('.select2-container').find('.select2-search-choice.partial')
                    .toArray()
                    .map(function(categoryEl) {
                        return categoryEl.textContent && categoryEl.textContent.trim();
                    });

            allCategories = presetSelected
                .concat(presetIndeterminate)
                .concat(customSelected)
                .concat(customIndeterminate);

            /**
             * @event modelOverseer#category-change
             * @param {Array} categories
             */
            // todo: refactor to only trigger selected categories and reverse the sectionCategory helper process
            this.trigger('category-change', allCategories, presetIndeterminate.concat(customIndeterminate));
        }

        categorySelector = {
            createForm: function createForm(currentCategories) {
                var self = this,
                    presetsTpl = templates.properties.categorypresets,
                    customCategories = _.difference(currentCategories, allQtiCategoriesPresets);

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
                    tags : customCategories,
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

            updateFormState: function updateFormState(selectedCategories, indeterminateCategories) {
                var customCategories = _.difference(selectedCategories, allQtiCategoriesPresets);

                indeterminateCategories = indeterminateCategories || [];

                // Preset categories

                $presetsCheckboxes = $container.find('.category-preset input');
                $presetsCheckboxes.each(function() {
                    var category = this.value;

                    if (indeterminateCategories.indexOf(category) !== -1) {
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

                // Custom categories

                $customCategoriesSelect.select2('val', customCategories);

                $customCategoriesSelect.siblings('.select2-container').find('.select2-search-choice').each(function(){
                    var $li = $(this);
                    var content = $li.find('div').text();
                    if(indeterminateCategories.indexOf(content) !== -1){
                        $li.addClass('partial');
                    }
                });
            }
        };

        eventifier(categorySelector);

        return categorySelector;
    }

    categorySelectorFactory.setPresets = function setPresets(presets) {
        if (_.isArray(presets)) {
            allPresets = presets;
            allQtiCategoriesPresets = extractCategoriesFromPresets();
        }
    };

    function extractCategoriesFromPresets() {
        return allPresets.reduce(function (prev, current) {
            var groupIds = _.pluck(current.presets, 'qtiCategory');
            return prev.concat(groupIds);
        }, []);
    }

    return categorySelectorFactory;
});