<script language="jscript" runat="server">
MoTagTest = IClass.create();
MoTagTest.extend("Index", function(attrs){
	return "<div style=\"color:" + attrs.color + "\">" + attrs.name + "</div>";
});
</script>