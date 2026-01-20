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

	objAsyncControls:function(creds,list,processNodeFunc)
		{
		this.processNodeFunc = processNodeFunc;
		this.processList = list;
		this.iMaxNumThreads = 5;
		this.iNumRunning = 0;
		this.getfull = false;
		this.processResults = [];
		this.creds = creds;
		},

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
	
	getDateRangeSQL:function(params)
		{
	
		var dateField = params.dateField;
		var dateRange = params.dateRange;
		var dateValue = params.dateValue;
		var tblName   = params.tblName;
		
		var sql = '';
		// get today in iso time
		var dateNow = gptdt.getISODateTime();
		var dateNow = new Date(dateNow);

		if ( (dateRange == undefined) || (dateRange.length <= 0) )
			sql = null;
		else if (dateRange == 'monday_week')
			{
			var tmpdate = new Date(dateValue);
			tmpdate.setDate(tmpdate.getDate() + 1);
			
			var wkdays = gptdt.getWeekdays(tmpdate)
			var monday = wkdays[0].f_date_record;
			var sunday = wkdays[6].f_date_record;

			sql = tblName + "." + dateField + 
							" BETWEEN '" + gptdt.getISOSearchDateTime(monday) + "'" +
							" AND '" + gptdt.getISOSearchDateTime(sunday) + "'";
			}
		else if (dateRange == 'l1days')
			{
			var day = dateNow.getDate();
			var month = dateNow.getMonth();
			var year = dateNow.getFullYear();
			var newdate = new Date(year,month,day);

			sql = tblName + "." + dateField + " >= '" + gptdt.getISOSearchDateTime(newdate) + "'";
			}
		else if (dateRange == 'curweek')
			{
			var wkdays = gptdt.getWeekdays(dateNow)
			var monday = wkdays[0].f_date_record;
			var sunday = wkdays[6].f_date_record;
			sql = tblName + "." + dateField + 
							" BETWEEN '" + gptdt.getISOSearchDateTime(monday) + "'" +
							" AND '" + gptdt.getISOSearchDateTime(sunday) + "'";
			}
		else if (dateRange == 'lastweek')
			{
			dateNow.setDate(dateNow.getDate() - 7);

			var wkdays = gptdt.getWeekdays(dateNow);

			var monday = wkdays[0].f_date_record;
			var sunday = wkdays[6].f_date_record;

			sql = tblName + "." + dateField + 
							" BETWEEN '" + gptdt.getISOSearchDateTime(monday) + "'" +
							" AND '" + gptdt.getISOSearchDateTime(sunday) + "'";
			}
		else if (dateRange == 'l7days')
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
		else if (dateRange == 'l30days')
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
		else if (dateRange == 'l60days')
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 60 DAY)";
		else if (dateRange == 'l90days')
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
		else if (dateRange == 'l180days')
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 180 DAY)";
		else if (dateRange == 'l240days')
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 240 DAY)";
		else if (dateRange == 'l365days')
			sql = tblName + "." + dateField + " >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
		else if (dateRange == 'g12hours')
			sql = tblName + "." + dateField + " <= DATE_SUB(NOW(), INTERVAL 12 HOUR)";
		else if (dateRange == 'g1days')
			sql = tblName + "." + dateField + " <= DATE_SUB(NOW(), INTERVAL 1 DAY)";
		else if (dateRange == 'g7days')
			sql = tblName + "." + dateField + " <= DATE_SUB(NOW(), INTERVAL 7 DAY)";
		else if (dateRange == 'g30days')
			sql = tblName + "." + dateField + " <= DATE_SUB(NOW(), INTERVAL 30 DAY)";
		else if (dateRange == 'g60days')
			sql = tblName + "." + dateField + " <= DATE_SUB(NOW(), INTERVAL 60 DAY)";
		else if (dateRange == 'g90days')
			sql = tblName + "." + dateField + " <= DATE_SUB(NOW(), INTERVAL 90 DAY)";
		else if (dateRange == 'g180days')
			sql = tblName + "." + dateField + " <= DATE_SUB(NOW(), INTERVAL 180 DAY)";
		else if (dateRange == 'g365days')
			sql = tblName + "." + dateField + " <= DATE_SUB(NOW(), INTERVAL 365 DAY)";
		else if (dateRange == 'ytd')
			{
			var strBeginDay = dateNow.getFullYear() + '-01-01' 
			sql = tblName + "." + dateField + " >= '" + strBeginDay + "'";
			}
		else if (dateRange == 'lastyear')
			{
			var strBeginDay = (dateNow.getFullYear() - 1) + '-01-01';
			var strEndDay = dateNow.getFullYear() + '-01-01' 
			sql = tblName + "." + dateField +
					" BETWEEN ' " + strBeginDay + "' AND '" + strEndDay + "'";
			}
		else if (dateRange == 'all')
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
	delete:function(creds,id, callback) {
		var sql = "DELETE FROM " + this.tblName + " WHERE f_id=?";
		return db.execute(creds,sql,[id],callback);
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
		var sql = "UPDATE " + this.tblName + " SET f_name=?,f_isstrike=?,f_strikecount=?,f_pitchccount=?" +
						" WHERE f_id=?";
		db.execute(creds,sql,[obj.f_name,
								obj.f_isstrike,
								obj.f_strikecount,
								obj.f_pitchcount,
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
					rows[i].f_pitchtyperesults = JSON.parse(rows[i].f_pitchtyperesults);
				}
			callback(err, rows)
			});
	},
	
	getAllByUmpire:function (creds,umpire,callback) {
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_umpire=?" +
									" ORDER BY " + 'f_id' + " " + 'ASC';				
		db.execute (creds,sql,[umpire],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					rows[i].f_pitchtyperesults = JSON.parse(rows[i].f_pitchtyperesults);
				}
			callback(err, rows)
			});
	},
	getAllByOpponent:function (creds,opponent,callback) {
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_opponent=?" +
									" ORDER BY " + 'f_id' + " " + 'ASC';				
		db.execute (creds,sql,[opponent],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					rows[i].f_pitchtyperesults = JSON.parse(rows[i].f_pitchtyperesults);
				}
			callback(err, rows)
			});
	},
	
	getById:function (creds,id, callback) {
		var sql = "SELECT * FROM " + this.tblName + " WHERE f_id=?";
		db.execute (creds,sql,[id],function(err,rows)
			{
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					rows[i].f_pitchtyperesults = JSON.parse(rows[i].f_pitchtyperesults);
				}
		
			callback(err, rows)
			});
	},
	
	add:function(creds,obj,callback) {
		obj.f_date_created = gptdt.getISODateTime();
		obj.f_date_lastmodified = gptdt.getISODateTime();
		
		obj.f_pitchtyperesults = JSON.stringify(obj.f_pitchtyperesults);
		var pitches = obj.f_pitches;
		delete obj.f_pitches;
		
		var sql = "INSERT INTO " + this.tblName + " SET ?";
		
		db.execute (creds,sql,obj, function (err,count)
			{
			if (count != undefined)
				obj.f_id = count.insertId;

			obj.f_pitchtyperesults = JSON.parse(obj.f_pitchtyperesults);
			obj.f_pitches = pitches;
			
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
		db.execute (creds,sql,[sessionid],function(err,rows)
			{

			callback(err, rows)
			});
	},
		
	getAllByPitchType:function (creds,typeid,callback) {
		var sql = "SELECT * FROM " + this.tblName + 
									" WHERE f_typeid=?" +
									" ORDER BY " + 'f_id' + " " + 'ASC';				
		db.execute (creds,sql,[typeid],function(err,rows)
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
			if ( (rows) && (rows.length > 0) )
				{
				for (var i = 0; i < rows.length; i++)
					rows[i].f_pitchtyperesults = JSON.parse(rows[i].f_pitchtyperesults);
				}
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
		obj.f_date_lastmodified = gptdt.getISODateTime();
		
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
var pList = {
	
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
		cntls.processNodeCallback(cntls.creds,node,cntls,function (err,result)
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
						pList.processNode(node, cntls, function(err, node)
							{
							cntls.iNumRunning--;
							
							if (cntls.processList.length > 0)
								pList.processList(cntls,callback);

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
		


module.exports={sqlUtils,sqlSystem,sqlUser,sqlSession,sqlTeam,sqlPitch,sqlPitchType,sqlPitchAction};

	
