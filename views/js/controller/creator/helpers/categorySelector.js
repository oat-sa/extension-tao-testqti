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
 * Copyright (c) 2017-2024 (original work) Open Assessment Technologies SA;
 */
/**
 * This helper manages the category selection UI:
 * - either via a text entry field that allow to enter any custom categories
 * - either via displaying grouped checkboxes that allow to select any categories presets
 * All categories are then grouped and given to this object's listeners, as they will later end up in the same model field.
 *
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/eventifier',
    'ui/dialog/confirm',
    'ui/tooltip',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/featureVisibility',
    'select2'
], function ($, _, __, eventifier, confirmDialog, tooltip, templates, featureVisibility) {
    'use strict';

    let allPresets = [];
    let allQtiCategoriesPresets = [];
    let categoryToPreset = new Map();

    function categorySelectorFactory($container) {
        const $presetsContainer = $container.find('.category-presets');
        const $customCategoriesSelect = $container.find('[name=category-custom]');

        const categorySelector = {
            /**
             * Read the form state from the DOM and trigger an event with the result, so the listeners can update the item/section model
             * @fires categorySelector#category-change
             */
            updateCategories() {
                const presetSelected = $container
                        .find('.category-preset input:checked')
                        .toArray()
                        .map(categoryEl => categoryEl.value),
                    presetIndeterminate = $container
                        .find('.category-preset input:indeterminate')
                        .toArray()
                        .map(categoryEl => categoryEl.value),
                    customSelected = $customCategoriesSelect
                        .siblings('.select2-container')
                        .find('.select2-search-choice')
                        .not('.partial')
                        .toArray()
                        .map(categoryEl => categoryEl.textContent && categoryEl.textContent.trim()),
                    customIndeterminate = $customCategoriesSelect
                        .siblings('.select2-container')
                        .find('.select2-search-choice.partial')
                        .toArray()
                        .map(categoryEl => categoryEl.textContent && categoryEl.textContent.trim());

                const selectedCategories = presetSelected.concat(customSelected);
                const indeterminatedCategories = presetIndeterminate.concat(customIndeterminate);

                /**
                 * @event categorySelector#category-change
                 * @param {String[]} allCategories
                 * @param {String[]} indeterminate
                 */
                this.trigger('category-change', selectedCategories, indeterminatedCategories);
            },

            /**
             * Create the category selection form
             *
             * @param {Array} [currentCategories] - all categories currently associated to the item. If applied to a section,
             * contains all the categories applied to at least one item of the section.
             * @param {string} [level] one of the values `testPart`, `section` or `itemRef`
             */
            createForm(currentCategories, level) {
                const presetsTpl = templates.properties.categorypresets;
                const customCategories = _.difference(currentCategories, allQtiCategoriesPresets);

                const filteredPresets = featureVisibility.filterVisiblePresets(allPresets, level);
                // add preset checkboxes
                $presetsContainer.append(presetsTpl({ presetGroups: filteredPresets }));

                $presetsContainer.on('click', e => {
                    const $preset = $(e.target).closest('.category-preset');
                    if ($preset.length) {
                        const $checkbox = $preset.find('input');
                        $checkbox.prop('indeterminate', false);

                        _.defer(() => this.updateCategories());
                    }
                });

                // init custom categories field
                $customCategoriesSelect
                    .select2({
                        width: '100%',
                        containerCssClass: 'custom-categories',
                        tags: customCategories,
                        multiple: true,
                        tokenSeparators: [',', ' ', ';'],
                        createSearchChoice: (category) => category.match(/^[a-zA-Z_][a-zA-Z0-9_-]*$/)
                            ? { id: category, text: category }
                            : null,
                        formatNoMatches: () => __('Category name not allowed'),
                        maximumInputLength: 32
                    })
                    .on('change', () => this.updateCategories());

                // when clicking on a partial category, ask the user if it wants to apply it to all items
                $container.find('.custom-categories').on('click', '.partial', e => {
                    const $choice = $(e.target).closest('.select2-search-choice');
                    const tag = $choice.text().trim();

                    confirmDialog(__('Do you want to apply the category "%s" to all included items?', tag), () => {
                        $choice.removeClass('partial');
                        this.updateCategories();
                    });
                });

                // enable help tooltips
                tooltip.lookup($container);
            },

            /**
             * Check/Uncheck boxes and fill the custom category field to match the new model
             * @param {String[]} selected - categories associated with an item, or with all the items of the same section
             * @param {String[]} [indeterminate] - categories in an indeterminate state at a section level
             */
            updateFormState(selected, indeterminate) {
                indeterminate = indeterminate || [];

                const customCategories = _.difference(selected.concat(indeterminate), allQtiCategoriesPresets);

                // Preset categories

                const $presetsCheckboxes = $container.find('.category-preset input');
                $presetsCheckboxes.each((idx, input) => {
                    const qtiCategory = input.value;
                    if (!categoryToPreset.has(qtiCategory)) {
                        // Unlikely to happen, but better safe than sorry...
                        input.indeterminate = indeterminate.includes(qtiCategory);
                        input.checked = selected.includes(qtiCategory);
                        return;
                    }
                    // Check if one category declared for the preset is selected.
                    // Usually, only one exists, but it may happen that alternatives are present.
                    // In any case, only the main declared category (qtiCategory) will be saved.
                    // The concept is as follows: read all, write one.
                    const preset = categoryToPreset.get(qtiCategory);
                    const hasCategory = category => preset.categories.includes(category);
                    input.indeterminate = indeterminate.some(hasCategory);
                    input.checked = selected.some(hasCategory);
                });

                // Custom categories

                $customCategoriesSelect.select2('val', customCategories);

                $customCategoriesSelect
                    .siblings('.select2-container')
                    .find('.select2-search-choice')
                    .each((idx, li) => {
                        const $li = $(li);
                        const content = $li.find('div').text();
                        if (indeterminate.indexOf(content) !== -1) {
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
     *              qtiCategory: 'x-tao-option-nextPartWarning',
     *              altCategories: [x-tao-option-nextPartWarningMessage]
     *              description: 'Displays a warning before the user finishes a part'
     *              ...
     *          },
     *          ...
     *      ]
     *  },
     *  ...
     * ]
     */
    categorySelectorFactory.setPresets = function setPresets(presets) {
        if (Array.isArray(presets)) {
            allPresets = Array.from(presets);
            categoryToPreset = new Map();
            allQtiCategoriesPresets = allPresets.reduce((allCategories, group) => {
                return group.presets.reduce((all, preset) => {
                    const categories = [preset.qtiCategory].concat(preset.altCategories || []);
                    categories.forEach(category => categoryToPreset.set(category, preset));
                    preset.categories = categories;
                    return all.concat(categories);
                }, allCategories);
            }, []);
        }
    };

    return categorySelectorFactory;
});
