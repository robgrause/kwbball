const gptdb = require ('./gptDbOperations');
//const dbutils = require ('./gptDbUtils'); /* DYNAMICALLY LOADED WHEN REQUIRED */
const path = require('path');
const fs = require('fs');

const version = require ('../includes/gptVersion');
const defines = require ('../includes/gptDefines');
const gpthp = require ('../includes/gptHelper');
const gptdt = require ('../includes/gptDateTime');
const gptut = require ('../includes/gptUtils');

const webpush = require ('web-push');
const formidable = require('formidable');

function writeDebug (strLine) {gpthp.writeDebug(strLine); };
function sendMsg (req, res, err, result) {gpthp.sendMsg (req, res, err, result); };

/*********************************************************************************
	Routes 


**********************************************************************************/
exports.gpt_version_check = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	
	if ( (creds) && (creds.f_loginUser) )
		writeDebug ('DEBUG:Checking version: ' + 
									creds.f_loginUser.f_fname + ' ' + creds.f_loginUser.f_lname);
	obj.f_version = version.version;
	sendMsg (req, res, '', obj);
};

exports.getAppPage = function (req, res) {

	writeDebug ('DEBUG:KWBBALL: getAppPage');

	if (! req.headers.host.includes(version.client_subdomain()))
		{
		console.log('REQUEST HOST: ' + req.headers.host)
		console.log('SERVICE HOST: ' + version.client_subdomain())
		var err = new Error('Bad host');
		err.status = 502;
    
		gpthp.sendMsg(req, res, 'ERROR 502', null)
		
		return;
		}
		
	var credentials = {'f_organization_name':defines.ORGANIZATION_NAME, 'f_database_name':defines.DATABASE_NAME};

	var filepath = gpthp.buildPublicHtmlDirFullFilePath('KWBBall.html')	
	var page = 'KWBBall';
		
	res.set('Cache-Control', 'public, max-age=31557600'); // one year

	if (fs.existsSync(filepath) == true)
		res.sendFile(filepath);
	else
		res.render(page,{credentials : JSON.stringify(credentials)});
};

exports.gpt_serviceworker_version = function(req,res) {

	var fullfilepath = path.join(__dirname, '..', 'includes', 'gptVersion.js');
	writeDebug ('DEBUG:' + fullfilepath);
	res.setHeader('Content-Type', 'application/javascript');
	res.setHeader('Service-Worker-Allowed', '/');
	res.sendFile(fullfilepath);
};
exports.gpt_serviceworker_kwbball = function(req,res) {
	
	var fullfilepath = path.join(__dirname, '..', 'data/pwa', 'swKWBBall.min.js');
	writeDebug ('DEBUG:' + fullfilepath);
	res.setHeader('Content-Type', 'application/javascript');
	res.setHeader('Service-Worker-Allowed', '/');
	res.sendFile(fullfilepath);
};

exports.renderHTMLFile = function (filename)
	{
	var pug = require('pug');
	
	var sourseFilePath= gpthp.buildViewsDirFullFilePath(filename + '.pug');
	writeDebug ('KWBBall Rendering : ' + filename);
	
	pug.renderFile(sourseFilePath,function(err,html)
		{
		if(err)
			return(writeDebug (err));
			
		var outputFilePath = gpthp.buildPublicHtmlDirFullFilePath(filename + '.html')
		fs.writeFile(outputFilePath, html, function(err) 
			{
			if(err) 
				return (writeDebug (err));
			});

		var name = require.resolve('pug');
		delete require.cache[name];
		pug = null;
		
		writeDebug ('KWBBall Rendering Complete: ' + filename);
		});
	};

