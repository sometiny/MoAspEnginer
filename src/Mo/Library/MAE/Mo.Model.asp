<script language="jscript" runat="server">
/*
** File: Mo.Model.asp
** Usage: define datebase operate methods and classes.
** About: 
**		support@mae.im
*/
var exports = ["Model__","__Model__"];

function Model__(tablename,pk,dbConf,tablePrex){
	Model__.list.push(new __Model__(tablename,pk,dbConf,tablePrex));
	return Model__.list[Model__.list.length - 1];	
}
Model__.defaultDBConf = "DB";
Model__.defaultPK = "id";
Model__.list = [];
Model__.useCommandForUpdateOrInsert = false;
Model__.allowDebug = false;
Model__.debugs = [];
Model__.connections = {};
Model__.lastRows = -1;
Model__.setDefault = function(dbConf){
	Model__.defaultDBConf = dbConf || "DB";
};

Model__.setDefaultPK = function(pk){
	Model__.defaultPK = pk || "id";
};

Model__.begin = function(cfg){
	Model__.getConnection(cfg).BeginTrans();
	return true;
};

Model__.commit = function(cfg){
	Model__.getConnection(cfg).CommitTrans();
	return true;
};

Model__.rollback = function(cfg){
	Model__.getConnection(cfg).RollbackTrans();
	return true;
};

Model__.getConnection = function(cfg){
	cfg = cfg || Model__.defaultDBConf;
	if(Model__.connections[cfg] === undefined)return null;
	return Model__.connections[cfg].base;
};

Model__.dispose = function(){
	while(Model__.list.length > 0){
		var M = Model__.list.pop().dispose();
		M = null;
	}
	for(var cfg in Model__.connections){
		if(!Model__.connections.hasOwnProperty(cfg))continue;
		var M = Model__.connections[cfg];
		try{
			var fp = F.timer.run();
			M.base.close();
			if(Model__.allowDebug)Model__.debug.put("database(" + cfg +") disconnected.(time taken:" + F.timer.stop(fp) + "MS)");
		}catch(ex){
			Model__.debug.put("database(" + cfg +") disconnect failed:" + ex.message);
		}
		M.base = null;
		M = null;
	}
	delete Model__.connections;
	Model__.connections = {};
};

Model__.debug = function(){
	for(var i = 0;i < Model__.debugs.length;i++){
		F.echo(F.format("[0x{0:X8}] {1}<br />\r\n",i+1,Model__.debugs[i]));
	}
};
Model__.debug.put = function(log){
	Model__.debugs.push(log);
};

Model__.connect = function(cfg){
	var cfg_=null;
	var base = null;
	if(Model__.connections.hasOwnProperty(cfg)){
		base = Model__.connections[cfg].base;
		if(base.state == 1)return true;
		cfg_ = Model__.connections[cfg].cfg;
	}else{
		cfg_ = Mo.C(cfg);
		if(!cfg_)F.exit();
		base = F.activex.connection();
		Model__.connections[cfg]={
			name:cfg,
			cfg:cfg_,
			base:base,
			mysqlUsed:false,
			useCommandForUpdateOrInsert:Model__.useCommandForUpdateOrInsert,
			splitChars:["[","]"]
		};
		var connectionstring = ModelHelper.GetConnectionString.call(cfg_);
		if(connectionstring==""){
			Model__.debug.put("database(" + cfg +") connect failed:do not support '" + cfg_["DB_Type"] + "' database type.");
			Model__.debug();
			F.exit();
		}
		base.connectionstring=connectionstring;
	}
	try{
		F.timer.run();
		if(Model__.allowDebug)Model__.debug.put("connect to database(" + cfg +"):" + base.connectionString);
		base.open();
		if(Model__.allowDebug)Model__.debug.put("database(" + cfg +") connect successfully.(time taken:" + F.timer.stop() + "MS)");

		if(!(cfg_["DB_Type"] == "ACCESS" || cfg_["DB_Type"] == "MSSQL" || !Mo.Config.Global.MO_LOAD_VBSHELPER)){
			Model__.connections[cfg].useCommandForUpdateOrInsert = false;
		}
		if(cfg_["DB_Type"] == "MYSQL"){
			Model__.connections[cfg].splitChars = ["`","`"];
		}
		else if((cfg_["DB_Splitchars"] instanceof Array) && cfg_["DB_Splitchars"].length == 2){
			Model__.connections[cfg].splitChars = cfg_["DB_Splitchars"];
		}
		return true;
	}catch(ex){
		Model__.debug.put("database(" + cfg +") connect failed:" + ex.message);
		Model__.debug();
		F.exit();
	}
	return false;
};
Model__.execute = function(sql,cfg){
	cfg = cfg || Model__.defaultDBConf;
	if(!Model__.connect(cfg)) return -1;
	return Model__.RecordsAffected(Model__.getConnection(cfg),sql);
};
Model__.executeQuery = function(sql,cfg){
	cfg = cfg || Model__.defaultDBConf;
	if(!Model__.connect(cfg)) return;
	return new DataTable(Model__.getConnection(cfg).execute(sql));
};
Model__.RecordsAffected = function(conn,sqlstring){
	conn.execute(sqlstring);
	return -1;
};
Model__.RecordsAffectedCmd = function(cmd,withQuery){
	var RecordsAffectedvar = -1;
	if(withQuery){
		Model__.lastRows = RecordsAffectedvar;
		return cmd.execute();
	}else{
		cmd.execute();
		Model__.lastRows = RecordsAffectedvar;
	}
};
Model__.RecordsAffectedCmd_ = function(opt){
	return Model__.RecordsAffectedCmd(opt.cmd,opt.withQuery);
};

