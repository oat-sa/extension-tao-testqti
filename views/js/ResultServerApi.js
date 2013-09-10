function ResultServerApi(endpoint, testServiceCallId, testDefinition){
	this.endpoint = endpoint;
	this.testServiceCallId = testServiceCallId;
	this.testDefinition = testDefinition;
}

ResultServerApi.prototype.submitItemVariables = function(itemId, serviceCallId, responses, scores, events, callback){
	$.ajax({
		url  		: this.endpoint + 'storeItemVariableSet?QtiTestDefinition=' + encodeURIComponent(this.testDefinition) + '&serviceCallId=' + encodeURIComponent(this.testServiceCallId),
		data 		: {
			responseVariables: responses,
			outcomeVariables: scores,
			traceVariables: events
		},
		type 		: 'post',
		dataType	: 'json',
		success		: function(reply) {
			callback();
		}
	});
};