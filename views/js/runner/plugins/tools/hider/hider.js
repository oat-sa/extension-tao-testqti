define([
    'i18n',
    'taoTests/runner/plugin',
    'taoQtiTest/runner/plugins/tools/hider/contentMask',
], function (__, pluginFactory, contentMaskFactory) {
    'use strict';

    return pluginFactory({
        name: 'hider',

        init : function init() {
            var self = this;
            var areaBroker = this.getAreaBroker();

            this.button = areaBroker.getToolbox().createEntry({
                control: 'hider',
                text: 'Hider',
                title: 'Hide the item',
                icon: 'eye-slash',
            });

            this.contentMask = contentMaskFactory(areaBroker.getContentArea().parent(), {
                content: __('Please, do not check my answers! Thanks :)'),
            });

            this.button.on('click', function() {
                areaBroker.getContentArea().toggle();

                if (areaBroker.getContentArea().is(':visible')) {
                    self.contentMask.hide();
                } else {
                    self.contentMask.show();
                }
            });

            areaBroker.getContentArea().parent().on('click', function() {
                if (areaBroker.getContentArea().is(':hidden')) {
                    self.getHost().trigger('contentMaskClicked');
                }
            });

            this.getHost().on('contentMaskClicked', function() {
                self.button.trigger('click');
            });

            this.getTestRunner()
                .on('enabletools renderitem', function() {
                    self.enable();
                })
                .on('disabletools unloaditem', function() {
                    self.disable();
                })
            ;
        },

        destroy : function destroy() {
            if (this.button) {
                this.button.off('click');
                this.contentMask.destroy();
            }
        },

        enable : function enable() {
            this.button.enable();
        },

        disable : function disable() {
            this.button.disable();
        }
    });
});