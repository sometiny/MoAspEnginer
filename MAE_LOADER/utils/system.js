/*
** File: system.js
** Usage: .net framework classes
** About: 
**		support@mae.im
*/
if(!exports.system) exports.system={};
else return;
if(!exports.encoding)F.require("encoding");
exports.system.random = (function(){
	var $base = F.activex("System.Random");
	var $random = {enabled:$base!=null};
	$random.next = function(){
		if(arguments.length==0) return $base.Next();
		if(arguments.length==1) return $base.Next_3(arguments[0]);
		if(arguments.length==2) return $base.Next_2(arguments[0],arguments[1]);
	};
	$random.nextDouble = function(){
		return $base.NextDouble();
	};
	return $random;
})();

exports.system.encoding = (function(){
	var $base = F.activex("System.Text.UTF8Encoding");
	var $base2 = F.activex("System.Text.Encoding");
	var $encoding = {enabled:$base!=null};
	var $utf8= $encoding.utf8 ={};
	$utf8.getString = function(src){return $base.GetString(src);};
	$utf8.getBytes = function(src){return $base.GetBytes_4(src);};
	return $encoding;
})();

exports.system.array = (function(){
	return F.activex("System.Collections.ArrayList");
})();

exports.system.hash = (function(){
	var $hash={},maps={
		"md5":"MD5CryptoServiceProvider",
		"hmacmd5":"HMACMD5",
		"sha1":"SHA1Managed",
		"sha384":"SHA384Managed",
		"sha256":"SHA256Managed",
		"sha512":"SHA512Managed",
		"hmacsha1":"HMACSHA1",
		"hmacsha256":"HMACSHA256",
		"hmacsha384":"HMACSHA384",
		"hmacsha512":"HMACSHA512",
		"ripemd160":"RIPEMD160Managed",
		"hmacripemd160":"HMACRIPEMD160",
		"rijndael":"RijndaelManaged"
	};
	$hash.compute = function(provider,src,key){
		if(!maps.hasOwnProperty(provider)){
			ExceptionManager.put("0x2e4b","system.hash.compute","do not support provider '" + provider + "'");
			return "";	
		}
		var _provider = F.activex("System.Security.Cryptography." + maps[provider]);
		if(_provider==null){
			ExceptionManager.put("0x2e4b","system.hash.compute","create object failed: '" + provider + "'");
			return "";	
		}
		var bte = exports.system.encoding.utf8.getBytes(src);
		if(typeof key=="string") _provider.Key = exports.system.encoding.utf8.getBytes(key);
		var result = _provider.ComputeHash_2(bte);
		_provider.Dispose();
		return exports.encoding.hex.stringify(F.base64.d(F.base64.fromBinary(result)));
	};
	var $md5 = $hash.md5={};
	$md5.compute = function(src){
		return $hash.compute.call(null,"md5",src);
	};
	var $sha1 = $hash.sha1={};
	$sha1.compute = function(src){
		return $hash.compute.call(null,"sha1",src);
	};
	var $hmacmd5 = $hash.hmacmd5={};
	$hmacmd5.compute = function(src,key){
		return $hash.compute.call(null,"hmacmd5",src,key);
	};
	var $hmacsha1 = $hash.hmacsha1={};
	$hmacsha1.compute = function(src,key){
		return $hash.compute.call(null,"hmacsha1",src,key);
	};
	return $hash;
})();