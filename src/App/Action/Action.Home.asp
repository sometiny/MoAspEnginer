<script language="jscript" runat="server">
function ActionHome(){
	this.empty=function(){};
}
ActionHome.prototype = new IAction();
ActionHome.prototype.Index = function(){
	this.assign("appname","MoAspEnginer");
	this.assign("birthday",new Date());
	this.assign("address","杭州");
	this.assign("list",["a","2","v","f","sds","cghf"]);
	this.assign("args","<span style=\"color:red\">我是变量参数！</span>");
	var data = new DataTable([
		{"name":"标题","age":23},
		{"name":"标题2","age":34},
		{"name":"标题3","age":45}
	],2);
	this.assign("data",data); //只有DataTable对象才能用于loop，DataTable对象常由Model自动生成，这里手动构造
	this.assign("age",24);
	this.assign("jsobject",{a:1,b:2,c:3,d:4});
	F.get("name",1);
	F.post("name",2);
	F.session("name","艾恩");
	F.cookie("name","艾恩");
	F.cookie("person.age",28);
	this.assign("Debug",F.dump_(F.date.parse("1986-9-2 21:23:45.234")));
	this.display("Home");
};
ActionHome.prototype.db2008 = function(){
	Model__.allowDebug=true;
	var cmd = Model__("Public","Id","Sql2008").createCommandManager("getrecords");
	cmd.addReturn("@RETURN",3,4);
	cmd.addInputInt("@start",2);
	cmd.addOutput("@output",200,50);
	var rc = cmd.execute(true).fetch();
	F.echo(F.format("数据记录：{0}条",rc.recordcount),true);
	F.echo(F.format("查询记录：{0}条",rc.count()),true);
	F.echo(F.format("返回值：{0}",cmd.getparm("@RETURN").value),true)
	F.echo(F.format("输出值：{0}",cmd.getparm("@output").value),true)
	rc.each(function(r){
		F.echo(F.format("{0.id},{0.name},{0.age},{0.birthday:yyyy-MM-dd}",r),true);
	});
}
ActionHome.prototype.db = function(){
	Model__.allowDebug=true;
	Model__.useCommandForUpdateOrInsert=true;
	Model__("Public","Id").where("id=1").update("name","艾恩-" + F.random.word(10));
	F.echo("影响行数："+Model__.lastRows,true);
	//这里的rc就是Model自动创建的DataTable对象
	var rc = Model__("Public","Id").limit(1,3).query().fetch();
	F.echo(F.format("数据记录：{0}条",rc.recordcount),true);
	F.echo(F.format("查询记录：{0}条",rc.count()),true);
	rc.each(function(r){
		F.echo(F.format("{0.id},{0.name},{0.age},{0.birthday:yyyy-MM-dd}",r),true);
	});

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
	F.echo(F.format("数据记录：{0}条",rc.recordcount),true);
	rc.each(function(r){
		F.echo(F.format("{0.id},{0.name},{0.age},{0.birthday:yyyy-MM-dd}",r),true);
	});
	
};
ActionHome.prototype.clearcache = function(){
	Mo.ClearCompiledCache();
	Mo.ModelCacheClear();
	Mo.ClearLibraryCache();
	if(F.server("HTTP_REFERER")!="")F.goto(F.server("HTTP_REFERER")); else F.goto("/");
};
</script>