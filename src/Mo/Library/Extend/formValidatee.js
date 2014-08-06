/****************************************************
'@DESCRIPTION:	define MoLibFormValidatee object
'****************************************************/
function MoLibFormValidatee(){
	this.settings={};
	this.exception="";
	this.quick={
		"qq":/^[0-9]{5,11}$/,
		"email":/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/,
		"mobile":/^1[0-9]{10}$/,
		"telphone":/^[0-9]+\-[0-9]{3,4}\-[0-9]{6,8}(\-[0-9]+)?$/,
		"zipcode":/^[0-9]{6}$/
	};
	this.currentnames=[];
}

/****************************************************
'@DESCRIPTION:	create an instance of MoLibFormValidatee. You can use it in vbscript.
'@RETURN:	[Object] instance of MoLibFormValidatee
'****************************************************/
MoLibFormValidatee.New = MoLibFormValidatee.prototype.New = function(){
	return new MoLibFormValidatee();	
};
MoLibFormValidatee.prototype.set = function(key,value){
	F.foreach(this.currentnames,function(i,v,_this){
		_this.settings[v][key]=value;
		_this.settings[v]["___rules"]+=key+":"+value+";";
	},this);
}
MoLibFormValidatee.prototype.name = function(name){
	this.currentnames=name.split(",");
	for(var i=0;i<this.currentnames.length;i++){
		if(!this.settings.hasOwnProperty(this.currentnames[i]))this.settings[this.currentnames[i]] = {"___rules":"","___msg":"","___exp":""};
	}
	return this;
};
MoLibFormValidatee.prototype["default"] = function(value){
	this.set("default",value);
	return this;
};
MoLibFormValidatee.prototype.required = function(value){
	this.set("required",value!==false);
	return this;
};
MoLibFormValidatee.prototype.minLength = function(value){
	if(isNaN(value))return this;
	this.set("min-length",value);
	return this;
};
MoLibFormValidatee.prototype.maxLength = function(value){
	if(isNaN(value))return this;
	this.set("max-length",value);
	return this;
};
MoLibFormValidatee.prototype.min = function(value){
	if(isNaN(value))return this;
	this.set("min",value);
	return this;
};
MoLibFormValidatee.prototype.max = function(value){
	if(isNaN(value))return this;
	this.set("max",value);
	return this;
};
MoLibFormValidatee.prototype.exp = function(value){
	if(value===undefined)return this;
	this.set("___exp",value);
	return this;
};
MoLibFormValidatee.prototype.msg = function(value){
	if(value===undefined)return this;
	this.set("___msg",value);
	return this;
};
MoLibFormValidatee.prototype.equal = function(value){
	if(value===undefined)return this;
	this.set("equal",value);
	return this;
};
MoLibFormValidatee.prototype.numeric = function(value){
	if(value===undefined)return this;
	this.set("numeric",value!==false);
	return this;
};
MoLibFormValidatee.prototype.length = function(value){
	if(value===undefined)return this;
	if(isNaN(value))return this;
	this.set("length",value);
	return this;
};
MoLibFormValidatee.prototype.between = function(min,max){
	if(min==undefined || max==undefined || isNaN(min) || isNaN(max) || min>max)return this;
	this.set("min",min);
	this.set("max",max);
	return this;
};
/****************************************************
'@DESCRIPTION:	AddRule
'@PARAM:	name [String] : rule name(for form input name). eg: 'name','name,title'
'@PARAM:	rule [String] : rule value.
'@PARAM:	msg [String] : error msg.
'****************************************************/
MoLibFormValidatee.prototype.AddRule=function(name,rule,msg){
	if(name===undefined || name=="")return;
	if(msg===undefined)msg="";
	if(rule=="")return;
	rule = F.string.trim(F.string.trim(rule),";");
	if(rule=="")return;
	var rules={"___rules":rule,"___msg":msg,"___exp":""};
	var names = name.split(",");
	for(var i=0;i<names.length;i++){
		this.settings[names[i]] = rules;
	}
	while(rule.length>0){
		var rule_ ="";
		if(rule.indexOf(";")>0){
			rule_ = rule.substr(0,rule.indexOf(";"));
			if(F.string.startWith(rule_,"exp:")){
				rule_ = rule;rule="";
			}else{
				rule = rule.substr(rule.indexOf(";")+1);
			}
		}else{
			rule_ = rule;rule="";
		}
		if(rule_=="")continue;
		var key=rule_;
		if(rule_.indexOf(":")>0){
			key = rule_.substr(0,rule_.indexOf(":"));
			rules[key] = rule_.substr(rule_.indexOf(":")+1);
		}else{
			rules[key]="true";
		}
		if(key=="qq" ||key=="email" ||key=="mobile" ||key=="telphone" ||key=="zipcode"){
			delete rules[key];
			rules["___exp"]=this.quick[key];
		}
		if(key=="between"){
			var value=rules[key]
			delete rules[key];
			if(value.indexOf(",")>0 && value.indexOf(",")<value.length-1){
				rules["min"]=value.substr(0,value.indexOf(","));
				rules["max"]=value.substr(value.indexOf(",")+1);
			}
		}
		if(key=="exp"){
			rules["___exp"]=rules[key];
			delete rules[key];
		}
	}
};

