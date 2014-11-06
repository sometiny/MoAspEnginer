(function(F) {
	var Ajax = F.ajax = window.Ajax = function(opt) {
			opt = Ajax.Extend(Ajax.Setting, opt ? opt : {});
			if (opt.form && (opt.form.nodeName.toLowerCase() == "form")) {
				Ajax.postf(opt)
			} else {
				Ajax.Do(opt)
			}
		};
	Ajax.Setting = {
		asc: true,
		url: "",
		dataType: "text",
		method: "GET",
		data: "",
		form: null,
		timeout: 10000,
		isTimeout: false,
		charset: "utf-8",
		username: "",
		userpwd: "",
		headers:{},
		nocache:true,
		succeed: function(a, b, c) {
			return true
		},
		error: function(a, b, c) {
			return true
		},
		ontimeout: function(a) {
			return true
		},
		beforesend: function(a) {
			return true
		}
	};
	Ajax.response = function(a, s) {
		if (a.readyState == 4) {
			if (a.status == 200) {
				var t = s.dataType.toLowerCase();
				if (t == "text") {
					s.succeed.apply(this, [a.responseText, a])
				}
				if (t == "textp") {
					s.succeed.apply(this, [a.responseText, a]);
					var __regexp = /<script(.*?)>([\s\S]*?)<\/script>/igm;
					var __jotemp = __regexp.exec(a.responseText);
					while (__jotemp) {
						eval(__jotemp[2]);
						__jotemp = __regexp.exec(a.responseText)
					}
				}
				if (t == "xml") {
					try {
						try {
							var Dom = new ActiveXObject("MSXML2.DomDocument")
						} catch (ex) {
							var Dom = document.implementation.createDocument("", "", null)
						}
						Dom.loadXML(a.responseText);
						s.succeed.apply(this, [Dom, a])
					} catch (ex) {
						s.succeed.apply(this, [null, a])
					}
				}
				if (t == "json") {
					var j = null;
					try {
						j = (new Function("return " + a.responseText + ";"))();
					} catch (ex) {}
					s.succeed.apply(this, [j, a])
				}
				if (t == "jsonp") {
					(new Function(s.jsonp + "(" + a.responseText + ");"))();
				}
				a = null
			} else {
				s.error.apply(this, [a.status, a]);
				a = null
			}
		}
	};
	Ajax.Do = function(options) {
		var settings = options;
		var isTimeout = false;
		var s = settings;
		s.method = s.method.toUpperCase();
		s.charset = s.charset.toLowerCase();
		try {
			var a = Ajax.GetObj();
			var u = s.url;
			var b = u.indexOf("?") == -1;
			var d = null,_d = "";
			if (typeof s.data == "object") {
				_d = Ajax.SerializJson(s.data,s.charset)
			} else {
				_d = s.data
			}
			if (s.method == "GET" && _d!="") {
				u = u+(b ? "?" : "&") + _d
			}
			if (s.method == "POST" && _d!="") {
				d = _d
			}
			s.beforesend.apply(s, [a]);
			if (s.username && s.username != "") {
				a.open(s.method, u, s.asc, s.username, s.userpwd)
			} else {
				a.open(s.method, u, s.asc)
			}
			if (s.method == "POST") {
				if(!s.headers.hasOwnProperty("Content-Type"))s.headers["Content-Type"]="application/x-www-form-urlencoded";
			}
			if (s.method == "GET" && s.nocache) {
				s.headers["If-Modified-Since"] = 0;
				s.headers["Cache-Control"] = "no-cache";
			}
			for(var h in s.headers){
				if(!s.headers.hasOwnProperty(h))continue;
				a.setRequestHeader(h, s.headers[h]);
			}
			if (s.asc) {
				a.onreadystatechange = function() {
					if (s.isTimeout && s.readyState <= 3) {
						s.ontimeout.apply(s, [a]);
						a.abort();
						a = null;
						return
					}
					Ajax.response.apply(s, [a, s])
				}
			}
			a.send(d);
			if (s.asc) {
				window.setTimeout(function() {
					s.isTimeout = true
				}, s.timeout);
				return
			}
			Ajax.response.apply(s, [a, s])
		} catch (ex) {
			s.error.apply(s, [ex.description, null, s])
		}
	};
	Ajax.GetObj = function() {
		var b = null;
		if (window.XMLHttpRequest) {
			b = new XMLHttpRequest();
			Ajax.GetObj = function() {
				return new XMLHttpRequest()
			}
		} else {
			if (window.ActiveXObject) {
				var httplist = ["MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp", "MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0"];
				for (var i = httplist.length - 1; i >= 0; i--) {
					try {
						Ajax.GetObj = (function(obj) {
							return function() {
								return new ActiveXObject(obj)
							}
						})(httplist[i]);
						b = Ajax.GetObj()
					} catch (ex) {}
				}
			}
		}
		return b
	};
	Ajax.Rnd = function() {
		return Math.random().toString().substr(2)
	};
	Ajax.Extend = function(a, b) {
		var c = {};
		for (var m in a) {
			c[m] = a[m]
		}
		for (var m in b) {
			c[m] = b[m]
		}
		return c
	};
	Ajax.get = function(url, data, fn) {
		var setting = {};
		setting.url = url;
		setting.data = data;
		setting.succeed = fn;
		Ajax(setting)
	};
	Ajax.post = function(url, data, fn) {
		var setting = {};
		setting.url = url;
		setting.data = data;
		setting.succeed = fn;
		setting.method = "post";
		Ajax(setting)
	};
	Ajax.SerializJson = function(json,charset) {
		if (typeof json != "object") {
			return ""
		}
		Ajax.encode.fn = Ajax.encode.gb;
		if (charset == "utf-8") Ajax.encode.fn = Ajax.encode.utf8;
		var _temp = "";
		for (var i in json) {
			_temp += Ajax.encode.fn("" + i + "") + "=" + Ajax.encode.fn("" + json[i] + "") + "&"
		}
		if (_temp != "") {
			_temp = _temp.substr(0, _temp.length - 1)
		}
		return _temp
	};
	Ajax.Serializ = function(nodes, charset) {
		charset = charset.toLowerCase();
		Ajax.encode.fn = Ajax.encode.gb;
		if (charset == "utf-8") Ajax.encode.fn = Ajax.encode.utf8;
		var data = "";
		for (var i = 0; i < nodes.length; i++) {
			if (!nodes[i].name || (Ajax.encode.trim(nodes[i].name) == "")) {
				continue
			}
			var node_name = Ajax.encode.trim(nodes[i].name);
			var node_value = nodes[i].value;
			var isBox = (nodes[i].type.toLowerCase() == "checkbox") || (nodes[i].type.toLowerCase() == "radio");
			if (isBox) {
				if (nodes[i].checked == true) {
					data += Ajax.encode.fn(node_name) + "=" + (node_value == "" ? "on" : Ajax.encode.fn(node_value)) + "&"
				}
			} else if (nodes[i].nodeName.toLowerCase() == "select") {
				var l="";
				for(var j=0;j<nodes[i].length;j++){
					if(nodes[i].options[j].selected){
						l+=nodes[i].options[j].value+",";
					}
				}
				if(l!="")l=l.substr(0,l.length-1);
				data += Ajax.encode.fn(node_name) + "=" + Ajax.encode.fn(l) + "&"
			} else {
				data += Ajax.encode.fn(node_name) + "=" + Ajax.encode.fn(node_value) + "&"
			}
		}
		return data
	};
	Ajax.postf = function(setting) {
		setting = Ajax.Extend(Ajax.Setting, setting);
		frm = setting.form;
		if (frm.nodeName.toLowerCase() != "form" || frm.action == "") {
			return false
		}
		setting.method = "POST";
		if (frm.method.toLowerCase() != "post") {
			setting.method = "GET"
		}
		setting.url = frm.action;
		var data = "";
		data = Ajax.Serializ(frm, setting.charset);
		if (data != "") {
			data = data.substr(0, data.length - 1)
		}
		setting.data = data;
		Ajax.Do(setting);
		return false
	};
	Ajax.encode = {
		gb: function(str) {
			return escape(str || "")
		},
		utf8: function(str) {
			return encodeURIComponent(str || "").replace(/\+/igm, "%2B").replace(/\%([0-9a-zA-Z]{2})/igm, function(s) {
				return s.toLowerCase()
			})
		},
		unUtf8: function(str) {
			return decodeURIComponent(str || "")
		},
		trim: function(str) {
			return (str || "").replace(/^(\s+)|(\s+)$/igm, "")
		},
		fn:null
	}
})(F || {});