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

/*这里的修改是为了同时调试多个不同配置的app，必须设置app白名单，防止恶意调用*/
if(app_ != "App") app_ = 'App';
define("MO_APP_NAME", "mcms");
define("MO_APP", app_);
define("MO_CORE", "Mo");
Mo.on("load", function(){
	if(Mo.C("MO_APP_ROOT")=="/") Mo.C("MO_APP_ROOT", "");
	Mo.C("MO_VIEWS_DIR", "");
	Mo.C("MO_TEMPLATE_NAME", "default");
	Mo.assign("APP", app_);
	F.get("g", "");
	F.get("m", "Console");
});
startup();
</script>