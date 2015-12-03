/*
 ** File: Mo.js
 ** Usage: core code of MAE, don't change 'Mo' to other name.
 ** About:
 **		support@mae.im
 */
var
	defaultConfig = {},
	define = function(name, value) {
		defaultConfig[name.toUpperCase()] = value;
	},
	register = function(host, name, path, callback) {
		if(register.registered) return;
		function check_host(h1, h2){
			var cons = Object.prototype.toString.call(h2);
			if(cons == '[object RegExp]') return h2.test(h1);
			if(cons == '[object Array]'){
				for(var i = 0; i < h2.length; i++){
					if(check_host(h1, h2[i])) return true;
				}
				return false;
			}
			if(h2 == "*") return true;
			if(h2.indexOf("*")>=0){
				h2 = h2.replace(/\*/g,"([0-9a-z\\-]+)").replace(/\./g, "\\.");
				h2 = new RegExp("^" + h2 + "$", "i");
				return h2.test(h1);
			}
			return h1 == h2;
		}
		var http_host = Request.ServerVariables("HTTP_HOST");
		if(check_host(http_host, host)){
			defaultConfig["MO_APP_NAME"] = name;
			defaultConfig["MO_APP"] = path;
			register.registered = true;
			register.domain = http_host;
			if(typeof callback == "function") callback(http_host, name, path);
		}
	},
	F, require, View, IController, IClass,
	req = Request,
	res = Response,
	ROOT = Server.Mappath("/"),
	Mo,
	hed,
	CACHE = {MODEL:1, COMPILE:2, GZIP:4, ALL:8},
	startup = Mo = (function() {
		var __contenttypes__ = {
			"json" : "application/json",
			"text" : "text/plain",
			"xml" : "application/xml",
			"javascript" : "text/javascript",
			"html" : "text/html"
		};
		var __events__ = {
			"dispose": [],
			"load":[],
			"autoload":[]
		},
		__invoke_event__ = function(eventname, data){
			var events = __events__[eventname],
				_len, event;
			if (events) {
				_len = events.length;
				for (var i = 0; i < _len; i++) {
					event = events[i];
					if (event) {
						if(event.call(Mo, {data:data}, __invoke_event__)===false) break;
					}
				}
			}		
		};
		var __headers=null;
		hed = function(name, value){
			if(__headers==null){
				__headers = {};
				var str_headers = (Request.ServerVariables("ALL_RAW") + "").split("\r\n"), len = str_headers.length, index=0, item;
				for(var i=0;i<str_headers.length;i++){
					item = str_headers[i];
					index = item.indexOf(":");
					if(index > 0){
						__headers[item.substr(0, index).toLowerCase()] = item.substr(index + 1).replace(" ","");
					}
				}
				str_headers=null;
			}
			if(name === undefined) return __headers;
			if(value === undefined) return __headers[name.toLowerCase()] || "";
			Response.AddHeader(name, value);
		};
		var c = function(d) {
			if (typeof d != "string") {
				return ""
			}
			if (d.substr(1, 1) == ":") {
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
		var _format = function(Str) {
			var arg = arguments;
			if (arg.length <= 1) {
				return Str;
			}
			return Str.replace(/\{(\d+)(?:\.([\w\.\-]+))?(?:\:(.+?))?\}/igm, function(ma, arg1, arg2, arg3) {
				var argvalue = arg[parseInt(arg1) + 1];
				if (argvalue === undefined) return "";
				if (typeof argvalue == "object" && arg2) {
					argvalue = (new Function("return this" + "[\"" + arg2.replace(/\./igm, "\"][\"").replace(/\[\"(\d+)\"\]/igm, "[$1]") + "\"]")).call(argvalue);
				}
				if (argvalue == null) return "NULL";
				return argvalue;
			});
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
		var _LoadTemplate = function(tplstr, assigns) {
			assigns = assigns || {};
			var template = __LoadTemplate(tplstr,assigns);
			template = template.replace(/<selection name\=("|')(\w+)\1(\s*)\/>/ig, "");
			template = template.replace(/<selection name\=("|')(\w+)\1(\s*)>([\s\S]*?)<\/selection>/ig, "$4");
			return template;
		};
		var readAttrs__ = function(src) {
			if (typeof src != "string") return {};
			if (!src) return {};
			src = F.string.trim(F.string.trim(src).replace(/^<(\w+)([\s\S]+?)(\/)?>([\s\S]*?)$/i, "$2"));
			var returnValue = {};
			var reg = /\b([\w\.]+)\=(\"|\')(.+?)(\2)( |$)/igm;
			var a = reg.exec(src);
			while (a != null) {
				returnValue[a[1]] = a[3];
				a = reg.exec(src);
			}
			return returnValue;
		};
		var __LoadTemplate = function(template, assigns) {
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
			var tempStr = IO.file.readAllText(c(path)),
				masterexp = new RegExp("^<extend file\\=\\\"(.+?)(\\." + G.MO_TEMPLATE_PERX + ")?\\\" />", "i"),
				includeexp = new RegExp("<include file\\=\\\"(.+?)(\\." + G.MO_TEMPLATE_PERX + ")?\\\" />", "igm");

			F.string.matches(tempStr, /<assign ([\s\S]+?)\/>(\s*)/igm, function($0, $1) {
				var attrs = readAttrs__($1);
				if (attrs["name"]) {
					if(!assigns.hasOwnProperty(attrs["name"])) assigns[attrs["name"]] = attrs["value"];
				}
			});
			tempStr = tempStr.replace(/<assign ([\s\S]+?)\/>(\s*)/g, '');
			var match = masterexp.exec(tempStr),
				master, callback;
			if (match) {
				templatelist2 = _RightCopy(templatelist, match[1].split(":"));
				master = __LoadTemplate(templatelist2.join(":"), assigns);
				callback = function($0, $1, $2, $3, $4) {
					var m = (new RegExp("<selection name\\=(\"|')" + $2 + "\\1>([\\s\\S]*?)<\\/selection>")).exec(tempStr);
					if (m) {
						master = F.replace(master, $0, m[0].replace("<super />", $4 || ""));
					}
				};
				F.string.matches(master, /<selection name\=("|')(\w+)\1(\s*)\/>/ig, callback);
				F.string.matches(master, /<selection name\=("|')(\w+)\1(\s*)>([\s\S]*?)<\/selection>/ig, callback);
				tempStr = master.replace(match[0], "");
			}
			F.string.matches(tempStr, includeexp, function($0, $1) {
				templatelist2 = _RightCopy(templatelist, $1.split(":"));
				tempStr = F.replace(tempStr, $0, __LoadTemplate(templatelist2.join(":"), assigns));
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
			var module = {
				exports: {}
			};
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
				path = c(path);
				var ret = IO.file.readAllScript(path);
				if (G.MO_DEBUG) {
					ret = ReCompileForDebug(ret);
				}
				ret = "var " + name + ";\r\n" + ret + "\r\n return " + name + ";";
				var _controller = (new Function("__filename", "__dirname", "M", "C", "L", "__scripts", ret))(
					path,
					path == "" ? "" : path.substr(0, path.lastIndexOf("\\")),
					Model__, M.C, M.L, G.MO_DEBUG ? ret : ""
				);
				if (_controller) return _controller && (_LoadController._controllers[ccname] = _controller);
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
			var path = c(G.MO_APP + "Library/Assets/" + name + ".asp");
			if (!IO.file.exists(path)) path = c(G.MO_CORE + "Library/Assets/" + name + ".asp");
			if (!IO.file.exists(path)) return false;

			var ret = IO.file.readAllScript(path);
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
			var filepath = c(G.MO_APP + type + "/" + name + ".asp");
			if (!IO.file.exists(filepath)) filepath = c(G.MO_CORE + type + "/" + name + ".asp");
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
				.replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, function(match, slash, format, key, capture, star, optional) {
					slash = slash || '';
					format = format || '';
					capture = capture || '([^/' + format + ']+?)';
					optional = optional || '';

					keys.push({
						name: key,
						optional: !!optional
					});

					return '' + (optional ? '' : slash) + '(?:' + format + (optional ? slash : '') + capture + (star ? '((?:[\\/' + format + '].+?)?)' : '') + ')' + optional;
				})
				.replace(/\*/g, '(.*)');

			return new RegExp('^' + path + (end ? '$' : '(?=\/|$)'), sensitive ? '' : 'i');
		};
		var _lib = function(name) {
			if (G[name] != "") {
				var libs = G[name].split(","),
					_len = libs.length;
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
				initialize: 0,
				route: 0,
				run: 0,
				load: 0,
				compile: 0,
				run1: 0,
				recompile: 0,
				terminate: 0
			}
		};

		var _debug = function() {
			if (G.MO_DEBUG) {
				ExceptionManager.put(0, "MO", "debug mode is enabled, please set 'MO_DEBUG' as false in production env, and set 'MO_ERROR_REPORTING' to show useful information.", E_WARNING);
			}
			if (!G.MO_COMPILE_CACHE) {
				ExceptionManager.put(0, "MO", "compile cache is not enabled, you should enable it in production env(set 'MO_COMPILE_CACHE' as true).", E_WARNING);
			}
			var timelines = _runtime.timelines;
			ExceptionManager.put(
				0, "MO",
				_format(
					"System: {1}MS > Initialize: {0.initialize}MS; Route: {0.route}MS; Controller: {0.run}MS (Load: {0.load}MS, Compile: {0.compile}MS, DebugCompile: {0.recompile}MS, Execute: {0.run1}MS); Terminate: {0.terminate}MS.",
					timelines,
					timelines.initialize + timelines.route + timelines.run + timelines.terminate
				), E_INFO
			);
			var mode = G.MO_DEBUG_MODE;
			if (mode == "FILE" && G.MO_DEBUG_FILE) {
				ExceptionManager.debug2file(G.MO_DEBUG_FILE);
			} else if (mode == "SESSION" || mode == "APPLICATION") {
				ExceptionManager.debug2session();
			} else {
				if (String(req.ServerVariables("HTTP_X_REQUESTED_WITH")).toLowerCase() == "xmlhttprequest") {
					if (E_ERROR & ExceptionManager.errorReporting()) ExceptionManager.errorReporting(E_ERROR);
					else ExceptionManager.errorReporting(E_NONE);
				}
				res.Write(ExceptionManager.debug());
			}
		};
		var _getfunctionParms = function(fn) {
			var _parms = fn.toString().replace(/^function(.*?)\((.*?)\)([\s\S]+)$/, "$2").replace(/\s/igm, "").split(","),
				_len = _parms.length;
			for (var i = 0; i < _len; i++) {
				_parms[i] = F.get(_parms[i]);
			}
			return _parms;
		};
		var _catchException = function(ex) {
			var _exception = new Exception(ex.number, M.RealMethod + "." + M.RealAction, ex.description);
			if (_runtime.line > 0) {
				_exception.lineNumber = _runtime.line;
				_exception.filename = _runtime.file.replace(c("/"), "").replace(/\\/ig, "\/");
				if (_runtime.debugLine > 0 && _runtime.scripts != "") {
					_exception.traceCode = _runtime.scripts.split("\n")[_runtime.debugLine];
				}
			}
			ExceptionManager.put(_exception);
		}

		var M = function(opt) {
				if (typeof opt == "string") return opt ? _Assigns[opt] : _Assigns;
				if(M.Initialized) return;
				opt = _extend({}, defaultConfig);
				var _tag = _runtime.run();
				if (!M.Initialize(opt)) {
					M.Terminate();
					return;
				}
				M.Initialized = true;
				_runtime.timelines.initialize = _runtime.ticks(_tag);

				_tag = _runtime.run();
				if (G.MO_ROUTE_MODE){
					M.Route();
					__invoke_event__("after_route", G);
				}
				_runtime.timelines.route = _runtime.ticks(_tag);

				if (!G.MO_PLUGIN_MODE) {
					_tag = _runtime.run();
					M.Run();
					_runtime.timelines.run = _runtime.ticks(_tag);
					M.Terminate();
				}
				
			},
			G = {};
		M.Initialized = false;
		M.Runtime = _runtime;
		M.Version = "MoAspEnginer 3.1.1.392";
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
		M.IsPost = String(req.ServerVariables("REQUEST_METHOD")) == "POST" || String(req.ServerVariables("CONTENT_TYPE")) != "";
		M.Debug = function() {
			_runtime.log.apply(null, arguments)
		};
		M.on = function(name, callback){
			if (!__events__.hasOwnProperty(name)) __events__[name] = [];
			var event = __events__[name];
			callback.GUID = event.length;
			event.push(callback);
		};
		M.Initialize = function(cfg) {
			var _tag = _runtime.run();
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
			M.Config.Global = cfg;
			M.Status = "200 OK";

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
			cfg.MO_APP_ROOT = IO.parent(cfg.MO_APP).replace(ROOT, "").replace(/\\/g,"/");

			/*load global config*/
			if (IO.file.exists(cfg.MO_CORE + "Conf/Config.asp")) G = M.Config.Global = _wapper(IO.file.readAllScript(cfg.MO_CORE + "Conf/Config.asp"))();
			_extend(G, cfg);

			/*load 'Common' modules*/
			IO.directory.files(G.MO_CORE + "Common", function(file) {
				if (file.name.slice(-4) == ".asp") _wapperfile(file.path);
			});

			/*load require module*/
			require = _wappermodule(IO.file.readAllText(cfg.MO_CORE + "Library/Extend/lib/require.js"));
			require.use(c(G.MO_CORE + "Library/Extend"), c(G.MO_APP + "Library/Extend"));
			var core = G.MO_CORE + "Library/Extend/lib/core.js";
			if(!IO.file.exists(core)){
				/*load fns module*/
				F = require("lib/fns.js");
				if (!F) _exit("can not load module 'fns', system will be shut down.");
				
				/*load IO module*/
				IO = require("lib/io.js");
				if (!IO) _exit("can not load module 'io', system will be shut down.");
				
				/*load Iclass module*/
				var IC = require("lib/dist.js");
				if(!IC) _exit("can not load module 'dist', system will be shut down.");
				IController = IC.IController;
				IClass = IC.IClass;
				if(G.MO_COMPILE_CORE === true) C_(G.MO_CORE + "Library/Extend/lib/fns.js", G.MO_CORE + "Library/Extend/lib/io.js", G.MO_CORE + "Library/Extend/lib/dist.js", G.MO_CORE + "Library/Extend/lib/core.js");
			}else{
				var Core = require("lib/core.js");
				if(!Core) _exit("can not load module 'core', system will be shut down.");
				F = Core[0];
				IO = Core[1];
				IController = Core[2].IController;
				IClass = Core[2].IClass;
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
			var app_config=G.MO_APP + "Conf/Config.asp";
			if(IO.file.exists(app_config)){
				require(c(app_config), true, function() {
					if (this.hasOwnProperty("MO_LIB_CNAMES")) {
						if (this.MO_LIB_CNAMES) _extend(G.MO_LIB_CNAMES, this.MO_LIB_CNAMES);
						delete this.MO_LIB_CNAMES;
					}
					for (var k in cfg) {
						delete this[k];
					}
					_extend(G, this);
				});
			}
			
			if (!G.MO_METHOD_CHAR) G.MO_METHOD_CHAR = "m";
			if (!G.MO_ACTION_CHAR) G.MO_ACTION_CHAR = "a";
			if (!G.MO_GROUP_CHAR) G.MO_GROUP_CHAR = "g";

			if (G.MO_CHARSET) res.Charset = G.MO_CHARSET;
			if (IO.file.exists(G.MO_APP + "Common/Function.asp")) _wapperfile(G.MO_APP + "Common/Function.asp");
			if (G.MO_IMPORT_COMMON_FILES != "") {
				var files = G.MO_IMPORT_COMMON_FILES.split(";"),
					_len = files.length;
				for (var i = 0; i < _len; i++) {
					if (!files[i]) continue;
					_wapperfile(G.MO_APP + "Common/" + files[i] + ".asp");
				}
			}
			M.assign("VERSION", M.Version);
			__invoke_event__("load", G);
			ExceptionManager.errorReporting(G.MO_ERROR_REPORTING);
			_lib("MO_PRE_LIB");
			return true;
		};
		M.Terminate = function() {
			var _tag = _runtime.run();
			_lib("MO_END_LIB");
			__invoke_event__("dispose");
			_runtime.timelines.terminate = _runtime.ticks(_tag);
			_debug();
			_Assigns = null;
			M.Config = null;
			_Language = null;
		};

		function _parseRouteTo(url) {
			var mat = /^(.+?)(\?(.+))?$/.exec(url);
			if (mat) {
				F.get.clear();
				var gma = _RightCopy(["", "", ""], mat[1].split("/"));
				F.get(G.MO_GROUP_CHAR, gma[0]);
				F.get(G.MO_METHOD_CHAR, gma[1]);
				F.get(G.MO_ACTION_CHAR, gma[2]);
				F.get.fromURIString(mat[3]);
			}
		}
		M.Route = function() {
			var qs = req.QueryString + "",
				uri = "";
			var mat = /^404\;http(s)?\:\/\/(.+?)\/(.*?)$/i.exec(qs);
			if (mat != null) {
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
			if (G.MO_ROUTE_URL_EXT) {
				uri = uri.replace(new RegExp("\\." + G.MO_ROUTE_URL_EXT + "$", "i"), "");
				if (uri.slice(0, 1) == "/") uri = uri.substr(1);
				if (uri.slice(-1) == "/") uri = uri.substr(0, uri.length - 1);
			}
			if(G.MO_KEEP_PARAMS_WHEN_REWRITE===false) F.get.clear();
			if (!uri) return;
			var Maps = G.MO_ROUTE_MAPS;
			if (Maps && Maps.hasOwnProperty(uri)) {
				_parseRouteTo(Maps[uri]);
				return;
			}
			var reqmethod = F.server("REQUEST_METHOD"),
				reston = G.MO_ROUTE_REST_ENABLED,
				RouteTo = "";
			var Rules = G.MO_ROUTE_RULES,
				_len = Rules.length;
			for (var i = 0; i < _len; i++) {
				var rule = Rules[i],
					lookfor = rule.LookFor;
				if (!rule.Method) rule.Method = "GET";
				if (typeof lookfor == "string") lookfor = _pathtoRegexp(lookfor, null, {
					strict: true
				});
				if (lookfor.test(uri) && (!reston || reqmethod == rule.Method)) {
					RouteTo = uri.replace(lookfor, rule.SendTo);
					break;
				}
			}
			if (RouteTo) _parseRouteTo(RouteTo);
		};
		M.contentType = function(contenttype) {
			contenttype = contenttype || G.MO_CONTENT_TYPE;
			if(contenttype){ 
				if(__contenttypes__[contenttype]) contenttype = __contenttypes__[contenttype];
				res.ContentType = contenttype;
			}else{
				res.ContentType = "text/html";
			}
		};
		M.display = function(template, extcachestr) {
			res.Status = M.Status;
			M.contentType();
			M.fetch(template, extcachestr);
		};
		M.fetch = function(template, extcachestr) {
			M.Buffer = !(arguments.callee.caller == M.display);
			if (!G.MO_TEMPLATE_ENGINE) {
				ExceptionManager.put(0x12edf, "Mo.fetch()", "please define a template engine on item 'MO_TEMPLATE_ENGINE'.");
				return "";
			}
			var _tag = _runtime.run();
			if (!template || template == "") template = M.Action;
			var html, cachename, OldHash, usecache = false,
				scripts, cachepath = "";
			if (G.MO_COMPILE_CACHE) {
				cachename = M.Method + "^" + M.Action + "^" + template.replace(/\:/g, "^");
				if (extcachestr) cachename += "^" + extcachestr;
				cachepath = c(G.MO_APP + "Cache/Compiled/" + cachename + ".asp");
				if (!G.MO_INGORE_COMPILE_CACHE && IO.file.exists(cachepath)) {
					usecache = true;
					if (G.MO_COMPILE_CACHE_EXPIRED > 0) {
						OldHash = F.fso.GetFile(cachepath).DateLastModified;
						if (F.date.datediff("s", OldHash, new Date()) >= G.MO_COMPILE_CACHE_EXPIRED) usecache = false;
					}
					if (usecache) {
						scripts = IO.file.readAllScript(cachepath);
					}
				}
			}
			if (!usecache) {
				var assigns = {};
				html = _LoadTemplate(template, assigns);
				if (html == "") return "";
				if (!View) View = require(G.MO_TEMPLATE_ENGINE);
				if (!View) {
					ExceptionManager.put(0x12edf, "Mo.fetch()", "can not load template engine.");
					return "";
				}
				scripts = View.compile(html, assigns);
				if (G.MO_COMPILE_CACHE) IO.file.writeAllText(cachepath, "\u003cscript language=\"jscript\" runat=\"server\"\u003e\r\n" + scripts + "\r\n\u003c/script\u003e");
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
			if (G.MO_CACHE && G.MO_CACHE_DIR != "" && IO.directory.exists(G.MO_CACHE_DIR)) IO.file.writeAllText(c(G.MO_CACHE_DIR + _CacheFileName + ".cache"), content);
			_runtime.timelines.run1 = _runtime.ticks(_tag);
			return content;
		};
		M.U = function(path, _parms, ext) {
			var match = /^(.*?)(\?(.*?))?(\#(.*?))?(\@(.*?))?(\!)?$/igm.exec(path || "");
			if (!match) return "";
			var fn = F.object.toURIString.fn;
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
			F.object.toURIString.fn = 1;
			if (G.MO_ROUTE_MODE == "404" || G.MO_ROUTE_MODE == "URL") {
				F.object.toURIString.split_char_1 = F.object.toURIString.split_char_2 = "/";
				url += "/" + F.object.toURIString(parms);
				F.object.toURIString.split_char_1 = "=";
				F.object.toURIString.split_char_2 = "&";
				ext = ext || G.MO_ROUTE_URL_EXT;
				if (ext) ext = "." + ext;
			} else {
				url += "&" + F.object.toURIString(parms);
				ext = "";
			}
			if (F.string.endsWith(url, "/") || F.string.endsWith(url, "&")) url = url.substr(0, url.length - 1);
			if (anchor != "") url += "#" + anchor;
			F.object.toURIString.fn = fn;
			return url + ext;
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
		M.C = function(key, value) {
			if(!key) return G;
			if(key.substr(0,2) == "@.") key = key.substr(2);
			if(value === undefined) return G[key];
			G[key] = value;
		};
		M.A = function(ctrl) {
			var filepath = c(G.MO_APP + "Controllers/" + M.Group + ctrl + "Controller.asp");
			if (!IO.file.exists(filepath)) filepath = c(G.MO_CORE + "Controllers/" + M.Group + ctrl + "Controller.asp");
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
			M.Method = F.get(G.MO_METHOD_CHAR);
			M.Action = F.get(G.MO_ACTION_CHAR);
			M.Group = F.get(G.MO_GROUP_CHAR);
			(!/^(\w+)$/i.test(M.Action)) && (M.Action = "Index");
			(!/^(\w+)$/i.test(M.Method)) && (M.Method = "Home");
			(!/^(\w+)$/i.test(M.Group)) && (M.Group = "");
			if (M.Group != "") M.Group += "/";
			if (G.MO_CONTROLLER_CNAMES && G.MO_CONTROLLER_CNAMES.hasOwnProperty(M.Method.toLowerCase())) M.Method = G.MO_CONTROLLER_CNAMES[M.Method.toLowerCase()];
			if (G.MO_CACHE) {
				_CacheFileName = MD5(F.server("URL") + F.get.toURIString() + "");
				if (IO.file.exists(G.MO_CACHE_DIR + _CacheFileName + ".cache")) {
					res.Write(IO.file.readAllText(c(G.MO_CACHE_DIR + _CacheFileName + ".cache")));
					return;
				}
			}
			var ModelPath = G.MO_APP + "Controllers/" + M.Group + M.Method + "Controller.asp",
				can_LoadController = true;
			M.RealMethod = M.Method;
			M.RealAction = M.Action;
			if (!IO.file.exists(ModelPath)) {
				ModelPath = G.MO_CORE + "Controllers/" + M.Group + M.Method + "Controller.asp";
				if (!IO.file.exists(ModelPath)) {
					ModelPath = G.MO_APP + "Controllers/" + M.Group + "EmptyController.asp";
					M.RealMethod = "Empty";
					if (!IO.file.exists(ModelPath)) {
						ModelPath = G.MO_CORE + "Controllers/" + M.Group + "EmptyController.asp";
						if (!IO.file.exists(ModelPath)) {
							if (M.templateIsInApp(M.Action) || M.templateIsInCore(M.Action)) {
								M.display(M.Action);
								can_LoadController = false;
							} else {
								ExceptionManager.put(0x2dfc, M.RealMethod + "." + M.RealAction, "controller '" + M.Method + "' is not exists.");
								return;
							}
						}
					}
				}
			}
			var _controller;
			if (!(can_LoadController && (_controller = _LoadController(ModelPath, M.RealMethod)))) return;
			if (_controller["__PRIVATE__"] === true) {
				ExceptionManager.put(0x2dfc, M.RealMethod + "." + M.RealAction, "controller '" + M.Method + "' is not exists.");
				return;
			}
			_runtime.timelines.load = _runtime.ticks(_tag);
			var MC = null;
			try {
				MC = new _controller(M.Action);
			} catch (ex) {
				_catchException({
					number: 0x3a9,
					description: "controller '" + M.Method + "' initialize failed: " + ex.description + "."
				});
				return;
			}
			if (MC.__STATUS__ === true) {
				var action_ = M.Action;
				if (G.MO_ACTION_CASE_SENSITIVITY === false) action_ = action_.toLowerCase();
				var fn = null,
					args = [],
					self = MC;

				if (F.server("REQUEST_METHOD") == "POST" && MC[action_ + "_Post_"] && MC[action_ + "_Post_"]["__PRIVATE__"] !== true) {
					fn = MC[action_ + "_Post_"];

				} else if (MC[action_] && MC[action_]["__PRIVATE__"] !== true) {
					fn = MC[action_];

				} else if (G.MO_AUTO_DISPLAY && (M.templateIsInApp(M.Action) || M.templateIsInCore(M.Action))) {
					self = M;
					fn = M.display;
					args = [M.Action];

				} else {
					if (MC["empty"] && MC["empty"]["__PRIVATE__"] !== true) {
						M.RealAction = "empty";
						fn = MC["empty"];
						args = [M.Action];
					} else {
						ExceptionManager.put(0x3a8, M.RealMethod + "." + M.RealAction, "please define '" + M.Action + "' or 'empty' method.");
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
			return IO.file.writeAllText(c(G.MO_APP + "Cache/Model/" + name + ".cak"), content);
		};
		M.ModelCacheLoad = function(name) {
			if (name == "") return "";
			return IO.file.readAllText(c(G.MO_APP + "Cache/Model/" + name + ".cak"));
		};
		M.ModelCacheDelete = function(name) {
			if (name == "") return false;
			return IO.file.del(c(G.MO_APP + "Cache/Model/" + name + ".cak"));
		};
		M.ModelCacheClear = function() {
			return IO.directory.clear(c(G.MO_APP + "Cache/Model"), function(f, isfile) {
				if (isfile && f.name == ".mae") return false;
			});
		};
		M.ClearCompiledCache = function() {
			return IO.directory.clear(c(G.MO_APP + "Cache/Compiled"), function(f, isfile) {
				if (isfile && f.name == ".mae") return false;
			});
		};
		M.ClearGzipCache = function() {
			return IO.directory.clear(c(G.MO_APP + "Cache/Gzip"), function(f, isfile) {
				if (isfile && f.name == ".mae") return false;
			});
		};
		M.ClearCache = function(mode) {
			if(!mode || (CACHE.MODEL & mode))M.ModelCacheClear();
			if(!mode || (CACHE.COMPILE & mode))M.ClearCompiledCache();
			if(!mode || (CACHE.GZIP & mode))M.ClearGzipCache();
			if(!mode || (CACHE.ALL & mode)){
				IO.directory.directories(c(G.MO_APP + "Cache"), function(file){
					IO.directory.clear(file.path, function(f, isfile) {
						if (isfile && f.name == ".mae") return false;
					});
				});
			}
		};
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
		M.helper = {
			LoadController : _LoadController
		};
		return M;
	})(), shutdown = Mo.Terminate;
	
Mo.on("load", function(e, __invoke_event__) {
	var loaddelay = {
		"base64=Base64": ["e", "d", "encode", "decode", "toBinary", "fromBinary", "setNames", "base64"],
		"JSON": ["parse", "stringify", "create", "decodeStrict", "encodeUnicode", "assets/json.js"],
		"dump": [null, "dump"], "cookie=Cookie": [null, "assets/cookie.js"],
		"Model__": [null, "cmd", "useCommand", "Debug", "setDefault", "setDefaultPK", "begin", "commit", "rollback", "getConnection", "dispose", "connect", "execute", "executeQuery", "Model__@lib/model.js"],
		"DataTable": [null, "Model__.helper.DataTable@lib/model.js"], "DataTableRow": [null, "Model__.helper.DataTableRow@lib/model.js"],
		"VBS": ["ns", "include", "eval", "require", "getref", "execute", "run", "assets/vbs.js"],
		"Mpi": ["downloadAndInstall", "Host", "setDefaultInstallDirectory", "download", "fetchPackagesList", "fetchPackage", "packageExists", "install", "assets/mpi.js"],
		"Tar": [null, "setNames", "packFolder", "packFile", "unpack", "assets/tar.js"],
		"md5=MD5": [null, "md5@assets/md5.js"], "HMACMD5": [null, "HMACMD5@assets/md5.js"], 
		"SHA1": [null, "SHA1@assets/sha1.js"], "HMACSHA1": [null, "HMACSHA1@assets/sha1.js"], "SHA256": [null, "SHA256@assets/sha256.js"], "HMACSHA256": [null, "HMACSHA256@assets/sha256.js"],
		"Html": ["ActionLink", "Form", "FormUpload", "FormEnd", "CheckBox", "DropDownList", "ListBox", "Hidden", "Password", "RadioButton", "TextArea", "TextBox", "assets/htmlhelper.js"],
		"Utf8": ["getWordArray", "getByteArray", "bytesToWords", "toString", "getBytes", "getWords", "getBinary", "getString", "utf8@encoding"],
		"GBK": ["getWordArray", "getByteArray", "bytesToWords", "toString", "getBytes", "getWords", "getBinary", "getString", "gbk@encoding"],
		"Unicode": ["getWordArray", "getByteArray", "bytesToWords", "toString", "getBytes", "getWords", "getBinary", "getString", "unicode@encoding"],
		"Hex": ["parse", "stringify", "hex@encoding"],"Encoding": ["encodeURIComponent", "encodeURI", "decodeURI", "getEncoding", "getBinary", "getString", "encoding"],
		"Crc32": [null, "assets/crc32.js"], "Safecode": [null, "Safecode@safecode"], "BmpImage": [null, "BmpImage@safecode"],
		"HashTable": [null, "assets/hashtable.js"],"MCM": [null, "assets/configmanager.js"], "Punycode" : ["toIDN", "fromIDN", "encode", "decode", "./punycode/index.js"],
		"HttpRequest" : [null,"net/http/request.js"], "HttpUpload" : [null,"net/http/upload.js"], "WinHttpRequest=WinHttp" : [null,"get", "getJson", "post", "postJson", "save", "net/http/winhttp.js"],
		"SOAPClient" : [null,"net/http/soap.js"], "Net" : ["IpToLong","LongToIp","InSameNetWork","IsIP","net"], "Upload" : [null,"accept", "net/upload.js"],
		"Jmail" : [null,"net/mail.js"], "QRCode" : [null,"./qrcode/index.js"], "Marked" : [null, "options", "./assets/marked.js"]
	}, executeable="";
	__invoke_event__("autoload", loaddelay);
	for (var lib in loaddelay) {
		if (!loaddelay.hasOwnProperty(lib)) continue;
		var library = loaddelay[lib],
			module = library.pop(),
			index = module.indexOf("@"),
			exports = "",
			cname = "",
			index2 = lib.indexOf("="), method="";
		if (index > 0) {
			exports = "." + module.substr(0, index);
			module = module.substr(index + 1);
		}
		executeable += "try{";
		executeable += lib + " = {};";
		if (index2 > 0) {
			cname = lib.substr(index2 + 1);
			lib = lib.substr(0, index2);
		}
		var _len = library.length;
		for (var i = 0; i < _len; i++) {
			method = "." + library[i];
			if (library[i] == null) method = "";
			executeable += lib + method + " = function(){" + lib + " = require(\"" + module + "\")" + exports + "; return " + lib + method + ".apply(" + lib + ",arguments)};";
		}
		if (cname) executeable += cname + " = " + lib + ";";
		executeable += "}catch(ex){ExceptionManager.put(ex.number, 'AUTOLOAD', 'find error when load \\'" + lib + "\\': ' + ex.description, E_ERROR);}";
	}
	(new Function(executeable))();
});
var C_ = function(){
	if(arguments.length<=2) return;
	var src = Array.prototype.slice.call(arguments, 0), target = src.pop();
	var wapper = 'module.exports=[];\nvar modules = {exports : {}};\n';
	for(var i=0;i<src.length;i++){
		wapper += 'modules.exports = {};\n(function(exports,require,module,__filename,__dirname,define){\n';
		wapper += IO.file.readAllText(src[i]);
		wapper += '\n})(modules.exports, require, modules, __filename, __dirname, define);\nmodule.exports.push(modules.exports);\n';
	}
	IO.file.writeAllText(target, wapper);
};
var HMAC = function(algorithm, blocksize, data, key, ra) {
	var ipad = [],
		opad = [];
	if (typeof data == "string") data = Utf8.getByteArray(data);
	if (typeof key == "string") key = Utf8.getByteArray(key);
	if (key.length > blocksize) key = algorithm(key, true);
	while (key.length < blocksize) {
		key.push(0);
	}
	for (var i = 0; i < blocksize; i++) {
		ipad[i] = key[i] ^ 0x36;
		opad[i] = key[i] ^ 0x5c;
	}
	data = algorithm(ipad.concat(data), true);
	data = opad.concat(data);
	return algorithm(data, ra === true);
};
var Encapsulate = Function.Create = function(len) {
	var args = [];
	for (var i = 0; i < len; i++) args.push("arg" + i);
	var _args = args.join(",");
	return new Function(_args, "return new this(" + _args + ");");
};
var E_NONE = 0,
	E_ERROR = 1,
	E_NOTICE = 2,
	E_WARNING = 4,
	E_INFO = 8,
	E_MODEL = 16,
	E_LOG = 32,
	E_ALL = E_ERROR | E_NOTICE | E_WARNING | E_INFO | E_MODEL | E_LOG;
var console = {};
console.log = function(msg) {
	MEM.putLog(0, "Log", msg);
};
var MEM = ExceptionManager = (function() {
	var b = {};
	var c = [],
		d = E_ALL,
		j = {
			1: "red",
			2: "orange",
			4: "blue",
			8: "green",
			16: "green",
			32: "black"
		};
	var a = function(e) {
		var f = "0000000" + e.toString(16).toUpperCase();
		return f.substr(f.length - 8)
	};
	var fnum = function(e) {
		if (e < 10) return "0" + e;
		return e;
	};
	var fnum2 = function(e) {
		if (e < 10) return "00" + e;
		if (e < 100) return "0" + e;
		return e;
	};
	var ft = function(e) {
		return e.getFullYear() + "-" + fnum(e.getMonth() + 1) + "-" + fnum(e.getDate()) + " " + fnum(e.getHours()) + ":" + fnum(e.getMinutes()) + ":" + fnum(e.getSeconds()) + "." + fnum2(e.getMilliseconds());
	};
	var ft2 = function(e) {
		return fnum(e.getHours()) + ":" + fnum(e.getMinutes()) + ":" + fnum(e.getSeconds()) + "." + fnum2(e.getMilliseconds());
	};

	function h(num) {
		return num == 1 ? "E_ERROR" : (num == 2 ? "E_NOTICE" : (num == 4 ? "E_WARNING" : (num == 8 ? "E_INFO" : (num == 16 ? "E_MODEL" : "E_LOG"))));
	}
	b.put = function() {
		var e = Array.prototype.slice.call(arguments, 0),
			f = E_ERROR;
		if (typeof e[e.length - 1] == "number") {
			f = e.pop()
		}
		if(!(f & Mo.Config.Global.MO_ERROR_REPORTING)) return;
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
	b.last = function(){
		if(c.length==0)return null;
		return c[c.length - 1];
	};
	b.putNotice = function() {
		var e = Array.prototype.slice.call(arguments, 0);
		e.push(E_NOTICE);
		b.put.apply(null, e)
	};
	b.putLog = function() {
		var e = Array.prototype.slice.call(arguments, 0);
		e.push(E_LOG);
		b.put.apply(null, e)
	};
	b.putWarning = function(e) {
		var f = Array.prototype.slice.call(arguments, 0);
		f.push(E_WARNING);
		b.put.apply(null, f)
	};
	b.errorReporting = function(f) {
		if (arguments.length == 0) return Mo.Config.Global.MO_ERROR_REPORTING;
		Mo.Config.Global.MO_ERROR_REPORTING = f
	};
	b.clear = function() {
		while (c.length > 0) {
			c.pop()
		}
	};
	b.debug = function() {
		var g = "",
			_len = c.length;
		if (_len == 0) return "";
		for (var f = 0; f < _len; f++) {
			var e = c[f];
			if (e.level & d) {
				g += "[<b>0x" + a(e.Number) + "</b>] <span style=\"color:" + j[e.level] + "\">" + e.Source + ": " + Server.HTMLEncode(e.Description) + " [" + h(e.level) + "]</span>\r\n";
				if (e.filename) g += "  File: " + e.filename + "\r\n";
				if (e.lineNumber > 0) g += "  Line: " + e.lineNumber + "\r\n";
				if (e.traceCode) g += "  Code: <span style=\"color:red\">" + e.traceCode + "</span>\r\n";
			}
		}
		if (g == "") return "";
		return "<pre style=\"font-family:'Courier New';font-size:12px; padding:8px; background-color:#f6f6f6;border:1px #ddd solid;border-radius:5px;line-height:18px;\">" + g + "</pre>";
	};
	b.debug2file = function(file) {
		var g = "",
			_len = c.length;
		if (_len == 0) return "";
		for (var f = 0; f < _len; f++) {
			var e = c[f];
			if (e.level & d) {
				g += "[" + ft(e.datetime) + "][" + Mo.Method + "." + Mo.Action + "]" + e.Source + ": " + e.Description + " [" + h(e.level) + "]\r\n";
				if (e.filename) g += "  File: " + e.filename + "\r\n";
				if (e.lineNumber > 0) g += "  Line: " + e.lineNumber + "\r\n";
				if (e.traceCode) g += "  Code: " + e.traceCode + "\r\n";
			}
		}
		if (g == "") return;
		IO.file.appendAllText(file, g + "\r\n");
	};
	b.debug2session = function() {
		var g = [],
			_len = c.length,
			key = "MO_DEBUGS_CACHE",
			mode = Mo.Config.Global.MO_DEBUG_MODE,
			store = mode == "SESSION" ? Session : Application;
		if (_len == 0);
		for (var f = 0; f < _len; f++) {
			var e = c[f];
			if (e.level & d) {
				g.push({
					"number": a(e.Number),
					"datetime": ft2(e.datetime),
					"method": Mo.Method,
					"action": Mo.Action,
					"source": e.Source,
					"message": e.Description,
					"level": h(e.level),
					"filename": e.filename,
					"linenumber": e.lineNumber,
					"code": e.traceCode
				});
			}
		}
		if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) key = Mo.Config.Global.MO_APP_NAME + "_" + key;
		if (g.length > 0) {
			if(mode == "APPLICATION") Application.Lock();
			var debugs = store(key),
				data;
			if (debugs) {
				debugs = debugs.substr(0, debugs.length - 1) + "," + JSON.stringify(g).substr(1);
				if (debugs.length > 2048) {
					var data = JSON.parse(debugs);
					while (data.length > 50) data.shift();
					debugs = JSON.stringify(data);
				}
				store(key) = debugs;
			} else {
				store(key) = JSON.stringify(g);
			}
			if(mode == "APPLICATION") Application.UnLock();
		}
	};
	b.fromSession = function() {
		d = 0;
		var key = "MO_DEBUGS_CACHE", mode = Mo.Config.Global.MO_DEBUG_MODE, store = mode == "SESSION" ? Session : Application;
		if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) key = Mo.Config.Global.MO_APP_NAME + "_" + key;
		if(mode == "APPLICATION") Application.Lock();
		var debugs = store(key);
		store.Contents.Remove(key);
		if(mode == "APPLICATION") Application.UnLock();
		if (!debugs) return "[]";
		return debugs;
	};
	return b
})();

function Exception(b, c, a, d) {
	this.level = d || E_ERROR;
	this.levelString = "E_ERROR";
	this.Number = b || 0;
	if (this.Number < 0) {
		this.Number = this.Number + 0x100000000;
	}
	if(this.Number==0x80040E10) a += " please ensure that you have typed field-name correctly.";
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
		if (d.substr(1, 1) == ":") {
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
		d.absolute = function(path) {
			return d.fso.GetAbsolutePathName(c(path));
		};
		d.base = function(path) {
			return d.fso.GetBaseName(c(path));
		};
		d.build = function(path, name) {
			return d.fso.GetAbsolutePathName(d.fso.BuildPath(c(path), name));
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
		d.files = function(path, callback) {
			if (!d.exists(path)) {
				return [];
			}
			var files = [];
			var fc = new Enumerator(b.fso.getFolder(c(path)).files);
			var isFunc = (typeof callback == "function");
			for (; !fc.atEnd(); fc.moveNext()) {
				if (isFunc) callback(fc.item());
				else files.push(fc.item().path);
			}
			return files;
		};
		return d
	})();
	return b
})();