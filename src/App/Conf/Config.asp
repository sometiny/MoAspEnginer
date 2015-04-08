<script language="jscript" runat="server">
return {
	MO_DEBUG: false,
	MO_COMPILE_CACHE: true,
	MO_TAG_LIB : "ontag",
	MO_ERROR_REPORTING : E_ERROR | E_WARNING,
	MO_ROUTE_MODE : "",
	/*静态路由，不遍历，直接检索*/
	MO_ROUTE_MAPS : {},
	/*动态路由，需遍历检查*/
	MO_ROUTE_RULES : [],
	/*ACCESS数据库配置*/
	MO_DATABASE_DB : {
		"DB_Type": "ACCESS",
		"DB_Path": "Public/data/GBqcBsFizy.mdb"		
	},
	/*通用的数据库配置*/
	MO_DATABASE_DIST : {
		DB_Type:"", /* support ACCESS|MSSQL|MYSQL|SQLITE|OTHER,if DB_Type is OTHER,you must set 'DB_Connectionstring'*/
		DB_Connectionstring:"", /* enabled when DB_Type is 'OTHER' */
		DB_Path:"", /* enabled when DB_Type is 'ACCESS' or 'SQLITE'*/
		DB_Server:"",
		DB_Username:"",
		DB_Password:"",
		DB_Name:"",
		DB_Splitchars:["[","]"], /* use '`' when DB_Type is 'MYSQL' or 'SQLITE'*/
		DB_Version:"", /* for MSSQL,it can be 2005,2012...;for mysql it can be 3.51,5.1...*/
		DB_Owner:"dbo", /* for MSSQL */
		DB_TABLE_PERX:Mo.Config.Global.MO_TABLE_PERX		
	}
};
</script>