var testRunnerConstants = {
	'TEST_STATE_INITIAL': 0,
	'TEST_STATE_INTERACTING': 1,
	'TEST_STATE_MODAL_FEEDBACK': 2,
	'TEST_STATE_SUSPENDED': 3,
	'TEST_STATE_CLOSED': 4
};

$(document).ready(function() {
	registerAutoResize(document.getElementById('qti-item'));
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
		success: function(data, testStatus, jqXhr) {
			if (data.state == testRunnerConstants.TEST_STATE_CLOSED) {
				serviceApi.finish();
			}
			else {
				$itemFrame = $('#qti-item');
				$itemFrame.remove();
				$('#qti-test-runner').append('<iframe id="qti-item" frameborder="0" style="overflow:hidden;"/>');
				$itemFrame = $('#qti-item');
				registerAutoResize($itemFrame[0]);
				
				itemServiceApi = eval(data.serviceApiCall);
				itemServiceApi.loadInto($itemFrame[0]);
				itemServiceApi.onFinish(function() {
					moveForward();
				});
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
		frame.onreadystatechange = function(){	
			if(this.readyState == 'complete'){
				autoResize(frame, 10);
			}
		};
	} else {		
		frame.onload = function(){
			autoResize(frame, 10);
		};
	}
}