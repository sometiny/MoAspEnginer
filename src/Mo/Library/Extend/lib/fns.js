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
_.formatdate = function(dt, fs) {
	if (dt===null || dt===undefined) return '';
	if (fs===undefined) return _.formatdate(new Date(), dt);
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

	fs = fs.replace(/(yyyy|mmmm|mmm|mm|dddd|ddd|dd|hh|ss|tttt|m|d|h|s)/ig,function(diff){
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
	});

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
	charset = charset || "utf-8"
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
}
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