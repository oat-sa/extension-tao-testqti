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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA
 */
/**
 * @author Dieter Raber <dieter@taotesting.com>
 */
define([
    'jquery',
    'taoTests/runner/runner',
    'taoQtiTest/test/runner/mocks/providerMock',
    'taoQtiTest/runner/plugins/tools/answerElimination/eliminator'
], function($, runnerFactory, providerMock, eliminatorFactory) {
    'use strict';

    var providerName = 'mock';
    runnerFactory.registerProvider(providerName, providerMock());

    QUnit.module('eliminatorFactory');

    QUnit.test('module', function(assert) {
        assert.ok(typeof eliminatorFactory === 'function', 'Module exposes a function');
    });

    QUnit.module('Eliminator Mode');

    QUnit.asyncTest('Toggle eliminator mode on/off', function(assert) {
        var runner      = runnerFactory(providerName);
        var areaBroker  = runner.getAreaBroker();
        var eliminator  = eliminatorFactory(runner, areaBroker);
        var interaction = document.querySelector('.qti-choiceInteraction');

        runner.setTestContext({
            options: {
                eliminator: true
            }
        });

        areaBroker.getContentArea().append(interaction);
        eliminator.init()
            .then(function() {
                runner.trigger('renderitem');
                runner.trigger('tool-eliminator-toggle');
                assert.ok(interaction.classList.contains('eliminable'), 'Class "eliminable" has been added');
                runner.trigger('tool-eliminator-toggle');
                assert.ok(!interaction.classList.contains('eliminable'), 'Class "eliminable" has been removed');
                QUnit.start();
            });
    });

});
