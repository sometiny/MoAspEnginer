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
var cfg = {
	AllowFileTypes : "",
	AllowMaxSize : -1,
	AllowMaxFileSize : -1,
	Charset : "gb2312",
	SavePath : "",
	RaiseServerError : true,
	OnSucceed:function(files,cfg){},
	OnError:function(exception){}
};
var cfg_f = {
	OverWrite : true,
	Type : 0,
	OnError : function(exception){},
	OnSucceed : function(fileCount,fileArray){}
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
		$g.OnError.call($upload,$base.Description,$g);
		if($g.RaiseServerError)ExceptionManager.put(0x2005,"F.exports.upload.getData()",$base.Description);
		else $upload.exception = $base.Description;
		return false;
	}
	$g.OnSucceed.call($upload,$g);
	return true;
};
$upload.$cfg=null;
$upload.$exception="";
$upload.$base=null;
$upload.files=[];
$upload.save = function(File,opt){
	if(arguments.length==1){
		opt = File;
		File="";
	}
	var $opt = {}, exception;
	F.extend($opt, cfg_f, opt);

	if($upload.$base==null){
		$opt.OnError.call(null,"base upload manager is null.");
		return 0;
	}
	if($opt.Type!=0 && $opt.Type!=1 && $opt.Type!=-1){
		$opt.OnError.call(null,"argument 'Type' error.");
		return 0;
	}
	try{
		if(File==null) $opt.OnError.call(null,"File item is null.");
		else if(typeof File == "object")
		{
			$upload.$base.Save(File, $opt.Type, $opt.OverWrite);
			if(File.Exception!="") {
				$opt.OnError.call(null,File.Exception);
				return 0;
			}
			$opt.OnSucceed.call(1,[File]);
			return 1;
		}
		else
		{
			File = File.toLowerCase();
			var fileCount=0, fileArray=[];
			for(var i=0;i< $upload.files.length;i++){
				if($upload.files[i].FormName.toLowerCase()==File || File == ""){
					fileCount++;
					$upload.$base.Save($upload.files[i], $opt.Type, $opt.OverWrite);
					if($upload.files[i].Exception!=""){
						$opt.OnError.call(null,$upload.files[i].Exception);
						return 0;
					}
					fileArray.push($upload.files[i]);
				}
			}
			if(fileCount==0){
				$opt.OnError.call(null,"file '" + File + "' can not be found.");
				return 0;
			}else{
				$opt.OnSucceed.call(fileCount,fileArray);
				return fileCount;
			}
		}
	}catch(ex){
		$opt.OnError.call(null,ex.description);
		return 0;
	}
};
return exports.upload = $upload;