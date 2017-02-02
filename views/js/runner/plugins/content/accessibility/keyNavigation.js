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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * Test Runner Content Plugin : Navigate through the item focusable elements using the keyboard
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'core/keyNavigator',
    'core/groupKeyNavigator',
    'util/shortcut',
    'util/namespace',
    'taoTests/runner/plugin',
    'css!taoQtiTestCss/plugins/key-navigation'
], function ($, _, keyNavigator, groupKeyNavigator, shortcut, namespaceHelper, pluginFactory) {
    'use strict';

    function initToolbarNavigation(testRunner){
        var $panelArea = testRunner.getAreaBroker().getPanelArea();
        console.log(testRunner.getAreaBroker());
        var $focusables = $('.bottom-action-bar .action:not(.btn-group):visible, .bottom-action-bar .action.btn-group .li-inner:visible');
        return keyNavigator({
            id : 'bottom-toolbar',
            replace : true,
            group : $('.bottom-action-bar'),
            elements : $focusables,
            default : $focusables.length - 1
        }).on('right down', function(){
            this.next();
        }).on('left up', function(){
            this.previous();
        }).on('activate', function(cursor){
            cursor.$dom.click();
        });
    }

    function initHeaderNavigation(){
        //need global selector
        var $headerElements = $('[data-control="exit"]:visible a');
        return keyNavigator({
            id : 'header-toolbar',
            elements : $headerElements,
            group : $headerElements,
            loop : true,
            replace : true
        });
    }

    function initContentNavigation(testRunner){
        var $itemElements;
        var itemNavigators = [];
        var $content = testRunner.getAreaBroker().getContentArea();

        $itemElements = $content.find('img,.key-navigation-focusable,.qti-interaction');
        $itemElements.each(function(){
            var $itemElement = $(this);
            var id = 'item_element_navigation_group_'+itemNavigators.length;
            if($itemElement.hasClass('qti-interaction')){
                keyNavigator({
                    id : id,
                    elements : $itemElement.find(':input'),
                    group : $itemElement,
                    loop : false,
                    replace : true
                }).on('right down', function(){
                    this.next();
                }).on('left up', function(){
                    this.previous();
                }).on('activate', function(cursor){
                    cursor.$dom.click();
                });
            }else{
                keyNavigator({
                    id : id,
                    elements : $itemElement,
                    group : $itemElement,
                    replace : true
                });
            }
            itemNavigators.push(id);
        });

        return itemNavigators;
    }

    function initTestRunnerNavigation(testRunner){

        var itemNavigators = initContentNavigation(testRunner);

        initHeaderNavigation(testRunner);
        initToolbarNavigation(testRunner);

        return groupKeyNavigator({
            id : 'test-runner',
            replace : true,
            groups : _.union(itemNavigators, ['bottom-toolbar', 'navigator-filters', 'header-toolbar'])
        });
    }

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'keyNavigation',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;
            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};

            if (testConfig.allowShortcuts) {
                shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.previous, this.getName(), true), function () {
                    testRunner.trigger('previous-focusable');
                }, {
                    prevent: true
                });

                shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.next, this.getName(), true), function () {
                    testRunner.trigger('next-focusable');
                }, {
                    prevent: true
                });
            }

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('renderitem', function () {
                    self.groupNavigator = initTestRunnerNavigation(testRunner);
                    self.enable();
                })
                .on('unloaditem', function () {
                    self.disable();
                })
                .on('previous-focusable', function() {
                    if (self.getState('enabled') && self.groupNavigator) {
                        self.groupNavigator.previous();
                    }
                })
                .on('next-focusable', function() {
                    if (self.getState('enabled') && self.groupNavigator) {
                        self.groupNavigator.next();
                    }
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
            if(this.groupNavigator) {
                this.groupNavigator.next();
            }
        }
    });
});
