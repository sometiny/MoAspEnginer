<script language="jscript" runat="server">
MoController = IController.create();
MoController.extend("Index", function(){
	this.assign("name","anlige");
	this.assign("name2","anlige");
	var data = [{name:"anlige", age:23,teachers : ["xu","zhang"]},{name:"lilith", age:28,teachers : ["xu","zhang2"]}];
	this.assign("data1", data);
	this.assign("data", new DataTable(data));
	this.assign("data2", data[0]);
	this.display("Home:File");
});
MoController.extend("View", function(){
	this.display("Home:Index1");
});
</script>