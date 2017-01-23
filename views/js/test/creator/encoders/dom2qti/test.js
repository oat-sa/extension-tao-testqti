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
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 */

/**
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'taoQtiTest/controller/creator/encoders/dom2qti',
    'json!taoQtiTest/test/creator/encoders/dom2qti/rubricBlock.json',
    'tpl!taoQtiTest/test/creator/encoders/dom2qti/rubricBlock',
    'json!taoQtiTest/test/creator/encoders/dom2qti/multiRoots.json',
    'tpl!taoQtiTest/test/creator/encoders/dom2qti/multiRoots',
    'json!taoQtiTest/test/creator/encoders/dom2qti/feedbackBlock.json',
    'tpl!taoQtiTest/test/creator/encoders/dom2qti/feedbackBlock'
], function($, dom2qti, rubricBlockJson, rubricBlockTpl, multiRootsJson, multiRootsTpl, feedbackBlockJson, feedbackBlockTpl){
    'use strict';

    var dom2qtiApi = [
        {title: 'encode'},
        {title: 'decode'}
    ];

    var dom2qtiCases = [{
        title: 'structured rubric block',
        text: rubricBlockTpl(),
        model: rubricBlockJson
    }, {
        title: 'multi roots rubric block',
        text: multiRootsTpl(),
        model: multiRootsJson
    }, {
        title: 'feedback block',
        text: feedbackBlockTpl(),
        model: feedbackBlockJson
    }];


    QUnit.module('encoders/dom2qti');


    QUnit.test('module', function (assert) {
        QUnit.expect(1);
        assert.equal(typeof dom2qti, 'object', "The dom2qti encoder module exposes an object");
    });


    QUnit
        .cases(dom2qtiApi)
        .test('encoders/dom2qti API ', function (data, assert) {
            QUnit.expect(1);
            assert.equal(typeof dom2qti[data.title], 'function', 'The dom2qti encoder exposes a "' + data.title + '" function');
        });


    QUnit
        .cases(dom2qtiCases)
        .test('encoders/dom2qti.encode() ', function(data, assert){
            var result = dom2qti.encode(data.text);
            var pattern = /\s/g;
            QUnit.expect(1);
            assert.equal(result.replace(pattern, ''), data.text.replace(pattern, ''));
        });

    QUnit
        .cases(dom2qtiCases)
        .test('encoders/dom2qti.encode() #already encoded ', function(data, assert){
            var result = dom2qti.encode(data.model);
            var pattern = /\s/g;
            QUnit.expect(1);
            assert.equal(result.replace(pattern, ''), data.text.replace(pattern, ''));
        });


    QUnit
        .cases(dom2qtiCases)
        .test('encoders/dom2qti.decode() ', function(data, assert){
            var result = dom2qti.decode(data.text.replace(/\s+/gm, ' '));
            QUnit.expect(1);
            assert.deepEqual(result, data.model);
        });
});
