define([
    'taoTests/runner/plugin'
], function(pluginFactory) {
    'use strict';

    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name: 'hider',

        init: function init() {
            var self  = this;
            var areaBroker = this.getAreaBroker();

            this.button = areaBroker.getToolbox().createEntry({
                control: 'hider',
                text: 'Hider',
                title: 'Hide the item',
                icon: 'eye-slash'
            });
            this.button.on('click', function(e) {
                e.preventDefault();
                areaBroker.getContentArea().toggle();
            });

            this.getTestRunner()
                .on('enabletools renderitem', function (){
                    self.enable();
                })
                .on('disabletools unloaditem', function (){
                    self.disable();
                });
        },

        render: function render() {},

        destroy: function destroy() {},

        enable: function enable() {
            this.button.enable();
        },

        disable: function disable() {
            this.button.disable();
        },

        show: function show() {},

        hide: function hide() {}
    });
});
