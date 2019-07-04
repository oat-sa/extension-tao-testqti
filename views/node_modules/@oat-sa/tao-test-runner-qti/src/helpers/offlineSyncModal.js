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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */
/**
 * Module which displays modal window after the end of offline test
 *
 * @author Anton Tsymuk <anton@taotesting.com>
 */
import $ from 'jquery';
import __ from 'i18n';
import polling from 'core/polling';
import hider from 'ui/hider';
import waitingDialogFactory from 'ui/waitingDialog/waitingDialog';
import offlineSyncModalCountdownTpl from 'taoQtiTest/runner/helpers/templates/offlineSyncModalCountdown';

/**
 * Display the waiting dialog, while waiting the connection to be back
 * @param {Object} [proxy] - test runner proxy
 * @returns {waitingDialog} resolves once the wait is over and the user click on 'proceed'
 */
var offlineSyncModalFactory = function offlineSyncModalFactory(proxy) {
    var waitingConfig = {
        message: __('You are encountering a prolonged connectivity loss.'),
        waitContent: __(
            'Please continue waiting while we try to restore the connection. Alternatively, you may end this test by downloading it as a file which you will have to submit manually.'
        ),
        proceedContent: __('The connection seems to be back, please proceed.'),
        proceedButtonText: __('Proceed & End Test'),
        showSecondary: true,
        secondaryButtonText: __('Download'),
        secondaryButtonIcon: 'download',
        buttonSeparatorText: __('or'),
        width: '600px'
    };
    var $secondaryButton;
    var secondaryButtonWait = 60; // seconds to wait until it enables
    var $countdownText;
    var $countdown = $(offlineSyncModalCountdownTpl());
    var countdownPolling;

    //creates the waiting modal dialog
    var waitingDialog = waitingDialogFactory(waitingConfig)
        .on('render', function() {
            $secondaryButton = $('div.preview-modal-feedback.modal').find('button[data-control="secondary"]');

            $countdown.insertAfter($secondaryButton);

            proxy.off('reconnect.waiting').after('reconnect.waiting', function() {
                waitingDialog.endWait();
            });

            // if render comes before beginWait:
            if (waitingDialog.is('waiting')) {
                waitingDialog.trigger('begincountdown');
            }
        })
        .on('wait', function() {
            // if beginWait comes before render:
            if (waitingDialog.is('rendered')) {
                waitingDialog.trigger('begincountdown');
            }
        })
        .on('begincountdown', function() {
            var delaySec = secondaryButtonWait;
            // Set up secondary button time delay:
            // it can only be clicked after 60 seconds have passed
            $secondaryButton.prop('disabled', true);
            countdownPolling = polling({
                action: function() {
                    delaySec--;
                    $countdown.html(__('The download will be available in <strong>%d</strong> seconds', delaySec));
                    if (delaySec < 1) {
                        this.stop();
                        $secondaryButton.removeProp('disabled');
                        $countdown.html('');
                    }
                },
                interval: 1000,
                autoStart: true
            });
        })
        .on('unwait', function() {
            countdownPolling.stop();
            $secondaryButton.prop('disabled', true);
            $countdownText.remove();
            hider.hide('.between-buttons-text');
        });

    return waitingDialog;
};

export default offlineSyncModalFactory;
