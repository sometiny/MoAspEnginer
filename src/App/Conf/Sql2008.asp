<script type="text/javascript" runat="server">
return {
	DB_Type:"MSSQL", /* support ACCESS|MSSQL|MYSQL|SQLITE|OTHER,if DB_Type is OTHER,you must set 'DB_Connectionstring'*/
	DB_Connectionstring:"", /* enabled when DB_Type is 'OTHER' */
	DB_Path:"App/data/GBqcBsFizy.mdb", /* enabled when DB_Type is 'ACCESS' or 'SQLITE'*/
	DB_Server:"127.0.0.1,1433",
	DB_Username:"sa",
	DB_Password:"12356",
	DB_Name:"Public",
	DB_Splitchars:["[","]"], /* use '`' when DB_Type is 'MYSQL' or 'SQLITE'*/
	DB_Version:2008, /* for MSSQL,it can be 2005,2012...;for mysql it can be 3.51,5.1...*/
	DB_Owner:"dbo",/* for MSSQL */
	DB_TABLE_PERX:Mo.Config.Global.MO_TABLE_PERX
};
</script>