define(
['lodash', 'cards/core/encoder/boolean', 'cards/core/encoder/number', 'cards/core/encoder/time', 'cards/core/encoder/htmlstr'], 
function(_, boolean, number, time, htmlstr){
    var Encoders =  {
        number : number,
        time : time,
        boolean : boolean,
        htmlstr : htmlstr,
        
        register : function(name, encode, decode){
            if(!_.isString(name)){
                throw new Error('An encoder must have a valid name');
            }
            if(!_.isFunction(encode)){
                throw new Error('Encode must be a function');
            }
            if(!_.isFunction(decode)){
                throw new Error('Decode must be a function');
            }
            this[name] = { encode : encode, decode : decode };
        },
        
        encode : function(name, value){
            if(this[name]){
                return this[name].encode(value);
            }
            return value;
        },
        
        decode : function(name, value){
            if(this[name]){
                return this[name].decode(value);
            }
            return value;
        }
    };
    
    return Encoders;
});