/****************************************************
'@DESCRIPTION:	display all rules
'@RETURN:	[String] rules string
'****************************************************/
MoLibFormValidatee.prototype.rules=function(){
	var returnValue="<pre>";
	for(var i in this.settings){
		if(!this.settings.hasOwnProperty(i))continue;
		returnValue+=i+":\r\n";
		for(var j in this.settings[i]){
			if(!this.settings[i].hasOwnProperty(j))continue;
			returnValue+="  "+j+" = "+this.settings[i][j]+"\r\n"
		}
	}
	return returnValue+"</pre>";
};

/****************************************************
'@DESCRIPTION:	Validate post data
'@RETURN:	[Boolean] if Validate passed, return true, or return false and you can read exception property to see details
'****************************************************/
MoLibFormValidatee.prototype.Validate=function(){
	this.exception="";
	var succeed=true;
	for(var name in this.settings){
		if(!this.settings.hasOwnProperty(name))continue;
		var thisexception="";
		var value=F.post(name);
		var Rules=this.settings[name];
		//default
		if(Rules.hasOwnProperty("default") && Rules["default"]!="" && value==""){
			F.post(name,Rules["default"]);
			value = F.post(name);
		}
		//required
		if(Rules.hasOwnProperty("required")){
			if(Rules["required"]=="true" && value==""){
				succeed=false;
				thisexception+="Required;"
			}
			if(Rules["required"]!="true" && value=="")continue;
		}else{
			if(value=="")continue;
		}
		//exp
		if(Rules["___exp"]!=""){
			if(F.post.exp(name,Rules["___exp"])==""){
				succeed=false;
				thisexception+="not match[" + Rules["___exp"] + "];"
			}
		}
		//numeric
		if(Rules.hasOwnProperty("numeric") && Rules["numeric"]=="true"){
			if(isNaN(value)){
				succeed=false;
				thisexception+="must be a number;"
			}
		}
		//length
		if(Rules.hasOwnProperty("length") && !isNaN(Rules["length"])){
			if(value.length!=parseInt(Rules["length"])){
				succeed=false;
				thisexception+="length must be[" + Rules["length"] + "];"
			}
		}
		//max-length
		if(Rules.hasOwnProperty("max-length") && !isNaN(Rules["max-length"])){
			if(value.length>parseInt(Rules["max-length"])){
				succeed=false;
				thisexception+="max-length[" + Rules["max-length"] + "];"
			}
		}
		//min-length
		if(Rules.hasOwnProperty("min-length") && !isNaN(Rules["min-length"])){
			if(value.length<parseInt(Rules["min-length"])){
				succeed=false;
				thisexception+="min-length[" + Rules["min-length"] + "];"
			}
		}
		//max
		if(Rules.hasOwnProperty("max") && !isNaN(Rules["max"])){
			if(isNaN(value)){
				succeed=false;
				thisexception+="must be a number;"
			}else{
				if(value*1>Rules["max"]*1){
					succeed=false;
					thisexception+="max value[" + Rules["max"] + "];"
				}
			}
		}
		//min
		if(Rules.hasOwnProperty("min") && !isNaN(Rules["min"])){
			if(isNaN(value)){
				succeed=false;
				thisexception+="must be a number;"
			}else{
				if(value*1<Rules["min"]*1){
					succeed=false;
					thisexception+="min value[" + Rules["min"] + "];"
				}
			}
		}
		//equal
		if(Rules.hasOwnProperty("equal")){
			if(F.post(Rules["equal"])!=value){
				succeed=false;
				thisexception+="must equal[" + Rules["equal"] + "];"
			}
		}
		if(thisexception!=""){
			if(Rules["___msg"]!=""){
				this.exception+=Rules["___msg"]+"\r\n";
			}else{
				this.exception+=name+"{"+thisexception+"}\r\n";
			}
		}
	}
	return succeed;
};
return MoLibFormValidatee;