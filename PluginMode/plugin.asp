<%@Language="JSCRIPT" CodePage="65001"%>
<script language="jscript" runat="server" src="Mo/Mo.js"></script>
<script language="jscript" runat="server">
/*
** File: plugin.asp
** Usage: plugin mode.
** About: 
**	support@mae.im
*/
define("MO_APP_NAME", "App");
define("MO_APP", "App");
define("MO_CORE", "Mo");
define("MO_PLUGIN_MODE", true)


startup(); //required

var One = Model__("Public", "id").find(1);
F.echo(JSON.stringify(One), true);
dump(One);

shutdown(); //required
</script>