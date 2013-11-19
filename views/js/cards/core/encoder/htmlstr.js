//todo move outside of cards, qti test related

define(['jquery', 'lodash'], function($, _){
    
   var getAttributes = function getAttributes(object){
        return _.omit(object, [
           'qti-type',
           'content',
           'xmlBase',
           'lang',
           'label'
        ]);
   };
   
   var attrToStr = function attrToStr(attr){
     return _.reduce(attr, function(acc, value, key){
         if(_.isNumber(value) || (_.isString(value) && !_.isEmpty(value)) ){
             return acc + ' ' + key + '="'+ value + '" ';
         }
         return acc;
     }, '');  
   };
    
   return {
       
       //JSON object to DOM
       encode : function(modelValue){
           var self = this;
           
           if(_.isArray(modelValue)){
               return _.reduce(modelValue, function(result, value){
                   return result + self.encode(value);
               }, '');
           } else if(_.isObject(modelValue) && modelValue['qti-type']){
                if(modelValue['qti-type'] === 'textRun'){
                    return modelValue.content;
                }
                var startTag = '<' + modelValue['qti-type'] + attrToStr(getAttributes(modelValue));
                if(modelValue.content){
                    return  startTag + '>' + self.encode(modelValue.content) + '</' + modelValue['qti-type'] + '>';
                } else {
                    return startTag + '/>';
                }
           } 
           return modelValue;
       },
       
       //DOM string to JSON
       decode : function(nodeValue){
           var self = this;
           var $nodeValue = (nodeValue instanceof jQuery) ? nodeValue : $(nodeValue);
           var result = [];
          
           _.forEach($nodeValue, function(elt){
               var object;
                if (elt.nodeType === 3) {
                    if (!_.isEmpty($.trim(elt.nodeValue))) {
                        result.push({
                            'qti-type': 'textRun',
                            'content': elt.nodeValue,
                            "xmlBase": ""
                        });
                    }
                } else if (elt.nodeType === 1){
                    object = _.merge({
                        'qti-type': elt.nodeName.toLowerCase(),
                        'id' : '',
                        'class' : '',
                        'xmlBase' : '',
                        'lang' : '',
                        'label' : ''
                    },
                    _.transform(elt.attributes, function(acc, value) {
                        acc[value['nodeName']] = value['nodeValue'];
                    })
                    );
                    if (elt.childNodes.length > 0) {
                        object.content = self.decode(elt.childNodes);
                    } 
                    result.push(object);
                }
            });
           return result;
       }
   };
});


