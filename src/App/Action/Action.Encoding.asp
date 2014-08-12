<script language="jscript" runat="server">
/*
** 创建一个新的Action对象；
** 语法：newAction = IAction.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
ActionEncoding = IAction.create(); 
ActionEncoding.extend("Index",function(){
	var Encoding = F.require("encoding");
	var string="小蜻蜓123abcdefg+%&=！";
	var gbka = Encoding.gbk.getByteArray(string);
	var gbkc = Encoding.gbk.getWordArray(string);
	var gbkb = Encoding.gbk.toString(gbkc);
	F.echo("encodeURIComponent(gbk)：" + Encoding.encodeURIComponent(string,"gbk"),true);
	F.echo("encodeURI(gbk)：" + Encoding.encodeURI(string,"gbk"),true);
	F.echo("decode(gbk)：" + Encoding.decode("%d0%a1%f2%df%f2%d1123abcdefg%2b%25%26%3d%a3%a1","gbk"),true);
	F.echo("GBKByteArray："+gbka,true);
	F.echo("GBKWordArray："+gbkc,true);
	F.echo("GBKBytesHex："+Encoding.hex.stringify(gbka),true);
	F.echo("GBKBase64："+ F.base64.encode(gbka),true);
	F.echo("GBKString："+gbkb,true);
	F.echo("<hr/>");
	
	var utf8a = Encoding.utf8.getByteArray(string);
	var utf8c = Encoding.utf8.getWordArray(string);
	var utf8b = Encoding.utf8.toString(utf8c);
	F.echo("encodeURIComponent(UTF-8)：" + Encoding.encodeURIComponent(string),true);
	F.echo("encodeURI(UTF-8)：" + Encoding.encodeURI(string),true);
	F.echo("decode(UTF-8)：" + Encoding.decode("%e5%b0%8f%e8%9c%bb%e8%9c%93123abcdefg%2b%25%26%3d%ef%bc%81"),true);
	F.echo("UTF8ByteArray："+utf8a,true);
	F.echo("UTF8WordArray："+utf8c,true);
	F.echo("UTF8BytesHex："+ Encoding.hex.stringify(utf8a),true);
	F.echo("UTF8Base64："+ F.base64.encode(utf8a),true);
	F.echo("UTF8String："+utf8b,true);
	F.echo("<hr/>");
	
	var u1=Encoding.unicode.getWordArray(string);
	var u2=Encoding.unicode.getByteArray(string);
	var u3=Encoding.unicode.toString(u1);
	F.echo("UnicodeByteArray："+u2,true);
	F.echo("UnicodeWordArray："+u1,true);
	F.echo("UnicodeBytesToWords："+Encoding.unicode.bytesToWords(u2),true);
	F.echo("UnicodeBytesHex："+Encoding.hex.stringify(u2),true);
	F.echo("UnicodeBase64："+ F.base64.encode(u2),true);
	F.echo("UnicodeString："+u3,true);
	F.echo("<hr/>");
});
ActionEncoding.extend("empty",function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>