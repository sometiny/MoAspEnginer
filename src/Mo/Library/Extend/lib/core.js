module.exports=[];
var modules = {exports : {}};
modules.exports = {};
(function(exports,require,module,__filename,__dirname,define){
/*
** File: fns.js
** Usage: define many method for MAE, such as post, get, server and so on...
** About: 
**		support@mae.im
*/
var ws = [
	["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
];
var ms = [
	["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", ""],
	["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", ""]
];
var DIFF = function(diff){
	var dt = this;
	switch(diff){
		case "dddd" : return ws[0][dt.getDay()];
		case "ddd" : return ws[1][dt.getDay()];
		case "MMMM" : return ms[0][dt.getMonth()];
		case "MMM" : return ms[1][dt.getMonth()];
		case "yyyy" : return dt.getFullYear();
		case "M" : return dt.getMonth() + 1;
		case "MM" : return ('0' + (dt.getMonth() + 1)).slice(-2);
		case "d" : return dt.getDate();
		case "dd" : return ('0' + dt.getDate()).slice(-2);
		case "HH" : return ('0' + dt.getHours()).slice(-2);
		case "h" : return dt.getHours();
		case "m" : return dt.getMinutes();
		case "mm" : return ('0' + dt.getMinutes()).slice(-2);
		case "s" : return dt.getSeconds();
		case "ss" : return ('0' + dt.getSeconds()).slice(-2);
		case "tttt" : return dt.getMilliseconds();
		default : return diff;
	}
};
var DIFF_UTC = function(diff){
	var dt = this;
	switch(diff){
		case "dddd" : return ws[0][dt.getUTCDay()];
		case "ddd" : return ws[1][dt.getUTCDay()];
		case "MMMM" : return ms[0][dt.getUTCMonth()];
		case "MMM" : return ms[1][dt.getUTCMonth()];
		case "yyyy" : return dt.getUTCFullYear();
		case "M" : return dt.getUTCMonth() + 1;
		case "MM" : return ('0' + (dt.getUTCMonth() + 1)).slice(-2);
		case "d" : return dt.getDate();
		case "dd" : return ('0' + dt.getUTCDate()).slice(-2);
		case "HH" : return ('0' + dt.getUTCHours()).slice(-2);
		case "h" : return dt.getUTCHours();
		case "m" : return dt.getUTCMinutes();
		case "mm" : return ('0' + dt.getUTCMinutes()).slice(-2);
		case "s" : return dt.getUTCSeconds();
		case "ss" : return ('0' + dt.getUTCSeconds()).slice(-2);
		case "tttt" : return dt.getUTCMilliseconds();
		default : return diff;
	}
};
var _post_ = null,
	_get_ = {},
	_server_ = {},
	_activex_ = [],
	_postinited_ = false,
	_required_ = {},
	_included_ = {},
	_post_map_ = null;
var init = function() {
	var e = new Enumerator(Request.QueryString), q, v, ex, cname;
	for (; !e.atEnd(); e.moveNext()) {
		q = e.item(); v = String(Request.QueryString(q)); v && (_get_[q] = v);
		if(q.slice(-2)=="[]"){
			delete _get_[q];
			cname = q.slice(0,-2);
			_get_[cname]=[];
			ex = new Enumerator(Request.QueryString(q));
			for (; !ex.atEnd(); ex.moveNext()) {
				_get_[cname].push(ex.item());
			}
		}
	}
	
	e = new Enumerator(Request.ServerVariables);
	for (; !e.atEnd(); e.moveNext()) {
		q = e.item(); v = String(Request.ServerVariables(q));
		if (q == "URL" && v.indexOf("?") > 0) v = v.substr(0, v.indexOf("?"));
		_server_[q] = v;
	}
};
var _ = {};
_.TEXT = {
	BR: 1,
	NL: 2,
	BIN: 4,
	NLBR: 1 | 2,
	FILE: 8
};
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
	format = format || "D";
	var typelib = _.activex("scriptlet.typelib");
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
	if (path.substr(1,1) == ":") return path;
	return Server.MapPath(path);
};
_.activex = function(classid, fn) {
	var $o = null, returnValue;
	try {
		$o = Server.CreateObject(classid);
		_activex_.push($o);
	} catch (ex) {
		return null;
	}
	if (typeof fn == "function"){
		returnValue = fn.apply($o, [].slice.apply(arguments).slice(2));
		if(returnValue!==undefined)return returnValue;
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
_.json = function(src, globalvar) {
	var cglobal = false;
	try {
		if (typeof globalvar == "string" && /^(\w+)$/.test(globalvar)) {
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
_.cookie = function(key, value, expired, domain, path, secure, httponly) {
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
		httponly = expired["httponly"];
		expired = expired["expired"];
	}
	if (expired !== undefined && !isNaN(expired)) {
		var dt = new Date();
		dt.setTime(dt.getTime() + parseInt(expired) * 1000);
		Response.Cookies(mkey).Expires = _.format("{0}-{1}-{2} {3}:{4}:{5}", dt.getYear(), dt.getMonth() + 1, dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds());
	}
	if (domain) {
		Response.Cookies(mkey).Domain = domain;
	}
	if(!path) path="/";
	Response.Cookies(mkey).Path = path;
	if (secure) {
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
	return Str.replace(/\{(\d+)(?:\.([\w\.\-]+))?(?:\:(.+?))?\}/ig, function(ma, arg1,  arg2 , arg3) {
		var argvalue = arg[parseInt(arg1) + 1];
		if (argvalue === undefined) return "";
		if (typeof argvalue == "object" && arg2) {
			argvalue = (new Function("return this" + "[\"" + arg2.replace(/\./igm, "\"][\"").replace(/\[\"(\d+)\"\]/igm, "[$1]") + "\"]")).call(argvalue);
		}
		if (argvalue==null) return "NULL";
		var argformat = arg3 || "";
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
	});
};
_.redirect = function(url, msg) {
	if (msg === undefined) msg = "";
	msg = msg + "";
	if (msg != "") {
		_["goto"](url, msg);
	} else {
		Response.Redirect(url);
	}
	Response.End();
};
_["goto"] = function(url, msg) {
	if (msg === undefined){
		Response.Status = "302 Object Moved";
		Response.AddHeader("Location", url);
		return;
	}
	Response.Write('\u003cscript type="text/javascript"\u003ealert(decodeURIComponent("' + _.encode(msg) + '"));window.location = decodeURIComponent("' + _.encode(url) + '");\u003c/script\u003e');
};
_.script_start = '\u003cscript type="text/javascript"\u003e';
_.script_start_server = '\u003cscript language="jscript" runat="server"\u003e';
_.script_end = '\u003c/script\u003e';
_.encode = function(src) {
	return encodeURIComponent(src || "").replace(/\+/g, "%2B");
};
_.decode = function(src) {
	return decodeURIComponent(src || "");
};
_.encodeHtml = function(src, simple) {
	if(simple===false){
		return Server.HtmlEncode(src || "").replace(/'/g,"&#39;");
	}
	return (src || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g,'&#39;').replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
_.decodeHtml = function(src, simple) {
	if(!src) return "";
	var ret = src.replace(/&amp;/g, "&");
	ret = ret.replace(/&gt;/g, ">");
	ret = ret.replace(/&lt;/g, "<");
	ret = ret.replace(/&quot;/g, '"');
	if(simple===false) return ret.replace(/&#(\d+);/igm, function($0,$1){return String.fromCharCode($1)});
	return ret.replace(/&#39;/g, '\'');
};
_.formatdate = function(dt, fs, utc) {
	if (dt===null || dt===undefined) return '';
	if (fs===undefined) return _.formatdate(new Date(), dt, utc);
	if(Object.prototype.toString.call(dt) != '[object Date]'){
		var type = typeof dt;
		if(type == "string"){
			var _dt = _.date.parse(dt);
			if(_dt) dt = new Date(_dt.ticks);
			else{
				dt = Date.parse(dt);
				if(!dt){
					ExceptionManager.put(0x3456,"F.formatdate","date string format error, parse failed.");
					return '';
				}
			}
		}
		else if(type == "date" || type == "number") dt = new Date(dt-0);
	}
	
	if (!dt.getFullYear) return '';
	fs = fs.replace(/(yyyy|mmmm|mmm|mm|dddd|ddd|dd|hh|ss|tttt|m|d|h|s)/ig, (function(cb, date){ return function(diff){ return cb.call(date, diff)};})(utc === true ? DIFF_UTC : DIFF, dt));

	return fs;
};
_.date = function(srcDate) {
	return new _.datetime(srcDate || new Date());
};
_.date.timezone = new Date().getTimezoneOffset() / 60;
_.date.parse = function(srcDate) {
	if (typeof srcDate == "string") {
		srcDate = srcDate.replace(/(\-|\s|\:|\.)0(\d)/ig, "$1$2");
		var match = /^(\d{4})\-(\d{1,2})\-(\d{1,2})( (\d{1,2})\:(\d{1,2})(\:(\d{1,2}))?(\.(\d{1,3}))?)?$/.exec(srcDate);
		if (match) {
			try {
				if (match[4] == "") {
					srcDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
				} else {
					srcDate = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]), parseInt(match[5]), parseInt(match[6]), (match[7] == "" ? 0 : parseInt(match[8])), (match[9] == "" ? 0 : parseInt(match[10])));
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
_.datetime.prototype.toString = function(format, utc) {
	if (format) return _.formatdate(this.ticks, format, utc);
	return (new Date(this.ticks)).toString();
};

_.untimespan = function(ts, format, utc) {
	if(format === true){
		utc = true;
		format = undefined;
	}
	if (format === undefined) format = "yyyy-MM-dd HH:mm:ss";
	return _.formatdate(new Date(ts * 1000), format, utc);
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
	return src.replace(/('|"|\r|\n|(^[\s]+)|([\s]+$))/igm, "").replace(/>/igm, "&gt;").replace(/</igm, "&lt;");
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
	this.start = +new Date();
	return this.start;
};
_.timer.stop = function(start) {
	this.end = +new Date();
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
		return src.slice(0, len);
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
		return src.slice(- len);
	}
	if (typeof len == "string") {
		if (src.indexOf(len) < 0) return src;
		return src.substr(src.lastIndexOf(len) + len.length);
	}
	return src;
};
_.string.startWith = _.string.startsWith = function(src, opt) {
	return src.indexOf(opt) === 0;
};
_.string.endWith = _.string.endsWith = function(src, opt) {
	var d = src.length - opt.length;
    return d >= 0 && src.lastIndexOf(opt) === d;
}; 

_.string.trim = function(src, opt) {
	return _.string.trimLeft(_.string.trimRight(src, opt), opt);
};
_.string.trimLeft = function(src, opt) {
	if (src == "") return "";
	if (opt === undefined) return src.replace(/^(\s+)/ig, "");
	if (_.string.startWith(src, opt)) {
		if (src == opt) return "";
		return _.string.trimLeft(src.substr(opt.length), opt);
	}
	return src;
};
_.string.trimRight = function(src, opt) {
	if (src == "") return "";
	if (opt === undefined) return src.replace(/(\s+)$/ig, "");
	if (_.string.endWith(src, opt)) {
		if (src == opt) return "";
		return _.string.trimRight(src.substr(0, src.length - opt.length), opt);
	}
	return src;
};
_.string.format = function() {
	return _.format.apply(_, arguments);
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
	var byts, stream = _.activex("ADODB.STREAM", function(){ this.Mode = 3; this.Type = 1;});
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
_.string.getByteArray = function(string) {
	if (string == "") return [];
	var enc = _.encode(string);
	var byteArray = [], _len = enc.length;
	for (var i = 0; i < _len; i++) {
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
	var string = "", _len = byteArray.length, _bit = 0;
	if (byteArray.constructor != Array || _len <= 0) return "";
	for (var i = 0; i < _len; i++) {
		_bit = byteArray[i];
		if(_bit<=0) break;
		string += "%" + _bit.toString(16);
	}
	return _.decode(string);
};

_.object = {};
_.object.sort = function(src, asc) {
	_.sortable.data__ = _.object.keys(src);
	_.sortable.sort(asc);
	var new_ = {}, _data = _.sortable.data__, _len = _data.length;
	for (var i = 0; i < _len; i++) {
		new_[_data[i]] = src[_data[i]];
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
	charset = charset || "utf-8";
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
	var ucs = src.split(_.object.toURIString.split_char_2), _len = ucs.length;
	for (var i = 0; i < _len; i++) {
		if (ucs[i].indexOf(_.object.toURIString.split_char_1) > 0) {
			obj[_.decode(ucs[i].substr(0, ucs[i].indexOf(_.object.toURIString.split_char_1)))] = _.decode(_.string.trimLeft(ucs[i].substr(ucs[i].indexOf(_.object.toURIString.split_char_1)), _.object.toURIString.split_char_1));
		}
	}
	return obj;
};
_.object.toURIString.split_char_1 = "=";
_.object.toURIString.split_char_2 = "&";
_.object.toURIString.filter = [];
_.object.toURIString.clearFilter = function() {
	while (_.object.toURIString.filter.length > 0) _.object.toURIString.filter.pop();
};
_.object.toURIString.fn = 1;
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
		if (!/^([\d\,]+)$/.test(value)) return [];
		return value.split(',');
	}
};
_.md5 = function(src) {
	var md5 = require("md5");
	if (!md5) return "";
	return md5.md5(src);
};
_.md5_bytes = function(src) {
	var md5 = require("md5");
	if (!md5) return "";
	return md5.md5_bytes(src);
};
_.delgate = function() {
	try {
		var args, body = (args = Array.prototype.slice.apply(arguments)).pop();
		return new Function(args, body);
	} catch (ex) {
		ExceptionManager.put(ex.number, "F.func", ex.description + " function body [ " + body + " ]");
	}
};
var postinit__ = function() {
		if (!_postinited_) {
			_post_ = {};
			_post_map_ = {};
			var cname, ex;
			_.each(Request.Form, function(q) {
				_post_[q] = String(this(q));
				_post_map_[q.toUpperCase()] = q;
				if(q.slice(-2)=="[]"){
					delete _post_[q];
					cname = q.slice(0,-2);
					_post_[cname]=[];
					_post_map_[cname.toUpperCase()] = cname;
					ex = new Enumerator(this(q));
					for (; !ex.atEnd(); ex.moveNext()) {
						_post_[cname].push(ex.item());
					}
				}
			});
			_postinited_ = true;
		}
	};
var mthods = ["get", "post", "session", "all"], _len = mthods.length;
for(var i = 0; i < _len; i++){
	(function(v){
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
	})(mthods[i]);
}
mthods = ["int", "dbl", "bool"];
_len = mthods.length;
for(var i = 0; i < _len; i++){
	(function(v){
		_.all[v] = function(key, default_, islist) {
			if (_.get.exists(key)) return _.get[v](key, default_, islist);
			postinit__();
			if (_.post.exists(key)) return _.post[v](key, default_, islist);
			return default_ || (v == "bool" ? false : 0);
		};
	})(mthods[i]);
}
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
	_post_ = {};
	_post_map_ = {};
};
_.get.clear = function() {
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
};
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
	var ucs = src.split(_.object.toURIString.split_char_2), _len = ucs.length;
	for (var i = 0; i < _len; i++) {
		if (ucs[i].indexOf(_.object.toURIString.split_char_1) > 0) {
			_get_[_.decode(ucs[i].substr(0, ucs[i].indexOf(_.object.toURIString.split_char_1)))] = _.decode(_.string.trimLeft(ucs[i].substr(ucs[i].indexOf(_.object.toURIString.split_char_1)), _.object.toURIString.split_char_1));
		}
	}
};
_.post.fromURIString = function(src) {
	postinit__();
	var ucs = src.split(_.object.toURIString.split_char_2), _len = ucs.length;
	for (var i = 0; i < _len; i++) {
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
	charset = charset || "utf-8";
	var fn = charset == "utf-8" ? _.encode : escape;
	var returnValue = "";
	_.each(Session.Contents, function(q) {
		var nq = q;
		if (Mo.Config.Global.MO_SESSION_WITH_SINGLE_TAG) nq = _.string.trimLeft(q, Mo.Config.Global.MO_APP_NAME + "_");
		returnValue += fn(nq) + "=" + fn(Session.Contents(q)) + "&";
	});
	if (returnValue != "") returnValue = returnValue.substr(0, returnValue.length - 1);
	return returnValue;
};
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
					return new ActiveXObject(o);
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
	return returnValue;
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
Mo.on("dispose", _.dispose);
module.exports = _;
})(modules.exports, require, modules, __filename, __dirname, define);
module.exports.push(modules.exports);
modules.exports = {};
(function(exports,require,module,__filename,__dirname,define){
/*debug*/
/*
** File: io.js
** Usage: some methods for io
** About: 
**		support@mae.im
*/
/*find from internet, thanks!*/
var mapto437 = [], maptostring =[];
for(var i=0;i<128;i++){
	maptostring[i] = mapto437[i]=i;
}
mapto437[0x80] = 0x00c7;mapto437[0x81] = 0x00fc;mapto437[0x82] = 0x00e9;mapto437[0x83] = 0x00e2;mapto437[0x84] = 0x00e4;mapto437[0x85] = 0x00e0;mapto437[0x86] = 0x00e5;mapto437[0x87] = 0x00e7;mapto437[0x88] = 0x00ea;mapto437[0x89] = 0x00eb;mapto437[0x8a] = 0x00e8;mapto437[0x8b] = 0x00ef;mapto437[0x8c] = 0x00ee;mapto437[0x8d] = 0x00ec;mapto437[0x8e] = 0x00c4;mapto437[0x8f] = 0x00c5;mapto437[0x90] = 0x00c9;mapto437[0x91] = 0x00e6;mapto437[0x92] = 0x00c6;mapto437[0x93] = 0x00f4;mapto437[0x94] = 0x00f6;mapto437[0x95] = 0x00f2;mapto437[0x96] = 0x00fb;mapto437[0x97] = 0x00f9;mapto437[0x98] = 0x00ff;mapto437[0x99] = 0x00d6;mapto437[0x9a] = 0x00dc;mapto437[0x9b] = 0x00a2;mapto437[0x9c] = 0x00a3;mapto437[0x9d] = 0x00a5;mapto437[0x9e] = 0x20a7;mapto437[0x9f] = 0x0192;mapto437[0xa0] = 0x00e1;mapto437[0xa1] = 0x00ed;mapto437[0xa2] = 0x00f3;mapto437[0xa3] = 0x00fa;mapto437[0xa4] = 0x00f1;mapto437[0xa5] = 0x00d1;mapto437[0xa6] = 0x00aa;mapto437[0xa7] = 0x00ba;mapto437[0xa8] = 0x00bf;mapto437[0xa9] = 0x2310;mapto437[0xaa] = 0x00ac;mapto437[0xab] = 0x00bd;mapto437[0xac] = 0x00bc;mapto437[0xad] = 0x00a1;mapto437[0xae] = 0x00ab;mapto437[0xaf] = 0x00bb;mapto437[0xb0] = 0x2591;mapto437[0xb1] = 0x2592;mapto437[0xb2] = 0x2593;mapto437[0xb3] = 0x2502;mapto437[0xb4] = 0x2524;mapto437[0xb5] = 0x2561;mapto437[0xb6] = 0x2562;mapto437[0xb7] = 0x2556;mapto437[0xb8] = 0x2555;mapto437[0xb9] = 0x2563;mapto437[0xba] = 0x2551;mapto437[0xbb] = 0x2557;mapto437[0xbc] = 0x255d;mapto437[0xbd] = 0x255c;mapto437[0xbe] = 0x255b;mapto437[0xbf] = 0x2510;mapto437[0xc0] = 0x2514;mapto437[0xc1] = 0x2534;mapto437[0xc2] = 0x252c;mapto437[0xc3] = 0x251c;mapto437[0xc4] = 0x2500;mapto437[0xc5] = 0x253c;mapto437[0xc6] = 0x255e;mapto437[0xc7] = 0x255f;mapto437[0xc8] = 0x255a;mapto437[0xc9] = 0x2554;mapto437[0xca] = 0x2569;mapto437[0xcb] = 0x2566;mapto437[0xcc] = 0x2560;mapto437[0xcd] = 0x2550;mapto437[0xce] = 0x256c;mapto437[0xcf] = 0x2567;mapto437[0xd0] = 0x2568;mapto437[0xd1] = 0x2564;mapto437[0xd2] = 0x2565;mapto437[0xd3] = 0x2559;mapto437[0xd4] = 0x2558;mapto437[0xd5] = 0x2552;mapto437[0xd6] = 0x2553;mapto437[0xd7] = 0x256b;mapto437[0xd8] = 0x256a;mapto437[0xd9] = 0x2518;mapto437[0xda] = 0x250c;mapto437[0xdb] = 0x2588;mapto437[0xdc] = 0x2584;mapto437[0xdd] = 0x258c;mapto437[0xde] = 0x2590;mapto437[0xdf] = 0x2580;mapto437[0xe0] = 0x03b1;mapto437[0xe1] = 0x00df;mapto437[0xe2] = 0x0393;mapto437[0xe3] = 0x03c0;mapto437[0xe4] = 0x03a3;mapto437[0xe5] = 0x03c3;mapto437[0xe6] = 0x00b5;mapto437[0xe7] = 0x03c4;mapto437[0xe8] = 0x03a6;mapto437[0xe9] = 0x0398;mapto437[0xea] = 0x03a9;mapto437[0xeb] = 0x03b4;mapto437[0xec] = 0x221e;mapto437[0xed] = 0x03c6;mapto437[0xee] = 0x03b5;mapto437[0xef] = 0x2229;mapto437[0xf0] = 0x2261;mapto437[0xf1] = 0x00b1;mapto437[0xf2] = 0x2265;mapto437[0xf3] = 0x2264;mapto437[0xf4] = 0x2320;mapto437[0xf5] = 0x2321;mapto437[0xf6] = 0x00f7;mapto437[0xf7] = 0x2248;mapto437[0xf8] = 0x00b0;mapto437[0xf9] = 0x2219;mapto437[0xfa] = 0x00b7;mapto437[0xfb] = 0x221a;mapto437[0xfc] = 0x207f;mapto437[0xfd] = 0x00b2;mapto437[0xfe] = 0x25a0;mapto437[0xff] = 0x00a0;
maptostring[0xc7] = 0x80;maptostring[0xfc] = 0x81;maptostring[0xe9] = 0x82;maptostring[0xe2] = 0x83;maptostring[0xe4] = 0x84;maptostring[0xe0] = 0x85;maptostring[0xe5] = 0x86;maptostring[0xe7] = 0x87;maptostring[0xea] = 0x88;maptostring[0xeb] = 0x89;maptostring[0xe8] = 0x8a;maptostring[0xef] = 0x8b;maptostring[0xee] = 0x8c;maptostring[0xec] = 0x8d;maptostring[0xc4] = 0x8e;maptostring[0xc5] = 0x8f;maptostring[0xc9] = 0x90;maptostring[0xe6] = 0x91;maptostring[0xc6] = 0x92;maptostring[0xf4] = 0x93;maptostring[0xf6] = 0x94;maptostring[0xf2] = 0x95;maptostring[0xfb] = 0x96;maptostring[0xf9] = 0x97;maptostring[0xff] = 0x98;maptostring[0xd6] = 0x99;maptostring[0xdc] = 0x9a;maptostring[0xa2] = 0x9b;maptostring[0xa3] = 0x9c;maptostring[0xa5] = 0x9d;maptostring[0x20a7] = 0x9e;maptostring[0x192] = 0x9f;maptostring[0xe1] = 0xa0;maptostring[0xed] = 0xa1;maptostring[0xf3] = 0xa2;maptostring[0xfa] = 0xa3;maptostring[0xf1] = 0xa4;maptostring[0xd1] = 0xa5;maptostring[0xaa] = 0xa6;maptostring[0xba] = 0xa7;maptostring[0xbf] = 0xa8;maptostring[0x2310] = 0xa9;maptostring[0xac] = 0xaa;maptostring[0xbd] = 0xab;maptostring[0xbc] = 0xac;maptostring[0xa1] = 0xad;maptostring[0xab] = 0xae;maptostring[0xbb] = 0xaf;maptostring[0x2591] = 0xb0;maptostring[0x2592] = 0xb1;maptostring[0x2593] = 0xb2;maptostring[0x2502] = 0xb3;maptostring[0x2524] = 0xb4;maptostring[0x2561] = 0xb5;maptostring[0x2562] = 0xb6;maptostring[0x2556] = 0xb7;maptostring[0x2555] = 0xb8;maptostring[0x2563] = 0xb9;maptostring[0x2551] = 0xba;maptostring[0x2557] = 0xbb;maptostring[0x255d] = 0xbc;maptostring[0x255c] = 0xbd;maptostring[0x255b] = 0xbe;maptostring[0x2510] = 0xbf;maptostring[0x2514] = 0xc0;maptostring[0x2534] = 0xc1;maptostring[0x252c] = 0xc2;maptostring[0x251c] = 0xc3;maptostring[0x2500] = 0xc4;maptostring[0x253c] = 0xc5;maptostring[0x255e] = 0xc6;maptostring[0x255f] = 0xc7;maptostring[0x255a] = 0xc8;maptostring[0x2554] = 0xc9;maptostring[0x2569] = 0xca;maptostring[0x2566] = 0xcb;maptostring[0x2560] = 0xcc;maptostring[0x2550] = 0xcd;maptostring[0x256c] = 0xce;maptostring[0x2567] = 0xcf;maptostring[0x2568] = 0xd0;maptostring[0x2564] = 0xd1;maptostring[0x2565] = 0xd2;maptostring[0x2559] = 0xd3;maptostring[0x2558] = 0xd4;maptostring[0x2552] = 0xd5;maptostring[0x2553] = 0xd6;maptostring[0x256b] = 0xd7;maptostring[0x256a] = 0xd8;maptostring[0x2518] = 0xd9;maptostring[0x250c] = 0xda;maptostring[0x2588] = 0xdb;maptostring[0x2584] = 0xdc;maptostring[0x258c] = 0xdd;maptostring[0x2590] = 0xde;maptostring[0x2580] = 0xdf;maptostring[0x3b1] = 0xe0;maptostring[0xdf] = 0xe1;maptostring[0x393] = 0xe2;maptostring[0x3c0] = 0xe3;maptostring[0x3a3] = 0xe4;maptostring[0x3c3] = 0xe5;maptostring[0xb5] = 0xe6;maptostring[0x3c4] = 0xe7;maptostring[0x3a6] = 0xe8;maptostring[0x398] = 0xe9;maptostring[0x3a9] = 0xea;maptostring[0x3b4] = 0xeb;maptostring[0x221e] = 0xec;maptostring[0x3c6] = 0xed;maptostring[0x3b5] = 0xee;maptostring[0x2229] = 0xef;maptostring[0x2261] = 0xf0;maptostring[0xb1] = 0xf1;maptostring[0x2265] = 0xf2;maptostring[0x2264] = 0xf3;maptostring[0x2320] = 0xf4;maptostring[0x2321] = 0xf5;maptostring[0xf7] = 0xf6;maptostring[0x2248] = 0xf7;maptostring[0xb0] = 0xf8;maptostring[0x2219] = 0xf9;maptostring[0xb7] = 0xfa;maptostring[0x221a] = 0xfb;maptostring[0x207f] = 0xfc;maptostring[0xb2] = 0xfd;maptostring[0x25a0] = 0xfe;maptostring[0xa0] = 0xff;
/* Convert a octet number to a code page 437 char code */
var buffer2string = function(buffer) {
	var ret = "";
	var i = 0;
	var l = buffer.length;
	var cc, nb=[];
	for (; i < l; ++i) {
		if(buffer[i]>=0x80) nb[i] = mapto437[buffer[i]];
		else nb[i] = buffer[i];
	}
	return String.fromCharCode.apply(null, nb);
};
/* Convert a code page 437 char code to a octet number*/
var string2buffer = function(src) {
	var buffer = [];
	var i = 0;
	var l = src.length;
	var cc;
	for (; i < l; ++i) {
		buffer.push(maptostring[src.charCodeAt(i)]);
	}
	return buffer;
};
var string2binary = function(src) {
	var buffer = "";
	var i = 0;
	var l = src.length;
	var cc;
	for (; i < l; ++i) {
		buffer += String.fromCharCode(maptostring[src.charCodeAt(i)]);
	}
	return buffer;
};
var binary2string = function(src) {
	var ret = "";
	var i = 0;
	var l = src.length;
	var cc;
	for (; i < l; ++i) {
		ret += String.fromCharCode(mapto437[src.charCodeAt(i)]);
	}
	return ret;
};

var $io = (function()
{
	var $Io = {};
	$Io.filesize = 0;
	$Io.is = function(path){if(path.length<2)return false; return path.substr(1,1)==":";};
	$Io.fso = new ActiveXObject("scripting.filesystemobject");
	$Io.stream = function(mode,type)
	{
		var stream = F.activex("adodb.stream");stream.mode = mode ||3;stream.type = type||1;return stream;
	};
	$Io.fps=[];
	$Io.get_filesize = function(fp)
	{
		return $Io.fps[fp][3];
	};
	$Io.absolute = function(path)
	{
		path = F.mappath(path);
		return $Io.fso.GetAbsolutePathName(path);
	};
	$Io.base = function(path)
	{
		path = F.mappath(path);
		return $Io.fso.GetBaseName (path);
	};
	$Io.parent = function(path)
	{
		return $Io.fso.GetParentFolderName(F.mappath(path));
	};
	$Io.build = function(path,name)
	{
		return $Io.fso.GetAbsolutePathName($Io.fso.BuildPath(F.mappath(path),name));
	};
	$Io.get = function(path)
	{
		path = F.mappath(path);
		var src = null;
		if($Io.file.exists(path))
		{
			src = $Io.fso.getFile(path);
		}
		else if($Io.directory.exists(path))
		{
			src = $Io.fso.getFolder(path);
		}
		if(src==null)
		{
			ExceptionManager.put(0x2d1e,"io.get","file or directory is not exists.");
			return {};
		}
		return {
			attr : src.Attributes,
			toString : function(){return $Io.attr.toString(src.Attributes);},
			date : {
				created: src.DateCreated,
				accessed: src.DateLastAccessed,
				modified: src.DateLastModified
			},
			name : src.Name,
			path : src.Path,
			size : src.Size,
			type : src.Type,
			src : src
		};
	};
	$Io.attr = function(path,attr)
	{
		var b = $Io.get(path);
		if(!b.hasOwnProperty("src")) return -1;
		if(attr!==undefined)
		{
			if(attr & 8 || attr & 16 || attr & 64 || attr & 128)
			{
				ExceptionManager.put(0x2d0d,"io.attr","attributes value error.");
				return -1;
			}
			return b.src.Attributes = attr;
		}
		else
		{
			return b.src.Attributes;
		}
	};
	$Io.attr.add = function(path, attr)
	{
		var b = $Io.get(path);
		if(!b.hasOwnProperty("src")) return -1;
		if(!(b.src.Attributes & attr)) return b.src.Attributes |= attr;
		return -1;
	};
	$Io.attr.remove = function(path, attr)
	{
		var b = $Io.get(path);
		if(!b.hasOwnProperty("src")) return -1;
		if(b.src.Attributes & attr) return b.src.Attributes ^= attr;
		return -1;
	};
	$Io.attr.toString = function(attr)
	{
		var attrString = "";
		if(attr>0)
		{
			for(var i in $Io.attrs)
			{
				if(!$Io.attrs.hasOwnProperty(i))
				{
					continue;
				}
				if(attr & $Io.attrs[i])
				{
					attrString += i + ", ";
				}
			}
			if(attrString != "")
			{
				attrString = attrString.substr(0, attrString.length-2);
			}
		}
		else
		{
			attrString = "Normal";
		}
		return attrString;
	};
	return $Io;
})();

/*some methods for file*/
$io.file = $io.file || (function()
{
	var $file = {};
	var $fn = function(fp, content)
	{
		$file.write(fp,content);
		var result = $file.flush(fp) === true;
		$file.close(fp);
		return result;
	};
	$file.get = function(path)
	{
		var src = null;
		path = F.mappath(path);
		if($io.fso.fileexists(path))
		{
			src = $io.fso.getFile(path);
		}else{
			ExceptionManager.put(0x2d1e,"io.file.get","file is not exists.");
		}
		return src;
	};
	$file.exists = function(path)
	{
		path = F.mappath(path);
		return $io.fso.fileexists(path);
	};
	$file.del = function(path)
	{
		if(!$file.exists(path)) return true;
		try
		{
			$io.fso.deletefile(F.mappath(path));
			return true;
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.file.del");
			return false;
		}
	};
	$file.copy = function(src, dest)
	{
		try
		{
			$io.fso.CopyFile(src, dest);
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.file.copy");
			return false;
		}
	};
	$file.move = function(src, dest){
		try
		{
			$io.fso.MoveFile(src, dest);
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.file.move");
			return false;
		}
	};
	$file.readAllText = function(path, encoding){
		var fp = $io.file.open(path,{forText : true, forRead : true , encoding : encoding || "utf-8"}); var content = $io.file.read(fp); $io.file.close(fp); 
		return content;
	};
	$file.readAllBuffer = function(path){
		var fp = $io.file.open(path,{forText : true, forRead : true , encoding : "437"}); var content = $io.file.read(fp); $io.file.close(fp); 
		return string2buffer(content);
	};
	$file.readAllTextBinary = function(path){
		var fp = $io.file.open(path,{forText : true, forRead : true , encoding : "437"}); var content = $io.file.read(fp); $io.file.close(fp); 
		return string2binary(content);
	};
	$file.readAllScript = function(path, encoding){
		var fp = $io.file.open(path,{forText : true, forRead : true , encoding : encoding || "utf-8"}); var content = $io.file.read(fp); $io.file.close(fp);
		return content.replace(new RegExp("^(\\s*)<s" + "cript(.+?)>(\\s*)","i"),"").replace(new RegExp("(\\s*)<\\/s" + "cript>(\\s*)$","i"),"");
	};
	$file.readAllBytes = function(path){
		var fp = $io.file.open(path,{forText : false, forRead : true}); var content = $io.file.read(fp);$io.file.close(fp);
		return content;
	};
	$file.writeAllBytes = function(path,content){
		return $fn($file.open(path, {forText : false}), content);
	};
	$file.writeAllText = function(path,content,encoding){
		return $fn($file.open(path, {encoding : encoding || "utf-8"}), content);
	};
	$file.writeAllBuffer = function(path,buffer){
		return $fn($file.open(path, {encoding : "437"}), buffer2string(buffer));
	};
	$file.appendAllBytes = function(path,content){
		return $fn($file.open(path, {forText : false, forAppend : true}), content);
	};
	$file.appendAllText = function(path,content,encoding){
		return $fn($file.open(path, {encoding : encoding || "utf-8", forAppend : true}), content);
	};
	$file.open = function(path,opt)
	{
		$io.filesize = 0;
		path = F.mappath(path);
		var cfg = 
		{
			forAppend : false,
			forText : true,
			forRead : false,
			encoding : "utf-8"
		};
		F.extend(cfg, opt||{});
		var fp = $io.stream(3, cfg.forText ? 2 : 1);
		if(cfg.forText)
		{
			fp.charset=cfg.encoding;
		}
		fp.open();
		if($file.exists(path) && (cfg.forAppend || cfg.forRead))
		{
			fp.loadfromfile(path);
			$io.filesize = fp.size;
			if(cfg.forAppend)
			{
				fp.position = fp.size;
			}
		}
		$io.fps.push([fp,path,cfg,$io.filesize]);
		return $io.fps.length-1;
	};
	$file.seek = function(fp,position)
	{
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d2e,"io.file.seek","file resource id is invalid.");
			return;
		}
		$io.fps[fp][0].position = position;
	};
	$file.write = function(fp,content)
	{
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d3e,"io.file.write","file resource id is invalid.");
			return;
		}
		try{
			if($io.fps[fp][2].forText)
			{
				$io.fps[fp][0].writeText(content);
			}
			else
			{
				$io.fps[fp][0].write(content);
			}
		}catch(ex){
			ExceptionManager.put(ex,"io.file.write");
		}
	};
	$file.writeTo = function(fp, fp2, length){
		if(length){
			$io.fps[fp][0].CopyTo($io.fps[fp2][0], length);
		}else{
			$io.fps[fp][0].CopyTo($io.fps[fp2][0]);
		}
	};	
	$file.writeToResponse = function(fp, blocksize){
		var stream = $io.fps[fp][0],readed = 0, block = blocksize || 524288;
		readed =0;
		if(block>=stream.size){
			Response.BinaryWrite(stream.Read(stream.size));
		}else{
			while(readed<stream.size){
				if(readed+block>stream.size)block = stream.size-readed;
				Response.BinaryWrite(stream.read(block));
				readed += block;
			}
		}
	};	
	$file.writeBuffer = function(fp,content){
		return $file.write(fp, buffer2string(content));
	};
	$file.read = function(fp,length){
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d4e,"io.file.read","file resource id is invalid.");
			return null;
		}
		if($io.fps[fp][2].forText)
		{
			if(length) return $io.fps[fp][0].readText(length);
			return $io.fps[fp][0].readText();
		}
		else
		{
			if(length) return $io.fps[fp][0].read(length);
			return $io.fps[fp][0].read();
		}
	};
	$file.readBuffer = function(fp,length){
		return string2buffer($file.read(fp, length));
	};
	$file.flush = function(fp)
	{
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d5e,"io.file.flush","file resource id is invalid.");
			return;
		}
		fp = $io.fps[fp];
		try{
			fp[0].flush();
			fp[0].saveToFile(fp[2].saveas || fp[1],2);
			return true;
		}catch(ex){
			ExceptionManager.put(ex,"io.file.flush['" + F.string.right(fp[1],"\\") + "']");
		}
	};
	$file.close = function(fp){
		if(!$io.fps[fp])
		{
			ExceptionManager.put(0x2d6e,"io.file.close","file resource id is invalid.");
			return;
		}
		$io.fps[fp][0].close();
	};
	$file.extension = function(path)
	{
		return $io.fso.GetExtensionName(F.mappath(path));
	};
	return $file;
})();

/*some methods for directory*/
$io.directory = $io.directory || (function()
{
	var $dir = {};
	$dir.get = function(path)
	{
		var src = null;
		if($io.fso.folderexists(path))
		{
			src = $io.fso.getFolder(path);
		}else{
			ExceptionManager.put(0x2d1e,"io.directory.get","directory is not exists.");
		}
		return src;
	};
	$dir.exists = function(path)
	{
		path = F.mappath(path);
		return $io.fso.folderexists(path);
	};
	$dir.del = function(path)
	{
		if(!$dir.exists(path)) return true;
		try
		{
			$io.fso.deletefolder(F.mappath(path));
			return true;
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.del");
			return false;
		}
	};
	$dir.copy = function(src, dest)
	{
		try
		{
			$io.fso.CopyFolder(src, dest);
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.copy");
			return false;
		}
	};
	$dir.move = function(src, dest)
	{
		try
		{
			$io.fso.MoveFolder(src, dest);
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.move");
			return false;
		}
	};
	$dir.create = function(path)
	{
		path = F.mappath(path);
		if($dir.exists(path))
		{
			return true;
		}
		var parent = $io.fso.GetParentFolderName(path);
		if(!$dir.exists(parent))
		{
			$dir.create(parent);
		}
		try
		{
			$io.fso.CreateFolder(path);
			return true;
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.create");
			return false;
		}
	};
	$dir.clear = function(path, filter)
	{
		path = F.mappath(path);
		var isFunc = (typeof filter == "function");
		if(!$dir.exists(path))
		{
			return false;
		}
		try
		{
			$dir.files(path, function(f){
				if(isFunc){
					if(filter(f,true)!==false)f.Delete();
				}else{
					f.Delete();
				}
			});
			$dir.directories(path, function(f){
				if(isFunc){
					if(filter(f,false)!==false)f.Delete();
				}else{
					f.Delete();
				}
			});
			return true;	
		}
		catch(ex)
		{
			ExceptionManager.put(ex,"io.directory.clear");
			return false;	
		}
	};
	$dir.files = function(path,callback)
	{
		if(!$dir.exists(path))
		{
			return [];
		}
		var files=[];
		path = F.mappath(path);
		var fc = new Enumerator($io.fso.getFolder(path).files);
		var isFunc = (typeof callback == "function");
		for (;!fc.atEnd(); fc.moveNext())
		{
			if(isFunc) callback(fc.item());
			else files.push(fc.item().path);
		}
		return files;
	};
	$dir.directories = function(path,callback)
	{
		if(!$dir.exists(path)) return [];
		var files=[];
		path = F.mappath(path);
		var fc = new Enumerator($io.fso.getFolder(path).subfolders);
		var isFunc = (typeof callback == "function");
		for (;!fc.atEnd(); fc.moveNext())
		{
			if(isFunc) callback(fc.item());
			else files.push(fc.item().path);
		}
		return files;
	};
	$dir.windows = $io.fso.GetSpecialFolder(0);
	$dir.system = $io.fso.GetSpecialFolder(1);
	$dir.temp = $io.fso.GetSpecialFolder(2);
	return $dir;
})();

/*some methods for drive*/
function get_drive(dr){
	if(dr.IsReady){
		return {
			space : {
				available : dr.AvailableSpace,
				free : dr.FreeSpace,
				total : dr.TotalSize
			},
			letter : dr.DriveLetter,
			type : dr.DriveType,
			typeString : $io.drive.types[dr.DriveType] || "Unknown",
			fileSystem : dr.FileSystem,
			isReady : dr.IsReady,
			path : dr.Path,
			sn : (dr.SerialNumber < 0 ? (dr.SerialNumber+0x100000000) : dr.SerialNumber).toString(16),
			volumename : dr.VolumeName
		};	
	}else{
		return {
			letter : dr.DriveLetter,
			type : dr.DriveType,
			typeString : $io.drive.types[dr.DriveType] || "Unknown",
			isReady : dr.IsReady,
			path : dr.Path
		};
	}
}
$io.drive = $io.drive || function(path)
{
	return get_drive($io.fso.GetDrive($io.fso.GetDriveName(F.mappath(path))));
};
$io.drive.drives = function(callback, raw){
	var ds = $io.fso.Drives, e = new Enumerator($io.fso.Drives);
	for (; !e.atEnd(); e.moveNext())
	{
		callback(raw===true ? e.item() : get_drive(e.item()));
	}
	e = null;
};
$io.drive.types = [
	"Unknown", 
	"Removable", 
	"Fixed", 
	"Network", 
	"CDROM", 
	"RAM"
];
$io.attrs = {
	Normal : 0, 
	ReadOnly : 1, 
	Hidden : 2, 
	System : 4, 
	Volume : 8, 
	Directory : 16, 
	Archive : 32, 
	Alias : 64, 
	Compressed : 128
};
$io.directory.attr = $io.file.attr = $io.attr;
$io.directory.base = $io.file.base = $io.base;
$io.directory.absolute = $io.file.absolute = $io.absolute;
$io.directory.parent = $io.file.parent = $io.parent;
$io.binary2buffer = function(bin){
	return F.activex("ADODB.STREAM", function(data){
		var byts;
		this.Mode = 3; this.Type = 1;
		this.Open();
		this.Write(data);
		this.Position = 0;
		this.Type = 2;
		this.CharSet = 437;
		byts = this.ReadText();
		this.Close();
		return string2buffer(byts);
	}, bin);
};
$io.buffer2binary = function(bin){
	return F.activex("ADODB.STREAM", function(data){
		var byts;
		this.Mode = 3;
		this.Type = 2;
		this.CharSet = 437;
		this.Open();
		this.WriteText(buffer2string(data));
		this.Position = 0;
		this.Type = 1;
		byts = this.Read();
		this.Close();
		return byts;
	}, bin);
};
$io.string2buffer = string2buffer;
$io.buffer2string = buffer2string;
var stream_buffer = null;
function buffer_init(type, charset){
	if(stream_buffer){
		stream_buffer.SetEOS();
		stream_buffer.Position = 0;
		stream_buffer.Type = type || 1;
		if(type==2) stream_buffer.CharSet = charset || 437;
		return;
	}
	stream_buffer = $io.stream(3,1);
	stream_buffer.Open();
}
Mo.on('dispose', function(){
	if(stream_buffer) stream_buffer.Close();
	stream_buffer = null;
});
$io.buffer_read_bytes = function(stream, size){
	buffer_init(); 
	if(stream.EOS) return null;
	stream.CopyTo(stream_buffer, size);
	buffer_init(2);
	return string2buffer(stream_buffer.ReadText(size));
};
$io.buffer_read_byte = function(stream){
	buffer_init();
	if(stream.EOS) return -1;
	stream.CopyTo(stream_buffer, 1);
	buffer_init(2);
	return string2buffer(stream_buffer.ReadText(1))[0];
};
$io.buffer_read_boolean = function(stream){
	buffer_init();
	if(stream.EOS){
		ExceptionManager.put(0x2d25,"io.buffer_read_boolean","end of stream.");
		return null;
	}
	stream.CopyTo(stream_buffer, 1);
	buffer_init(2);
	return string2buffer(stream_buffer.ReadText(1))[0]!=0;
};
$io.buffer_read_int = function(stream){
	var bytes = $io.buffer_read_bytes(stream, 4);
	if(!bytes) return -1;
	return (bytes[0] << 24 >>> 0) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3];
};
$io.buffer_read_int = function(stream){
	var bytes = $io.buffer_read_bytes(stream, 4);
	if(!bytes) return -1;
	return (bytes[3] << 24 >>> 0) + (bytes[2] << 16) + (bytes[1] << 8) + bytes[0];
};
$io.buffer_read_string = function(stream, size, charset){
	buffer_init();
	if(stream.EOS){
		ExceptionManager.put(0x2d25,"io.buffer_read_string","end of stream.");
		return "";
	}
	stream.CopyTo(stream_buffer, size || -1);
	buffer_init(2, charset || "utf-8");
	return stream_buffer.ReadText();
};
module.exports = $io;
})(modules.exports, require, modules, __filename, __dirname, define);
module.exports.push(modules.exports);
modules.exports = {};
(function(exports,require,module,__filename,__dirname,define){
/*
 ** File: dist.js
 ** Usage: define some necessary class for MAE.
 ** Detail:
 **		IClass, use the interface to create a class quickly.
 **		IController, user this interface to create a new controller.
 ** About:
 **		support@mae.im
 */

/*IClass*/
function IClass() {}
IClass.extend = function(name, fn) {
	if (name && typeof name == "object") {
		for (var n in name) {
			if (!name.hasOwnProperty(n)) continue;
			if (typeof name[n] == "function") this.prototype[n] = name[n];
		}
		return;
	}
	if (typeof fn != "function") {
		ExceptionManager.put("0x5ca", "IClass.extend(...)", "argument 'fn' must be a function.");
		return;
	}
	this.prototype[name] = fn;
	return new IFunction(fn);
};
IClass.extend("__destruct", function() {});
IClass.create = function(__construct, __destruct) {
	var _this = this;
	var newClass = (function(fn) {
		return function() {
			_this.call(this);
			this.__STATUS__ = true;
			if (typeof fn == "function") this.__STATUS__ = fn.apply(this, arguments) !== false;
		};
	})(__construct);
	newClass.prototype = new _this();
	newClass.extend = _this.extend;
	newClass.AsPrivate = function() {
		this.__PRIVATE__ = true;
		return this;
	};
	if (typeof __destruct == "function") newClass.prototype.__destruct = __destruct;
	return newClass;
};

/*IController*/
function IFunction(fn) {
	this.fn = fn;
	this.fn._data = {};
}
IFunction.prototype.AsPrivate = function() {
	this.fn.__PRIVATE__ = true;
	return this;
};
IFunction.prototype.data = function(key, value) {
	if(value === undefined) return this.fn_data[key];
	this.fn._data[key] = value;
	return this;
};

function IController() {
	IClass.call(this);
}
IController.prototype = new IClass();
IController.extend = function(name, isPost, fn) {
	if (name && typeof name == "object") {
		for (var n in name) {
			if (!name.hasOwnProperty(n)) continue;
			IController.extend.call(this, n, name[n]);
		}
		return;
	}
	if (Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY === false) name = name.toLowerCase();
	if (isPost === true) {
		name += "_Post_";
	} else {
		fn = isPost;
	}
	IClass.extend.call(this, name, fn);
	return new IFunction(fn);
};
IController.extend("assign", function(key, value) {
	Mo.assign(key, value);
}).AsPrivate();
IController.extend("invoke", function(name) {
	var args = Array.prototype.slice.call(arguments, 1);
	if (Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY === false) name = name.toLowerCase();
	if(!this[name]){
		MEM.put(0x3d4e, "IController.invoke", "No method was found.");
		return;
	}
	return this[name].apply(this, args);
}).AsPrivate();
IController.extend("getAction", function(name) {
	if (Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY === false) name = name.toLowerCase();
	return this[name];
}).AsPrivate();
IController.extend("display", function() {
	Mo.display.apply(Mo, arguments);
}).AsPrivate();
IController.extend("fetch", function() {
	return Mo.fetch.apply(Mo, arguments);
}).AsPrivate();
IController.create = IClass.create;

exports.IController = IController;
exports.IClass = IClass;
})(modules.exports, require, modules, __filename, __dirname, define);
module.exports.push(modules.exports);
modules.exports = {};
(function(exports,require,module,__filename,__dirname,define){
/*
    json2.js
    2015-05-03
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    See http://www.JSON.org/js.html
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/
(function (JSON) {
    'use strict';
    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	function js(str) {
		var i, c, es=[], ret = "", len = str.length, buffer=[];
		es[8]='b';es[9]='t';es[10]='n';es[12]='f';es[13]='r';es[34]='"';es[47]='\/';es[92]='\\';
		for (i = 0; i < len; i++) {
			c = str.charCodeAt(i);
			if(es[c]!==undefined){
				buffer.push(92, c);
				continue;
			}
			if (c > 31 && c < 127) {
				buffer.push(c);
				continue;
			}
			if(buffer.length>0){
				ret += String.fromCharCode.apply(null, buffer);
				buffer.length = 0;
			}
			ret += "\\u" + ("0000" + c.toString(16)).slice(-4);
		}
		if(buffer.length>0){
			ret += String.fromCharCode.apply(null, buffer);
			buffer.length = 0;
		}
		return ret;
	}
    function f(n) {
        return n < 10 
            ? '0' + n 
            : n;
    }
    function this_value() {
        return this.valueOf();
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function () {
            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate()) + 'T' +
                        f(this.getUTCHours()) + ':' +
                        f(this.getUTCMinutes()) + ':' +
                        f(this.getUTCSeconds()) + 'Z'
                : null;
        };
        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }
    var gap,
        indent,
        meta,
        rep;
    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) 
            ? '"' + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' 
            : '"' + string + '"';
    }
    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case 'string':
            return JSON.encode ? '"'+js(value)+'"' : quote(value);
        case 'number':
            return isFinite(value) 
                ? String(value) 
                : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0
                    ? '[]'
                    : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            }
            v = partial.length === 0
                ? '{}'
                : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
	JSON.encode = false;
	JSON.encodeUnicode = function(value){JSON.encode = value!==false;};
    if (typeof JSON.stringify !== 'function') {
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (
                rx_one.test(
                    text
                        .replace(rx_two, '@')
                        .replace(rx_three, ']')
                        .replace(rx_four, '')
                )
            ) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
    
	JSON.ARRAY=1;
	JSON.OBJECT=2;
	JSON.create = function(jsonType){
		if(JSON.class_) return new JSON.class_(jsonType);
		JSON.class_ = function(_jsonType){
			if(typeof _jsonType=="object" && _jsonType.constructor==Array)
			{
				this.jsonType = JSON.ARRAY;
				this.data = _jsonType;
			}
			else if(typeof _jsonType=="object" && _jsonType.constructor==Object)
			{
				this.jsonType = JSON.OBJECT;
				this.data = _jsonType;
			}
			else
			{
				this.jsonType = (_jsonType !== JSON.ARRAY ? JSON.OBJECT : JSON.ARRAY);
				this.data=(this.jsonType == JSON.ARRAY ? [] : {});
			}
		};
		JSON.class_.prototype.put = function(value){
			if(arguments.length==2) return JSON.class_.prototype.set.apply(this,arguments);
			if(typeof value=="object" && value.constructor == JSON.class_)
			{
				this.data.push(value.data);
				return value;
			}
			this.data.push(value);
			return this;
		};
		JSON.class_.prototype.putArray = function(){
			var args=arguments, key=null;
			if(this.jsonType==JSON.OBJECT){
				key = (args = Array.prototype.slice.apply(arguments)).shift();
			}
			var object = (function(json, args){
				if(args.length==1 && typeof args[0]=="object" && args[0].constructor==Array)
				{
					json.data = args[0];
				}
				else
				{
					json.data = Array.prototype.slice.apply(args);
				}
				return json;
			})(JSON.create(JSON.ARRAY), args);
			
			if(this.jsonType==JSON.OBJECT){
				return this.put(key,object);
			}else{
				return this.put(object);
			}
		};
		JSON.class_.prototype.putObject = function(){
			var args=arguments, key=null;
			if(this.jsonType==JSON.OBJECT){
				key = (args = Array.prototype.slice.apply(arguments)).shift();
			}
			
			var object = (function(json, args){
				if(args.length>0)json.data = args[0];
				return json;
			})(JSON.create(), args);
			
			if(this.jsonType==JSON.OBJECT){
				return this.put(key,object);
			}else{
				return this.put(object);
			}
		};
		JSON.class_.prototype.set = function(key, value){
			if(typeof value=="object" && value.constructor == JSON.class_)
			{
				this.data[key]=value.data;
				return value;
			}
			this.data[key]=value;
			return this;
		};
		JSON.class_.prototype.get = function(key){
			return this.data[key];
		};
		JSON.class_.prototype.stringify = JSON.class_.prototype.toString = function(space){
			return JSON.stringify(this.data,null,space||"");
		};
		JSON.class_.prototype.toXML = function(rootElementName){
			rootElementName = rootElementName || "root";
			return json2xml(this.data, rootElementName);
		};
		return new JSON.class_(jsonType); 
	};
}(module.exports));
})(modules.exports, require, modules, __filename, __dirname, define);
module.exports.push(modules.exports);