exports.processDatabaseFunctions = async function () 
	{
return;
	var dbutils = require('./gptDbUtils.js');	

	var creds = new defines.objCredentials();
	creds.f_database_name = 'kwbballdb';

//await dbutils.createTables(creds.f_database_name);

	// create database / tables
	dbutils.createDatabase(creds.f_database_name,null)

	//await dbutils.dropDBTable(creds,defines.tblUsers,null);
	//await dbutils.createDBUsersTable(creds);

	// drop & add table	
	//dbutils.dropDBTable(creds,defines.tblCompany, dbutils.createDBCompanyTable);
	
	//modify table - ADD COLUMN
	//dbutils.addDBColumnToTable(creds,defines.tblUsers,'f_ptrivf_priv_createjob','VARCHAR(' + parseInt(defines.STR_LENGTH_NAME + 1) + ')','f_date_record');
	//dbutils.addDBColumnToTable(creds,defines.tblUsers,'priv_createjob','TINYINT','f_usertype');

	// modify table - RENAME COLUMN				
	//dbutils.renameDBColumnInTable(creds,defines.tblUsers,'priv_createjob','f_priv_createjob','TINYINT');

	// modify table - MODIFY COLUMN				
	//dbutils.modifyDBColumnInTable(creds,defines.tblJobs,'f_jobnumber','VARCHAR(25)');
	
	//modify table - DROP COLUMN
	//dbutils.dropDBColumnFromTable(creds,defines.tblJobs,'f_status_scaffold');
	//dbutils.dropDBColumnFromTable(creds,defines.tblJobs,'f_status_plaster');
	//dbutils.dropDBColumnFromTable(creds,defines.tblJobs,'f_status_lathe');

	var name = require.resolve('./gptDbUtils.js');
	delete require.cache[name];
	dbutils = null;
};

exports.gpt_startup = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	var obj =	{
				'f_system' : {},
				'f_teamlist' : [],
				'f_pitchtypelist' : [],
				'f_pitchactionlist' : [],
				'f_playerlist' : [],
				'f_coachlist' : [],
				'f_classyearlist' : []
				}
	
	writeDebug('DEBUG:Get startup data');

	gptdb.sqlSystem.get(creds, function(err,rows) 
		{
		if (rows != undefined)
			obj.f_system = rows[0];
		
		obj.f_teamlist = [];
		gptdb.sqlTeam.getAll(creds, function(err,rows) 
			{
			if (rows != undefined)
				obj.f_teamlist = rows;
				
			obj.f_pitchtypelist = [];
			gptdb.sqlPitchType.getAll(creds, function(err,rows) 
				{
				if (rows != undefined)
					obj.f_pitchtypelist = rows;
				
				obj.f_pitchactionlist = [];
				gptdb.sqlPitchAction.getAll(creds, function(err,rows) 
					{
					if (rows != undefined)
						obj.f_pitchactionlist = rows;
				
					obj.f_playerlist = [];
					gptdb.sqlUser.getAllCurrentPlayers(creds, function(err,rows) 
						{
						if (rows != undefined)
							obj.f_playerlist = rows;
							
						obj.f_coachlist = [];
						gptdb.sqlUser.getAllCoaches(creds, function(err,rows) 
							{
							if (rows != undefined)
								obj.f_coachlist = rows;
					
							obj.f_classyearlist = [];
							gptdb.sqlUtils.getValueList(creds,defines.tblUsers, 'f_classyear',
																function (err,rows)
								{
								if (rows != undefined)
									{
									for (var i = 0; i < rows.length; i++)
										{
										if (rows[i]['f_classyear'] != null)
											obj.f_classyearlist.push(rows[i]['f_classyear']);
										}
									}

								sendMsg (req, res, '', obj);
								});
							});
						});
					});
				});
			});
		});

};

