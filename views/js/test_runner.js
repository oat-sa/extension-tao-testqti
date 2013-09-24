var testRunnerConstants = {
	'TEST_STATE_INITIAL': 0,
	'TEST_STATE_INTERACTING': 1,
	'TEST_STATE_MODAL_FEEDBACK': 2,
	'TEST_STATE_SUSPENDED': 3,
	'TEST_STATE_CLOSED': 4,
	'TEST_NAVIGATION_LINEAR': 0,
	'TEST_NAVIGATION_NONLINEAR': 1
};

$(document).ready(function() {
	registerAutoResize(document.getElementById('qti-item'));
	updateNavigation();
	
	$('#skip').bind('click', skip);
	$('#move-forward').bind('click', moveForward);
	$('#move-backward').bind('click', moveBackward);
});

var autoResizeId;

function onServiceApiReady(serviceApi) {
	// If the assessment test session is in CLOSED state,
	// we give the control to the delivery engine by calling
	// finish.
	if (assessmentTestContext.state == testRunnerConstants.TEST_STATE_CLOSED) {
		serviceApi.finish();
	}
	else {
		$itemFrame = $('#qti-item');
		itemServiceApi = eval(assessmentTestContext.itemServiceApiCall);
		itemServiceApi.loadInto($itemFrame[0]);
		itemServiceApi.onFinish(function () {
			moveForward();
		});
	}
}

function moveForward() {
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
			}
		}
	});
}

function moveBackward() {
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
			}
		}
	});
}

function skip() {
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
			}
		}
	});
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
	updateNavigation();
	
	$itemFrame = $('#qti-item');
	$itemFrame.remove();
	$('#runner').append('<iframe id="qti-item" frameborder="0" scrolling="no"/>');
	$itemFrame = $('#qti-item');
	registerAutoResize($itemFrame[0]);
	
	itemServiceApi = eval(assessmentTestContext.itemServiceApiCall);
	itemServiceApi.loadInto($itemFrame[0]);
	itemServiceApi.onFinish(function() {
		moveForward();
	});
}

function updateNavigation() {
	
	if (assessmentTestContext.navigationMode == testRunnerConstants.TEST_NAVIGATION_LINEAR) {
		$('#move-forward, #move-backward').css('display', 'none');
		$('#skip').css('display', 'inline');
	}
	
	if (assessmentTestContext.navigationMode == testRunnerConstants.TEST_NAVIGATION_NONLINEAR) {
		$('#move-forward, #move-backward').css('display', 'inline');
		$('#skip').css('display', 'none');
	}
}