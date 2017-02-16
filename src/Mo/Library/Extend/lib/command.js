/*
** About: 
**		support@mae.im
*/
var RecordsAffectedCmd = function(command){
	command.execute();
	return -1;
};
if (VBS && Mo.Config.Global.MO_LOAD_VBSHELPER) {
    VBS.execute("function RecordsAffectedCmd_(command) : dim RecordsAffectedvar : Call command.execute(RecordsAffectedvar) : RecordsAffectedCmd_ = RecordsAffectedvar : end function");
	RecordsAffectedCmd = VBS.getref("RecordsAffectedCmd_");
}
function COMMAND(conn){
	this.cmd = "";
	this.parms_={};
	this.cmdobj=F.activex("ADODB.Command");
	this.cmdobj.CommandType=1;
    this.cmdobj.Prepared = true;
    this.cmdobj.ActiveConnection = conn;
    this.parms_count=0;
    this.affectedRows = -1;
    this.parms_got = false;
}
COMMAND.prototype.text = function(cmd){
	this.cmd = cmd;
	this.cmdobj.CommandType=1;
	return this;
};
COMMAND.prototype.table = function(cmd){
	this.cmd = cmd;
	this.cmdobj.CommandType=2;
	return this;
};
COMMAND.prototype.proc = function(cmd){
	this.cmd = cmd;
	this.cmdobj.CommandType=4;
	return this;
};
COMMAND.prototype.prepare = function(no){
	this.cmdobj.Prepared = no !== false;
	return this;
};
COMMAND.prototype.type = function(t){
	this.cmdobj.CommandType = t;
	return this;
};

COMMAND.prototype.parms = function(){
	var _this = this;
	return {
		"int" : function(value){
			_this.add_parm_input_int(value);
			return this;
		},
		"single" : function(value){
			_this.add_parm_input_single(value);
			return this;
		},
		"double" : function(value){
			_this.add_parm_input_double(value);
			return this;
		},
		"varchar" : function(value, size){
			_this.add_parm_input_varchar(value, size);
			return this;
		},
		"bigint" : function(value){
			_this.add_parm_input_bigint(value)
			return this;
		},
		"input" : function(value, t, size){
			_this.add_parm_input(value, t, size);
			return this;
		},
		"output" : function(t,size,totalp){
			_this.add_parm_output(t,size,totalp);
			return this;
		},
		"ret" : function(t,size){
			if(t===undefined){
				return _this.getparm("@RETURN");
			}else{
				_this.add_parm_return();
				return this;
			}
		}
	};
};
COMMAND.New = function(cmd,model,ct){return new COMMAND(cmd,model,ct);};
COMMAND.prototype.add_parm = function(name,value,direction){
	this.parms_[name] = this.cmdobj.CreateParameter(name);
	this.parms_[name].Value = value;
	this.parms_[name].Direction = direction||1;
	return this;
};
COMMAND.prototype.get_parm_name = function(){
	return "@PARM" + ++this.parms_count;
};

COMMAND.prototype.add_input = function(name,value,t,size){
	this.parms_[name] = this.cmdobj.CreateParameter(name, t, 1, size, value);
	return this;
};
COMMAND.prototype.add_parm_input = function(value,t,size){
	return this.add_input("@PARM" + ++this.parms_count,value,t,size);
};

COMMAND.prototype.add_input_int = function(name,value){
	return this.add_input(name,value,3,4);
};
COMMAND.prototype.add_parm_input_int = function(value){
	return this.add_input_int("@PARM" + ++this.parms_count,value);
};

COMMAND.prototype.add_input_bigint = function(name,value){
	return this.add_input(name,value,20,8);
};
COMMAND.prototype.add_parm_input_bigint = function(value){
	return this.add_input_bigint("@PARM" + ++this.parms_count,value);
};




COMMAND.prototype.add_input_single = function(name,value){
	return this.add_input(name,value,4,4);
};
COMMAND.prototype.add_parm_input_single = function(value){
	return this.add_input_single("@PARM" + ++this.parms_count,value);
};

