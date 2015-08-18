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
Module.prototype.compile = function(){
	var self = this;
	var require = function(name){
		return Module._load(name, self);
	};
	require.exists = function(name){
		return Module._exists(name, self);
	};
	require.use = Module._use;
	
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
				var _len = _required.length;
				for(var i=0;i<_len;i++){
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
		content = content.replace(/^(\s*)\u003cscript(.+?)\u003e/i,"").replace(/\u003c\/script\u003e(\s*)$/i,"");
	}
	var candebug=false;
	if(Mo.Config.Global.MO_DEBUG && content.slice(0, 9) == "/*debug*/"){
		content = ReCompileForDebug(content,-1,1);
		candebug = true;
	}
	if(Module.mode == "compile"){
		Module.result += '"' + this.id + '":function(){var module = {exports:{}};var retvalue = (function(exports,require,module,__filename,__dirname,define, __scripts){'+
		content
		+'})(module.exports, _require , module, "' + this.filename.replace(/\\/g, "\\\\") + '", "' + IO.parent(this.filename).replace(/\\/g, "\\\\") + '", null, null);if(retvalue!==undefined) module.exports = retvalue ;return module.exports;},'
	}
	return wapper(content).apply(self.exports, [self.exports, require, self, this.filename, IO.parent(this.filename), define, candebug ? content:""]);
};
Module.prototype.loadpaths = function(){
	var dir = IO.parent(this.filename);
	return [dir].concat(Module._pathes);
};
Module._exists = function(name, parent){
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
		var paths = parent ? parent.loadpaths() : Module._pathes, _len = paths.length;
		for(var i=0;i<_len;i++){
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
	return _file;
};
Module._load = function(name, parent, aspfile, callback){
	var _file = Module._exists(name, parent);
	if(!_file){
		ExceptionManager.put(new Exception(0xed34, "Module._load()", "Module '" + name + "' is not exists, required by " + (parent ? ("'" + parent.id + "'") : "ROOT") + "."));
	}else{
		var _parent=parent;
		while(_parent){
			if(_parent.filename==_file){
				ExceptionManager.put(new Exception(0xed35, "Module._load()", "Module '" + name + "' is required by self. forbidden!"));
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
Module._use = function(){Array.prototype.push.apply(Module._pathes, arguments);};
Module.ROOT=ROOT;
Module._cache = {};
Module._pathes=[];
Module.mode="normal";
Module.result="";
function require(name, arg1, arg2){
	if(typeof arg1== "function"){
		arg2 = arg1;
		arg1=false;
	};
	return Module._load(name, null, !!arg1, arg2);
};
require.use = Module._use;
require.module = Module;
require.get_result = function(){
	var result = Module.result;
	if(result){
		result = result.substr(0,result.length-1);
		return "module.exports = (function(){var _require = function(name){ return _exports[name];};var _exports = {" + result + "};return function(name){ return _require(name)();};})();";
	}
	return "";
};
require.exists = Module._exists;
module.exports = require;