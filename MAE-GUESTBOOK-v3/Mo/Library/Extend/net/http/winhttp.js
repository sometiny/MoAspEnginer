/*
** File: net/http/winhttp.js
** Usage: a library for http request
** About: 
**		support@mae.im
*/
//HTTPREQUEST_SETCREDENTIALS_FOR_SERVER = 0;
//HTTPREQUEST_SETCREDENTIALS_FOR_PROXY = 1;
var cfg={
	method : "GET",
	data : null,
	timeouts : [10000, 10000, 10000, 30000],
	charset : "utf-8",
	headers : [],
	options:{},
	nocache:false,
	username : null,
	password : null,
	proxy :{
		username:null,
		password:null
	},
	certificate : null
};
var isNullOrEmpty = function(src){
	if(src==null)return true;
	if(typeof src!="string") return false;
	if(src.length<=0)return true;
	return false;
};
var getXmlHttpRequestObject = function() {
	var b = null;
	var httplist = ["WinHttp.WinHttpRequest.5.1","WinHttp.WinHttpRequest"];
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
		}
	}
	return b;
};
function $httprequest(url, options) {
	if(this.constructor!==$httprequest) return new $httprequest(url, options);
	this.$g={};
	this.url = url;
	this.base=null;
	this.status=0;
	this.statusText=0;
	this.readyState=-1;
	this.exception = "";
	this.warning = "";
	this.sended=false;
	this.content=null;
	this.headers=null;
	F.extend(this.$g, cfg, options||{});
}
SecureProtocols = {ALL : 168, SSL2 : 8, SSL3 : 32, TLS1 : 128};
HTTPOPTIONS = $httprequest.OPTIONS = {
	UserAgentString : 0, URL : 1, URLCodePage : 2, EscapePercentInURL : 3, SslErrorIgnoreFlags : 4, SelectCertificate : 5, EnableRedirects : 6, UrlEscapeDisable : 7, UrlEscapeDisableQuery : 8,
	SecureProtocols : 9, EnableTracing : 10, RevertImpersonationOverSsl : 11, EnableHttpsToHttpRedirects : 12, EnablePassportAuthentication : 13, MaxAutomaticRedirects : 14, MaxResponseHeaderSize : 15,
	MaxResponseDrainSize : 16, EnableHttp1_1 : 17, EnableCertificateRevocationCheck : 18, RejectUserpwd : 19
};
$httprequest.create = function(url, options)
{
	return new $httprequest(url, options);
};
$httprequest.get = function(url, charset)
{
	return new $httprequest(url, {charset:charset}).text();
};
$httprequest.getJSON = function(url, charset)
{
	return new $httprequest(url, {charset:charset}).json();
};
$httprequest.post = function(url, data, charset)
{
	return new $httprequest(url, {method:"POST",charset:charset,data:data}).text();
};
$httprequest.postJSON = function(url,data, charset)
{
	return new $httprequest(url, {method:"POST",charset:charset,data:data}).json();
};

$httprequest.save = function(url, localpath, opt)
{
	localpath = F.mappath(localpath);
	return (new $httprequest(url, opt || {})).save(localpath);
};

$httprequest.fn = $httprequest.prototype;

$httprequest.fn.init = function() {
	if (this.$g.method == "GET" && this.$g.nocache) {
		this.$g.headers.push("If-Modified-Since:0");
		this.$g.headers.push("Cache-Control:no-cache");
	}
	if (!this.$g.charset) this.$g.charset = "utf-8";
};

$httprequest.fn.setOptions = function(option, value) {
	if($httprequest.OPTIONS[option]===undefined){
		this.warning+="do not support [" + option + "] option.";
		return;
	}
	this.$g.options[option] = value;
	return this;
};

$httprequest.fn.setHeader = function(headstr) {
	if (headstr.indexOf(":") >= 0) this.$g.headers.push(headstr);
	return this;
};

$httprequest.fn.setTimeouts = function() {
	if (arguments.length > 4) {
		return this;
	}
	for (var i = 0; i < arguments.length; i++) {
		if (!isNaN(arguments[i])) {
			this.$g.timeouts[i] = parseInt(arguments[i]);
		}
	}
	return this;
};

