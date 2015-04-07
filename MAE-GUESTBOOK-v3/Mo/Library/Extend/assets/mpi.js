/*debug*/
/*
** File: mpi.js
** Usage: mae package installer
** About: 
**		support@mae.im
*/

/**
 * create http request with "GET" method
 * @param {url} url to be requested;
 * @return {Object} httprequest instance;
 */
var WinHTTP = function(url){
	return F.activex("MSXML2.ServerXMLHttp",function(u){
		this.open("GET",u,false);
		this.send();
		return this;
	},url);
};

var MPIHost = "mpi.thinkasp.cn",
	installDirectory = IO.build(Mo.Config.Global.MO_CORE, "Library/Extend");

/**
 * install package
 * @param {pkg} package object;
 * @param {idy} install-path;
 * @return {Boolean} return true if package was installed successfully, otherwise false;
 */
function _install(pkg, idy){
	if(typeof pkg != "object"){
		Mpi.message = "package error.";
		return false;
	}
	if(!pkg.name || !/^([\w\.\-]+)$/ig.test(pkg.name)){
		Mpi.message = "package name format error.";
		return false;
	}
	var _installDirectory = IO.build(idy, pkg.name);
	if(IO.directory.exists(_installDirectory)){
		Mpi.message = "package is exists.";
		return false;
	}
	var pkgtype = Mpi.packageExists("jszip") ? "jszip" : (Mpi.packageExists("assets/tar") ? "tar" : (Mpi.packageExists("xmlpkg") ? "xmlpkg" : "none"));
	if(pkgtype=="none"){
		Mpi.message = "can not find any method to unpack.";
		return false;
	}
	var zipdata, JSZip, zip;
	try{
		var packagepath = IO.build(Mpi.PATH.CACHE,F.format("{0}@{1}.zip",pkg.name,pkg.version));
		zipdata = IO.file[pkgtype == "jszip" ? "readAllBytes" : "readAllText"](packagepath);
		if(pkgtype == "tar"){
			JSZip = require("assets/tar");
			zip = new JSZip(packagepath);
			IO.file.del(packagepath);
		}else{
			JSZip = require(pkgtype);
			IO.file.del(packagepath);
			zip = new JSZip(pkgtype == "jszip" ? base64.fromBinary(zipdata) : zipdata, {base64:true});
		}
	}catch(ex){
		Mpi.message = ex.description;
		return false;
	}
	var files = zip.files, unziped = [];
	for(var i in files){
		if(!files.hasOwnProperty(i)) continue;
		var file = files[i];
		if(file.name.substr(0,1)=="."){
			Mpi.message = "unsafe filename '" + file.name + "'.";
			while(unziped.length>0){
				var path = unziped.pop();
				if(path.substr(0,2)=="D~"){
					IO.directory.del(path.substr(2));
				}else{
					IO.file.del(path.substr(2));
				}
			}
			return false;
		}
		var dest = IO.build(_installDirectory,file.name);
		if(file.dir){
			IO.directory.create(dest);
			unziped.push("D~" + dest);
		}else{
			var parentDir=IO.parent(dest);
			if(!IO.directory.exists(parentDir)) IO.directory.create(parentDir);
			IO.file.writeAllBytes(dest,pkgtype == "jszip" ? base64.toBinary(base64.e(file._data.getContent())) : file.data);
			unziped.push("F~" + dest);
		}
	}
	return true;
};

/**
 * fetch httprequest return-value as json
 * @param {url} the url;
 * @return {Object} return json-object if parse successfully, otherwise null;
 */
function _fetchJson(url){
	try{
		var http = WinHTTP(url);
		if(http.status==200){
			return JSON.parse(http.responseText);
		}else if(http.status==500){
			Mpi.message = "Server error. message from server:'" + http.responseText + "'.";
		}else{
			Mpi.message = "Can not load package.server error-" + http.status + ".";
		}
	}catch(ex){
		Mpi.message = ex.description;
	}
	return null;
};

/**
 * fetch httprequest return-value as binary and save to local.
 * @param {url} the url;
 * @return {Boolean} return true if load successfully, otherwise false;
 */
function _saveBinary(url,path){
	try{
		var http = WinHTTP(url);
		if(http.status==200){
			IO.file.writeAllBytes(path,http.responseBody);
			return true;
		}else if(http.status==500){
			Mpi.message = "Server error. message from server:'" + http.responseText + "'.";
		}else{
			Mpi.message = "Can not load package.server error-" + http.status + ".";
		}
	}catch(ex){
		Mpi.message = ex.description;
	}
	return false;
};

