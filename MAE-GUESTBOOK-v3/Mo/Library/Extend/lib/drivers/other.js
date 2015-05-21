/*
** File: other.js
** Usage: database driver for other
** About: 
**		support@mae.im
*/
var Driver = {};
Driver.GetConnectionString = function(){
	return F.format(this["DB_Connectionstring"],this["DB_Server"],this["DB_Username"],this["DB_Password"],this["DB_Name"],F.mappath(this["DB_Path"]));
};
Driver.initialize = function(Helper, Conn){
	
};
module.exports = Driver;