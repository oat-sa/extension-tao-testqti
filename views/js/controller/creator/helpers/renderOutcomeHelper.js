define([
    'jquery',
    'lodash',
    'i18n',
    'taoQtiTest/controller/creator/helpers/outcome',
    'tpl!taoQtiTest/controller/creator/templates/outcome-listing',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'taoQtiTest/controller/creator/helpers/scaleSelector',
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

    /**
     * Generate unique outcome ID for scale synchronization
     * @param {Object} outcome - Outcome declaration
     * @returns {string} Unique ID
     */
    function generateOutcomeId(outcome) {
        return `outcome_${outcome.serial || outcome.identifier || Math.random().toString(36).substr(2, 9)}`;
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

            $incrementerButtons.each(function() {
                const $button = $(this);

                $button.on('click.outcome-disabled mousedown.outcome-disabled', function(e) {
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

            $incrementerButtons.each(function() {
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
     * Create and setup scale selector for an outcome
     * @param {jQuery} $outcomeContainer - Container element
     * @param {Object} outcome - Outcome declaration
     */
    function setupScaleSelector($outcomeContainer, outcome) {
        const $interpretationContainer = $outcomeContainer.find('.interpretation');
        const outcomeId = generateOutcomeId(outcome);

        const existingSelector = scaleSelectors.get(outcomeId);
        if (existingSelector) {
            existingSelector.destroy();
        }

        const scaleSelector = scaleSelectorFactory($interpretationContainer, outcomeId);
        scaleSelectors.set(outcomeId, scaleSelector);

        scaleSelector.createForm(outcome.interpretation || '');

        scaleSelector.on('interpretation-change', function(interpretationValue) {
            outcome.interpretation = interpretationValue || '';

            const hasInterpretation = !!interpretationValue;

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

                // Set min/max to 0
                outcome.normalMinimum = 0;
                outcome.normalMaximum = 0;
                $outcomeContainer.find('input[name="normalMinimum"]').val('0');
                $outcomeContainer.find('input[name="normalMaximum"]').val('0');
            }
        });

        if (outcome.interpretation) {
            setMinMaxDisabled($outcomeContainer, true);
            updateExternalScored($outcomeContainer, true);
        }
    }

    /**
     * Render the lists of the test outcomes into the outcome editor panel
     * @param {Object} testModel
     * @param {jQuery} $editorPanel
     */
    function renderOutcomeDeclarationList(testModel, $editorPanel) {
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

            const externalScored = {
                none: { label: __('None'), selected: !outcome.externalScored },
                human: { label: __('Human'), selected: outcome.externalScored === externalScoredOptions.human },
                externalMachine: {
                    label: __('External Machine'),
                    selected: outcome.externalScored === externalScoredOptions.externalMachine
                }
            };

            let interpretationValue = '';
            if (outcome.interpretation) {
                if (typeof outcome.interpretation === 'object' && outcome.interpretation.uri) {
                    interpretationValue = outcome.interpretation.uri;
                } else if (typeof outcome.interpretation === 'string') {
                    interpretationValue = outcome.interpretation;
                }
            }

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
                serial: outcome.serial || outcome.identifier || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                identifier: outcome.identifier,
                interpretation: interpretationValue,
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
                outcomes: outcomesData
            })
        );

        formElement.initWidget($editorPanel);

        // Setup scale selectors and apply disabled states
        $editorPanel.find('.outcome-container').each(function() {
            const $outcomeContainer = $(this);
            const identifierValue = $outcomeContainer.find('input.identifier').val();
            const outcome = testModel.outcomeDeclarations.find(o => o.identifier === identifierValue);

            if (outcome) {
                if (outcome.normalMinimum === undefined || outcome.normalMinimum === null || outcome.normalMinimum === '') {
                    outcome.normalMinimum = 0;
                    $outcomeContainer.find('input[name="normalMinimum"]').val('0');
                }
                if (outcome.normalMaximum === undefined || outcome.normalMaximum === null || outcome.normalMaximum === '') {
                    outcome.normalMaximum = 0;
                    $outcomeContainer.find('input[name="normalMaximum"]').val('0');
                }

                setupScaleSelector($outcomeContainer, outcome);

                if (outcome.interpretation) {
                    setMinMaxDisabled($outcomeContainer, true);
                }
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
                    setupScaleSelector($outcomeContainer, editedOutcomeDeclaration);
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
                    const outcomeId = generateOutcomeId(outcome);
                    const selector = scaleSelectors.get(outcomeId);
                    if (selector) {
                        selector.destroy();
                        scaleSelectors.delete(outcomeId);
                    }
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
                    }
                } else {
                    console.warn('Outcome declaration not found for container:', {
                        serial: serial,
                        identifier: $outcomeContainer.find('input.identifier').val()
                    });
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
        scaleSelectors.forEach(selector => {
            selector.destroy();
        });
        scaleSelectors.clear();
    }

    return {
        renderOutcomeDeclarationList,
        cleanup
    };
});
