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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */
/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery', 'lodash', 'i18n', 'ui/hider', 'ui/feedback',
    'taoQtiTest/controller/creator/views/actions',
    'taoQtiTest/controller/creator/views/testpart',
    'taoQtiTest/controller/creator/templates/index',
    'taoQtiTest/controller/creator/helpers/qtiTest'
],
function($, _, __, hider, feedback, actions, testPartView, templates, qtiTestHelper){
    'use strict';

    /**
     * The TestView setup test related components and behavior
     *
     * @exports taoQtiTest/controller/creator/views/test
     * @param {Object} creatorContext
     */
    function testView (creatorContext) {
        var modelOverseer = creatorContext.getModelOverseer();
        var testModel = modelOverseer.getModel();

        actions.properties($('.test-creator-test > h1'), 'test', testModel, propHandler);
        testParts();
        addTestPart();

        /**
         * set up the existing test part views
         * @private
         */
        function testParts () {
            if(!testModel.testParts){
                testModel.testParts = [];
            }
            $('.testpart').each(function(){
                var $testPart = $(this);
                var index = $testPart.data('bind-index');
                if(!testModel.testParts[index]){
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

            var $view = propView.getView();
            var $categoryScoreLine = $('.test-category-score', $view);
            var $cutScoreLine = $('.test-cut-score', $view);
            var $weightIdentifierLine = $('.test-weight-identifier', $view);
            var $descriptions = $('.test-outcome-processing-description', $view);
            var $generate = $('[data-action="generate-outcomes"]', $view);
            var $title = $('.test-creator-test > h1 [data-bind=title]');
            var scoringState = JSON.stringify(testModel.scoring);

            function changeScoring(scoring) {
                var noOptions = !!scoring && ['none', 'custom'].indexOf(scoring.outcomeProcessing) === -1;
                var newScoringState = JSON.stringify(scoring);

                hider.toggle($cutScoreLine, !!scoring && scoring.outcomeProcessing === 'cut');
                hider.toggle($categoryScoreLine, noOptions);
                hider.toggle($weightIdentifierLine, noOptions);
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
                var $panel = $('.outcome-declarations', $view);

                $panel.html(templates.outcomes(modelOverseer.getOutcomesList()));
            }

            $('[name=test-outcome-processing]', $view).select2({
                minimumResultsForSearch: -1,
                width: '100%'
            });

            $generate.on('click', function() {
                $generate.addClass('disabled').attr('disabled', true);
                modelOverseer
                    .on('scoring-write.regenerate', function() {
                        modelOverseer.off('scoring-write.regenerate');
                        feedback().success(__('The outcomes have been regenerated!')).on('destroy', function() {
                            $generate.removeClass('disabled').removeAttr('disabled');
                        });
                    })
                    .trigger('scoring-change');
            });

            $view.on('change.binder', function (e, model) {
                if (e.namespace === 'binder' && model['qti-type'] === 'assessmentTest') {
                    changeScoring(model.scoring);

                    //update the test part title when the databinder has changed it
                    $title.text(model.title);
                }
            });

            modelOverseer.on('scoring-write', updateOutcomes);

            changeScoring(testModel.scoring);
            updateOutcomes();
        }

        /**
         * Enable to add new test parts
         * @private
         * @fires modelOverseer#part-add
         */
        function addTestPart () {

            $('.testpart-adder').adder({
                target: $('.testparts'),
                content : templates.testpart,
                templateData : function(cb){

                    //create an new testPart model object to be bound to the template
                    var testPartIndex = $('.testpart').length;
                    cb({
                        'qti-type' : 'testPart',
                        identifier : qtiTestHelper.getAvailableIdentifier(modelOverseer.getModel(), 'testPart'),
                        index  : testPartIndex,
                        navigationMode : 0,
                        submissionMode : 0,
                        assessmentSections : [{
                            'qti-type' : 'assessmentSection',
                            identifier : qtiTestHelper.getAvailableIdentifier(modelOverseer.getModel(), 'assessmentSection', 'section'),
                            title : 'Section 1',
                            index : 0,
                            sectionParts : []
                        }]
                    });
                }
            });

            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            $(document)
                .off('add.binder', '.testparts')
                .on ('add.binder', '.testparts', function(e, $testPart, added){
                    var partModel;
                    if(e.namespace === 'binder' && $testPart.hasClass('testpart')){
                        partModel = testModel.testParts[added.index];

                        //initialize the new test part
                        testPartView.setUp(creatorContext, partModel, $testPart);

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
