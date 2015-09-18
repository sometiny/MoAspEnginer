/*
    json2.js
    2015-05-03
    Public Domain.
    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
    See http://www.JSON.org/js.html
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html
    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/
(function (JSON) {
    'use strict';
    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
	function js(str) {
		var i, c, es=[], ret = "", len = str.length, buffer=[];
		es[8]='b';es[9]='t';es[10]='n';es[12]='f';es[13]='r';es[34]='"';es[47]='\/';es[92]='\\';
		for (i = 0; i < len; i++) {
			c = str.charCodeAt(i);
			if(es[c]!==undefined){
				buffer.push(92, c);
				continue;
			}
			if (c > 31 && c < 127) {
				buffer.push(c);
				continue;
			}
			if(buffer.length>0){
				ret += String.fromCharCode.apply(null, buffer);
				buffer.length = 0;
			}
			ret += "\\u" + ("0000" + c.toString(16)).slice(-4);
		}
		if(buffer.length>0){
			ret += String.fromCharCode.apply(null, buffer);
			buffer.length = 0;
		}
		return ret;
	}
    function f(n) {
        return n < 10 
            ? '0' + n 
            : n;
    }
    function this_value() {
        return this.valueOf();
    }
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function () {
            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate()) + 'T' +
                        f(this.getUTCHours()) + ':' +
                        f(this.getUTCMinutes()) + ':' +
                        f(this.getUTCSeconds()) + 'Z'
                : null;
        };
        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }
    var gap,
        indent,
        meta,
        rep;
    function quote(string) {
        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) 
            ? '"' + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' 
            : '"' + string + '"';
    }
    function str(key, holder) {
        var i,
            k,
            v,
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
        case 'string':
            return JSON.encode ? '"'+js(value)+'"' : quote(value);
        case 'number':
            return isFinite(value) 
                ? String(value) 
                : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                v = partial.length === 0
                    ? '[]'
                    : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            }
            v = partial.length === 0
                ? '{}'
                : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
	JSON.encode = false;
	JSON.encodeUnicode = function(value){JSON.encode = value!==false;};
    if (typeof JSON.stringify !== 'function') {
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', {'': value});
        };
    }
    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (
                rx_one.test(
                    text
                        .replace(rx_two, '@')
                        .replace(rx_three, ']')
                        .replace(rx_four, '')
                )
            ) {
                j = eval('(' + text + ')');
                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
    
	JSON.ARRAY=1;
	JSON.OBJECT=2;
	JSON.create = function(jsonType){
		if(JSON.class_) return new JSON.class_(jsonType);
		JSON.class_ = function(_jsonType){
			if(typeof _jsonType=="object" && _jsonType.constructor==Array)
			{
				this.jsonType = JSON.ARRAY;
				this.data = _jsonType;
			}
			else if(typeof _jsonType=="object" && _jsonType.constructor==Object)
			{
				this.jsonType = JSON.OBJECT;
				this.data = _jsonType;
			}
			else
			{
				this.jsonType = (_jsonType !== JSON.ARRAY ? JSON.OBJECT : JSON.ARRAY);
				this.data=(this.jsonType == JSON.ARRAY ? [] : {});
			}
		};
		JSON.class_.prototype.put = function(value){
			if(arguments.length==2) return JSON.class_.prototype.set.apply(this,arguments);
			if(typeof value=="object" && value.constructor == JSON.class_)
			{
				this.data.push(value.data);
				return value;
			}
			this.data.push(value);
			return this;
		};
		JSON.class_.prototype.putArray = function(){
			var args=arguments, key=null;
			if(this.jsonType==JSON.OBJECT){
				key = (args = Array.prototype.slice.apply(arguments)).shift();
			}
			var object = (function(json, args){
				if(args.length==1 && typeof args[0]=="object" && args[0].constructor==Array)
				{
					json.data = args[0];
				}
				else
				{
					json.data = Array.prototype.slice.apply(args);
				}
				return json;
			})(JSON.create(JSON.ARRAY), args);
			
			if(this.jsonType==JSON.OBJECT){
				return this.put(key,object);
			}else{
				return this.put(object);
			}
		};
		JSON.class_.prototype.putObject = function(){
			var args=arguments, key=null;
			if(this.jsonType==JSON.OBJECT){
				key = (args = Array.prototype.slice.apply(arguments)).shift();
			}
			
			var object = (function(json, args){
				if(args.length>0)json.data = args[0];
				return json;
			})(JSON.create(), args);
			
			if(this.jsonType==JSON.OBJECT){
				return this.put(key,object);
			}else{
				return this.put(object);
			}
		};
		JSON.class_.prototype.set = function(key, value){
			if(typeof value=="object" && value.constructor == JSON.class_)
			{
				this.data[key]=value.data;
				return value;
			}
			this.data[key]=value;
			return this;
		};
		JSON.class_.prototype.get = function(key){
			return this.data[key];
		};
		JSON.class_.prototype.stringify = JSON.class_.prototype.toString = function(space){
			return JSON.stringify(this.data,null,space||"");
		};
		JSON.class_.prototype.toXML = function(rootElementName){
			rootElementName = rootElementName || "root";
			return json2xml(this.data, rootElementName);
		};
		return new JSON.class_(jsonType); 
	};
}(module.exports));