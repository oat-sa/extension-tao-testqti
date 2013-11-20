define([
    'cards/ui/toggler', 
    'cards/ui/disabler', 
    'cards/ui/adder', 
    'cards/ui/closer', 
    'cards/ui/incrementer', 
    'cards/ui/inplacer', 
    'cards/ui/btngrouper', 
    'cards/ui/flipper',
    'cards/ui/durationer'
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
