define([
    'lodash',
    'taoQtiTest/runner/config/assetManager',
], function(_, assetManagerFactory){
    'use strict';

    var assetManager = assetManagerFactory();

    var loaders = {
        img : function preloadImage(url){
            new Image().src = url;
        },
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
