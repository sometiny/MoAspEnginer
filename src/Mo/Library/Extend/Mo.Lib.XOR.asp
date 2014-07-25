<script language="jscript" runat="server">
var MoLibXOR={
	"paddingLeft":function(str,len,padding){
		if(str.length>=len)return str;
		if(padding==undefined)padding="0";
		var temp=str;
		for(var i=1;i<=len-str.length;i++){
			temp = "0" + temp;
		}
		return temp;
	},
	"bin2hex":function(sou){
		var result=[];
		for(var i=0;i<sou.length;i++){
			result.push(this.paddingLeft(sou[i].toString(16),2));	
		}
		return result.join("");
	},
	"hex2bin":function(str){
		var result=[];
		for(var i=0;i<str.length;i+=2){
			eval("var a=0x" + str.substr(i,2) + ";");
			result.push(a);
		}
		return result;
	},
	"bin2str":function(str){
		var result = "";
		for(var i=0;i<str.length;i++){
			a=str[i];
			if(a<=0xff && a>0){
				result+=String.fromCharCode(a);
			}else{
				i++;
				h=str[i];
				i++;
				l=str[i];
				result+=String.fromCharCode((h<<8)+l);
			}
		}
		return result;	
	},
	"complex":function(source,pass){
		for(var i=0;i<source.length;i++){
			source[i] = source[i] ^ pass[i%pass.length];
		}	
	},
	"str2byte":function(str){
		if(str.length<=0)return [];
		var result=[];
		for(var i=0;i<str.length;i++){
			var charcode = str.charCodeAt(i);
			if(charcode<=0xff){
				result.push(charcode);
			}else{
				var h = charcode>>8;
				var l = charcode & 0xff;
				result.push(0x00);
				result.push(h);
				result.push(l);
			}
		}
		return result;
	},
	"complexPwd":function(pwd){
		if(pwd.length<=16)return this.str2byte(pwd);
		var pwds=[];
		var byteSource,byteNext;
		while(pwd.length>16){
			pwds.push(pwd.substr(0,16));
			pwd = pwd.substr(16);
			if(pwd.length<=16)pwds.push(pwd);
		}
		for(var i=0;i<pwds.length;i++){
			if(i==0){
				byteSource = this.str2byte(pwds[0]);
				byteNext = this.str2byte(pwds[1]);
				i++;
			}else{
				byteNext = this.str2byte(pwds[i]);
			}
			this.complex(byteSource,byteNext);	
		}
		return byteSource;
	},
	/****************************************************
	'@DESCRIPTION:	encrypt
	'@PARAM:	str [String] : source string
	'@PARAM:	password [String] : password
	'@RETURN:	[String] encrypt result
	'****************************************************/
	encrypt:function(str,password){
		if(str.length<=0)return "";
		var binSource=this.str2byte(str);
		var binPassword=this.complexPwd(password);
		this.complex(binSource,binPassword);
		return this.bin2hex(binSource);
	},
	/****************************************************
	'@DESCRIPTION:	decrypt
	'@PARAM:	str [String] : encrypted string
	'@PARAM:	password [String] : password
	'@RETURN:	[String] decrypt result
	'****************************************************/
	decrypt:function(str,password){
		if(str.length<=0)return "";
		if(str.length%2!=0)return str;
		var binSource=this.hex2bin(str);
		var binPassword=this.complexPwd(password);
		this.complex(binSource,binPassword);
		return this.bin2str(binSource);
	}
};
</script>