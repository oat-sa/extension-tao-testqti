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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Martin Nicholson <martin@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/runner/plugins/navigation/next/dialogConfirmNext'
], function($, _, dialogConfirmNext) {
    'use strict';

    QUnit.module('dialogConfirmNext');


    QUnit.test('module', 3, function(assert) {
        var conf1 = dialogConfirmNext();
        var conf2 = dialogConfirmNext();
        assert.equal(typeof dialogConfirmNext, 'function', "The dialogConfirmNext module exposes a function");
        assert.equal(typeof conf1, 'object', "The dialogConfirmNext factory produces an object");
        assert.notStrictEqual(conf1, conf2, "The dialogConfirmNext factory provides a different object on each call");
        conf1.destroy();
        conf2.destroy();
    });

    var dialogApi = [
        { name : 'init' },
        { name : 'destroy' },
        { name : 'setButtons' },
        { name : 'render' },
        { name : 'show' },
        { name : 'hide' },
        { name : 'trigger' },
        { name : 'on' },
        { name : 'off' },
        { name : 'getDom' }
    ];

    QUnit
        .cases(dialogApi)
        .test('instance API ', function(data, assert) {
            var instance = dialogConfirmNext();
            assert.equal(typeof instance[data.name], 'function', 'The dialogConfirmNext instance exposes a "' + data.name + '" function');
            instance.destroy();
        });

    QUnit.asyncTest('events', function(assert) {
        var heading = 'heading';
        var message = 'test';
        var renderTo = "#qunit-fixture";
        var eventRemoved = false;
        var modal = dialogConfirmNext(heading, message, null, null, {}, {renderTo: renderTo});

        QUnit.stop(1);

        modal.on('custom', function() {
            if (eventRemoved) {
                assert.ok(false, "The dialog box has triggered a removed event");
            } else {
                assert.ok(true, "The dialog box has triggered the custom event");
                modal.off('custom');
                eventRemoved = true;
                setTimeout(function() {
                    assert.ok(true, "The dialog box has not triggered the remove event");
                    QUnit.start();

                }, 250);
                modal.trigger('custom');
            }
            QUnit.start();
        });

        assert.equal(typeof modal, 'object', "The dialog instance is an object");
        assert.equal(typeof modal.getDom(), 'object', "The dialog instance gets a DOM element");
        assert.ok(!!modal.getDom().length, "The dialog instance gets a DOM element");
        assert.equal(modal.getDom().find('h4').text(), heading, "The dialog box displays the heading");
        assert.equal(modal.getDom().find('.message').text(), message, "The dialog box displays the message");

        modal.trigger('custom');
    });

    var confirmCases = [{
        message: 'must accept',
        button: 'ok',
        title: 'accept'
    }, {
        message: 'must refuse',
        button: 'cancel',
        title: 'refuse'
    }];

    QUnit
        .cases(confirmCases)
        .asyncTest('use ', function(data, assert) {
            var accept = function() {
                assert.equal(data.button, 'ok', 'The dialogConfirm has triggered the accept callback function when hitting the ok button!');
                QUnit.start();
            };
            var refuse = function() {
                assert.equal(data.button, 'cancel', 'The dialogConfirm has triggered the refuse callback function when hitting the cancel button!');
                QUnit.start();
            };
            var modal = dialogConfirmNext('', '', accept, refuse, {}, data.options || {});

            assert.equal(typeof modal, 'object', "The dialogConfirm instance is an object");
            assert.equal(typeof modal.getDom(), 'object', "The dialogConfirm instance gets a DOM element");
            assert.ok(!!modal.getDom().length, "The dialogConfirm instance gets a DOM element");
            assert.equal(modal.getDom().parent().length, 1, "The dialogConfirm box is rendered by default");

            assert.equal(modal.getDom().find('button').length, 2, "The dialogConfirm box displays 2 buttons");
            assert.equal(modal.getDom().find('button[data-control="ok"]').length, 1, "The dialogConfirm box displays a 'ok' button");
            assert.equal(modal.getDom().find('button[data-control="cancel"]').length, 1, "The dialogConfirm box displays a 'cancel' button");

            modal.getDom().find('button[data-control="' + data.button + '"]').click();
        });

    QUnit
        .cases(['checked', 'unchecked'])
        .asyncTest('checkbox', function(data, assert) {
            var accept = function() {
                assert.ok(true, 'The dialogConfirm has triggered the accept callback function when hitting the ok button!');
            };
            var checkedCb = function() {
                assert.ok(true, 'The checked checkbox callback was called on accept');
                QUnit.start();
            };
            var uncheckedCb = function() {
                assert.ok(true, 'The unchecked checkbox callback was called on accept');
                QUnit.start();
            };

            var modal = dialogConfirmNext('', '', accept, null, {submitChecked: checkedCb, submitUnchecked: uncheckedCb});
            var $checkbox = $('input[name="dont-show-again"]', modal.getDom());

            if (data === 'checked') {
                $checkbox.prop('checked', true);
            }
            else {
                $checkbox.prop('checked', false);
            }

            modal.getDom().find('button[data-control="ok"]').click();
        });

});
