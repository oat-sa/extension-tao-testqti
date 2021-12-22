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
 * Copyright (c) 2020 Open Assessment Technologies SA ;
 */
/**
 * Track the change within the testCreator
 * @author Juan Luis Gutierrez Dos Santos <juanluis.gutierrezdossantos@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'lib/uuid',
    'core/eventifier',
    'ui/dialog'
], function (
    $,
    _,
    __,
    uuid,
    eventifier,
    dialog
) {
    'use strict';

    /**
     * The messages asking to save
     */
    const messages = {
        preview: __('The test needs to be saved before it can be previewed.'),
        leave: __('The test has unsaved changes, are you sure you want to leave?'),
        exit: __('The test has unsaved changes, would you like to save it?'),
        leaveWhenInvalid: __('If you leave the test, your changes will not be saved due to invalid test settings. Are you sure you wish to leave?')
    };
    const buttonsYesNo = [{
        id: 'dontsave',
        type: 'regular',
        label: __('YES'),
        close: true
    }, {
        id: 'cancel',
        type: 'regular',
        label: __('NO'),
        close: true
    }];
    const buttonsCancelSave = [{
        id: 'dontsave',
        type: 'regular',
        label: __('Don\'t save'),
        close: true
    }, {
        id: 'cancel',
        type: 'regular',
        label: __('Cancel'),
        close: true
    }, {
        id: 'save',
        type: 'info',
        label: __('Save'),
        close: true
    }];

    /**
     *
     * @param {HTMLElement} container
     * @param {testCreator} testCreator
     * @param {String} [wrapperSelector]
     * @returns {changeTracker}
     */
    function changeTrackerFactory(container, testCreator, wrapperSelector = 'body') {

        // internal namespace for global registered events
        const eventNS = `.ct-${uuid(8, 16)}`;

        // keep the value of the test before changes
        let originalTest;

        // are we in the middle of the confirm process?
        let asking = false;

        /**
         * @typedef {Object} changeTracker
         */
        const changeTracker = eventifier({
            /**
             * Initialized the changed state
             * @returns {changeTracker}
             */
            init() {
                originalTest = this.getSerializedTest();

                return this;
            },

            /**
             * Installs the change tracker, registers listeners
             * @returns {changeTracker}
             */
            install() {
                this.init();
                asking = false;

                // add a browser popup to prevent leaving the browser
                $(window)
                    .on(`beforeunload${eventNS}`, () => {
                        if (!asking && this.hasChanged()) {
                            return messages.leave;
                        }
                    })
                    // since we don't know how to prevent history based events, we just stop the handling
                    .on('popstate', this.uninstall);

                // every click outside the authoring
                $(wrapperSelector)
                    .on(`click${eventNS}`, e => {
                        let $classError = $('.test-creator-props').find('span.validate-error');

                        if (!$.contains(container, e.target) && this.hasChanged()) {
                            e.stopImmediatePropagation();
                            e.preventDefault();

                        if ($classError.length > 0) {
                            this.confirmBefore('leaveWhenInvalid')
                                .then(whatToDo => {
                                    this.ifWantSave(whatToDo);
                                    this.uninstall();
                                    e.target.click();
                                })
                                .catch(() => {});
                        } else {
                            this.confirmBefore('exit')
                                .then(whatToDo => {
                                    this.ifWantSave(whatToDo);
                                    this.uninstall();
                                    e.target.click();
                                })
                                //do nothing but prevent uncaught error
                                .catch(() => {});
                           }
                        }
                    });

                testCreator
                    .on(`ready${eventNS} saved${eventNS}`, () => this.init())
                    .before(`creatorclose${eventNS}`, () => this.confirmBefore('exit').then(whatToDo => {
                        this.ifWantSave(whatToDo);
                    }))
                    .before(`preview${eventNS}`, () => this.confirmBefore('preview').then(whatToDo => {
                        this.ifWantSave(whatToDo);
                    }))
                    .before(`exit${eventNS}`, () => this.uninstall());

                return this;
            },

            /**
             * Check if we need to trigger save
             * @param {Object} whatToDo
             * @fires {save}
             */
            ifWantSave(whatToDo) {
                if (whatToDo && whatToDo.ifWantSave) {
                    testCreator.trigger('save');
                }
            },


            /**
             * Uninstalls the change tracker, unregisters listeners
             * @returns {changeTracker}
             */
            uninstall() {
                // remove all global handlers
                $(window.document)
                    .off(eventNS);
                $(window).off(eventNS);
                $(wrapperSelector).off(eventNS);
                testCreator.off(eventNS);

                return this;
            },

            /**
             * Displays a confirmation dialog,
             * The "ok" button will save and resolve.
             * The "cancel" button will reject.
             *
             * @param {String} message - the confirm message to display
             * @returns {Promise} resolves once saved
             */
            confirmBefore(message) {
                // if a key is given load the related message
                message = messages[message] || message;

                return new Promise((resolve, reject) => {
                    if (asking) {
                        return reject();
                    }

                    if (!this.hasChanged()) {
                        return resolve();
                    }

                    asking = true;
                    let confirmDlg;

                    // chosses what buttons to display depending on the message
                    if(message === messages.leaveWhenInvalid) {
                        confirmDlg = dialog({
                            message: message,
                            buttons: buttonsYesNo,
                            autoRender: true,
                            autoDestroy: true,
                            onDontsaveBtn: () => resolve({ ifWantSave: false }),
                            onCancelBtn: () => {
                                confirmDlg.hide();
                                reject({ cancel: true });
                            }
                        })
                    } else {
                        confirmDlg = dialog({
                           message: message,
                           buttons: buttonsCancelSave,
                           autoRender: true,
                           autoDestroy: true,
                           onSaveBtn: () => resolve({ ifWantSave: true }),
                           onDontsaveBtn: () => resolve({ ifWantSave: false }),
                           onCancelBtn: () => {
                               confirmDlg.hide();
                               reject({ cancel: true });
                           }
                      })
                    }
                    confirmDlg.on('closed.modal', () => asking = false);
                });
            },

            /**
             * Does the test have changed?
             * @returns {Boolean}
             */
            hasChanged() {
                const currentTest = this.getSerializedTest();
                return originalTest !== currentTest || (null === currentTest && null === originalTest);
            },

            /**
             * Get a string representation of the current test, used for comparison
             * @returns {String} the test
             */
            getSerializedTest() {
                let serialized = '';
                try {
                    // create a string from the test content
                    serialized = JSON.stringify(testCreator.getModelOverseer().getModel());

                    // sometimes the creator strip spaces between tags, so we do the same
                    serialized = serialized.replace(/ {2,}/g, ' ');
                } catch (err) {
                    serialized = null;
                }
                return serialized;
            }
        });

        return changeTracker.install();
    }

    return changeTrackerFactory;
});
