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

    /**
     * Singleton manager for scale synchronization
     * Now properly handles multiple tests with testId-indexed state
     */
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
                    outcomeSelectors: new Map()
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
                this._testStates.delete(testId);
                if (this._currentTestId === testId) {
                    this._currentTestId = null;
                }
            } else {
                this._testStates.clear();
                this._currentTestId = null;
            }
            this._isUpdating = false;
        },

        /**
         * Register an outcome scale selector
         * @param {string} outcomeId - Unique identifier for the outcome
         * @param {Object} selector - Scale selector instance
         */
        registerSelector(outcomeId, selector) {
            const state = this._getCurrentState();
            state.outcomeSelectors.set(outcomeId, selector);
            this._checkCurrentState();
        },

        /**
         * Unregister an outcome scale selector
         * @param {string} outcomeId - Unique identifier for the outcome
         */
        unregisterSelector(outcomeId) {
            const state = this._getCurrentState();
            state.outcomeSelectors.delete(outcomeId);

            this._checkIfAnyPredefinedScalesInUse();
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
         * When locked to a predefined scale:
         * - The dropdown shows only the locked predefined scale option
         * - Users can still type and select custom scales
         * - But predefined scales other than the locked one are hidden
         * @private
         */
        _updateAllSelectors() {
            if (this._isUpdating) {
                return;
            }

            this._isUpdating = true;

            try {
                const state = this._getCurrentState();
                state.outcomeSelectors.forEach((selector, outcomeId) => {
                    try {
                        selector.updateAvailableScales(state.activePredefinedScale);
                    } catch (error) {
                        console.warn(`Error updating selector ${outcomeId}:`, error);
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
