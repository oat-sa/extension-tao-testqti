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
            const id = outcome.identifier || outcome.id; // Adjusted to handle different structures
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
                identifier: id,
                hidden: (id === 'SCORE' || id === 'MAXSCORE') && !features.isVisible('taoQtiItem/creator/interaction/response/outcomeDeclarations/scoreMaxScore'),
                interpretation: outcome.attr && outcome.attr('interpretation'),
                longInterpretation: outcome.attr && outcome.attr('longInterpretation'),
                externalScored: externalScored,
                normalMinimum: outcome.attr && outcome.attr('normalMinimum') !== undefined ? outcome.attr('normalMinimum') : 0,
                normalMaximum: outcome.attr && outcome.attr('normalMaximum') !== undefined ? outcome.attr('normalMaximum') : 0,
                titleDelete: readonly
                    ? __('Cannot delete a variable currently used in response processing')
                    : __('Delete'),
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

        formElement.initWidget($editorPanel);

        $editorPanel
            .on('click', '.editable [data-role="edit"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                const $labelContainer = $outcomeContainer.find('.identifier-label');
                const $identifierInput = $labelContainer.find('.identifier');

                $outcomeContainer.addClass('editing');
                $outcomeContainer.removeClass('editable');

                $identifierInput.focus();
            })
            .on('click', '.editing [data-role="edit"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                $outcomeContainer.removeClass('editing');
                $outcomeContainer.addClass('editable');
                formElement.removeChangeCallback($outcomeContainer);
            })
            .on('click', '.deletable [data-role="delete"]', function () {
                const $outcomeContainer = $(this).closest('.outcome-container');
                $outcomeContainer.remove();
                testModel.outcomeDeclarations = testModel.outcomeDeclarations.filter(
                    outcome => outcome.identifier !== $outcomeContainer.find('.identifier').val()
                );
            });
    }

    return {
        renderOutcomeDeclarationList
    };
});