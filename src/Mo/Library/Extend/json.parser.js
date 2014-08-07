/*
    http://www.JSON.org/json2.js
*/
/****************************************************
'@DESCRIPTION:	define MoLibJsonParser object
'****************************************************/
var MoLibJsonParser = MoLibJsonParser || {};
MoLibJsonParser.result=null;

/****************************************************
'@DESCRIPTION:	it is not safe if you set 'strict' property to false;
'****************************************************/
MoLibJsonParser.strict=true;

/****************************************************
'@DESCRIPTION:	if 'encode' property is false,you will see unicode char in unParsed json string.
'****************************************************/
MoLibJsonParser.encode=true;

(function () {
    function f(n) {
        return n < 10 ? '0' + n : n;
    }
    function js(str){
		if(str==undefined) return "";
		if(str=="")return "";
		var i, j, aL1, aL2, c, p,ret="";
		aL1 = Array(0x22, 0x5C, 0x2F, 0x08, 0x0C, 0x0A, 0x0D, 0x09);
		aL2 = Array(0x22, 0x5C, 0x2F, 0x62, 0x66, 0x6E, 0x72, 0x74);
		for(i = 0;i<str.length;i++){
			p = true;
			c = str.substr(i,1);
			for(j = 0;j<=7;j++){
				if(c == String.fromCharCode(aL1[j])){
					ret += "\\" + String.fromCharCode(aL2[j]);
					p = false;
					break;
				}
			}
			if(p){
				var a = c.charCodeAt(0);
				if(a > 31 && a < 127){
					ret +=c
				}else if(a > -1 || a < 65535){
					var slashu = a.toString(16);
					while(slashu.length<4){slashu="0"+slashu;}
					ret += "\\u" + slashu;
				}
			}
		}
		return ret;
	}
    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };
        String.prototype.toJSON =function(key){return js(this.valueOf());};
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + (MoLibJsonParser.encode?js(string):string) + '"';
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
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
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
                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }
            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }
    
    if (typeof MoLibJsonParser.unParse !== 'function') {
	    /****************************************************
	    '@DESCRIPTION:	unParse json object to string
	    '@PARAM:	value [Object] : available json object
	    '@PARAM:	space [String] : used to format json string. such as '\t',' ' ...
	    '@RETURN:	[String] json string
	    '****************************************************/
	    MoLibJsonParser.unParse = function (value, space) {
		    return MoLibJsonParser.stringify(value, null, space);
	    }
    }
    if (typeof MoLibJsonParser.stringify !== 'function') {
	    /****************************************************
	    '@DESCRIPTION:	forget this strangely name ,use unParse method!!!!!
	    '****************************************************/
        MoLibJsonParser.stringify = function (value, replacer, space) {
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
    if (typeof MoLibJsonParser.tryParse !== 'function') {
	    /****************************************************
	    '@DESCRIPTION:	try parse json string as json object
	    '@PARAM:	text [String] : json string
	    '@PARAM:	reviver [Function] : i don't know
	    '@PARAM:	obj [Ref Object] : forget it;
	    '@RETURN:	[Boolean] ifjson string is parsed successfully, assign parse result to 'result' property and return true, or return false;
	    '****************************************************/
	    MoLibJsonParser.tryParse = function(text, reviver,obj){
		    try{
			    MoLibJsonParser.result = MoLibJsonParser.parse(text, reviver);
			    if(arguments.length==2 && !(typeof reviver === 'function')) reviver = MoLibJsonParser.result;
			    if(arguments.length==3) obj = MoLibJsonParser.result;
			    return true;
		    }catch(ex){
			    return false;
		    }
	    };
    }
    if (typeof MoLibJsonParser.parse !== 'function') {
	    /****************************************************
	    '@DESCRIPTION:	parse json string as json object
	    '@PARAM:	text [String] : json string
	    '@PARAM:	reviver [Function] : i don't know
	    '@RETURN:	[Object] json object
	    '****************************************************/
        MoLibJsonParser.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
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
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, '')) || !MoLibJsonParser.strict) {
				try{
	                j = eval('(' + text + ')');
	                return typeof reviver === 'function' ?
	                    walk({'': j}, '') : j;
                }catch(ex){
                    throw new SyntaxError('JSON.parse');
                }
            }
            throw new SyntaxError('JSON.parse');
        };
    }
}());
if(!exports.json)exports.json={};
return exports.json.parser = MoLibJsonParser;