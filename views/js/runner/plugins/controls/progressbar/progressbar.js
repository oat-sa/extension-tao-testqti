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

    return pluginFactory({
        name : 'progressBar',
        init : function init(){
            var self = this;
            var testRunner = this.getTestRunner();

            this.$element = $(progressTpl());
            this.progressUpdate = progressUpdater($('[data-control="progress-bar"]', this.$element), $('[data-control="progress-label"]', this.$element));

            this.progressUpdate.update(testRunner.getTestContext());

            testRunner
                .after('move', function(){
                    self.progressUpdate.update(testRunner.getTestContext());
                });
        },
        render : function render(){
            var $container = this.getAreaBroker().getControlArea();
            $container.append(this.$element);
        },
    });
});
