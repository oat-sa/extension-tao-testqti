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
    'serviceApi/ServiceApi',
    'serviceApi/UserInfoService',
    'serviceApi/StateStorage',
    'iframeResizer',
    'iframeNotifier',
    'i18n',
    'mathJax',
    'jquery.trunc',
    'ui/progressbar'
],
    function ($, _, Spinner, ServiceApi, UserInfoService, StateStorage, iframeResizer, iframeNotifier, __, MathJax) {

        'use strict';

        var timerIds = [];
        var currentTimes = [];
        var lastDates = [];
        var timeDiffs = [];
        var waitingTime = 0;
        
        var $controls;
        
        var $doc = $(document);

        var TestRunner = {
            // Constants
            'TEST_STATE_INITIAL': 0,
            'TEST_STATE_INTERACTING': 1,
            'TEST_STATE_MODAL_FEEDBACK': 2,
            'TEST_STATE_SUSPENDED': 3,
            'TEST_STATE_CLOSED': 4,
            'TEST_NAVIGATION_LINEAR': 0,
            'TEST_NAVIGATION_NONLINEAR': 1,
            'TEST_ITEM_STATE_INTERACTING': 1,

            beforeTransition: function (callback) {
                // Ask the top window to start the loader.
                iframeNotifier.parent('loading');

                // Disable buttons.
                this.disableGui();

                $('#qti-item, #qti-info, #qti-rubrics, #qti-timers').hide();

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

            timeout: function () {
                this.disableGui();
                this.testContext.isTimeout = true;
                this.updateTimer();
                this.actionCall('timeout');
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
                $('#qti-item').remove();

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

                var $itemFrame = $('<iframe id="qti-item" frameborder="0"/>');
                $itemFrame.appendTo('#qti-content');
                iframeResizer.autoHeight($itemFrame, 'body');

                if (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false == true) {
                    $('#qti-content').css('overflow-y', 'scroll');
                }

                if (this.testContext.itemSessionState === this.TEST_ITEM_STATE_INTERACTING && self.testContext.isTimeout === false) {
                    $doc.on('serviceloaded', function () {
                        self.afterTransition();
                        self.adjustFrame();
                        $itemFrame.css({visibility: 'visible'});
                    });

                    // Inject API into the frame.
                    this.itemServiceApi.loadInto($itemFrame[0], function () {
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
                $('#qti-info').remove();

                if (this.testContext.isTimeout === true) {
                    $('<div id="qti-info" class="info"></div>').prependTo('#qti-content');
                    $('#qti-info').html(__('Maximum time limit reached for item "%s".').replace('%s', this.testContext.itemIdentifier));
                }
                else if (this.testContext.itemSessionState !== this.TEST_ITEM_STATE_INTERACTING) {
                    $('<div id="qti-info" class="info"></div>').prependTo('#qti-content');
                    $('#qti-info').html(__('No more attempts allowed for item "%s".').replace('%s', this.testContext.itemIdentifier));
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
                $('#qti-timers').remove();

                for (var i = 0; i < timerIds.length; i++) {
                    clearTimeout(timerIds[i]);
                }

                timerIds = [];
                currentTimes = [];
                lastDates = [];
                timeDiffs = [];

                if (self.testContext.isTimeout === false && 
                    self.testContext.itemSessionState === self.TEST_ITEM_STATE_INTERACTING) {

                    if (this.testContext.timeConstraints.length > 0) {

                        // Insert QTI Timers container.
                        $('<div id="qti-timers"></div>').prependTo('#qti-content');
                        // self.formatTime(cst.seconds)
                        for (i = 0; i < this.testContext.timeConstraints.length; i++) {

                            var cst = this.testContext.timeConstraints[i];

                            if (cst.allowLateSubmission === false) {
                                // Set up a timer for this constraint.
                                $('<div class="qti-timer"><span class="icon-time"></span> ' + cst.source + ' - ' + self.formatTime(cst.seconds) + '</div>').appendTo('#qti-timers');

                                // Set up a timer and update it with setInterval.
                                currentTimes[i] = cst.seconds;
                                lastDates[i] = new Date();
                                timeDiffs[i] = 0;
                                var timerIndex = i;
                                var source = cst.source;

                                // ~*~*~ ❙==[||||)0__    <----- SUPER CLOSURE !
                                (function (timerIndex, source) {
                                    timerIds[timerIndex] = setInterval(function () {

                                        timeDiffs[timerIndex] += (new Date()).getTime() - lastDates[timerIndex].getTime();

                                        if (timeDiffs[timerIndex] >= 1000) {
                                            var seconds = timeDiffs[timerIndex] / 1000;
                                            currentTimes[timerIndex] -= seconds;
                                            timeDiffs[timerIndex] = 0;
                                        }

                                        if (currentTimes[timerIndex] <= 0) {
                                            // The timer expired...
                                            $('#qti-timers > .qti-timer').eq(timerIndex).html(self.formatTime(Math.round(currentTimes[timerIndex])));
                                            currentTimes[timerIndex] = 0;
                                            clearInterval(timerIds[timerIndex]);

                                            // Hide item to prevent any further interaction with the candidate.
                                            $('#qti-item').hide();
                                            self.timeout();
                                        }
                                        else {
                                            // Not timed-out...
                                            $('#qti-timers > .qti-timer').eq(timerIndex).html('<span class="icon-time"></span> ' + source + ' - ' + self.formatTime(Math.round(currentTimes[timerIndex])));
                                            lastDates[timerIndex] = new Date();
                                        }

                                    }, 1000);
                                }(timerIndex, source));
                            }
                        }

                        $('#qti-timers').show();
                    }
                }
            },

            updateRubrics: function () {
                $('#qti-rubrics').remove();

                if (this.testContext.rubrics.length > 0) {

                    var $rubrics = $('<div id="qti-rubrics"></div>');

                    for (var i = 0; i < this.testContext.rubrics.length; i++) {
                        $rubrics.append(this.testContext.rubrics[i]);
                    }

                    // modify the <a> tags in order to be sure it
                    // opens in another window.
                    $rubrics.find('a').bind('click keypress', function () {
                        window.open(this.href);
                        return false;
                    });

                    $rubrics.prependTo('#qti-content');

                    if (MathJax) {
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub], $('#qti-rubrics')[0]);
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
                    $('#qti-actions').show();
                    $controls.$moveForward.css('display', (this.testContext.isLast === true) ? 'none' : 'inline');
                    $controls.$moveEnd.css('display', (this.testContext.isLast === true) ? 'inline' : 'none');
                    $controls.$moveBackward.css('display', (this.testContext.canMoveBackward === true) ?
                        'inline' : 'none');
                }
            },

            updateProgress: function () {

                var considerProgress = this.testContext.considerProgress;

                $('#qti-test-progress').css('visibility', (considerProgress === true) ? 'visible' : 'hidden');

                if (considerProgress === true) {
                    var ratio = Math.floor(this.testContext.numberCompleted / this.testContext.numberItems * 100);
                    var label = __('Test completed at %d%%').replace('%d', ratio).replace('%%', '%');
                    $controls.$progressLabel.text(label);
                    $controls.$progressBar.progressbar('value', ratio);
                }
            },

            updateContext: function () {

                var testTitle = this.testContext.testTitle;
                var testPartId = this.testContext.testPartId;
                var sectionTitle = this.testContext.sectionTitle;

                $('#qti-test-title').text(testTitle);

                try {
                    $('#qti-test-title, #qti-test-position').badonkatrunc('destroy');
                }
                catch (e) {
                    // Very first call, the badonkatrunc wrapper was not there.
                    // Continue normally.
                }

                $('#qti-test-position').empty().append('<span id="qti-section-title">' + sectionTitle + '</span>');
                $('#qti-test-title, #qti-test-position').badonkatrunc().css('visibility', 'visible');
            },

            adjustFrame: function () {

                var actionsHeight = $('#qti-actions').outerHeight();
                var windowHeight = window.innerHeight ? window.innerHeight : $(window).height();
                var navigationHeight = $('#qti-navigation').outerHeight();
                var newContentHeight = windowHeight - actionsHeight - navigationHeight;

                var $content = $('#qti-content');
                $content.height(newContentHeight - parseInt($content.css('paddingTop')) - parseInt($content.css('paddingBottom')));
            },

            disableGui: function () {
                $('#qti-navigation button').addClass('disabled');
            },

            enableGui: function () {
                $('#qti-navigation button').removeClass('disabled');
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

                return "\u00b1 " + time;
            },

            actionCall: function (action) {
                var self = this;
                this.beforeTransition(function () {
                    $.ajax({
                        url: self.testContext[action + 'Url'],
                        cache: false,
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
                    $commentToggle: $('[data-control="comment-toggle"]'),
                    $commentArea: $('[data-control="comment-area"]'),
                    $commentText: $('[data-control="comment-text"]'),
                    $commentCancel: $('[data-control="comment-cancel"]'),
                    $commentSend: $('[data-control="comment-send"]'),
                    $progressBar: $('[data-control="progress-bar"]'),
                    $progressLabel: $('[data-control="progress-label"]')
                };

                $controls.$commentAreaButtons = $controls.$commentCancel.add($controls.$commentSend);
                $controls.$skipButtons = $controls.$skip.add($controls.$skipEnd);
                $controls.$moveForwardEnd = $controls.$moveForward.add($controls.$moveEnd);

                $doc.ajaxError(function (event, jqxhr) {
                    if (jqxhr.status === 403) {
                        iframeNotifier.parent('serviceforbidden');
                    }
                });

                window.onServiceApiReady = function onServiceApiReady(serviceApi) {
                    TestRunner.serviceApi = serviceApi;

                    // If the assessment test session is in CLOSED state,
                    // we give the control to the delivery engine by calling
                    // finish.
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

                $(window).bind('resize', function () {
                    TestRunner.adjustFrame();
                    $('#qti-test-title, #qti-test-position').badonkatrunc();
                });

                $doc.bind('loading', function () {
                    iframeNotifier.parent('loading');
                });


                $doc.bind('unloading', function () {
                    iframeNotifier.parent('unloading');
                });

                $controls.$progressBar.progressbar();

                iframeNotifier.parent('serviceready');
            }
        };
    });
