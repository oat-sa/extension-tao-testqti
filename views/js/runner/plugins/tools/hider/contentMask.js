/**
 * ContentMask component
 */
define([
    'lodash',
    'i18n',
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/tools/hider/contentMask',
], function(_, __, component, contentMaskTpl) {
    'use strict';

    var defaultConfig = {
        content: __('Content hidden'),
    };

    return function contentMaskFactory($container, config) {
        var api = {};
        var contentMask = component(api, defaultConfig);

        contentMask
            .setTemplate(contentMaskTpl)
            .on('init', function() {
                this.render($container);
                this.hide();
            })
            .on('render', function() {
                var self = this;
                var $element = this.getElement();

                $element.on('click', function() {
                    if (!self.is('hidden')) {
                        self.trigger('toggle');
                    }
                });
            })
            .on('toggle', function() {
                if (this.is('hidden')) {
                    this.show();
                } else {
                    this.hide();
                }
            })
        ;

        _.defer(function() {
            contentMask.init(config);
        });

        return contentMask;
    };
});