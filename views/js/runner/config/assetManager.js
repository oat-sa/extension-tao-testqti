/**
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
 * Copyright (c) 2017 Open Assessment Technologies SA ;
 */

/**
 * Get the configured asset manager factory
 *
 * TODO implement ability to override the strategies by configuration
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'taoItems/assets/manager',
    'taoItems/assets/strategies',
    'taoQtiItem/portableElementRegistry/assetManager/portableAssetStrategy',
], function(assetManagerFactory, assetStrategies, assetPortableElement) {
    'use strict';

    /**
     * The default strategies
     */
    var defaultStrategies = [
        assetStrategies.packedUrl,
        assetStrategies.external,
        assetStrategies.base64,
        assetStrategies.baseUrl,
        assetPortableElement
    ];

    //keep reference per test id
    var assetManagers = {};

    /**
     * Gives access to a configured assetManagerFactory
     * @param {String} testId - a unique identifier for the test instance
     * @returns {assetManagerFactory}
     */
    return function getAssetManager(testId){
        var assetManager;

        if(typeof assetManagers[testId] !== 'undefined'){
            assetManager = assetManagers[testId];
        } else {
            assetManager = assetManagerFactory(defaultStrategies, { baseUrl: '' });
            assetManagers[testId] = assetManager;
        }

        return assetManager;
    };
});

