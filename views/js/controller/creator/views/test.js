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
 * Copyright (c) 2014-2024 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'context',
    'ui/hider',
    'ui/feedback',
    'services/features',
    'taoQtiTest/controller/creator/config/defaults',
    'taoQtiTest/controller/creator/views/actions',
    'taoQtiTest/controller/creator/views/testpart',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'taoQtiTest/controller/creator/helpers/translation',
    'taoQtiTest/controller/creator/helpers/featureVisibility',
    'taoQtiTest/controller/creator/helpers/baseType',
    'taoQtiTest/controller/creator/helpers/outcome',
    'tpl!taoQtiItem/qtiCreator/tpl/outcomeEditor/listing',
    'taoQtiTest/controller/creator/helpers/scoring',
    'taoQtiTest/controller/creator/outcomeDeclaration/filter',
    'taoQtiItem/qtiItem/core/Element',
    'taoQtiItem/qtiCreator/widgets/helpers/formElement'
], function (
    $,
    _,
    __,
    context,
    hider,
    feedback,
    features,
    defaults,
    actions,
    testPartView,
    templates,
    qtiTestHelper,
    translationHelper,
    featureVisibility,
    baseTypeHelper,
    outcome,
    outcomeEditorListingTpl,
    scoring,
    outcomeDeclarationFilter,
    Element,
    formElement
) {
    /**
     * The TestView setup test related components and behavior
     *
     * @exports taoQtiTest/controller/creator/views/test
     * @param {Object} creatorContext
     */
    function testView(creatorContext) {
        const defaultsConfigs = defaults();
        const modelOverseer = creatorContext.getModelOverseer();
        const testModel = modelOverseer.getModel();
        const config = modelOverseer.getConfig();

        //add feature visibility properties to testModel
        featureVisibility.addTestVisibilityProps(testModel);

        const { featureFlags } = context;
        if (featureFlags.FEATURE_FLAG_UNIQUE_NUMERIC_QTI_IDENTIFIER || testModel.translation) {
            testModel.readonlyTestIdentifier = true;
        }

        actions.properties($('.test-creator-test > h1'), 'test', testModel, propHandler);
        testParts();
        addTestPart();

        const $title = $('.test-creator-test > h1 [data-bind=title]');
        let titleFormat = '%title%';
        if (config.translation) {
            titleFormat = __('%title% - Translation (%lang%)');
            showTitle(testModel);
        }

        /**
         * Show the title of the test.
         */
        function showTitle(model) {
            $title.text(titleFormat.replace('%title%', model.title).replace('%lang%', config.translationLanguageCode));
        }

        //add feature visibility props to model

        /**
         * set up the existing test part views
         * @private
         */
        function testParts() {
            if (!testModel.testParts) {
                testModel.testParts = [];
            }
            $('.testpart').each(function () {
                const $testPart = $(this);
                const index = $testPart.data('bind-index');
                if (!testModel.testParts[index]) {
                    testModel.testParts[index] = {};
                }

                testPartView.setUp(creatorContext, testModel.testParts[index], $testPart);
            });
        }

        /**
         * Perform some binding once the property view is created
         * @private
         * @param {propView} propView - the view object
         * @fires modelOverseer#scoring-change
         */
        function propHandler(propView) {
            const $view = propView.getView();
            const $categoryScoreLine = $('.test-category-score', $view);
            const $cutScoreLine = $('.test-cut-score', $view);
            const $weightIdentifierLine = $('.test-weight-identifier', $view);
            const $descriptions = $('.test-outcome-processing-description', $view);
            const $generate = $('[data-action="generate-outcomes"]', $view);
            const $addOutcomeDeclaration = $('[data-action="add-outcome-declaration"]', $view);
            let scoringState = JSON.stringify(testModel.scoring);
            const weightVisible = features.isVisible('taoQtiTest/creator/test/property/scoring/weight');

            function changeScoring(scoring) {
                const noOptions = !!scoring && ['none', 'custom'].indexOf(scoring.outcomeProcessing) === -1;
                const newScoringState = JSON.stringify(scoring);

                hider.toggle($cutScoreLine, !!scoring && scoring.outcomeProcessing === 'cut');
                hider.toggle($categoryScoreLine, noOptions);
                hider.toggle($weightIdentifierLine, noOptions && weightVisible);
                hider.hide($descriptions);
                hider.show($descriptions.filter('[data-key="' + scoring.outcomeProcessing + '"]'));

                if (scoringState !== newScoringState) {
                    /**
                     * @event modelOverseer#scoring-change
                     * @param {Object} testModel
                     */
                    modelOverseer.trigger('scoring-change', testModel);
                }
                scoringState = newScoringState;
            }


            function updateOutcomes() {
                const $panel = $('.outcome-declarations', $view);

                $panel.html(templates.outcomes({ outcomes: modelOverseer.getOutcomesList() }));
            }

            $('[name=test-outcome-processing]', $view).select2({
                minimumResultsForSearch: -1,
                width: '100%'
            });

            $generate.on('click', () => {
                $generate.addClass('disabled').attr('disabled', true);
                modelOverseer
                    .on('scoring-write.regenerate', () => {
                        modelOverseer.off('scoring-write.regenerate');
                        feedback()
                            .success(__('The outcomes have been regenerated!'))
                            .on('destroy', () => {
                                $generate.removeClass('disabled').removeAttr('disabled');
                            });
                    })
                    .trigger('scoring-change');
            });

            $addOutcomeDeclaration.on('click', (e) => {
                e.preventDefault();

                const newOutcome = outcome.createOutcome('SCORE', baseTypeHelper.FLOAT);

                if (!Array.isArray(testModel.outcomeDeclarations)) {
                    testModel.outcomeDeclarations = [];
                }

                if (!testModel.outcomeDeclarations.some(
                    (outcome) => outcome.identifier === newOutcome.identifier)
                ) {
                    testModel.outcomeDeclarations.push(newOutcome);
                }
            });

            $view.on('change.binder', (e, model) => {
                if (e.namespace === 'binder' && model['qti-type'] === 'assessmentTest') {
                    changeScoring(model.scoring);
                    renderOutcomeDeclarationList($view);
                    //update the test part title when the databinder has changed it
                    showTitle(model);
                }
            });

            modelOverseer.on('scoring-write', updateOutcomes);
            changeScoring(testModel.scoring);
            updateOutcomes();
            renderOutcomeDeclarationList($view);
        }

        /**
         * Enable to add new test parts
         * @private
         * @fires modelOverseer#part-add
         */
        function addTestPart() {
            $('.testpart-adder').adder({
                target: $('.testparts'),
                content: templates.testpart,
                templateData(cb) {
                    //create an new testPart model object to be bound to the template
                    const testPartIndex = $('.testpart').length;
                    cb({
                        'qti-type': 'testPart',
                        identifier: qtiTestHelper.getAvailableIdentifier(
                            modelOverseer.getModel(),
                            'testPart',
                            defaultsConfigs.partIdPrefix
                        ),
                        index: testPartIndex,
                        navigationMode: defaultsConfigs.navigationMode,
                        submissionMode: defaultsConfigs.submissionMode,
                        assessmentSections: [
                            {
                                'qti-type': 'assessmentSection',
                                identifier: qtiTestHelper.getAvailableIdentifier(
                                    modelOverseer.getModel(),
                                    'assessmentSection',
                                    defaultsConfigs.sectionIdPrefix
                                ),
                                title: defaultsConfigs.sectionTitlePrefix,
                                index: 0,
                                sectionParts: [],
                                visible: true,
                                itemSessionControl: {
                                    maxAttempts: defaultsConfigs.maxAttempts
                                }
                            }
                        ]
                    });
                }
            });

            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            $(document)
                .off('add.binder', '.testparts')
                .on('add.binder', '.testparts', (e, $testPart, added) => {
                    if (e.namespace === 'binder' && $testPart.hasClass('testpart')) {
                        const partModel = testModel.testParts[added.index];

                        if (testModel.translation) {
                            const originIdentifiers = translationHelper.registerModelIdentifiers(config.originModel);
                            const originTestPart = originIdentifiers[partModel.identifier];
                            const section = partModel.assessmentSections[0];
                            const originSection = originIdentifiers[section.identifier];
                            translationHelper.setTranslationFromOrigin(partModel, originTestPart);
                            translationHelper.setTranslationFromOrigin(section, originSection);
                        }

                        //initialize the new test part
                        testPartView.setUp(creatorContext, partModel, $testPart);
                        // set index for new section
                        actions.updateTitleIndex($('.section', $testPart));

                        /**
                         * @event modelOverseer#part-add
                         * @param {Object} partModel
                         */
                        modelOverseer.trigger('part-add', partModel);
                    }
                });
        }

        /**
         * Render the lists of the test outcomes into the outcome editor panel
         * @param {Object} testModel
         * @param {JQuery} $editorPanel
         */
        function renderOutcomeDeclarationList($editorPanel) {
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
                    none: { label: __('None'), selected: !outcome.attr || !outcome.attr('externalScored') },
                    human: { label: __('Human'), selected: outcome.attr && outcome.attr('externalScored') === outcome.externalScoredOptions.human },
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
                    normalMaximum: outcome.attr && outcome.attr('normalMaximum'),
                    normalMinimum: outcome.attr && outcome.attr('normalMinimum'),
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
    }

    return testView;
});