function __Model__(tablename,pk,cfg,tablePrex){
	cfg = cfg ||Model__.defaultDBConf;
	this.usecache = false;
	this.cachename = "";
	this.table = F.string.trim(tablename || "");
	this.strcname = "";
	if(this.table.indexOf(" ") > 0){
		this.strcname = this.table.substr(this.table.indexOf(" ")+1);
		this.table = this.table.substr(0,this.table.indexOf(" "));
	}
	this.joinlevel = "";
	this.fields = "*";
	this.strwhere = "";
	this.strgroupby = "";
	this.strorderby = "";
	this.pagekeyorder = "yes";
	this.stron = "";
	this.strjoin = "";
	this.strlimit = -1;
	this.strpage = 1;
	this.data = {};
	this.pk = pk || Model__.defaultPK;
	this.pagekey = this.pk;
	this.rc = 0;
	this.rs__ = null;
	this.object_cache = null;
	this.isonlypkorder = false;
	this.onlypkorder = "asc";
	this.ballowOnlyPKOrder = true;
	Model__.connect(cfg);
	this.base = Model__.connections[cfg];
	if(this.base.cfg["DB_Type"] == "MYSQL" && !this.base.mysqlUsed){
		this.query("USE " + this.base.cfg["DB_Name"]);
		this.base.mysqlUsed = true;
	}
	this.table = (tablePrex || (this.base.cfg["DB_TABLE_PERX"] || Mo.Config.Global.MO_TABLE_PERX))+this.table;
	this.tableWithNoSplitChar = this.table;
	if(this.base.useCommandForUpdateOrInsert){
		if(!this.base.cfg["DB_Schema"])this.base.cfg["DB_Schema"]={};
		if(!this.base.cfg["DB_Schema"][this.table]){
			this.base.cfg["DB_Schema"][this.table] = ModelHelper.GetColumns.call(this.base,this.table);
			Mo.C.Save(cfg,this.base.cfg);
		}
	}
	if(this.base.cfg["DB_Type"] == "MSSQL"){
		this.table = this.base.splitChars[0] + this.base.cfg["DB_Name"] +this.base.splitChars[1] + "." + this.base.splitChars[0] + (this.base.cfg["DB_Owner"] || "dbo") +this.base.splitChars[1] + "." + this.base.splitChars[0] + this.table+this.base.splitChars[1];
	}else{
		this.table = this.base.splitChars[0] + this.table+this.base.splitChars[1];
	}
}

__Model__.prototype.getConnection = function(){
	return this.base.base;
};

__Model__.prototype.allowOnlyPKOrder = function(allowOnlyPKOrder){
	this.ballowOnlyPKOrder = !(allowOnlyPKOrder === false);
	return this;
};

__Model__.prototype.cache = function(name){
	this.usecache = true;
	this.cachename = name || "";
	return this;
};

__Model__.prototype.field = function(){
	var _fields="";
	for(var i=0;i<arguments.length;i++){
		_fields += arguments[i] + ",";
	}
	if(_fields!="")_fields=_fields.substr(0,_fields.length-1);
	if(_fields=="")_fields="*";
	this.fields = _fields;
	return this;
};