COMMAND.prototype.add_input_double = function(name,value){
	return this.add_input(name,value,5,8);
};
COMMAND.prototype.add_parm_input_double = function(value){
	return this.add_input_double("@PARM" + ++this.parms_count,value);
};



COMMAND.prototype.add_input_varchar = function(name,value,size){
	return this.add_input(name,value,200,size||50);
};
COMMAND.prototype.add_parm_input_varchar = function(value,size){
	return this.add_input_varchar("@PARM" + ++this.parms_count,value,size);
};

COMMAND.prototype.add_output = function(name,t,size){
	this.parms_[name] = this.cmdobj.CreateParameter(name, t, 2, size);
	return this;
};
COMMAND.prototype.add_parm_output = function(t,size){
	var parm_name = "@PARM" + ++this.parms_count;
	if(size===true)size=undefined;
	return this.add_output(parm_name,t,size);
};

COMMAND.prototype.add_return = function(name,t,size){
	this.parms_[name] = this.cmdobj.CreateParameter(name, t, 4, size);
	return this;
};
COMMAND.prototype.add_parm_return = function(t,size){
	return this.add_return("@RETURN",t,size);
};

COMMAND.prototype.getparm = function(name){
	if(!this.parms_got){
		for(var i in this.parms_){
			if(!this.parms_.hasOwnProperty(i))continue;
			if(this.parms_[i].Direction>1){
				this.parms_[i].value = this.cmdobj(i).value;
			}
		}
		this.parms_got=true;
	}
	if(typeof name=="number") name="@PARM" + name;
	if(!this.parms_.hasOwnProperty(name)) return null;
	return this.parms_[name];
}
COMMAND.prototype.get_parm_return = function(){
	return this.getparm("@RETURN");
};

COMMAND.prototype.prepare_parms = function(){
	if(this.cmdobj.CommandType == 1){
		if(this.cmd.indexOf("?")>=0){
			this.cmdobj.CommandText = this.cmd;
			for(var i in this.parms_){
				if(!this.parms_.hasOwnProperty(i))continue;
				this.cmdobj.Parameters.Append(this.parms_[i]);
			}
		}else{
			var regexp = /@(\w+)/g, mat = regexp.exec(this.cmd), parm, index=0;
			while(mat){
				parm = this.parms_[mat[0]];
				if(!parm){
					ExceptionManager.put(new Exception(0xCD1236,"COMMAND.prepare_parms()","param '" + mat[0] + "' is not exists."));
					return this;
				}
				this.cmdobj.Parameters.Append(parm);
				mat = regexp.exec(this.cmd);
			}
			this.cmdobj.CommandText = this.cmd.replace(/@\w+/g, '?');
		}
	}else{
		this.cmdobj.CommandText = this.cmd;
		for(var i in this.parms_){
			if(!this.parms_.hasOwnProperty(i))continue;
			this.cmdobj.Parameters.Append(this.parms_[i]);
		}
	}
	return this;
};
COMMAND.prototype.execute = function(){
	this.prepare_parms();
	try{
		return RecordsAffectedCmd(this.cmdobj);
	}catch(ex){
		if(VBS && VBS.ctrl.error.number != 0){
			ExceptionManager.put(VBS.ctrl.error.number,"COMMAND.execute()",VBS.ctrl.error.description);
			VBS.ctrl.error.clear();
		}else{
			ExceptionManager.put(new Exception(ex.number,"COMMAND.execute()",ex.message));
		}
		return -1;
	}
};
COMMAND.prototype.query = function(){
	this.prepare_parms();
	try{
		return this.cmdobj.execute();
	}catch(ex){
		if(VBS && VBS.ctrl.error.number != 0){
			ExceptionManager.put(VBS.ctrl.error.number,"COMMAND.query()",VBS.ctrl.error.description);
			VBS.ctrl.error.clear();
		}else{
			ExceptionManager.put(new Exception(ex.number,"COMMAND.query()",ex.message));
		}
		return null;
	}
};
COMMAND.prototype.query_table = function(){
	var ds = this.query();
	if(!ds) return null;
	return DataTable(ds, -1);
};
module.exports = COMMAND;