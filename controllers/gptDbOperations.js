const db = require ('./dbconnection');
//const version = require ('../includes/gptVersion');
const defines = require ('../includes/gptDefines');
const gptdt = require ('../includes/gptDateTime');
const gptut = require ('../includes/gptUtils');
const gpthp = require ('../includes/gptHelper');
const gptma = require ('../includes/gptMath');
/*********************************************************************************
	Utils database functions


**********************************************************************************/
var sqlUtils = {

/*--------------------------------------------------------------------------------
	gptdb.sqlUtils.getValueList("t_devicecfgs", "f_manufacturer_name",function (err,rows)
		{

		});
		 
	Output: {"f_manufacturer_name": "value1"}
			{"f_manufacturer_name": "value2"}
-----------------------------------------------------------------------------------*/
	getValueList:function (creds,tblname, fieldname, callback) 
		{
		var sql = "SELECT DISTINCT " + fieldname + " FROM " + tblname;
		return db.execute (creds,sql, callback);
		},
	
	getDateRangeSQL:function(dateRange,dateField,tblName)
		{
/*
		var dateField = params.dateField;
		var dateRange = params.dateRange;
		var dateValue = params.dateValue;
		var tblName   = params.tblName;
*/		
		var sql = '';
		// get today in iso time
		var dateNow = gptdt.getISODateTime();
		var dateNow = new Date(dateNow);

		if ( (dateRange == undefined) || (dateRange.length <= 0) )
			sql = null;
		
		if (dateRange == defines.daterange.week)
			{
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
			}
		else if (dateRange == defines.daterange.month)
			{
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
			}
		else if (dateRange == defines.daterange.season)
			{
			var strBeginDay = dateNow.getFullYear() + '-01-01' 
			sql = tblName + "." + dateField + " >= '" + strBeginDay + "'";
			}
		else if (dateRange == defines.daterange.all)
			sql = null;
			
		return (sql);
		},
	
	getSearchList:function (creds,params,callback)
		{
		if ( (params.tblName == undefined) || (params.tblName.length <= 0) ||
			(params.fieldName == undefined) || (params.fieldName.length <= 0) ||
			(params.value == undefined) || (params.value.length <= 0) ||
			(params.op == undefined) || (params.op.length <= 0) )
			{
			callback("Invalid search criteria specified.",null);
			return;
			}
			
		var tblName =  params.tblName;
		var fieldName = params.fieldName;
		var fieldValue = params.value;
		var op = params.op;
		var secondField = params.secondField;
		var secondValue = params.secondValue;
		var secondOp = params.secondOp;
		var dateField = params.dateField;
		var dateRange = params.dateRange;
		var orderField = params.orderField;
		var orderDirection = params.orderDirection;

		if (op == 'CONTAINS')
			op = 'LIKE';
			
		if (secondOp == '')
			secondOp = op
			
		// replace wildcard search character
		if (typeof(fieldValue) == 'string')
			var fieldValue = fieldValue.replace(/\*/g, '%');
		
		if ( (secondValue != undefined) && (typeof(secondValue) == 'string') && (secondValue.length > 0) )
			secondValue = secondValue.replace(/\*/g, '%');

		if ( (secondField != undefined) && (secondField.length > 0) )
			{
			var sqlWhere = " WHERE " + tblName + '.' + fieldName + " " + op + " '" + fieldValue + "'";
			
			if (secondValue == null)
				sqlWhere = sqlWhere + " AND " + tblName + '.' + secondField + " IS NULL";
			else
				sqlWhere = sqlWhere + " AND " + tblName + '.' + secondField + " " + secondOp + " '" + secondValue + "'";
			}
		else
			var sqlWhere = " WHERE " + tblName + '.' + fieldName + " " + op + " '" + fieldValue + "'";
			
		var dateSQL = sqlUtils.getDateRangeSQL(params);

		if (dateSQL != null)
			var sql = "SELECT * FROM " + tblName +
						sqlWhere + " AND " + dateSQL +
						" ORDER BY " + orderField + " " + orderDirection;
		else
			var sql = "SELECT * FROM " + tblName + sqlWhere + " ORDER BY " + orderField + " " + orderDirection;

		db.execute (creds,sql, function (err, rows)
			{
			callback(err,rows);
			});
		},
	
	getSearchListAsync: async function (creds,params)
		{
		if ( (params.tblName == undefined) || (params.tblName.length <= 0) ||
			(params.fieldName == undefined) || (params.fieldName.length <= 0) ||
			(params.value == undefined) || (params.value.length <= 0) ||
			(params.op == undefined) || (params.op.length <= 0) )
			{
			callback("Invalid search criteria specified.",null);
			return;
			}
			
		var tblName =  params.tblName;
		var fieldName = params.fieldName;
		var fieldValue = params.value;
		var op = params.op;
		var secondField = params.secondField;
		var secondValue = params.secondValue;
		var secondOp = params.secondOp;
		var dateField = params.dateField;
		var dateRange = params.dateRange;
		var orderField = params.orderField;
		var orderDirection = params.orderDirection;

		if (op == 'CONTAINS')
			op = 'LIKE';
			
		if (secondOp == '')
			secondOp = op
			
		// replace wildcard search character
		if (typeof(fieldValue) == 'string')
			var fieldValue = fieldValue.replace(/\*/g, '%');
		
		if ( (secondValue != undefined) && (typeof(secondValue) == 'string') && (secondValue.length > 0) )
			secondValue = secondValue.replace(/\*/g, '%');

		if ( (secondField != undefined) && (secondField.length > 0) )
			{
			var sqlWhere = " WHERE " + tblName + '.' + fieldName + " " + op + " '" + fieldValue + "'";
			
			if (secondValue == null)
				sqlWhere = sqlWhere + " AND " + tblName + '.' + secondField + " IS NULL";
			else
				sqlWhere = sqlWhere + " AND " + tblName + '.' + secondField + " " + secondOp + " '" + secondValue + "'";
			}
		else
			var sqlWhere = " WHERE " + tblName + '.' + fieldName + " " + op + " '" + fieldValue + "'";
			
		var dateSQL = sqlUtils.getDateRangeSQL(params);

		if (dateSQL != null)
			var sql = "SELECT * FROM " + tblName +
						sqlWhere + " AND " + dateSQL +
						" ORDER BY " + orderField + " " + orderDirection;
		else
			var sql = "SELECT * FROM " + tblName + sqlWhere + " ORDER BY " + orderField + " " + orderDirection;

		return (await db.executeAsync (creds,sql));
		},
		
		
	getPropertyList:function (creds,tblname, callback) 
		{
		var sql = "DESCRIBE " + tblname;

		return db.execute (creds,sql, callback);
		},
		
	getPropertyListAsync:async function (creds,tblname) 
		{
		var sql = "DESCRIBE " + tblname;
		return (await db.executeAsync (creds,sql));
		},
		
	filterPropertyList:function(props,tblName)
		{
		var filteredList = [];
		for (var i = 0; i < props.length; i++)
			{
			var field = props[i];
			var prop = null;
			
			if (tblName == defines.tblUsers)
				{
				if ( (field.Field == "f_id") ||
					(field.Field == "f_fname") ||
					(field.Field == "f_lname") ||
					(field.Field == "f_usertype") ||
					(field.Field == "f_address") ||
					(field.Field == "f_address2") ||
					(field.Field == "f_city") ||
					(field.Field == "f_state") ||
					(field.Field == "f_zipcode") ||
					(field.Field == "f_homephone") ||
					(field.Field == "f_mobilephone") ||
					(field.Field == "f_econtactname") ||
					(field.Field == "f_econtactphone") ||
					(field.Field == "f_email") ||
					(field.Field == "f_notes") )
						prop = field;
				}
			else
				prop = field;
	
			if (prop != null)
				filteredList.push(prop);
			}
			
		return (filteredList);
		},
	getPropertyDisplayName:function(field, tblName)
		{
		var strTmp = field;
		var strFirst2 = strTmp.slice(0,2)
		
		if (strFirst2 == 'f_')
			strTmp = field.slice(2);
			
		strTmp = strTmp.replace(/_/g,' ');
		
		return (strTmp);
		},
	getPropertyDisplayNames:function(props, tblName)
		{
		for (var i = 0; i < props.length; i++)
			props[i].DisplayName = this.getPropertyDisplayName(props[i].Field,tblName);
		},
	getDatabaseList:async function(creds)
		{
		var sql = "SHOW DATABASES ";
		return (await db.executeAsync (creds,sql));
		},
		
	getObjectListByTableAndIds(creds,ids,tblName,callback)
		{
		if ( (ids == undefined) || (ids.length <= 0) )
			{
			if (callback)
				callback ('', null);
			return;
			}

		//make list is all unique ids
		var uniqIds =[]
		for (var i = 0; i < ids.length; i++)
			{
			var found = false
			for (var j = 0; j < uniqIds.length; j++)
				{
				if (ids[i] == uniqIds[j])
					{
					found = true;
					break;
					}
				}
			if (found == false)
				uniqIds.push(ids[i]);
			}

		var sqlIds = '';

		for (var i = 0; i < uniqIds.length; i++)
			{
			if (i == 0)
				sqlIds = " WHERE " + 'f_id' + " " + 'LIKE' + " '" + uniqIds[i] + "'";
			else
				sqlIds = sqlIds + ' OR '  + 'f_id' + " " + 'LIKE' + " '" + uniqIds[i] + "'";
			}

		var sql = "SELECT * FROM " + tblName + sqlIds;
		db.execute (creds,sql, function (err, rows)
			{
			callback(err,rows);
			});
		},
};


