<script language="jscript" runat="server">
SoapController = IController.create();
SoapController.extend("Index", function(){
	/*todo*/
	var SOAP = require("net/http/soap");
	if(!SOAP){
		F.echo("模块net不存在，需要安装。",true);
		return;
	}
	var soap = new SOAP("http://webservice.webxml.com.cn/WebServices/IpAddressSearchWebService.asmx","http://WebXml.com.cn/")
	Mo.assign("url",soap.Url);
	Mo.assign("result",F.encodeHtml(soap.Invoke("getCountryCityByIp","theIpAddress","222.195.158.135")));
	Mo.assign("request",F.encodeHtml(soap.Request));
	Mo.assign("comment","直接指定参数请求WebServices");
	Mo.display("Home:Soap");
});
</script>