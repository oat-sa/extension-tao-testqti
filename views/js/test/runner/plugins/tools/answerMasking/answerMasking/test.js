/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA;
 */
/**
 * @author Christophe Noël <christophe@taotesting.com>
 */
define([
    'jquery',
    'taoItems/runner/api/itemRunner',
    'taoQtiItem/runner/provider/qti',
    'taoQtiTest/runner/plugins/tools/answerMasking/answerMasking',
    'json!taoQtiTest/test/runner/plugins/tools/answerMasking/answerMasking/data/qti.json'
], function ($, itemRunner, qtiRuntimeProvider, answerMaskingFactory, itemData) {
    'use strict';

    itemRunner.register('qti', qtiRuntimeProvider);

    QUnit.module('plugin');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof answerMaskingFactory === 'function', 'The module expose a function');
    });

    QUnit
        .cases([
            { title: 'enable' },
            { title: 'disable' },
            { title: 'getState' },
            { title: 'setState' }
        ])
        .test('API', function (data, assert) {
            var answerMasking = answerMaskingFactory($('<div>'));

            QUnit.expect(1);

            assert.ok(typeof answerMasking[data.title] === 'function', 'The instance has a ' + data.title + ' method');
        });

    QUnit.module('Area Masking');

    QUnit.asyncTest('Create / destroy mask markup', function(assert) {
        var $container = $('#qunit-fixture');

        QUnit.expect(49);

        itemRunner('qti', itemData)
            .on('render', function(){
                var answerMasking = answerMaskingFactory($container),
                    $choiceInteractions = $container.find('.qti-choiceInteraction'),
                    $qtiChoices = $container.find('.qti-choice'),
                    $choice,
                    $mask,
                    i;

                answerMasking.enable();

                assert.equal($choiceInteractions.length, 3, '3 choice interactions found');
                assert.equal($qtiChoices.length, 9, '9 qti choices found');
                assert.ok($choiceInteractions.hasClass('maskable'), 'choice interactions have been set a maskable');

                for (i = 0; i < 9; i++) {
                    $choice = $qtiChoices.eq(i);
                    assert.ok($choice.hasClass('masked'), 'choice is masked');

                    $mask = $choice.find('.answer-mask');
                    assert.equal($mask.length, 1, 'choice contains a mask');
                    assert.ok($mask.hasClass('masked'), 'mask is active');
                }

                answerMasking.disable();

                assert.ok(! $choiceInteractions.hasClass('maskable'), 'choice interactions are not maskable anymore');

                for (i = 0; i < 9; i++) {
                    $choice = $qtiChoices.eq(i);
                    assert.ok(! $choice.hasClass('masked'), 'choice is not masked anymore');

                    $mask = $choice.find('.answer-mask');
                    assert.equal($mask.length, 0, 'choice does not contains a mask anymore');
                }

                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('Mask toggle', function(assert) {
        var $container = $('#qunit-fixture');

        QUnit.expect(3);

        itemRunner('qti', itemData)
            .on('render', function(){
                var answerMasking = answerMaskingFactory($container),
                    $allMasks,
                    $mask,
                    $toggle;

                answerMasking.enable();

                $allMasks = $container.find('.answer-mask');

                $mask = $allMasks.eq(0);
                $toggle = $mask.find('.answer-mask-toggle');

                assert.ok($mask.hasClass('masked'), 'mask is active');

                $mask.click();
                assert.ok(! $mask.hasClass('masked'), 'mask is not active anymore');

                $toggle.click();
                assert.ok($mask.hasClass('masked'), 'mask is active again!');

                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.asyncTest('getMasksState / setMasksState', function(assert) {
        var $container = $('#qunit-fixture');

        QUnit.expect(24);

        itemRunner('qti', itemData)
            .on('render', function(){
                var answerMasking = answerMaskingFactory($container),
                    $allMasks,
                    state;

                answerMasking.enable();

                $allMasks = $container.find('.answer-mask');
                assert.equal($allMasks.length, 9, 'masks have been created');
                assert.ok($allMasks.hasClass('masked'), 'all masks are active by default');

                $allMasks.eq(0).click();
                $allMasks.eq(2).click();
                $allMasks.eq(4).click();
                $allMasks.eq(6).click();
                $allMasks.eq(8).click();

                assert.ok(! $allMasks.eq(0).hasClass('masked'), 'mask 0 has been set inactive');
                assert.ok($allMasks.eq(1).hasClass('masked'), 'mask 1 is active');
                assert.ok(! $allMasks.eq(2).hasClass('masked'), 'mask 2 has been set inactive');
                assert.ok($allMasks.eq(3).hasClass('masked'), 'mask 3 is active');
                assert.ok(! $allMasks.eq(4).hasClass('masked'), 'mask 4 has been set inactive');
                assert.ok($allMasks.eq(5).hasClass('masked'), 'mask 5 is active');
                assert.ok(! $allMasks.eq(6).hasClass('masked'), 'mask 6 has been set inactive');
                assert.ok($allMasks.eq(7).hasClass('masked'), 'mask 7 is active');
                assert.ok(! $allMasks.eq(8).hasClass('masked'), 'mask 8 has been set inactive');

                state = answerMasking.getMasksState();

                assert.deepEqual(state, [false, true, false, true, false, true, false, true, false], 'correct state has been returned');

                answerMasking.disable();

                $allMasks = $container.find('.answer-mask');
                assert.equal($allMasks.length, 0, 'masks have been destroyed');

                answerMasking.enable();

                $allMasks = $container.find('.answer-mask');
                assert.equal($allMasks.length, 9, 'masks have been created again');
                assert.ok($allMasks.hasClass('masked'), 'all masks are active by default');

                answerMasking.setMasksState(state);

                assert.ok(! $allMasks.eq(0).hasClass('masked'), 'mask 0 has been set inactive - state restored');
                assert.ok($allMasks.eq(1).hasClass('masked'), 'mask 1 is active - state restored');
                assert.ok(! $allMasks.eq(2).hasClass('masked'), 'mask 2 has been set inactive - state restored');
                assert.ok($allMasks.eq(3).hasClass('masked'), 'mask 3 is active - state restored');
                assert.ok(! $allMasks.eq(4).hasClass('masked'), 'mask 4 has been set inactive - state restored');
                assert.ok($allMasks.eq(5).hasClass('masked'), 'mask 5 is active - state restored');
                assert.ok(! $allMasks.eq(6).hasClass('masked'), 'mask 6 has been set inactive - state restored');
                assert.ok($allMasks.eq(7).hasClass('masked'), 'mask 7 is active - state restored');
                assert.ok(! $allMasks.eq(8).hasClass('masked'), 'mask 8 has been set inactive - state restored');

                QUnit.start();
            })
            .init()
            .render($container);
    });

    QUnit.module('Visual Test');

    QUnit.asyncTest('Display and play', function(assert){
        var $container = $('#outside-container'),
            state = [];

        QUnit.expect(1);

        itemRunner('qti', itemData)
            .on('render', function(){
                var answerMasking = answerMaskingFactory($container),
                    $toggle = $('<button>', {
                        class: 'btn-info small',
                        html: 'toggle Answer Masking'
                    });

                $toggle.on('click', function() {
                    if (answerMasking.getState('enabled')) {
                        state = answerMasking.getMasksState();
                        answerMasking.disable();
                    } else  {
                        answerMasking.enable();
                        answerMasking.setMasksState(state);
                    }
                });

                $container.append($toggle);

                assert.ok(true, 'sample item has been rendered');
                QUnit.start();
            })
            .init()
            .render($container);
    });
});