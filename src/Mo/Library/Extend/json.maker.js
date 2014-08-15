/*
** File: json.maker.js
** Usage: a class to create json data.
** About: 
**		support@mae.im
*/
/****************************************************
'@DESCRIPTION:	define $maker object
'@PARAM:	t [String] : json data type. two options: 'object' or 'array'
'****************************************************/
function $maker(t) {
	this.setDataType(t);
}
$maker.fn = $maker.prototype;
/****************************************************
'@DESCRIPTION:	set json data type.
'@PARAM:	t [String] : json data type. two options: 'object' or 'array'
'****************************************************/
$maker.fn.setDataType = function(t) {
	this.table = {};
	this.datatype = t || "object";
	if (this.datatype == "array") this.table = [];
};

/****************************************************
'@DESCRIPTION:	create an instance of $maker
'@PARAM:	t [String] : json data type. two options: 'object' or 'array'
'@PARAM:	df [String] : forget it
'@RETURN:	[Object] instance of $maker
'****************************************************/
$maker.New = function(t, df) {
	return new $maker(t);
};

$maker.ParsePath = function(path){
	if(/([^\w\.\[\]]+)/.test(path)){
		throw {"description":"path error"};
		return;
	}
	return path.replace(/\b([a-zA-Z]\w*)\b/igm,"[\"$1\"]").replace(/\./igm,"");
};
$maker.fn.push = function(path, value){
	(new Function("value","this.table"+$maker.ParsePath(path)+"=value;")).apply(this,[value]);
};

$maker.fn.pushAsObject = function(path){
	(new Function("this.table"+$maker.ParsePath(path)+"={};")).apply(this,[]);
};

$maker.fn.pushAsArray = function(path){
	(new Function("this.table"+$maker.ParsePath(path)+"=[];")).apply(this,[]);
};

$maker.fn.pushVBArray = function(path, value){
	(new Function("value","this.table"+$maker.ParsePath(path)+"=(new VBArray(value)).toArray();")).apply(this,[value]);
};

/****************************************************
'@DESCRIPTION:	put new $maker instance to current instance and return it;
'@PARAM:	key [String] : json data key.
'@PARAM:	t [String] : json data type or new $maker instance. two options: 'object' or 'array'
'@RETURN:	[Object] new instance of $maker
'****************************************************/
$maker.fn.putnew = function(key, t) {
	if (this.datatype == "array"){
		t = key;
		key=null;
	}
	return this.put(key, new $maker(t));
};

/****************************************************
'@DESCRIPTION:	put new array $maker instance to current instance and return it.
'@PARAM:	key [String] : json data key.
'@RETURN:	[Object] new instance of $maker
'****************************************************/
$maker.fn.putnewarray = function(key) {
	if (this.datatype == "array")key=null;
	return this.put(key, new $maker("array"));
};

/****************************************************
'@DESCRIPTION:	put recordset to current instance, and return new array instance with recordset data.
'@PARAM:	key [String] : json data key.
'@PARAM:	rs [Recordset] : dataset that you read from database
'@PARAM:	pagesize [Int] : records count per page
'@RETURN:	[Object] new array instance of $maker
'****************************************************/
$maker.fn.putrows = function(key, rs, pagesize) {
	if (this.datatype == "array"){
		pagesize = rs;
		rs = key;
		key=null;
	}
	return this.put(key, (new $maker()).fromrows(rs, pagesize));
};

/****************************************************
'@DESCRIPTION:	put dictionary data to current instance, and return new object instance with dictionary data.
'@PARAM:	key [String] : json data key.
'@PARAM:	dir [Object] : an 'Scripting.Dictionary' instance
'@RETURN:	[Object] new object instance of $maker
'****************************************************/
$maker.fn.putdictionary = function(key, dir) {
	if (this.datatype == "array"){
		dir = key
		key=null;
	}
	return this.put(key, (new $maker()).fromdictionary(dir));
};

/****************************************************
'@DESCRIPTION:	put request data to current instance, and return new object instance with request data.
'@PARAM:	key [String] : json data key.
'@PARAM:	isFromGet [Boolean] : if the value is true, data is from F.get, or data is from F.post;
'@RETURN:	[Object] new object instance of $maker
'****************************************************/
$maker.fn.putrequest = function(key, isFromGet) {
	if (this.datatype == "array"){
		isFromGet = key
		key=null;
	}
	return this.put(key, (new $maker()).fromrequest(isFromGet));
};

/****************************************************
'@DESCRIPTION:	put vbarray to current instance
'@PARAM:	key [String] : json data key.
'@PARAM:	value [VBArray] : vbarray
'@RETURN:	[Object] current or arguments instance of $maker
'****************************************************/
$maker.fn.putvbarray = function(key, value) {
	if (this.datatype == "array"){
		value = key
		key=null;
	}
	return this.put(key, (new VBArray(value)).toArray());
};

/****************************************************
'@DESCRIPTION:	put array list to current instance
'@PARAM:	key [String] : json data key.
'@PARAM:	value [String] : Arraylist string which is splited with ',';
'@RETURN:	[Object] current instance of $maker
'****************************************************/
$maker.fn.putarraylist = function(key, value) {
	if (this.datatype == "array"){
		value = key
		key=null;
	}
	return this.put(key, value.split(","));
};

/****************************************************
'@DESCRIPTION:	put value to current instance
'@PARAM:	key [String] : json data key.
'@PARAM:	value [Variant] : key value. i can be an instance of $maker.
'@RETURN:	[Object] current or arguments instance of $maker
'****************************************************/
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

/****************************************************
'@DESCRIPTION:	put request data to current instance
'@PARAM:	isFromGet [Boolean] : if the value is true, data is from F.get, or data is from F.post;
'@RETURN:	[Object] current instance of $maker
'****************************************************/
$maker.fn.fromrequest = function(isFromGet){
	isFromGet = isFromGet===true;
	this.setDataType("object");
	if(isFromGet) this.table=F.get__;
	else this.table=F.post__;
	return this;
}

/****************************************************
'@DESCRIPTION:	put dictionary data to current instance;
'@PARAM:	value [Object] : an 'Scripting.Dictionary' instance
'@RETURN:	[Object] current instance of $maker
'****************************************************/
$maker.fn.fromdictionary = function(value) {
	this.setDataType("object");
	var keys = (new VBArray(value.keys())).toArray();
	if (keys.length <= 0) return this;
	for (var i = 0; i < keys.length; i++) {
		this.put(keys[i], value.item(keys[i]));
	}
	return this;
};

/****************************************************
'@DESCRIPTION:	put recordset data to current instance;
'@PARAM:	rs [Recordset] : dataset that you read from database
'@PARAM:	pagesize [Int] : records count per page
'@RETURN:	[Object] current instance of $maker
'****************************************************/
$maker.fn.fromrows = function(rs, pagesize) {
	this.setDataType("array");
	if (pagesize == undefined) pagesize = -1;
	var ps = rs.Bookmark;
	var k = 0;
	while (!rs.eof && (k < pagesize || pagesize == -1)) {
		k++;
		var tmp__ = new Object();
		for (var i = 0; i < rs.fields.count; i++) {
			tmp__[rs.fields(i).Name] = rs.fields(i).value;
		}
		this.put(tmp__);
		rs.MoveNext();
	}
	try {
		rs.Bookmark = ps;
	} catch (ex) {}
	return this;
};

/****************************************************
'@DESCRIPTION:	get json string
'@PARAM:	formatstring [String] : such as '\t',' '
'@PARAM:	key [String[option]] : if key is not blank,i will append current json string to a new json object and return new json object string;
'@RETURN:	[String] json string
'****************************************************/
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