/*
** File: net/mail.js
** Usage: a package for jmail.
** About: 
**		support@mae.im
*/
function $jmail(){
	if(this.constructor !==$jmail) return new $jmail();
	this.Exception="";
	this.jmail=null;
	this.charset="GB2312";
	this.contenttype="text/html";
	
	this.enabled=function(classid){
		classid = classid || "JMAIL.Message";
		this.jmail = F.activex(classid);
		if(this.jmail==null) return false;
		return true;
	};
	this.setting={
		"MailAddress":"",
		"LoginName":"",
		"LoginPass":"",
		"Sender":"",
		"Fromer":"",
		"Email":"",
		"DisplayName":""
		};
	this.login = function(server,username,password){
		this.setting["MailAddress"]=server||"";
		this.setting["LoginName"]=username||"";
		this.setting["LoginPass"]=password||"";
		this.jmail.MailServerUserName = this.setting["LoginName"];
		this.jmail.MailServerPassword = this.setting["LoginPass"];
	};

	this.from=function(email,display){
		this.setting["Sender"]=display||"";
		this.setting["Fromer"]=email||"";
		this.jmail.From = this.setting["Fromer"];
		this.jmail.FromName = this.setting["Sender"] ;
	};

	this.to=function(email,display){
		this.setting["Email"]=email||"";
		this.setting["DisplayName"]=display||this.setting["Email"];
		this.jmail.AddRecipient(this.setting["Email"],this.setting["DisplayName"]);
	};

	this.setMessage = function(Subject,Content){
		this.jmail.Subject = Subject;
		this.jmail.Body = Content; 
	};
	
	this.addEmailAddress = function(email,display){
		email = email ||"";
		if(email=="")return;
		display = display || email;
		this.jmail.AddRecipient(email,display);
	};

	this.send = function(Subject,Content) {
		if(this.jmail==null)return false;
		try{
			this.jmail.silent = true;
			this.jmail.Logging = true
			this.jmail.Charset =this.charset;
			this.jmail.ContentType = this.contenttype;
			if(Subject!=undefined)this.jmail.Subject = Subject;
			if(Content!=undefined)this.jmail.Body = Content;
			this.jmail.Priority = 3;
			var result=null;
			if(!this.jmail.Send(this.setting["MailAddress"])){
				result = false
				this.Exception = this.jmail.Log;
			}else{
				result = true
			}
			this.jmail.Close();
			this.jmail=null;
			return result;
		}catch(ex){this.Exception = ex.description;return false}
	}
}
module.exports = $jmail;