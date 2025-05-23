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

            const $minMaxInputs = $outcomeContainer.find('.minimum-maximum input');
            $minMaxInputs.prop('disabled', !!interpretationValue);
        });

        if (outcome.interpretation) {
            $outcomeContainer.find('.minimum-maximum input').prop('disabled', true);
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

            return {
                serial: outcome.serial,
                identifier: outcome.identifier,
                interpretation: interpretationValue,
                longInterpretation: outcome.longInterpretation,
                externalScored: externalScored,
                externalScoredDisabled: 1,
                normalMinimum: outcome.normalMinimum === false ? 0 : outcome.normalMinimum,
                normalMaximum: outcome.normalMaximum === false ? 0 : outcome.normalMaximum,
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

        $editorPanel.find('.outcome-container').each(function() {
            const $outcomeContainer = $(this);
            const identifierValue = $outcomeContainer.find('input.identifier').val();
            const outcome = testModel.outcomeDeclarations.find(o => o.identifier === identifierValue);

            if (outcome) {
                setupScaleSelector($outcomeContainer, outcome, testModel);
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
                    setupScaleSelector($outcomeContainer, editedOutcomeDeclaration, testModel);
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
            })
            .on('blur increment.incrementer decrement.incrementer', '.outcome-container input', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $input = $(this);
                const serial = $outcomeContainer.data('serial');

                if (!$outcomeContainer.length || !serial) {
                    return;
                }

                const editedOutcomeDeclaration = testModel.outcomeDeclarations.find(
                    outcome => outcome.serial === serial
                );

                if (editedOutcomeDeclaration) {
                    const inputName = $input.attr('name');
                    const inputValue = $input.val().trim();

                    if (inputName) {
                        editedOutcomeDeclaration[inputName] = inputValue;
                    }
                } else {
                    console.warn('Outcome declaration not found for container with serial:', serial);
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
