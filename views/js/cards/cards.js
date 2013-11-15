define(
['cards/toggler', 'cards/disabler', 'cards/adder', 'cards/closer', 'cards/incrementer', 'cards/inplacer', 'cards/btngrouper', 'cards/flipper'], 
function(toggler, disabler, adder, closer, incrementer, inplacer, btngrouper, flipper) {
    
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
        }
    };
});
