define([
    'i18n'
], function(
    __
) {
    'use strict';

    return {
        /**
         * Returns an object which contains the required data to compose an OfflineNavigationError.
         * This error get triggered in case when the test taker is unable to navigate offline.
         *
         * @returns {{data: {code: number, purpose: string, success: boolean, source: string, type: string}, message: string}}
         */
        getOfflineNavError: function getOfflineNavError() {
            return {
                message: __('We are unable to connect to the server to retrieve the next item.'),
                data: {
                    success: false,
                    source: 'navigator',
                    purpose: 'proxy',
                    type: 'nav',
                    code: 404
                }
            };
        },

        /**
         * Returns an object which contains the required data to compose an OfflineExitError.
         * This error get triggered in case when the test taker is unable to exit the test offline.
         *
         * @returns {{data: {code: number, purpose: string, success: boolean, source: string, type: string}, message: string}}
         */
        getOfflineExitError: function getOfflineExitError() {
            return {
                message: __('We are unable to connect the server to submit your results.'),
                data: {
                    success: false,
                    source: 'navigator',
                    purpose: 'proxy',
                    type: 'finish',
                    code: 404
                }
            };
        },

        /**
         * Returns an object which contains the required data to compose an OfflinePauseError.
         * This error get triggered in case when the test get paused in offline mode.
         *
         * @returns {{data: {code: number, purpose: string, success: boolean, source: string, type: string}, message: string}}
         */
        getOfflinePauseError: function getOfflinePauseError() {
            return {
                message: __('The test has been paused, we are unable to connect to the server.'),
                data: {
                    success: false,
                    source: 'navigator',
                    purpose: 'proxy',
                    type: 'pause',
                    code: 404
                }
            };
        }
    };
});
