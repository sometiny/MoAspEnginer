/*
'by anlige at www.9fn.net
$net.IpToLong
$net.LongToIp
$net.InSameNetWork
$net.IsIP
*/
var $net={
	/****************************************************
	'@DESCRIPTION:	convert ip string to long
	'@PARAM:	d [String] : ip string
	'@RETURN:	[Long] result
	'****************************************************/
	IpToLong:function(d){
		var c=0;
		d=""+d+"";
		if(d.indexOf(".")<=0)return 0;
		var a=d.split(".");
		if(a.length!=4)return 0;
		for(var b=0;b<4;b++){
			if(isNaN(a[b])||parseInt(a[b])<0||parseInt(a[b])>255)return 0;
			c+=parseInt(a[b])*Math.pow(256,3-b);
		}
		return c;
	},
	/****************************************************
	'@DESCRIPTION:	convert long to ip string
	'@PARAM:	b [Long] : data
	'@RETURN:	[String] ip string
	'****************************************************/
	LongToIp:function(b){
		if(isNaN(b))return "";
		b=parseInt(b);
		var a=new Array(4);
		a[0]=b>>>24;
		a[1]=(b>>>16) & 0xff;
		a[2]=(b>>>8) & 0xff;
		a[3]=b  & 0xff;
		return a.join(".");
	},
	/****************************************************
	'@DESCRIPTION:	ensure ip is in a specific network
	'@PARAM:	a [String] : network. eg: '192.168.1.1/255.255.255.0' or '192.168.1.1/24'
	'@PARAM:	g [String] : ip need to ensure
	'@PARAM:	f [Variant] : forget it;
	'@RETURN:	[Boolean] true/false
	'****************************************************/
	InSameNetWork:function(a,g,f){if(f==undefined){f=g;if(a.indexOf("/")<=0)a+="/255.255.255.255";if(a.indexOf("/")==a.length){return false}var e=a.split("/");if(e.length!=2){return false}a=e[1];g=e[0]}if(!isNaN(a)){var b=parseInt(a);if(a<0||a>32){return false}var d=0;for(var c=1;c<=32;c++){if(c<=a){d+=Math.pow(2,32-c)}}a=this.LongToIp(d)}if(!this.IsIP(a)||!this.IsIP(g)||!this.IsIP(f)){return false}a=this.IpToLong(a);g=this.IpToLong(g);f=this.IpToLong(f);if((a&g)!=(a&f)){return false}return true},

	/****************************************************
	'@DESCRIPTION:	ensure ip is a real ip.
	'@PARAM:	c [String] : ip string
	'@RETURN:	[Boolean] true/false
	'****************************************************/
	IsIP:function(c){if(c.indexOf(".")<=0){return false}var a=c.split(".");if(a.length!=4){return false}for(var b=0;b<4;b++){if(a[b]==""||isNaN(a[b])||parseInt(a[b])<0||parseInt(a[b])>255){return false}}return true}
};
return exports.net = $net;