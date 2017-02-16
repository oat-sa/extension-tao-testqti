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
    'ui/keyNavigation/navigator',
    'ui/keyNavigation/domNavigableElement',
    'ui/keyNavigation/groupNavigableElement',
    'util/shortcut',
    'util/namespace',
    'taoTests/runner/plugin',
    'css!taoQtiTestCss/plugins/key-navigation'
], function ($, _, keyNavigator, domNavigableElement, groupNavigableElement, shortcut, namespaceHelper, pluginFactory) {
    'use strict';

    /**
     * Init the navigation in the toolbar
     *
     * @param {Object} testRunner
     * @returns {Array}
     */
    function initToolbarNavigation(){
        var $navigationBar = $('.bottom-action-bar');
        var $focusables = $navigationBar.find('.action:not(.btn-group):visible, .action.btn-group .li-inner:visible');
        var navigables = domNavigableElement.createFromJqueryContainer($focusables);
        if (navigables.length) {
            return [keyNavigator({
                id : 'bottom-toolbar',
                replace : true,
                group : $navigationBar,
                elements : navigables,
                //start from the last button "goto next"
                default : navigables.length - 1
            }).on('right down', function(){
                this.next();
            }).on('left up', function(){
                this.previous();
            }).on('activate', function(cursor){
                cursor.navigable.getElement().click().mousedown();
            })];
        }
        return [];
    }

    /**
     * Init the navigation in the header block
     *
     * @param {Object} testRunner
     * @returns {Array}
     */
    function initHeaderNavigation(){
        //need global selector as currently no way to access delivery frame from test runner
        var $headerElements = $('[data-control="exit"]:visible a');
        var navigables = domNavigableElement.createFromJqueryContainer($headerElements);
        if (navigables.length) {
            return [keyNavigator({
                id : 'header-toolbar',
                group : $headerElements.closest('.infoControl'),
                elements : navigables,
                loop : true,
                replace : true
            })];
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
        var navigators = [];
        var filtersNavigator;
        var itemsNavigator;
        var $filters, $trees, navigableFilters, navigableTrees;

        //the tag to identify if the item listing has been browsed, to only "smart jump" to active item only on the first visit
        var itemListingVisited = false;
        //the position of the filter in memory, to only "smart jump" to active item only on the first visit
        var filterCursorPos = -1;

        if($navigator.length && !$navigator.hasClass('disabled')){
            $filters = $navigator.find('.qti-navigator-filters .qti-navigator-filter');
            navigableFilters = domNavigableElement.createFromJqueryContainer($filters);
            if (navigableFilters.length) {
                filtersNavigator = keyNavigator({
                    keepState : true,
                    id : 'navigator-filters',
                    replace : true,
                    elements : navigableFilters,
                    group : $navigator
                }).on('right', function(){
                    this.next();
                }).on('left', function(){
                    this.previous();
                }).on('down', function(){
                    if(itemsNavigator){
                        _.defer(function(){
                            if(itemListingVisited){
                                itemsNavigator.focus().first();
                            }else{
                                itemsNavigator.focus();
                            }
                        });
                    }
                }).on('up', function(){
                    if(itemsNavigator){
                        _.defer(function(){
                            itemsNavigator.last();
                        });
                    }
                }).on('focus', function(cursor, origin){
                    //activate the tab in the navigators
                    cursor.navigable.getElement().click();

                    //reset the item listing browsed tag whenever the focus on the filter happens after a focus on another element
                    if(filterCursorPos !== cursor.position && !origin){
                        itemListingVisited = false;
                        filterCursorPos = cursor.position;
                    }
                });
                navigators.push(filtersNavigator);
            }

            $trees = $navigator.find('.qti-navigator-tree .qti-navigator-item:not(.unseen) .qti-navigator-label');
            navigableTrees = domNavigableElement.createFromJqueryContainer($trees);
            if (navigableTrees.length) {
                //instantiate a key navigator but do not add it to the returned list of navigators as this is not supposed to be reached with tab key
                itemsNavigator = keyNavigator({
                    id : 'navigator-items',
                    replace : true,
                    elements : navigableTrees,
                    default : function(navigables){
                        var pos = 0;
                        _.forIn(navigables, function(navigable, i){
                            if(navigable.getElement().parent('.qti-navigator-item').hasClass('active')){
                                pos = i;
                            }
                        });
                        return pos;
                    }
                }).on('down', function(){
                    this.next();
                }).on('up', function(){
                    this.previous();
                }).on('right', function(){
                    if(filtersNavigator){
                        filtersNavigator.focus().next();
                    }
                }).on('left', function(){
                    if(filtersNavigator){
                        filtersNavigator.focus().previous();
                    }
                }).on('activate', function(cursor){
                    cursor.navigable.getElement().click();
                }).on('lowerbound upperbound', function(){
                    if(filtersNavigator){
                        filtersNavigator.focus();
                    }
                }).on('focus', function(cursor){
                    itemListingVisited = true;
                    cursor.navigable.getElement().parent().addClass('key-navigation-highlight');
                }).on('blur', function(cursor){
                    cursor.navigable.getElement().parent().removeClass('key-navigation-highlight');
                });
            }

        }
        return navigators;
    }

    /**
     * Init the navigation in the item content
     * It returns an array of keyNavigator ids as the content is dynamically determined
     *
     * @param {Object} testRunner
     * @returns {Array} of keyNavigator ids
     */
    function initContentNavigation(testRunner){
        var $itemElements, $inputs;
        var itemNavigators = [];
        var $content = testRunner.getAreaBroker().getContentArea();

        //adding retro-compatibility with legacy focusable class for defining focusable passages
        $content.find('.key-navigation-focusable').addClass('key-navigation-scrollable');

        $itemElements = $content.find('img,.key-navigation-focusable,.qti-interaction');
        $itemElements.each(function(){
            var $itemElement = $(this);
            var itemNavigables = [];
            var id = 'item_element_navigation_group_'+itemNavigators.length;

            if($itemElement.hasClass('qti-interaction')){
                $itemElement.off('.keyNavigation');
                $inputs = $itemElement.is(':input') ? $itemElement : $itemElement.find('input');
                itemNavigables = domNavigableElement.createFromJqueryContainer($inputs);

                if (itemNavigables.length) {
                    itemNavigators.push(keyNavigator({
                        id : id,
                        elements : itemNavigables,
                        group : $itemElement,
                        loop : false,
                        replace : true
                    }).on('right down', function(){
                        this.next();
                    }).on('left up', function(){
                        this.previous();
                    }).on('activate', function(cursor){
                        cursor.navigable.getElement().click();
                    }).on('focus', function(cursor){
                        cursor.navigable.getElement().closest('.qti-choice').addClass('key-navigation-highlight');
                    }).on('blur', function(cursor){
                        cursor.navigable.getElement().closest('.qti-choice').removeClass('key-navigation-highlight');
                    }));
                }

            }else{
                itemNavigators.push(keyNavigator({
                    id : id,
                    elements : domNavigableElement.createFromJqueryContainer($itemElement),
                    group : $itemElement,
                    replace : true
                }));
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
    function initRubricNavigation(){
        var $itemElements;
        var rubricNavigators = [];
        var $rubricArea = $('#qti-rubrics');

        $itemElements = $rubricArea.find('.qti-rubricBlock');
        $itemElements.each(function(){
            var $itemElement = $(this);
            var id = 'rubric_element_navigation_group_'+rubricNavigators.length;

            rubricNavigators.push(keyNavigator({
                id : id,
                elements : domNavigableElement.createFromJqueryContainer($itemElement),
                group : $itemElement,
                replace : true
            }));
        });

        return rubricNavigators;
    }

    /**
     * Init test runner navigation
     * @param testRunner
     * @returns {*}
     */
    function initTestRunnerNavigation(testRunner){

        var navigators;

        //blur current focused element, to reinitialize keyboard navigation
        if (document.activeElement){
            document.activeElement.blur();
        }

        navigators = _.union(
            initRubricNavigation(testRunner),
            initContentNavigation(testRunner),
            initToolbarNavigation(testRunner),
            initNavigatorNavigation(testRunner),
            initHeaderNavigation(testRunner)
        );
        navigators = groupNavigableElement.createFromNavigableDoms(navigators);

        return keyNavigator({
            id : 'test-runner',
            replace : true,
            loop : true,
            elements : navigators
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
