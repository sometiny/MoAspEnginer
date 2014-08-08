<script language="jscript" runat="server">
var exports = ["ExceptionManager","Exception"];
/****************************************************
'@DESCRIPTION:	ExceptionManager
'****************************************************/
var ExceptionManager = {
	exceptions : [],
	put : function(exception_){
		if(arguments.length == 1){
			ExceptionManager.exceptions.push(exception_);
		}else if(arguments.length == 2){
			ExceptionManager.exceptions.push(new Exception(arguments[0].number & 0xffff,arguments[1],arguments[0].description));
		}else if(arguments.length == 3){
			ExceptionManager.exceptions.push(new Exception(arguments[0],arguments[1],arguments[2]));
		}
	},
	clear : function(){
		while(ExceptionManager.exceptions.length > 0)ExceptionManager.exceptions.pop();
	},
	debug : function(){
		var returnValue = "";
		for(var i = 0;i < ExceptionManager.exceptions.length;i++){
			var exception_ = ExceptionManager.exceptions[i];
			returnValue += F.format("[0x{0:X8}] {1} : {2}<br />",exception_.Number,exception_.Source,exception_.Description);
		}
		return returnValue;
	}
};
/****************************************************
'@DESCRIPTION:	Exception
'@PARAM:	number [Long] : exception Number
'@PARAM:	source [String] : exception Source
'@PARAM:	message [String] : exception message
'****************************************************/
function Exception(number,source,message){
	this.Number = number || 0;
	if(this.Number < 0)this.Number = Math.pow(2,32) + this.Number;
	this.Source = source || "";
	this.Message = message || "";
	this.Description = message || "";
}

/****************************************************
'@DESCRIPTION:	create a list object(like a recordset object)
'@PARAM:	ds [Object] : recordset object
'@PARAM:	pagesize [Int] : recordcount per page
'****************************************************/
exports.push("DataTable");
function DataTable(ds,pagesize){
	this.LIST__ = [];
	this.index = -1;
	this.pagesize = pagesize || -1;
	this.recordcount = 0;
	this.currentpage = 1;
	this.GetEnumerator = function(){
		return new Enumerator(this.LIST__);
	};
	if(ds==null)return;
	if(typeof ds=="object" && ds.constructor==Array){
		this.fromArray(ds,this.pagesize);		
	}else if(ds !== undefined)this.__AddDataSet__(ds,pagesize);
}

/****************************************************
'@DESCRIPTION:	dispose object,release related resources
'****************************************************/
DataTable.prototype.dispose = function(){
	while(this.LIST__.length > 0){
		F.dispose(this.LIST__.pop());
	}
};


/****************************************************
'@DESCRIPTION:	init the list from jscript array
'@PARAM:	obj [Array] : record array
'****************************************************/
DataTable.prototype.fromArray = function(obj,pagesize){
	this.LIST__ = obj;
	this.pagesize = pagesize || -1;
	this.recordcount = obj.length;
	return this;
};

/****************************************************
'@DESCRIPTION:	get list state.
'@PARAM:	dateformat [String] : datetime format string
'@RETURN:	[String] state string.this state woule be save to local file as model cache
'****************************************************/
DataTable.prototype.getState = function(dateformat){
	if(dateformat == undefined) dateformat = "yyyy-MM-dd HH:mm:ss";
	var returnValue = "{";
	returnValue += "\"pagesize\":" + this.pagesize +",";
	returnValue += "\"recordcount\":" + this.recordcount +",";
	returnValue += "\"currentpage\":" + this.currentpage +",";
	returnValue += "\"LIST__\":" + this.getjson(dateformat) +"}";
	return returnValue;
};

