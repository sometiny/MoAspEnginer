/*by anlige at www.9fn.net*/
var MoLibFolder = {
	exception:"",
	classid:{fso:"Scripting.FileSystemObject"},
	fso:null,
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
		this.fso = null;
		this.inited = false;
	},
	/****************************************************
	'@DESCRIPTION:	ensure that the directory exists.
	'@PARAM:	path [String] : directory path
	'@RETURN:	[Boolean] if the directory exists,return true, or return false
	'****************************************************/
	exists:function(path){
		if(!this.inited)this.init();
		path = this.mappath(path);	
		return this.fso.FolderExists(path);
	},
	/****************************************************
	'@DESCRIPTION:	Delete directory
	'@PARAM:	path [String] : directory path
	'@RETURN:	[Boolean] if the directory is deleted successfully, return true, or return false;
	'****************************************************/
	Delete:function(path){
		if(!this.inited)this.init();
		path = this.mappath(path);	
		if(!this.fso.FolderExists(path)){
			this.exception="Folder Not Exists Exception";
			return false;	
		}
		try{
			this.fso.deleteFolder(path);
		}catch(ex){
			this.exception=ex.description;
			return false;	
		}		
	},
	/****************************************************
	'@DESCRIPTION:	create directory. if the parent directory don't exists, we will create it.
	'@PARAM:	path [String] : directory path
	'@RETURN:	[Boolean] if the directory is created successfully, return true, or return false;
	'****************************************************/
	create:function(path){
		path = this.mappath(path);
		if(this.exists(path))return true;
		var parent = this.fso.GetParentFolderName(path);
		if(!this.exists(parent))this.create(parent);
		try{
			this.fso.CreateFolder(path);
			return true;
		}catch(ex){
			return false;
		}
	},
	/****************************************************
	'@DESCRIPTION:	clear directory
	'@PARAM:	path [String] : directory path
	'@PARAM:	includeself [Boolean] : if includeself is true, this method equals 'delete' method.
	'@RETURN:	[Boolean] if the directory is cleared successfully, return true, or return false;
	'****************************************************/
	clear:function(path,includeself){
		if(!this.inited)this.init();
		if(includeself!==true)includeself=false;
		if(!this.exists(path)){
			this.exception="Folder Not Exists Exception";
			return false;	
		}
		try{
			path = this.mappath(path);	
			var folder = this.fso.getFolder(path);
			var files = folder.files;
			var fc = new Enumerator(files);
			for (;!fc.atEnd(); fc.moveNext()){
				if(fc.item().name!=".mae")fc.item().Delete();
			}
			files = folder.subfolders;
			fc = new Enumerator(files);
			for (;!fc.atEnd(); fc.moveNext()){
				fc.item().Delete();
			}
			if(includeself)folder.Delete();
			return true;	
		}catch(ex){
			this.exception=ex.description;
			return false;	
		}
	}
}
if(!exports.io)exports.io={};
return exports.io.folder = MoLibFolder;