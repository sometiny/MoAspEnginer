/*
** File: Mo.Model.asp
** Usage: define datebase operate methods and classes.
** About: 
**		support@mae.im
*/

var Models = [],
	Connections = {},
	UseCommand = false,
	LogIndex = 0;
	PutDebug = function(log){
		ExceptionManager.put((++LogIndex) | 0xdb000000, "DBLOG", log, E_MODEL);
	},ALLOWDEBUG = false;


function Model__(tablename,pk,dbConf,tablePrex){
	Models.push(new __Model__(tablename,pk,dbConf,tablePrex));
	return Models[Models.length - 1];	
}
Model__.defaultDBConf = "DB";
Model__.defaultPK = "id";
Model__.allowDebug = false;
if(MEM.errorReporting() & E_MODEL) ALLOWDEBUG = true;
Model__.lastRows = -1;
Model__.useCommand = function(value){
	UseCommand = !!value;
};
Model__.cmd = function(cmd, type, cfg){
	return new _helper.CMDManager(cmd, Model__.getConnection(cfg), type, 1);
};
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
	if(Connections[cfg] === undefined)return null;
	return Connections[cfg].base;
};

Model__.dispose = function(){
	while(Models.length > 0){
		var M = Models.pop().dispose();
		M = null;
	}
	for(var cfg in Connections){
		if(!Connections.hasOwnProperty(cfg))continue;
		var M = Connections[cfg];
		try{
			ALLOWDEBUG && F.timer.run();
			if(M.base.state == 1)M.base.close();
			ALLOWDEBUG && PutDebug("database(" + cfg +") disconnected.[time taken:" + F.timer.stop() + "MS]");
		}catch(ex){
			MEM.put(ex.number, "Model__.dispose()", "database(" + cfg +") disconnect failed:" + ex.message);
		}
		M.base = null;
		M = null;
	}
	delete Connections;
	Connections = {};
};
Model__.Debug = function(allowDebug){
	ALLOWDEBUG = !!allowDebug;
};
Model__.connect = function(cfg){
	cfg = cfg || Model__.defaultDBConf;
	var cfg_=null,base = null, type;
	if(Connections.hasOwnProperty(cfg)){
		base = Connections[cfg].base;
		if(base.state == 1)return true;
		cfg_ = Connections[cfg].cfg;
	}else{
		cfg_ = Mo.Config.Global["MO_DATABASE_" + cfg];
		if(!cfg_){
			MEM.put(0xdb00e124, "Model__.connect(cfg)", "can not find database config(" + cfg +").check it?");
			return false;
		}
		type = cfg_["DB_Type"];
		if(!type){
			MEM.put(0xdb00e125, "Model__.connect(cfg)", "please define 'DB_Type' for database(" + cfg +").");
			return false;
		}
		base = F.activex.connection();
		var conn = Connections[cfg]={
			name:cfg,
			cfg:cfg_,
			base:base,
			mysqlUsed:false,
			useCommand:UseCommand,
			splitChars:["[","]"],
			driver : {}
		};
		if(type == "MYSQL"){
			Connections[cfg].splitChars = ["`","`"];
		}
		else if((cfg_["DB_Splitchars"] instanceof Array) && cfg_["DB_Splitchars"].length == 2){
			Connections[cfg].splitChars = cfg_["DB_Splitchars"];
		}
		if(type != "ACCESS"){
			var driver = require("./drivers/" + type + ".js");
			if(!driver){
				ALLOWDEBUG && PutDebug("database(" + cfg +") can not load driver '" + type + "'.");
				return false;
			}else{
				conn.driver = driver;
				if(driver.initialize) driver.initialize(_helper, conn);
			}
		}
		base.connectionstring = (conn.driver.GetConnectionString || _helper.Helper.GetConnectionString).call(cfg_);
	}
	try{
		ALLOWDEBUG && F.timer.run() && PutDebug("connecting database(" + cfg + ") ...");
		base.open();
		ALLOWDEBUG && PutDebug("database(" + cfg +") connect successfully.(time taken:" + F.timer.stop() + "MS)");
		return true;
	}catch(ex){
		MEM.put(ex.number, "Model__.connect(cfg)", "database(" + cfg +") connect failed:" + ex.message);
		return false;
	}
	return false;
};
Model__.execute = function(sql,cfg){
	cfg = cfg || Model__.defaultDBConf;
	if(!Model__.connect(cfg)) return -1;
	var fp = 0;
	ALLOWDEBUG && (fp = F.timer.run());
	try{
		var result = Model__.RecordsAffected(Model__.getConnection(cfg),sql);
		ALLOWDEBUG && PutDebug(sql + ",[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
		return result;
	}catch(ex){
		ALLOWDEBUG && PutDebug(sql + ",[UNFINISHED],[#" + fp + "]");
		_catchException("__Model__.execute(sql[,cfg])", ex);
	}
};
Model__.executeQuery = function(sql,cfg){
	cfg = cfg || Model__.defaultDBConf;
	if(!Model__.connect(cfg)) return;
	var fp = 0;
	ALLOWDEBUG && (fp = F.timer.run());
	try{
		var result = new DataTable(Model__.getConnection(cfg).execute(sql));
		ALLOWDEBUG && PutDebug(sql + ",[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
		return result;
	}catch(ex){
		ALLOWDEBUG && PutDebug(sql + ",[UNFINISHED],[#" + fp + "]");
		_catchException("__Model__.executeQuery(sql[,cfg])", ex);
	}
};
Model__.RecordsAffected = function(conn,sqlstring){
	conn.execute(sqlstring);
	return -1;
};
Model__.RecordsAffectedCmd = function(opt){
	opt.dataset = opt.cmdobj.execute();
	opt.affectedRows = -1;
};
if (VBS && Mo.Config.Global.MO_LOAD_VBSHELPER) {
    VBS.execute(
	    "function RecordsAffected(byref conn,byval sqlstring)\r\n" +
	    "	conn.execute sqlstring,RecordsAffected\r\n" +
	    "end function\r\n" +
    	"function RecordsAffectedCmd(byref opt)\r\n" +
    	"	dim RecordsAffectedvar\r\n" +
    	"	set opt.dataset = opt.cmdobj.execute(RecordsAffectedvar)\r\n" +
    	"	opt.affectedRows = RecordsAffectedvar\r\n" +
    	"	set RecordsAffectedCmd = opt\r\n" +
    	"end function"
    );
	Model__.RecordsAffected = VBS.getref("RecordsAffected");
	Model__.RecordsAffectedCmd = VBS.getref("RecordsAffectedCmd");
}
function __Model__(tablename,pk,cfg,tablePrex){
	Model__.lastRows = -1;
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
	this.base = null;
	this.tableWithNoSplitChar = "";
	this.connection = null;
	if(!Model__.connect(cfg)) return;
	this.base = Connections[cfg];
	this.type = this.base.cfg["DB_Type"];
	this.tablePrex = Mo.Config.Global.MO_TABLE_PERX;
	if(typeof tablePrex == "string"){
		this.tablePrex = tablePrex;
	}else if(typeof this.base.cfg["DB_TABLE_PERX"] == "string") {
		this.tablePrex = this.base.cfg["DB_TABLE_PERX"];
	}
	this.table = this.tablePrex + this.table;
	this.tableWithNoSplitChar = this.table;
	if(this.base.useCommand && this.type != "OTHER"){
		var schemaname = "SCHMEA-" + cfg, cf = null;
		if(!this.base.cfg["DB_Schema"]){
			this.base.cfg["DB_Schema"] = {};
			cf = MCM(schemaname);
			if(cf.loaded) this.base.cfg["DB_Schema"] = cf.config;
		}
		if(!this.base.cfg["DB_Schema"][this.table]){
			this.base.cfg["DB_Schema"][this.table] = (this.base.driver.GetColumns || _helper.Helper.GetColumns).call(this.base,this.table);
			if(cf == null) cf = MCM(schemaname);
			cf.config[this.table] = this.base.cfg["DB_Schema"][this.table];
			cf.save();
		}
	}
	var sp1 = this.sp1 = this.base.splitChars[0];
	var sp2 = this.sp2 = this.base.splitChars[1];
	
	if(this.type == "MSSQL"){
		this.table = sp1 + this.base.cfg["DB_Name"] +sp2 + "." + sp1 + (this.base.cfg["DB_Owner"] || "dbo") +sp2 + "." + sp1 + this.table + sp2;
	}else{
		this.table = sp1 + this.table+sp2;
	}
	this.connection = this.base.base;
	this.parms = [];
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
	var _fields="", _len = arguments.length;
	for(var i=0;i<_len;i++){
		_fields += arguments[i] + ",";
	}
	if(_fields!="")_fields=_fields.substr(0,_fields.length-1);
	if(_fields=="")_fields="*";
	this.fields = _fields;
	return this;
};

__Model__.prototype.where = function(where){
	if(where == undefined)return this;
	if(!isNaN(where)){
		this.strwhere = this.pk + " = " + where;
		return this;
	}
	var _len = arguments.length;
	if(_len <= 0)return this;
	var strwhere = "("+arguments[0]+")",sp = "";
	for(var i = 1;i < _len;i++){
		sp = arguments[i].substr(0,1);
		strwhere =	"(" + strwhere + (sp == "|"?" or ":" and ") + (sp == "|" ?  arguments[i].substr(1):arguments[i]) +")";
	}
	strwhere = strwhere.substr(1);
	strwhere = strwhere.substr(0,strwhere.length - 1);
	this.strwhere = strwhere;
	return this;
};

__Model__.prototype.iwhere = function(){
	if(arguments.length == 0)return this;
	var args = Array.prototype.slice.call(arguments),  where = args.shift();
	var index=where.indexOf("?"),count=0;
	while(index>=0){
		where = where.substr(0,index) + ("{" + (count++) + "}") + where.substr(index+1);
		index = where.indexOf("?");
	}
	this.strwhere = where;
	this.parms = [];
	var _len = args.length, arg, type, parm;
	if(_len != count){
		MEM.put(new Exception(0xdb00e123,"__Model__.iwhere(where[,arg1,...,argn])","arguments can not match 'where clause'"));
		return this;
	}
	this.parameters.apply(this, args);
	return this;
};
__Model__.prototype.parameters = function(){
	var _len = arguments.length, arg, type, parm;
	for(var i=0;i<_len;i++){
		arg = arguments[i];
		type = typeof arg;
		if(type == "number") {
			parm = {'type' : DBTYPE_I4, 'value' : arg, 'subtype' : 'number'};
			this.parms.push(parm);
			if(Math.floor(arg) != arg){
				parm['type'] = DBTYPE_R4;
			}
		}
		else if(type == "string") this.parms.push({'type' : VARCHAR, 'value' : arg, 'size' : 50, 'subtype' : 'string'});
		else if(type == "object"){ this.parms.push(arg); arg.subtype = typeof arg.value; };
	}
	return this;
};
__Model__.prototype.orderby = function(orderby){
	if(typeof orderby == "object"){
		this.strorderby = "";
		for(var k in orderby){
			if(!orderby.hasOwnProperty(k)) continue;
			this.strorderby += this.sp1 + k + this.sp2+" " + orderby[k] +",";
		}
		if(this.strorderby!="")this.strorderby = this.strorderby.substr(0,this.strorderby.length-1);
	} else this.strorderby = F.string.trim(orderby || "");
	if(this.strorderby != "" && this.strorderby.indexOf(",") < 0){
		if(this.strorderby.indexOf(" ") < 0)this.strorderby = this.strorderby +" ASC";
		var sbl = this.strorderby.toLowerCase(), pkl = this.pk.toLowerCase();
		if(F.string.startWith(sbl, pkl) 
		|| F.string.startWith(sbl, this.strcname.toLowerCase() + "." + pkl)
		|| F.string.startWith(sbl, this.table.toLowerCase() + "." + pkl)){
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
__Model__.prototype.set_pagekey = function(key){
	this.pagekey = key;
	return this;
};
__Model__.prototype.set_pagekey_order = function(){
	this.pagekeyorder = "";
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

__Model__.prototype.max = function(field){
	return _helper.Helper.Max.call(this, this.sp1 + (field || this.pk) + this.sp2);
};

__Model__.prototype.min = function(field){
	return _helper.Helper.Min.call(this, this.sp1 + (field || this.pk) + this.sp2);
};

__Model__.prototype.count = function(field){
	var k = field || this.pk;
	if(k != "*")k = this.sp1 + k + this.sp2;
	return this.query("select count(" + k + ") from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
};

__Model__.prototype.sum = function(field){
	return _helper.Helper.Sum.call(this, this.sp1 + (field || this.pk) + this.sp2);
};

__Model__.prototype.increase = function(name,n){
	name = this.sp1 + name + this.sp2;
	(n===undefined) && (n = 1);
	this.query("update " + this.table + " set " + name + " = " + name + " + (" + n + ")" + (this.strwhere != ""?(" where " + this.strwhere):""));
	return this;
};

__Model__.prototype.toogle = function(name,n){
	name = this.sp1 + name + this.sp2;
	(n===undefined) && (n = 1);
	this.query("update " + this.table + " set " + name + " = " + n + " - " + name + " " + (this.strwhere != ""?(" where " + this.strwhere):""));
	return this;
};

__Model__.prototype.join = function(table,jointype){
	var type = (jointype || "inner").replace(" join",""),
		indx = table.indexOf(" ");
	if(indx > 0){
		this.strjoin += " " + type + " join " + parse_table_name(table.substr(0, indx), this.tablePrex, this.sp1, this.sp2) +" "+table.substr(indx + 1);
	}else{
		this.strjoin += " " + type + " join "  + parse_table_name(table, this.tablePrex, this.sp1, this.sp2);
	}
	this.joinlevel += "(";
	return this;
};

__Model__.prototype.on = function(str){
	this.strjoin += " on (" + (str || "") +"))";
	return this;
};

__Model__.prototype.cname = function(str){
	this.strcname = str || "";
	return this;
};
__Model__.prototype.createCommandManager = function(cmd,ct){
	return new _helper.CMDManager(cmd,this,ct);
};
__Model__.prototype.exec = function(manager){
	var fp;
	try{
		ALLOWDEBUG && (fp = F.timer.run());
		if(manager.withQuery){
			this.rs__ = manager.exec();
			this.fetch();
			if(manager.totalRecordsParm != "")this.object_cache.recordcount = this.rc = (manager.getparm(manager.totalRecordsParm).value || 0);
		}else{
			manager.exec();
		}
		ALLOWDEBUG && PutDebug(manager.cmd + ",[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
	}catch(ex){
		ALLOWDEBUG && PutDebug(manager.cmd + ",[UNFINISHED],[#" + fp + "]");
		_catchException("__Model__.exec(manager)", ex);
	}
	return this;
}

__Model__.prototype.find = function(Id){
	if(!isNaN(Id))
	{
		return this.where(this.pk + " = " + Id).query().fetch_one();
	}
	else if(arguments.length>0)
	{
		return __Model__.prototype.where.apply(this,arguments).query().fetch_one();
	}
	return null;
};
__Model__.prototype.select = function(callback){
	if(typeof callback == "function") return this.query().fetch().each(callback);
	return this.query().fetch();
};
__Model__.prototype.query = function(){
	if(!this.base) return this;
	var fp = 0,
		has_parms = this.parms.length>0;
	this.sql = "";
	this.countsql = "";
	this.dispose();
	if(arguments.length >= 1){
		try{
			if(arguments.length == 2 && arguments[1] === true){
				ALLOWDEBUG && (fp = F.timer.run());
				var rs_ = this.connection.execute(arguments[0]);
				ALLOWDEBUG && PutDebug(arguments[0]+",[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
				return rs_;
			}else if(arguments.length == 2 && (typeof arguments[1] == "string")){
				this.sql= arguments[0];
				this.countsql = arguments[1];
			}else{
				ALLOWDEBUG && (fp = F.timer.run());
				if(has_parms){
					Model__.lastRows = _executeCommand.call(this, arguments[0]).affectedRows;
				}else{
					Model__.lastRows = Model__.RecordsAffected(this.connection, arguments[0]);
				}
				ALLOWDEBUG && PutDebug(arguments[0]+",[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
				return this;
			}
		}catch(ex){
			ALLOWDEBUG && PutDebug(arguments[0]+",[UNFINISHED],[#" + fp + "]");
			_catchException("__Model__.query(args0,...," + (arguments.length-1) + ")", ex);
			return this;
		}
	}
	if(this.sql == "") (this.base.driver.GetSqls || _helper.Helper.GetSqls).call(this);
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
	var logsql="";
	try{
		if(!has_parms){
			if(this.pagekeyorder == "") this.countsql = "";
		}
		if(this.strlimit == -1) this.countsql = "";
		if(this.countsql != ""){
			logsql = this.countsql;
			ALLOWDEBUG && (fp = F.timer.run());
			if(has_parms){
				this.rc = _executeCommand.call(this, this.countsql).dataset(0).value;
			}else{
				this.rc = _executeQueryWithReturn.call(this, this.countsql, 0);
			}
			ALLOWDEBUG && PutDebug(this.countsql+",[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
		}
		ALLOWDEBUG && (fp = F.timer.run());
		logsql = this.sql;
		if(has_parms){
			this.rs__ = _executeCommand.call(this, this.sql).dataset;
		}else{
			this.rs__ = _executeQuery.call(this, this.sql);
		}
		if(this.countsql == "")this.rc = this.rs__.recordcount;
		ALLOWDEBUG && PutDebug(this.sql+",[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
	}catch(ex){
		ALLOWDEBUG && PutDebug(logsql + ",[UNFINISHED],[#" + fp + "]");
		_catchException("__Model__.query()", ex);
	}
	return this;
};
__Model__.prototype.fetch_one = function(){
	var rs = this.rs__;
	if(!rs || (rs.eof && rs.bof)) {rs = null;return null;}
	var returnValue = {}, fields = rs.Fields, fields_len = fields.Count, field=null;
	for(var i=0;i<fields_len;i++){
		field = fields(i);
		returnValue[field.Name] = field.Value;
	}
	try{rs.close();}catch(ex){}finally{rs=null;this.rs__ = null;fields=null;field=null;}
	return returnValue;
};

__Model__.prototype.fetch = function(){
	var limit = this.strlimit;
	if(this.object_cache != null){
		this.object_cache.reset();
		return this.object_cache;
	}
	if(limit != -1 && this.rc > 0){
		this.rs__.pagesize = limit;
		if(this.pagekeyorder == ""){
			if(this.parms.length > 0){
				this.rs__.Move((this.strpage-1) * limit);
			}else{
				this.rs__.AbsolutePage = this.strpage;
			}
		}
	}
	this.object_cache = new DataTable(this.rs__,limit);
	try{this.rs__.close();}catch(ex){}
	this.rs__ = null;
	this.object_cache.pagesize = limit;
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
		return obj.read()[name];
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
	if(arguments.length > 0 && arguments.length % 2 == 0){
		data = DataTableRow.apply(null, arguments);
	}
	if(data == null) data = (new DataTableRow()).fromPost(this.pk);
	var d_ = _parseData.call(this, data["table"]);
	if(d_[0] != "" && d_[1] != "") this.query("insert into " + this.table + "(" + d_[0] + ") values(" + d_[1] + ")");
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
	if(arguments.length > 0 && arguments.length % 2 == 0){
		data = DataTableRow.apply(null, arguments);
	}
	if(data == null){
		data = (new DataTableRow()).fromPost(this.pk);
		if(this.strwhere == "" && data.pk != ""){
			this.strwhere = this.sp1 +this.pk + this.sp2 + " = " + data.pk;
		}
	}
	var d_ = _parseData.call(this, data["table"]);
	if(d_[2] != "")this.query("update " + this.table + " set " + d_[2] + (this.strwhere != ""?(" where " + this.strwhere):""));
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
function _executeCommand(sql){
	var cmdobj=F.activex("ADODB.Command"), parm, _len, prm, res, regexp = /\{(\d+)\}/ig, count=0;
	cmdobj.ActiveConnection = this.connection;
	cmdobj.CommandType = 1;
    cmdobj.Prepared = true;
    if(this.parms){
	    _len = this.parms.length;
	    while(res = regexp.exec(sql)){
		    parm = this.parms[parseInt(res[1])];
		    if(parm){
			    prm = cmdobj.CreateParameter("@parms" + (count++));
			    prm.Value = parm.value;
			    prm.Direction = 1;
			    prm.Type = parm.type;
			    if(parm.hasOwnProperty("size")) prm.Size = parm.size;
			    if(parm.hasOwnProperty("precision")) prm.Precision = parm.precision;
			    if(parm.hasOwnProperty("scale")) prm.NumericScale = parm.scale;
		    	cmdobj.Parameters.Append(prm);
		    }
	    }
	    sql = sql.replace(/\{(\d+)\}/ig, "?");
	}
	cmdobj.CommandText = sql;
    return Model__.RecordsAffectedCmd({cmdobj : cmdobj, affectedRows : -1, dataset : null});
};
function _executeQuery(sql){
	var cmdobj=F.activex("ADODB.Recordset");
	cmdobj.open(sql, this.connection, 1, 1);
	return cmdobj;
}
function _executeQueryWithReturn(sql,index){
	return this.connection.execute(sql)(index).value;
}
function _catchException(src, ex){
	if(VBS && VBS.ctrl.error.number != 0){
		MEM.put(VBS.ctrl.error.number, src, VBS.ctrl.error.description);
	}else{
		MEM.put(ex.number, src, ex.message);
	}	
}
function _parseData(table){
	var fields = [],values = [],update = [], schema = null, fieldsList = ((this.fields == "" || this.fields == "*") ? "" : ("," + this.fields + ",")), hasFieldsList = fieldsList!="", value;
	var name="", parms = this.parms, has_parms = parms.length>0, usecommand = this.base.useCommand, sp1 = this.sp1, sp2 = this.sp2, toString = Object.prototype.toString;
	if(has_parms) usecommand = true;
	if(usecommand && this.base.cfg["DB_Schema"] && this.base.cfg["DB_Schema"][this.tableWithNoSplitChar]) 
	{
		schema = this.base.cfg["DB_Schema"][this.tableWithNoSplitChar];
	}
	for(var i in table){
		if(!table.hasOwnProperty(i))continue;
		value = table[i]["value"];
		if(value === undefined)continue;
		if(hasFieldsList && fieldsList.indexOf("," + i + ",")<0) continue;
		fields.push(sp1 + i + sp2);
		if(value===null){
			values.push("null");
			update.push(sp1 + i + sp2 + " = null");
			continue;
		}
		if(schema){
			name = "{"+(parms.length)+"}";
			values.push(name);
			update.push(sp1 + i + sp2 + " = " + name);
			var tableschema = schema[i];
			var parm = {value : value, type : tableschema["DATA_TYPE"]};
			parms.push(parm);
			if(tableschema["NUMERIC_PRECISION"] >0)parm.precision = tableschema["NUMERIC_PRECISION"];
			if(typeof value == 'string' || tableschema["SIZE"]>0) parm.size = tableschema["SIZE"] || value.length;
			if(tableschema["NUMERIC_SCALE"] >0)parm.scale = tableschema["NUMERIC_SCALE"];
		}else{
			if(usecommand){
				name = "{"+parms.length+"}";
				values.push(name);
				update.push(sp1 + i + sp2 + " = " + name);
				parms.push(parseValAsPrm(value));
			}else{
				if(typeof value == "object") value = toString.call(value);
				if(typeof value == "string") value = ("'" + value.replace(/\'/igm,"''") + "'").replace(/\0/ig,"");
				values.push(value);
				update.push(sp1 + i + sp2 + " = " + value);
			}
		}
	}
	return [fields.join(","),values.join(","),update.join(",")];
};
function parseValAsPrm(arg){
	var type = typeof arg, parm = null;
	if(type == "number") {
		parm = {'type' : DBTYPE_I4, 'value' : arg, 'subtype' : 'number'};
		if(Math.floor(arg) != arg){
			parm['type'] = DBTYPE_R4;
		}
		return parm;
	}
	if(type == "string") return {'type' : VARCHAR, 'value' : arg, 'size' : arg.length, 'subtype' : 'string'};
	if(type == "object"){ arg.subtype = typeof arg.value; return arg;}
	return parm;
}
function parse_table_name(name, prex, sp1, sp2){
	if(name.indexOf(".")<0) return sp1 + prex + name + sp2;
	
	var names = name.split("."), table = names.pop(), len_ = names.length;
	for(var i=0;i<len_;i++){
		names[i] = sp1 + names[i] + sp2;
	}
	return names.join(".") + "." + sp1 + prex + table + sp2;
}

var _helper = function(){
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

	DataTable.prototype.getArray = function(){
		return this.LIST__;
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
			var ps = rs.AbsolutePosition, k = 0, fcount=0, fields, field_names=[];
			if(!rs.eof){
				fcount = rs.fields.Count;
				fields = rs.fields;
				for(var i=0;i<fcount;i++){
					field_names[i] = fields(i).Name;
				}
			}
			while(!rs.eof && (k < pagesize || pagesize == -1)){
				k++;
				var r = {};
				for(var i = 0;i < fcount;i++){
					r[field_names[i]] = fields(i).value;
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
		if(typeof callback != "function")return this;
		var  _list = this['LIST__'],_len = _list.length;
		for(var i = 0;i < _len;i++){
			if(callback.call(this,_list[i],i)===false) break;
		}
		return this;
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
	var Driver={};
	Driver.Enums = {};
	Driver.Enums.ParameterDirection = {INPUT:1,INPUTOUTPUT:3,OUTPUT:2,RETURNVALUE:4};
	var DataTypes = Driver.Enums.DataType = {
		ARRAY:0x2000,DBTYPE_I8:20,DBTYPE_BYTES:128,DBTYPE_BOOL:11,DBTYPE_BSTR:8,DBTYPE_HCHAPTER:136,DBTYPE_STR:129,DBTYPE_CY:6,DBTYPE_DATE:7,DBTYPE_DBDATE:133,
		DBTYPE_DBTIME:134,DBTYPE_DBTIMESTAMP:135,DBTYPE_DECIMAL:14,DBTYPE_R8:5,DBTYPE_EMPTY:0,DBTYPE_ERROR:10,DBTYPE_FILETIME:64,DBTYPE_GUID:72,DBTYPE_IDISPATCH:9,
		DBTYPE_I4:3,DBTYPE_IUNKNOWN:13,LONGVARBINARY:205,LONGVARCHAR:201,LONGVARWCHAR:203,DBTYPE_NUMERIC:131,DBTYPE_PROP_VARIANT:138,DBTYPE_R4:4,DBTYPE_I2:2,DBTYPE_I1:16,
		DBTYPE_UI8:21,DBTYPE_UI4:19,DBTYPE_UI2:18,DBTYPE_UI1:17,DBTYPE_UDT:132,VARBINARY:204,VARCHAR:200,DBTYPE_VARIANT:12,VARNUMERIC:139,VARWCHAR:202,DBTYPE_WSTR:130
	};
	Driver.Enums.CommandType = {UNSPECIFIED:-1,TEXT:1,TABLE:2,STOREDPROC:4,UNKNOWN:8,FILE:256,TABLEDIRECT:512};
	for(var n in DataTypes){
		if(!DataTypes.hasOwnProperty(n)) continue;
		eval(n + " = " + DataTypes[n]);
	}
	Driver.GetConnectionString = function(){
		return this["DB_Connectionstring"] || "provider=microsoft.jet.oledb.4.0; data source=" + F.mappath(this["DB_Path"]) + (this["DB_Password"] ? (";Persist Security Info=False;Jet OLEDB:Database Password=" + this["DB_Password"]) : "");
	};
	Driver.GetSqls = function(){
		var where_="",order_="",where2_="",groupby="",join="",on="",cname="";
		if(this.strwhere!=""){
			where_=" where " + this.strwhere + "";
			if(this.strpage>1 && this.strlimit!=-1)where2_=" and (" + this.strwhere + ")";
		}
		if(this.strgroupby!="") groupby=" group by " + this.strgroupby;
		if(this.strjoin!="")join=" " + this.strjoin + " ";
		if(this.strcname!="")cname = " " + this.strcname+" ";
		if (this.strorderby!="") order_=" order by " + this.strorderby;
		this.countsql = "select count(*) from " + this.joinlevel + this.table + cname + join + where_ + groupby;
		if(this.pagekeyorder=="" || this.strlimit==-1){
			this.sql="select " + this.fields + " from " + this.joinlevel + this.table + cname + join + where_ + groupby+ order_;
		}else{
			var sql, table = this.table, prex = (this.strcname==""?table:this.strcname);
			if(this.isonlypkorder && this.ballowOnlyPKOrder){
				if(this.strpage>1){
					var c="<",d="min";
					if(this.onlypkorder.toLowerCase()=="asc") {c=">";d="max";}
					where_ +=" " + (where_!=""?"and":"where") + " " + prex + "." + this.pagekey + c + " (select " + d + "(" + this.pagekey + ") from (select top " + this.strlimit * (this.strpage-1) + " " + prex + "." + this.pagekey + " from " +this.joinlevel + table + cname + join + where_ + groupby+ order_ +") as mo_p_tmp)";
				}
				this.sql="select top " + this.strlimit + " " + this.fields + " from " + this.joinlevel + table + cname + join + where_ + groupby+ order_;
			}else{
				if(this.strpage>1)where_ +=" " + (where_!=""?"and":"where") + " " + prex + "." + this.pagekey + " not in(select top " + this.strlimit * (this.strpage-1) + " " + prex + "." + this.pagekey + " from " +this.joinlevel + table + cname + join + where_ + groupby+ order_ +")"	;
				this.sql="select top " + this.strlimit + " " + this.fields + " from " + this.joinlevel + table + cname + join + where_ + groupby+ order_;		
			}
		}
	};
	Driver.GetColumns = function(tablename){
		return F.activex("ADOX.Catalog",function(connection){
			this.ActiveConnection = connection;
			var Table, Columns, Column, _c, Data = {};
			try{
				Table = this.Tables(tablename);
			}catch(ex){
				return {};
			}
			Columns = Table.Columns;
			for(var j=0; j<Columns.Count; j++){
				Column = Columns(j);
				_c = Data[Column.Name]={};
				_c['SIZE'] = Column.DefinedSize;
				_c['DATA_TYPE'] = Column.Type;
				_c['NUMERIC_PRECISION'] = Column.Precision;
				_c['NUMERIC_SCALE'] = Column.NumericScale;
			}
			return Data;
		}, this.base);
	};
	Driver.Max = function(k){
		return this.query("select max(" + k + ") from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value || 0;
	};
	Driver.Min = function(k){
		return this.query("select min(" + k + ") from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value || 0;	
	};
	Driver.Sum = function(k){
		return this.query("select sum(" + k + ") from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value || 0;	
	};
	function ModelCMDManager(cmd,model,ct, modeltype){
		if(modeltype!==1)modeltype=0;
		this.cmd = cmd ||"";
		this.model = model || null;
		this.parms_={};
		this.cmdobj=F.activex("ADODB.Command");
		if(modeltype==0){
			this.cmdobj.ActiveConnection=this.model.getConnection();
		}else{
			this.cmdobj.ActiveConnection=this.model;
		}
		this.cmdobj.CommandType=ct||4;
	    this.cmdobj.Prepared = true;
	    this.withQuery=true;
	    this.parmsGet=false;
	    this.totalRecordsParm="";
	    this.parms_count=0;
	    this.dataset = null;
	    this.affectedRows = -1;
	}
	ModelCMDManager.prototype.parms = function(){
		var _this = this;
		return {
			"int" : function(value){
				_this.add_parm_input_int(value);
				return this;
			},
			"varchar" : function(value){
				_this.add_parm_input_varchar(value);
				return this;
			},
			"bigint" : function(value){
				_this.add_parm_input_bigint(value)
				return this;
			},
			"input" : function(value, t, size){
				_this.add_parm_input(value, t, size);
				return this;
			},
			"output" : function(t,size,totalp){
				_this.add_parm_output(t,size,totalp);
				return this;
			},
			"ret" : function(t,size){
				if(t===undefined){
					return _this.getparm("@RETURN");
				}else{
					_this.add_parm_return();
					return this;
				}
			}
		};
	};
	ModelCMDManager.New = function(cmd,model,ct){return new ModelCMDManager(cmd,model,ct);};
	ModelCMDManager.prototype.addParm = function(name,value,direction){
		this.parms_[name] = this.cmdobj.CreateParameter(name);
		this.parms_[name].Value = value;
		this.parms_[name].Direction = direction||1;
		return this.parms_[name];
	};
	ModelCMDManager.prototype.addInput = function(name,value,t,size){
		this.parms_[name] = this.cmdobj.CreateParameter(name, t, Driver.Enums.ParameterDirection.INPUT, size, value);
		return this.parms_[name];
	};
	/*new method*/
	ModelCMDManager.prototype.add_parm_input = function(value,t,size){
		return this.addInput("@PARM" + ++this.parms_count,value,t,size);
	};

	ModelCMDManager.prototype.addInputInt = function(name,value){
		return this.addInput(name,value,Driver.Enums.DataType.DBTYPE_I4,4);
	};
	/*new method*/
	ModelCMDManager.prototype.add_parm_input_int = function(value){
		return this.addInputInt("@PARM" + ++this.parms_count,value);
	};

	ModelCMDManager.prototype.addInputBigInt = function(name,value){
		return this.addInput(name,value,Driver.Enums.DataType.DBTYPE_I8,8);
	};
	/*new method*/
	ModelCMDManager.prototype.add_parm_input_bigint = function(value){
		return this.addInputBigInt("@PARM" + ++this.parms_count,value);
	};

	ModelCMDManager.prototype.addInputVarchar = function(name,value,size){
		return this.addInput(name,value,Driver.Enums.DataType.VARCHAR,size||50);
	};
	/*new method*/
	ModelCMDManager.prototype.add_parm_input_varchar = function(value,size){
		return this.addInputVarchar("@PARM" + ++this.parms_count,value,size);
	};

	ModelCMDManager.prototype.addOutput = function(name,t,size){
		this.parms_[name] = this.cmdobj.CreateParameter(name, t, Driver.Enums.ParameterDirection.OUTPUT, size);
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
		this.parms_[name] = this.cmdobj.CreateParameter(name, t, Driver.Enums.ParameterDirection.RETURNVALUE, size);
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
		try{
			Model__.RecordsAffectedCmd(this);
		}catch(ex){
			if(VBS && VBS.ctrl.error.number != 0){
				ExceptionManager.put(VBS.ctrl.error.number,"ModelCMDManager.exec()",VBS.ctrl.error.description);
				VBS.ctrl.error.clear();
			}else{
				ExceptionManager.put(new Exception(ex.number,"ModelCMDManager.exec()",ex.message));
			}
		}
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
	return {
		Helper : Driver,
		CMDManager :ModelCMDManager,
		DataTable : DataTable,
		DataTableRow : DataTableRow
	}
}(), DataTable = _helper.DataTable, DataTableRow = _helper.DataTableRow;
Model__.helper = _helper;
Mo.on("dispose", Model__.dispose);
exports.Model__ = Model__;
exports.__Model__ = __Model__;