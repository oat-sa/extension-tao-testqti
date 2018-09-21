/**
 * ContentMask component
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/tools/hider/contentMask',
], function($, _, __, component, contentMaskTpl) {
    'use strict';

    var defaultConfig = {
        content: __('Content hidden'),
    };

    return function contentMaskFactory($container, config) {
        var api = {};
        var contentMask = component(api, defaultConfig);

        contentMask.setTemplate(contentMaskTpl);

        contentMask.on('init', function () {
            this.render($container);
            this.hide();
        });

        contentMask.init(config);

        return contentMask;
    };
});