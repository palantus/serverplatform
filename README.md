# ServerPlatform #

### Required modules: ###
* connect
* crypto
* moment
* events
* body-parser
* serve-static
* url

## Server modules API ##

Note: All server API's can be called using either POST or GET (URL parameters). The samples below are using POST.


### Sample module callback ###
The following is a sample callback for a module used to Query a Google sheet using "Google Visualization API".

```
#!javascript

$.get("/request?module=integration&type=sheetsquery&sheet=DOCUMENT_KEY&query=SELECT%20B%20WHERE%20A=%2720140716%27", function(res){
	//handle response
});

// ... or send the following object as JSON in a post request:
{module: "integration", type: "sheetsquery", sheet: "DOCUMENT_KEY", query: "SELECT B WHERE A='20140716'"}
```

### Configuration file ###
The configuration file can be placed under the current folder or the parent folder and must be named config.json. The following is a sample configuration file:

```
#!javascript

{
	"DatabaseDriver": "mssql_tedious_concurrent",
	"www": "../www",
	"modules": "../modules"
}
```