/*********************************************************************************
	System database functions


**********************************************************************************/
var sqlSystem = {

	tblName : defines.tblSystem,
	objName : defines.SYSYEM_SETTINGS_OBJECT,
	
	get:function (creds,callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_name=?";
		db.execute (creds,sql,[this.objName],function(err,rows)
			{
			callback(err, rows)
			});
	},

	update:function(creds,obj,callback) {
		obj.f_date_lastmodified = gptdt.getISODateTime();

		var sql = "UPDATE " + this.tblName + " SET f_name=?,f_date_lastmodified=?," +
							"f_clientrefresh=?," +
							"f_original_backgroundimage=?," + 
							"f_opacity_backgroundimage=?,f_color_backgroundimage=?," + 
							"f_original_bullpenimage=?," + 
							"f_opacity_bullpenimage=?,f_color_bullpenimage=?," + 
							"f_original_scrimmageimage=?," + 
							"f_opacity_scrimmageimage=?,f_color_scrimmageimage=?," + 
							"f_original_gameimage=?," + 
							"f_opacity_gameimage=?,f_color_gameimage=?" + 
							" WHERE f_name=?";

		return db.execute(creds,sql,[sqlSystem.objName,obj.f_date_lastmodified,
								obj.f_clientrefresh,
								obj.f_original_backgroundimage,
								obj.f_opacity_backgroundimage,
								obj.f_color_backgroundimage,
								obj.f_original_bullpenimage,
								obj.f_opacity_bullpenimage,
								obj.f_color_bullpenimage,
								obj.f_original_scrimmageimage,
								obj.f_opacity_scrimmageimage,
								obj.f_color_scrimmageimage,
								obj.f_original_gameimage,
								obj.f_opacity_gameimage,
								obj.f_color_gameimage,
								sqlSystem.objName],
								callback);	
	},

	add:function(creds,callback) {
		var obj = new defines.objSystem();
		obj.f_date_created = gptdt.getISODateTime();
		obj.f_date_lastmodified = gptdt.getISODateTime();
		obj.f_name = this.objName;

		var sql = "INSERT INTO " + this.tblName + " SET ?";
		db.execute (creds,sql, obj, function (err,count)
			{
			if (count != undefined)
				obj.f_id = count.insertId;

			callback(err,obj)
			return;
			});		
	},
};


