/*
** File: Mo.Model.asp
** Usage: define datebase operate methods and classes.
** About: 
**		support@mae.im
*/

var Debugs = [],
	Models = [],
	Connections = {},
	UseCommand = false,
	PutDebug = function(log){
		Debugs.push(log);
		return Debugs.length-1;
	},
	AppendDebug = function(log, to){
		if(Debugs.length<=0){
			Debugs.push(log);
		}else{
			if(to === undefined) to = Debugs.length-1;
			Debugs[to] = Debugs[to] + log;
		}
	},ALLOWDEBUG = false;

var _helper = require("model_defines.js");
var DataTable = _helper.DataTable;
var DataTableRow = _helper.DataTableRow;
function Model__(tablename,pk,dbConf,tablePrex){
	Models.push(new __Model__(tablename,pk,dbConf,tablePrex));
	return Models[Models.length - 1];	
}
Model__.helper = _helper;
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
			ALLOWDEBUG && PutDebug("database(" + cfg +") disconnect failed:" + ex.message);
		}
		M.base = null;
		M = null;
	}
	delete Connections;
	Connections = {};
};

Model__.debug = function(){
	for(var i = 0;i < Debugs.length;i++){
		ExceptionManager.put((i+1) | 0xdb000000, "DBLOG", Debugs[i], E_MODEL);
	}
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
			ALLOWDEBUG && PutDebug("can not find database config(" + cfg +").check it?");
			return false;
		}
		type = cfg_["DB_Type"];
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
		ALLOWDEBUG && PutDebug("database(" + cfg +") connect failed:" + ex.message);
		return false;
	}
	return false;
};
Model__.execute = function(sql,cfg){
	cfg = cfg || Model__.defaultDBConf;
	if(!Model__.connect(cfg)) return -1;
	try{
		return Model__.RecordsAffected(Model__.getConnection(cfg),sql);
	}catch(ex){
		_catchException("__Model__.execute(sql[,cfg])", ex);
	}
};
Model__.executeQuery = function(sql,cfg){
	cfg = cfg || Model__.defaultDBConf;
	if(!Model__.connect(cfg)) return;
	try{
		return new DataTable(Model__.getConnection(cfg).execute(sql));
	}catch(ex){
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
	this.tablePrex = (tablePrex || (this.base.cfg["DB_TABLE_PERX"] || Mo.Config.Global.MO_TABLE_PERX));
	this.table = this.tablePrex + this.table;
	this.tableWithNoSplitChar = this.table;
	if(this.base.useCommand && this.type != "OTHER"){
		var schema = {}, schemaname = "SCHMEA-" + cfg;
		if(!this.base.cfg["DB_Schema"]){
			if(Mo.C.Exists(schemaname)) schema = Mo.C(schemaname);
			this.base.cfg["DB_Schema"]=schema;
		}
		if(!this.base.cfg["DB_Schema"][this.table]){
			this.base.cfg["DB_Schema"][this.table] = (this.base.driver.GetColumns || _helper.Helper.GetColumns).call(this.base,this.table);
			Mo.C.SaveAs(schemaname, schema);
		}
	}
	this.sp1 = this.base.splitChars[0];
	this.sp2 = this.base.splitChars[1];
	if(this.type == "MSSQL"){
		this.table = this.sp1 + this.base.cfg["DB_Name"] +this.sp2 + "." + this.sp1 + (this.base.cfg["DB_Owner"] || "dbo") +this.sp2 + "." + this.sp1 + this.table+this.sp2;
	}else{
		this.table = this.sp1 + this.table+this.sp2;
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
	var k = field || this.pk;
	k = this.sp1 + k + this.sp2;
	return (this.base.driver.Max || _helper.Helper.Max).call(this, k);
};

__Model__.prototype.min = function(field){
	var k = field || this.pk;
	k = this.sp1 + k + this.sp2;
	return (this.base.driver.Min || _helper.Helper.Min).call(this, k);
};

__Model__.prototype.count = function(field){
	var k = field || this.pk;
	if(k != "*")k = this.sp1 + k + this.sp2;
	return this.query("select count(" + k + ") from " + this.table + (this.strwhere != ""?(" where " + this.strwhere):""),true)(0).value;	
};

__Model__.prototype.sum = function(field){
	var k = field || this.pk;
	k = this.sp1 + k + this.sp2;
	return (this.base.driver.Sum || _helper.Helper.Sum).call(this, k);
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
		this.strjoin += " " + type + " join " + this.sp1 + this.tablePrex + table.substr(0, indx) + this.sp2 +" "+table.substr(indx + 1);
	}else{
		this.strjoin += " " + type + " join "  + this.sp1 + this.tablePrex + table + this.sp2;
	}
	this.joinlevel += "(";
	return this;
};

__Model__.prototype.on = function(str){
	str = str || "";
	this.strjoin += " on " + str +")";
	return this;
};

__Model__.prototype.cname = function(str){
	str = str || "";
	this.strcname = str;
	return this;
};
__Model__.prototype.createCommandManager = function(cmd,ct){
	return new _helper.CMDManager(cmd,this,ct);
};
__Model__.prototype.exec = function(manager){
	var fp;
	try{
		ALLOWDEBUG && (fp = F.timer.run()) && PutDebug(manager.cmd+",");
		if(manager.withQuery){
			this.rs__ = manager.exec();
			this.fetch();
			if(manager.totalRecordsParm != "")this.object_cache.recordcount = this.rc = (manager.getparm(manager.totalRecordsParm).value || 0);
		}else{
			manager.exec();
		}
		ALLOWDEBUG && AppendDebug("[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
	}catch(ex){
		ALLOWDEBUG && AppendDebug("[UNFINISHED],[#" + fp + "]");
		_catchException("__Model__.exec(manager)", ex);
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
__Model__.prototype.select = function(callback){
	if(typeof callback == "function") return this.query().fetch().each(callback);
	return this.query().fetch();
};
__Model__.prototype.query = function(){
	if(!this.base) return this;
	var fp = 0;
	this.sql = "";
	this.countsql = "";
	this.dispose();
	if(arguments.length >= 1){
		try{
			if(arguments.length == 2 && arguments[1] === true){
				ALLOWDEBUG && (fp = F.timer.run()) && PutDebug(arguments[0]+",");
				var rs_ = this.connection.execute(arguments[0]);
				ALLOWDEBUG && AppendDebug("[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
				return rs_;
			}else if(arguments.length == 2 && (typeof arguments[1] == "string")){
				this.sql= arguments[0];
				this.countsql = arguments[1];
			}else{
				ALLOWDEBUG && (fp = F.timer.run()) && PutDebug(arguments[0]+",");
				Model__.lastRows = _executeCommand.call(this, arguments[0]).affectedRows;
				ALLOWDEBUG && AppendDebug("[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
				return this;
			}
		}catch(ex){
			ALLOWDEBUG && AppendDebug("[UNFINISHED],[#" + fp + "]");
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
	try{
		if(this.countsql != ""){
			ALLOWDEBUG && (fp = F.timer.run()) && PutDebug(this.countsql+",");
			this.rc = _executeCommand.call(this, this.countsql).dataset(0).value;
			ALLOWDEBUG && AppendDebug("[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
		}
		ALLOWDEBUG && (fp = F.timer.run()) && PutDebug(this.sql+",");
		this.rs__ = _executeCommand.call(this, this.sql).dataset;
		if(this.countsql == "")this.rc = this.rs__.recordcount;
		ALLOWDEBUG && AppendDebug("[time taken:" + F.timer.stop(fp) + "MS],[#" + fp + "]");
	}catch(ex){
		ALLOWDEBUG && AppendDebug("[UNFINISHED],[#" + fp + "]");
		_catchException("__Model__.query()", ex);
	}
	return this;
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
			this.rs__.Move((this.strpage-1) * limit);
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
function _catchException(src, ex){
	if(VBS && VBS.ctrl.error.number != 0){
		//ExceptionManager.put(VBS.ctrl.error.number,"__Model__.query(args)",VBS.ctrl.error.description);
		ALLOWDEBUG && PutDebug("<" + src + ":" + VBS.ctrl.error.description +">");
		VBS.ctrl.error.clear();
	}else{
		//ExceptionManager.put(new Exception(ex.number,"__Model__.query(args)",ex.message));
		ALLOWDEBUG && PutDebug("<" + src + ":" + ex.message +">");
	}	
}
function _parseData(table){
	var fields = [],values = [],update = [], schema = null, fieldsList = ((this.fields == "" || this.fields == "*") ? "" : ("," + this.fields + ",")), hasFieldsList = fieldsList!="", ori_value;
	var cmd = null, name="",withCommand=false;
	if(this.base.useCommand && this.base.cfg["DB_Schema"] && this.base.cfg["DB_Schema"][this.tableWithNoSplitChar]) 
	{
		schema = this.base.cfg["DB_Schema"][this.tableWithNoSplitChar];
		withCommand = true;
	}
	for(var i in table){
		if(!table.hasOwnProperty(i))continue;
		ori_value = table[i]["value"];
		if(ori_value === undefined)continue;
		if(hasFieldsList && fieldsList.indexOf("," + i + ",")<0) continue;
		fields.push(this.sp1+i+this.sp2);
		var v = ori_value;
		if(withCommand){
			name = "{"+(this.parms.length)+"}";
			values.push(name);
			update.push(this.sp1+i+this.sp2 + " = " + name);
			var tableschema = schema[i];
			var parm = {value : v, type : tableschema["DATA_TYPE"]};
			this.parms.push(parm);
			if(tableschema["NUMERIC_PRECISION"] != null)parm.precision = tableschema["NUMERIC_PRECISION"];
			if(tableschema["CHARACTER_MAXIMUM_LENGTH"] != null)parm.size = v.length;
			if(tableschema["NUMERIC_SCALE"] != null)parm.scale = tableschema["NUMERIC_SCALE"];
		}else{
			if(v===null) v = "null";
			if(this.base.useCommand && ori_value!==null){
				name = "{"+this.parms.length+"}";
				values.push(name);
				update.push(this.sp1+i+this.sp2+" = " + name);
				this.parms.push(parseValAsPrm(v));
			}else{
				if(typeof ori_value == "string") v = ("'" + v.replace(/\'/igm,"''") + "'").replace(/\0/ig,"");
				values.push(v);
				update.push(this.sp1+i+this.sp2+" = " + v);
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
Mo.addEventListener("ondispose", Model__.dispose);
exports.Model__ = Model__;
exports.__Model__ = __Model__;