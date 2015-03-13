<script language="jscript" runat="server">
HomeController = IController.create();
HomeController.extend("Home", function(){
	this.assign("Version",Mo.Version);
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
	this.assign("Debug",F.dump(F.date.parse("1986-9-2 21:23:45.234"),true));
	this.display("Home");
});
HomeController.extend("db2008", function(){
	Model__.allowDebug=true;
	var cmd = Model__("Test","aaa","Sql2008").createCommandManager("sp_page");
	cmd.add_parm_return(ModelHelper.Enums.DataType.DBTYPE_I4);
	cmd.add_parm_input_int(3);
	cmd.add_parm_input_int(5);
	cmd.add_parm_input_varchar("Mo_Test");
	cmd.add_parm_input_varchar("*");
	cmd.add_parm_input_varchar("");
	cmd.add_parm_input_varchar("aaa");
	cmd.add_parm_input_varchar("");
	cmd.add_parm_output(ModelHelper.Enums.DataType.DBTYPE_I4,true);
	cmd.add_parm_output(ModelHelper.Enums.DataType.VARCHAR,1024);
	var rc = cmd.execute(true).fetch();
	F.echo(F.format("数据记录：{0}条",rc.recordcount),true);
	F.echo(F.format("查询记录：{0}条",rc.count()),true);
	F.echo(F.format("输出值：{0}",cmd.getparm(8)),true);
	F.echo(F.format("输出值：{0}",cmd.getparm(9)),true);
	F.echo(F.format("返回值：{0}",cmd.get_parm_return()),true);
	F.echo(rc.getjson(),true);
});
HomeController.extend("db", function(){
	Model__.allowDebug=true;
	Model__.useCommandForUpdateOrInsert=true;
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
	this.display("Data");
});
HomeController.extend("mysql", function(){
	Model__.allowDebug=true;
	Model__.useCommandForUpdateOrInsert=true;
	Model__.defaultDBConf = "mysql";
	//Model__.execute("DROP DATABASE Public");
	//Model__.execute("CREATE DATABASE Public");
	Model__.execute("USE Public");
	//Model__.execute(
	//	"create table `Mo_Public`("
	//	+"Id int(4) not null primary key auto_increment,"
	//	+"name varchar(50),"
	//	+"age int(4) default '0',"
	//	+"birthday datetime,"
	//	+"memo TEXT,"
	//	+"grade int(4) default '0'"
	//	+")"
	//);
	Model__.execute("INSERT INTO Mo_Public values(),(),(),()");
	M("Public","Id").where("id=1").update("name","艾恩-" + F.random.word(10));
	this.assign("lastRows",Model__.lastRows);
	var rc = M("Public","Id").limit(1,10).query().fetch();
	this.assign("recordcount",rc.recordcount);
	this.assign("count",rc.count());
	rc.assign("data");
	this.display("Data");
});
HomeController.extend("clearcache", function(){
	Mo.ClearCompiledCache();
	Mo.ModelCacheClear();
	Mo.ClearLibraryCache();
	if(F.server("HTTP_REFERER")!="")F.goto(F.server("HTTP_REFERER")); else F.goto("/");
});

HomeController.extend("Qrcode",function(){
	/*todo*/
	F.require("qrcode");
	var qr = F.exports.qrcode(0,"Q");
	qr.useBestMaskPattern = true;
	qr.flush("为新Controller对象扩展一个新方法，对应相应的动作",2);
});
HomeController.extend("Soap",function(){
	/*todo*/
	F.require("net/http/soap");
	var soap = new F.exports.net.http.soap("http://webservice.webxml.com.cn/WebServices/IpAddressSearchWebService.asmx","http://WebXml.com.cn/")
	Mo.assign("url",soap.Url);
	Mo.assign("result",F.encodeHtml(soap.Invoke("getCountryCityByIp","theIpAddress","222.195.158.135")));
	Mo.assign("request",F.encodeHtml(soap.Request));
	Mo.assign("comment","直接指定参数请求WebServices");
	Mo.display("Soap");
});
HomeController.extend("safecode",function(){
	/*todo*/
	F.require("safecode");
	F.exports.safecode("sessionname",{length:4,odd:0,padding:3,font:"songti"});
});
</script>