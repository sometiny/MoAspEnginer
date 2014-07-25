<script language="jscript" runat="server">
/*'by anlige at www.9fn.net*/
function MoLibHashTable(){
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
MoLibHashTable.prototype.New = MoLibHashTable.New = function(){return new MoLibHashTable(arguments);};
MoLibHashTable.prototype.GetEnumerator=function(){
		return new Enumerator(this.table);
	};
MoLibHashTable.prototype.Sort = function(order,key){
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
MoLibHashTable.prototype.Set = function(key,value,dataType){
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
MoLibHashTable.prototype.Add = function(key,value){
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
MoLibHashTable.prototype.Count = function(){return this.table.length;};

MoLibHashTable.prototype.Get = function(key){
	if(this.Count()<=0){return "";}
	for(var i=0;i<this.Count();i++){
		if(this.table[i]["key"].toLowerCase()==key.toLowerCase()){
			return this.table[i]["value"];
		}	
	}
	return "";
};
MoLibHashTable.prototype.Remove = function(key){
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
MoLibHashTable.prototype.Each = function(fn){
	if(this.table.length<=0){return;}
	if(typeof fn!="function"){return;}
	for(var i=0;i<this.Count();i++){
		fn.apply(this.table[i],[i]);
	}
};
MoLibHashTable.prototype.UriComponents = function(){
	var str="";
	this.Each(function(){
		str+=encodeURIComponent(this.key) + "="+encodeURIComponent(this.value)+"&";				   
	});
	if(str!="")str = str.substr(0,str.length-1);
	return str;
};
MoLibHashTable.prototype.ToString = function(split1,split2){
	split1 = split1 || "";
	split2 = split2 || "";
	var str="";
	this.Each(function(){
		str+=this.key + split1+this.value+split2;				   
	});
	if(str!="")str = str.substr(0,str.length-split2.length);
	return str;
};
MoLibHashTable.prototype.BeginRead = function(){
	this.index=-1;
};
MoLibHashTable.prototype.Eof = function(){
	if(this.table.length<=0){return true;}
	return this.index>=this.table.length-1;
};
MoLibHashTable.prototype.Read = function(){
	this.index++;
	return this.table[this.index];
};
</script>
