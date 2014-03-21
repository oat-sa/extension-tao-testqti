define(['jquery', 'spin', 'serviceApi/ServiceApi', 'serviceApi/UserInfoService', 'serviceApi/StateStorage', 'iframeResizer', 'iframeNotifier', 'i18n'], 
    function($, Spinner, ServiceApi, UserInfoService, StateStorage, iframeResizer, iframeNotifier, __){

	    var timerIds = [];
	    var currentTimes = [];
	    var lastDates = [];
		var timeDiffs = [];
	
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
	
	        $('#qti-item, #qti-info, #qti-rubrics, #qti-timers').css('display', 'none');
	
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
		    this.actionCall('moveForward');
		},
	
		moveBackward : function() {
			this.actionCall('moveBackward');
		},
	
		skip : function() {
			this.actionCall('skip');
		},
		
		timeout: function() {
			this.assessmentTestContext.isTimeout = true;
			this.updateTimer();
			this.actionCall('timeout');
		},
	
		comment : function() {
			$('#qti-comment > textarea').val(__('Your comment...'));
		    $('#qti-comment').css('display', 'block');
		},
		
		closeComment : function() {
		    $('#qti-comment').css('display', 'none');
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
			this.updateRubrics();
			this.updateTools();
			this.updateTimer();
			
			$('<iframe id="qti-item" frameborder="0" scrolling="no"/>').appendTo($runner);
			if (this.assessmentTestContext.itemSessionState === this.TEST_ITEM_STATE_INTERACTING && self.assessmentTestContext.isTimeout === false) {
				// @todo Oops, eval to be fixed (why Bertrand :s ?)
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
			else {
				// e.g. no more attempts! Simply consider the transition is finished,
				// but do not load the item.
				self.afterTransition();
			}
		},
	
		updateInformation : function() {
            $('#qti-info').remove();            
            
            if (this.assessmentTestContext.isTimeout === true) {
            	$('<div id="qti-info" class="info"></div>').insertAfter('#qti-actions');
            	$('#qti-info').html(__('Maximum time limit reached for item "%s".').replace('%s', this.assessmentTestContext.itemIdentifier));
            }
            else if (this.assessmentTestContext.itemSessionState !== this.TEST_ITEM_STATE_INTERACTING) {
            	$('<div id="qti-info" class="info"></div>').insertAfter('#qti-actions');
            	$('#qti-info').html(__('No more attempts allowed for item "%s".').replace('%s', this.assessmentTestContext.itemIdentifier));
            }
		},
		
		updateTools : function updateTools() {
		    if (this.assessmentTestContext.allowComment === true) {
	            $('#comment').css('display', 'inline');
		    } 
		    else {
	            $('#comment').css('display', 'none');
		    }
		    
		    if (this.assessmentTestContext.allowSkipping === true) {
		    	$('#skip').css('display', 'inline');
		    }
		    else {
		    	$('#skip').css('display', 'none');
		    }
		},
		
		updateTimer : function() {
			var self = this;
			$('#qti-timers').remove();
			
			for (var i = 0; i < timerIds.length; i++) {
				clearTimeout(timerIds[i]);
			}
		    
		    timerIds = [];
		    currentTimes = [];
		    lastDates = [];
			timeDiffs = [];
			
			if (self.assessmentTestContext.isTimeout == false && self.assessmentTestContext.itemSessionState == self.TEST_ITEM_STATE_INTERACTING) {

			    if (this.assessmentTestContext.timeConstraints.length > 0) {
			
			    	// Insert QTI Timers container.
			    	$('<div id="qti-timers"></div>').insertAfter('#qti-actions');
			    	// self.formatTime(cst.seconds)
			        for (var i = this.assessmentTestContext.timeConstraints.length - 1; i >= 0; i--) {
			        	
			        	var cst = this.assessmentTestContext.timeConstraints[i];
			        	
			        	// Set up a timer for this constraint.
			        	$('<div class="qti-timer">' + cst.source + ' - ' + self.formatTime(cst.seconds) + '</div>').appendTo('#qti-timers');
			        	
			        	// Set up a timer and update it with setInterval.
			            currentTimes[i] = cst.seconds;
			            lastDates[i] = new Date();
			            timeDiffs[i] = 0;
			            timerIndex = i;
			            source = cst.source;
			            
			            // ~*~*~ ❙==[||||)0__    <----- SUPER CLOSURE !
			            var superClosure = function(timerIndex, source) {
			            	timerIds[timerIndex] = setInterval(function() {
				            	
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
			                        $('#qti-item').css('display', 'none');

			                        self.timeout();
				                }
				                else {
				                	// Not timed-out...
				                	$('#qti-timers > .qti-timer').eq(timerIndex).html(source + ' - ' + self.formatTime(Math.round(currentTimes[timerIndex])));
				                    lastDates[timerIndex] = new Date();
				                }
				
				            }, 1000);
			            }
			            
			            superClosure(timerIndex, source);     
			        }
			        
			        $('#qti-timers').css('display', 'block');
			    }
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
		            MathJax.Hub.Queue(["Typeset", MathJax.Hub], $('#qti-rubrics')[0]);
		    }
		},
	
		updateNavigation: function() {
		    if (this.assessmentTestContext.navigationMode === this.TEST_NAVIGATION_LINEAR) {
		    	// LINEAR
		    	if (this.assessmentTestContext.allowComment === false && this.assessmentTestContext.allowSkipping === false) {
		    		$('#qti-actions').css('display', 'none');
		    	}
		    	else {
		    		$('#qti-actions').css('display', 'block');
		    		$('#move-forward, #move-backward').css('display', 'none');
		    	}
		    }
		    else {
		    	// NONLINEAR
		    	$('qti-actions').css('display', 'block');
		    	$('#move-forward').css('display', 'inline');
		    	$('#move-backward').css('display', (this.assessmentTestContext.canMoveBackward === true) ? 'inline' : 'none');
		    }
		},
	
		formatTime: function(totalSeconds) {
		    var sec_num = totalSeconds;
		    var hours   = Math.floor(sec_num / 3600);
		    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
		    var seconds = sec_num - (hours * 3600) - (minutes * 60);
		
		    if (hours   < 10) {hours   = "0" + hours;}
		    if (minutes < 10) {minutes = "0" + minutes;}
		    if (seconds < 10) {seconds = "0" + seconds;}
		
		    var time    = hours + ':' + minutes + ':' + seconds;
		
		    return "\u00b1 " + time;
		},
		
		actionCall: function(action) {
			var self = this;
			this.beforeTransition(function() {
				$.ajax({
					url: self.assessmentTestContext[action + 'Url'],
					cache: false,
					async: true,
					dataType: 'json',
					success: function(assessmentTestContext, textStatus, jqXhr) {
						if (assessmentTestContext.state === self.TEST_STATE_CLOSED) {
							self.serviceApi.finish();
						}
						else {
							self.update(assessmentTestContext);
						}
					}
				});
			});
		}
	};

	return {
	    start : function(assessmentTestContext){
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
	
	        iframeNotifier.parent('serviceready');
	    }
	};
});