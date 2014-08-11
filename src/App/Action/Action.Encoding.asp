<script language="jscript" runat="server">
/*
** 创建一个新的Action对象；
** 语法：newAction = IAction.create([__construct[,__destruct]]);
** __construct：构造函数；
** __destruct：析构函数；
*/
ActionEncoding = IAction.create(); 

/*
** 为新Action对象扩展一个新方法，对应相应的动作；
** 语法：newAction.extend(funcName,callback);
** funcName：方法名；
** callback：要执行的函数；
*/
ActionEncoding.extend("Index",function(){
	F.require("encoding");
	var string="小蜻蜓123abcdefg！";
	var gbka = F.exports.encoding.gbk.getByteArray(string);
	var gbkc = F.exports.encoding.gbk.getWordArray(string);
	var gbkb = F.exports.encoding.gbk.toString(gbka);
	F.echo("GBKByteArray："+gbka,true);
	F.echo("GBKWordArray："+gbkc,true);
	F.echo("GBKBytesHex："+F.exports.encoding.hex.stringify(gbka),true);
	F.echo("GBKBase64："+ F.base64.encode(gbka),true);
	F.echo("GBKString："+gbkb,true);
	F.echo("<hr/>");
	
	var utf8a = F.exports.encoding.utf8.getByteArray(string);
	var utf8c = F.exports.encoding.utf8.getWordArray(string);
	var utf8b = F.exports.encoding.utf8.toString(utf8c);
	F.echo("UTF8ByteArray："+utf8a,true);
	F.echo("UTF8WordArray："+utf8c,true);
	F.echo("UTF8BytesHex："+ F.exports.encoding.hex.stringify(utf8a),true);
	F.echo("UTF8Base64："+ F.base64.encode(utf8a),true);
	F.echo("UTF8String："+utf8b,true);
	F.echo("<hr/>");
	
	var u1=F.exports.encoding.unicode.getWordArray(string);
	var u2=F.exports.encoding.unicode.getByteArray(string);
	var u3=F.exports.encoding.unicode.toString(u1);
	F.echo("UnicodeByteArray："+u2,true);
	F.echo("UnicodeWordArray："+u1,true);
	F.echo("UnicodeBytesToWords："+F.exports.encoding.unicode.bytesToWords(u2),true);
	F.echo("UnicodeBytesHex："+F.exports.encoding.hex.stringify(u2),true);
	F.echo("UnicodeBase64："+ F.base64.encode(u2),true);
	F.echo("UnicodeString："+u3,true);
	F.echo("<hr/>");
});
ActionEncoding.extend("empty",function(name){
	F.echo("调用不到" + name + "方法，就跑到empty方法了！",true);
});
</script>