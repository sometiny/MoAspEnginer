/*by anlige at www.9fn.net*/
var $file = {
	exception:"",
	classid:{fso:"Scripting.FileSystemObject",stream:"ADODB.STREAM"},
	fso:null,
	stream:null,
	inited:false,
	/****************************************************
	'@DESCRIPTION:	override 'Server.Mappath' method
	'@PARAM:	path [String] : path. eg: 'E:\a.asp','/a.asp','a.asp'
	'@RETURN:	[String] local file path
	'****************************************************/
	mappath:function(path){
		if(path.length<2)return Server.MapPath(path)
		if(path.substr(1,1)==":") return path;
		return Server.MapPath(path);	
	},
	/****************************************************
	'@DESCRIPTION:	init
	'****************************************************/
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
	/****************************************************
	'@DESCRIPTION:	uninit
	'****************************************************/
	uninit:function(){
		try{this.stream.close();}catch(ex){}
		this.stream=null;
		this.fso = null;
		this.inited = false;
	},
	/****************************************************
	'@DESCRIPTION:	ensure that the file exists.
	'@PARAM:	path [String] : file path
	'@RETURN:	[Boolean] if the file exists,return true, or return false
	'****************************************************/
	exists:function(path){
		if(!this.inited)this.init();
		path = this.mappath(path);	
		return this.fso.FileExists(path);
	},
	/****************************************************
	'@DESCRIPTION:	Delete file
	'@PARAM:	path [String] : file path
	'@RETURN:	[Boolean] if the file is deleted successfully, return true, or return false;
	'****************************************************/
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
	/****************************************************
	'@DESCRIPTION:	open stream
	'@PARAM:	mode [Int] : stream mode. 1 for read, 2 for write, 3 for write/read ...
	'@PARAM:	type [Int] : stream type. 1 for binary, 2 for text
	'****************************************************/
	open:function(mode,type){
		if(!this.inited)this.init();
		try{this.stream.close();}catch(ex){}
		this.stream.mode = mode;
		this.stream.type = type;
		this.stream.open();
	},

	/****************************************************
	'@DESCRIPTION:	read text from local file
	'@PARAM:	path [String] : local file path
	'@PARAM:	charset [String] : file text charset
	'@RETURN:	[String] text string
	'****************************************************/
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

	/****************************************************
	'@DESCRIPTION:	read binary from local file
	'@PARAM:	path [String] : local file path
	'@PARAM:	position [Int[option]] : read start position
	'@PARAM:	length [Int[option]] : length need to read
	'@RETURN:	[Binary] binary data
	'****************************************************/
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

	/****************************************************
	'@DESCRIPTION:	write text to local file
	'@PARAM:	path [String] : local file path
	'@PARAM:	content [String] : content need to write to file
	'@PARAM:	charset [String] : text charset
	'@RETURN:	[Boolean] if text was wroten successfully, return true, or return false;
	'****************************************************/
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

	/****************************************************
	'@DESCRIPTION:	append text to local file
	'@PARAM:	path [String] : local file path
	'@PARAM:	content [String] : content need to append to file
	'@PARAM:	charset [String] : text charset
	'@RETURN:	[Boolean] if text was appended successfully, return true, or return false;
	'****************************************************/
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
	/****************************************************
	'@DESCRIPTION:	write binary data to local file
	'@PARAM:	path [String] : local file path
	'@PARAM:	content [Binary] : binary data need to write
	'@RETURN:	[Boolean] if binary data was wroten successfully, return true, or return false;
	'****************************************************/
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

	/****************************************************
	'@DESCRIPTION:	append binary data to local file
	'@PARAM:	path [String] : local file path
	'@PARAM:	content [Binary] : binary data need to write
	'@RETURN:	[Boolean] if binary data was appended successfully, return true, or return false;
	'****************************************************/
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

	/****************************************************
	'@DESCRIPTION:	join to local file
	'@PARAM:	target [String] : target local file string.
	'@PARAM:	src [String] : source local file string.
	'@PARAM:	astext [Boolean] : forget it.
	'@PARAM:	charset [String] : text charset
	'@RETURN:	[Boolean] if files was joined successfully, return true, or return false;
	'****************************************************/
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
}
if(!exports.io)exports.io={};
return exports.io.file = $file;