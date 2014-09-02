if(exports.session) return exports.session;
return exports.session = (function(driver){
	var $session=function(key,value)
	{
		if(value===undefined)
		{
			return driver.readSession($session.id+":" + key);
		}
		driver.writeSession($session.id+":" + key, value);
	};
	$session.setTimeout = function(timeout)
	{
		driver.writeSession($session.id + ".timeout",timeout);
		$session.timeout = timeout;
	};
	$session.timeout = 1200;
	$session.id = F.get("sessionid");
	if($session.id == "")
	{
		$session.id = F.random.word(20);
	}
	else
	{
		var timeout = driver.readSession($session.id + ".timeout");
		if(typeof timeout=="number") $session.timeout = timeout;
	}
	var time_start = driver.getStartTimeSpan($session.id);
	if(typeof time_start == "number")
	{
		if(F.timespan() - time_start >$session.timeout){
			driver.clearSession($session.id);
			$session.id = F.random.word(20);
		}
		driver.writeSession($session.id, F.timespan());
	}
	else
	{
		$session.id = F.random.word(20);
		driver.writeSession($session.id, F.timespan());
	}
	return $session;
})((function(){
	/*session driver, you can use your own driver, such as IO, Database and so on...*/
	var driver = {};
	driver.writeSession = function(key,value)
	{
		Application.Lock();
		Application(key) = value;
		Application.UnLock();
	};

	driver.readSession = function(key)
	{
		return Application(key);
	};

	driver.clearSession = function(sessionid)
	{
		var lists=[];
		F.each(Application.Contents, function(q) {
			var l = q.substr(0,sessionid.length+1);
			if(q.length > sessionid.length+1 && (l == (sessionid + ":") || l == (sessionid + ".")))
			{
				lists.push(q);
			}
		});
		while(lists.length>0)
		{
			Application.Contents.Remove(lists.pop());
		}
		Application.Contents.Remove(sessionid);
	};
	
	driver.getStartTimeSpan = function(sessionid)
	{
		return Application(sessionid);
	};
	return driver;	
})());