/*********************************************************************************
	Routes - File API 


**********************************************************************************/
file_upload_parseFormidable = function (req,callback)
	{
	//clear all day or older print reports
	writeDebug('DEBUG:Cleaning Tmp directory...');
	gpthp.deleteTmpDirectory(1)
		
	writeDebug('DEBUG:File upload...');
	
	var form = new formidable.IncomingForm();

	form.multiples = false;
	form.maxFileSize = 500 * 1024 * 1024;
	form.uploaddir = path.join(__dirname, '..', defines.TMPUPLOAD_DIRECTORY);
	form.uploadDir = path.join(__dirname, '..', defines.TMPUPLOAD_DIRECTORY);

	form.parse(req, function(errMsg,fields,uploadFile) 
		{
		var err = null;
		while(true)
			{
			if (errMsg)
				{
				err = 'ERROR: ' + errMsg;
				break;
				}
			else  if (fields == undefined)
				{
				err = 'ERROR: file upload { fields } not defined';
				break;
				}		
			var creds = gpthp.parse(fields.credentials,null);
			if (creds == undefined)
				{
				err = 'ERROR: file upload creds = undefined';
				break;
				}

			var objUpload = gpthp.parse(fields.objUpload,null);
			if (objUpload == undefined)
				{
				err = 'ERROR: file upload { fields.obj } not defined';
				break;
				}

			break;
			}
			
		if ( (err) && (err.length > 0) )
			writeDebug('DEBUG:File Upload Form Parse... ' + err);
			
		if (callback)
			callback(err,creds,objUpload,uploadFile)
			
		return;
		});
	form.on('error', function(err) 
		{
		err = 'ERROR: ' + JSON.stringify(err);
		callback(err,null,null,null);
		});

	form.on('end', function() 
		{
		//callback(err,obj);
		});
	};
file_upload = function (uploadFile,objUpload,validExts,callback) 
	{
	while(true)
		{
		var err = null;

		// Check the file type
		var file = uploadFile.uploadFile;

		var originalfilename = '';
		if ( (objUpload.f_original_filename != undefined) && (objUpload.f_original_filename.length > 0) )
			originalfilename = objUpload.f_original_filename;
		else if (file != undefined)
			originalfilename = file.originalFilename;

		if ( (originalfilename == undefined) || (originalfilename.length <= 0) )
			{
			err = 'ERROR: file upload {file.name = undefined}';
			break;
			}

		// default file type to specified at client call
		var filetype = objUpload.f_fileext;
		
		var strArray = originalfilename.split('.');
		if ( (strArray != undefined) && (strArray.length >= 2) )
			filetype = strArray[strArray.length - 1];

		if ( 	(filetype == undefined) || (filetype.length <= 0) || 
				(validExts.indexOf(filetype.toLowerCase()) < 0) )
			{
			var err = 'ERROR: Bad filetype = ' + filetype;
			break;
			}
						
		// genrate random name
		var systemfilename = objUpload.f_system_filename;
		if (systemfilename.length <= 0)
			systemfilename = gpthp.buildRandomFilename(filetype);

		writeDebug ('upload file : ' + originalfilename);

		if (objUpload.f_uploaddirectory.length > 0)
			var newfilepath = gpthp.buildUploadPath(objUpload.f_uploaddirectory,systemfilename);
		else
			var newfilepath = gpthp.buildUploadPath(defines.TMPUPLOAD_DIRECTORY + '/',systemfilename);
	
		writeDebug ('new file path : ' + newfilepath);
			
		var filepath = file.filepath;
		if (filepath == undefined)
			filepath = file.path;
				
		if (filepath == undefined)
			{
			err = 'ERROR: file upload {filepath = undefined}';
			break;
			}

		fs.renameSync(filepath, newfilepath);

		objUpload.f_original_filename = originalfilename;
		objUpload.f_system_filename = systemfilename;
		objUpload.f_url = defines.urlGPTTmp (systemfilename);
			
		writeDebug ('original filename : ' + objUpload.f_original_filename);
		writeDebug ('system filename : ' + objUpload.f_system_filename);
		writeDebug ('url : ' + objUpload.f_url);
	
		break;
		}
		
	if ( (err) && (err.length > 0) )
		writeDebug ('UPLOAD ERR : ' + err);

	callback(err,objUpload);
};

