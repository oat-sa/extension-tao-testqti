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
 * Test Runner Tool Plugin : Comment form
 *
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'i18n',
    'taoTests/runner/plugin',
    'ui/hider',
    'ui/stacker',
    'util/shortcut',
    'util/namespace',
    'tpl!taoQtiTest/runner/plugins/tools/comment/comment'
], function ($, __, pluginFactory, hider, stackerFactory, shortcut, namespaceHelper, commentTpl) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'comment',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init: function init() {
            var self = this;

            var testRunner = this.getTestRunner();
            var testData = testRunner.getTestData() || {};
            var testConfig = testData.config || {};
            var pluginShortcuts = (testConfig.shortcuts || {})[this.getName()] || {};
            var stacker = stackerFactory('test-runner');

            /**
             * Checks if the plugin is currently available
             * @returns {Boolean}
             */
            function isEnabled() {
                var context = testRunner.getTestContext();
                return !!context.options.allowComment;
            }

            /**
             * Can we comment ? if not, then we hide the plugin
             */
            function togglePlugin() {
                if (isEnabled()) {
                    self.show();
                } else {
                    self.hide();
                }
            }

            /**
             * Show/hide the comment panel
             */
            function toggleComment() {
                if (self.getState('enabled') !== false) {
                    //just show/hide the form
                    hider.toggle(self.$form);
                    if (!hider.isHidden(self.$form)) {
                        //reset the form on each display
                        self.$input.val('').focus();
                        self.button.turnOn();
                        stacker.bringToFront(self.$form);
                    } else {
                        self.button.turnOff();
                    }
                }
            }

            // register button in toolbox
            this.button = this.getAreaBroker().getToolbox().createEntry({
                control: 'comment',
                title: __('Leave a comment'),
                icon: 'tag',
                text: __('Comment')
            });

            //get access to controls
            this.button.on('render', function() {
                self.$button = self.button.getElement();
                self.$form = $(commentTpl()).appendTo(self.$button);
                self.$input = self.$button.find('[data-control="qti-comment-text"]');
                self.$cancel = self.$button.find('[data-control="qti-comment-cancel"]');
                self.$submit = self.$button.find('[data-control="qti-comment-send"]');

                stacker.autoBringToFront(self.$form);

                //hide the form without submit
                self.$cancel.on('click', function () {
                    hider.hide(self.$form);
                    self.button.turnOff();
                });

                //submit the comment, then hide the form
                self.$submit.on('click', function () {
                    var comment = self.$input.val();

                    if (comment) {
                        self.disable();
                        self.button.turnOff();

                        testRunner.getProxy()
                            .callTestAction('comment', {
                                comment: comment
                            })
                            .then(function () {
                                hider.hide(self.$form);
                                self.enable();
                            })
                            .catch(function () {
                                hider.hide(self.$form);
                                self.enable();
                            });
                    }
                });
            });


            //attach behavior
            this.button.on('click', function (e) {
                //prevent action if the click is made inside the form which is a sub part of the button
                if ($(e.target).closest('[data-control="qti-comment"]').length) {
                    return;
                }

                e.preventDefault();
                testRunner.trigger('tool-comment');
            });

            if (testConfig.allowShortcuts) {
                if (pluginShortcuts.toggle) {
                    shortcut.add(namespaceHelper.namespaceAll(pluginShortcuts.toggle, this.getName(), true), function () {
                        testRunner.trigger('tool-comment');
                    }, {
                        avoidInput: true
                    });
                }
            }

            //start disabled
            togglePlugin();
            this.disable();

            //update plugin state based on changes
            testRunner
                .on('loaditem', togglePlugin)
                .on('renderitem enabletools', function () {
                    self.enable();
                })
                .on('unloaditem disabletools', function () {
                    self.disable();
                })
                .on('tool-comment', function () {
                    if (isEnabled()) {
                        toggleComment();
                    }
                });
        },

        /**
         * Called during the runner's destroy phase
         */
        destroy: function destroy() {
            shortcut.remove('.' + this.getName());
        },

        /**
         * Enable the button
         */
        enable: function enable() {
            this.button.enable();
        },

        /**
         * Disable the button
         */
        disable: function disable() {
            if (this.$form) {
                hider.hide(this.$form);
            }
            this.button.disable();
            this.button.turnOff();
        },

        /**
         * Show the button
         */
        show: function show() {
            this.button.show();
        },

        /**
         * Hide the button
         */
        hide: function hide() {
            if (this.$form) {
                hider.hide(this.$form);
            }
            this.button.hide();
        }
    });
});
