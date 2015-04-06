<script language="jscript" runat="server">
ontag = IClass.create();
ontag.extend("Index", function(attrs){
	return "<div style=\"color:" + attrs.color + "\">" + attrs.name + "</div>";
});
</script>