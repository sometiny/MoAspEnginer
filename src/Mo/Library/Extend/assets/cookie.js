/*debug*/
/*
** File: cookie.js
** Usage: new cookie for asp
** About: 
**		support@mae.im
*/

var _cookies_received = null;
function $cookie(key, value, option){
	if(value===undefined){
		if(!_cookies_received) $cookie.receive();
		return _cookies_received[key];
	}
	var cookie = {value: null, keys:null, options:F.extend({httponly:true,secure:false,expires:null, path: "/", domain : null}, option || {})};
	if(value && typeof value == "object" && value.constructor == Object){
		if(!cookie.keys) cookie.keys={};
		for(var k in value){
			if(!value.hasOwnProperty(k)) continue;
			cookie.keys[k] = value[k];
		}
	}else{
		cookie.value = value;
	}
	send(key, cookie);
}
function send(key, cookie){
	var value = F.encode(cookie.value || ""), _cookie="";
	if(cookie.keys) value = F.object.toURIString(cookie.keys);
	_cookie += key + "=" + value;
	var expires = cookie.options.expires;
	if(expires){
		var etype = typeof expires;
		if(etype == "string"){
			var datetime = F.date.parse(cookie.options.expires);
			if(datetime){
				_cookie += "; expires=" + (new Date(datetime.ticks)).toUTCString();
			}
		}else if(etype == "object" && expires.constructor == Date){
			_cookie += "; expires=" + expires.toUTCString();
		}else if(etype == "date" || etype == "number"){
			_cookie += "; expires=" + (new Date(expires-0)).toUTCString();
		}else{
			ExceptionManager.put(0xed21,"cookie","invalid expires value.");
		}
	}
	if(cookie.options.domain) _cookie += "; domain=" + F.encode(cookie.options.domain);
	if(cookie.options.secure) _cookie += "; secure";
	if(cookie.options.httponly) _cookie += "; HttpOnly";
	_cookie += "; path=" + cookie.options.path;
	res.AddHeader("Set-Cookie",_cookie);
};
function receive(){
	if(!_cookies_received){
		_cookies_received = {};
		var cookies = (F.server("HTTP_COOKIE") || "").replace(/\s+/ig,"");
		F.string.matches(cookies, /(.+?)\=(.+?)(\;|$)/ig, function($0, key, value){
			try{
				if(value.indexOf("=")>0){
					_cookies_received[key] = F.object.fromURIString(value);
				}else{
					_cookies_received[key] = F.decode(value);
				}
			}catch(ex){
				_cookies_received[key] = '';
			}
		});
	}
};
receive();
module.exports = $cookie;