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
        
        init : function($container, options){
            var self = this;
            this.options = $.extend({}, defaults, options);
            this._$container = $container;
            
            this._initElements();
            
            this._setUpItemsTree();
            this._setUpItemSequence();
            this._setUpTimeLimits();
            
            $("#saver-action-item-sequence").click(function(e){
                e.preventDefault();
                self.save();
            });
            
            this._$container.trigger('create.qtitestauthoring');
        },
                
        _initElements : function(){
            this._$itemSequence = $("#item-sequence", this._$container);
            this._$orderingInfo = this._$itemSequence.prev('.elt-info');
            this._$shuffleInput = $("input[name='shuffle']", this._$container);
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
                    serverParameters: treeOptions.serverParameters,
                    saveCallback: function (data){
                        var attr, newSequence = [];
                        for (attr in data) {
                            if (/^instance_/.test(attr)) {
                                newSequence[parseInt(attr.replace('instance_', ''), 10)] = data[attr];
                            }
                        }
                        self.updateItemSequence(newSequence);
                    },
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
            var $items = this._$itemSequence.find('li');
            
            this._$itemSequence.sortable({
                axis: 'y',
                opacity: 0.6,
                placeholder: 'ui-state-error',
                tolerance: 'pointer',
                update: function(){
                    var newSequence = $(this).sortable('toArray');
                    var i = 0;
                    for (i = 0; i < newSequence.length; i++) {
                        newSequence[i] = newSequence[i].replace('item_', '');
                    }
                    self.updateItemSequence(newSequence);
                }
            });
            
            $items.on('mousedown', function(){
                $(this).css('cursor', 'move');
            }).on('mouseup', function(){
		$(this).css('cursor', 'pointer');
            });
            
            this._$shuffleInput.click(function(){
                if(self._isShuffling()){
                    self._$itemSequence.sortable('disable');
                    $items.find('.ui-icon').hide();
                    $items.off('mousedown mouseup');
                } else {
                    self._$itemSequence.sortable('enable');
                    $items.find('.ui-icon').show();
                    $items.on('mousedown', function(){
                        $(this).css('cursor', 'move');
                    }).on('mouseup', function(){
                        $(this).css('cursor', 'pointer');
                    });
                }
                self._toggleOrderingInfo();
            });
        },
        
        _toggleOrderingInfo : function(){
            if (this._$itemSequence.find('li').length > 0 && !this._isShuffling()){
                this._$orderingInfo.show();
            } else {
                this._$orderingInfo.hide();
            }
        },
                
        _isShuffling : function(){
            return this._$shuffleInput.is(':checked');
        },
        
        _setUpTimeLimits : function(){
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
            var sequence = this.getItemSequence();
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
        
        getItemSequence : function(){
            var sequence = [];
            this._$itemSequence.find('li').each(function(index, elt){
                sequence.push($(elt).attr('id').replace('item_', ''));
            });
            
            //sync
            this.options.sequence = sequence;
            
            return sequence;
        },
        
        updateItemSequence : function(sequence){
            this._$itemSequence.html(this._itemListHtml(sequence));
            
            //sync
            this.options.sequence = sequence;
            this._toggleOrderingInfo();
            
            this._$container.trigger('itemsupdate.qtitestauthoring', [sequence]);
        },
                
        _itemListHtml : function(items){
            var html = '', itemId, i, index = 0;
            for (i in items) {
                itemId = items[i];
                index = parseInt(i, 10) + 1;
                html += "<li class='ui-state-default' id='" + itemId + "' >";
                html += "<span class='ui-icon ui-icon-arrowthick-2-n-s' /><span class='ui-icon ui-icon-grip-dotted-vertical' />";
                html += index + ". " + this.options.labels['item_' + itemId];
                html += "</li>";
            }
            return html;
        }
    };
    
    return QtiTestAuthoring;
});

