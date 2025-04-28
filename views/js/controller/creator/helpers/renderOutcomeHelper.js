define([
    'taoQtiTest/controller/creator/helpers/outcome',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/listing',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'services/features',
    'i18n',
], function (
    outcomeHelper,
    outcomeEditorListingTpl,
    formElement,
    features,
    __) {
    'use strict';
    const _ns = '.outcome-container';

    /**
     * Render the lists of the test outcomes into the outcome editor panel
     * @param {Object} testModel
     */
    function renderOutcomeDeclarationList(testModel, $editorPanel) {
        const outcomesData = _.map(outcomeHelper.getNonReservedOutcomeDeclarations(testModel), function (outcome) {
            let externalScoredDisabled = outcome.attr && outcome.attr('externalScoredDisabled');
            const externalScored = {
                human: { label: __('Human'), selected: true },
                externalMachine: {
                    label: __('External Machine'),
                    selected: outcome.attr && outcome.attr('externalScored') === outcome.externalScoredOptions.externalMachine
                }
            };

            return {
                serial: outcome.serial,
                identifier: outcome.identifier,
                interpretation: outcome.interpretation,
                longInterpretation: outcome.longInterpretation,
                externalScored: externalScored,
                normalMinimum: outcome.normalMinimum === false ? 0 : outcome.normalMinimum,
                normalMaximum: outcome.normalMaximum === false ? 0 : outcome.normalMaximum,
                titleDelete: __('Delete'),
                titleEdit: __('Edit'),
                externalScoredDisabled: externalScoredDisabled || 0
            };
        });

        $editorPanel.find('.outcome-declarations-manual').html(
            outcomeEditorListingTpl({
                outcomes: outcomesData
            })
        );

        let editedOutcomeDeclaration = {};
        formElement.initWidget($editorPanel);

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
                const $input = $(this);
                editedOutcomeDeclaration[$input.attr('name')] = $input.val().trim();
            });
    }

    return {
        renderOutcomeDeclarationList
    };
});
