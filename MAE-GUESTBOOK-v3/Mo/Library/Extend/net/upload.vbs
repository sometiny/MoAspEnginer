class upload
	private StreamT,mvarClsName, mvarClsDescription,mvarSavePath, mvarCharset, mvarMaxSize, mvarSingleSize, mvarVersion, mvarTotalSize, mvarExtension,mvarBoundary,mvarStreamOpened, mvarDescription
	
	public property let AllowMaxSize(byval value)
		mvarMaxSize = value
	end property
	
	public property let AllowMaxFileSize(byval value)
		mvarSingleSize = value
	end property
	
	public property let AllowFileTypes(byval value)
		mvarExtension = LCase(value)
		if mvarExtension<>"*" and mvarExtension<>"" then
			if right(mvarExtension,1)<>";" then mvarExtension = mvarExtension & ";"
		end if
	end property
	public property let Charset(byval value)
		mvarCharset = value
	end property
	
	public property let SavePath(byval value)
		mvarSavePath = value
	end property
	
	public property get Description()
		Description = mvarDescription
	end property
	
	public property get Version()
		Version = mvarVersion
	end property
	
	public property get TotalSize()
		TotalSize = mvarTotalSize
	end property
	
	private sub class_Initialize()
		set StreamT = F.activex("Adodb.stream")
		mvarVersion = "MoUpload V1.1"
		mvarMaxSize = -1
		mvarSingleSize = -1
		mvarExtension = ""
		mvarTotalSize = 0
		mvarCharset = "gb2312"
		mvarStreamOpened=false
	end sub
	
	private sub class_Terminate()
		if mvarStreamOpened then StreamT.close()
		set StreamT = nothing
	end sub
	
	private function ParseSizeLimit(byval SizeLimit)
		dim unit,value,multiplier,limit
		if not isnumeric(SizeLimit) then
			multiplier = 1
			SizeLimit = Lcase(F.string.replace(SizeLimit,"/\s/ig",""))
			value = F.string.replace(SizeLimit,"/[^\d]+/ig","")
			if isnumeric(value) then
				value = clng(value)
				if right(SizeLimit,2)="gb" then multiplier = 1073741824
				if right(SizeLimit,2)="mb" then multiplier = 1048576
				if right(SizeLimit,2)="kb" then multiplier = 1024
				limit = value * multiplier
			else
				limit=-1
			end if
		else
			limit = SizeLimit
		end if	
		if limit<-1 then limit=-1
		ParseSizeLimit = limit
	end function
		
	public function getData()
		getData =false
		mvarMaxSize = ParseSizeLimit(mvarMaxSize)
		mvarSingleSize = ParseSizeLimit(mvarSingleSize)
		dim value, str, bcrlf, fpos, sSplit, slen, istart
		dim TotalBytes,tempdata,BytesRead,ChunkReadSize,PartSize,DataPart,formend, formhead, startpos, endpos, formname, FileName, fileExtension, valueend, NewName,localname,type_1,contentType
		TotalBytes = Request.TotalBytes
		if CheckEntryType = false then mvarDescription = "ERROR_INVALID_ENCTYPEOR_METHOD" : exit function
		if mvarMaxSize > 0 and TotalBytes > mvarMaxSize then mvarDescription = "ERROR_FILE_EXCEEDS_MAXSIZE_LIMIT" : exit function
		mvarTotalSize = 0 
		StreamT.Type = 1
		StreamT.Mode = 3
		StreamT.Open
		mvarStreamOpened = true
		BytesRead = 0
		ChunkReadSize = 1024 * 16
		do while BytesRead < TotalBytes
			PartSize = ChunkReadSize
			if PartSize + BytesRead > TotalBytes then PartSize = TotalBytes - BytesRead
			DataPart = Request.BinaryRead(PartSize)
			StreamT.Write DataPart
			BytesRead = BytesRead + PartSize
		loop
		StreamT.Position = 0
		tempdata = StreamT.Read
		bcrlf = ChrB(13) & ChrB(10)
		fpos = InStrB(1, tempdata, bcrlf)
        sSplit = MidB(tempdata, 1, fpos - 1)
		slen = LenB(sSplit)
		istart = slen + 2
        do
            formend = InStrB(istart, tempdata, bcrlf & bcrlf)
            if formend<=0 then exit do
            formhead = MidB(tempdata, istart, formend - istart)
            str = Bytes2Str(formhead)
            startpos = InStr(str, "name=""") + 6
            if startpos<=0 then exit do
            endpos = InStr(startpos, str, """")
            if endpos<=0 then exit do
            formname = LCase(Mid(str, startpos, endpos - startpos))
            valueend = InStrB(formend + 3, tempdata, sSplit)
            if valueend<=0 then exit do
			if InStr(str, "filename=""") > 0 then
				startpos = InStr(str, "filename=""") + 10
				endpos = InStr(startpos, str, """")
				type_1=instr(endpos,lcase(str),"content-type")
				contentType=lcase(trim(mid(str,type_1+13)))
				FileName = Mid(str, startpos, endpos - startpos)
				if Trim(FileName) <> "" then
					FileName = Replace(FileName, "/", "\")
					FileName = Replace(FileName, chr(0), "")
					LocalName = FileName
					FileName = Mid(FileName, InStrRev(FileName, "\") + 1)
					if instr(FileName,".")>0 then
						fileExtension = Mid(FileName,InStrRev(FileName,".")+1)
					else
						fileExtension = ""
					end if
					if CheckExtension(LCase(fileExtension)) = True then
						mvarDescription = "ERROR_INVALID_FILETYPE(." & ucase(fileExtension) & ")"
						tempdata = empty
						exit function
					end if
					mvarTotalSize = mvarTotalSize + valueend - formend - 6
					if mvarSingleSize > 0 and (valueend - formend - 6) > mvarSingleSize then
						mvarDescription = "ERROR_FILE_EXCEEDS_SIZE_LIMIT"
						tempdata = empty
						exit function
					end if
					if mvarMaxSize > 0 and mvarTotalSize > mvarMaxSize then
						mvarDescription = "ERROR_FILE_EXCEEDS_MAXSIZE_LIMIT"
						tempdata = empty
						exit function
					end if
					fileExtension = lcase(fileExtension)
					fileExtension = replace(fileExtension,";","")
					dim fileItem:set fileItem = UploadManager.addFile(formname) 
					fileItem.ContentType = contentType
					fileItem.Size = valueend - formend - 6
					fileItem.Position = formend + 3
					fileItem.NewName = F.formatdate(now(),"yyyyMMddHHmmss") & F.random.number(4) & "." & fileExtension
					fileItem.FileName = FileName
					fileItem.LocalName = FileName
					fileItem.IsFile = true
					fileItem.Extend = fileExtension
					UploadManager.addForm formname, LocalName
				end if
			else
				value = MidB(tempdata, formend + 4, valueend - formend - 6)
				UploadManager.addForm formname, Bytes2Str(value)
			end if
            istart = valueend + 2 + slen
        loop until (istart + 2) >= LenB(tempdata)
		tempdata = empty
		getData =true
	end function
	
	private function CheckExtension(byval ex)
		dim notIn: notIn = True
		if mvarExtension="*" then
			notIn=false
		elseif instr(mvarExtension,"*." + ex + ";")>0 then
			notIn=false 
		end if
		CheckExtension = notIn
	end function
	
	private function Bytes2Str(byval byt)
		if LenB(byt) = 0 then
			Bytes2Str = ""
			exit function
		end if
		dim mystream, bstr
		set mystream =F.activex("AdoDB.Stream")
		mystream.Type = 2
		mystream.Mode = 3
		mystream.Open
		mystream.WriteText byt
		mystream.Position = 0
		mystream.Charset = mvarCharset
		mystream.Position = 2
		bstr = mystream.ReadText()
		mystream.Close
		set mystream = nothing
		Bytes2Str = bstr
	end function
	
	private function CheckEntryType()
		dim ContentType, ctArray
		ContentType = LCase(Request.ServerVariables("HTTP_CONTENT_TYPE"))
		if ContentType="" then ContentType = LCase(Request.ServerVariables("CONTENT_TYPE"))
		ctArray = Split(ContentType, ";")
		if ubound(ctarray)>=0 then
			if Trim(ctArray(0)) = "multipart/form-data" then
				CheckEntryType = True
				mvarBoundary = Split(ContentType,"boundary=")(1)
			else
				CheckEntryType = False
			end if
		else
			CheckEntryType = False
		end if
	end function
	
	public function Save(Byref File,byval tOption, byval OverWrite)
		if not File.IsFile then
			File.Succeed = false
			File.Exception="ERROR_FILE_NO_FOUND"
			set Save = File
			exit function
		end if
		dim Path : Path = F.mappath(mvarSavePath)
		Path = Replace(Path, "/", "\")
		if Mid(Path, Len(Path) - 1) <> "\" then Path = Path + "\"
		CreateFolder Path
		File.Path= Replace(Replace(Path,F.mappath("/"),""),"\","/")
		if tOption = 1 then
			Path = Path & File.LocalName: File.FileName =File.LocalName
		else
			if tOption = -1 and File.UsersetName <> "" then
				Path = Path & File.UsersetName & "." & File.Extend: File.FileName = File.UsersetName & "." & File.Extend
			else
				Path = Path & File.NewName: File.FileName = File.NewName
			end if
		end if
		if not OverWrite then Path = getFilePath(File)
		dim tmpStrm
		set tmpStrm =F.activex("AdoDB.Stream")
		tmpStrm.Mode = 3
		tmpStrm.Type = 1
		tmpStrm.Open
		StreamT.Position = File.Position
		StreamT.copyto tmpStrm,File.Size
		tmpStrm.SaveToFile Path, 2
		tmpStrm.Close
		set tmpStrm = nothing
		File.Succeed = true
		File.Exception=""
		set Save = File
	end function
	
	public function GetBinary(File)
		StreamT.Position = File.Position
		GetBinary = StreamT.read(File.Size)
	end function 
		
	private function CreateFolder(byval folderPath )
		dim oFSO
		set oFSO = F.activex("Scripting.FileSystemObject")
		dim sParent 
		sParent = oFSO.getParentFolderName(folderPath)
		if sParent = "" then exit function
		if not oFSO.FolderExists(sParent) then CreateFolder (sParent)
		if not oFSO.FolderExists(folderPath) then oFSO.CreateFolder (folderPath)
		set oFSO = nothing
	end function
	
	private function getFilePath(Byref File) 
		dim oFSO, Fname , FNameL , i 
		i = 0
		set oFSO = F.activex("Scripting.FileSystemObject")
		Fname = F.mappath(File.Path & File.FileName)
		FNameL = Mid(File.FileName, 1, InStr(File.FileName, ".") - 1)
		do while oFSO.FileExists(Fname)
			Fname = F.mappath(File.Path & FNameL & "(" & i & ")." & File.Extend)
			File.FileName = FNameL & "(" & i & ")." & File.Extend
			i = i + 1
		loop
		set oFSO = nothing
		getFilePath = Fname
	end function
end class