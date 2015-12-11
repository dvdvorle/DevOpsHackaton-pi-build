var exec = require('child_process').exec;
var config = require('./config');
var Client = require('node-rest-client').Client;

var options_auth = { user: config.vsoUser, password: config.vsoPass};
client = new Client (options_auth);

function checkStatus() {
	client.get
	  ("https://" + config.vsoAccount + ".visualstudio.com/defaultcollection/" + config.vsoProject + "/_apis/build/builds?api-version=2.0&definitions=1&$top=1",
	   function (data, response) {
	     data = fixResponseNoContentTypeToJson (data, response);
	     var status = data.value[0].status;
	     var result = data.value[0].result;
	     updateLight(status, result);
	   }
	);
};

// node-rest client is picky about the returned content type, 
// this solves a particular issue where it doesn't nicely parse JSON from 
// Visual Studio Online.
fixResponseNoContentTypeToJson = function (dataOrig, response) {
  var data = dataOrig;
  if (response.headers["content-type"].indexOf (" charset") > -1) {
    data = JSON.parse (data);
  }
  return data;
}

updateLight = function(status, result) {
	switch(status) {
		case "completed":
			if(result == "succeeded") {
			  setLights(0, 0, 1);
			} else {
			  setLights(1, 0, 0);
			}
		break;
		case "notStarted":
			setLights(0, 1, 0);
		break;
		case "inProgress":
			setLights(0, 1, 1);
		break;
	};
}

setLights = function(red, orange, green) {
	exec('gpio write 0 ' + red);	
	exec('gpio write 1 ' + orange);	
	exec('gpio write 2 ' + green);	
}

setInterval(checkStatus, 2000);
