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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'taoQtiTest/testRunner/actionBar/collapseReview'
], function($, _, collapseReview) {
    'use strict';

    // global mock for button config
    var configMock = {
        label: 'Collapse review',
        icon: 'anchor',
        hook: 'taoQtiTest/testRunner/actionBar/collapseReview'
    };


    QUnit.module('collapseReview');


    QUnit.test('module', function(assert) {
        assert.equal(typeof collapseReview, 'object', "The collapseReview module exposes an object");
    });


    var testReviewApi = [
        { name : 'init', title : 'init' },
        { name : 'clear', title : 'clear' },
        { name : 'isVisible', title : 'isVisible' }
    ];

    QUnit
        .cases(testReviewApi)
        .test('API ', function(data, assert) {
            assert.equal(typeof collapseReview[data.name], 'function', 'The collapseReview module exposes a "' + data.title + '" function');
        });


    QUnit.test('button enabled/disabled', function(assert) {
        var testContextMock = {
            reviewScreen: true
        };

        assert.ok(collapseReview.isVisible(configMock, testContextMock), 'The collapseReview button is visible when the test taker screen is enabled');

        testContextMock.reviewScreen = false;
        assert.ok(!collapseReview.isVisible(configMock, testContextMock), 'The collapseReview button is not visible when the test taker screen is disabled');
    });


    QUnit.asyncTest('button install/uninstall', function(assert) {
        var callExpected = true;
        var testRunnerMock = {
            toggle: function() {
                if (callExpected) {
                    assert.ok(true, 'The button must trigger a call to toggle');
                    QUnit.start();
                } else {
                    assert.ok(false, 'The button must not trigger a call to toggle');
                }
            }
        };

        var testContextMock = {
            reviewScreen: true
        };

        var $btn = $('#mark-for-review-1');

        collapseReview.init($btn, configMock, testContextMock, testRunnerMock);

        $btn.click();

        collapseReview.clear();

        QUnit.stop();
        _.defer(function() {
            assert.ok(true, 'The button is uninstalled and did not trigger a call to collapseReview');
            QUnit.start();
        }, 100);
        $btn.click();

    });


    QUnit.test('button active/idle', function(assert) {
        var testRunnerMock = {
            toggle: function() {},
            hidden: true
        };

        var testContextMock = {
            reviewScreen: true
        };

        var $btn = $('#mark-for-review-2');

        collapseReview.init($btn, configMock, testContextMock, testRunnerMock);
        assert.ok($btn.hasClass('active'), 'The collapseReview button is activated when the component is hidden');


        $btn = $('#mark-for-review-3');

        testRunnerMock.hidden = false;
        collapseReview.init($btn, configMock, testContextMock, testRunnerMock);
        assert.ok(!$btn.hasClass('active'), 'The collapseReview button is idled when the component is visible');
    });


    QUnit.asyncTest('button click', function(assert) {
        var expectedHidden = true;

        var testRunnerMock = {
            toggle: function() {
                testRunnerMock.hidden = !testRunnerMock.hidden;
                assert.equal(testRunnerMock.hidden, expectedHidden, 'The collapseReview button state must reflect the display state of the component');
                assert.equal(!$btn.hasClass('active'), testRunnerMock.hidden, 'The collapseReview button is active when the component is hidden, or idle when the component is visible');
                QUnit.start();
            },
            hidden: false
        };

        var testContextMock = {
            reviewScreen: true
        };

        var $btn = $('#mark-for-review-4');

        collapseReview.init($btn, configMock, testContextMock, testRunnerMock);
        assert.ok(!$btn.hasClass('active'), 'The collapseReview button is idled when the component is visible');

        $btn.click();

        QUnit.stop();
        expectedHidden = false;
        $btn.click();

        QUnit.stop();
        expectedHidden = true;
        $btn.click();

        QUnit.stop();
        expectedHidden = false;
        $btn.click();
    });

});
