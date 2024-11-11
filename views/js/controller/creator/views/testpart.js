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
    'taoQtiTest/controller/creator/config/defaults',
    'taoQtiTest/controller/creator/views/actions',
    'taoQtiTest/controller/creator/views/section',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/qtiTest',
    'taoQtiTest/controller/creator/helpers/testPartCategory',
    'taoQtiTest/controller/creator/helpers/categorySelector',
    'taoQtiTest/controller/creator/helpers/translation',
    'taoQtiTest/controller/creator/helpers/featureVisibility'
], function (
    $,
    _,
    defaults,
    actions,
    sectionView,
    templates,
    qtiTestHelper,
    testPartCategory,
    categorySelectorFactory,
    translationHelper,
    featureVisibility
) {
    'use strict';

    /**
     * Set up a test part: init action behaviors. Called for each test part.
     *
     * @param {Object} creatorContext
     * @param {Object} partModel - the data model to bind to the test part
     * @param {jQuery} $testPart - the testpart container to set up
     */
    function setUp(creatorContext, partModel, $testPart) {
        const defaultsConfigs = defaults();
        const $actionContainer = $('h1', $testPart);
        const $titleWithActions = $testPart.children('h1');
        const modelOverseer = creatorContext.getModelOverseer();
        const config = modelOverseer.getConfig();

        //add feature visibility properties to testPartModel
        featureVisibility.addTestPartVisibilityProps(partModel);

        //run setup methods
        actions.properties($actionContainer, 'testpart', partModel, propHandler);
        actions.move($actionContainer, 'testparts', 'testpart');
        sections();
        addSection();

        /**
         * Perform some binding once the property view is created
         * @private
         * @param {propView} propView - the view object
         */
        function propHandler(propView) {
            const $view = propView.getView();

            //listen for databinder change to update the test part title
            const $identifier = $('[data-bind=identifier]', $titleWithActions);
            $view.on('change.binder', function (e, model) {
                if (e.namespace === 'binder' && model['qti-type'] === 'testPart') {
                    $identifier.text(model.identifier);

                    /**
                     * @event modelOverseer#section-add
                     * @param {Object} sectionModel
                     */
                    modelOverseer.trigger('testpart-change', partModel);
                }
            });

            //destroy it when it's testpart is removed
            $testPart.parents('.testparts').on('deleted.deleter', function (e, $deletedNode) {
                if (propView !== null && $deletedNode.attr('id') === $testPart.attr('id')) {
                    propView.destroy();
                }
            });

            //testPart level category configuration
            categoriesProperty($view);

            actions.displayCategoryPresets($testPart, 'testpart');
        }

        /**
         * Set up sections that already belongs to the test part
         * @private
         */
        function sections() {
            if (!partModel.assessmentSections) {
                partModel.assessmentSections = [];
            }
            $('.section', $testPart).each(function () {
                const $section = $(this);
                const index = $section.data('bind-index');
                if (!partModel.assessmentSections[index]) {
                    partModel.assessmentSections[index] = {};
                }

                sectionView.setUp(creatorContext, partModel.assessmentSections[index], partModel, $section);
            });
        }

        /**
         * Enable to add new sections
         * @private
         * @fires modelOverseer#section-add
         */
        function addSection() {
            $('.section-adder', $testPart).adder({
                target: $('.sections', $testPart),
                content: templates.section,
                templateData: function (cb) {
                    //create a new section model object to be bound to the template
                    cb({
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
                    });
                }
            });

            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            // jquery issue to select id with dot by '#ab.cd', should be used [id="ab.cd"]
            $(document)
                .off('add.binder', `[id=${$testPart.attr('id')}] .sections`)
                .on('add.binder', `[id=${$testPart.attr('id')}] .sections`, function (e, $section) {
                    if (e.namespace === 'binder' && $section.hasClass('section')) {
                        const index = $section.data('bind-index');
                        const sectionModel = partModel.assessmentSections[index];

                        if (partModel.translation) {
                            const originIdentifiers = translationHelper.registerModelIdentifiers(config.originModel);
                            const originSection = originIdentifiers[sectionModel.identifier];
                            translationHelper.setTranslationFromOrigin(sectionModel, originSection);
                        }

                        //initialize the new section
                        sectionView.setUp(creatorContext, sectionModel, partModel, $section);

                        /**
                         * @event modelOverseer#section-add
                         * @param {Object} sectionModel
                         */
                        modelOverseer.trigger('section-add', sectionModel);
                    }
                });
        }

        /**
         * Set up the category property
         * @private
         * @param {jQuery} $view - the $view object containing the $select
         * @fires modelOverseer#category-change
         */
        function categoriesProperty($view) {
            const categoriesSummary = testPartCategory.getCategories(partModel);
            const categorySelector = categorySelectorFactory($view);

            categorySelector.createForm(categoriesSummary.all, 'testPart');
            updateFormState(categorySelector);

            $view.on('propopen.propview', function () {
                updateFormState(categorySelector);
            });

            $view.on('set-default-categories', function () {
                partModel.categories = defaultsConfigs.categories;
                updateFormState(categorySelector);
            });

            categorySelector.on('category-change', function (selected, indeterminate) {
                testPartCategory.setCategories(partModel, selected, indeterminate);

                modelOverseer.trigger('category-change');
            });
        }

        function updateFormState(categorySelector) {
            const categoriesSummary = testPartCategory.getCategories(partModel);
            categorySelector.updateFormState(categoriesSummary.propagated, categoriesSummary.partial);
        }
    }

    /**
     * Listen for state changes to enable/disable . Called globally.
     */
    function listenActionState() {
        let $testParts = $('.testpart');

        actions.removable($testParts, 'h1');
        actions.movable($testParts, 'testpart', 'h1');

        $('.testparts')
            .on('delete', function (e) {
                const $target = $(e.target);
                if ($target.hasClass('testpart')) {
                    actions.disable($(e.target.id), 'h1');
                }
            })
            .on('add change undo.deleter deleted.deleter', function (e) {
                const $target = $(e.target);

                if ($target.hasClass('testpart') || $target.hasClass('testparts')) {
                    //refresh
                    $testParts = $('.testpart');

                    //check state
                    actions.removable($testParts, 'h1');
                    actions.movable($testParts, 'testpart', 'h1');
                }
            });
    }

    /**
     * The testPartView setup testpart related components and behavior
     *
     * @exports taoQtiTest/controller/creator/views/testpart
     */
    return {
        setUp: setUp,
        listenActionState: listenActionState
    };
});
