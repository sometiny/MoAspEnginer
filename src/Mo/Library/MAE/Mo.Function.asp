<script language="jscript" runat="server">
/*
** File: Mo.Function.asp
** Usage: define many method for MAE, such as post, get, server and so on...
** About: 
**		support@mae.im
*/
/*
if(!MO)
{
	var MO = {
		Config:{
			Global : {
				MO_SESSION_WITH_SINGLE_TAG :false,
				MO_APP_NAME : "App",
				MO_APP : "App/",
				MO_CORE : "Mo/"
			}
		}	
	};
}
*/
var GLOBAL = this,
	F = F || (function() {
		var ws = [
			["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
		];
		var ms = [
			["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
			["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""]
		];
		var _post_ = null,
			_get_ = {},
			_server_ = {},
			_activex_ = [],
			_postinited_ = false,
			_required_ = {},
			_included_ = {},
			_post_map_ = null;
		var init = function() {
				if ((typeof fso_global) != "object") _.fso = _.activex("Scripting.FileSystemObject");
				else _.fso = fso_global;
				_.each(Request.QueryString, function(q) {
					_get_[q] = String(this(q));
				});
				_.each(Request.ServerVariables, function(q) {
					var v = String(this(q));
					if (q == "URL" && v.indexOf("?") > 0) v = v.substr(0, v.indexOf("?"));
					_server_[q] = v;
				});
			};
		var _ = {};
		_.TEXT = {
			BR: 1,
			NL: 2,
			BIN: 4,
			NLBR: 1 | 2,
			FILE: 8
		};
		_.fso = null;
		_.exports = {};
		_.vbs = {};
		_.has = function(obj, key) {
			return obj.hasOwnProperty(key);
		};
		_.toString = function() {
			return "v1";
		};
		_.extend = function(src) {
			if (arguments.length < 1) return {};
			if (arguments.length < 2) return src;
			for (var i = 1; i < arguments.length; i++) {
				for (var c in arguments[i]) {
					if (arguments[i].hasOwnProperty(c)) src[c] = arguments[i][c];
				}
			}
			return src;
		};
		_.exists = function(path, folder) {
			if (folder === true) {
				return _.fso.folderexists(_.mappath(path));
			} else {
				return _.fso.fileexists(_.mappath(path));
			}
		};
		_.dispose = function(obj) {
			if (obj != undefined) {
				obj = null;
				return;
			}
			while (_activex_.length > 0) {
				_.dispose(_activex_.pop());
			}
		};
		_.random = function(minValue, maxValue) {
			if (minValue === undefined && maxValue === undefined) return Math.random();
			if (maxValue === undefined) {
				maxValue = minValue;
				minValue = 1;
			}
			return parseInt(Math.random() * (maxValue - minValue + 1)) + minValue;
		};
		_.guid = function(format) {
			format = format || "D"; //NDBP
			var typelib = _.activex("scriptlet.typelib")
			var returnValue = typelib.Guid.replace(/^\{(.+?)\}([\s\S]*)$/i,"$1");
			switch (format.toUpperCase()) {
			case "B":
				return "{"+returnValue+"}";
			case "P":
				return "("+returnValue+")";
			case "N":
				return returnValue.replace(/([^0-9a-z]+)/igm, "");
			default:
				return returnValue
			}
			return returnValue;
		};
		_.mappath = function(path) {
			if (path.length < 2) return Server.MapPath(path)
			if (path.substr(1, 1) == ":") return path;
			return Server.MapPath(path);
		};
		_.activex = function(classid, fn) {
			var $o = null;
			try {
				$o = Server.CreateObject(classid);
				_activex_.push($o);
			} catch (ex) {
				return null;
			}
			if (typeof fn == "function"){
				var returnValue = fn.apply($o, [].slice.apply(arguments).slice(2));
				if(returnValue===undefined)return $o;
				return returnValue;
			}
			return $o;
		};
		_.activex.enabled = function(classid) {
			try {
				Server.CreateObject(classid);
				return true;
			} catch (ex) {
				return false;
			}
		};
		_.stream = function(mode, type) {
			var stream = _.activex("Adodb.Stream");
			if (mode !== undefined) stream.Mode = mode;
			if (type !== undefined) stream.Type = type;
			return stream;
		};
		_.json = function(src, globalvar) {
			var cglobal = false;
			try {
				if (typeof globalvar == "string" && /^([0-9a-z]+)$/igm.test(globalvar)) {
					cglobal = true;
					(new Function(globalvar + " = " + src + ";"))();
				} else {
					return (new Function("return " + src + ";"))();
				}
			} catch (ex) {
				if (!cglobal) return null;
				(new Function(globalvar + " = null;"))();
			}
		};
		_.post = function(key, value) {
			postinit__();
			if (key === undefined) return _post_;
			if (value === null) {
				_.post.remove(key);
				return;
			}
			if (value === undefined) return (_post_map_.hasOwnProperty(key.toUpperCase()) ? _post_[_post_map_[key.toUpperCase()]] : "");
			_post_[key] = value;
			_post_map_[key.toUpperCase()] = key;
			return;
		};
		_.session = function(key, value) {
			if (key === undefined) return "";
			if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) key = Mo.Config.Global.MO_APP_NAME + "_" + key;
			if (value === null) {
				Session.Contents.Remove(key);
				return
			}
			if (value === undefined) {
				if (Session.Contents(key) != undefined) return Session.Contents(key);
				return "";
			}
			Session(key) = value;
		};
		_.get = function(key, value) {
			if (key === undefined) return _get_;
			if (value === null) {
				_.get.remove(key);
				return;
			}
			if (value === undefined) return (_get_.hasOwnProperty(key) ? _get_[key] : "");
			_get_[key] = value;
			return;
		};
		_.all = function(key) {
			if (key == undefined) return "";
			if (_get_.hasOwnProperty(key)) return _.get(key);
			postinit__();
			if (_post_map_.hasOwnProperty(key.toUpperCase())) return _post_[_post_map_[key.toUpperCase()]];
			return "";
		};
		_.server = function(key, value) {
			if (key === undefined) return _server_;
			if (value === null) {
				delete _server_[key];
				return;
			}
			if (value === undefined) return (_server_.hasOwnProperty(key) ? _server_[key] : "");
			_server_[key] = value;
			return;
		};
		_.cookie = function(key, value, expired, domain, path, secure) {
			if (key == undefined) return "";
			var mkey = key,
				skey = "";
			if (key.indexOf(".") > 0) {
				mkey = key.split(".")[0];
				skey = key.split(".")[1];
			}
			if (value === null) {
				Response.Cookies(mkey).Expires = "1980-1-1";
				return;
			}
			if (value === undefined) {
				if (skey == "") return Request.Cookies(mkey).item;
				return Request.Cookies(mkey)(skey);
			}
			if (skey == "") {
				Response.Cookies(mkey) = value;
			} else {
				Response.Cookies(mkey)(skey) = value;
			}
			if(typeof expired=="object" && expired.constructor==Object){
				domain = expired["domain"];
				path = expired["path"];
				secure = expired["secure"];
				expired = expired["expired"];
			}
			if (expired !== undefined && !isNaN(expired)) {
				var dt = new Date();
				dt.setTime(dt.getTime() + parseInt(expired) * 1000);
				Response.Cookies(mkey).Expires = _.format("{0}-{1}-{2} {3}:{4}:{5}", dt.getYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
			}
			if (domain !== undefined) {
				Response.Cookies(mkey).Domain = domain;
			}
			if (path !== undefined) {
				Response.Cookies(mkey).Path = path;
			}
			if (secure !== undefined) {
				Response.Cookies(mkey).Secure = secure;
			}
		};
		_.echo = function(debug, brnl, newline,contenttype) {
			if ((brnl & _.TEXT.BIN)) {
				Response.BinaryWrite(debug);
			} else {
				Response.Write(debug);
			}
			if (brnl === true) {
				Response.Write("<br />");
				if (newline !== false) Response.Write("\r\n");
				return;
			}
			if (isNaN(brnl)) return;
			if (brnl & _.TEXT.BR) Response.Write("<br />");
			if (brnl & _.TEXT.NL) Response.Write("\r\n");
			if (brnl & _.TEXT.FILE){
				Response.ContentType=contenttype || "application/octet-stream";
				Response.AddHeader("Content-Disposition", "attachment; filename=\"" + newline + "\"");
			}
		};
		_.exit = function(debug, brnl, newline) {
			_.echo(debug, brnl, newline);
			Response.End();
		};
		_.format = function(Str) {
			var arg = arguments;
			if (arg.length <= 1) {
				return Str;
			}
			return Str.replace(/\{(\d+)(\.([\w\.\-]+))?(:(.+?))?\}/igm, function(ma) {
				var match = /\{(\d+)(\.([\w\.\-]+))?(:(.+?))?\}/igm.exec(ma);
				if (match && match.length == 6) {
					var argvalue = arg[parseInt(match[1]) + 1];
					if (argvalue === undefined) return "";
					if (typeof argvalue == "object" && match[3] != "") {
						argvalue = (new Function("return this" + "[\"" + match[3].replace(/\./igm, "\"][\"").replace(/\[\"(\d+)\"\]/igm, "[$1]") + "\"]")).call(argvalue);
					}
					if (argvalue==null) return "NULL";
					var argformat = match[5];
					var argtype = (typeof argvalue);
					if (argformat != "") {
						if (argtype == "date" || (argtype == "object" && argvalue.constructor == Date)) {
							return _.formatdate(argvalue, argformat);
						} else if (argtype == "number") {
							if (/^(\d+)$/ig.test(argformat)) return argvalue.toString(argformat);
							var mat2 = /^((\d+)\.)?(D|E|F|X)(\d*)$/igm.exec(argformat);
							if (mat2) {
								if (mat2[3] == "D") {
									var c = (Math.pow(10, parseInt(mat2[4]) + 1) + argvalue).toString();
									argvalue = c.substr(c.length - parseInt(mat2[4]));
								} else if (mat2[3] == "E") {
									if (mat2[4] != "") argvalue = argvalue.toExponential(parseInt(mat2[4]));
									else argvalue = argvalue.toExponential();
								} else if (mat2[3] == "F") {
									if (mat2[4] != "") argvalue = argvalue.toFixed(parseInt(mat2[4]));
									else argvalue = argvalue.toFixed(0);
								} else if (mat2[3] == "X") {
									if (mat2[4] != "") {
										var c = argvalue.toString(16).toUpperCase();
										if (c.length >= parseInt(mat2[4])) return c;
										c = Math.pow(10, parseInt(mat2[4]) + 1).toString() + "" + c;
										argvalue = c.substr(c.length - parseInt(mat2[4]));
									} else {
										argvalue = argvalue.toString(16).toUpperCase();
									}
								}
								if (mat2[2] != "") {
									var l = parseInt(mat2[2]);
									while (argvalue.length < l) {
										argvalue = "0" + argvalue;
									}
								}
							}
						} else if (argtype == "string") {
							if (!isNaN(argformat)) {
								var l = parseInt(argformat);
								while (argvalue.length < l) {
									argvalue = "0" + argvalue;
								}
							}
						}
					}
					return argvalue;
				}
				return ma;
			});
		};
		_.redirect = function(url, msg) {
			if (msg == undefined) msg = "";
			msg = msg + "";
			if (msg != "") {
				msg = _.encode(msg);
				_.echo("<s" + "cript type=\"text/javascript\">alert(decodeURIComponent(\"" + msg + "\"));window.location=decodeURIComponent(\"" + _.encode(url) + "\");</s" + "cript>");
			} else {
				Response.Redirect(url);
			}
			Response.End();
		};
		_["goto"] = function(url, msg) {
			if (msg == undefined) msg = "";
			msg = msg + "";
			if (msg != "") {
				msg = _.encode(msg);
				_.echo("<s" + "cript type=\"text/javascript\">alert(decodeURIComponent(\"" + msg + "\"));window.location=decodeURIComponent(\"" + _.encode(url) + "\");</s" + "cript>");
			} else {
				_.echo("<s" + "cript type=\"text/javascript\">window.location=decodeURIComponent(\"" + _.encode(url) + "\");</s" + "cript>");
			}
		};
		_.vendor = function(library){
			return _.require.call(this,library,[Mo.Config.Global.MO_APP + "Library/Vendor/", Mo.Config.Global.MO_CORE + "Library/Vendor/"]);
		};
		_.require = function(library, path) {
			if (_required_[library] === true) return;
			if (library.length > 2 && library.substr(1, 1) == ":" && _.fso.fileexists(library)) {
				path = library.substr(0, library.lastIndexOf("\\") + 1);
				library = library.substr(library.lastIndexOf("\\") + 1);
			}
			if (!/^([\w\/\.\-]+)$/.test(library)) {
				ExceptionManager.put(new Exception(0, "F.require", "library '" + library + "' format error."));
				return null;
			}
			var _statement = "",
				_targetPaths = [],
				_path = "";
				
			if (path) _targetPaths = _targetPaths.concat(path);
			else _targetPaths = _targetPaths.concat([Mo.Config.Global.MO_APP + "Library/Extend/", Mo.Config.Global.MO_CORE + "Library/Extend/"]);
			for (var i = 0; i < _targetPaths.length; i++) {
				_path = _.mappath(_targetPaths[i] + library);
				if (_.fso.fileexists(_path)) break;
				_path = _.mappath(_targetPaths[i] + library + ".js");
				if (_.fso.fileexists(_path)) break;
				if (_.fso.folderexists(_.mappath(_targetPaths[i] + library))) {
					_path = _.mappath(_targetPaths[i] + library + "/index.js");
					if (_.fso.fileexists(_path)) break;
				}
			}
			if (_path=="" || !_.fso.fileexists(_path)) {
				ExceptionManager.put(new Exception(0, "F.require", "required library '" + library + "' is not exists."));
				return _.exports;
			}
			_statement = _.string.fromFile(_path);
			_statement = _statement.replace(/^(\s*)<sc(.+)>/ig, "").replace(/<\/script>(\s*)$/ig, "");
			try {
				var this_ = this;
				if (this == F) this_ = null;
				_required_[library] = true;
				return (new Function("exports", "__FILE__", "__DIR__", _statement))(
				this_ || _.exports, _path, _path == "" ? "" : _path.substr(0, _path.lastIndexOf("\\"))) || _.exports;
			} catch (ex) {
				ExceptionManager.put(ex, "F.require");
				return _.exports;
			}
		};
		_.include = function(path, charset) {
			if (_included_[path] === true) return true;
			try {
				path = _.mappath(path);
				if (!_.fso.fileexists(path)) {
					ExceptionManager.put(new Exception(0, "F.include", "file not exists:" + path));
					return false;
				}
				var iscached = false;
				var src;
				if (_.cache.enabled && _.cache.exists(path)) {
					src = _.cache.read(path);
					if (src != null) iscached = true;
				}
				if (!iscached) {
					src = _.string.fromFile(path, charset || "utf-8");
					src = src.replace(/^(\s*)<sc(.+)>/ig, "").replace(/<\/script>(\s*)$/ig, "");
					if (src == "") {
						ExceptionManager.put(new Exception(0, "F.include", "read file failed:" + path));
						return false;
					}
				}
				if (_.execute.call(path, src)) {
					if (!iscached && _.cache.enabled) _.cache.write(path, src);
					return _included_[path] = true;
				} else {
					return false;
				}
			} catch (ex) {
				ExceptionManager.put(ex, "F.include");
				return false;
			}
		};
		_.execute = function() {
			if (arguments.length < 1) return false;
			try {
				var path = this;
				if (this == F) path = "";
				var dir = path == "" ? "" : path.substr(0, path.lastIndexOf("\\"));
				var args, src = (args = [].slice.apply(arguments)).shift();
				var __FILE__ = path,
					__DIR__ = dir;
				eval(src);
				var exports = exports || args;
				if (exports.constructor == Array && exports.length > 0) {
					for (var i = 0; i < exports.length; i++) {
						(new Function("sc", exports[i] + " = sc;"))(eval(exports[i]));
					}
				} else if (exports.constructor == String) {
					(new Function("sc", exports + " = sc;"))(eval(exports));
				}
				return true;
			} catch (ex) {
				ExceptionManager.put(ex, "F.execute");
				return false;
			}
		};
		_.globalize = function(src, cname) {
			if (cname === undefined) return;
			if (typeof cname == "string") cname = [cname];
			else if (typeof cname == "object" && cname.constructor == Array) {} else return;
			if (typeof src == "string") src = eval(src);
			for (var i = 0; i < cname.length; i++) {
				(new Function("src", cname[i] + " = src;"))(src);
			}
		};
		_.initialize = function(name) {
			if (typeof name == "string") name = eval(name);
			return typeof name == "object" ? name : new name();
		};
		_.encode = function(src) {
			src = src || "";
			return encodeURIComponent(src).replace(/\+/, "%2B");
		};
		_.decode = function(src) {
			src = src || "";
			return decodeURIComponent(src);
		};
		_.encodeHtml = function(src) {
			src = src || "";
			var ret = src.replace(/&/igm, "&amp;");
			ret = ret.replace(/>/igm, "&gt;");
			ret = ret.replace(/</igm, "&lt;");
			ret = ret.replace(/ /igm, "&nbsp;");
			ret = ret.replace(/\"/igm, "&quot;");
			ret = ret.replace(/\u00a9/igm, "&copy;");
			ret = ret.replace(/\u00ae/igm, "&reg;");
			ret = ret.replace(/\u00b1/igm, "&plusmn;");
			ret = ret.replace(/\u00d7/igm, "&times;");
			ret = ret.replace(/\u00a7/igm, "&sect;");
			ret = ret.replace(/\u00a2/igm, "&cent;");
			ret = ret.replace(/\u00a5/igm, "&yen;");
			ret = ret.replace(/\u2022/igm, "&middot;");
			ret = ret.replace(/\u20ac/igm, "&euro;");
			ret = ret.replace(/\u00a3/igm, "&pound;");
			ret = ret.replace(/\u2122/igm, "&trade;");
			return ret
		};
		_.decodeHtml = function(src) {
			src = src || "";
			var ret = src.replace(/&amp;/igm, "&");
			ret = ret.replace(/&gt;/igm, ">");
			ret = ret.replace(/&lt;/igm, "<");
			ret = ret.replace(/&nbsp;/igm, " ");
			ret = ret.replace(/&quot;/igm, "\"");
			ret = ret.replace(/&copy;/igm, "\u00a9");
			ret = ret.replace(/&reg;/igm, "\u00ae");
			ret = ret.replace(/&plusmn;/igm, "\u00b1");
			ret = ret.replace(/&times;/igm, "\u00d7");
			ret = ret.replace(/&sect;/igm, "\u00a7");
			ret = ret.replace(/&cent;/igm, "\u00a2");
			ret = ret.replace(/&yen;/igm, "\u00a5");
			ret = ret.replace(/&middot;/igm, "\u2022");
			ret = ret.replace(/&euro;/igm, "\u20ac");
			ret = ret.replace(/&pound;/igm, "\u00a3");
			ret = ret.replace(/&trade;/igm, "\u2122");
			return ret
		};
		_.jsEncode = function(str) {
			if (str == undefined) return "";
			if (str == "") return "";
			var i, j, aL1, aL2, c, p, ret = "";
			aL1 = Array(0x22, 0x5C, 0x2F, 0x08, 0x0C, 0x0A, 0x0D, 0x09);
			aL2 = Array(0x22, 0x5C, 0x2F, 0x62, 0x66, 0x6E, 0x72, 0x74);
			for (i = 0; i < str.length; i++) {
				p = true;
				c = str.substr(i, 1);
				for (j = 0; j <= 7; j++) {
					if (c == String.fromCharCode(aL1[j])) {
						ret += "\\" + String.fromCharCode(aL2[j]);
						p = false;
						break;
					}
				}
				if (p) {
					var a = c.charCodeAt(0);
					if (a > 31 && a < 127) {
						ret += c;
					} else if (a > -1 || a < 65535) {
						var slashu = a.toString(16);
						while (slashu.length < 4) {
							slashu = "0" + slashu;
						}
						ret += "\\u" + slashu;
					}
				}
			}
			return ret;
		};
		_.formatdate = function(dt, fs) {
			if (dt !== null) {
				var src = dt;
				if (typeof dt == "object" && dt.constructor == Date) {

				} else {
					if (typeof dt != "date") {
						if (!isNaN(dt)) {
							dt = new Date(parseInt(dt));
						} else {
							try {
								dt = new Date(dt);
							} catch (ex) {
								ExceptionManager.put(ex, "F.formatdate");
								return "";
							}
						}
					} else {
						dt = new Date(dt - 0);
					}
				}
			} else {
				dt = new Date();
			}
			if (isNaN(dt.getFullYear())) dt = new Date();
			var y = [dt.getFullYear()],
				m = [dt.getMonth() + 1],
				d = [dt.getDate()],
				h = [dt.getHours()],
				n = [dt.getMinutes()],
				s = [dt.getSeconds()],
				w = dt.getDay(),
				t = [dt.getMilliseconds()],
				H = [dt.getHours() % 12];

			y[1] = y[0];
			m[1] = _.string.right("0" + m[0], 2);
			d[1] = _.string.right("0" + d[0], 2);
			h[1] = _.string.right("0" + h[0], 2);
			H[1] = _.string.right("0" + H[0], 2);
			n[1] = _.string.right("0" + n[0], 2);
			s[1] = _.string.right("0" + s[0], 2);

			fs = fs.replace(/dddd/g, "{````}");
			fs = fs.replace(/ddd/g, "{```}");
			fs = fs.replace(/MMMM/g, "{~~~~}");
			fs = fs.replace(/MMM/g, "{~~~}");
			fs = fs.replace(/yyyy/g, y[0]);
			fs = fs.replace(/yy/g, y[1]);
			fs = fs.replace(/ss/g, s[1]);
			fs = fs.replace(/s/g, s[0]);
			fs = fs.replace(/MM/g, m[1]);
			fs = fs.replace(/M/g, m[0]);
			fs = fs.replace(/HH/g, h[1]);
			fs = fs.replace(/H/g, h[0]);
			fs = fs.replace(/hh/g, H[1]);
			fs = fs.replace(/h/g, H[0]);
			fs = fs.replace(/mm/g, n[1]);
			fs = fs.replace(/m/g, n[0]);
			fs = fs.replace(/tttt/g, t[0]);
			fs = fs.replace(/dd/g, d[1]);
			fs = fs.replace(/d/g, d[0]);
			fs = fs.replace(/\{````\}/g, ws[0][w]);
			fs = fs.replace(/\{```\}/g, ws[1][w]);
			fs = fs.replace(/\{~~~~\}/g, ms[0][m[0] - 1]);
			fs = fs.replace(/\{~~~\}/g, ms[1][m[0] - 1]);
			return fs;
		};
		_.date = function(srcDate) {
			return new _.datetime(srcDate);
		};
		_.date.timezone = new Date().getTimezoneOffset() / 60;
		_.date.format = function() {
			return _.formatdate.apply(this, arguments);
		};
		_.date.firstweekdayofmonth = function(srcDate) {
			var date_ = new Date(srcDate - 0);
			return (new Date(date_.getFullYear(), date_.getMonth(), 1)).getDay();
		};
		_.date.firstweekdayoflastmonth = function(srcDate) {
			var date_ = new Date(srcDate - 0);
			return _.date.firstweekdayofmonth(new Date(date_.getFullYear(), date_.getMonth(), 1) - 12 * 3600000);
		};
		_.date.parse = function(srcDate) {
			if (typeof srcDate == "string") {
				srcDate = srcDate.replace(/(\-|\s|\:|\.)0/ig, "$1");
				var match = /^(\d{4})\-(\d{1,2})\-(\d{1,2})( (\d{1,2})\:(\d{1,2})\:(\d{1,2})(\.(\d{1,3}))?)?$/.exec(srcDate);
				if (match) {
					try {
						if (match[4] == "") {
							srcDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
						} else {
							srcDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), parseInt(match[5]), parseInt(match[6]), parseInt(match[7]), (match[8] == "" ? 0 : parseInt(match[9])));
						}
					} catch (ex) {
						ExceptionManager.put(ex, "F.date.parse(string)");
						return null;
					}
				} else {
					ExceptionManager.put(0x000001B9, "F.date.parse(string)", "argument format error.");
					return null;
				}
			}
			var date_ = new Date(srcDate - 0);
			var obj_ = {
				ticks: date_ - 0,
				year: date_.getFullYear(),
				month: date_.getMonth(),
				day: date_.getDate(),
				hour: date_.getHours(),
				minute: date_.getMinutes(),
				second: date_.getSeconds(),
				ms: date_.getMilliseconds(),
				weekday: date_.getDay()
			};
			obj_["yeardays"] = _.date.datediff("d", new Date(obj_.year, 0, 1), date_) + 1;
			obj_["season"] = (obj_.month - obj_.month % 3) / 3 + 1;
			var firstday = new Date(obj_.year, 0, 1);
			if (firstday.getDay() == 0) {
				obj_["weeks"] = (obj_.yeardays - obj_.yeardays % 7) / 7 + (obj_.yeardays % 7 == 0 ? 0 : 1)
			} else {
				var ndays = obj_.yeardays - 7 + firstday.getDay();
				obj_["weeks"] = (ndays - ndays % 7) / 7 + (ndays % 7 == 0 ? 0 : 1) + 1;
			}
			return obj_;
		};
		_.date.datediff = function(diff, src1, src2) {
			var miisecond = new Date(src2 - 0) - new Date(src1 - 0);
			switch (diff) {
			case "s":
				return (miisecond - miisecond % 1000) / 1000;
			case "m":
				return (miisecond - miisecond % 60000) / 60000;
			case "h":
				return (miisecond - miisecond % 3600000) / 3600000;
			case "d":
				return (miisecond - miisecond % 86400000) / 86400000;
			case "w":
				return (miisecond - miisecond % 604800000) / 604800000;
			case "M":
				return src2.getFullYear() * 12 + src2.getMonth() - src1.getFullYear() * 12 - src1.getMonth();
			case "y":
				return src2.getFullYear() - src1.getFullYear();
			}
			return miisecond;
		};
		_.date.dateadd = function(diff, value, srcDate) {
			var date_ = _.date.parse(srcDate);
			switch (diff) {
			case "ms":
				return new Date(date_.ticks - value * -1);
			case "s":
				return new Date(date_.ticks - value * -1000);
			case "m":
				return new Date(date_.ticks - value * -60000);
			case "h":
				return new Date(date_.ticks - value * -3600000);
			case "d":
				return new Date(date_.ticks - value * -86400000);
			case "w":
				return new Date(date_.ticks - value * -604800000);
			case "M":
				return new Date(date_.year, date_.month + value, date_.day, date_.hour, date_.minute, date_.second, date_.ms);
			case "y":
				return new Date(date_.year + value, date_.month, date_.day, date_.hour, date_.minute, date_.second, date_.ms);
			}
			return srcDate;
		};
		_.datetime = function(srcDate) {
			var date_ = _.date.parse(srcDate);
			for (var i in date_) {
				if (!date_.hasOwnProperty(i)) continue;
				this[i] = date_[i];
			}
		};
		_.datetime.prototype.add = function(diff, value) {
			return _.date.call(this, _.date.dateadd(diff, value, this.ticks));
		};
		_.datetime.prototype.diff = function(diff, srcdate) {
			return _.date.datediff(diff, srcdate, this.ticks);
		};
		_.datetime.prototype.toString = function(format) {
			if (format) return _.formatdate(this.ticks, format);
			return (new Date(this.ticks)).toString();
		};

		_.untimespan = function(ts, format) {
			if (format === undefined) format = "yyyy-MM-dd HH:mm:ss"
			return _.formatdate(new Date(ts * 1000), format);
		};
		_.timespan = function(src) {
			src = _.date.parse(src || new Date());
			return (src.ticks - (src.ticks % 1000)) / 1000;
		};
		_.each = function(src, fn, state) {
			if (typeof fn != "function") return;
			var e = new Enumerator(src);
			for (; !e.atEnd(); e.moveNext()) {
				if (fn.apply(src, [e.item(), src, state]) === false) break;
			}
			e = null;
		};
		_.foreach = function(src, fn, state) {
			if (typeof fn != "function") return;
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				if (fn.apply(src, [i, src[i], state]) === false) break;
			}
		};
		_.safe = function(src) {
			src = src || "";
			return src.replace(/\'/igm, "").replace(/((^[\s]+)|([\s]+$))/igm, "").replace(/[\r\n]+/igm, "").replace(/>/igm, "&gt;").replace(/</igm, "&lt;");
		};

		_.cache = {};
		_.cache.enabled = false;
		_.cache.write = function(key, value) {
			if (!_.cache.enabled) return;
			Application.Lock();
			Application(key) = value;
			Application.UnLock();
		};
		_.cache.read = function(key) {
			if (Application.Contents(key) != undefined) return Application.Contents(key);
			return null;
		};
		_.cache.exists = function(key) {
			return Application.Contents(key) != undefined;
		};
		_.cache.clear = function(key) {
			if (key != undefined && (typeof key == "string") && key.length > 0) {
				if (key.substr(key.length - 1) == ".") {
					var list = [];
					_.each(Application.Contents, function(q) {
						if (q.length > key.length && q.substr(0, key.length) == key) list.push(q);
					});
					_.each(list, function(q) {
						Application.Contents.Remove(q);
					});
					return list.length;
				}
				Application.Contents.Remove(key);
				return;
			}
			var all = [];
			_.each(Application.Contents, function(q) {
				all.push(q);
			});
			_.each(all, function(q) {
				Application.Contents.Remove(q);
			});
			return all.length;
		};


		_.sortable = {};
		_.sortable.data__ = [];
		_.sortable.add = function(v) {
			_.sortable.data__.push(v);
		};
		_.sortable.clear = function() {
			while (_.sortable.data__.length > 0) {
				_.sortable.data__.pop();
			}
		};
		_.sortable.sort = function(asc) {
			if (asc == undefined) asc = true;
			_.sortable.data__ = _.sortable.data__.sort(function(a, b) {
				if (a > b == asc) return 1;
				if (a == b) return 0;
				if (a < b == asc) return -1;
			});
		};
		_.sortable.join = function(c) {
			return _.sortable.data__.join(c || "");
		};


		_.timer = {};
		_.timer.start = null;
		_.timer.end = null;
		_.timer.run = function() {
			this.start = new Date();
			return this.start;
		};
		_.timer.stop = function(start) {
			this.end = new Date();
			return this.end - (start || this.start);
		};

		_.replace = function(src, search, replacement) {
			if (typeof search == "object") return src.replace(search, replacement);
			var rv = "",
				r = "";
			while (src.indexOf(search) >= 0) {
				r = src.substr(0, src.indexOf(search) + search.length);
				if (r.length < src.length) src = src.substr(r.length);
				else src = "";
				rv += r.replace(search, replacement);
			}
			return rv + src;
		};
		_.string = {};
		_.string.left = function(src, len) {
			src = src || "";
			if (typeof len == "number") {
				if (src.length <= len) return src;
				return src.substr(0, len);
			}
			if (typeof len == "string") {
				if (src.indexOf(len) < 0) return src;
				return src.substr(0, src.indexOf(len));
			}
			return src;
		};
		_.string.right = function(src, len) {
			src = src || "";
			if (typeof len == "number") {
				if (src.length <= len) return src;
				return src.substr(src.length - len);
			}
			if (typeof len == "string") {
				if (src.indexOf(len) < 0) return src;
				return src.substr(src.lastIndexOf(len) + len.length);
			}
			return src;
		};
		_.string.startWith = _.string.startsWith = function(src, opt) {
			if (src == "") return false;
			if (opt === undefined) return false;
			if (opt.length > src) return false;
			if (src.substr(0, opt.length) == opt) return true;
			return false;
		};
		_.string.endWith = _.string.endsWith = function(src, opt) {
			if (src == "") return false;
			if (opt === undefined) return false;
			if (opt.length > src) return false;
			if (src.substr(src.length - opt.length) == opt) return true;
			return false;
		};
		_.string.trim = function(src, opt) {
			return _.string.trimLeft(_.string.trimRight(src, opt), opt);
		};
		_.string.trimLeft = function(src, opt) {
			if (src == "") return "";
			if (opt === undefined) return src.replace(/^(\s+)/igm, "");
			if (_.string.startWith(src, opt)) {
				if (src == opt) return "";
				return _.string.trimLeft(src.substr(opt.length), opt);
			}
			return src;
		};
		_.string.trimRight = function(src, opt) {
			if (src == "") return "";
			if (opt === undefined) return src.replace(/(\s+)$/igm, "");
			if (_.string.endWith(src, opt)) {
				if (src == opt) return "";
				return _.string.trimRight(src.substr(0, src.length - opt.length), opt);
			}
			return src;
		};
		_.string.format = function() {
			return _.format.apply(F, arguments);
		};
		_.string.email = function(str) {
			return _.string.exp(str, /^([\w\.\-]+)@([\w\.\-]+)$/);
		};
		_.string.url = function(str) {
			return _.string.exp(str, /^http(s)?\:\/\/(.+?)$/i);
		};
		_.string.test = function(str, exp, option) {
			exp = _.string.exp_(exp, option);
			if (exp == null) return false;
			return exp.test(str);
		};
		_.string.replace = function(src, exp, option, replacement) {
			if (arguments.length == 3) {
				replacement = option;
				option = "";
			}
			src = src || "";
			if (typeof exp != "object") {
				exp = exp + "";
				exp = _.string.exp_(exp, option) || exp;
			}
			return src.replace(exp, replacement);
		};
		_.string.matches = function(src, exp, option,fn) {
			var ref=null;
			if(typeof option=="function")
			{
				if(fn) ref = fn;
				fn = option;
				option = ""; 
			}
			exp = _.string.exp_(exp, option);
			if (exp == null) return null;
			if (!exp.global) return exp.exec(src);
			var ret = [],
				result = exp.exec(src);
			while (result) {
				if(typeof fn=="function")
				{
					fn.apply(ref || result,result);
				}
				else
				{
					ret.push(result);
				}
				result = exp.exec(src);
			}
			return ret;
		};
		_.string.exp = function(str, exp, option) {
			if (typeof exp != "object") {
				if (typeof exp !== "string") return "";
				exp = _.string.exp_(exp, option);
				if (exp == null) return "";
			}
			str = str || "";
			return (exp.test(str) ? str : "");
		};
		_.string.exp_ = function(exp, option) {
			if (typeof exp == "object") return exp;
			option = option || "";
			if (!/^\/(.+)\/([igm]*)$/.test(exp)) exp = "/" + exp + "/" + option;
			try {
				return (new Function("return " + exp + ";"))()
			} catch (ex) {
				ExceptionManager.put(ex, "F.string.exp_");
				return null;
			}
			return exp;
		};
		_.string.fromBinary = function(bin, charset) {
			var byts, stream = _.stream(3, 1);
			stream.Open();
			stream.Write(bin);
			stream.Position = 0;
			stream.Type = 2;
			stream.CharSet = charset || "utf-8";
			byts = stream.ReadText();
			stream.Close();
			stream = null;
			return byts;
		};
		_.string.fromFile = function(path, charset) {
			if (!_.fso.fileexists(path)) return "";
			var byts, stream = _.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			stream.LoadFromFile(path);
			stream.Position = 0;
			byts = stream.ReadText();
			stream.Close();
			stream = null;
			return byts;
		};
		_.string.saveToFile = function(path, content, charset) {
			var byts, stream = _.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			stream.writetext(content)
			stream.savetofile(path, 2);
			stream.Close();
			stream = null;
		};
		_.string.appendToFile = function(path, content, charset) {
			var byts, stream = _.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			if (!_.fso.fileexists(path)) {
				stream.LoadFromFile(path);
				stream.Position = stream.Size;
			}
			stream.writetext(content)
			stream.savetofile(path, 2);
			stream.Close();
			stream = null;
		};
		_.string.getByteArray = function(string) {
			if (string == "") return [];
			var enc = _.encode(string);
			var byteArray = [];
			for (var i = 0; i < enc.length; i++) {
				if (enc.substr(i, 1) == "%") {
					byteArray.push(parseInt(enc.substr(i + 1, 2), 16));
					i += 2;
				} else {
					byteArray.push(enc.charCodeAt(i));
				}
			}
			return byteArray;
		};
		_.string.fromByteArray = function(byteArray) {
			if (byteArray.constructor != Array || byteArray.length <= 0) return "";
			var string = "";
			for (var i = 0; i < byteArray.length; i++) {
				string += "%" + byteArray[i].toString(16);
			}
			return _.decode(string);
		};

		_.base64 = (function() {
			var base64keyStr_ = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var encode_ = function(Str) {
					var output = "";
					var chr1, chr2, chr3 = "";
					var enc1, enc2, enc3, enc4 = "";
					var i = 0;
					do {
						chr1 = Str[i++];
						chr2 = Str[i++];
						chr3 = Str[i++];
						enc1 = chr1 >> 2;
						enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
						enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
						enc4 = chr3 & 63;
						if (isNaN(chr2)) {
							enc3 = enc4 = 64;
						} else if (isNaN(chr3)) {
							enc4 = 64;
						}
						output = output + base64keyStr_.charAt(enc1) + base64keyStr_.charAt(enc2) + base64keyStr_.charAt(enc3) + base64keyStr_.charAt(enc4);
						chr1 = chr2 = chr3 = "";
						enc1 = enc2 = enc3 = enc4 = "";
					} while (i < Str.length);
					return output;
				};
			var decode_ = function(Str) {
					var output = [];
					var chr1, chr2, chr3 = "";
					var enc1, enc2, enc3, enc4 = "";
					var i = 0;
					do {
						enc1 = base64keyStr_.indexOf(Str.charAt(i++));
						if(enc1<0)continue;
						enc2 = base64keyStr_.indexOf(Str.charAt(i++));
						if(enc2<0)continue;
						enc3 = base64keyStr_.indexOf(Str.charAt(i++));
						if(enc3<0)continue;
						enc4 = base64keyStr_.indexOf(Str.charAt(i++));
						if(enc4<0)continue;
						chr1 = (enc1 << 2) | (enc2 >> 4);
						chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
						chr3 = ((enc3 & 3) << 6) | enc4;
						output.push(chr1);
						if (enc3 != 64) {
							output.push(chr2);
						}
						if (enc4 != 64) {
							output.push(chr3);
						}
						chr1 = chr2 = chr3 = "";
						enc1 = enc2 = enc3 = enc4 = "";
					} while (i < Str.length);
					return output;
				};
			var $node = _.activex("MSXML2.DOMDocument", function() {
				this.loadXML("<?xml version=\"1.0\" encoding=\"gb2312\"?><root xmlns:dt=\"urn:schemas-microsoft-com:datatypes\"><data dt:dt=\"bin.base64\"></data></root>");
				return this.selectSingleNode("//root/data");
			}),
				$base64 = {};
			$base64.e = encode_;
			$base64.d = decode_;
			$base64.encode = function(Str) {
				if (typeof Str == "string") Str = _.string.getByteArray(Str);
				return encode_(Str);
			};
			$base64.decode = function(Str) {
				return _.string.fromByteArray(decode_(Str));
			};
			$base64.toBinary = function(str) {
				$node.text = str;
				return $node.nodeTypedValue;
			};
			$base64.fromBinary = function(str) {
				$node.nodeTypedValue = str;
				return $node.text;
			};
			return $base64;
		})();
		var dumpHelper__ = function(l) {
				var returnValue = "";
				for (var i = 0; i < l; i++) returnValue += "  ";
				return returnValue;
			};
		var dump__ = function(parm, level) {
				if (level === undefined) level = 1;
				if (parm === undefined) return "undefined";
				//constructor
				switch (typeof parm) {
				case "string":
					return "string(\"" + parm + "\")";
				case "number":
					return "number(" + parm.toString() + ")";
				case "boolean":
					return "boolean(" + parm.toString() + ")";
				case "date":
					return "date(" + (new Date(parm)).toString() + ")";
				case "function":
					return "[Function]"
				}
				if (parm === null) return "NULL";
				if (typeof parm == "object") {
					if ((parm instanceof ActiveXObject) && (typeof(parm.Count) == "number") && (typeof(parm.Keys) == "unknown") && (typeof(parm.Items) == "unknown") && (typeof(parm.Key) == "unknown") && (typeof(parm.Item) == "unknown")) {
						var returnValue = "dictionary{\r\n";
						_.each(parm, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this(i), level + 1) + "\r\n";
						});
						returnValue += dumpHelper__(level - 1) + "}";
						return returnValue;
					}
					if (parm instanceof ActiveXObject){
						return "[ActiveXObject]";
					}
					if (parm.constructor == Date) {
						return "date(" + parm.toString() + ")";
					}
					if (parm.constructor == Array) {
						var returnValue = "array(" + parm.length + "){\r\n";
						_.foreach(parm, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						returnValue += dumpHelper__(level - 1) + "}";
						return returnValue;
					}
					if (parm.constructor == Object) {
						var returnValue = "object{\r\n";
						_.foreach(parm, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						returnValue += dumpHelper__(level - 1) + "}";
						return returnValue;
					}
					if (parm.toString() == "[object Object]") {
						if (parm.constructor == DataTable) {
							var returnValue = "DataTable{\r\n";
							returnValue += dumpHelper__(level) + "[pagesize] => " + dump__(parm.pagesize, level + 1) + ",\r\n";
							returnValue += dumpHelper__(level) + "[recordcount] => " + dump__(parm.recordcount, level + 1) + ",\r\n";
							returnValue += dumpHelper__(level) + "[currentpage] => " + dump__(parm.currentpage, level + 1) + ",\r\n";
							returnValue += dumpHelper__(level) + "[LIST__] => " + dump__(parm["LIST__"], level + 1) + "\r\n";
							returnValue += dumpHelper__(level - 1) + "}";
							return returnValue;
						}
						if (parm.constructor == DataTableRow) {
							var returnValue = "DataTableRow{\r\n";
							returnValue += dumpHelper__(level) + "[pk] => " + dump__(parm.pk, level + 1) + ",\r\n";
							returnValue += dumpHelper__(level) + "[table] => " + dump__(parm.table, level + 1) + "\r\n";
							returnValue += dumpHelper__(level - 1) + "}";
							return returnValue;
						}
						var returnValue = "[object Object]{\r\n";
						_.foreach(parm, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						_.foreach(parm.constructor.prototype, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						returnValue += dumpHelper__(level - 1) + "}";
						return returnValue;
					}
				}
				if (typeof parm == "unknown") {
					try{
						if (parm.constructor == VBArray) {
							var returnValue = "array{\r\n";
							_.foreach((new VBArray(parm)).toArray(), function(i) {
								returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
							});
							returnValue += dumpHelper__(level - 1) + "}";
							return returnValue;
						}
					}catch(ex){
						return "unknown(" + parm + ")";
					}
				}
				return "unknown(object)";
			};
		_.dump = function(parm, returnValue) {
			var value = dump__(parm, 1);
			if (returnValue === true) return value;
			_.echo(value);
		};

		_.object = {};
		_.object.sort = function(src, asc) {
			_.sortable.data__ = _.object.keys(src);
			_.sortable.sort(asc);
			var new_ = {};
			for (var i = 0; i < _.sortable.data__.length; i++) {
				new_[_.sortable.data__[i]] = src[_.sortable.data__[i]];
			}
			return new_;
		};
		_.object.keys = function(src) {
			var returnValue = [];
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				returnValue.push(i);
			}
			return returnValue;
		};
		_.object.values = function(src) {
			var returnValue = [];
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				returnValue.push(src[i]);
			}
			return returnValue;
		};
		_.object.toArray = function(src, key, value) {
			var returnValue = [];
			key = key || "key";
			value = value || "value";
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				returnValue.push((function(m, k, v) {
					var obj = new Object();
					obj[k] = m;
					obj[v] = src[m];
					return obj;
				})(i, key, value));
			}
			return returnValue;
		};
		_.object.toURIString = function(src, charset) {
			var fn = charset == "utf-8" ? _.encode : escape;
			if (_.object.toURIString.fn == 0) fn = function(src) {
				return src;
			};
			var returnValue = "";
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				var cn = true;
				for (var j = 0; j < _.object.toURIString.filter.length; j++) {
					if (_.object.toURIString.filter[j].substr(0, 1) == "!" && i == _.object.toURIString.filter[j].substr(1)) cn = false;
					if (_.object.toURIString.filter[j].substr(0, 1) == "@" && !_.string.startWith(i, _.object.toURIString.filter[j].substr(1))) cn = false;
					if (!cn) break;
				}
				if (cn) returnValue += fn(i) + _.object.toURIString.split_char_1 + fn(src[i]) + _.object.toURIString.split_char_2;
			}
			if (returnValue != "") returnValue = returnValue.substr(0, returnValue.length - 1);
			return returnValue;
		};
		_.object.fromURIString = function(src) {
			var obj={};
			var ucs = src.split(_.object.toURIString.split_char_2);
			for (var i = 0; i < ucs.length; i++) {
				if (ucs[i].indexOf(_.object.toURIString.split_char_1) > 0) {
					obj[_.decode(ucs[i].substr(0, ucs[i].indexOf(_.object.toURIString.split_char_1)))] = _.decode(_.string.trimLeft(ucs[i].substr(ucs[i].indexOf(_.object.toURIString.split_char_1)), _.object.toURIString.split_char_1));
				}
			}
			return obj;
		};
		_.dbl = function(value, default_) {
			if (value == "") return (default_ === undefined ? 0 : default_);
			if (isNaN(value)) return (default_ === undefined ? 0 : default_);
			return parseFloat(value);
		};
		_.bool = function(value, default_) {
			if (value == null) return !!(default_ || false);
			if (typeof value == "number") return value != 0;
			if (typeof value == "boolean") return value;
			if (typeof value != "string") return false;
			if (value == "") return !!(default_ || false);
			return (value.toLowerCase() === "true" ? true : false);
		};
		_["int"] = function(value, default_, islist) {
			if (islist !== true) islist = false;
			value = String(value).replace(/\s/igm, "");
			if (value == "") return (default_ === undefined ? 0 : default_);
			if (!islist) {
				if (isNaN(value)) return (default_ === undefined ? 0 : default_);
				return parseInt(value);
			} else {
				if (!/^([\d\,]+)$/.test(value)) return (default_ === undefined ? 0 : default_);
				return (value);
			}
		};
		_.md5 = function(src) {
			if (!_.exports.md5) _.require("md5");
			if (!_.exports["md5"]) {
				ExceptionManager.put(0x000003A8, "F.md5", "can not load 'md5' method.");
				return "";
			}
			return _.exports.md5(src);
		};
		_.md5_bytes = function(src) {
			if (!_.exports.md5_bytes) _.require("md5");
			if (!_.exports["md5"]) {
				ExceptionManager.put(0x000003A8, "F.md5", "can not load 'md5' method.");
				return "";
			}
			return _.exports.md5_bytes(src);
		};
		_.delgate = function() {
			try {
				var args, body = (args = Array.prototype.slice.apply(arguments)).pop();
				return new Function(args, body);
			} catch (ex) {
				ExceptionManager.put(ex.number, "F.func", ex.description + " function body [ " + body + " ]");
			}
		};
		_.lambda = function(src) {
			if (arguments.length == 0) return new Function();
			if (arguments.length == 1 && typeof src == "string") {
				var exp_ = /^(\()?([\w\,\s]*?)(\))?(\s*)\=\>(\s*)(\{)?([\s\S]+?)(\})?(\s*)$/igm;
				var match = null;
				if (match = exp_.exec(src)) {
					if (match[2] == "" && match[1] == "") ExceptionManager.put(0, "F.lambda", "[Notice] '()' for arguments is missed in expression [ " + src + " ].");
					if (match[2].indexOf(",") > 0 && match[1] == "") ExceptionManager.put(0, "F.lambda", "[Notice] '()' for arguments is missed in expression [ " + src + " ].");
					var body = match[7],
						bodytemp = body;
					body = _.string.trim(body);
					body = _.string.trim(body, ";");
					bodytemp = body.replace(/\\\'/igm, "");
					bodytemp = bodytemp.replace(/\\\"/igm, "");
					bodytemp = bodytemp.replace(/\'([\s\S]*?)\'/igm, "");
					bodytemp = bodytemp.replace(/\"([\s\S]*?)\"/igm, "");
					if (bodytemp.indexOf(";") > 0 && match[6] == "") ExceptionManager.put(0, "F.lambda", "[Notice] '{}' for body is missed in expression [ " + src + " ].");
					//if(bodytemp.indexOf(";")<0 && !F.string.startWith(body,"return"))body = "return " + body;
					return new Function(match[2].replace(/\s/igm, "").split(","), body);
				}
			}
			return _.delgate.apply(null, arguments);
		};
		var postinit__ = function() {
				if (!_postinited_) {
					_post_ = {};
					_post_map_ = {};
					_.each(Request.Form, function(q) {
						_post_[q] = String(this(q));
						_post_map_[q.toUpperCase()] = q;
					});
					_postinited_ = true;
				}
			};
		_.foreach(["get", "post", "session", "all"], function(i, v) {
			_[v].exp = function(key, exp, option) {
				return _.string.exp(_[v](key), exp, option);
			};
			_[v].email = function(key) {
				return _.string.email(_[v].safe(key));
			};
			_[v].url = function(key) {
				return _.string.url(_[v].safe(key));
			};
			_[v].safe = function(key, len) {
				if (len !== undefined) return _.safe(_[v](key)).substr(0, len);
				return _.safe(_[v](key));
			};
			_[v].intList = function(key, default_) {
				return _[v]["int"](key, default_, true);
			};
			if (v != "all") {
				_[v]["int"] = function(key, default_, islist) {
					return _["int"](_[v](key), default_, islist);
				};
				_[v].dbl = function(key, default_) {
					return _.dbl(_[v](key), default_);
				};
				_[v].bool = function(key, default_) {
					return _.bool(_[v](key), default_);
				};
			}
		});
		_.foreach(["int", "dbl", "bool"], function(i, v) {
			_.all[v] = function(key, default_, islist) {
				if (_.get.exists(key)) return _.get[v](key, default_, islist);
				postinit__();
				if (_.post.exists(key)) return _.post[v](key, default_, islist);
				return default_ || (v == "bool" ? false : 0);
			};
		});
		_.post.remove = function(key) {
			postinit__();
			if (_post_map_.hasOwnProperty(key.toUpperCase())) {
				delete _post_[_post_map_[key.toUpperCase()]];
				delete _post_map_[key.toUpperCase()];
			}
		};
		_.get.remove = function(key) {
			delete _get_[key];
		};
		_.post.clear = function() {
			postinit__();
			delete _post_;
			_post_ = {};
			_post_map_ = {};
		};
		_.get.clear = function() {
			delete _get_;
			_get_ = {};
		};

		_.post.exists = function(key) {
			postinit__();
			return _post_map_.hasOwnProperty(key.toUpperCase())
		};
		_.get.exists = function(key) {
			return _get_[key] != undefined
		};
		_.all.exists = function(key) {
			postinit__();
			return _.get.exists(key) || _.post.exists(key);
		};
		_.session.exists = function(key) {
			if (key == undefined) return false;
			if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) key = Mo.Config.Global.MO_APP_NAME + "_" + key;
			if (Session.Contents(key) != undefined) return true;
			return false;
		};
		_.session.destroy = function(key) {
			if (key === true) {
				Session.Abandon();
				return;
			}
			if (key == undefined) {
				Session.Contents.RemoveAll();
				return;
			}
			if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) key = Mo.Config.Global.MO_APP_NAME + "_" + key;
			if (Session.Contents(key) != undefined) {
				Session.Contents.Remove(key);
				return;
			}
		};
		_.session.clear = function() {
			Session.Contents.RemoveAll();
		};
		_.session.parse = function(name) {
			var obj = {};
			_.each(Session.Contents, function(q) {
				var nq = q;
				if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) nq = _.string.trimLeft(q, Mo.Config.Global.MO_APP_NAME + "_");
				if (_.string.startWith(nq, name + ".")) {
					obj[nq.substr(name.length + 1)] = Session.Contents(q);
				}
			});
			return obj;
		}
		_.post.dump = function(returnValue) {
			postinit__();
			var dump = dump__(_post_, 1);
			if (returnValue === true) return dump;
			_.echo(dump);
		};
		_.get.dump = function(returnValue) {
			var dump = dump__(_get_, 1);
			if (returnValue === true) return dump;
			_.echo(dump);
		};
		_.session.dump = function(returnValue) {
			var dump = ("session{\n");
			dump += ("  [Timeout] => " + dump__(Session.Timeout) + "\n");
			dump += ("  [CodePage] => " + dump__(Session.CodePage) + "\n");
			dump += ("  [LCID] => " + dump__(Session.LCID) + "\n");
			dump += ("  [SessionID] => " + dump__(Session.SessionID) + "\n");
			dump += ("  [Contents] => {\n");
			_.each(Session.Contents, function(q) {
				var nq = q;
				if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) nq = _.string.trimLeft(q, Mo.Config.Global.MO_APP_NAME + "_");
				dump += ("    [" + nq + "] => " + dump__(Session.Contents(q)) + "\n");
			});
			dump += ("  }\n");
			dump += ("}");
			if (returnValue === true) return dump;
			_.echo(dump);
		}
		_.object.toURIString.split_char_1 = "=";
		_.object.toURIString.split_char_2 = "&";
		_.object.toURIString.filter = [];
		_.object.toURIString.clearFilter = function() {
			while (_.object.toURIString.filter.length > 0) _.object.toURIString.filter.pop();
		};
		_.object.toURIString.fn = 1;
		_.get.keys = function() {
			return _.object.keys(_get_);
		};
		_.post.keys = function() {
			postinit__();
			return _.object.keys(_post_);
		};
		_.get.values = function() {
			return _.object.values(_get_);
		};
		_.post.values = function() {
			postinit__();
			return _.object.values(_post_);
		};
		_.get.fromURIString = function(src) {
			var ucs = src.split(_.object.toURIString.split_char_2);
			for (var i = 0; i < ucs.length; i++) {
				if (ucs[i].indexOf(_.object.toURIString.split_char_1) > 0) {
					_get_[_.decode(ucs[i].substr(0, ucs[i].indexOf(_.object.toURIString.split_char_1)))] = _.decode(_.string.trimLeft(ucs[i].substr(ucs[i].indexOf(_.object.toURIString.split_char_1)), _.object.toURIString.split_char_1));
				}
			}
		};
		_.post.fromURIString = function(src) {
			postinit__();
			var ucs = src.split(_.object.toURIString.split_char_2);
			for (var i = 0; i < ucs.length; i++) {
				if (ucs[i].indexOf(_.object.toURIString.split_char_1) > 0) {
					var key = _.decode(ucs[i].substr(0, ucs[i].indexOf(_.object.toURIString.split_char_1))),
						value = _.decode(_.string.trimLeft(ucs[i].substr(ucs[i].indexOf(_.object.toURIString.split_char_1)), _.object.toURIString.split_char_1));
					_post_[key] = value;
					_post_map_[key.toUpperCase()] = key;
				}
			}
		};
		_.get.toURIString = function(charset) {
			return _.object.toURIString(_get_, charset || "utf-8");
		};
		_.post.toURIString = function(charset) {
			postinit__();
			return _.object.toURIString(_post_, charset || "utf-8");
		};
		_.server.toURIString = function(charset) {
			return _.object.toURIString(_server_, charset || "utf-8");
		};
		_.session.toURIString = function(charset) {
			charset = charset || "utf-8"
			var fn = charset == "utf-8" ? _.encode : escape;
			var returnValue = "";
			_.each(Session.Contents, function(q) {
				var nq = q;
				if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) nq = _.string.trimLeft(q, Mo.Config.Global.MO_APP_NAME + "_");
				returnValue += fn(nq) + "=" + fn(Session.Contents(q)) + "&";
			});
			if (returnValue != "") returnValue = returnValue.substr(0, returnValue.length - 1);
			return returnValue;
		}
		_.get.sort = function(asc) {
			_get_ = _.object.sort(_get_, asc);
		};
		_.post.sort = function(asc) {
			postinit__();
			_post_ = _.object.sort(_post_, asc);
		};
		_.activex.connection = function() {
			return _.activex("ADODB.CONNECTION");
		};
		_.activex.recordset = function() {
			return _.activex("ADODB.RECORDSET");
		};
		_.activex.stream = function() {
			return _.activex("ADODB.STREAM");
		};
		_.activex.dictionary = function() {
			return _.activex("SCRIPTING.DICTIONARY");
		};
		_.activex.document = function() {
			return _.activex("MSXML2.DOMDocument");
		};
		_.activex.httprequest = function() {
			var b = null;
			var httplist = ["MSXML2.serverXMLHttp.3.0", "MSXML2.serverXMLHttp", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp"];
			for (var i = 0; i <= httplist.length - 1; i++) {
				try {
					b = new ActiveXObject(httplist[i]);
					(function(o) {
						_.activex.httprequest = function() {
							return new ActiveXObject(o)
						};
					})(httplist[i]);
					return b;
				} catch (ex) {}
			}
			if (b == null) ExceptionManager.put(0x000001A8, "F.activex.httprequest", "can not load httprequest object.");
			return b;
		};
		_.random.initialize = function(seeds, length) {
			if (seeds.length <= 0) return "";
			if (isNaN(length)) {
				ExceptionManager.put(0x000001A9, "F.random.initialize", "argument 'length' must be a number.");
				return "";
			}
			length = parseInt(length);
			var returnValue = "";
			for (var i = 0; i < length; i++) {
				returnValue += seeds.substr(_.random(0, seeds.length - 1), 1);
			}
			return new String(returnValue);
		};
		_.foreach({
			"number": "123456789012345678901234567890",
			"letter": "abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH",
			"hex": "123456789012345678901234567890ABCDEFABCDEFABCDEFABCDEFABCDEF",
			"word": "abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH12345678906789012678901234534567890126789012345345",
			"mix": "~!@#$%^&*()_+=-[]{}:'<>/?\\,.|`abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH6789012678901234534567890126789012345345"
		}, function(i, v) {
			_.random[i] = function(length) {
				return _.random.initialize(v, length);
			};
		});
		_.timer.ticks = _.timer.stop;
		init();
		return _;
	})(), 
	Exports = F.exports, 
	Require = function(){return F.require.apply(F,arguments);}, 
	Vendor = function(){return F.vendor.apply(F,arguments);};
</script>