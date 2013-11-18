define(
['jquery', 'lodash','cards/cards', 'cards/core/databindcontroller', 'taoQtiTest/creator/views/item', 'taoQtiTest/creator/views/section'], 
function($, _, cards, DataBindController, ItemView, SectionView){
    'use strict';
    
    function loadItems(url, search, cb){
        $.getJSON(url, {pattern : search}, function(data){
            if(data){
                if(typeof cb === 'function'){
                    cb(data);
                }
            }
        });
    }
    
    function getIdentifier(url, model, type, cb){
        var data = {
            model : JSON.stringify(model),
            'qti-type' : type
        };
        $.post(url, data, function(data){
            if(data){
                if(typeof cb === 'function'){
                    cb(data);
                }
            }
        }, 'json');
    }
    
    function filterQtiType(value, type){
         return value['qti-type'] && value['qti-type'] === type;
    }
    
    var Controller = {
        
         routes : {},
        
         start : function(options){
            var self = this;
            var $container = $('#test-creator');
             
            var labels = options.labels || [];
            this.routes = options.routes || {};
            
            cards.start($container);
            
            this.updateItems();
            
            var binderOptions = _.merge(this.routes, {
                filters : {
                    'isItemRef' : function(value){
                        return filterQtiType(value, 'assessmentItemRef');
                    },
                    'isSectionRef' : function(value){
                        return filterQtiType(value, 'assessmentSectionRef');
                    }
                },
                beforeSave : function(model){
                    
                    //ensure the qti-type is present
                    //todo check how to ensure that within the data binding
                    
                    console.log(model);
                    
                    (function addMissingQtiType (collection) {
                        _.forEach(collection, function(value, key){
                            if(_.isObject(value) && !_.isArray(value) && !_.has(value, 'qti-type')){
                                value['qti-type'] = key;
                            }
                            if(_.isObject(value) || _.isArray(value)){
                                addMissingQtiType(value);
                            }
                        });
                    }(model) ); //immediately invoke 
                    console.log(model);
                    
//                    var i, j, section;11
//                    if(model.testParts[0].assessmentSections){
//                        for (i in model.testParts[0].assessmentSections){
//                            section = model.testParts[0].assessmentSections[i];
//                            if(section.rubricBlocks){
//                                for(j in section.rubricBlocks){
//                                    section.rubricBlocks[j]['qti-type'] = 'rubricBlock';
//                                    section.rubricBlocks[j]['views'] = [1];
//                                }
//                            }
//                        }
//                    }
//                    if(model.testParts[0].timeLimits){
//                        model.testParts[0].timeLimits['qti-type'] = 'timeLimits';
//                    }
                    return true;
                }
            });
            
            var binder = DataBindController
                .takeControl($container, binderOptions)
                .get(function(model){
                    SectionView.setUp({
                        labels: labels,
                        getIdentifier: _.partial(getIdentifier, self.routes.identifier, model)
                    });
                });
                
            $('#saver').click(function(event){
                event.preventDefault();
                $('#saver').attr('disabled', true);
                binder.save(function(){
                    $('#saver').attr('disabled', false);
                    helpers.createInfoMessage('Saved');
                });
            });
        },
        
        
        updateItems : function(search){
            ItemView.setUp({
               loadItems : _.partial(loadItems, this.routes.items)
            });
        }
    };
    
    return Controller;
});

