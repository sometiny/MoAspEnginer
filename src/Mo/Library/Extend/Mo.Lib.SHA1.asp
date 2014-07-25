<script language="JScript" runAt="server">
/*'by anlige at www.9fn.net*/
var MoLibSHA1={
	hex:function(b){
		var c="0123456789abcdef";
		var d="";
		for(var a=7;a>=0;a--){
			d+=c.charAt((b>>(a*4))&15)
		}
		return d
	},
	AlignSHA1:function(c){
		var a=((c.length+8)>>6)+1,d=new Array(a*16);
		for(var b=0;b<a*16;b++){
			d[b]=0
		}
		for(b=0;b<c.length;b++){
			d[b>>2]|=c.charCodeAt(b)<<(24-(b&3)*8)
		}
		d[b>>2]|=128<<(24-(b&3)*8);
		d[a*16-1]=c.length*8;
		return d
	},
	add:function(a,d){
		var c=(a&65535)+(d&65535);
		var b=(a>>16)+(d>>16)+(c>>16);
		return(b<<16)|(c&65535)
	},
	rol:function(a,b){
		return(a<<b)|(a>>>(32-b))
	},
	ft:function(e,a,g,f){
		if(e<20){
			return(a&g)|((~a)&f)
		}
		if(e<40){
			return a^g^f
		}
		if(e<60){
			return(a&g)|(a&f)|(g&f)
		}
		return a^g^f;
	},
	kt:function(a){
		return(a<20)?1518500249:(a<40)?1859775393:(a<60)?-1894007588:-899497514;
	},
	/****************************************************
	'@DESCRIPTION:	fetch SHA1 checksum
	'@PARAM:	v [String] : source string
	'@RETURN:	[String] checksum
	'****************************************************/
	SHA1:function(v){
		var u=MoLibSHA1.AlignSHA1(v);
		var y=new Array(80);
		var s=1732584193;
		var r=-271733879;
		var q=-1732584194;
		var p=271733878;
		var o=-1009589776;
		for(var l=0;l<u.length;l+=16){
			var n=s;var m=r;var k=q;var h=p;var f=o;
			for(var g=0;g<80;g++){
				if(g<16){
					y[g]=u[l+g]
				}else{
					y[g]=MoLibSHA1.rol(y[g-3]^y[g-8]^y[g-14]^y[g-16],1)
				}
				t=MoLibSHA1.add(MoLibSHA1.add(MoLibSHA1.rol(s,5),MoLibSHA1.ft(g,r,q,p)),MoLibSHA1.add(MoLibSHA1.add(o,y[g]),MoLibSHA1.kt(g)));
				o=p;
				p=q;
				q=MoLibSHA1.rol(r,30);
				r=s;
				s=t
			}
			s=MoLibSHA1.add(s,n);
			r=MoLibSHA1.add(r,m);
			q=MoLibSHA1.add(q,k);
			p=MoLibSHA1.add(p,h);
			o=MoLibSHA1.add(o,f);
		}
		return MoLibSHA1.hex(s)+MoLibSHA1.hex(r)+MoLibSHA1.hex(q)+MoLibSHA1.hex(p)+MoLibSHA1.hex(o);
	},
	/****************************************************
	'@DESCRIPTION:	i write this method to get a complex SHA1 result.
	'@PARAM:	v [String] : SHA1 result
	'@RETURN:	[String] complex result
	'****************************************************/
	SHA2:function(v){
		var sha1 = MoLibSHA1.SHA1(v||"");
		for(var i=0;i<13;i++){
			sha1 = MoLibSHA1.Complex2(MoLibSHA1.Split(sha1));
		}
		return MoLibSHA1.SHA1(sha1);
	},
	Split:function(sha1){
		var block=[2,5,8,17,1,7];
		var blocks=[];
		for(var i=0;i<=5;i++){
			blocks.push(sha1.substr(0,block[i]));
			sha1 = sha1.substr(block[i]);
		}
		return blocks;
	},
	Complex2:function(blocks){
		var temp="";
		temp=blocks[0];
		blocks[0]=blocks[2];
		blocks[2]=temp;
		temp=blocks[1];
		blocks[1]=blocks[3];
		blocks[3]=temp;
		temp=blocks[4];
		blocks[4]=blocks[3];
		blocks[3]=temp;
		temp=blocks[5];
		blocks[5]=blocks[0];
		blocks[0]=temp;
		return blocks.join("");
	}
};
</script>
