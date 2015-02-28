/*'by anlige at www.9fn.net*/

/****************************************************
'@DESCRIPTION:	create ADOX object
'@PARAM:	path [String] : ACCESS data file path
'@PARAM:	dbtype [String] : database type, support 'ACCESS' and 'MSSQL'
'@PARAM:	dbversion [String] : database software version
'****************************************************/
function $adox(path,dbtype,dbversion){
	this.dbversion = (dbversion==undefined?"2000":dbversion);
	this.path = path||"";
	this.dbtype = dbtype || "ACCESS";
	this.tables=[];
	this.datatype=",BOOLEAN,BYTE,COUNTER,CURRENCY,DATETIME,DOUBLE,GUID,LONG,LONGBINARY,LONGTEXT,SINGLE,SHORT,TEXT,INTEGER,VARCHAR,INT,";
	if(this.dbtype=="MSSQL") this.datatype=",BIGINT,BINARY,BIT,CHAR,DATETIME,DECIMAL,FLOAT,IMAGE,INT,MONEY,NCHAR,NTEXT,NUMERIC,NVARCHAR,REAL,SMALLDATETIME,SMALLINT,SMALLMONEY,SQL_VARIANT,SYSNAME,TEXT,TIMESTAMP,TINYINT,UNIQUEIDENTIFIER,VARBINARY,VARCHAR,";
	//if(this.dbtype=="MYSQL")this.datatype=",TINYINT,SMALLINT,MEDIUMINT,INT,BIGINT,DECIMAL,DOUBLE,FLOAT,CHAR,VARCHAR,BLOB,TEXT,DATETIME,TIMESTAMP,BIT,SET,ENUM,";
	this.exception=[];
	this.conn=new ActiveXObject("Adodb.Connection");
	this.lasttablename="";
	var self = this;
	var ext = this.datatype.split(",");
	for(var i in ext){
		$adox.Field.prototype[ext[i]] = (function(dt){
			return function(df,len){
				return this.datatype(dt,df,len);
			}
		})(ext[i]);
	}
}
$adox.fn = $adox.prototype;
$adox.ACCESS = function(path){return new $adox(path,"ACCESS");};
$adox.MSSQL = function(){return new $adox("","MSSQL");};
$adox.MSSQL2005 = function(){return new $adox("","MSSQL","2005");};
$adox.MSSQL2008 = function(){return new $adox("","MSSQL","2008");};
$adox.Mappath = function(path){
	if(path.length<2)return Server.MapPath(path)
	if(path.substr(1,1)==":") return path;
	return Server.MapPath(path);	
};

$adox.fn.CreateFieldsCollection = function(){
	return new function(){
		this.fields=[];
		this.Append = function(field){
			var set_ = field.set__;
			var sql="[" + set_.name + "] " + set_.type+"";
			if(set_.length>0)sql+=" (" + set_.length + ")";
			if(set_.dbtype=="ACCESS" && (set_.type=="VARCHAR" || set_.type=="TEXT" || set_.type=="LONGTEXT")) sql+=" WITH COMPRESSION";
			if(set_.type=="COUNTER")sql+="(1, 1)";
			if(set_.IDENTITY)sql+=" IDENTITY (1, 1)";
			if(set_.primarykey===true)sql+=" PRIMARY KEY";
			if(set_.COLLATE!="" && set_.dbtype=="MSSQL")sql+=" COLLATE " + set_.COLLATE;
			if(set_["default"]!==null){
				sql+=" default " + set_["default"] + "";
			}else{
				if(	set_.type=="DATETIME" && set_.datedefaultnow) sql+=" default " + (set_.dbtype=="MSSQL"?"getdate()":"Now()");
			}	
			if(set_.nullable!==null){
				if(set_.nullable===false){
					sql+=" NOT NULL";
				}else{
					if(!(set_.IDENTITY || set_.primarykey))sql+=" NULL";
				}
			}
			this.fields.push(sql);
		};
		this.ToString = function(){
			return this.fields.join(",\n");
		};
	}
};

$adox.fn.CreateField = function(name){return new $adox.Field(name,this.dbtype);};

$adox.Field = function(name,dbtype){
	this.set__={
		"dbtype":dbtype,
		"name":"",
		"length":0,
		"default":null,
		"type":null,
		"primarykey":false,
		"datedefaultnow":false,
		"nullable":null,
		"IDENTITY":false,
		"COLLATE":""
	};
	if(name!=undefined)this.set__.name = name;
}

$adox.Field.prototype.nullable=function(nullable){
	if(nullable===true && this.set__.dbtype!="ACCESS")this.set__.nullable=true;
	if(nullable===false)this.set__.nullable=false;
	return this;
};

$adox.Field.prototype.IDENTITY=function(IDENTITY){
	this.set__.IDENTITY=IDENTITY===true;
	return this;
};

