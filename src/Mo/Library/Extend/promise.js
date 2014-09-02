if(exports.promise) return exports.promise;
function $promise()
{
	this.status="pending";
	this._resolve = null;
	this._reject = null;
	this.next = null;
	this._returnValue = null;
}
$promise.doResolve = function(){
	if(typeof this._resolve == 'function'){
		var ret = this._resolve.call(this,this._returnValue);
		if(ret!==undefined)
		{
			if(typeof ret == 'object' && ret.constructor==$promise) 
			{
				ret._resolve = this.next._resolve;
				ret._reject = this.next._reject;
				this.next = ret;
			}
			else this.next.resolve(ret);
		}
	}
};
$promise.doReject = function(){
	if(typeof this._reject == 'function'){
		var ret = this._reject.call(this,this._returnValue);
		if(ret!==undefined)
		{
			if(typeof ret == 'object' && ret.constructor==$promise)
			{
				ret._resolve = this.next._resolve;
				ret._reject = this.next._reject;
				this.next = ret;
			}
			else this.next.reject(ret);
		}
	}	
};
$promise.prototype.resolve = function(data)
{
	if(this.status=="pending")
	{
		this.next = this.next || new $promise();
		this._returnValue = data;
		this.status = "resolved";
		$promise.doResolve.call(this);
	}
};
$promise.prototype.reject = function(data)
{
	if(this.status=="pending")
	{
		this.next = this.next || new $promise();
		this._returnValue = data;
		this.status = "rejected";
		$promise.doReject.call(this);
	}
};
$promise.prototype.then = function(resolve, reject)
{
	this.next = this.next || new $promise();
	this._resolve = resolve;
	this._reject = reject;
	if(this.status=="resolved")
	{
		$promise.doResolve.call(this);
	}
	else if(this.status=="rejected")
	{
		$promise.doReject.call(this);
	}
	return this.next;
};
$promise.all = function(promises){
	if(promises && promises.constructor==$promise){
		promises = Array.prototype.slice.call(arguments,0);
	}
	if(!promises)return new $promise();
	var p = new $promise();
	p._total = promises.length;
	p._num = 0;
	p._returnValue=[];
	for(var i=0;i<promises.length;i++)
	{
		promises[i].then(function(data){
			p._num++;
			p._returnValue.push(data);
			if(p._num>=p._total)
			{
				p.resolve.call(p,p._returnValue);
			}
		});
	}
	return p;
};
$promise.any = function(promises){
	if(promises && promises.constructor==$promise){
		promises = Array.prototype.slice.call(arguments,0);
	}
	if(!promises)return new $promise();
	var p = new $promise();
	for(var i=0;i<promises.length;i++)
	{
		promises[i].then(function(data){
			p.resolve.call(p,data);
		});
	}
	return p;
};

return exports.promise = $promise;