(function(F){
	F.extend({
		"format":function(Str){
			var arg = arguments;
			if(arg.length<=1){return Str;}
			return Str.replace(/\{(\d*)\}/igm,function(ma){
					try{
							return arg[parseInt(ma.replace(/\{(\d+)\}/igm,"$1"))+1];        
					}catch(ex){
							return ma;
					}        
			});
		},
		"text":function(html){
			var ret="";
			ret = html.replace(/(<\/(p|h1|h2|h3|h4|h5|h6|div|li|ul|form|ol)>)/igm,"\r\n");
			ret = ret.replace(/<(br)([\s\S]*?)>/igm,"\r\n");
			ret = ret.replace(/<([\s\S]+?)>/igm,"");
			return F.unescape(ret);
		},
		"escape":function(src){
			src=src||"";
			var ret = src.replace(/&/igm,"&amp;");
			ret = ret.replace(/>/igm,"&gt;");
			ret = ret.replace(/</igm,"&lt;");
			ret = ret.replace(/ /igm,"&nbsp;");
			ret = ret.replace(/\"/igm,"&quot;");
			ret = ret.replace(/\u00a9/igm,"&copy;");
			ret = ret.replace(/\u00ae/igm,"&reg;");
			ret = ret.replace(/\u00b1/igm,"&plusmn;");
			ret = ret.replace(/\u00d7/igm,"&times;");
			ret = ret.replace(/\u00a7/igm,"&sect;");
			ret = ret.replace(/\u00a2/igm,"&cent;");
			ret = ret.replace(/\u00a5/igm,"&yen;");
			ret = ret.replace(/\u2022/igm,"&middot;");
			ret = ret.replace(/\u20ac/igm,"&euro;");
			ret = ret.replace(/\u00a3/igm,"&pound;");
			ret = ret.replace(/\u2122/igm,"&trade;");
			return ret
		},
		"unescape":function(html){
			var ret = html.replace(/&amp;/igm,"&");
			ret = ret.replace(/&gt;/igm,">");
			ret = ret.replace(/&lt;/igm,"<");
			ret = ret.replace(/&nbsp;/igm," ");
			ret = ret.replace(/&quot;/igm,"\"");
			ret = ret.replace(/&copy;/igm,"\u00a9");
			ret = ret.replace(/&reg;/igm,"\u00ae");
			ret = ret.replace(/&plusmn;/igm,"\u00b1");
			ret = ret.replace(/&times;/igm,"\u00d7");
			ret = ret.replace(/&sect;/igm,"\u00a7");
			ret = ret.replace(/&cent;/igm,"\u00a2");
			ret = ret.replace(/&yen;/igm,"\u00a5");
			ret = ret.replace(/&middot;/igm,"\u2022");
			ret = ret.replace(/&euro;/igm,"\u20ac");
			ret = ret.replace(/&pound;/igm,"\u00a3");
			ret = ret.replace(/&trade;/igm,"\u2122");
			return ret;
		},
		"copy":function(txt){
			if (window.clipboardData) {
				window.clipboardData.clearData();
				window.clipboardData.setData("Text", txt);
			}
			else if (navigator.userAgent.indexOf("Opera") != -1) {
				window.location = txt;
			}
			else if (window.netscape) {
				try {
					netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				}
				catch (e) {
					alert("您的firefox安全限制限制您进行剪贴板操作，请打开’about:config’将signed.applets.codebase_principal_support’设置为true’之后重试，相对路径为firefox根目录/greprefs/all.js");
					return false;
				}
				var clip = Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(Components.interfaces.nsIClipboard);
				if (!clip) return;
				var trans = Components.classes['@mozilla.org/widget/transferable;1'].createInstance(Components.interfaces.nsITransferable);
				if (!trans) return;
				trans.addDataFlavor('text/unicode');
				var str = new Object();
				var len = new Object();
				var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
				var copytext = txt; str.data = copytext;
				trans.setTransferData("text/unicode", str, copytext.length * 2);
				var clipid = Components.interfaces.nsIClipboard;
				if (!clip) return false;
				clip.setData(trans, null, clipid.kGlobalClipboard);
			}	
		},
		"encode":function(val){return encodeURIComponent(val||"").replace(/\+/,"%2B");},
		"decode":function(val){return decodeURIComponent(val||"");},
		"mask":function(color,opacity){
			color=color||"#666";
			opacity = opacity || 0.5;
			var mask=null;
			if(!document.getElementById("F-MASK-DIV-1")){
				mask = document.createElement("div");
				mask.id="F-MASK-DIV-1";
				document.body.appendChild(mask);
			}else{
				mask = document.getElementById("F-MASK-DIV-1");
			}
			if(mask==null)return;
			F(mask).css({"z-index":999,"background-color":color,"position":"absolute","display":"block"});
			F(mask).css("opacity",opacity);
			F(window).scroll(F.showMask).resize(F.showMask);
			return F;
		},
		"showMask":function(){
			var pos = F.rectangle();
			F("#F-MASK-DIV-1").css({"left":"0","top":"0","width":(pos.left+pos.width)+"px","height":(pos.top+pos.height)+"px"});
			return F
		},
		"closeMask":function(){
			F("#F-MASK-DIV-1").css("display","none");
			return F
		},
		"removeMask":function(){
			document.body.removeChild(document.getElementById("F-MASK-DIV-1"));
			return F;
		},
		"join":function(opt1,opt2){
			opt1 = opt1 ||{};
			opt2 = opt2||{};
			for(var i in opt2){
				opt1[i]=opt2[i];	
			}
			return opt1;
		}
	});
	F.extend({
		"rectangle":function(){
			var body = document.body, 
			html = document.documentElement, 
			clientTop = html.clientTop || body.clientTop || 0, 
			clientLeft = html.clientLeft || body.clientLeft || 0, 
			top = (self.pageYOffset || html.scrollTop || body.scrollTop ) - clientTop, 
			left = (self.pageXOffset || html.scrollLeft || body.scrollLeft) - clientTop;
			return { "top": top, "left": left,"width": window.innerWidth||document.documentElement.clientWidth, "height": window.innerHeight||document.documentElement.clientHeight }; 
		}
	});
	F.fn.extend({
		"check":function(val){
			if(val!==false)val=true;
			this.checked=val;
		},
		"lazyLoad":function(opt){
			opt=opt||{replaceHolder:"",offset:0};
			opt.offset = opt.offset||0;
			opt.replaceHolder = opt.replaceHolder||"";
			var rectangle=F.rectangle();
			if(this.complete)return;
			var self__ = F(this);
			if(self__.position().top-rectangle.top-rectangle.height>(opt.offset||0)){
				self__.attr("src__",self__.attr("src"));
				self__.attr("src",opt.replaceHolder);
				self__.attr("loaded","false");
			}else{
				self__.attr("loaded","true");
			}
			F(window).scroll((function(opt,self){return function(){
				var rectangle=F.rectangle();
				var self_=F(self);
				if(self_.attr("loaded")=="false" && self_.position().top-rectangle.top-rectangle.height<=(opt.offset||0)){
					self_.attr("src",self_.attr("src__"));
					self_.attr("loaded","true");
				}	  
			}})(opt,this));
		},
		"isInView":function(offset){
			var rectangle=F.rectangle();
			return F(this).position().top-rectangle.top-rectangle.height<=(offset||0);
		},
		"copy":function(){
			try{
				F.copy(F(this).text());
			}catch(ex){}
		},
		"dialog":function(opt,ext){
			if(!F.dialogOptionCache)F.dialogOptionCache={};
			if(!F.dialogOptionzIndex)F.dialogOptionzIndex=1000;
			if(!F.dialogOptionOpenedCount)F.dialogOptionOpenedCount=0;
			var optC=null;
			if(F(this).hasAttr("modialog") && F(this).attr("modialog")!=""){
				optC = F.dialogOptionCache[F(this).attr("modialog")];
			}
			if(opt!=undefined && typeof opt!="object"){
				if(F(this).attr("modialog")!=""){
					var did = F(this).attr("modialog");
					if(!optC)return F(this);
					if(opt=="close"){
						if(optC.beforeClose && (typeof optC.beforeClose=="function") && optC.beforeClose.apply(this,[])===false)return F(this);
						F("#"+ did).css({"display":"none"});
						if(F("div.mo-dialog-box").filter(":visible").length()<=0)F.closeMask();
					}else if(opt=="open"){
						if(optC.mask && optC.mask==true){F.mask().showMask();if(F.browser.google)window.scrollBy(0,-1);}
						F("#"+ did).css({"display":"block"});
						F("#"+ did).get(0).focus();
						if(optC.afterOpen && (typeof optC.afterOpen=="function"))optC.afterOpen.apply(this,[]);
					}else if(opt=="title" && ext){
						F(this).attr("title",ext);
						F("#"+did+" .mo-dialog-title").html(ext);
					}else if(opt=="content" && ext){
						F(this).html(ext);
					}else if(opt=="destroy"){
						F(this).dialog("close");
						document.body.removeChild(document.getElementById(did));
						var repnode = document.getElementById("mo-dialog-"+did);
						repnode.parentNode.replaceChild(optC.origin,repnode);
						delete(F.dialogOptionCache[did]);
					}
				}
				return F(this);
			}
			var self=this;
			var rangle = F.rectangle(),left,top;
			var optsrc=opt||{};
			if(!opt["afterOpen"] && optC)optC["afterOpen"]=function(){};
			if(!opt["beforeClose"] && optC)optC["beforeClose"]=function(){};
			opt=F.join(optC||{
				width:450,
				height:100,
				zindex:F.dialogOptionzIndex++,
				maxHeight:400,
				mask:true
			},optsrc);
			opt.zindex =F.dialogOptionzIndex++;
			if(optsrc.title)F(this).attr("title",optsrc.title);
			if(optsrc.content)F(this).html(optsrc.content);
			if(opt.left){
				left = opt.left+rangle.left;
			}else{
				left = rangle.left+parseInt((rangle.width-opt.width)/2);
			}
			if(opt.top){
				top = opt.top+rangle.top;
			}else{
				top = rangle.top+parseInt((rangle.height-opt.height)/2);
			}
			var id=F(this).attr("modialog");
			if(!id || id==""){
				opt.origin=this.cloneNode(true);
				id="F" + (Math.random()+"").substr(2);
				F(this).attr("modialog",id);
				var dialog = document.createElement("div");
				dialog.id=id;
				dialog.className="mo-dialog-box mo-dialog-box-radius";
				dialog.innerHTML="<div class=\"mo-dialog-title-container mo-dialog-box-radius-top\"><span class=\"mo-dialog-button-close\">&nbsp;</span><span class=\"mo-dialog-title\"></span></div><div class=\"mo-dialog-content-container\"><div class=\"mo-dialog-content\"></div></div><div class=\"mo-dialog-buttons\"><div class=\"mo-dialog-buttonsset\"></div></div>";
				document.body.appendChild(dialog);
				F(dialog).keypress(function(e){if(e.which==27)F("div[modialog='"+this.id+"']").dialog("close");});
				F(dialog).drag("#"+id +" .mo-dialog-title-container");
				F("#"+id+" .mo-dialog-content").append(this.cloneNode(true));
				self = F("#"+id+" .mo-dialog-content>div[modialog='" + id + "']").get(0);
				self.style.display="block";
				var newNode = this.cloneNode(false);
				newNode.id="mo-dialog-" + id;
				this.parentNode.replaceChild(newNode,this)
			}
			F.dialogOptionCache[id]=opt;
			F("#"+id).css({"z-index":opt.zindex,"width":opt.width + "px","height" :"auto" ,"max-height":opt.maxHeight+"px","position" : "absolute","left": left + "px","top" : top + "px","display":"none"});
			F("#"+id+" .mo-dialog-buttons").css("display","block");
			F("#"+id+" .mo-dialog-title").html(F(self).attr("title"));
			F(self).attr("title",null);
			F("#"+id+" .mo-dialog-button-close").unbind("click").click((function(id){return function(){F("[modialog='" + id + "']").dialog("close");}})(id));
			if(opt.buttons!==undefined){
				F("#"+id+" .mo-dialog-button-self").remove();
				if(opt.buttons && typeof opt.buttons=="object"){
					F("#"+id+" .mo-dialog-buttons").css({"display":"block"});
					var j=0;
					for(var i in opt.buttons){
						if(	typeof opt.buttons[i]=="function"){
							j++;
							F("#"+id+" .mo-dialog-buttonsset").append("<button class=\"mo-dialog-button-self mo-dialog-box-radius-5 mo-dialog-button-self-" + j + "\">" + i +"</button>");
							F("#"+id+" .mo-dialog-button-self-"+j).click((function(opt,self,fn){return function(){var result = fn.apply(self,[opt]);if(result!==false)F(self).dialog("close");}})(opt,self,opt.buttons[i]));
						}
					}
				}else if(opt.buttons===null){
					F("#"+id+" .mo-dialog-buttons").css({"display":"none"});
				}
			}
			F(self).dialog("open");
			return F(self);
		},
		"drag":function(source, offSetX, offSetY){
			if(!source)return;
			source = F(source);
			var target = this;
			var x0 = 0, y0 = 0, x1 = 0, y1 = 0, moveable = false, NS = (navigator.appName == 'Netscape');
			offSetX = typeof offSetX == "undefined" ? 0 : offSetX;
			offSetY = typeof offSetY == "undefined" ? 0 : offSetY;
			source.mousedown(function(e){
				if(e.which == 1)  {
					if(!NS){
						this.setCapture()
					}
					x0 = e.pageX ;  
					y0 = e.pageY ; 
					var ps = F(target).position();
					x1 = parseInt(ps.left);  
					y1 = parseInt(ps.top);    
					moveable = true;
				}  
			});   
			source.mousemove(function(e){
				if(e.which == 1 && moveable){  
					if(Math.abs(e.pageX - x0)>3 || Math.abs(e.pageY - y0)>3){
						target.style.left = (x1 + e.pageX - x0 - offSetX) + "px";  
						target.style.top  = (y1 + e.pageY - y0 - offSetY) + "px";  
					}
					this.style.cursor="move";
				}  
			});  
			source.mouseup(function (e){
				if(e.which == 1 && moveable)  {
					if(!NS){
						this.releaseCapture();
					}
					moveable = false;  
					this.style.cursor="default";
				}  
			});
		}
	});
})(F);