/*
 ** File: Mo.js
 ** Usage: core code of MAE, don't change 'Mo' to other name.
 ** About:
 **		support@mae.im
 */
var 
	defaultConfig={}, 
	define = function(name,value){
		defaultConfig[name.toUpperCase()] = value;
	},
	__events__ = {
		"ondispose": []
	}
;
var F, JSON, require, VBS, View, Model__,
	req = Request,
	res = Response,
	ROOT = Server.Mappath("/"), Mo,
	startup = Mo = Mo || (function() {
		var c = function(d) {
			if (typeof d != "string") {
				return ""
			}
			if (d.substr(1,1) == ":") {
				return d
			}
			return Server.MapPath(d)
		};
		var _CacheFileName = "",
			_Assigns = {},
			_Language = {};
		var _extend = function(src, dest) {
			for (var c in dest) {
				if (dest.hasOwnProperty(c)) src[c] = dest[c];
			}
			return src;
		};

		var _RightCopy = function(src, target) {
			var i = 0;
			while (true) {
				if (i >= src.length || i >= target.length) break;
				src[src.length - i - 1] = target[target.length - i - 1];
				i++;
			}
			return src;
		};
		var _LoadTemplate = function(template){
			var template = __LoadTemplate(template);
			template = template.replace(/<selection name\=("|')(\w+)\1(\s*)\/>/ig, "");
			template = template.replace(/<selection name\=("|')(\w+)\1(\s*)>([\s\S]*?)<\/selection>/ig, "$4");
			return template;
		};
		var __LoadTemplate = function(template) {
			var templatelist, vpath, path, templatelist2;
			templatelist = template.split(":");
			if (templatelist.length == 1) {
				vpath = G.MO_TEMPLATE_NAME + "/" + M.Method + G.MO_TEMPLATE_SPLIT + template;
				templatelist = [G.MO_TEMPLATE_NAME, M.Method, template];
			} else if (templatelist.length == 2) {
				vpath = G.MO_TEMPLATE_NAME + "/" + template.replace(":", G.MO_TEMPLATE_SPLIT);
				templatelist = [G.MO_TEMPLATE_NAME].concat(templatelist);
			} else if (templatelist.length == 3) {
				vpath = templatelist[0] + "/" + templatelist[1] + G.MO_TEMPLATE_SPLIT + templatelist[2];
			}
			path = G.MO_APP + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
			if (vpath.indexOf("@") > 0) path = G.MO_ROOT + vpath.substr(vpath.indexOf("@") + 1) + "/Views/" + vpath.substr(0, vpath.indexOf("@")) + "." + G.MO_TEMPLATE_PERX;
			if (!IO.file.exists(path)) path = G.MO_CORE + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
			if (!IO.file.exists(path)) {
				ExceptionManager.put(0x6300, "__LoadTemplate()", "template '" + template + "' is not exists.", E_NOTICE);
				return "";
			}
			var tempStr = IO.file.readAllText(F.mappath(path), G.MO_CHARSET),
				masterexp = new RegExp("^<extend file\\=\\\"(.+?)(\\." + G.MO_TEMPLATE_PERX + ")?\\\" />", "i"),
				includeexp = new RegExp("<include file\\=\\\"(.+?)(\\." + G.MO_TEMPLATE_PERX + ")?\\\" />", "igm");

			var match = masterexp.exec(tempStr), master, callback;
			if(match){
				templatelist2 = _RightCopy(templatelist, match[1].split(":"));
				master = __LoadTemplate(templatelist2.join(":"));
				callback = function($0,$1,$2,$3,$4){
					var reg = new RegExp("<selection name\\=(\"|')" + $2 + "\\1>([\\s\\S]*?)<\\/selection>","igm");
					var m = reg.exec(tempStr);
					if(m){
						master = F.replace(master,$0,m[0].replace("<super />",$4||""));
						//master = F.replace(master,"<super />",$4||"");
					}
				};
				F.string.matches(master, /<selection name\=("|')(\w+)\1(\s*)\/>/ig, callback);
				F.string.matches(master, /<selection name\=("|')(\w+)\1(\s*)>([\s\S]*?)<\/selection>/ig, callback);
				tempStr = master.replace(match[0], "");
			}
			F.string.matches(tempStr, includeexp, function($0, $1) {
				templatelist2 = _RightCopy(templatelist, $1.split(":"));
				tempStr = F.replace(tempStr, $0, __LoadTemplate(templatelist2.join(":")));
			});
			return tempStr;
		};

		var _ParseTemplatePath = function(template) {
			var templatelist, vpath;
			templatelist = template.split(":");
			if (templatelist.length == 1) {
				vpath = G.MO_TEMPLATE_NAME + "/" + M.Method + G.MO_TEMPLATE_SPLIT + template;
			} else if (templatelist.length == 2) {
				vpath = G.MO_TEMPLATE_NAME + "/" + template.replace(":", G.MO_TEMPLATE_SPLIT);
			} else if (templatelist.length == 3) {
				vpath = templatelist[0] + "/" + templatelist[1] + G.MO_TEMPLATE_SPLIT + templatelist[2];
			}
			return vpath;
		};
		var _exit = function(msg) {
			res.Write(msg);
			res.End();
		};
		var _wapper = function(content) {
			return new Function(content);
		};
		var _wappermodule = function(content) {
			var module = {exports:{}};
			(new Function("exports", "module", content))(module.exports, module);
			return module.exports;
		};
		var _wapperfile = function(path) {
			return (new Function("__filename", "__dirname", IO.file.readAllScript(path)))(
				path,
				IO.parent(path)
			);
		};
		var _LoadController = function(path, controller) {
			var ccname = G.MO_APP_NAME + "@" + controller,
				name = controller + "Controller";
			if (_LoadController._controllers.hasOwnProperty(ccname)) return _LoadController._controllers[ccname];
			try {
				path = F.mappath(path);
				var ret = IO.file.readAllScript(path, G.MO_CHARSET);
				if (G.MO_DEBUG) {
					ret = ReCompileForDebug(ret);
				}
				ret = "var " + name + ";\r\n" + ret + "\r\n return " + name + ";";
				var _controller = (new Function("__filename", "__dirname", "M", "C", "L", "__scripts", ret))(
					path,
					path == "" ? "" : path.substr(0, path.lastIndexOf("\\")),
					Model__, M.C, M.L, G.MO_DEBUG ? ret : ""
				);
				if(_controller) return _controller && (_LoadController._controllers[ccname] = _controller);
				ExceptionManager.put(0x8300, "_LoadController()", "can not load controller '" + controller + "', please ensure that if you have defined it.");
			} catch (ex) {
				ExceptionManager.put(ex.number, "_LoadController()", "can not load controller '" + controller + "', error: " + ex.description);
			}
			return false;
		};
		_LoadController._controllers = {};

		var _LoadAssets = function(name) {
			var ccname = G.MO_APP_NAME + "@" + name;
			if (_LoadAssets.assets.hasOwnProperty(ccname)) return new _LoadAssets.assets[ccname]();
			var path = F.mappath(G.MO_APP + "Library/Assets/" + name + ".asp");
			if (!IO.file.exists(path)) path = F.mappath(G.MO_CORE + "Library/Assets/" + name + ".asp");
			if (!IO.file.exists(path)) return false;

			var ret = IO.file.readAllScript(path, G.MO_CHARSET);
			ret = "var " + name + ";\r\n" + ret + "\r\n return " + name + ";";
			try {
				var _asset = (new Function("__filename", "__dirname", "M", "C", "L", ret))(
					path,
					path == "" ? "" : path.substr(0, path.lastIndexOf("\\")),
					Model__, M.C, M.L
				);
				return _asset && (new(_LoadAssets.assets[ccname] = _asset)());
				ExceptionManager.put(0x8300, "_LoadAssets()", "can not load asset '" + name + "', please ensure that if you have defined it.");
			} catch (ex) {
				ExceptionManager.put(ex.number, "_LoadAssets()", "can not load asset '" + name + "', error: " + ex.description);
			}
			return false;
		};
		_LoadAssets.assets = {};

		var _LoadConfig = function(name, type) {
			type = type || "Conf";
			var ccname = type + name + "@" + G.MO_APP_NAME;
			if (_LoadConfig.configs.hasOwnProperty(ccname)) return _LoadConfig.configs[ccname];
			var filepath = F.mappath(G.MO_APP + type + "/" + name + ".asp");
			if (!IO.file.exists(filepath)) filepath = F.mappath(G.MO_CORE + type + "/" + name + ".asp");
			if (!IO.file.exists(filepath)) return null;
			var cfg = null;
			if (cfg = _wapperfile(filepath)) {
				_LoadConfig.configs[ccname] = cfg;
				return cfg;
			}
			return null;
		};
		_LoadConfig.configs = {};
		
		/*
		from "https://github.com/component/path-to-regexp"
		thanks!
		*/
		var _pathtoRegexp = function(path, keys, options) {
			options = options || {};
			var sensitive = options.sensitive;
			var strict = options.strict;
			var end = options.end !== false;
			keys = keys || [];

			if (path instanceof RegExp) return path;
			if (path instanceof Array) path = '(' + path.join('|') + ')';

			path = path
			.concat(strict ? '' : '/?')
			.replace(/\/\(/g, '/(?:')
			.replace(/([\/\.])/g, '\\$1')
			.replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, function (match, slash, format, key, capture, star, optional) {
			  slash = slash || '';
			  format = format || '';
			  capture = capture || '([^/' + format + ']+?)';
			  optional = optional || '';

			  keys.push({ name: key, optional: !!optional });

			  return ''
			    + (optional ? '' : slash)
			    + '(?:'
			    + format + (optional ? slash : '') + capture
			    + (star ? '((?:[\\/' + format + '].+?)?)' : '')
			    + ')'
			    + optional;
			})
			.replace(/\*/g, '(.*)');

			return new RegExp('^' + path + (end ? '$' : '(?=\/|$)'), sensitive ? '' : 'i');
		};
		var _start = function() {
			if (G.MO_PRE_LIB != "") {
				var libs = G.MO_PRE_LIB.split(","), _len = libs.length;
				for (var i = 0; i < _len; i++) {
					var asset = _LoadAssets(libs[i]);
					if (asset) {
						asset.Index();
						asset.__destruct();
					}
				}
			}
		};

		var _end = function() {
			if (G.MO_END_LIB != "") {
				var libs = G.MO_END_LIB.split(","), _len = libs.length;
				for (var i = 0; i < _len; i++) {
					var asset = _LoadAssets(libs[i]);
					if (asset) {
						asset.Index();
						asset.__destruct();
					}
				}
			}
		};

		var _runtime = {
			start: 0,
			run: function() {
				_runtime.start = new Date();
				return _runtime.start;
			},
			ticks: function(tag) {
				return (new Date()) - (tag || _runtime.start);
			},
			line: 0,
			debugLine: 0,
			scripts: "",
			file: "",
			log: function(line, file, lineNumber, scripts) {
				_runtime.line = line;
				_runtime.file = file;
				_runtime.debugLine = lineNumber;
				if (scripts) _runtime.scripts = scripts;
			},
			timelines: {
				initialize : 0,
				route : 0,
				run : 0,
				load : 0,
				compile : 0,
				run1 : 0,
				recompile : 0,
				terminate : 0
			}
		};

		var _debug = function() {
			if (G.MO_DEBUG) {
				ExceptionManager.put(0, "MO", "debug mode is enabled, please set 'MO_DEBUG' as false in production env, and set 'MO_ERROR_REPORTING' to show useful information.", E_WARNING);
			}
			if (!G.MO_COMPILE_CACHE) {
				ExceptionManager.put(0, "MO", "compile cache is not enabled, you should enable it in production env(set 'MO_COMPILE_CACHE' as true).", E_WARNING);
			}
			ExceptionManager.put(
				0, "MO",
				F.format(
					"System: {7}MS > Initialize: {0}MS; Route: {1}MS; Controller: {2}MS (Load: {3}MS, Compile: {4}MS, DebugCompile: {5}MS, Execute: {6}MS); Terminate: {8}MS.",
					_runtime.timelines.initialize,
					_runtime.timelines.route,
					_runtime.timelines.run,
					_runtime.timelines.load,
					_runtime.timelines.compile,
					_runtime.timelines.recompile,
					_runtime.timelines.run1,
					_runtime.timelines.initialize + _runtime.timelines.route + _runtime.timelines.run + _runtime.timelines.terminate,
					_runtime.timelines.terminate
				), E_INFO
			);
			if (Model__ && Model__.debug) Model__.debug();
			if(G.MO_DEBUG2FILE || G.MO_DEBUG_MODE == "FILE"){
				if(G.MO_DEBUG_FILE){
					ExceptionManager.debug2file(G.MO_DEBUG_FILE);
				}
			}else if(G.MO_DEBUG_MODE == "SESSION"){
				ExceptionManager.debug2session();
			}else{
				if(String(Request.ServerVariables("HTTP_X_REQUESTED_WITH")).toLowerCase()=="xmlhttprequest"){
					if(E_ERROR & ExceptionManager.errorReporting()) ExceptionManager.errorReporting(E_ERROR);
					else ExceptionManager.errorReporting(E_NONE);
				}
				Response.Write(ExceptionManager.debug());
			}
		};
		var _getfunctionParms = function(fn) {
			var _parms = fn.toString().replace(/^function(.*?)\((.*?)\)([\s\S]+)$/, "$2").replace(/\s/igm, "").split(","), _len = _parms.length;
			for (var i = 0; i < _len; i++) {
				_parms[i] = F.get(_parms[i]);
			}
			return _parms;
		};
		var _catchException = function(ex){
			var _exception = new Exception(ex.number, M.RealMethod + "." + M.RealAction, ex.description);
			if (_runtime.line > 0) {
				_exception.lineNumber = _runtime.line;
				_exception.filename = _runtime.file.replace(F.mappath("/"), "").replace(/\\/ig, "\/");
				if (_runtime.debugLine > 0 && _runtime.scripts != "") {
					_exception.traceCode = _runtime.scripts.split("\n")[_runtime.debugLine];
				}
			}
			ExceptionManager.put(_exception);			
		}
		
		var _InitializePath = function(cfg) {
			var url_ = String(req.ServerVariables("URL"));
			if (cfg.MO_APP_NAME == "") _exit("please define application name, config-item 'MO_APP_NAME'.")
			if (cfg.MO_ROOT == "") cfg.MO_ROOT = url_.substr(0, url_.lastIndexOf("/") + 1);
			if (cfg.MO_APP == "") cfg.MO_APP = cfg.MO_ROOT + cfg.MO_APP_NAME + "/";
			if (cfg.MO_CORE == "") cfg.MO_CORE = cfg.MO_ROOT + "Mo/";
			if (cfg.MO_APP.slice(-1) != "/") cfg.MO_APP = cfg.MO_APP + "/";
			if (cfg.MO_CORE.slice(-1) != "/") cfg.MO_CORE = cfg.MO_CORE + "/";
			if (!IO.directory.exists(cfg.MO_CORE)) _exit("core directory '" + cfg.MO_CORE + "' is not exists.");
			if (cfg.MO_APP_ENTRY == "") {
				cfg.MO_APP_ENTRY = url_.substr(url_.lastIndexOf("/") + 1);
				if (cfg.MO_APP_ENTRY.toLowerCase() == "default.asp") cfg.MO_APP_ENTRY = "";
			}
		}

		var M = function(opt) {
				if ( typeof opt == "string") return opt ? _Assigns[opt] : _Assigns ;
				opt = _extend({}, defaultConfig);
				var _tag = _runtime.run();
				if (!M.Initialize(opt)) {
					M.Terminate();
					return;
				}
				_runtime.timelines.initialize = _runtime.ticks(_tag);

				_tag = _runtime.run();
				if (G.MO_ROUTE_MODE) M.Route();
				_runtime.timelines.route = _runtime.ticks(_tag);

				if(!G.MO_PLUGIN_MODE){
					_tag = _runtime.run();
					M.Run();
					_runtime.timelines.run = _runtime.ticks(_tag);
					M.Terminate();
				}
			},
			G = {};
		M.Runtime = _runtime;
		M.Version = "MoAspEnginer 3.1";
		M.Config = {};
		M.IsRewrite = false;
		M.Action = "";
		M.Method = "";
		M.Group = "";
		M.RealAction = "";
		M.RealMethod = "";
		M.Status = "";
		M.Buffer = false;
		M.LoadAssets = _LoadAssets;
		M.IsPost = String(Request.ServerVariables("REQUEST_METHOD")) == "POST" || String(Request.ServerVariables("CONTENT_TYPE")) != "";
		M.Debug = function() {
			_runtime.log.apply(null, arguments)
		};
		M.addEventListener = function(name, callback){
			if(!__events__.hasOwnProperty(name)) __events__[name] = [];
			var event = __events__[name];
			callback.GUID = event.length;
			event.push(callback);
		};
		M.removeEventListener = function(name, callback){
			if(!__events__.hasOwnProperty(name)) return;
			var event = __events__[name];
			for(var i=0;i<event.length;i++){
				if(event[i].GUID == callback.GUID) event[i]=null;
			}
		};
		M.Initialize = function(cfg) {
			if (!cfg || typeof cfg != "object") cfg = {
				MO_AUTO_CREATE_APP: false
			}
			cfg = _extend({
				MO_APP_NAME: "App",
				MO_APP: "App",
				MO_APP_ENTRY: "",
				MO_ROOT: "",
				MO_CORE: "Mo",
				MO_HOST: String(req.ServerVariables("HTTP_HOST")),
				MO_PROTOCOL: String(req.ServerVariables("HTTPS")) == "off" ? "http://" : "https://"
			}, cfg);
			res.Charset = "utf-8";
			M.Config.Global = cfg;
			M.Status = "200 OK";
			var _tag = _runtime.run();
			_InitializePath(cfg);
			
			/*load global config*/
			if (IO.file.exists(cfg.MO_CORE + "Conf/Config.asp")) G = M.Config.Global = _wapper(IO.file.readAllScript(cfg.MO_CORE + "Conf/Config.asp"))();
			_extend(G, cfg);
			
			/*load 'Common' modules*/
			IO.directory.files(G.MO_CORE + "Common", function(file) {
				if(file.name.slice(-4) == ".asp") _wapperfile(file.path);
			});

			/*load require module*/
			require = _wappermodule(IO.file.readAllText(cfg.MO_CORE + "Library/Extend/lib/require.js"));
			require.module._pathes = [c(G.MO_APP + "Library/Extend"), c(G.MO_CORE + "Library/Extend")];

			/*load fns module*/
			F = require("lib/fns.js");
			if(!F){
				ExceptionManager.put(0x213df, "F", "can not load module 'fns', system will be shut down.", E_ERROR);
				return;
			}
			
			/*load IO module*/
			IO = require("lib/io.js");
			if(!IO){
				ExceptionManager.put(0x213df, "IO", "can not load module 'IO', system will be shut down.", E_ERROR);
				return;
			}
			
			/*auto-create*/
			if (G.MO_AUTO_CREATE_APP !== false && !IO.directory.exists(G.MO_APP)) {
				F.foreach([
					"", "Controllers", "Cache/Compiled", "Cache/Model", "Views", "Conf", "Lang",
					"Library/Extend", "Library/Assets", "Common"
				], function(i, v) {
					IO.directory.create(G.MO_APP + v);
				});
			}

			/*load application config*/
			require(c(G.MO_APP + "Conf/Config.asp"), true, function(){
				if(this.hasOwnProperty("MO_LIB_CNAMES")){
					if(this.MO_LIB_CNAMES) _extend(G.MO_LIB_CNAMES, this.MO_LIB_CNAMES);
					delete this.MO_LIB_CNAMES;
				}
				for(var k in cfg){
					delete this[k];
				}
				_extend(G, this);
			});

			if (!G.MO_METHOD_CHAR) G.MO_METHOD_CHAR = "m";
			if (!G.MO_ACTION_CHAR) G.MO_ACTION_CHAR = "a";
			if (!G.MO_GROUP_CHAR) G.MO_GROUP_CHAR = "g";
			
			ExceptionManager.errorReporting(G.MO_ERROR_REPORTING);
			
			if (G.MO_CHARSET != "utf-8") res.Charset = G.MO_CHARSET;
			if (IO.file.exists(G.MO_APP + "Common/Function.asp")) _wapperfile(G.MO_APP + "Common/Function.asp");
			if (G.MO_IMPORT_COMMON_FILES != "") {
				var files = G.MO_IMPORT_COMMON_FILES.split(";"), _len = files.length;
				if (_len <= 0) return;
				for (var i = 0; i < _len; i++) {
					if (!files[i]) continue;
					_wapperfile(G.MO_APP + "Common/" + files[i] + ".asp");
				}
			}
			_start();
			M.assign("VERSION", M.Version);
			return true;
		};
		M.Terminate = function() {
			var _tag = _runtime.run();
			_end();
			var events = __events__["ondispose"], _len, event;
			if(events){
				_len = events.length;
				for(var i=0;i<_len;i++){
					event = events[i];
					if(event) event.call(M);
				}
			}
			_runtime.timelines.terminate = _runtime.ticks(_tag);
			_debug();
			_Assigns = null;
			this.Config = null;
			_Language = null;
		};
		function _parseRouteTo(url){
			var mat = /^(.+?)(\?(.+))?$/.exec(url);
			if(mat){
				var gma = _RightCopy(["", "", ""], mat[1].split("/"));
				F.get(G.MO_GROUP_CHAR, gma[0]);
				F.get(G.MO_METHOD_CHAR, gma[1]);
				F.get(G.MO_ACTION_CHAR, gma[2]);
				F.get.fromURIString(mat[3]);
			}
		}
		M.Route = function() {
			var qs = req.QueryString + "", uri = "";
			var mat = /^404\;http(s)?\:\/\/(.+?)\/(.*?)$/i.exec(qs);
			if (mat != null){
				G.MO_ROUTE_MODE = "404";
				M.IsRewrite = true;
				uri = "/" + mat[3];
			}
			if (G.MO_ROUTE_MODE == "404") {
				if (F.server("HTTP_X_REWRITE_URL") != "") uri = F.server("HTTP_X_REWRITE_URL");
			} else if (G.MO_ROUTE_MODE == "URL") {
				uri = qs;
				M.IsRewrite = true;
				if (uri == "") return;
			} else {
				return;
			}
			if (G.MO_ROOT != "/" && uri.substr(0, G.MO_ROOT.length) == G.MO_ROOT) uri = uri.substr(G.MO_ROOT.length - 1);
			if(G.MO_ROUTE_URL_EXT) {
				uri = uri.replace(new RegExp("\\." + G.MO_ROUTE_URL_EXT + "$","i"), "");
				if(uri.slice(0,1)=="/") uri = uri.substr(1);
				if(uri.slice(-1)=="/") uri = uri.substr(0,uri.length-1);
			}
			if(!uri) return;
			var Maps = G.MO_ROUTE_MAPS;
			if (Maps && Maps.hasOwnProperty(uri)){
				_parseRouteTo(Maps[uri]);
				return;
			}
			var reqmethod = F.server("REQUEST_METHOD"), reston = G.MO_ROUTE_REST_ENABLED, RouteTo="";
			var Rules = G.MO_ROUTE_RULES, _len = Rules.length;
			for (var i = 0; i < _len; i++) {
				var rule = Rules[i], lookfor = rule.LookFor;
				if(!rule.Method) rule.Method = "GET";
				if(typeof lookfor == "string") lookfor = _pathtoRegexp(lookfor, null, {strict:true});
				if (lookfor.test(uri) && (!reston || reqmethod==rule.Method)) {
					RouteTo = uri.replace(lookfor, rule.SendTo);
					break;
				}
			}
			if(RouteTo) _parseRouteTo(RouteTo);
		};
		M.display = function(template, extcachestr) {
			res.Status = this.Status;
			res.AddHeader("Content-Type", "text/html; charset=" + G.MO_CHARSET);
			M.fetch(template, extcachestr);
		};
		M.fetch = function(template, extcachestr) {
			M.Buffer = !(arguments.callee.caller == M.display);
			if(!G.MO_TEMPLATE_ENGINE){
				ExceptionManager.put(0x12edf, "Mo.fetch()", "please define any template engine.");
				return "";
			}
			var _tag = _runtime.run();
			if (!template || template == "") template = M.Action;
			var html, cachename, OldHash, usecache = false,
				scripts, cachepath = "";
			if (G.MO_COMPILE_CACHE) {
				cachename = M.Method + "^" + M.Action + "^" + F.string.replace(template, /\:/igm, "^");
				if (extcachestr) cachename += "^" + extcachestr;
				cachepath = F.mappath(G.MO_APP + "Cache/Compiled/" + cachename + ".asp");
				if (IO.file.exists(cachepath)) {
					usecache = true;
					if (G.MO_COMPILE_CACHE_EXPIRED > 0) {
						OldHash = F.fso.GetFile(cachepath).DateLastModified;
						if (F.date.datediff("s", OldHash, new Date()) >= G.MO_COMPILE_CACHE_EXPIRED) usecache = false;
					}
					if (usecache) {
						scripts = IO.file.readAllScript(cachepath, G.MO_CHARSET);
					}
				}
			}
			if (!usecache) {
				html = _LoadTemplate(template);
				if (html == "") return "";
				if (!View) View = require(G.MO_TEMPLATE_ENGINE);
				if (!View) {
					ExceptionManager.put(0x12edf, "Mo.fetch()", "can not load template engine.");
					return "";
				}
				scripts = View.compile(html);
				if (G.MO_COMPILE_CACHE) IO.file.writeAllText(cachepath, "\u003cscript language=\"jscript\" runat=\"server\"\u003e\r\n" + scripts + "\r\n\u003c/script\u003e", G.MO_CHARSET);
			}
			_runtime.timelines.compile = _runtime.ticks(_tag);
			if (G.MO_DEBUG) {
				_tag = _runtime.run();
				scripts = ReCompileForDebug(scripts, -1);
				_runtime.timelines.recompile = _runtime.ticks(_tag);
			}
			_tag = _runtime.run();
			var wapper, content;
			try {
				wapper = new Function("$", "__filename", "__scripts", "__buffer", "__buffersize", scripts);
			} catch (ex) {
				ExceptionManager.put(ex.number, "Mo.fetch()", "find error when pack compiled template code: " + ex.description, E_ERROR);
				return;
			}
			var filename = cachepath;
			if (G.MO_DEBUG) filename += ";compiled by [" + _ParseTemplatePath(template) + "." + G.MO_TEMPLATE_PERX + "], please check if there are syntax error in template or use variable(s) that not be defined."
			content = wapper(_Assigns, filename, G.MO_DEBUG ? scripts : "", M.Buffer, 1024);
			if (G.MO_CACHE && G.MO_CACHE_DIR != "" && IO.directory.exists(G.MO_CACHE_DIR)) IO.file.writeAllText(F.mappath(G.MO_CACHE_DIR + _CacheFileName + ".cache"), content, G.MO_CHARSET);
			_runtime.timelines.run1 = _runtime.ticks(_tag);
			return content;
		};
		M.U = function(path, _parms, ext) {
			var match = /^(.*?)(\?(.*?))?(\#(.*?))?(\@(.*?))?(\!)?$/igm.exec(path||"");
			if (!match) return "";
			F.object.toURIString.fn = 0;
			var path = match[1],
				parms = F.object.fromURIString(match[3]),
				anchor = match[5],
				domain = match[7],
				paths = path.split("/"),
				url = G.MO_PROTOCOL + (domain || G.MO_HOST) + G.MO_ROOT + G.MO_APP_ENTRY;
			if (_parms) {
				if (typeof _parms == "string") parms = F.object.fromURIString(_parms);
				else if (typeof _parms == "object") parms = _parms;
			}
			if (match[8] == "!") url = G.MO_ROOT + G.MO_APP_ENTRY;
			var format = ["?{0}={1}&{2}={3}&{4}={5}", "?{0}={1}&{2}={3}"];
			if (G.MO_ROUTE_MODE == "404") format = ["{1}/{3}/{5}", "{1}/{3}"];
			else if (G.MO_ROUTE_MODE == "URL") format = ["?/{1}/{3}/{5}", "?/{1}/{3}"];
			if (paths.length == 3) url += F.format(format[0], G.MO_GROUP_CHAR, paths[0], G.MO_METHOD_CHAR, paths[1], G.MO_ACTION_CHAR, paths[2]);
			else if (paths.length == 2) url += F.format(format[1], G.MO_METHOD_CHAR, paths[0], G.MO_ACTION_CHAR, paths[1]);
			else if (paths.length == 1 && path != "") url += F.format(format[1], G.MO_METHOD_CHAR, M.Method, G.MO_ACTION_CHAR, paths[0]);
			else url += F.format(format[1], G.MO_METHOD_CHAR, M.Method, G.MO_ACTION_CHAR, M.Action);
			if (G.MO_ROUTE_MODE == "404" || G.MO_ROUTE_MODE == "URL") {
				F.object.toURIString.split_char_1 = F.object.toURIString.split_char_2 = "/";
				url += "/" + F.object.toURIString(parms);
				F.object.toURIString.split_char_1 = "=";
				F.object.toURIString.split_char_2 = "&";
				if (ext) url += "." + ext;
			} else {
				url += "&" + F.object.toURIString(parms);
			}
			if (F.string.endsWith(url, "/") || F.string.endsWith(url, "&")) url = url.substr(0, url.length - 1);
			if (anchor != "") url += "#" + anchor;
			F.object.toURIString.fn = 1;
			return url;
		};
		M.L = function(key) {
			if (!G.MO_LANGUAGE) {
				ExceptionManager.put(5, "Mo.L(key)", "please define language package.", E_WARNING);
				return "";
			}
			var lib = G.MO_LANGUAGE;
			if (key.indexOf(".") > 0) {
				lib = key.substr(0, key.indexOf("."));
				key = key.substr(key.indexOf(".") + 1);
			}
			var cfg = null;
			if (cfg = _LoadConfig(lib, "Lang")) {
				return cfg[key];
			} else {
				ExceptionManager.put(3, "Mo.L(key)", "can not load language package '" + lib + "'.", E_ERROR);
			}
		};
		M.C = function(conf, value) {
			var key = "";
			if (conf.indexOf(".") > 0) {
				key = conf.substr(conf.indexOf(".") + 1);
				conf = conf.substr(0, conf.indexOf("."));
				if (conf == "@") conf = "Global";
			}
			if (M.Config.hasOwnProperty(conf)) {
				if (key != "" && value !== undefined) M.Config[conf][key] = value;
				return (key == "" ? M.Config[conf] : M.Config[conf][key]);
			}
			var cfg = null;
			if (cfg = _LoadConfig(conf)) {
				M.Config[conf] = cfg;
				if (key != "" && value !== undefined) M.Config[conf][key] = value;
				return (key == "" ? M.Config[conf] : M.Config[conf][key]);
			} else {
				ExceptionManager.put(3, "Mo.C(conf,value)", "can not load config '" + conf + "'.");
			}
		};
		M.C.SaveAs = function(conf, data) {
			if (!data) return;
			var filepath = F.mappath(G.MO_APP + "Conf/" + conf + ".asp");
			IO.file.writeAllText(filepath, "\u003cscript language=\"jscript\" runat=\"server\"\u003e\r\nreturn " + JSON.stringify(data) + ";\r\n\u003c/script\u003e", "utf-8");
		};
		M.C.Exists = function(conf) {
			return IO.file.exists(G.MO_APP + "Conf/" + conf + ".asp");
		};
		M.A = function(ctrl) {
			var filepath = F.mappath(G.MO_APP + "Controllers/" + ctrl + "Controller.asp");
			if (!IO.file.exists(filepath)) filepath = F.mappath(G.MO_CORE + "Controllers/" + ctrl + "Controller.asp");
			if (IO.file.exists(filepath)) {
				var _controller;
				if (G.MO_CONTROLLER_CNAMES && G.MO_CONTROLLER_CNAMES.hasOwnProperty(ctrl.toLowerCase())) ctrl = G.MO_CONTROLLER_CNAMES[ctrl.toLowerCase()];
				if (_controller = _LoadController(filepath, ctrl)) {
					return new _controller();
				} else {
					ExceptionManager.put(5, "Mo.A(ctrl)", "can not load controller '" + ctrl + "'.");
				}
			} else {
				ExceptionManager.put(6, "Mo.A(ctrl)", "can not load controller '" + ctrl + "',please ensure you have define it.");
			}
		};
		M.Run = function() {
			var _tag = _runtime.run();
			this.Method = F.get(G.MO_METHOD_CHAR);
			this.Action = F.get(G.MO_ACTION_CHAR);
			this.Group = F.get(G.MO_GROUP_CHAR);
			if (!/^(\w+)$/i.test(this.Action)) this.Action = "Index";
			if (!/^(\w+)$/i.test(this.Method)) this.Method = "Home";
			if (!/^(\w+)$/i.test(this.Group)) this.Group = "";
			if (this.Group != "") this.Group += "/";
			if (G.MO_CONTROLLER_CNAMES && G.MO_CONTROLLER_CNAMES.hasOwnProperty(this.Method.toLowerCase())) this.Method = G.MO_CONTROLLER_CNAMES[this.Method.toLowerCase()];
			if (G.MO_CACHE) {
				_CacheFileName = MD5(F.server("URL") + F.get.toURIString() + "");
				if (IO.file.exists(G.MO_CACHE_DIR + _CacheFileName + ".cache")) {
					res.Write(IO.file.readAllText(F.mappath(G.MO_CACHE_DIR + _CacheFileName + ".cache"), G.MO_CHARSET));
					return;
				}
			}
			var ModelPath = G.MO_APP + "Controllers/" + this.Group + this.Method + "Controller.asp",
				can_LoadController = true;
			this.RealMethod = this.Method;
			this.RealAction = this.Action;
			if (!IO.file.exists(ModelPath)) {
				ModelPath = G.MO_APP + "Controllers/" + this.Group + "EmptyController.asp";
				this.RealMethod = "Empty";
				if (!IO.file.exists(ModelPath)) {
					ModelPath = G.MO_CORE + "Controllers/" + this.Group + this.Method + "Controller.asp";
					this.RealMethod = this.Method;
					if (!IO.file.exists(ModelPath)) {
						ModelPath = G.MO_CORE + "Controllers/" + this.Group + "EmptyController.asp";
						this.RealMethod = "Empty";
						if (!IO.file.exists(ModelPath)) {
							if (M.templateIsInApp(this.Action) || M.templateIsInCore(this.Action)) {
								M.display(this.Action);
								can_LoadController = false;
							} else {
								ExceptionManager.put(0x2dfc, this.RealMethod + "." + this.RealAction, "controller '" + this.Method + "' is not exists.");
								return;
							}
						}
					}
				}
			}
			var _controller;
			if (!(can_LoadController && (_controller = _LoadController(ModelPath, this.RealMethod)))) return;
			if (_controller["__PRIVATE__"] === true) {
				ExceptionManager.put(0x2dfc, this.RealMethod + "." + this.RealAction, "controller '" + this.Method + "' is not exists.");
				return;
			}
			_runtime.timelines.load = _runtime.ticks(_tag);
			var MC = null;
			try{
				MC = new _controller(this.Action);
			}catch(ex){
				_catchException({number:0x3a9,description:"controller '" + this.Method + "' initialize failed: " + ex.description + "."});
				return;
			}
			if (MC.__STATUS__ === true) {
				var action_ = this.Action;
				if (G.MO_ACTION_CASE_SENSITIVITY === false) action_ = action_.toLowerCase();
				var fn = null,
					args = [],
					self = MC;

				if (F.server("REQUEST_METHOD") == "POST" && MC[action_ + "_Post_"] && MC[action_ + "_Post_"]["__PRIVATE__"] !== true) {
					fn = MC[action_ + "_Post_"];

				} else if (MC[action_] && MC[action_]["__PRIVATE__"] !== true) {
					fn = MC[action_];

				} else if (G.MO_AUTO_DISPLAY && (M.templateIsInApp(this.Action) || M.templateIsInCore(this.Action))) {
					self = M;
					fn = M.display;
					args = [this.Action];

				} else {
					if (MC["empty"] && MC["empty"]["__PRIVATE__"] !== true) {
						M.RealAction = "empty";
						fn = MC["empty"];
						args = [this.Action];
					} else {
						ExceptionManager.put(0x3a8, this.RealMethod + "." + this.RealAction, "please define '" + this.Action + "' or 'empty' method.");
					}
				}
				if (G.MO_PARSEACTIONPARMS === true) args = _getfunctionParms(fn);
				try {
					fn && fn.apply(self, args);
				} catch (ex) {
					_catchException(ex);
				}
			}
			MC.__destruct();
			MC = null;
		};
		M.ModelCacheExists = function(name) {
			if (name == "") return false;
			return F.exists(G.MO_APP + "Cache/Model/" + name + ".cak");
		};
		M.ModelCacheSave = function(name, content) {
			if (name == "") return false;
			return IO.file.writeAllText(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"), content, G.MO_CHARSET);
		};
		M.ModelCacheLoad = function(name) {
			if (name == "") return "";
			return IO.file.readAllText(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"), G.MO_CHARSET);
		};
		M.ModelCacheDelete = function(name) {
			if (name == "") return false;
			return IO.file.del(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"));
		};
		M.ModelCacheClear = function() {
			return IO.directory.clear(F.mappath(G.MO_APP + "Cache/Model"), function(f, isfile) {
				if (isfile && f.name == ".mae") return false;
			});
		};
		M.ClearCompiledCache = function() {
			return IO.directory.clear(F.mappath(G.MO_APP + "Cache/Compiled"), function(f, isfile) {
				if (isfile && f.name == ".mae") return false;
			});
		}
		M.templateIsInApp = function(template) {
			var vpath = _ParseTemplatePath(template),
				path;
			path = G.MO_APP + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
			if (vpath.indexOf("@") > 0) path = G.MO_ROOT + vpath.substr(vpath.indexOf("@") + 1) + "/Views/" + vpath.substr(0, vpath.indexOf("@")) + "." + G.MO_TEMPLATE_PERX;
			return IO.file.exists(path);
		};
		M.templateIsInCore = function(template) {
			var vpath, path;
			vpath = _ParseTemplatePath(template);
			path = G.MO_CORE + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
			return IO.file.exists(path);
		};
		M.assign = function(key, value) {
			if (!/^(\w+)$/ig.test(key)) return ExceptionManager.put(0x2e4c, "Mo.assign", "Parameter 'key' is invalid.");
			_Assigns[key] = value;
		};
		return M;
	})();
(function(){
	/*delay load*/
	var loaddelay = {
		"base64" : ["e", "d", "encode", "decode", "toBinary", "fromBinary", "base64"], /*base64*/
		"JSON" : ["parse", "stringify", "create", "decodeStrict", "encodeUnicode", "assets/json.js"],/*JSON*/
		"IController" : ["create", "IController@lib/dist.js"], /*controller*/
		"IClass" : ["create", "IClass@lib/dist.js"],/*class*/
		"dump" : [null, "dump"],/*dump variables*/
		"cookie=Cookie" : [null, "assets/cookie.js"],/*cookie*/
		"Model__" : [null, "cmd", "useCommand", "Debug", "setDefault", "setDefaultPK", "begin", "commit", "rollback", "getConnection", "dispose", "connect", "execute", "executeQuery", "Model__@lib/model.js"], /*database*/
		"DataTable" : [null, "Model__.helper.DataTable@lib/model.js"],
		"DataTableRow" : [null, "Model__.helper.DataTableRow@lib/model.js"],
		"VBS" : ["ns","include","eval","require","getref","execute","run","assets/vbs.js"], /*vbs*/
		"Mpi" : ["downloadAndInstall", "Host", "setDefaultInstallDirectory", "download", "fetchPackagesList", "fetchPackage", "packageExists", "install", "assets/mpi.js"], /*Mpi*/
		"Tar" : [null, "setNames", "packFolder", "packFile", "unpack", "assets/tar.js"],
		"md5=MD5" : [null, "md5@assets/md5.js"],
		"md5_bytes=MD5Bytes" : [null, "md5_bytes@assets/md5.js"],
		"Html" : ["ActionLink", "Form", "FormUpload", "FormEnd", "CheckBox", "DropDownList", "ListBox", "Hidden", "Password", "RadioButton", "TextArea", "TextBox", "assets/htmlhelper.js"],
		"Utf8" : ["getWordArray", "getByteArray", "bytesToWords", "toString", "getString", "utf8@encoding"],
		"GBK" : ["getWordArray", "getByteArray", "bytesToWords", "toString", "getString", "gbk@encoding"],
		"Unicode" : ["getWordArray", "getByteArray", "bytesToWords", "toString", "getString", "unicode@encoding"],
		"Hex" : ["parse", "stringify", "hex@encoding"],
		"Encoding" : ["encodeURIComponent", "encodeURI", "decodeURI", "encoding"]
	};
	for(var lib in loaddelay){
		if(!loaddelay.hasOwnProperty(lib)) continue;
		var library = loaddelay[lib], module = library.pop(), index = module.indexOf("@"), exports="", cname="", index2 = lib.indexOf("=");
		if(index>0){
			exports = "." + module.substr(0,index);
			module = module.substr(index+1);
		}
		(new Function(lib + " = {};" ))();
		if(index2>0) {
			cname = lib.substr(index2+1);
			lib = lib.substr(0, index2);
		}
		var _len = library.length;
		for(var i=0;i<_len;i++){
			var method = "." + library[i];
			if(library[i]==null) method="";
			var body = lib + method + " = function(){" + lib + " = require(\"" + module + "\")" + exports + "; return " + lib + method + ".apply(" + lib + ",arguments)};";
			(new Function(body))();
		}
		if(cname) (new Function(cname + " = " + lib + ";"))();
	}
})();
var Encapsulate = Function.Create = function(len){
	var args=[];for(var i=0;i<len;i++) args.push("arg" + i);
	var _args = args.join(",");
	return new Function(_args,"return new this(" + _args + ");");
};
var E_NONE = 0,
	E_ERROR = 1,
	E_NOTICE = 2,
	E_WARNING = 4,
	E_INFO = 8,
	E_MODEL = 16,
	E_ALL = E_ERROR | E_NOTICE | E_WARNING | E_INFO | E_MODEL;
var MEM = ExceptionManager = (function() {
	var b = {};
	var c = [],
		d = E_ALL,
		j = {
			1 : "red",
			2 : "orange",
			4 : "blue",
			8 : "green",
			16 : "green"
		};
	var a = function(e) {
		var f = "0000000" + e.toString(16).toUpperCase();
		return f.substr(f.length - 8)
	};
	var fnum = function(e) {
		if(e<10) return "0" + e;
		return e;
	};
	var fnum2 = function(e) {
		if(e<10) return "00" + e;
		if(e<100) return "0" + e;
		return e;
	};
	var ft = function(e) {
		return e.getFullYear() 
		+ "-" + fnum(e.getMonth()+1) 
		+ "-" + fnum(e.getDate()) 
		+ " " + fnum(e.getHours()) 
		+ ":" + fnum(e.getMinutes()) 
		+ ":" + fnum(e.getSeconds()) 
		+ "." + fnum2(e.getMilliseconds());
	};
	function h(num){
		return num == 1 ? "E_ERROR" : (num == 2 ? "E_NOTICE" : (num == 4 ? "E_WARNING" : (num == 8 ? "E_INFO" : "E_MODEL")));
	}
	b.put = function() {
		var e = Array.prototype.slice.call(arguments, 0),
			f = E_ERROR;
		if (typeof e[e.length - 1] == "number") {
			f = e.pop()
		}
		if (e.length == 1) {
			if (e[0].constructor == Exception) {
				c.push(e[0])
			} else {
				c.push(new Exception(e[0].number, "Microsoft.JScriptError", e[0].description, f))
			}
		} else {
			if (e.length == 2) {
				c.push(new Exception(e[0].number, e[1], e[0].description, f))
			} else {
				if (e.length == 3) {
					c.push(new Exception(e[0], e[1], e[2], f))
				}
			}
		}
	};
	b.putNotice = function() {
		var e = Array.prototype.slice.call(arguments, 0);
		e.push(E_NOTICE);
		b.put.apply(null, e)
	};
	b.putWarning = function(e) {
		var f = Array.prototype.slice.call(arguments, 0);
		f.push(E_WARNING);
		b.put.apply(null, f)
	};
	b.errorReporting = function(f) {
		if(arguments.length==0) return d;
		d = f
	};
	b.clear = function() {
		while (c.length > 0) {
			c.pop()
		}
	};
	b.debug = function() {
		var g = "", _len = c.length;
		if(_len == 0) return "";
		for (var f = 0; f < _len; f++) {
			var e = c[f];
			if (e.level & d) {
				g += "[<b>0x" + a(e.Number) + "</b>] <span style=\"color:" + j[e.level] + "\">" + e.Source + ": " + Server.HTMLEncode(e.Description) + " [" + h(e.level) + "]</span>\r\n";
				if(e.filename) g += "  File: " + e.filename + "\r\n";
				if(e.lineNumber>0) g += "  Line: " + e.lineNumber + "\r\n";
				if(e.traceCode) g += "  Code: <span style=\"color:red\">" + e.traceCode + "</span>\r\n";
			}
		}
		if(g=="") return "";
		return "<pre style=\"font-family:'Courier New';font-size:12px; padding:8px; background-color:#f6f6f6;border:1px #ddd solid;border-radius:5px;line-height:18px;\">" + g +"</pre>";
	};
	b.debug2file = function(file) {
		var g = "", _len = c.length;
		if(_len == 0) return "";
		for (var f = 0; f < _len; f++) {
			var e = c[f];
			if (e.level & d) {
				g += "[" + ft(e.datetime) + "][" + Mo.Method + "." + Mo.Action + "]" + e.Source + ": " + e.Description + " [" + h(e.level) + "]\r\n";
				if(e.filename) g += "  File: " + e.filename + "\r\n";
				if(e.lineNumber>0) g += "  Line: " + e.lineNumber + "\r\n";
				if(e.traceCode) g += "  Code: " + e.traceCode + "\r\n";
			}
		}
		if(g=="") return;
		IO.file.appendAllText(file, g + "\r\n");
	};
	b.debug2session = function() {
		var g = [], _len = c.length, key = "MO_DEBUGS_CACHE";
		if(_len == 0);
		for (var f = 0; f < _len; f++) {
			var e = c[f];
			if (e.level & d) {
				g.push({
					"number" : a(e.Number),
					"datetime" : ft(e.datetime),
					"method" : Mo.Method,
					"action" : Mo.Action,
					"source" : e.Source,
					"message" : e.Description,
					"level" : h(e.level),
					"filename" : e.filename,
					"linenumber" : e.lineNumber,
					"code" : e.traceCode
				});
			}
		}
		if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) key = Mo.Config.Global.MO_APP_NAME + "_" + key;
		if(g.length>0){
			var debugs = Session(key), data;
			if(debugs){
				debugs = debugs.substr(0,debugs.length-1) + "," + JSON.stringify(g).substr(1);
				if(debugs.length>2048){
					var data = JSON.parse(debugs);
					while(data.length>50)data.shift();
					debugs = JSON.stringify(data);
				}
				Session(key) = debugs;
			}else{
				Session(key) = JSON.stringify(g);
			}
		}
	};
	b.fromSession = function(){
		d = 0;
		var key = "MO_DEBUGS_CACHE";
		if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) key = Mo.Config.Global.MO_APP_NAME + "_" + key;
		var debugs = Session(key);
		Session.Contents.Remove(key);
		if(!debugs) return "[]";
		return debugs;
	};
	return b
})();

function Exception(b, c, a, d) {
	this.level = d || E_ERROR;
	this.levelString = "E_ERROR";
	this.Number = b || 0;
	if (this.Number < 0) {
		this.Number =  this.Number + 0x100000000;
	}
	this.Source = c || "";
	this.Message = a || "";
	this.Description = a || "";
	this.lineNumber = 0;
	this.filename = "";
	this.traceCode = "";
	this.datetime = new Date();
}


var IO = (function() {
	var c = function(d) {
		if (typeof d != "string") {
			return ""
		}
		if (d.substr(1,1) == ":") {
			return d
		}
		return Server.MapPath(d)
	};
	var a = function(e, d) {
		for (var f in d) {
			if (d.hasOwnProperty(f)) {
				e[f] = d[f]
			}
		}
		return e
	};
	var b = (function() {
		var d = {};
		d.resolve = c;
		d.is = function(p) {
			if (p.length < 2) return false;
			return p.substr(1, 1) == ":";
		};
		d.fso = new ActiveXObject("scripting.filesystemobject");
		d.parent = function(p) {
			return d.fso.GetParentFolderName(c(p));
		};
		d.absolute = function(path)
		{
			return d.fso.GetAbsolutePathName(c(path));
		};
		d.base = function(path)
		{
			return d.fso.GetBaseName(c(path));
		};
		d.parent = function(path)
		{
			return d.fso.GetParentFolderName(c(path));
		};
		d.build = function(path,name)
		{
			return d.fso.GetAbsolutePathName(d.fso.BuildPath(c(path),name));
		};
		d.stream = function(g, e) {
			var f = new ActiveXObject("adodb.stream");
			f.mode = g || 3;
			f.type = e || 1;
			return f
		};
		d.fps = [];
		return d
	})();
	b.file = b.file || (function() {
		var d = {};
		d.exists = function(e) {
			e = c(e);
			return b.fso.fileexists(e)
		};
		d.readAllText = function(f, e) {
			return (function(g) {
				var h = b.file.read(g);
				b.file.close(g);
				return h
			})(b.file.open(f, {
				forText: true,
				forRead: true,
				encoding: e || "utf-8"
			}))
		};
		d.readAllScript = function(g, f) {
			var e = (function(h) {
				var i = b.file.read(h);
				b.file.close(h);
				return i
			})(b.file.open(g, {
				forText: true,
				forRead: true,
				encoding: f || "utf-8"
			}));
			e = e.replace(new RegExp("^(\\s*)\\u003cscript(.+?)\\u003e(\\s*)", "i"), "").replace(new RegExp("(\\s*)\\u003c\\/s" + "cript\\u003e(\\s*)$", "i"), "");
			return e
		};
		d.open = function(h, g) {
			h = c(h);
			var e = {
				forAppend: false,
				forText: true,
				forRead: false,
				encoding: "utf-8"
			};
			a(e, g || {});
			var f = b.stream(3, e.forText ? 2 : 1);
			if (e.forText) {
				f.charset = e.encoding
			}
			f.open();
			if (d.exists(h) && (e.forAppend || e.forRead)) {
				f.loadfromfile(h);
				if (e.forAppend) {
					f.position = f.size
				}
			}
			b.fps.push([f, h, e]);
			return b.fps.length - 1
		};
		d.read = function(e, f) {
			if (!b.fps[e]) {
				ExceptionManager.put(11598, "io.file.read", "file resource id is invalid.");
				return null
			}
			if (b.fps[e][2].forText) {
				if (f) {
					return b.fps[e][0].readText(f)
				}
				return b.fps[e][0].readText()
			} else {
				if (f) {
					return b.fps[e][0].read(f)
				}
				return b.fps[e][0].read()
			}
		};
		d.close = function(e) {
			if (!b.fps[e]) {
				ExceptionManager.put(11630, "io.file.close", "file resource id is invalid.");
				return
			}
			b.fps[e][0].close()
		};
		return d
	})();
	b.directory = b.directory || (function() {
		var d = {};
		d.exists = function(e) {
			return b.fso.folderexists(c(e))
		};
		d.files = function(path,callback)
		{
			if(!d.exists(path))
			{
				return [];
			}
			var files=[];
			var fc = new Enumerator(b.fso.getFolder(c(path)).files);
			var isFunc = (typeof callback == "function");
			for (;!fc.atEnd(); fc.moveNext())
			{
				if(isFunc) callback(fc.item());
				else files.push(fc.item().path);
			}
			return files;
		};
		return d
	})();
	return b
})();