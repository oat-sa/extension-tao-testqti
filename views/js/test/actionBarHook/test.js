define([
    'jquery',
    'lodash',
    'taoQtiTest/testRunner/actionBarHook',
    'core/errorHandler'
], function($, _, actionBarHook, errorHandler){
    'use strict';

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
        },
        {
            'label' : 'hidden tool',
            'hook' : 'taoQtiTest/test/actionBarHook/hooks/validHookHidden'
        }
    ];
    
    QUnit.module('validation');
    
    QUnit.test('isValidConfig', function(assert){
        assert.ok(actionBarHook.isValid(tools[0]), 'tool valid');
        assert.ok(actionBarHook.isValid(tools[1]), 'tool valid');
        assert.ok(!actionBarHook.isValid(tools[2]), 'tool invalid');
        assert.ok(!actionBarHook.isValid(tools[3]), 'tool invalid');
        assert.ok(!actionBarHook.isValid(tools[4]), 'tool invalid');
        assert.ok(actionBarHook.isValid(tools[5]), 'tool valid');
        assert.ok(actionBarHook.isValid(tools[6]), 'tool valid');
        assert.ok(actionBarHook.isValid(tools[7]), 'tool valid');
    });
    
    QUnit.module('initQtiTool');
    
    QUnit.asyncTest('ok', function(assert){
        
        QUnit.expect(1);
        
        var $container = $('#' + containerId);
        actionBarHook.initQtiTool($container, 'tool1', tools[0], {});
        
        $container.on('ready.actionBarHook', function(){
            assert.equal($container.find('[data-control=tool1]').length, 1, 'button found');
            QUnit.start();
        });
        
    });
    
    QUnit.asyncTest('multiple times the same', function(assert){
        
        QUnit.expect(3);
        
        var $container = $('#' + containerId);
        actionBarHook.initQtiTool($container, 'tool1', tools[0], {});
        actionBarHook.initQtiTool($container, 'tool1', tools[0], {});
        actionBarHook.initQtiTool($container, 'tool1', tools[0], {});
        
        var count = 0;
        $container.on('ready.actionBarHook', function(){
            
            //no matter how many times the initQtiTool is called, only have one button available at once
            assert.equal($container.find('[data-control=tool1]').length, 1, 'button found');
            
            if(++count === 3){
                QUnit.start();
            }
        });
        
    });
    
    QUnit.test('hidden tool', function(assert){
        
        QUnit.expect(0);
        
        var $container = $('#' + containerId);
        actionBarHook.initQtiTool($container, 'tool1', tools[7], {});
        
        $container.on('ready.actionBarHook', function(){
            //the test is not supposed to be there
            assert.equal($container.find('[data-control=tool1]').length, 1, 'button found');
        });
        
    });
    
    QUnit.asyncTest('invalid hook', function(assert){
        
        QUnit.expect(2);
        var $container = $('#' + containerId);
        
        errorHandler.listen('.actionBarHook', function(err){
            assert.equal(err.message, 'invalid hook format', 'error thrown for invlid hook format');
            assert.equal($container.children('[data-control=toolX]').length, 0, 'button found');
            QUnit.start();
        });
        
        actionBarHook.initQtiTool($container, 'toolX', tools[5], {});
        
    });
    
    QUnit.asyncTest('inexisting hook', function(assert){
        
        QUnit.expect(2);
        var $container = $('#' + containerId);
        
        errorHandler.listen('.actionBarHook', function(err){
            assert.equal(err.message, 'the hook amd module cannot be found', 'error thrown for hook not found');
            assert.equal($container.children('[data-control=toolX]').length, 0, 'button found');
            QUnit.start();
        });
        
        actionBarHook.initQtiTool($container, 'toolX', tools[6], {});
        
    });

    QUnit.asyncTest('ordering', function(assert){

        QUnit.expect(5);

        var samples = [
            {
                'title' : 'tool A in position 1',
                'label' : 'tool A',
                'hook' : 'taoQtiTest/test/actionBarHook/hooks/validHook',
                'order' : 1
            },
            {
                'title' : 'tool B in position 2',
                'label' : 'tool B',
                'hook' : 'taoQtiTest/test/actionBarHook/hooks/validHook',
                'order' : 2
            },
            {
                'title' : 'tool A1 in position 1',
                'label' : 'tool A1',
                'hook' : 'taoQtiTest/test/actionBarHook/hooks/validHook',
                'order' : 1
            },
            {
                'title' : 'tool AX in invalid position',
                'label' : 'tool AX',
                'hook' : 'taoQtiTest/test/actionBarHook/hooks/validHook',
                'order' : 'X'
            }
        ];

        var $container = $('#' + containerId);
        actionBarHook.initQtiTool($container, 'toolB', samples[1], {});
        actionBarHook.initQtiTool($container, 'toolA', samples[0], {});
        actionBarHook.initQtiTool($container, 'toolX', samples[3], {});
        actionBarHook.initQtiTool($container, 'toolA1', samples[2], {});

        //check the order when all the buttons are ready
        var count = 0;
        $container.on('ready.actionBarHook', function(){
            if(++count === 4){
                var $buttons = $container.children('.action');
                assert.equal($buttons.length, 4, 'all four buttons added');
                assert.equal($($buttons[0]).data('control'), 'toolA');
                assert.equal($($buttons[1]).data('control'), 'toolA1');
                assert.equal($($buttons[2]).data('control'), 'toolB');
                assert.equal($($buttons[3]).data('control'), 'toolX');
                QUnit.start();
            }

        });
    });
    
});

