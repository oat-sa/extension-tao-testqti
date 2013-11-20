define([
    'cards/toggler', 
    'cards/disabler', 
    'cards/adder', 
    'cards/closer', 
    'cards/incrementer', 
    'cards/inplacer', 
    'cards/btngrouper', 
    'cards/flipper',
    'cards/durationer'
], function(toggler, disabler, adder, closer, incrementer, inplacer, btngrouper, flipper, durationer) {
    
    return {
        start : function($container){
            adder($container);
            btngrouper($container);
            closer($container);
            disabler($container);
            toggler($container);
            incrementer($container);
            inplacer($container);
            flipper($container);
            durationer($container);
        }
    };
});
