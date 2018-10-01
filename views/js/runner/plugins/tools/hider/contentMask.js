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
            .on('init', function() {
                this.render($container);
                this.setState('visible', false);
                this.hide();
            })
            .on('toggle', function() {
                if (this.is('visible')) {
                    this.setState('visible', false);
                    this.hide();
                } else {
                    this.setState('visible', true);
                    this.show();
                }
            })
        ;

        _.defer(function() {
            contentMask
                .setTemplate(contentMaskTpl)
                .init(config)
            ;
        });

        return contentMask;
    };
});