/**
 * Hider Test Runner Plugin
 *
 * Adds a button to the Toolbar which hides the ContentArea to prevents others to see the test taker's test
 */
define([
    'i18n',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/tools/hider/contentMask',
], function (__, pluginFactory, contentMaskFactory) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({
        name: 'hider',

        /**
         * Initializes the plugin
         */
        init : function init() {
            var self = this;
            var areaBroker = this.getAreaBroker();
            var contentArea = areaBroker.getContentArea();
            var testRunner = this.getTestRunner();

            this.button = areaBroker.getToolbox().createEntry({
                control: 'hider',
                text: 'Hider',
                title: 'Hide the item',
                icon: 'eye-slash',
            });

            testRunner
                .on('enabletools renderitem', function() {
                    self.enable();
                })
                .on('disabletools unloaditem', function() {
                    self.disable();
                })
                .on('renderitem', function() {
                    self.contentMask = contentMaskFactory(areaBroker.getContentArea(), {
                        content: __('Please, do not check my answers! Thanks :)'),
                    });
                })
                .on('unloaditem', function() {
                    if (self.contentMask) {
                        self.contentMask.destroy();
                    }
                })
            ;

            this.button.on('click', function() {
                self.contentMask.trigger('toggle');
            });
        },

        /**
         * The plugin's destroy phase
         */
        destroy : function destroy() {
            if (this.button) {
                this.button.off('click');
                this.button.destroy();
            }

            if (this.contentMask) {
                this.contentMask.destroy();
            }
        },

        /**
         * Enable the button
         */
        enable : function enable() {
            this.button.enable();
        },

        /**
         * Disable the button
         */
        disable : function disable() {
            this.button.disable();
        }
    });
});