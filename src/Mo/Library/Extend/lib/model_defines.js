/*
** File: model_helper.js
** Usage: define helper methods and classes for datebase operate.
** About: 
**		support@mae.im
*/

function DataTable(ds,pagesize){
	if(this.constructor!==DataTable) return new DataTable(ds,pagesize);
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
		var ps = rs.AbsolutePosition, k = 0, fcount=0;
		if(!rs.eof) fcount = rs.fields.Count;
		while(!rs.eof && (k < pagesize || pagesize == -1)){
			k++;
			var r = {}, fields = rs.fields, field;
			for(var i = 0;i < fcount;i++){
				field = fields(i);
				r[field.Name] = field.value;
			}
			this.LIST__.push(r);
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
		return this['LIST__'][this.index][name];
	}
};
DataTable.prototype.each = function(callback){
	if(typeof callback == "string")callback = (function(format){return function(r){F.echo(F.format(format,r));};})(callback);
	if(typeof callback != "function")return;
	var  _list = this['LIST__'],_len = _list.length;
	for(var i = 0;i < _len;i++){
		callback.call(this,_list[i],i);
	}
}

DataTable.prototype.assign = function(name){
	Mo.assign(name,this);
	return this;
};

DataTable.prototype.getjson = function(dateformat, callback){
	var ret = "[",
		isFn = false,
		format = "";
	if(typeof dateformat=="function"){
		callback = dateformat;
		dateformat = undefined;
	}
	if(typeof dateformat=="object"){
		if(dateformat.hasOwnProperty("format")){
			format = dateformat["format"];
			if(typeof format=="object"){
				var formatstr="";
				for(var i in format){
					if(!format.hasOwnProperty(i))continue;
					formatstr+="\"" + i + "\":" + format[i]+",";
				}
				if(formatstr!="" && formatstr.substr(formatstr.length-1)==",") formatstr = formatstr.substr(0,formatstr.length-1);
				format = formatstr;
			}
		}
		callback = dateformat["callback"];
		dateformat = dateformat["dateformat"];
	}
	isFn = (typeof callback=="function");
	var ret = "[",
		isFn = (typeof callback=="function");
	while(!this.eof()){
		var D = this.read();	
		ret += "{"
		if(format!=""){
			ret += F.format(format,D);
		}else{
			for(var i in D){
				if(i=="ROWID_" || !D.hasOwnProperty(i))continue;
				if(isFn && callback.call(D,i)===false)continue;
				var val = D[i]
				var ty = typeof val;
				ret += "\"" + i + "\":";
				if(ty == "number"){
					ret += val + ",";
				}else if(ty == "date"){
					if(dateformat === undefined)ret += "\"" + (new Date(val)).getTime() + "\",";
					else ret += "\"" + F.formatdate(val,dateformat) + "\",";
				}else if(ty == "string"){
					ret += JSON.stringify(val) + ",";
				}else if(ty == "unknown"){
					ret += "\"unknown\",";
				}else{
					if(!isNaN(val)){
						ret += val + ",";
					}else{
						ret += "\"" + val + "\",";
					}
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
function DataTableRow(){
	if(this.constructor!==DataTableRow){
		return Function.Create(arguments.length).apply(DataTableRow, arguments);
	}
	this.table = {};
	this.pk = "";
	var args = arguments;
	if(args.length % 2 == 0){
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
var ModelHelper={
	Enums:{
		ParameterDirection:{
			INPUT:1,INPUTOUTPUT:3,OUTPUT:2,RETURNVALUE:4
		},
		DataType:{
			ARRAY:0x2000,DBTYPE_I8:20,DBTYPE_BYTES:128,DBTYPE_BOOL:11,DBTYPE_BSTR:8,DBTYPE_HCHAPTER:136,DBTYPE_STR:129,DBTYPE_CY:6,DBTYPE_DATE:7,DBTYPE_DBDATE:133,
			DBTYPE_DBTIME:134,DBTYPE_DBTIMESTAMP:135,DBTYPE_DECIMAL:14,DBTYPE_R8:5,DBTYPE_EMPTY:0,DBTYPE_ERROR:10,DBTYPE_FILETIME:64,DBTYPE_GUID:72,DBTYPE_IDISPATCH:9,
			DBTYPE_I4:3,DBTYPE_IUNKNOWN:13,LONGVARBINARY:205,LONGVARCHAR:201,LONGVARWCHAR:203,DBTYPE_NUMERIC:131,DBTYPE_PROP_VARIANT:138,DBTYPE_R4:4,DBTYPE_I2:2,DBTYPE_I1:16,
			DBTYPE_UI8:21,DBTYPE_UI4:19,DBTYPE_UI2:18,DBTYPE_UI1:17,DBTYPE_UDT:132,VARBINARY:204,VARCHAR:200,DBTYPE_VARIANT:12,VARNUMERIC:139,VARWCHAR:202,DBTYPE_WSTR:130
		},
		CommandType:{
			UNSPECIFIED:-1,TEXT:1,TABLE:2,STOREDPROC:4,UNKNOWN:8,FILE:256,TABLEDIRECT:512
		}
	},
	GetConnectionString:function(){
		var connectionstring = "";
		if(this["DB_Type"]=="OTHER" || (this.hasOwnProperty("DB_Connectionstring") && this["DB_Connectionstring"]!="")){
			connectionstring = F.format(this["DB_Connectionstring"],this["DB_Server"],this["DB_Username"],this["DB_Password"],this["DB_Name"],F.mappath(this["DB_Path"]));
		}else if(this["DB_Type"]=="ACCESS"){
			connectionstring = "provider=microsoft.jet.oledb.4.0; data source=" + F.mappath(this["DB_Path"]);
		}else if(this["DB_Type"]=="MSSQL"){
			connectionstring = F.format("provider=sqloledb.1;Persist Security Info=false;data source={0};User ID={1};pwd={2};Initial Catalog={3}",this["DB_Server"],this["DB_Username"],this["DB_Password"],this["DB_Name"]);
		}else if(this["DB_Type"]=="SQLITE"){
			connectionstring = "DRIVER={SQLite3 ODBC Driver};Database=" + F.mappath(this["DB_Path"]);
		}else if(this["DB_Type"]=="MYSQL"){
			var DB_Server = this["DB_Server"], DB_Host=DB_Server, DB_Port = 3306;
			if(DB_Host.indexOf(",")>0){
				DB_Host = DB_Server.substr(0,DB_Server.indexOf(","));
				DB_Port = DB_Server.substr(DB_Server.indexOf(",")+1);
			}
			connectionstring = F.format("DRIVER={mysql odbc " + (this["DB_Version"]||"3.51") + " driver};SERVER={0};PORT={4};USER={1};PASSWORD={2}",DB_Host,this["DB_Username"],this["DB_Password"],this["DB_Name"],DB_Port);
		}
		return connectionstring;
	},
	GetSqls:function(){
		var where_="",order_="",where2_="",groupby="",join="",on="",cname="";
		if(this.strwhere!=""){
			where_=" where " + this.strwhere + "";
			if(this.strpage>1 && this.strlimit!=-1)where2_=" and (" + this.strwhere + ")";
		}
		if(this.strgroupby!="") groupby=" group by " + this.strgroupby;
		if(this.strjoin!="")join=" " + this.strjoin + " ";
		if(this.strcname!="")cname = " " + this.strcname+" ";
		if (this.strorderby!="") order_=" order by " + this.strorderby;
		if(this.pagekeyorder=="" || this.strlimit==-1){
			this.sql="select " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_;
			if(this.base.cfg["DB_Type"]=="MYSQL")this.countsql = "select count(" + (this.strcname==""?this.table:this.strcname) + "." + this.pk + ") from " + this.joinlevel + this.table + cname + join + where_ + groupby;
		}else{
			this.countsql = "select count(" + (this.strcname==""?this.table:this.strcname) + "." + this.pk + ") from " + this.joinlevel + this.table + cname + join + where_ + groupby;
			this.sql = ModelHelper.GetSqlByTypes.apply(this,[cname,join,on,where_,groupby,order_]);
		}
	},
	GetSqlByTypes:function(cname,join,on,where_,groupby,order_){
		if(this.base.cfg.DB_Type=="MSSQL")return ModelHelper.GetSqlsForMSSQL.apply(this,arguments);
		if(this.base.cfg.DB_Type=="MYSQL")return ModelHelper.GetSqlsForMysql.apply(this,arguments);
		if(this.base.cfg.DB_Type=="SQLITE")return ModelHelper.GetSqlsForMysql.apply(this,arguments);
		return ModelHelper.GetSqlsForAccess.apply(this,arguments);
	},
	GetSqlsForAccess:function(cname,join,on,where_,groupby,order_){
		var sql;
		if(this.isonlypkorder && this.ballowOnlyPKOrder){
			if(this.strpage>1){
				var c="<",d="min";
				if(this.onlypkorder.toLowerCase()=="asc") {c=">";d="max";}
				where_ +=" " + (where_!=""?"and":"where") + " " + (this.strcname==""?this.table:this.strcname) + "." + this.pagekey + c + " (select " + d + "(" + this.pagekey + ") from (select top " + this.strlimit * (this.strpage-1) + " " + (this.strcname==""?this.table:this.strcname) + "." + this.pagekey + " from " +this.joinlevel + this.table + cname + join + where_ + groupby+ order_ +") as mo_p_tmp)";
			}
			sql="select top " + this.strlimit + " " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_;
		}else{
			if(this.strpage>1)where_ +=" " + (where_!=""?"and":"where") + " " + (this.strcname==""?this.table:this.strcname) + "." + this.pagekey + " not in(select top " + this.strlimit * (this.strpage-1) + " " + (this.strcname==""?this.table:this.strcname) + "." + this.pagekey + " from " +this.joinlevel + this.table + cname + join + where_ + groupby+ order_ +")"	;
			sql="select top " + this.strlimit + " " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_;		
		}
		return sql;
	},
	GetSqlsForMSSQL:function(cname,join,on,where_,groupby,order_){
		if(this.base.cfg.DB_Version==2012){
			return "select " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_ +" OFFSET " + (this.strlimit * (this.strpage-1) +1) + " ROWS FETCH NEXT " + this.strlimit + " ROWS ONLY";
		}
		else if(this.base.cfg.DB_Version>=2005){
			return "select * from (select " + this.fields + ",ROW_NUMBER() OVER (" + order_ + ") AS ROWID_ from " + this.joinlevel + this.table + cname + join + where_ + groupby +") AS tmp_table_1 where ROWID_ BETWEEN " + (this.strlimit * (this.strpage-1) +1) + " and " + (this.strlimit * this.strpage);
		}
		var sql;
		if(this.isonlypkorder && this.ballowOnlyPKOrder){
			if(this.strpage>1){
				var c="<",d="min";
				if(this.onlypkorder.toLowerCase()=="asc") {c=">";d="max";}
				where_ +=" " + (where_!=""?"and":"where") + " " + (this.strcname==""?this.table:this.strcname) + "." + this.pagekey + c + " (select " + d + "(" + this.pagekey + ") from (select top " + this.strlimit * (this.strpage-1) + " " + (this.strcname==""?this.table:this.strcname) + "." + this.pagekey + " from " +this.joinlevel + this.table + cname + join + where_ + groupby+ order_ +") as mo_p_tmp)";
			}
			sql="select top " + this.strlimit + " " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_;
		}else{
			if(this.strpage>1)where_ +=" " + (where_!=""?"and":"where") + " " + (this.strcname==""?this.table:this.strcname) + "." + this.pagekey + " not in(select top " + this.strlimit * (this.strpage-1) + " " + (this.strcname==""?this.table:this.strcname) + "." + this.pagekey + " from " +this.joinlevel + this.table + cname + join + where_ + groupby+ order_ +")"	;
			sql="select top " + this.strlimit + " " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_;		
		}
		return sql;
	},
	GetSqlsForMysql:function(cname,join,on,where_,groupby,order_){
		if(this.isonlypkorder && this.ballowOnlyPKOrder){
			if(this.strpage>1){
				var c="<=";
				if(this.onlypkorder.toLowerCase()=="asc") c=">=";
				sql="select " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + (where_!=""?" and ":" where ") + this.table +"." + this.pk + c
				+ "(select " + (this.strcname==""?this.table:this.strcname) +"." + this.pk + " from " + this.joinlevel + this.table + join + where_+ groupby+ order_ + " limit " + this.strlimit * (this.strpage-1) + ",1)"
				+ groupby+ order_ +" limit " + this.strlimit + "";
			}else{
				sql="select " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_ +" limit 0," + this.strlimit + "";
			}
		}else{
			sql="select " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_ +" limit " + this.strlimit * (this.strpage-1) + "," + this.strlimit + "";
		}
		return sql;
	},
	GetTables:function(){
		//http://support.microsoft.com/kb/186246/zh-cn
		var conn = this.base;
		var table_named_field_name="TABLE_NAME";
		var rs =null;
		if(this.cfg.DB_Type=="ACCESS") rs=conn.openSchema(20,VBS_eval("Array(Empty,Empty,Empty,\"Table\")"));
		if(this.cfg.DB_Type=="MSSQL") rs=conn.openSchema(20,VBS_eval("Array(\"" + this.cfg.DB_Name + "\",Empty,Empty,\"Table\")"));
		if(this.cfg.DB_Type=="SQLITE"){
			rs = conn.execute("select * from sqlite_master where type = 'table'");
			table_named_field_name = "name";
		}
		if(this.cfg.DB_Type=="MYSQL"){
			rs = conn.execute("show tables");
			table_named_field_name = "Tables_in_public";
		}
		if(rs==null)return null;
		var obj={},i=0;
		while(!rs.eof){
			var tablename = rs(table_named_field_name).Value;
			obj[tablename]=ModelHelper.GetColumns.call(this,tablename)
			rs.movenext();
		}
		return obj;
	},
	GetColumns:function(tablename){
		var conn = this.base;
		var rs =null;
		if(this.cfg.DB_Type=="ACCESS") rs = conn.openSchema(4,VBS_eval("Array(Empty,Empty,\"" + tablename + "\")"));
		if(this.cfg.DB_Type=="MSSQL") rs = conn.openSchema(4,VBS_eval("Array(\"" + this.cfg.DB_Name + "\",\"" + (this.cfg.DB_Owner||"dbo") + "\",\"" + tablename + "\")"));
		if(this.cfg.DB_Type=="SQLITE")rs = conn.execute("PRAGMA table_info(" + tablename + ")");
		if(this.cfg.DB_Type=="MYSQL")rs = conn.execute("show columns from `" + tablename + "`");
		if(rs==null)return null;
		var obj={},i=0;
		while(!rs.eof){
			if(this.cfg.DB_Type=="SQLITE"){
				obj[rs("name").Value]={
					"DATA_TYPE":rs.fields("type").Value,
					"IS_NULLABLE":rs.fields("notnull").Value==0,
					"IS_PK":rs.fields("pk").Value==1,
					"COLUMN_DEFAULT":rs.fields("dflt_value").Value
				};				
			}else if(this.cfg.DB_Type=="MYSQL"){
				obj[rs("Field").Value]={
					"DATA_TYPE":rs.fields("Type").Value,
					"IS_NULLABLE":rs.fields("Null").Value=="YES",
					"IS_PK":rs.fields("Key").Value=="PRI",
					"COLUMN_DEFAULT":rs.fields("Default").Value
				};				
			}else{
				var cname=rs("COLUMN_NAME").Value;
				obj[cname]={
					"DATA_TYPE":rs.fields("DATA_TYPE").Value,
					"COLUMN_FLAGS":rs.fields("COLUMN_FLAGS").Value,
					"IS_NULLABLE":rs.fields("IS_NULLABLE").Value,
					"COLUMN_DEFAULT":rs.fields("COLUMN_DEFAULT").Value,
					"NUMERIC_PRECISION":rs.fields("NUMERIC_PRECISION").Value,
					"NUMERIC_SCALE":rs.fields("NUMERIC_SCALE").Value,
					"CHARACTER_MAXIMUM_LENGTH":rs.fields("CHARACTER_MAXIMUM_LENGTH").Value
				};
				if(obj[cname].DATA_TYPE==130){
					if(obj[cname].COLUMN_FLAGS>>7 ==1){
						obj[cname].CHARACTER_MAXIMUM_LENGTH=1024000;
					}
				}
			}
			rs.movenext();
		}
		return obj;
	}
};
function ModelCMDManager(cmd,model,ct){
	this.cmd = cmd ||"";
	this.model = model || null;
	this.parms_={};
	this.cmdobj=F.activex("ADODB.Command");
	this.cmdobj.ActiveConnection=model.getConnection();
	this.cmdobj.CommandType=ct||4;
    this.cmdobj.Prepared = true;
    this.withQuery=true;
    this.parmsGet=false;
    this.totalRecordsParm="";
    this.parms_count=0;
    this.dataset = null;
    this.affectedRows = -1;
}
ModelCMDManager.New = function(cmd,model,ct){return new ModelCMDManager(cmd,model,ct);};
ModelCMDManager.prototype.addParm = function(name,value,direction){
	this.parms_[name] = this.cmdobj.CreateParameter(name);
	this.parms_[name].Value = value;
	this.parms_[name].Direction = direction||1;
	return this.parms_[name];
};
ModelCMDManager.prototype.addInput = function(name,value,t,size){
	this.parms_[name] = this.cmdobj.CreateParameter(name, t, ModelHelper.Enums.ParameterDirection.INPUT, size, value);
	return this.parms_[name];
};
/*new method*/
ModelCMDManager.prototype.add_parm_input = function(value,t,size){
	return this.addInput("@PARM" + ++this.parms_count,value,t,size);
};

ModelCMDManager.prototype.addInputInt = function(name,value){
	return this.addInput(name,value,ModelHelper.Enums.DataType.DBTYPE_I4,4);
};
/*new method*/
ModelCMDManager.prototype.add_parm_input_int = function(value){
	return this.addInputInt("@PARM" + ++this.parms_count,value);
};

ModelCMDManager.prototype.addInputBigInt = function(name,value){
	return this.addInput(name,value,ModelHelper.Enums.DataType.DBTYPE_I8,8);
};
/*new method*/
ModelCMDManager.prototype.add_parm_input_bigint = function(value){
	return this.addInputBigInt("@PARM" + ++this.parms_count,value);
};

ModelCMDManager.prototype.addInputVarchar = function(name,value,size){
	return this.addInput(name,value,ModelHelper.Enums.DataType.VARCHAR,size||50);
};
/*new method*/
ModelCMDManager.prototype.add_parm_input_varchar = function(value,size){
	return this.addInputVarchar("@PARM" + ++this.parms_count,value,size);
};

ModelCMDManager.prototype.addOutput = function(name,t,size){
	this.parms_[name] = this.cmdobj.CreateParameter(name, t, ModelHelper.Enums.ParameterDirection.OUTPUT, size);
	return this.parms_[name];
};
/*new method*/
ModelCMDManager.prototype.add_parm_output = function(t,size,totalp){
	var parm_name = "@PARM" + ++this.parms_count;
	if(size===true || totalp===true){
		if(size===true)size=undefined;
		this.totalRecordsParm = parm_name;
	}
	return this.addOutput(parm_name,t,size);
};

ModelCMDManager.prototype.addReturn = function(name,t,size){
	this.parms_[name] = this.cmdobj.CreateParameter(name, t, ModelHelper.Enums.ParameterDirection.RETURNVALUE, size);
	return this.parms_[name];
};
/*new method*/
ModelCMDManager.prototype.add_parm_return = function(t,size){
	return this.addReturn("@RETURN",t,size);
};

ModelCMDManager.prototype.getparm = function(name){
	if(!this.parmsGet){
		for(var i in this.parms_){
			if(!this.parms_.hasOwnProperty(i))continue;
			if(this.parms_[i].Direction>1){
				this.parms_[i].value = this.cmdobj(i).value;
			}
		}
		this.parmsGet=true;
	}
	if(typeof name=="number") name="@PARM" + name;
	if(!this.parms_.hasOwnProperty(name)) return null;
	return this.parms_[name];
}
/*new method*/
ModelCMDManager.prototype.get_parm_return = function(){
	return this.getparm("@RETURN");
};

ModelCMDManager.prototype.execute = function(withQuery){
	this.withQuery = withQuery===true;
	this.model.exec(this);
	return this.model;
};
ModelCMDManager.prototype.assign = function(name,asobject){
	return this.model.assign(name,asobject);
};
ModelCMDManager.prototype.exec = function(){
	this.cmdobj.CommandText = this.cmd;
	for(var i in this.parms_){
		if(!this.parms_.hasOwnProperty(i))continue;
		this.cmdobj.Parameters.Append(this.parms_[i]);
	}
	Model__.RecordsAffectedCmd_(this);
	return this.dataset;
};
ModelCMDManager.prototype.next = function(ps){
	if(this.dataset) {
		this.dataset = this.dataset.NextRecordset();
		if(this.dataset) return new DataTable(this.dataset,ps||-1);
	}
};
ModelCMDManager.prototype.fetch = function(ps){
	if(this.dataset) {
		var dt = new DataTable(this.dataset,ps||-1);
		try{this.dataset.close();}catch(ex){}
		return dt;
	}
};
exports.Helper = ModelHelper;
exports.CMDManager = ModelCMDManager;
exports.DataTable = DataTable;
exports.DataTableRow = DataTableRow;