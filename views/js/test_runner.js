$(document).ready(function () {
	var $frame = $('#qti-item');
	serviceApi.loadInto($frame[0]);
	
	setInterval(function() {
		$frame.height($frame.contents().height());
	}, 10);
});


/**
 * Get the URL to call the item to be presented to the candidate.
 * 
 * @return {string} A URL (Uniform Resource Locator).
 */
function getServiceCallUrl() {
	return assessmentTestContext['itemCall'];
}