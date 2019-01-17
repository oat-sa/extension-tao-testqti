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
    'ui/keyNavigation/navigableDomElement',
    'ui/keyNavigation/navigableGroupElement',
    'util/shortcut',
    'util/namespace',
    'taoTests/runner/plugin',
    'css!taoQtiTestCss/plugins/key-navigation'
], function ($, _, keyNavigator, navigableDomElement, navigableGroupElement, shortcut, namespaceHelper, pluginFactory) {
    'use strict';

    /**
     * When either an element or its parents have this class - navigation from it would be disabled.
     *
     * @type {String}
     */
    var ignoredClass = 'no-key-navigation';

    /**
     * Init the navigation in the toolbar
     *
     * @param {Object} testRunner
     * @returns {Array}
     */
    function initToolbarNavigation(){
        var $navigationBar = $('.bottom-action-bar');
        var $focusables = $navigationBar.find('.action:not(.btn-group):visible, .action.btn-group .li-inner:visible');
        var navigables = navigableDomElement.createFromDoms($focusables);
        if (navigables.length) {
            return [keyNavigator({
                id : 'bottom-toolbar',
                replace : true,
                group : $navigationBar,
                elements : navigables,
                //start from the last button "goto next"
                defaultPosition : navigables.length - 1
            }).on('right down', function(elem){
                if (!allowedToNavigateFrom(elem)) {
                    return false;
                } else {
                    this.next();
                }
            }).on('left up', function(elem){
                if (!allowedToNavigateFrom(elem)) {
                    return false;
                } else {
                    this.previous();
                }
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
        var navigables = navigableDomElement.createFromDoms($headerElements);
        if (navigables.length) {
            return [keyNavigator({
                id : 'header-toolbar',
                group : $headerElements.closest('.infoControl'),
                elements : navigables,
                loop : true,
                replace : true
            }).on('activate', function(cursor){
                cursor.navigable.getElement().click();
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
        var filterCursor;

        if($navigator.length && !$navigator.hasClass('disabled')){
            $filters = $navigator.find('.qti-navigator-filters .qti-navigator-filter');
            navigableFilters = navigableDomElement.createFromDoms($filters);
            if (navigableFilters.length) {
                filtersNavigator = keyNavigator({
                    keepState : true,
                    id : 'navigator-filters',
                    replace : true,
                    elements : navigableFilters,
                    group : $navigator
                }).on('right', function(elem){
                    if (!allowedToNavigateFrom(elem)) {
                        return false;
                    } else {
                        this.next();
                    }
                }).on('left', function(elem){
                    if (!allowedToNavigateFrom(elem)) {
                        return false;
                    } else {
                        this.previous();
                    }
                }).on('down', function(elem){
                    if (!allowedToNavigateFrom(elem)) {
                        return false;
                    } else if(itemsNavigator){
                        _.defer(function(){
                            if(itemListingVisited){
                                itemsNavigator.focus().first();
                            }else{
                                itemsNavigator.focus();
                            }
                        });
                    }
                }).on('up', function(elem){
                    if (!allowedToNavigateFrom(elem)) {
                        return false;
                    } else if(itemsNavigator){
                        _.defer(function(){
                            itemsNavigator.last();
                        });
                    }
                }).on('focus', function(cursor, origin){
                    //activate the tab in the navigators
                    cursor.navigable.getElement().click();

                    //reset the item listing browsed tag whenever the focus on the filter happens after a focus on another element
                    if((filterCursor && filterCursor.position !== cursor.position) || origin){
                        itemListingVisited = false;
                    }
                    //set the filter cursor in memory
                    filterCursor = cursor;
                });
                navigators.push(filtersNavigator);
            }

            $trees = $navigator.find('.qti-navigator-tree .qti-navigator-item:not(.unseen) .qti-navigator-label');
            navigableTrees = navigableDomElement.createFromDoms($trees);
            if (navigableTrees.length) {
                //instantiate a key navigator but do not add it to the returned list of navigators as this is not supposed to be reached with tab key
                itemsNavigator = keyNavigator({
                    id : 'navigator-items',
                    replace : true,
                    elements : navigableTrees,
                    defaultPosition : function defaultPosition(navigables){
                        var pos = 0;
                        if(filterCursor && filterCursor.navigable.getElement().data('mode') !== 'flagged'){
                            _.forIn(navigables, function(navigable, i){
                                var $parent = navigable.getElement().parent('.qti-navigator-item');
                                //find the first active and visible item
                                if($parent.hasClass('active') && $parent.is(':visible')){
                                    pos = i;
                                    return false;
                                }
                            });
                        }
                        return pos;
                    }
                }).on('down', function(elem){
                    if (!allowedToNavigateFrom(elem)) {
                        return false;
                    } else {
                        this.next();
                    }
                }).on('up', function(elem){
                    if (!allowedToNavigateFrom(elem)) {
                        return false;
                    } else {
                        this.previous();
                    }
                }).on('right', function(elem){
                    if (!allowedToNavigateFrom(elem)) {
                        return false;
                    } else if(filtersNavigator){
                        filtersNavigator.focus().next();
                    }
                }).on('left', function(elem){
                    if (!allowedToNavigateFrom(elem)) {
                        return false;
                    } else if(filtersNavigator){
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
     * Navigable item content are interaction choices and body element with the special class "key-navigation-focusable"
     * It returns an array of keyNavigators as the content is dynamically determined
     *
     * @param {Object} testRunner
     * @returns {Array} of keyNavigator ids
     */
    function initContentNavigation(testRunner){

        var itemNavigators = [];
        var $content = testRunner.getAreaBroker().getContentArea();

        //the item focusable body elements are considered scrollable
        $content.find('.key-navigation-focusable').addClass('key-navigation-scrollable');
        $content.find('.key-navigation-focusable,.qti-interaction').filter(function(){
            //filter out interaction as it will be managed separately
            return (!$(this).parents('.qti-interaction').length);
        }).each(function(){
            var $itemElement = $(this);
            if($itemElement.hasClass('qti-interaction')){
                itemNavigators = _.union(itemNavigators, initInteractionNavigation($itemElement));
            }else{
                itemNavigators.push(keyNavigator({
                    elements : navigableDomElement.createFromDoms($itemElement),
                    group : $itemElement,
                    propagateTab : false
                }));
            }
        });

        return itemNavigators;
    }

    /**
     * Init interaction key navigation from the interaction navigator
     *
     * @param {JQuery} $interaction - the interaction container
     * @returns {Array} array of navigators created from interaction container
     */
    function initInteractionNavigation($interaction){

        var $inputs;
        var interactionNavigables;
        var interactionNavigators = [];

        //add navigable elements from prompt
        $interaction.find('.key-navigation-focusable').each(function(){
            var $nav = $(this);
            if(!$nav.closest('.qti-choice').length){
                interactionNavigators.push(keyNavigator({
                    elements : navigableDomElement.createFromDoms($nav),
                    group : $nav,
                    propagateTab : false
                }));
            }
        });

        //reset interaction custom key navigation to override the behaviour with the new one
        $interaction.off('.keyNavigation');

        //search for inputs that represent the interaction focusable choices
        $inputs = $interaction.is(':input') ? $interaction : $interaction.find(':input');
        interactionNavigables = navigableDomElement.createFromDoms($inputs);

        if (interactionNavigables.length) {
            interactionNavigators.push(keyNavigator({
                elements : interactionNavigables,
                group : $interaction,
                loop : false
            }).on('right down', function(elem){
                if (!allowedToNavigateFrom(elem)) {
                    return false;
                } else {
                    this.next();
                }
            }).on('left up', function(elem){
                if (!allowedToNavigateFrom(elem)) {
                    return false;
                } else {
                    this.previous();
                }
            }).on('activate', function(cursor){
                var $elt = cursor.navigable.getElement();

                //jQuery <= 1.9.0 the checkbox values are set
                //after the click event if triggerred with jQuery
                if($elt.is(':checkbox')){
                    $elt.each(function(){
                        this.click();
                    });
                } else {
                    $elt.click();
                }

            }).on('focus', function(cursor){
                cursor.navigable.getElement().closest('.qti-choice').addClass('key-navigation-highlight');
            }).on('blur', function(cursor){
                cursor.navigable.getElement().closest('.qti-choice').removeClass('key-navigation-highlight');
            }));
        }

        return interactionNavigators;
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
                elements : navigableDomElement.createFromDoms($itemElement),
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

        navigators = navigableGroupElement.createFromNavigators(navigators);

        return keyNavigator({
            id : 'test-runner',
            replace : true,
            loop : true,
            elements : navigators
        }).on('tab', function(elem){
            if (!allowedToNavigateFrom(elem)) {
                return false;
            } else {
                this.next();
            }
        }).on('shift+tab', function(elem){
            if (!allowedToNavigateFrom(elem)) {
                return false;
            } else {
                this.previous();
            }
        });
    }

    /**
     * Checks whether element is navigable from
     *
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    function allowedToNavigateFrom(element)
    {
        var $element = $(element);

        if ($element.hasClass(ignoredClass) || $element.parents('.' + ignoredClass).length > 0) {
            return false;
        }

        return true;
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

            //start disabled
            this.disable();

            //update plugin state based on changes
            testRunner
                .after('renderitem', function () {
                    self.groupNavigator = initTestRunnerNavigation(testRunner);

                    shortcut.add('tab shift+tab', function(e){
                        if (!allowedToNavigateFrom(e.target)) {
                            return false;
                        }
                        if(!self.groupNavigator.isFocused()){
                            self.groupNavigator.focus();
                        }
                    });

                    self.enable();
                })
                .on('unloaditem', function () {
                    self.disable();
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
            if(this.groupNavigator) {
                this.groupNavigator.destroy();
            }
        }
    });
});
