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
    'tpl!taoQtiTest/runner/plugins/controls/progressbar/progressbar',
    'ui/progressbar'
], function ($, __, pluginFactory, progressTpl){
    'use strict';

    /**
     * Calculate progression based on the current context
     *
     * @param {Object} testContext The progression context
     * @param {String} progressIndicator - to select the progression type
     * @param {String} [progressScope] - the progression scope
     * @returns {Object} the progression with a label and a ratio
     */
    var progressUpdater = function progressUpdater(testContext, progressIndicator, progressScope){

        /**
         * Provide progression calculation based on the type of indicator
         */
        var updater = {

            /**
            * Updates the progress bar displaying the percentage
            * @param {Object} testContext The progression context
            * @returns {{ratio: number, label: string}}
            */
            percentage : function percentage() {
                var total = Math.max(1, testContext.numberItems);
                var ratio = Math.floor(testContext.numberCompleted / total * 100);
                return {
                    ratio : ratio,
                    label : ratio + '%'
                };
            },

            /**
            * Updates the progress bar displaying the position
            * @param {Object} testContext The progression context
            * @returns {{ratio: number, label: string}}
            */
            position : function position() {
                var progressScopeCounter = {
                    test : {
                        total : 'numberItems',
                        position : 'itemPosition'
                    },
                    testPart : {
                        total : 'numberItemsPart',
                        position : 'itemPositionPart'
                    },
                    testSection : {
                        total : 'numberItemsSection',
                        position : 'itemPositionSection'
                    }
                };
                var counter = progressScopeCounter[progressScope] || progressScopeCounter.test;
                var total = Math.max(1, testContext[counter.total]);
                var currentPosition = testContext[counter.position] + 1;
                return {
                    ratio : Math.floor(currentPosition / total * 100),
                    label : __('Item %d of %d', currentPosition, total)
                };
            }
        };
        return updater[progressIndicator]();
    };


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
            var $progressLabel,
                $progressControl;
            var testRunner = this.getTestRunner();
            var testData   = testRunner.getTestData();
            var progressIndicator = testData.config['progress-indicator'] || 'percentage';
            var progressScope = testData.config['progress-indicator-scope'] || 'test';

            /**
             * Updae the progress bar
             */
            var update = function update (){
                var progressData = progressUpdater(testRunner.getTestContext(), progressIndicator, progressScope);
                if(progressData && $progressLabel && $progressControl){
                    $progressLabel.text(progressData.label);
                    $progressControl.progressbar('value', progressData.ratio);
                }
            };

            //create the progressbar
            this.$element = $(progressTpl());

            $progressLabel = $('[data-control="progress-label"]', this.$element);
            $progressControl = $('[data-control="progress-bar"]', this.$element);
            $progressControl.progressbar();

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
        }
    });
});
