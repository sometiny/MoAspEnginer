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
		var post__ = null,
			get__ = {},
			server__ = {},
			activex__ = [],
			postinited__ = false,
			required__ = {},
			included__ = {},
			__POST_MAPPER__ = null;
		var init = function() {
				if ((typeof fso_global) != "object") $f.fso = $f.activex("Scripting.FileSystemObject");
				else $f.fso = fso_global;
				$f.each(Request.QueryString, function(q) {
					get__[q] = String(this(q));
				});
				$f.each(Request.ServerVariables, function(q) {
					var v = String(this(q));
					if (q == "URL" && v.indexOf("?") > 0) v = v.substr(0, v.indexOf("?"));
					server__[q] = v;
				});
			};
		var $f = {};
		$f.TEXT = {
			BR: 1,
			NL: 2,
			BIN: 4,
			NLBR: 1 | 2
		};
		$f.fso = null;
		$f.exports = {};
		$f.vbs = {};
		$f.has = function(obj, key) {
			return obj.hasOwnProperty(key);
		};
		$f.toString = function() {
			return "v1";
		};
		$f.extend = function(src) {
			if (arguments.length < 2) return;
			for (var i = 1; i < arguments.length; i++) {
				for (var c in arguments[i]) {
					if (arguments[i].hasOwnProperty(c)) src[c] = arguments[i][c];
				}
			}
		};
		$f.exists = function(path, folder) {
			if (folder === true) {
				return $f.fso.folderexists($f.mappath(path));
			} else {
				return $f.fso.fileexists($f.mappath(path));
			}
		};
		$f.dispose = function(obj) {
			if (obj != undefined) {
				obj = null;
				return;
			}
			while (activex__.length > 0) {
				$f.dispose(activex__.pop());
			}
		};
		$f.random = function(minValue, maxValue) {
			if (minValue === undefined && maxValue === undefined) return Math.random();
			if (maxValue === undefined) {
				maxValue = minValue;
				minValue = 1;
			}
			return parseInt(Math.random() * (maxValue - minValue + 1)) + minValue;
		};
		$f.guid = function(format) {
			format = format || "D"; //NDBP
			var typelib = $f.activex("scriptlet.typelib")
			var returnValue = typelib.Guid;
			switch (format.toUpperCase()) {
			case "B":
				return returnValue;
			case "P":
				return returnValue.replace("{", "(").replace("}", ")");
			case "N":
				return returnValue.replace(/([^0-9a-z]+)/igm, "");
			default:
				return returnValue.replace("{", "").replace("}", "");
			}
			return returnValue;
		};
		$f.mappath = function(path) {
			if (path.length < 2) return Server.MapPath(path)
			if (path.substr(1, 1) == ":") return path;
			return Server.MapPath(path);
		};
		$f.activex = function(classid, fn) {
			try {
				var $o = Server.CreateObject(classid);
				activex__.push($o);
				if (typeof fn == "function") return fn.call($o) || $o;
				return $o;
			} catch (ex) {
				return null;
			}
		};
		$f.activex.enabled = function(classid) {
			try {
				Server.CreateObject(classid);
				return true;
			} catch (ex) {
				return false;
			}
		};
		$f.stream = function(mode, type) {
			var stream = $f.activex("Adodb.Stream");
			if (mode !== undefined) stream.Mode = mode;
			if (type !== undefined) stream.Type = type;
			return stream;
		};
		$f.json = function(src, globalvar) {
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
		$f.post = function(key, value) {
			postinit__();
			if (key === undefined) return post__;
			if (value === null) {
				$f.post.remove(key);
				return;
			}
			if (value === undefined) return (__POST_MAPPER__.hasOwnProperty(key.toUpperCase()) ? post__[__POST_MAPPER__[key.toUpperCase()]] : "");
			post__[key] = value;
			__POST_MAPPER__[key.toUpperCase()] = key;
			return;
		};
		$f.session = function(key, value) {
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
		$f.get = function(key, value) {
			if (key === undefined) return get__;
			if (value === null) {
				$f.get.remove(key);
				return;
			}
			if (value === undefined) return (get__.hasOwnProperty(key) ? get__[key] : "");
			get__[key] = value;
			return;
		};
		$f.all = function(key) {
			if (key == undefined) return "";
			if (get__.hasOwnProperty(key)) return $f.get(key);
			if (__POST_MAPPER__.hasOwnProperty(key.toUpperCase())) return post__[__POST_MAPPER__[key.toUpperCase()]];
			return "";
		};
		$f.server = function(key, value) {
			if (key === undefined) return server__;
			if (value === null) {
				delete server__[key];
				return;
			}
			if (value === undefined) return (server__.hasOwnProperty(key) ? server__[key] : "");
			server__[key] = value;
			return;
		};
		$f.cookie = function(key, value, expired, domain, path, Secure) {
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
			if (expired !== undefined && !isNaN(expired)) {
				var dt = new Date();
				dt.setTime(dt.getTime() + parseInt(expired) * 1000);
				Response.Cookies(mkey).Expires = $f.format("{0}-{1}-{2} {3}:{4}:{5}", dt.getYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
			}
			if (domain !== undefined) {
				Response.Cookies(mkey).Domain = domain;
			}
			if (path !== undefined) {
				Response.Cookies(mkey).Path = path;
			}
			if (Secure !== undefined) {
				Response.Cookies(mkey).Secure = Secure;
			}
		};
		$f.echo = function(debug, brnl, newline) {
			if ((brnl & $f.TEXT.BIN)) {
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
			if (brnl & $f.TEXT.BR) Response.Write("<br />");
			if (brnl & $f.TEXT.NL) Response.Write("\r\n");
		};
		$f.exit = function(debug, brnl, newline) {
			$f.echo(debug, brnl, newline);
			Response.End();
		};
		$f.format = function(Str) {
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
					var argformat = match[5];
					var argtype = (typeof argvalue);
					if (argformat != "") {
						if (argtype == "date" || (argtype == "object" && argvalue.constructor == Date)) {
							return $f.formatdate(argvalue, argformat);
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
		$f.redirect = function(url, msg) {
			if (msg == undefined) msg = "";
			msg = msg + "";
			if (msg != "") {
				msg = $f.encode(msg);
				$f.echo("<s" + "cript type=\"text/javascript\">alert(decodeURIComponent(\"" + msg + "\"));window.location=decodeURIComponent(\"" + $f.encode(url) + "\");</s" + "cript>");
			} else {
				Response.Redirect(url);
			}
			Response.End();
		};
		$f["goto"] = function(url, msg) {
			if (msg == undefined) msg = "";
			msg = msg + "";
			if (msg != "") {
				msg = $f.encode(msg);
				$f.echo("<s" + "cript type=\"text/javascript\">alert(decodeURIComponent(\"" + msg + "\"));window.location=decodeURIComponent(\"" + $f.encode(url) + "\");</s" + "cript>");
			} else {
				$f.echo("<s" + "cript type=\"text/javascript\">window.location=decodeURIComponent(\"" + $f.encode(url) + "\");</s" + "cript>");
			}
		};
		$f.vendor = function(library){
			return $f.require.call(this,library,[Mo.Config.Global.MO_APP + "Library/Vendor/", Mo.Config.Global.MO_CORE + "Library/Vendor/"]);
		};
		$f.require = function(library, path) {
			if (required__[library] === true) return;
			if (library.length > 2 && library.substr(1, 1) == ":" && $f.fso.fileexists(library)) {
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
				_path = $f.mappath(_targetPaths[i] + library);
				if ($f.fso.fileexists(_path)) break;
				_path = $f.mappath(_targetPaths[i] + library + ".js");
				if ($f.fso.fileexists(_path)) break;
				if ($f.fso.folderexists($f.mappath(_targetPaths[i] + library))) {
					_path = $f.mappath(_targetPaths[i] + library + "/index.js");
					if ($f.fso.fileexists(_path)) break;
				}
			}
			if (_path=="" || !$f.fso.fileexists(_path)) {
				ExceptionManager.put(new Exception(0, "F.require", "required library '" + library + "' is not exists."));
				return $f.exports;
			}
			_statement = $f.string.fromFile(_path);
			_statement = _statement.replace(/^(\s*)<sc(.+)>/ig, "").replace(/<\/script>(\s*)$/ig, "");
			try {
				var this_ = this;
				if (this == F) this_ = null;
				required__[library] = true;
				return (new Function("exports", "__FILE__", "__DIR__", _statement))(
				this_ || $f.exports, _path, _path == "" ? "" : _path.substr(0, _path.lastIndexOf("\\"))) || $f.exports;
			} catch (ex) {
				ExceptionManager.put(ex, "F.require");
				return $f.exports;
			}
		};
		$f.include = function(path, charset) {
			if (included__[path] === true) return true;
			try {
				path = $f.mappath(path);
				if (!$f.fso.fileexists(path)) {
					ExceptionManager.put(new Exception(0, "F.include", "file not exists:" + path));
					return false;
				}
				var iscached = false;
				var src;
				if ($f.cache.enabled && $f.cache.exists(path)) {
					src = $f.cache.read(path);
					if (src != null) iscached = true;
				}
				if (!iscached) {
					src = $f.string.fromFile(path, charset || "utf-8");
					src = src.replace(/^(\s*)<sc(.+)>/ig, "").replace(/<\/script>(\s*)$/ig, "");
					if (src == "") {
						ExceptionManager.put(new Exception(0, "F.include", "read file failed:" + path));
						return false;
					}
				}
				if ($f.execute.call(path, src)) {
					if (!iscached && $f.cache.enabled) $f.cache.write(path, src);
					return included__[path] = true;
				} else {
					return false;
				}
			} catch (ex) {
				ExceptionManager.put(ex, "F.include");
				return false;
			}
		};
		$f.execute = function() {
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
		$f.globalize = function(src, cname) {
			if (cname === undefined) return;
			if (typeof cname == "string") cname = [cname];
			else if (typeof cname == "object" && cname.constructor == Array) {} else return;
			if (typeof src == "string") src = eval(src);
			for (var i = 0; i < cname.length; i++) {
				(new Function("src", cname[i] + " = src;"))(src);
			}
		};
		$f.initialize = function(name) {
			if (typeof name == "string") name = eval(name);
			return typeof name == "object" ? name : new name();
		};
		$f.encode = function(src) {
			src = src || "";
			return encodeURIComponent(src).replace(/\+/, "%2B");
		};
		$f.decode = function(src) {
			src = src || "";
			return decodeURIComponent(src);
		};
		$f.encodeHtml = function(src) {
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
		$f.decodeHtml = function(src) {
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
		$f.jsEncode = function(str) {
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
		$f.formatdate = function(dt, fs) {
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
			m[1] = $f.string.right("0" + m[0], 2);
			d[1] = $f.string.right("0" + d[0], 2);
			h[1] = $f.string.right("0" + h[0], 2);
			H[1] = $f.string.right("0" + H[0], 2);
			n[1] = $f.string.right("0" + n[0], 2);
			s[1] = $f.string.right("0" + s[0], 2);

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
		$f.date = function(srcDate) {
			var date_ = $f.date.parse(srcDate);
			for (var i in date_) {
				if (!date_.hasOwnProperty(i)) continue;
				this[i] = date_[i];
			}
		};
		$f.date.timezone = new Date().getTimezoneOffset() / 60;
		$f.date.format = function() {
			return $f.formatdate.apply(this, arguments);
		};
		$f.date.firstweekdayofmonth = function(srcDate) {
			var date_ = new Date(srcDate - 0);
			return (new Date(date_.getFullYear(), date_.getMonth(), 1)).getDay();
		};
		$f.date.firstweekdayoflastmonth = function(srcDate) {
			var date_ = new Date(srcDate - 0);
			return $f.date.firstweekdayofmonth(new Date(date_.getFullYear(), date_.getMonth(), 1) - 12 * 3600000);
		};
		$f.date.parse = function(srcDate) {
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
			obj_["yeardays"] = $f.date.datediff("d", new Date(obj_.year, 0, 1), date_) + 1;
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
		$f.date.datediff = function(diff, src1, src2) {
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
		$f.date.dateadd = function(diff, value, srcDate) {
			var date_ = $f.date.parse(srcDate);
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
		$f.date.prototype.add = function(diff, value) {
			$f.date.call(this, $f.date.dateadd(diff, value, this.ticks));
		};
		$f.date.prototype.diff = function(diff, srcdate) {
			return $f.date.datediff(diff, srcdate, this.ticks);
		};
		$f.date.prototype.toString = function(format) {
			if (format) return $f.formatdate(this.ticks, format);
			return (new Date(this.ticks)).toString();
		};

		$f.untimespan = function(ts, format) {
			if (format === undefined) format = "yyyy-MM-dd HH:mm:ss"
			return $f.formatdate(new Date(ts * 1000), format);
		};
		$f.timespan = function(src) {
			src = $f.date.parse(src || new Date());
			return (src.ticks - (src.ticks % 1000)) / 1000;
		};
		$f.each = function(src, fn, state) {
			if (typeof fn != "function") return;
			var e = new Enumerator(src);
			for (; !e.atEnd(); e.moveNext()) {
				if (fn.apply(src, [e.item(), src, state]) === false) break;
			}
			e = null;
		};
		$f.foreach = function(src, fn, state) {
			if (typeof fn != "function") return;
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				if (fn.apply(src, [i, src[i], state]) === false) break;
			}
		};
		$f.safe = function(src) {
			src = src || "";
			return src.replace(/\'/igm, "").replace(/((^[\s]+)|([\s]+$))/igm, "").replace(/[\r\n]+/igm, "").replace(/>/igm, "&gt;").replace(/</igm, "&lt;");
		};

		$f.cache = {};
		$f.cache.enabled = false;
		$f.cache.write = function(key, value) {
			if (!$f.cache.enabled) return;
			Application.Lock();
			Application(key) = value;
			Application.UnLock();
		};
		$f.cache.read = function(key) {
			if (Application.Contents(key) != undefined) return Application.Contents(key);
			return null;
		};
		$f.cache.exists = function(key) {
			return Application.Contents(key) != undefined;
		};
		$f.cache.clear = function(key) {
			if (key != undefined && (typeof key == "string") && key.length > 0) {
				if (key.substr(key.length - 1) == ".") {
					var list = [];
					$f.each(Application.Contents, function(q) {
						if (q.length > key.length && q.substr(0, key.length) == key) list.push(q);
					});
					$f.each(list, function(q) {
						Application.Contents.Remove(q);
					});
					return list.length;
				}
				Application.Contents.Remove(key);
				return;
			}
			var all = [];
			$f.each(Application.Contents, function(q) {
				all.push(q);
			});
			$f.each(all, function(q) {
				Application.Contents.Remove(q);
			});
			return all.length;
		};


		$f.sortable = {};
		$f.sortable.data__ = [];
		$f.sortable.add = function(v) {
			$f.sortable.data__.push(v);
		};
		$f.sortable.clear = function() {
			while ($f.sortable.data__.length > 0) {
				$f.sortable.data__.pop();
			}
		};
		$f.sortable.sort = function(asc) {
			if (asc == undefined) asc = true;
			$f.sortable.data__ = $f.sortable.data__.sort(function(a, b) {
				if (a > b == asc) return 1;
				if (a == b) return 0;
				if (a < b == asc) return -1;
			});
		};
		$f.sortable.join = function(c) {
			return $f.sortable.data__.join(c || "");
		};


		$f.timer = {};
		$f.timer.start = null;
		$f.timer.end = null;
		$f.timer.run = function() {
			this.start = new Date();
			return this.start;
		};
		$f.timer.stop = function(start) {
			this.end = new Date();
			return this.end - (start || this.start);
		};

		$f.replace = function(src, search, replacement) {
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
		$f.string = {};
		$f.string.left = function(src, len) {
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
		$f.string.right = function(src, len) {
			src = src || "";
			if (typeof len == "number") {
				if (src.length <= len) return src;
				return src.substr(src.length - len);
			}
			if (typeof len == "string") {
				if (src.indexOf(len) < 0) return src;
				return src.substr(src.indexOf(len) + 1);
			}
			return src;
		};
		$f.string.startWith = $f.string.startsWith = function(src, opt) {
			if (src == "") return false;
			if (opt === undefined) return false;
			if (opt.length > src) return false;
			if (src.substr(0, opt.length) == opt) return true;
			return false;
		};
		$f.string.endWith = $f.string.endsWith = function(src, opt) {
			if (src == "") return false;
			if (opt === undefined) return false;
			if (opt.length > src) return false;
			if (src.substr(src.length - opt.length) == opt) return true;
			return false;
		};
		$f.string.trim = function(src, opt) {
			return $f.string.trimLeft($f.string.trimRight(src, opt), opt);
		};
		$f.string.trimLeft = function(src, opt) {
			if (src == "") return "";
			if (opt === undefined) return src.replace(/^(\s+)/igm, "");
			if ($f.string.startWith(src, opt)) {
				if (src == opt) return "";
				return $f.string.trimLeft(src.substr(opt.length), opt);
			}
			return src;
		};
		$f.string.trimRight = function(src, opt) {
			if (src == "") return "";
			if (opt === undefined) return src.replace(/(\s+)$/igm, "");
			if ($f.string.endWith(src, opt)) {
				if (src == opt) return "";
				return $f.string.trimRight(src.substr(0, src.length - opt.length), opt);
			}
			return src;
		};
		$f.string.format = function() {
			return $f.format.apply(F, arguments);
		};
		$f.string.email = function(str) {
			return $f.string.exp(str, "/^([\\w\\.\\-]+)@([\\w\\.\\-]+)$/");
		};
		$f.string.url = function(str) {
			return $f.string.exp(str, "/^http(s)?\\:\\/\\/(.+?)$/i");
		};
		$f.string.test = function(str, exp, option) {
			exp = $f.string.exp_(exp, option);
			if (exp == null) return false;
			return exp.test(str);
		};
		$f.string.replace = function(src, exp, option, replacement) {
			if (arguments.length == 3) {
				replacement = option;
				option = "";
			}
			src = src || "";
			if (typeof exp != "object") {
				exp = exp + "";
				exp = $f.string.exp_(exp, option) || exp;
			}
			return src.replace(exp, replacement);
		};
		$f.string.matches = function(src, exp, option,fn) {
			if(typeof option=="function")
			{
				fn = option;
				option = ""; 
			}
			exp = $f.string.exp_(exp, option);
			if (exp == null) return null;
			if (!exp.global) return exp.exec(src);
			var ret = [],
				result = exp.exec(src);
			while (result) {
				if(typeof fn=="function")
				{
					fn(result);
				}
				else
				{
					ret.push(result);
				}
				result = exp.exec(src);
			}
			return ret;
		};
		$f.string.exp = function(str, exp, option) {
			if (typeof exp != "object") {
				if (typeof exp !== "string") return "";
				exp = $f.string.exp_(exp, option);
				if (exp == null) return "";
			}
			str = str || "";
			return (exp.test(str) ? str : "");
		};
		$f.string.exp_ = function(exp, option) {
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
		$f.string.fromBinary = function(bin, charset) {
			var byts, stream = $f.stream(3, 1);
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
		$f.string.fromFile = function(path, charset) {
			if (!$f.fso.fileexists(path)) return "";
			var byts, stream = $f.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			stream.LoadFromFile(path);
			stream.Position = 0;
			byts = stream.ReadText();
			stream.Close();
			stream = null;
			return byts;
		};
		$f.string.saveToFile = function(path, content, charset) {
			var byts, stream = $f.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			stream.writetext(content)
			stream.savetofile(path, 2);
			stream.Close();
			stream = null;
		};
		$f.string.appendToFile = function(path, content, charset) {
			var byts, stream = $f.stream(3, 2);
			stream.CharSet = charset || "utf-8";
			stream.Open();
			if (!$f.fso.fileexists(path)) {
				stream.LoadFromFile(path);
				stream.Position = stream.Size;
			}
			stream.writetext(content)
			stream.savetofile(path, 2);
			stream.Close();
			stream = null;
		};
		$f.string.getByteArray = function(string) {
			if (string == "") return [];
			var enc = $f.encode(string);
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
		$f.string.fromByteArray = function(byteArray) {
			if (byteArray.constructor != Array || byteArray.length <= 0) return "";
			var string = "";
			for (var i = 0; i < byteArray.length; i++) {
				string += "%" + byteArray[i].toString(16);
			}
			return $f.decode(string);
		};

		$f.base64 = (function() {
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
						enc2 = base64keyStr_.indexOf(Str.charAt(i++));
						enc3 = base64keyStr_.indexOf(Str.charAt(i++));
						enc4 = base64keyStr_.indexOf(Str.charAt(i++));
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
			var $node = $f.activex("Microsoft.XMLDOM", function() {
				this.loadXML("<?xml version=\"1.0\" encoding=\"gb2312\"?><root xmlns:dt=\"urn:schemas-microsoft-com:datatypes\"><data dt:dt=\"bin.base64\"></data></root>");
				return this.selectSingleNode("//root/data");
			}),
				$base64 = {};
			$base64.e = encode_;
			$base64.d = decode_;
			$base64.encode = function(Str) {
				if (typeof Str == "string") Str = $f.string.getByteArray(Str);
				return encode_(Str);
			};
			$base64.decode = function(Str) {
				return $f.string.fromByteArray(decode_(Str));
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
					if (parm.constructor == Date) {
						return "date(" + parm.toString() + ")";
					}
					if (parm.constructor == Array) {
						var returnValue = "array(" + parm.length + "){\r\n";
						$f.foreach(parm, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						returnValue += dumpHelper__(level - 1) + "}";
						return returnValue;
					}
					if (parm.constructor == Object) {
						var returnValue = "object{\r\n";
						$f.foreach(parm, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						returnValue += dumpHelper__(level - 1) + "}";
						return returnValue;
					}
					if ((parm instanceof ActiveXObject) && (typeof(parm.Count) == "number") && (typeof(parm.Keys) == "unknown") && (typeof(parm.Items) == "unknown") && (typeof(parm.Key) == "unknown") && (typeof(parm.Item) == "unknown")) {
						var returnValue = "dictionary{\r\n";
						$f.each(parm, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this(i), level + 1) + "\r\n";
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
						$f.foreach(parm, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						$f.foreach(parm.constructor.prototype, function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						returnValue += dumpHelper__(level - 1) + "}";
						return returnValue;
					}
				}
				if (typeof parm == "unknown") {
					if (parm.constructor == VBArray) {
						var returnValue = "array{\r\n";
						$f.foreach((new VBArray(parm)).toArray(), function(i) {
							returnValue += dumpHelper__(level) + "[" + i + "] => " + dump__(this[i], level + 1) + "\r\n";
						});
						returnValue += dumpHelper__(level - 1) + "}";
						return returnValue;
					}
				}
				return "unknown(object)";
			};
		$f.dump = function(parm, returnValue) {
			var value = dump__(parm, 1);
			if (returnValue === true) return value;
			$f.echo(value);
		};

		$f.object = {};
		$f.object.sort = function(src, asc) {
			$f.sortable.data__ = $f.object.keys(src);
			$f.sortable.sort(asc);
			var new_ = {};
			for (var i = 0; i < $f.sortable.data__.length; i++) {
				new_[$f.sortable.data__[i]] = src[$f.sortable.data__[i]];
			}
			return new_;
		};
		$f.object.keys = function(src) {
			var returnValue = [];
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				returnValue.push(i);
			}
			return returnValue;
		};
		$f.object.values = function(src) {
			var returnValue = [];
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				returnValue.push(src[i]);
			}
			return returnValue;
		};
		$f.object.toArray = function(src, key, value) {
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
		$f.object.toURIString = function(src, charset) {
			var fn = charset == "utf-8" ? $f.encode : escape;
			if ($f.object.toURIString.fn == 0) fn = function(src) {
				return src;
			};
			var returnValue = "";
			for (var i in src) {
				if (!src.hasOwnProperty(i)) continue;
				var cn = true;
				for (var j = 0; j < $f.object.toURIString.filter.length; j++) {
					if ($f.object.toURIString.filter[j].substr(0, 1) == "!" && i == $f.object.toURIString.filter[j].substr(1)) cn = false;
					if ($f.object.toURIString.filter[j].substr(0, 1) == "@" && !$f.string.startWith(i, $f.object.toURIString.filter[j].substr(1))) cn = false;
					if (!cn) break;
				}
				if (cn) returnValue += fn(i) + $f.object.toURIString.split_char_1 + fn(src[i]) + $f.object.toURIString.split_char_2;
			}
			if (returnValue != "") returnValue = returnValue.substr(0, returnValue.length - 1);
			return returnValue;
		};

		$f.dbl = function(value, default_) {
			if (value == "") return (default_ === undefined ? 0 : default_);
			if (isNaN(value)) return (default_ === undefined ? 0 : default_);
			return parseFloat(value);
		};
		$f.bool = function(value, default_) {
			if (value == null) return !!(default_ || false);
			if (typeof value == "number") return value != 0;
			if (typeof value == "boolean") return value;
			if (typeof value != "string") return false;
			if (value == "") return !!(default_ || false);
			return (value.toLowerCase() === "true" ? true : false);
		};
		$f["int"] = function(value, default_, islist) {
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
		$f.md5 = function(src) {
			if (!$f.exports.md5) $f.require("md5");
			if (!$f.exports["md5"]) {
				ExceptionManager.put(0x000003A8, "F.md5", "can not load 'md5' method.");
				return "";
			}
			return $f.exports.md5(src);
		};
		$f.delgate = function() {
			try {
				var args, body = (args = Array.prototype.slice.apply(arguments)).pop();
				return new Function(args, body);
			} catch (ex) {
				ExceptionManager.put(ex.number, "F.func", ex.description + " function body [ " + body + " ]");
			}
		};
		$f.lambda = function(src) {
			if (arguments.length == 0) return new Function();
			if (arguments.length == 1 && typeof src == "string") {
				var exp_ = /^(\()?([\w\,\s]*?)(\))?(\s*)\=\>(\s*)(\{)?([\s\S]+?)(\})?(\s*)$/igm;
				var match = null;
				if (match = exp_.exec(src)) {
					if (match[2] == "" && match[1] == "") ExceptionManager.put(0, "F.lambda", "[Notice] '()' for arguments is missed in expression [ " + src + " ].");
					if (match[2].indexOf(",") > 0 && match[1] == "") ExceptionManager.put(0, "F.lambda", "[Notice] '()' for arguments is missed in expression [ " + src + " ].");
					var body = match[7],
						bodytemp = body;
					body = $f.string.trim(body);
					body = $f.string.trim(body, ";");
					bodytemp = body.replace(/\\\'/igm, "");
					bodytemp = bodytemp.replace(/\\\"/igm, "");
					bodytemp = bodytemp.replace(/\'([\s\S]*?)\'/igm, "");
					bodytemp = bodytemp.replace(/\"([\s\S]*?)\"/igm, "");
					if (bodytemp.indexOf(";") > 0 && match[6] == "") ExceptionManager.put(0, "F.lambda", "[Notice] '{}' for body is missed in expression [ " + src + " ].");
					//if(bodytemp.indexOf(";")<0 && !F.string.startWith(body,"return"))body = "return " + body;
					return new Function(match[2].replace(/\s/igm, "").split(","), body);
				}
			}
			return $f.delgate.apply(null, arguments);
		};
		var postinit__ = function() {
				if (!postinited__) {
					post__ = {};
					__POST_MAPPER__ = {};
					$f.each(Request.Form, function(q) {
						post__[q] = String(this(q));
						__POST_MAPPER__[q.toUpperCase()] = q;
					});
					postinited__ = true;
				}
			};
		$f.foreach(["get", "post", "session", "all"], function(i, v) {
			$f[v].exp = function(key, exp, option) {
				return $f.string.exp($f[v](key), exp, option);
			};
			$f[v].email = function(key) {
				return $f.string.email($f[v].safe(key));
			};
			$f[v].url = function(key) {
				return $f.string.url($f[v].safe(key));
			};
			$f[v].safe = function(key, len) {
				if (len !== undefined) return $f.safe($f[v](key)).substr(0, len);
				return $f.safe($f[v](key));
			};
			$f[v].intList = function(key, default_) {
				return $f[v]["int"](key, default_, true);
			};
			if (v != "all") {
				$f[v]["int"] = function(key, default_, islist) {
					return $f["int"]($f[v](key), default_, islist);
				};
				$f[v].dbl = function(key, default_) {
					return $f.dbl($f[v](key), default_);
				};
				$f[v].bool = function(key, default_) {
					return $f.bool($f[v](key), default_);
				};
			}
		});
		$f.foreach(["int", "dbl", "bool"], function(i, v) {
			$f.all[v] = function(key, default_, islist) {
				if ($f.get.exists(key)) return $f.get[v](key, default_, islist);
				postinit__();
				if ($f.post.exists(key)) return $f.post[v](key, default_, islist);
				return default_ || (v == "bool" ? false : 0);
			};
		});
		$f.post.remove = function(key) {
			postinit__();
			if (__POST_MAPPER__.hasOwnProperty(key.toUpperCase())) {
				delete post__[__POST_MAPPER__[key.toUpperCase()]];
				delete __POST_MAPPER__[key.toUpperCase()];
			}
		};
		$f.get.remove = function(key) {
			delete get__[key];
		};
		$f.post.clear = function() {
			postinit__();
			delete post__;
			post__ = {};
			__POST_MAPPER__ = {};
		};
		$f.get.clear = function() {
			delete get__;
			get__ = {};
		};

		$f.post.exists = function(key) {
			postinit__();
			return __POST_MAPPER__.hasOwnProperty(key.toUpperCase())
		};
		$f.get.exists = function(key) {
			return get__[key] != undefined
		};
		$f.all.exists = function(key) {
			postinit__();
			return $f.get.exists(key) || $f.post.exists(key);
		};
		$f.session.exists = function(key) {
			if (key == undefined) return false;
			if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) key = Mo.Config.Global.MO_APP_NAME + "_" + key;
			if (Session.Contents(key) != undefined) return true;
			return false;
		};
		$f.session.destroy = function(key) {
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
		$f.session.clear = function() {
			Session.Contents.RemoveAll();
		};
		$f.session.parse = function(name) {
			var obj = {};
			$f.each(Session.Contents, function(q) {
				var nq = q;
				if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) nq = $f.string.trimLeft(q, Mo.Config.Global.MO_APP_NAME + "_");
				if ($f.string.startWith(nq, name + ".")) {
					obj[nq.substr(name.length + 1)] = Session.Contents(q);
				}
			});
			return obj;
		}
		$f.post.dump = function(returnValue) {
			postinit__();
			var dump = dump__(post__, 1);
			if (returnValue === true) return dump;
			$f.echo(dump);
		};
		$f.get.dump = function(returnValue) {
			var dump = dump__(get__, 1);
			if (returnValue === true) return dump;
			$f.echo(dump);
		};
		$f.session.dump = function(returnValue) {
			var dump = ("session{\n");
			dump += ("  [Timeout] => " + dump__(Session.Timeout) + "\n");
			dump += ("  [CodePage] => " + dump__(Session.CodePage) + "\n");
			dump += ("  [LCID] => " + dump__(Session.LCID) + "\n");
			dump += ("  [SessionID] => " + dump__(Session.SessionID) + "\n");
			dump += ("  [Contents] => {\n");
			$f.each(Session.Contents, function(q) {
				var nq = q;
				if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) nq = $f.string.trimLeft(q, Mo.Config.Global.MO_APP_NAME + "_");
				dump += ("    [" + nq + "] => " + dump__(Session.Contents(q)) + "\n");
			});
			dump += ("  }\n");
			dump += ("}");
			if (returnValue === true) return dump;
			$f.echo(dump);
		}
		$f.object.toURIString.split_char_1 = "=";
		$f.object.toURIString.split_char_2 = "&";
		$f.object.toURIString.filter = [];
		$f.object.toURIString.clearFilter = function() {
			while ($f.object.toURIString.filter.length > 0) $f.object.toURIString.filter.pop();
		};
		$f.object.toURIString.fn = 1;
		$f.get.keys = function() {
			return $f.object.keys(get__);
		};
		$f.post.keys = function() {
			postinit__();
			return $f.object.keys(post__);
		};
		$f.get.values = function() {
			return $f.object.values(get__);
		};
		$f.post.values = function() {
			postinit__();
			return $f.object.values(post__);
		};
		$f.get.fromURIString = function(src) {
			var ucs = src.split($f.object.toURIString.split_char_2);
			for (var i = 0; i < ucs.length; i++) {
				if (ucs[i].indexOf($f.object.toURIString.split_char_1) > 0) {
					get__[$f.decode(ucs[i].substr(0, ucs[i].indexOf($f.object.toURIString.split_char_1)))] = $f.decode($f.string.trimLeft(ucs[i].substr(ucs[i].indexOf($f.object.toURIString.split_char_1)), $f.object.toURIString.split_char_1));
				}
			}
		};
		$f.post.fromURIString = function(src) {
			postinit__();
			var ucs = src.split($f.object.toURIString.split_char_2);
			for (var i = 0; i < ucs.length; i++) {
				if (ucs[i].indexOf($f.object.toURIString.split_char_1) > 0) {
					post__[$f.decode(ucs[i].substr(0, ucs[i].indexOf($f.object.toURIString.split_char_1)))] = $f.decode($f.string.trimLeft(ucs[i].substr(ucs[i].indexOf($f.object.toURIString.split_char_1)), $f.object.toURIString.split_char_1));
				}
			}
		};
		$f.get.toURIString = function(charset) {
			return $f.object.toURIString(get__, charset || "utf-8");
		};
		$f.post.toURIString = function(charset) {
			postinit__();
			return $f.object.toURIString(post__, charset || "utf-8");
		};
		$f.server.toURIString = function(charset) {
			return $f.object.toURIString(server__, charset || "utf-8");
		};
		$f.session.toURIString = function(charset) {
			charset = charset || "utf-8"
			var fn = charset == "utf-8" ? $f.encode : escape;
			var returnValue = "";
			$f.each(Session.Contents, function(q) {
				var nq = q;
				if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) nq = $f.string.trimLeft(q, Mo.Config.Global.MO_APP_NAME + "_");
				returnValue += fn(nq) + "=" + fn(Session.Contents(q)) + "&";
			});
			if (returnValue != "") returnValue = returnValue.substr(0, returnValue.length - 1);
			return returnValue;
		}
		$f.get.sort = function(asc) {
			get__ = $f.object.sort(get__, asc);
		};
		$f.post.sort = function(asc) {
			postinit__();
			post__ = $f.object.sort(post__, asc);
		};
		$f.activex.connection = function() {
			return $f.activex("ADODB.CONNECTION");
		};
		$f.activex.recordset = function() {
			return $f.activex("ADODB.RECORDSET");
		};
		$f.activex.stream = function() {
			return $f.activex("ADODB.STREAM");
		};
		$f.activex.dictionary = function() {
			return $f.activex("SCRIPTING.DICTIONARY");
		};
		$f.activex.document = function() {
			return $f.activex("MSXML2.DOMDocument");
		};
		$f.activex.httprequest = function() {
			var b = null;
			var httplist = ["MSXML2.serverXMLHttp.3.0", "MSXML2.serverXMLHttp", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp"];
			for (var i = 0; i <= httplist.length - 1; i++) {
				try {
					b = new ActiveXObject(httplist[i]);
					(function(o) {
						$f.activex.httprequest = function() {
							return new ActiveXObject(o)
						};
					})(httplist[i]);
					return b;
				} catch (ex) {}
			}
			if (b == null) ExceptionManager.put(0x000001A8, "F.activex.httprequest", "can not load httprequest object.");
			return b;
		};
		$f.random.initialize = function(seeds, length) {
			if (seeds.length <= 0) return "";
			if (isNaN(length)) {
				ExceptionManager.put(0x000001A9, "F.random.initialize", "argument 'length' must be a number.");
				return "";
			}
			length = parseInt(length);
			var returnValue = "";
			for (var i = 0; i < length; i++) {
				returnValue += seeds.substr($f.random(0, seeds.length - 1), 1);
			}
			return new String(returnValue);
		};
		$f.foreach({
			"number": "123456789012345678901234567890",
			"letter": "abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH",
			"hex": "123456789012345678901234567890ABCDEFABCDEFABCDEFABCDEFABCDEF",
			"word": "abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH12345678906789012678901234534567890126789012345345",
			"mix": "~!@#$%^&*()_+=-[]{}:'<>/?\\,.|`abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH6789012678901234534567890126789012345345"
		}, function(i, v) {
			$f.random[i] = function(length) {
				return $f.random.initialize(v, length);
			};
		});
		$f.timer.ticks = $f.timer.stop;
		init();
		return $f;
	})(), 
	Exports = F.exports, 
	Require = function(){return F.require.apply(F,arguments);}, 
	Vendor = function(){return F.vendor.apply(F,arguments);};
</script>