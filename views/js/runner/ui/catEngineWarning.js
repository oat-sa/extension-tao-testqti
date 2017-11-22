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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * This component show waitingDialog for cat engine service
 *
 * @author Aleksej Tikhanovich <aleksej@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'ui/waitingDialog/waitingDialog',
    'ui/component'
], function (_, __, waitingDialog, component) {
    'use strict';

    var waitContentMessage = __('Sorry, but our test generation system cannot load your next items.\n Please wait while we retry for 2 minutes.');
    var proceedButtonText = __('Continue your test');
    var proceedContent = __('Success! Your next items have loaded. Thank you for your patience.');

    var proceedButtonTextError = __('Relaunch myTest');
    var waitContentError = __('Please wait while we retry for 2 minutes.');
    var proceedContentError = __('Unfortunately, our test delivery system still cannot load your next items, so we paused your test.\n' +
        'Please notify your proctor now, who will authorize you to relaunch your test. If the system is able to load your next items, you will continue testing where you left off.');

    var _defaults = {
        echoDelayUpdate: 15,
        echoPauseLimit: 120
    };

    /**
     * @typedef {Object} catEngineWarningFactory
     */
    var catEngineWarningFactory = function catEngineWarningFactory(config) {
        var catEngineWarning;
        var dialog = false;
        var time = 0;
        var timeout = 0;

        config = _.defaults(config || {}, _defaults);

        catEngineWarning = {
            show: function show() {
                var self = this;

                if (dialog && !dialog.is('waiting')) {
                    dialog = false;
                }
                if (!dialog && time < config.echoPauseLimit) {
                    dialog = waitingDialog({
                        message : '',
                        waitContent : waitContentMessage,
                        proceedButtonText: proceedButtonText,
                        proceedContent : proceedContent
                    })
                        .on('proceed', function(){
                            self.trigger('proceed.warning');
                        })
                        .on('render', function(){
                            self.trigger('render.warning');
                        });
                } else if (dialog && time >= config.echoPauseLimit) {
                    dialog.destroy();
                    dialog = waitingDialog({
                        message : '',
                        waitContent : waitContentError,
                        proceedButtonText: proceedButtonTextError,
                        proceedContent : proceedContentError
                    })
                        .on('proceed', function(){
                            self.trigger('proceedpause.warning');
                        })
                        .on('render', function(){
                            dialog.endWait();
                        });
                }
                if (time < config.echoPauseLimit) {
                    timeout = Math.ceil(Math.random() * config.echoDelayUpdate);
                    setTimeout(function(){
                        time = time + timeout;
                        self.trigger('recheck.warning');
                    }, timeout * 1000);
                }
                return self;
            },
            finish: function finish() {
                var self = this;
                if (dialog && dialog.is('waiting')) {
                    dialog.endWait();
                    self.trigger('disableitem.warning');
                }
                return self;
            }
        };
        return component(catEngineWarning).init(config);
    };

    return catEngineWarningFactory;
});