/**
 * define mpi object
 */
var Mpi={};

/**
 * exception message
 */
Mpi.message="";

/**
 * quick paths
 */
Mpi.PATH = {
	CORE : IO.build(Mo.Config.Global.MO_CORE, "Library/Extend"),
	APP : IO.build(Mo.Config.Global.MO_APP, "Library/Extend"),
	CACHE : IO.build(Mo.Config.Global.MO_APP, "Cache")
};

/**
 * set mpi hostname
 * @param {host} the url;
 */
Mpi.Host = function(host){
	MPIHost = host;
};

/**
 * set default install-path
 * @param {dest} directory path;
 */
Mpi.setDefaultInstallDirectory = function(dest){
	installDirectory = IO.build(dest, "Library/Extend");;
};

/**
 * download package
 * @param {pkg} package object;
 * @return {Boolean} return true if download successfully, otherwise false;
 */
Mpi.download = function(pkg){
	var pkgtype = Mpi.packageExists("jszip") ? "" : (Mpi.packageExists("assets/tar") ? "tar" : (Mpi.packageExists("xmlpkg") ? "xmlpkg" : "none"));
	if(pkgtype == "none"){ 
		Mpi.message = "can not find any method to unpack.";
		return false;
	}
	var type = "";
	if(pkgtype == "tar") type = "tar";
	else if (pkgtype == "xmlpkg") type = "xml";
	return _saveBinary(F.string.format("http://{0}/?/mpi/package/download/{1}/{2}", MPIHost, pkg.name, pkgtype),IO.build(Mpi.PATH.CACHE,F.format("{0}@{1}.zip",pkg.name,pkg.version)));
};

/**
 * fetch all avaiable package list.
 * @return {Object} return packages array if fetch successfully, otherwise null;
 */
Mpi.fetchPackagesList = function(){
	return _fetchJson(F.string.format("http://{0}/?/mpi/package/list/fetch", MPIHost));
};

/**
 * fetch a package.
 * @param {pkg} package object;
 * @return {Object} return package object if fetch successfully, otherwise null;
 */
Mpi.fetchPackage = function(pkg){
	return _fetchJson(F.string.format("http://{0}/?/mpi/package/info/{1}/fetch", MPIHost, pkg))
};

/**
 * ensure if package has been installed.
 * @param {package} package object;
 * @return {Boolean} return true if package is exists, otherwise false;
 */
Mpi.packageExists = function(pkg){
	if(typeof pkg=="string") pkg = {name : pkg}
	if(!pkg.name || !/^([\w\.\-]+)$/ig.test(pkg.name)){
		Mpi.message = "package name format error.";
		return true;
	}
	return IO.directory.exists(IO.build(Mpi.PATH.APP,pkg.name)) || IO.directory.exists(IO.build(Mpi.PATH.CORE,pkg.name)) || IO.file.exists(IO.build(Mpi.PATH.APP,pkg.name)) || IO.file.exists(IO.build(Mpi.PATH.CORE,pkg.name));
};
Mpi.checkDependencies = function(pkg){
	if(!pkg) return false;
	if(pkg.dependencies){
		var dependencies = pkg.dependencies;
		for(var depend in dependencies){
			if(!dependencies.hasOwnProperty(depend)) continue;
			if(!Mpi.packageExists(depend)){
				Mpi.message = "depended module '" + depend + "' is not exists, please install it first.";
				return false;
			}
		}
	}
	return true;
};

/**
 * install package(th package must be download first).
 * @param {pkg} package object;
 * @param {option} install option;
 * @return {Boolean} return true if install successfully, otherwise false;
 */
Mpi.install = function(pkg, option){
	var idy = option ? (option.dir || Mpi.PATH[option.path]) : installDirectory;
	return _install(pkg, idy);
};

/**
 * install package in one function
 * @param {pkgname} package name;
 * @param {option} install option;
 * @return {Boolean} return true if install successfully, otherwise false;
 */
Mpi.downloadAndInstall = function(pkgname,option){
	if(Mpi.packageExists(pkgname)){
		Mpi.message = Mpi.message || "package is exists.";
		return false;
	}
	var pkg = Mpi.fetchPackage(pkgname);
	if(!Mpi.checkDependencies(pkg)) return false;
	if(!Mpi.download(pkg)) return false;
	return Mpi.install(pkg, option);
}
module.exports = Mpi;