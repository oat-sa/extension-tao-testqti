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
define(['lodash'], function (_) {
    'use strict';

    class TestState {
        constructor() {
            this.predefinedScales = new Set();
            this.activePredefinedScale = null;
            this.outcomeSelectors = new Map();
            this.outcomeIdentifierMap = new Map();
        }

        clear() {
            this.predefinedScales.clear();
            this.activePredefinedScale = null;
            this.outcomeSelectors.clear();
            this.outcomeIdentifierMap.clear();
        }

        isPredefinedScale(scale) {
            return scale && this.predefinedScales.has(scale);
        }

        hasActivePredefinedScale() {
            return this.activePredefinedScale !== null;
        }
    }

    class OutcomeIdentifier {
        static generate(outcome) {
            if (outcome.identifier) return outcome.identifier;
            if (outcome.serial) return outcome.serial;

            const props = [
                outcome.longInterpretation,
                outcome.interpretation,
                outcome.normalMinimum,
                outcome.normalMaximum
            ].filter(p => p !== undefined && p !== null && p !== '');

            return props.length > 0
                ? `temp_${props.join('_').replace(/[^a-zA-Z0-9_]/g, '_')}`
                : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        }
    }

    class SelectorRegistry {
        constructor(testState) {
            this.testState = testState;
        }

        register(selectorId, selector, outcome = null) {
            if (outcome) {
                this.cleanupDuplicates(selectorId, outcome);
            }

            this.testState.outcomeSelectors.set(selectorId, selector);

            if (outcome) {
                const stableId = OutcomeIdentifier.generate(outcome);
                this.testState.outcomeIdentifierMap.set(stableId, selectorId);
            }
        }

        unregister(selectorId, outcome = null) {
            this.testState.outcomeSelectors.delete(selectorId);
            this.cleanupIdentifierMapping(selectorId, outcome);
        }

        updateRegistration(selectorId, oldOutcome, newOutcome) {
            const selector = this.testState.outcomeSelectors.get(selectorId);
            if (!selector) return;

            const oldStableId = oldOutcome ? OutcomeIdentifier.generate(oldOutcome) : null;
            const newStableId = OutcomeIdentifier.generate(newOutcome);

            if (oldStableId && oldStableId !== newStableId) {
                this.updateIdentifierMapping(selectorId, oldStableId, newStableId);
            }
        }

        cleanupOrphaned() {
            const validSelectorIds = new Set(this.testState.outcomeIdentifierMap.values());
            const orphanedIds = Array.from(this.testState.outcomeSelectors.keys())
                .filter(id => !validSelectorIds.has(id));

            orphanedIds.forEach(id => {
                const selector = this.testState.outcomeSelectors.get(id);
                if (selector) {
                    this.destroySelector(selector);
                    this.testState.outcomeSelectors.delete(id);
                }
            });
        }

        cleanupDuplicates(selectorId, outcome) {
            const stableId = OutcomeIdentifier.generate(outcome);
            const existingSelectorId = this.testState.outcomeIdentifierMap.get(stableId);

            if (existingSelectorId && existingSelectorId !== selectorId) {
                const existingSelector = this.testState.outcomeSelectors.get(existingSelectorId);
                if (existingSelector && !existingSelector._destroyed) {
                    this.destroySelector(existingSelector);
                    this.testState.outcomeSelectors.delete(existingSelectorId);
                }
            }
        }

        updateIdentifierMapping(selectorId, oldStableId, newStableId) {
            if (this.testState.outcomeIdentifierMap.get(oldStableId) === selectorId) {
                this.testState.outcomeIdentifierMap.delete(oldStableId);
            }

            const existingSelectorId = this.testState.outcomeIdentifierMap.get(newStableId);
            if (existingSelectorId && existingSelectorId !== selectorId) {
                const existingSelector = this.testState.outcomeSelectors.get(existingSelectorId);
                if (existingSelector && !existingSelector._destroyed) {
                    this.destroySelector(existingSelector);
                    this.testState.outcomeSelectors.delete(existingSelectorId);
                }
            }

            this.testState.outcomeIdentifierMap.set(newStableId, selectorId);
        }

        cleanupIdentifierMapping(selectorId, outcome) {
            if (outcome) {
                const stableId = OutcomeIdentifier.generate(outcome);
                const mappedSelectorId = this.testState.outcomeIdentifierMap.get(stableId);
                if (mappedSelectorId === selectorId) {
                    this.testState.outcomeIdentifierMap.delete(stableId);
                }
            } else {
                for (const [stableId, mappedSelectorId] of this.testState.outcomeIdentifierMap.entries()) {
                    if (mappedSelectorId === selectorId) {
                        this.testState.outcomeIdentifierMap.delete(stableId);
                        break;
                    }
                }
            }
        }

        destroySelector(selector) {
            try {
                if (typeof selector.destroy === 'function') {
                    selector.destroy();
                }
            } catch (error) {
                console.warn('Error destroying selector:', error);
            }
        }
    }

    class ScaleLockManager {
        constructor(testState) {
            this.testState = testState;
            this.isUpdating = false;
        }

        handleScaleChange(newScale) {
            if (this.isUpdating) return;

            if (this.testState.isPredefinedScale(newScale)) {
                this.lockToPredefinedScale(newScale);
            } else {
                this.checkForActivePredefinedScales();
            }
        }

        lockToPredefinedScale(scale) {
            if (this.testState.activePredefinedScale === scale) return;

            this.testState.activePredefinedScale = scale;
            this.updateAllSelectors();
        }

        checkForActivePredefinedScales() {
            const foundScale = this.findActivePredefinedScale();

            if (foundScale) {
                if (this.testState.activePredefinedScale !== foundScale) {
                    this.lockToPredefinedScale(foundScale);
                }
            } else {
                if (this.testState.hasActivePredefinedScale()) {
                    this.testState.activePredefinedScale = null;
                    this.updateAllSelectors();
                }
            }
        }

        findActivePredefinedScale() {
            for (const [, selector] of this.testState.outcomeSelectors.entries()) {
                try {
                    if (selector._destroyed) continue;

                    const currentValue = selector.getCurrentValue();
                    if (this.testState.isPredefinedScale(currentValue)) {
                        return currentValue;
                    }
                } catch (error) {
                    console.warn('Error checking selector value:', error);
                }
            }
            return null;
        }

        updateAllSelectors() {
            if (this.isUpdating) return;

            this.isUpdating = true;
            try {
                this.testState.outcomeSelectors.forEach((selector) => {
                    this.updateSelector(selector);
                });
            } catch (error) {
                console.warn('Error updating selectors:', error);
            } finally {
                this.isUpdating = false;
            }
        }

        updateSelector(selector) {
            try {
                if (selector._destroyed) return;
                selector.updateAvailableScales(this.testState.activePredefinedScale);
            } catch (error) {
                console.warn('Error updating selector:', error);
            }
        }
    }

    const ScaleSynchronizationManager = {
        _testStates: new Map(),
        _currentTestId: null,

        init(scalesPresets, testId) {
            if (!testId) {
                throw new Error('testId is required for proper test isolation');
            }

            this._currentTestId = testId;
            const testState = this.getTestState(testId);

            testState.predefinedScales.clear();
            if (Array.isArray(scalesPresets)) {
                scalesPresets.forEach(scale => {
                    if (scale && scale.uri) {
                        testState.predefinedScales.add(scale.uri);
                    }
                });
            }
        },

        reset(testId = null) {
            if (testId) {
                this.resetSpecificTest(testId);
            } else {
                this.resetAllTests();
            }
        },

        registerSelector(selectorId, selector, outcome) {
            const testState = this.getCurrentState();
            const registry = new SelectorRegistry(testState);
            const lockManager = new ScaleLockManager(testState);

            registry.register(selectorId, selector, outcome);
            lockManager.checkForActivePredefinedScales();
        },

        unregisterSelector(selectorId, outcome = null) {
            const testState = this.getCurrentState();
            const registry = new SelectorRegistry(testState);
            const lockManager = new ScaleLockManager(testState);

            registry.unregister(selectorId, outcome);
            lockManager.checkForActivePredefinedScales();
        },

        updateSelectorRegistration(selectorId, oldOutcome, newOutcome) {
            const testState = this.getCurrentState();
            const registry = new SelectorRegistry(testState);

            registry.updateRegistration(selectorId, oldOutcome, newOutcome);
        },

        cleanupOrphanedSelectors() {
            const testState = this.getCurrentState();
            const registry = new SelectorRegistry(testState);

            registry.cleanupOrphaned();
        },

        onScaleChange(outcomeId, newScale) {
            const testState = this.getCurrentState();
            const lockManager = new ScaleLockManager(testState);

            lockManager.handleScaleChange(newScale);
        },

        isPredefinedScale(scale) {
            const testState = this.getCurrentState();
            return testState.isPredefinedScale(scale);
        },

        getActivePredefinedScale() {
            const testState = this.getCurrentState();
            return testState.activePredefinedScale;
        },

        getTestState(testId) {
            if (!this._testStates.has(testId)) {
                this._testStates.set(testId, new TestState());
            }
            return this._testStates.get(testId);
        },

        getCurrentState() {
            if (!this._currentTestId) {
                throw new Error('No active test set. Call init() first.');
            }
            return this.getTestState(this._currentTestId);
        },

        resetSpecificTest(testId) {
            const state = this._testStates.get(testId);
            if (state) {
                this.destroyAllSelectorsInState(state);
                this._testStates.delete(testId);
                if (this._currentTestId === testId) {
                    this._currentTestId = null;
                }
            }
        },

        resetAllTests() {
            this._testStates.forEach(state => {
                this.destroyAllSelectorsInState(state);
            });
            this._testStates.clear();
            this._currentTestId = null;
        },

        destroyAllSelectorsInState(state) {
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
    };

    return ScaleSynchronizationManager;
});
