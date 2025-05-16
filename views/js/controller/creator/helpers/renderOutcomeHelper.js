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
     * Render the lists of the test outcomes into the outcome editor panel
     * @param {Object} testModel
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
                const $interpretationContainer = $outcomeContainer.find('.interpretation');

                const scaleSelector = scaleSelectorFactory($interpretationContainer);
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
        });

        $editorPanel
            .on(`click${_ns}`, '.editable [data-role="edit"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $labelContainer = $outcomeContainer.find('.identifier-label');
                const $identifierInput = $labelContainer.find('.identifier');

                const identifierValue = $outcomeContainer.find('input.identifier').val();
                const editedOutcomeDeclaration = testModel.outcomeDeclarations.find(
                    outcome => outcome.identifier === identifierValue
                );

                $outcomeContainer.addClass('editing');
                $outcomeContainer.removeClass('editable');

                const $interpretationContainer = $outcomeContainer.find('.interpretation');

                const scaleSelector = scaleSelectorFactory($interpretationContainer);

                let interpretationValue = '';
                if (editedOutcomeDeclaration.interpretation) {
                    interpretationValue = editedOutcomeDeclaration.interpretation;
                }
                scaleSelector.createForm(interpretationValue);

                scaleSelector.on('interpretation-change', function(interpretationValue) {
                    if (editedOutcomeDeclaration) {
                        editedOutcomeDeclaration.interpretation = interpretationValue || '';
                    }

                    const $minMaxInputs = $outcomeContainer.find('.minimum-maximum input');
                    $minMaxInputs.prop('disabled', !!interpretationValue);
                });

                if (editedOutcomeDeclaration && editedOutcomeDeclaration.interpretation) {
                    $outcomeContainer.find('.minimum-maximum input').prop('disabled', true);
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
