if(exports.session) return exports.session;
return exports.session = (function(){
	var writeApplication = function(key,value)
	{
		Application.Lock();
		Application(key) = value;
		Application.UnLock();
	};
	var $session=function(key,value)
	{
		if(value===undefined)
		{
			return Application($session.id+":" + key);
		}
		writeApplication($session.id+":" + key, value);
	};
	$session.timeout = 20;
	$session.id = F.get("sessionid");
	if($session.id == "")
	{
		$session.id = F.random.word(20);
	}
	if(typeof Application($session.id) == "number")
	{
		if(F.timespan() - Application($session.id) >$session.timeout){
			var lists=[];
			F.each(Application.Contents, function(q) {
				if(q.length > $session.id.length+1 && q.substr(0,$session.id.length+1) == ($session.id + ":"))
				{
					lists.push(q);
				}
			});
			while(lists.length>0)
			{
				Application.Contents.Remove(lists.pop());
			}
			Application.Contents.Remove($session.id);
			$session.id = F.random.word(20);
		}
		writeApplication($session.id, F.timespan());
	}
	else
	{
		$session.id = F.random.word(20);
		writeApplication($session.id, F.timespan());
	}
	return $session;
})();
