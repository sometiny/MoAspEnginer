/*
** File: mysql.js
** Usage: database driver for mysql
** About: 
**		support@mae.im
*/

var DataTypes = {
	TINYINT:16,SMALLINT:2,MEDIUMINT:3,INT:3,INTEGER:3,BIGINT:20,DECIMAL:14,NUMERIC:131,FLOAT:4,DOUBLE:5,BIT:128,
	DATE:133, TIME:134, DATETIME:7, TIMESTAMP:135, YEAR:18,
	CHAR:129, VARCHAR:200, BINARY:128, VARBINARY:204, 
	TINYBLOB:204, BLOB:205, MEDIUMBLOB:205, LONGBLOB:205, 
	TINYTEXT:200, TEXT:201, MEDIUMTEXT:201, LONGTEXT:201,
	ENUM:13, SET:13
};
function MYSQL_GetType(typed){
	var mc = /(\w+)(\((\d+)(\,(\d+))?\))?/.exec(typed.replace(/'/,''));
	if(!mc) return {type:13};
	var sh = {}, type = DataTypes[mc[1].toUpperCase()];
	if(!type)type = 13;
	sh['type'] = type;
	if(type < 133 && type != 7 && type != 18 && type != 13 && type != 129){
		if(mc[3]!="") sh.precision = parseInt(mc[3]);
		if(mc[5]!="")sh.scale = parseInt(mc[5]);
	}else if(type >= 200 || type == 129){
		if(mc[3]!="") sh.size = parseInt(mc[3]);
	}
	if(typed.indexOf("unsigned")>=0){
		if(type==2) sh['type'] = 18;
		if(type==16) sh['type'] = 17;
		if(type==3) sh['type'] = 19;
		if(type==20) sh['type'] = 21;
	}
	return sh;
}
var Driver = {};
Driver.GetConnectionString = function(){
	if(this["DB_Connectionstring"]) return this["DB_Connectionstring"];
	var DB_Server = this["DB_Server"], DB_Host=DB_Server, DB_Port = 3306;
	if(DB_Host.indexOf(",")>0){
		DB_Host = DB_Server.substr(0,DB_Server.indexOf(","));
		DB_Port = DB_Server.substr(DB_Server.indexOf(",")+1);
	}
	return F.format("DRIVER={mysql odbc " + (this["DB_Version"]||"3.51") + " driver};SERVER={0};PORT={4};UID={1};PWD={2};DATABASE={5}",DB_Host,this["DB_Username"],this["DB_Password"],this["DB_Name"],DB_Port,this["DB_Name"]);
};
Driver.GetSqls = function(){
	var where_="",order_="",where2_="",groupby="",join="",on="",cname="", table = this.table, limit = this.strlimit, joinlevel = this.joinlevel, strpage = this.strpage,fields = this.fields;
	if(this.strwhere!="") where_=" where " + this.strwhere + "";
	if(this.strgroupby!="") groupby=" group by " + this.strgroupby;
	if(this.strjoin!="")join=" " + this.strjoin + " ";
	if(this.strcname!="")cname = " " + this.strcname+" ";
	if (this.strorderby!="") order_=" order by " + this.strorderby;
	this.countsql = "select count(*) from " + joinlevel + table + cname + join + where_ + groupby;
	if(this.pagekeyorder=="" || limit==-1){
		this.sql="select " + fields + " from " + joinlevel + table + cname + join + where_ + groupby+ order_;
	}else{
		var prex = (this.strcname==""?table:this.strcname);
		if(this.isonlypkorder && this.ballowOnlyPKOrder){
			if(strpage>1){
				var c="<=";
				if(this.onlypkorder.toLowerCase()=="asc") c=">=";
				this.sql="select " + fields + " from " + joinlevel + table + cname + join + where_ + (where_!=""?" and ":" where ") + table +"." + this.pk + c
				+ "(select " + prex +"." + this.pk + " from " + joinlevel + table + join + where_+ groupby+ order_ + " limit " + limit * (strpage-1) + ",1)"
				+ groupby+ order_ +" limit " + limit + "";
			}else{
				this.sql="select " + fields + " from " + joinlevel + table + cname + join + where_ + groupby+ order_ +" limit 0," + limit + "";
			}
		}else{
			this.sql="select " + fields + " from " + joinlevel + table + cname + join + where_ + groupby+ order_ +" limit " + limit * (strpage-1) + "," + limit + "";
		}
	}
};
Driver.initialize = function(Helper, Conn){
	
};
module.exports = Driver;