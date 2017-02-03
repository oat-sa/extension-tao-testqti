/*
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
 * Copyright (c) 2017 Open Assessment Technologies SA
 */

/**
 * Pre load assets
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'taoQtiTest/runner/config/assetManager',
    'util/url'
], function(_, assetManagerFactory, urlUtil){
    'use strict';

    //get the same asset manager than the test runner
    var assetManager = assetManagerFactory();

    /**
     * Asset loaders per supported asset types
     */
    var loaders = {

        /**
         * Preload images, using the in memory Image object
         * @param {String} url - the url of the image to preload
         */
        img : function preloadImage(url){
            if('Image' in window){
                new Image().src = url;
            }
        },

        /**
         * Preload images, using prefetch
         * @param {String} url - the url of the image to preload
         */
        css : function preloadCss(url){
            var link = document.createElement('link');
            link.setAttribute('rel', 'prefetch');
            link.setAttribute('href', url);

            //be safe in case preload is not supported
            link.setAttribute('disabled', true);
            document.querySelector('head').appendChild(link);
        }
    };

    /**
     * Run the asset preload
     * @param {String} baseUrl - item baseUrl
     * @param {Object} assets - assets per types :  img : ['url1', 'url2' ]
     */
    return function preload(baseUrl, assets) {

        if(assets && _.size(assets) > 0){

            assetManager.setData('baseUrl', baseUrl);

            _.forEach(assets, function(assetList, type){
                if(_.isFunction(loaders[type]) && _.size(assetList) > 0 ){
                    _(assetList)
                        .filter(function(url){
                            //filter base64 (also it seems sometimes we just have base64 data, without the protocol...)
                            return !urlUtil.isBase64(url) && /\.[a-zA-Z]+$/.test(url);
                        })
                        .map(assetManager.resolve, assetManager)
                        .forEach(function(url){
                            loaders[type](url);
                        });
                }
            });
        }
    };
});
