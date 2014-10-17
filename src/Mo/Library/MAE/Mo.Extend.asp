<script language="jscript" runat="server">
/*
** File: Mo.Extend.asp
** Usage: define some necessary class for MAE.
** Detail:
**		ExceptionManager, manage all the exception in MAE.
**		Exception, exception object.
**		DataTable, save datebase query records, and use it for 'loop' tag in template.
**		DataTableRow, create a record for databse, can be used in insert or update method;
**		IClass, use the interface to create a class quickly.
**		IController, user this interface to create a new controller.
** About: 
**		support@mae.im
*/
var exports = ["ExceptionManager","Exception"];

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

function Exception(number,source,message){
	this.Number = number || 0;
	if(this.Number < 0)this.Number = Math.pow(2,32) + this.Number;
	this.Source = source || "";
	this.Message = message || "";
	this.Description = message || "";
}

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

DataTable.prototype.dispose = function(){
	while(this.LIST__.length > 0){
		F.dispose(this.LIST__.pop());
	}
};

DataTable.prototype.fromArray = function(obj,pagesize){
	this.LIST__ = obj;
	this.pagesize = pagesize || -1;
	this.recordcount = obj.length;
	return this;
};

DataTable.prototype.getState = function(dateformat){
	if(dateformat == undefined) dateformat = "yyyy-MM-dd HH:mm:ss";
	var returnValue = "{";
	returnValue += "\"pagesize\":" + this.pagesize +",";
	returnValue += "\"recordcount\":" + this.recordcount +",";
	returnValue += "\"currentpage\":" + this.currentpage +",";
	returnValue += "\"LIST__\":" + this.getjson(dateformat) +"}";
	return returnValue;
};

DataTable.prototype.fromState = function(ObjectState){
	this.LIST__ = ObjectState.LIST__;
	this.pagesize = ObjectState.pagesize;
	this.recordcount = ObjectState.recordcount;
	this.currentpage = ObjectState.currentpage;
};

DataTable.prototype.add = function(item){
	if(typeof item=="string"){
		item = F.json(item);
		if(item==null)return;
	}
	if(typeof item=="object" && item.constructor == DataTableRow) item = item.data();
	this.LIST__.push(item || new Object());
	this.recordcount++;
	return this.LIST__[this.LIST__.length - 1];
};

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

DataTable.prototype.reset = function(){
	this.index = -1;
};
DataTable.prototype.count = function(){
	return this['LIST__'].length;
};

DataTable.prototype.eof = function(){
	return this['LIST__'].length == 0 || this.index + 1 >= this['LIST__'].length;	
};

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

DataTable.prototype.assign = function(name){
	Mo.assign(name,this);
	return this;
};

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

exports.push("DataTableRow");
function DataTableRow(args){
	this.table = {};
	this.pk = "";
	if(args && args.length && args.length % 2 == 0){
		for(var i = 0;i < args.length - 1;i += 2){
			this.set(args[i],args[i + 1]);
		}
	}else if(typeof args=="object"){
		this.fromObject(args);
		return;
	}
}

DataTableRow.prototype.fromPost = function(pk){
	return this.fromObject(F.post(),pk ||"");
};

DataTableRow.prototype.fromObject = function(src, pk){
	pk = pk ||"";
	for(var i in src){
		if(!src.hasOwnProperty(i))continue;
		if(i.length > 2 && i.substr(i.length - 2) == ":i")continue;
		if(i.toLowerCase() != pk.toLowerCase()){
			this.set(i,src[i]);
		}else{
			this.pk = src[i];
		}
	}
	return this;
};

DataTableRow.prototype.set = function(name,value,type){
	type = type || "string";
	this.table[name] = {"value" : value,"type" : type}
	return this;
};

DataTableRow.prototype.get = function(name){
	if(this.table[name] !== undefined)return this.table[name].value;
	return "";
};

DataTableRow.prototype.remove = function(){
	for(var i = 0;i < arguments.length;i++){
		delete this.table[arguments[i]];
	}
	return this;
};

DataTableRow.prototype.clear = function(){
	delete this.table;
	this.table = {};
	return this;
};

DataTableRow.prototype.assign = function(name){
	Mo.assign(name,this.data());
	return this;
};
DataTableRow.prototype.data = function(name){
	var obj = {};
	for(var i in this.table){
		if(!this.table.hasOwnProperty(i))continue;
		obj[i]=	this.table[i].value;
	}
	return obj;
};


exports.push("IAction","IController","IClass");

/*IClass*/
function IClass(){}
IClass.extend = function(name,fn,ia){
	ia=!!ia;
	var lowercase = (ia===true) && (Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY===false);
	if(name && typeof name=="object"){
		lowercase = fn===true && Mo.Config.Global.MO_ACTION_CASE_SENSITIVITY===false;
		for(var n in name){
			if(!name.hasOwnProperty(n)) continue;
			if(typeof name[n]=="function") this.prototype[(lowercase?n.toLowerCase():n)] = name[n];
		}
		return;
	}
	if(typeof fn!="function"){
		ExceptionManager.put("0x5ca","IClass.extend(...)","argument 'fn' must be a function.");
		return;
	}
	this.prototype[(lowercase?name.toLowerCase():name)] = fn;
};
IClass.extend("__destruct", function(){});
IClass.create = function(__construct,__destruct){
	var _this=this;
	var newClass = (function(fn){
		return function(){
			_this.call(this);
			this.__STATUS__=true;
			if(typeof fn=="function")this.__STATUS__ = fn.call(this)!==false;
		};
	})(__construct);
	newClass.extend = _this.extend;
	newClass.prototype = new _this();
	if(typeof __destruct=="function")newClass.prototype.__destruct = __destruct;
	return newClass;
};

/*IAction*/
function IAction(){
	IClass.call(this);
	Mo.assign("MO_METHOD",Mo.RealMethod);
	Mo.assign("MO_ACTION",Mo.RealAction);
}
IAction.prototype = new IClass();
IAction.extend = function(name,isPost,fn){
	if(name && typeof name=="object"){
		IClass.extend.call(this,name,true);
		return;
	}
	if(isPost===true){
		name += "_Post_";
	}else{
		fn = isPost;
	}
	IClass.extend.call(this,name,fn,true);
};
IAction.extend("assign",function(key,value){Mo.assign(key,value);});
IAction.extend("display",function(tpl){Mo.display(tpl);});
IAction.create = IClass.create;

/*IController*/
var IController = IAction;

Object.prototype.isset__ = function(key){
	return this.hasOwnProperty(key);
};

Object.prototype.getter__ = function(key){
	if(key == undefined)key = "";
	return this.hasOwnProperty(key) ? this[key] : "";
};

Object.prototype.setter__ = function(key,value){
	this[key] = value;
}

Object.prototype.removeer__ = function(key){
	delete this[key];
}

Object.prototype.globalize__ = function(globalizedname){
	F.globalize(this,globalizedname);
}
String.prototype.toBase64String = function(){return F.base64.encode(this);};
String.prototype.fromBase64String = function(){return F.base64.decode(this);};
</script>