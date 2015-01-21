<script language="jscript" runat="server">
/*
** File: Function.asp
** Usage: common functions for global. 
**		if you add some functions, you should add the names to exports.
**		or you can not use then in your business.
** About: 
**		support@mae.im
*/
IsEmpty = is_empty = function(variable){
	return variable===""||variable===null||variable===undefined;
}

CreatePageList = function(URL, RecordCount, PageSize, CurrentPage){
	var PageCount ,PageStr="";
	if(URL==""){
		F.object.toURIString.clearFilter();
		F.object.toURIString.filter.push("!page");
		URL=("?" + F.get.toURIString() + "&page={#page}").replace("?&","?");
		F.object.toURIString.clearFilter();
	}
	CurrentPage = parseInt(CurrentPage);
	RecordCount = parseInt(RecordCount);
	PageSize = parseInt(PageSize);
	var rp=RecordCount % PageSize;
	PageCount = (RecordCount-rp) / PageSize + (rp==0?0:1);
	PageStr = "共[" + RecordCount + "]条记录 [" + PageSize + "]条/页 当前[" + CurrentPage + "/" + PageCount + "]页&nbsp; ";
	if(CurrentPage == 1 || PageCount == 0){
		PageStr += "首页&nbsp;"
		PageStr += "上页&nbsp;"
	}else{
		PageStr += "<a href=\"" + URL.replace("{#page}", 1) + "\">首页</a>&nbsp;";
		PageStr += "<a href=\"" + URL.replace("{#page}", CurrentPage-1) + "\">上页</a>&nbsp;";
	}
	if(CurrentPage == PageCount || PageCount == 0){
		PageStr += "下页&nbsp;"
		PageStr += "尾页&nbsp;"
	}else{
		PageStr += "<a href=\"" + URL.replace("{#page}", CurrentPage + 1) + "\">下页</a>&nbsp;";
		PageStr += "<a href=\"" + URL.replace("{#page}", PageCount) + "\">尾页</a>&nbsp;";
	}
	return PageStr;
}
</script>