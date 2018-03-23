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
    'core/logger',
    'taoQtiItem/runner/qtiItemRunner',
    'taoQtiTest/runner/config/assetManager',
    'util/url'
], function( _, Promise, loggerFactory, qtiItemRunner, getAssetManager, urlUtil){
    'use strict';

    var logger = loggerFactory('taoQtiTest/runner/proxy/cache/itemPreloader');

    /**
     * Test the support of possible `<link rel>` values.
     * @param {String} feature - the value to test
     * @returns {Boolean}
     */
    var relSupport = function relSupport(feature){
        var tokenList;
        var fakeLink = document.createElement('link');
        try {
            if(fakeLink.relList && _.isFunction(fakeLink.relList.supports)){
                return  fakeLink.relList.supports(feature);
            }
        } catch(err){
            return false;
        }
    };

    /**
     * Does the current env supports `<link ref="preload">`
     */
    var supportPreload = relSupport('preload');

    /**
     * Does the current env supports `<link ref="prefetch">`
     */
    var supportPrefetch = relSupport('prefetch');


    /**
     * Check if the given item object matches the expectations
     * @param {Object} item
     * @param {String} item.itemIdentifier - the item identifier
     * @param {String} item.baseUrl - item baseUrl
     * @param {Object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
     * @returns {Boolean}
     */
    var isItemObjectValid = function isItemObjectValid(item){
        return _.isPlainObject(item) &&
               _.isString(item.baseUrl) &&
               _.isString(item.itemIdentifier) && !_.isEmpty(item.itemIdentifier) &&
               _.isPlainObject(item.itemData);
    };

    /**
     * Create an instance of an item preloader
     * @param {Object} options
     * @param {String} options.testId - the unique identifier of the test instance, required to get the asset manager
     * @returns {itemPreloader}
     * @throws {TypeError} if the testId is not defined
     */
    var itemPreloaderFactory = function itemPreloaderFactory(options){

        //this is the test asset manager, referenced under options.testId
        var testAssetManager;

        //we also have a specific instance of the asset manager to
        //resolve assets of a next item (we can't use the test asset manager).
        var preloadAssetManager = getAssetManager('item-preloader');

        //keep references to preloaded images attached
        //in order to prevent garbage collection of cached images
        var images = {};

        //keep references to preloaded audio blobs
        var audioBlobs = {};

        /**
         * Asset loaders per supported asset types
         */
        var loaders = {

            /**
             * Preload images, using the in memory Image object
             * @param {String} url - the url of the image to preload
             * @param {String} sourceUrl - the unresolved URL (used to index)
             * @param {String} itemIdentifier - the id of the item the asset belongs to
             */
            img : function preloadImage(url, sourceUrl, itemIdentifier){
                images[itemIdentifier] = images[itemIdentifier] || {};
                if('Image' in window && !images[itemIdentifier][sourceUrl]){
                    images[itemIdentifier][sourceUrl] = new Image();
                    images[itemIdentifier][sourceUrl].src = url;
                }
            },

            /**
             * Preload stylesheets
             * @param {String} url - the url of the css to preload
             */
            css : function preloadCss(url){
                var link = document.createElement('link');
                if(supportPreload){
                    link.setAttribute('rel', 'preload');
                    link.setAttribute('as', 'style');
                } else if (supportPrefetch) {
                    link.setAttribute('rel', 'prefetch');
                    link.setAttribute('as', 'style');
                } else {
                    link.disabled = true;
                    link.setAttribute('rel', 'stylesheet');
                    link.setAttribute('type', 'text/css');
                }
                link.setAttribute('data-preload', true);
                link.setAttribute('href', url);

                document.querySelector('head').appendChild(link);
            },

            /**
             * Preload audio files : save the blobs for later use in the asset manager
             * @param {String} url - the url of the audio file to preload
             * @param {String} sourceUrl - the unresolved URL (used to index)
             * @param {String} itemIdentifier - the id of the item the asset belongs to
             */
            audio : function preloadAudio(url, sourceUrl, itemIdentifier){
                var request;
                audioBlobs[itemIdentifier] = audioBlobs[itemIdentifier] || {};
                if(typeof audioBlobs[itemIdentifier][sourceUrl] === 'undefined'){

                    //direct XHR to benefit from the "blob" response type
                    request = new XMLHttpRequest();
                    request.open('GET', url, true);
                    request.responseType = 'blob';
                    request.onload = function onRequestLoad() {
                        if(this.status === 200){
                            //save the blob, directly
                            audioBlobs[itemIdentifier][sourceUrl] = this.response;
                        }
                    };
                    //ignore failed requests, best effort only
                    request.send();
                }
            }
        };

        /**
         * Asset unloaders per supported asset types
         */
        var unloaders = {

            /**
             * Remove images ref so they can be garbage collected
             * @param {String} url - the url of the image to unload
             * @param {String} sourceUrl - the unresolved URL (used to index)
             * @param {String} itemIdentifier - the id of the item the asset belongs to
             */
            img : function unloadImage(url, sourceUrl, itemIdentifier){
                if(images[itemIdentifier]){
                    images[itemIdentifier] = _.omit(images[itemIdentifier], sourceUrl);
                }
            },

            /**
             * Remove prefteched CSS link tag
             * @param {String} url - the url of the css to unload
             */
            css : function unloadCss(url){
                var link = document.querySelector('head link[data-preload][href="' + url + '"]');
                if(link){
                    document.querySelector('head').removeChild(link);
                }
            },

            /**
             * Remove loaded audio files
             * @param {String} url - the url of the css to unload
             * @param {String} sourceUrl - the unresolved URL
             * @param {String} itemIdentifier - the id of the item the asset belongs to
             */
            audio : function unloadAudio(url, sourceUrl, itemIdentifier){
                if(audioBlobs[itemIdentifier]){
                    audioBlobs[itemIdentifier] = _.omit(audioBlobs[itemIdentifier], sourceUrl);
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

                preloadAssetManager.setData('baseUrl', baseUrl);
                preloadAssetManager.setData('assets', assets);

                return resolve(
                    _.reduce(assets, function(acc, assetList, type){

                        var resolved = {};
                        _.forEach(assetList, function(url){
                            //filter base64 (also it seems sometimes we just have base64 data, without the protocol...)
                            if(!urlUtil.isBase64(url)){
                                resolved[url] = preloadAssetManager.resolve(url);
                            }
                        });
                        if(_.size(resolved) > 0){
                            acc[type] = resolved;
                        }
                        return acc;
                    }, {})
                );
            });
        };

        if(!options || !options.testId){
            throw new TypeError('The test identifier is mandatory to start the item preloader');
        }

        testAssetManager = getAssetManager(options.testId);

        /**
         * Prepend a strategy to resolves cached assets
         */
        testAssetManager.prependStrategy({
            name : 'precaching',
            handle : function handlePrecache(url, data){
                var sourceUrl = url.toString();

                //resolves precached audio files
                if (data.itemIdentifier &&  audioBlobs[data.itemIdentifier] &&
                    typeof audioBlobs[data.itemIdentifier][sourceUrl] !== 'undefined') {

                    //creates an internal URL to link the audio blob
                    return URL.createObjectURL(audioBlobs[data.itemIdentifier][sourceUrl]);
                }
            }
        });

        /**
         * @typedef {Object} itemPreloader
         */
        return {

            /**
            * Preload the given item (runtime and assets)
            *
            * @param {Object} item
            * @param {String} item.itemIdentifier - the item identifier
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
                    logger.debug('Start preloading of item ' + item.itemIdentifier);
                    return new Promise(function(resolve, reject){
                        qtiItemRunner(item.itemData.type, item.itemData.data, {
                            assetManager: preloadAssetManager,
                            preload: true
                        })
                        .on('init', function(){
                            logger.debug('Preloading of item ' + item.itemIdentifier + ' done');
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
                            if(_.isFunction(loaders[type])){
                                _.forEach(assets, function(url, sourceUrl){
                                    logger.debug('Loading asset ' + sourceUrl + '(' + type + ') for item ' + item.itemIdentifier);

                                    loaders[type](url, sourceUrl, item.itemIdentifier);
                                });
                            }
                        });
                        return true;
                    });
                };

                if( isItemObjectValid(item) ){
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
            * @param {String} item.itemIdentifier - the item identifier
            * @param {String} item.baseUrl - item baseUrl
            * @param {Object} item.itemData.assets - assets per types :  img : ['url1', 'url2' ]
            * @param {String} itemIdentifier - the item identifier
            * @returns {Promise}
            */
            unload : function unload(item, itemIdentifier){
                if ( isItemObjectValid(item) && _.size(item.itemData.assets) > 0) {

                    return resolveAssets(item.baseUrl, item.itemData.assets).then(function(resolved){
                        _.forEach(resolved, function(assets, type){
                            if(_.isFunction(unloaders[type])){
                                _.forEach(assets, function(url, sourceUrl){

                                    logger.debug( 'Unloading asset ' + sourceUrl + '(' + type + ') for item ' + item.itemIdentifier);

                                    unloaders[type](url, sourceUrl, item.itemIdentifier);
                                });
                            }
                        });
                        return true;
                    });
                }
                return Promise.resolve(false);
            }
        };
    };

    return itemPreloaderFactory;
});