__Model__.prototype.where = function(where){
	if(where == undefined)return this;
	if(arguments.length <= 0)return this;
	var strwhere = "("+arguments[0]+")",sp = "";
	for(var i = 1;i < arguments.length;i++){
		sp = arguments[i].substr(0,1);
		strwhere =	"(" + strwhere + (sp == "|"?" or ":" and ") + (sp == "|" ?  arguments[i].substr(1):arguments[i]) +")";
	}
	strwhere = strwhere.substr(1);
	strwhere = strwhere.substr(0,strwhere.length - 1);
	this.strwhere = strwhere;
	return this;
};

__Model__.prototype.orderby = function(orderby){
	if(typeof orderby == "object"){
		this.strorderby = "";
		var _this = this;
		F.foreach(orderby,function(k,v){
			_this.strorderby += _this.base.splitChars[0] + k + _this.base.splitChars[1]+" " + v+",";
		});
		this.strorderby = F.string.trim(this.strorderby,",");
	} else this.strorderby = F.string.trim(orderby || "");
	if(this.strorderby != "" && this.strorderby.indexOf(",") < 0){
		if(this.strorderby.indexOf(" ") < 0)this.strorderby = this.strorderby +" ASC";
		if(F.string.startWith(this.strorderby.toLowerCase(),this.pk.toLowerCase()) 
		|| F.string.startWith(this.strorderby.toLowerCase(),this.strcname.toLowerCase()+"."+this.pk.toLowerCase())
		|| F.string.startWith(this.strorderby.toLowerCase(),this.table.toLowerCase()+"."+this.pk.toLowerCase())){
			this.isonlypkorder = true;
			this.onlypkorder = F.string.trim(this.strorderby.substr(this.strorderby.indexOf(" ")+1));
		}
	}
	return this;
};

__Model__.prototype.groupby = function(groupby){
	this.strgroupby = groupby || "";
	return this;
};

__Model__.prototype.limit = function(page,limit,pagekey,pagekeyorder){
	this.strlimit = limit || - 1;
	this.strpage = page || 1;
	this.strpage = parseInt(this.strpage);
	this.strlimit = parseInt(this.strlimit);
	if(this.strpage <= 0)this.strpage = 1;
	if(this.strlimit <= 0)this.strlimit = -1;
	if(pagekeyorder != undefined)this.pagekeyorder = pagekey;
	if(pagekey != undefined)this.pagekey = pagekey;
	return this;
};