/*********************************************************************************
	Routes - System API 


**********************************************************************************/
systemfile_upload = function (req, res, backgroundFileFlag) 
	{
	var validExts = ['png','jpg','jpeg','svg'];
	
	file_upload_parseFormidable(req,function (err,creds,objUpload,uploadFile)
		{
		file_upload (uploadFile,objUpload,validExts, function (err,objUpload) 
			{
			var objData = objUpload.f_obj;
			
			gptdb.sqlSystem.update (creds,objData,function(err,rows)
				{
				if (err)			
					writeDebug ('ERROR: ' + JSON.stringify(err));
	
				sendMsg (req, res, err, objData);
				});
			});
		});
};

exports.gpt_system_upload_image = function (req, res) 
	{
	systemfile_upload (req, res, true) 
	};

exports.gpt_system_get = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	writeDebug('DEBUG:Get system settings');
	gptdb.sqlSystem.get(creds, function(err,rows) 
		{
		if (rows != undefined)
			sendMsg (req, res, '', rows[0]);
		else
			sendMsg (req, res, '', null);
		});
};
exports.gpt_system_cleanup = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	
	writeDebug('DEBUG:System cleanup');
	
	writeDebug('DEBUG:Cleaning Tmp directory...');
	gpthp.deleteTmpDirectory(1);
	
	
	sendMsg (req, res, '', null);
};

exports.gpt_system_defaults = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	
	writeDebug('DEBUG:System reset defaults');
	
	var frompath = gpthp.buildUploadPath(defines.IMAGE_DEFAULTS_DIRECTORY,defines.BACKGROUND_IMAGE_FILE);
	var topath = gpthp.buildUploadPath(defines.IMAGE_DIRECTORY,defines.BACKGROUND_IMAGE_FILE);
	gpthp.fileCopy(frompath,topath)
	
	var frompath = gpthp.buildUploadPath(defines.IMAGE_DEFAULTS_DIRECTORY,defines.BULLPEN_IMAGE_FILE);
	var topath = gpthp.buildUploadPath(defines.IMAGE_DIRECTORY,defines.BULLPEN_IMAGE_FILE);
	gpthp.fileCopy(frompath,topath)
	
	var frompath = gpthp.buildUploadPath(defines.IMAGE_DEFAULTS_DIRECTORY,defines.SCRIMMAGE_IMAGE_FILE);
	var topath = gpthp.buildUploadPath(defines.IMAGE_DIRECTORY,defines.SCRIMMAGE_IMAGE_FILE);
	gpthp.fileCopy(frompath,topath)
	
	var frompath = gpthp.buildUploadPath(defines.IMAGE_DEFAULTS_DIRECTORY,defines.GAME_IMAGE_FILE);
	var topath = gpthp.buildUploadPath(defines.IMAGE_DIRECTORY,defines.GAME_IMAGE_FILE);
	gpthp.fileCopy(frompath,topath)
	
	gptdb.sqlSystem.get(creds, function(err,rows) 
		{
		if (rows != undefined)
			var system = rows[0];
		
		system.f_original_backgroundimage = defines.BACKGROUND_IMAGE_FILE;
		system.f_opacity_backgroundimage = 25;
		system.f_color_backgroundimage = '#FFFFFF';
		
		system.f_original_bullpenimage = defines.BULLPEN_IMAGE_FILE;
		system.f_opacity_bullpenimage = 25;
		system.f_color_bullpenimage = '#FFFFFF';
	
		system.f_original_scrimmageimage = defines.SCRIMMAGE_IMAGE_FILE;
		system.f_opacity_scrimmageimage = 25;
		system.f_color_scrimmageimage = '#FFFFFF';
		
		system.f_original_gameimage = defines.GAME_IMAGE_FILE;
		system.f_opacity_gameimage = 25;
		system.f_color_gameimage = '#FFFFFF';
		
		gptdb.sqlSystem.update (creds,system,function(err,rows)
			{
			if (err)			
				writeDebug ('ERROR: ' + JSON.stringify(err));
	
			sendMsg (req, res, err, system);
			});
		});
	},

