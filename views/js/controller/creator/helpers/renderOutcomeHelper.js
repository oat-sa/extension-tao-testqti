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

    /**
     * Find the first non-empty interpretation value from all outcomes
     * @param {Object} testModel - The test model
     * @returns {String} - First found interpretation value or empty string
     */
    function getGlobalInterpretationValue(testModel) {
        const outcomes = outcomeHelper.getNonReservedOutcomeDeclarations(testModel);

        for (const outcome of outcomes) {
            if (outcome.interpretation) {
                if (typeof outcome.interpretation === 'object' && outcome.interpretation.uri) {
                    return outcome.interpretation.uri;
                } else if (typeof outcome.interpretation === 'string') {
                    return outcome.interpretation;
                }
            }
        }

        return '';
    }

    /**
     * Update all outcomes in the model with the same interpretation value
     * @param {Object} testModel - The test model
     * @param {String} interpretationValue - The new interpretation value
     */
    function updateAllOutcomesInterpretation(testModel, interpretationValue) {
        const outcomes = outcomeHelper.getNonReservedOutcomeDeclarations(testModel);
        outcomes.forEach(outcome => {
            outcome.interpretation = interpretationValue || '';
        });
    }

    /**
     * Render the lists of the test outcomes into the outcome editor panel
     * @param {Object} testModel
     * @param $editorPanel
     */
    function renderOutcomeDeclarationList(testModel, $editorPanel) {
        const externalScoredOptions = {
            none: 'none',
            human: 'human',
            externalMachine: 'externalMachine'
        };

        const globalInterpretationValue = getGlobalInterpretationValue(testModel);

        if (globalInterpretationValue) {
            scaleSelectorFactory.setGlobalScale(globalInterpretationValue);
        }

        const outcomesData = _.map(outcomeHelper.getNonReservedOutcomeDeclarations(testModel), function (outcome) {
            const externalScored = {
                none: { label: __('None'), selected: !outcome.externalScored },
                human: { label: __('Human'), selected: outcome.externalScored === externalScoredOptions.human },
                externalMachine: {
                    label: __('External Machine'),
                    selected: outcome.externalScored === externalScoredOptions.externalMachine
                }
            };

            const interpretationValue = globalInterpretationValue;

            outcome.interpretation = interpretationValue;

            return {
                serial: outcome.serial,
                identifier: outcome.identifier,
                interpretation: interpretationValue,
                longInterpretation: outcome.longInterpretation,
                externalScored: externalScored,
                externalScoredDisabled: 1,
                normalMinimum: outcome.normalMinimum === false ? 0 : outcome.normalMinimum,
                normalMaximum: outcome.normalMaximum === false ? 0 : outcome.normalMaximum,
                scale: interpretationValue,
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
                const $interpretationContainer = $outcomeContainer.find('.interpretation');

                const scaleSelector = scaleSelectorFactory($interpretationContainer);
                scaleSelector.createForm(globalInterpretationValue);

                scaleSelector.on('interpretation-change', function(interpretationValue) {
                    updateAllOutcomesInterpretation(testModel, interpretationValue);

                    $editorPanel.find('.outcome-container .minimum-maximum input').prop('disabled', !!interpretationValue);
                });

                if (globalInterpretationValue) {
                    $outcomeContainer.find('.minimum-maximum input').prop('disabled', true);
                }
            }
        });

        scaleSelectorFactory.on('global-scale-change', function(newScaleValue) {
            updateAllOutcomesInterpretation(testModel, newScaleValue);

            $editorPanel.find('.outcome-container .minimum-maximum input').prop('disabled', !!newScaleValue);
        });

        $editorPanel
            .on(`click${_ns}`, '.editable [data-role="edit"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $identifierInput = $outcomeContainer.find('.identifier-label .identifier');

                $outcomeContainer.addClass('editing');
                $outcomeContainer.removeClass('editable');

                const $interpretationContainer = $outcomeContainer.find('.interpretation');

                const scaleSelector = scaleSelectorFactory($interpretationContainer);
                const currentGlobalValue = scaleSelectorFactory.getGlobalScale();
                scaleSelector.createForm(currentGlobalValue);

                scaleSelector.on('interpretation-change', function(interpretationValue) {
                    updateAllOutcomesInterpretation(testModel, interpretationValue);

                    $editorPanel.find('.outcome-container .minimum-maximum input').prop('disabled', !!interpretationValue);
                });

                if (currentGlobalValue) {
                    $editorPanel.find('.outcome-container .minimum-maximum input').prop('disabled', true);
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
                $outcomeContainer.addClass('hidden');

                const identifierValue = $outcomeContainer.find('input.identifier').val();
                testModel.outcomeDeclarations = testModel.outcomeDeclarations.filter(
                    outcome => outcome.identifier !== identifierValue
                );
            })
            .on('blur increment.incrementer decrement.incrementer', 'input', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $input = $(this);
                const serial = $outcomeContainer.data('serial');

                const editedOutcomeDeclaration = testModel.outcomeDeclarations.find(
                    outcome => outcome.serial === serial
                );

                if (editedOutcomeDeclaration) {
                    editedOutcomeDeclaration[$input.attr('name')] = $input.val().trim();
                } else {
                    console.error('Could not find outcome declaration with serial:', serial);
                }
            });
    }

    return {
        renderOutcomeDeclarationList
    };
});
