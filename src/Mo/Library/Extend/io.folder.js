/*by anlige at www.9fn.net*/
var $folder = {
	exception:"",
	classid:{fso:"Scripting.FileSystemObject"},
	fso:null,
	inited:false,
	mappath:function(path){
		if(path.length<2)return Server.MapPath(path)
		if(path.substr(1,1)==":") return path;
		return Server.MapPath(path);	
	},
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
	uninit:function(){
		this.fso = null;
		this.inited = false;
	},
	exists:function(path){
		if(!this.inited)this.init();
		path = this.mappath(path);	
		return this.fso.FolderExists(path);
	},
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
return exports.io.folder = $folder;