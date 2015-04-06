/*
** File: require.js
** Usage: a method to include modules
** About: 
**		support@mae.im
*/
function wapper(content){
	return new Function("exports","require","module","__filename","__dirname","define", "__scripts", content);
}
function Module(id,parent){
	this.id = id;
	this.exports = {};
	this.parent = parent;
	if (parent && parent.children) {
		parent.children.push(this);
	}
	this.filename = null;
	this.loaded = false;
	this.children = [];
	this.aspfile = false;
}
Module.prototype.require = function(name){
	return Module._load(name, this);
};
Module.prototype.compile = function(){
	var self = this;
	var require = function(name){
		return self.require(name);
	};
	var define = function(){
		var alen = arguments.length;
		if(alen == 0) return;
		var factory = arguments[alen-1], id, _required;
		if(alen>=2){
			var arg = arguments[alen-2];
			if(typeof arg == "object" && Object.prototype.toString.call(arg) == "[object Array]"){
				_required = arg;
			}
		}
		if(typeof factory == "function"){
			var result; 
			if(_required){
				for(var i=0;i<_required.length;i++){
					_required[i]=require(_required[i]);
				}
				result= factory.apply(null,_required);
			}else{
				result= factory(require, self.exports, self);
			}
			if(result!==undefined) self.exports = result;
		}
		else self.exports = factory;
		return self.exports;
	};
	define.cmd={};
	var content = IO.file.readAllText(this.filename);
	if(this.aspfile){
		content = content.replace(/^(\s*)\<script(.+?)\>/i,"").replace(/\<\/script\>(\s*)$/i,"");
	}
	var candebug=false;
	if(Mo.Config.Global.MO_DEBUG && content.indexOf("/*debug*/") === 0){
		content = ReCompileForDebug(content,-1,1);
		candebug = true;
	}
	return wapper(content).apply(self.exports, [self.exports, require, self, this.filename, IO.parent(this.filename), define, candebug ? content:""]);
};
Module.prototype.loadpaths = function(){
	var dir = IO.parent(this.filename);
	return [dir].concat(Module._pathes);
};
Module._load = function(name, parent, aspfile, callback){
	var _file = null;
	if(IO.is(name)){
		if(IO.file.exists(name)){
			_file = name;
			name = IO.base(name);
		}
	}else{
		if(Mo.Config.Global.MO_LIB_CNAMES){
			name = Mo.Config.Global.MO_LIB_CNAMES[name] || name;
		}
		var paths = parent ? parent.loadpaths() : Module._pathes;
		for(var i=0;i<paths.length;i++){
			var filename = IO.build(paths[i],name);
			if(!IO.file.exists(filename)){
				filename += ".js";
				if(!IO.file.exists(filename)){
					filename = IO.build(paths[i],name+"/index.js");
				}
			}
			if(IO.file.exists(filename)){
				_file = filename;
				break;
			}
		}
	}
	if(!_file){
		ExceptionManager.put(new Exception(0xed34, "Module._load('" + name + "')", "Module is not exists, required by " + (parent ? ("'" + parent.id + "'") : "ROOT") + ".", E_WARNING));
	}else{
		var _parent=parent;
		while(_parent){
			if(_parent.filename==_file){
				ExceptionManager.put(new Exception(0xed35, "Module._load('" + name + "')", "Module is required by self. forbidden!", E_WARNING));
				return null;
			}
			_parent = _parent.parent;
		}
		var _cache = Module._cache[_file];
		if(_cache) return _cache.exports;
		var module = new Module(name,parent);
		module.filename=_file;
		module.aspfile = aspfile;
		try{
			var returnVal = module.compile();
			if(returnVal !== undefined) module.exports=returnVal;
			Module._cache[module.filename] = module;
			if(typeof callback == "function") return callback.call(module.exports)!==false;
			return module.exports;
		}catch(ex){
			ExceptionManager.put(ex, "Module._load('" + name + "')", E_ERROR);
		}
	}
	return null;
};
Module.ROOT=ROOT;
Module._cache = {};
Module._pathes=[];
function require(name, arg1, arg2){
	if(typeof arg1== "function"){
		arg2 = arg1;
		arg1=false;
	};
	return Module._load(name, null, !!arg1, arg2);
};
require.module = Module;
return require;