/*********************************************************************************
	User database functions


**********************************************************************************/
var sqlUser = {

	tblName : defines.tblUsers,

	getAll:function (creds,callback) {
		var sql = 	"SELECT * FROM " + this.tblName +
					" ORDER BY " + 'f_lname' + " " + 'ASC';
		db.execute (creds,sql,function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					{
					var pitchids = JSON.parse(rows[i].f_pitchids);
					rows[i].f_pitchids = [];
					if (pitchids != undefined)
						{
						for(var j = 0; j < pitchids.length;  j++)
							rows[i].f_pitchids.push(parseInt(pitchids[j]))
						}
						
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
					}
				}
			callback(err, rows)
			});
	},
	getAllByClassYear:function (creds,classyear,callback) {
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_classyear=?" +
									" ORDER BY " + 'f_lname' + " " + 'ASC';				
		db.execute (creds,sql,[classyear],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					{
					var pitchids = JSON.parse(rows[i].f_pitchids);
					rows[i].f_pitchids = [];
					if (pitchids != undefined)
						{
						for(var j = 0; j < pitchids.length;  j++)
							rows[i].f_pitchids.push(parseInt(pitchids[j]))
						}
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
					}
				}
			callback(err, rows)
			});
	},
	
	getAllByLastName:function (creds,lname,callback) {
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_lname=?" +
									" ORDER BY " + 'f_lname' + " " + 'ASC';				
		db.execute (creds,sql,[lname],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					{
					var pitchids = JSON.parse(rows[i].f_pitchids);
					rows[i].f_pitchids = [];
					if (pitchids != undefined)
						{
						for(var j = 0; j < pitchids.length;  j++)
							rows[i].f_pitchids.push(parseInt(pitchids[j]))
						}
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
					}
				}
			callback(err, rows)
			});
	},
	getAllPastPlayers:function (creds,callback) {
		var classyear = new Date().getFullYear();
		var sql = 	"SELECT * FROM " + this.tblName +
									" WHERE f_classyear<? AND f_typeid=?" +
									" ORDER BY " + 'f_lname' + " " + 'ASC';	
		db.execute (creds,sql,[classyear,defines.usertype.player],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					{
					var pitchids = JSON.parse(rows[i].f_pitchids);
					rows[i].f_pitchids = [];
					if (pitchids != undefined)
						{
						for(var j = 0; j < pitchids.length;  j++)
							rows[i].f_pitchids.push(parseInt(pitchids[j]))
						}
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
					}
				}
			callback(err, rows)
			});
	},
	getAllCurrentPlayers:function (creds,callback) {
		var classyear = new Date().getFullYear();
		var sql = 	"SELECT * FROM " + this.tblName +
									" WHERE f_classyear>=? AND f_typeid=?" +
									" ORDER BY " + 'f_lname' + " " + 'ASC';	
		db.execute (creds,sql,[classyear,defines.usertype.player],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					{
					var pitchids = JSON.parse(rows[i].f_pitchids);
					rows[i].f_pitchids = [];
					if (pitchids != undefined)
						{
						for(var j = 0; j < pitchids.length;  j++)
							rows[i].f_pitchids.push(parseInt(pitchids[j]))
						}
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
					}
				}
			callback(err, rows)
			});
	},
	getAllByTeam:function (creds,teamid,callback) {
		var classyear = new Date().getFullYear();
		var sql = 	"SELECT * FROM " + this.tblName +
									" WHERE f_classyear>=? AND f_typeid=? AND f_teamid=?" +
									" ORDER BY " + 'f_lname' + " " + 'ASC';	
		db.execute (creds,sql,[classyear,defines.usertype.player,teamid],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					{
					var pitchids = JSON.parse(rows[i].f_pitchids);
					rows[i].f_pitchids = [];
					if (pitchids != undefined)
						{
						for(var j = 0; j < pitchids.length;  j++)
							rows[i].f_pitchids.push(parseInt(pitchids[j]))
						}
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
					}
				}
			callback(err, rows)
			});
	},
	getAllCoaches:function (creds,callback) {
		var sql = 	"SELECT * FROM " + this.tblName +
									" WHERE f_typeid=?" +
									" ORDER BY " + 'f_lname' + " " + 'ASC';
		return db.execute (creds,sql,[defines.usertype.coach],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
				}
			callback(err, rows)
			});
	},
	update:function(creds,id,obj,callback) 
		{
		obj.f_date_lastmodified = gptdt.getISODateTime();
			
		var pitchids = JSON.stringify(obj.f_pitchids)
		var sql = "UPDATE " + this.tblName + " SET f_status=?,f_date_lastmodified=?," +
							"f_fname=?,f_lname=?,f_typeid=?,f_classyear=?," +
							"f_teamid=?,f_throw=?,f_bat=?,f_pitchids=?," +
							"f_notes=?" +
							" WHERE f_id=?";
		db.execute(creds,sql,[obj.f_status,
								obj.f_date_lastmodified,
								obj.f_fname,obj.f_lname,
								obj.f_typeid,
								obj.f_classyear,
								obj.f_teamid,
								obj.f_throw,
								obj.f_bat,
								pitchids,
								obj.f_notes,id],
							function(err,rows)
			{
			callback(err,obj);
			});
	},
	
	getById:function (creds,id, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_id=?";
		db.execute (creds,sql,[id],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					{
					var pitchids = JSON.parse(rows[i].f_pitchids);
					rows[i].f_pitchids = [];
					if (pitchids != undefined)
						{
						for(var j = 0; j < pitchids.length;  j++)
							rows[i].f_pitchids.push(parseInt(pitchids[j]))
						}
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
					}
				}
			callback(err, rows)
			});
	},
	getByName:function (creds,fname, lname, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_fname=? AND f_lname=?";
		db.execute (creds,sql,[fname,lname],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					{
					var pitchids = JSON.parse(rows[i].f_pitchids);
					rows[i].f_pitchids = [];
					if (pitchids != undefined)
						{
						for(var j = 0; j < pitchids.length;  j++)
							rows[i].f_pitchids.push(parseInt(pitchids[j]))
						}
					rows[i].f_fullname = rows[i].f_fname + ' ' + rows[i].f_lname;
					}
				}
			callback(err, rows)
			});
	},
	
	sqlUserNameSelect : 	
						defines.tblUsers + ".f_fname," +
						defines.tblUsers + ".f_lname",
						
	getAllUserNames:function (creds,callback) {
		var sql = "SELECT " + this.sqlUserNameSelect + " FROM " + this.tblName;
		db.execute (creds,sql,function(err,rows)
			{
			var results = [];
			if (rows != undefined)
				{
				for (var i = 0; i < rows.length; i++)
					{
					var fname = rows[i].f_fname[0].toUpperCase() + rows[i].f_fname.substring(1);
					var lname = rows[i].f_lname[0].toUpperCase() + rows[i].f_lname.substring(1);
					results.push(fname + ' ' + lname);
					}
				}
			
			callback(err, results)
			});
	},
	
	add:function(creds,obj,callback) {
		obj.f_date_created = gptdt.getISODateTime();
		obj.f_date_lastmodified = gptdt.getISODateTime();
		
		obj.f_pitchids = JSON.stringify(obj.f_pitchids);
		
		var sql = "INSERT INTO " + this.tblName + " SET ?";
		
		db.execute (creds,sql,obj, function (err,count)
			{
			if (count != undefined)
				obj.f_id = count.insertId;

			obj.f_pitchids = JSON.parse(obj.f_pitchids);
			
			callback(err,obj)
			return;
			});		
	},
	delete:function(creds,id, callback) 
		{
		sqlSession.getAllByPlayer(creds,id,defines.sessiontype.all,defines.daterange.all,
																	function(err,sessions) 
			{
			var controls = new sqlList.asyncControls(creds,sessions,5,
								sqlUser.callbackListNodeDeleteAllSessions)

			sqlList.processList(controls, function(err,results)
				{
				var sql = "DELETE FROM " + sqlUser.tblName + " WHERE f_id=?";
				return db.execute(creds,sql,[id],function(err,results)
					{
					callback('',results);
					});
				});
			});
	},
	
	callbackListNodeDeleteAllSessions:function (session,controls,callback) 
		{
		sqlSession.delete(controls.creds,session.f_id,function(err,results)
			{
			});
			
		callback('',session);
		},
};

