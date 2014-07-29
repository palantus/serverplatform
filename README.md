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