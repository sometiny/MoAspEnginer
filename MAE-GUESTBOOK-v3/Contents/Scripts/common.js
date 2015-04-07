//
function ShowTips(t,html,timeout,fn){
	if(!document.getElementById("TipsDialog")){
		var TipsDialog = document.createElement("div");
		TipsDialog.id="TipsDialog";
		document.body.appendChild(TipsDialog);
	}
	if(typeof timeout=="function"){
		fn = timeout;
		timeout=0;
	}else{
		timeout = timeout ||0;
	}
	if(typeof fn!="function")fn=function(){};
	F("#TipsDialog").attr("title",t).html("<div style=\"text-align:center;padding:20px 0;\">"+html+"</div>").dialog({
		"width":250,"height":200,"mask":false,buttons:{
			"确定":fn
		}
	});	
	if(timeout>0)window.setTimeout(function(){F("#TipsDialog").dialog("close");}, timeout);
}

function ShowTipsTop(html,timeout,fn){
	if(!document.getElementById("TipsDialogTop")){
		var TipsDialog = document.createElement("div");
		TipsDialog.id="TipsDialogTop";
		TipsDialog.className="TipsDialogTop TipsDialogTop-" + this;
		document.body.appendChild(TipsDialog);
	}
	if(typeof timeout=="function"){
		fn = timeout;
		timeout=2000;
	}else{
		timeout = timeout ||2000;
	}
	if(typeof fn!="function")fn=function(){};
	F("#TipsDialogTop").html(html.replace(/</igm,"&lt;").replace(/>/igm,"&gt;")).css({"display":"block"});
	if(timeout>0)window.setTimeout((function(fn){return function(){F("#TipsDialogTop").css({"display":"none"});fn();}})(fn), timeout);
}
function CloseTips(timeout){
	timeout = timeout ||0;
	if(timeout<=0)F("#TipsDialog").dialog("close");
	else window.setTimeout(function(){F("#TipsDialog").dialog("close");}, timeout);
}
function SendMessage(frm){
	Ajax({
		form:frm,
		succeed:function(msg){
			ShowTips("提示",msg,1000);
			window.location.reload();
		}
	});
}
function MoveUp(sel){
	for(var i=0;i<sel.length;i++){
		if(sel.options[i].selected){
			if(i==0)continue;
			sel.insertBefore(sel.removeChild(sel.options[i]),sel.options[i-1]);
		}
	}
}
function MoveDown(sel){
	for(var i=sel.length-1;i>=0;i--){
		if(sel.options[i].selected){
			if(i==sel.length-1)continue;
			sel.insertBefore(sel.removeChild(sel.options[i+1]),sel.options[i]);
		}
	}
}