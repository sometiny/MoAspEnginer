<!--#include file="Mo.Function.asp"-->
<script language="jscript" runat="server">
/*
** File: Mo.asp
** Usage: core code of MAE, don't change 'Mo' to other name.
** About: 
**		support@mae.im
*/
var IO, JSON, Mo = Mo || (function(){
	var M = function(opt){
		M.Run(opt);
	};
	M.Version = "MoAspEnginer 2.1";
	M.Librarys = {};
	M.Language = {};
	M.Assigns = {};
	M.Config = {};
	M.rewrite = false;
	M.Action = "";
	M.Method = "";
	M.Group = "";
	M.CacheFileName = "";
	M.RealAction = "";
	M.RealMethod = "";
	M.Status = "";

	M.runtime = {
		start : 0,
		ticks : function(){
			return (new Date()) - M.runtime.start;
		}
	};
	
	var _extend = function(src,dest){
		for(var c in dest){
			if(dest.hasOwnProperty(c)) src[c] = dest[c];
		}
		return src;
	};
	
	var _RightCopy = function(src,target){
		var i = 0;
		while(true){
			if(i >= src.length || i >= target.length)break;
			src[src.length - i - 1] = target[target.length - i - 1];
			i++;
		}
		return src;
	};

	var _LoadTemplate = function(template){
		var templatelist,vpath,path,templatelist2;
		
		templatelist = template.split(":");
		if(templatelist.length == 1){
			vpath = G.MO_TEMPLATE_NAME + "/" + M.Method + G.MO_TEMPLATE_SPLIT + template;
			templatelist = [G.MO_TEMPLATE_NAME,M.Method,template];
		}else if(templatelist.length == 2){
			vpath = G.MO_TEMPLATE_NAME + "/" + template.replace(":",G.MO_TEMPLATE_SPLIT);
			templatelist = [G.MO_TEMPLATE_NAME].concat(templatelist);
		}else if(templatelist.length == 3){
			vpath = templatelist[0] + "/" + templatelist[1] + G.MO_TEMPLATE_SPLIT + templatelist[2];
		}
		path = G.MO_APP + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
		if(vpath.indexOf("@") > 0)path = G.MO_ROOT + vpath.substr(vpath.indexOf("@") + 1) + "/Views/" + vpath.substr(0,vpath.indexOf("@")) + "." + G.MO_TEMPLATE_PERX;
		if(!F.exists(path)) path = G.MO_CORE + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
		path = F.mappath(path);
		if(!F.exists(path))return;
		var tempStr = F.string.fromFile(path,G.MO_CHARSET);
		var regexp = new RegExp("<include file\\=\\\"(.+?)(\\." + G.MO_TEMPLATE_PERX + ")?\\\" />","igm");
		var Matches = F.string.matches(tempStr,regexp);
		while(Matches.length > 0){
			var Match = Matches.pop();
			templatelist2 = _RightCopy(templatelist,Match[1].split(":"));
			tempStr = F.replace(tempStr,Match[0], _LoadTemplate(templatelist2.join(":")));
		}
		return tempStr;
	};

	var _ParseTemplatePath = function(template){
		var templatelist,vpath;
		templatelist = template.split(":");
		if(templatelist.length == 1){
			vpath = G.MO_TEMPLATE_NAME + "/" + M.Method + G.MO_TEMPLATE_SPLIT + template;
		}else if(templatelist.length == 2){
			vpath = G.MO_TEMPLATE_NAME + "/" + template.replace(":",G.MO_TEMPLATE_SPLIT);
		}else if(templatelist.length == 3){
			vpath = templatelist[0] + "/" + templatelist[1] + G.MO_TEMPLATE_SPLIT + templatelist[2];
		}
		return vpath;
	};

	var _InitializePath = function(cfg){
		var url_ = F.server("URL");
		if(cfg.MO_APP_NAME == "")F.exit("未定义应用名称：MO_APP_NAME，请检查初始配置参数。")
		if(cfg.MO_ROOT == "")cfg.MO_ROOT = url_.substr(0,url_.lastIndexOf("/") + 1);
		if(cfg.MO_APP == "")cfg.MO_APP = cfg.MO_ROOT + cfg.MO_APP_NAME + "/";
		if(cfg.MO_CORE == "")cfg.MO_CORE = cfg.MO_ROOT + "Mo/";
		if(cfg.MO_APP.substr(cfg.MO_APP.length - 1) != "/")cfg.MO_APP = cfg.MO_APP + "/";
		if(cfg.MO_CORE.substr(cfg.MO_CORE.length - 1) != "/")cfg.MO_CORE = cfg.MO_CORE + "/";
		if(!F.exists(cfg.MO_CORE,true))F.exit("核心目录[" + cfg.MO_CORE + "]不存在，请检查初始配置参数。");	
		if(cfg.MO_APP_ENTRY == ""){
			cfg.MO_APP_ENTRY = url_.substr(url_.lastIndexOf("/") + 1);
			if(cfg.MO_APP_ENTRY.toLowerCase() == "default.asp")cfg.MO_APP_ENTRY = "";
		}
	}

	var _LoadController = function(path,controller){
		if(M.Librarys["Controller_" + controller] == "jscript")return true;
		try{
			path = F.mappath(path);
			var ret = F.string.fromFile(path,G.MO_CHARSET);
			ret = F.string.replace(ret,/(^(\s+)|(\s+)$)/ig,"");
			ret = F.string.replace(ret,"^<s" + "cript(.+?)>(\s*)","ig","");
			ret = F.string.replace(ret,/(\s*)<\/script>(\s*)$/ig,"");
			try{
				(new Function("__FILE__","__DIR__","M","C","L",ret))(
					path,
					path==""?"":path.substr(0,path.lastIndexOf("\\")),
					Model__,M.C,M.L
				);
				if(typeof GLOBAL[controller + "Controller"] == "function"){
					M.Librarys["Controller_" + controller] = "jscript";
					return true;
				}else{
					ExceptionManager.put(0x8300,"_LoadController()","加载控制器时出现错误，请检查是否已经定义相关控制器'" + controller + "'");
					return false;
				}
			}catch(ex){
				ExceptionManager.put(ex.number,"_LoadController()","加载控制器\"" + controller + "\"时出现错误:" + ex.description);
				return false;
			}
		}catch(ex){
			ExceptionManager.put(ex.number,"_LoadController()","加载控制器\"" + controller + "\"时出现错误:" + ex.description);
			return false;
		}
	};

	var _parseLibraryPath = function(lib){
		var path,core,cls,library;
		core = "Extend";
		cls = lib;
		library = "Lib";
		if(lib.indexOf(":") > 0){
			core = lib.substr(0,lib.indexOf(":"));
			cls = lib.substr(lib.indexOf(":") + 1);
		}
		if(cls.indexOf(".") > 0){
			library = cls.substr(0,cls.indexOf("."));
			cls = cls.substr(cls.indexOf(".") + 1);
		}
		path = F.mappath(G.MO_APP + "Library/" + core + "/Mo." + library + "." + cls + ".asp");
		if(!F.exists(path))path = F.mappath(G.MO_CORE + "Library/" + core + "/Mo." + library + "." + cls + ".asp");
		if(F.exists(path))return [path,core,library,cls];
		return ["",core,library,cls];
	};

	var _start = function(){
		if(G.MO_PRE_LIB != ""){
			var libs = G.MO_PRE_LIB.split(","),lib,T__;
			for(var i = 0;i < libs.length;i++){
				var result = _parseLibraryPath("PreLib:Pre." + libs[i]);
				if(result[0]!=""){
					if(F.include(result[0])){
						var pre = F.initialize("MoPre" + libs[i]);
						pre.Index();
						pre.__destruct();
					}
				}
			}
		}
 	};
 	
	var _end = function(){
		if(G.MO_END_LIB != ""){
			var libs = G.MO_END_LIB.split(","),lib,T__;
			for(var i = 0;i < libs.length;i++){
				var result = _parseLibraryPath("EndLib:End." + libs[i]);
				if(result[0]!=""){
					if(F.include(result[0])){
						var end = F.initialize("MoEnd" + libs[i]);
						end.Index();
						end.__destruct();
					}
				}
			}
		}
	};

	var _debug = function(){
		if(G.MO_SHOW_SERVER_ERROR)F.echo(ExceptionManager.debug());
		Model__.debug();
	};
	var _getfunctionParms=function(fn){
		var _parms = fn.toString().replace(/^function(.*?)\((.*?)\)([\s\S]+)$/,"$2").split(",");
		for(var i=0;i<_parms.length;i++)
		{
			_parms[i] = F.get(_parms[i]);
		}
		return _parms;
	};
	var G = {};

	M.Initialize = function(cfg){
		if(!cfg || typeof cfg != "object") cfg = {MO_AUTO_CREATE_APP : false}
		cfg = _extend({
			MO_APP_NAME : "App",
			MO_APP : "App",
			MO_APP_ENTRY : "",
			MO_ROOT : "",
			MO_CORE : "Mo"
		},cfg);
		this.runtime.start = new Date();
		Response.Charset = "utf-8";
		M.Config.Global = cfg;
		this.Status = "200 OK";
		_InitializePath(cfg);
		IO = F.require("io");
		JSON = F.require("json");
		if(F.exists(cfg.MO_CORE + "Conf/Config.asp")) G = M.Config.Global = F.require(F.mappath(cfg.MO_CORE + "Conf/Config.asp"));
		_extend(G,cfg);
		if(!G.MO_METHOD_CHAR) G.MO_METHOD_CHAR = "m";
		if(!G.MO_ACTION_CHAR) G.MO_ACTION_CHAR = "a";
		if(!G.MO_GROUP_CHAR) G.MO_GROUP_CHAR = "g";
		try{
			F.foreach(["Mo.Extend","Mo.Model","Mo.Model.Helper"],function(i,v){
				F.include(G.MO_CORE +"Library/MAE/" + v + ".asp");
			});
		}catch(ex){
			F.exit("核心库加载失败，原因：" + ex.message + "。")
			return;
		}
		if(G.MO_LOAD_VBSHELPER)M.loadVBSHelper();
		try{
			IO.directory.files(G.MO_CORE + "Common",function(file){
				if(F.string.endWith(file.name,".asp")) F.include(file.path);
			});
			if(G.MO_AUTO_CREATE_APP!==false && !F.exists(G.MO_APP,true)){
				F.foreach([
					"","Controllers","Cache","Cache/Compiled","Cache/Model","Views","Conf","Lang",
					"Library","Library/Extend","Library/TagLib","Library/PreLib","Library/EndLib","Common"
				],function(i,v){
					F.fso.CreateFolder(F.mappath(G.MO_APP + v));
				});
			}
			if(F.exists(G.MO_APP + "Conf/Config.asp")){
				cfg = F.require(F.mappath(G.MO_APP + "Conf/Config.asp"));
				_extend(G,cfg || {});
			}
			if(G.MO_CHARSET != "utf-8")Response.Charset = G.MO_CHARSET;
			if(F.exists((G.MO_APP + "Common/Function.asp"))) F.include(G.MO_APP + "Common/Function.asp");
			if(G.MO_IMPORT_COMMON_FILES != ""){
				var files = G.MO_IMPORT_COMMON_FILES.split(";")
				if(files.length <= 0)return;
				for(var i = 0;i < files.length;i++){
					if(files[i] != ""){
						if(files[i].indexOf("=") > 0){
							F.include(G.MO_APP + "Common/" + files[i].substr(0,files[i].indexOf("=")) + ".asp",files[i].substr(files[i].indexOf("=") + 1));
						}else{
							F.include(G.MO_APP + "Common/" + files[i] + ".asp");
						}
					}
				}
			}
			M.assign("VERSION",Mo.Version);
			_start();
		}catch(ex){
			ExceptionManager.put(ex,"Mo.Initialize");
		}
		return this;
	};
	M.Terminate = function(){
		_end();
		Model__.dispose();
		F.dispose();
		_debug();
		this.Assigns = null;
		this.Config = null;
		this.Language = null;
		this.Librarys = null;
	};
	M.Route = function(){
		(function(G,M){
			if(G.MO_REWRITE_CONF == "")return;
			var qs = Request.QueryString + "";
			var mat = /^404\;http(s)?\:\/\/(.+?)\/(.*?)$/i.exec(qs);
			if(mat != null)G.MO_REWRITE_MODE = "404";
			var uri = "";
			if(G.MO_REWRITE_MODE == "404"){
				if(mat == null)return;
				if(mat.length <= 0)return;
				M.rewrite = true;
				uri = "/" + mat[3];
				if(F.server("HTTP_X_REWRITE_URL") != "")uri = F.server("HTTP_X_REWRITE_URL");
			}else if(G.MO_REWRITE_MODE == "URL"){
				uri = qs;
				M.rewrite = true;
				if(uri == "")return;
			}else{
				return;
			}
			if(G.MO_ROOT != "/" && uri.substr(0,G.MO_ROOT.length) == G.MO_ROOT)uri = uri.substr(G.MO_ROOT.length - 1);
			var C = M.C(G.MO_REWRITE_CONF);
			if(C == undefined)return M;
			for(var i in C.Rules){
				if(C.Rules[i].LookFor.test(uri)){
					uri = uri.replace(C.Rules[i].LookFor,C.Rules[i].SendTo);
					break;
				}
			}
			mat = /^\/\?(.+?)$/i.exec(uri);
			if(mat && mat.length > 0) uri = mat[1];
			var items = uri.split("&");
			for(var i in items){
				var stem = /^(.+?)\=(.+?)$/i.exec(items[i]);
				if(stem && stem.length > 0){
					try{
						F.get(stem[1],decodeURIComponent(stem[2]));
					}catch(ex){
						F.get(stem[1],stem[2]);	
					}
				}else{
					F.get(stem,"");	
				}
			}
		})(G,M);
		return M;
	};
	M.ModelCacheExists = function(name){
		if(name == "") return false;
		return F.exists(G.MO_APP + "Cache/Model/" + name + ".cak");
	};
	M.ModelCacheSave = function(name,content){
		if(name == "") return false;
		return IO.file.writeAllText(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"),content,G.MO_CHARSET);
	};
	M.ModelCacheLoad = function(name){
		if(name == "") return "";
		return IO.file.readAllText(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"),G.MO_CHARSET);
	};
	M.ModelCacheDelete = function(name){
		if(name == "") return false;
		return IO.file.del(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"));
	};
	M.ModelCacheClear = function(){
		return IO.directory.clear(F.mappath(G.MO_APP + "Cache/Model"));
	};
	M.ClearCompiledCache = function(){
		return IO.directory.clear(F.mappath(G.MO_APP + "Cache/Compiled"));
	}
	M.ClearLibraryCache = function(){
		return F.cache.clear(G.MO_APP_NAME + ".lib.");
	};
	M.display = function(template){
		Response.Status = this.Status;
		Response.AddHeader("Content-Type","text/html; charset=" + G.MO_CHARSET);
		Response.Write(M.fetch(template));
	};
	M.fetch = function(template){
		var html,cachename,OldHash,usecache = false,vbscript,cachepath
		if(G.MO_COMPILE_CACHE){
			cachename = M.Method + "^" + M.Action + "^" + F.string.replace(template,/\:/igm,"^");
			cachepath = F.mappath(G.MO_APP + "Cache/Compiled/" + cachename + ".asp");
			if(F.exists(cachepath)){
				usecache = true;
				if(G.MO_COMPILE_CACHE_EXPIRED > 0){
					OldHash = F.fso.GetFile(cachepath).DateLastModified;
					if(F.date.datediff("s",OldHash,new Date()) >= G.MO_COMPILE_CACHE_EXPIRED)usecache = false;
				}
				if(usecache){
					vbscript = IO.file.readAllText(cachepath,G.MO_CHARSET);
					vbscript = vbscript.replace(/^<s(.+?)>\r\n/ig,"").replace(/\r\n<\/script>$/ig,"");
				}
			}
		}
		if(!usecache){
			html = _LoadTemplate(template);
			if(html == "")return "";
			if(typeof MoAspEnginerView == "undefined")F.include(G.MO_CORE + "Library/MAE/Mo.View.asp","utf-8");
			var view_ = new MoAspEnginerView(html);
			vbscript = view_.Content;
			if(G.MO_COMPILE_CACHE)IO.file.writeAllText(cachepath,"<s" + "cript language=\"jscript\" runat=\"server\">\r\n" + vbscript + "\r\n</s"+"cript>",G.MO_CHARSET);
		}
		
		if(!G.MO_DIRECT_OUTPUT) F.execute(vbscript,"Temp___");
		else F.execute(vbscript);
		var content="";
		try{
			if(!G.MO_DIRECT_OUTPUT)content = Temp___();
			if(G.MO_CACHE && G.MO_CACHE_DIR != "" && !G.MO_DIRECT_OUTPUT){
				if(F.exists(G.MO_CACHE_DIR,true)) IO.file.writeAllText(F.mappath(G.MO_CACHE_DIR + this.CacheFileName + ".cache"),fetch,G.MO_CHARSET);
			}
		}catch(ex){
			ExceptionManager.put(ex,"Mo.fetch()->Temp___()");
		}
		return content;
	};
	M.templateIsInApp = function(template){
		var vpath = _ParseTemplatePath(template),path;
		path = G.MO_APP + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
		if(vpath.indexOf("@") > 0)path = G.MO_ROOT + vpath.substr(vpath.indexOf("@") + 1) + "/Views/" + vpath.substr(0,vpath.indexOf("@")) + "." + G.MO_TEMPLATE_PERX;
		return F.exists(path);
	};
	M.templateIsInCore = function(template){
		var vpath,path;
		vpath = _ParseTemplatePath(template);
		path = G.MO_CORE + "Views/" + vpath + "." + G.MO_TEMPLATE_PERX;
		return F.exists(path);
	};
	M.assign = function(key,value){
		if(!/^(\w+)$/ig.test(key)) return ExceptionManager.put(0x2e4c,"Mo.assign","Parameter 'key' is invalid.");
		if(G.MO_COMPILE_STRICT) GLOBAL[key] = value; else this.Assigns[key] = value;
	};
	M.exists = function(key){
		return this.Assigns.hasOwnProperty(key);
	};
	M.value = function(key){
		if(G.MO_COMPILE_STRICT) return GLOBAL[key];
		if(!this.Assigns.hasOwnProperty(key))return null;
		return this.Assigns[key];
	};
	M.values = function(l,k){
		if(G.MO_COMPILE_STRICT)return GLOBAL[l][k];
		if(!this.Assigns.hasOwnProperty(l)) return null;
		if(this.Assigns[l] !== null && typeof this.Assigns[l] == "object"){
			if(this.Assigns[l].hasOwnProperty(k)) return this.Assigns[l][k];
		}
		return null;
	};
	M.L = function(key){
		if(!G.MO_LANGUAGE){
			ExceptionManager.put(5,"Mo.L(key)","未定义语言包");
			return "";
		}
		var lib = G.MO_LANGUAGE;
		if(key.indexOf(".") > 0){
			lib = key.substr(0,key.indexOf("."));
			key = key.substr(key.indexOf(".") + 1);
		}
		if(M.Language.hasOwnProperty(lib)) return M.Language[lib].getter__(key);
		var filepath = F.mappath(G.MO_APP + "Lang/" + lib + ".asp");
		if(!F.exists(filepath))filepath = F.mappath(G.MO_CORE + "Lang/" + lib + ".asp");
		if(F.exists(filepath)){
			var cfg = null;
			if(cfg = F.require(filepath)){
				M.Language[lib] = cfg;
				return M.Language[lib].getter__(key);
			}else{
				ExceptionManager.put(3,"Mo.L(key)","语言包[" + lib + "]无法加载,请检查语言包是否正确");
			}
		}else{
			ExceptionManager.put(4,"Mo.L(key)","语言包[" + lib + "]无法加载,请检查语言包是否存在");
		}
	};
	M.C = function(conf,value){
		var key="";
		if(conf.indexOf(".")>0){
			key = conf.substr(conf.indexOf(".")+1);
			conf = conf.substr(0,conf.indexOf("."));
			if(conf=="@")conf = "Global";
		}
		if(M.Config.hasOwnProperty(conf)){
			if(key!="" && value!==undefined) M.Config[conf][key] = value;
			return (key=="" ? M.Config[conf] : M.Config[conf][key]);
		}
		var filepath = F.mappath(G.MO_APP + "Conf/" + conf + ".asp");
		if(!F.exists(filepath)) filepath = F.mappath(G.MO_CORE + "Conf/" + conf + ".asp");
		if(F.exists(filepath)){
			var cfg = null;
			if(cfg = F.require(filepath)){
				M.Config[conf] = cfg;
				if(key!="" && value!==undefined) M.Config[conf][key] = value;
				return (key=="" ? M.Config[conf] : M.Config[conf][key]);
			}else{
				ExceptionManager.put(3,"Mo.C(conf,value)","配置[" + conf + "]无法加载,请检查配置文件是否正确");
			}
		}else{
			ExceptionManager.put(4,"Mo.C(conf,value)","配置[" + conf + "]无法加载,请检查配置文件是否存在");
		}
	};
	M.C.Save = function(conf,data){
		var filepath = F.mappath(G.MO_APP + "Conf/" + conf + ".asp");
		if(!F.exists(filepath)) filepath = F.mappath(G.MO_CORE + "Conf/" + conf + ".asp");
		if(F.exists(filepath)){
			IO.file.writeAllText(filepath,"<scrip" + "t language=\"jscript\" runat=\"server\">return " + JSON.unParse(data,"\t") + ";</scrip" + "t>","utf-8");
		}else{
			ExceptionManager.put(4,"Mo.C.Save(conf)","配置[" + conf + "]不存在。");
		}
	};
	M.A = function(ctrl){
		if(this.Librarys["Controller_" + ctrl] == "jscript"){
			return F.initialize(ctrl + "Controller");
		}
		var filepath = F.mappath(G.MO_APP + "Controllers/" + ctrl + "Controller.asp");
		if(!F.exists(filepath)) filepath = F.mappath(G.MO_CORE + "Controllers/" + ctrl + "Controller.asp");
		if(F.exists(filepath)){
			if(_LoadController(filepath,ctrl)){
				return F.initialize(ctrl + "Controller");
			}else{
				ExceptionManager.put(5,"Mo.A(ctrl)","模块[" + ctrl + "]无法加载,请检查模块文件");
			}
		}else{
			ExceptionManager.put(6,"Mo.A(ctrl)","模块[" + ctrl + "]无法加载,请检查模块文件是否存在");
		}
	};
	M.Run = function(opt){
		M.Initialize(opt);
		M.Route();
		this.Method = F.string.trim(F.get(G.MO_METHOD_CHAR))
		this.Action = F.string.trim(F.get(G.MO_ACTION_CHAR))
		this.Group = F.string.trim(F.get(G.MO_GROUP_CHAR))
		if(!F.string.test(this.Action,/^(\w+)$/i)) this.Action = "Index";
		if(!F.string.test(this.Method,/^(\w+)$/i)) this.Method = "Home";
		if(!F.string.test(this.Group,/^(\w+)$/i)) this.Group = "";
		if(this.Group != "") this.Group += "/";
		if(G.MO_DISABLED_CONTROLLERS != ""){
			if(("," + G.MO_DISABLED_CONTROLLERS.toLowerCase() + ",").indexOf("," + this.Method.toLowerCase() + ",") >= 0)F.exit("模块[" + this.Method + "]已被禁止自动调用。");
		}
		if(G.MO_CACHE){
			this.CacheFileName = F.md5(F.server("URL") + F.get.toURIString() + "");
			if(F.exists(G.MO_CACHE_DIR + this.CacheFileName + ".cache")){
				Response.Write(F.string.fromFile(F.mappath(G.MO_CACHE_DIR + this.CacheFileName + ".cache"),G.MO_CHARSET));
				return;
			}
		}
		var ModelPath = G.MO_APP + "Controllers/" + this.Group + this.Method + "Controller.asp", can_LoadController=true;
		this.RealMethod = this.Method;
		this.RealAction = this.Action;
		if(!F.exists(ModelPath)){
			ModelPath = G.MO_APP + "Controllers/" + this.Group + "EmptyController.asp";
			this.RealMethod ="Empty";
			if(!F.exists(ModelPath)){
				ModelPath =G.MO_CORE + "Controllers/" + this.Group + this.Method + "Controller.asp";
				this.RealMethod =this.Method;
				if(!F.exists(ModelPath)){
					ModelPath = G.MO_CORE + "Controllers/" + this.Group + "EmptyController.asp";
					this.RealMethod ="Empty";
					if(!F.exists(ModelPath)){
						if(M.templateIsInApp(this.Action) || M.templateIsInCore(this.Action)){
							M.display(this.Action);
							can_LoadController= false;
						}else{
							F.exit("模块[" + this.Method + "]不存在");
						}
					}
				}
			}
		}
		if(can_LoadController && _LoadController(ModelPath,this.RealMethod)){
			try{
				var MC = F.initialize(this.RealMethod + "Controller");
				if(MC.__STATUS__===true){
					if(F.server("REQUEST_METHOD")=="POST" && MC[this.Action+"_Post_"]){
						if(G.MO_PARSEACTIONPARMS === true)
						{
							MC[this.Action+"_Post_"].apply(MC,_getfunctionParms(MC[this.Action+"_Post_"]));
						}
						else
						{
							MC[this.Action+"_Post_"]();
						}
					}else if(MC[this.Action]){
						if(G.MO_PARSEACTIONPARMS === true)
						{
							MC[this.Action].apply(MC,_getfunctionParms(MC[this.Action]));
						}
						else
						{
							MC[this.Action]();
						}
					}else if(M.templateIsInApp(this.Action) || M.templateIsInCore(this.Action)){
						M.display(this.Action);
					}else{
						if(MC["empty"]){
							this.RealAction = "empty";
							MC["empty"](this.Action);
						}else{
							ExceptionManager.put(0x3a8,this.RealMethod + "." + this.RealAction,"未定义相应" + this.Action + "或empty方法。");
						}
					}
				}
				MC.__destruct();
				MC = null;
			}catch(ex){
				ExceptionManager.put(ex,this.RealMethod + "." + this.RealAction);
			}
		}
		M.Terminate();
		return M;
	};
	M.dump = function(){
		F.dump(this.Assigns);
	}
	M.loadVBSHelper = function(){
		try{
			//为了一些必要的功能，不得不调用部分VBS的东西
		    var objScrCtl = F.activex("MSScriptControl.ScriptControl");
		    objScrCtl.Language = "VBScript";
		    objScrCtl.AddObject("Model__",Model__);
		    objScrCtl.AddObject("F",F);
		    objScrCtl.AddObject("Mo",M);
		    objScrCtl.AddObject("Request",Request);

		    //用于获取查询影响行数的必要的vbs方法
		    objScrCtl.ExecuteStatement(
			    "function RecordsAffected(byref conn,byval sqlstring)\r\n" +
			    "	conn.execute sqlstring,RecordsAffected\r\n" +
			    "end function\r\n" +
			    "set Model__.RecordsAffected=GetRef(\"RecordsAffected\")"
		    );
		    objScrCtl.ExecuteStatement(
		    	"function RecordsAffectedCmd(byref cmd,byval withQuery)\r\n" +
		    	"	dim RecordsAffectedvar\r\n" +
		    	"	if withQuery then\r\n" +
		    	"		set RecordsAffectedCmd = cmd.execute(RecordsAffectedvar)\r\n" +
		    	"		Model__.lastRows = RecordsAffectedvar\r\n" +
		    	"	else\r\n" +
		    	"		cmd.execute RecordsAffectedvar\r\n" +
		    	"		Model__.lastRows = RecordsAffectedvar\r\n" +
		    	"	end if\r\n" +
		    	"end function\r\n" +
		    	"set Model__.RecordsAffectedCmd=GetRef(\"RecordsAffectedCmd\")"
		    );
		    objScrCtl.ExecuteStatement(
		    	"function charcodeb(b)\r\n" +
		    	"	charcodeb = ascb(b)\r\n" +
		    	"end function\r\n"
		    );
		    
		    /*如下仅仅是利用VBS扩展功能*/
		    (function(ScrCtl){
			    F.vbs.ctrl=ScrCtl;
		   		F.vbs.eval = function(script){
			   		return ScrCtl.eval(script);
		   		};
		   		F.vbs.execute = function(script){
			   		ScrCtl.ExecuteStatement(script);
		   		};
		   		F.vbs.ascb = function(b){
			   		return ScrCtl.Run("charcodeb",b);
		   		};
		   		F.vbs.ns = function(name,value){
			   		ScrCtl.AddObject(name,value);
		   		};
			    F.vbs.run = function(){
				    var args = [];for(var i = 0;i < arguments.length;i++)args.push("args" + i);var args_ = args.join(",");
				    return (new Function(args_,"return this.Run(" + args_ + ");")).apply(ScrCtl,arguments);
			    };
			    F.vbs.require = function(name){
				    return ScrCtl.eval("new " + name);
			    };
			    F.vbs.include = function(lib){
				    if(!/^([\w\.\/]+)$/.test(lib)){
						ExceptionManager.put(0x00003CD,"F.vbs.include(lib)","Parameter 'lib' is invalid.");
					    return false;
				    }
					if(!M.Librarys.hasOwnProperty("vbs-"+lib)){
					    var pathinfo = G.MO_APP + "Library/Extend/" + lib + ".vbs";
					    if(!F.exists(pathinfo)) pathinfo = G.MO_CORE + "Library/Extend/" + lib + ".vbs";
					    if(!F.exists(pathinfo))
					    {
							ExceptionManager.put(0x00002CD, "F.vbs.include(lib)","待加载的类库'" + lib + "'不存在。");
						    return false;
					    }else{
						    var ret = IO.file.readAllText(F.mappath(pathinfo));
							F.vbs.ctrl.error.clear();
							F.vbs.execute(ret);
							if(F.vbs.ctrl.error.number != 0){ 
								ExceptionManager.put(F.vbs.ctrl.error.number,"F.vbs.include(lib)",F.vbs.ctrl.error.description);
								F.vbs.ctrl.error.clear();
								return false;
							}else{
								M.Librarys["vbs-" + lib]="vbs";
								return true;
							}
					    }
				    }else{
					   return true; 
				    }
			    };
		    })(objScrCtl);
		    objScrCtl = null;
	    }catch(ex){
		    ExceptionManager.put(ex,"Mo.loadVBSHelper");
	    }
	};
	return M;
})();
</script>