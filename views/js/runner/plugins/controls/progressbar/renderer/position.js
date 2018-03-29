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
    'ui/component',
    'tpl!taoQtiTest/runner/plugins/controls/progressbar/renderer/position',
    'tpl!taoQtiTest/runner/plugins/controls/progressbar/renderer/position-point'
], function (_, component, positionTpl, pointTpl) {
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
    return function positionIndicatorRenderer(config, progressData) {
        var count = 0;

        var rendererApi = {
            /**
             * Update the progress bar according to the provided indicator data
             * @param {progressIndicator} data
             */
            update: function update(data) {
                progressData = data;
                if (this.is('rendered') && this.controls) {
                    if (count !== progressData.total) {
                        // the number of points have changed, regenerate the full bar
                        count = progressData.total;
                        this.controls.$bar.empty().append(pointTpl(_.range(count)));
                    }
                    this.controls.$label.text(progressData.label);
                    this.controls.$bar
                        // remove progression from all points
                        .children().removeClass('reached current')
                        // set progression to each reached point
                        .slice(0, progressData.position).addClass('reached')
                        // set current position
                        .slice(-1).addClass('current');
                }

                /**
                 * Executes extra tasks on update
                 * @event positionIndicatorRenderer#update
                 * @param {progressIndicator} data
                 */
                this.trigger('update', data);
            }
        };

        return component(rendererApi, defaults)
            .setTemplate(positionTpl)
            .on('render', function() {
                // get access to the controls
                this.controls = {
                    $label: this.getElement().find('[data-control="progress-label"]'),
                    $bar: this.getElement().find('[data-control="progress-bar"] .progressbar-points')
                };

                // apply option
                if (!this.config.showLabel) {
                    this.controls.$label.hide();
                }

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
