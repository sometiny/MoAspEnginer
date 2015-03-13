/*
Ajax Class of Aien
Author : Aien
homepage : http://dev.mo.cn
email : i@ruboy.com
QQ : 1034555083 
Thanks for using this class. You can visit my homepage for help .
You can use this class and don't need to change any code .
Please keep this text block for me,thank you!
*/

(function(){
	var Ajax = window.Ajax = function(opt) {
		opt = Ajax.fn.Ajax_Extend(Ajax.Setting,opt ? opt : {});
		if(opt.form && (opt.form.nodeName.toLowerCase() == "form"))
		{
			///submit a form
			Ajax.fn.postf(opt);
		}else{
			///simple ajax
			Ajax.fn.Do(opt);
		}
	};
	
	///ajax base setting as default : You can change it manually and it will not be changed by other codes
	Ajax.Setting = {
		asc: true,
		url: "",
		dataType: "text",
		method: "GET",
		data: "",
		form:null,
		timeout: 10000,
		isTimeout: false,
		charset: "utf-8",
		username: "",
		userpwd: "",
		succeed: function(a, b, c){return true},
		error: function(a, b, c){return true},
		ontimeout: function(a){return true},
		beforesend: function(a){return true;}
	};
	
	///response fn
	Ajax.response = function(a, s){
		if(a.readyState == 4){
			if(a.status == 200){
				var t = s.dataType.toLowerCase();
				
				///parse Text
				if(t == "text"){
					s.succeed.apply(this,[a.responseText,a]);
				}
				
				if(t == "textp"){
					s.succeed.apply(this,[a.responseText,a]);
					var __regexp=/<script(.*?)>([\s\S]*?)<\/script>/igm;
					var __jotemp = __regexp.exec(a.responseText);
					while(__jotemp){
						eval(__jotemp[2]);
						__jotemp = __regexp.exec(a.responseText);
					}
				}
				
				///parse XML
				if(t == "xml"){
					try{
						try{
							var Dom = new ActiveXObject("MSXML2.DomDocument");
						}catch(ex){
							var Dom = document.implementation.createDocument("", "", null);	
						}
						Dom.loadXML(a.responseText);
						s.succeed.apply(this,[Dom,a]);	
					}catch(ex){
						s.succeed.apply(this,[null,a]);	
					}
				}
				
				///parse JSON
				if(t == "json"){
					var j = null;
					try{
						eval("j = (" + a.responseText + ");");
					}catch(ex){
						j = null;
					}
					s.succeed.apply(this,[j,a]);
				}
				///parse JSON
				if(t == "jsonp"){
					eval(s.jsonp + "(" + a.responseText + ");");
				}
				a = null;
			}else{
				s.error.apply(this,[a.status,a]);
				a = null;
			}
		}	
	};
	
	///main action
	Ajax.fn = Ajax.prototype = {
		Do:function(options){
			var settings = options;
			var isTimeout = false;
			var s = settings;
			s.method = s.method.toUpperCase();
			s.charset = s.charset.toLowerCase();
			try{
				var a = Ajax.fn.Ajax_GetObj();
				var u = s.url;
				var b = u.indexOf("?") == -1;
				var d = null, _d = "";
				u= u + (b ? "?" : "&") + "aienrnd=" + Ajax.fn.Ajax_Rnd();
				if(typeof s.data == "object"){
					_d = Ajax.SerializJson(s.data);
				}else{
					_d = s.data;	
				}
				if(s.method == "GET"){u = _d == "" ? u : (u + "&" + _d);}
				if(s.method == "POST"){d = _d}
				s.beforesend.apply(s, [a]);
				if(s.username && s.username != ""){
					a.open(s.method, u, s.asc, s.username, s.userpwd); 
				}else{
					a.open(s.method, u, s.asc); 
				}
				if(s.method == "POST"){
					a.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				}
				if(s.asc){
					a.onreadystatechange = function(){
						if(s.isTimeout && s.readyState <= 3){
							s.ontimeout.apply(s,[a]);
							a.abort();
							a = null;	
							return;
						}
						Ajax.response.apply(s, [a, s]);
					};
				}
				a.send(d);
				if(s.asc){
					window.setTimeout(function(){s.isTimeout = true;}, s.timeout);
					return;
				}
				///for async
				Ajax.response.apply(s, [a, s]);
			}catch(ex){
				///catch error
				s.error.apply(s,[ex.description,null,s]);
			}
		},
		///create xhr
		Ajax_GetObj:function (){
			var b = null;
			if (window.ActiveXObject) {  //for ie
				var httplist = ["MSXML2.XMLHttp.5.0","MSXML2.XMLHttp.4.0","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp","Microsoft.XMLHttp"];
				for(var i = httplist.length -1;i >= 0;i--){
					try{
						b = new ActiveXObject(httplist[i]);
						return b;
					}catch(ex){}
				}
			}else if (window.XMLHttpRequest) {  //for other
				b = new XMLHttpRequest(); 
			}
			return b;
		},
		///get rnd string
		Ajax_Rnd : function (){return Math.random().toString().substr(2);},
		///extend something
		Ajax_Extend : function (a, b){var c = {};for(var m in a){c[m] = a[m];}for(var m in b){c[m] = b[m];}return c;}
	};
	
	
	///simple get
	Ajax.get = Ajax.fn.get = function(url,data,fn){
		var setting = {};
		setting.url = url;
		setting.data = data;
		setting.succeed = fn;
		Ajax(setting);
	};
	
	///simple post
	Ajax.post = Ajax.fn.post = function(url,data,fn){
		var setting = {};
		setting.url = url;
		setting.data = data;
		setting.succeed = fn;
		setting.method = "post";
		Ajax(setting);
	};
	
	///Serializ Json Data
	Ajax.SerializJson = Ajax.fn.SerializJson = function(json){
		if(typeof json != "object"){return "";}
		var _temp="";
		for(var i in json){
			_temp += ("" + i + "").utf8() + "=" + ("" + json[i] + "").utf8() + "&"	
		}
		if(_temp!=""){_temp = _temp.substr(0,_temp.length-1);}
		return _temp;
	};
	
	///Serializ a form
	Ajax.Serializ = Ajax.fn.Serializ = function(nodes,charset){
		charset = charset.toLowerCase();
		var data = "";
		for(var i = 0;i < nodes.length;i++){
			if(!nodes[i].name || (nodes[i].name.trim() == "")){continue;}
			var node_name = nodes[i].name.trim();
			var node_value = nodes[i].value;
			var isBox = (nodes[i].type.toLowerCase() == "checkbox") || (nodes[i].type.toLowerCase() == "radio");
			if(isBox){
				if(nodes[i].checked == true){
					if(charset == "utf-8"){
						data += node_name.utf8() + "=" + (node_value == "" ? "on": node_value.utf8()) + "&";
					}else{
						data += node_name.gb() + "=" + (node_value == "" ? "on": node_value.gb()) + "&";
					}
				}
			}else{
				if(charset == "utf-8"){
					data += node_name.utf8() + "=" + node_value.utf8() + "&";
				}else{
					data += node_name.gb() + "=" + node_value.gb() + "&";	
				}
			}			
		}
		return data;
	};
	
	Ajax.SerializTojson = Ajax.fn.SerializTojson = function(nodes){
		var data = {};
		for(var i = 0;i < nodes.length;i++){
			if(!nodes[i].name || (nodes[i].name.trim() == "")){continue;}
			var node_name = nodes[i].name.trim();
			var node_value = nodes[i].value;
			var isBox = (nodes[i].type.toLowerCase() == "checkbox") || (nodes[i].type.toLowerCase() == "radio");
			if(isBox){
				if(nodes[i].checked == true){
					node_value = (node_value == "" ? "on": node_value);
					if(data[node_name]===undefined){
						data[node_name]=node_value;
					}else{
						data[node_name]+=","+node_value;
					}
				}
			}else{
				if(data[node_name]===undefined){
					data[node_name]=node_value;
				}else{
					data[node_name]+=","+node_value;
				}
			}			
		}
		return data;
	};
	///submit a form with ajax
	Ajax.postf = Ajax.fn.postf = function(setting){
		setting = Ajax.fn.Ajax_Extend(Ajax.Setting, setting);
		frm = setting.form;
		///if the form has event[onsubmit],run it.
//		if(frm.onsubmit && (typeof frm.onsubmit == "function")){
//				frm["event.submit"] = frm.onsubmit;
//				var result = frm.onsubmit.apply(frm,[]);
//				if(result == false){return false;}			
//		}
		if(frm.nodeName.toLowerCase() != "form" || frm.action == ""){return false;}
		setting.method = "POST";
		if(frm.method.toLowerCase() != "post"){setting.method = "GET";}
		setting.url = frm.action;
		var data = "";
		data = Ajax.Serializ(frm,setting.charset);
		if(data != ""){
			data = data.substr(0,data.length - 1);
		}
		setting.data = data;
		Ajax.fn.Do(setting);
		return false;
	};
	
	///redefine some fn for String
	String.prototype.gb = function(){
		return escape(this.toString());
	};
	String.prototype.utf8 = function(){
		return encodeURIComponent(this.toString()).replace(/\%([0-9a-zA-Z]{2})/ig,function(s){return s.toLowerCase()});
	};
	String.prototype.unUtf8 = function(){
		return decodeURIComponent(this.toString());
	};
	String.prototype.trim = function(){
		return this.replace(/^(\s+)|(\s+)$/igm,"");
	};
	window.cookie1={
    	SET	: function(name, value, days) {var expires = "";if (days) {var d = new Date();d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);expires = "; expires=" + d.toGMTString();}document.cookie = name + "=" + value + expires + "; path=/";},
		GET	: function(name) {var re = new RegExp("(\;|^)[^;]*(" + name + ")\=([^;]*)(;|$)");var res = re.exec(document.cookie);return res != null ? res[3] : null;}
	};
	window.cookie = function(name, value, options) {
		if (typeof value != 'undefined') { // name and value given, set cookie
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			var issecond = false;
			if(options.issecond===true)issecond=true;
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (issecond? (options.expires*1000) : (options.expires * 24 * 60 * 60 * 1000)));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			var path = options.path ? '; path=' + options.path : '';
			var domain = options.domain ? '; domain=' + options.domain : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = name+"=; expires=Fri, 24 Nov 2000 00:57:25 UTC";
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};
})();