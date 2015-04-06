<script language="jscript" runat="server">
EncodingController = IController.create(); 
EncodingController.extend("Index",function(){
	var Encoding = require("encoding");
	if(!Encoding){
		F.echo("模块encoding不存在，需要安装。",true);
		return;
	}
	var string="小蜻蜓123abcdefg+%&=！";
	var gbka = Encoding.gbk.getByteArray(string);
	var gbkc = Encoding.gbk.getWordArray(string);
	var gbkb = Encoding.gbk.toString(gbkc);
	this.assign("encodeURIComponentgbk", Encoding.encodeURIComponent(string,"gbk"));
	this.assign("encodeURIgbk", Encoding.encodeURI(string,"gbk"));
	this.assign("decodegbk", Encoding.decode("%d0%a1%f2%df%f2%d1123abcdefg%2b%25%26%3d%a3%a1","gbk"));
	this.assign("GBKByteArray", gbka);
	this.assign("GBKWordArray", gbkc);
	this.assign("GBKBytesHex", Encoding.hex.stringify(gbka));
	this.assign("GBKBase64", base64.encode(gbka));
	this.assign("GBKString", gbkb);
	
	var utf8a = Encoding.utf8.getByteArray(string);
	var utf8c = Encoding.utf8.getWordArray(string);
	var utf8b = Encoding.utf8.toString(utf8c);
	this.assign("encodeURIComponentutf8", Encoding.encodeURIComponent(string));
	this.assign("encodeURIutf8", Encoding.encodeURI(string));
	this.assign("decodeutf8", Encoding.decode("%e5%b0%8f%e8%9c%bb%e8%9c%93123abcdefg%2b%25%26%3d%ef%bc%81"));
	this.assign("UTF8ByteArray", utf8a);
	this.assign("UTF8WordArray", utf8c);
	this.assign("UTF8BytesHex", Encoding.hex.stringify(utf8a));
	this.assign("UTF8Base64", base64.encode(utf8a));
	this.assign("UTF8String", utf8b);
	var u1=Encoding.unicode.getWordArray(string);
	var u2=Encoding.unicode.getByteArray(string);
	var u3=Encoding.unicode.toString(u1);
	this.assign("UnicodeByteArray", u2);
	this.assign("UnicodeWordArray", u1);
	this.assign("UnicodeBytesToWords", Encoding.unicode.bytesToWords(u2));
	this.assign("UnicodeBytesHex", Encoding.hex.stringify(u2));
	this.assign("UnicodeBase64", base64.encode(u2));
	this.assign("UnicodeString", u3);
	this.display("Home:Encoding");
});
EncodingController.extend("empty",function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！");
});
</script>