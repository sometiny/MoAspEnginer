<script language="jscript" runat="server">
Test = IClass.create();
Test.extend("Index", function(attrs){
	return "<div style=\"color:" + attrs.color + "\">" + attrs.name + "</div>";
});
</script>