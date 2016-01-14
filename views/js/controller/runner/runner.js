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
define([
    'jquery',
    'lodash',
    'core/promise',
    'ui/feedback',
    'taoTests/runner/runner',
    'taoQtiTest/runner/provider/qti',
    'taoTests/runner/proxy',
    'taoQtiTest/runner/proxy/qtiServiceProxy',
    'taoQtiTest/runner/plugins/controls/title/title',
    'taoQtiTest/runner/plugins/controls/progressbar/progressbar',
    'taoQtiTest/runner/plugins/navigation/next',
    'taoQtiTest/runner/plugins/navigation/previous',
    'taoQtiTest/runner/plugins/navigation/nextSection',
    'taoQtiTest/runner/plugins/navigation/skip',
], function($, _, Promise, feedback, runner, qtiProvider, proxy, qtiServiceProxy, title, progressbar, next, previous, nextSection, skip) {
    'use strict';

    runner.registerProvider('qti', qtiProvider);
    proxy.registerProxy('qtiServiceProxy', qtiServiceProxy);

    var plugins = {
        title       : title,
        progress    : progressbar,
        previous    : previous,
        next        : next,
        skip        : skip,
        nextSection : nextSection
    };

    var runnerController = {
        start : function start(options){

            var config = _.defaults(options || {}, {
                renderTo : $('.test-runner')
            });

            runner('qti', plugins, config)
                .on('error', function(err){
                    console.error(err);
                    feedback().error(err);
                })
                .on('ready', function(){

                })
                .init();
        }
    };

    return runnerController;
});
