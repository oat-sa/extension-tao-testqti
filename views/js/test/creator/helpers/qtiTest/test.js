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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoQtiTest/controller/creator/helpers/qtiTest'
], function (qtiTestHelper) {
    'use strict';


    QUnit.module('API');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof qtiTestHelper, 'object', "The module exposes an object");
    });

    QUnit.cases([{
        title: 'idAvailableValidator'
    }]).test('method ', function (data, assert) {
        QUnit.expect(1);
        assert.equal(typeof qtiTestHelper[data.title], 'function', 'The helper exposes a "' + data.title + '" method');
    });


    QUnit.module('validators');

    QUnit.test('idAvailableValidator is a validator', function (assert) {
        var identifierValidator =  qtiTestHelper.idAvailableValidator();

        QUnit.expect(3);

        assert.equal(typeof identifierValidator, 'object', 'The method creates an object');
        assert.equal(typeof identifierValidator.validate, 'function', 'The generated validator has the validate method');
        assert.equal(identifierValidator.name, 'testIdAvailable', 'The validator name is correct');
    });

    QUnit.cases([{
        ids : ['foo', 'bar'],
        value: 'noz',
        result : true
    }, {
        ids : ['foo', 'bar', 'foo'],
        value: 'foo',
        result : false
    }]).asyncTest('idAvailableValidator validates by list', function (data, assert) {
        QUnit.expect(1);
        qtiTestHelper.idAvailableValidator(data.ids).validate(data.value, function(result){
            assert.equal(data.result, result);
            QUnit.start();
        });
    });

    QUnit.asyncTest('idAvailableValidator validates by model', function (assert) {
        var modelOverseerMock = {
            getModel : function getModel(){
                return {
                    identifier : 'foo',
                    testParts : [{
                        identfier: 'bar',
                    }, {
                        identfier: 'noz',
                        sections : [{
                            identfier: 'bee',
                        }, {
                            identifier: 'foo'
                        }]
                    }]
                };
            }
        };

        QUnit.expect(1);

        qtiTestHelper.idAvailableValidator(null, modelOverseerMock).validate('foo', function(result){
            assert.ok(!result, 'The validator invalidate the value');
            QUnit.start();
        });
    });
});