/****************************************************
'@DESCRIPTION:	init list object from state
'@PARAM:	ObjectState [Object(json)] : json object from saved state. the saved state would load from local model cache
'****************************************************/
DataTable.prototype.fromState = function(ObjectState){
	this.LIST__ = ObjectState.LIST__;
	this.pagesize = ObjectState.pagesize;
	this.recordcount = ObjectState.recordcount;
	this.currentpage = ObjectState.currentpage;
};
/****************************************************
'@DESCRIPTION:	add a new record
'@RETURN:	[Int] record index in the list
'****************************************************/
DataTable.prototype.add = function(item){
	if(typeof item=="string"){
		item = F.json(item);
		if(item==null)return;
	}
	this.LIST__.push(item || new Object());
	this.recordcount++;
	return this.LIST__[this.LIST__.length - 1];
};
/****************************************************
'@DESCRIPTION:	add dataset to list
'@PARAM:	rs [recordset] : recordset
'@PARAM:	pagesize [Int] : recordcount per page.if pagesize is -1 or blank,all the records will be add to list
'****************************************************/
DataTable.prototype.__AddDataSet__ = function(rs,pagesize){
	if(rs == null){ExceptionManager.put(new Exception(0,"DataTable.__AddDataSet__(rs,pagesize)","Recordset is null"));return;}
	if(rs.state == 0){ExceptionManager.put(new Exception(0,"DataTable.__AddDataSet__(rs,pagesize)","Recordset's state is 'closed'."));return;}
	try{
		if(pagesize == undefined)pagesize = -1;
		var ps = rs.AbsolutePosition;
		var k = 0;
		while(!rs.eof && (k < pagesize || pagesize == -1)){
			k++;
			var tmp__ = new Object();
			for(var i = 0;i < rs.fields.count;i++){
				tmp__[rs.fields(i).Name] = rs.fields(i).value;
			}
			this.LIST__.push(tmp__);
			rs.MoveNext();
		}
		try{
			rs.AbsolutePosition = ps;
		}catch(ex){}
	}catch(ex){
		ExceptionManager.put(new Exception(ex.number,"DataTable.__AddDataSet__(rs,pagesize)",ex.description));
	}
};
/****************************************************
'@DESCRIPTION:	remove enum index to start
'****************************************************/
DataTable.prototype.reset = function(){
	this.index = -1;
};
DataTable.prototype.count = function(){
	return this['LIST__'].length;
};
/****************************************************
'@DESCRIPTION:	if the enum is at end
'@RETURN:	[Boolean] if the enum is at end return true,or return false
'****************************************************/
DataTable.prototype.eof = function(){
	return this['LIST__'].length == 0 || this.index + 1 >= this['LIST__'].length;	
};

/****************************************************
'@DESCRIPTION:	Read the next record
'@PARAM:	name [String] : field name.
'@RETURN:	[Variant] if field name is blank,the method will return the record,or return field value.
'****************************************************/
DataTable.prototype.read = function(name){
	name = name ||"";
	this.index++;
	if(name == "" || name == undefined){
		return this['LIST__'][this.index];
	}else{
		return this['LIST__'][this.index].getter__(name);
	}
};
DataTable.prototype.each = function(callback){
	if(typeof callback == "string")callback = (function(format){return function(r){F.echo(F.format(format,r));};})(callback);
	if(typeof callback != "function")return;
	for(var i = 0;i < this['LIST__'].length;i++){
		callback.call(this,this['LIST__'][i]);
	}
}
/****************************************************
'@DESCRIPTION:	assign self to system. you can use loop tag in template to display this object.
'@PARAM:	name [String] : variable name
'@RETURN:	[Object(list)] self
'****************************************************/
DataTable.prototype.assign = function(name){
	Mo.assign(name,this);
	return this;
};

/****************************************************
'@DESCRIPTION:	get json data of self
'@PARAM:	dateformat [String] : datetime format string
'@RETURN:	[String] json string
'****************************************************/
DataTable.prototype.getjson = function(dateformat){
	var ret = "[";
	//dateformat = dateformat || "yyyy-MM-dd HH:mm:ss";
	while(!this.eof()){
		var D = this.read();	
		ret += "{"
		for(var i in D){
			if(!D.hasOwnProperty(i))continue;
			var val = D.getter__(i)
			var ty = typeof val;
			ret += "\"" + i + "\":";
			if(ty == "number"){
				ret += val + ",";
			}else if(ty == "date"){
				if(dateformat === undefined)ret += "\"" + (new Date(val)).getTime() + "\",";
				else ret += "\"" + F.formatdate(val,dateformat) + "\",";
			}else if(ty == "string"){
				ret += "\"" + F.jsEncode(val) + "\",";
			}else{
				if(!isNaN(val)){
					ret += val + ",";
				}else{
					ret += "\"" + val + "\",";
				}
			}
		}
		if(ret.substr(ret.length - 1,1) == ",")ret = ret.substr(0,ret.length - 1);
		ret += "},";
	}
	if(ret.substr(ret.length - 1,1) == ",")ret = ret.substr(0,ret.length - 1);
	ret += "]";
	return ret;
};

/****************************************************
'@DESCRIPTION:	create record object
'@PARAM:	args [arguments] : init data(arguments length = 2 * x). eg: var record = new DataTableRow("name","anlige","age",23);
'****************************************************/
exports.push("DataTableRow");
function DataTableRow(args){
	this.table = {};
	this.pk = "";
	if(args && args.length % 2 == 0){
		for(var i = 0;i < args.length - 1;i += 2){
			this.set(args[i],args[i + 1]);
		}
	}
}

/****************************************************
'@DESCRIPTION:	init data from post data
'@PARAM:	pk [String] : primary key of table
'@RETURN:	[Object] return self
'****************************************************/
DataTableRow.prototype.frompost = function(pk){
	pk = pk ||"";
	F.post();
	for(var i in F.post__){
		if(!F.post__.hasOwnProperty(i))continue;
		if(i.length > 2 && i.substr(i.length - 2) == ":i")continue;
		if(i.toLowerCase() != pk.toLowerCase()){
			this.set(i,F.post__[i]);
		}else{
			this.pk = F.post__[i];
		}
	}
	return this;
};

