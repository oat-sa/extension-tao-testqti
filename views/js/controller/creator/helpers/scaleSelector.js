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
    'select2',
    'taoQtiTest/controller/creator/helpers/scaleSynchronizationManager'
], function ($, _, __, eventifier, tooltip, select2, syncManager) {
    'use strict';

    let allScalesPresets = [];
    const scaleMap = new Map();

    function scaleSelectorFactory($container, outcomeId) {
        const $scaleSelect = $container.find('[name="interpretation"]');

        const scaleSelector = {
            _isInternalUpdate: false,

            /**
             * Get current scale value
             * @returns {string|null}
             */
            getCurrentValue() {
                try {
                    return $scaleSelect.val() || null;
                } catch (error) {
                    console.warn('Error getting current value:', error);
                    return null;
                }
            },

            /**
             * Update available scales based on synchronization state
             * @param {string|null} lockedPredefinedScale - Currently locked predefined scale
             */
            updateAvailableScales(lockedPredefinedScale) {
                this._isInternalUpdate = true;

                try {
                    const currentValue = this.getCurrentValue();
                    const selectData = this._buildSelectData(lockedPredefinedScale, currentValue);

                    setTimeout(() => {
                        try {
                            this._safeDestroySelect2();

                            this._initializeSelect2(selectData);

                            if (currentValue) {
                                this._setCurrentValue(currentValue, true);
                            }
                        } catch (error) {
                            console.warn('Error updating scale selector:', error);
                        } finally {
                            this._isInternalUpdate = false;
                        }
                    }, 0);
                } catch (error) {
                    console.warn('Error in updateAvailableScales:', error);
                    this._isInternalUpdate = false;
                }
            },

            /**
             * Read the form state and trigger an event with the result
             * @fires scaleSelector#interpretation-change
             */
            updateScale() {
                if (this._isInternalUpdate) {
                    return;
                }

                const selectedUri = $scaleSelect.val();
                const normalizedValue = this._normalizeScaleValue(selectedUri);

                if (outcomeId) {
                    syncManager.onScaleChange(outcomeId, normalizedValue);
                }

                this.trigger('interpretation-change', normalizedValue);
            },

            /**
             * Create the scale selection form
             * @param {String} [currentInterpretation] - current interpretation associated with the outcome
             */
            createForm(currentInterpretation) {
                const lockedScale = syncManager.getActivePredefinedScale();
                const selectData = this._buildSelectData(lockedScale, currentInterpretation);

                this._initializeSelect2(selectData);

                if (currentInterpretation) {
                    this._setCurrentValue(currentInterpretation, false);
                }

                if (outcomeId) {
                    syncManager.registerSelector(outcomeId, this);
                }

                tooltip.lookup($container);
            },

            /**
             * Update the form to match the data model
             * @param {String} interpretation - interpretation associated with an outcome
             */
            updateFormState(interpretation) {
                this._isInternalUpdate = true;
                try {
                    if (interpretation) {
                        this._setCurrentValue(interpretation, true);
                    } else {
                        $scaleSelect.val('');
                    }
                } catch (error) {
                    console.warn('Error updating form state:', error);
                } finally {
                    this._isInternalUpdate = false;
                }
            },

            /**
             * Clear the current selection
             */
            clearSelection() {
                this._isInternalUpdate = true;
                try {
                    $scaleSelect.val('');
                } catch (error) {
                    console.warn('Error clearing selection:', error);
                } finally {
                    this._isInternalUpdate = false;
                }
                this.updateScale();
            },

            /**
             * Destroy the selector and cleanup
             */
            destroy() {
                try {
                    if (outcomeId) {
                        syncManager.unregisterSelector(outcomeId);
                    }

                    this._safeDestroySelect2();
                } catch (error) {
                    console.warn('Error during selector destruction:', error);
                }
            },

            /**
             * Build select data based on current lock state
             * @param {string|null} lockedScale - Currently locked predefined scale
             * @param {string} currentValue - Current selected value
             * @returns {Array} Select2 data array
             * @private
             */
            _buildSelectData(lockedScale, currentValue) {
                let availablePresets;

                if (lockedScale) {
                    availablePresets = allScalesPresets.filter(preset => preset.uri === lockedScale);
                } else {
                    availablePresets = allScalesPresets;
                }

                const selectData = availablePresets.map(preset => ({
                    id: preset.uri,
                    text: preset.label
                }));

                if (currentValue && !scaleMap.has(currentValue)) {
                    selectData.push({
                        id: currentValue,
                        text: currentValue
                    });
                }

                return selectData;
            },

            /**
             * Initialize Select2 with given data
             * @param {Array} selectData - Data for Select2
             * @private
             */
            _initializeSelect2(selectData) {
                try {
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
                        .on('change.scaleSync', () => {
                            if (!this._isInternalUpdate) {
                                setTimeout(() => {
                                    this.updateScale();
                                }, 0);
                            }
                        });
                } catch (error) {
                    console.warn('Error initializing Select2:', error);
                }
            },

            /**
             * Set current value ensuring option exists
             * @param {string} value - Value to set
             * @param {boolean} skipTrigger - Skip triggering change event
             * @private
             */
            _setCurrentValue(value, skipTrigger = false) {
                try {
                    if (!$scaleSelect.find(`option[value="${value}"]`).length) {
                        $scaleSelect.append(new Option(value, value, true, true));
                    }

                    if (skipTrigger) {
                        $scaleSelect.val(value);
                    } else {
                        $scaleSelect.val(value).trigger('change');
                    }
                } catch (error) {
                    console.warn('Error setting current value:', error);
                }
            },

            /**
             * Safe Select2 destruction with error handling
             * @private
             */
            _safeDestroySelect2() {
                try {
                    $scaleSelect.off('change.scaleSync');

                    if ($scaleSelect.length && $scaleSelect.hasClass('select2-hidden-accessible')) {
                        $scaleSelect.select2('destroy');
                    }
                } catch (error) {
                    console.warn('Error destroying Select2:', error);
                    try {
                        $scaleSelect.removeClass('select2-hidden-accessible');
                        $scaleSelect.next('.select2-container').remove();
                    } catch (cleanupError) {
                        console.warn('Error in Select2 cleanup:', cleanupError);
                    }
                }
            },

            /**
             * Normalize scale value for consistency
             * @param {string} value - Raw scale value
             * @returns {string|null} Normalized value
             * @private
             */
            _normalizeScaleValue(value) {
                if (!value) return null;

                if (scaleMap.has(value)) {
                    return scaleMap.get(value).uri;
                }

                return value;
            }
        };

        eventifier(scaleSelector);
        return scaleSelector;
    }

    /**
     * Set predefined scales presets
     * @param {Object[]} presets - Array of {uri, label} objects
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

            syncManager.init(presets);
        }
    };

    return scaleSelectorFactory;
});