// UPDATE`
exports.gpt_system_update = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	
	writeDebug('DEBUG:Update system settings');

	gptdb.sqlSystem.update (creds,obj,function(err,rows)
		{
		sendMsg (req, res, err, obj);
		});
};


// ADD
exports.gpt_system_add = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	
	writeDebug('DEBUG:Add system settings');

	gptdb.sqlSystem.add (creds,function(err,obj)
		{
		sendMsg (req, res, err, obj);
		});
};


/*********************************************************************************
	Routes - User API 


**********************************************************************************/
webpush.setVapidDetails('mailto:someEmail@emailSite.com', defines.VAPID_PUBLIC_KEY, defines.VAPID_PRIVATE_KEY);

exports.gpt_user_get = function (req, res) {
	
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	writeDebug('DEBUG:Get user...');

	if (obj.f_id > 0)
		{
		gptdb.sqlUser.getById (creds,obj.f_id,function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				sendMsg (req, res, err, rows[0]);
			else
				sendMsg (req, res, err, obj);
			});
		}
	else
		{
		gptdb.sqlUser.getByName (creds,obj.f_fname,obj.f_lname,function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				sendMsg (req, res, err, rows[0]);
			else
				sendMsg (req, res, err, obj);
			});
		}
};

exports.gpt_user_getall = function (req, res) {
	
	var data = req.body;
	var creds = data.credentials;
	writeDebug('DEBUG:Get All users...');

	gptdb.sqlUser.gettAll (creds,function(err,rows)
		{
		sendMsg (req, res, err, obj);
		});
};

