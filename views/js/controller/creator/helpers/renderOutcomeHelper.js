define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/helpers/outcome',
    'tpl!taoQtiTest/controller/creator/templates/outcome-listing',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiItem/qtiCreator/helper/scaleSelector',
    'services/features'
], function (
    $,
    _,
    __,
    outcomeHelper,
    outcomeListingTpl,
    formElement,
    scaleSelectorFactory) {
    'use strict';
    const _ns = '.outcome-container';

    const scaleSelectors = new Map();
    let selectorIdCounter = 0;

    /**
     * Generate unique selector ID (not tied to outcome properties that might change)
     * @returns {string} Unique selector ID
     */
    function generateSelectorId() {
        return `selector_${++selectorIdCounter}_${Date.now()}`;
    }

    /**
     * Generate stable outcome identifier for tracking duplicates
     * @param {Object} outcome - Outcome declaration
     * @returns {string} Stable identifier
     */
    function getStableOutcomeId(outcome) {
        if (outcome.serial) {
            return outcome.serial;
        }
        if (outcome.identifier) {
            return outcome.identifier;
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

        return `temp_new_${Date.now()}`;
    }

    /**
     * Disable/enable min/max controls including incrementer buttons
     * @param {jQuery} $outcomeContainer - Container element
     * @param {boolean} disabled - Whether to disable the controls
     */
    function setMinMaxDisabled($outcomeContainer, disabled) {
        const $minMaxContainer = $outcomeContainer.find('.minimum-maximum');
        const $inputs = $minMaxContainer.find('input[name="normalMinimum"], input[name="normalMaximum"]');
        const $incrementerWrappers = $minMaxContainer.find('.incrementer-ctrl-wrapper');
        const $incrementerControls = $minMaxContainer.find('.ctrl.incrementer-ctrl');
        const $incrementerButtons = $minMaxContainer.find('.incrementer-ctrl a.inc, .incrementer-ctrl a.dec');

        $inputs.prop('disabled', disabled);

        if (disabled) {
            $inputs.addClass('disabled');
            $incrementerWrappers.addClass('disabled');
            $incrementerControls.addClass('disabled');

            $incrementerButtons.each(function () {
                const $button = $(this);

                $button.on('click.outcome-disabled mousedown.outcome-disabled', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    return false;
                });

                $button.css({
                    'pointer-events': 'none',
                    'opacity': '0.4',
                    'cursor': 'not-allowed'
                });

                $button.attr({
                    'aria-disabled': 'true'
                });
            });

            $minMaxContainer.addClass('incrementer-disabled');
        } else {
            $inputs.removeClass('disabled');
            $incrementerWrappers.removeClass('disabled');
            $incrementerControls.removeClass('disabled');
            $minMaxContainer.removeClass('incrementer-disabled');

            $incrementerButtons.each(function () {
                const $button = $(this);

                $button.off('.outcome-disabled');

                $button.css({
                    'pointer-events': '',
                    'opacity': '',
                    'cursor': ''
                });

                $button.removeAttr('aria-disabled');
            });
        }
    }

    /**
     * Set external scored to human and disable it when interpretation is set
     * @param {jQuery} $outcomeContainer - Container element
     * @param {boolean} hasInterpretation - Whether interpretation is set
     */
    function updateExternalScored($outcomeContainer, hasInterpretation) {
        const $externalScoredSelect = $outcomeContainer.find('select[name="externalScored"]');

        if (hasInterpretation) {
            $externalScoredSelect.val('human');
            $externalScoredSelect.prop('disabled', true);

            if ($externalScoredSelect.data('select2')) {
                $externalScoredSelect.select2('val', 'human');
                $externalScoredSelect.select2('enable', false);
            }

            $externalScoredSelect.trigger('change');
        } else {
            $externalScoredSelect.prop('disabled', false);

            if ($externalScoredSelect.data('select2')) {
                $externalScoredSelect.select2('enable', true);
            }
        }
    }

    /**
     * Find existing selector for an outcome to prevent duplicates
     * @param {Object} outcome - Outcome declaration
     * @returns {Object|null} Existing selector info or null
     */
    function findExistingSelectorForOutcome(outcome) {
        const stableId = getStableOutcomeId(outcome);

        for (const [selectorId, selectorInfo] of scaleSelectors.entries()) {
            if (selectorInfo.outcomeStableId === stableId) {
                return {selectorId, selectorInfo};
            }
        }

        return null;
    }

    /**
     * Read the value of the longInterpretation input for an outcome container
     * @param {jQuery} $outcomeContainer
     * @returns {string|null} string value or null when not present/empty
     */
    function getLongInterpretationValue($outcomeContainer) {
        if (!$outcomeContainer || !$outcomeContainer.length) {
            return null;
        }

        const $input = $outcomeContainer.find('.longinterpretation').find('input');
        if (!$input.length) {
            return null;
        }

        const val = $input.val();
        if (typeof val === 'undefined' || val === null || val === '') {
            return null;
        }

        return String(val);
    }

    /**
     * Resolve a scale entry either by manifest key or by the scale URI
     * @param {Object} scales - Map/object of available scales
     * @param {string} lookupValue - key or URI to resolve
     * @returns {{key: (string|null), scale: (Object|null)}} resolved scale data
     */
    function resolveScaleData(scales, lookupValue) {
        if (!lookupValue || !scales || typeof scales !== 'object') {
            return {key: null, scale: null};
        }

        if (Object.prototype.hasOwnProperty.call(scales, lookupValue)) {
            const scaleData = scales[lookupValue];
            return {
                key: lookupValue,
                scale: (scaleData && scaleData.scale) ? scaleData.scale : null
            };
        }

        for (const candidateKey in scales) {
            if (!Object.prototype.hasOwnProperty.call(scales, candidateKey)) {
                continue;
            }
            const scaleData = scales[candidateKey];
            if (scaleData && scaleData.scale && scaleData.scale.uri === lookupValue) {
                return {
                    key: candidateKey,
                    scale: scaleData.scale
                };
            }
        }

        return {key: null, scale: null};
    }

    /**
     * Create and setup scale selector for an outcome
     * @param {jQuery} $outcomeContainer - Container element for the outcome UI
     * @param {Object} outcome - Outcome declaration object (may be temporary for new outcomes)
     * @param {Object} scales - Map/object of available scales keyed by filename or id
     * @param {Array.<Object>=} scalePresets - Optional array of predefined scale presets (objects with {uri, label}) to populate the selector
     */
    function setupScaleSelector($outcomeContainer, outcome, scales, scalePresets) {
        const stableOutcomeId = getStableOutcomeId(outcome);

        // Hide the Long Interpretation field
        $outcomeContainer.find('.longinterpretation').hide();

        // If presets are provided, ensure the selector factory knows them so Select2 can be populated
        try {
            if (Array.isArray(scalePresets) && scalePresets.length && typeof scaleSelectorFactory.setPresets === 'function') {
                scaleSelectorFactory.setPresets(scalePresets);
            }
        } catch (err) {
            console.warn('setupScaleSelector: failed to set presets on scaleSelectorFactory', err);
        }

        // Find the scale-selector container (which has the input[name="scale"])
        const $scaleSelectorContainer = $outcomeContainer.find('.scale-selector');

        // Show the scale-selector panel (it's hidden by default in the template)
        $scaleSelectorContainer.removeClass('hidden');

        // Initialize form widgets in the scale-selector container (ensures select2/init hooks are applied)
        formElement.initWidget($scaleSelectorContainer);

        // Find and show the rubric panel
        const $rubricContainer = $outcomeContainer.find('.rubric');
        $rubricContainer.removeClass('hidden');

        // Initialize rubric input with existing value if any and keep outcome.rubric in sync
        const $rubricInput = $rubricContainer.find('input[name="rubric"]');
        if (outcome.rubric) {
            $rubricInput.val(outcome.rubric);
        }

        // Update the outcome model when rubric input changes and emit updated scale JSON
        $rubricInput.off('.rubric').on('input.rubric', _.debounce(function () {
            outcome.rubric = $(this).val();
            emitScaleJsonUpdate();
        }, 200));

        const existing = findExistingSelectorForOutcome(outcome);
        if (existing) {
            if (existing.selectorInfo.selector && typeof existing.selectorInfo.selector.destroy === 'function') {
                try {
                    existing.selectorInfo.selector.destroy();
                } catch (error) {
                    console.warn('Error destroying existing selector:', error);
                }
            }
            scaleSelectors.delete(existing.selectorId);
        }

        const selectorId = generateSelectorId();

        // Create scale selector using the scale-selector container (which has the input[name="scale"])
        // The scaleSelectorFactory will transform the input into a Select2 dropdown
        const scaleSelector = scaleSelectorFactory($scaleSelectorContainer, selectorId);

        scaleSelectors.set(selectorId, {
            selector: scaleSelector,
            outcomeStableId: stableOutcomeId,
            outcome: outcome,
            container: $outcomeContainer
        });

        const syncManager = scaleSelectorFactory.__getSyncManager ? scaleSelectorFactory.__getSyncManager() : null;
        if (syncManager && typeof syncManager.registerSelector === 'function') {
            try {
                syncManager.registerSelector(selectorId, scaleSelector, outcome);
            } catch (error) {
                if (typeof syncManager.registerSelector === 'function') {
                    syncManager.registerSelector(selectorId, scaleSelector);
                }
            }
        }

        // read longInterpretation using helper (this is a filename/key)
        const longInterpVal = getLongInterpretationValue($outcomeContainer);

        // Find exact match in provided `scales` (object keyed by filename/id).
        // scales entries should have format: { scale: { uri, label, values }, rubric }
        let matchedScale = null;
        let matchedKey = null;
        if (longInterpVal) {
            const resolved = resolveScaleData(scales, longInterpVal);
            matchedScale = resolved.scale;
            matchedKey = resolved.key;
        }

        if (!matchedScale && outcome.scale) {
            const resolved = resolveScaleData(scales, outcome.scale);
            matchedScale = resolved.scale;
            matchedKey = resolved.key;
        }

        const initialScaleUri = outcome.scale || (matchedScale && matchedScale.uri) || '';

        // Determine filename to use for this scale JSON: prefer longInterpretation value, otherwise build one
        const filenameBase = outcome.identifier || outcome.serial || `outcome_${Date.now()}`;
        let scaleFilename = longInterpVal || `scales/${filenameBase}_scale.json`;
        // if longInterpretation not set, store generated filename into hidden input so model persists
        if (!longInterpVal) {
            const $longInput = $outcomeContainer.find('.longinterpretation').find('input');
            if ($longInput.length) {
                $longInput.val(scaleFilename);
                outcome.longInterpretation = scaleFilename;
            }
        }

        // helper to emit scale JSON content based on matchedScale and rubric input
        function emitScaleJsonUpdate() {
            const rubricVal = $rubricInput.val() || '';

            let content;
            if (matchedScale && typeof matchedScale === 'object') {
                // matchedScale is the scale object itself, create full structure
                content = {
                    scale: _.cloneDeep(matchedScale),
                    rubric: rubricVal
                };
            } else {
                // create minimal structure if no matchedScale
                content = {
                    scale: {
                        uri: outcome.longInterpretation || '',
                        values: {}
                    },
                    rubric: rubricVal
                };
            }

            // Ensure the scale has a URI
            if (!content.scale.uri) {
                const scaleUri = outcome.longInterpretation || matchedKey || null;
                if (scaleUri) {
                    content.scale.uri = scaleUri;
                }
            }

            $outcomeContainer.trigger('scale-json-changed', {
                filename: scaleFilename,
                content: content,
                outcome: outcome
            });
        }

        // matchedScale is now either the scale object for the exact key, or null

        // If needed later: exact lookup in scales can use this value

        scaleSelector.createForm(initialScaleUri || '');


        // Force update of available scales to ensure Select2 is populated (covers timing/init races)
        try {
            const locked = syncManager && typeof syncManager.getActivePredefinedScale === 'function' ? syncManager.getActivePredefinedScale() : null;
            if (typeof scaleSelector.updateAvailableScales === 'function') {
                scaleSelector.updateAvailableScales(locked);
            }
        } catch (err) {
            console.warn('setupScaleSelector: failed to force updateAvailableScales', err);
        }

        // Verify select2 got initialized on the underlying element; if not, attempt a forced update
        try {
            const $selectEl = $scaleSelectorContainer.find('[name="scale"], [name="interpretation"]');
            const hasSelect2 = $selectEl.length && !!$selectEl.data('select2');
            if (!hasSelect2) {
                console.warn('setupScaleSelector: Select2 not initialized on scale field, forcing update');
                if (syncManager && typeof scaleSelector.updateAvailableScales === 'function') {
                    // attempt to populate options using current lock state
                    scaleSelector.updateAvailableScales(syncManager.getActivePredefinedScale && syncManager.getActivePredefinedScale());
                }
            }
        } catch (err) {
            console.warn('setupScaleSelector: error verifying Select2 initialization', err);
        }

        // emit initial content so consumers can persist/create the scale file if needed
        emitScaleJsonUpdate();

        // If we have a matched scale (found from longInterpretation key), load its URI into the selector and rubric
        if (matchedScale && matchedKey) {
            try {
                // Set the UI selection to the matched URI from the scale object
                const matchedUri = matchedScale.uri || longInterpVal;
                if (typeof scaleSelector.updateFormState === 'function') {
                    scaleSelector.updateFormState(matchedUri);
                }

                // Set outcome.scale to the matched scale URI (similar to how rubric is set below)
                outcome.scale = matchedUri || '';
            } catch (err) {
                console.warn('Failed to initialize scale selector state with matched key:', err);
            }

            // Populate rubric input from the parent scale data (scales[matchedKey].rubric)
            try {
                const scaleData = scales[matchedKey];
                const rubricVal = (scaleData && scaleData.rubric) ? scaleData.rubric : '';
                $rubricInput.val(rubricVal);
                outcome.rubric = rubricVal;
            } catch (err) {
                console.warn('Failed to populate rubric from matched scale:', err);
            }
        }

        // interpretation-change gives the selected URI (or raw string)
        scaleSelector.on('scale-change', function (scaleUri) {
            const oldOutcome = Object.assign({}, outcome);

            outcome.scale = scaleUri || '';

            const resolvedAfterChange = resolveScaleData(scales, scaleUri);
            matchedKey = resolvedAfterChange.key;
            matchedScale = resolvedAfterChange.scale;

            // If we found a filename key for the selected URI, persist it into the longInterpretation hidden input
            try {
                if (matchedKey) {
                    const $longInput = $outcomeContainer.find('.longinterpretation').find('input');
                    if ($longInput.length) {
                        $longInput.val(matchedKey);
                    }
                    scaleFilename = matchedKey;
                    outcome.longInterpretation = matchedKey;
                }
            } catch (err) {
                console.warn('Failed to persist matched longInterpretation key:', err);
            }

            // If a matched scale was found for this interpretation, update the rubric input to match
            if (matchedScale && matchedKey) {
                try {
                    const scaleData = scales[matchedKey];
                    const rubricVal = (scaleData && scaleData.rubric) ? scaleData.rubric : '';
                    $rubricInput.val(rubricVal);
                    outcome.rubric = rubricVal;
                } catch (err) {
                    console.warn('Failed to apply matched scale rubric:', err);
                }
            }

            // emit updated scale json when user changes selection
            emitScaleJsonUpdate();

            const hasInterpretation = !!scaleUri;

            setMinMaxDisabled($outcomeContainer, hasInterpretation);
            updateExternalScored($outcomeContainer, hasInterpretation);

            if (hasInterpretation) {
                outcome.externalScored = 'human';
                outcome.normalMinimum = false;
                outcome.normalMaximum = false;
                $outcomeContainer.find('input[name="normalMinimum"]').val('');
                $outcomeContainer.find('input[name="normalMaximum"]').val('');
            } else {
                delete outcome.externalScored;
                const $externalScoredSelect = $outcomeContainer.find('select[name="externalScored"]');
                $externalScoredSelect.val('none');
                $externalScoredSelect.trigger('change');
                if ($externalScoredSelect.data('select2')) {
                    $externalScoredSelect.select2('val', 'none');
                }

                outcome.normalMinimum = 0;
                outcome.normalMaximum = 0;
                $outcomeContainer.find('input[name="normalMinimum"]').val('0');
                $outcomeContainer.find('input[name="normalMaximum"]').val('0');
            }

            const newStableId = getStableOutcomeId(outcome);
            const selectorInfo = scaleSelectors.get(selectorId);
            if (selectorInfo && selectorInfo.outcomeStableId !== newStableId) {
                selectorInfo.outcomeStableId = newStableId;

                if (syncManager && typeof syncManager.updateSelectorRegistration === 'function') {
                    syncManager.updateSelectorRegistration(selectorId, oldOutcome, outcome);
                }
            }
        });

        if (outcome.interpretation) {
            setMinMaxDisabled($outcomeContainer, true);
            updateExternalScored($outcomeContainer, true);
        }
    }

    /**
     * Clean up selector by ID
     * @param {string} selectorId - Selector ID to clean up
     */
    function cleanupSelector(selectorId) {
        const selectorInfo = scaleSelectors.get(selectorId);
        if (selectorInfo) {
            const {selector, outcome} = selectorInfo;

            const syncManager = scaleSelectorFactory.__getSyncManager ? scaleSelectorFactory.__getSyncManager() : null;
            if (syncManager && typeof syncManager.unregisterSelector === 'function') {
                try {
                    syncManager.unregisterSelector(selectorId, outcome);
                } catch (error) {
                    if (typeof syncManager.unregisterSelector === 'function') {
                        syncManager.unregisterSelector(selectorId);
                    }
                }
            }

            if (selector && typeof selector.destroy === 'function') {
                try {
                    selector.destroy();
                } catch (error) {
                    console.warn('Error destroying selector:', error);
                }
            }

            scaleSelectors.delete(selectorId);
        }
    }

    /**
     * Clean up selector for a specific outcome
     * @param {Object} outcome - Outcome declaration
     */
    function cleanupSelectorsForOutcome(outcome) {
        const stableId = getStableOutcomeId(outcome);
        const selectorsToCleanup = [];

        for (const [selectorId, selectorInfo] of scaleSelectors.entries()) {
            if (selectorInfo.outcomeStableId === stableId) {
                selectorsToCleanup.push(selectorId);
            }
        }

        selectorsToCleanup.forEach(selectorId => {
            cleanupSelector(selectorId);
        });
    }

    /**
     * Render the lists of the test outcomes into the outcome editor panel
     * @param {Object} testModel
     * @param {jQuery} $editorPanel
     */
    function renderOutcomeDeclarationList(testModel, $editorPanel) {

        // Check if remote scale feature is enabled: either presets are provided or testScales has entries
        // Accept both 'scalePresets' and an alternate 'scalesPresets' coming from backend (typo/legacy)
        const suppliedPresets = (testModel && Array.isArray(testModel.scalePresets) && testModel.scalePresets.length > 0)
            ? testModel.scalePresets
            : (testModel && Array.isArray(testModel.scalesPresets) && testModel.scalesPresets.length > 0 ? testModel.scalesPresets : null);
        const hasPresets = !!(suppliedPresets && suppliedPresets.length);
        const hasTestScales = testModel && testModel.testScales && typeof testModel.testScales === 'object' && Object.keys(testModel.testScales).length > 0;

        // Determine the label to use for the interpretation field: when scale presets or test scales are present, use 'Label'
        const interpretationLabel = (hasPresets || hasTestScales) ? __('Label') : __('Interpretation');

        // Ensure the scale selector factory has presets for this test so selectors can initialize options immediately.
        if (hasPresets) {
            try {
                if (typeof scaleSelectorFactory.setPresets === 'function') {
                    scaleSelectorFactory.setPresets(suppliedPresets);
                }
            } catch (err) {
                console.warn('renderOutcomeDeclarationList: failed to set scale presets on factory', err);
            }
        }
        const externalScoredOptions = {
            none: 'none',
            human: 'human',
            externalMachine: 'externalMachine'
        };

        const outcomesData = _.map(outcomeHelper.getNonReservedOutcomeDeclarations(testModel), function (outcome) {
            if (outcome.normalMinimum === undefined || outcome.normalMinimum === null) {
                outcome.normalMinimum = 0;
            }
            if (outcome.normalMaximum === undefined || outcome.normalMaximum === null) {
                outcome.normalMaximum = 0;
            }

            if (outcome.interpretation && !outcome.externalScored) {
                outcome.externalScored = 'human';
            }

            if (!outcome.serial) {
                outcome.serial = getStableOutcomeId(outcome);
            }

            const serial = outcome.serial;

            const externalScored = {
                none: {label: __('None'), selected: !outcome.externalScored},
                human: {label: __('Human'), selected: outcome.externalScored === externalScoredOptions.human},
                externalMachine: {
                    label: __('External Machine'),
                    selected: outcome.externalScored === externalScoredOptions.externalMachine
                }
            };


            let normalMinimum, normalMaximum;

            if (outcome.interpretation) {
                normalMinimum = false;
                normalMaximum = false;
            } else {
                if (outcome.normalMinimum === false || outcome.normalMinimum === null || outcome.normalMinimum === undefined || outcome.normalMinimum === '') {
                    normalMinimum = 0;
                    outcome.normalMinimum = 0;
                } else {
                    normalMinimum = outcome.normalMinimum;
                }

                if (outcome.normalMaximum === false || outcome.normalMaximum === null || outcome.normalMaximum === undefined || outcome.normalMaximum === '') {
                    normalMaximum = 0;
                    outcome.normalMaximum = 0;
                } else {
                    normalMaximum = outcome.normalMaximum;
                }
            }

            return {
                serial: serial,
                identifier: outcome.identifier,
                interpretation: outcome.interpretation,
                longInterpretation: outcome.longInterpretation,
                externalScored: externalScored,
                externalScoredDisabled: outcome.interpretation ? 1 : (outcomeHelper.shouldDisableExternalScored(testModel, outcome.identifier) ? 1 : 0),
                normalMinimum: normalMinimum,
                normalMaximum: normalMaximum,
                titleDelete: __('Delete'),
                titleEdit: __('Edit')
            };
        });

        $editorPanel.find('.outcome-declarations-manual').html(
            outcomeListingTpl({
                outcomes: outcomesData,
                interpretationLabel: interpretationLabel
            })
        );

        formElement.initWidget($editorPanel);

        // Update the interpretation label text per rendered outcome container so it's visible immediately
        // Use the computed interpretationLabel (either 'Label' when scales exist or 'Interpretation')
        try {
            $editorPanel.find('.outcome-container').each(function () {
                const $oc = $(this);
                const $label = $oc.find('.interpretation').find('label');
                if ($label.length) {
                    $label.text(interpretationLabel);
                }
            });
        } catch (err) {
            console.warn('renderOutcomeDeclarationList: failed to update interpretation label in DOM', err);
        }

        $editorPanel.find('.outcome-container').each(function () {
            const $outcomeContainer = $(this);
            // Try to find the outcome declaration by identifier first, then by serial (data attribute).
            const identifierValue = $outcomeContainer.find('input.identifier').val();
            let outcome = null;

            if (identifierValue) {
                outcome = testModel.outcomeDeclarations.find(o => o.identifier === identifierValue);
            }

            // If not found by identifier, try matching by serial stored on the container (used for newly created outcomes)
            if (!outcome) {
                const serial = $outcomeContainer.data('serial');
                if (serial) {
                    outcome = testModel.outcomeDeclarations.find(o => o.serial === serial);
                }
            }

            // If still not found, create a lightweight temporary outcome object so the selector can initialize
            if (!outcome) {
                const serialFallback = $outcomeContainer.data('serial') || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                outcome = {
                    serial: serialFallback,
                    identifier: identifierValue || undefined,
                    normalMinimum: 0,
                    normalMaximum: 0
                };
            } else {
                if (outcome.normalMinimum === undefined || outcome.normalMinimum === null || outcome.normalMinimum === '') {
                    outcome.normalMinimum = 0;
                    $outcomeContainer.find('input[name="normalMinimum"]').val('0');
                }
                if (outcome.normalMaximum === undefined || outcome.normalMaximum === null || outcome.normalMaximum === '') {
                    outcome.normalMaximum = 0;
                    $outcomeContainer.find('input[name="normalMaximum"]').val('0');
                }
            }

            // Always initialize the scale selector so it is visible for new tests; setupScaleSelector is defensive
            setupScaleSelector($outcomeContainer, outcome, testModel.testScales, suppliedPresets);

            if (outcome.interpretation) {
                setMinMaxDisabled($outcomeContainer, true);
            }
        });

        $editorPanel.off(_ns);

        $editorPanel
            .on(`click${_ns}`, '.editable [data-role="edit"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $identifierInput = $outcomeContainer.find('.identifier');

                const identifierValue = $outcomeContainer.find('input.identifier').val();
                const editedOutcomeDeclaration = testModel.outcomeDeclarations.find(
                    outcome => outcome.identifier === identifierValue
                );

                $outcomeContainer.addClass('editing');
                $outcomeContainer.removeClass('editable');

                if (editedOutcomeDeclaration) {
                    setupScaleSelector($outcomeContainer, editedOutcomeDeclaration, testModel.testScales, suppliedPresets);
                }

                $identifierInput.focus();
            })
            .on(`click${_ns}`, '.editing [data-role="edit"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                $outcomeContainer.removeClass('editing');
                $outcomeContainer.addClass('editable');
            })
            .on(`click${_ns}`, '.deletable [data-role="delete"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const identifierValue = $outcomeContainer.find('input.identifier').val();
                const outcome = testModel.outcomeDeclarations.find(o => o.identifier === identifierValue);

                if (outcome) {
                    cleanupSelectorsForOutcome(outcome);
                }

                $outcomeContainer.addClass('hidden');
                testModel.outcomeDeclarations = testModel.outcomeDeclarations.filter(
                    outcome => outcome.identifier !== identifierValue
                );

                renderOutcomeDeclarationList(testModel, $editorPanel);
            })
            .on('blur increment.incrementer decrement.incrementer', '.outcome-container input', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $input = $(this);
                const serial = $outcomeContainer.data('serial');
                const inputName = $input.attr('name');

                if (!$outcomeContainer.length || !inputName) {
                    return;
                }

                let editedOutcomeDeclaration;

                if (serial) {
                    editedOutcomeDeclaration = testModel.outcomeDeclarations.find(
                        outcome => outcome.serial === serial
                    );
                }

                if (!editedOutcomeDeclaration) {
                    const identifierValue = $outcomeContainer.find('input.identifier').val();
                    if (identifierValue) {
                        editedOutcomeDeclaration = testModel.outcomeDeclarations.find(
                            outcome => outcome.identifier === identifierValue
                        );
                    }
                }

                if (editedOutcomeDeclaration) {
                    const inputValue = $input.val().trim();
                    const oldOutcome = Object.assign({}, editedOutcomeDeclaration);

                    if (inputName === 'normalMinimum' || inputName === 'normalMaximum') {
                        if (editedOutcomeDeclaration.interpretation) {
                            $input.val('');
                            editedOutcomeDeclaration[inputName] = false;
                            return;
                        }

                        if (inputValue === '') {
                            editedOutcomeDeclaration[inputName] = 0;
                            $input.val('0');
                        } else {
                            const numValue = parseFloat(inputValue);
                            editedOutcomeDeclaration[inputName] = isNaN(numValue) ? 0 : numValue;
                            if (!isNaN(numValue)) {
                                $input.val(numValue);
                            }
                        }
                    } else {
                        editedOutcomeDeclaration[inputName] = inputValue;

                        if (inputName === 'identifier' && oldOutcome.identifier !== inputValue) {
                            const oldStableId = getStableOutcomeId(oldOutcome);
                            for (const [selectorId, selectorInfo] of scaleSelectors.entries()) {
                                if (selectorInfo.outcomeStableId === oldStableId) {
                                    selectorInfo.outcomeStableId = getStableOutcomeId(editedOutcomeDeclaration);
                                    selectorInfo.outcome = editedOutcomeDeclaration;

                                    const syncManager = scaleSelectorFactory.__getSyncManager ? scaleSelectorFactory.__getSyncManager() : null;
                                    if (syncManager && typeof syncManager.updateSelectorRegistration === 'function') {
                                        syncManager.updateSelectorRegistration(selectorId, oldOutcome, editedOutcomeDeclaration);
                                    }
                                }
                            }
                        }
                    }
                }
            })
            .on('change', '.outcome-container select[name="externalScored"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $select = $(this);
                const identifierValue = $outcomeContainer.find('input.identifier').val();
                const selectedValue = $select.val();

                const outcome = testModel.outcomeDeclarations.find(o => o.identifier === identifierValue);
                if (outcome) {
                    if (outcome.interpretation) {
                        $select.val('human');
                        return;
                    }

                    if (selectedValue === 'none') {
                        delete outcome.externalScored;
                    } else {
                        outcome.externalScored = selectedValue;
                    }

                    outcomeHelper.updateExternalScoredDisabled(testModel);
                }
            });
    }

    /**
     * Cleanup all scale selectors
     */
    function cleanup() {
        scaleSelectors.forEach((selectorInfo, selectorId) => {
            cleanupSelector(selectorId);
        });
        scaleSelectors.clear();

        const syncManager = scaleSelectorFactory.__getSyncManager ? scaleSelectorFactory.__getSyncManager() : null;
        if (syncManager && typeof syncManager.cleanupOrphanedSelectors === 'function') {
            syncManager.cleanupOrphanedSelectors();
        }
    }

    return {
        renderOutcomeDeclarationList,
        cleanup,
    };
});
