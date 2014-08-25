/*
** File: json.maker.js
** Usage: a class to create json data.
** About: 
**		support@mae.im
*/
function $maker(t) {
	this.setDataType(t);
}
$maker.fn = $maker.prototype;
$maker.fn.setDataType = function(t) {
	this.table = {};
	this.datatype = t || "object";
	if (this.datatype == "array") this.table = [];
};
$maker.parsePath = function(path){
	if(/([^\w\.\[\]]+)/.test(path)){
		throw {"description":"path error"};
		return;
	}
	return path.replace(/\b([a-zA-Z]\w*)\b/igm,"[\"$1\"]").replace(/\./igm,"");
};
$maker.fn.push = function(path, value){
	(new Function("value","this.table"+$maker.parsePath(path)+"=value;")).apply(this,[value]);
};

$maker.fn.pushAsObject = function(path){
	(new Function("this.table"+$maker.parsePath(path)+"={};")).apply(this,[]);
};

$maker.fn.pushAsArray = function(path){
	(new Function("this.table"+$maker.parsePath(path)+"=[];")).apply(this,[]);
};

$maker.fn.putNew = function(key, t) {
	if (this.datatype == "array"){
		t = key;
		key=null;
	}
	return this.put(key, new $maker(t));
};

$maker.fn.putNewArray = function(key) {
	if (this.datatype == "array")key=null;
	return this.put(key, new $maker("array"));
};

$maker.fn.putRows = function(key, rs, pagesize) {
	if (this.datatype == "array"){
		pagesize = rs;
		rs = key;
		key=null;
	}
	return this.put(key, (new $maker()).fromrows(rs, pagesize));
};

$maker.fn.putDictionary = function(key, dir) {
	if (this.datatype == "array"){
		dir = key
		key=null;
	}
	return this.put(key, (new $maker()).fromdictionary(dir));
};

$maker.fn.putRequest = function(key, isFromGet) {
	if (this.datatype == "array"){
		isFromGet = key
		key=null;
	}
	return this.put(key, (new $maker()).fromrequest(isFromGet));
};

$maker.fn.putArrayList = function(key, value) {
	if (this.datatype == "array"){
		value = key
		key=null;
	}
	return this.put(key, value.split(","));
};

$maker.fn.put = function(key, value) {
	if (this.datatype == "object") {
		if (value === undefined) return this;
		if (typeof value == "date") value = new Date(value);
		if (value instanceof $maker) {
			this.table[key] = value.table;
			return value;
		}
		this.table[key] = value;
		return this;
	} else {
		if(key==null){
			return this.put(value);
		}
		else if (key instanceof $maker) {
			this.table.push(key.table);
			return key;
		} 
		if (typeof key == "date") value = new Date(key);
		this.table.push(key);
		return this;
	}
};

$maker.fn.fromRequest = function(isFromGet){
	isFromGet = isFromGet===true;
	this.setDataType("object");
	if(isFromGet) this.table=F.get();
	else this.table=F.post();
	return this;
}

$maker.fn.fromDictionary = function(value) {
	this.setDataType("object");
	var keys = (new VBArray(value.keys())).toArray();
	if (keys.length <= 0) return this;
	for (var i = 0; i < keys.length; i++) {
		this.put(keys[i], value.item(keys[i]));
	}
	return this;
};

$maker.fn.fromRows = function(rs, pagesize) {
	this.setDataType("array");
	if (pagesize == undefined) pagesize = -1;
	this.table = rs.LIST__;
	return this;
};

$maker.fn.toString = function(formatstring, key) {
	key = key || "";
	formatstring = formatstring || "";
	var ret = exports.json.parser.unParse(this.table, formatstring);
	if (key != "") return "{\"" + key + "\":" + ret + "}";
	return ret;
};
if(!exports.json)exports.json={};
if(!exports.json.parser) F.require("json.parser");
return exports.json.maker = $maker;