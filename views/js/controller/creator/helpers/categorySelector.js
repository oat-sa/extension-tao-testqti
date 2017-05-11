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
    'ui/tooltip',
    'taoQtiTest/controller/creator/templates/index'
], function($, _, __, eventifier, tooltip, templates) {
    'use strict';

    var allPresets = [],
        allQtiCategoriesPresets = [];


    function categorySelectorFactory($container) {
        var categorySelector,
            allCategories,

            $presetsContainer = $container.find('.category-presets'),
            $presetsCheckboxes,
            $customCategoriesSelect = $container.find('[name=category-custom]');

        /**
         * Read the form state from the DOM and trigger an event with the result so the listener can update the item/section model
         */
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
             * @event categorySelector#category-change
             * @param {String[]} allCategories
             * @param {String[]} indeterminate
             */
            // todo: refactor to only trigger selected categories and reverse the sectionCategory helper process
            this.trigger('category-change', allCategories, presetIndeterminate.concat(customIndeterminate));
        }

        categorySelector = {
            /**
             * Create the category selection form
             *
             * @param {Array} currentCategories - all categories currently associated to the item. If applied to a section,
             * contains all the categories applied to at least one item of the section.
             */
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

                // enable help tooltips
                tooltip($container);
            },

            /**
             * Check/Uncheck boxes and fill the custom category field to match the new model
             * @param {String[]} selected - all categories associated with the items or the section items, even if they are indeterminate at the section level
             * @param {String[]} indeterminate - only categories in an indeterminate state at a section level
             */
            updateFormState: function updateFormState(selected, indeterminate) {
                var customCategories = _.difference(selected, allQtiCategoriesPresets);

                indeterminate = indeterminate || [];

                // Preset categories

                $presetsCheckboxes = $container.find('.category-preset input');
                $presetsCheckboxes.each(function() {
                    var category = this.value;

                    this.indeterminate = false;
                    this.checked = false;

                    if (indeterminate.indexOf(category) !== -1) {
                        this.indeterminate = true;
                    } else if (selected.indexOf(category) !== -1) {
                        this.checked = true;
                    }
                });

                // Custom categories

                $customCategoriesSelect.select2('val', customCategories);

                $customCategoriesSelect.siblings('.select2-container').find('.select2-search-choice').each(function(){
                    var $li = $(this);
                    var content = $li.find('div').text();
                    if(indeterminate.indexOf(content) !== -1){
                        $li.addClass('partial');
                    }
                });
            }
        };

        eventifier(categorySelector);

        return categorySelector;
    }

    /**
     * @param {Object[]} presets - expected format:
     * [
     *  {
     *      groupId: 'navigation',
     *      groupLabel: 'Test Navigation',
     *      presets: [
     *          {
     *              id: 'nextPartWarning',
     *              label: 'Next Part Warning',
     *              qtiCategory : 'x-tao-option-nextPartWarning',
     *              description : 'Displays a warning before the user finishes a part'
 *              },
     *          ...
     *      ]
     *  },
     *  ...
     * ]
     */
    categorySelectorFactory.setPresets = function setPresets(presets) {
        if (_.isArray(presets)) {
            allPresets = presets;
            allQtiCategoriesPresets = extractCategoriesFromPresets();
        }
    };

    /**
     * Extract the qtiCategory property of all presets of all groups
     * @returns {String[]}
     */
    function extractCategoriesFromPresets() {
        return allPresets.reduce(function (prev, current) {
            var groupIds = _.pluck(current.presets, 'qtiCategory');
            return prev.concat(groupIds);
        }, []);
    }

    return categorySelectorFactory;
});