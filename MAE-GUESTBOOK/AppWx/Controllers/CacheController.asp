<script language="jscript" runat="server">
CacheController = IController.create(function(){
	if(F.session("wx_auth_name")=="") {
		F.goto("?m=Login&error=1&msg=" + F.encode("请登录。"));
		return false;
	}
});
/*清理缓存，响应地址：?m=Cache或?m=Cache&a=Index*/
CacheController.extend("Index",function(){
	F.echo("清理编译缓存：" + Mo.ClearCompiledCache(), true);
	F.echo("清理模块缓存：" + Mo.ModelCacheClear(), true);
	F.echo("清理类库缓存：" + Mo.ClearLibraryCache(), true);
	if(F.server("HTTP_REFERER")!="") F.goto(F.server("HTTP_REFERER")); else F.goto("?m=Admin");
});
CacheController.extend("empty",function(a){
	F.goto("?m=" + Mo.Method + "&error=1&msg=" + F.encode("不支持的方法：" + a + "。"));
});
</script>