function BDAPI(ak,sk){
	this.ak = ak ||"";
	this.sk = sk ||"";
	this.output="json";
	this.sn = "";
	this.url = "http://api.map.baidu.com/geocoder/v2/";
	this.uri = "/geocoder/v2/";
	F.require("net/http/request");
}
BDAPI.COORDTYPE={
	"BAIDU":"bd09ll",
	"GCJ":"gcj02ll",
	"WGS":"wgs84ll"
};
BDAPI.New = function(ak,sk){return new BDAPI(ak,sk);};
BDAPI.prototype.GPSConvert = function(coords,from,to){
	this.sn="";
	from = from || 1;
	to = to || 5;
	this.uri="/geoconv/v1/?ak=" + this.ak + "&output=" + this.output + "&coords=" + F.encode(coords) + "&from=" + from + "&to=" + to;
	if(this.sk!="")this.sn = F.md5(encodeURIComponent(this.uri+this.sk));
	var http = F.exports.net.http.request.create("http://api.map.baidu.com" + this.uri + "&sn=" + this.sn);
	var res = http.getjson("utf-8");
	if(res){
		if(res.status==0)return {"X":res.result[0].x,"Y":res.result[0].y};
		return {"X":0,"Y":0}
	}
	return {"X":0,"Y":0};
};
BDAPI.prototype.getGPSFromAddress = function(address,city){
	city = city ||"";
	this.sn="";
	if(this.sk!="")this.sn = F.md5(this.uri+this.sk);
	var http = F.exports.net.http.request.create("http://api.map.baidu.com/geocoder/v2/?ak=" + this.ak + "&sn=" + this.sn + "&output=" + this.output + "&address=" + F.encode(address) + "&city=" + F.encode(city));
	return http.getjson("utf-8");
};
BDAPI.prototype.getAddressFromGPS = function(location,coordtype,pois){
	if(pois===undefined)pois=0;
	coordtype = coordtype || BDAPI.COORDTYPE.WGS;
	this.sn="";
	if(this.sk!="")this.sn = F.md5(this.uri+this.sk);
	var http = F.exports.net.http.request.create("http://api.map.baidu.com/geocoder/v2/?ak=" + this.ak + "&sn=" + this.sn + "&output=" + this.output + "&location=" + F.encode(location) + "&coordtype=" + F.encode(coordtype) + "&pois=" + F.encode(pois));
	return http.getjson("utf-8");
};
return exports.BDAPI = BDAPI;