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
        const $scaleSelect = $container.find('[name=scale-custom]');

        const scaleSelector = {
            /**
             * Read the form state and trigger an event with the result
             * @fires scaleSelector#scale-change
             */
            updateScale() {
                const selectedUri = $scaleSelect.val();

                if (!selectedUri) {
                    this.trigger('scale-change', null);
                    return;
                }

                if (scaleMap.has(selectedUri)) {
                    const selectedScale = scaleMap.get(selectedUri);
                    this.trigger('scale-change', selectedScale);
                } else {
                    const customScale = {
                        uri: selectedUri,
                        label: selectedUri
                    };
                    this.trigger('scale-change', customScale);
                }
            },

            /**
             * Create the scale selection form
             * @param {Object|String} [currentScale] - current scale associated with the outcome
             */
            createForm(currentScale) {
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
                        maximumInputLength: 32,
                        data: allScalesPresets.map(preset => ({
                            id: preset.uri,
                            text: preset.label
                        }))
                    })
                    .on('change', () => this.updateScale());

                if (currentScale) {
                    if (typeof currentScale === 'object' && currentScale.uri) {
                        $scaleSelect.select2('val', currentScale.uri);
                    } else if (typeof currentScale === 'string') {
                        $scaleSelect.select2('val', currentScale);
                    }
                }

                tooltip.lookup($container);
            },

            /**
             * Update the form to match the data model
             * @param {Object|String} scale - scale associated with an outcome
             */
            updateFormState(scale) {
                if (scale) {
                    if (typeof scale === 'object' && scale.uri) {
                        $scaleSelect.select2('val', scale.uri);
                    } else if (typeof scale === 'string') {
                        $scaleSelect.select2('val', scale);
                    }
                } else {
                    $scaleSelect.select2('val', '');
                }
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
                scaleMap.set(scale.uri, scale);
            });
        }
    };

    return scaleSelectorFactory;
});
