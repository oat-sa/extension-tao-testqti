define(
['lodash', 'cards/core/encoder/boolean', 'cards/core/encoder/number', 'cards/core/encoder/time', 'cards/core/encoder/htmlstr', 'cards/core/encoder/array'], 
function(_, boolean, number, time, htmlstr, array){
    
    var extractArgs = function extractArgs(name){
        var args = [];
        var matches = []; 
        if(name.indexOf('(') > -1){
            matches = /\((.+?)\)/.exec(name);
            if(matches && matches.length >= 1){
                args = matches[1].split(',');
            }
        }
        return args;
    };
    
    var extractName = function extractName(name){
        if(name.indexOf('(') > -1){
            return name.substr(0, name.indexOf('('));
        }
        return name;
    };
    
    var Encoders =  {
        number : number,
        time : time,
        boolean : boolean,
        htmlstr : htmlstr,
        array : array,
        
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
            name = extractName(name);
            if(this[name]){
                var encoder = this[name];
                var args = [value];
                return encoder.encode.apply(encoder, args.concat(extractArgs(name)));
            }
            return value;
        },
        
        decode : function(name, value){
            name = extractName(name);
            if(this[name]){
                var decoder = this[name];
                var args = [value];
                return decoder.decode.apply(decoder, args.concat(extractArgs(name)));
            }
            return value;
        }
    };
    
    return Encoders;
});

