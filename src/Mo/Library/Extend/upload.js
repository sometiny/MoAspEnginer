/*
** File: upload.js
** Usage: a library for save upload-data from client;
**		F.exports.upload(cfg); //for process upload-data
**			@parameter cfg [object], upload config.
**			@return [object], if upload-data is processed successfully, return true, or return false;

**		F.exports.upload(index); //for get file item by index
**			@parameter index [int], file index in file items array.
**			@return [object], if file is find, return file-item, or return null;

**		F.exports.upload(name); //for get file item by name
**			@parameter name [string], form name of the file(s).
**			@return [object], if file is find, return file-item or file-item array(more than one file), or return null;

**		F.exports.upload.save(name|file); //save file by form name or file-item object
**			@parameter name [string], form name of the file(s).
**			@parameter file [object], file-item object, you can use F.exports.upload(index|name) to get it.
**			@return [int], return count of files that is saved successfully.

**		F.exports.upload.files [array], file-item array.
** About: 
**		support@mae.im
*/
var cfg={
	AllowFileTypes : "",
	AllowMaxSize : -1,
	AllowMaxFileSize : -1,
	Charset : "gb2312",
	SavePath : "",
	RaiseServerError : true
};
function $fileManager(){
	
};
$fileManager.fn = $fileManager.prototype;
$fileManager.fn.addFile = function(formname){
	var $item = new $fileItem();
	$item.FormName = formname;
	$upload.files.push($item);
	return $item;
};
$fileManager.fn.addForm = function(key,value){
	if(F.post.exists(key))F.post(key,F.post(key) + ", " + value);
	else F.post(key,value);
};

function $fileItem(){
	this.ContentType = "";
	this.Size = 0;
	this.UsersetName = "";
	this.Path = "";
	this.Position = 0;
	this.FormName = "";
	this.NewName = "";
	this.FileName = "";
	this.LocalName = "";
	this.IsFile = false;
	this.Extend = "";
	this.Succeed = false;
	this.Exception = "";
}

function $upload(cfg_){
	if(typeof cfg_ == "string"){
		var fileCommection=[];
		for(var i=0;i< $upload.files.length;i++){
			if($upload.files[i].FormName.toLowerCase()==cfg_.toLowerCase()){
				fileCommection.push($upload.files[i]);
			}
		}
		if(fileCommection.length==0)return null;
		if(fileCommection.length==1)return fileCommection[0];
		return fileCommection;
	}
	if(typeof cfg_ == "number"){
		if(cfg_>=$upload.files.length) return null;
		return $upload.files[cfg_];
	}
	var $g={};
	F.extend($g, cfg, cfg_);
	$upload.$cfg = $g;
	if(!F.vbs.include("upload")) return;
	F.vbs.ns("UploadManager",new $fileManager());
	var $base = F.vbs.require("upload");
	$upload.$base = $base;
	$base.AllowMaxSize = $g.AllowMaxSize;
	$base.AllowFileTypes = $g.AllowFileTypes;
	$base.AllowMaxFileSize = $g.AllowMaxFileSize;
	$base.SavePath = $g.SavePath;
	$base.Charset = $g.Charset;
	if(!$base.getData()) 
	{
		if($g.RaiseServerError)ExceptionManager.put(0x2005,"F.exports.upload.getData()",$base.Description);
		else $upload.exception = $base.Description;
		return false;
	}
	return true;
};
$upload.$cfg=null;
$upload.$exception="";
$upload.$base=null;
$upload.files=[];
$upload.save = function(File, Option, OverWrite){
	if(typeof File != "string" && typeof File != "object"){
		OverWrite = Option;
		Option = File;
		File="";
	}
	if($upload.$base==null){
		if($upload.$cfg.RaiseServerError) ExceptionManager.put(0x5800,"F.exports.upload.save()","base upload manager is null.");
		else $upload.exception = "base upload manager is null.";
		return 0;
	}
	if(Option===undefined) Option=0;
	if(OverWrite!==false) OverWrite=true;
	if(Option!=0 && Option!=1 && Option!=-1){
		if($upload.$cfg.RaiseServerError) ExceptionManager.put(0x5800,"F.exports.upload.save()","argument 'Option' error.");
		else $upload.exception = "argument 'Option' error.";
		return 0;
	}
	try{
		if(File==null){
			if($upload.$cfg.RaiseServerError) ExceptionManager.put(0x9000,"F.exports.upload.save()","File item is null.");
			else $upload.exception = "File item is null.";
		}
		else if(typeof File == "object")
		{
			$upload.$base.Save(File, Option, OverWrite);
			if(File.Exception!="") {
				if($upload.$cfg.RaiseServerError) ExceptionManager.put(0x7000,"F.exports.upload.save()",File.Exception);
				else $upload.exception = File.Exception;
				return 0;
			}
			return 1;
		}
		else
		{
			File = File.toLowerCase();
			var fileCount=0;
			for(var i=0;i< $upload.files.length;i++){
				if($upload.files[i].FormName.toLowerCase()==File || File == ""){
					fileCount++;
					$upload.$base.Save($upload.files[i], Option, OverWrite);
					if($upload.files[i].Exception!=""){
						if($upload.$cfg.RaiseServerError) ExceptionManager.put(0x8100,"F.exports.upload.save()",$upload.files[i].Exception);
						else $upload.exception = $upload.files[i].Exception;
						return 0;
					}
				}
			}
			if(fileCount==0){
				if($upload.$cfg.RaiseServerError) ExceptionManager.put(0x8800,"F.exports.upload.save()","file '" + File + "' can not be found.");
				else $upload.exception = "file '" + File + "' can not be found.";
				return 0;
			}else{
				return fileCount;
			}
		}
	}catch(ex){
		if($upload.$cfg.RaiseServerError) ExceptionManager.put(ex, "F.exports.upload.save");
		else $upload.exception = ex.description;
		return 0;
	}
};
return exports.upload = $upload;