<%@Language="JSCRIPT" CodePage="65001"%>
<!--#include file="Mo/Library/MAE/Mo.asp"-->
<script language="jscript" runat="server">
/*
** File: default.asp
** Usage: the entry.
** About: 
**		support@mae.im
*/
Mo({
	MO_APP_NAME : "App", /*application name, it is required.*/
	MO_APP : "App", /*app-dir's name*/
	MO_APP_ENTRY : "",/*if blank, auto detect*/
	MO_ROOT : "", /*if blank, auto detect*/
	MO_CORE : "Mo" /*you can change core-dir's name for system's safe*/
});
</script>