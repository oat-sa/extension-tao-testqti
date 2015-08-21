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
    'tpl!taoQtiTest/testRunner/tpl/button'
], function ($, _, __, buttonTpl) {
    'use strict';

    var _ns = '.actionBarButton';

    /**
     * Defines an action bar button
     * @type {Object}
     */
    var button = {
        /**
         * Initializes the button
         * @param {String} id
         * @param {Object} config
         * @param {String} [config.label] - the label to be displayed in the button
         * @param {String} [config.icon] - the icon to be displayed in the button
         * @param {String} [config.title] - the title to be displayed in the button
         * @param {Array} [config.items] - an optional list of menu items
         * @param {Object} testContext - the complete state of the test
         * @param {Object} testRunner - the test runner instance
         * @returns {button}
         */
        init : function init(id, config, testContext, testRunner) {
            this.config = _.omit(config, function(value) {
                return value === undefined || value === null;
            });
            this.config.id = id;

            this.testContext = testContext;
            this.testRunner = testRunner;

            this.setup();

            if (!this.config.title && this.config.label) {
                this.config.title = this.config.label;
            }

            return this;
        },

        /**
         * Uninstalls the button
         * @returns {button}
         */
        clear : function clear() {
            this.unbindEvents();

            return this;
        },

        /**
         * Renders the button to a DOM element
         * @returns {jQuery}
         */
        render : function render() {
            this.bindTo(buttonTpl(this.config));

            this.afterRender();

            this.bindEvents();

            return this.$button;
        },

        /**
         * Binds the button to an existing DOM
         * @param {jQuery|String|HTMLElement} dom - The DOM element to bind to
         * @returns {button}
         */
        bindTo : function bindTo(dom) {
            this.$button = $(dom);
            this.$menu = this.$button.find('.menu');

            return this;
        },

        /**
         * Binds the events onto the button DOM
         * @returns {button}
         */
        bindEvents : function bindEvents() {
            var self = this;

            this.$button.on('click' + _ns, function(e) {
                var hasMenu = self.hasMenu();
                var $menuItem = hasMenu && $(e.target).closest('.menu-item');
                var id = self.config.id;

                if ($menuItem && $menuItem.length) {
                    id = $menuItem.data('control');

                    self.setActiveMenu(id);
                    self.menuAction(id, $menuItem);
                    self.closeMenu();

                    /**
                     * Triggers a menuaction event
                     * @event button#menuaction
                     * @param {String} id - The menu item identifier
                     * @param {jQuery} $menuItem - The menu button
                     * @param {button} button - The button instance
                     */
                    self.$button.trigger('menuaction', [id, $menuItem, self]);
                } else {
                    self.action();

                    if (hasMenu) {
                        self.toggleMenu();
                    }

                    /**
                     * Triggers a action event
                     * @event button#action
                     * @param {String} id - The button identifier
                     * @param {button} button - The button instance
                     */
                    self.$button.trigger('action', [id, self]);
                }
            });

            return this;
        },

        /**
         * Removes events listeners from the button DOM
         * @returns {button}
         */
        unbindEvents : function unbindEvents() {
            if (this.$button) {
                this.$button.off(_ns);
            }

            return this;
        },

        /**
         * Tells if the button is visible and can be rendered
         * @returns {Boolean}
         */
        isVisible : function isVisible() {
            return true;
        },

        /**
         * Tells if the button has a menu
         * @returns {Boolean}
         */
        hasMenu : function hasMenu() {
            return !!(this.$menu && this.$menu.length);
        },

        /**
         * Tells if the menu is open
         * @returns {Boolean}
         */
        isMenuOpen : function isMenuOpen() {
            var isOpen = false;

            if (this.hasMenu()) {
                isOpen = !this.$menu.hasClass('hidden');
            }

            return isOpen;
        },

        /**
         * Closes the menu if the button have one
         * @returns {button}
         */
        closeMenu : function closeMenu() {
            if (this.hasMenu()) {
                this.setActive(false);
                this.$menu.addClass('hidden');
            }

            return this;
        },

        /**
         * Opens the menu if the button have one
         * @returns {button}
         */
        openMenu : function openMenu() {
            if (this.hasMenu()) {
                this.setActive(true);
                this.$menu.removeClass('hidden');
            }

            return this;
        },

        /**
         * Opens or closes the menu if the button have one
         * @returns {button}
         */
        toggleMenu : function toggleMenu() {
            if (this.hasMenu()) {
                if (this.isMenuOpen()) {
                    this.closeMenu();
                } else {
                    this.openMenu();
                }
            }

            return this;
        },

        /**
         * Install an event handler on the underlying DOM element
         * @param {String} eventName
         * @returns {button}
         */
        on: function on(eventName) {
            var dom = this.$button;
            if (dom) {
                dom.on.apply(dom, arguments);
            }

            return this;
        },

        /**
         * Uninstall an event handler from the underlying DOM element
         * @param {String} eventName
         * @returns {button}
         */
        off: function off(eventName) {
            var dom = this.$button;
            if (dom) {
                dom.off.apply(dom, arguments);
            }

            return this;
        },

        /**
         * Triggers an event on the underlying DOM element
         * @param {String} eventName
         * @param {Array|Object} extraParameters
         * @returns {button}
         */
        trigger : function trigger(eventName, extraParameters) {
            var dom = this.$button;

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
        },

        /**
         * Sets the button active state
         * @param {Boolean} active
         * @returns {button}
         */
        setActive : function setActive(active) {
            this.$button.toggleClass('active', active);

            return this;
        },

        /**
         * Gets the id of the selected menu entry
         * @returns {String|null}
         */
        getActiveMenu : function getActiveMenu() {
            var selected;
            if (this.hasMenu()) {
                selected = this.$menu.find('.selected').data('control');
            }
            return selected || null;
        },

        /**
         * Sets the selected menu entry
         * @param {String} id
         * @returns {button}
         */
        setActiveMenu : function setActiveMenu(id) {
            if (this.hasMenu()) {
                this.clearActiveMenu();
                this.$menu.find('[data-control="'+ id + '"]').addClass('selected');
            }
            return this;
        },

        /**
         * Clears the menu selection
         * @returns {button}
         */
        clearActiveMenu : function setActiveMenu() {
            if (this.hasMenu()) {
                this.$menu.find('.selected').removeClass('selected');
            }
            return this;
        },

        /**
         * Additional setup onto the button config set
         */
        setup : function setup() {
            // just a template method to be overloaded
        },

        /**
         * Additional DOM rendering
         */
        afterRender : function afterRender() {
            // just a template method to be overloaded
        },

        /**
         * Action called when the button is clicked
         */
        action : function action() {
            // just a template method to be overloaded
        },

        /**
         * Action called when a menu item is clicked
         * @param {String} id
         * @param {jQuery} $menuItem
         */
        menuAction : function menuAction(id, $menuItem) {
            // just a template method to be overloaded
        }
    };

    /**
     * Builds a button instance
     * @returns {button}
     */
    var buttonFactory = function buttonFactory() {
        return _.clone(button);
    };

    return buttonFactory;
});
