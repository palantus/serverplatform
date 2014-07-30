# ServerPlatform #

[![Gittip](https://img.shields.io/gittip/palantus.svg)](https://www.gittip.com/palantus/)


## Server modules API ##

Note: All server API's can be called using either POST or GET (URL parameters). The samples below are using POST.


### Sample module callback ###
The following is a sample callback for a module used to Query a Google sheet using "Google Visualization API".

    $.get("/request?module=integration&type=sheetsquery&sheet=DOCUMENT_KEY&query=SELECT%20B%20WHERE%20A=%2720140716%27", function(res){
    	//handle response
    });
    
    // ... or send the following object as JSON in a post request:
    {module: "integration", type: "sheetsquery", sheet: "DOCUMENT_KEY", query: "SELECT B WHERE A='20140716'"}


### Handling module callback ###

	var IntegrationModule = function () {
	};
	
	IntegrationModule.prototype.init = function(fw, onFinished) {
	    this.fw = fw;
		onFinished.call(this);
	}
	
	IntegrationModule.prototype.onMessage = function (req, callback) {
		switch(req.body.type){
			case "sheetsquery" :
	
				if(typeof(req.body.sheet) !== "string" || typeof(req.body.query) !== "string"){
					callback({error: "Invalid sheet request"});
					return;
				}
				// ...
				break;
			case "sheetsupdate" :
				if(typeof(req.body.sheet) !== "string" || isNaN(req.body.row) || isNaN(req.body.col) || req.body.value === undefined){
					callback({error: "Invalid sheet update request"});
					return;
				}
				// ...
				break;
		}
	};
	 
	module.exports = IntegrationModule;












### Configuration file ###
The configuration file can be placed under the current folder or the parent folder and must be named config.json. The following is a sample configuration file:

	{
		"DatabaseDriver": "mssql_tedious_concurrent",
		"www": "../www",
		"modules": "../modules"
	}
