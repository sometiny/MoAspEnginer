<script language="JScript" runAt="server">
/*'by anlige at www.9fn.net*/

/****************************************************
'@DESCRIPTION:	create ADOX object
'@PARAM:	path [String] : ACCESS data file path
'@PARAM:	dbtype [String] : database type, support 'ACCESS' and 'MSSQL'
'@PARAM:	dbversion [String] : database software version
'****************************************************/
function MoLibADOX(path,dbtype,dbversion){
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
		MoLibADOX.Field.prototype[ext[i]] = (function(dt){
			return function(df,len){
				return this.datatype(dt,df,len);
			}
		})(ext[i]);
	}
}

/****************************************************
'@DESCRIPTION:	create ADOX object. You can use this method in vbscript.
'@PARAM:	path [String] : ACCESS data file path
'@PARAM:	dbtype [String] : database type, support 'ACCESS' and 'MSSQL'
'@RETURN:	[Object] ADOX object
'****************************************************/
MoLibADOX.New = function(path,dbtype){return new MoLibADOX(path,dbtype,dbversion);};

/****************************************************
'@DESCRIPTION:	create ADOX object for ACCESS.
'@PARAM:	path [String] : ACCESS data file path
'@RETURN:	[Object] ADOX object
'****************************************************/
MoLibADOX.ACCESS = function(path){return new MoLibADOX(path,"ACCESS");};

/****************************************************
'@DESCRIPTION:	create ADOX object for MSSQL 2000
'@RETURN:	[Object] ADOX object
'****************************************************/
MoLibADOX.MSSQL = function(){return new MoLibADOX("","MSSQL");};

/****************************************************
'@DESCRIPTION:	create ADOX object for MSSQL2005. Forget it now.
'@RETURN:	[Object] ADOX object
'****************************************************/
MoLibADOX.MSSQL2005 = function(){return new MoLibADOX("","MSSQL","2005");};

/****************************************************
'@DESCRIPTION:	create ADOX object for MSSQL2008. Forget it now.
'@RETURN:	[Object] ADOX object
'****************************************************/
MoLibADOX.MSSQL2008 = function(){return new MoLibADOX("","MSSQL","2008");};

/****************************************************
'@DESCRIPTION:	override 'Server.Mappath' method
'@PARAM:	path [String] : a path,such as 'E:\a.mdb','/a.mdb','a.mdb'
'@RETURN:	[String] local path of file
'****************************************************/
MoLibADOX.Mappath = function(path){
	if(path.length<2)return Server.MapPath(path)
	if(path.substr(1,1)==":") return path;
	return Server.MapPath(path);	
};


