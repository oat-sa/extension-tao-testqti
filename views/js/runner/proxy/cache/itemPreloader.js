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
 * (Pre)load an item and it's assets.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'lodash',
    'core/promise',
    'taoQtiTest/runner/config/assetManager',
    'taoQtiItem/runner/qtiItemRunner',
    'util/url'
], function(_, Promise, assetManagerFactory, qtiItemRunner, urlUtil){
    'use strict';

    //keep references to preloaded images attached
    //in order to prevent garbage collection of cached images
    var images = {};

    //get the same asset manager than the test runner
    var assetManager = assetManagerFactory();

    //create a DOM fragment to attach assets
    var fragment = document.createDocumentFragment();

    /**
     * Asset loaders per supported asset types
     */
    var loaders = {

        /**
         * Preload images, using the in memory Image object
         * @param {String} url - the url of the image to preload
         */
        img : function preloadImage(url){
            if('Image' in window && !images[url]){
                images[url] = new Image();
                images[url].src = url;
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

            //with prefetch we attach the <link> tag to the real <head>
            document.querySelector('head').appendChild(link);
        },

        audio : function preloadAudio(url){

            var audio = document.createElement('audio');
            audio.preload = 'auto';
            audio.src = url;

            fragment.appendChild(audio);
        }
    };

    /**
     * Asset unloaders per supported asset types
     */
    var unloaders = {

        /**
         * Remove images ref so they can be garbage collected
         * @param {String} url - the url of the image to unload
         */
        img : function unloadImage(url){
            _.remove(images[url]);
        },

        /**
         * Remove prefteched CSS link tag
         * @param {String} url - the url of the css to unload
         */
        css : function unloadCss(url){
            var link = document.querySelector('head link[rel="prefetch"][href="' + url + '"]');
            if(link){
                document.querySelector('head').removeChild(link);
            }
        },

        audio : function preloadAudio(url){

            var audio = fragment.querySelector('audio[src="' + url + '"]');
            if(audio){
                fragment.removeChild(audio);
            }
        }
    };

    /**
     * Resolves assets URLS using the assetManager
     * @param {String} baseUrl
     * @param {Object} assets - as  [ type : [urls] ]
     * @returns {Promise<Object>} assets with URLs resolved
     */
    var resolveAssets = function resolveAssets(baseUrl, assets){
        return new Promise(function(resolve){

            assetManager.setData('baseUrl', baseUrl);

            console.log(assets);

            return resolve(
                _.reduce(assets, function(acc, assetList, type){

                    var resolved = _(assetList)
                        .filter(function(url){
                            //filter base64 (also it seems sometimes we just have base64 data, without the protocol...)
                            return !urlUtil.isBase64(url) && /\.[a-zA-Z0-9]+$/.test(url);
                        })
                        .map(assetManager.resolve, assetManager)
                        .value();
                    if(resolved.length > 0){
                        acc[type] = resolved;
                    }
                    return acc;
                }, {})
            );
        });
    };

    /**
     * Item Preloader
     * @type {Object}
     */
    return {

        /**
         * Preload the given item (runtime and assets)
         *
         * @param {Object} item
         * @param {String} item.baseUrl - item baseUrl
         * @param {Object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
         * @returns {Promise<Boolean>} resolves with true if the item is loaded
         */
        preload : function preload(item) {
            var loading  = [];

            /**
             * Preload the item runner
             * @returns {Promise}
             */
            var itemLoad = function itemLoad(){
                return new Promise(function(resolve, reject){
                    qtiItemRunner(item.itemData.type, item.itemData.data, {
                        assetManager: assetManager
                    })
                    .on('init', function(){
                        resolve(true);
                    })
                    .on('error', reject)
                    .init();
                });
            };

            /**
             * Preload the item assets
             * @returns {Promise}
             */
            var assetLoad = function assetLoad(){
                return resolveAssets(item.baseUrl, item.itemData.assets).then(function(resolved){
                    _.forEach(resolved, function(assets, type){
                        console.log(type, assets);
                        if(_.isFunction(loaders[type])){
                            _.forEach(assets, loaders[type]);
                        }
                    });
                    return true;
                });
            };

            if(item && _.isString(item.baseUrl) && item.itemData){
                loading.push(itemLoad());

                if(_.size(item.itemData.assets) > 0){
                    loading.push(assetLoad());
                }
            }
            return Promise.all(loading).then(function(results){
                return results.length > 0 && _.all(results, _.isTrue);
            });
        },

        /**
         * Unload the assets for the given item
         *
         * @param {Object} item
         * @param {String} item.baseUrl - item baseUrl
         * @param {Object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
         * @returns {Promise}
         */
        unload : function unload(item){
            if(item && _.isString(item.baseUrl) && item.itemData && _.size(item.itemData.assets) > 0){
                return resolveAssets(item.baseUrl, item.itemData.assets).then(function(resolved){
                    _.forEach(resolved, function(assets, type){
                        if(_.isFunction(unloaders[type])){
                            _.forEach(assets, unloaders[type]);
                        }
                    });
                    return true;
                });
            }
            return Promise.resolve(false);
        }
    };
});