/*********************************************************************************
	Team database functions


**********************************************************************************/
var sqlTeam = {

	tblName : defines.tblTeams,
	
	getAll:function (creds,callback) {
		var sql = 	"SELECT * FROM " + this.tblName +
					" ORDER BY " + 'f_name' + " " + 'ASC';
		return db.execute (creds,sql, callback);
	},
	update:function(creds,id,obj,callback) 
		{	
		var sql = "UPDATE " + this.tblName + " SET f_name=? WHERE f_id=?";
		db.execute(creds,sql,[obj.f_name,id],function(err,rows)
			{
			callback(err,obj);
			});
	},
	
	getById:function (creds,id, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_id=?";
		db.execute (creds,sql,[id],function(err,rows)
			{
			callback(err, rows)
			});
	},
	getByName:function (creds,name, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_name=?";
		db.execute (creds,sql,[name],function(err,rows)
			{
			callback(err, rows)
			});
	},
	
	add:function(creds,obj,callback) {
	
		var sql = "INSERT INTO " + this.tblName + " SET ?";
		
		db.execute (creds,sql,obj, function (err,count)
			{
			if (count != undefined)
				obj.f_id = count.insertId;

			callback(err,obj)
			return;
			});		
	},
	delete:function(creds,id, callback) {
		var sql = "DELETE FROM " + this.tblName + " WHERE f_id=?";
		return db.execute(creds,sql,[id],callback);
	},
};

