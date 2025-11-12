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
 * Copyright (c) 2014-2025 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
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
    'taoQtiTest/controller/creator/helpers/renderOutcomeHelper',
    'taoQtiTest/controller/creator/helpers/scaleSelector',
    'taoQtiTest/controller/creator/views/mnopTable',
    'taoQtiTest/controller/creator/helpers/mnop'
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
    { renderOutcomeDeclarationList },
    scaleSelectorFactory,
    mnopTableView,
    mnopHelper
) {
    const _ns = '.outcome-declarations-manual';

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
            const $scoringError = $('.test-outcome-processing-error', $view);
            const $addOutcomeDeclaration = $('[data-action="add-outcome-declaration"]', $view);
            let scoringState = JSON.stringify(testModel.scoring);
            const weightVisible = features.isVisible('taoQtiTest/creator/test/property/scoring/weight');

            function changeScoring(scoring) {
                const noOptions = !!scoring && ['none', 'custom', 'grade'].indexOf(scoring.outcomeProcessing) === -1;
                const newScoringState = JSON.stringify(scoring);

                hider.toggle($cutScoreLine, !!scoring && scoring.outcomeProcessing === 'cut');
                hider.toggle($categoryScoreLine, noOptions);
                hider.toggle($weightIdentifierLine, noOptions && weightVisible);
                hider.hide($descriptions);
                hider.hide($scoringError);
                hider.show($descriptions.filter('[data-key="' + scoring.outcomeProcessing + '"]'));
                testModel.scalePresets = config.scalePresets;

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

                $panel.html(templates.outcomes({ outcomes: modelOverseer.getOutcomeDeclarationsReservedList() }));
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

            $addOutcomeDeclaration.on(`click${_ns}`, () => {
                // Generate a unique identifier for the new outcome
                let outcomeCount = testModel.outcomeDeclarations ? testModel.outcomeDeclarations.length : 0;
                let newOutcomeIdentifier;

                do {
                    outcomeCount++;
                    newOutcomeIdentifier = `OUTCOME_${outcomeCount}`;
                } while (testModel.outcomeDeclarations.some(outcome => outcome.identifier === newOutcomeIdentifier));

                const newOutcome = outcome.createOutcome(newOutcomeIdentifier, baseTypeHelper.FLOAT);

                if (!Array.isArray(testModel.outcomeDeclarations)) {
                    testModel.outcomeDeclarations = [];
                }

                testModel.outcomeDeclarations.push(newOutcome);

                // Re-render the outcome declarations
                renderOutcomeDeclarationList(testModel, $view);

                // Add the 'editing' class to the newly created outcome-container
                const $newOutcomeContainer = $('.outcome-declarations-manual .outcome-container').last();
                $newOutcomeContainer.addClass('editing');

                const $scaleContainer = $newOutcomeContainer.find('.scales');
                const scaleSelector = scaleSelectorFactory($scaleContainer);
                scaleSelector.createForm('');

                scaleSelector.on('scale-change', function(selected) {
                    newOutcome.scale = selected || '';

                    const $minMaxInputs = $newOutcomeContainer.find('.minimum-maximum input');
                    $minMaxInputs.prop('disabled', !!selected);
                });

                $newOutcomeContainer.find('.identifier').focus();
            });

            // Disable the save button if the identifier is invalid
            // Modify validation to skip check if the identifier has not changed
            $view.on('focus', '.outcome-container.editing .identifier', function () {
                const $input = $(this);
                $input.data('originalValue', $input.val());
            });

            $view.on('blur', '.outcome-container.editing .identifier', function () {
                const $input = $(this);
                const identifier = $input.val();
                const originalIdentifier = $input.data('originalValue');
                const $saveButton = $('#saver');

                // Skip validation if the identifier has not changed
                if (identifier === originalIdentifier) {
                    $saveButton.removeClass('disabled').removeAttr('disabled');
                    return;
                }

                // Check if the identifier is unique among other outcome declarations
                const isUnique = !testModel.outcomeDeclarations.some(outcome =>
                    outcome.identifier === identifier && outcome.serial
                );
                if (!isUnique || !identifier.trim()) {
                    feedback().error(__('Outcome identifier must be unique and non-empty. Please choose a valid identifier.'));
                    $input.focus();
                    $saveButton.addClass('disabled').attr('disabled', true);
                } else {
                    $saveButton.removeClass('disabled').removeAttr('disabled');
                }
            });

            // Update the test parts and render the outcome declarations
            $view.on('change.binder', (e, model) => {
                if (e.namespace === 'binder' && model['qti-type'] === 'assessmentTest') {
                    changeScoring(model.scoring);
                    renderOutcomeDeclarationList(testModel, $view);
                    //update the test part title when the databinder has changed it
                    showTitle(model);
                }
            });

            modelOverseer.on('scoring-write', updateOutcomes);
            changeScoring(testModel.scoring);
            updateOutcomes();
            renderOutcomeDeclarationList(testModel, $view);

            // Initialize MNOP table
            const $mnopContainer = $view.find('.test-mnop-container');
            if ($mnopContainer.length) {
                // Initialize mnopHelper with item scores before rendering table
                mnopHelper.init(testModel, {
                    getItemsMaxScores: {
                        url: config.routes && config.routes.getItemsMaxScores || '/taoQtiTest/Items/getItemsMaxScores'
                    }
                }).then(function() {
                    const mnopView = mnopTableView($mnopContainer, testModel, modelOverseer);
                    mnopView.init();

                    // Store for cleanup
                    propView.mnopView = mnopView;
                }).catch(function(err) {
                    console.error('Failed to initialize MNOP helper:', err);
                });
            }
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
    }

    return testView;
});
