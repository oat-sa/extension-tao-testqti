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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

/**
 * @author Aleksej Tikhanovich <aleksej@taotesting.com>
 */
define([
    'jquery',
    'taoQtiTest/runner/ui/catEngineWarning'
], function($, catEngineWarningFactory) {
    'use strict';

    var _defaults = {
        echoDelayUpdate: 1,
        echoPauseLimit: 5
    };

    QUnit.module('API');

    QUnit.test('factory', function (assert) {
        QUnit.expect(3);
        assert.ok(typeof catEngineWarningFactory === 'function', 'the module exposes a function');
        assert.ok(typeof catEngineWarningFactory(false, []) === 'object', 'the factory creates an object');
        assert.notEqual(catEngineWarningFactory(_defaults), catEngineWarningFactory(_defaults), 'the factory creates new objects');
    });

    QUnit.test('component', function (assert) {
        var catEngineWarning;

        QUnit.expect(2);

        catEngineWarning = catEngineWarningFactory(_defaults);

        assert.ok(typeof catEngineWarning.show === 'function', 'the component has a show method');
        assert.ok(typeof catEngineWarning.finish === 'function', 'the component has a finish method');
    });

    QUnit.test('eventifier', function (assert) {
        var catEngineWarning;

        QUnit.expect(3);

        catEngineWarning = catEngineWarningFactory(_defaults);

        assert.ok(typeof catEngineWarning.on === 'function', 'the component has a on method');
        assert.ok(typeof catEngineWarning.off === 'function', 'the component has a off method');
        assert.ok(typeof catEngineWarning.trigger === 'function', 'the component has a trigger method');
    });

    QUnit.module('Visual');

    QUnit.asyncTest('renderDialogBox', function (assert) {
        var catEngineWarning;
        var container;
        var button;
        QUnit.expect(3);
        catEngineWarning = catEngineWarningFactory(_defaults);
        catEngineWarning
            .on('recheck.warning', function () {
                assert.ok(true, 'Recheck is completed');
                catEngineWarning
                    .on('disableitem.warning', function () {
                        assert.ok(true, 'Dialog box with success message is generated');
                        container = $('.modal-body');
                        button = $('.buttons button', container);
                        button.click();
                    }).finish();
            })
            .on('proceed.warning', function(){
                assert.ok(true, 'Dialog box with success message is closed');
                QUnit.start();
            })
            .show();
    });

});
