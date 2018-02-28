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
     * Set up a test part: init action behaviors. Called for each test part.
     *
     * @param {Object} creatorContext
     * @param {Object} partModel - the data model to bind to the test part
     * @param {jQueryElement} $testPart - the testpart container to set up
     */
    function setUp (creatorContext, partModel, $testPart){
        var $actionContainer = $('h1', $testPart);
        var modelOverseer = creatorContext.getModelOverseer();
        var config = modelOverseer.getConfig();

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
        function propHandler (propView) {

            var $view = propView.getView();

            //listen for databinder change to update the test part title
            var $identifier =  $('[data-bind=identifier]', $testPart);
            $view.on('change.binder', function(e, model){
                if(e.namespace === 'binder' && model['qti-type'] === 'testPart'){
                    $identifier.text(model.identifier);

                    /**
                     * @event modelOverseer#section-add
                     * @param {Object} sectionModel
                     */
                    modelOverseer.trigger('testpart-change', partModel);

                }
            });

            //destroy it when it's testpart is removed
            $testPart.on('delete', function(){
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
            if(!partModel.assessmentSections){
                partModel.assessmentSections = [];
            }
            $('.section', $testPart).each(function(){
                var $section = $(this);
                var index = $section.data('bind-index');
                if(!partModel.assessmentSections[index]){
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
        function addSection(){
            $('.section-adder', $testPart).adder({
                target: $('.sections', $testPart),
                content : templates.section,
                templateData : function(cb){

                    //create a new section model object to be bound to the template
                    var sectionIndex = $('.section', $testPart).length;
                    cb({
                        'qti-type' : 'assessmentSection',
                        identifier : qtiTestHelper.getIdentifier('assessmentSection',  config.identifiers),
                        title : 'Section ' + (sectionIndex + 1),
                        index : 0,
                        sectionParts : []
                    });
                }
            });



            //we listen the event not from the adder but  from the data binder to be sure the model is up to date
            $(document)
                .off('add.binder', '#' + $testPart.attr('id') + ' .sections')
                .on ('add.binder', '#' + $testPart.attr('id') + ' .sections', function(e, $section){
                    var index, sectionModel;
                    if(e.namespace === 'binder' && $section.hasClass('section')){
                        index = $section.data('bind-index');
                        sectionModel = partModel.assessmentSections[index];

                        //initialize the new test part
                        sectionView.setUp(creatorContext, sectionModel, partModel, $section);

                        /**
                         * @event modelOverseer#section-add
                         * @param {Object} sectionModel
                         */
                        modelOverseer.trigger('section-add', sectionModel);
                    }
                });
        }
    }

    /**
     * Listen for state changes to enable/disable . Called globally.
     */
    function listenActionState (){

        var $testParts = $('.testpart');

        actions.removable($testParts, 'h1');
        actions.movable($testParts, 'testpart', 'h1');

        $('.testparts')
            .on('delete', function(e){
                var $target = $(e.target);
                if($target.hasClass('testpart')){
                    actions.disable($('.testpart'), 'h1');
                }
            })
            .on('add change undo.deleter deleted.deleter', function(e){
                var $target = $(e.target);

                if($target.hasClass('testpart') || $target.hasClass('testparts')){

                    //refresh
                    $testParts = $('.testpart');

                    //check state
                    actions.removable($testParts, 'h1');
                    actions.movable($testParts, 'testpart', 'h1');
                }
            });
    }

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
