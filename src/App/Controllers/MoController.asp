<script language="jscript" runat="server">
MoController = IController.create();
MoController.extend("Index", function(){
	var M = require("lib/model.js");
	var fn = M.Model__.helper.Helper.GetConnectionString;
	var connstr = fn.call({
		DB_Type : "ACCESS",
		DB_Path : "Public/data/Test.mdb"
	});
	//connstr = fn.call({
	//	DB_Type : "MSSQL",
	//	DB_Server : "(local)",
	//	DB_Username : "sa",
	//	DB_Password : "12356",
	//	DB_Name : "Public"
	//});
	var ADOX = require("assets/adox.js");
	var adox = ADOX();
	adox.create(connstr);
	if(adox.isok()){
		//adox.dump();
		//return;
		try{
			adox.tables.remove("Mo_Test2");
		}catch(ex){}
		var table = adox.tables.create("Mo_Test2");
		table.columns.create("id", 3, {autoincrement : true});
		table.columns.create("name", 202, {size : 50, nullable : true});
		table.columns.create("memo", 203, {nullable : true});
		table.keys.create("key1", "id");
		table.indexes.create("index1", "name");
		adox.save();
	}
	return;
});
MoController.extend("Index2", function(){
	C("@.MO_COMPILE_CACHE", false);
	C("@.MO_TEMPLATE_ENGINE", "views/view2.js");
	ExceptionManager.errorReporting(E_ERROR);
	this.assign("value","文本域");
	this.display("Home:Html");
});
MoController.extend("Index3", function(){
	C("@.MO_COMPILE_CACHE", false);
	C("@.MO_TEMPLATE_ENGINE", "views/ejs");
	ExceptionManager.errorReporting(E_ERROR);
	var data = [{name:"anlige", age:23,teachers : ["xu","zhang"]},{name:"lilith", age:28,teachers : ["xu","zhang"]}];
	this.assign("data1", data);
	this.assign("name", "TEST");
	this.assign("data", new DataTable(data));
	this.assign("data2", data[0]);
	this.display("Home:MoEjs");
});
MoController.extend("View2", function(){
	C("@.MO_COMPILE_CACHE", false);
	C("@.MO_TEMPLATE_ENGINE", "views/view2.js");
	ExceptionManager.errorReporting(E_ERROR);
	this.assign("name","anlige");
	this.assign("name2","anlige");
	var data = [{name:"anlige", age:23,teachers : ["xu","zhang"]},{name:"lilith", age:28,teachers : ["xu","zhang2"]}];
	this.assign("data1", data);
	this.assign("data", new DataTable(data));
	this.assign("data2", data[0]);
	this.display("Home:Mo");
});
</script>