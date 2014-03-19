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
'jquery', 'lodash', 
'taoQtiTest/controller/creator/views/actions', 
'taoQtiTest/controller/creator/views/section',
'taoQtiTest/controller/creator/templates/index', 
'taoQtiTest/controller/creator/helpers/qtiTest'],
function($, _, actions, sectionView, templates, qtiTestHelper){
    'use strict';

   /**
    * Set up a test part: init action beahviors. Called for each test part.
    *
    * @param {jQueryElement} $testPart - the testpart to set up
    * @param {Object} model - the data model to bind to the test part
    * @param {Object} [data] - additionnal data used by the setup
    * @param {Array} [data.identifiers] - the locked identifiers
    */
   var setUp =  function setUp ($testPart, model, data){

        //run setup methods
        actions.properties($('h1', $testPart), 'testpart', model, propHandler);
        actions.move($testPart, 'testparts', 'testpart');
        sections();
        addSection();

        /**
         * Perform some binding once the property view is create
         * @private
         * @param {propView} propView - the view object
         */
        function propHandler (propView) {
            
            ////disabling regarding state, not yet implmenented
            //var $container = propView.getView();
            //var ns = 'mode';

            //$('input[name=testpart-navigation-mode]', $container).on('change', function(){
                //$testPart.trigger('state.' + ns);            
            //});

            //$('input[name=testpart-submission-mode]', $container).on('change', function(){
                //$testPart.trigger('state.' + ns);                  
            //});

            //$testPart.on('state.' + ns, function(e){
                //if(e.namespace === ns){
                    //updateFormElements();
                //}
            //});
            //updateFormElements();

            //function updateFormElements (){
                    //if(model.navigationMode === 0){   //linear
                        //$('input[name=testpart-allow-skipping]', $container).prop('disabled', false);

                    //} else {
                        //$('input[name=testpart-allow-skipping]', $container).prop('disabled', true);
                    //}
            //}
            

            //but destroy it when it's testpart is removed
            $testPart.on('delete', function(e){
                if(propView !== null){
                    propView.destroy();
                }
            });
        }

        /**
         * Set up sections that already belongs to the test part
         * @private
         */
        function sections(){
            if(!model.assessmentSections){
                model.assessmentSections = [];
            }                   
            $('.section', $testPart).each(function(){
                var $section = $(this);
                var index = $section.data('bind-index');
                if(!model.assessmentSections[index]){
                    model.assessmentSections[index] = {};
                }

                sectionView.setUp($section, model.assessmentSections[index], data);
            });
        }

        /**
         * Enable to add new sections
         * @private
         */
        function addSection(){
            $('.section-adder', $testPart).adder({
                target: $('.sections', $testPart),
                content : templates.section,
                templateData : function(cb){

                    //create a new section model object to be bound to the template
                    var sectionIndex = $('.section', $testPart).length;
                    cb({
                        'qti-type' : 'assessmentSection',
                        identifier : qtiTestHelper.getIdentifier('assessmentSection',  data.identifiers),
                        title : 'Section ' + (sectionIndex + 1),
                        index : 0,
                        sectionParts : []             
                    });
                }
            });
            
            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            $(document).on('add.binder', '#' + $testPart.attr('id') + ' .sections', function(e, $section){
                if(e.namespace === 'binder' && $section.hasClass('section')){
                    var index = $section.data('bind-index'); 

                    //initialize the new test part
                    sectionView.setUp($section, model.assessmentSections[index], data);
                }
            });
        }

   };
   
   /**
    * Listen for state changes to enable/disable . Called globally.
    */
   var listenActionState =  function listenActionState (){

        var $testParts = $('.testpart');
        
        actions.removable($testParts, 'h1');
        actions.movable($testParts, 'testpart', 'h1');

        $('.testparts').on('add change deleted', function(e){
            var $target = $(e.target);

            if($target.hasClass('testpart') || $target.hasClass('testparts')){
                
                //refresh
                $testParts = $('.testpart');

                //check state
                actions.removable($testParts, 'h1');
                actions.movable($testParts, 'testpart', 'h1');
            }
        });
   };
 
    /**
     * The testPartView setup testpart related components and beahvior
     * 
     * @exports taoQtiTest/controller/creator/views/testpart
     */
    return {
        setUp : setUp,
        listenActionState: listenActionState
   }; 
});
