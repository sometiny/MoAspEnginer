<script language="jscript" runat="server">
if(typeof Mo=="undefined"){Response.Write("invalid call.");Response.End();}
function _echo(src){if(src===undefined || src===null) src="";_contents += src;if(!__buffer && _contents.length>__buffersize) {Response.Write(_contents);_contents="";}}
function _end(){if(!__buffer)Response.Write(_contents);}
var _contents = "";
"UNSAFECONTENTS";
var D__Reply = $["Reply"];
D__Reply.reset();
var index_Reply=D__Reply.pagesize *(D__Reply.currentpage-1);
D__Reply.each(function(Reply, index){
var key=index_Reply+index;
_contents += "<div class=\"content-box-reply\">\r\n\t<span class=\"reply-time\">&nbsp; Post By '";
_echo(Reply.PostFrom);
_contents += "' On '";
_echo(F.untimespan(Reply.PostDate));
_contents += "'：</span>\r\n\t<span class=\"reply-content\">";
_echo(Reply.Description);
_contents += "</span>\r\n</div>\r\n";
});
_end();delete _end;delete _echo;if(__buffer) return _contents;
</script>