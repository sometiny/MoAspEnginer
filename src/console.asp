<%@Language="JSCRIPT" CodePage="65001"%>
<script language="jscript" runat="server" src="Mo/Mo.js"></script>
<script language="jscript" runat="server">
/*
** File: console.asp
** Usage: console for mae
** About: 
**	support@mae.im
*/
var app_ = Request.QueryString('app') + '';
if(app_ != "App") app_ = '';
define("MO_APP_NAME", "mcms");
define("MO_APP", app_ || "App");
define("MO_CORE", "Mo");
Mo.on("load", function(){
	if(Mo.C("MO_APP_ROOT")=="/") Mo.C("MO_APP_ROOT", "");
	Mo.C("MO_VIEWS_DIR", "");
	Mo.C("MO_TEMPLATE_NAME", "default");
	Mo.assign("APP", app_ || "App");
	F.get("g", "");
	F.get("m", "Console");
});
startup();
</script>