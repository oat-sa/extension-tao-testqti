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

    /**
     * Init the navigation in the toolbar
     *
     * @param {Object} testRunner
     * @returns {Array}
     */
    function initToolbarNavigation(testRunner){
        var $navigationBar = $('.bottom-action-bar');
        var $focusables = $navigationBar.find('.action:not(.btn-group):visible, .action.btn-group .li-inner:visible');
        if ($focusables.length) {
            keyNavigator({
                id : 'bottom-toolbar',
                replace : true,
                group : $navigationBar,
                elements : $focusables,
                //start from the last button "goto next"
                default : $focusables.length - 1
            }).on('right down', function(){
                this.next();
            }).on('left up', function(){
                this.previous();
            }).on('activate', function(cursor, target){
                cursor.$dom.click();
                cursor.$dom.mousedown();
            })
            return ['bottom-toolbar'];
        }
        return [];
    }

    /**
     * Init the navigation in the header block
     *
     * @param {Object} testRunner
     * @returns {Array}
     */
    function initHeaderNavigation(testRunner){
        //need global selector as currently no way to access delivery frame from test runner
        var $headerElements = $('[data-control="exit"]:visible a');

        if ($headerElements.length) {
            keyNavigator({
                id : 'header-toolbar',
                elements : $headerElements,
                group : $headerElements,
                loop : true,
                replace : true
            });
            return ['header-toolbar'];
        }
        return [];
    }

    /**
     * Init the navigation in the review panel
     *
     * @param {Object} testRunner
     * @returns {Array} the keyNavigator of the main navigation group
     */
    function initNavigatorNavigation(testRunner){

        var $panel = testRunner.getAreaBroker().getPanelArea();
        var $navigator = $panel.find('.qti-navigator');
        var result = [];
        if($navigator.length && !$navigator.hasClass('disabled')){
            var $filters = $navigator.find('.qti-navigator-filters .qti-navigator-filter');
            if ($filters.length) {
                keyNavigator({
                    keepState : true,
                    id : 'navigator-filters',
                    replace : true,
                    elements : $navigator.find('.qti-navigator-filters .qti-navigator-filter'),
                    group : $navigator
                }).on('right', function(){
                    this.next();
                }).on('left', function(){
                    this.previous();
                }).on('down', function(){
                    this.goto('navigator-items');
                }).on('focus', function(cursor){
                    cursor.$dom.click();
                });
                result = ['navigator-filters'];
            }

            var $trees = $navigator.find('.qti-navigator-tree .qti-navigator-item:not(.unseen) .qti-navigator-label');
            if ($trees.length) {
                keyNavigator({
                    id : 'navigator-items',
                    replace : true,
                    elements : $navigator.find('.qti-navigator-tree .qti-navigator-item:not(.unseen) .qti-navigator-label')
                }).on('down', function(){
                    this.next();
                }).on('up', function(){
                    this.previous();
                }).on('activate', function(cursor){
                    cursor.$dom.click();
                }).on('lowerbound', function(){
                    this.goto('navigator-filters');
                }).on('focus', function(cursor){
                    cursor.$dom.parent().addClass('key-navigation-highlight');
                }).on('blur', function(cursor){
                    cursor.$dom.parent().removeClass('key-navigation-highlight');
                });
                result = ['navigator-filters'];
            }

        }
        return result;
    }

    /**
     * Init the navigation in the item content
     * It returns an array of keyNavigator ids as the content is dynamically determined
     *
     * @param {Object} testRunner
     * @returns {Array} of keyNavigator ids
     */
    function initContentNavigation(testRunner){
        var $itemElements;
        var itemNavigators = [];
        var $content = testRunner.getAreaBroker().getContentArea();

        $itemElements = $content.find('img,.key-navigation-focusable,.qti-interaction');
        $itemElements.each(function(){
            var $itemElement = $(this);
            var id = 'item_element_navigation_group_'+itemNavigators.length;
            if($itemElement.hasClass('qti-interaction')){
                var $elements = $itemElement.is(':input') ? $itemElement : $itemElement.find('input');
                if ($elements.length) {
                    keyNavigator({
                        id : id,
                        elements : $elements,
                        group : $itemElement,
                        loop : false,
                        replace : true
                    }).on('right down', function(){
                        this.next();
                    }).on('left up', function(){
                        this.previous();
                    }).on('activate', function(cursor){
                        cursor.$dom.click();
                    }).on('focus', function(cursor){
                        cursor.$dom.closest('.qti-choice').addClass('key-navigation-highlight');
                    }).on('blur', function(cursor){
                        cursor.$dom.closest('.qti-choice').removeClass('key-navigation-highlight');
                    });
                    itemNavigators.push(id);
                }

            }else{
                keyNavigator({
                    id : id,
                    elements : $itemElement,
                    group : $itemElement,
                    replace : true
                });
                itemNavigators.push(id);
            }
        });

        return itemNavigators;
    }

    /**
     * Init the navigation of test rubric blocks
     * It returns an array of keyNavigator ids as the content is dynamically determined
     *
     * @param {Object} testRunner
     * @returns {Array} of keyNavigator ids
     */
    function initRubricNavigation(testRunner){
        var $itemElements;
        var rubricNavigators = [];
        var $rubricArea = $('#qti-rubrics');

        $itemElements = $rubricArea.find('.qti-rubricBlock');
        $itemElements.each(function(){
            var $itemElement = $(this);
            var id = 'rubric_element_navigation_group_'+rubricNavigators.length;
            keyNavigator({
                id : id,
                elements : $itemElement,
                group : $itemElement,
                replace : true
            });
            rubricNavigators.push(id);
        });

        return rubricNavigators;
    }

    /**
     * Init test runner navigation
     * @param testRunner
     * @returns {*}
     */
    function initTestRunnerNavigation(testRunner){

        //blur current focused element, to reinitialize keyboard navigation
        if (document.activeElement){
            document.activeElement.blur();
        }
        var groups = _.union(
            initRubricNavigation(testRunner),
            initContentNavigation(testRunner),
            initToolbarNavigation(testRunner),
            initNavigatorNavigation(testRunner),
            initHeaderNavigation(testRunner)
        );
        console.log(groups);
        return groupKeyNavigator({
            id : 'test-runner',
            replace : true,
            groups : groups
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
                .after('renderitem', function () {
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