/*********************************************************************************
	PitchType database functions


**********************************************************************************/
var sqlPitchType = {

	tblName : defines.tblPitchTypes,
	
	getAll:function (creds,callback) {
		var sql = 	"SELECT * FROM " + this.tblName +
					" ORDER BY " + 'f_name' + " " + 'ASC';
		return db.execute (creds,sql, callback);
	},
	update:function(creds,id,obj,callback) 
		{	
		var sql = "UPDATE " + this.tblName + " SET f_name=? WHERE f_id=?";
		db.execute(creds,sql,[obj.f_name,id],function(err,rows)
			{
			callback(err,obj);
			});
	},
	
	getById:function (creds,id, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_id=?";
		db.execute (creds,sql,[id],function(err,rows)
			{
			callback(err, rows)
			});
	},
	getByName:function (creds,name, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_name=?";
		db.execute (creds,sql,[name],function(err,rows)
			{
			callback(err, rows)
			});
	},
	
	add:function(creds,obj,callback) {
	
		var sql = "INSERT INTO " + this.tblName + " SET ?";
		
		db.execute (creds,sql,obj, function (err,count)
			{
			if (count != undefined)
				obj.f_id = count.insertId;

			callback(err,obj)
			return;
			});		
	},
	delete:function(creds,id, callback) {
		var sql = "DELETE FROM " + this.tblName + " WHERE f_id=?";
		return db.execute(creds,sql,[id],callback);
	},
};

/*********************************************************************************
	PitchAction database functions


**********************************************************************************/
var sqlPitchAction = {

	tblName : defines.tblPitchActions,
	
	getAll:function (creds,callback) {
		var sql = 	"SELECT * FROM " + this.tblName +
					" ORDER BY " + 'f_name' + " " + 'ASC';
		return db.execute (creds,sql, callback);
	},
	update:function(creds,id,obj,callback) 
		{	
		var sql = "UPDATE " + this.tblName + " SET f_name=?,f_iss=?,f_sc=?,f_pitchccount=?" +
						" WHERE f_id=?";
		db.execute(creds,sql,[obj.f_name,
								obj.f_iss,
								obj.f_sc,
								obj.f_pc,
								id],function(err,rows)
			{
			callback(err,obj);
			});
	},
	
	getById:function (creds,id, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_id=?";
		db.execute (creds,sql,[id],function(err,rows)
			{
			callback(err, rows)
			});
	},
	getByName:function (creds,name, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_name=?";
		db.execute (creds,sql,[name],function(err,rows)
			{
			callback(err, rows)
			});
	},
	
	add:function(creds,obj,callback) {
	
		var sql = "INSERT INTO " + this.tblName + " SET ?";
		
		db.execute (creds,sql,obj, function (err,count)
			{
			if (count != undefined)
				obj.f_id = count.insertId;

			callback(err,obj)
			return;
			});		
	},
	delete:function(creds,id, callback) {
		var sql = "DELETE FROM " + this.tblName + " WHERE f_id=?";
		return db.execute(creds,sql,[id],callback);
	},
};

