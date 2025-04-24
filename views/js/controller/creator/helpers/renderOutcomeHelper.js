define([
    'taoQtiTest/controller/creator/outcomeDeclaration/filter',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/listing',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement',
    'services/features',
    'i18n',
], function (
    outcomeDeclarationFilter,
    outcomeEditorListingTpl,
    formElement,
    features,
    __) {
    'use strict';

    /**
     * Render the lists of the test outcomes into the outcome editor panel
     * @param {Object} testModel
     * @param {JQuery} $editorPanel
     */
    function renderOutcomeDeclarationList(testModel, $editorPanel) {
        const filteredOutcomes = outcomeDeclarationFilter.filterManualOutcomeDeclarations(testModel);
        const outcomesData = _.map(filteredOutcomes, function (outcome) {
            const readOnlyRpVariables = _.uniq(_.reduce(testModel.responseProcessing, (variables, rp) => {
                const rpXml = rp.xml || '';
                const $rp = $(rpXml);
                $rp.find('variable, setOutcomeValue').each(function () {
                    const variableId = $(this).attr('identifier');
                    if (variableId && variableId !== 'SCORE') {
                        variables.push(variableId);
                    }
                });
                return variables;
            }, ['MAXSCORE']));
            const readonly = readOnlyRpVariables.indexOf(id) >= 0;
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
                titleEdit: readonly ? __('Cannot edit a variable currently used in response processing') : __('Edit'),
                readonly: readonly,
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
            .on('click', '.editable [data-role="edit"]', function () {
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
            .on('click', '.editing [data-role="edit"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                $outcomeContainer.removeClass('editing');
                $outcomeContainer.addClass('editable');
            })
            .on('click', '.deletable [data-role="delete"]', function (e) {
                e.preventDefault();
                const $outcomeContainer = $(this).closest('.outcome-container');
                $outcomeContainer.remove();
            })
            .on('blur', 'input', function () {
                const $input = $(this);
                editedOutcomeDeclaration[$input.attr('name')] = $input.val().trim();
            });
    }

    return {
        renderOutcomeDeclarationList
    };
});