__Model__.prototype.max = function(filed){
	var k = filed || this.pk;
	k = this.base.splitChars[0] + k + this.base.splitChars[1];
	if(this.base.cfg["DB_Type"] == "MSSQL"){
		return this.query("select isnull(max(" + k + "),0) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
	}else if(this.base.cfg["DB_Type"] == "MYSQL" || this.base.cfg["DB_Type"] == "SQLITE"){
		return this.query("select IFNULL(max(" + k + "),0) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
	}
	return this.query("select iif(isnull(max(" + k + ")),0,max(" + k + ")) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
};

__Model__.prototype.min = function(filed){
	var k = filed || this.pk;
	k = this.base.splitChars[0] + k + this.base.splitChars[1];
	if(this.base.cfg["DB_Type"] == "MSSQL"){
		return this.query("select isnull(min(" + k + "),0) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
	}else if(this.base.cfg["DB_Type"] == "MYSQL" || this.base.cfg["DB_Type"] == "SQLITE"){
		return this.query("select IFNULL(min(" + k + "),0) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
	}
	return this.query("select iif(isnull(min(" + k + ")),0,min(" + k + ")) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
};

__Model__.prototype.count = function(filed){
	var k = filed || this.pk;
	if(k != "*")k = this.base.splitChars[0] + k + this.base.splitChars[1];
	return this.query("select count(" + k + ") from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
};

__Model__.prototype.sum = function(filed){
	var k = filed || this.pk;
	k = this.base.splitChars[0] + k + this.base.splitChars[1];
	if(this.base.cfg["DB_Type"] == "MSSQL"){
		return this.query("select isnull(sum(" + k + "),0) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
	}else if(this.base.cfg["DB_Type"] == "MYSQL" || this.base.cfg["DB_Type"] == "SQLITE"){
		return this.query("select IFNULL(sum(" + k + "),0) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
	}
	return this.query("select iif(isnull(sum(" + k + ")),0,sum(" + k + ")) from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
};

__Model__.prototype.increase = function(name,n){
	name = this.base.splitChars[0] + name + this.base.splitChars[1];
	n = n || 1;
	n = parseInt(n)
	this.query("update " + this.table + " set " + name + " = " + name + " + (" + n + ")" + (this.strwhere != ""?(" where " + this.strwhere):""));
	return this;
};

__Model__.prototype.toogle = function(name,n){
	name = this.base.splitChars[0] + name + this.base.splitChars[1];
	n = n || 1;
	n = parseInt(n)
	this.query("update " + this.table + " set " + name + " = " + n + " - " + name + " " + (this.strwhere != ""?(" where " + this.strwhere):""));
	return this;
};

__Model__.prototype.join = function(table,jointype){
	jointype = jointype ||"inner";
	jointype = jointype.replace(" join","");
	if(table.indexOf(" ") > 0){
		this.strjoin += " " + jointype + " join " + this.base.splitChars[0] + Mo.Config.Global.MO_TABLE_PERX + table.substr(0,table.indexOf(" ")) + this.base.splitChars[1] +" "+table.substr(table.indexOf(" ")+1);
	}else{
		this.strjoin += " " + jointype + " join "  + this.base.splitChars[0] + Mo.Config.Global.MO_TABLE_PERX + table + this.base.splitChars[1];
	}
	this.joinlevel += "(";
	return this;
};

__Model__.prototype.on = function(str){
	str = str || "";
	this.strjoin += " on " + str +")";
	this.strjoin = F.string.trim(this.strjoin);
	return this;
};

__Model__.prototype.cname = function(str){
	str = str || "";
	this.strcname = str;
	return this;
};
__Model__.prototype.createCommandManager = function(cmd,ct){
	return new ModelCMDManager(cmd,this,ct);
};
__Model__.prototype.exec = function(manager){
	try{
		var fp = F.timer.run() - 0;
		if(Model__.allowDebug)Model__.debug.put(manager.cmd+",[#" + fp + "]");
		if(manager.withQuery){
			this.rs__ = manager.exec();
			this.fetch();
			if(manager.totalRecordsParm != "")this.object_cache.recordcount = this.rc = (manager.getparm(manager.totalRecordsParm).value || 0);
		}else{
			manager.exec();
		}
		if(Model__.allowDebug)Model__.debug.put("query end.(time taken:" + F.timer.stop(fp) + "MS),[#" + fp + "]");
	}catch(ex){
		if(F.vbs.ctrl.error.number != 0){
			ExceptionManager.put(F.vbs.ctrl.error.number,"__Model__.exec(manager)",F.vbs.ctrl.error.description);
			F.vbs.ctrl.error.clear();
		}else{
			ExceptionManager.put(ex.number,"__Model__.exec(manager)",ex.message);
		}
	}
	return this;
}

__Model__.prototype.find = function(Id){
	if(!isNaN(Id))
	{
		return this.where(this.pk + " = " + Id).select().read();
	}
	else if(arguments.length>0)
	{
		return __Model__.prototype.where.apply(this,arguments).select().read();
	}
	return null;
};
__Model__.prototype.select = function(callback,enablePromise){
	if(F.exports.promise && (enablePromise===true || callback===true)){
		var p= new F.exports.promise();
		p.resolve(this.query().fetch());
		return p;
	}
	if(typeof callback == "function") return this.query().fetch().each(callback);
	return this.query().fetch();
};
__Model__.prototype.query = function(){
	var fp = 0;
	this.sql = "";
	this.countsql = "";
	this.dispose();
	if(arguments.length >= 1){
		try{
			if(arguments.length == 2 && arguments[1] === true){
				fp = F.timer.run() - 0;
				if(Model__.allowDebug)Model__.debug.put(arguments[0]+",[#" + fp + "]");
				var rs_ = this.getConnection().execute(arguments[0]);
				if(Model__.allowDebug)Model__.debug.put("query end(time taken:" + F.timer.stop(fp) + "MS),[#" + fp + "]");
				return rs_;
			}else if(arguments.length == 2 && (typeof arguments[1] == "string")){
				this.sql= arguments[0];
				this.countsql = arguments[1];
			}else{
				fp = F.timer.run() - 0;
				if(Model__.allowDebug)Model__.debug.put(arguments[0]+",[#" + fp + "]");
				Model__.lastRows = Model__.RecordsAffected(this.getConnection(),arguments[0]);
				if(Model__.allowDebug)Model__.debug.put("query end(time taken:" + F.timer.stop(fp) + "MS),[#" + fp + "]");
				return this;
			}
		}catch(ex){
			if(F.vbs.ctrl.error.number != 0){
				ExceptionManager.put(F.vbs.ctrl.error.number,"__Model__.query(args)",F.vbs.ctrl.error.description);
				F.vbs.ctrl.error.clear();
			}else{
				ExceptionManager.put(ex.number,"__Model__.query(args)",ex.message);
			}
			return this;
		}
	}
	if(this.sql == "")ModelHelper.GetSqls.apply(this,[]);
	if(Mo.Config.Global.MO_MODEL_CACHE && this.usecache){
		if(this.cachename == "")this.cachename = F.md5(this.sql);
		if(Mo.ModelCacheExists(this.cachename)){
			var ObjectState = F.json(Mo.ModelCacheLoad(this.cachename));
			if(ObjectState != null){
				this.object_cache = new DataTable();
				this.object_cache.fromState(ObjectState);
				return this;
			}
		}
	}
	try{
		if(this.countsql != ""){
			fp = F.timer.run() - 0;
			if(Model__.allowDebug)Model__.debug.put(this.countsql+",[#" + fp + "]");
			this.rc = this.getConnection().execute(this.countsql)(0).value;
			if(Model__.allowDebug)Model__.debug.put("query end(time taken:" + F.timer.stop(fp) + "MS),[#" + fp + "]");
		}
		fp = F.timer.run() - 0;
		if(Model__.allowDebug)Model__.debug.put(this.sql+",[#" + fp + "]");
		this.rs__ = new ActiveXObject("adodb.recordset");
		this.rs__.open(this.sql,this.getConnection(),1,1);
		if(Model__.allowDebug)Model__.debug.put("query end(time taken:" + F.timer.stop(fp) + "MS),[#" + fp + "]");
		if(this.countsql == "")this.rc = this.rs__.recordcount;
	}catch(ex){
		ExceptionManager.put(new Exception(ex.number,"__Model__.query(args)",ex.message));
	}
	return this;
};

__Model__.prototype.fetch = function(){
	if(this.object_cache != null){
		this.object_cache.reset();
		return this.object_cache;
	}
	if(this.strlimit != -1 && this.rc > 0){
		this.rs__.pagesize = this.strlimit;
		if(this.pagekeyorder == "")this.rs__.absolutepage = this.strpage;
	}
	this.object_cache = new DataTable(this.rs__,this.strlimit);
	try{this.rs__.close();}catch(ex){}
	this.rs__ = null;
	this.object_cache.pagesize = this.strlimit;
	this.object_cache.recordcount = this.rc;
	this.object_cache.currentpage = this.strpage;
	if(Mo.Config.Global.MO_MODEL_CACHE && this.usecache){
		if(!Mo.ModelCacheExists(this.cachename)){
			Mo.ModelCacheSave(this.cachename,this.object_cache.getState());
		}
	}
	return this.object_cache;
};

__Model__.prototype.read = function(name){
	var obj = this.fetch();
	if(!obj.eof()){
		if(name === undefined) return obj.read();
		return obj.read().getter__(name);
	}
	if(name === undefined) return {};
	return "";
};

__Model__.prototype.getjson = function(dateFormat){return this.fetch().getjson(dateFormat);};

__Model__.prototype.assign = function(name,asobject){
	if (asobject !== true)asobject = false;
	if(name && !asobject){
		Mo.assign(name,this.fetch());
	}else{
		var obj = this.fetch();
		if(!obj.eof()){
			var d_ = obj.read();
			if(asobject){
				Mo.assign(name,d_);
			}else{
				for(var i in d_){
					if(!d_.hasOwnProperty(i))continue;
					Mo.assign(i,d_[i]);	
				}
			}
		}
	}
	return this;
};

__Model__.prototype.Insert = __Model__.prototype.insert = function(){
	var data = null;
	if(arguments.length == 1){
		if((typeof arguments[0] == "object")){
			if(arguments[0].constructor == DataTableRow){
				data = arguments[0];
			}else{
				data = (new DataTableRow()).fromObject(arguments[0], this.pk);
			}
		}
	}
	if(arguments.length > 0 && arguments.length % 2 == 0) data = new DataTableRow(arguments);
	if(data == null) data = (new DataTableRow()).fromPost(this.pk);
	var d_ = this.parseData(data["table"]);
	if(d_[0] != "" && d_[1] != ""){
		if(d_[3] != null){
			d_[3].withQuery = false;
			d_[3].cmd = "insert into " + this.table + "(" + d_[0] + ") values(" + d_[1] + ")";
			this.exec(d_[3]);
			Model__.lastRows = d_[3].affectedRows;
		}else{
			this.query("insert into " + this.table + "(" + d_[0] + ") values(" + d_[1] + ")");
		}
	}
	return this;
};

__Model__.prototype.Update = __Model__.prototype.update = function(){
	var data = null;
	if(arguments.length == 1){
		if((typeof arguments[0] == "object")){
			if(arguments[0].constructor == DataTableRow){
				data = arguments[0];
			}else{
				data = (new DataTableRow()).fromObject(arguments[0], this.pk);
			}
		}else if((typeof arguments[0] == "string") && arguments[0] != ""){
			this.query("update " + this.table + " set " + arguments[0] + (this.strwhere != ""?(" where " + this.strwhere):""));
			return this;
		}
	}
	if(arguments.length > 0 && arguments.length % 2 == 0) data = new DataTableRow(arguments);
	if(data == null){
		data = (new DataTableRow()).fromPost(this.pk);
		if(this.strwhere == "" && data.pk != ""){
			this.strwhere = this.base.splitChars[0] +this.pk + this.base.splitChars[1] + " = " + data.pk;
		}
	}
	var d_ = this.parseData(data["table"]);
	if(d_[2] != ""){
		if(d_[3] != null){
			d_[3].withQuery = false;
			d_[3].cmd = "update " + this.table + " set " + d_[2] + (this.strwhere != ""?(" where " + this.strwhere):"");
			this.exec(d_[3]);
			Model__.lastRows = d_[3].affectedRows;1
		}else{
			this.query("update " + this.table + " set " + d_[2] + (this.strwhere != ""?(" where " + this.strwhere):""));
		}
	}
	return this;
};

__Model__.prototype.del = __Model__.prototype.Delete = function(force){
	force = force === true;
	if(this.strwhere == "" && !force)return this;
	this.query("delete from " + this.table +(this.strwhere != ""?(" where " + this.strwhere):""));
	return this;
};

__Model__.prototype.dispose = function(){
	if(this.rs__ != null){
		try{this.rs__.close();}catch(ex){}
		this.rs__ = null;
	}
	if(this.object_cache != null){
		this.object_cache.dispose();
		this.object_cache = null;
	}
	return this;
};

__Model__.prototype.parseData = function(table){
	var fields = [],values = [],update = [], schema = null, fieldsList = ((this.fields == "" || this.fields == "*") ? "" : ("," + this.fields + ","));
	var cmd = null;
	if(this.base.useCommandForUpdateOrInsert && this.base.cfg["DB_Schema"] && this.base.cfg["DB_Schema"][this.tableWithNoSplitChar]) 
	{
		cmd = this.createCommandManager("",ModelHelper.Enums.CommandType.TEXT);
		schema = this.base.cfg["DB_Schema"][this.tableWithNoSplitChar];
	}
	for(var i in table){
		if(!table.hasOwnProperty(i))continue;
		if(table[i]["value"] === undefined)continue;
		if(fieldsList!="" && fieldsList.indexOf("," + i + ",")<0) continue;
		fields.push(this.base.splitChars[0]+i+this.base.splitChars[1]);
		var v = table[i]["value"];
		if(cmd != null){
			values.push("?");
			update.push(this.base.splitChars[0]+i+this.base.splitChars[1] + "=?");
			var parm = cmd.addParm("@"+i,v);
			var tableschema = schema[i];
			parm.Type = tableschema["DATA_TYPE"];
			if(tableschema["NUMERIC_PRECISION"] != null)parm.Precision = tableschema["NUMERIC_PRECISION"];
			if(tableschema["CHARACTER_MAXIMUM_LENGTH"] != null)parm.Size = tableschema["CHARACTER_MAXIMUM_LENGTH"];
			if(tableschema["NUMERIC_SCALE"] != null)parm.Scale = tableschema["NUMERIC_SCALE"];
		}else{
			if(table[i]["type"] != "exp" && (typeof table[i]["value"] == "string")) v = ("'" + table[i]["value"].replace(/\'/igm,"''") + "'").replace(/\0/ig,"");
			if(v===null) v = "null";
			values.push(v);
			update.push(this.base.splitChars[0]+i+this.base.splitChars[1]+"=" + v);
		}
	}
	return [fields.join(","),values.join(","),update.join(","),cmd];
};
</script>