/****************************************************
'@DESCRIPTION:	set field value
'@PARAM:	name [String] : field name
'@PARAM:	value [Variant] : field value
'@PARAM:	type [Variant] : field type. it can be blank
'@RETURN:	[Object] return self
'****************************************************/
DataTableRow.prototype.set = function(name,value,type){
	type = type || "string";
	this.table[name] = {"value" : value,"type" : type}
	return this;
};

/****************************************************
'@DESCRIPTION:	get field value
'@PARAM:	name [String] : field name
'@RETURN:	[Variant] field value
'****************************************************/
DataTableRow.prototype.get = function(name){
	if(this.table[name] !== undefined)return this.table[name].value;
	return "";
};

/****************************************************
'@DESCRIPTION:	remove field
'@PARAM:	[names] [arguments] : field name. Eg: remove("name","age")
'@RETURN:	[Object] return self
'****************************************************/
DataTableRow.prototype.remove = function(){
	for(var i = 0;i < arguments.length;i++){
		delete this.table[arguments[i]];
	}
	return this;
};

/****************************************************
'@DESCRIPTION:	clear all fields
'@RETURN:	[Object] return self
'****************************************************/
DataTableRow.prototype.clear = function(){
	delete this.table;
	this.table = {};
	return this;
};

/****************************************************
'@DESCRIPTION:	assign record to system
'@PARAM:	name [String] : variable name
'@RETURN:	[Object] return self
'****************************************************/
DataTableRow.prototype.assign = function(name){
	var obj = {};
	for(var i in this.table){
		if(!this.table.hasOwnProperty(i))continue;
		obj[i]=	this.table[i].value;
	}
	Mo.assign(name,obj);
	return this;
};

exports.push("IAction");
function IAction(){
	Mo.assign("MO_METHOD",Mo.RealMethod);
	Mo.assign("MO_ACTION",Mo.RealAction);
}
IAction.extend = function(name,isPost,fn){
	if(name && typeof name=="object"){
		for(var n in name){
			if(!name.hasOwnProperty(n)) continue;
			if(typeof name[n]=="function") this.prototype[n] = name[n];
		}
		return;
	}
	if(typeof isPost=="function"){fn = isPost;isPost=false;}
	if(typeof fn!="function"){
		ExceptionManager.put("0x5cd","IAction.extend(...)","argument 'fn' must be a function.");
		return;
	}
	if(isPost===true)name=name+"_Post_";
	this.prototype[name] = fn;
};
IAction.extend("assign",function(key,value){Mo.assign(key,value);});
IAction.extend("display",function(tpl){Mo.display(tpl);});
IAction.extend("__destruct", function(){});
IAction.create = function(__construct,__destruct){
	var newAction = (function(fn){
		return function(){
			IAction.call(this);
			this.name = "Action" + Mo.RealMethod;
			this.__STATUS__=true;
			if(typeof fn=="function")this.__STATUS__ = fn.call(this)!==false;
		};
	})(__construct);
	newAction.extend = IAction.extend;
	newAction.prototype = new IAction();
	if(typeof __destruct=="function")newAction.prototype.__destruct = __destruct;
	return newAction;
};
/****************************************************
'@DESCRIPTION:	if the property is defined in the Object
'@PARAM:	key [String] : property name
'@RETURN:	[Boolean] if the property is defined return true,or return false
'****************************************************/
Object.prototype.isset__ = function(key){
	return this.hasOwnProperty(key);
};

/****************************************************
'@DESCRIPTION:	get the property value
'@PARAM:	key [String] : property name
'@RETURN:	[Variant] property value
'****************************************************/
Object.prototype.getter__ = function(key){
	if(key == undefined)key = "";
	return this.hasOwnProperty(key) ? this[key] : "";
};
/****************************************************
'@DESCRIPTION:	set the property value
'@PARAM:	key [String] : property name
'@PARAM:	value [Variant] : property value
'****************************************************/
Object.prototype.setter__ = function(key,value){
	this[key] = value;
}

/****************************************************
'@DESCRIPTION:	remove property
'@PARAM:	key [String] : property name
'****************************************************/
Object.prototype.removeer__ = function(key){
	delete this[key];
}

/****************************************************
'@DESCRIPTION:	remove property
'@PARAM:	key [String] : property name
'****************************************************/
Object.prototype.globalize__ = function(globalizedname){
	F.globalize(this,globalizedname);
}
String.prototype.toBase64String = function(){return F.base64.encode(this);};
String.prototype.fromBase64String = function(){return F.base64.decode(this);};
</script>