/*********************************************************************************
	Session database functions


**********************************************************************************/
var sqlSession = {

	tblName : defines.tblSessions,

	getAll:function (creds,callback) {
		var sql = 	"SELECT * FROM " + this.tblName +
					" ORDER BY " + 'f_id' + " " + 'ASC';
		db.execute (creds,sql,function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					rows[i].f_results = JSON.parse(rows[i].f_results);
				}
			callback(err, rows)
			});
	},
	
	getAllByUmpire:function (creds,umpire,typeid,date,callback) 
		{
		var dateSQL = sqlUtils.getDateRangeSQL(date,'f_date_startdateandtime',this.tblName);
		if (typeid == defines.sessiontype.all)
			{
			var whereSQL = " WHERE f_umpire=?";
			
			if (dateSQL != null)
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
			else
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';

			db.execute (creds,sql,[umpire],function(err,rows)
				{
				if ( (rows) && (rows.length > 0) )
					{
					for (var i = 0; i < rows.length; i++)
						rows[i].f_results = JSON.parse(rows[i].f_results);
					}
				callback(err, rows)
				});
			}
		else
			{
			var whereSQL = " WHERE f_umpire=? AND f_typeid=?";

			if (dateSQL != null)
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
			else
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';			

			db.execute (creds,sql,[umpire,typeid],function(err,rows)
				{
				if ( (rows) && (rows.length > 0) )
					{
					for (var i = 0; i < rows.length; i++)
						rows[i].f_results = JSON.parse(rows[i].f_results);
					}
				callback(err, rows)
				});
			}
	},
	getAllByOpponent:function (creds,opponent,typeid,date,callback)
		{
		var dateSQL = sqlUtils.getDateRangeSQL(date,'f_date_startdateandtime',this.tblName);

		if (typeid == defines.sessiontype.all)
			{
			var whereSQL = " WHERE f_opponent=?";
			
			if (dateSQL != null)
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
			else
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
									
			db.execute (creds,sql,[opponent],function(err,rows)
				{
				if ( (rows) && (rows.length > 0) )
					{
					for (var i = 0; i < rows.length; i++)
						rows[i].f_results = JSON.parse(rows[i].f_results);
					}
				callback(err, rows)
				});
			}
		else
			{
			var whereSQL = " WHERE f_opponent=? AND f_typeid=?";

			if (dateSQL != null)
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
			else
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';			

			db.execute (creds,sql,[opponent,typeid],function(err,rows)
				{
				if ( (rows) && (rows.length > 0) )
					{
					for (var i = 0; i < rows.length; i++)
						rows[i].f_results = JSON.parse(rows[i].f_results);
					}
				callback(err, rows)
				});
			}
	},
	
	getAllByPlayer:function (creds,playerid,typeid,date,callback) 
		{
		var dateSQL = sqlUtils.getDateRangeSQL(date,'f_date_startdateandtime',this.tblName);
		
		if (typeid == defines.sessiontype.all)
			{
			var whereSQL = " WHERE f_playerid=?";

			if (dateSQL != null)
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
			else
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';

			db.execute (creds,sql,[playerid],function(err,rows)
				{
				if ( (rows) && (rows.length > 0) )
					{
					for (var i = 0; i < rows.length; i++)
						rows[i].f_results = JSON.parse(rows[i].f_results);
					}
				callback(err, rows)
				});
			}
		else
			{
			var whereSQL = " WHERE f_playerid=? AND f_typeid=?";

			if (dateSQL != null)
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
			else
				var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';		
				
			db.execute (creds,sql,[playerid,typeid],function(err,rows)
				{
				if ( (rows) && (rows.length > 0) )
					{
					for (var i = 0; i < rows.length; i++)
						rows[i].f_results = JSON.parse(rows[i].f_results);
					}
				callback(err, rows)
				});
			}
	},
	
	getById:function (creds,id, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_id=?";
		db.execute (creds,sql,[id],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					rows[i].f_results = JSON.parse(rows[i].f_results);
				}
		
			callback(err, rows)
			});
	},
	
	add:function(creds,obj,callback) {
		obj.f_date_created = gptdt.getISODateTime();
		
		obj.f_results = JSON.stringify(obj.f_results);

		var pitches = obj.f_pitches;
		delete obj.f_pitches;

		var sql = "INSERT INTO " + this.tblName + " SET ?";
		
		db.execute (creds,sql,obj, function (err,count)
			{
			if (count != undefined)
				obj.f_id = count.insertId;

			obj.f_results = JSON.parse(obj.f_results);
			obj.f_pitches = pitches;
			
			callback(err,obj)
			return;
			});		
	},
	delete:function(creds,id, callback) 
		{
		sqlPitch.getAllBySession(creds,id,function(err,pitches) 
			{
			var controls = new sqlList.asyncControls(creds,pitches,5,
								sqlSession.callbackListNodeDeleteAllPitches)

			sqlList.processList(controls, function(err,results)
				{
				var sql = "DELETE FROM " + sqlSession.tblName + " WHERE f_id=?";
				return db.execute(creds,sql,[id],callback);
				});
			});
		},

	calculateTotals:function (pitchtype) 
		{
		if (pitchtype == undefined)
			return (pitchtype);
			
		var hlIndex = -1;
		var scIndex = -1;
		var pcIndex = -1;
		for (var j = 0; j < pitchtype.f_results.length; j++)
			{
			if (pitchtype.f_results[j].f_pc != 0)
				pcIndex = j;
			else if (pitchtype.f_results[j].f_sc != 0)
				scIndex = j;
			else if (pitchtype.f_results[j].f_hl != 0)
				hlIndex = j;
			}

		if (scIndex >= 0)
			{
			if (pitchtype.f_results[pcIndex].f_c <= 0)
				var percent = 0;
			else
				var percent = (pitchtype.f_results[scIndex].f_c / pitchtype.f_results[pcIndex].f_c) * 100;
		
			percent = gptma.mathRoundup(percent,0);
			pitchtype.f_results[scIndex].f_c = pitchtype.f_results[scIndex].f_c + ' (' + percent +  '%)';
			}
				
		if (hlIndex >= 0)
			{
			if (pitchtype.f_results[pcIndex].f_c <= 0)
				var percent = 0;
			else
				var percent = (pitchtype.f_results[hlIndex].f_c / pitchtype.f_results[pcIndex].f_c) * 100;
		
			percent = gptma.mathRoundup(percent,0);
			pitchtype.f_results[hlIndex].f_c = pitchtype.f_results[hlIndex].f_c + ' (' + percent +  '%)';
			}
			
		return(pitchtype);
		},
			
	callbackListNodeGetAllByPlayer:function (node,controls,callback) 
		{
		var typeid = controls.search.sessiontypeid;
		var playerid = node.f_id;
		var daterange = controls.search.daterange;
		var creds = controls.creds;
		sqlSession.getAllByPlayer(creds,playerid,typeid,daterange,function(err,results)
			{
			callback(err,node);
			});
		},
		
	callbackListNodeDeleteAllPitches:function (pitch,controls,callback) 
		{
		var err = '';
		var creds = controls.creds;
		sqlPitch.delete(creds,pitch.f_id,function(err,results)
			{
			});
		callback(err,pitch);
		},
		
	callbackListNodeCreateSummary:function (session,controls,callback) 
		{
		var err = '';
		
		if ( (session.f_results == undefined) || (session.f_results.length <= 0) )
			{
			callback(err,session);
			return;
			}
			
		var summary = JSON.parse(JSON.stringify(session.f_results[0]));
		summary.f_name = 'Summary';
		summary.f_typeid = 0;
		for (var j = 0; j < summary.f_results.length; j++)
			summary.f_results[j].f_c = 0;
		
		for (var i = 0; i < session.f_results.length; i++)
			{
			var pitchtype = session.f_results[i];

			for (var j = 0; j < pitchtype.f_results.length; j++)
				{
				var result = pitchtype.f_results[j];
				var summaryresult = summary.f_results[j];

				summaryresult.f_c = summaryresult.f_c + result.f_c;
				}
			}

		var pitchtyperesults = session.f_results;
		session.f_results = [];
		
		session.f_results.push(summary);
		for (var i = 0; i < pitchtyperesults.length; i++)
			session.f_results.push(pitchtyperesults[i]);
			
		for (var j = 0; j < session.f_results.length; j++)
			session.f_results[j] = sqlSession.calculateTotals(session.f_results[j]); 
			
		callback(err,session);
		},
		
	callbackListNodeSecondarySearch:function (session,controls,callback) 
		{
		var search = controls.search;
		var typeid = search.secondaryvalue;
		var sessionid = session.f_id;
		var date = search.daterange;
		var pitchtypelist = search.pitchtypelist;
		var pitchactionlist = search.pitchactionlist;
		
		var creds = controls.creds;
		
		session.f_results = [];		
		if (search.secondarysearchtypeid == defines.searchtype.batter)
			{
			session.f_results = 
					defines.initializeSessionResultSummary(pitchtypelist,pitchactionlist,session.f_typeid)

			var hlIndex = -1;
			var scIndex = -1;
			var pcIndex = -1;
			var result  = session.f_results[0];
			
			for (var j = 0; j < result.f_results.length; j++)
				{
				if (result.f_results[j].f_pc == 1)
					pcIndex = j;
				else if (result.f_results[j].f_sc == 1)
					scIndex = j;
				else if (result.f_results[j].f_hl == 1)
					hlIndex = j;
				}
			sqlPitch.getAllByBatterStanceAndSession(creds,typeid,sessionid,date,function(err,pitches)
				{
				for (var i = 0; i < pitches.length; i++)
					{
					for (var j = 0; j < session.f_results.length; j++)
						{
						var result = session.f_results[j];
						
						if (result.f_typeid == pitches[i].f_typeid)
							{
							for (k = 0; k < result.f_results.length; k++)
								{
								if (result.f_results[k].f_id == pitches[i].f_actionid)
									{
									var actiontype = result.f_results[k];
									
									if (actiontype.f_id == pitches[i].f_actionid)
										{
										actiontype.f_c++;
										result.f_results[pcIndex].f_c++;
										
										if (actiontype.f_iss > 0)
											result.f_results[scIndex].f_c++;
			
										if ( (pitches[i].f_cl != '') && (pitches[i].f_cl == pitches[i].f_hl) )
											result.f_results[hlIndex].f_c++;
											
										break;
										}
									}
								}
							}
						}
					}
		
				sqlSession.callbackListNodeCreateSummary(session,controls,function(err,result) 
					{
					callback(err,result);
					});
				});
			}
		else if (search.secondarysearchtypeid == defines.searchtype.pitchtype)
			{					
			var pitchtype = defines.initializeSessionResultPitchType(typeid,pitchactionlist,session.f_typeid)
			session.f_results.push (pitchtype);
			var hlIndex = -1;
			var scIndex = -1;
			var pcIndex = -1;
			var result = session.f_results[0];
			
			for (var j = 0; j < result.f_results.length; j++)
				{
				if (result.f_results[j].f_pc == 1)
					pcIndex = j;
				else if (result.f_results[j].f_sc == 1)
					scIndex = j;
				else if (result.f_results[j].f_hl == 1)
					hlIndex = j;
				}
			sqlPitch.getAllByPitchTypeAndSession(creds,typeid,sessionid,date,function(err,pitches)
				{
				for (var i = 0; i < pitches.length; i++)
					{
					for (var j = 0; j < session.f_results.length; j++)
						{
						var result = session.f_results[j];
						
						for (k = 0; k < result.f_results.length; k++)
							{
							if (result.f_results[k].f_id == pitches[i].f_actionid)
								{
								var actiontype = result.f_results[k];
									
								actiontype.f_c++;
								result.f_results[pcIndex].f_c++;
									
								if (actiontype.f_iss > 0)
									result.f_results[scIndex].f_c++;
			
								if ( (pitches[i].f_cl != '') && (pitches[i].f_cl == pitches[i].f_hl) )
									result.f_results[hlIndex].f_c++;
									
								break;
								}
							}
						}
					}
					
				for (var j = 0; j < session.f_results.length; j++)
					session.f_results[j] = sqlSession.calculateTotals(session.f_results[j]); 

				callback(err,session);					
				});
			}			
		else if (search.secondarysearchtypeid == defines.searchtype.pitchaction)
			{
			var pitchaction = defines.initializeSessionResultPitchType(typeid,pitchtypelist,session.f_typeid)
			session.f_results.push (pitchaction);
			var hlIndex = -1;
			var scIndex = -1;
			var pcIndex = -1;
			var result = session.f_results[0];
			
			for (var j = 0; j < result.f_results.length; j++)
				{
				if (result.f_results[j].f_pc == 1)
					pcIndex = j;
				else if (result.f_results[j].f_sc == 1)
					scIndex = j;
				else if (result.f_results[j].f_hl == 1)
					hlIndex = j;
				}

			sqlPitch.getAllByPitchActionAndSession(creds,typeid,sessionid,date,function(err,pitches)
				{
				for (var i = 0; i < pitches.length; i++)
					{
					for (var j = 0; j < session.f_results.length; j++)
						{
						var result = session.f_results[j];

						for (k = 0; k < result.f_results.length; k++)
							{
							if (result.f_results[k].f_id == pitches[i].f_typeid)
								{
								var actiontype = result.f_results[k];
									
								actiontype.f_c++;
								result.f_results[pcIndex].f_c++;
			
								if ( (pitches[i].f_cl != '') && (pitches[i].f_cl == pitches[i].f_hl) )
									result.f_results[hlIndex].f_c++;
							
								break;
								}
							}
						}
					}
					
				for (var j = 0; j < session.f_results.length; j++)
					session.f_results[j] = sqlSession.calculateTotals(session.f_results[j]); 

				callback(err,session);					
				});
			}
		},
};


