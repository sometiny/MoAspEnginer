<!--#include file="Mo.Function.asp"-->
<script language="jscript" runat="server">
var Mo = Mo || (function(){
	var M={
		Version : "MoAspEnginer 2.0(Beta)"
		,Librarys : {}
		,Language : {}
		,Assigns : {}
		,Statics : {}
		,Config : {}
		,rewrite : false
		,Action : ""
		,Method : ""
		,Group : ""
		,CacheFileName : ""
		,RealAction : ""
		,RealMethod : ""
		,Status : ""
		,runtime : {
			start : 0,
			ticks : function(){
				return (new Date()) - this.start;
			}
		}
	}; 
	var extend = function(src,dest){
		for(var c in dest){
			if(dest.hasOwnProperty(c)) src[c] = dest[c];
		}
	};
	
	var LoadLibrary = function( path, library, cls){
		try{
			path = F.mappath(path);
			var ret = F.string.fromfile(path);
			ret = F.string.replace(ret,/^(\s*)<s(.+?)>(\s*)/i,"");
			ret = F.string.replace(ret,/(\s*)<\/script>(\s*)$/igm,"");
			if(!F.execute(ret,"Mo" + library + cls))return false;
			return true;
		}catch(ex){
			ExceptionManager.put(ex, "LoadLibrary([path], \"" + library + "\", \"" + cls + "\")");
			return false;
		}
	};
	var RightCopy = function(src,target){
		var i = 0;
		while(true){
			if(i >= src.length || i >= target.length)break;
			src[src.length - i - 1] = target[target.length - i - 1];
			i++;
		}
		return src;
	};
	var LoadTemplateEx = function(template){
		var templatelist,vpath,path,templatelist2;
		
		templatelist = template.split(":");
		if(templatelist.length == 1){
			vpath = G.MO_TEMPLATE_NAME + "/" + M.Method + G.MO_TEMPLATE_SPLIT + template;
		}else if(templatelist.length == 2){
			vpath = G.MO_TEMPLATE_NAME + "/" + template.replace(":",G.MO_TEMPLATE_SPLIT);
		}else if(templatelist.length == 3){
			vpath = templatelist[0] + "/" + templatelist[1] + G.MO_TEMPLATE_SPLIT + templatelist[2];
		}
		path = G.MO_APP + "Templates/" + vpath + "." + G.MO_TEMPLATE_PERX;
		if(vpath.indexOf("@") > 0)path = G.MO_ROOT + vpath.substr(vpath.indexOf("@") + 1) + "/Templates/" + vpath.substr(0,vpath.indexOf("@")) + "." + G.MO_TEMPLATE_PERX;
		if(!F.exists(path)) path = G.MO_CORE + "Templates/" + vpath + "." + G.MO_TEMPLATE_PERX;
		path = F.mappath(path);
		if(!F.exists(path))return;
		var tempStr = F.string.fromfile(path,G.MO_CHARSET);
		var regexp = new RegExp("<include file\\=\\\"(.+?)(\\." + G.MO_TEMPLATE_PERX + ")?\\\" />","igm");
		var Matches = F.string.matches(tempStr,regexp);
		while(Matches.length > 0){
			var Match = Matches.pop();
			templatelist2 = RightCopy(templatelist,Match[1].split(":"));
			tempStr = F.replace(tempStr,Match[0], LoadTemplateEx(templatelist2.join(":")));
		}
		return tempStr;
	};
	var ParseTemplatePath = function(template){
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
	var InitializePath = function(cfg,url_){
		if(cfg.MO_APP_NAME == "")F.exit("未定义应用名称：MO_APP_NAME，请检查初始配置参数。")
		if(cfg.MO_ROOT == "")cfg.MO_ROOT = url_.substr(0,url_.lastIndexOf("/") + 1);
		if(cfg.MO_APP == "")cfg.MO_APP = cfg.MO_ROOT + cfg.MO_APP_NAME + "/";
		if(cfg.MO_CORE == "")cfg.MO_CORE = cfg.MO_ROOT + "Mo/";
		if(cfg.MO_APP.substr(cfg.MO_APP.length - 1) != "/")cfg.MO_APP = cfg.MO_APP + "/";
		if(cfg.MO_CORE.substr(cfg.MO_CORE.length - 1) != "/")cfg.MO_CORE = cfg.MO_CORE + "/";
		if(!F.exists(cfg.MO_CORE,true))F.exit("核心目录[" + cfg.MO_CORE + "]不存在，请检查初始配置参数。");	
		//if(!F.exists(cfg.MO_APP,true))cfg.MO_APP = cfg.MO_CORE;
	}
	var LoadModel = function(path,model){
		if(M.Librarys["Action_" + model] == "jscript")return true;
		try{
			var ret = F.string.fromfile(F.mappath(path),G.MO_CHARSET),language;
			ret = F.string.replace(ret,/(^(\s+)|(\s+)$)/igm,"");
			ret = F.string.replace(ret,"^<s" + "cript(.+?)>(\s*)","igm","")
			ret = F.string.replace(ret,/(\s*)<\/script>/igm,"")
			if(!F.execute(ret,"Action" + model))return false;
			M.Librarys["Action_" + model] = "jscript"
			return true;
		}catch(ex){
			ExceptionManager.put(ex,"Mo.LoadModel([path],\"" + model + "\")，加载模块时出现错误。")
			return false;
		}
	};
	var parseLibraryPath = function(lib){
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
	var G = {};
	M.Initialize = function(cfg){
		this.runtime.start = new Date();
		Response.Charset = "utf-8";
		if(!cfg || typeof cfg != "object")F.exit("请设置初始配置参数。")
		var url_ = F.server("URL");
		this.Status = "200 OK";
		InitializePath(cfg,url_);
		if(F.exists(cfg.MO_CORE + "Config/Config.asp")) G = M.Config.Global = F.require(F.mappath(cfg.MO_CORE + "Config/Config.asp"));
		extend(G,cfg);
		if(G.MO_APP_ENTRY == ""){
			G.MO_APP_ENTRY = url_.substr(url_.lastIndexOf("/") + 1);
			if(G.MO_APP_ENTRY.toLowerCase() == "default.asp")G.MO_APP_ENTRY = "";
		}
		if(!F.string.test(G.MO_METHOD_CHAR,"^(\w+)$")) G.MO_METHOD_CHAR = "m";
		if(!F.string.test(G.MO_ACTION_CHAR,"^(\w+)$")) G.MO_ACTION_CHAR = "a";
		if(!F.string.test(G.MO_GROUP_CHAR,"^(\w+)$")) G.MO_GROUP_CHAR = "g";
		F.MO_APP_NAME = G.MO_APP_NAME;
		F.MO_APP = G.MO_APP;
		F.MO_CORE = G.MO_CORE;
		M.Start__();
		try{
			F.foreach(["Mo.Extend","Mo.Model","Mo.Model.Helper"],function(i,v){
				F.include(G.MO_CORE +"Library/Core/" + v + ".asp");
			});
		}catch(ex){
			F.exit("核心库加载失败，原因：" + ex.message + "。")
			return M;
		}
		if(G.MO_LOAD_VBSHELPER)M.loadVBSHelper();
		try{
			var em = F.convert.toEnumerator(F.fso.getfolder(F.mappath(G.MO_CORE + "Library/Common")).files);
			while(!em.atEnd()){
				var file = em.item();
				if(F.string.endWith(file.name,".asp"))F.include(file.path);
				em.moveNext();
			}
			if(!F.exists(G.MO_APP,true)){
				F.foreach([
					"","Action","Cache","Cache/Compiled","Cache/Model","Templates","Config","Lang",
					"Library","Library/Extend","Library/TagLib","Library/PreLib","Library/EndLib","Library/Common"
				],function(i,v){
					F.fso.CreateFolder(F.mappath(G.MO_APP + v));
				});
			}
			if(F.exists(G.MO_APP + "Config/Config.asp")){
				cfg = F.require(F.mappath(G.MO_APP + "Config/Config.asp"));
				extend(G,cfg || {});
			}
			if(G.MO_CHARSET != "utf-8")Response.Charset = G.MO_CHARSET;
			F.MO_SESSION_WITH_SINGLE_TAG = G.MO_SESSION_WITH_SINGLE_TAG;
			if(F.exists((G.MO_APP + "Library/Common/Function.asp"))) F.include(G.MO_APP + "Library/Common/Function.asp");
			if(G.MO_IMPORT_COMMON_FILES != ""){
				var files = G.MO_IMPORT_COMMON_FILES.split(";")
				if(files.length <= 0)return;
				for(var i = 0;i < files.length;i++){
					if(files[i] != ""){
						if(files[i].indexOf("=") > 0){
							F.include(G.MO_APP + "Library/Common/" + files[i].substr(0,files[i].indexOf("=")) + ".asp",files[i].substr(files[i].indexOf("=") + 1));
						}else{
							F.include(G.MO_APP + "Library/Common/" + files[i] + ".asp");
						}
					}
				}
			}
		}catch(ex){
			ExceptionManager.put(ex,"Mo.Initialize");
		}
		return M;
	};
	M.Terminate = function(){
		Model__.dispose();
		F.dispose();
		M.Debug_();
		M.End__();
		this.Assigns = null;
		this.Statics = null;
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
				uri = uri.replace(C.Rules[i].LookFor,C.Rules[i].SendTo);
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
	M.use = function(lib){
		var libinfo=parseLibraryPath(lib);
		if(!this.Librarys.hasOwnProperty(lib)){
			if(libinfo[0]!=""){
				if(LoadLibrary(libinfo[0],libinfo[2],libinfo[3]))this.Librarys[lib]="jscript";
			}else{
				ExceptionManager.put(1,"Mo.use(lib)","类库'" + lib + "'不存在。");
			}
		}
		return [libinfo[2],libinfo[3],libinfo[1]];
	};
	M.ModelCacheExists = function(name){
		if(name == "") return false;
		return F.exists(G.MO_APP + "Cache/Model/" + name + ".cak");
	};
	M.ModelCacheSave = function(name,content){
		if(name == "") return false;
		return F.string.savetofile(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"),content,G.MO_CHARSET);
	};
	M.ModelCacheLoad = function(name){
		if(name == "") return "";
		return F.string.fromfile(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"),G.MO_CHARSET);
	};
	M.ModelCacheDelete = function(name){
		if(name == "") return false;
		return F.fso.deletefile(F.mappath(G.MO_APP + "Cache/Model/" + name + ".cak"));
	};
	M.ModelCacheClear = function(){
		M.use("Folder");
		return MoLibFolder.clear(F.mappath(G.MO_APP + "Cache/Model"));
	};
	M.ClearCompiledCache = function(){
		M.use("Folder");
		return MoLibFolder.clear(F.mappath(G.MO_APP + "Cache/Compiled"));
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
			cachename = this.RealMethod + "^" + this.RealAction + "^" + F.string.replace(template,/\:/igm,"^");
			cachepath = F.mappath(G.MO_APP + "Cache/Compiled/" + cachename + ".asp");
			if(F.exists(cachepath)){
				usecache = true;
				if(G.MO_COMPILE_CACHE_EXPIRED > 0){
					OldHash = F.fso.GetFile(cachepath).DateLastModified;
					if(F.date.datediff("s",OldHash,new Date()) >= G.MO_COMPILE_CACHE_EXPIRED)usecache = false;
				}
				if(usecache){
					vbscript = F.string.fromfile(cachepath,G.MO_CHARSET);
					vbscript = vbscript.replace(/^<s(.+?)>\r\n/igm,"").replace(/\r\n<\/script>$/igm,"");
				}
			}
		}
		if(!usecache){
			html = LoadTemplateEx(template);
			if(html == "")return "";
			if(typeof MoAspEnginerView == "undefined")F.include(G.MO_CORE + "Library/Core/Mo.View.asp","utf-8");
			var view_ = new MoAspEnginerView(html);
			vbscript = view_.Content;
			if(G.MO_COMPILE_CACHE)F.string.savetofile(cachepath,"<s" + "cript language=\"jscript\" runat=\"server\">\r\n" + vbscript + "\r\n</s"+"cript>",G.MO_CHARSET);
		}
		
		if(!G.MO_DIRECT_OUTPUT) F.execute(vbscript,"Temp___");
		else F.execute(vbscript);
		var content="";
		try{
			if(!G.MO_DIRECT_OUTPUT)content = Temp___();
			if(G.MO_CACHE && G.MO_CACHE_DIR != "" && !G.MO_DIRECT_OUTPUT){
				if(F.exists(G.MO_CACHE_DIR,true)) F.string.savetofile(F.mappath(G.MO_CACHE_DIR + this.CacheFileName + ".cache"),fetch,G.MO_CHARSET);
			}
		}catch(ex){
			ExceptionManager.put(ex,"Mo.fetch()->Temp___()");
		}
		return content;
	};
	M.templateIsInApp = function(template){
		var vpath = ParseTemplatePath(template),path;
		path = G.MO_APP + "Templates/" + vpath + "." + G.MO_TEMPLATE_PERX;
		if(vpath.indexOf("@") > 0)path = G.MO_ROOT + vpath.substr(vpath.indexOf("@") + 1) + "/Templates/" + vpath.substr(0,vpath.indexOf("@")) + "." + G.MO_TEMPLATE_PERX;
		return F.exists(path);
	};
	M.templateIsInCore = function(template){
		var vpath,path;
		vpath = ParseTemplatePath(template);
		path = G.MO_CORE + "Templates/" + vpath + "." + G.MO_TEMPLATE_PERX;
		return F.exists(path);
	};
	M.assign = function(key,value){
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
		if(this.Language.hasOwnProperty(lib)) return this.Language[lib].getter__(key);
		var filepath = F.mappath(G.MO_APP + "Lang/" + lib + ".asp");
		if(!F.exists(filepath))filepath = F.mappath(G.MO_CORE + "Lang/" + lib + ".asp");
		if(F.exists(filepath)){
			var cfg = null;
			if(cfg = F.require(filepath)){
				this.Language[lib] = cfg;
				return this.Language[lib].getter__(key);
			}else{
				ExceptionManager.put(3,"Mo.L(key)","语言包[" + lib + "]无法加载,请检查语言包是否正确");
			}
		}else{
			ExceptionManager.put(4,"Mo.L(key)","语言包[" + lib + "]无法加载,请检查语言包是否存在");
		}
	};
	M.C = function(lib){
		if(this.Config.hasOwnProperty(lib)) return this.Config[lib];
		var filepath = F.mappath(G.MO_APP + "Config/" + lib + ".asp");
		if(!F.exists(filepath)) filepath = F.mappath(G.MO_CORE + "Config/" + lib + ".asp");
		if(F.exists(filepath)){
			var cfg = null;
			if(cfg = F.require(filepath)){
				this.Config[lib] = cfg;
				return this.Config[lib];
			}else{
				ExceptionManager.put(3,"Mo.C(lib)","配置[" + lib + "]无法加载,请检查配置文件是否正确");
			}
		}else{
			ExceptionManager.put(4,"Mo.C(lib)","配置[" + lib + "]无法加载,请检查配置文件是否存在");
		}
	};
	M.C.Save = function(lib,data){
		var filepath = F.mappath(G.MO_APP + "Config/" + lib + ".asp");
		if(!F.exists(filepath)) filepath = F.mappath(G.MO_CORE + "Config/" + lib + ".asp");
		if(F.exists(filepath)){
			M.use("JsonParser");
			F.string.savetofile(filepath,"<scrip" + "t language=\"jscript\" runat=\"server\">return " + MoLibJsonParser.unParse(data,"\t") + ";</scrip" + "t>","utf-8");
		}else{
			ExceptionManager.put(4,"Mo.C(lib)","配置[" + lib + "]无法加载,请检查配置文件是否存在");
		}
	};
	M.A = function(lib){
		if(this.Librarys["Action" + "_" + lib] == "jscript"){
			return F.initialize(Action + lib);
		}
		var filepath = F.mappath(G.MO_APP + "Action/Action." + lib + ".asp");
		if(!F.exists(filepath)) filepath = F.mappath(G.MO_CORE + "Action/Action." + lib + ".asp");
		if(F.exists(filepath)){
			if(LoadModel(filepath,lib)){
				return F.initialize("Action" + lib);
			}else{
				ExceptionManager.put(5,"Mo.A(lib)","模块[" + lib + "]无法加载,请检查模块文件");
			}
		}else{
			ExceptionManager.put(6,"Mo.A(lib)","模块[" + lib + "]无法加载,请检查模块文件是否存在");
		}
	};
	M.Start__ = function(){
		if(G.MO_PRE_LIB != ""){
			var libs = G.MO_PRE_LIB.split(","),lib,T__;
			for(var i = 0;i < libs.length;i++){
				M.use("PreLib:Pre." + libs[i]);
				F.initialize("MoPre" + libs[i]).Index();
			}
		}
 	};
	M.End__ = function(){
		if(G.MO_END_LIB != ""){
			var libs = G.MO_END_LIB.split(","),lib,T__;
			for(var i = 0;i < libs.length;i++){
				M.use("EndLib:End." + libs[i]);
				F.initialize("MoEnd" + libs[i]).Index();
			}
		}
	};
	M.Debug_ = function(){
		if(G.MO_SHOW_SERVER_ERROR)F.echo(ExceptionManager.debug());
		Model__.debug();
	};
	M.Run = function(){
		this.Method = F.string.trim(F.get(G.MO_METHOD_CHAR))
		this.Action = F.string.trim(F.get(G.MO_ACTION_CHAR))
		this.Group = F.string.trim(F.get(G.MO_GROUP_CHAR))
		if(!F.string.test(this.Action,/^(\w+)$/i)) this.Action = "Index";
		if(!F.string.test(this.Method,/^(\w+)$/i)) this.Method = "Home";
		if(!F.string.test(this.Group,/^(\w+)$/i)) this.Group = "";
		if(this.Group != "") this.Group += "/";
		if(G.DISABLED_MODELS != ""){
			if(("," + G.DISABLED_MODELS.toLowerCase() + ",").indexOf("," + this.Method.toLowerCase() + ",") >= 0)F.exit("模块[" + this.Method + "]已被禁止自动调用。");
		}
		if(G.MO_CACHE){
			this.CacheFileName = F.md5(F.server("URL") + F.get.toURIString() + "");
			if(F.exists(G.MO_CACHE_DIR + this.CacheFileName + ".cache")){
				Response.Write(F.string.fromfile(F.mappath(G.MO_CACHE_DIR + this.CacheFileName + ".cache"),G.MO_CHARSET));
				return;
			}
		}
		var theMethod = this.Method;
		var ModelPath = G.MO_APP + "Action/" + this.Group + "Action." + this.Method + ".asp";
		if(!F.exists(ModelPath)){
			ModelPath = G.MO_APP + "Action/" + this.Group + "Action.Empty.asp";
			theMethod ="Empty";
			if(!F.exists(ModelPath)){
				ModelPath =G.MO_CORE + "Action/" + this.Group + "Action." + this.Method + ".asp";
				theMethod =this.Method;
				if(!F.exists(ModelPath)){
					ModelPath = G.MO_CORE + "Action/" + this.Group + "Action.Empty.asp";
					theMethod ="Empty";
					if(!F.exists(ModelPath)) F.exit("模块[" + this.Method + "]不存在");
				}
			}
		}
		this.RealMethod = theMethod;
		this.RealAction = this.Action;
		if(LoadModel(ModelPath,theMethod)){
			try{
				var ModelClass = F.initialize("Action" + theMethod);
				if(F.server("REQUEST_METHOD")=="POST" && ModelClass[this.Action+"_Post_"]){
					ModelClass[this.Action+"_Post_"]();
				}else if(ModelClass[this.Action]){
					ModelClass[this.Action]();
				}else{
					if(ModelClass["empty"]){
						this.RealAction = "empty";
						ModelClass["empty"](this.Action);
					}else{
						ExceptionManager.put(0x3a8,this.RealMethod + "." + this.RealAction,"未定义相应" + this.Action + "或empty方法。");
					}
				}
				ModelClass.__destruct();
				ModelClass = null;
			}catch(ex){
				ExceptionManager.put(ex,this.RealMethod + "." + this.RealAction);
			}
		}
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
		    
		    /*如下仅仅是利用VBS扩展功能*/
		    (function(ScrCtl){
			    F.vbs.ctrl=ScrCtl;
		   		F.vbs.chrb = function(chrcode){
			   		return ScrCtl.eval("chrb(" + chrcode + ")");
		   		};
		   		F.vbs.eval = function(script){
			   		return ScrCtl.eval(script);
		   		};
		   		F.vbs.execute = function(script){
			   		ScrCtl.ExecuteStatement(script);
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
					if(!M.Librarys.hasOwnProperty(lib)){
					    var pathinfo = parseLibraryPath(lib);
					    if(pathinfo[0]!=""){
						    var ret = F.string.fromfile(pathinfo[0]);
							ret = F.string.replace(ret,/^(\s*)\<\%(\s*)/i,"");
							ret = F.string.replace(ret,/(\s*)\%\>(\s*)$/igm,"");
							F.vbs.ctrl.error.clear();
							F.vbs.execute(ret);
							if(F.vbs.ctrl.error.number != 0){ 
								ExceptionManager.put(F.vbs.ctrl.error.number,"F.vbs.include(lib)",F.vbs.ctrl.error.description);
								F.vbs.ctrl.error.clear();
								return false;
							}else{
								M.Librarys[lib]="vbs";
								return true;
							}
					    }else{
							ExceptionManager.put(0x00002CD, "F.vbs.include(lib)","待加载的类库'" + lib + "'不存在。");
						    return false;
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