<script language="jscript" runat="server">
DBController = IController.create();
DBController.extend("Index", function(){
	M.Debug(true);
	M.useCommand(true);
	//M("Public","Id").insert("name","测试2","age",87,"birthday","2014-9-8");
	M("Public","Id").where("id=1").update("name","艾恩-" + F.random.word(10));
	this.assign("lastRows",Model__.lastRows);
	var rc = M("Public","Id").limit(1,10).query().fetch();
	this.assign("recordcount",rc.recordcount);
	this.assign("count",rc.count());
	rc.assign("data");

	//使用数组（可选）初始化一个DataTable
	rc = new DataTable([{
		"id":1,
		"name":"不知道名字",
		"age":25,
		"birthday":F.date.dateadd("s",-21541333,new Date())
	}]);
	//添加一条数据
	rc.add({
		"id":2,
		"name":"艾恩",
		"age":31,
		"birthday":F.date.dateadd("s",-19857,new Date())
	});
	//添加空记录，自己设置数据
	var r = rc.add();
		r.id=3;
		r.name="lilith";
		r.age=26;
		r.birthday="2014-7-8";
	rc.assign("dataself");
	this.display("Home:Data");
});
</script>