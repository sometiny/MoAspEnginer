<%@Language="VBScript" CodePage="65001"%>
<script language="jscript" runat="server" src="Mo/Mo.js"></script>
<%
res.charset = "utf-8"
define "MO_APP_NAME", "App"
define "MO_APP", "App"
define "MO_CORE", "Mo"
define "MO_PLUGIN_MODE", true


startup()

set One = Model__("Public", "id").find(1)
F.echo JSON.stringify(One), true
dump One

'在VBS使用普通的js对象，只能这样了
set Sec = JSON.create()
Sec.put "name", "艾恩"
Sec.put "age", 29
Sec.putObject("school").put("name", "ouc").put "location", "Qingdao"

dump Sec.data 'Sec.data就是一个js对象
F.echo Sec.toString(), true

shutdown()
%>