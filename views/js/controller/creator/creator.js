/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(
['module', 'jquery', 'lodash','ui', 'core/databindcontroller', 
'taoQtiTest/controller/creator/views/item', 'taoQtiTest/controller/creator/views/section',
'taoQtiTest/controller/creator/encoders/dom2qti', 'helpers'], 
function(module, $, _, ui, DataBindController, ItemView, SectionView, Dom2QtiEncoder, helpers){
    'use strict';

    /**
     * Generic callback used when retrieving data from the server
     * @callback DataCallback
     * @param {Object} data - the received data
     */

    /**
     * Call the server to get the list of items
     * @param {string} url 
     * @param {string} search - a posix pattern to filter items
     * @param {DataCallback} cb - with items
     */
    function loadItems(url, search, cb){
        $.getJSON(url, {pattern : search}, function(data){
            if(data && typeof cb === 'function'){
                cb(data);
            }
        });
    }
    
    /**
     * Get an identifier from the server - to prevent duplicates
     * @param {string} url
     * @param {string} model - send the full model to keep consistency
     * @param {string} type - the data type to get an id for (ie. qti-type)
     * @param {DataCallback} cb - with the id
     */
    function getIdentifier(url, model, type, cb){
        
        addMissingQtiType(model);
        consolidateModel(model);
        var data = {
            model : JSON.stringify(model),
            'qti-type' : type
        };
        $.post(url, data, function(data){
            if(data && typeof cb === 'function'){
                cb(data);
            }
        }, 'json');
    }
    
    /**
     * Does the value contains the type type
     * @param {Object} value 
     * @param {string} type
     * @returns {boolean} 
     */
    function filterQtiType(value, type){
         return value['qti-type'] && value['qti-type'] === type;
    }
    
    /**
     * Add the 'qti-type' properties to object that miss it, using the parent key name
     * @param {Object|Array} collection
     * @param {string} parentType
     */
    function addMissingQtiType(collection, parentType) {
        _.forEach(collection, function(value, key) {
            if (_.isObject(value) && !_.isArray(value) && !_.has(value, 'qti-type')) {
                if (_.isNumber(key)) {
                    if (parentType) {
                        value['qti-type'] = parentType;
                    }
                } else {
                    value['qti-type'] = key;
                }
            }
            if (_.isArray(value)) {
                addMissingQtiType(value, key.replace(/s$/, ''));
            } else if (_.isObject(value)) {
                addMissingQtiType(value);
            }
        });
    }
    
    /**
     * Applies consolidation rules to the model
     * @param {Object} model
     * @returns {Object}
     */
    function consolidateModel(model){
        if(model && model.testParts && _.isArray(model.testParts) && model.testParts[0]){
            var testPart = model.testParts[0];
            if(testPart.assessmentSections && _.isArray(testPart.assessmentSections)){
                 _.forEach(testPart.assessmentSections, function(assessmentSection, key) {
                     
                     //remove ordering is shuffle is false
                     if(assessmentSection.ordering && 
                             assessmentSection.ordering.shuffle !== undefined && assessmentSection.ordering.shuffle === false){
                         delete assessmentSection.ordering;
                     }
                     
                     //remove selection if default values
                     if(assessmentSection.selection && 
                             assessmentSection.selection.select !== undefined && assessmentSection.selection.select === 1 &&
                             (assessmentSection.selection.withReplacement === undefined ||  assessmentSection.selection.withReplacement === false )){
                         delete assessmentSection.selection;
                     }
                     

                      if(assessmentSection.rubricBlocks && _.isArray(assessmentSection.rubricBlocks)) {

                          //remove rubrick blocks if empty
                          if (assessmentSection.rubricBlocks.length === 0 || 
                                  (assessmentSection.rubricBlocks.length === 1 && assessmentSection.rubricBlocks[0].content.length === 0) ) {
                              
                              delete assessmentSection.rubricBlocks;
                          }
                          //ensure the view attribute is present
                          else if(assessmentSection.rubricBlocks.length > 0){
                            _.forEach(assessmentSection.rubricBlocks, function(rubricBlock){
                                    if(rubricBlock && rubricBlock.content && (!rubricBlock.views || (_.isArray(rubricBlock.views) && rubricBlock.views.length === 0))){
                                        rubricBlock.views = ['candidate'];
                                    }
                              });
                          }
                    }
                 });
            }
        }
        return model;
    }
    
    /**
     * The test creator controller is the main entry point
     * and orchestrates data retrieval and view/components loading. 
     * @exports creator/controller
     */
    var Controller = {
        
         routes : {},
        
         /**
          * Start the controller, main entry method.
          * @public 
          * @param {Object} options
          * @param {Object} options.labels - the list of item's labels to give to the ItemView
          * @param {Object} options.routes - action's urls
          */
         start : function(options){
            var self = this;
            
            options = _.merge(module.config(), options || {});
            
            var $container = $('#test-creator');
             
            var labels = options.labels || {};
            this.routes = options.routes || {};

            //boostrap the CARD's framework
            ui.startEventComponents($container);
            
            //set up the ItemView, give it a configured loadItems ref
            ItemView.setUp({
               loadItems : _.partial(loadItems, this.routes.items)
            });
            
            //Print data binder chandes for DEBUGGING ONLY
//            $container.on('change.binder', function(e, model){
//                if(e.namespace === 'binder'){
//                    console.log(model);
//                }
//            });
            
            //Data Binding options
            var binderOptions = _.merge(this.routes, {
                filters : {
                    'isItemRef' : function(value){
                        return filterQtiType(value, 'assessmentItemRef');
                    },
                    'isSectionRef' : function(value){
                        return filterQtiType(value, 'assessmentSectionRef');
                    }
                },
                encoders : {
                  'dom2qti' : Dom2QtiEncoder  
                },
                beforeSave : function(model){
                    //ensure the qti-type is present
                    addMissingQtiType(model); 
                    
                    //apply consolidation rules
                    consolidateModel(model);
                    return true;
                }
            });
            
            //set up the databinder
            var binder = DataBindController.takeControl($container, binderOptions)
                .get(function(model){
                    //once model is loaded, we set up the SectionView, give it a configured getIdentifier ref
                    SectionView.setUp({
                        labels: labels,
                        getIdentifier: _.partial(getIdentifier, self.routes.identifier, model)
                    });
                });
                
            //the save button triggers binder's save action.
            $('#saver').click(function(event){
                event.preventDefault();
                $('#saver').attr('disabled', true);
                
                binder.save(function(){
                    $('#saver').attr('disabled', false);
                    helpers.createInfoMessage('Saved');
                }, function(){
                    $('#saver').attr('disabled', false);
                });
            });
        }
    };
    
    return Controller;
});

