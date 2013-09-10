$(document).ready(function () {
	var $frame = $('#qti-item');
	
	if (jQuery.browser.msie) {
		$frame[0].onreadystatechange = function(){	
			if(this.readyState == 'complete'){
				autoResize($frame[0], 10);
			}
		};
	} else {		
		$frame[0].onload = function(){
			autoResize($frame[0], 10);
		};
	}
	
	serviceApi.loadInto($frame[0]);
	serviceApi.finish = function () {
		
	};
});

function autoResize(frame, frequence) {
	$frame = $(frame);
	setInterval(function() {
		$frame.height($frame.contents().height());
	}, frequence);
}

/**
 * Get the URL to call the item to be presented to the candidate.
 * 
 * @return {string} A URL (Uniform Resource Locator).
 */
function getServiceCallUrl() {
	return assessmentTestContext['itemCall'];
}