exports.gpt_user_getallbylastname = function (req, res) {
	
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	writeDebug('DEBUG:Get All Users by last name..');

	gptdb.sqlUser.getAllByLastName(creds,obj.f_lname,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
};

exports.gpt_user_getallbyclassyear = function (req, res) {
	
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	writeDebug('DEBUG:Get All Users by classyear..');

	gptdb.sqlUser.getAllByClassYear (creds,obj.f_classyear,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
};
exports.gpt_user_getallbyteam = function (req, res) {
	
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	writeDebug('DEBUG:Get All Users by team..');
	gptdb.sqlUser.getAllByTeam (creds,obj.f_teamid,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
};

exports.gpt_user_getallpast = function (req, res) {
	
	var data = req.body;
	var creds = data.credentials;
	writeDebug('DEBUG:Get All past players..');
	gptdb.sqlUser.getAllPastPlayers (creds,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
};

exports.gpt_user_getallcurrent = function (req, res) {
	
	var data = req.body;
	var creds = data.credentials;
	writeDebug('DEBUG:Get All current players..');
	gptdb.sqlUser.getAllCurrentPlayers (creds,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
	
};

exports.gpt_user_getcoaches = function (req, res) {
	
	var data = req.body;
	var creds = data.credentials;
	writeDebug('DEBUG:Get All coaches..');
	gptdb.sqlUser.getAllCoaches(creds,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
	
};
// DELETE
exports.gpt_user_delete = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	if (gpthp.isProtectedFromDelete(obj.f_fname,obj.f_lname) != undefined)
		{
		var msg = 'USER: ' + obj.f_fname + ' ' + obj.f_lname + ' can not be deleted';
		sendMsg (req, res, msg, obj);
		}
	else
		{
		gptdb.sqlUser.delete (creds,obj.f_id, function(err,count) 
			{
			sendMsg (req, res, err, obj);
			});
		}
};

// ADD
exports.gpt_user_add = function (req, res) 
	{
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;

	obj.f_fname = gptut.uppercaseFirstLetter(obj.f_fname);
	obj.f_lname = gptut.uppercaseFirstLetter(obj.f_lname);
		
	writeDebug ('DEBUG:user add: ' + obj.f_fname + ' ' + obj.f_lname);

	gptdb.sqlUser.add(creds,obj,function(err,obj)
		{
		if (err)
			writeDebug ('ERROR: ' + JSON.stringify(err));

		sendMsg (req, res, err, obj);
		});	
};

// UPDATE`
exports.gpt_user_update = function (req, res)
	{
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;

	var user = null;
	if ((user = gpthp.isProtectedFromModify(obj.f_fname,obj.f_lname) ) != undefined)
		obj.f_usertype = user.f_usertype;
		
	writeDebug('DEBUG:Update user id = ' + obj.f_id);

	gptdb.sqlUser.update (creds,obj.f_id,obj,function(err,rows)
		{
		sendMsg (req, res, err, obj);
		});
};



/*********************************************************************************
	Routes - GetList API 


**********************************************************************************/
exports.gpt_getlist = function (req, res) {

	var data = req.body;
	var params = data.data;
	var creds = data.credentials;

	writeDebug ("DEBUG:getlist: apiCall: " + params.apiCall);
	
	if (params.apiCall == 'databaselist')
		{
		processDatabaseList(req,res);
		}

	else if (params.apiCall == 'valuelist')
		{
		if ( (params.tblName == undefined) || (params.tblName.length <= 0) ||
			(params.fieldName == undefined) || (params.fieldName.length <= 0) )
			{
			sendMsg(req,res,"Invalid table and/or field name specified", 0);
			return;
			}
		
		gptdb.sqlUtils.getValueList(creds,params.tblName, params.fieldName,function (err,rows)
			{
			var results = [];
			if (rows != undefined)
				{
				for (var i = 0; i < rows.length; i++)
					results.push(rows[i][params.fieldName]);
				}
			
			sendMsg (req, res, err, results);
			});
		}
	else if (params.apiCall == 'propertylist')
		{
		writeDebug ("DEBUG:table: " + params.tblName);
		gptdb.sqlUtils.getPropertyList(creds,params.tblName,function (err,rows)
			{
			var filteredList = gptdb.sqlUtils.filterPropertyList(rows,params.tblName);

			gptdb.sqlUtils.getPropertyDisplayNames(filteredList,params.tblName);

			sendMsg (req, res, err, filteredList);
			});
		}
	else if (params.apiCall == 'searchlist')
		{							
		writeDebug ("DEBUG:searchlist: table: " + params.tblName);
		gptdb.sqlUtils.getSearchList(creds,params,function(err,rows)
			{
			sendMsg (req, res, err, rows);
			});
		}

	else if (params.apiCall == 'userlist')
		{							
		writeDebug ("DEBUG:userlist...");
		gptdb.sqlUser.getAllUserNames(creds,function(err,rows)
			{
			sendMsg (req, res, err, rows);
			});
		}
	
	writeDebug ('DEBUG:API - GET [ ' + params.apiCall + ' ] request proccessed. ');
};

exports.gpt_team_getall = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	
	writeDebug ("DEBUG:team get list");

	gptdb.sqlTeam.getAll(creds,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
};

exports.gpt_team_update = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
		
	writeDebug ("DEBUG:team updating item");

	gptdb.sqlTeam.getByName(creds,obj.f_name,function(err,rows)
		{
		if ( (rows == undefined) || (rows.length <= 0) )
			{
			gptdb.sqlTeam.add(creds,obj,function(err, obj)
				{
				sendMsg (req, res, err, obj);
				});
			}
		else
			{
			obj.f_id = rows[0].f_id;
			
			gptdb.sqlTeam.update(creds,obj.f_id,obj,function(err, obj)
				{
				sendMsg (req, res, err, obj);
				});	
			}
		});
};
exports.gpt_pitchtype_getall = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	
	writeDebug ("DEBUG:pitchtype get list");

	gptdb.sqlPitchType.getAll(creds,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
};

exports.gpt_pitchtype_update = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	
	writeDebug ("DEBUG:pitchtype updating item");
	gptdb.sqlPitchType.getByName(creds,obj.f_name,function(err,rows)
		{
		if ( (rows == undefined) || (rows.length <= 0) )
			{
			gptdb.sqlPitchType.add(creds,obj,function(err, obj)
				{
				sendMsg (req, res, err, obj);
				});
			}
		else
			{
			obj.f_id = rows[0].f_id;
			
			gptdb.sqlPitchType.update(creds,obj.f_id,obj,function(err, obj)
				{
				sendMsg (req, res, err, obj);
				});	
			}
		});
};
exports.gpt_pitchaction_getall = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	
	writeDebug ("DEBUG:pitchaction get list");
	
	gptdb.sqlPitchAction.getAll(creds,function(err,rows)
		{
		sendMsg (req, res, err, rows);
		});
};

exports.gpt_pitchaction_update = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	
	writeDebug ("DEBUG:pitchaction update item");
	gptdb.sqlPitchAction.getByName(creds,obj.f_name,function(err,rows)
		{
		if ( (rows == undefined) || (rows.length <= 0) )
			{
			gptdb.sqlPitchAction.add(creds,obj,function(err, obj)
				{
				sendMsg (req, res, err, obj);
				});
			}
		else
			{
			obj.f_id = rows[0].f_id;
			
			gptdb.sqlPitchAction.update(creds,obj.f_id,obj,function(err, obj)
				{
				sendMsg (req, res, err, obj);
				});	
			}
		});
};
exports.gpt_session_upload = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	
	writeDebug ("DEBUG:Session upload...");
	var pitches = obj.f_pitches;
	obj.f_pitches = [];
	delete obj.f_pitches;

	gptdb.sqlSession.add(creds,obj,function(err,session)
		{
		if (err)
			;
			
		for (var i = 0; i < pitches.length; i++)
			{
			pitches[i].f_sessionid = session.f_id;
			
			gptdb.sqlPitch.add(creds,pitches[i],function(err,pitch)
				{
					
				});
			}
		sendMsg (req, res, err, session);
		});
};	

