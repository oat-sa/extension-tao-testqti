var testRunnerConstants = {
	'TEST_STATE_INITIAL': 0,
	'TEST_STATE_INTERACTING': 1,
	'TEST_STATE_MODAL_FEEDBACK': 2,
	'TEST_STATE_SUSPENDED': 3,
	'TEST_STATE_CLOSED': 4,
	'TEST_NAVIGATION_LINEAR': 0,
	'TEST_NAVIGATION_NONLINEAR': 1,
	'TEST_ITEM_STATE_INTERACTING': 1
	
};

$(document).ready(function() {
	registerAutoResize(document.getElementById('qti-item'));
	updateNavigation(assessmentTestContext);
	updateTools(assessmentTestContext);
	
	$('#skip').bind('click', skip);
	$('#move-forward').bind('click', moveForward);
	$('#move-backward').bind('click', moveBackward);
	$('#comment').bind('click', comment);
	$('#qti-comment-cancel').bind('click', closeComment);
	$('#qti-comment-send').bind('click', storeComment);
	$('#qti-comment > textarea').bind('focus', emptyComment);
});

var autoResizeId;
var timerId;
var currentTime = 0;

function onServiceApiReady(serviceApi) {
	// If the assessment test session is in CLOSED state,
	// we give the control to the delivery engine by calling
	// finish.
	if (assessmentTestContext.state == testRunnerConstants.TEST_STATE_CLOSED) {
		serviceApi.finish();
	}
	else {
		updateTestRunner(assessmentTestContext);
	}
}

function beforeTransition(callback) {
	
	$testRunner = $('#runner');
	$testRunner.css('height', '300px');
	
	$('#qti-item, #qti-info, #qti-rubrics, #qti-timer').css('display', 'none');
	
	overlay();
	loading();
	
	// Wait at least 500ms for a better user experience.
	setTimeout(callback, 500);
}

function afterTransition() {
	overlay();
	loading();
}

function overlay() {
	var $overlay = $('#qti-overlay');
	
	if ($overlay.length > 0) {
		$overlay.remove();
	}
	else {
		$('<div id="qti-overlay"></div>').appendTo(document.body);
	}
}

function loading() {
	var $loading = $('#qti-loading');
	
	if ($loading.length > 0) {
		$loading.remove();
	}
	else {
		$loading = $('<div id="qti-loading"></div>').appendTo(document.body);
		var opts = {
			lines: 11, // The number of lines to draw
			length: 21, // The length of each line
			width: 8, // The line thickness
			radius: 36, // The radius of the inner circle
			corners: 1, // Corner roundness (0..1)
			rotate: 0, // The rotation offset
			direction: 1, // 1: clockwise, -1: counterclockwise
			color: '#888', // #rgb or #rrggbb or array of colors
			speed: 1.5, // Rounds per second
			trail: 60, // Afterglow percentage
			shadow: false, // Whether to render a shadow
			hwaccel: false, // Whether to use hardware acceleration
			className: 'spinner', // The CSS class to assign to the spinner
			zIndex: 2e9, // The z-index (defaults to 2000000000)
			top: 'auto', // Top position relative to parent in px
			left: 'auto' // Left position relative to parent in px
		};
		var spinner = new Spinner(opts).spin($loading[0]);
	}
}

function moveForward() {
	beforeTransition(function() {
		$.ajax({
			url: assessmentTestContext.moveForwardUrl,
			cache: false,
			async: true,
			dataType: 'json',
			success: function(assessmentTestContext, textStatus, jqXhr) {
				if (assessmentTestContext.state == testRunnerConstants.TEST_STATE_CLOSED) {
					serviceApi.finish();
				}
				else {
					updateTestRunner(assessmentTestContext);
					afterTransition();
				}
			}
		});
	});
	
}

function moveBackward() {
	beforeTransition(function() {
		$.ajax({
			url: assessmentTestContext.moveBackwardUrl,
			cache: false,
			async: true,
			dataType: 'json',
			success: function(assessmentTestContext, textStatus, jqXhr) {
				if (assessmentTestContext.state == testRunnerConstants.TEST_STATE_CLOSED) {
					serviceApi.finish();
				}
				else {
					updateTestRunner(assessmentTestContext);
					afterTransition();
				}
			}
		});
	});
}

function skip() {
	beforeTransition(function() {
		$.ajax({
			url: assessmentTestContext.skipUrl,
			cache: false,
			async: true,
			dataType: 'json',
			success: function(assessmentTestContext, textStatus, jqXhr) {
				if (assessmentTestContext.state == testRunnerConstants.TEST_STATE_CLOSED) {
					serviceApi.finish();
				}
				else {
					updateTestRunner(assessmentTestContext);
					afterTransition();
				}
			}
		});
	});
}

function comment() {
	$('#comment').css('display', 'none');
	$('#qti-comment').css('display', 'block');
}

function closeComment() {
	$('#qti-comment').css('display', 'none');
	$('#comment').css('display', 'inline');
}

