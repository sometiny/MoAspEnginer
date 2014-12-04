return exports.command = exports.command || (function(){
	var $cmd = function(cmdstring,connection,cmdType){
		this.cmd = cmdstring ||"";
		this.parms_={};
		this.cmdobj=F.activex("ADODB.Command");
		this.cmdobj.ActiveConnection=connection;
		this.cmdobj.CommandType=cmdType||4;
	    this.cmdobj.Prepared = true;
	    this.parmsGet=false;
	    this.parms_count=0;
	    this.dataset = null;
	};
	$cmd.ParameterDirection = { INPUT:1, INPUTOUTPUT:3, OUTPUT:2, RETURNVALUE:4};
	$cmd.DataType = {
		ARRAY:0x2000,DBTYPE_I8:20,DBTYPE_BYTES:128,DBTYPE_BOOL:11,DBTYPE_BSTR:8,DBTYPE_HCHAPTER:136,DBTYPE_STR:129,DBTYPE_CY:6,DBTYPE_DATE:7,DBTYPE_DBDATE:133,
		DBTYPE_DBTIME:134,DBTYPE_DBTIMESTAMP:135,DBTYPE_DECIMAL:14,DBTYPE_R8:5,DBTYPE_EMPTY:0,DBTYPE_ERROR:10,DBTYPE_FILETIME:64,DBTYPE_GUID:72,DBTYPE_IDISPATCH:9,
		DBTYPE_I4:3,DBTYPE_IUNKNOWN:13,LONGVARBINARY:205,LONGVARCHAR:201,LONGVARWCHAR:203,DBTYPE_NUMERIC:131,DBTYPE_PROP_VARIANT:138,DBTYPE_R4:4,DBTYPE_I2:2,DBTYPE_I1:16,
		DBTYPE_UI8:21,DBTYPE_UI4:19,DBTYPE_UI2:18,DBTYPE_UI1:17,DBTYPE_UDT:132,VARBINARY:204,VARCHAR:200,DBTYPE_VARIANT:12,VARNUMERIC:139,VARWCHAR:202,DBTYPE_WSTR:130
	};
	$cmd.CommandType = { UNSPECIFIED:-1, TEXT:1, TABLE:2, STOREDPROC:4, UNKNOWN:8, FILE:256, TABLEDIRECT:512};
	$cmd.create = function(cmdstring,connection,cmdType){return new $cmd(cmdstring,connection,cmdType);};
	$cmd.prototype.add_parm = function(name,value,direction){
		this.parms_[name] = this.cmdobj.CreateParameter(name);
		this.parms_[name].Value = value;
		this.parms_[name].Direction = direction||1;
		return this.parms_[name];
	};
	$cmd.prototype.addInput = function(name,value,t,size){
		this.parms_[name] = this.cmdobj.CreateParameter(name, t, $cmd.ParameterDirection.INPUT, size, value);
		return this.parms_[name];
	};
	$cmd.prototype.add_parm_input = function(value,t,size){
		return this.addInput("@PARM" + ++this.parms_count,value,t,size);
	};
	$cmd.prototype.addInputInt = function(name,value){
		return this.addInput(name,value,$cmd.DataType.DBTYPE_I4,4);
	};
	$cmd.prototype.add_parm_input_int = function(value){
		return this.addInputInt("@PARM" + ++this.parms_count,value);
	};
	$cmd.prototype.addInputBigInt = function(name,value){
		return this.addInput(name,value,$cmd.DataType.DBTYPE_I8,8);
	};
	$cmd.prototype.add_parm_input_bigint = function(value){
		return this.addInputBigInt("@PARM" + ++this.parms_count,value);
	};
	$cmd.prototype.addInputVarchar = function(name,value,size){
		return this.addInput(name,value,$cmd.DataType.VARCHAR,size||50);
	};
	$cmd.prototype.add_parm_input_varchar = function(value,size){
		return this.addInputVarchar("@PARM" + ++this.parms_count,value,size);
	};
	$cmd.prototype.addOutput = function(name,t,size){
		this.parms_[name] = this.cmdobj.CreateParameter(name, t, $cmd.ParameterDirection.OUTPUT, size);
		return this.parms_[name];
	};
	$cmd.prototype.add_parm_output = function(t,size){
		return this.addOutput("@PARM" + ++this.parms_count,t,size);
	};
	$cmd.prototype.add_parm_return = function(t,size){
		this.parms_["@RETURN"] = this.cmdobj.CreateParameter("@RETURN", t, $cmd.ParameterDirection.RETURNVALUE, size);
		return this.parms_["@RETURN"];
	};

	$cmd.prototype.getparm = function(name){
		if(!this.parmsGet){
			for(var i in this.parms_){
				if(!this.parms_.hasOwnProperty(i))continue;
				if(this.parms_[i].Direction>1){
					this.parms_[i].value = this.cmdobj(i).value;
				}
			}
			this.parmsGet=true;
		}
		if(typeof name=="number") name="@PARM" + name;
		if(!this.parms_.hasOwnProperty(name)) return null;
		return this.parms_[name];
	};
	$cmd.prototype.get_parm_return = function(){
		return this.getparm("@RETURN");
	};
	$cmd.prototype.exec = function(){
		this.cmdobj.CommandText = this.cmd;
		for(var i in this.parms_){
			if(!this.parms_.hasOwnProperty(i))continue;
			this.cmdobj.Parameters.Append(this.parms_[i]);
		}
		return this.cmdobj.execute();
	};
	return $cmd;
})();