$httprequest.fn.send = function(fn) {
	this.init();
	if (typeof fn == "function") fn.call(this);
	this.base = this.base || getXmlHttpRequestObject();
	if (this.base == null) {
		this.exception += "can not create winhttp object.";
		return this;
	}
	try {
		for(var i in this.$g.options){
			if(!this.$g.options.hasOwnProperty(i))continue;
			if($httprequest.OPTIONS[i]===undefined){
				this.warning+="do not support [" + option + "] option. ";
				continue;
			}
			this.base.Option($httprequest.OPTIONS[i])=this.$g.options[i];
		}
		this.base.SetTimeouts(this.$g.timeouts[0], this.$g.timeouts[1], this.$g.timeouts[2], this.$g.timeouts[3]);
	} catch (ex) {this.warning="there has some errors when set options(" + ex.description + ").";}

	try {
		if(!isNullOrEmpty(this.$g.data)){
			if(typeof this.$g.data == "object"){
				var d_ = "",fn = (this.$g.charset.toLowerCase()=="utf-8"?encodeURIComponent:escape);
				for(var i in this.$g.data){
					if(!this.$g.data.hasOwnProperty(i))continue;
					d_+= fn(i).replace(/\+/ig,"%2B") + "=" + fn(this.$g.data[i]).replace(/\+/ig,"%2B")+"&";
				}
				if(d_!="")d_=d_.substr(0,d_.length-1);
				this.$g.data = d_;
			}
			this.$g.headers.push("Content-Length:" + this.$g.data.length);
			this.$g.headers.push("Content-Type:application/x-www-form-urlencoded; charset=" + (this.charset || "utf-8"));
		}
		if(!(isNullOrEmpty(this.$g.username) || isNullOrEmpty(this.$g.password))){
			this.base.SetCredentials(this.$g.username,this.$g.password, 0);
		}
		if(!(isNullOrEmpty(this.$g.proxy.username) || isNullOrEmpty(this.$g.proxy.password))){
			this.base.SetCredentials(this.$g.proxy.username,this.$g.proxy.password, 1);
		}
		if(!isNullOrEmpty(this.$g.proxy.server)){
			this.base.SetProxy(2,this.$g.proxy.server, this.$g.proxy.passlist||"");
		}
		this.readyState = 0;
		this.base.Open(this.$g.method, this.url, false);
		this.readyState = 1;
	}catch(ex){
		this.exception += "open connection failed(" + ex.description + ").";
		return this;
	}
	if(!isNullOrEmpty(this.$g.certificate)){
		this.base.SetClientCertificate(this.$g.certificate);
	}
	if (this.$g.headers.length > 0) {
		for (var i = 0; i < this.$g.headers.length; i++) {
			var key = this.$g.headers[i].substr(0, this.$g.headers[i].indexOf(":"));
			var value = this.$g.headers[i].substr(this.$g.headers[i].indexOf(":") + 1);
			this.base.SetRequestHeader(key, value);
		}
	}
	try {
		this.base.Send(this.$g.data);
		this.sended = true;
		this.readyState = 4;
		this.status = parseInt(this.base.Status);
		this.statusText = this.base.StatusText;
		this.content = this.base.ResponseBody;
	} catch (ex) {
		this.sended = true;
		this.exception += ex.description;
	}
	return this;
}
$httprequest.fn.options = function(name, value) {
	if(value===undefined) return this.$g[name];
	this.$g[name] = value;
};
$httprequest.fn.next = function(url, options) {
	var http = new $httprequest(url || this.url, options);
	if(options===true) http.$g = this.$g;
	http.base = this.base;
	this.dispose();
	return http;
};
$httprequest.fn.next_send = function(data) {
	try {
		this.base.Send(data);
		this.sended = true;
		this.readyState = 4;
		this.status = parseInt(this.base.Status);
		this.statusText = this.base.StatusText;
		this.content = this.base.ResponseBody;
	} catch (ex) {
		this.sended = true;
		this.exception += ex.description;
	}
};
$httprequest.fn.dispose = function() {
	this.base = null;
	this.$g = null;
};
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

$httprequest.fn.binary = function() {
	if (!this.sended) this.send();
	return this.content;
};

$httprequest.fn.text = function(charset) {
	if (!this.sended) this.send();
	if (this.readyState != 4) return "";
	try {
		return bytesToString(this.content, charset || this.$g.charset);
	} catch (ex) {
		this.exception += ex.description;
		return "";
	}
};

$httprequest.fn.json = function(charset) {
	if (!this.sended) this.send();
	if (this.readyState != 4) return null;
	try {
		return (new Function("return " + this.text(charset || this.$g.charset) + ";"))();
	} catch (ex) {
		this.exception += ex.description;
		return null;
	}
};

$httprequest.fn.getHeader = function(key) {
	if (!this.sended) this.send();
	if (this.readyState != 4) return null;
	if (key) {
		var headers = this.base.getAllResponseHeaders().split("\r\n"),
			result = [];
		for(var i=0;i<headers.length;i++){
			var header = headers[i] ,position = header.indexOf(":");
			if(position>0){
				var t = header.substr(0,position);
				if(t.toLowerCase()==key.toLowerCase()) result.push(header.substr(position+1).replace(/^(\s+)/i,""));
			}
		}
		return result;
	} else {
		return this.base.getAllResponseHeaders();
	}
};

$httprequest.fn.xml = function(charset) {
	if (!this.sended) this.send();
	if (this.readyState != 4) return null;
	try {
		var _dom = new ActiveXObject("MSXML2.DOMDocument");
		_dom.loadXML(this.text(charset||this.$g.charset));
		return _dom;
	} catch (ex) {
		this.exception += ex.description;
		return null;
	}
};
for(var i in $httprequest.OPTIONS){
	if(!$httprequest.OPTIONS.hasOwnProperty(i))continue;
	$httprequest.fn[i] = (function(opt){
		return function(value){
			if(value===undefined) return this.base.Option($httprequest.OPTIONS[opt]);
			this.$g.options[opt]=value;
			return this;
		};
	})(i);
}
var bytesToString = function(src, charset) {
	var stream = new ActiveXObject("ADODB.Stream"), byts;
	stream.Type = 1;
	stream.Mode = 3;
	stream.Open();
	stream.Write(src);
	stream.Position = 0;
	stream.Type = 2;
	stream.CharSet = charset;
	byts = stream.ReadText();
	stream.Close();
	stream = null;
	return byts;
};
module.exports = $httprequest;