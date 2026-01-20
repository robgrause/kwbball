const path = require('path');
const fs = require('fs');
const db = require ('./dbconnection');
const gpthp = require ('../includes/gptHelper');
const gptdt = require ('../includes/gptDateTime');
const defines = require ('../includes/gptDefines');
const server = require ('../controllers/gptServer');
const gptdb = require ('../controllers/gptDbOperations');

// flag set to determin if database tab should be shown
var showdb = false;

var dbutils = 
	{	
	renameDBColumnInTable:async function (creds,tblName,oldName,newName,columnSize) 
		{
		console.log("modifying table (add column): " + tblName);

		var sql = 	"ALTER TABLE " + tblName + " CHANGE " + oldName + " " + newName + ' ' + columnSize;
 	
		await dbutils.processDBCall(creds,sql,tblName);
		},
	addDBColumnToTable:async function (creds,tblName,columnName,columnSize,afterColumn) 
		{
		console.log("modifying table (add column): " + tblName);

		var sql = 	"ALTER TABLE " + tblName + " ADD COLUMN " + columnName +
					" " + columnSize + ' after ' + ' ' + afterColumn; 
 	
		await dbutils.processDBCall(creds,sql,tblName);
		},
	modifyDBColumnInTable:async function (creds,tblName,columnName,columnSize) 
		{
		console.log("modifying table (modify column): " + tblName);

		var sql = 	"ALTER TABLE " + tblName + " MODIFY COLUMN " + columnName +
					" " + columnSize; 
 	
		await dbutils.processDBCall(creds,sql,tblName);
		},
	dropDBColumnFromTable:async function (creds,tblName,columnName) 
		{
		console.log("modifying table (drop column): " + tblName);

		var sql = 	"ALTER TABLE " + tblName + " DROP COLUMN " + columnName;
 	
		await dbutils.processDBCall(creds,sql,tblName);
		},
		
	addSystem:async function (creds) 
		{
		console.log('Adding system settings');

		var tblName = defines.tblSystem;
		
		obj = new defines.objSystem();
		obj.f_date_created = gptdt.getISODateTime();
		
	
		var sql = "INSERT INTO " + tblName + " SET ?";
		var results = await db.executeAsync(creds,sql,obj);
		if (results.err == true)
			console.log(results.error);
		else
			console.log("system settings added");
		},
	
	addUsers:async function (creds) 
		{
		console.log('Adding members');

		var tblName = defines.tblUsers;
		var filepath = path.join(__dirname, '..', defines.USERS_FILE);

		var pusers = require (filepath);

		console.log("inserting " + pusers.users.length + " members");
			
		for (var i = 0; i < pusers.users.length; i++)
			{
			if (! pusers.users[i])
				break;
	
			var username = pusers.users[i].f_fname + " " + pusers.users[i].f_lname;
			
			pusers.users[i].f_date_created = gptdt.getISODateTime();
			
			console.log ("inserting: " + i + " member: " + username);
			var sql = "INSERT INTO " + tblName + " SET ?";
			var results = await db.executeAsync(creds,sql,pusers.users[i]);
			if (results.err == true)
				console.log(results.error);
			else
				console.log("member added: " + username);
			}
		pusers = null;
		},

	addTeams:async function (creds) 
		{
		console.log('Adding team names');

		var tblName = defines.tblTeams;
		var filepath = path.join(__dirname, '..', defines.TEAMS_FILE);

		var pteams = require (filepath);

		console.log("inserting " + pteams.teams.length + " teams");
			
		for (var i = 0; i < pteams.teams.length; i++)
			{
			if (! pteams.teams[i])
				break;
	
			pteams.teams[i].f_date_created = gptdt.getISODateTime();
			
			var sql = "INSERT INTO " + tblName + " SET ?";
			var results = await db.executeAsync(creds,sql,pteams.teams[i]);
			if (results.err == true)
				console.log(results.error);
			}
		pteams = null;
		},
	
	addPitchTypes:async function (creds) 
		{
		console.log('Adding pitch types');

		var tblName = defines.tblPitchTypes;
		var filepath = path.join(__dirname, '..', defines.PITCHTYPES_FILE);

		var ptypes = require (filepath);

		console.log("inserting " + ptypes.types.length + " types");
			
		for (var i = 0; i < ptypes.types.length; i++)
			{
			if (! ptypes.types[i])
				break;
	
			ptypes.types[i].f_date_created = gptdt.getISODateTime();
			
			var sql = "INSERT INTO " + tblName + " SET ?";
			var results = await db.executeAsync(creds,sql,ptypes.types[i]);
			if (results.err == true)
				console.log(results.error);
			}
		ptypes = null;
		},
	
	addPitchActions:async function (creds) 
		{
		console.log('Adding pitch actions');

		var tblName = defines.tblPitchActions;
		var filepath = path.join(__dirname, '..', defines.PITCHACTIONS_FILE);

		var pactions = require (filepath);

		console.log("inserting " + pactions.actions.length + " actions");
			
		for (var i = 0; i < pactions.actions.length; i++)
			{
			if (! pactions.actions[i])
				break;
	
			pactions.actions[i].f_date_created = gptdt.getISODateTime();
			
			var sql = "INSERT INTO " + tblName + " SET ?";
			var results = await db.executeAsync(creds,sql,pactions.actions[i]);
			if (results.err == true)
				console.log(results.error);
			}
		pactions = null;
		},
	
	getDatabaseList:async function(creds)
		{
		console.log('Getting database list');
		var sql = "SHOW DATABASES ";
		var result = await db.executeAsync (creds,sql); 
		return (result.results);
		},
		
	createTables:async function(dbName) 
		{
		var creds = {'f_database_name':dbName};
		console.log("CREATING TABLES for database: " + dbName);
		
		await dbutils.dropDBTable(creds,defines.tblSystem,null);
		await dbutils.createDBSystemTable(creds);
		
		await dbutils.dropDBTable(creds,defines.tblUsers,null);
		await dbutils.createDBUsersTable(creds);
		
		await dbutils.dropDBTable(creds,defines.tblSessions,null);
		await dbutils.createDBSessionsTable(creds);
			
		await dbutils.dropDBTable(creds,defines.tblPitches,null);
		await dbutils.createDBPitchesTable(creds);
		
		await dbutils.dropDBTable(creds,defines.tblTeams,null);
		await dbutils.createDBTeamsTable(creds);
	
		await dbutils.dropDBTable(creds,defines.tblPitchTypes,null);
		await dbutils.createDBPitchTypesTable(creds);
	
		await dbutils.dropDBTable(creds,defines.tblPitchActions,null);
		await dbutils.createDBPitchActionsTable(creds);
		},
	createDatabase:async function(dbName, callback) 
		{
		console.log("PROCESSING CREATE DATABASE ");
		var logincreds = {'f_database_name':''}

		dbutils.dropDatabase(dbName,async function(err)
			{
			console.log("CREATE DATABASE " + dbName);
			var sql = "CREATE DATABASE " + dbName;
			await db.executeAsync(logincreds, sql)
		
			await dbutils.createTables(dbName);
			
			if (callback)
				callback('');
			});
		},
		
	dropDatabase:async function(dbName,callback) 
		{
		console.log("PROCESSING DROP DATABASE ");
		var logincreds = {'f_database_name':''}
		var lowerDBName = dbName.toLowerCase();
		var results = await dbutils.getDatabaseList(logincreds);

		console.log("Checking if database exist");
		if ( (results != undefined) && (results.length > 0) )
			{
			for (var i = 0; i < results.length; i++)
				{
				if(results[i].Database.toLowerCase() == lowerDBName)
					{
					console.log ("DROP DATABASE " + dbName);
					var sql = "DROP DATABASE " + dbName;
					await db.executeAsync (logincreds, sql);
					break;
					}
				}
			}
		if (callback)
			callback('');
		},
		
	dropDBTable:async function (creds, tblName,callback) 
		{
		var sql = 	"SELECT COUNT(*) FROM information_schema.tables " +
					" WHERE table_schema = '" + creds.f_database_name + "' AND " +
					" table_name = '" + tblName + "'"; 

		var result = await db.executeAsync(creds, sql);

		if ( (result) && (result.results) && (result.results[0]) )
			var count = result.results[0]['COUNT(*)'];
		else
			var count = 0;
			
		if (count > 0)
			{
			console.log("Table: " + tblName + " exists.");
			var sql = "DROP TABLE " + tblName;
		
			if (await db.executeAsync(creds, sql) )
				{
				console.log("Table: " + tblName + " dropped.");
				if (callback)
					await callback(creds);
				}
			}
		else if (callback)
			await callback(creds);
		},
	
	processDBCall:async function(creds,sql,tblName)
		{
		var results = await db.executeAsync(creds,sql);
		if (results.err == true)
			console.log(results.error);
		},
		
	createDBUsersTable:async function (creds) {
		var tblName = defines.tblUsers;
		console.log("creating table: " + tblName);
		var sql = "CREATE TABLE " + tblName + " (" +
				"f_id INT UNSIGNED NOT NULL AUTO_INCREMENT," +
				"f_date_created DATETIME," +
				"f_date_lastmodified DATETIME," +

				"f_fname VARCHAR(" + parseInt(defines.STR_LENGTH_NAME  + 1) +") NOT NULL," + 
				"f_lname VARCHAR(" + parseInt(defines.STR_LENGTH_NAME  + 1) +") NOT NULL," + 
				
				"f_teamid TINYINT," + 
				"f_typeid TINYINT," +
				"f_classyear INT," + 
				"f_status TINYINT," +
				"f_throw TINYINT," +
				"f_bat TINYINT," +
				"f_pitchids VARCHAR(100)," +
				"f_notes VARCHAR(" + parseInt(defines.STR_LENGTH_NOTES  + 1) +")," +
				
				"PRIMARY KEY (f_id)," +
				"UNIQUE KEY (f_fname,f_lname))";
		await dbutils.processDBCall(creds,sql,tblName);
		dbutils.addUsers(creds);
		},
		
	createDBSessionsTable:async function (creds) {
		var tblName = defines.tblSessions;
		console.log("creating table: " + tblName);
		var sql = "CREATE TABLE " + tblName + " (" +
				"f_id INT UNSIGNED NOT NULL AUTO_INCREMENT," +
				"f_playerid INT UNSIGNED NOT NULL," +
				"f_date_created DATETIME," +
				"f_date_startdateandtime DATETIME," +

				"f_typeid TINYINT," + 
				"f_status TINYINT," +
				"f_duration TINYINT," +

				"f_umpire VARCHAR(100) DEFAULT NULL," +
				"f_opponent VARCHAR(100) DEFAULT NULL," +
				
				"f_notes VARCHAR(" + parseInt(defines.STR_LENGTH_NOTES  + 1) +")," +
				"f_pitchtyperesults VARCHAR(500) DEFAULT NULL," +
				
				"PRIMARY KEY (f_id)," +
				"UNIQUE KEY (f_id))";
		await dbutils.processDBCall(creds,sql,tblName);
		},
			
	createDBPitchesTable:async function (creds) {
		var tblName = defines.tblPitches;
		console.log("creating table: " + tblName);
		var sql = "CREATE TABLE " + tblName + " (" +
				"f_id INT UNSIGNED NOT NULL AUTO_INCREMENT," +
				"f_playerid INT UNSIGNED NOT NULL," +
				"f_sessionid INT UNSIGNED NOT NULL," +
				"f_typeid INT UNSIGNED," +
				"f_actionid INT UNSIGNED," +
				
				"f_date_created DATETIME," +
				
				"f_batterleftright TINYINT," + 

				"f_status TINYINT," +
				"f_inning TINYINT," +
				"f_velocity DECIMAL(5,2) DEFAULT 0," +
				
				"f_calllocation VARCHAR(10) DEFAULT NULL," +
				"f_throwlocation VARCHAR(10) DEFAULT NULL," +
				
				"f_notes VARCHAR(" + parseInt(defines.STR_LENGTH_NOTES  + 1) +")," +
				
				"PRIMARY KEY (f_id)," +
				"UNIQUE KEY (f_id,f_playerid,f_sessionid))";
		await dbutils.processDBCall(creds,sql,tblName);
		},

	createDBTeamsTable:async function (creds) {
		var tblName = defines.tblTeams;
		console.log("creating table: " + tblName);
		var sql = "CREATE TABLE " + tblName + " (" +
				"f_id INT UNSIGNED NOT NULL AUTO_INCREMENT," +
			
				"f_date_created DATETIME," +
			
				"f_name VARCHAR(50) NOT NULL," +
				
				"PRIMARY KEY (f_id)," +
				"UNIQUE KEY (f_name))";
		await dbutils.processDBCall(creds,sql,tblName);
		dbutils.addTeams(creds);
		},
	
	createDBPitchTypesTable:async function (creds) {
		var tblName = defines.tblPitchTypes;
		console.log("creating table: " + tblName);
		var sql = "CREATE TABLE " + tblName + " (" +
				"f_id INT UNSIGNED NOT NULL AUTO_INCREMENT," +
			
				"f_date_created DATETIME," +
			
				"f_name VARCHAR(50) NOT NULL," +
				
				"PRIMARY KEY (f_id)," +
				"UNIQUE KEY (f_name))";
		await dbutils.processDBCall(creds,sql,tblName);
		dbutils.addPitchTypes(creds);
		},
	createDBPitchActionsTable:async function (creds) {
		var tblName = defines.tblPitchActions;
		console.log("creating table: " + tblName);
		var sql = "CREATE TABLE " + tblName + " (" +
				"f_id INT UNSIGNED NOT NULL AUTO_INCREMENT," +
			
				"f_date_created DATETIME," +
				"f_isstrike TINYINT," +
				"f_strikecount TINYINT," +
				"f_pitchcount TINYINT," +
				
				"f_name VARCHAR(50) NOT NULL," +

				"PRIMARY KEY (f_id)," +
				"UNIQUE KEY (f_name))";
		await dbutils.processDBCall(creds,sql,tblName);
		dbutils.addPitchActions(creds);
		},
		
	createDBSystemTable:async function (creds) {
		var tblName = defines.tblSystem;
		console.log("creating table: " + tblName);

		var sql = "CREATE TABLE " + tblName + " (" +
				"f_date_created DATETIME," +
				"f_date_lastmodified DATETIME," +
				
				"f_name VARCHAR(" + parseInt(defines.STR_LENGTH_NAME + 1) +") NOT NULL," + 
		
				"f_clientrefresh INT," +

				"f_original_backgroundimage VARCHAR(" + parseInt(defines.STR_LENGTH_ORIGINAL_FILENAME  + 1) + ")," +
				"f_opacity_backgroundimage TINYINT DEFAULT 100," + 
				"f_color_backgroundimage VARCHAR(20)," + 
				
				"f_original_bullpenimage VARCHAR(" + parseInt(defines.STR_LENGTH_ORIGINAL_FILENAME  + 1) + ")," +
				"f_opacity_bullpenimage TINYINT DEFAULT 100," + 
				"f_color_bullpenimage VARCHAR(20)," + 
				
				"f_original_scrimmageimage VARCHAR(" + parseInt(defines.STR_LENGTH_ORIGINAL_FILENAME  + 1) + ")," +
				"f_opacity_scrimmageimage TINYINT DEFAULT 100," + 
				"f_color_scrimmageimage VARCHAR(20)," + 
				
				"f_original_gameimage VARCHAR(" + parseInt(defines.STR_LENGTH_ORIGINAL_FILENAME  + 1) + ")," +
				"f_opacity_gameimage TINYINT DEFAULT 100," + 
				"f_color_gameimage VARCHAR(20)," + 
				
				"PRIMARY KEY (f_name)," +
				"UNIQUE KEY (f_name))";
		await dbutils.processDBCall(creds,sql,tblName);
		dbutils.addSystem(creds);
		},
	
};

module.exports=dbutils;

