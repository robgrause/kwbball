/*********************************************************************************
	Defines Functions


**********************************************************************************/
if (version == undefined)
    var version = require ('./gptVersion');
    

var defines =
	{
	tblOrganization : 't_organization',
	tblUsers : 't_users',
	tblSessions : 't_session',
	tblPitches: 't_pitch',
	tblTeams: 't_team',
	tblPitchTypes: 't_pitchtype',
	tblPitchActions: 't_pitchaction',
	tblSystem : 't_system',
	
	monthAbbrevations : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
	dayAbbrevations : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	dayNames : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
	monthNames : [	"January","February","March","April","May","June","July","August",
					"September","October","November","December"],
					
	STR_LENGTH_NAME : 50,
	STR_LENGTH_TITLE : 100,
	STR_LENGTH_DESCRIPTION : 350,
	STR_LENGTH_NOTES : 255,
	STR_LENGTH_LINK : 255,
	STR_LENGTH_ORIGINAL_FILENAME : 65,
	STR_LENGTH_SYSTEM_FILENAME : 18,
	
	date_current : {
					current: -1, // used to specify current day/month/year	
					previous: -2,
					str : 	{
							current : 'Current',
							previous : 'Previous'
							}
					},
				
	ORGANIZATION_NAME : 'Keaton Weaver Baseball',
	DATABASE_NAME : 'kwbballdb',
	
	BACKGROUND_IMAGE_FILE : 'KWBBallBackground.jpg',
	BULLPEN_IMAGE_FILE : 'KWBBallBullpen.png',
	GAME_IMAGE_FILE : 'KWBBallGame.png',
	SCRIMMAGE_IMAGE_FILE : 'KWBBallScrimmage.jpg',
	
	SYSYEM_SETTINGS_OBJECT : 'system_settings',
	
	IMAGE_DIRECTORY : 'data/images',
	IMAGE_DEFAULTS_DIRECTORY : 'data/images/defaults',
	INCLUDES_DIRECTORY : 'includes',
	TMPUPLOAD_DIRECTORY : 'public/tmp',
	
	USERS_FILE: 'data/datafiles/Users.json',
	PROTECTED_USERS_FILE: 'data/datafiles/ProtectedUsers.json',
	PITCHTYPES_FILE: 'data/datafiles/PitchTypes.json',
	PITCHACTIONS_FILE: 'data/datafiles/PitchActions.json',
	TEAMS_FILE: 'data/datafiles/Teams.json',
	
	VAPID_PUBLIC_KEY : 'BMNQvN7vyTHwFepMa-O9mwTBN_q2ndifCBjq977r973o7fye5nXuIbkJbZz7mFh9q4QhSfm6KcaqQi43XgmUS-k',
	VAPID_PRIVATE_KEY : '1LNrpgbj3RyeaDL5QTEavwYtkaG3J4Rz8sszNFtxBkg',
			
	urlKWBBALL:function() {return(version.urlKWBBALL())},

	urlKWBBALLData:function () {return(defines.urlKWBBALL() + 'data/');},
	urlKWBBALLDataImage:function (filename) {return(defines.urlKWBBALL() + 'images/' + filename);},
	urlApiGet:function () 
		{
		return(defines.urlKWBBALL() + "api"); 
		},
	urlApiGetList:function () {return(defines.urlApiGet() + '/getlist');},
	urlGPTTmp:function (file) {	return(defines.urlKWBBALL() + 'tmp/' + file);	},
		
	usertype :
		{
		guest : 0,
		all : 5,
		player: 20,
		coach: 70,
		admin: 100,
		
		str :
			{
			guest : 'Guest',
			all : 'All',
			player : 'Player',
			coach : 'Coach',
			admin : 'System Administrator',
			}
		},
	
	sessiontype :
		{
		bullpen : 0,
		scrimmage : 1,
		game: 2,
		all: 5,
		str :
			{
			bullpen : 'Bullpen',
			scrimmage: 'Scrimmage',
			game : 'Game',
			all : 'All'
			}
		},
		
	leftright :
		{
		right : 0,
		left : 1,
		both : 2,
		str :
			{
			right : 'Right',
			left: 'Left',
			both : 'Switch',
			}
		},
		
	objCredentials:function(orgObj)
		{
		if (orgObj != null)
			{
			this.f_organization_name = orgObj.f_organization_name;
			this.f_user_name = '';
			this.f_database_name = orgObj.f_database_name;
			}
		else
			{
			this.f_organization_name = '';
			this.f_user_name = '';
			this.f_database_name = '';
			}
		
		this.f_localtimezone = '';
		
		this.f_loginUser = undefined;
		},

	objFileUpload:function()
		{
		this.f_original_filename = '';
		this.f_system_filename = '';
		this.f_fileext = ''; // used for blob upload
		this.f_url = '';
		this.f_uploaddirectory = '';
		this.f_obj = null;
		},
		
	objListParams:function(apiCall)
		{
		this.apiCall = apiCall;
		this.status = "";
		this.notEqual = false;
		this.f_id = '';
		this.tblName = '';
		this.fieldName = '';
		this.listId = '';
		this.value = '';
		this.op = '';
		this.orderField ='';
		this.orderDirection = 'ASC';
		this.dateField ='f_date_created';
		this.dateRange = 'all';
		this.dateValue = '';
		this.secondField = '';
		this.secondValue = '';
		this.secondOp = '';
		
		this.month = '';
		this.year = '';
		},

	objSystem:function()
		{			
		this.f_name = defines.SYSYEM_SETTINGS_OBJECT;
		this.f_date_created = null;
		this.f_date_lastmodified = null;
		
		this.f_original_backgroundimage = defines.BACKGROUND_IMAGE_FILE;
		this.f_opacity_backgroundimage = 0.25;
		this.f_color_backgroundimage = '#FFFFFF';
		
		this.f_original_bullpenimage = defines.BULLPEN_IMAGE_FILE;
		this.f_opacity_bullpenimage = 0.25;
		this.f_color_bullpenimage = '#FFFFFF';
	
		this.f_original_scrimmageimage = defines.SCRIMMAGE_IMAGE_FILE;
		this.f_opacity_scrimmageimage = 0.25;
		this.f_color_scrimmageimage = '#FFFFFF';
		
		this.f_original_gameimage = defines.GAME_IMAGE_FILE;
		this.f_opacity_gameimage = 0.25;
		this.f_color_gameimage = '#FFFFFF';
		
		this.f_clientrefresh = 20;
		},

	objUser:function()
		{			
		this.f_id = 0;
		this.f_date_created = null;
		this.f_date_lastmodified = null;
		this.f_typeid = defines.usertype.player;
		
		this.f_status = defines.status.active;
		this.f_fname = '';
		this.f_lname = '';
		this.f_classyear = 2027;
		this.f_teamid = 0;  // 'Varsity' / JV / Freshmen
		this.f_throw = defines.leftright.right;
		this.f_bat = defines.leftright.right;
		this.f_pitchids = [];
		this.f_notes = '';
		},

	objPitchResults:function()
		{
		this.f_typeid = 0;
		
		this.f_results = [];
		},

	initializeSessionResultPitchType:function(id,list,sessiontypeid)
		{
		var result = new defines.objPitchResults();
		result.f_typeid = id;
			
		result.f_results = [];
			
		var actiontype = new defines.objPitchAction()
		actiontype.f_id = 0;
		actiontype.f_name = 'Pitch Count';
		actiontype.f_pc = 1;
		actiontype.f_iss = 0;
		actiontype.f_sc = 0;
		actiontype.f_c = 0;
		actiontype.f_pct = 0;
		actiontype.f_hl = 0;
		result.f_results.push(actiontype);

		if (sessiontypeid != defines.sessiontype.bullpen)
			{
			var actiontype = new defines.objPitchAction()
			actiontype.f_id = 0;
			actiontype.f_name = 'Strikes';
			actiontype.f_pc = 0;
			actiontype.f_iss = 0;
			actiontype.f_sc = 1;
			actiontype.f_c = 0;
			actiontype.f_pct = 1;
			actiontype.f_hl = 0;
			result.f_results.push(actiontype);
			}
				
		var actiontype = new defines.objPitchAction()
		actiontype.f_id = 0;
		actiontype.f_name = 'Hit Location';
		actiontype.f_pc = 0;
		actiontype.f_iss = 0;
		actiontype.f_sc = 0;
		actiontype.f_c = 0;
		actiontype.f_hl = 1;
		actiontype.f_pct = 1;
		result.f_results.push(actiontype);
			
		if (sessiontypeid != defines.sessiontype.bullpen)
			{
			for(var j = 0; j < list.length; j++)
				{
				var actiontype = JSON.parse(JSON.stringify(list[j]));

				actiontype.f_c = 0;
				actiontype.f_pct = 0;
				actiontype.f_hl = 0;

				result.f_results.push(actiontype)
				}
			}
		return (result);
		},
		
	initializeSessionResultSummary:function(pitchtypelist,actiontypelist,sessiontypeid)
		{
		var pitchresults = [];

		for(var i = 0; i < pitchtypelist.length; i++)
			{
			var result = 
				defines.initializeSessionResultPitchType(pitchtypelist[i].f_id,actiontypelist,sessiontypeid)

			pitchresults.push(result);
			}
		return (pitchresults);
		},

		
	objSession:function(typeid)
		{			
		this.f_id = 0;
		this.f_playerid = 0;
		
		if (typeid != undefined)
			this.f_typeid = typeid;
		else
			this.f_typeid = defines.sessiontype.bullpen;
		
		this.f_date_created = null;
		this.f_date_startdateandtime = null;
		this.f_duration = 0;
		
		this.f_status = defines.status.active;

		this.f_umpire = '';
		this.f_opponent = '';
		
		this.f_notes = '';
		
		this.f_results = []; // array of objPitchResults
		this.f_pitches = []; // array of pitches
		},
		
	objPitch:function()
		{			
		this.f_id = 0;
		this.f_playerid = 0;
		this.f_sessionid = 0;
		this.f_typeid = 0; // 4seam / 2seam / curve / slider / change 
		this.f_actionid = 0; // 0 - ball, 1 strike
		
		this.f_date_created = null;

		this.f_cl = '';
		this.f_hl = '';
		this.f_vel = 0;
		this.f_inning = 0;
		
		this.f_bstance = defines.leftright.right;
		
		this.f_status = defines.status.active;

		this.f_notes = '';
		},
	
	objTeam:function()
		{			
		this.f_id = 0;
	
		this.f_name = '';
		},
	
	objPitchType:function()
		{			
		this.f_id = 0;
	
		this.f_name = '';
		},
	objPitchAction:function()
		{			
		this.f_id = 0;
		this.f_iss = 0;
		this.f_sc = 0;
		this.f_pc = 0;
	
		this.f_name = '';
		},

	status :
		{
		inactive : 0,
		active : 1,
		all : 5,
		str :
			{
			inactive : 'Inactive',
			active : 'Active',
			all : 'All'
			}
		},
	
	searchtype :
		{
		player : 0,
		classyear : 1,
		team : 2,
		umpire:3,
		opponent:4,
		batter:5,
		pitchtype:6,
		pitchaction:7,
		str :
			{
			player : 'Player',
			classyear : 'Class',
			team : 'Team',
			umpire: 'Umpire',
			opponent:'Opponent',
			batter: 'Batter Stance',
			pitchtype: 'Pitch Type',
			pitchaction: 'Pitch Action'
			}
		},
	
	daterange :
		{
		week: 0,
		month : 1,
		season : 2,
		career:3,
		all:4,
		str :
			{
			week : 'Week',
			month : 'Month',
			season : 'Season',
			career: 'Career',
			all: 'All',
			}
		},
	urlBase64ToUint8Array:function(base64String) 
		{
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, '+')
          .replace(/_/g, '/');
      
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
      
        for (let i = 0; i < rawData.length; ++i) 
			{
			outputArray[i] = rawData.charCodeAt(i);
			}
        return outputArray;
		},
			
	convertISODateToLocal:function (date) 
		{
		// assume date passed in is ISO FORMAT
		if (date == undefined)
			return ('');

		var testdate = Date.parse(date);
		if (isNaN(testdate) == true)
			return('');
			
		date = new Date(testdate);
		
		if ( (date.getHours() != 0) || (date.getMinutes() != 0) )
			{
			var timeoffset = date.getTimezoneOffset() * 60 * 1000;
			date = new Date (date - timeoffset);
			}
			
		return(date);
		},
	
	uppercaseFirstLetter:function(str)
		{
		var words = str.toLowerCase().split(' ');
		
		for (var i = 0; i < words.length; i++) 
			{
			words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
			}
		return words.join(' ');
		},
		
	getPropertyDisplayName:function(field,tblName)
		{
		var display = '';
		
		if (field == 'f_id')
			display = 'Id';
		else if (field == 'f_name')
			display = 'Name';
		else if ( (field == 'f_fname') || (field == 'fname') )
			display = 'First Name';
		else if ( (field == 'f_lname') || (field == 'lname') )
			display = 'Last Name';
		else
			{
			var strTmp = field;
			var strFirst2 = strTmp.slice(0,2)
		
			if (strFirst2 == 'f_')
				strTmp = field.slice(2);
			
			display = strTmp.replace(/_/g,' ');
			
			display = defines.uppercaseFirstLetter(display);
			}
		
		return (display);
		},
		
	getPropertyListByReportType:function(type)
		{
		var fields = [];
		if (type == defines.reporttype.user)
			{
			fields = ['f_date_created','f_date_lastlogin','f_date_startdate','f_date_birthday',
						'f_fname','f_lname','f_oname','f_programtype','f_programnumber','f_address1','f_address2','f_city',
						'f_state','f_zipcode','f_homephone','f_mobilephone','f_econtactname','f_econtactphone',
						'f_email','f_usertype'];
			}
		else if (type == defines.reporttype.search)
			{
				
			}
			
		return(fields);
		},
};


if (typeof (module) !== 'undefined' && module.exports) 
	{
    module.exports = defines;
    };
