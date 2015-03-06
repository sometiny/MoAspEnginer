/*
** File: qqwry.js
** Usage: get location from ip;
**		F.exports.qqwry(ip); //get location
**			@parameter ip [string], ip address.
**			@return [object], location data: {code:200,location:location,state:state,city:city,area:area,address:address} or {code:500,msg:"无法打开IP数据库。"};
**		F.exports.qqwry.opt(field,value); //get location
**			@parameter field [string], config field name, only 'path' is supported.
**			@parameter value [string], config field value, the path of your own 'qqwry.dat'.
** About: 
**		support@mae.im
*/
if(exports.qqwry) return exports.qqwry;
var cfg = {
	path:__DIR__ + "\\exts\\qqwry.dat"
};

function $qqwry(ip){
	//可以下载最新的纯真ip库，将qqwry.dat文件放在扩展下的exts目录即可。
	//如果有自己的纯真ip库，可以调用F.exports.qqwry.opt方法，设置path值为你的qqwry.dat的路径即可。
	if(!IO.file.exists(cfg.path)) return {code:500,msg:"无法打开IP数据库。"};
	if(!F.exports.encoding)F.require("encoding");
	if(!F.vbs.include("vbs/qqwry")) return {code:500,msg:"无法加载扩展。"};;
	var $base = F.vbs.require("QQWry","UseCode",true,"QQWryFile",cfg.path),
		location="",
		address="";
	try{
		$base.QQWry(ip);
		location = $base.Country;
		address  = $base.LocalStr;
		if(location=="") return {code:500,msg:"查找失败。"};
	}catch(ex){
		return {code:500,msg:ex.message};
	}
	if(location!="") location = F.exports.encoding.gbk.getString(F.exports.encoding.hex.parse(location));
	if(address!="") address = F.exports.encoding.gbk.getString(F.exports.encoding.hex.parse(address));
	location = F.string.replace(location,"^(内蒙古|宁夏|广西|西藏|新疆)","$1省");
	
	var	state="",city="",area="",
		result = F.string.matches(location,/^(.+?)(省|市)((.+?)(市|县|区)((.+?)(省|市|区|县))?)?$/igm);
	if(result.length>0){
		state = result[0][1]+result[0][2];
		city = result[0][4]+result[0][5];
		area = result[0][7]+result[0][8];
	}
	if(city=="")city = state;
	return {code:200,location:location,state:state,city:city,area:area,address:address};
};
$qqwry.opt = function(name,value){
	cfg[name] = value;
};
return exports.qqwry = $qqwry;