/*********************************************************************************
	Pitch database functions


**********************************************************************************/
var sqlPitch = {

	tblName : defines.tblPitches,

	getAll:function (creds,callback) {
		var sql = 	"SELECT * FROM " + this.tblName +
					" ORDER BY " + 'f_id' + " " + 'ASC';
		db.execute (creds,sql,function(err,rows)
			{
			
			callback(err, rows)
			});
	},
	
	getAllBySession:function (creds,sessionid,callback) {
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_sessionid=?" +
									" ORDER BY " + 'f_id' + " " + 'ASC';
console.log(sql)			
		db.execute (creds,sql,[sessionid],function(err,rows)
			{
console.log(rows)
			callback(err, rows)
			});
	},
		
	getAllByPitchType:function (creds,typeid,date,callback)
		{
		var dateSQL = sqlUtils.getDateRangeSQL(date,'f_date_created ',this.tblName);
		var whereSQL = " WHERE f_typeid=?";
		
		if (dateSQL != null)
			var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
		else
			var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';	
			
		db.execute (creds,sql,[typeid],function(err,rows)
			{

			callback(err, rows)
			});
	},
	getAllByPitchTypeAndSession:function (creds,typeid,sessionid,date,callback)
		{
		var dateSQL = sqlUtils.getDateRangeSQL(date,'f_date_created',this.tblName);
		var whereSQL = " WHERE f_typeid=? AND f_sessionid=?";
		
		if (dateSQL != null)
			var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
		else
			var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';	
										
		db.execute (creds,sql,[typeid,sessionid],function(err,rows)
			{
			callback(err, rows)
			});
	},
	
	getAllByPitchAction:function (creds,actionid,callback) {
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_actionid=?" +
									" ORDER BY " + 'f_id' + " " + 'ASC';				
		db.execute (creds,sql,[actionid],function(err,rows)
			{
			callback(err, rows)
			});
	},

	getAllByPitchActionAndSession:function (creds,actionid,sessionid,date,callback)
		{
		var dateSQL = sqlUtils.getDateRangeSQL(date,'f_date_created',this.tblName);
		var whereSQL = " WHERE f_actionid=? AND f_sessionid=?";
		
		if (dateSQL != null)
			var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL + " AND " + dateSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';
		else
			var sql = 	"SELECT * FROM " + this.tblName +
							whereSQL +
							" ORDER BY " + 'f_id' + " " + 'ASC';	
		
		db.execute (creds,sql,[actionid,sessionid],function(err,rows)
			{		
			callback(err, rows)
			});
	},
	
	getAllByBatterStanceAction:function (creds,stance,callback) {
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_bstance=?" +
									" ORDER BY " + 'f_id' + " " + 'ASC';				
		db.execute (creds,sql,[stance],function(err,rows)
			{
			
			callback(err, rows)
			});
	},

	getAllByBatterStanceAndSession:function (creds,stance,sessionid,date,callback)
		{
		var dateSQL = sqlUtils.getDateRangeSQL(date,'f_date_created',this.tblName);
		
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_bstance=? AND f_sessionid=?" +
									" ORDER BY " + 'f_id' + " " + 'ASC';				
		db.execute (creds,sql,[stance,sessionid],function(err,rows)
			{
			
			callback(err, rows)
			});
	},
	
	getById:function (creds,id, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_id=?";
		db.execute (creds,sql,[id],function(err,rows)
			{
		
			callback(err, rows)
			});
	},
	
	add:function(creds,obj,callback) {
		obj.f_date_created = gptdt.getISODateTime();
		
		var sql = "INSERT INTO " + this.tblName + " SET ?";
		
		db.execute (creds,sql,obj, function (err,count)
			{
			if (count != undefined)
				obj.f_id = count.insertId;

			callback(err,obj)
			return;
			});		
	},
	delete:function(creds,id, callback) {
		var sql = "DELETE FROM " + this.tblName + " WHERE f_id=?";
		return db.execute(creds,sql,[id],callback);
	},
};

