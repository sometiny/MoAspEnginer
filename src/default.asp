<!--#include file="Mo/Library/MAE/Mo.asp"-->
<script language="jscript" runat="server">
/*
** File: default.asp
** Usage: the entry.
** About: 
**		support@mae.im
*/
Mo.Initialize({
	MO_APP_NAME : "App",
	MO_APP : "App",
	MO_APP_ENTRY : "",
	MO_ROOT : "",
	MO_CORE : "Mo"
}).Route().Run().Terminate();
</script>