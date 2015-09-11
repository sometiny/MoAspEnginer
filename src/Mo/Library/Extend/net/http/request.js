/*
** File: net/http/request.js
** Usage: a library for http request
** About: 
**		support@mae.im
*/
var cfg={
	method : "GET",
	data : "",
	autoClearBuffer : false,
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
function $httprequest(url, method, data, autoClearBuffer) {
	if(this.constructor!==$httprequest) return new $httprequest(url, method, data, autoClearBuffer);
	var $g={};
	F.extend($g,cfg);
	if(typeof method == "object") F.extend($g,method);
	else{
		F.extend($g,{
			method : method,
			data : data,
			autoClearBuffer : autoClearBuffer
		});
	}
	$g.method = $g.method || "GET";
	$g.data = $g.data || "";
	this.timeout = $g.timeout;
	this.istimeout = false;
	this.sended = false;
	this.method = $g.method.toUpperCase();
	this.url = url;
	this.data = $g.data;
	this.charset = $g.charset || "utf-8";
	this.base = null;
	this.headers = $g.headers;
	this.status = 0;
	this.readyState = 0;
	this.content = null;
	this.msg = "";
	this.autoClearBuffer = $g.autoClearBuffer === true;
	this.response = null;
	this.dataset = (function(cs){
		var _data = [];
		var fn1 = function(_str) {return escape(_str).replace(/\+/igm, "%2B").replace(/\//igm, "%2F");}, fn2 = function(_str) {return _str;}, fn;
		if (cs == "UTF-8") fn1 = function(_str) {return encodeURIComponent(_str).replace(/\+/igm, "%2B").replace(/\//igm, "%2F");};
		fn = fn1;
		function _ds(){
			
		}
		_ds.encode = function(ee){
			if(ee===false){
				fn = fn2;
			}else{
				fn = fn1
			}
		};
		_ds.append = function(key, value){
			_data.push({
				"key": fn(key),
				"value": fn(value)
			});			
		};
		_ds.isexists = function(key){
			var _len = _data.length;
			if (_len <= 0) return false;
			for (var i = 0; i < _len; i++) {
				if (_data[i].key == key) {
					return true;
				}
			}
			return false;			
		};
		_ds.remove = function(key){
			var _len = _data.length;
			if (_len <= 0) return false;
			for (var i = _len-1; i >=0; i--) {
				if (_data[i].key == key) {
					_data.splice(i, 1);
				}
			}		
		};
		_ds.clear = function(){
			_data = [];	
		};
		_ds.toString = function(){
			var _len = _data.length, result = "";
			if (_len <= 0) return "";
			for (var i = 0; i < _len; i++) {
				result += _data[i].key + "=" + _data[i].value + "&";
			}
			if(result) result = result.slice(0, -1);
			return result;
		};
		return _ds;
	})(this.charset);
	
	if(typeof this.data == "object")
	{
		for(var k in this.data)
		{
			if(!this.data.hasOwnProperty(k))continue;
			this.dataset.append(k,this.data[k]);
		}
		this.data = this.dataset.toString();
		this.dataset.clear();
	}
}
$httprequest.create = function(url, method, data, autoClearBuffer)
{
	return new $httprequest(url, method, data, autoClearBuffer);
};
$httprequest.get = function(url,charset){return (new $httprequest(url)).gettext(charset);};
$httprequest.post = function(url,data,charset){return (new $httprequest(url,{method:"POST",data:data})).gettext(charset);};
$httprequest.getJSON = function(url,charset){return (new $httprequest(url)).getjson(charset);};
$httprequest.postJSON = function(url,data,charset){return (new $httprequest(url,{method:"POST",data:data})).getjson(charset);};
$httprequest.save = function(url, localpath, opt)
{
	localpath = F.mappath(localpath);
	return (new $httprequest(url, opt || {})).save(localpath);
};
$httprequest.saveResources = function(resources, localpath, opt)
{
	if(typeof resources == "string")
	{
		return $httprequest.saveResources($httprequest.getResources(resources, opt), localpath, opt);
	}
	if(!resources)return 0;
	localpath = IO.directory.absolute(localpath);
	var get_file_name = function(url)
	{
		return url.substr(url.lastIndexOf("/")+1) || "";
	};
	localpath = F.mappath(localpath);
	var count = 0;
	for(var item in resources)
	{
		if(!resources.hasOwnProperty(item))continue;
		IO.directory.create(localpath + "\\" + item);
		for(var i=0; i<resources[item].length; i++)
		{
			var file_name = get_file_name(resources[item][i]);
			if(file_name=="")
			{
				file_name = F.random.word(10) + "." + item;
			}
			$httprequest.save(resources[item][i], localpath + "\\" + item + "\\" + file_name, opt);
			count++;
		}
	}
	delete get_file_name;
	return count;
	//(new $httprequest(url, opt || {})).save(localpath);
};

$httprequest.getResources = function(url, opt )
{
	var pushOnce = function(src,item){
		if(item.substr(0,1)=="/")
		{
			item = root + item;
		}
		else if(item.indexOf("://")<0)
		{
			item = base + item;
		}
		for(var i=0;i<src.length;i++)
		{
			if(src[i] == item) return;
		}
		src.push(item);
	};
	var match = /^(.+?)\:\/\/(.+?)(\/(.*?))?(\?(.*?))?$/i.exec(url);
	if(!match) return {};
	var domain = match[2],
		url = "/" + match[4],
		root = match[1] + "://" + match[2],
		base = root + url;
	if(base.substr(base.length-1)!="/")
	{
		base = base.substr(0,base.lastIndexOf("/")+1);
	}
	var html = (new $httprequest(match[0], opt || {})).gettext(),
		path = "",
		resources = {
			scripts : [],
			links : [],
			images : []
		};
	match = /<base([\s\S]+?)href\="(.+?)"/i.exec(html);
	if(match){
		var base2 = match[2];
		if(base2.substr(base2.length-1)!="/") base2 += "/";
		if(base2.substr(0,1)=="/")
		{
			base = root + "/";
		}
		else if(base2.indexOf("://")>0)
		{
			base = base2;
		}
		else
		{
			base = base + base2;
		}	
	}
	var reg = /<(script|link|img)([^><]+?)(src|href)=("|')(.+?)("|')/ig;
	while(match = reg.exec(html))
	{
		var type = match[1].toLowerCase();
		pushOnce(resources[type == "script" ? "scripts" : (type == "link" ? "links" : "images")],match[5]);
	}
	delete pushOnce;
	
	return resources;
};

$httprequest.fn = $httprequest.prototype;

$httprequest.fn.init = function() {
	var datasetstr = this.dataset.toString();
	this.response = null;
	if (!this.data) {
		this.data = datasetstr;
	} else {
		if (datasetstr != "") this.data += "&" + datasetstr;
	}
	if (this.data == "") this.data = null;
	if (this.method == "GET" && this.autoClearBuffer) {
		this.headers.push("If-Modified-Since:0");
		this.headers.push("Cache-Control:no-cache");
	}
	if (this.data!=null){
		this.headers.push("Content-Length:" + this.data.length);
		this.headers.push("Content-Type:application/x-www-form-urlencoded; charset=" + (this.charset || "UTF-8"));
	}
};

$httprequest.fn.header = function(headstr) {
	if (headstr.indexOf(":") >= 0) this.headers.push(headstr);
	return this;
};

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
			this.base.setRequestHeader(this.headers[i].substr(0, Sindex), this.headers[i].substr(Sindex + 1));
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
$httprequest.fn.save = function(filepath) {
	if (!this.sended) this.send();
	if(this.content==null)return this;
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

$httprequest.fn.getbinary = function() {
	if (!this.sended) this.send();
	return this.content;
};

$httprequest.fn.gettext = function(charset) {
	if (!this.sended) this.send();
	if (this.readyState == -1) return "";
	try {
		return bytesToString(this.content, charset || this.charset);
	} catch (ex) {
		this.msg = ex.description;
		return "";
	}
};

$httprequest.fn.getjson = function(charset) {
	if (!this.sended) this.send();
	if (this.readyState == -1) return null;
	try {
		return (new Function("return " + this.gettext(charset || this.charset) + ";"))();
	} catch (ex) {
		this.msg = ex.description;
		return null;
	}
};

$httprequest.fn.getheader = function(key) {
	if (!this.sended) this.send();
	if (key) {
		if (key.toUpperCase() == "SET-COOKIE") {
			key = key.replace("-", "\-");
			var headers = this.base.getAllResponseHeaders(),
				regexp = new RegExp("\n" + key + "\:(.+?)\r", "ig"),
				resstr = "", val, res;
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
module.exports = $httprequest;