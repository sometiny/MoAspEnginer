<%@Language="JSCRIPT" CodePage="65001"%>
<script language="jscript" runat="server" src="Mo/Mo.js"></script>
<script language="jscript" runat="server">
/*
** File: default.asp
** Usage: the entry.
** About: 
**	support@mae.im
*/
define("MO_APP_NAME", "AppWx");
define("MO_APP", "AppWx");
define("MO_CORE", "Mo");
Mo.on("load", function(){
	F.get("m", "Notice");
});
startup();
</script>