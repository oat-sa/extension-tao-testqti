define([
    'jquery',
    'lodash',
    'taoQtiTest/testRunner/actionBarHook',
    'core/errorHandler'
], function($, _, actionBarHook, errorHandler){

    var containerId = 'tools-container';

    var tools = [
        {
            'label' : 'tool 1',
            'hook' : 'taoQtiTest/test/actionBarHook/hooks/validHook'
        },
        {
            'title' : 'my tool 1 does amazing stuff',
            'label' : 'tool 1',
            'hook' : 'taoQtiTest/test/actionBarHook/hooks/validHook'
        },
        'taoQtiTest/test/actionBarHook/hooks/validHook',
        {
            'title' : 'my tool 1 does amazing stuff',
            'label' : 'tool 1'
        },
        {
            'title' : 'my tool 1 does amazing stuff',
            'hook' : 'taoQtiTest/test/actionBarHook/hooks/validHook'
        },
        {
            'label' : 'tool X',
            'hook' : 'taoQtiTest/test/actionBarHook/hooks/invalidHookMissingMethod'
        },
        {
            'label' : 'tool X',
            'hook' : 'taoQtiTest/test/actionBarHook/hooks/noexisting'
        }
    ];

    QUnit.test('isValid', function(assert){
        assert.ok(actionBarHook.isValid(tools[0]), 'tool valid');
        assert.ok(actionBarHook.isValid(tools[1]), 'tool valid');
        assert.ok(!actionBarHook.isValid(tools[2]), 'tool invalid');
        assert.ok(!actionBarHook.isValid(tools[3]), 'tool invalid');
        assert.ok(!actionBarHook.isValid(tools[4]), 'tool invalid');
        assert.ok(actionBarHook.isValid(tools[5]), 'tool valid');
        assert.ok(actionBarHook.isValid(tools[6]), 'tool valid');
    });

    QUnit.asyncTest('initQtiTool ok', function(assert){
        
        QUnit.expect(1);
        
        var $container = $('#' + containerId);
        actionBarHook.initQtiTool($container, 'tool1', tools[0], {});
        
        $container.on('ready.actionBarHook', function(){
            assert.equal($container.find('[data-control=tool1]').length, 1, 'button found');
            QUnit.start();
        });
        
    });
    
    QUnit.asyncTest('initQtiTool invalid hook', function(assert){
        
        QUnit.expect(2);
        var $container = $('#' + containerId);
        
        errorHandler.listen('.actionBarHook', function(err){
            assert.equal(err.message, 'invalid hook format', 'error thrown for invlid hook format');
            assert.equal($container.children('[data-control=toolX]').length, 0, 'button found');
            QUnit.start();
        });
        
        actionBarHook.initQtiTool($container, 'toolX', tools[5], {});
        
    });
    
    QUnit.asyncTest('initQtiTool inexisting hook', function(assert){
        
        QUnit.expect(2);
        var $container = $('#' + containerId);
        
        errorHandler.listen('.actionBarHook', function(err){
            assert.equal(err.message, 'the hook amd module cannot be found', 'error thrown for hook not found');
            assert.equal($container.children('[data-control=toolX]').length, 0, 'button found');
            QUnit.start();
        });
        
        actionBarHook.initQtiTool($container, 'toolX', tools[6], {});
        
    });
});

