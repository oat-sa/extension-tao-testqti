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
    let currentTestId = null;

    function scaleSelectorFactory($container, outcomeId) {
        const $scaleSelect = $container.find('[name="scale"]');
        let lastKnownValue = null;

        const scaleSelector = {
            _isInternalUpdate: false,
            _destroyed: false,

            /**
             * Get current scale value
             * @returns {string|null}
             */
            getCurrentValue() {
                try {
                    if (this._destroyed || !$scaleSelect.length) {
                        return null;
                    }
                    const value = $scaleSelect.val();
                    return value || null;
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
                if (this._destroyed) {
                    return;
                }

                this._isInternalUpdate = true;

                try {
                    const currentValue = this.getCurrentValue();
                    const selectData = this._buildSelectData(lockedPredefinedScale, currentValue);

                    if (!$scaleSelect.length || !$scaleSelect.data('select2')) {
                        this._initializeSelect2(selectData);
                        if (currentValue) {
                            this._setCurrentValue(currentValue, true);
                        }
                        return;
                    }

                    const currentOptions = $scaleSelect.find('option').map(function() {
                        return $(this).val();
                    }).get();

                    const newOptions = selectData.map(item => item.id);
                    const needsUpdate = !_.isEqual(currentOptions.sort(), [''].concat(newOptions).sort());

                    if (!needsUpdate) {
                        this._isInternalUpdate = false;
                        return;
                    }

                    setTimeout(() => {
                        if (this._destroyed) {
                            return;
                        }

                        try {
                            this._safeUpdateSelect2(selectData, currentValue);
                        } catch (error) {
                            console.warn('Error in delayed Select2 update:', error);
                        }
                    }, 10);

                } catch (error) {
                    console.warn('Error updating scale selector:', error);
                } finally {
                    this._isInternalUpdate = false;
                }
            },

            /**
             * Safely update Select2 with proper cleanup
             * @param {Array} selectData - New options data
             * @param {string} currentValue - Current selected value
             * @private
             */
            _safeUpdateSelect2(selectData, currentValue) {
                if (this._destroyed || !$scaleSelect.length) {
                    return;
                }

                try {
                    if ($scaleSelect.data('select2')) {
                        this._safeDestroySelect2();
                    }

                    this._initializeSelect2(selectData);

                    if (currentValue) {
                        this._setCurrentValue(currentValue, true);
                    }

                } catch (error) {
                    console.warn('Error in _safeUpdateSelect2:', error);
                }
            },

            // Read the form state and trigger an event with the result (emits 'scale-change')
            updateScale() {
                if (this._isInternalUpdate || this._destroyed) {
                    return;
                }

                const selectedUri = this.getCurrentValue();
                const normalizedValue = this._normalizeScaleValue(selectedUri);

                if (normalizedValue !== lastKnownValue) {
                    lastKnownValue = normalizedValue;

                    if (outcomeId) {
                        syncManager.onScaleChange(outcomeId, normalizedValue);
                    }

                    this.trigger('scale-change', normalizedValue);
                }
            },

            /**
             * Create the scale selection form
             * @param {String} [currentInterpretation] - current interpretation associated with the outcome
             */
            createForm(currentInterpretation) {
                if (this._destroyed) {
                    return;
                }

                const lockedScale = syncManager.getActivePredefinedScale();
                const selectData = this._buildSelectData(lockedScale, currentInterpretation);
                this._initializeSelect2(selectData);

                if (currentInterpretation) {
                    lastKnownValue = this._normalizeScaleValue(currentInterpretation);
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
                if (this._destroyed) {
                    return;
                }

                this._isInternalUpdate = true;
                try {
                    const normalizedValue = this._normalizeScaleValue(interpretation);

                    if (interpretation) {
                        this._setCurrentValue(interpretation, true);
                        lastKnownValue = normalizedValue;
                    } else {
                        $scaleSelect.val('').trigger('change.select2');
                        lastKnownValue = null;
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
                if (this._destroyed) {
                    return;
                }

                this._isInternalUpdate = true;

                try {
                    const previousValue = lastKnownValue;
                    lastKnownValue = null;

                    $scaleSelect.val('');

                    if ($scaleSelect.data('select2')) {
                        $scaleSelect.trigger('change.select2');
                    }

                    if ($scaleSelect._testValue !== undefined) {
                        $scaleSelect._testValue = '';
                    }

                    if (previousValue !== null) {
                        if (outcomeId) {
                            syncManager.onScaleChange(outcomeId, null);
                        }
                        this.trigger('scale-change', null);
                    }
                } catch (error) {
                    console.warn('Error clearing selection:', error);
                } finally {
                    this._isInternalUpdate = false;
                }
            },

            /**
             * Destroy the selector and cleanup
             */
            destroy() {
                if (this._destroyed) {
                    return;
                }

                this._destroyed = true;

                try {
                    if (outcomeId) {
                        syncManager.unregisterSelector(outcomeId);
                    }

                    this._safeDestroySelect2();

                    lastKnownValue = null;
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
                let selectData = [];

                if (lockedScale) {
                    const lockedPreset = allScalesPresets.find(preset => preset.uri === lockedScale);
                    if (lockedPreset) {
                        selectData.push({
                            id: lockedPreset.uri,
                            text: lockedPreset.label
                        });
                    }

                    if (currentValue && currentValue !== lockedScale) {
                        const preset = scaleMap.get(currentValue);
                        if (preset) {
                            selectData.push({
                                id: preset.uri,
                                text: preset.label
                            });
                        } else {
                            selectData.push({
                                id: currentValue,
                                text: currentValue
                            });
                        }
                    }
                } else {
                    selectData = allScalesPresets.map(preset => ({
                        id: preset.uri,
                        text: preset.label
                    }));

                    if (currentValue) {
                        const valueExists = selectData.some(item => item.id === currentValue);
                        if (!valueExists) {
                            const preset = scaleMap.get(currentValue);
                            if (preset) {
                                selectData.push({
                                    id: preset.uri,
                                    text: preset.label
                                });
                            } else {
                                selectData.push({
                                    id: currentValue,
                                    text: currentValue
                                });
                            }
                        }
                    }
                }

                return selectData;
            },

            /**
             * Initialize Select2 with given data
             * @param {Array} selectData - Data for Select2
             * @private
             */
            _initializeSelect2(selectData) {
                if (this._destroyed || !$scaleSelect.length) {
                    return;
                }

                try {
                    $scaleSelect.empty();

                    $scaleSelect.append(new Option('', '', false, false));

                    $scaleSelect
                        .select2({
                            width: '100%',
                            tags: true,
                            tokenSeparators: null,
                            createSearchChoice: (scale) => {
                                // Always allow custom scales to be entered
                                return scale.match(/^[a-zA-Z0-9_-]+$/)
                                    ? { id: scale, text: scale }
                                    : null;
                            },
                            formatNoMatches: () => __('Scale name not allowed'),
                            maximumSelectionSize: 1,
                            maximumInputLength: 32,
                            data: selectData,
                            placeholder: __('Select or enter a scale'),
                            openOnEnter: false,
                            initSelection: function(element, callback) {
                                const val = element.val();
                                if (val) {
                                    const data = selectData.find(item => item.id === val);
                                    if (data) {
                                        callback(data);
                                    } else {
                                        callback({ id: val, text: val });
                                    }
                                }
                            }
                        })
                         .off('change.scaleSync')
                         .on('change.scaleSync', () => {
                             if (!this._isInternalUpdate && !this._destroyed) {
                                 this.updateScale();
                             }
                         });

                    $scaleSelect.select2('close');
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
                if (this._destroyed || !value) {
                    return;
                }

                try {
                    let $option = $scaleSelect.find(`option[value="${value}"]`);

                    if (!$option.length) {
                        const label = scaleMap.has(value) ? scaleMap.get(value).label : value;
                        $option = new Option(label, value, true, true);
                        $scaleSelect.append($option);
                    }

                    if (skipTrigger) {
                        $scaleSelect.val(value).trigger('change.select2');
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
                if (!$scaleSelect.length) {
                    return;
                }

                try {
                    $scaleSelect.off('change.scaleSync');

                    if ($scaleSelect.data('select2')) {
                        try {
                            $scaleSelect.select2('close');
                        } catch (closeError) {
                            console.warn('Error closing Select2 during destruction:', closeError);
                        }

                        try {
                            $scaleSelect.select2('val', '');
                        } catch (clearError) {
                            console.warn('Error clearing Select2 value:', clearError);
                        }

                        try {
                            $scaleSelect.select2('destroy');
                        } catch (destroyError) {
                            console.warn('Error destroying Select2 instance:', destroyError);
                        }
                    }

                    try {
                        $scaleSelect.removeClass('select2-hidden-accessible');
                        const $container = $scaleSelect.next('.select2-container');
                        if ($container.length) {
                            $container.off();
                            $container.find('*').off();
                            $container.remove();
                        }
                    } catch (cleanupError) {
                        console.warn('Error in Select2 cleanup:', cleanupError);
                    }

                } catch (error) {
                    console.warn('Error in _safeDestroySelect2:', error);
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
                    return value;
                }

                for (const [uri, scale] of scaleMap.entries()) {
                    if (scale.label === value) {
                        return uri;
                    }
                }

                return value;
            }
        };

        eventifier(scaleSelector);
        return scaleSelector;
    }

    /**
     * Set the current test ID - must be called before creating selectors
     * @param {string} testId - Test identifier
     */
    scaleSelectorFactory.setTestId = function setTestId(testId) {
        if (!testId) {
            throw new Error('testId is required');
        }

        currentTestId = testId;

        if (allScalesPresets.length > 0) {
            syncManager.init(allScalesPresets, currentTestId);
        }
    };

    /**
     * Get the current test ID
     * @returns {string|null} Current test ID
     */
    scaleSelectorFactory.getTestId = function getTestId() {
        return currentTestId;
    };

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

            if (currentTestId) {
                syncManager.init(presets, currentTestId);
            }
        }
    };

    /**
     * Initialize with both presets and test ID
     * @param {Object[]} presets - Array of {uri, label} objects
     * @param {string} testId - Test identifier
     */
    scaleSelectorFactory.initialize = function initialize(presets, testId) {
        if (!testId) {
            throw new Error('testId is required');
        }

        currentTestId = testId;
        this.setPresets(presets);
    };

    /**
     * Reset the factory state - useful when switching between tests
     * @param {string} [testId] - Specific test to reset, or null for all tests
     */
    scaleSelectorFactory.reset = function reset(testId = null) {
        if (testId) {
            syncManager.reset(testId);
            if (currentTestId === testId) {
                currentTestId = null;
            }
        } else {
            allScalesPresets = [];
            scaleMap.clear();
            currentTestId = null;
            syncManager.reset();
        }
    };

    /**
     * Expose sync manager for enhanced functionality (internal use)
     * @returns {Object} Sync manager instance
     * @private
     */
    scaleSelectorFactory.__getSyncManager = function getSyncManager() {
        return syncManager;
    };

    return scaleSelectorFactory;
});
