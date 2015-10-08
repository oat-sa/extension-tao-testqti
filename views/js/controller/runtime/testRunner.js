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
    'module',
    'taoQtiTest/testRunner/actionBarTools',
    'taoQtiTest/testRunner/testReview',
    'taoQtiTest/testRunner/progressUpdater',
    'taoQtiTest/testRunner/testMetaData',
    'serviceApi/ServiceApi',
    'serviceApi/UserInfoService',
    'serviceApi/StateStorage',
    'iframeNotifier',
    'i18n',
    'mathJax',
    'ui/feedback',
    'ui/deleter',
    'moment',
    'ui/modal',
    'ui/progressbar'
],
    function ($, _, module, actionBarTools, testReview, progressUpdater, testMetaDataFactory, ServiceApi, UserInfoService, StateStorage, iframeNotifier, __, MathJax, feedback, deleter, moment, modal) {

        'use strict';

    var timerIds = [],
        currentTimes = [],
        lastDates = [],
        timeDiffs = [],
        waitingTime = 0,
        $timers,
        $controls,
        timerIndex,
        testMetaData,
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
            beforeTransition: function (callback) {
                // Ask the top window to start the loader.
                iframeNotifier.parent('loading');

                // Disable buttons.
                this.disableGui();

                $controls.$itemFrame.hide();
                $controls.$rubricBlocks.hide();
                $controls.$timerWrapper.hide();

                // Wait at least waitingTime ms for a better user experience.
                if (typeof callback === 'function') {
                    setTimeout(callback, waitingTime);
                }
            },

            afterTransition: function () {
                this.enableGui();
                //ask the top window to stop the loader
                iframeNotifier.parent('unloading');
                testMetaData.addData({
                    'ITEM' : {'ITEM_START_TIME_CLIENT' : Date.now() / 1000}
                });
            },

            /**
             * Jumps to a particular item in the test
             * @param {Number} position The position of the item within the test
             */
            jump: function(position) {
                var self = this,
                    action = 'jump',
                    params = {position: position};
                this.disableGui();

                if( this.isJumpOutOfSection(position)  && this.isCurrentItemActive() && this.isTimedSection() ){
                    this.exitTimedSection(action, params);
                } else {
                    this.killItemSession(function() {
                        self.actionCall(action, params);
                    });
                }
            },

            /**
             * Marks an item for later review
             * @param {Boolean} flag The state of the flag
             * @param {Number} position The position of the item within the test
             */
            markForReview: function(flag, position) {
                var self = this;

                // Ask the top window to start the loader.
                iframeNotifier.parent('loading');

                // Disable buttons.
                this.disableGui();

                $.ajax({
                    url: self.testContext.markForReviewUrl,
                    cache: false,
                    async: true,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        flag: flag,
                        position: position
                    },
                    success: function(data) {
                        // update the item flagged state
                        if (self.testReview) {
                            self.testReview.setItemFlag(position, flag);
                            self.testReview.updateNumberFlagged(self.testContext, position, flag);
                            if (self.testContext.itemPosition === position) {
                                self.testContext.itemFlagged = flag;
                            }
                            self.updateTools(self.testContext);
                        }

                        // Enable buttons.
                        self.enableGui();

                        //ask the top window to stop the loader
                        iframeNotifier.parent('unloading');
                    }
                });
            },

            moveForward: function () {
                var self = this,
                    action = 'moveForward';

                this.disableGui();

                if( (( this.testContext.numberItemsSection - this.testContext.itemPositionSection - 1) == 0) && this.isCurrentItemActive()){
                    if( this.isTimedSection() && !this.testContext.isTimeout){
                        this.exitTimedSection(action);
                    } else {
                        this.exitSection(action);
                    }
                } else {
                    this.killItemSession(function () {
                        self.actionCall(action);
                    });
                }
            },

            moveBackward: function () {
                var self = this,
                    action = 'moveBackward';

                this.disableGui();

                if( (this.testContext.itemPositionSection == 0) && this.isCurrentItemActive() && this.isTimedSection() ){
                    this.exitTimedSection(action);
                } else {
                this.killItemSession(function () {
                        self.actionCall(action);
                    });
                }
            },

            isJumpOutOfSection: function(jumpPosition){
                var items = this.getCurrentSectionItems(),
                    isJumpToOtherSection = true,
                    isValidPosition = (jumpPosition >= 0) && ( jumpPosition < this.testContext.numberItems );

                if( isValidPosition){
                    for(var i in items ) {
                        if (!items.hasOwnProperty(i)) {
                            continue;
                        }
                        if( items[i].position == jumpPosition ){
                            isJumpToOtherSection = false;
                            break;
                        }
                    }
                } else {
                    isJumpToOtherSection = false;
                }

                return isJumpToOtherSection;
            },

            exitSection: function(action, params){
                var self = this;

                testMetaData.addData({"SECTION" : {"SECTION_EXIT_CODE" : testMetaData.SECTION_EXIT_CODE.COMPLETED_NORMALLY}});
                self.killItemSession(function () {
                    self.actionCall(action, params);
                });
            },

            exitTimedSection: function(action, params){
                var self = this,
                    $confirmBox = $('.exit-modal-feedback'),
                    message,
                    messageFlagged = '',
                    unansweredCount=(this.testContext.numberItemsSection - this.testContext.numberCompletedSection),
                    flaggedCount=this.testContext.numberFlaggedSection,
                    qtiRunner = this.getQtiRunner();

                if( this.isCurrentItemAnswered() ){
                    unansweredCount--;
                }

                if (qtiRunner) {
                    qtiRunner.updateItemApi();
                }

                if( flaggedCount !== undefined ){
                    messageFlagged = " and have %s item(s) marked for review";
                }

                message = __(
                    "You have %s unanswered question(s)" + messageFlagged + ". " +
                    "After you complete the section it would be impossible to return to this section to make changes.  " +
                    "Are you sure you want to end the section?",
                    (unansweredCount || 0).toString(),
                    (flaggedCount || 0).toString()
                );

                $confirmBox.find('.message').html(message);
                $confirmBox.modal({ width: 500 });
                this.enableGui();

                $confirmBox.find('.js-exit-cancel, .modal-close').off('click').on('click', function () {
                    $confirmBox.modal('close');
                });

                $confirmBox.find('.js-exit-confirm').off('click').on('click', function () {
                    $confirmBox.modal('close');
                    self.exitSection(action, params);
                });
            },
            /**
             * Kill current item section and execute callback function given as first parameter.
             * Item end execution time will be stored in metadata object to be sent to the server.
             * @param {function} callback
             */
            killItemSession : function (callback) {
                testMetaData.addData({
                    'ITEM' : {'ITEM_END_TIME_CLIENT' : Date.now() / 1000}
                });
                if (typeof callback !== 'function') {
                    callback = _.noop;
                }
                this.itemServiceApi.kill(callback);
            },
            isCurrentItemActive: function(){
                return (this.testContext.itemSessionState != 4);
            },

            /**
             * Tells is the current item has been answered or not
             * The item is considered answered when at least one response has been set to not empty {base : null}
             *
             * @returns {Boolean}
             */
            isCurrentItemAnswered: function(){
                var answered = false;
                _.each(this.getCurrentItemState(), function(state){
                    if(state && _.isObject(state.response) && state.response.base !== null){
                        answered = true;//at least one response is not null so consider the item answered
                        return false;
                    }
                });
                return answered;
            },

            getQtiRunner: function(){
                var itemFrame = document.getElementById('qti-item');
                var itemWindow = itemFrame && itemFrame.contentWindow;
                var itemContainerFrame = itemWindow && itemWindow.document.getElementById('item-container');
                var itemContainerWindow = itemContainerFrame && itemContainerFrame.contentWindow;
                return itemContainerWindow && itemContainerWindow.qtiRunner;
            },

            isTimedSection: function(){
                var timeConstraints = this.testContext.timeConstraints,
                    isTimedSection = false;
                for( var index in timeConstraints ){
                    if(    timeConstraints.hasOwnProperty(index)
                        && timeConstraints[index].qtiClassName == 'assessmentSection' ){
                        isTimedSection = true;
                    }
                }

                return isTimedSection;
            },

            getCurrentSectionItems: function(){
                var partId  = this.testContext.testPartId,
                    navMap  = this.testContext.navigatorMap,
                    sectionItems;

                for( var partIndex in navMap ){
                    if( !navMap.hasOwnProperty(partIndex)){
                        continue;
                    }
                    if( navMap[partIndex].id !== partId ){
                        continue;
                    }

                    for(var sectionIndex in navMap[partIndex].sections){
                        if( !navMap[partIndex].sections.hasOwnProperty(sectionIndex)){
                            continue;
                        }
                        if( navMap[partIndex].sections[sectionIndex].active === true ){
                            sectionItems = navMap[partIndex].sections[sectionIndex].items;
                            break;
                        }
                    }
                }

                return sectionItems;
            },

            skip: function () {
                this.disableGui();
                this.actionCall('skip');
            },

            timeout: function () {
                var self = this;
                this.disableGui();
                this.testContext.isTimeout = true;
                this.updateTimer();

                this.killItemSession(function () {
                    var confirmBox = $('.timeout-modal-feedback'),
                        testContext = self.testContext,
                        confirmBtn = confirmBox.find('.js-timeout-confirm, .modal-close');

                    if (testContext.numberCompletedSection === testContext.numberItemsSection) {
                        testMetaData.addData({"SECTION" : {"SECTION_EXIT_CODE" : testMetaData.SECTION_EXIT_CODE.COMPLETE_TIMEOUT}});
                    } else {
                        testMetaData.addData({"SECTION" : {"SECTION_EXIT_CODE" : testMetaData.SECTION_EXIT_CODE.TIMEOUT}});
                    }

                    self.enableGui();
                    confirmBox.modal({width: 500});
                    confirmBtn.off('click').on('click', function () {
                        confirmBox.modal('close');
                        self.actionCall('timeout');
                    });
                });
            },
            comment: function () {
                if(!$controls.$commentArea.is(':visible')) {
                    $controls.$commentText.val('');
                }
                $controls.$commentArea.toggle();
                $controls.$commentText.focus();
            },

            closeComment: function () {
                $controls.$commentArea.hide();
            },

            emptyComment: function () {
                $controls.$commentText.val('');
            },

            storeComment: function () {
                var self = this;
                var comment = $controls.$commentText.val();
                if(!comment) {
                    return;
                }
                $.when(
                    $.post(
                        self.testContext.commentUrl,
                        { comment: comment }
                    )
                ).done(function() {
                    self.closeComment();
                });
            },

            /**
             * Sets the assessment test context object
             * @param {Object} testContext
             */
            setTestContext: function(testContext) {
                this.testContext = testContext;
                this.itemServiceApi = eval(testContext.itemServiceApiCall);
            },

            update: function (testContext) {
                var self = this;
                $controls.$itemFrame.remove();

                var $runner = $('#runner');
                $runner.css('height', 'auto');

                this.setTestContext(testContext);
                this.updateContext();
                this.updateProgress();
                this.updateNavigation();
                this.updateTestReview();
                this.updateInformation();
                this.updateRubrics();
                this.updateTools(testContext);
                this.updateTimer();
                this.updateExitButton();
                this.resetCurrentItemState();

                $controls.$itemFrame = $('<iframe id="qti-item" frameborder="0" scrollbars="no"/>');
                $controls.$itemFrame.appendTo($controls.$contentBox);

                testMetaData = testMetaDataFactory({
                    testServiceCallId : this.itemServiceApi.serviceCallId
                });
                
                if (this.testContext.itemSessionState === this.TEST_ITEM_STATE_INTERACTING && self.testContext.isTimeout === false) {
                    $doc.off('.testRunner').on('serviceloaded.testRunner', function () {
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

                if (testMetaData) {
                    testMetaData.clearData();
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

            updateTools: function updateTools(testContext) {
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

                actionBarTools.render('.tools-box-list', testContext, TestRunner);
            },

            createTimer: function(cst) {
                var $timer = $('<div>', {'class': 'qti-timer qti-timer__type-' + cst.qtiClassName }),
                    $label = $('<div>', {'class': 'qti-timer_label truncate', text: cst.label }),
                    $time  = $('<div>', {'class': 'qti-timer_time', text: this.formatTime(cst.seconds) });

                $timer.append($label);
                $timer.append($time);
                return $timer;
            },

            updateTimer: function () {
                var self = this;
                var hasTimers;
                $controls.$timerWrapper.empty();

                for (var i = 0; i < timerIds.length; i++) {
                    clearTimeout(timerIds[i]);
                }

                timerIds = [];
                currentTimes = [];
                lastDates = [];
                timeDiffs = [];

                if (self.testContext.isTimeout === false &&
                    self.testContext.itemSessionState === self.TEST_ITEM_STATE_INTERACTING) {

                    hasTimers = !!this.testContext.timeConstraints.length;
                    $controls.$topActionBar.toggleClass('has-timers', hasTimers);

                    if (hasTimers) {

                        // Insert QTI Timers container.
                        // self.formatTime(cst.seconds)
                        for (i = 0; i < this.testContext.timeConstraints.length; i++) {

                            var cst = this.testContext.timeConstraints[i];

                            if (cst.allowLateSubmission === false) {

                                // Set up a timer for this constraint
                                $controls.$timerWrapper.append(self.createTimer(cst));

                                // Set up a timer and update it with setInterval.
                                currentTimes[i] = cst.seconds;
                                lastDates[i] = new Date();
                                timeDiffs[i] = 0;
                                timerIndex = i;

                                cst.warningTime = Number.NEGATIVE_INFINITY;

                                if (self.testContext.timerWarning && self.testContext.timerWarning[cst.qtiClassName]) {
                                    cst.warningTime = parseInt(self.testContext.timerWarning[cst.qtiClassName], 10);
                                }
                                (function (timerIndex, cst) {
                                    timerIds[timerIndex] = setInterval(function () {

                                        timeDiffs[timerIndex] += (new Date()).getTime() - lastDates[timerIndex].getTime();

                                        if (timeDiffs[timerIndex] >= 1000) {
                                            var seconds = timeDiffs[timerIndex] / 1000;
                                            currentTimes[timerIndex] -= seconds;
                                            timeDiffs[timerIndex] = 0;
                                        }

                                        $timers.eq(timerIndex)
                                            .html(self.formatTime(Math.round(currentTimes[timerIndex])));

                                        if (currentTimes[timerIndex] <= 0) {
                                            // The timer expired...
                                            currentTimes[timerIndex] = 0;
                                            clearInterval(timerIds[timerIndex]);

                                            // Hide item to prevent any further interaction with the candidate.
                                            $controls.$itemFrame.hide();
                                            self.timeout();
                                        } else {
                                            lastDates[timerIndex] = new Date();
                                        }

                                        if (_.isFinite(cst.warningTime) && currentTimes[timerIndex] <= cst.warningTime) {
                                            self.timeWarning(cst);
                                        }

                                    }, 1000);
                                }(timerIndex, cst));
                            }
                        }

                        $timers = $controls.$timerWrapper.find('.qti-timer .qti-timer_time');
                        $controls.$timerWrapper.show();
                    }
                }
            },

            /**
             * Mark appropriate timer by warning colors and show feedback message
             *
             * @param {object} cst - Time constraint
             * @param {integer} cst.warningTime - Warning time in seconds.
             * @param {integer} cst.qtiClassName - Class name of qti instance for which the timer is set (assessmentItemRef | assessmentSection | testPart).
             * @param {integer} cst.seconds - Initial timer value.
             * @returns {undefined}
             */
            timeWarning: function (cst) {
                var message = '';
                $controls.$timerWrapper.find('.qti-timer__type-' + cst.qtiClassName).addClass('qti-timer__warning');

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
                $controls.$exit.show();

                if(this.testContext.isLast === true) {
                    $controls.$moveForward.hide();
                    $controls.$moveEnd.show();
                }
                else {
                    $controls.$moveForward.show();
                    $controls.$moveEnd.hide();
                }
                if (this.testContext.navigationMode === this.TEST_NAVIGATION_LINEAR) {
                    // LINEAR
                    $controls.$moveBackward.hide();
                }
                else {
                    // NONLINEAR
                    $controls.$controls.show();
                    if(this.testContext.canMoveBackward === true) {
                        $controls.$moveBackward.show();
                    }
                    else {
                        $controls.$moveBackward.hide();
                    }
                }
            },

            /**
             * Updates the test taker review screen
             */
            updateTestReview: function() {
                var considerProgress = this.testContext.considerProgress === true;

                if (this.testReview) {
                    this.testReview.toggle(considerProgress && _.indexOf(this.testContext.categories, 'x-tao-option-reviewScreen') >= 0);
                    this.testReview.update(this.testContext);
                }
            },

            /**
             * Updates the progress bar
             */
            updateProgress: function () {
                var considerProgress = this.testContext.considerProgress === true;

                $controls.$progressBox.css('visibility', considerProgress ? 'visible' : 'hidden');

                if (considerProgress) {
                    this.progressUpdater.update(this.testContext);
                }
            },

            updateContext: function () {

                $controls.$title.text(this.testContext.testTitle);
                $controls.$position.text(' - ' + this.testContext.sectionTitle);
                $controls.$titleGroup.show();
            },

            updateExitButton : function(){

                $controls.$logout.toggleClass('hidden', !this.testContext.logoutButton);
                $controls.$exit.toggleClass('hidden', !this.testContext.exitButton);
            },

            adjustFrame: function () {
                var rubricHeight = $controls.$rubricBlocks.outerHeight(true) || 0;
                var frameContentHeight;
                var finalHeight = $(window).innerHeight() - $controls.$topActionBar.outerHeight() - $controls.$bottomActionBar.outerHeight();
                $controls.$contentBox.height(finalHeight);
                if($controls.$sideBars.length){
                    $controls.$sideBars.each(function() {
                        var $sideBar = $(this);
                        $sideBar.height(finalHeight - $sideBar.outerHeight() + $sideBar.height());
                    });
                }

                if($controls.$itemFrame.length && $controls.$itemFrame[0] && $controls.$itemFrame[0].contentWindow){
                    frameContentHeight = $controls.$itemFrame.contents().outerHeight(true);

                    if (frameContentHeight < finalHeight) {
                        if (rubricHeight) {
                            frameContentHeight = Math.max(frameContentHeight, finalHeight - rubricHeight);
                        } else {
                            frameContentHeight = finalHeight;
                        }
                    }
                    $controls.$itemFrame[0].contentWindow.$('body').trigger('setheight', [frameContentHeight]);
                    $controls.$itemFrame.height(frameContentHeight);
                }
            },

            disableGui: function () {
                $controls.$naviButtons.addClass('disabled');
                if (this.testReview) {
                    this.testReview.disable();
                }
            },

            enableGui: function () {
                $controls.$naviButtons.removeClass('disabled');
                if (this.testReview) {
                    this.testReview.enable();
                }
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
             * @param {String} action - Action name
             * @param {Object} [extraParams] - Additional parameters to be sent to the server
             * @returns {undefined}
             */
            actionCall: function (action, extraParams) {
                var self = this,
                    params = {metaData : testMetaData.getData()};

                if (extraParams) {
                    params = _.assign(params, extraParams);
                }
                this.beforeTransition(function () {
                    $.ajax({
                        url: self.testContext[action + 'Url'],
                        cache: false,
                        data: params,
                        async: true,
                        dataType: 'json',
                        success: function (testContext) {
                            if (testContext.state === self.TEST_STATE_CLOSED) {
                                self.serviceApi.finish();
                                testMetaData.clearData();
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
                    testProgression = TestRunner.testReview ?
                        TestRunner.testReview.getProgression(self.testContext) : {
                            total : self.testContext.numberItems,
                            answered : self.testContext.numberCompleted,
                            flagged : self.testContext.numberFlagged || 0
                        },
                    message = __(
                        "You have %s unanswered question(s) and have %s item(s) marked for review. Are you sure you want to end the test?",
                        (testProgression.total - testProgression.answered).toString(),
                        (testProgression.flagged).toString()
                    );
                testMetaData.addData({
                    "TEST" : {"TEST_EXIT_CODE" : testMetaData.TEST_EXIT_CODE.INCOMPLETE},
                    "SECTION" : {"SECTION_EXIT_CODE" : testMetaData.SECTION_EXIT_CODE.QUIT}
                });

                $confirmBox.find('.message').html(message);
                $confirmBox.modal({ width: 500 });

                $confirmBox.find('.js-exit-cancel, .modal-close').off('click').on('click', function () {
                    $confirmBox.modal('close');
                });

                $confirmBox.find('.js-exit-confirm').off('click').on('click', function () {
                    $confirmBox.modal('close');
                    self.killItemSession(function () {
                        self.actionCall('endTestSession');
                        testMetaData.destroy();
                    });
                });
            },

            /**
             * Set the state of the current item in the test runner
             *
             * @param {string} id
             * @param {object} state
             */
            setCurrentItemState : function(id, state){
                if(id){
                    this.currentItemState[id] = state;
                }
            },

            /**
             * Reset the state of the current item in the test runner
             */
            resetCurrentItemState : function(){
                this.currentItemState = {};
            },

            /**
             * Get the state of the current item as stored in the test runner
             * @returns {Object}
             */
            getCurrentItemState : function(){
                return this.currentItemState;
            }
        };

        var config = module.config();
        if (config) {
            actionBarTools.register(config.qtiTools);
        }

        return {
            start: function (testContext) {

                $controls = {
                    // navigation
                    $moveForward: $('[data-control="move-forward"]'),
                    $moveEnd: $('[data-control="move-end"]'),
                    $moveBackward: $('[data-control="move-backward"]'),
                    $skip: $('[data-control="skip"]'),
                    $skipEnd: $('[data-control="skip-end"]'),
                    $exit: $(window.parent.document).find('[data-control="exit"]'),
                    $logout: $(window.parent.document).find('[data-control="logout"]'),
                    $naviButtons: $('.bottom-action-bar .action'),
                    $skipButtons: $('.navi-box .skip'),
                    $forwardButtons: $('.navi-box .forward'),

                    // comment
                    $commentToggle: $('[data-control="comment-toggle"]'),
                    $commentArea: $('[data-control="qti-comment"]'),
                    $commentText: $('[data-control="qti-comment-text"]'),
                    $commentCancel: $('[data-control="qti-comment-cancel"]'),
                    $commentSend: $('[data-control="qti-comment-send"]'),

                    // progress bar
                    $progressBar: $('[data-control="progress-bar"]'),
                    $progressLabel: $('[data-control="progress-label"]'),
                    $progressBox: $('.progress-box'),

                    // title
                    $title:  $('[data-control="qti-test-title"]'),
                    $position:  $('[data-control="qti-test-position"]'),

                    // timers
                    $timerWrapper:  $('[data-control="qti-timers"]'),

                    // other zones
                    $contentPanel: $('.content-panel'),
                    $controls: $('.qti-controls'),
                    $itemFrame: $('#qti-item'),
                    $rubricBlocks: $('#qti-rubrics'),
                    $contentBox: $('#qti-content'),
                    $sideBars: $('.test-sidebar'),
                    $topActionBar: $('.horizontal-action-bar.top-action-bar'),
                    $bottomActionBar: $('.horizontal-action-bar.bottom-action-bar')
                };

                // title
                $controls.$titleGroup = $controls.$title.add($controls.$position);

                // @todo remove when framework gets isn place
                if(testContext.allowComment) {
                    $controls.$commentToggle.show();
                }

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
                        testMetaData.destroy();
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

                $controls.$forwardButtons.click(function () {
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

                $controls.$exit.click(function (e) {
                    e.preventDefault();
                    TestRunner.exit();
                });

                $(window).on('resize', _.throttle(function () {
                    TestRunner.adjustFrame();
                    $controls.$titleGroup.show();
                }, 250));

                $doc.on('loading', function () {
                    iframeNotifier.parent('loading');
                });


                $doc.on('unloading', function () {
                    iframeNotifier.parent('unloading');
                });

                TestRunner.progressUpdater = progressUpdater($controls.$progressBar, $controls.$progressLabel);

                if (testContext.reviewScreen) {
                    TestRunner.testReview = testReview($controls.$contentPanel, {
                        region: testContext.reviewRegion || 'left',
                        hidden: _.indexOf(testContext.categories, 'x-tao-option-reviewScreen') < 0,
                        reviewScope: !!testContext.reviewScope,
                        preventsUnseen: !!testContext.reviewPreventsUnseen,
                        canCollapse: !!testContext.reviewCanCollapse
                    }).on('jump', function(event, position) {
                        TestRunner.jump(position);
                    }).on('mark', function(event, flag, position) {
                        TestRunner.markForReview(flag, position);
                    });
                    $controls.$sideBars = $('.test-sidebar');
                }

                TestRunner.updateProgress();
                TestRunner.updateTestReview();

                iframeNotifier.parent('serviceready');


                TestRunner.adjustFrame();

                $controls.$topActionBar.add($controls.$bottomActionBar).animate({ opacity: 1 }, 600);

                deleter($('#feedback-box'));
                modal($('body'));

                //listen to state change in the current item
                $(document).on('responsechange', function(e, responseId, response){
                    if(responseId && response){
                        TestRunner.setCurrentItemState(responseId, {response:response});
                    }
                }).on('stateready', function(e, id, state){
                    if(id && state){
                        TestRunner.setCurrentItemState(id, state);
                    }
                });

            }
        };
    });
