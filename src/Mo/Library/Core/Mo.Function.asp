<script language="jscript" runat="server">
var GLOBAL = this;
var F = {
	fso : null,post__ : null,get__ : {},server__ : {},activex__ : [],postinited : false,rewrite : false,exports : {},
	MO_SESSION_WITH_SINGLE_TAG : false,MO_APP_NAME : "",MO_APP : "",MO_CORE : "",
	TEXT : {BR : 1,NL : 2,BIN : 4,NLBR : 1|2},
	has : function(obj,key){return obj.hasOwnProperty(key);},
	vbs : {},
	extend : function(name,obj){F.exports[name] = obj;},
	exists : function(path,folder){
		if(folder === true){
			return F.fso.folderexists(F.mappath(path));
		}else{
			return F.fso.fileexists(F.mappath(path));
		}
	},
	dispose : function(obj){
		if(obj != undefined){obj = null;return;}
		while(F.activex__.length > 0){
			F.dispose(F.activex__.pop());
		}
	},
	random : function(minValue,maxValue)
	{
		if(minValue === undefined && maxValue === undefined) return Math.random();
		if(maxValue === undefined){
			maxValue = minValue;
			minValue = 1;
		}
	    return parseInt(Math.random()*(maxValue - minValue + 1)) + minValue;
	},
	guid : function(format){
		format = format || "D";//NDBP
		var typelib = F.activex("scriptlet.typelib")
    	var returnValue = typelib.Guid;
    	switch(format.toUpperCase()){
	    	case "B" : 
	    		return returnValue;
	    	case "P" : 
	    		return returnValue.replace("{","(").replace("}",")");
	    	case "N" : 
	    		return returnValue.replace(/([^0-9a-z]+)/igm,"");
	    	default : 
	    		return returnValue.replace("{","").replace("}","");
    	}
    	return returnValue;
	},
	iid : function(cond,value){
		return (cond === undefined ? value : cond);
	},
	mappath : function(path){
		if(path.length < 2)return Server.MapPath(path)
		if(path.substr(1,1) == ":") return path;
		return Server.MapPath(path);
	},
	activex : function(classid){
		try{
			F.activex__.push(Server.CreateObject(classid));
			return F.activex__[F.activex__.length - 1];
		}catch(ex){return null;}
	},
	activex_ : function(classid){
		try{
			var obj = Server.CreateObject(classid);
			obj = null;
			return true;
		}catch(ex){return false;}
	},
	stream : function(mode,type){
		var stream = F.activex("Adodb.Stream");
		if(mode !== undefined)stream.Mode = mode;
		if(type !== undefined)stream.Type = type;
		return stream;
	},
	init : function(){
		if((typeof fso_global) != "object")this.fso = F.activex("Scripting.FileSystemObject");
		else this.fso = fso_global;
		F.each(Request.QueryString,function(q){
			F.get__[q] = String(this(q));
		});
		F.each(Request.ServerVariables,function(q){
			var v = String(this(q));
			if(q == "URL" && v.indexOf("?") > 0) v = v.substr(0,v.indexOf("?"));
			F.server__[q] = v;
		});
		return this;
	},
	json : function(src,globalvar){
		var cglobal = false;
		try{
			if(typeof globalvar == "string" && /^([0-9a-z]+)$/igm.test(globalvar)){
				cglobal = true;
				(new Function(globalvar + " = " + src + ";"))();
			}else{
				return (new Function("return " + src + ";"))();
			}
		}catch(ex){
			if(!cglobal)return null;
			(new Function(globalvar + " = null;"))();
		}
	},
	post : function(key,value){
		F.post.init();
		if(key === undefined)return"";
		if(value === null){F.post.remove(key);return;}
		if(value === undefined) return F.iid(F.post__[key],"");
		F.post__[key] = value;
		return;
	},
	session : function(key,value){
		if(key == undefined)return"";
		if(F.MO_SESSION_WITH_SINGLE_TAG)key = F.MO_APP_NAME + "_" + key;
		if(value === null){Session.Contents.Remove(key);return}
		if(value === undefined){
			if(Session.Contents(key) != undefined)return Session.Contents(key);
			return "";
		}
		Session(key) = value;
	},
	get : function(key,value){
		if(key == undefined)return"";
		if(value === null){F.get.remove(key);return;}
		if(value === undefined) return F.iid(F.get__[key],"");
		F.get__[key] = value;
		return;
	},
	all : function(key){
		if(key == undefined)return"";
		if(F.get__.hasOwnProperty(key)) return F.get(key);
		if(F.post__.hasOwnProperty(key)) return F.post(key);
		return "";
	},
	server : function(key,value){
		if(key == undefined)return"";
		if(value === null){delete F.server__[key];return;}
		if(value === undefined) return F.iid(F.server__[key],"");
		F.server__[key] = value;
		return;
	},
	cookie : function(key,value,expired,domain,path,Secure){
		if(key == undefined)return"";
		var mkey = key,skey = "";
		if(key.indexOf(".") > 0){
			mkey = key.split(".")[0];	
			skey = key.split(".")[1];	
		}
		if(value === null){Response.Cookies(mkey).Expires = "1980-1-1";return;}
		if(value === undefined){
			if(skey == "")return Request.Cookies(mkey).item;
			return Request.Cookies(mkey)(skey);
		}
		if(skey == ""){
			Response.Cookies(mkey)=	value;
		}else{
			Response.Cookies(mkey)(skey) = value;
		}
		if(expired !== undefined && !isNaN(expired)){
			var dt = new Date();
			dt.setTime(dt.getTime() + parseInt(expired)*1000);
			Response.Cookies(mkey).Expires = F.format("{0}-{1}-{2} {3}:{4}:{5}",dt.getYear(),dt.getMonth() + 1,dt.getDate(),dt.getHours(),dt.getMinutes(),dt.getSeconds());
		}
		if(domain !== undefined){
			Response.Cookies(mkey).Domain = domain;
		}
		if(path !== undefined){
			Response.Cookies(mkey).Path = path;
		}
		if(Secure !== undefined){
			Response.Cookies(mkey).Secure = Secure;
		}
	},
	echo : function(debug, brnl, newline){
		if((brnl & F.TEXT.BIN)){
			Response.BinaryWrite(debug);
		}else{
			Response.Write(debug);
		}
		if(brnl === true){
			Response.Write("<br />");
			if(newline !== false) Response.Write("\r\n");
			return;
		}
		if(isNaN(brnl))return;
		if(brnl & F.TEXT.BR)Response.Write("<br />");
		if(brnl & F.TEXT.NL)Response.Write("\r\n");
	},
	exit : function(debug, brnl, newline){
		F.echo(debug, brnl, newline);
		Response.End();
	},
	format : function(Str){
        var arg = arguments;
        if(arg.length <= 1){return Str;}
        return Str.replace(/\{(\d+)(\.([\w\.\-]+))?(:(.+?))?\}/igm,function(ma){
			var match = /\{(\d+)(\.([\w\.\-]+))?(:(.+?))?\}/igm.exec(ma);
			if(match && match.length == 6){
				var argvalue = arg[parseInt(match[1]) + 1];
				if(argvalue === undefined) return "";
				if(typeof argvalue == "object" && match[3] != ""){
					argvalue = (new Function("return this" + 
		            "[\"" + match[3].replace(/\./igm,"\"][\"")
		            .replace(/\[\"(\d+)\"\]/igm,"[$1]") +"\"]")).call(argvalue);
				}
				var argformat = match[5];
				var argtype = (typeof argvalue);
				if(argformat != ""){
					if(argtype == "date" || (argtype == "object" && argvalue.constructor==Date)){
						return F.formatdate(argvalue,argformat);
					}else if(argtype == "number"){
						if(/^(\d+)$/ig.test(argformat))return argvalue.toString(argformat);
						var mat2 = /^((\d+)\.)?(D|E|F|X)(\d*)$/igm.exec(argformat);
						if(mat2){
							if(mat2[3] == "D"){
								var c = (Math.pow(10,parseInt(mat2[4]) + 1) + argvalue).toString();	
								argvalue = c.substr(c.length - parseInt(mat2[4]));
							}else if(mat2[3] == "E"){
								if(mat2[4] != "") argvalue = argvalue.toExponential(parseInt(mat2[4]));
								else argvalue = argvalue.toExponential();
							}else if(mat2[3] == "F"){
								if(mat2[4] != "")argvalue = argvalue.toFixed(parseInt(mat2[4]));
								else argvalue = argvalue.toFixed(0);
							}else if(mat2[3] == "X"){
								if(mat2[4] != ""){
									var c = argvalue.toString(16).toUpperCase();
									if(c.length >= parseInt(mat2[4]))return c;
									c = Math.pow(10,parseInt(mat2[4]) + 1).toString() + "" + c;
									argvalue = c.substr(c.length - parseInt(mat2[4]));
								}else{
									argvalue = argvalue.toString(16).toUpperCase();
								}
							}
							if(mat2[2] != ""){
								var l = parseInt(mat2[2]);
								while(argvalue.length < l){
									argvalue = "0" + argvalue;
								}
							}
						}
					}else if(argtype == "string"){
						if(!isNaN(argformat)){
							var l = parseInt(argformat);
							while(argvalue.length < l){
								argvalue = "0" + argvalue;
							}
						}
					}
				}
				return argvalue;
			}
			return ma;
        });
	},
	redirect : function(url,msg){
		if(msg == undefined)msg = "";
		msg = msg + "";
		if(msg != ""){
			msg = F.encode(msg);
			F.echo("<s"+"cript type=\"text/javascript\">alert(decodeURIComponent(\"" + msg + "\"));window.location=decodeURIComponent(\"" + F.encode(url) + "\");</s"+"cript>");
		}else{
			Response.Redirect(url);
		}
		Response.End();	
	},
	"goto" : function(url,msg){
		if(msg == undefined)msg = "";
		msg = msg + "";
		if(msg != ""){
			msg = F.encode(msg);
			F.echo("<s" + "cript type=\"text/javascript\">alert(decodeURIComponent(\"" + msg + "\"));window.location=decodeURIComponent(\"" + F.encode(url) + "\");</s" + "cript>");
		}else{
			F.echo("<s" + "cript type=\"text/javascript\">window.location=decodeURIComponent(\"" + F.encode(url) + "\");</s" + "cript>");
		}
	},
	require : function(library,required,path){
		if(typeof required == "string"){
			path = required;
			required = [];
		}else if(required && required.constructor != Array){
			ExceptionManager.put(new Exception(0,"F.require","error arguments."));
			return null;
		}
		if(required && required.length > 0){
			F.foreach(required,function(i,v){
				F.require(v,path);
			});
		}
		if(library.length > 2 && library.substr(1,1) == ":" && F.fso.fileexists(library)){
			path = library.substr(0,library.lastIndexOf("\\") + 1);
			library = library.substr(library.lastIndexOf("\\") + 1);
		}
		if(!/^([\w\/\.\-]+)$/.test(library)){
			ExceptionManager.put(new Exception(0,"F.require","library '" + library + "' format error."));
			return null;
		}
		F.exports = F.exports || {};
		var src = "",iscached = false;
		if(F.cache.enabled && F.cache.exists(library))iscached = true;
		if(!iscached){
			var paths = [path || "",F.MO_APP + "Library/Extend/",F.MO_CORE + "Library/Extend/"];
			var path_ ="";
			for(var i = 0;i < paths.length;i++){
				if(paths[i] == "")continue;
				path_ = F.mappath(paths[i] + library);
				if(F.fso.fileexists(path_)) break;
				path_ = F.mappath(paths[i] + library +".js");
				if(F.fso.fileexists(path_)) break;
				if(F.fso.folderexists(F.mappath(paths[i] + library))){
					path_ = F.mappath(paths[i] + library +"/index.js");
					if(F.fso.fileexists(path_)) break;
				}
			}
			if(!F.fso.fileexists(path_)){
				ExceptionManager.put(new Exception(0,"F.require","required library '" + library + "' is not exists."));
				return F.exports;
			}
			src = F.string.fromfile(path_);
			src = src.replace(/^(\s*)<sc(.+)>/im,"").replace(/<\/script>(\s*)/im,"");
			if(F.cache.enabled)F.cache.write(library,src);
		}else{
			src = F.cache.read(library);
		}
		try{
			var this_ = this;
			if(this == F)this_ = null;
			return (new Function("exports",src))(this_ || F.exports) || F.exports;
		}catch(ex){
			ExceptionManager.put(ex,"F.require");
			return F.exports;
		}
	},
	include : function(path,charset){
		try{
			path = F.mappath(path);
			if(!F.fso.fileexists(path)){
				ExceptionManager.put(new Exception(0,"F.include","file not exists:" + path));
				return false;
			}
			var iscached = false;
			var src;
			if(F.cache.enabled && F.cache.exists(path)){
				src = F.cache.read(path);
				if(src != null)iscached = true;
			}
			if(!iscached){
				src = F.string.fromfile(path,charset || "utf-8");
				src = src.replace(/^(\s*)<sc(.+)>/im,"").replace(/<\/script>(\s*)/im,"");
				if(src == ""){
					ExceptionManager.put(new Exception(0,"F.include","read file failed:" + path));
					return false;
				}
			}
			if(F.execute(src)){
				if(!iscached && F.cache.enabled)F.cache.write(path,src);
				return true;
			}else{
				return false;
			}
		}catch(ex){
			ExceptionManager.put(ex,"F.include");
			return false;
		}
	},
	execute : function(){
		if(arguments.length < 1)return false;
		try{
			var args,src = (args = [].slice.apply(arguments)).shift();
			eval(src);
			var exports = exports || args;
			if(exports.constructor == Array && exports.length > 0){
				for(var i = 0;i < exports.length;i++){
					(new Function("obj_",exports[i] + " = obj_;"))(eval(exports[i]));
				}
			}else if(exports.constructor == String){
				(new Function("obj_",exports + " = obj_;"))(eval(exports));
			}
			return true;
		}catch(ex){
			ExceptionManager.put(ex,"F.execute");
			return false;
		}
	},
	globalize : function(src,cname){
		if(cname === undefined)return;
		if(typeof cname == "string") cname = [cname];
		else if(typeof cname == "object" && cname.constructor == Array){}
		else return;
		if(typeof src == "string")src = eval(src);
		for(var i = 0;i < cname.length;i++){
			(new Function("src",cname[i] + " = src;"))(src);
		}
	},
	initialize : function(name){
		if(typeof name == "string")name = eval(name);
		return typeof name == "object" ? name : new name();
	},
	encode : function(src){src = src || "";return encodeURIComponent(src).replace(/\+/,"%2B");},
	decode : function(src){src = src || "";return decodeURIComponent(src);},
	encodeHtml : function(src){
		src = src || "";
		var ret = src.replace(/&/igm,"&amp;");
		ret = ret.replace(/>/igm,"&gt;");
		ret = ret.replace(/</igm,"&lt;");
		ret = ret.replace(/ /igm,"&nbsp;");
		ret = ret.replace(/\"/igm,"&quot;");
		ret = ret.replace(/\u00a9/igm,"&copy;");
		ret = ret.replace(/\u00ae/igm,"&reg;");
		ret = ret.replace(/\u00b1/igm,"&plusmn;");
		ret = ret.replace(/\u00d7/igm,"&times;");
		ret = ret.replace(/\u00a7/igm,"&sect;");
		ret = ret.replace(/\u00a2/igm,"&cent;");
		ret = ret.replace(/\u00a5/igm,"&yen;");
		ret = ret.replace(/\u2022/igm,"&middot;");
		ret = ret.replace(/\u20ac/igm,"&euro;");
		ret = ret.replace(/\u00a3/igm,"&pound;");
		ret = ret.replace(/\u2122/igm,"&trade;");
		return ret
	},
	decodeHtml : function(src){
		src = src || "";
		var ret = src.replace(/&amp;/igm,"&");
		ret = ret.replace(/&gt;/igm,">");
		ret = ret.replace(/&lt;/igm,"<");
		ret = ret.replace(/&nbsp;/igm," ");
		ret = ret.replace(/&quot;/igm,"\"");
		ret = ret.replace(/&copy;/igm,"\u00a9");
		ret = ret.replace(/&reg;/igm,"\u00ae");
		ret = ret.replace(/&plusmn;/igm,"\u00b1");
		ret = ret.replace(/&times;/igm,"\u00d7");
		ret = ret.replace(/&sect;/igm,"\u00a7");
		ret = ret.replace(/&cent;/igm,"\u00a2");
		ret = ret.replace(/&yen;/igm,"\u00a5");
		ret = ret.replace(/&middot;/igm,"\u2022");
		ret = ret.replace(/&euro;/igm,"\u20ac");
		ret = ret.replace(/&pound;/igm,"\u00a3");
		ret = ret.replace(/&trade;/igm,"\u2122");
		return ret
	},
	jsEncode : function(str){
		if(str == undefined) return "";
		if(str == "")return "";
		var i, j, aL1, aL2, c, p,ret = "";
		aL1 = Array(0x22, 0x5C, 0x2F, 0x08, 0x0C, 0x0A, 0x0D, 0x09);
		aL2 = Array(0x22, 0x5C, 0x2F, 0x62, 0x66, 0x6E, 0x72, 0x74);
		for(i = 0;i < str.length;i++){
			p = true;
			c = str.substr(i,1);
			for(j = 0;j <= 7;j++){
				if(c == String.fromCharCode(aL1[j])){
					ret += "\\" + String.fromCharCode(aL2[j]);
					p = false;
					break;
				}
			}
			if(p){
				var a = c.charCodeAt(0);
				if(a > 31 && a < 127){
					ret += c;
				}else if(a > -1 || a < 65535){
					var slashu = a.toString(16);
					while(slashu.length < 4){slashu = "0" + slashu;}
					ret += "\\u" + slashu;
				}
			}
		}
		return ret;
	},
	formatdate : function(dt,fs){
		if(dt !== null){
			var src = dt;
			if(typeof dt == "object" && dt.constructor == Date){
				
			}else{
				if(typeof dt != "date"){
					if(!isNaN(dt)){
						dt = new Date(parseInt(dt));
					}else{
						try{
							dt = new Date(dt);
						}catch(ex){
							ExceptionManager.put(ex,"F.formatdate");
							return "";
						}
					}
				}else{
					dt = new Date(dt - 0);
				}
			}
		}else{
			dt = new Date();
		}
		if(isNaN(dt.getFullYear()))dt = new Date();
		var y = new Array(2),m = new Array(2),d = new Array(2),h = new Array(2),n = new Array(2),s = new Array(2),w,ws = new Array(2),t = new Array(1),H = new Array(2),ms = new Array(2);
		y[0] = dt.getFullYear();
		m[0] = dt.getMonth() + 1;
		d[0] = dt.getDate();
		h[0] = dt.getHours();
		H[0] = h[0] % 12;
		n[0] = dt.getMinutes();
		s[0] = dt.getSeconds();
		y[1] = y[0];
		m[1] = F.string.right("0" +m[0],2);
		d[1] = F.string.right("0" +d[0],2);
		h[1] = F.string.right("0" +h[0],2);
		H[1] = F.string.right("0" +H[0],2);
		n[1] = F.string.right("0" +n[0],2);
		s[1] = F.string.right("0" +s[0],2);
		ws[0] = Array("Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday","Saturday");
		ws[1] = Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
		ms[0] = Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December","");
		ms[1] = Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","");
		t[0] = dt.getMilliseconds();
		w = dt.getDay();
		
		fs = fs.replace(/dddd/g,"{````}");
		fs = fs.replace(/ddd/g,"{```}");
		fs = fs.replace(/MMMM/g,"{~~~~}");
		fs = fs.replace(/MMM/g,"{~~~}");
		var ret = fs.replace(/yyyy/g,y[0]);
		ret = ret.replace(/yy/g,y[1]);
		ret = ret.replace(/ss/g,s[1]);
		ret = ret.replace(/s/g,s[0]);
		ret = ret.replace(/MM/g,m[1]);
		ret = ret.replace(/M/g,m[0]);
		ret = ret.replace(/HH/g,h[1]);
		ret = ret.replace(/H/g,h[0]);
		ret = ret.replace(/hh/g,H[1]);
		ret = ret.replace(/h/g,H[0]);
		ret = ret.replace(/mm/g,n[1]);
		ret = ret.replace(/m/g,n[0]);
		ret = ret.replace(/tttt/g,t[0]);
		ret = ret.replace(/dd/g,d[1]);
		ret = ret.replace(/d/g,d[0]);
		ret = ret.replace(/\{````\}/g,ws[0][w]);
		ret = ret.replace(/\{```\}/g,ws[1][w]);
		ret = ret.replace(/\{~~~~\}/g,ms[0][m[0] - 1]);
		ret = ret.replace(/\{~~~\}/g,ms[1][m[0] - 1]);
		return ret;			
	},
	date : function(srcDate){
		var date_ = F.date.parse(srcDate);
		for(var i in date_){
			if(!date_.hasOwnProperty(i)) continue;
			this[i] = date_[i];
		}
	},
	untimespan : function(ts,format){
		if(format === undefined)format = "yyyy-MM-dd HH:mm:ss"
		return F.formatdate(new Date(ts*1000),format);
	},
	timespan : function(src){
		src = F.date.parse(src || new Date());
		return (src.ticks - (src.ticks%1000))/1000;
	},
	each : function(src,fn,state){
		if(typeof fn != "function") return;
		var e = new Enumerator(src);
		for (;!e.atEnd();e.moveNext()){
			if(fn.apply(src,[e.item(),src,state]) === false)break;
		}
		e = null;
	},
	foreach : function(src,fn,state){
		if(typeof fn != "function") return;
		for(var i in src){
			if(!src.hasOwnProperty(i))continue;
			if(fn.apply(src,[i,src[i],state]) === false)break;
		}
	},
	readAttrs : function(src){
		if(typeof src != "string")return {};
		if(!src)return {};
		src = F.string.trim(F.string.trim(src).replace(/^<(\w+)([\s\S]+?)(\/)?>([\s\S]*?)$/i,"$2"));
		var returnValue = {};
		var reg = /\b([\w\.]+)\=\"(.+?)\"( |$)/igm;
		var a =reg.exec(src);
		while(a != null){
			returnValue[a[1]] = a[2];
			a = reg.exec(src);
		}
		return returnValue;
	},
	safe : function(src){
		src = src || "";
		return src.replace(/\'/igm,"").replace(/((^[\s]+)|([\s]+$))/igm,"").replace(/[\r\n]+/igm,"").replace(/>/igm,"&gt;").replace(/</igm,"&lt;");
	},
	cache : {
		enabled : false,
		write : function(key,value){
			if(!F.cache.enabled)return;
			Application.Lock();
			Application(key) = value;
			Application.UnLock();
		},
		read : function(key){
			if(Application.Contents(key) != undefined)return Application.Contents(key);
			return null;
		},
		exists : function(key){
			return Application.Contents(key) != undefined;
		},
		clear : function(key){
			if(key != undefined && (typeof key == "string") && key.length > 0){
				if(key.substr(key.length - 1) == "."){
					var list = [];
					F.each(Application.Contents,function(q){
						if(q.length > key.length && q.substr(0,key.length) == key)list.push(q);
					});
					F.each(list,function(q){
						Application.Contents.Remove(q);
					});
					return list.length;
				}
				Application.Contents.Remove(key);
				return;
			}
			var all = [];
			F.each(Application.Contents,function(q){
				all.push(q);
			});
			F.each(all,function(q){
				Application.Contents.Remove(q);
			});
			return all.length;
		}
	},
	sortable : {
		"data__" : [],
		"add" : function(v){F.sortable["data__"].push(v);},
		"clear" : function(){while(F.sortable["data__"].length > 0){F.sortable["data__"].pop();}},
		"sort" : function(asc){
			if(asc == undefined)asc = true;
			F.sortable["data__"] = F.sortable["data__"].sort(function(a,b){if(a > b == asc)return 1;if(a == b)return 0;if(a < b == asc)return -1;});
		},
		"join" : function(c){return F.sortable["data__"].join(c || "");}
	},
	timer : {
		start : null,
		end : null,
		run : function(){this.start = new Date();return this.start;},
		stop : function(start){
			this.end = new Date();
			return this.end - (start || this.start);
		}
	},
	replace : function(src,search,replacement){
		if(typeof search == "object") return src.replace(search,replacement);
		var rv = "",r = "";
		while(src.indexOf(search) >= 0){
			r = src.substr(0,src.indexOf(search) + search.length);
			if(r.length < src.length) src = src.substr(r.length); else src = "";
			rv += r.replace(search,replacement);
		}
		return rv + src;
	},
	string : {
		left : function(src,len){
			src = src || "";
			if(typeof len == "number"){
				if(src.length <= len)return src;
				return src.substr(0,len);
			}
			if(typeof len == "string"){
				if(src.indexOf(len) < 0)return src;
				return src.substr(0,src.indexOf(len));
			}
			return src;
		},
		right : function(src,len){
			src = src || "";
			if(typeof len == "number"){
				if(src.length <= len)return src;
				return src.substr(src.length - len);
			}
			if(typeof len == "string"){
				if(src.indexOf(len) < 0)return src;
				return src.substr(src.indexOf(len) + 1);
			}
			return src;
		},
		startWith : function(src,opt){
			if(src == "")return false;
			if(opt === undefined) return false;
			if(opt.length > src)return false;
			if(src.substr(0,opt.length) == opt)return true;
			return false;
		},
		endWith : function(src,opt){
			if(src == "")return false;
			if(opt === undefined) return false;
			if(opt.length > src)return false;
			if(src.substr(src.length - opt.length) == opt)return true;
			return false;
		},
		trim : function(src,opt){return F.string.trimLeft(F.string.trimRight(src,opt),opt);},
		trimLeft : function(src,opt){
			if(src == "")return "";
			if(opt === undefined)return src.replace(/^(\s+)/igm,"");
			if(F.string.startWith(src,opt)){
				if(src == opt)return"";
				return F.string.trimLeft(src.substr(opt.length),opt);
			}
			return src;
		},
		trimRight : function(src,opt){
			if(src == "")return "";
			if(opt === undefined)return src.replace(/(\s+)$/igm,"");
			if(F.string.endWith(src,opt)){
				if(src == opt)return"";
				return F.string.trimRight(src.substr(0,src.length - opt.length),opt);
			}
			return src;
		},
		format : function(){return F.format.apply(F,arguments);},
		email : function(str){return F.string.exp(str,"/^([\\w\\.\\-]+)@([\\w\\.\\-]+)$/");},
		url : function(str){return F.string.exp(str,"/^http(s)?\\:\\/\\/(.+?)$/i");},
		test : function(str,exp,option){
			exp= F.string.exp_(exp,option);
			if(exp == null)return false;
			return exp.test(str);
		},
		replace : function(src,exp,option,replacement){
			if(arguments.length == 3){
				replacement = option;
				option = "";
			}
			src = src ||"";
			if(typeof exp != "object"){
				exp = exp + "";
				exp = F.string.exp_(exp,option) || exp;
			}
			return src.replace(exp,replacement);
		},
		matches : function(src,exp,option){
			exp= F.string.exp_(exp,option);
			if(exp == null)return null;
			if(!exp.global)return exp.exec(src);
			var ret = [],result = exp.exec(src);
			while(result){
				ret.push(result);
				result = exp.exec(src);
			}
			return ret;
		},
		exp : function(str,exp,option){
			if(typeof exp != "object"){
				if(typeof exp !== "string")return "";
				exp = F.string.exp_(exp,option);
				if(exp == null)return "";
			}
			str = str ||"";
			return (exp.test(str)? str : "");
		},
		exp_ : function(exp,option){
			if(typeof exp == "object")return exp;
			option = option || "";
			if(!/^\/(.+)\/([igm]*)$/.test(exp))exp = "/" + exp + "/" + option;
			try{return (new Function("return " + exp + ";"))()}catch(ex){ExceptionManager.put(ex,"F.string.exp_"); return null;}
			return exp;
		},
		to : function(str,target){
			str = str || "";
			if(str == "" || str.length < 2)return;
			if(str.substr(0,1) == "/")str = str.substr(1);
			if(str.substr(str.length - 1) == "/")str = str.substr(0,str.length - 1);
			var parms = str.split("/");
			if(parms.length % 2 != 0)return;
			for(var i = 0;i <= parms.length - 2;i += 2)F[target](parms[i],decodeURIComponent(parms[i + 1]));
		},
		toget : function(str){F.string.to(str,"get");},
		topost : function(str){F.string.to(str,"post");},
		frombinary : function(bin,charset){
			var byts,Objstream = F.stream(3,1);
			Objstream.Open();
			Objstream.Write(bin);
			Objstream.Position = 0;
			Objstream.Type = 2;
			Objstream.CharSet = charset || "utf-8";
			byts = Objstream.ReadText();
			Objstream.Close();
			Objstream = null;
			return byts;
		},
		fromfile : function(path,charset){
			if(!F.fso.fileexists(path))return "";
			var byts,Objstream = F.stream(3,2);
			Objstream.CharSet = charset || "utf-8";
			Objstream.Open();
			Objstream.LoadFromFile(path);
			Objstream.Position = 0;
			byts = Objstream.ReadText();
			Objstream.Close();
			Objstream = null;
			return byts;
		},
		savetofile : function(path,content,charset){
			var byts,Objstream = F.stream(3,2);
			Objstream.CharSet = charset || "utf-8";
			Objstream.Open();
			Objstream.writetext(content)
			Objstream.savetofile(path,2);
			Objstream.Close();
			Objstream = null;
		},
		appendtofile : function(path,content,charset){
			var byts,Objstream = F.stream(3,2);
			Objstream.CharSet = charset || "utf-8";
			Objstream.Open();
			if(!F.fso.fileexists(path)){
				Objstream.LoadFromFile(path);
				Objstream.Position = Objstream.Size;
			}
			Objstream.writetext(content)
			Objstream.savetofile(path,2);
			Objstream.Close();
			Objstream = null;
		}
	},
	convert : {
		toVbArray : function(src){return new VBArray(src).toArray();},
		toEnumerator : function(src){return new Enumerator(src);}
	},
	base64 : {
		keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
		encode : function (Str) {    
			Str = escape(Str);    
			var output = "";    
			var chr1, chr2, chr3 = "";    
			var enc1, enc2, enc3, enc4 = "";    
			var i = 0;    
			do {    
		        chr1 = Str.charCodeAt(i++);    
		        chr2 = Str.charCodeAt(i++);    
		        chr3 = Str.charCodeAt(i++);    
		        enc1 = chr1 >> 2;    
		        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);    
		        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);    
		        enc4 = chr3 & 63;    
		        if (isNaN(chr2)) {enc3 = enc4 = 64;} else if (isNaN(chr3)) {enc4 = 64;}    
		        output = output + F.base64.keyStr.charAt(enc1) + F.base64.keyStr.charAt(enc2) + F.base64.keyStr.charAt(enc3) + F.base64.keyStr.charAt(enc4);    
		        chr1 = chr2 = chr3 = "";    
		        enc1 = enc2 = enc3 = enc4 = "";    
			} while (i < Str.length);    
			return output;    
		}, 
		decode : function(Str) {    
			var output = "";    
			var chr1, chr2, chr3 = "";    
			var enc1, enc2, enc3, enc4 = "";    
			var i = 0;    
			var base64test = /[^A-Za-z0-9\+\/\=]/g;    
			if (base64test.exec(Str)){}    
			Str = Str.replace(/[^A-Za-z0-9\+\/\=]/g, "");    
			do {    
		        enc1 = F.base64.keyStr.indexOf(Str.charAt(i++));    
		        enc2 = F.base64.keyStr.indexOf(Str.charAt(i++));    
		        enc3 = F.base64.keyStr.indexOf(Str.charAt(i++));    
		        enc4 = F.base64.keyStr.indexOf(Str.charAt(i++));    
		        chr1 = (enc1 << 2) | (enc2 >> 4);    
		        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);    
		        chr3 = ((enc3 & 3) << 6) | enc4;    
		        output = output + String.fromCharCode(chr1);    
		        if (enc3 != 64) {output = output + String.fromCharCode(chr2);}    
		        if (enc4 != 64) {output = output + String.fromCharCode(chr3);}    
		        chr1 = chr2 = chr3 = "";    
		        enc1 = enc2 = enc3 = enc4 = "";    
			} while (i < Str.length);    
			return unescape(output);    
		}    
	},
	dump_ : function(parm,level){
		if(typeof F.dump_.helper != "function"){
			F.dump_.helper = function(l){var returnValue = "";for(var i = 0;i < l;i++)returnValue += "  ";return returnValue;};
		}
		if(level === undefined)level = 1;
		if(parm === undefined)return "undefined";
		//constructor
		switch(typeof parm){
			case "string" : 
				return "string(\"" + parm + "\")";
			case "number" : 
				return "number(" + parm.toString() + ")";
			case "boolean" : 
				return "boolean(" + parm.toString() + ")";
			case "date" : 
				return "date(" + (new Date(parm)).toString() + ")";
			case "function" : 
				return "[Function]"
		}
		if(parm === null)return "NULL";
		if(typeof parm == "object"){
			if(parm.constructor == Date){
				return "date(" + parm.toString() + ")";
			}
			if(parm.constructor == Array){
				var returnValue = "array(" + parm.length + "){\r\n";
				F.foreach(parm,function(i){
					returnValue += F.dump_.helper(level) + "[" + i + "] => " + F.dump_(this[i],level + 1) + "\r\n";
				});
				returnValue += F.dump_.helper(level - 1)+ "}";
				return returnValue;
			}
			if(parm.constructor == Object){
				var returnValue = "object{\r\n";
				F.foreach(parm,function(i){
					returnValue += F.dump_.helper(level) + "[" + i + "] => " + F.dump_(this[i],level + 1) +"\r\n";
				});
				returnValue += F.dump_.helper(level - 1)+  "}";
				return returnValue;
			}
			if((parm instanceof ActiveXObject) && (typeof(parm.Count) == "number") && (typeof(parm.Keys) == "unknown") && (typeof(parm.Items) == "unknown") && (typeof(parm.Key) == "unknown") && (typeof(parm.Item) == "unknown")){
				var returnValue = "dictionary{\r\n";
				F.each(parm,function(i){
					returnValue += F.dump_.helper(level) + "[" + i + "] => " + F.dump_(this(i),level + 1) +"\r\n";
				});
				returnValue += F.dump_.helper(level - 1)+  "}";
				return returnValue;
			}
			if(parm.toString() == "[object Object]"){
				if(parm.constructor == DataTable){
					var returnValue = "DataTable{\r\n";
					returnValue += F.dump_.helper(level) + "[pagesize] => " + F.dump_(parm.pagesize,level + 1) +",\r\n";
					returnValue += F.dump_.helper(level) + "[recordcount] => " + F.dump_(parm.recordcount,level + 1) +",\r\n";
					returnValue += F.dump_.helper(level) + "[currentpage] => " + F.dump_(parm.currentpage,level + 1) +",\r\n";
					returnValue += F.dump_.helper(level) + "[LIST__] => " + F.dump_(parm["LIST__"],level + 1) +"\r\n";
					returnValue += F.dump_.helper(level - 1)+  "}";
					return returnValue;
				}
				if(parm.constructor == DataTableRow){
					var returnValue = "DataTableRow{\r\n";
					returnValue += F.dump_.helper(level) + "[pk] => " + F.dump_(parm.pk,level + 1) +",\r\n";
					returnValue += F.dump_.helper(level) + "[table] => " + F.dump_(parm.table,level + 1) +"\r\n";
					returnValue += F.dump_.helper(level - 1)+  "}";
					return returnValue;
				}
				var returnValue = "[object Object]{\r\n";
				F.foreach(parm,function(i){
					returnValue += F.dump_.helper(level) + "[" + i + "] => " + F.dump_(this[i],level + 1) +"\r\n";
				});
				F.foreach(parm.constructor.prototype,function(i){
					returnValue += F.dump_.helper(level) + "[" + i + "] => " + F.dump_(this[i],level + 1) +"\r\n";
				});
				returnValue += F.dump_.helper(level - 1)+  "}";
				return returnValue;
			}
		}
		if(typeof parm == "unknown"){
			if(parm.constructor == VBArray){
				var returnValue = "array{\r\n";
				F.foreach((new VBArray(parm)).toArray(),function(i){
					returnValue += F.dump_.helper(level) + "[" + i + "] => " + F.dump_(this[i],level + 1) +"\r\n";
				});
				returnValue += F.dump_.helper(level - 1)+  "}";
				return returnValue;
			}
		}
		return "unknown(object)";
	},
	dump : function(parm){
		F.echo(F.dump_(parm,1));
	},
	toURIString : function(src,charset){
		var fn = charset == "utf-8" ? F.encode : escape;
		if(F.toURIString.fn == 0)fn = function(src){return src;};
		var returnValue = "";
		for(var i in src){
			if(!src.hasOwnProperty(i))continue;
			var cn = true;
			for(var j = 0;j < F.toURIString.filter.length;j++){
				if(F.toURIString.filter[j].substr(0,1) == "!" && i == F.toURIString.filter[j].substr(1))cn = false;
				if(F.toURIString.filter[j].substr(0,1) == "@" && !F.string.startWith(i,F.toURIString.filter[j].substr(1)))cn = false;
				if(!cn)break;
			}
			if(cn)returnValue += fn(i) + F.toURIString.split_char_1 + fn(src[i]) + F.toURIString.split_char_2;
		}
		if(returnValue != "")returnValue = returnValue.substr(0,returnValue.length - 1);
		return returnValue;
	},
	object : {
		sort : function(src,asc){
			F.sortable.data__ = F.object.keys(src);
			F.sortable.sort(asc);
			var new_ = {};
			for(var i = 0;i < F.sortable.data__.length;i++){
				new_[F.sortable.data__[i]] = src[F.sortable.data__[i]];
			}
			return new_;
		},
		keys : function(src){
			var returnValue = [];
			for(var i in src){
				if(!src.hasOwnProperty(i))continue;
				returnValue.push(i);
			}
			return returnValue;
		},
		values : function(src){
			var returnValue = [];
			for(var i in src){
				if(!src.hasOwnProperty(i))continue;
				returnValue.push(src[i]);
			}
			return returnValue;
		},
		toArray : function(src,key,value){
			var returnValue = [];
			key = key ||"key";
			value = value ||"value";
			for(var i in src){
				if(!src.hasOwnProperty(i))continue;
				returnValue.push((function(m,k,v){
					var obj = new Object();
					obj[k] = m;
					obj[v] = src[m];
					return obj;
				})(i,key,value));
			}
			return returnValue;
		}
	},
	dbl :function(value,default_){
		if(value == "")return (default_ === undefined ? 0 : default_);
		if(isNaN(value))return (default_ === undefined ? 0 : default_);
		return parseFloat(value);	
	},
	bool : function(value,default_){
		if(value == null)return !!(default_ || false);
		if(typeof value == "number") return value != 0;
		if(typeof value == "boolean") return value;
		if(typeof value != "string") return false;
		if(value == "")return !!(default_ || false);
		return (value.toLowerCase() === "true" ? true : false);	
	},
	"int" : function(value,default_,islist){
		if(islist !== true)islist = false;
		value = String(value).replace(/\s/igm,"");
		if(value == "")return (default_ === undefined ? 0 : default_);
		if(!islist){
			if(isNaN(value))return (default_ === undefined ? 0 : default_);
			return parseInt(value);
		}else{
			if(!/^([\d\,]+)$/.test(value))return (default_ === undefined ? 0 : default_);
			return (value);
		}
	},
	md5 : function(src){
		if(!F.exports["md5"])F.require("md5");
		if(!F.exports["md5"]){
			ExceptionManager.put(0x000003A8,"F.md5","can not load 'md5'.");
			return "";
		}
		return F.exports["md5"](src);
	},
	delgate : function(){
		try{
			var args,body = (args = Array.prototype.slice.apply(arguments)).pop();
			return new Function(args,body);
		}catch(ex){
			ExceptionManager.put(ex.number,"F.func",ex.description + " function body [ " + body + " ]");
		}
	},
	lambda : function(src){
		if(arguments.length == 0)return new Function();
		if(arguments.length == 1 && typeof src == "string"){
			var exp_ = /^(\()?([\w\,\s]*?)(\))?(\s*)\=\>(\s*)(\{)?([\s\S]+?)(\})?(\s*)$/igm;
			var match = null;
			if(match = exp_.exec(src)){
				if(match[2] == "" && match[1] == "") ExceptionManager.put(0,"F.lambda","[Notice] '()' for arguments is missed in expression [ " + src + " ].");
				if(match[2].indexOf(",") > 0 && match[1] == "") ExceptionManager.put(0,"F.lambda","[Notice] '()' for arguments is missed in expression [ " + src + " ].");
				var body = match[7],bodytemp = body;
				body = F.string.trim(body);
				body = F.string.trim(body,";");
				bodytemp = body.replace(/\\\'/igm,"");
				bodytemp = bodytemp.replace(/\\\"/igm,"");
				bodytemp = bodytemp.replace(/\'([\s\S]*?)\'/igm,"");
				bodytemp = bodytemp.replace(/\"([\s\S]*?)\"/igm,"");
				if(bodytemp.indexOf(";") > 0 && match[6] == "") ExceptionManager.put(0,"F.lambda","[Notice] '{}' for body is missed in expression [ " + src + " ].");
				//if(bodytemp.indexOf(";")<0 && !F.string.startWith(body,"return"))body = "return " + body;
				return new Function(match[2].replace(/\s/igm,"").split(","),body);
			}
		}
		return F.delgate.apply(null,arguments);
	}
};
F.post.init = function(){
	if(!F.postinited){
		F.post__ = {};
		F.each(Request.Form,function(q){
			if(F.post__[q] != undefined){
				F.post__[q] = F.post__[q] + ", " + String(this(q));
			}else{
				F.post__[q] = String(this(q));
			}
		});
		F.postinited = true;
	}
};
F.foreach(["get","post","session","all"],function(i,v){
	F[v].exp =function(key,exp,option){return F.string.exp(F[v](key),exp,option);};
	F[v].email = function(key){return F.string.email(F[v].safe(key));};
	F[v].url = function(key){return F.string.url(F[v].safe(key));};
	F[v].safe = function(key,len){if(len !== undefined) return F.safe(F[v](key)).substr(0,len);return F.safe(F[v](key));};
	F[v].intList = function(key,default_){return F[v]["int"](key,default_,true);};
	if(v != "all"){
		F[v]["int"] = function(key,default_,islist){return F["int"](F[v](key),default_,islist);};
		F[v].dbl = function(key,default_){return F.dbl(F[v](key),default_);};
		F[v].bool = function(key,default_){return F.bool(F[v](key),default_);};
	}
});
F.foreach(["int","dbl","bool"],function(i,v){
	F.all[v] = function(key,default_,islist){
		if(F.get.exists(key))return F.get[v](key,default_,islist);
		if(F.post.exists(key))return F.post[v](key,default_,islist);
		return default_ || (v == "bool" ? false : 0);
	};	
});
F.post.remove = function(key){F.post.init();delete F.post__[key];};
F.get.remove = function(key){delete F.get__[key];};
F.post.clear = function(){F.post.init();delete F.post__;F.post__ = {};};
F.get.clear = function(){delete F.get__;F.get__ = {};};

F.post.exists = function(key){F.post.init();return F.post__[key] != undefined};
F.get.exists = function(key){return F.get__[key] != undefined};
F.all.exists = function(key){return F.get.exists(key) || F.post.exists(key);};
F.session.exists = function(key){
	if(key == undefined)return false;
	if(F.MO_SESSION_WITH_SINGLE_TAG)key = F.MO_APP_NAME + "_" + key;
	if(Session.Contents(key) != undefined)return true;
	return false;
};
F.session.destroy = function(key){
	if(key === true){
		Session.Abandon();
		return;
	}
	if(key == undefined){
		Session.Contents.RemoveAll();
		return;
	}
	if(F.MO_SESSION_WITH_SINGLE_TAG)key = F.MO_APP_NAME + "_" + key;
	if(Session.Contents(key) != undefined){Session.Contents.Remove(key);return;}
};
F.session.clear = function(){Session.Contents.RemoveAll();};
F.session.parse = function(name){
	var obj = {};
	F.each(Session.Contents,function(q){
		var nq = q;
		if(F.MO_SESSION_WITH_SINGLE_TAG)nq = F.string.trimLeft(q,F.MO_APP_NAME + "_");
		if(F.string.startWith(nq,name + ".")){
			obj[nq.substr(name.length + 1)] = Session.Contents(q);
		}
	});
	return obj;
}
F.post.dump = function(){
	F.post.init();
	F.echo(F.dump_(F.post__,1));
};
F.get.dump = function(){
	F.echo(F.dump_(F.get__,1));
};
F.session.dump = function(){
	F.echo("session{\n");
	F.echo("  [Timeout] => " + F.dump_(Session.Timeout) + "\n");
	F.echo("  [CodePage] => " + F.dump_(Session.CodePage) + "\n");
	F.echo("  [LCID] => " + F.dump_(Session.LCID) + "\n");
	F.echo("  [SessionID] => " + F.dump_(Session.SessionID) + "\n");
	F.echo("  [Contents] => {\n");
	F.each(Session.Contents,function(q){
		var nq = q;
		if(F.MO_SESSION_WITH_SINGLE_TAG)nq = F.string.trimLeft(q,F.MO_APP_NAME + "_");
		F.echo("    [" + nq + "] => " + F.dump_(Session.Contents(q)) + "\n");
	});
	F.echo("  }\n");
	F.echo("}");
}
F.toURIString.split_char_1 = "=";
F.toURIString.split_char_2 = "&";
F.toURIString.filter = [];
F.toURIString.clearFilter = function(){while(F.toURIString.filter.length > 0)F.toURIString.filter.pop();};
F.toURIString.fn = 1;
F.get.keys = function(){return F.object.keys(F.get__);};
F.post.keys = function(){return F.object.keys(F.post__);};
F.get.values = function(){return F.object.values(F.get__);};
F.post.values = function(){return F.object.values(F.post__);};
F.get.fromURIString = function(src){
	var ucs = src.split(F.toURIString.split_char_2);
	for(var i = 0;i < ucs.length;i++){
		if(ucs[i].indexOf(F.toURIString.split_char_1) > 0){
			F.get__[F.decode(ucs[i].substr(0,ucs[i].indexOf(F.toURIString.split_char_1)))] = F.decode(F.string.trimLeft(ucs[i].substr(ucs[i].indexOf(F.toURIString.split_char_1)),F.toURIString.split_char_1));
		}
	}
};
F.post.fromURIString = function(src){
	F.post.init();
	var ucs = src.split(F.toURIString.split_char_2);
	for(var i = 0;i < ucs.length;i++){
		if(ucs[i].indexOf(F.toURIString.split_char_1) > 0){
			F.post__[F.decode(ucs[i].substr(0,ucs[i].indexOf(F.toURIString.split_char_1)))] = F.decode(F.string.trimLeft(ucs[i].substr(ucs[i].indexOf(F.toURIString.split_char_1)),F.toURIString.split_char_1));
		}
	}
};
F.get.toURIString = function(charset){
	return F.toURIString(F.get__,charset || "utf-8");
};
F.post.toURIString = function(charset){
	return F.toURIString(F.post__,charset || "utf-8");
};
F.server.toURIString = function(charset){
	return F.toURIString(F.server__,charset || "utf-8");
};
F.session.toURIString = function(charset){
	charset = charset || "utf-8"
	var fn = charset == "utf-8" ? F.encode : escape;
	var returnValue = "";
	F.each(Session.Contents,function(q){
		var nq = q;
		if(F.MO_SESSION_WITH_SINGLE_TAG)nq = F.string.trimLeft(q,F.MO_APP_NAME + "_");
		returnValue += fn(nq) + "=" + fn(Session.Contents(q)) + "&";
	});
	if(returnValue != "")returnValue = returnValue.substr(0,returnValue.length - 1);
	return returnValue;
}
F.get.sort = function(asc){
	F.get__ = F.object.sort(F.get__,asc);
};
F.post.sort = function(asc){
	F.post__ = F.object.sort(F.post__,asc);
};
F.activex.connection = function(){return F.activex("ADODB.CONNECTION");};
F.activex.recordset = function(){return F.activex("ADODB.RECORDSET");};
F.activex.stream = function(){return F.activex("ADODB.STREAM");};
F.activex.dictionary = function(){return F.activex("SCRIPTING.DICTIONARY");};
F.activex.document = function(){return F.activex("MSXML2.DOMDocument");};
F.activex.httprequest = function(){
	var b = null;
	var httplist = ["MSXML2.serverXMLHttp.3.0","MSXML2.serverXMLHttp","MSXML2.XMLHttp.3.0","MSXML2.XMLHttp","Microsoft.XMLHttp"];
	for(var i = 0;i <= httplist.length -1;i++){
		try{
			b= new ActiveXObject(httplist[i]);
			(function(o){
				F.activex.httprequest = function(){return new ActiveXObject(o)};  
			})(httplist[i]);
			return b;
		}catch(ex){}
	}
	if(b == null)ExceptionManager.put(0x000001A8,"F.activex.httprequest","can not load httprequest object.");
	return b;
};
F.date.timezone = new Date().getTimezoneOffset()/60;
F.date.format = function(){return F.formatdate.apply(this,arguments);};
F.date.firstweekdayofmonth = function(srcDate){
	var date_ = new Date(srcDate - 0);
	return (new Date(date_.getFullYear(),date_.getMonth(),1)).getDay();
};
F.date.firstweekdayoflastmonth = function(srcDate){
	var date_ = new Date(srcDate - 0);
	return F.date.firstweekdayofmonth(new Date(date_.getFullYear(),date_.getMonth(),1) - 12*3600000);
};
F.date.parse = function(srcDate){
	if(typeof srcDate == "string"){
		srcDate = srcDate.replace(/(\-|\s|\:|\.)0/ig,"$1");
		var match = /^(\d{4})\-(\d{1,2})\-(\d{1,2})( (\d{1,2})\:(\d{1,2})\:(\d{1,2})(\.(\d{1,3}))?)?$/.exec(srcDate);
		if(match){
			try{
				if(match[4] == ""){
					srcDate = new Date(parseInt(match[1]),parseInt(match[2]) - 1,parseInt(match[3]));
				}else{
					srcDate = new Date(parseInt(match[1]),parseInt(match[2]) - 1,parseInt(match[3]),parseInt(match[5]),parseInt(match[6]),parseInt(match[7]),(match[8] == "" ? 0 : parseInt(match[9])));
				}
			}catch(ex){
				ExceptionManager.put(ex,"F.date.parse(string)");
				return null;
			}
		}else{
			ExceptionManager.put(0x000001B9,"F.date.parse(string)","argument format error.");
			return null;
		}
	}
	var date_= new Date(srcDate - 0);
	var obj_ = {
		ticks : date_ - 0,
		year : date_.getFullYear(),
		month : date_.getMonth(),
		day : date_.getDate(),
		hour : date_.getHours(),
		minute : date_.getMinutes(),
		second : date_.getSeconds(),
		ms : date_.getMilliseconds(),
		weekday : date_.getDay()
	};
	obj_["yeardays"] = F.date.datediff("d",new Date(obj_.year,0,1),date_) + 1;
	obj_["season"] = (obj_.month - obj_.month%3) / 3 + 1;
	var firstday = new Date(obj_.year,0,1);
	if(firstday.getDay() == 0){
		obj_["weeks"] = (obj_.yeardays - obj_.yeardays%7) / 7 + (obj_.yeardays%7 == 0 ? 0 : 1)
	}else{
		var ndays = obj_.yeardays - 7 + firstday.getDay();
		obj_["weeks"] = (ndays - ndays%7) / 7 + (ndays%7 == 0 ? 0 : 1) + 1;
	}
	return obj_;
};
F.date.datediff = function(diff,src1,src2){
	var miisecond = new Date(src2 - 0) - new Date(src1 - 0);
	switch(diff){
		case "s" : return (miisecond - miisecond % 1000) / 1000;
		case "m" : return (miisecond - miisecond % 60000) / 60000;
		case "h" : return (miisecond - miisecond % 3600000) / 3600000;
		case "d" : return (miisecond - miisecond % 86400000) / 86400000;
		case "w" : return (miisecond - miisecond % 604800000) / 604800000;
		case "M" : return src2.getFullYear() * 12 + src2.getMonth() - src1.getFullYear() * 12 - src1.getMonth();
		case "y" : return src2.getFullYear() - src1.getFullYear();
	}
	return miisecond;
};
F.date.dateadd = function(diff,value,srcDate){
	var date_ = F.date.parse(srcDate);
	switch(diff){
		case "ms" : return new Date(date_.ticks - value * -1);
		case "s" : return new Date(date_.ticks - value * -1000);
		case "m" : return new Date(date_.ticks - value * -60000);
		case "h" : return new Date(date_.ticks - value * -3600000);
		case "d" : return new Date(date_.ticks - value * -86400000);
		case "w" : return new Date(date_.ticks - value * -604800000);
		case "M" : return new Date(date_.year,date_.month + value,date_.day,date_.hour,date_.minute,date_.second,date_.ms);
		case "y" : return new Date(date_.year + value,date_.month,date_.day,date_.hour,date_.minute,date_.second,date_.ms);
	}
	return srcDate;
};
F.date.prototype.add = function(diff,value){
	F.date.call(this,F.date.dateadd(diff,value,this.ticks));
};
F.date.prototype.diff = function(diff,srcdate){
	return F.date.datediff(diff,srcdate,this.ticks);
};
F.date.prototype.toString = function(format){
	if(format)return F.formatdate(this.ticks,format);
	return (new Date(this.ticks)).toString();
};
F.random.initialize = function(seeds,length){
	if(seeds.length <= 0)return"";
	if(isNaN(length)){
		ExceptionManager.put(0x000001A9,"F.random.initialize","argument 'length' must be a number.");
		return"";
	}
	length = parseInt(length);
	var returnValue = "";
	for(var i = 0;i < length;i++){
		returnValue += seeds.substr(F.random(0,seeds.length - 1),1);
	}
	return new String(returnValue);
};
F.foreach({
	"number" : "123456789012345678901234567890",
	"letter" : "abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH",
	"hex" : "123456789012345678901234567890ABCDEFABCDEFABCDEFABCDEFABCDEF",
	"word" : "abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH12345678906789012678901234534567890126789012345345",
	"mix" : "~!@#$%^&*()_+=-[]{}:'<>/?\\,.|`abcdefghiIJKLMNOPQRSTUVWXYZjklmnopqrstuvwxyzABCDEFGH6789012678901234534567890126789012345345"
},function(i,v){
	F.random[i] = function(length){
		return F.random.initialize(v,length);
	};	
});
F.timer.ticks = F.timer.stop;
F.init();
</script>