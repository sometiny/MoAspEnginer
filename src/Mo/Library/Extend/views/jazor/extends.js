/*!
pithy.teemplate.js
teemplate, not template
javascript template parse engine;
by anlige @ 2017-07-23
*/

;(function(_pjt){
	if(!_pjt){
		throw 'Exception: Pjt is not found!';
	}
	var empty_chars = {'\t' : true, ' ' : true};
	
	var push = Array.prototype.push;
	
	var chr = '';

	
	//map something
	var token_chars = '0123456789qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM_-/';
	var token_chars_map = {};

	for(var i=0; i< token_chars.length; i++){
		chr = token_chars.substr(i, 1);
		token_chars_map[chr] = true;
	}
	
	var TOKEN = {
		LAYOUT : 'layout',
		EXTENDS : 'extends',
		SECTION : 'section',
		INCLUDE : 'include',
		IMPORT : 'import',
		ENDSECTION : 'endsection',
		VIEW : 'view',
		LINE : 'line',
		COMMENT : 'comment'
	};
	function next_token(_token, words){
		var token = '',
			chr = '',
			start = _token.start,
			end = _token.end;
		
		while(start < end){
			chr = words[start];
			if(empty_chars[chr] && token == ''){
				start++;
				continue;
			}
			if(!token_chars_map[chr]){
				break;
			}
			token += words[start];
			start++;
		}
		switch(token){
			case 'layout' :
			case 'extends' :
			case 'view' :
			case 'section' :
			case 'include' :
			case 'endsection' :
			case 'import' :
				_token.start = start;
				_token.type = token;
				break;
		}
	}
	function token(start, end, words){
		var chr = words[start];
		var _token = {
			start : start,
			end : end,
			type : '',
			html_tag : ''
		};
		if(chr == '@'){
			if(start + 1 == end){
				throw 'syntax error \'' + words.slice(start, end).join('') + '\'';
			}
			_token.start++;
			if(words[_token.start] == '*'){
				_token.start++;
				_token.type = TOKEN.COMMENT;
				return _token;
			};
			
			next_token(_token, words);
			if(_token.type == ''){
				_token.type = TOKEN.LINE;
				_token.start = start;
			}
		}else{
			_token.type = TOKEN.LINE;
		}
		return _token;
	}

	/*
	* @description	__view
	* @param	name	: view name
	* @param	clone	: is clone?
	*/
	function __view(name, clone){
		this.sections = {};
		this.name = name;
		this.layout = '';
		this.is_view = true;
		this.is_clone = clone === true;
		(clone !== true) && (__LAYOUTS__[name] = this);
	}

	__view.prototype.push = function(contents){
		this.sections[contents.name] = contents;
	};
	
	__view.prototype.compile = function(){
		var _layout = __LAYOUTS__[this.layout];
		if(!_layout){
			throw 'can not find layout or view \'' + this.layout + '\'';
		}
		if(_layout.is_view){
			return _layout.extend(this).compile();
		}
		return _layout.compile(this);
	};

	__view.prototype.extend = function(view){
		if(view.is_clone){
			view.name = this.name;
			view.layout = this.layout;
			var sections = this.sections;
			for(var name in sections){
				if(!sections.hasOwnProperty(name) || view.sections.hasOwnProperty(name)){
					continue;
				}
				view.push(sections[name]);
			}
			return view;
		}
		var __clone = new __view(this.name, true);
		__clone.layout = this.layout;

		var sections = this.sections;
		for(var name in sections){
			if(!sections.hasOwnProperty(name)){
				continue;
			}
			__clone.push(sections[name]);
		}
		sections = view.sections;
		for(var name in sections){
			if(!sections.hasOwnProperty(name)){
				continue;
			}
			__clone.push(sections[name]);
		}
		return __clone;
	};


	var __LAYOUTS__ = {};
	/*
	* @description	__layout
	* @param	name	: layout name
	*/
	function __layout(name){
		this.name = name.replace(/\s/g, '');
		this.layout = [];
		this.is_layout = true;
		__LAYOUTS__[this.name] = this;
	}
	
	__layout.prototype.push = function(contents){
		this.layout.push(contents);
	};

	__layout.prototype.compile = function(view){
		var layout = this.layout;
		var sections = (view && view.is_view) ? view.sections : null;
		var result = [],
			length = layout.length,
			item;
		for(var i = 0; i < length; i++){
			item = layout[i];
			if(item.is_section){
				((sections && sections[item.name]) ? sections[item.name] : item).compile(result);
				continue;
			}
			if(item.is_include){
				item.compile(result);
				continue;
			}
			result.push(item);
		}
		return result;
	};

	/*
	* @DESCRIPTION	__include
	* @PARAM	name	: included view or layout
	*/
	function __include(name){
		this.name = name.replace(/\s/g, '');
		this.is_include = true;
	}
	__include.prototype.compile = function(result){
		var _layout = __LAYOUTS__[this.name];
		if(!_layout){
			throw 'can not find layout or view \'' + this.name + '\'';
		}
		push.apply(result, _layout.compile());
	}

	/*
	* @description	__section
	* @param	name	: section name
	*/
	function __section(name){
		this.name = name.replace(/\s/g, '');
		this.lines = [];
		this.is_section = true;
	}
	
	__section.prototype.push = function(line){
		this.lines.push(line);
	};
	
	__section.prototype.compile = function(result){
		var lines = this.lines;
		var length = lines.length;
		if(length == 0){
			return;
		}
		var item = null;
		for(var i = 0;i < length; i++){
			item = lines[i];
			if(item.is_include){
				item.compile(result);
				continue;
			}
			result.push(item);
		}
	};

	function parse_view(line){
		var parts = line.split(/\s+/);
		var length = parts.length;
		var result = [];
		for(var i = 0; i < length; i++){
			if(!parts[i]){
				continue;
			}
			result.push(parts[i]);
		}
		if(result.length != 3 || result[1] != 'extends'){
			throw 'command \'view\' error, sub command \'extends\' is missing ?';
		}
		return result;
	}
	var __CACHE__ = {};

	function __initlize(){
		
	}
	
	__initlize.layout = function(name){
		return __LAYOUTS__[name];
	};
	__initlize.render = function(layout, data, callback){
		var codes = __initlize.compile(layout);
		var result = _pjt.render(codes, data);
		
		var type = typeof callback;
		if(type == 'function'){
			callback(result, layout, data);
			return;
		}
		if(type == 'string'){
			var ele = document.getElementById(callback);
			if(ele){
				ele.innerHTML = result;
			}
			return;
		}
		return result;
	};
	__initlize.compile = function(name){
		if(__CACHE__.hasOwnProperty(name)){
			return __CACHE__[name];
		}
		var layout = __LAYOUTS__[name];
		if(!layout){
			return '';
		}
		var lines = layout.compile().join('\n');
		return __CACHE__[name] = _pjt.compile(lines);
	};
	
	__initlize.compileas = function(content, import_callback, after_import, parents){
		
		var __LINE__ =  0;

		content = content.replace(/^([\r\n]+)/, '');
		
		
		function exception(e, start, end){
			return 'Exception : ' + e + '\nLine: ' + __LINE__ + '\nCode: ' + content.slice(start, end);
		}
		var _container = null;
		var _imports = [];
		var _section = null;
		_pjt.scanline(content, function(start, end, words, line_num, emptys){
			__LINE__ = line_num;
			var _token = null;
			try{
				_token = token(start, end, words);
			}catch(e){
				throw exception(e, start, content.slice(start, end));
			}
			var linetext = content.slice(_token.start, _token.end);
			switch(_token.type){
				case TOKEN.COMMENT:
					break;
				case TOKEN.IMPORT:
					_imports.push(linetext.replace(/^\s+/, '').replace(/\s+$/, ''));
					break;
				case TOKEN.LAYOUT:
					_container = new __layout(linetext);
					break;
				case TOKEN.VIEW:
					var names = parse_view(linetext);
					if(names[2] == names[0]){
						throw exception('view can not extend itself', start, end);
					}
					_container = new __view(names[0]);
					_container.layout = names[2];
					break;
				case TOKEN.SECTION:
					if(_section != null){
						throw exception('command \'@endsection\' is missing', start, end);
					}
					if(_container != null){
						_section = new __section(linetext);
						break;
					}
				case TOKEN.ENDSECTION:
					if(_container != null){
						_container.push(_section);
						_section = null;
						break;
					}
				case TOKEN.INCLUDE: 
					if(_container == null){
						throw exception('\'@layout\' or \'@extends\' not be declared first', start, end);
					}
					var _include = new __include(linetext);
					if(_section != null){
						_section.push(_include);
						break;
					}
					if(_container != null){
						_container.push(_include);
						break;
					}
					
				case TOKEN.LINE: 
					linetext = emptys + linetext;
					if(start == end && _container == null && _section == null){
						break;
					}
					if(_container == null){
						throw exception('\'@layout\' or \'@extends\' not be declared first', start, end);
					}
					if(_section != null){
						_section.push(linetext);
						break;
					}
					if(_container.is_view){
						throw exception('only command \'@section\' or \'@include\' can be in view', start, end);
					}
					_container.push(linetext);
			}
			
		});
		if(_section != null){
			throw exception('command \'@endsection\' is missing');
		}
		exception = null;
		content = '';
		var length = _imports.length;
		if(length == 0 && after_import && typeof after_import == 'function'){
			after_import(__LAYOUTS__);
			return;
		}
		if(length > 0 && import_callback && typeof import_callback == 'function'){
			imports(_imports, length, import_callback, after_import, parents || []);
			return;
		}
		return _imports;
	};

	function imports(_imports, length, callback, after_import, parents){
		var count = 0, contents = '';
		function fn(content, p){
			contents += content + '\n';
			count++;
			if(count >= length){
				__initlize.compileas(contents, callback, after_import, p);
			}
		}
		for(var i = 0; i < length; i++){
			var new_array = parents.slice(0);
			new_array.push(_imports[i]);
			callback(new_array.length == 1 ? new_array[0] : new_array, (function(p){ 
				return function(content){
					fn(content, p);
				};
			})(new_array));
		}
	}

	
	if(typeof module != 'undefined' && module){
		module.exports = __initlize;
		return;
	}
	return __initlize;
})(require('./jazor.js'));