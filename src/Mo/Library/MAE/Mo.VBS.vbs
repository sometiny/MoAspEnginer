Dim VBS_CACHE:Set VBS_CACHE = Server.CreateObject("Scripting.Dictionary")
Function VBS_eval (script)
	VBS_eval = Eval(script)
End Function
	
function RecordsAffected(byref conn,byval sqlstring)
   	conn.execute sqlstring,RecordsAffected
end function

function RecordsAffectedCmd_(byref opt)
	dim RecordsAffectedvar
	if opt.withQuery then
		set opt.dataset = opt.cmdobj.execute(RecordsAffectedvar)
		opt.affectedRows = RecordsAffectedvar
	else
		opt.cmdobj.execute RecordsAffectedvar
		opt.affectedRows = RecordsAffectedvar
	end if
end function
	
Function VBS_getref (func)
	Set VBS_getref = GetRef(func)
End Function
	
Function VBS_require (name)
    Set VBS_require = Eval("new " & name)
End Function
	
function VBS_include (lib)
    Dim pathinfo : pathinfo=""
    if InStr(lib,":") = 2 Then
   		pathinfo = F.mappath(lib)
	Else
    	pathinfo = Mo.Config.Global.MO_APP & "Library/Extend/" & lib & ".vbs"
	    If Not IO.file.exists(pathinfo) Then pathinfo = Mo.Config.Global.MO_CORE & "Library/Extend/" & lib & ".vbs"
	End if
	if pathinfo="" Or Not IO.file.exists(pathinfo) then
		ExceptionManager.put &H00002CD, "VBS.include(lib)","library '" + lib + "'is not exists."
	    VBS_include = false
	    Exit Function
	End If
	If VBS_CACHE(lib)="yes" Then
		VBS_include = True
		Exit Function
	End if
    Dim ret : ret = IO.file.readAllText(F.mappath(pathinfo))
	On Error Resume Next
	Err.clear()
	ExecuteGlobal ret
	if Err.number <> 0 then
		ExceptionManager.put Err.number,"VBS.include(lib)", Err.description
		Err.clear()
		VBS_include = false
	Else
		VBS_CACHE(lib) = "yes"
		VBS_include = true
	End if
End function