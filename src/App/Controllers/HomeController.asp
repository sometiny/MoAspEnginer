<script language="jscript" runat="server">
HomeController = IController.create();
HomeController.extend("Index", function(){
	this.display("Index");
});
HomeController.extend("Safecode", function(name){
	Safecode("sessionname", {length:4, padding:5, odd:3, font:'yahei'});
});
HomeController.extend("Home", function(){
	this.assign("title","MAE");
	this.assign("name",null);
	this.assign("Version",Mo.Version);
	this.assign("appname","MoAspEnginer");
	this.assign("birthday",new Date());
	this.assign("address","杭州");
	this.assign("list",["a","2","v","f","sds","cghf"]);
	this.assign("args","<span style=\"color:red\">我是变量参数！</span>");
	var data = new DataTable([
		{
			"name":"标题",
			"age":23
		},
		{"name":"标题2","age":34},
		{"name":"标题3","age":45}
	],2);
	this.assign("data",data); //只有DataTable对象才能用于loop，DataTable对象常由Model自动生成，这里手动构造
	this.assign("age",24);
	this.assign("jsobject",{
		a:"1",
		b:"2",
		c:"3",
		d:"4"
	});
	F.get("name",1);
	F.post("name",2);
	F.session("name","艾恩");
	F.cookie("name","艾恩");
	F.cookie("person.age",28);
	this.assign("Debug",JSON.stringify(F.date.parse("1986-9-2 21:23:45.234"),null,"  "));
	this.display("Home");
});
HomeController.extend("clearcache", function(){
	Mo.ClearCompiledCache();
	Mo.ModelCacheClear();
	if(F.server("HTTP_REFERER")!="")F.goto(F.server("HTTP_REFERER")); else F.goto("/");
});
</script>