/*
** File: model_helper.js
** Usage: define helper methods and classes for datebase operate.
** About: 
**		support@mae.im
*/
var Driver = {};
Driver.GetConnectionString = function(){
	return this["DB_Connectionstring"] || F.format("provider=sqloledb.1;Persist Security Info=false;data source={0};User ID={1};pwd={2};Initial Catalog={3}",this["DB_Server"],this["DB_Username"],this["DB_Password"],this["DB_Name"]);
};
Driver.GetSqls = function(){
	var where_="",order_="",where2_="",groupby="",join="",on="",cname="", table = this.table, limit = this.strlimit, joinlevel = this.joinlevel, pagekey = this.pagekey, strpage = this.strpage;
	var fields = this.fields;
	if(this.strwhere!=""){
		where_=" where " + this.strwhere + "";
		if(strpage>1 && limit!=-1)where2_=" and (" + this.strwhere + ")";
	}
	if(this.strgroupby!="") groupby=" group by " + this.strgroupby;
	if(this.strjoin!="")join=" " + this.strjoin + " ";
	if(this.strcname!="")cname = " " + this.strcname+" ";
	if (this.strorderby!="") order_=" order by " + this.strorderby;
	this.countsql = "select count(*) from " + joinlevel + table + cname + join + where_ + groupby;
	if(this.pagekeyorder=="" || limit==-1){
		this.sql="select " + fields + " from " + joinlevel + table + cname + join + where_ + groupby+ order_;
		return;
	}
	if(this.base.cfg.DB_Version==2012){
		this.sql="select " + fields + " from " + joinlevel + table + cname + join + where_ + groupby+ order_ +" OFFSET " + (limit * (strpage-1) +1) + " ROWS FETCH NEXT " + limit + " ROWS ONLY";
		return;
	}
	
	if(this.base.cfg.DB_Version>=2005){
		this.sql="select * from (select " + fields + ",ROW_NUMBER() OVER (" + order_ + ") AS ROWID_ from " + joinlevel + table + cname + join + where_ + groupby +") AS tmp_table_1 where ROWID_ BETWEEN " + (limit * (strpage-1) +1) + " and " + (limit * strpage);
		return;
	}
	
	var prex = (this.strcname==""?table:this.strcname);
	if(this.isonlypkorder && this.ballowOnlyPKOrder){
		if(strpage>1){
			var c="<",d="min";
			if(this.onlypkorder.toLowerCase()=="asc") {c=">";d="max";}
			where_ +=" " + (where_!=""?"and":"where") + " " + prex + "." + pagekey + c + " (select " + d + "(" + pagekey + ") from (select top " + limit * (strpage-1) + " " + prex + "." + pagekey + " from " +joinlevel + table + cname + join + where_ + groupby+ order_ +") as mo_p_tmp)";
		}
		this.sql="select top " + limit + " " + fields + " from " + joinlevel + table + cname + join + where_ + groupby+ order_;
		return;
	}
	if(strpage>1)where_ +=" " + (where_!=""?"and":"where") + " " + prex + "." + pagekey + " not in(select top " + limit * (strpage-1) + " " + prex + "." + pagekey + " from " +joinlevel + table + cname + join + where_ + groupby+ order_ +")"	;
	this.sql="select top " + limit + " " + fields + " from " + joinlevel + table + cname + join + where_ + groupby+ order_;
};
Driver.initialize = function(Helper, Conn){
	
};
module.exports = Driver;