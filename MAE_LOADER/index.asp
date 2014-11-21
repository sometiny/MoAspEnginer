<!--#include file="maeloader.asp"-->
<script language="jscript" runat="server">
require("json");
var data = exports.json.create();
data.put("id", 1).put("name", "anlige");
echo(data);
</script>