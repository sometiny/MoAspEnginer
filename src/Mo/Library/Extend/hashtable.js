/*
** File: hashtable.js
** Usage: realize hashtable
** About: 
**		support@mae.im
*/
function $hashtable(){
	this.table=[];
	this.index=0;
	var args=[];
	if(arguments.length % 2==0){
		args = arguments;
	}
	if(arguments.length==1 && arguments[0].length && arguments[0].length % 2==0){
		args = arguments[0];	
	}
	if(args.length<=0 || args.length %2!=0)return;
	for(var i=0;i<args.length-1;i+=2){
		this.Set(args[i],args[i+1]);
	}
}
$hashtable.fn = $hashtable.prototype;
$hashtable.fn.New = $hashtable.New = function(){return new $hashtable(arguments);};
$hashtable.fn.GetEnumerator=function(){
		return new Enumerator(this.table);
	};
$hashtable.fn.Sort = function(order,key){
	if(this.Count()<=0){return ;}
	var isASC = true;
	if(order.toLowerCase()=="asc"){
		isASC=true;
	}else if(order.toLowerCase()=="desc"){
		isASC=false;
	}
	if(key!="key" && key !="value"){key="key";}
	var __temp = null;
	for(var i=0;i<this.Count()-1;i++){
		for(var j=i+1;j<this.Count();j++){
			if(this.table[i][key]>this.table[j][key] == isASC){
				var thevalue=this.table[i];
				this.table[i] = this.table[j];
				this.table[j] = thevalue;
			}
		}
	}
};
$hashtable.fn.Set = function(key,value,dataType){
	value = value ||"value";
	dataType = dataType ||"string";
	if(this.table.length==0){
		this.table[0]={"key":key,"value":value,"type__":dataType};
	}else{
		var isIn = false;
		for(var i=0;i<this.table.length;i++){
			if(this.table[i]["key"].toLowerCase()==key.toLowerCase()){
				this.table[i]["value"]= value;
				this.table[i]["type__"]= dataType;
				isIn = true;
				break;
			}
		}	
		if(!isIn){
			this.table.push({"key":key,"value":value,"type__":dataType});	
		}
	}
};
$hashtable.fn.Add = function(key,value){
	if(!value){value="";}
	if(this.table.length==0){
		this.table[0]={"key":key,"value":value};
	}else{
		var isIn = false;
		for(var i=0;i<this.table.length;i++){
			if(this.table[i]["key"].toLowerCase()==key.toLowerCase()){
				if(this.table[i]["value"]!=""){
					this.table[i]["value"]= this.table[i]["value"] + ", " + value;
				}else{
					this.table[i]["value"]= value;
				}
				isIn = true;
				break;
			}
		}	
		if(!isIn){
			this.table.push({"key":key,"value":value});	
		}
	}
};
$hashtable.fn.Count = function(){return this.table.length;};

$hashtable.fn.Get = function(key){
	if(this.Count()<=0){return "";}
	for(var i=0;i<this.Count();i++){
		if(this.table[i]["key"].toLowerCase()==key.toLowerCase()){
			return this.table[i]["value"];
		}	
	}
	return "";
};
$hashtable.fn.Remove = function(key){
	if(this.Count()<=0){return;}
	if(!key){this.table=[];return;}
	var ___temp=[];
	for(var i=0;i<this.Count();i++){
		if(this.table[i]["key"].toLowerCase()!=key.toLowerCase()){
			___temp.push(this.table[i]);
		}	
	}
	this.table=___temp;
};
$hashtable.fn.Each = function(fn){
	if(this.table.length<=0){return;}
	if(typeof fn!="function"){return;}
	for(var i=0;i<this.Count();i++){
		fn.apply(this.table[i],[i]);
	}
};
$hashtable.fn.UriComponents = function(){
	var str="";
	this.Each(function(){
		str+=encodeURIComponent(this.key) + "="+encodeURIComponent(this.value)+"&";				   
	});
	if(str!="")str = str.substr(0,str.length-1);
	return str;
};
$hashtable.fn.toString = function(split1,split2){
	split1 = split1 || "";
	split2 = split2 || "";
	var str="";
	this.Each(function(){
		str+=this.key + split1+this.value+split2;				   
	});
	if(str!="")str = str.substr(0,str.length-split2.length);
	return str;
};
return exports.hashtable = $hashtable;