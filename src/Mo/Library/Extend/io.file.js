/*by anlige at www.9fn.net*/
var $file = {
	exception:"",
	classid:{fso:"Scripting.FileSystemObject",stream:"ADODB.STREAM"},
	fso:null,
	stream:null,
	inited:false,
	mappath:function(path){
		if(path.length<2)return Server.MapPath(path)
		if(path.substr(1,1)==":") return path;
		return Server.MapPath(path);	
	},
	init:function(){
		try{
			this.fso = new ActiveXObject(this.classid.fso);
			this.stream = new ActiveXObject(this.classid.stream);
			this.inited = true;
			return true;
		}catch(ex){
			this.inited = false;
			return false;
		}
	},
	uninit:function(){
		try{this.stream.close();}catch(ex){}
		this.stream=null;
		this.fso = null;
		this.inited = false;
	},
	exists:function(path){
		if(!this.inited)this.init();
		path = this.mappath(path);	
		return this.fso.FileExists(path);
	},
	Delete:function(path){
		if(!this.inited)this.init();
		path = this.mappath(path);	
		if(!this.fso.FileExists(path)){
			this.exception="File Not Exists Exception";
			return false;	
		}
		try{
			this.fso.deleteFile(path);
			return true;
		}catch(ex){
			this.exception=ex.description;
			return false;	
		}
	},
	open:function(mode,type){
		if(!this.inited)this.init();
		try{this.stream.close();}catch(ex){}
		this.stream.mode = mode;
		this.stream.type = type;
		this.stream.open();
	},

	readtext:function(path,charset){
		if(!this.inited)this.init();
		path = this.mappath(path);	
		if(!this.exists(path)){
			this.exception="File Not Exists Exception";
			return "";	
		}
		try{
			charset = charset||"utf-8";
			this.open(3,2);
			this.stream.charset=charset;
			this.stream.loadfromfile(path);
			var txt = this.stream.readtext();
			this.stream.close();
			return txt;
		}catch(ex){
			this.exception="Error:" + ex.description;
			return "";	
		}
	},

	read:function(path,position,length){
		if(!this.inited)this.init();
		path = this.mappath(path);	
		if(!this.exists(path)){
			this.exception="File Not Exists Exception";
			return "";	
		}
		try{
			if(position==undefined)position = 0;
			this.open(3,1);
			this.stream.loadfromfile(path);
			this.stream.position = position;
			if(length==undefined)length = this.stream.size;
			var txt = this.stream.read(length);
			this.stream.close();
			return txt;
		}catch(ex){
			this.exception="Error:" + ex.description;
			return "";	
		}
	},

	writetext:function(path,content,charset){
		if(!this.inited)this.init();
		try{
			path = this.mappath(path);	
			charset = charset||"utf-8";
			this.open(3,2);
			this.stream.charset=charset;
			this.stream.writetext(content);
			this.stream.savetofile(path,2);
			this.stream.close();
			return true;
		}catch(ex){
			this.exception="Error:" + ex.description;
			return false;	
		}
	},

	appendtext:function(path,content,charset){
		if(!this.inited)this.init();
		try{
			path = this.mappath(path);	
			charset = charset||"utf-8";
			this.open(3,2);
			this.stream.charset=charset;
			if(this.exists(path)) this.stream.loadfromfile(path);
			this.stream.position = this.stream.size;
			this.stream.writetext(content);
			this.stream.savetofile(path,2);
			this.stream.close();
			return true;
		}catch(ex){
			this.exception="Error:" + ex.description;
			return false;	
		}
	},
	write:function(path,content){
		if(!this.inited)this.init();
		try{
			path = this.mappath(path);	
			this.open(3,1);
			this.stream.write(content);
			this.stream.savetofile(path,2);
			this.stream.close();
			return true;
		}catch(ex){
			this.exception="Error:" + ex.description;
			return false;	
		}
	},
	append:function(path,content){
		if(!this.inited)this.init();
		try{
			path = this.mappath(path);	
			this.open(3,1);
			if(this.exists(path)) this.stream.loadfromfile(path);
			this.stream.position = this.stream.size;
			this.stream.write(content);
			this.stream.savetofile(path,2);
			this.stream.close();
			return true;
		}catch(ex){
			this.exception="Error:" + ex.description;
			return false;	
		}
	},

	join:function(target,src,astext,charset){
		if(!this.inited)this.init();
		if(astext!==true)astext=false;
		charset = charset ||"utf-8";
		target = this.mappath(target);
		src = this.mappath(src);
		if(!this.exists(src)){
			this.exception="Source File Not Exists Exception";
			return false;	
		}
		try{
			this.appendtext(target,this.readtext(src,charset),charset);
			return true;
		}catch(ex){
			this.exception="Error:" + ex.description;
			return false;	
		}
	}
};
if(!exports.io)exports.io={};
return exports.io.file = $file;