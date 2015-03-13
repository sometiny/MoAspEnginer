加点中文
(function(){
	var regExp1 = /^(\#|\.)([^\1]+)$/;
	var regExp2 = /^([^#\.]+?)(\[\@([^\=]+?)(\=\'(.+?)\')?\])?$/;
	var regExp3 = /^([a-zA-Z0-9]+?)\.([a-zA-Z0-9\-\_]+)$/;
	var jo = window.jo = function(opt,source) {
		return new jo.fn.init(opt,source);
	};
	
	jo.fn = jo.prototype = {
		J:null,
		joArray:[],
		$$guid:0,
		init:function(opt,source){
			if(!opt){return this;}
			if(typeof(opt)=="string"){
				var optlist = opt.split(/[\>\s]+/igm);
				if(optlist.length>1){
					var _result=jo(jo.trim(optlist[0]));
					for(var i=1;i<optlist.length;i++){
						_result = _result.find(jo.trim(optlist[i]));
					}
					return _result;
				}
			}
			SOU = source || document ;
			this.joArray=[];
			if(typeof(opt)=="string"){
				var match1=regExp1.exec(opt);
				if(match1){
					if(match1[1]=="#"){
						var elem=document.getElementById(match1[2]);
						if(elem) {this.joArray.push(elem);}
					}else{
						var doc = source || document.documentElement;
						function chd(doc){
							for(var i=0;i<doc.childNodes.length;i++){
								var reg = new RegExp('\\b' + match1[2] + '\\b', 'g');
								if(reg.test(doc.childNodes[i].className)){this.joArray.push(doc.childNodes[i]);}
								chd.apply(this,[doc.childNodes[i]]);
							}
						}
						chd.apply(this,[doc]);
					}	
				}
				var match2=regExp2.exec(opt);
				if(match2){
					var doc = SOU.getElementsByTagName(match2[1]);
					for(var i=0;i<doc.length;i++){
						if(!match2[2]){
							this.joArray.push(doc[i]);
						}else{
							var _jo = jo(doc[i]);
							if(_jo.attr(match2[3])){
								if(match2[4] && _jo.attr(match2[3])==match2[5]){this.joArray.push(doc[i]);}
								if(!match2[4]){this.joArray.push(doc[i]);}
							}
						}
					}
				}
				var match3=regExp3.exec(opt);
				if(match3){
					var doc = SOU.getElementsByTagName(match3[1]);
					for(var i=0;i<doc.length;i++){
						if(!match3[2]){
							this.joArray.push(doc[i]);
						}else{
							if(doc[i].className==match3[2]){
								this.joArray.push(doc[i]);
							}
						}
					}
				}
				return this;
			}else if(opt.constructor==Array){
				for(var i in opt){
					if(opt[i].nodeType && opt[i].nodeType==1){
						this.joArray.push(opt[i]);
					}
				}
				return this;
			}else{
				if(opt.nodeType && opt.nodeType==1){
					this.joArray[0] =  opt;
				}
				return this;
			}
		},
		length:function(){return this.joArray.length;},
		ori:function(index){
			return index?this.joArray[index]:this.joArray;
		},
		Switch:function(){
			var arg = arguments,v1,v2;
			if(arg.length==1){
				v1=arg[0];v2="";
			}
			if(arg.length==2){
				v1=arg[0];v2=arg[1];
			}
			try{
				if(this.joArray[0].value==v1 || this.joArray[0].value=="" ){
					this.val(v1);
					this.css({"color":"#999"});
				}
			}catch(ex){}
			this.focus(function(){
				if(this.value==v1){
					this.value=v2;
					this.style.color="#666";
				}
			});
			this.blur(function(){
				if(this.value==v2 || this.value==v1){
					this.value=v1;
					this.style.color="#999";
				}
			});	
			return this; 
		},
		addClass:function(cn){
			if(this.joArray.length>0){
					var _i=0;
					while(_i<this.joArray.length){
						this.joArray[_i].className = jo.trim((jo.trim(this.joArray[_i].className.replace(new RegExp('\\b' + cn + '\\b', 'g'), '')) + ' ' + cn));
						_i++;
					}
			}
			return this;
		},
		haveClass:function(cn){
			if(this.joArray.length>0){
				var reg = new RegExp('\\b' + cn + '\\b', 'g');
				return reg.test(this.joArray[0].className);
			}
			return this;
		},
		removeClass:function(cn){
			if(this.joArray.length>0){
					var _i=0;
					while(_i<this.joArray.length){
						this.joArray[_i].className = jo.trim(this.joArray[_i].className.replace(new RegExp('\\b' + cn + '\\b', 'g'), ''));
						_i++;
					}
			}
			return this;
		},
		css:function(){
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					var str = this.joArray[_i].style.cssText;
					if(str.substr(str.length-1,1)==";"){str = str.substr(0,str.length-1);}
					if(arguments.length==0){return this.joArray[_i].style.cssText;	}
					if(arguments.length==1){
						if(typeof(arguments[0])=="string"){
							eval("var _sss = this.joArray[_i].style." + arguments[0] + ";");
							return _sss;
						}else if(typeof(arguments[0])=="object"){
							var arg = arguments[0];
							for(var i in arg){str += ";" + i + ":" + arg[i];}
							this.joArray[_i].style.cssText = str;
						}
					}
					if(arguments.length==2){
						var arg = arguments;
						eval("this.joArray[_i].style." + arg[0] + " = \"" + arg[1] + "\";");	
					}
					_i++;
				}
			}
			return this;			
		},
		html:function(value){
			if(value==undefined){
				return this.joArray[0].innerHTML;
			}else{
				if(this.joArray.length>0){
					var _i=0;
					while(_i<this.joArray.length){
						this.joArray[_i].innerHTML = value;
						_i++;
					}
				}
			}
			return this;			
		},
		val:function(value){
			if(value == undefined ){
				return this.joArray[0].value;
			}else{
				if(this.joArray.length>0){
					var _i=0;
					while(_i<this.joArray.length){
						this.joArray[_i].value = value;
						_i++;
					}
				}
			}
			return this;	
		},
		text:function(txt){
			if(!txt){
				return (jo.browser.FF || jo.browser.Opera) ? this.joArray[0].textContent : this.joArray[0].innerText ;
			}else{
				if(this.joArray.length>0){
					var _i=0;
					while(_i<this.joArray.length){
						if(!jo.browser.FF && ! jo.browser.Opera){
							this.joArray[_i].innerText=txt;
						}else{
							this.joArray[_i].textContent=txt;
						}
						_i++;
					}
				}
			}
			return this;			
		},
		parent:function(){
			var _ary=[];
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					_ary.push(this.joArray[_i].parentNode);
					_i++;
				}
			}
			return jo(_ary);
		},
		tag:function(){
			return this.joArray[0].nodeName.toLowerCase();
		},
		first:function(){
			var _ary=[];
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					_ary.push(this.joArray[_i].firstChild);
					_i++;
				}
			}
			return jo(_ary);
		},
		last:function(){
			var _ary=[];
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					_ary.push(this.joArray[_i].lastChild);
					_i++;
				}
			}
			return jo(_ary);
		},
		append:function(nod){
			if(typeof(nod)=="string"){
				if(this.joArray.length>0){
					var _i=0;
					while(_i<this.joArray.length){
						this.joArray[_i].innerHTML=this.joArray[_i].innerHTML+nod;
						_i++;
					}
				}
			}else{
				if(nod.joArray && nod.joArray.length<=0)return this;
				if(nod.joArray && nod.joArray.length>0)nod=nod.joArray[0];
				this.joArray[0].appendChild(nod);
			}
			return this;
		},
		clear:function(nod){
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					this.joArray[_i].innerHTML="";
					_i++;
				}
			}
			return this;
		},
		attr:function(name,value){
			name = name=="class" ? (jo.browser.IE ? "className" : "class") : name;
			name = ((name=="className" && jo.browser.IEVersion>=8) ? "class" : name);
			if(!value){
				return this.joArray[0].getAttribute(name);
			}else{
				if(this.joArray.length>0){
					var _i=0;
					while(_i<this.joArray.length){
						this.joArray[_i].setAttribute(name,value);
						_i++;
					}
				}
			}
			return this;
		},
		beforeEnd:function(nod){
			var ele = this.joArray[0].lastChild;
			while(ele !=null && ele.nodeType!=1){
				ele = ele.previousSibling;
			}
			if(ele){
				this.joArray[0].insertBefore(nod,ele);
			}else{
				this.joArray[0].appendChild(nod);
			}
			return this;
		},
		afterEnd:function(nod){
			var ele = this.joArray[0].lastChild;
			while(ele !=null && ele.nodeType!=1){
				ele = ele.previousSibling;
			}
			if(ele && ele.nextSibling){
				this.joArray[0].insertBefore(nod,ele.nextSibling);
			}else{
				this.joArray[0].appendChild(nod);
			}
			return this;
		},
		beforeFirst:function(nod){
			var ele = this.joArray[0].firstChild;
			while(ele !=null && ele.nodeType!=1){
				ele = ele.nextSibling;
			}
			if(ele){
				this.joArray[0].insertBefore(nod,ele);
			}else{
				this.joArray[0].appendChild(nod);
			}
			return this;
		},
		afterFirst:function(nod){
			var ele = this.joArray[0].firstChild;
			while(ele !=null && ele.nodeType!=1){
				ele = ele.nextSibling;
			}
			if(ele && ele.nextSibling){
				this.joArray[0].insertBefore(nod,ele.nextSibling);
			}else{
				this.joArray[0].appendChild(nod);
			}
			return this;
		},
		child:function(){
			var Ary=[];
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					for(var i in this.joArray[_i].childNodes){
						Ary.push(this.joArray[_i].childNodes[i]);
					}
					_i++;
				}
			}
			return jo(Ary);
		},
		next:function(){
			var Ary=[];
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					var ele = this.joArray[_i].nextSibling;
					while(ele !=null && ele.nodeType!=1){
						ele = ele.nextSibling;
					}
					Ary.push(ele);
					_i++;
				}
			}
			return jo(Ary);
		},
		prev:function(){
			var Ary=[];
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					var ele = this.joArray[_i].previousSibling;
					while(ele !=null && ele.nodeType!=1){
						ele = ele.previousSibling;
					}
					Ary.push(ele);
					_i++;
				}
			}
			return jo(Ary);
		},
		find:function(opt){
			if(this.joArray.length>0){
				var result=jo(opt,this.joArray[0]);
				if(this.joArray.length>1){
					var _i=1;
					while(_i<this.joArray.length){
						var ary = jo(opt,this.joArray[_i]).joArray;
						if(ary.length>0){
							for(var j=0;j<ary.length;j++){
								result.joArray.push(ary[j])
							}
						}
						_i++;
					}
				}
				return result;
			}else{
				return jo();
			}
		},
		filter:function(){return this;},
		each:function(fn){jo.each(this,fn);return this;},
		togle:function(){
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					this.joArray[_i].style.display = this.joArray[_i].style.display=="none" ? "block":"none";
					_i++;
				}
			}
			return this;	
		},
		hover:function(fn1,fn2){
			if(this.joArray.length>0){
				var _i=0;
				while(_i<this.joArray.length){
					jo(this.joArray[_i]).mouseover(fn1);
					jo(this.joArray[_i]).mouseout(fn2);
					_i++; 
				}
			}
			return this;					
		}
	};
	
	jo.events = jo.fn.events = "blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,change,select,submit,keydown,keypress,keyup,error".split(",");
	jo.Agent = jo.fn.Agent = window.navigator.userAgent;
	jo.browser = jo.fn.browser = {IE:false,FF:false,Google:false,Safari:false,Opera:false,Webkit:false,IEVersion:"0"};
	jo.browser.IE = /MSIE/i.test(jo.Agent);
	jo.browser.FF = /firefox/i.test(jo.Agent);
	jo.browser.Google = /safari/i.test(jo.Agent) && /chrome/i.test(jo.Agent);
	jo.browser.Safari = /safari/i.test(jo.Agent) && !(/chrome/i.test(jo.Agent));
	jo.browser.Opera = /Opera/i.test(jo.Agent);
	jo.browser.Webkit = /webkit/i.test(jo.Agent);
	if(jo.browser.IE){
		var mat = /MSIE ([\d\.]+)/i.exec(jo.Agent);
		if(mat!=null) jo.browser.IEVersion = parseInt(mat[1]);
	}
	jo.fn.init.prototype=jo.fn;
	
	jo.each= function(o,fn){
		if(o.joArray){
			var _jo = o.joArray;
			for(var i in _jo){
				fn.apply(_jo[i],[i]);
			}
		}else{
			for(var i in o){
				fn.apply(o,[i,o[i]]);
			}
		}
	};
	
	for(var i=0;i<jo.events.length;i++){
		var myEvent="jo.fn[\"" + jo.events[i] + "\"]=function(fn){if(this.joArray.length>0){var _i=0;while(_i<this.joArray.length){this.$$guid++;fn.$$guid=this.$$guid;var ele = this.joArray[_i];if(!ele.events){ele.events={};}if(!ele.events[\"" + jo.events[i] + "\"]){ele.events[\"" + jo.events[i] + "\"]=[];}if((!ele.events[\"" + jo.events[i] + "\"]) && ele[\"on" + jo.events[i] + "\"]){ele.events[\"" + jo.events[i] + "\"].push(ele[\"on" + jo.events[i] + "\"]);}ele.events[\"" + jo.events[i] + "\"].push(fn);ele[\"on" + jo.events[i] + "\"]=function(e){e = e || window.event;var events = this.events[e.type];for (var i in events) {events[i].apply(this,[e]);}};_i++;}}return this;}";
		eval(myEvent);
	}
	jo.ex = jo.fn.ex=function(fns){for(var f in fns){this[f]=fns[f];}};
	
	jo.EVENT = jo.fn.EVENT=function (target, type, func) {
		if (target.addEventListener){
			target.addEventListener(type, func, false);
		}else if (target.attachEvent){
			target.attachEvent("on" + type, func);
		}else {
			target["on" + type] = func;
		}
	};
	
	
	jo.trim=jo.fn.trim=function(val){return val.replace(/(^\s*)|(\s*$)/g,"");};
	jo.parse={
		Function:function(funcstr,args){return new Function(args,funcstr);},
		Int:function(str){return parseInt(str);},
		String:function(str){return "" + str + "";},
		Json:function(str){
			try{
				eval("var _json=" + str + ";");
				return _json;
			}catch(ex){return null;}	
		},
		FormatString:function(Str,Data){
		return Str.replace(/\$(.*?)\$/igm,function(Ma){
			var n = Ma.replace(/\$/igm,"");
			var g = n.split("\/");
			var ss="";
			for(var j = 0;j<g.length;j++){
				ss+="[\"" + g[j] + "\"]"
			}
			try{
				eval("var value=Data" + ss + ";");
			}catch(ex){
				var value="";	
			}	
			return value;
		});
	},
	Format:function(Str){
		var arg = arguments;
		if(arg.length<=1){return Str;}
		return Str.replace(/\$(\d*)/igm,function(ma){
			try{
				return arg[parseInt(ma.replace(/\$/igm,""))];	
			}catch(ex){
				return ma;
			}	
		});
	}
	};
	jo.cookie={
    	SET	: function(name, value, days) {var expires = "";if (days) {var d = new Date();d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);expires = "; expires=" + d.toGMTString();}document.cookie = name + "=" + value + expires + "; path=/";},
		GET	: function(name) {var re = new RegExp("(\;|^)[^;]*(" + name + ")\=([^;]*)(;|$)");var res = re.exec(document.cookie);return res != null ? res[3] : null;}
	};
	window.myEvents=[];
	jo.load = jo.fn.load = function(fn){
		var isReady=false;
		if(jo.browser.IE){
			while(/loaded|complete/i.test(document.readyState)){
				fn();
				isReady = true;
			}	
			if(!isReady){
				window.attachEvent("onload",fn);	
				isReady = true;
			}
		}else{
			document.addEventListener("DOMContentLoaded",fn,false);
			isReady = true;
		}
		if(!isReady){
			window.addEventListener("load",fn,false);
		}
	};

})();

