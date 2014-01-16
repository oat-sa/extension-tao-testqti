define(['jquery', 'spin', 'serviceApi/ServiceApi', 'serviceApi/UserInfoService', 'serviceApi/StateStorage', 'iframeResizer', 'iframeNotifier'], 
    function($, Spinner, ServiceApi, UserInfoService, StateStorage, iframeResizer, iframeNotifier){

    var timerId;
    var currentTime = 0;

    var TestRunner = {
        
        //const
        'TEST_STATE_INITIAL': 0,
        'TEST_STATE_INTERACTING': 1,
        'TEST_STATE_MODAL_FEEDBACK': 2,
        'TEST_STATE_SUSPENDED': 3,
        'TEST_STATE_CLOSED': 4,
        'TEST_NAVIGATION_LINEAR': 0,
        'TEST_NAVIGATION_NONLINEAR': 1,
        'TEST_ITEM_STATE_INTERACTING': 1,
        
        beforeTransition : function(callback) {

                var $testRunner = $('#runner');
                $testRunner.css('height', '300px');

                $('#qti-item, #qti-info, #qti-rubrics, #qti-timer').css('display', 'none');

                //ask the top window to start the loader 
                iframeNotifier.parent('loading');

                // Wait at least 500ms for a better user experience.
                if(typeof callback === 'function'){
                    setTimeout(callback, 500);
                }
        },

        afterTransition : function() {
             //ask the top window to stop the loader 
             iframeNotifier.parent('unloading');
        },

        moveForward: function() {
            var self = this;
            this.beforeTransition(function() {
                    $.ajax({
                            url: self.assessmentTestContext.moveForwardUrl,
                            cache: false,
                            async: true,
                            dataType: 'json',
                            success: function(assessmentTestContext, textStatus, jqXhr) {
                                    if (assessmentTestContext.state === self.TEST_STATE_CLOSED) {
                                            self.serviceApi.finish();
                                    } else {
                                            self.update(assessmentTestContext);
                                    }
                            }
                    });
            });
        },

        moveBackward : function() {
             var self = this;
             this.beforeTransition(function() {
                        $.ajax({
                                url: self.assessmentTestContext.moveBackwardUrl,
                                cache: false,
                                async: true,
                                dataType: 'json',
                                success: function(assessmentTestContext, textStatus, jqXhr) {
                                        if (assessmentTestContext.state === self.TEST_STATE_CLOSED) {
                                                self.serviceApi.finish();
                                        }  else {
                                                self.update(assessmentTestContext);
                                        }
                                }
                        });
                });
        },

        skip : function() {
             var self = this;
             this.beforeTransition(function() {
                        $.ajax({
                                url: self.assessmentTestContext.skipUrl,
                                cache: false,
                                async: true,
                                dataType: 'json',
                                success: function(assessmentTestContext, textStatus, jqXhr) {
                                        if (assessmentTestContext.state === self.TEST_STATE_CLOSED) {
                                                self.serviceApi.finish();
                                        } else {
                                                self.update(assessmentTestContext);
                                        }
                                }
                        });
                });
        },

        comment : function() {
                $('#comment').css('display', 'none');
                $('#qti-comment').css('display', 'block');
        },

        closeComment : function() {
                $('#qti-comment').css('display', 'none');
                $('#comment').css('display', 'inline');
        },

        emptyComment : function() {
                $('#qti-comment > textarea').val('');
        },

        storeComment: function() {
                var self = this;
                $.ajax({
                        url: self.assessmentTestContext.commentUrl,
                        cache: false,
                        async: true,
                        type: 'POST',
                        data: { comment: $('#qti-comment > textarea').val() },
                        success: function(assessmentTestContext, textStatus, jqXhr) {
                                self.closeComment();
                        }
                });
        },

        update : function(assessmentTestContext) {
                var self = this;
                $('#qti-item').remove();
                
                var $runner = $('#runner');
                $runner.css('height', 'auto');

                this.assessmentTestContext = assessmentTestContext;
                this.updateNavigation();
                this.updateInformation();
                this.updateTimer();
                this.updateRubrics();
                this.updateTools();

                $('<iframe id="qti-item" frameborder="0" scrolling="no"/>').appendTo($runner);

                if (this.assessmentTestContext.itemSessionState === this.TEST_ITEM_STATE_INTERACTING) {

                        //Oooops, eval to be fixed !
                        var itemServiceApi = eval(this.assessmentTestContext.itemServiceApiCall);
                        var $itemFrame = $('#qti-item', $runner);
                        
                        iframeResizer.autoHeight($itemFrame, 'iframe', parseInt($runner.height(), 10));
                        itemServiceApi.loadInto($itemFrame[0], function(){
                            self.afterTransition();
                            $itemFrame.show();
                        });
                        
                        itemServiceApi.onFinish(function() {
                        	self.moveForward();
                        });
                }
        },

        updateInformation : function() {
                if (this.assessmentTestContext.info === null) {
                        $('#qti-info').remove();
                }
                else {
                        $('<div id="qti-info" class="info">' + this.assessmentTestContext.info + '</div>').insertAfter('#qti-actions');
                }
        },

        updateTools : function updateTools() {
                if (this.assessmentTestContext['allowComment'] === true) {
                        $('#comment').css('display', 'inline');
                } else {
                        $('#comment').css('display', 'none');
                }
        },

        updateTimer : function() {
                var self = this;
                if (typeof timerId !== 'undefined') {
                        clearInterval(timerId);
                }

                $('#qti-timer').remove();

                if (this.assessmentTestContext.testPartRemainingTime !== null) {
                        $('<div id="qti-timer">' + self.formatTime(this.assessmentTestContext.testPartRemainingTime) + '</div>').insertAfter('#qti-actions');

                        // Set up a timer and update it.
                        currentTime = this.assessmentTestContext.testPartRemainingTime;
                        var lastDate = new Date();
                        var timeDiff = 0;

                        timerId = setInterval(function() {

                                timeDiff += (new Date()).getTime() - lastDate.getTime();

                                if (timeDiff >= 1000) {
                                        var seconds = timeDiff / 1000;
                                        currentTime -= seconds;
                                        timeDiff = 0;
                                }


                                if (currentTime <= 0) {
                                        $('#qti-timer').html(self.formatTime(Math.round(currentTime)));
                                        currentTime = 0;
                                        clearInterval(timerId);
                                        $('#qti-item').css('display', 'none');
                                        self.serviceApi.finish();
                                }
                                else {
                                        $('#qti-timer').html(self.formatTime(Math.round(currentTime)));
                                        lastDate = new Date();
                                }

                        }, 1000);
                }
        },

        updateRubrics : function() {
                $('#qti-rubrics').remove();

                if (this.assessmentTestContext.rubrics.length > 0) {
                        var $rubrics = $('<div id="qti-rubrics"></div>');

                        for (var i = 0; i < this.assessmentTestContext.rubrics.length; i++) {
                                $rubrics.append(this.assessmentTestContext.rubrics[i]);
                        }

                        // modify the <a> tags in order to be sure it
                        // opens in another window.
                        $rubrics.find('a').bind('click keypress', function() {
                                window.open(this.href);
                                return false;
                        });

                        $rubrics.insertAfter('#qti-actions');
                }
        },

        updateNavigation: function() {

                if (this.assessmentTestContext.navigationMode === this.TEST_NAVIGATION_LINEAR) {
                        $('#move-forward, #move-backward').css('display', 'none');
                        $('#skip').css('display', 'inline');
                }

                if (this.assessmentTestContext.navigationMode === this.TEST_NAVIGATION_NONLINEAR) {
                        $('#move-forward').css('display', 'inline');
                        $('#move-backward').css('display', (this.assessmentTestContext.canMoveBackward === true) ? 'inline' : 'none');
                        $('#skip').css('display', 'none');
                }
        },

        formatTime : function(totalSeconds) {
            var sec_num = totalSeconds;
            var hours   = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours   < 10) {hours   = "0" + hours;}
            if (minutes < 10) {minutes = "0" + minutes;}
            if (seconds < 10) {seconds = "0" + seconds;}

            var time    = hours + ':' + minutes + ':' + seconds;

            return "\u00b1 " + time;
        }
    
    };


    return {
        start : function(assessmentTestContext){
            TestRunner.beforeTransition();
            
            TestRunner.assessmentTestContext = assessmentTestContext;
            TestRunner.updateNavigation();
            TestRunner.updateTools();

            $('#skip').click(function(){
                TestRunner.skip();
            });
            $('#move-forward').click(function(){
                TestRunner.moveForward();
            });
            $('#move-backward').click(function(){
                TestRunner.moveBackward();
            });
            $('#comment').click(function(){
                TestRunner.comment();
            });
            $('#qti-comment-cancel').click(function(){
                    TestRunner.closeComment();
            });
            $('#qti-comment-send').click(function(){
                TestRunner.storeComment();
            });
            $('#qti-comment > textarea').click(function(){
                TestRunner.emptyComment();
            });

            window.onServiceApiReady = function onServiceApiReady(serviceApi) {
                
                    TestRunner.serviceApi = serviceApi;

                   // If the assessment test session is in CLOSED state,
                   // we give the control to the delivery engine by calling
                   // finish.
                   if (assessmentTestContext.state === TestRunner.TEST_STATE_CLOSED) {
                           serviceApi.finish();
                   }
                   else {
                           TestRunner.update(assessmentTestContext);
                   }
            };
            iframeNotifier.parent('serviceready');
        }
    };
});