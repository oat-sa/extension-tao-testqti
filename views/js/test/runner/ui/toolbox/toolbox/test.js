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
    'taoQtiTest/runner/ui/toolbox/toolbox'
], function ($, toolboxFactory) {
    'use strict';

    var fixtureContainer = '#qunit-fixture';


    QUnit.module('plugin');

    QUnit.test('module', function (assert) {
        QUnit.expect(1);

        assert.ok(typeof toolboxFactory === 'function', 'The module expose a function');
    });


    QUnit.module('Toolbox rendering');

    QUnit.test('.render()', function() {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            $result;

        QUnit.expect(1);

        toolbox.init();
        toolbox.render($container);

        $result = $container.find('.tools-box-list');

        QUnit.equal($result.length, 1, 'toolbox has been rendered');
    });


    QUnit.module('Item creation and rendering');

    QUnit.test('.createText()', function() {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            $result;

        QUnit.expect(3);

        toolbox.init();
        toolbox.createText({
            control: 'sample-text',
            className: 'sample-class',
            text: 'Sample text!'
        });
        toolbox.render($container);

        $result = $container.find('[data-control="sample-text"]');

        QUnit.equal($result.length, 1, 'text item has been rendered');
        QUnit.equal($result.text().trim(), 'Sample text!', 'text item has the correct text');
        QUnit.ok($result.hasClass('sample-class'), 'text item has the correct class');
    });

    QUnit.test('.createEntry()', function() {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            $result;

        QUnit.expect(5);

        toolbox.init();
        toolbox.createEntry({
            control: 'sample-entry',
            title: 'Sample title!',
            icon: 'result-ok',
            className: 'sample-class',
            text: 'Sample entry!'
        });
        toolbox.render($container);

        $result = $container.find('[data-control="sample-entry"]');

        QUnit.equal($result.length, 1, 'entry item has been rendered');
        QUnit.equal($result.text().trim(), 'Sample entry!', 'entry item has the correct text');
        QUnit.equal($result.attr('title'), 'Sample title!', 'title attribute has the correct content');
        QUnit.ok($result.hasClass('sample-class'), 'text item has the correct class');

        $result = $container.find('.icon-result-ok');

        QUnit.equal($result.length, 1, 'entry has an icon');
    });

    QUnit.test('.createMenu()', function() {
        QUnit.expect(0); //todo
        // var toolbox = toolboxFactory(),
        //     $container = $(fixtureContainer),
        //     $result;
        //
        // QUnit.expect(5);
        //
        // toolbox.init();
        // toolbox.createEntry({
        //     control: 'sample-entry',
        //     title: 'Sample title!',
        //     icon: 'result-ok',
        //     className: 'sample-class',
        //     text: 'Sample entry!'
        // });
        // toolbox.render($container);
        //
        // $result = $container.find('[data-control="sample-entry"]');
        //
        // QUnit.equal($result.length, 1, 'entry item has been rendered');
        // QUnit.equal($result.text().trim(), 'Sample entry!', 'entry item has the correct text');
        // QUnit.equal($result.attr('title'), 'Sample title!', 'title attribute has the correct content');
        // QUnit.ok($result.hasClass('sample-class'), 'text item has the correct class');
        //
        // $result = $container.find('.icon-result-ok');
        //
        // QUnit.equal($result.length, 1, 'entry has an icon');
    });



});