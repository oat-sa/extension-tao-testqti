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
     * Now properly resets state between tests
     */
    const ScaleSynchronizationManager = {
        _predefinedScales: new Set(),
        _activePredefinedScale: null,
        _outcomeSelectors: new Map(),
        _isUpdating: false,
        _testId: null,

        /**
         * Initialize with predefined scales from backend
         * @param {Array} scalesPresets - Array of {uri, label} objects
         * @param {string} [testId] - Optional test identifier to ensure isolation
         */
        init(scalesPresets, testId) {
            if (testId && this._testId !== testId) {
                this.reset();
                this._testId = testId;
            }

            this._predefinedScales.clear();
            if (Array.isArray(scalesPresets)) {
                scalesPresets.forEach(scale => {
                    if (scale && scale.uri) {
                        this._predefinedScales.add(scale.uri);
                    }
                });
            }
        },

        /**
         * Reset all state - should be called when switching tests or clearing context
         */
        reset() {
            this._predefinedScales.clear();
            this._activePredefinedScale = null;
            this._outcomeSelectors.clear();
            this._isUpdating = false;
            this._testId = null;
        },

        /**
         * Register an outcome scale selector
         * @param {string} outcomeId - Unique identifier for the outcome
         * @param {Object} selector - Scale selector instance
         */
        registerSelector(outcomeId, selector) {
            this._outcomeSelectors.set(outcomeId, selector);

            this._checkCurrentState();
        },

        /**
         * Unregister an outcome scale selector
         * @param {string} outcomeId - Unique identifier for the outcome
         */
        unregisterSelector(outcomeId) {
            this._outcomeSelectors.delete(outcomeId);

            // Re-check state after unregistering
            if (this._activePredefinedScale !== null) {
                this._checkAndUnlockPredefinedScales();
            }
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

            const isPredefinedScale = newScale && this._predefinedScales.has(newScale);

            if (isPredefinedScale) {
                this._lockToPredefinedScale(newScale);
            } else if (newScale && !isPredefinedScale) {
                if (this._activePredefinedScale !== null) {
                    this._checkAndUnlockPredefinedScales();
                }
            } else if (!newScale && this._activePredefinedScale !== null) {
                this._checkAndUnlockPredefinedScales();
            }
        },

        /**
         * Check if a scale is predefined
         * @param {string} scale - Scale to check
         * @returns {boolean}
         */
        isPredefinedScale(scale) {
            return scale && this._predefinedScales.has(scale);
        },

        /**
         * Get current active predefined scale (if any)
         * @returns {string|null}
         */
        getActivePredefinedScale() {
            return this._activePredefinedScale;
        },

        /**
         * Check current state of all selectors and update lock accordingly
         * @private
         */
        _checkCurrentState() {
            let foundPredefinedScale = null;
            let hasDifferentPredefinedScales = false;

            this._outcomeSelectors.forEach(selector => {
                try {
                    const currentValue = selector.getCurrentValue();
                    if (this.isPredefinedScale(currentValue)) {
                        if (foundPredefinedScale === null) {
                            foundPredefinedScale = currentValue;
                        } else if (foundPredefinedScale !== currentValue) {
                            hasDifferentPredefinedScales = true;
                        }
                    }
                } catch (error) {
                    console.warn('Error checking selector value:', error);
                }
            });

            if (hasDifferentPredefinedScales) {
                if (this._activePredefinedScale !== null) {
                    this._activePredefinedScale = null;
                    this._updateAllSelectors();
                }
            } else if (foundPredefinedScale && foundPredefinedScale !== this._activePredefinedScale) {
                this._lockToPredefinedScale(foundPredefinedScale);
            } else if (!foundPredefinedScale && this._activePredefinedScale !== null) {
                this._activePredefinedScale = null;
                this._updateAllSelectors();
            }
        },

        /**
         * Lock all selectors to a specific predefined scale
         * @param {string} scale - Predefined scale to lock to
         * @private
         */
        _lockToPredefinedScale(scale) {
            if (this._activePredefinedScale === scale) {
                return;
            }

            this._activePredefinedScale = scale;
            this._updateAllSelectors();
        },

        /**
         * Check if any outcome still uses predefined scales, unlock if none
         * @private
         */
        _checkAndUnlockPredefinedScales() {
            let hasPredefinedScale = false;
            let foundPredefinedScale = null;
            let allScalesMatch = true;

            this._outcomeSelectors.forEach(selector => {
                try {
                    const currentValue = selector.getCurrentValue();
                    if (currentValue && this.isPredefinedScale(currentValue)) {
                        if (!foundPredefinedScale) {
                            foundPredefinedScale = currentValue;
                        } else if (foundPredefinedScale !== currentValue) {
                            allScalesMatch = false;
                        }
                        hasPredefinedScale = true;
                    }
                } catch (error) {
                    console.warn('Error checking selector value:', error);
                }
            });

            if (!hasPredefinedScale) {
                if (this._activePredefinedScale !== null) {
                    this._activePredefinedScale = null;
                    this._updateAllSelectors();
                }
            } else if (allScalesMatch && foundPredefinedScale !== this._activePredefinedScale) {
                this._activePredefinedScale = foundPredefinedScale;
                this._updateAllSelectors();
            } else if (!allScalesMatch && this._activePredefinedScale !== null) {
                this._activePredefinedScale = null;
                this._updateAllSelectors();
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
                this._outcomeSelectors.forEach((selector, outcomeId) => {
                    try {
                        selector.updateAvailableScales(this._activePredefinedScale);
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