/****************************************************
'@DESCRIPTION:	create fields collection object
'@RETURN:	[Object] fields collection object
'****************************************************/
MoLibADOX.prototype.CreateFieldsCollection = function(){
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

/****************************************************
'@DESCRIPTION:	Create instance of Field Object.
'@PARAM:	name [String] : field name.
'@RETURN:	[Object] Field Object.
'****************************************************///define Field
MoLibADOX.prototype.CreateField = function(name){return new MoLibADOX.Field(name,this.dbtype);};

/****************************************************
'@DESCRIPTION:	defined Field object
'@PARAM:	name [String] : field name.
'@PARAM:	dbtype [String] : i will give it a value automatic.
'****************************************************/
MoLibADOX.Field = function(name,dbtype){
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

/****************************************************
'@DESCRIPTION:	if the field is nullable
'@PARAM:	nullable [Boolean] : Default value is null.
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.nullable=function(nullable){
	if(nullable===true && this.set__.dbtype!="ACCESS")this.set__.nullable=true;
	if(nullable===false)this.set__.nullable=false;
	return this;
};

/****************************************************
'@DESCRIPTION:	if the field is  IDENTITY
'@PARAM:	IDENTITY [Boolean]
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.IDENTITY=function(IDENTITY){
	this.set__.IDENTITY=IDENTITY===true;
	return this;
};

/****************************************************
'@DESCRIPTION:	set the field's COLLATE
'@PARAM:	COLLATE [String]
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.COLLATE=function(COLLATE){
	this.set__.COLLATE=COLLATE||"";
	return this;
};

/****************************************************
'@DESCRIPTION:	set the field's name
'@PARAM:	name [String] : field name
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.name=function(name){
	this.set__.name=name;
	return this;
};

/****************************************************
'@DESCRIPTION:	set the field's length
'@PARAM:	length [Int] : field length
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.length=function(length){
	this.set__.length=length;
	return this;
};

/****************************************************
'@DESCRIPTION:	set the field's  default value
'@PARAM:	default_ [Variant]
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.Default=function(default_){
	if(this.set__.dbtype=="ACCESS" && this.set__.type=="DATETIME" && default_.toLowerCase()=="getdate()")default_="Now()";
	this.set__["default"]=default_;
	return this;
};

/****************************************************
'@DESCRIPTION:	set the field's datatype
'@PARAM:	ty [String] : field datatype
'@PARAM:	df [Variant] : default value. it can be blank.
'@PARAM:	len [Int] : field length. it can be blank.
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.datatype = function(ty,df,len){
	ty = ty ||"";
	ty=""+ty+"";
	this.set__.type=ty.toUpperCase();
	if(df!==undefined)this.Default(df);
	if(len!==undefined)this.length(len);
	return this;
};

/****************************************************
'@DESCRIPTION:	if the field is primarykey
'@PARAM:	isprimarykey [Boolean] : if isprimarykey!==false, the value is true 
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.primarykey = function(isprimarykey){
	this.set__.primarykey=(isprimarykey!==false);
	return this;
};

/****************************************************
'@DESCRIPTION:	if the filed's default value is now.
'@PARAM:	isdefaultnow [Boolean] 
'@RETURN:	[Object] field object itself.
'****************************************************/
MoLibADOX.Field.prototype.defaultnow = function(isdefaultnow){
	this.set__.datedefaultnow=(isdefaultnow!==false);
	return this;
};
		
/****************************************************
'@DESCRIPTION:	Drop a Field
'@PARAM:	tablename [String] : table name.
'@PARAM:	name [String] : field name. if this argument is blank, the value of tablename will be assigned to name and the lasttablename will be assigned to tablename.
'@RETURN:	[Boolean] if delete successfully,return true,or return false.
'****************************************************/
MoLibADOX.prototype.DropField = function(tablename,name){
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

/****************************************************
'@DESCRIPTION:	Open database. for access,you should ignore all the follow arguments
'@PARAM:	server [String] : server name(for mssql)
'@PARAM:	username [String] : database login name(for mssql)
'@PARAM:	password [String] : database login password(for mssql)
'@PARAM:	database [String] : database name
'@RETURN:	[Boolean] if open database successfully, return true, or return false.
'****************************************************/
MoLibADOX.prototype.Open = function(server,username,password,database){
	if(this.dbtype=="MSSQL") return this.OpenSqlServer(server,username,password,database);
	if(this.conn.state==1)return true;
	this.path = this.path || server;
	try{
		this.conn.open("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + MoLibADOX.Mappath(this.path));
		return true;
	}catch(ex){
		this.exception.push("Open："+ex.description);
		return false;
	}
};

/****************************************************
'@DESCRIPTION:	Open SqlServer databse
'@PARAM:	server [String] : server name(for mssql)
'@PARAM:	username [String] : database login name(for mssql)
'@PARAM:	password [String] : database login password(for mssql)
'@PARAM:	database [String] : database name
'@RETURN:	[Boolean] if open database successfully, return true, or return false.
'****************************************************/
MoLibADOX.prototype.OpenSqlServer = function(server,username,password,database){
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

/****************************************************
'@DESCRIPTION:	set lasttablename
'@PARAM:	tablename [String] : table name.
'****************************************************/
MoLibADOX.prototype.Select = function(tablename){
	this.lasttablename = tablename;
};

/****************************************************
'@DESCRIPTION:	Create access database
'@PARAM:	path [String] : database file path
'@RETURN:	[Boolean] if database was created successfully,return true,or return false.
'****************************************************/
MoLibADOX.prototype.Create = function(path){
	if(this.dbtype!="ACCESS")return;
	this.path = this.path || path;
	try{
		var Cate = new ActiveXObject("ADOX.Catalog");
		Cate.create("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + MoLibADOX.Mappath(this.path));
		Cate = null;
		return this.Open();
	}catch(e){
		this.exception.push("Create："+e.description);
		return false;
	}
};

/****************************************************
'@DESCRIPTION:	Execute sql string
'@PARAM:	sql [String] : sql string
'@RETURN:	[Boolean] if sql string wae executed successfully, return true, or return false.
'****************************************************/
MoLibADOX.prototype.Exec = function(sql){
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

/****************************************************
'@DESCRIPTION:	Create a Table from fields collection
'@PARAM:	name [String] : tables name.
'@PARAM:	fields [Collection] : fields collection.
'@PARAM:	delete_ [Boolean] : if delete the table when the tables is exists.
'@RETURN:	[Boolean] if the table was created successfully, return true, or return false.
'****************************************************/
MoLibADOX.prototype.CreateTable = function(name,fields,delete_){
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
		//this.exception.push(sql);
		this.conn.execute(sql);
		this.lasttablename = name;
		return true;
	}catch(ex){
		this.exception.push("CreateTable："+ex.description);
		return false;
	}
};

/****************************************************
'@DESCRIPTION:	delete a table
'@PARAM:	name [String] : table name
'@PARAM:	noerror [Boolean] : throw error
'@RETURN:	[Boolean] if the table was deleted successfully, return true, or return false.
'****************************************************/
MoLibADOX.prototype.DropTable = function(name,noerror){
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

/****************************************************
'@DESCRIPTION:	Debug sth.
'@RETURN:	[String] debug string
'****************************************************/
MoLibADOX.prototype.Debug=function(){
	return this.exception.join("<br />");
};

/****************************************************
'@DESCRIPTION:	Close database
'****************************************************/
MoLibADOX.prototype.Close = function(){
	try{this.conn.close();}catch(ex){}	
};
</script>