function emptyComment() {
	$('#qti-comment > textarea').val('');
}

function storeComment() {
	
	$.ajax({
		url: assessmentTestContext.commentUrl,
		cache: false,
		async: true,
		type: 'POST',
		data: { comment: $('#qti-comment > textarea').val() },
		success: function(assessmentTestContext, textStatus, jqXhr) {
			closeComment();
		}
	})
}

function autoResize(frame, frequence) {
	$frame = $(frame);
	autoResizeId = setInterval(function() {
		$frame.height($frame.contents().height());
	}, frequence);
}

function registerAutoResize(frame) {
	if (typeof autoResizeId !== 'undefined') {
		clearInterval(autoResizeId);
	}
	
	frame = document.getElementById('qti-item');
	
	if (jQuery.browser.msie) {
		frame.onreadystatechange = function (){	
			if (this.readyState == 'complete'){
				autoResize(frame, 10);
			}
		};
	}
	else {		
		frame.onload = function(){
			autoResize(frame, 10);
		};
	}
}

function updateTestRunner(assessmentTestContext) {
	
	$itemFrame = $('#qti-item');
	$itemFrame.remove();
	
	$runner = $('#runner');
	$runner.css('height', 'auto');
	
	updateNavigation(assessmentTestContext);
	updateInformation(assessmentTestContext);
	updateTimer(assessmentTestContext);
	updateRubrics(assessmentTestContext);
	updateTools(assessmentTestContext);
	
	$('#runner').append('<iframe id="qti-item" frameborder="0" scrolling="no"/>');
	$itemFrame = $('#qti-item');
	registerAutoResize($itemFrame[0]);
	
	
	if (assessmentTestContext.itemSessionState == testRunnerConstants.TEST_ITEM_STATE_INTERACTING) {
		
		itemServiceApi = eval(assessmentTestContext.itemServiceApiCall);
		itemServiceApi.loadInto($itemFrame[0]);
		$itemFrame.css('display', 'block');
		itemServiceApi.onFinish(function() {
			moveForward();
		});
	}
}

function updateInformation(assessmentTestContext) {
	if (assessmentTestContext.info == null) {
		$('#qti-info').remove();
	}
	else {
		$('<div id="qti-info" class="info">' + assessmentTestContext.info + '</div>').insertAfter('#qti-actions');
	}
}

function updateTools(assessmentTestContext) {
	if (assessmentTestContext['allowComment'] == true) {
		$('#comment').css('display', 'inline');
	}
	else {
		$('#comment').css('display', 'none');
	}
}

function updateTimer(assessmentTestContext) {
	
	if (typeof timerId !== 'undefined') {
		clearInterval(timerId);
	}
	
	$('#qti-timer').remove();
	
	if (assessmentTestContext.testPartRemainingTime !== null) {
		$('<div id="qti-timer">' + formatTime(assessmentTestContext.testPartRemainingTime) + '</div>').insertAfter('#qti-actions');
		
		// Set up a timer and update it.
		currentTime = assessmentTestContext.testPartRemainingTime;
		timerId = setInterval(function() {
			currentTime--;
			
			if (currentTime <= 0) {
				currentTime = 0;
				clearInterval(timerId);
				$('#qti-item').css('display', 'none');
				serviceApi.finish();
			}
			
			$('#qti-timer').html(formatTime(currentTime));
		}, 1000);
	}
}

function updateRubrics(assessmentTestContext) {
	$('#qti-rubrics').remove();
	
	if (assessmentTestContext.rubrics.length > 0) {
		$rubrics = $('<div id="qti-rubrics"></div>');
		
		for (i = 0; i < assessmentTestContext.rubrics.length; i++) {
			$rubrics.append(assessmentTestContext.rubrics[i]);
		}
		
		// modify the <a> tags in order to be sure it
		// opens in another window.
		$rubrics.find('a').bind('click keypress', function() {
			window.open(this.href);
			return false;
		});
		
		$rubrics.insertAfter('#qti-actions');
	}
}

function updateNavigation(assessmentTestContext) {
	
	if (assessmentTestContext.navigationMode == testRunnerConstants.TEST_NAVIGATION_LINEAR) {
		$('#move-forward, #move-backward').css('display', 'none');
		$('#skip').css('display', 'inline');
	}
	
	if (assessmentTestContext.navigationMode == testRunnerConstants.TEST_NAVIGATION_NONLINEAR) {
		$('#move-forward').css('display', 'inline');
		$('#move-backward').css('display', (assessmentTestContext.canMoveBackward === true) ? 'inline' : 'none');
		$('#skip').css('display', 'none');
	}
}

function formatTime(totalSeconds) {
    var sec_num = totalSeconds;
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0" + hours;}
    if (minutes < 10) {minutes = "0" + minutes;}
    if (seconds < 10) {seconds = "0" + seconds;}
    
    var time    = hours + ':' + minutes + ':' + seconds;
    
    return "\u00b1 " + time;
};