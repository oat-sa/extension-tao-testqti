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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'lodash',
    'json!taoQtiTest/test/runner/plugins/tools/itemThemeSwitcher/themes.json'
], function(_, config){
    'use strict';

    var themesConfig;
    return {
        getConfig : function getConfig() {
            var initialConfig;

            if(!themesConfig){
                initialConfig = config;
                themesConfig = _.cloneDeep(initialConfig);
            }
            return themesConfig;
        },
        get : function get(what, ns){
            var localConfig = this.getConfig();
            if (ns) {
                what += '_' + ns;

            } else if (localConfig.activeNamespace && config[what + '_' + localConfig.activeNamespace]) {
                what += '_' + localConfig.activeNamespace;
            }
            if(_.isPlainObject(localConfig[what])){
                return localConfig[what];
            }
        },
        getAvailable : function getAvailable(what, ns){
            var available = [];
            var themes = this.get(what, ns);
            if(themes && _.isArray(themes.available)){
                available = themes.available;
            }
            return available;
        },
        getActiveNamespace : function getActiveNamespace(){
            return this.getConfig().activeNamespace;
        },
        setActiveNamespace : function setActiveNamespace(ns){
            this.getConfig().activeNamespace = ns;
        }
    };
});
