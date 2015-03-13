/*
** File: require.js
** Usage: a method to include nodejs file
** About: 
**		support@mae.im
*/
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
}
Module.prototype.require = function(name){
	return Module._load(name, this);
};
Module.prototype.compile = function(){
	var self = this;
	var require = function(name){
		return self.require(name);
	};
	return (new Function("exports","require","module","__filename","__dirname", IO.file.readAllText(this.filename))).apply(self.exports, [self.exports, require, self, this.filename, IO.parent(this.filename)]);
};
Module.prototype.loadpaths = function(){
	var dir = IO.parent(this.filename);
	return [dir].concat(Module._pathes);
};
Module._load = function(name,parent){
	var paths = parent ? parent.loadpaths() : Module._pathes, _file=null;
	for(var i=0;i<paths.length;i++){
		var filename = IO.build(paths[i],name);
		if(IO.file.exists(filename)){
			_file = filename;
			break;
		}
	}
	var _cache = Module._cache[_file];
	if(_cache) return _cache.exports;
	if(!_file){
		ExceptionManager.put(new Exception(0xed34, "Module._load", "module '" + name + "' is not exists."));
	}else{
		var module = new Module(null,parent);
		module.filename=_file;
		try{
			module.compile();
			Module._cache[module.filename] = module;
		}catch(ex){
			ExceptionManager.put(ex, "Module._load('" + name + "');");
		}
	}
	return module.exports;
};
Module._cache = {};
Module._pathes=[];
exports.module = Module;
return exports.require = function(name){
	return Module._load(name);
};