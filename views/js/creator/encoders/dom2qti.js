/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define(['jquery', 'lodash'], function($, _){
    
   /**
    * Get the list of objects attributes to encode
    * @param {Object} object
    * @returns {Array}
    */
   var getAttributes = function getAttributes(object){
        return _.omit(object, [
           'qti-type',
           'content',
           'xmlBase',
           'lang',
           'label'
        ]);
   };
   
   /**
    * Encode object's properties to xml/html string attributes
    * @param {Object} attributes
    * @returns {string}
    */
   var attrToStr = function attrToStr(attributes){
     return _.reduce(attributes, function(acc, value, key){
         if(_.isNumber(value) || (_.isString(value) && !_.isEmpty(value)) ){
             return acc + ' ' + key + '="'+ value + '" ';
         }
         return acc;
     }, '');  
   };
    
   /**
    * This encoder is used to transform DOM to JSON QTI and JSON QTI to DOM. 
    * It works now for the rubricBlocks components.
    * @exports creator/encoders/dom2qti
    */
   var Dom2QtiEncoder = {
       
       /**
        * Encode an object to a dom string
        * @param {Object} modelValue
        * @returns {string}
        */
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
       
       /**
        * Decode a string that represents a DOM to a QTI formated object
        * @param {string} nodeValue
        * @returns {Array}
        */
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
   
   return Dom2QtiEncoder;
});


