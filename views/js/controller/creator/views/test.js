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
'jquery', 'lodash', 'ui/hider',
'taoQtiTest/controller/creator/views/actions',
'taoQtiTest/controller/creator/views/testpart',
'taoQtiTest/controller/creator/templates/index',
'taoQtiTest/controller/creator/helpers/qtiTest'
],
function($, _, hider, actions, testPartView, templates, qtiTestHelper){
    'use strict';

   /**
     * The TestView setup test related components and beahvior
     *
     * @exports taoQtiTest/controller/creator/views/test
     * @param {Object} model - the data model to bind to the test
     * @param {Object} [data] - additionnal data used by the setup
     * @param {Array} [data.identifiers] - the locked identifiers
     */
   var testView = function testView (model, data) {

        actions.properties($('.test-creator-test > h1'), 'test', model, propHandler);
        testParts();
        addTestPart();

        /**
         * set up the exisiting test part views
         * @private
         */
        function testParts () {
            if(!model.testParts){
                model.testParts = [];
            }
            $('.testpart').each(function(){
                var $testPart = $(this);
                var index = $testPart.data('bind-index');
                if(!model.testParts[index]){
                    model.testParts[index] = {};
                }

                testPartView.setUp($testPart, model.testParts[index], data);
            });
        }

        /**
         * Perform some binding once the property view is created
         * @private
         * @param {propView} propView - the view object
         */
        function propHandler(propView) {

            var $view = propView.getView();
            var $cutScoreLine = $('.test-cut-score', $view);
            var $weightIdentifierLine = $('.test-weight-identifier', $view);
            var $descriptions = $('.test-outcome-processing-description', $view);
            var $title = $('.test-creator-test > h1 [data-bind=title]');

            function changeScoring(scoring) {
                hider.toggle($cutScoreLine, !!scoring && scoring.outcomeProcessing === 'cut');
                hider.toggle($weightIdentifierLine, !!scoring && ['none', 'custom'].indexOf(scoring.outcomeProcessing) === -1);
                hider.hide($descriptions);
                hider.show($descriptions.filter('[data-key="' + scoring.outcomeProcessing + '"]'));
            }

            $('[name=test-outcome-processing]', $view).select2({
                minimumResultsForSearch: -1,
                width: '100%'
            });

            $view.on('change.binder', function (e, model) {
                if (e.namespace === 'binder' && model['qti-type'] === 'assessmentTest') {
                    changeScoring(model.scoring);

                    //update the test part title when the databinder has changed it
                    $title.text(model.title);
                }
            });
            changeScoring(model.scoring);
        }

        /**
         * Enable to add new test parts
         * @private
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
                        identifier : qtiTestHelper.getIdentifier('testPart', data.identifiers),
                        index  : testPartIndex,
                        navigationMode : 0,
                        submissionMode : 0,
                        assessmentSections : [{
                            'qti-type' : 'assessmentSection',
                            identifier : qtiTestHelper.getIdentifier('assessmentSection',  data.identifiers),
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
                if(e.namespace === 'binder' && $testPart.hasClass('testpart')){
                    //initialize the new test part
                    testPartView.setUp($testPart, model.testParts[added.index], data);
                }
            });
        }
    };

    return testView;
});
