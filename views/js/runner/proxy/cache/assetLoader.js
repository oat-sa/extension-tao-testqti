define([
    'lodash',
    'taoQtiTest/runner/config/assetManager',
], function(_, assetManagerFactory){
    'use strict';

    var assetManager = assetManagerFactory();

    var loaders = {
        img : function preloadImage(url){
            if('Image' in window){
                new Image().src = url;
            }
        },

        css : function preloadCss(url){
            var link = document.createElement('link');
            link.setAttribute('rel', 'prefetch');
            link.setAttribute('href', url);
            link.setAttribute('disabled', true);
            document.querySelector('head').appendChild(link);
        }
    };

    return function load(baseUrl, assets) {

        if(assets && _.size(assets) > 0){

            assetManager.setData('baseUrl', baseUrl);

            _.forEach(assets, function(assetList, type){
                if(_.isFunction(loaders[type]) && _.size(assetList) > 0 ){
                    _(assetList)
                        .map(assetManager.resolve, assetManager)
                        .forEach(function(url){
                            loaders[type](url);
                        });
                }
            });
        }
    };
});
