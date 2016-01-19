<script language="jscript" runat="server">
TestNoClose = IClass.create();
TestNoClose.extend("Index", function(args){
	return {Name : args.name, Age : args.age};
});
</script>