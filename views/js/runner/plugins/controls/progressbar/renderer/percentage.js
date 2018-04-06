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
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/controls/progressbar/renderer/percentage',
    'ui/progressbar'
], function (component, percentageTpl) {
    'use strict';

    /**
     * Default config values
     * @type {Object}
     */
    var defaults = {
        showLabel: true
    };

    /**
     * Builds percentage indicator renderer
     * @param {Object} [config] - a config object
     * @param {Boolean} [config.showLabel=true] - show/hide the progress label
     * @param {Object} [progressData] - the initial dataset
     */
    return function percentageIndicatorRenderer(config, progressData) {
        var rendererApi = {
            /**
             * Update the progress bar according to the provided indicator data
             * @param {progressIndicator} data
             */
            update: function update(data) {
                progressData = data;
                if (this.is('rendered') && this.controls) {
                    this.controls.$label.text(progressData.label);
                    this.controls.$bar.progressbar('value', progressData.ratio);
                }

                /**
                 * Executes extra tasks on update
                 * @event percentageIndicatorRenderer#update
                 * @param {progressIndicator} data
                 */
                this.trigger('update', data);
            }
        };

        return component(rendererApi, defaults)
            .setTemplate(percentageTpl)
            .on('render', function() {
                // get access to the controls
                this.controls = {
                    $label: this.getElement().find('[data-control="progress-label"]'),
                    $bar: this.getElement().find('[data-control="progress-bar"]')
                };

                // apply option
                if (!this.config.showLabel) {
                    this.controls.$label.hide();
                }

                // and initialize the progress bar component
                this.controls.$bar.progressbar();

                // set the right progression according to init data
                if (progressData) {
                    this.update(progressData);
                }

                // forward the hidden state if it has been set before render
                if (this.is('hidden')) {
                    this.hide();
                }
            })
            .on('destroy', function() {
                this.controls = null;
            })
            .init(config);
    };
});
