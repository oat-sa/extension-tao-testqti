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
define(['jquery', 'lodash', 'ui/hider', 'taoQtiTest/runner/ui/toolbox/toolbox'], function($, _, hider, toolboxFactory) {
    'use strict';

    var fixtureContainer = '#qunit-fixture';

    QUnit.module('plugin');

    QUnit.test('module', function(assert) {
        assert.expect(1);

        assert.ok(typeof toolboxFactory === 'function', 'The module expose a function');
    });

    QUnit.module('Toolbox rendering');

    QUnit.test('render / destroy', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer);

        assert.expect(8);

        toolbox.init();

        toolbox.createEntry({ control: 'entry1' });
        toolbox.createEntry({ control: 'entry2' });
        toolbox.createEntry({ control: 'entry3' });

        toolbox.render($container);

        assert.equal($container.find('.tools-box-list').length, 1, 'toolbox has been rendered');
        assert.equal($container.find('[data-control="entry1"]').length, 1, 'entry1 has been rendered');
        assert.equal($container.find('[data-control="entry2"]').length, 1, 'entry2 has been rendered');
        assert.equal($container.find('[data-control="entry3"]').length, 1, 'entry3 has been rendered');

        toolbox.destroy();

        assert.equal($container.find('.tools-box-list').length, 0, 'toolbox has been destroyed');
        assert.equal($container.find('[data-control="entry1"]').length, 0, 'entry1 has been destroyed');
        assert.equal($container.find('[data-control="entry2"]').length, 0, 'entry2 has been destroyed');
        assert.equal($container.find('[data-control="entry3"]').length, 0, 'entry3 has been destroyed');
    });

    QUnit.module('Item creation and rendering');

    QUnit.test('.createText()', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            $result;

        assert.expect(3);

        toolbox.init();
        toolbox.createText({
            control: 'sample-text',
            className: 'sample-class',
            text: 'Sample text!'
        });
        toolbox.render($container);

        $result = $container.find('[data-control="sample-text"]');

        assert.equal($result.length, 1, 'text item has been rendered');
        assert.equal($result.text().trim(), 'Sample text!', 'text item has the correct text');
        assert.ok($result.hasClass('sample-class'), 'text item has the correct class');
    });

    QUnit.test('.createEntry()', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            $result;

        assert.expect(5);

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

        assert.equal($result.length, 1, 'entry item has been rendered');
        assert.equal($result.text().trim(), 'Sample entry!', 'entry item has the correct text');
        assert.equal($result.attr('title'), 'Sample title!', 'title attribute has the correct content');
        assert.ok($result.hasClass('sample-class'), 'text item has the correct class');

        $result = $container.find('.icon-result-ok');

        assert.equal($result.length, 1, 'entry has an icon');
    });

    QUnit.test('.createMenu()', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            items = {},
            $result;

        assert.expect(11);

        toolbox.init();

        items.menu = toolbox.createMenu({
            control: 'sample-menu',
            title: 'Sample Menu!',
            icon: 'result-ok',
            className: 'sample-class',
            text: 'Sample Menu!'
        });
        items.menu_1 = toolbox.createEntry({ control: 'menu-entry1' });
        items.menu_1.setMenuId('sample-menu');
        items.menu_2 = toolbox.createEntry({ control: 'menu-entry2' });
        items.menu_2.setMenuId('sample-menu');
        items.menu_3 = toolbox.createEntry({ control: 'menu-entry3' });
        items.menu_3.setMenuId('sample-menu');

        toolbox.render($container);

        // Check button
        $result = $container.find('[data-control="sample-menu"]');

        assert.equal($result.length, 1, 'menu item has been rendered');
        assert.equal($result.text().trim(), 'Sample Menu!', 'menu item has the correct text');
        assert.equal($result.attr('title'), 'Sample Menu!', 'title attribute has the correct content');
        assert.ok($result.hasClass('sample-class'), 'menu item has the correct class');

        $result = $container.find('.icon-result-ok');

        assert.equal($result.length, 1, 'entry has an icon');

        // Check menu content
        $result = $container.find('[data-control="sample-menu-menu"]');

        assert.equal($result.length, 1, 'menu content has been rendered');
        assert.ok(hider.isHidden($result), 'menu is hidden by default');

        $result = $container.find('[data-control="sample-menu-list"] li');

        assert.equal($result.length, 3, 'menu contains 3 items');
        assert.equal($result.eq(0).data('control'), 'menu-entry1', 'menu entry1 has been rendered in 1st position');
        assert.equal($result.eq(1).data('control'), 'menu-entry2', 'menu entry2 has been rendered in 2nd position');
        assert.equal($result.eq(2).data('control'), 'menu-entry3', 'menu entry3 has been rendered in 3rd position');
    });

    QUnit.module('Default renderer');

    QUnit.test('render entries in registration order', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            items = {},
            $result;

        assert.expect(6);

        toolbox.init();

        items.entry1 = toolbox.createEntry({ control: 'entry1' });
        items.entry2 = toolbox.createEntry({ control: 'entry2' });
        items.entry3 = toolbox.createEntry({ control: 'entry3' });
        items.entry4 = toolbox.createEntry({ control: 'entry4' });
        items.entry5 = toolbox.createEntry({ control: 'entry5' });

        toolbox.render($container);

        $result = $container.find('li');

        assert.equal($result.length, 5, 'menu contains the right number of entries');
        assert.equal($result.eq(0).data('control'), 'entry1', 'entry1 has been rendered in 1st position');
        assert.equal($result.eq(1).data('control'), 'entry2', 'entry2 has been rendered in 2nd position');
        assert.equal($result.eq(2).data('control'), 'entry3', 'entry3 has been rendered in 3rd position');
        assert.equal($result.eq(3).data('control'), 'entry4', 'entry4 has been rendered in 4th position');
        assert.equal($result.eq(4).data('control'), 'entry5', 'entry5 has been rendered in 5th position');
    });

    QUnit.test('handle menu entries and orphan menu entries', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            items = {},
            $result;

        assert.expect(14);

        toolbox.init();

        items.entry1 = toolbox.createMenu({ control: 'menu1' });
        items.entry2 = toolbox.createEntry({ control: 'entry2' });
        items.entry2.setMenuId('idontexist');
        items.entry3 = toolbox.createEntry({ control: 'entry3' });
        items.entry3.setMenuId('menu1');
        items.entry4 = toolbox.createMenu({ control: 'menu2' });
        items.entry5 = toolbox.createEntry({ control: 'entry5' });
        items.entry5.setMenuId('idontexist');
        items.entry6 = toolbox.createEntry({ control: 'entry6' });
        items.entry6.setMenuId('menu2');
        items.entry7 = toolbox.createEntry({ control: 'entry7' });
        items.entry7.setMenuId('menu1');
        items.entry8 = toolbox.createMenu({ control: 'menu3' });
        items.entry9 = toolbox.createEntry({ control: 'entry9' });
        items.entry9.setMenuId('menu2');
        items.entry10 = toolbox.createEntry({ control: 'entry10' });
        items.entry10.setMenuId('menu1');
        items.entry11 = toolbox.createEntry({ control: 'entry11' });
        items.entry11.setMenuId('idontexist');

        toolbox.render($container);

        $result = $container.find('.tools-box-list > li');

        assert.equal($result.length, 3, 'menu contains the right number of entries');
        assert.equal($result.eq(0).data('control'), 'menu1', 'menu1 has been rendered in 1st position');
        assert.equal($result.eq(1).data('control'), 'menu2', 'menu2 has been rendered in 2nd position');
        assert.equal($result.eq(2).data('control'), 'menu3', 'menu3 has been rendered in 3rd position');

        $result = $container.find('[data-control="menu1-list"] li');

        assert.equal($result.length, 3, 'the menu "menu1" contains the right number of entries');
        assert.equal(
            $result.eq(0).data('control'),
            'entry3',
            'entry3 has been rendered in 1st position of menu "menu1"'
        );
        assert.equal(
            $result.eq(1).data('control'),
            'entry7',
            'entry4 has been rendered in 2nd position of menu "menu1"'
        );
        assert.equal(
            $result.eq(2).data('control'),
            'entry10',
            'entry10 has been rendered in 3rd position of menu "menu1"'
        );

        $result = $container.find('[data-control="menu2"] li');

        assert.equal($result.length, 2, 'the menu "menu2" contains the right number of entries');
        assert.equal(
            $result.eq(0).data('control'),
            'entry6',
            'entry6 has been rendered in 1st position of menu "menu2"'
        );
        assert.equal(
            $result.eq(1).data('control'),
            'entry9',
            'entry9 has been rendered in 2nd position of menu "menu2"'
        );

        // Orphan entries
        assert.equal($container.find('[data-control="entry2"]').length, 0, 'orphan entry2 has not been rendered');
        assert.equal($container.find('[data-control="entry5"]').length, 0, 'orphan entry5 has not been rendered');
        assert.equal($container.find('[data-control="entry11"]').length, 0, 'orphan entry11 has not been rendered');
    });

    QUnit.module('Menus interactions');

    QUnit.test('Interacting with a pre-rendered menu does not cause errors', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            menu;

        assert.expect(5);

        toolbox.init();
        menu = toolbox.createMenu();

        _.each(Object.getOwnPropertyNames(menu), function(prop) {
            if (typeof menu[prop] === 'function') {
                menu[prop]();
            }
        });

        assert.ok(true, 'methods');

        assert.ok(menu.trigger('enable'), 'enable');
        assert.ok(menu.trigger('disable'), 'disable');
        assert.ok(menu.trigger('hide'), 'hide');
        assert.ok(menu.trigger('destroy'), 'destroying');

        toolbox.render($container);
        toolbox.enable();
        menu.enable();
    });

    QUnit.test('Opening a menu close opened menus', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            items = {},
            $toggle1,
            $toggle2,
            $toggle3,
            $menu1,
            $menu2,
            $menu3;

        assert.expect(15);

        toolbox.init();

        items.menu1 = toolbox.createMenu({ control: 'menu1' });
        items.menu1_1 = toolbox.createEntry({ control: 'menu1-entry1' });
        items.menu1_1.setMenuId('menu1');
        items.menu1_2 = toolbox.createEntry({ control: 'menu1-entry2' });
        items.menu1_2.setMenuId('menu1');
        items.menu1_3 = toolbox.createEntry({ control: 'menu1-entry3' });
        items.menu1_3.setMenuId('menu1');

        items.menu2 = toolbox.createMenu({ control: 'menu2' });
        items.menu2_1 = toolbox.createEntry({ control: 'menu2-entry1' });
        items.menu2_1.setMenuId('menu2');
        items.menu2_2 = toolbox.createEntry({ control: 'menu2-entry2' });
        items.menu2_2.setMenuId('menu2');
        items.menu2_3 = toolbox.createEntry({ control: 'menu2-entry3' });
        items.menu2_3.setMenuId('menu2');

        items.menu3 = toolbox.createMenu({ control: 'menu3' });
        items.menu3_1 = toolbox.createEntry({ control: 'menu3-entry1' });
        items.menu3_1.setMenuId('menu3');
        items.menu3_2 = toolbox.createEntry({ control: 'menu3-entry2' });
        items.menu3_2.setMenuId('menu3');
        items.menu3_3 = toolbox.createEntry({ control: 'menu3-entry3' });
        items.menu3_3.setMenuId('menu3');

        toolbox.render($container);
        toolbox.enable();

        _.invoke(items, 'enable'); // Enable all items. This is usually the plugin responsability

        $toggle1 = $container.find('[data-control="menu1"]');
        $toggle2 = $container.find('[data-control="menu2"]');
        $toggle3 = $container.find('[data-control="menu3"]');

        $menu1 = $container.find('[data-control="menu1-menu"]');
        $menu2 = $container.find('[data-control="menu2-menu"]');
        $menu3 = $container.find('[data-control="menu3-menu"]');

        assert.ok(hider.isHidden($menu1), 'menu1 is hidden');
        assert.ok(hider.isHidden($menu2), 'menu2 is hidden');
        assert.ok(hider.isHidden($menu3), 'menu3 is hidden');

        $toggle1.click();

        assert.ok(!hider.isHidden($menu1), 'menu1 is visible');
        assert.ok(hider.isHidden($menu2), 'menu2 is hidden');
        assert.ok(hider.isHidden($menu3), 'menu3 is hidden');

        $toggle2.click();

        assert.ok(hider.isHidden($menu1), 'menu1 is hidden');
        assert.ok(!hider.isHidden($menu2), 'menu2 is visible');
        assert.ok(hider.isHidden($menu3), 'menu3 is hidden');

        $toggle3.click();

        assert.ok(hider.isHidden($menu1), 'menu1 is hidden');
        assert.ok(hider.isHidden($menu2), 'menu2 is hidden');
        assert.ok(!hider.isHidden($menu3), 'menu3 is visible');

        $toggle3.click();

        assert.ok(hider.isHidden($menu1), 'menu1 is hidden');
        assert.ok(hider.isHidden($menu2), 'menu2 is hidden');
        assert.ok(hider.isHidden($menu3), 'menu3 is hidden');
    });

    QUnit.test('Clicking outside of an opened menu closes it', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            items = {},
            $toggle,
            $menu;

        assert.expect(3);

        toolbox.init();

        items.menu = toolbox.createMenu({ control: 'menu' });
        items.menu_1 = toolbox.createEntry({ control: 'menu-entry1' });
        items.menu_1.setMenuId('menu');
        items.menu_2 = toolbox.createEntry({ control: 'menu-entry2' });
        items.menu_2.setMenuId('menu');
        items.menu_3 = toolbox.createEntry({ control: 'menu-entry3' });
        items.menu_3.setMenuId('menu');

        toolbox.render($container);
        toolbox.enable();

        _.invoke(items, 'enable'); // Enable all items. This is usually the plugin responsability

        $toggle = $container.find('[data-control="menu"]');
        $menu = $container.find('[data-control="menu-menu"]');

        assert.ok(hider.isHidden($menu), 'menu is hidden');

        $toggle.click();
        assert.ok(!hider.isHidden($menu), 'menu is visible');

        $('#qunit').click();
        assert.ok(hider.isHidden($menu), 'menu is hidden');
    });

    QUnit.test('Clicking a menu entry closes the menu', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            items = {},
            $toggle,
            $menu,
            $entry;

        assert.expect(7);

        toolbox.init();

        items.menu = toolbox.createMenu({ control: 'menu' });
        items.menu_1 = toolbox.createEntry({ control: 'menu-entry1' });
        items.menu_1.setMenuId('menu');
        items.menu_2 = toolbox.createEntry({ control: 'menu-entry2' });
        items.menu_2.setMenuId('menu');
        items.menu_3 = toolbox.createEntry({ control: 'menu-entry3' });
        items.menu_3.setMenuId('menu');

        toolbox.render($container);
        toolbox.enable();

        _.invoke(items, 'enable'); // Enable all items. This is usually the plugin responsability

        $toggle = $container.find('[data-control="menu"]');
        $menu = $container.find('[data-control="menu-menu"]');

        assert.ok(hider.isHidden($menu), 'menu is hidden by default');

        // Open, then close with click on entry1
        $toggle.click();
        assert.ok(!hider.isHidden($menu), 'menu is visible');

        $entry = $menu.find('[data-control="menu-entry1"]');

        $entry.click();
        assert.ok(hider.isHidden($menu), 'menu has hidden following a click on entry1');

        // Open, then close with click on entry2
        $toggle.click();
        assert.ok(!hider.isHidden($menu), 'menu is visible');

        $entry = $menu.find('[data-control="menu-entry2"]');

        $entry.click();
        assert.ok(hider.isHidden($menu), 'menu has hidden following a click on entry2');

        // Open, then close with click on entry3
        $toggle.click();
        assert.ok(!hider.isHidden($menu), 'menu is visible');

        $entry = $menu.find('[data-control="menu-entry3"]');

        $entry.click();
        assert.ok(hider.isHidden($menu), 'menu has hidden following a click on entry3');
    });

    QUnit.module('Menu button');

    QUnit.test('button opened/closed state', function(assert) {
        var toolbox = toolboxFactory(),
            $container = $(fixtureContainer),
            items = {},
            $result;

        assert.expect(9);

        toolbox.init();

        items.menu = toolbox.createMenu({ control: 'sample-menu' });
        items.menu_1 = toolbox.createEntry({ control: 'menu-entry1' });
        items.menu_1.setMenuId('sample-menu');
        items.menu_2 = toolbox.createEntry({ control: 'menu-entry2' });
        items.menu_2.setMenuId('sample-menu');
        items.menu_3 = toolbox.createEntry({ control: 'menu-entry3' });
        items.menu_3.setMenuId('sample-menu');

        toolbox.render($container);

        _.invoke(items, 'enable'); // Enable all items. This is usually the plugin responsability

        // Check button
        $result = $container.find('[data-control="sample-menu"]');

        assert.equal($result.find('.icon-up').length, 1, 'closed menu has the correct state icon');
        assert.equal($result.find('.icon-down').length, 0, 'closed menu has the correct state icon');
        assert.ok(!$result.hasClass('active'), 'closed menu button is turned off');

        $result.click();

        assert.equal($result.find('.icon-up').length, 0, 'opened menu has the correct state icon');
        assert.equal($result.find('.icon-down').length, 1, 'opened menu has the correct state icon');
        assert.ok($result.hasClass('active'), 'opened menu button is turned on');

        $result.click();

        assert.equal($result.find('.icon-up').length, 1, 'closed menu has the correct state icon');
        assert.equal($result.find('.icon-down').length, 0, 'closed menu has the correct state icon');
        assert.ok(!$result.hasClass('active'), 'closed menu button is turned off');
    });
});
