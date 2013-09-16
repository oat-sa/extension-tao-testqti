var testRunnerConstants = {
	'TEST_STATE_INITIAL': 0,
	'TEST_STATE_INTERACTING': 1,
	'TEST_STATE_MODAL_FEEDBACK': 2,
	'TEST_STATE_SUSPENDED': 3,
	'TEST_STATE_CLOSED': 4
};

$(document).ready(function () {
	$frame = $('#qti-item');
	registerAutoResize();
});

function onServiceApiReady(serviceApi) {

		// If the assessment test session is in CLOSED state,
		// we give the control to the delivery engine by calling
		// finish.
		if (assessmentTestContext.state == testRunnerConstants.TEST_STATE_CLOSED) {
			serviceApi.finish();
		}
		else {
			itemServiceApi.loadInto($frame[0]);
			itemServiceApi.onFinish(function () {
				location.reload(true);
			});
		}
}

function autoResize(frame, frequence) {
	$frame = $(frame);
	setInterval(function() {
		$frame.height($frame.contents().height());
	}, frequence);
}

function registerAutoResize() {
	var $frame = $('#qti-item');
	
	if (jQuery.browser.msie) {
		$frame[0].onreadystatechange = function(){	
			if(this.readyState == 'complete'){
				$frame.css('display', 'block');
				autoResize($frame[0], 10);
			}
		};
	} else {		
		$frame[0].onload = function(){
			$frame.css('display', 'block');
			autoResize($frame[0], 10);
		};
	}
}