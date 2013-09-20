define(['jquery', 'generis.tree.select', 'jquery.timePicker'], function($, GenerisTreeSelectClass){
    
    //just to define the options
    var defaults =  {
        sequence : [],
        labels : [],
        saveUrl : '',
        itemsTree: {
            itemsUrl : '',
            serverParameters : {}
        }
    };
    
    var QtiTestAuthoring = {
        
        _$itemSequence : $("#item-sequence"),
        
        init : function($container, options){
            var self = this;
            this.options = $.extend({}, defaults, options);
            this._$container = $container;
            
            this._setUpItemsTree();
            this._setUpItemSequence();
            this._setUpFormWidgets();
            
            $("#saver-action-item-sequence").click(function(e){
                e.preventDefault();
                self.save();
            });
            
            this._$container.trigger('create.qtitestauthoring');
        },
                
        _setUpItemsTree : function(){
            var self = this;
            var treeOptions = this.options.itemsTree;
            var sequence = self.options.sequence;
            
            new GenerisTreeSelectClass('#item-tree', treeOptions.itemsUrl,{
                    actionId: 'item',
                    saveUrl: self.options.saveUrl,
                    checkedNodes : sequence,
                    paginate:	10,
                    saveCallback: function (data){
                        var attr, newSequence = [];
                        sequence = [];
                        for (attr in data) {
                            if (/^instance_/.test(attr) && $.inArray(data[attr], sequence) === -1 && attr !== undefined) {
                                newSequence[parseInt(attr.replace('instance_', ''), 10)] = 'item_'+ data[attr];
                                sequence[parseInt(attr.replace('instance_', ''), 10)] =  data[attr];
                            }
                        }
                        self.updateItemSequence(newSequence);
                    },
                    serverParameters: treeOptions.serverParameters,
                    callback: {
                        checkPaginate: function(NODE, TREE_OBJ) {
                            //Check the unchecked that must be checked... olè!
                            this.check(sequence);
                        }
                    }
            });
        },
        
        _setUpItemSequence : function(){
            var self = this;
            var sequence = this.options.sequence;
            this._$itemSequence.sortable({
                axis: 'y',
                opacity: 0.6,
                placeholder: 'ui-state-error',
                tolerance: 'pointer',
                update: function(){
                    var newSequence = $(this).sortable('toArray');
                    var i = 0;
                    sequence = [];
                    for (i = 0; i < newSequence.length; i++) {
                        sequence[i] = newSequence[i].replace('item_', '');
                    }
                    self.updateItemSequence(newSequence);
                }
            });
        },
        
        _setUpFormWidgets : function(){
            $('.time').timepicker({
                            timeFormat: 'HH:mm:ss',
                            showHour: true,
                            showMinute : true,
                            showSecond : true,
                            showButtonPanel: false
                        });
        },
        
        save: function(){
            var self = this;
            var sequence = this.options.sequence;
            var toSend = {};
            var formInput;
            var index = 0;
            var formData = $('#qti-test-container > form').serializeArray();
            for(index in formData){
                var formInput = formData[index];
                toSend[formInput.name] = formInput.value; 
            }

            for(index in sequence){
                toSend['instance_'+index] = sequence[index];
            }
            
            toSend.classUri = $("input[name=classUri]").val();
            
            $.ajax({
                url: self.options.saveUrl,
                type: "POST",
                data: toSend,
                dataType: 'json',
                success: function(response){
                    self._$container.trigger('saved.qtitestauthoring', [response.saved]);
                },
                complete: function(){
                    helpers.loaded();
                }
            });
        },
        
        updateItemSequence : function(sequence){
            var $info = this._$itemSequence.prev('.elt-info');
            this._$itemSequence.html(this._itemListHtml(sequence));
            
            if (this._$itemSequence.find('li').length){
                $info.show();
            } else {
                $info.hide();
            }
            
            this._$container.trigger('itemsupdate.qtitestauthoring');
        },
                
        _itemListHtml : function(items){
            var html = '', itemId, i, index = 0;
            for (i in items) {
                itemId = items[i];
                index = parseInt(i, 10) + 1;
                html += "<li class='ui-state-default' id='" + itemId + "' >";
                html += "<span class='ui-icon ui-icon-arrowthick-2-n-s' /><span class='ui-icon ui-icon-grip-dotted-vertical' />";
                html += index + ". " + this.options.labels[itemId];
                html += "</li>";
            }
            return html;
        }
    };
    
    return QtiTestAuthoring;
});