/*********************************************************************************
	processList functions


**********************************************************************************/
var sqlList = {
	
	asyncControls:function(creds,list,threads,callback)
		{
		this.processList = list;
		this.processResults = [];
		this.iMaxNumThreads = threads;
		this.iNumRunning = 0;
		this.processNodeCallback = callback;
		
		this.creds = creds;
		},
		
	processNode:function (node,cntls,callback)
		{
		//gpthp.writeDebug('DEBUG:processList Node...Start');
		cntls.processNodeCallback(node,cntls,function (err,result)
			{
			//gpthp.writeDebug('DEBUG:processList Node...Exit');
			cntls.processResults.push(result);
			callback(err, result);
			});
		},
			
	processList:function (cntls, callback)
		{	
		if ( (cntls.processList == undefined) || (cntls.processList.length <= 0) )
			{
			//gpthp.writeDebug('DEBUG:processList...Exit -    Empty List');
			callback(null,cntls.processResults);
			return;
			}
			
		var iWaitingForResults = true;
		var intervalProcess = setInterval (function ()
			{
			if (iWaitingForResults == true)
				{
				if ( (cntls.processList) && (cntls.processList.length > 0) )
					{
					if (cntls.iNumRunning < cntls.iMaxNumThreads)
						{
						cntls.iNumRunning++;
						var node = cntls.processList.shift();	
						sqlList.processNode(node, cntls, function(err, node)
							{
							cntls.iNumRunning--;
							
							if (cntls.processList.length > 0)
								sqlList.processList(cntls,callback);

							else if (cntls.iNumRunning <= 0)
								{
								//gpthp.writeDebug('DEBUG:processList...Exit');
								callback(null,cntls.processResults);
								iWaitingForResults = false;
								clearInterval (intervalProcess);
								return;
								}
							});
						}				
					}
				}
			}, 100);	
		},	
	};				
		


module.exports={sqlUtils,sqlList,sqlSystem,sqlUser,sqlSession,sqlTeam,sqlPitch,sqlPitchType,
				sqlPitchAction};

	
