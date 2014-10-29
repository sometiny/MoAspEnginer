<script language="jscript" runat="server">
CryptoJSController = IController.create(function(){
	F.vendor("CryptoJS").globalize__("CryptoJS");
	if(F.post("salt")!=""){
		CryptoJS.require.Hmac();
	}
	this.empty=function(a){
		F.echo("没找到动作：" + a);
	};
},function(){
	if(F.server("REQUEST_METHOD")=="POST"){
		var result=JSON.stringify({
			method:Mo.Action,
			t:F.get("t"),
			value:Mo.value("result"),
			debug:Mo.value("debug")
		});
		F.echo("<s\cript type=\"text/javascript\">window.parent.Callback(" + result + ");</\script>");
	}
});
CryptoJSController.extend("Index",function(){
	this.display("Home:CryptoJS");
});
/*
 *摘要算法：MD5/sha[1|3|224|256|384|512]/pbkdf2/evpkdf/ripemd160
 */
CryptoJSController.extend("md5",function(){
	CryptoJS.require.MD5();
	var result="";
	if(F.post("salt")=="") result =CryptoJS.MD5(F.post("txt_hash_src"));
	else result = CryptoJS.HmacMD5(F.post("txt_hash_src"),F.post("salt"));
	this.assign("result",result.toString());
});
CryptoJSController.extend("sha1",function(){
	CryptoJS.require.SHA1();
	var result="";
	if(F.post("salt")=="") result =CryptoJS.SHA1(F.post("txt_hash_src"));
	else result = CryptoJS.HmacSHA1(F.post("txt_hash_src"),F.post("salt"))
	this.assign("result",result.toString());
});
CryptoJSController.extend("sha3",function(){
	CryptoJS.require("sha3","x64-core");
	var result="";
	if(F.post("salt")=="") result =CryptoJS.SHA3(F.post("txt_hash_src"));
	else result = CryptoJS.HmacSHA3(F.post("txt_hash_src"),F.post("salt"))
	this.assign("result",result.toString());
});
CryptoJSController.extend("sha224",function(){
	CryptoJS.require("sha224","sha256");
	var result="";
	if(F.post("salt")=="") result =CryptoJS.SHA224(F.post("txt_hash_src"));
	else result = CryptoJS.HmacSHA224(F.post("txt_hash_src"),F.post("salt"))
	this.assign("result",result.toString());
});
CryptoJSController.extend("sha256",function(){
	CryptoJS.require("sha256");
	var result="";
	if(F.post("salt")=="") result =CryptoJS.SHA256(F.post("txt_hash_src"));
	else result = CryptoJS.HmacSHA256(F.post("txt_hash_src"),F.post("salt"))
	this.assign("result",result.toString());
});
CryptoJSController.extend("sha384",function(){
	CryptoJS.require("sha384","x64-core","sha512");
	var result="";
	if(F.post("salt")=="") result =CryptoJS.SHA384(F.post("txt_hash_src"));
	else result = CryptoJS.HmacSHA384(F.post("txt_hash_src"),F.post("salt"))
	this.assign("result",result.toString());
});
CryptoJSController.extend("sha512",function(){
	CryptoJS.require("sha512","x64-core");
	var result="";
	if(F.post("salt")=="") result =CryptoJS.SHA512(F.post("txt_hash_src"));
	else result = CryptoJS.HmacSHA512(F.post("txt_hash_src"),F.post("salt"))
	this.assign("result",result.toString());
});
CryptoJSController.extend("pbkdf2",function(){
	CryptoJS.require.PBKDF2();
	var salt=CryptoJS.enc.Utf8.parse(F.post("salt"));
	var mi=CryptoJS.PBKDF2(F.post("txt_hash_src"), salt, {keySize: 128/32,iterations: 10});
	this.assign("result",mi.toString());
});
CryptoJSController.extend("evpkdf",function(){
	CryptoJS.require.EvpKDF();
	var salt=CryptoJS.enc.Utf8.parse(F.post("salt"));
	var mi=CryptoJS.EvpKDF(F.post("txt_hash_src"), salt, {keySize: 128/32,iterations: 10});
	this.assign("result",mi.toString());
});
CryptoJSController.extend("ripemd160",function(){
	CryptoJS.require("ripemd160");
	var mi=CryptoJS.RIPEMD160(F.post("txt_hash_src"));
	this.assign("result",mi.toString());
});

/*
 *编码算法：base64/utf8/utf16/hex/latin1
 */
CryptoJSController.extend("base64",function(){
	CryptoJS.require("enc-base64");
    if(F.get("mode")=="encrypt"){
		var src = CryptoJS.enc.Utf8.parse(F.post("txt_crypt_src"));
		var base64string = CryptoJS.enc.Base64.stringify(src);
		this.assign("result",base64string.toString(CryptoJS.enc.Utf8));
	}else{
		var base64string = CryptoJS.enc.Base64.parse(F.post("txt_crypt_src"));
		this.assign("result",CryptoJS.enc.Utf8.stringify(base64string));
	}
});

/*
 *加密算法：rc4/aes
 */
CryptoJSController.extend("rc4",function(){
	this.crypt_core("RC4");
});
CryptoJSController.extend("rabbitlegacy ", function(){
	this.crypt_core("RabbitLegacy");
});
CryptoJSController.extend("rabbit ", function(){
	this.crypt_core("Rabbit");
});
CryptoJSController.extend("des",function(){
	this.crypt_core("DES");
});
CryptoJSController.extend("aes",function(){
	this.crypt_core("AES");
});
CryptoJSController.extend("crypt_core",function(method){
	CryptoJS.require.Padding().Mode();
	CryptoJS.require[method]().Format.Hex();
	var key = CryptoJS.enc.Utf8.parse(F.post("crypt_key"));   
	var iv  = CryptoJS.enc.Utf8.parse(F.post("crypt_iv"));
	var cfg={ 
    	iv: iv,
    	mode:CryptoJS.mode[F.post("crypt_mode")],
    	padding:CryptoJS.pad[F.post("crypt_padding")],
    	format:CryptoJS.format.Hex
    };
    //cfg用于AES和DES，其他加密会忽略部分设置
    if(F.get("mode")=="encrypt"){
		var srcs = CryptoJS.enc.Utf8.parse(F.post("txt_crypt_src"));
		this.assign("result",CryptoJS[method].encrypt(srcs, key, cfg).toString());
	}else{
		var srcs = CryptoJS.enc.Hex.parse(F.post("txt_crypt_src"));
		var decryptdata = CryptoJS[method].decrypt(CryptoJS.lib.CipherParams.create({ ciphertext:srcs}), key,cfg); //解密
		this.assign("result",decryptdata.toString(CryptoJS.enc.Utf8));
	}
});
</script>