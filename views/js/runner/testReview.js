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
    'i18n',
    'tpl!taoQtiTest/tpl/navigator',
    'tpl!taoQtiTest/tpl/navigatorTree'
], function ($, _, __, navigatorTpl, navigatorTreeTpl) {
    'use strict';

    /**
     * List of CSS classes
     * @type {Object}
     * @private
     */
    var _cssCls = {
        active : 'active',
        collapsed : 'collapsed',
        masked : 'masked',
        disabled : 'disabled',
        flagged : 'flagged',
        answered : 'answered',
        viewed : 'viewed',
        unseen : 'unseen',
        icon : 'qti-navigator-icon'
    };

    /**
     * List of common CSS selectors
     * @type {Object}
     * @private
     */
    var _selectors = {
        component : '.qti-navigator',
        parts : '.qti-navigator-part',
        partLabels : '.qti-navigator-part > .qti-navigator-label',
        sections : '.qti-navigator-section',
        sectionLabels : '.qti-navigator-section > .qti-navigator-label',
        items : '.qti-navigator-item',
        itemLabels : '.qti-navigator-item > .qti-navigator-label',
        itemIcons : '.qti-navigator-item > .qti-navigator-icon',
        icons : '.qti-navigator-icon',
        linearStart : '.qti-navigator-linear-part button',
        counters : '.qti-navigator-counter',
        actives : '.active',
        collapsibles : '.collapsible',
        collapsiblePanels : '.collapsible-panel',
        unseen : '.unseen',
        answered : '.answered',
        notFlagged : ':not(.flagged)',
        notAnswered : ':not(.answered)',
        masked : '.masked'
    };

    /**
     * Maps the filter mode to filter criteria.
     * Each filter criteria is a CSS selector used to find and mask the items to be discarded by the filter.
     * @type {Object}
     * @private
     */
    var _filterMap = {
        all : "",
        unanswered : _selectors.answered,
        flagged : _selectors.notFlagged,
        answered : _selectors.notAnswered,
        filtered : _selectors.masked
    };

    /**
     * Maps of config options translated from the context object to the local options
     * @type {Object}
     * @private
     */
    var _optionsMap = {
        'reviewSectionOnly' : 'sectionOnly',
        'reviewPreventsUnseen' : 'preventsUnseen'
    };

    /**
     * Provides a test review manager
     * @type {{init: Function, update: Function, on: Function, off: Function, trigger: Function}}
     */
    var testReview = {
        /**
         * Initializes the component
         * @param {String|jQuery|HTMLElement} element The element on which install the component
         * @param {Object} [options] A list of extra options
         * @param {String} [options.region] The region on which put the component: left or right
         * @param {Boolean} [options.sectionOnly] Limit the review screen to the current test section only
         * @param {Boolean} [options.preventsUnseen] Prevents the test taker to access unseen items
         * @returns {testReview}
         */
        init: function init(element, options) {
            this.options = _.isObject(options) && options || {};

            var putOnRight = 'right' === this.options.region;
            var insertMethod = putOnRight ? 'append' : 'prepend';

            // clean the DOM if the init method is called after initialisation
            if (this.$container) {
                this.$container.empty();
            }

            // build the component structure and inject it into the DOM
            this.$container = $(element);
            insertMethod = this.$container[insertMethod];
            if (insertMethod) {
                insertMethod.call(this.$container, navigatorTpl({
                    region: putOnRight ? 'right' : 'left'
                }));
            } else {
                throw "Unable to inject the component structure into the DOM";
            }

            // install the component behaviour
            this._loadDOM();
            this._initEvents();

            return this;
        },

        /**
         * Links the component to the underlying DOM elements
         * @private
         */
        _loadDOM: function() {
            // access to info panel displaying counters
            this.$infoAnswered = this.$container.find('#qti-navigator-answered ' + _selectors.counters);
            this.$infoViewed = this.$container.find('#qti-navigator-viewed ' + _selectors.counters);
            this.$infoUnanswered = this.$container.find('#qti-navigator-unanswered ' + _selectors.counters);
            this.$infoFlagged = this.$container.find('#qti-navigator-flagged ' + _selectors.counters);

            // access to filter switches
            this.$filterBar = this.$container.find('#qti-navigator-filters');
            this.$filters = this.$filterBar.find('li');

            // access to the tree of parts/sections/items
            this.$tree = this.$container.find('#qti-navigator-tree');

            // access to the panel displayed when a linear part is reached
            this.$linearState = this.$container.find('#qti-navigator-linear');
        },

        /**
         * Installs the event handlers on the underlying DOM elements
         * @private
         */
        _initEvents: function() {
            var that = this;

            // click on a part title: toggle the related panel
            this.$tree.on('click' + _selectors.component, _selectors.partLabels, function() {
                var $panel = $(this).closest(_selectors.parts);

                var open = that._togglePanel($panel, _selectors.parts);

                if (open) {
                    if ($panel.hasClass(_cssCls.active)) {
                        that._openSelected();
                    } else {
                        that._openOnly($panel.find(_selectors.sections).first(), $panel);
                    }
                }
            });

            // click on a section title: toggle the related panel
            this.$tree.on('click' + _selectors.component, _selectors.sectionLabels, function() {
                var $panel = $(this).closest(_selectors.sections);

                that._togglePanel($panel, _selectors.sections);
            });

            // click on an item: jump to the position
            this.$tree.on('click' + _selectors.component, _selectors.itemLabels, function(event) {
                var $item = $(this).closest(_selectors.items);
                var $target;
                if (!$item.hasClass(_cssCls.disabled)) {
                    $target = $(event.target);
                    if ($target.is(_selectors.icons)) {
                        if (!$item.hasClass(_cssCls.unseen)) {
                            that._mark($item);
                        }
                    } else {
                        that._select($item);
                        that._jump($item);
                    }
                }
            });

            // click on the start button inside a linear part: jump to the position
            this.$tree.on('click' + _selectors.component, _selectors.linearStart, function() {
                var $btn = $(this);
                if (!$btn.hasClass(_cssCls.disabled)) {
                    $btn.addClass(_cssCls.disabled);
                    that._jump($btn);
                }
            });

            // click on a filter button
            this.$filterBar.on('click' + _selectors.component, 'li', function() {
                var $btn = $(this);
                var mode = $btn.data('mode');

                that.$filters.removeClass(_cssCls.active);
                $btn.addClass(_cssCls.active);

                that._filter(mode);
            });
        },

        /**
         * Filters the items by a criteria
         * @param {String} criteria
         * @private
         */
        _filter: function(criteria) {
            var $items = this.$tree.find(_selectors.items).removeClass(_cssCls.masked);
            var filter = _filterMap[criteria];
            if (filter) {
                $items.filter(filter).addClass(_cssCls.masked);
            }
            this._updateSectionCounters(!!filter);
        },

        /**
         * Selects an item
         * @param {String|jQuery} position The item's position
         * @param {Boolean} [open] Forces the tree to be opened on the selected item
         * @returns {jQuery} Returns the selected item
         * @private
         */
        _select: function(position, open) {
            // find the item to select and extract its hierarchy
            var selected = position && position.jquery ? position : this.$tree.find('[data-position=' + position + ']');
            var hierarchy = selected.parentsUntil(this.$tree);

            // collapse the full tree and open only the hierarchy of the selected item
            if (open) {
                this._openOnly(hierarchy);
            }

            // select the item
            this.$tree.find(_selectors.actives).removeClass(_cssCls.active);
            hierarchy.add(selected).addClass(_cssCls.active);
            return selected;
        },

        /**
         * Opens the tree on the selected item only
         * @returns {jQuery} Returns the selected item
         * @private
         */
        _openSelected: function() {
            // find the selected item and extract its hierarchy
            var selected = this.$tree.find(_selectors.items + _selectors.actives);
            var hierarchy = selected.parentsUntil(this.$tree);

            // collapse the full tree and open only the hierarchy of the selected item
            this._openOnly(hierarchy);

            return selected;
        },

        /**
         * Collapses the full tree and opens only the provided branch
         * @param {jQuery} opened The element to be opened
         * @param {jQuery} [root] The root element from which collapse the panels
         * @private
         */
        _openOnly: function(opened, root) {
            (root || this.$tree).find(_selectors.collapsibles).addClass(_cssCls.collapsed);
            opened.removeClass(_cssCls.collapsed);
        },

        /**
         * Toggles a panel
         * @param {jQuery} panel The panel to toggle
         * @param {String} [collapseSelector] Selector of panels to collapse
         * @returns {Boolean} Returns `true` if the panel just expanded now
         */
        _togglePanel: function(panel, collapseSelector) {
            var collapsed = panel.hasClass(_cssCls.collapsed);

            if (collapseSelector) {
                this.$tree.find(collapseSelector).addClass(_cssCls.collapsed);
            }

            if (collapsed) {
                panel.removeClass(_cssCls.collapsed);
            } else {
                panel.addClass(_cssCls.collapsed);
            }
            return collapsed;
        },

        /**
         * Sets the icon of a particular item
         * @param {jQuery} $item
         * @param {String} icon
         * @private
         */
        _setItemIcon: function($item, icon) {
            $item.find(_selectors.icons).attr('class', _cssCls.icon + ' icon-' + icon);
        },

        /**
         * Sets the icon of a particular item according to its state
         * @param {jQuery} $item
         * @private
         */
        _adjustItemIcon: function($item) {
            var icon = null;
            var defaultIcon = _cssCls.unseen;
            var iconCls = [
                _cssCls.flagged,
                _cssCls.answered,
                _cssCls.viewed
            ];

            _.forEach(iconCls, function(cls) {
                if ($item.hasClass(cls)) {
                    icon = cls;
                    return false;
                }
            });

            this._setItemIcon($item, icon || defaultIcon);
        },

        /**
         * Marks an item for later review
         * @param {jQuery} $item
         * @private
         */
        _mark: function($item) {
            var itemId = $item.data('id');
            var itemPosition = $item.data('position');
            var flag = !$item.hasClass(_cssCls.flagged);

            $item.toggleClass(_cssCls.flagged);
            this._adjustItemIcon($item);

            /**
             * A storage of the flag is required
             * @event testReview#mark
             * @param {Boolean} flag - Tells whether the item is marked for review or not
             * @param {Number} position - The item position on which jump
             * @param {String} itemId - The identifier of the target item
             * @param {testReview} testReview - The client testReview component
             */
            this.trigger('mark', [flag, itemPosition, itemId]);
        },

        /**
         * Jumps to an item
         * @param {jQuery} $item
         * @private
         */
        _jump: function($item) {
            var itemId = $item.data('id');
            var itemPosition = $item.data('position');

            /**
             * A jump to a particular item is required
             * @event testReview#jump
             * @param {Number} position - The item position on which jump
             * @param {String} itemId - The identifier of the target item
             * @param {testReview} testReview - The client testReview component
             */
            this.trigger('jump', [itemPosition, itemId]);
        },

        /**
         * Updates the sections related items counters
         * @param {Boolean} filtered
         */
        _updateSectionCounters: function(filtered) {
            var filter = _filterMap[filtered ? 'filtered' : 'answered'];
            this.$tree.find(_selectors.sections).each(function() {
                var $section = $(this);
                var $items = $section.find(_selectors.items);
                var $filtered = $items.filter(filter);
                var total = $items.length;
                var nb = total - $filtered.length;
                $section.find(_selectors.counters).html(nb + '/' + total);
            });
        },

        /**
         * Updates the local options from the provided context
         * @param {Object} testContext The progression context
         * @private
         */
        _updateOptions: function(testContext) {
            var options = this.options;
            _.forEach(_optionsMap, function(optionKey, contextKey) {
                if (undefined !== testContext[contextKey]) {
                    options[optionKey] = testContext[contextKey];
                }
            });
        },

        /**
         * Updates the info panel
         * @param {Object} testContext The progression context
         */
        _updateInfos: function(testContext) {
            var total = testContext.numberItems || 0;
            var answered = testContext.numberCompleted || 0;
            var viewed = testContext.numberPresented || 0;
            var flagged = testContext.numberReview || 0;
            var unanswered = total - answered;

            // update the info panel
            this.$infoAnswered.text(answered + '/' + total);
            this.$infoUnanswered.text(unanswered + '/' + total);
            this.$infoViewed.text(viewed + '/' + total);
            this.$infoFlagged.text(flagged + '/' + total);
        },

        /**
         * Updates the navigation tre
         * @param {Object} testContext The progression context
         */
        _updateTree: function(testContext) {
            var navigatorMap = testContext.navigatorMap;
            var _partsFilter = function(part) {
                if (part.sections) {
                    part.sections = _.filter(part.sections, _partsFilter);
                }
                return part.active;
            };

            // rebuild the tree
            if (navigatorMap) {
                if (this.options.sectionOnly) {
                    // display only the current section
                    navigatorMap = _.filter(navigatorMap, _partsFilter);
                }

                this.$filterBar.show();
                this.$linearState.hide();
                this.$tree.html(navigatorTreeTpl({
                    parts: navigatorMap
                }));

                if (this.options.preventsUnseen) {
                    // disables all unseen items to prevent the test taker has access to.
                    this.$tree.find(_selectors.unseen).addClass(_cssCls.disabled);
                }
            } else {
                this.$filterBar.hide();
                this.$linearState.show();
                this.$tree.empty();
            }

            // apply again the current filter
            this._filter(this.$filters.filter(_selectors.actives).data('mode'));
        },

        /**
         * Updates the review screen
         * @param {Object} testContext The progression context
         */
        update: function update(testContext) {
            this._updateOptions(testContext);
            this._updateInfos(testContext);
            this._updateTree(testContext);
        },

        /**
         * Install an event handler on the underlying DOM element
         * @param {String} eventName
         * @returns {testReview}
         */
        on: function on(eventName) {
            var dom = this.$container;
            if (dom) {
                dom.on.apply(dom, arguments);
            }

            return this;
        },

        /**
         * Uninstall an event handler from the underlying DOM element
         * @param {String} eventName
         * @returns {testReview}
         */
        off: function off(eventName) {
            var dom = this.$container;
            if (dom) {
                dom.off.apply(dom, arguments);
            }

            return this;
        },

        /**
         * Triggers an event on the underlying DOM element
         * @param {String} eventName
         * @param {Array|Object} extraParameters
         * @returns {testReview}
         */
        trigger : function trigger(eventName, extraParameters) {
            var dom = this.$container;

            if (undefined === extraParameters) {
                extraParameters = [];
            }
            if (!_.isArray(extraParameters)) {
                extraParameters = [extraParameters];
            }

            extraParameters.push(this);

            if (dom) {
                dom.trigger(eventName, extraParameters);
            }

            return this;
        }
    };

    /**
     * Builds an instance of testReview
     * @param {String|jQuery|HTMLElement} element The element on which install the component
     * @param {Object} [options] A list of extra options
     * @param {String} [options.region] The region on which put the component: left or right
     * @param {Boolean} [options.sectionOnly] Limit the review screen to the current test section only
     * @param {Boolean} [options.preventsUnseen] Prevents the test taker to access unseen items
     * @returns {testReview}
     */
    var testReviewFactory = function(element, options) {
        var component = _.clone(testReview, true);
        return component.init(element, options);
    };

    return testReviewFactory;
});