exports.gpt_stat_search = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	var search = data.data;

	if (search.primarysearchtypeid == defines.searchtype.player)
		{
		writeDebug ("DEBUG:Stat search by player...");

		if (search.secondarysearchtypeid == defines.searchtype.batter)
			{
			writeDebug ("DEBUG:Stat search by batter stance...");
			gptdb.sqlSession.getAllByPlayer(creds,search.primaryvalue,search.sessiontypeid,
										search.daterange,function(err,sessions)
				{
				var controls = new gptdb.sqlList.asyncControls(creds,sessions,5,
										gptdb.sqlSession.callbackListNodeSecondarySearch)
				controls.search = search;

				gptdb.sqlList.processList(controls, function(err,results)
					{
					sendMsg (req, res, err, results);
					});
				});
			}
		else if (search.secondarysearchtypeid == defines.searchtype.pitchtype)
			{
			writeDebug ("DEBUG:Stat search by pitch type...");
			gptdb.sqlSession.getAllByPlayer(creds,search.primaryvalue,search.sessiontypeid,
										search.daterange,function(err,sessions)
				{
				var controls = new gptdb.sqlList.asyncControls(creds,sessions,5,
										gptdb.sqlSession.callbackListNodeSecondarySearch)
				controls.search = search;

				gptdb.sqlList.processList(controls, function(err,results)
					{
					sendMsg (req, res, err, results);
					});
				});
			}			
		else if (search.secondarysearchtypeid == defines.searchtype.pitchaction)
			{
			writeDebug ("DEBUG:Stat search by pitch action...");
			gptdb.sqlSession.getAllByPlayer(creds,search.primaryvalue,search.sessiontypeid,
										search.daterange,function(err,sessions)
				{
				var controls = new gptdb.sqlList.asyncControls(creds,sessions,5,
										gptdb.sqlSession.callbackListNodeSecondarySearch)
				controls.search = search;

				gptdb.sqlList.processList(controls, function(err,results)
					{
					sendMsg (req, res, err, results);
					});
				});
			}
		else
			{
			writeDebug ("DEBUG:Stat search summary...");
			gptdb.sqlSession.getAllByPlayer(creds,search.primaryvalue,search.sessiontypeid,search.daterange,function(err,sessions)
				{
				var controls = new gptdb.sqlList.asyncControls(creds,sessions,5,
										gptdb.sqlSession.callbackListNodeCreateSummary)
				controls.search = search;

				gptdb.sqlList.processList(controls, function(err,results)
					{
					sendMsg (req, res, err, results);
					});
				});
			}
		}	
	else if (search.primarysearchtypeid == defines.searchtype.classyear)
		{
		writeDebug ("DEBUG:Stat search by class year...");
		gptdb.sqlUser.getAllByClassYear(creds,search.primaryvalue,function(err,players)
			{
			var controls = new gptdb.sqlList.asyncControls(creds,players,5,
										gptdb.sqlSession.callbackListNodeGetAllByPlayer)
			controls.search = search;
			
			gptdb.sqlList.processList(controls, function(err,sessions)
				{
				var flatlist = [];
				for (var i = 0; i < sessions.length; i++)
					for (var j = 0; j < sessions[i].length; j++)
						flatlist.push(sessions[i][j]);
		
				var controls = new gptdb.sqlList.asyncControls(creds,flatlist,5,
										gptdb.sqlSession.callbackListNodeCreateSummary)
				controls.search = search;

				gptdb.sqlList.processList(controls, function(err,results)
					{
					sendMsg (req, res, err, results);
					});
				});
			});
		}	
	else if	(search.primarysearchtypeid == defines.searchtype.team)
		{
		writeDebug ("DEBUG:Stat search by team...");
		gptdb.sqlUser.getAllByTeam(creds,search.primaryvalue,function(err,players)
			{
			var controls = new gptdb.sqlList.asyncControls(creds,players,5,
										gptdb.sqlSession.callbackListNodeGetAllByPlayer)
			controls.search = search;
			
			gptdb.sqlList.processList(controls, function(err,sessions)
				{
				var flatlist = [];
				for (var i = 0; i < sessions.length; i++)
					for (var j = 0; j < sessions[i].length; j++)
						flatlist.push(sessions[i][j]);
						
				var controls = new gptdb.sqlList.asyncControls(creds,flatlist,5,
										gptdb.sqlSession.callbackListNodeCreateSummary)
				controls.search = search;

				gptdb.sqlList.processList(controls, function(err,results)
					{
					sendMsg (req, res, err, results);
					});
				});
			});
		}
	else if (search.primarysearchtypeid == defines.searchtype.umpire)
		{
		writeDebug ("DEBUG:Stat search by umpire...");
			
		gptdb.sqlSession.getAllByUmpire(creds,search.primaryvalue,search.sessiontypeid,search.daterange,function(err,sessions)
			{
			var controls = new gptdb.sqlList.asyncControls(creds,sessions,5,
										gptdb.sqlSession.callbackListNodeCreateSummary)
			controls.search = search;

			gptdb.sqlList.processList(controls, function(err,results)
				{
				sendMsg (req, res, err, results);
				});
			});
		}	
	else if	(search.primarysearchtypeid == defines.searchtype.opponent)
		{
		writeDebug ("DEBUG:Stat search by opponent...");
			
		gptdb.sqlSession.getAllByOpponent(creds,search.primaryvalue,search.sessiontypeid,search.daterange,function(err,sessions)
			{
			var controls = new gptdb.sqlList.asyncControls(creds,sessions,5,
										gptdb.sqlSession.callbackListNodeCreateSummary)
			controls.search = search;

			gptdb.sqlList.processList(controls, function(err,results)
				{

				sendMsg (req, res, err, results);
				});
			});
		}
};


exports.gpt_pitch_bysessionid = function (req, res) {
	var data = req.body;
	var creds = data.credentials;
	var obj = data.data;
	
	writeDebug ("DEBUG:Session pitchlist...");
	
	gptdb.sqlPitch.getAllBySession(creds,obj.sessionid,function(err,results)
		{
		sendMsg (req, res, err, results);
		})
};
