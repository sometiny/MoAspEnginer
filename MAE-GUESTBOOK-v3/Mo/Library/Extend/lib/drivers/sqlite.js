/*
** File: sqlite.js
** Usage: database driver for sqlite
** About: 
**		support@mae.im
*/

var DataTypes = {
	INTEGER : 3,VARCHAR : 200,TEXT : 203,REAL : 5,BLOB : 128,SMALLINT : 2,FLOAT : 5,DOUBLE : 5,BOOLEAN : 11,DATE : 133,TIME : 134,TIMESTAMP : 135, BINARY:202, INT:3
};
function SQLITE_GetType(typed){
	var mc = /(\w+)(\((\d+)(\,(\d+))?\))?/.exec(typed.replace(/'/,''));
	if(!mc) return {type:13};
	var sh = {}, type = DataTypes[mc[1].toUpperCase()];
	if(!type)type = 13;
	sh['type'] = type;
	if(type < 133 && type != 128){
		if(mc[3]!="") sh.precision = parseInt(mc[3]);
		if(mc[5]!="")sh.scale = parseInt(mc[5]);
	}else if(type >= 200 || type == 128){
		if(mc[3]!="") sh.size = parseInt(mc[3]);
	}
	return sh;
}
var Driver = {};
Driver.GetConnectionString = function(){
	return this["DB_Connectionstring"] || "DRIVER={SQLite3 ODBC Driver};Database=" + F.mappath(this["DB_Path"]) + (this["DB_Password"] ? (";PassWord=" + this["DB_Password"]) : "");
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
Driver.GetColumns = function(tablename){
	var conn = this.base;
	var rs = conn.execute("PRAGMA table_info(" + tablename + ")");
	if(rs==null)return null;
	var obj={},i=0, typed, sch;
	while(!rs.eof){
		typed = SQLITE_GetType(rs.fields("Type").Value); 
		sch = {
			"DATA_TYPE":typed.type,
			"IS_NULLABLE":rs.fields("notnull").Value==0,
			"IS_PK":rs.fields("pk").Value==1
		};
		if(typed.hasOwnProperty('precision')) sch['NUMERIC_PRECISION'] = typed.precision;
		if(typed.hasOwnProperty('scale')) sch['NUMERIC_SCALE'] = typed.scale;
		if(typed.hasOwnProperty('size')) sch['CHARACTER_MAXIMUM_LENGTH'] = typed.size;
		obj[rs("name").Value]=sch;
		rs.movenext();
	}
	return obj;
};
Driver.initialize = function(Helper, Conn){
	
};
module.exports = Driver;