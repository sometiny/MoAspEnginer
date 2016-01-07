<script language="jscript" runat="server">
DBController = IController.create();
DBController.extend("Index", function(){
	ExceptionManager.errorReporting(E_ALL);
	M.Debug(true);
	M("Public","Id").where("id=1").update("name","艾恩-" + F.random.word(10));
	this.assign("lastRows",Model__.lastRows);
	var rc = M("Public","Id").limit(F.get.int("page", 1),5).orderby("id asc").query().fetch();
	this.assign("recordcount",rc.recordcount);
	this.assign("count",rc.count());
	rc.assign("data");
	this.display("Home:Data");
	
});
</script>