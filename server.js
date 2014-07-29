
var moment = require("moment");
var connect = require("connect");
var fs = require('fs');

EventEmitter = require('events').EventEmitter;
var eve = new EventEmitter();

var modulesFound = 0;
var modulesLoaded = 0;

var serverToldToStart = false;

var configFile = fs.existsSync("./config.json") ? "./config.json"
					: fs.existsSync("../config.json") ? "../config.json"
					: null;

if(configFile === null)
	console.log("Did not find a config.json file. Will use default configuration.");

var Framework = function(){
	this.modules = {};
	this.config = configFile != null ? require(configFile) : {};
}

var framework = new Framework();

framework.config.www = framework.config.www !== undefined ? framework.config.www : "../www";
framework.config.modules = framework.config.modules !== undefined ? framework.config.modules : "../modules";

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function loadNextModule(){
	for(key in framework.modules){
		if(!framework.modules[key].initialized){
			var foundUnsatisfied = false;
			for(dep in framework.modules[key].config.deps){
				if(framework.modules[dep] !== undefined && !framework.modules[dep].initialized)
					foundUnsatisfied = true;
			}
			if(!foundUnsatisfied){
				framework.modules[key].init(framework, function(){
					this.initialized = true;
					app.use("/" + this.moduleName, static(framework.config.modules + "/" + this.moduleName + "/www"));
					loadNextModule();
				});
				return;
			}
		}
	}
	
	eve.emit("modules_loaded");
}

eve.on('server_created',function(){
	// Load modules:
	fs.readdir(framework.config.modules + '/',function(err,files){
		if(err) throw err;
		files.forEach(function(file){
		
			var config = require(framework.config.modules + "/" + file + "/module.json");
			if(!config.disabled === true && typeof(config.main) === "string"){
				var Mod = require(framework.config.modules + "/" + file + "/" + config.main);
				framework.modules[file] = new Mod();
				framework.modules[file].config = config;
				framework.modules[file].initialized = false;
				framework.modules[file].moduleName = file;
				
				console.log("Loaded module " + file);
			}
			modulesFound++;
		});
		
		loadNextModule();
	 });
});

eve.on('modules_loaded',function(){
	app.use(static(framework.config.www)) //Must be last option

	for(moduleName in framework.modules){
		if(typeof(framework.modules[moduleName].handlePreStart) === "function"){
			framework.modules[moduleName].handlePreStart();
		}
	}
	startServer();
	
});

eve.on('server_started',function(){
	console.log("Server started...");
});

function startServer(){
	app.listen(process.env.port || 3000);
	eve.emit("server_started");
	
	for(moduleName in framework.modules)
		if(typeof(framework.modules[moduleName].onServerStarted) === "function")
			framework.modules[moduleName].onServerStarted();
}

var static = require('serve-static')
var bodyParser = require('body-parser')
var url = require('url');

var app = connect()
	//.use(connect.staticCache())
	.use("/fw", static(framework.config.www))
	//.use(connect.query())
	.use(bodyParser.urlencoded({ extended: false }))
	.use(bodyParser.json())
	.use("/request", function(req, res){
		var url_parts = url.parse(req.url, true);
		req.query = url_parts.query;

		console.log(req.query);

		if(typeof(req.query) === "object" && Object.getOwnPropertyNames(req.body).length < 1)
			req.body = req.query;

		if(req.body !== undefined){
			if(typeof(req.body.module) === "string"){
				if(framework.modules[req.body.module] !== undefined){
					framework.modules[req.body.module].onMessage(req, function(response){
						res.writeHead(200, {'Content-Type':'application/json'});
						res.end(JSON.stringify(response));
					}, res)
				} else {
					res.writeHead(200, {'Content-Type':'application/json'});
					res.end(JSON.stringify({error: "Invalid request"}));
				}
			} else {
				res.end("Invalid request! Module not provided");
				console.log(req.body);
			}
		} else {
			res.end("Invalid request! Body undefined.");
			console.log(req);
		}
	});
	
eve.emit("server_created");