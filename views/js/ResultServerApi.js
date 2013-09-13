function ResultServerApi(endpoint, testServiceCallId, testDefinition, testCompilation){
	this.endpoint = endpoint;
	this.testServiceCallId = testServiceCallId;
	this.testDefinition = testDefinition;
	this.testCompilation = testCompilation;
}

ResultServerApi.prototype.submitItemVariables = function(itemId, serviceCallId, responses, scores, events, callback){
	$.ajax({
		url  		: this.endpoint + 'storeItemVariableSet?serviceCallId=' + encodeURIComponent(this.testServiceCallId),
		data 		: {
			responseVariables: responses,
			outcomeVariables: scores,
			traceVariables: events,
			QtiTestDefinition: this.testDefinition,
			QtiTestCompilation: this.testCompilation
		},
		type 		: 'post',
		dataType	: 'json',
		success		: function(reply) {
			callback();
		}
	});
};