/*'by anlige at www.9fn.net*/
/****************************************************
'@DESCRIPTION:	define MoLibJsonGenerater object
'@PARAM:	t [String] : json data type. two options: 'object' or 'array'
'****************************************************/
function MoLibJsonGenerater(t) {
	this.setDataType(t);
}
/****************************************************
'@DESCRIPTION:	set json data type.
'@PARAM:	t [String] : json data type. two options: 'object' or 'array'
'****************************************************/
MoLibJsonGenerater.prototype.setDataType = function(t) {
	this.table = {};
	this.datatype = t || "object";
	if (this.datatype == "array") this.table = [];
};

/****************************************************
'@DESCRIPTION:	create an instance of MoLibJsonGenerater
'@PARAM:	t [String] : json data type. two options: 'object' or 'array'
'@PARAM:	df [String] : forget it
'@RETURN:	[Object] instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.New = function(t, df) {
	return new MoLibJsonGenerater(t);
};

MoLibJsonGenerater.ParsePath = function(path){
	if(/([^\w\.\[\]]+)/.test(path)){
		throw {"description":"path error"};
		return;
	}
	return path.replace(/\b([a-zA-Z]\w*)\b/igm,"[\"$1\"]").replace(/\./igm,"");
};
MoLibJsonGenerater.prototype.push = function(path, value){
	(new Function("value","this.table"+MoLibJsonGenerater.ParsePath(path)+"=value;")).apply(this,[value]);
};

MoLibJsonGenerater.prototype.pushAsObject = function(path){
	(new Function("this.table"+MoLibJsonGenerater.ParsePath(path)+"={};")).apply(this,[]);
};

MoLibJsonGenerater.prototype.pushAsArray = function(path){
	(new Function("this.table"+MoLibJsonGenerater.ParsePath(path)+"=[];")).apply(this,[]);
};

MoLibJsonGenerater.prototype.pushVBArray = function(path, value){
	(new Function("value","this.table"+MoLibJsonGenerater.ParsePath(path)+"=(new VBArray(value)).toArray();")).apply(this,[value]);
};

/****************************************************
'@DESCRIPTION:	put new MoLibJsonGenerater instance to current instance and return it;
'@PARAM:	key [String] : json data key.
'@PARAM:	t [String] : json data type or new MoLibJsonGenerater instance. two options: 'object' or 'array'
'@RETURN:	[Object] new instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.putnew = function(key, t) {
	if (this.datatype == "array"){
		t = key;
		key=null;
	}
	return this.put(key, new MoLibJsonGenerater(t));
};

/****************************************************
'@DESCRIPTION:	put new array MoLibJsonGenerater instance to current instance and return it.
'@PARAM:	key [String] : json data key.
'@RETURN:	[Object] new instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.putnewarray = function(key) {
	if (this.datatype == "array")key=null;
	return this.put(key, new MoLibJsonGenerater("array"));
};

/****************************************************
'@DESCRIPTION:	put recordset to current instance, and return new array instance with recordset data.
'@PARAM:	key [String] : json data key.
'@PARAM:	rs [Recordset] : dataset that you read from database
'@PARAM:	pagesize [Int] : records count per page
'@RETURN:	[Object] new array instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.putrows = function(key, rs, pagesize) {
	if (this.datatype == "array"){
		pagesize = rs;
		rs = key;
		key=null;
	}
	return this.put(key, (new MoLibJsonGenerater()).fromrows(rs, pagesize));
};

/****************************************************
'@DESCRIPTION:	put dictionary data to current instance, and return new object instance with dictionary data.
'@PARAM:	key [String] : json data key.
'@PARAM:	dir [Object] : an 'Scripting.Dictionary' instance
'@RETURN:	[Object] new object instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.putdictionary = function(key, dir) {
	if (this.datatype == "array"){
		dir = key
		key=null;
	}
	return this.put(key, (new MoLibJsonGenerater()).fromdictionary(dir));
};

/****************************************************
'@DESCRIPTION:	put request data to current instance, and return new object instance with request data.
'@PARAM:	key [String] : json data key.
'@PARAM:	isFromGet [Boolean] : if the value is true, data is from F.get, or data is from F.post;
'@RETURN:	[Object] new object instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.putrequest = function(key, isFromGet) {
	if (this.datatype == "array"){
		isFromGet = key
		key=null;
	}
	return this.put(key, (new MoLibJsonGenerater()).fromrequest(isFromGet));
};

/****************************************************
'@DESCRIPTION:	put vbarray to current instance
'@PARAM:	key [String] : json data key.
'@PARAM:	value [VBArray] : vbarray
'@RETURN:	[Object] current or arguments instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.putvbarray = function(key, value) {
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
'@RETURN:	[Object] current instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.putarraylist = function(key, value) {
	if (this.datatype == "array"){
		value = key
		key=null;
	}
	return this.put(key, value.split(","));
};

/****************************************************
'@DESCRIPTION:	put value to current instance
'@PARAM:	key [String] : json data key.
'@PARAM:	value [Variant] : key value. i can be an instance of MoLibJsonGenerater.
'@RETURN:	[Object] current or arguments instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.put = function(key, value) {
	if (this.datatype == "object") {
		if (value === undefined) return this;
		if (typeof value == "date") value = new Date(value);
		if (value instanceof MoLibJsonGenerater) {
			this.table[key] = value.table;
			return value;
		}
		this.table[key] = value;
		return this;
	} else {
		if(key==null){
			return this.put(value);
		}
		else if (key instanceof MoLibJsonGenerater) {
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
'@RETURN:	[Object] current instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.fromrequest = function(isFromGet){
	isFromGet = isFromGet===true;
	this.setDataType("object");
	if(isFromGet) this.table=F.get__;
	else this.table=F.post__;
	return this;
}

/****************************************************
'@DESCRIPTION:	put dictionary data to current instance;
'@PARAM:	value [Object] : an 'Scripting.Dictionary' instance
'@RETURN:	[Object] current instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.fromdictionary = function(value) {
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
'@RETURN:	[Object] current instance of MoLibJsonGenerater
'****************************************************/
MoLibJsonGenerater.prototype.fromrows = function(rs, pagesize) {
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
MoLibJsonGenerater.prototype.toString = function(formatstring, key) {
	key = key || "";
	formatstring = formatstring || "";
	var ret = exports.json.parser.unParse(this.table, formatstring);
	if (key != "") return "{\"" + key + "\":" + ret + "}";
	return ret;
};
if(!exports.json)exports.json={};
if(!exports.json.json2) F.require("json.parser");
return exports.json.maker = MoLibJsonGenerater;