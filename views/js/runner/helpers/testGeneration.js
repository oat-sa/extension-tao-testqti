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
 * This helper show waitingDialog for cat engine service
 *
 * @author Aleksej Tikhanovich <aleksej@taotesting.com>
 */
define([
    'lodash',
    'i18n',
    'ui/waitingDialog/waitingDialog'
], function (_, __, waitingDialog) {
    'use strict';

    var waitContentMessage = __('Sorry, but our test generation system cannot load your next items.\n Please wait while we retry for 2 minutes.');
    var proceedButtonText = __('Continue your test');
    var proceedContent = __('Success! Your next items have loaded. Thank you for your patience.');

    var proceedButtonTextError = __('Relaunch myTest');
    var waitContentError = __('Please wait while we retry for 2 minutes.');
    var proceedContentError = __('Unfortunately, our test delivery system still cannot load your next items, so we paused your test.\n' +
        'Please notify your proctor now, who will authorize you to relaunch your test. If the system is able to load your next items, you will continue testing where you left off.');

    var dialog = false;
    var time = 0;
    var timeout = 0;

    /**
     * @typedef {Object} testGenerationHelper
     */
    var testGenerationHelper = {
        showDialog : function showDialog (type, recheckAction, runner) {
            var testData = runner.getTestData();
            var config = testData.config;
            var catEngineWarning = config.catEngineWarning;
            var echoDelayUpdate = catEngineWarning['echoDelayUpdate'] ? catEngineWarning['echoDelayUpdate'] : 0;
            var echoPauseLimit = catEngineWarning['echoPauseLimit'] ? catEngineWarning['echoPauseLimit'] : 0;
            var echoExceptionName = catEngineWarning['echoExceptionName'] ? catEngineWarning['echoExceptionName'] : '';

            if (type === echoExceptionName) {
                if (dialog && !dialog.is('waiting')) {
                    dialog = false;
                }
                if (!dialog && time < echoPauseLimit) {
                    dialog = waitingDialog({
                        message : '',
                        waitContent : waitContentMessage,
                        proceedButtonText: proceedButtonText,
                        proceedContent : proceedContent
                    })
                        .on('proceed', function(){
                            runner.trigger('enableitem');
                        })
                        .on('render', function(){
                            runner.trigger('disableitem');
                        });
                } else if (dialog && time >= echoPauseLimit) {
                    dialog.destroy();
                    dialog = waitingDialog({
                        message : '',
                        waitContent : waitContentError,
                        proceedButtonText: proceedButtonTextError,
                        proceedContent : proceedContentError
                    })
                        .on('proceed', function(){
                            runner.trigger('pause');
                        })
                        .on('render', function(){
                            dialog.endWait();
                        });
                }
                if (time < echoPauseLimit) {
                    timeout = Math.ceil(Math.random() * echoDelayUpdate);
                    setTimeout(function(){
                        runner.trigger('unloaditem.' + recheckAction);
                        time = time + timeout;
                    }, timeout * 1000);
                }
            }
        },
        finishDialog: function isVisible(runner) {
            if (dialog && dialog.is('waiting')) {
                dialog.endWait();
                runner.trigger('disableitem');
            }
        }
    };

    return testGenerationHelper;
});
