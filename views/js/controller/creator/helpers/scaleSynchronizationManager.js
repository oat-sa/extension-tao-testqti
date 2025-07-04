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
/**
 * Manages global synchronization of predefined scales across all outcome declarations
 */
define(['lodash'], function (_) {
    'use strict';

    const ScaleSynchronizationManager = {
        _testStates: new Map(),
        _currentTestId: null,
        _isUpdating: false,

        /**
         * Get or create state for a specific test
         * @param {string} testId - Test identifier
         * @returns {Object} State object for the test
         * @private
         */
        _getTestState(testId) {
            if (!this._testStates.has(testId)) {
                this._testStates.set(testId, {
                    predefinedScales: new Set(),
                    activePredefinedScale: null,
                    outcomeSelectors: new Map(),
                    outcomeIdentifierMap: new Map()
                });
            }
            return this._testStates.get(testId);
        },

        /**
         * Get current test state (for the active test)
         * @returns {Object} Current state object
         * @private
         */
        _getCurrentState() {
            if (!this._currentTestId) {
                throw new Error('No active test set. Call init() first.');
            }
            return this._getTestState(this._currentTestId);
        },

        /**
         * Initialize with predefined scales from backend
         * @param {Array} scalesPresets - Array of {uri, label} objects
         * @param {string} testId - Test identifier (now required)
         */
        init(scalesPresets, testId) {
            if (!testId) {
                throw new Error('testId is required for proper test isolation');
            }

            this._currentTestId = testId;
            const state = this._getTestState(testId);

            state.predefinedScales.clear();
            if (Array.isArray(scalesPresets)) {
                scalesPresets.forEach(scale => {
                    if (scale && scale.uri) {
                        state.predefinedScales.add(scale.uri);
                    }
                });
            }
        },

        /**
         * Reset state for a specific test (or all tests)
         * @param {string} [testId] - Specific test to reset, or null for all tests
         */
        reset(testId = null) {
            if (testId) {
                const state = this._testStates.get(testId);
                if (state) {
                    state.outcomeSelectors.forEach(selector => {
                        if (selector && typeof selector.destroy === 'function') {
                            try {
                                selector.destroy();
                            } catch (error) {
                                console.warn('Error destroying selector during reset:', error);
                            }
                        }
                    });
                }
                this._testStates.delete(testId);
                if (this._currentTestId === testId) {
                    this._currentTestId = null;
                }
            } else {
                this._testStates.forEach(state => {
                    state.outcomeSelectors.forEach(selector => {
                        if (selector && typeof selector.destroy === 'function') {
                            try {
                                selector.destroy();
                            } catch (error) {
                                console.warn('Error destroying selector during reset:', error);
                            }
                        }
                    });
                });
                this._testStates.clear();
                this._currentTestId = null;
            }
            this._isUpdating = false;
        },

        /**
         * Generate a stable outcome identifier for tracking
         * @param {Object} outcome - Outcome object
         * @returns {string} Stable identifier
         * @private
         */
        _getStableOutcomeIdentifier(outcome) {
            if (outcome.identifier) {
                return outcome.identifier;
            }
            if (outcome.serial) {
                return outcome.serial;
            }

            const props = [
                outcome.longInterpretation,
                outcome.interpretation,
                outcome.normalMinimum,
                outcome.normalMaximum
            ].filter(p => p !== undefined && p !== null && p !== '');

            if (props.length > 0) {
                return `temp_${props.join('_').replace(/[^a-zA-Z0-9_]/g, '_')}`;
            }

            return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        },

        /**
         * Register an outcome scale selector with duplicate prevention
         * @param {string} selectorId - Unique identifier for the selector instance
         * @param {Object} selector - Scale selector instance
         * @param {Object} outcome - Outcome object for tracking
         */
        registerSelector(selectorId, selector, outcome) {
            const state = this._getCurrentState();
            if (!outcome) {
                state.outcomeSelectors.set(selectorId, selector);
                this._checkCurrentState();
                return;
            }

            const stableId = this._getStableOutcomeIdentifier(outcome);
            const existingSelectorId = state.outcomeIdentifierMap.get(stableId);
            if (existingSelectorId && existingSelectorId !== selectorId) {
                const existingSelector = state.outcomeSelectors.get(existingSelectorId);
                if (existingSelector && !existingSelector._destroyed) {
                    try {
                        existingSelector.destroy();
                    } catch (error) {
                        console.warn('Error destroying duplicate selector:', error);
                    }

                    state.outcomeSelectors.delete(existingSelectorId);
                }
            }
            state.outcomeSelectors.set(selectorId, selector);
            state.outcomeIdentifierMap.set(stableId, selectorId);

            this._checkCurrentState();
        },

        /**
         * Unregister an outcome scale selector
         * @param {string} selectorId - Unique identifier for the selector
         * @param {Object} [outcome] - Outcome object for proper cleanup
         */
        unregisterSelector(selectorId, outcome = null) {
            const state = this._getCurrentState();
            state.outcomeSelectors.delete(selectorId);
            if (outcome) {
                const stableId = this._getStableOutcomeIdentifier(outcome);
                const mappedSelectorId = state.outcomeIdentifierMap.get(stableId);
                if (mappedSelectorId === selectorId) {
                    state.outcomeIdentifierMap.delete(stableId);
                }
            } else {
                for (const [stableId, mappedSelectorId] of state.outcomeIdentifierMap.entries()) {
                    if (mappedSelectorId === selectorId) {
                        state.outcomeIdentifierMap.delete(stableId);
                        break;
                    }
                }
            }

            this._checkIfAnyPredefinedScalesInUse();
        },

        /**
         * Update selector registration when outcome properties change
         * @param {string} selectorId - Current selector ID
         * @param {Object} oldOutcome - Previous outcome state
         * @param {Object} newOutcome - Updated outcome state
         */
        updateSelectorRegistration(selectorId, oldOutcome, newOutcome) {
            const state = this._getCurrentState();
            const selector = state.outcomeSelectors.get(selectorId);

            if (!selector) {
                return;
            }

            const oldStableId = oldOutcome ? this._getStableOutcomeIdentifier(oldOutcome) : null;
            const newStableId = this._getStableOutcomeIdentifier(newOutcome);

            if (oldStableId && oldStableId !== newStableId) {
                if (state.outcomeIdentifierMap.get(oldStableId) === selectorId) {
                    state.outcomeIdentifierMap.delete(oldStableId);
                }

                const existingSelectorId = state.outcomeIdentifierMap.get(newStableId);
                if (existingSelectorId && existingSelectorId !== selectorId) {
                    const existingSelector = state.outcomeSelectors.get(existingSelectorId);
                    if (existingSelector && !existingSelector._destroyed) {
                        try {
                            existingSelector.destroy();
                        } catch (error) {
                            console.warn('Error destroying conflicting selector:', error);
                        }
                        state.outcomeSelectors.delete(existingSelectorId);
                    }
                }

                state.outcomeIdentifierMap.set(newStableId, selectorId);
            }
        },

        /**
         * Clean up orphaned selectors that may have been left behind
         */
        cleanupOrphanedSelectors() {
            const state = this._getCurrentState();
            const validSelectorIds = new Set(state.outcomeIdentifierMap.values());

            const orphanedSelectorIds = [];
            for (const selectorId of state.outcomeSelectors.keys()) {
                if (!validSelectorIds.has(selectorId)) {
                    orphanedSelectorIds.push(selectorId);
                }
            }

            orphanedSelectorIds.forEach(selectorId => {
                const selector = state.outcomeSelectors.get(selectorId);
                if (selector) {
                    try {
                        if (typeof selector.destroy === 'function') {
                            selector.destroy();
                        }
                    } catch (error) {
                        console.warn('Error destroying orphaned selector:', error);
                    }
                    state.outcomeSelectors.delete(selectorId);
                }
            });
        },

        /**
         * Handle scale change from any outcome
         * @param {string} outcomeId - ID of the outcome that changed
         * @param {string|null} newScale - New scale value (null if cleared)
         */
        onScaleChange(outcomeId, newScale) {
            if (this._isUpdating) {
                return;
            }

            const state = this._getCurrentState();
            const isPredefinedScale = newScale && state.predefinedScales.has(newScale);

            if (isPredefinedScale) {
                this._lockToPredefinedScale(newScale);
            } else {
                this._checkIfAnyPredefinedScalesInUse();
            }
        },

        /**
         * Check if a scale is predefined
         * @param {string} scale - Scale to check
         * @returns {boolean}
         */
        isPredefinedScale(scale) {
            const state = this._getCurrentState();
            return scale && state.predefinedScales.has(scale);
        },

        /**
         * Get current active predefined scale (if any)
         * @returns {string|null}
         */
        getActivePredefinedScale() {
            const state = this._getCurrentState();
            return state.activePredefinedScale;
        },

        /**
         * Check current state of all selectors and update lock accordingly
         * @private
         */
        _checkCurrentState() {
            this._checkIfAnyPredefinedScalesInUse();
        },

        /**
         * Lock all selectors to a specific predefined scale
         * @param {string} scale - Predefined scale to lock to
         * @private
         */
        _lockToPredefinedScale(scale) {
            const state = this._getCurrentState();
            if (state.activePredefinedScale === scale) {
                return;
            }

            state.activePredefinedScale = scale;
            this._updateAllSelectors();
        },

        /**
         * Check if any predefined scales are still in use across all selectors
         * If none are in use, unlock all selectors
         * @private
         */
        _checkIfAnyPredefinedScalesInUse() {
            const state = this._getCurrentState();
            let foundPredefinedScale = null;

            state.outcomeSelectors.forEach(selector => {
                try {
                    if (selector._destroyed) {
                        return;
                    }
                    const currentValue = selector.getCurrentValue();
                    if (currentValue && state.predefinedScales.has(currentValue)) {
                        foundPredefinedScale = currentValue;
                    }
                } catch (error) {
                    console.warn('Error checking selector value:', error);
                }
            });

            if (foundPredefinedScale) {
                if (state.activePredefinedScale !== foundPredefinedScale) {
                    this._lockToPredefinedScale(foundPredefinedScale);
                }
            } else {
                if (state.activePredefinedScale !== null) {
                    state.activePredefinedScale = null;
                    this._updateAllSelectors();
                }
            }
        },

        /**
         * Update all registered selectors with current lock state
         * @private
         */
        _updateAllSelectors() {
            if (this._isUpdating) {
                return;
            }

            this._isUpdating = true;

            try {
                const state = this._getCurrentState();
                state.outcomeSelectors.forEach((selector, selectorId) => {
                    try {
                        if (selector._destroyed) {
                            return;
                        }
                        selector.updateAvailableScales(state.activePredefinedScale);
                    } catch (error) {
                        console.warn(`Error updating selector ${selectorId}:`, error);
                    }
                });
            } catch (error) {
                console.warn('Error in _updateAllSelectors:', error);
            } finally {
                this._isUpdating = false;
            }
        }
    };

    return ScaleSynchronizationManager;
});
