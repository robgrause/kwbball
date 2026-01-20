const path = require('path');
const fs = require('fs');
//const zlib = require('node:zlib'); 
const defines = require ('./gptDefines');

/*********************************************************************************
	Helper Functions


**********************************************************************************/
// Set this flag to 1. console msgs are written to logfile.txt file
var gpthp =
	{
	debugFlag : developmentMode,
	debugToConsole : 1,					 // 1 - console , 0 - logfile
	logfileName : 'logfile.txt',

	writeLineToFile:function (strLine,filepath)
		{
		var file = fs.createWriteStream (filepath, {flags : 'a'});
		file.write(strLine + '\n');
		},	
		
	writeLog:function (strLine)
		{
		// build logfile name in nwst root dir
		var logFileName = path.join(__dirname, '/./' + gpthp.logfileName);
		var logfile = fs.createWriteStream (logFileName, {flags : 'a'});
		logfile.write(strLine + '\n');
		},

	writeDebug:function (strLine)
		{
		var stamp = new Date(Date.now());
		var sLine = stamp.toLocaleString() + ' ' + strLine;

		if (gpthp.debugFlag == 1)
			{
			if (gpthp.debugToConsole)
				console.log (sLine);
			else
				gpthp.writeLog (sLine);
			}
		},

	sendMsg:function (req, res, err, result)
		{
		var data = req.body;
		
		var apicmd = '';
		if (data.apicmd)
			apicmd = data.apicmd;

		var sendresults = '';
		if (err)
			{
			var msg = JSON.stringify(err);
			gpthp.writeDebug('DEBUG:MSG ----> ' + msg);		
			sendresults = {"apicmd":apicmd,"error": true, "msg": msg};
			}
		else
			{
			sendresults = {"apicmd":apicmd,"results":result};
/*
			if (req.header('Accept-Encoding').includes('gzip')) 
				{
				//res.setHeader('Content-Encoding', 'gzip');
				//res.send(zlib.gzipSync(result));
				res.json(sendresults);
				}
*/
			}

		res.set('Cache-Control', 'public, max-age=31557600');
		res.json(sendresults)
		},
	
	printMemoryUsage:function(str)
		{
		if (str) 
			gpthp.writeDebug (str);
			
		const used = process.memoryUsage();
		for (let key in used) {gpthp.writeDebug (`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);}
		},
	
	getWeekNumOfYear:function(date)
		{
        var onejan = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
		},
	parse:function(string,errorObj)
		{
		try 
			{
			return(JSON.parse(string));
			} 
		catch (e) 
			{
			console.log('gpthp.parse: PARSE ERROR ------> ' + e.message);
			return(errorObj);
			}
		},
	// builds form object used to fillout PDF form
	addFieldToFormObject:function (form,fieldname,fieldvalue,fieldtype)
		{
		var formfield = {
						'name' : fieldname,
						'value' : fieldvalue,
						'type' : fieldtype
					};
					
		form.push(formfield);
		},

	buildRandomFilename:function(fileExt)
		{
		var testDate = new Date(Date.now());
		
		var filename = testDate.getTime().toString();
		
		if  ( (fileExt != undefined) && (fileExt.length > 0) ) 
		filename = filename + '.' + fileExt;
		
		//filename = filename.replace(/[/\\?%*#:|"+<>]/g, '-');

		return (filename);
		},
	buildUploadPath:function(directory,filename)
		{
		var fullfilepath = path.join(__dirname, '..', directory, filename);
		return(fullfilepath);
		},
	buildImageFullFilePath:function(filename)
		{
		var fullfilepath = path.join(__dirname, '../', defines.IMAGE_DIRECTORY, filename);
		return(fullfilepath);
		},
	buildIncludesDirFullFilePath:function(filename)
		{
		var fullfilepath = path.join(__dirname, '../', defines.INCLUDES_DIRECTORY, filename);
		return(fullfilepath);
		},
	buildPublicHtmlDirFullFilePath:function(filename)
		{
		var fullfilepath = path.join(__dirname, '../', 'public/html', filename);
		return(fullfilepath);
		},
	buildPublicStylesDirFullFilePath:function(filename)
		{
		var fullfilepath = path.join(__dirname, '../', 'public/stylesheets', filename);
		return(fullfilepath);
		},
	buildViewsDirFullFilePath:function(filename)
		{
		var fullfilepath = path.join(__dirname, '../', 'views', filename);
		return(fullfilepath);
		},
	buildProtectedUserFilePath:function()
		{
		var fullfilepath = path.join(__dirname, '../', defines.PROTECTED_USERS_FILE);
		return(fullfilepath);
		},
		
	isProtected:function(fname,lname)
		{
		var filepath = gpthp.buildProtectedUserFilePath()
		var pusers = require (filepath);
		var user = undefined;
		for (var i = 0; i < pusers.users.length; i++)
			{
			if (	(fname == pusers.users[i].f_fname) &&
					(lname == pusers.users[i].f_lname)	)
				{
				user = pusers.users[i];
				break;
				}
			}
		pusers = null;
		return(user);
		},
		
	isProtectedFromDelete:function(fname,lname)	{return (gpthp.isProtected(fname,lname));	},
	isProtectedFromModify:function(fname,lname)	{return (gpthp.isProtected(fname,lname));	},
	
	deleteTmpDirectory:function(days)
		{
		var directory = path.join(__dirname, '..', defines.TMPUPLOAD_DIRECTORY);
						
		gpthp.deleteFilesOlderThanNdays(days, directory) 		
		},
					
	deleteFilesOlderThanNdays:function(days, directory) 
		{
		console.log('Processing Directory Clean: ' + directory)
		console.log('Removing files older than: ' + days + ' days'); 
		
		filenames = fs.readdirSync(directory);
  
		var currTime = new Date().getTime();
		var cutoffTime = currTime - (days * (24 * 60 * 60 * 1000));
		
		var delCnt = 0;
		var totalCnt = filenames.length;
		
		filenames.forEach((file) => 
			{
			var fullfilepath = path.join(directory,file);

			var filest = fs.statSync(fullfilepath);
			var fileTime = new Date(filest.birthtime).getTime()
			
			if (fileTime <= cutoffTime)
				{
				delCnt++;
				
				console.log('DELETING: ' + file);
				console.log(delCnt + ' / ' + totalCnt);
			
				if (fs.existsSync(fullfilepath) == true)
					fs.unlinkSync(fullfilepath)
				}
			});
		},
		
	fileDelete:function(filename,filedirectory)
		{
		if (filename.length <= 0)
			return;

		var filepath = gpthp.buildUploadPath(filedirectory,filename);
		if (fs.existsSync(filepath) == true)
			fs.unlinkSync(filepath);
									
		console.log('Deleting file : ' + filepath);
		},
	fileCopy:function(originalFilePath,destFilePath)
		{
		if (fs.existsSync(originalFilePath) == true)
			{
			fs.copyFile(originalFilePath,destFilePath, (err) => 
				{
				if (err) 
					console.log("FILE COPY ERROR:", err);
					
				});
			}
		},
};


if (typeof (module) !== 'undefined' && module.exports) 
	{
    module.exports = gpthp;
    };
