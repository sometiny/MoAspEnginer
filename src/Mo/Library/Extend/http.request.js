/*
** File: http.request.js
** Usage: a library for http request
** About: 
**		support@mae.im
*/

var cfg={
	method : "GET",
	data : "",
	autoClearBuffer : false,
	url : "",
	timeout : [10000, 10000, 10000, 30000],
	charset : "utf-8",
	headers : []
};


var getXmlHttpRequestObject = function() {
	var b = null;
	var httplist = ["MSXML2.serverXMLHttp.3.0", "MSXML2.serverXMLHttp", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp"];
	for (var i = 0; i <= httplist.length - 1; i++) {
		try {
			b = new ActiveXObject(httplist[i]);
			(function(o) {
				getXmlHttpRequestObject = function() {
					return new ActiveXObject(o)
				};
			})(httplist[i]);
			return b;
		} catch (ex) {
			//
		}
	}
	return b;
};

var bytesToString = function(bytSource, Cset) { //ef bb bf,c0 fd
	var stream = new ActiveXObject("ADODB.Stream"), byts;
	stream.Type = 1;
	stream.Mode = 3;
	stream.Open();
	stream.Write(bytSource);
	stream.Position = 0;
	stream.Type = 2;
	stream.CharSet = Cset;
	byts = stream.ReadText();
	stream.Close();
	stream = null;
	return byts;
};
/****************************************************
'@DESCRIPTION:	define $httprequest object. All the parms can be assigned after create instance
'@PARAM:	url [String[option]] : target URL.
'@PARAM:	method [String[option]] : request method. POST/GET/HEADER....
'@PARAM:	data [String[option]] : data need to send
'@PARAM:	autoClearBuffer [Boolean[option]] : auto clear buffer when request
'****************************************************/
function $httprequest(url, method, data, autoClearBuffer) {
	var $g={};
	F.extend($g,cfg);
	if(typeof url == "object") F.extend($g,url);
	else{
		F.extend($g,{
			url : url,
			method : method,
			data : data,
			autoClearBuffer : autoClearBuffer
		});
	}
	$g.method = $g.method || "GET";
	$g.data = $g.data || "";
	$g.autoClearBuffer = $g.autoClearBuffer || false;
	if ($g.method == "") $g.method = "GET";
	$g.method = $g.method.toUpperCase();
	if ($g.method == "POST") $g.autoClearBuffer = false;
	this.timeout = $g.timeout;
	this.istimeout = false;
	this.sended = false;
	this.method = $g.method;
	this.url = $g.url;
	this.data = $g.data;
	this.charset = $g.charset;
	this.base = null;
	this.headers = $g.headers;
	this.status = 0;
	this.readyState = 0;
	this.content = null;
	this.msg = "";
	this.autoClearBuffer = $g.autoClearBuffer;
	this.response = null;
	this.dataset = {
		charset: "utf-8",
		data: [],
		append: function(key, value, noencode) {
			var fn = null;
			if (this.charset.toLowerCase() == "utf-8") {
				fn = function(_str) {
					return encodeURIComponent(_str).replace(/\+/igm, "%2B").replace(/\//igm, "%2F");
				};
			} else {
				fn = function(_str) {
					return escape(_str).replace(/\+/igm, "%2B").replace(/\//igm, "%2F");
				};
			}
			if (noencode == true) {
				fn = function(_str) {
					return _str;
				}
			}
			this.data.push({
				"key": fn(key),
				"value": fn(value)
			});
		},
		remove: function(key) {
			if (this.data.length <= 0) return false;
			var _data = [];
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i].key != key) {
					1
					_data.push(this.data[i]);
				}
			}
			this.data = _data;
		},
		isexists: function(key) {
			if (this.data.length <= 0) return false;
			for (var i = 0; i < this.data.length; i++) {
				if (this.data[i].key == key) {
					return true;
				}
			}
			return false;
		},
		clear: function() {
			this.dataset.data = [];
		}
	};
	if(typeof this.data == "object"){
		for(var k in this.data){
			if(!this.data.hasOwnProperty(k))continue;
			this.dataset.append(k,this.data[k]);
		}
		this.data="";
	}
}
$httprequest.fn = $httprequest.prototype;

/****************************************************
'@DESCRIPTION:	init. I will call this method automaticly.
'****************************************************/
$httprequest.fn.init = function() {
	var datasetstr = "";
	this.response = null;
	if (this.dataset.data.length > 0) {
		for (var i = 0; i < this.dataset.data.length; i++) {
			datasetstr += this.dataset.data[i].key + "=" + this.dataset.data[i].value + "&";
		}
	}
	if (datasetstr != "") datasetstr = datasetstr.substr(0, datasetstr.length - 1);
	if (this.data == "") {
		this.data = datasetstr;
	} else {
		if (datasetstr != "") this.data += "&" + datasetstr;
	}
	if (this.data == "") this.data = null;
	var sChar = ((this.url.indexOf("?") < 0) ? "?" : "&");
	if (this.data != null) this.url += sChar + this.data;
	if (this.method == "GET" && this.autoClearBuffer) {
		this.headers.push("If-Modified-Since:0");
		this.headers.push("Cache-Control:no-cache");
	}
	if (this.method == "POST") this.headers.push("Content-Type:application/x-www-form-urlencoded");
	if (!this.charset || this.charset == "") this.charset = "utf-8";
};

