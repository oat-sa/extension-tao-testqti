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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */

/**
 * Test Runner Control Plugin : Progress Bar
 *
 * TODO move the progressUpdater inside the plugin at some point
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'i18n',
    'taoTests/runner/plugin',
    'taoQtiTest/testRunner/progressUpdater',
    'tpl!taoQtiTest/runner/plugins/controls/progressbar/progressbar'
], function ($, __, pluginFactory, progressUpdater, progressTpl){
    'use strict';


    /**
     * Returns the configured plugin
     */
    return pluginFactory({

        name : 'progressBar',

        /**
         * Initialize the plugin (called during runner's init)
         */
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();

            //update the progress bar at the beginning and
            var update = function update (){
                if(self.progressUpdater){
                    self.progressUpdater.update(testRunner.getTestContext());
                }
            };

            //create the progressbar
            this.$element = $(progressTpl());

            //load the updater
            this.progressUpdater = progressUpdater(
                    $('[data-control="progress-bar"]', this.$element),
                    $('[data-control="progress-label"]', this.$element)
                );

            update();

            testRunner
                .on('ready', update)
                .on('loaditem', update);
        },

        /**
         * Called during the runner's render phase
         */
        render : function render(){
            var $container = this.getAreaBroker().getControlArea();
            $container.append(this.$element);
        },
    });
});
