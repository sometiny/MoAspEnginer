var httprequest = require("net/http/request");
function TXAPI(key){
	this.key = key ||"";
	this.output="json";
	this.sn = "";
	this.url = "http://apis.map.qq.com/uri/v1/";
}
TXAPI.New = function(key){return new TXAPI(key);};
TXAPI.COORD_TYPE={
	"GPS":1,
	"SOGOU":2,
	"BAIDU":3,
	"MAPBAR":4,
	"GOOGLE":5,
	"SOGOUM":6
};
TXAPI.prototype.Translate = function(locations,coord_type){
	coord_type = coord_type || 1;
	var uri="http://apis.map.qq.com/ws/coord/v1/translate?locations=" + locations + "&type=" + coord_type + "&key=" + F.encode(this.key);
	var http = httprequest.create(uri);
	var res = http.getjson("utf-8");
	if(res){
		if(res.status==0)return {"x":res.locations[0].lat,"y":res.locations[0].lng};
	}
	return {"x":0,"y":0};
};
TXAPI.prototype.Geoencoder = function(location,get_poi){
	get_poi = get_poi || 0;
	var uri="http://apis.map.qq.com/ws/geocoder/v1/?location=" + location + "&get_poi=" + get_poi + "&key=" + F.encode(this.key);
	return httprequest.create(uri).getjson("utf-8") || {"status":-1,"message":"data error"};
};
TXAPI.prototype.Geodecoder = function(address,region){
	region = region || "";
	var uri="http://apis.map.qq.com/ws/geocoder/v1/?address=" + F.encode(address) + "&region=" + F.encode(region) + "&key=" + F.encode(this.key);
	return httprequest.create(uri).getjson("utf-8") || {"status":-1,"message":"data error"};
};
TXAPI.prototype.GetSuggestion = function(keyword,region){
	region = region || "";
	var uri="http://apis.map.qq.com/ws/place/v1/suggestion/?keyword=" + F.encode(keyword) + "&region=" + F.encode(region) + "&key=" + F.encode(this.key);
	return httprequest.create(uri).getjson("utf-8") || {"status":-1,"message":"data error"};
};
TXAPI.prototype.SearchRegion = function(keyword,region,auto_extend,orderby,page_size,page_index){
	auto_extend = auto_extend ||0;
	return this.Search(keyword,"region(" + region + "," + auto_extend + ")",orderby,page_size,page_index);
};
TXAPI.prototype.SearchNearby = function(keyword,location,radius,orderby,page_size,page_index){
	radius = radius ||1000;
	return this.Search(keyword,"nearby(" + location + "," + radius + ")",orderby,page_size,page_index);
};
TXAPI.prototype.SearchRectangle = function(keyword,location1,location2,orderby,page_size,page_index){
	return this.Search(keyword,"rectangle(" + location1 + "," + location2 + ")",orderby,page_size,page_index);
};
TXAPI.prototype.Search = function(keyword,boundary,orderby,page_size,page_index){
	page_size = page_size || 50;
	page_index = page_index || 1;
	orderby = orderby || "_distance asc";
	var uri="http://apis.map.qq.com/ws/place/v1/search/?keyword=" + F.encode(keyword) 
	+ "&boundary=" + F.encode(boundary) 
	+ "&orderby=" + F.encode(orderby) 
	+ "&page_size=" + (page_size) 
	+ "&page_index=" + (page_index) 
	+ "&key=" + F.encode(this.key);
	return httprequest.create(uri).getjson("utf-8") || {"status":-1,"message":"data error"};
};
module.exports = TXAPI;