$adox.Field.prototype.COLLATE=function(COLLATE){
	this.set__.COLLATE=COLLATE||"";
	return this;
};

$adox.Field.prototype.name=function(name){
	this.set__.name=name;
	return this;
};

$adox.Field.prototype.length=function(length){
	this.set__.length=length;
	return this;
};

$adox.Field.prototype.Default=function(default_){
	if(this.set__.dbtype=="ACCESS" && this.set__.type=="DATETIME" && default_.toLowerCase()=="getdate()")default_="Now()";
	this.set__["default"]=default_;
	return this;
};

$adox.Field.prototype.datatype = function(ty,df,len){
	ty = ty ||"";
	ty=""+ty+"";
	this.set__.type=ty.toUpperCase();
	if(df!==undefined)this.Default(df);
	if(len!==undefined)this.length(len);
	return this;
};

$adox.Field.prototype.primarykey = function(isprimarykey){
	this.set__.primarykey=(isprimarykey!==false);
	return this;
};

$adox.Field.prototype.defaultnow = function(isdefaultnow){
	this.set__.datedefaultnow=(isdefaultnow!==false);
	return this;
};

$adox.fn.DropField = function(tablename,name){
	if(name==undefined){
		name = 	tablename;
		tablename = null;
	}
	if(this.conn.state!=1)return false;
	if(!name || name=="" || !/[0-9a-zA-Z\_]/ig.test(name))return false;
	tablename = tablename || this.lasttablename;
	if(!tablename || tablename=="" || !/[0-9a-zA-Z\_]/ig.test(tablename))return false;
	try{
		this.conn.execute("ALTER TABLE " + tablename + " DROP COLUMN [" + name +"]");
		this.lasttablename = tablename;
		return true;
	}catch(ex){
		this.exception.push("DeleteFiled："+ex.description);
		return false;
	}
};

$adox.fn.Open = function(server,username,password,database){
	if(this.dbtype=="MSSQL") return this.OpenSqlServer(server,username,password,database);
	if(this.conn.state==1)return true;
	this.path = this.path || server;
	try{
		this.conn.open("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + $adox.Mappath(this.path));
		return true;
	}catch(ex){
		this.exception.push("Open："+ex.description);
		return false;
	}
};

$adox.fn.OpenSqlServer = function(server,username,password,database){
	if(this.conn.state==1)return true;
	try{
		if(this.dbversion=="2000"){
			this.conn.open("provider=sqloledb;Persist Security Info=false;data source=" + server + ";User ID=" + username + ";pwd=" + password + ";Initial Catalog=" + database + "");
		}else{
			this.exception.push("Open：不支持的数据库版本-" + this.dbversion + "。");
			return false;
		}
		return true;
	}catch(ex){
		this.exception.push("Open："+ex.description);
		return false;
	}
};

$adox.fn.Select = function(tablename){
	this.lasttablename = tablename;
};

$adox.fn.Create = function(path){
	if(this.dbtype!="ACCESS")return;
	this.path = this.path || path;
	try{
		var Cate = new ActiveXObject("ADOX.Catalog");
		Cate.create("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + $adox.Mappath(this.path));
		Cate = null;
		return this.Open();
	}catch(e){
		this.exception.push("Create："+e.description);
		return false;
	}
};

$adox.fn.Exec = function(sql){
	if(!sql || sql=="")return false;
	if(this.conn.state!=1)return false;
	try{
		this.conn.execute(sql);
		return true;
	}catch(ex){
		this.exception.push("Exec："+ex.description);
		return false;
	}
};

$adox.fn.CreateTable = function(name,fields,delete_){
	name = name || this.lasttablename;
	if(!name || name=="" || !/[0-9a-zA-Z\_]/ig.test(name))return false;
	if(this.conn.state!=1)return false;
	if(delete_===true){
		try{
			this.DropTable(name,true);
		}catch(ex){}	
	}
	try{
		var sql="create table " + name +"(" + fields.ToString() + ")"+ (this.dbtype=="MSSQL" ? " ON [PRIMARY]" :"");
		this.conn.execute(sql);
		this.lasttablename = name;
		return true;
	}catch(ex){
		this.exception.push("CreateTable："+ex.description);
		return false;
	}
};

$adox.fn.DropTable = function(name,noerror){
	if(noerror!==true)noerror=false;
	name = name || this.lasttablename;
	if(!name || name=="" || !/[0-9a-zA-Z\_]/ig.test(name))return false;
	if(this.conn.state!=1)return false;
	try{
		this.conn.execute("drop table " + name +"");
		this.lasttablename = name;
		return true;
	}catch(ex){
		if(!noerror)this.exception.push("DropTable："+ex.description);
		return false;
	}
};

$adox.fn.Debug=function(){
	return this.exception.join("<br />");
};

$adox.fn.Close = function(){
	try{this.conn.close();}catch(ex){}	
};
return exports.adox = $adox;