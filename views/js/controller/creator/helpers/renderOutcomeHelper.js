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

            let scaleValue = '';
            if (outcome.scale) {
                if (typeof outcome.scale === 'object' && outcome.scale.uri) {
                    scaleValue = outcome.scale.uri;
                } else if (typeof outcome.scale === 'string') {
                    scaleValue = outcome.scale;
                }
            }


            return {
                serial: outcome.serial,
                identifier: outcome.identifier,
                interpretation: outcome.interpretation,
                longInterpretation: outcome.longInterpretation,
                externalScored: externalScored,
                externalScoredDisabled: 1,
                scale: scaleValue,
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

        let editedOutcomeDeclaration = {};

        $editorPanel.find('.outcome-container').each(function() {
            const $outcomeContainer = $(this);
            const identifierValue = $outcomeContainer.find('input.identifier').val();
            const outcome = testModel.outcomeDeclarations.find(o => o.identifier === identifierValue);

            if (outcome) {
                const $scaleContainer = $outcomeContainer.find('.scales');
                const scaleSelector = scaleSelectorFactory($scaleContainer);

                scaleSelector.createForm(outcome.scale || '');

                scaleSelector.on('scale-change', function(selectedScale) {
                    outcome.scale = selectedScale;

                    const $minMaxInputs = $outcomeContainer.find('.minimum-maximum input');
                    $minMaxInputs.prop('disabled', !!selectedScale);
                });

                if (outcome.scale) {
                    $outcomeContainer.find('.minimum-maximum input').prop('disabled', true);
                }
            }
        });

        $editorPanel
            .on(`click${_ns}`, '.editable [data-role="edit"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $labelContainer = $outcomeContainer.find('.identifier-label');
                const $identifierInput = $labelContainer.find('.identifier');
                editedOutcomeDeclaration = testModel.outcomeDeclarations.find(
                    outcome => outcome.identifier === $outcomeContainer.find('input.identifier').val()
                );
                $outcomeContainer.addClass('editing');
                $outcomeContainer.removeClass('editable');

                const $scaleContainer = $outcomeContainer.find('.scales');
                const scaleSelector = scaleSelectorFactory($scaleContainer);
                scaleSelector.createForm(editedOutcomeDeclaration.scale || '');

                scaleSelector.on('scale-change', function(selected) {
                    editedOutcomeDeclaration.scale = selected || '';

                    const $minMaxInputs = $outcomeContainer.find('.minimum-maximum input');
                    $minMaxInputs.prop('disabled', !!selected);
                });

                if (editedOutcomeDeclaration.scale) {
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
                testModel.outcomeDeclarations = testModel.outcomeDeclarations.filter(
                    outcome => outcome.identifier !== $outcomeContainer.find('input.identifier').val()
                );
            })
            .on('blur increment.incrementer decrement.incrementer', 'input', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $input = $(this);

                editedOutcomeDeclaration = testModel.outcomeDeclarations.find(
                    outcome => outcome.serial === $outcomeContainer.data('serial')
                );
                if (editedOutcomeDeclaration) {
                    editedOutcomeDeclaration[$input.attr('name')] = $input.val().trim();
                } else {
                    console.error('Could not find outcome declaration with serial:', $outcomeContainer.data('serial'));
                }
            });
    }

    return {
        renderOutcomeDeclarationList
    };
});
