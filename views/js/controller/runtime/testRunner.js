/*
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
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *
 */

define([
    'jquery',
    'lodash',
    'spin',
    'taoQtiTest/runner/progressUpdater',
    'serviceApi/ServiceApi',
    'serviceApi/UserInfoService',
    'serviceApi/StateStorage',
    'iframeResizer',
    'iframeNotifier',
    'i18n',
    'mathJax',
    'ui/feedback',
    'moment',
    'ui/modal',
    'jquery.trunc',
    'ui/progressbar'
],
    function ($, _, Spinner, progressUpdater, ServiceApi, UserInfoService, StateStorage, iframeResizer, iframeNotifier, __, MathJax, feedback, moment) {
    'use strict';

     var timerIds = [],
        currentTimes = [],
        lastDates = [],
        timeDiffs = [],
        waitingTime = 0,
        $timers,
        $controls,
        timerIndex,
        $doc = $(document),
        TestRunner = {
            // Constants
            'TEST_STATE_INITIAL': 0,
            'TEST_STATE_INTERACTING': 1,
            'TEST_STATE_MODAL_FEEDBACK': 2,
            'TEST_STATE_SUSPENDED': 3,
            'TEST_STATE_CLOSED': 4,
            'TEST_NAVIGATION_LINEAR': 0,
            'TEST_NAVIGATION_NONLINEAR': 1,
            'TEST_ITEM_STATE_INTERACTING': 1,
            'ITEM_EXIT_CODE': {
                'COMPLETED_NORMALLY': 700,
                'QUIT': 701,
                'COMPLETE_TIMEOUT': 703,
                'TIMEOUT': 704,
                'FORCE_QUIT': 705,
                'IN_PROGRESS': 706,
                'ERROR': 300
            },
            'TEST_EXIT_CODE': {
                'COMPLETE': 'C',
                'TERMINATED': 'T',
                'INCOMPLETE': 'IC',
                'INCOMPLETE_QUIT': 'IQ',
                'INACTIVE': 'IA',
                'CANDIDATE_DISAGREED_WITH_NDA': 'DA'
            },
            beforeTransition: function (callback) {
                // Ask the top window to start the loader.
                iframeNotifier.parent('loading');

                // Disable buttons.
                this.disableGui();

                $controls.$itemFrame.hide();
                $controls.$rubricBlocks.hide();
                $controls.$timers.hide();

                // Wait at least waitingTime ms for a better user experience.
                if (typeof callback === 'function') {
                    setTimeout(callback, waitingTime);
                }
            },

            afterTransition: function () {
                this.enableGui();

                //ask the top window to stop the loader
                iframeNotifier.parent('unloading');
            },

            moveForward: function () {
                this.disableGui();
                var that = this;
                this.itemServiceApi.kill(function () {
                    that.actionCall('moveForward');
                });
            },

            moveBackward: function () {
                this.disableGui();
                var that = this;
                this.itemServiceApi.kill(function () {
                    that.actionCall('moveBackward');
                });
            },

            skip: function () {
                this.disableGui();
                this.actionCall('skip');
            },

            timeout: function (qtiClassName) {
                var that = this;
                this.disableGui();
                this.testContext.isTimeout = true;
                this.updateTimer();

                this.itemServiceApi.kill(function (signal) {
                    var confirmBox = $('.timeout-modal-feedback'),
                        confirmBtn = confirmBox.find('.js-timeout-confirm, .modal-close'),
                        metaData = {"ITEM" : {"ITEM_EXIT_CODE" : TestRunner.ITEM_EXIT_CODE.TIMEOUT}};
                        
                    confirmBox.modal({width: 500});
                    confirmBtn.off('click').on('click', function () {
                        confirmBox.modal('close');
                        that.actionCall('timeout', metaData);
                    });
                });
            },
            comment: function () {
                $controls.$commentText.val('');
                $controls.$commentArea.show();
                $controls.$commentAreaButtons.show();
            },

            closeComment: function () {
                $controls.$commentArea.hide();
            },

            emptyComment: function () {
                $controls.$commentText.val('');
            },

            storeComment: function () {
                var self = this;
                $.ajax({
                    url: self.testContext.commentUrl,
                    cache: false,
                    async: true,
                    type: 'POST',
                    data: { comment: $controls.$commentText.val('') },
                    success: function () {
                        self.closeComment();
                    }
                });
            },

            update: function (testContext) {
                var self = this;
                $controls.$itemFrame.remove();

                var $runner = $('#runner');
                $runner.css('height', 'auto');

                this.testContext = testContext;
                this.itemServiceApi = eval(testContext.itemServiceApiCall);

                this.updateContext();
                this.updateProgress();
                this.updateNavigation();
                this.updateInformation();
                this.updateRubrics();
                this.updateTools();
                this.updateTimer();

                $controls.$itemFrame = $('<iframe id="qti-item" frameborder="0"/>');
                $controls.$itemFrame.appendTo($controls.$contentBox);
                iframeResizer.autoHeight($controls.$itemFrame, 'body');

                if (this.testContext.itemSessionState === this.TEST_ITEM_STATE_INTERACTING && self.testContext.isTimeout === false) {
                    $doc.on('serviceloaded', function () {
                        self.afterTransition();
                        self.adjustFrame();
                        $controls.$itemFrame.css({visibility: 'visible'});
                    });

                    // Inject API into the frame.
                    this.itemServiceApi.loadInto($controls.$itemFrame[0], function () {
                        // We now rely on the 'serviceloaded' event.
                    });
                }
                else {
                    // e.g. no more attempts or timeout! Simply consider the transition is finished,
                    // but do not load the item.
                    self.afterTransition();
                }
            },

            updateInformation: function () {

                if (this.testContext.isTimeout === true) {
                    feedback().error(__('Time limit reached for item "%s".', this.testContext.itemIdentifier));
                }
                else if (this.testContext.itemSessionState !== this.TEST_ITEM_STATE_INTERACTING) {
                    feedback().error(__('No more attempts allowed for item "%s".', this.testContext.itemIdentifier));
                }
            },

            updateTools: function updateTools() {
                if (this.testContext.allowComment === true) {
                   $controls.$commentArea.show();
                }
                else {
                    $controls.$commentArea.hide();
                }

                if (this.testContext.allowSkipping === true) {
                    if (this.testContext.isLast === false) {
                        $controls.$skip.show();
                        $controls.$skipEnd.hide();
                    }
                    else {
                        $controls.$skip.hide();
                        $controls.$skipEnd.show();
                    }
                }
                else {
                    $controls.$skip.hide();
                    $controls.$skipEnd.hide();
                }
            },

            updateTimer: function () {
                var self = this;
                $controls.$timers.remove();

                for (var i = 0; i < timerIds.length; i++) {
                    clearTimeout(timerIds[i]);
                }

                timerIds = [];
                currentTimes = [];
                lastDates = [];
                timeDiffs = [];
                $timers = $('#qti-timers > .qti-timer');

                if (self.testContext.isTimeout === false &&
                    self.testContext.itemSessionState === self.TEST_ITEM_STATE_INTERACTING) {

                    if (this.testContext.timeConstraints.length > 0) {

                        // Insert QTI Timers container.
                        $controls.$timers = $('<div id="qti-timers"/>');
                        $controls.$timers.prependTo($controls.$timersBox);
                        // self.formatTime(cst.seconds)
                        for (i = 0; i < this.testContext.timeConstraints.length; i++) {

                            var cst = this.testContext.timeConstraints[i];

                            if (cst.allowLateSubmission === false) {
                                // Set up a timer for this constraint.
                                $('<div class="qti-timer qti-timer__type-' + cst.qtiClassName + '">'
                                    + '<span class="qti-timer_label">' + cst.source + '</span>'
                                    + '<span class="qti-timer_time">' + self.formatTime(cst.seconds) + '</span></div>')
                                    .appendTo($controls.$timers);

                                // Set up a timer and update it with setInterval.
                                currentTimes[i] = cst.seconds;
                                lastDates[i] = new Date();
                                timeDiffs[i] = 0;
                                timerIndex = i;

                                cst.warningTime = Number.NEGATIVE_INFINITY;

                                if (self.testContext.timerWarning && self.testContext.timerWarning[cst.qtiClassName]) {
                                    cst.warningTime = parseInt(self.testContext.timerWarning[cst.qtiClassName], 10);
                                }

                                // ~*~*~ ❙==[||||)0__    <----- SUPER CLOSURE !
                                (function (timerIndex, cst) {
                                    timerIds[timerIndex] = setInterval(function () {

                                        timeDiffs[timerIndex] += (new Date()).getTime() - lastDates[timerIndex].getTime();

                                        if (timeDiffs[timerIndex] >= 1000) {
                                            var seconds = timeDiffs[timerIndex] / 1000;
                                            currentTimes[timerIndex] -= seconds;
                                            timeDiffs[timerIndex] = 0;
                                        }

                                        if (currentTimes[timerIndex] <= 0) {
                                            // The timer expired...
                                            $timers.find('.qti-timer').eq(timerIndex).html(self.formatTime(Math.round(currentTimes[timerIndex])));
                                            currentTimes[timerIndex] = 0;
                                            clearInterval(timerIds[timerIndex]);

                                            // Hide item to prevent any further interaction with the candidate.
                                            $controls.$itemFrame.hide();
                                            self.timeout();
                                        }
                                        else {
                                            // Not timed-out...
                                            $controls.$timers.find('.qti-timer')
                                                .eq(timerIndex)
                                                .find('.qti-timer_time')
                                                .html(self.formatTime(Math.round(currentTimes[timerIndex])));
                                            lastDates[timerIndex] = new Date();
                                        }

                                        if (_.isFinite(cst.warningTime) && currentTimes[timerIndex] <= cst.warningTime) {
                                            self.timeWarning(cst);
                                        }

                                    }, 1000);
                                }(timerIndex, cst));
                            }
                        }

                        $controls.$timers.show();
                    }
                }
            },

            /**
             * Mark apropriate timer by warning colors and show feedback message
             * @param {object} cst - Time constraint
             * @param {integer} cst.warningTime - Warning time in seconds.
             * @param {integer} cst.qtiClassName - Class name of qti instance for which the timer is set (assessmentItemRef | assessmentSection | testPart).
             * @param {integer} cst.seconds - Initial timer value.
             * @returns {undefined}
             */
            timeWarning: function (cst) {
                var message = '';
                $('#qti-timers > .qti-timer__type-' + cst.qtiClassName).addClass('qti-timer__warning');

                // Initial time more than warning time in config
                if (cst.seconds > cst.warningTime) {
                    message = moment.duration(cst.warningTime, "seconds").humanize();

                    feedback().warning(__("Warning – You have %s remaining to complete the test.", message));
                }

                cst.warningTime = Number.NEGATIVE_INFINITY;
            },
            updateRubrics: function () {
                $controls.$rubricBlocks.remove();

                if (this.testContext.rubrics.length > 0) {

                    $controls.$rubricBlocks = $('<div id="qti-rubrics"/>');

                    for (var i = 0; i < this.testContext.rubrics.length; i++) {
                        $controls.$rubricBlocks.append(this.testContext.rubrics[i]);
                    }

                    // modify the <a> tags in order to be sure it
                    // opens in another window.
                    $controls.$rubricBlocks.find('a').bind('click keypress', function () {
                        window.open(this.href);
                        return false;
                    });

                    $controls.$rubricBlocks.prependTo($controls.$contentBox);

                    if (MathJax) {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub], $controls.$rubricBlocks[0]);
                    }

                }
            },

            updateNavigation: function () {
                if (this.testContext.navigationMode === this.TEST_NAVIGATION_LINEAR) {
                    // LINEAR
                    $controls.$moveBackward.hide();
                    $controls.$moveForward.css('display', (this.testContext.isLast === true) ? 'none' : 'inline');
                    $controls.$moveEnd.css('display', (this.testContext.isLast === true) ? 'inline' : 'none');
                }
                else {
                    // NONLINEAR
                    $controls.$controls.show();
                    $controls.$moveForward.css('display', (this.testContext.isLast === true) ? 'none' : 'inline');
                    $controls.$moveEnd.css('display', (this.testContext.isLast === true) ? 'inline' : 'none');
                    $controls.$moveBackward.css('display', (this.testContext.canMoveBackward === true) ?
                        'inline' : 'none');
                }
            },

            updateProgress: function () {

                var considerProgress = this.testContext.considerProgress;

                $controls.$progressBox.css('visibility', (considerProgress === true) ? 'visible' : 'hidden');

                if (considerProgress === true) {
                    this.progressUpdater.update(this.testContext);
                }
            },

            updateContext: function () {

                $controls.$title.text(this.testContext.testTitle);
                $controls.$position.text(' - ' + this.testContext.sectionTitle);
                $controls.$titleGroup.show();
            },

            adjustFrame: function () {
                var $actionBars = $('.horizontal-action-bar:visible'),
                    actionBarHeight = $actionBars.outerHeight() * $actionBars.length;
                $controls.$contentBox.height($(window).innerHeight() - actionBarHeight);
            },

            disableGui: function () {
                $controls.$naviButtons.addClass('disabled');
            },

            enableGui: function () {
                $controls.$naviButtons.removeClass('disabled');
            },

            formatTime: function (totalSeconds) {
                var sec_num = totalSeconds;
                var hours = Math.floor(sec_num / 3600);
                var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                var seconds = sec_num - (hours * 3600) - (minutes * 60);

                if (hours < 10) {
                    hours = "0" + hours;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }

                var time = hours + ':' + minutes + ':' + seconds;

                return time;
            },
            /**
             * Call action specified in testContext. A postfix <i>Url</i> will be added to the action name.
             * To specify actions see {@link https://github.com/oat-sa/extension-tao-testqti/blob/master/helpers/class.TestRunnerUtils.php}
             * @param {Sting} action - Action name 
             * @param {Object} metaData - Metadata to be sent to the server. Will be saved in result storage as a trace variable.
             * Example: 
             * <pre>
             * {
             *   "TEST" : {
             *      "TEST_EXIT_CODE" : "T"
             *   },
             *   "ITEM" : {
             *      "ITEM_EXIT_CODE" : 704
             *   }
             * }
             * </pre>
             * @returns {undefined}
             */
            actionCall: function (action, metaData) {
                var self = this;
                metaData = metaData ? {"metaData" : metaData} : {};
                this.beforeTransition(function () {
                    $.ajax({
                        url: self.testContext[action + 'Url'],
                        cache: false,
                        data: metaData,
                        async: true,
                        dataType: 'json',
                        success: function (testContext) {
                            if (testContext.state === self.TEST_STATE_CLOSED) {
                                self.serviceApi.finish();
                            }
                            else {
                                self.update(testContext);
                            }
                        }
                    });
                });
            },
            /**
             * Exit from test (after confirmation). All answered questions will be submitted.
             * 
             * @returns {undefined}
             */
            exit: function () {
                var self = this,
                    $confirmBox = $('.exit-modal-feedback'),
                    message = __(
                        "You have %s unaswered question(s) and have %s item(s) marked for review. Are you sure you want to end the test?", 
                        (self.testContext.numberItems - self.testContext.numberCompleted).toString(),
                        self.testContext.numberCompleted.toString()
                    ),
                    metaData = {"TEST" : {"TEST_EXIT_CODE" : TestRunner.TEST_EXIT_CODE.INCOMPLETE}};
            
                $confirmBox.find('.message').html(message);
                $confirmBox.modal({ width: 500 });
            
                $confirmBox.find('.js-exit-cancel, .modal-close').off('click').on('click', function () {
                    $confirmBox.modal('close');
                });

                $confirmBox.find('.js-exit-confirm').off('click').on('click', function () {
                    $confirmBox.modal('close');
                    self.itemServiceApi.kill(function () {
                        self.actionCall('endTestSession', metaData);
                    });
                });
            }
        };

        return {
            start: function (testContext) {

                $controls = {
                    $moveForward: $('[data-control="move-forward"]'),
                    $moveEnd: $('[data-control="move-end"]'),
                    $moveBackward: $('[data-control="move-backward"]'),
                    $skip: $('[data-control="skip"]'),
                    $skipEnd: $('[data-control="skip-end"]'),
                    $naviButtons: $('.bottom-action-bar .navi-box a'),
                    $commentToggle: $('[data-control="comment-toggle"]'),
                    $commentArea: $('[data-control="comment-area"]'),
                    $commentText: $('[data-control="comment-text"]'),
                    $commentCancel: $('[data-control="comment-cancel"]'),
                    $commentSend: $('[data-control="comment-send"]'),
                    $progressBar: $('[data-control="progress-bar"]'),
                    $progressLabel: $('[data-control="progress-label"]'),
                    $progressBox: $('.progress-box'),
                    $title:  $('[data-control="qti-test-title"]'),
                    $position:  $('[data-control="qti-test-position"]'),
                    $timer:  $('[data-control="qti-test-time"]'),
                    $controls: $('.qti-controls'),
                    $itemFrame: $('#qti-item'),
                    $rubricBlocks: $('#qti-rubrics'),
                    $timersBox: $('[data-control="qti-test-time"]'),
                    $timers: $('#qti-timers'),
                    $contentBox: $('#qti-content'),
                    $exit:  $('[data-control="exit"]')
                };

                $controls.$commentAreaButtons = $controls.$commentCancel.add($controls.$commentSend);
                $controls.$skipButtons = $controls.$skip.add($controls.$skipEnd);
                $controls.$moveForwardEnd = $controls.$moveForward.add($controls.$moveEnd);
                $controls.$titleGroup = $controls.$title.add($controls.$position);

                $doc.ajaxError(function (event, jqxhr) {
                    if (jqxhr.status === 403) {
                        iframeNotifier.parent('serviceforbidden');
                    }
                });

                window.onServiceApiReady = function onServiceApiReady(serviceApi) {
                    TestRunner.serviceApi = serviceApi;

                    // If the assessment test session is in CLOSED state,
                    // we give the control to the delivery engine by calling finish.
                    if (testContext.state === TestRunner.TEST_STATE_CLOSED) {
                        serviceApi.finish();
                    }
                    else {
                        TestRunner.update(testContext);
                    }
                };

                TestRunner.beforeTransition();
                TestRunner.testContext = testContext;

                $controls.$skipButtons.click(function () {
                    if (!$(this).hasClass('disabled')) {
                        TestRunner.skip();
                    }
                });

                $controls.$moveForwardEnd.click(function () {
                    if (!$(this).hasClass('disabled')) {
                        TestRunner.moveForward();
                    }
                });

                $controls.$moveBackward.click(function () {
                    if (!$(this).hasClass('disabled')) {
                        TestRunner.moveBackward();
                    }
                });

                $controls.$commentToggle.click(function () {
                    if (!$(this).hasClass('disabled')) {
                        TestRunner.comment();
                    }
                });

                $controls.$commentCancel.click(function () {
                    TestRunner.closeComment();
                });

                $controls.$commentSend.click(function () {
                    TestRunner.storeComment();
                });

                $controls.$commentText.click(function () {
                    TestRunner.emptyComment();
                });
                
                $controls.$exit.click(function (e) {
                    e.preventDefault();
                    TestRunner.exit();
                });
                
                $(window).bind('resize', function () {
                    TestRunner.adjustFrame();
                    $controls.$titleGroup.show();
                });

                $doc.bind('loading', function () {
                    iframeNotifier.parent('loading');
                });


                $doc.bind('unloading', function () {
                    iframeNotifier.parent('unloading');
                });

                TestRunner.progressUpdater = progressUpdater($controls.$progressBar, $controls.$progressLabel);

                iframeNotifier.parent('serviceready');


                TestRunner.adjustFrame();
            }
        };
    });
