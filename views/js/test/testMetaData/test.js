/*
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 *
 */
require([
    'lodash',
    'jquery',
    'taoQtiTest/testRunner/testMetaData'
], function (_, $, TestMetaData) {
    'use strict';

    QUnit.test("Constructor", function () {
        var testServiceCallId = "http://sample/first.rdf#i14435993288775133.item-1.0";
        QUnit.assert.throws(
            function() {
                new TestMetaData();
            },
            "testServiceCallId option is required"
        );

        var testMetaData = new TestMetaData({
            testServiceCallId : testServiceCallId
        });

        QUnit.equal(testMetaData.getTestServiceCallId(), testServiceCallId);
        testMetaData.clearData();
    });

    QUnit.test("setData", function () {
        var testServiceCallId, testObject1, testObject2;
        testServiceCallId = "http://sample/first.rdf#i14435993288775133.item-2.0";
        testObject1 = {
            param1: 1,
            param2: 2
        };
        testObject2 = {
            param1: 3,
            param2: 4
        };

        var testMetaData = new TestMetaData({
            testServiceCallId : testServiceCallId
        });

        testMetaData.setData(testObject1);
        //Data should be cloned
        QUnit.notEqual(testMetaData.getData(), testObject1);
        QUnit.deepEqual(testMetaData.getData(), testObject1);

        //should not be overwritten
        testMetaData.setData(testObject2);
        QUnit.deepEqual(testMetaData.getData(), testObject2);
        testMetaData.clearData();
    });

    QUnit.test("addData", function () {
        var testServiceCallId, testObject1, testObject2;
        testServiceCallId = "http://sample/first.rdf#i14435993288775133.item-3.0";
        testObject1 = {
            param1: 1,
            param2: 2
        };
        testObject2 = {
            param1: 3,
            param2: 4
        };

        var testMetaData = new TestMetaData({
            testServiceCallId : testServiceCallId
        });

        testMetaData.setData(testObject1);

        //should not be overwritten
        testMetaData.addData(testObject2);
        QUnit.deepEqual(testMetaData.getData(), testObject1);

        //should be overwritten
        testMetaData.addData(testObject2, true);
        QUnit.deepEqual(testMetaData.getData(), testObject2);
        testMetaData.clearData();
    });


    QUnit.test("clearData", function () {
        var testServiceCallId, testServiceCallId2, testObject1;
        testServiceCallId = "http://sample/first.rdf#i14435993288775133.item-4.0";
        testServiceCallId2 = "http://sample/first.rdf#i14435993288775133.item-5.0";
        testObject1 = {
            param1: 1,
            param2: 2
        };

        var testMetaData = new TestMetaData({
            testServiceCallId : testServiceCallId
        });

        testMetaData.setData(testObject1);
        QUnit.deepEqual(testMetaData.getData(), testObject1);


        var testMetaData2 = new TestMetaData({
            testServiceCallId : testServiceCallId
        });
        //the same testServiceCallId - the same data
        QUnit.deepEqual(testMetaData.getData(), testMetaData2.getData());

        var testMetaData3 = new TestMetaData({
            testServiceCallId : testServiceCallId2
        });
        //different testServiceCallId - different data
        QUnit.deepEqual(testMetaData3.getData(), {});

        testMetaData.clearData();
        QUnit.deepEqual(localStorage.getItem(testMetaData.getLocalStorageKey()), null);
        QUnit.deepEqual(testMetaData.getData(), {});
        QUnit.notEqual(localStorage.getItem(testMetaData3.getLocalStorageKey()), null);

        testMetaData3.clearData();
        QUnit.deepEqual(localStorage.getItem(testMetaData3.getLocalStorageKey()), null);

        var testMetaData4 = new TestMetaData({
            testServiceCallId : testServiceCallId
        });
        QUnit.deepEqual(testMetaData4.getData(), {});
    });

});