/****************************************************
'@DESCRIPTION:	set http request header
'@PARAM:	headstr [String] : hearder string. eg: header("User-Agent:MoHttpRequest1.0")
'@RETURN:	[Object] return self;
'****************************************************/
$httprequest.fn.header = function(headstr) {
	if (headstr.indexOf(":") >= 0) this.headers.push(headstr);
	return this;
};

/****************************************************
'@DESCRIPTION:	set http request timeout. Support four argument at most.
'@RETURN:	[Object] return self;
'****************************************************/
$httprequest.fn.timeouts = function() {
	if (arguments.length > 4) {
		return this;
	}
	for (var i = 0; i < arguments.length; i++) {
		if (!isNaN(arguments[i])) {
			this.timeout[i] = parseInt(arguments[i]);
		}
	}
	return this;
};

/****************************************************
'@DESCRIPTION:	send request.if you don't call this method,I will call it automaticly.
'@RETURN:	[Object] return self;
'****************************************************/
$httprequest.fn.send = function(fn) {
	this.init();
	if (typeof fn == "function") fn.apply(this, []);
	this.base = getXmlHttpRequestObject();
	if (this.base == null) {
		return this;
	}
	try {
		this.base.setOption(2) = 13056;
		this.base.setTimeouts(this.timeout[0], this.timeout[1], this.timeout[2], this.timeout[3]);
	} catch (ex) {}
	this.base.open(this.method, this.url, false);
	if (this.headers.length > 0) {
		for (var i = 0; i < this.headers.length; i++) {
			var Sindex = this.headers[i].indexOf(":");
			var key = this.headers[i].substr(0, Sindex);
			var value = this.headers[i].substr(Sindex + 1);
			this.base.setRequestHeader(key, value);
		}
	}
	try {
		this.base.send(this.data);
		this.sended = true;
		this.readyState = this.base.readyState;
		if (this.base.readyState == 4) {
			this.status = parseInt(this.base.status);
			this.content = this.base.responseBody;
		}
	} catch (ex) {
		this.sended = true;
		this.readyState = -1;
		this.msg = ex.description;
	}
	return this;
}
/****************************************************
'@DESCRIPTION:	save http response to local file
'@PARAM:	filepath [String] : local file path
'@RETURN:	[Object] return self;
'****************************************************/
$httprequest.fn.save = function(filepath) {
	if (!this.sended) this.send();
	var stream = new ActiveXObject("Adodb.Stream");
	stream.Type = 1;
	stream.Mode = 3;
	stream.Open();
	stream.Write(this.content);
	stream.saveToFile(filepath, 2);
	stream.Close();
	stream = null;
	return this;
};

/****************************************************
'@DESCRIPTION:	fetch response as binary
'@RETURN:	[Binary] response binary
'****************************************************/
$httprequest.fn.getbinary = function() {
	if (!this.sended) this.send();
	return this.content;
};

/****************************************************
'@DESCRIPTION:	fetch response as text
'@PARAM:	charset [String] : text charset
'@RETURN:	[String] response text
'****************************************************/
$httprequest.fn.gettext = function(charset) {
	if (!this.sended) this.send();
	if (this.readyState == -1) return "";
	try {
		return bytesToString(this.content, charset ? charset : this.charset);
	} catch (ex) {
		this.msg = ex.description;
		return "";
	}
};

/****************************************************
'@DESCRIPTION:	fetch response as json
'@PARAM:	charset [String] : text charset
'@RETURN:	[Object] json object
'****************************************************/
$httprequest.fn.getjson = function(charset) {
	if (!this.sended) this.send();
	if (this.readyState == -1) return null;
	try {
		return (new Function("return " + this.gettext(charset) + ";"))();
	} catch (ex) {
		this.msg = ex.description;
		return null;
	}
};

/****************************************************
'@DESCRIPTION:	get response header
'@PARAM:	key [String] : header name
'@RETURN:	[String] header value
'****************************************************/
$httprequest.fn.getheader = function(key) {
	if (!this.sended) this.send();
	if (key) {
		if (key.toUpperCase() == "SET-COOKIE") {
			key = key.replace("-", "\-");
			var headers = this.base.getAllResponseHeaders(),
				regexp = new RegExp("\n" + key + "\:(.+?)\r", "ig"),
				resstr = "", val;
			while ((res = regexp.exec(headers)) != null) {
				var val =res[1].replace(/(^(\s+)|(\s+)$)/igm, "");
				resstr = resstr + val.substr(0, val.indexOf(";")) + "; "
			}
			if (resstr != "") {
				resstr = resstr.substr(0, resstr.lastIndexOf(";"));
			}
			return resstr;
		} else {
			return this.base.getResponseHeader(key);
		}
	} else {
		return this.base.getAllResponseHeaders();
	}
};

/****************************************************
'@DESCRIPTION:	fetch response as xml document
'@PARAM:	charset [String] : text charset
'@RETURN:	[XMLDocument] return null when parse failed
'****************************************************/
$httprequest.fn.getxml = function(charset) {
	if (!this.sended) this.send();
	if (this.readyState == -1) return null;
	try {
		var _dom = new ActiveXObject("MSXML2.DOMDocument");
		_dom.loadXML(this.gettext(charset));
		return _dom;
	} catch (ex) {
		this.msg = ex.description;
		return null;
	}
};
if (!exports.http) exports.http = {};
return exports.http.request = $httprequest;