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
 * Copyright (c) 2025 (original work) Open Assessment Technologies SA;
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/eventifier',
    'ui/tooltip',
    'select2'
], function ($, _, __, eventifier, tooltip) {
    'use strict';

    let allScalesPresets = [];

    const scaleMap = new Map();

    function scaleSelectorFactory($container) {
        const $scaleSelect = $container.find('[name="interpretation"]');

        const scaleSelector = {
            /**
             * Read the form state and trigger an event with the result
             * @fires scaleSelector#interpretation-change
             */
            updateScale() {
                const selectedUri = $scaleSelect.val();

                if (!selectedUri) {
                    this.trigger('interpretation-change', null);
                    return;
                }

                if (scaleMap.has(selectedUri)) {
                    const selectedScale = scaleMap.get(selectedUri);
                    this.trigger('interpretation-change', selectedScale.uri);
                } else {
                    this.trigger('interpretation-change', selectedUri);
                }
            },

            /**
             * Create the scale selection form
             * @param {String} [currentInterpretation] - current interpretation associated with the outcome
             */
            createForm(currentInterpretation) {
                const selectData = allScalesPresets.map(preset => ({
                    id: preset.uri,
                    text: preset.label
                }));

                if (currentInterpretation && !scaleMap.has(currentInterpretation)) {
                    selectData.push({
                        id: currentInterpretation,
                        text: currentInterpretation
                    });
                }

                $scaleSelect
                    .select2({
                        width: '100%',
                        tags: true,
                        multiple: false,
                        tokenSeparators: null,
                        createSearchChoice: (scale) => scale.match(/^[a-zA-Z0-9_-]+$/)
                            ? { id: scale, text: scale }
                            : null,
                        formatNoMatches: () => __('Scale name not allowed'),
                        maximumSelectionSize: 1,
                        maximumInputLength: 32,
                        data: selectData
                    })
                    .on('change', () => this.updateScale());

                if (currentInterpretation) {
                    if (!$scaleSelect.find(`option[value="${currentInterpretation}"]`).length) {
                        $scaleSelect.append(new Option(currentInterpretation, currentInterpretation, true, true));
                    }

                    $scaleSelect.val(currentInterpretation).trigger('change');
                }

                tooltip.lookup($container);
            },

            /**
             * Update the form to match the data model
             * @param {String} interpretation - interpretation associated with an outcome
             */
            updateFormState(interpretation) {
                if (interpretation) {
                    if (!$scaleSelect.find(`option[value="${interpretation}"]`).length) {
                        $scaleSelect.append(new Option(interpretation, interpretation, true, true));
                    }

                    $scaleSelect.val(interpretation).trigger('change');
                } else {
                    $scaleSelect.val('').trigger('change');
                }
            },

            /**
             * Clear the current selection
             */
            clearSelection() {
                $scaleSelect.val('').trigger('change');
                this.updateScale();
            }
        };

        eventifier(scaleSelector);
        return scaleSelector;
    }

    /**
     * @param {Object[]} presets - expected format:
     * [
     *  {
     *    uri: "https://example.com/1",
     *    label: "Scale 1"
     *  },
     *  ...
     * ]
     */
    scaleSelectorFactory.setPresets = function setPresets(presets) {
        if (Array.isArray(presets)) {
            allScalesPresets = Array.from(presets);

            scaleMap.clear();
            allScalesPresets.forEach(scale => {
                if (scale && scale.uri) {
                    scaleMap.set(scale.uri, scale);
                }
            });
        }
    };

    return scaleSelectorFactory;
});
