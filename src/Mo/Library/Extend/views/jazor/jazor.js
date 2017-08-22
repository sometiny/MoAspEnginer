/*!
pithy.teemplate.js
teemplate, not template
javascript template parse engine;
by anlige @ 2017-07-23
*/

;(function(crc32){
	var global_setting = {
		escape : true,
		cache : true,
		trim_start : true
	};
	var blank_chars = {'\r' : true, '\n' : true, '\t' : true, ' ' : true};
	var newline_chars = {'\r' : true, '\n' : true};
	var empty_chars = {'\t' : true, ' ' : true};
	var quoto_chars = {'"' : true, '\'' : true};
	
	var PAIRS = {')' : '(', '}' : '{', ']' : '['};
	var PAIRS2 = {'(' : ')', '{' : '}', '[' : ']'};

	
	var push = Array.prototype.push;
	var shift = Array.prototype.shift;
	var slice = Array.prototype.slice;
	var toString = Object.prototype.toString;
	var chr = '';
	var VARIABLE_NAME = '__con__';

	
	/*map something*/
	var token_chars = '0123456789qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM_';
	var token_chars_map = {};
	var operate_chars = '+-*/%\\^|&!.?|=:~ <>,';
	var operate_chars_map = {};

	for(var i=0; i< token_chars.length; i++){
		chr = token_chars.substr(i, 1);
		token_chars_map[chr] = true;
	}
	for(var i=0; i< operate_chars.length; i++){
		chr = operate_chars.substr(i, 1);
		operate_chars_map[chr] = true;
	}
	
	function scanline(content, callback){
		if(!content || typeof content != 'string'){
			return;
		}
		var _callback = function(start, end, words, lineno, emptys){
			if(start == end){
				trim_start || callback(start, end, words, lineno, emptys);
				return;
			}
			var last = end - 1;
			while(last >= start){
				if(empty_chars[words[last]]){
					last--;
				}else{
					break;
				}
			}
			callback(start, last + 1, words, lineno, emptys);
		};
		var words = content.split('');
		var length = words.length;
		var lenth2 = length - 1;
		var index = 0;

		var chr = '';
		var line = '';
		var start = 0;
		var newline = true; 
		var lineno = 0;
		var emptys = '';
		var trim_start = global_setting.trim_start;
		while(true){
			chr = words[index];
			if(	newline_chars[chr]){
				newline = true;
				lineno++;
				_callback(start, index, words, lineno, emptys);
				start = index + 1;
				
				if(chr == '\r'){
					if(index < length - 1 && words[index + 1] == '\n'){
						index++;
						start = index + 1;
					}
				}
				emptys = '';
				
			}else if(newline && empty_chars[chr]){
				start++;
				trim_start || (emptys += chr);
			}else{
				newline = false;
			}
			index++;
			
			if(index >= length){
				lineno++;
				_callback(start, index, words, lineno, emptys);
				break;
			}
		}
	}
	var TOKEN = {
		IF : 'if',
		FOR : 'for',
		FOREACH : 'foreach',
		EACH : 'each',
		SWITCH : 'switch',
		WHILE : 'while',
		CODE : 'code',
		HTML : 'html',
		LINE : 'line',
		REGION : 'region',
		ENDREGION : 'endregion',
		COMMENT : 'comment',
		HTMLEND : 'htmlend',
		SKIP : 'skip'
	};
	function next_token(token_type, words){
		var token = '',
			chr = '',
			start = token_type.start,
			end = token_type.end;
		
		while(start < end){
			chr = words[start];
			if(empty_chars[chr] && token == ''){
				start++;
				continue;
			}
			if(chr == ':'){
				token_type.start = start + 1;
				token_type.type = TOKEN.LINE;
				return;
			}
			if(chr == '{'){
				token_type.start = start;
				token_type.type = TOKEN.CODE;
				return;
			}
			if(!token_chars_map[chr]){
				break;
			}
			token += words[start];
			start++;
		}
		if(TOKEN.hasOwnProperty(token.toUpperCase())){
			token_type.start = start;
			token_type.type = token;
		}
	}
	function token(start, end, words, lineno){
		var chr = words[start];
		var token_type = {
			start : start,
			end : end,
			type : '',
			html_tag : ''
		};
		if(chr == '<'){
			token_type.type = TOKEN.HTML;
			var next = start + 1;
			while(next < end){
				chr = words[next];
				if(chr == '/'){
					token_type.type = TOKEN.HTMLEND;
					next++;
					start++;
					continue;
				}
				if(!token_chars_map[chr]){
					break;
				}
				next++;
			}
			if(next > start + 1){
				token_type.html_tag = words.slice(start + 1, next).join('')
			}
		}
		else if(chr == '@'){
			if(start + 1 == end){
				throw exception('syntax error', lineno, words.slice(start, end).join(''));
			}
			token_type.start++;
			if(words[token_type.start] == '*'){
				token_type.start++;
				token_type.type = TOKEN.COMMENT;
				return token_type;
			};
			
			/*in fact, it can be simplized*/
			next_token(token_type, words);
			if(token_type.type == ''){
				token_type.type = TOKEN.LINE;
				token_type.start = start;
			}
		}else{
			token_type.type = start == end ? TOKEN.LINE : TOKEN.CODE;
		}
		return token_type;
	}

	function line(start, end, words, result, lineno){
		if(start == end){
			result.putString('\\n');
			return;
		}

		var index = start, 
			token = '', 
			chr = '',
			part = '', 
			part_end = 0,
			variable_expression = '', 
			escape = global_setting.escape;
		
		while(index < end){
			chr = words[index];
			if(chr == '@'){
				if(index < end - 1 && words[index + 1] == '@'){
					part += '@';
					index += 2;
					continue;
				}
				if(index == end - 1){
					part += '@';
					break;
				}
				part_end = check_syntax(index + 1, end, words, [], false, lineno, start);
				if(part_end > index + 1){
					result.putString(part);
					variable_expression = words.slice(index + 1, part_end).join('');
					index = part_end - 1;
					part = '';
					result.putVariable((escape ? 'Html.escape(' : '') + variable_expression + (escape ? ')' : ''));
				}else{
					part += '@';
				}
			}else if(chr == '"' || chr == '\\'){
				part += '\\' + chr;
			}else{
				part += chr;
			}
			index++;
		}
		if(part){
			result.putString(part);
		}
		result.putString('\\n');
	}
	
	
	function check_syntax(start, end, words, levels, verify, lineno, token_start){
		var chr = '',
			quote = false,
			expect,
			quote_char = '';
		
		verify = verify === true;
		var first_chr = '';
		while(start < end){
			chr = words[start];
			if(!first_chr && chr == '('){
				first_chr = chr;
			}
			if(quoto_chars[chr]){
				if(levels.length == 0){
					break;
				}
				if(!quote){
					quote = true;
					quote_char = chr;
				}else if(quote && words[start - 1] != '\\' && quote_char == chr){
					quote = false;
				}
				start++;
				continue;
			}
			if(quote || chr == '.'){
				start++;
				continue;
			}
			if(PAIRS2[chr]){
				levels.push(chr);
				start++;
				continue;
			}

			if(PAIRS[chr]){
				if(levels.length == 0){
					break;
				}
				if(levels[levels.length -1] != PAIRS[chr]){
					expect = PAIRS2[levels[levels.length -1]];
					throw exception('unexpected symbol "' + chr + '"' + (expect ? ', expect "' + PAIRS2[levels[levels.length -1]] + '"' : '') , lineno, words.slice(token_start, end).join(''));
				}
				levels.pop();
				if(!verify){
					if(levels.length ==0 && PAIRS[chr] === first_chr){
						return ++start;
					}
				}
				start++;
				continue;
			}
			if(!verify && operate_chars_map[chr]){
				if(levels.length == 0 ){
					break;
				}
				start++;
				continue;
			}
			if(!verify && !token_chars_map[chr]){
				break;
			}
			
			start++;
		}
		if(quote){
			throw exception('quote_char (' + quote_char + ') missing', lineno, words.slice(token_start, end).join(''));
		}
		if(!verify && levels.length !=0){
			throw exception('"' + PAIRS2[levels[levels.length - 1]] + '" missing', lineno, words.slice(token_start, end).join(''));
		}
		return start;
	}
	var __raw = function(text){
		this.text = text;
	}
	var helper = {
		escape :function(src){
			var is_raw = src instanceof __raw;
			if(is_raw){
				src = src.text;
			}
			if(src === undefined || src === null){
				return '';
			}
			src = src + '';
			if(!src){
				return '';
			}
			if(is_raw){
				return src;
			}
			return src
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		},
		raw : function(src){
			if(global_setting['escape'] !== true){
				return src;
			}
			return new __raw(src);
		}
	};
	
	var __RESULTS__ = [];
	function __result__(){
		var results = '';
		var last_string = '';
		var _pool = __RESULTS__.pop();
		if(_pool){
			return _pool;
		}
		var __LEVEL__ = [];
		function flush(){
			if(last_string != ''){
				results += VARIABLE_NAME + ' += "' + last_string + '";\n';
			}
			last_string = '';
		}
		function _put_string(src){
			last_string += src;
			if(last_string.length > 512){
				flush();
			}
		}
		function _put_variable(vari){
			flush();
			results +=  VARIABLE_NAME + ' += ' + vari + ';\n';
		}
		function _put_code(code){
			flush();
			check_syntax(0, code.length, code.split(''), __LEVEL__, true, 0, 0);
			results +=  code + '\n';
		}
		function _end(){
			flush();
			if(__LEVEL__.length != 0){
				throw exception('"' + PAIRS2[__LEVEL__[__LEVEL__.length - 1]] + '" missing in code block', 0, '');
			}
			try{
				return results;
			}finally{
				results = '';
				__LEVEL__.length = 0;
				__RESULTS__.push(this);
			}
		}
		return {
			putString : _put_string,
			putCode : _put_code,
			putVariable : _put_variable,
			finish : _end
		};
	}

	function parse_foreach(line, type, result, lineno){
		var parts = /^(?:\s*)(.+?)(?:\s*)as(?:\s*)(?:([^\s]+?)(?:(?:\s*),(?:\s*)([^\s]+?))?)(?:\s*)\{$/.exec(line);
		if(!parts){
			throw exception('syntax error for \'foreach\' statement', lineno, line);
		}
		var variable_name = parts[1];
		var key =  parts[2];
		var value =  parts[3];
		if(!value){
			value = key;
			key = '__key_' + lineno;
		}
		if(type == TOKEN.EACH){
			result.putCode('var ' + key + '_length = ' + variable_name + '.length;');
			result.putCode('for(var ' + key + ' = 0; ' + key + ' < ' + key + '_length; ' + key + '++){');
		}else{
			result.putCode('for(var ' + key + ' in ' + variable_name + '){');
			result.putCode('if(!' + variable_name + '.hasOwnProperty(' + key + ')) continue;');
		}
		result.putCode('var ' + value + ' = ' + variable_name + '[' + key + '];');
	}

	var __CACHE__ = {};
	var __SUBSCRIBERS = {};

	function publish(token){
		if(!__SUBSCRIBERS[token.type]){
			return;
		}

		var users = __SUBSCRIBERS[token.type];
		var i = 0, length = users.length;
		var result = '';
		for(var i = length - 1; i >= 0; i--){
			users[i].apply(null, arguments);
		}
	}
	
	function __initlize(){
	}
	
	__initlize.subscribe = function(token, callback){
		if(typeof callback != 'function'){
			throw 'Exception : subscribe failed. callback must be a function';
		}
		token = token.toLowerCase();
		var _token = token.toUpperCase();
		if(!TOKEN.hasOwnProperty(_token)){
			TOKEN[_token] = token;
		}
		var users = __SUBSCRIBERS[token] || (__SUBSCRIBERS[token] = []);
		
		users.push(callback);
		
	};
	
	__initlize.unsubscribe = function(token, callback){
		if(callback && typeof callback != 'function'){
			throw 'Exception : unsubscribe failed. callback must be a function';
		}
		token = token.toLowerCase();
		if(!__SUBSCRIBERS[token]){
			return;
		}
		if(!callback){
			__SUBSCRIBERS[token] = null;
			return;
		}
		var users = __SUBSCRIBERS[token];
		var i = 0, length = users.length;
		for(var i = length - 1; i >= 0; i--){
			if(users[i] != callback){
				continue;
			}
			users.splice(i, 1);
		}
		
	};
	
	function exception(e, lineno, line){
		return 'Exception : ' + e + '\nLine: ' + lineno + '\nCode: ' + line;
	}
	__initlize.compile = function(content){
		var _crc32 = '';
		if(global_setting.cache === true){
			_crc32 = crc32(content);
			if(__CACHE__.hasOwnProperty(_crc32)){
				return __CACHE__[_crc32];
			}
		}
		content = content.replace(/^([\r\n]+)/, '');
		
		var result = __result__();
		result.putCode('var ' + VARIABLE_NAME + ' = \'\';'); 
		var _region = false;

		trim_start = global_setting.trim_start;

		
		scanline(content, function(start, end, words, lineno, emptys){
			var _token = token(start, end, words, lineno), token_change = false;
			_token.lineno = lineno;
			
			publish(_token, words, result);
			token_change = _token.linetext !== undefined;
			switch(_token.type){
				case TOKEN.SKIP:
				case TOKEN.COMMENT:
					break;
				case TOKEN.REGION : 
				case TOKEN.ENDREGION : 
					_region = !_region;
					break;	
				case TOKEN.FOREACH : 
				case TOKEN.EACH : 
					parse_foreach(_token.linetext || (content.slice(_token.start, _token.end)), _token.type, result, lineno);
					break;
				case TOKEN.IF : 
				case TOKEN.FOR : 
				case TOKEN.SWITCH : 
				case TOKEN.WHILE : 
					_token.linetext = _token.type + (_token.linetext || (content.slice(_token.start, _token.end)));
				case TOKEN.CODE : 
					if(!_region){
						result.putCode(_token.linetext || (content.slice(_token.start, _token.end)));
						break;
					}
				
				case TOKEN.HTML : 
				case TOKEN.HTMLEND : 
				case TOKEN.LINE : 
					if(emptys){
						result.putString(emptys);
					}
					if(token_change){
						line(0, _token.linetext.length, _token.linetext.split(''), result, lineno);
						break;
					}
					line(_token.start, _token.end, words, result, lineno);
			}
			_token = null;
		});
		if(_region){
			throw exception('region not closed!', 0 , '');
		}
		
		result.putCode('return ' + VARIABLE_NAME + ';');
		var code = result.finish();

		if(global_setting.cache === true){
			__CACHE__[_crc32] = code;
		}
		return code;
	};

	var global_objects = {};
	__initlize.render = function(content, data){
		if(!data || toString.call(data) != '[object Object]'){
			throw 'Exception : data is invalid. it must be an objected-type.';
		}
		
		var keys = [];
		var values = [];
		for(var key in data){
			if(!data.hasOwnProperty(key)){
				continue;
			}
			keys.push(key);
			values.push(data[key]);
		}
		keys.push('Html');
		values.push(helper);
		for(var key in global_objects){
			if(!global_objects.hasOwnProperty(key)){
				continue;
			}
			keys.push(key);
			values.push(global_objects[key]);
		}
		var wapper = new Function(keys, content);
		return wapper.apply(null, values);
	};
	
	helper.typeOf = __initlize.typeOf = function(ele){
		return toString.call(ele);
	};
	
	__initlize.register = function(name, func){
		helper[name] = function(){
			var result = func.apply(helper, arguments);
			if(global_setting['escape'] !== true){
				return result;
			}
			return new __raw(result);
		};
	};
	__initlize.registerObject = function(name, src){
		global_objects[name] = src;
	};
	
	__initlize.config = function(name, value){
		name == 'escape' && (global_setting[name] = value !== false);
		name == 'cache' && (global_setting[name] = value !== false);
		name == 'trim_start' && (global_setting[name] = value !== false);
	};

	__initlize.scanline = scanline;
	__initlize.token = token;
	__initlize.TOKEN = TOKEN;
	__initlize.line = function(){
		var length = arguments.length;
		if(length != 2 && length != 4){
			return;
		}
		if(length == 2){
			var words = arguments[0].split('');
			line.call(__initlize, 0, words.length, words, arguments[1]);
			return;
		}
		line.apply(__initlize, arguments);
	};
	
	if(typeof module != 'undefined' && module){
		module.exports = __initlize;
		return;
	}
	return __initlize;
})((function(){
	var Crc32Table=[], map_hex2 = [];
	function MakeTable()
	{
	    var i,j,crc;
	    for (i = 0; i < 256; i++)
	    {
	        crc = i;
	        for (j = 0; j < 8; j++)
	        {
	            if (crc & 1)
	                crc = (crc >>> 1) ^ 0xEDB88320;
	            else
	                crc >>>= 1;
	        }
	        Crc32Table[i] = crc;
	        map_hex2.push(('0' + i.toString(16)).slice(-2));
	    }
	}
	function __initlize(csData)
	{
		if(!csData){
			return '';
		}
	    var crc  = 0xffffffff, len = csData.length, i=0;
	    var chr = 0;
	    for(var i = 0; i < len; i++)
	    {
			chr = csData.charCodeAt(i);
			if(chr <= 0xff){
		    	crc = (crc >>> 8) ^ Crc32Table[(crc ^ chr) & 0xff ];
	    	}else{
		    	crc = (crc >>> 8) ^ Crc32Table[(crc ^ ((chr >>> 2) & 0xff)) & 0xff ];
		    	crc = (crc >>> 8) ^ Crc32Table[(crc ^ (chr & 0xff)) & 0xff ];
	    	}
	    }
	    return word2hex(crc ^ 0xffffffff);
	}
	function word2hex(word){
		return map_hex2[word>>>24] + 
		map_hex2[(word>>16) & 0xff] + 
		map_hex2[(word>>8) & 0xff] + 
		map_hex2[word & 0xff];
	}
	MakeTable();
	
	return __initlize;
})());