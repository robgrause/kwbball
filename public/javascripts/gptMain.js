var gptmain = 
	{
	waitingFlag : false,
	version : version.version,
	
	serviceworkerRegistration : null,

	cmdBackIds : [],
	
	loginUser : undefined,
	selectedItem: undefined,
	activeSystem : undefined,
	playerList : 	[],
	coachList : 	[],
	pitchtypeList : [],
	pitchactionList: [],
	teamList:[],
	classyearList: [],
	batterList: [ 	{'f_name':defines.leftright.str.right,'f_id':defines.leftright.right},
					{'f_name':defines.leftright.str.left,'f_id':defines.leftright.left}
					],
	sessionList: [
					{'f_name':defines.sessiontype.str.bullpen,'f_id':defines.sessiontype.bullpen},
					{'f_name':defines.sessiontype.str.scrimmage,'f_id':defines.sessiontype.scrimmage},
					{'f_name':defines.sessiontype.str.game,'f_id':defines.sessiontype.game},
				],
	statsearchList : [
					{'f_name':defines.searchtype.str.player, 'f_id':defines.searchtype.player},
					{'f_name':defines.searchtype.str.classyear, 'f_id':defines.searchtype.classyear},
					{'f_name':defines.searchtype.str.team, 'f_id':defines.searchtype.team},
					{'f_name':defines.searchtype.str.umpire, 'f_id':defines.searchtype.umpire},
					{'f_name':defines.searchtype.str.opponent, 'f_id':defines.searchtype.opponent},
					{'f_name':defines.searchtype.str.batter, 'f_id':defines.searchtype.batter},
					{'f_name':defines.searchtype.str.pitchtype, 'f_id':defines.searchtype.pitchtype},
					{'f_name':defines.searchtype.str.pitchaction, 'f_id':defines.searchtype.pitchaction}
					],
					
	objMainCmds:function()
		{			
		this.f_callbackSearch = null;
		this.f_callbackNew = null;
		this.f_callbackEdit = null;
		this.f_callbackSave = null;
		this.f_callbackDelete = null;
		this.f_callbackProcess = null;
		this.f_callbackPrint = null;
		this.f_callbackBack = null;
		this.f_showDelete = false;
		this.f_showSubmit = false;
		
		this.f_processLabel =  '';
		},
		
	maincmds : null,
	
	intervalSessionLengthId: 0,
	sessionlengthInSeconds:0,
	sessionlengthStartTime:0,
	startSessionLengthInterval:function(refreshrate) // specified in seconds
		{
		if ( (refreshrate == undefined) || (refreshrate <= 0) )
			var refreshrate = 10;
			
		gptmain.sessionlengthStartTime = new Date();
		var intervalTime = refreshrate; // rate in minutes
		gptmain.stopSessionLengthInterval();
		gptmain.intervalSessionLengthId = 
			setInterval('gptmain.processSessionLengthIntervalFunc()', intervalTime * 1000);
		},
		
	stopSessionLengthInterval:function()
		{
		if (gptmain.intervalSessionLengthId > 0)
			clearInterval(gptmain.intervalSessionLengthId);

		gptmain.intervalSessionLengthId= 0;
		},
	
	processSessionLengthIntervalFunc:function()
		{
		var currentTime= new Date();
		
		// calculated in millseconds
		var elapsed = gptdt.formatElapsedTime( (currentTime - gptmain.sessionlengthStartTime));

		$('#labelSessionLengthId').text('Session:' + elapsed);	
		},
	browserResize:function()
		{
		//Set content widow top to be bottom of top menu
		gptmain.setMainContentLocation();
		
		// this code resizes table column headers
		$($.fn.dataTable.tables(true)).DataTable().columns.adjust().draw();
		
		gptmain.setPitchView();
		},
		
	setMainContentLocation:function ()
		{
		var topMenu = document.getElementById('idMainTopMenu').getBoundingClientRect();
		var bottomMenu = document.getElementById('idMainBottomMenu').getBoundingClientRect();
		var screenHeight = document.documentElement.offsetHeight;
		var screenWidth = document.documentElement.offsetWidth;
		
		// re-position main conteny div
		var elem = document.getElementById('idMainCmdContent');

		var wdPad = 0;
		var htPad = 0;
		var newTop = topMenu.bottom + htPad;
		var newBottom = bottomMenu.top - htPad;

		elem.style.position = "absolute";
		elem.style.top = newTop + 'px';
		elem.style.bottom = newBottom + 'px';
		elem.style.height = screenHeight - newTop - (screenHeight - newBottom) + 'px';
		
		elem.style.left = wdPad + 'px';
		elem.style.right = (screenWidth - wdPad) + 'px';
		elem.style.width = (screenWidth - (2 * wdPad)) + 'px';
		},

	setPitchView:function ()
		{
		var screendims =
			[
			{'min':0 ,   'max':500, 'dataflex': '50%', 'viewflex':'50%'},
			{'min':501 , 'max':600, 'dataflex': '60%', 'viewflex':'40%'},
			{'min':601,  'max':700, 'dataflex': '70%', 'viewflex':'30%'},
			{'min':701 , 'max':800, 'dataflex': '70%', 'viewflex':'30%'},
			{'min':801 , 'max':900, 'dataflex': '70%', 'viewflex':'30%'},
			{'min':901 , 'max':1000, 'dataflex': '70%', 'viewflex':'30%'},
			{'min':1001 , 'max':2000, 'dataflex':'70%', 'viewflex':'30%'},
			]
						
		var dataElem = document.getElementById('divPitchDataId');
		var viewElem = document.getElementById('divPitchViewId');

		var screenHeight = document.documentElement.clientHeight;
		var screenWidth = document.documentElement.clientWidth;

		for (var i = 0; i < screendims.length; i++)
			{
			if ( (screenWidth >= screendims[i].min) && (screenWidth  <= screendims[i].max) )
				{
				dataElem.style.flex = '0 0 ' +  screendims[i].dataflex;
				viewElem.style.flex = '0 0 ' +  screendims[i].viewflex;
				break;
				}
			}
		return;
		},

	setOnlineStatus:function(online)
		{
		$('#idVersion').text(version.version);
		
		$('#idVersion').css('font-weight','bold');
		
		if (online)
			$('#idVersion').css('color','#32CD32');
		else
			$('#idVersion').css('color','red');
		},

	online:function()
		{
		gptmain.setOnlineStatus(true)
		gptcomm.processLocalDBUpload()

		kwbball.buildBottomMenu(gptmain.loginUser.f_typeid);
		},
	offline:function()
		{
		gptmain.setOnlineStatus(false);
		
		kwbball.buildBottomMenu(gptmain.loginUser.f_typeid);
		},
	
	setImage:function(elemId,imagefile,opacity,color,scrFlag)
		{
		if ( (imagefile == undefined)|| (imagefile.length <= 0) )
			{
			gptut.setShowState(elemId, false);
			return;
			}
	
		var elem = document.getElementById(elemId);

		if (scrFlag == true)
			{
			var urlImage = defines.urlKWBBALLDataImage(imagefile);

			if(elem)
				elem.src = urlImage;
				
			return;
			}
		else
			{
			if (opacity > 1)
				opacity = opacity / 100.0;

			var urlBackground = "url('" + defines.urlKWBBALLDataImage (imagefile) + "')";
			var usecolor = '222,197,197';

			if (color)
				{
				var tmpColor = gptma.hexToRgb(color);
				usecolor= tmpColor.red + ',' + tmpColor.green + ',' + tmpColor.blue;
				}

			var gradStr = 'linear-gradient(rgba(' + usecolor + ',' + opacity + '), rgba(' + usecolor + ',' + opacity + ')),';
			 
			if(elem)
				{
				elem.style.backgroundImage = gradStr + urlBackground;
				elem.style.backgroundColor = 'rgba(' + usecolor + ',' + opacity + ')';
				}
			}
		},

	waitToComplete:function(callback,flag)
		{
		var cnt = 0;
		var cntMax = 500;
		
		var timeout = modal.displaySpinner('modalSpinnerParent',true);
			
		var timeOutId = setInterval(function () 
			{
			cnt++;
			// test this value to determine system get is back
			if ( (gptmain.waitingFlag == false) || (cnt > cntMax) )
				{
				clearInterval(timeOutId);

				if (cnt > cntMax)
					{
					// display server error msg	
					}
				else
					{
					if (callback)
						callback()
					}
					
				modal.displaySpinner('modalSpinnerParent',false);
				return;
				}

			}, 100);
		},

	getStartupData:function(callback)
		{
		console.log('Processing startupdata');
		
		var obj = {};
		gptmain.waitingFlag = true;
		gptcomm.processServerApi('startup', null, function(obj,apiCmd)
			{
			if (obj.f_system != undefined)
				{
				gptmain.activeSystem =gptut.copyObject(obj.f_system);
				gptindb.writeToDB(gptindb.dbobj_system,gptmain.activeSystem);
			
				delete obj.f_system;
				}
				
			gptmain.pitchtypeList = obj.f_pitchtypelist;
			gptmain.pitchactionList = obj.f_pitchactionlist;
			gptmain.teamList = obj.f_teamlist;
			gptmain.playerList = obj.f_playerlist;
			gptmain.coachList = obj.f_coachlist;
			gptmain.classyearList = obj.f_classyearlist;
			
			gptindb.writeToDB(gptindb.dbobj_startup,obj);

			// always check to make sure everything is uploaded
			gptcomm.processLocalDBUpload();
		
			gptmain.waitingFlag = false;
			});

		gptmain.waitToComplete(callback);
		},
	
	registerCmds:function(cmds)
		{
		if (cmds == undefined)
			gptmain.maincmds = new gptmain.objMainCmds();
		else
			gptmain.maincmds = cmds;

		gptut.setDivShowState('idMainCommands',false,true);
		gptut.setShowState('idMainCommands', true);
			
		gptut.setShowState('cmdMainSearch', (gptmain.maincmds.f_callbackSearch != undefined));
		gptut.setShowState('cmdMainNew', (gptmain.maincmds.f_callbackNew!= undefined));
		gptut.setShowState('cmdMainEdit', (gptmain.maincmds.f_callbackEdit!= undefined));
		gptut.setShowState('cmdMainSave', (gptmain.maincmds.f_callbackSave != undefined));
		
		if (gptmain.maincmds.f_callbackBack != undefined)
			gptut.setShowState('cmdMainBack', true);
		
		gptut.setShowState('cmdMainDelete', 
									( (gptmain.maincmds.f_callbackDelete != undefined) && 
										(gptmain.maincmds.f_showDelete == true) ) );
		gptut.setShowState('cmdMainSubmit', (gptmain.maincmds.f_showSubmit == true) );
		gptut.setShowState('cmdMainProcess', (gptmain.maincmds.f_callbackProcess != undefined));
		
		if (gptmain.maincmds.f_processLabel != '')
			document.getElementById ('cmdMainProcess').innerHTML = gptmain.maincmds.f_processLabel;
			
		gptut.setShowState('cmdMainPrint', (gptmain.maincmds.f_callbackPrint != undefined));
		
		gptut.setShowState('cmdMainInstall',(kwbball.installPrompt != null));
		},
	
	setStatusClear:function(str)
		{
		if ( (str != undefined) && (str.length > 0) )
			setTimeout(gptmain.setStatusLabel,4000,'');
		},

	setStatusLabel:function(str)
		{
		gptut.setShowState("idlabelMainStatus", (str.length > 0));
		$('#idlabelMainStatus').text(str); 
		gptmain.setStatusClear(str);
		},

	cmdCentral:async function (cmdId,args)
		{
		gptmain.setStatusLabel('');
		
		gptut.setDivShowState('idMainCmdContent',false,false);
		
		gptmain.registerCmds(null);

		if ( (args == undefined) || 
			( (args.forward != undefined) && (args.forward == true) ) )
			gptmain.setMainBack(cmdId, true);

		switch (cmdId)
			{
			case 'cmdMainBack':
				gptmain.processMainBack();
				break;
			case 'cmdSettings':
			case 'cmdSettingsProfile':
			case 'cmdSettingsPlayers':
			case 'cmdSettingsCoaches':
			case 'cmdSettingsLists':
			case 'cmdSettingsSystem':
			case 'cmdNameListNew':
			case 'cmdNameListEdit':
				gptsystem.loadConfig(cmdId,args);
				break;
			case 'cmdSessions':
			case 'cmdSessionNew':
			case 'cmdSessionBullpen':
			case 'cmdSessionScrimmage':
			case 'cmdSessionGame':
				gptsession.loadConfig(cmdId,args);
				break;
			case 'cmdStats':
			case 'cmdStatsNoResults':
				gptstat.loadConfig(cmdId,args);
				break;
			case 'cmdUserLogin':
			case 'cmdUserRefresh':
				gptuser.loadConfig(cmdId,args);
				break;
			}
		},

	replaceMainBackCmd:function(curCmd, newCmd)
		{
		if (gptmain.cmdBackIds.length <= 0)
			return;
		
		for (var i = gptmain.cmdBackIds.length - 1; i >= 0; i--)
			{
			if (gptmain.cmdBackIds[i] == curCmd)
				gptmain.cmdBackIds[i] = newCmd;
			}
		},
	clearMainBack:function ()
		{
		gptmain.setStatusLabel('');
		gptmain.cmdBackIds = [];
		},
		
	getMainBackNextCmd:function()
		{
		if (gptmain.cmdBackIds.length >= 2)
			return(gptmain.cmdBackIds[gptmain.cmdBackIds.length - 2]);
		else
			return('')
		},
	processMainBack:function ()
		{
		gptmain.setStatusLabel('');
		var cmdBackId = '';
		var cmdPreviousId = '';

		if (gptmain.cmdBackIds.length > 0)
			{
			cmdPreviousId = gptmain.cmdBackIds[gptmain.cmdBackIds.length - 1];

			gptmain.cmdBackIds.pop();
			if (gptmain.cmdBackIds.length > 0)
				cmdBackId = gptmain.cmdBackIds[gptmain.cmdBackIds.length - 1];
			}

		if (cmdBackId == '')
			{
			gptmain.showFrontPage();
			return;
			}
			
		// this checks for top level cmd. If top levelshow front page
		if (cmdBackId.length > 0)
			{
			
			}

		gptmain.cmdCentral(cmdBackId,{'forward': false});	
		},

	setMainBack:function(cmdId, show)
		{
		gptut.setShowState("cmdMainBack", show);
		
		if (cmdId != '')
			gptmain.cmdBackIds.push(cmdId);	
		},

	showReloadDialog:function(showDlg)
		{
		if (showDlg == true)
			{
			$("#reloadAppDialog").show();
			}
		else
			{
			$("#reloadAppDialog").hide();
			
			gptut.setShowState('reloadAppDialog',false);			
			}
		},
		
	newInstallCleanup:function()
		{
		console.log('processing application reload...');
		gptmain.showReloadDialog(true)

		setTimeout(function () 
			{		
			//console.log('process local storage cleanup');
			
			console.log('process page reload');
			window.location.reload(false);
			},1000);
		},

	unloadKWBBall:function(e) { gptmain.clearMainBack();	},
	loadKWBBall:function(appstr) 
		{
		if (!("serviceWorker" in navigator))
			return;
		
		console.log("registering service worker...");

		navigator.serviceWorker.register(href = defines.urlApiGet() + appstr,{scope: '/'})
		.then((registration) =>
			{
			console.log("service worker registered");
			registration.addEventListener("updatefound", function() 
				{
				const worker = registration.installing;
				
				if (worker == undefined)
					return;
					
				worker.addEventListener('statechange',function() 
					{
					//console.log('state: ' + worker.state);
					if (worker.state === "redundant") 
						{
						registration.unregister();
						}
					else if (worker.state === "activated")
						{
						// Here is when the activated state was triggered from the lifecycle 
						// of the service worker.
						// This will trigger on the first install and any updates.
						gptmain.newInstallCleanup();
						}
					});
				});

			navigator.serviceWorker.addEventListener('controllerchange', function() 
				{
				// This will be triggered when the service worker is replaced with a new one.
				// We do not just reload the page right away, we want to make sure we are fully activated
				//console.log('state: ' +  'updated');
				//gptmain.newInstallCleanup();
				});

			gptmain.serviceworkerRegistration = registration;
			})
		.catch((e) =>
			{
			console.log(e);
			});	
		},

	showFrontPage:function()
		{
		gptut.setShowState('cmdMainInstall',(kwbball.installPrompt != null));

		gptut.setDivShowState('idMainCmdContent',false,false);
		gptut.setShowState('divFrontPage',true);
					
		// always clear command stack;
		gptmain.clearMainBack ();
		//hide back button
		gptmain.setMainBack('', false);
		gptmain.setStatusLabel('');
		
		gptmain.registerCmds(null);

		gptmain.setImage('divFrontPage',defines.BACKGROUND_IMAGE_FILE,
				gptmain.activeSystem.f_opacity_backgroundimage,gptmain.activeSystem.f_color_backgroundimage,false);
		gptmain.setImage('cmdSessionBullpen',defines.BULLPEN_IMAGE_FILE,
				gptmain.activeSystem.f_opacity_bullpenimage,gptmain.activeSystem.f_color_bullpenimage,false);
		gptmain.setImage('cmdSessionGame',defines.GAME_IMAGE_FILE,
				gptmain.activeSystem.f_opacity_gameimage,gptmain.activeSystem.f_color_gameimage,false);
		gptmain.setImage('cmdSessionScrimmage',defines.SCRIMMAGE_IMAGE_FILE,
				gptmain.activeSystem.f_opacity_scrimmageimage,gptmain.activeSystem.f_color_scrimmageimage,false);

		kwbball.buildBottomMenu(gptmain.loginUser.f_typeid);
		},
		
	processAppVersionUpdate:function(callback)
		{
		// NEED to wait for return with data before moving on.
		gptmain.waitingFlag = true;
		var obj = {'f_version':version.version}
		gptcomm.processServerApi('checkversion', obj, function(obj,apiCmd)
			{
			//set global version
			gptmain.version = obj.f_version;
			gptmain.waitingFlag = false;
			});
		gptmain.waitToComplete(callback);
		},
		
	getIndexDBLogin:async function()
		{
		var obj = await gptindb.readFromDB(gptindb.dbobj_login)
		
		if (obj == null)
			return(null);
			
		if (obj.f_lname == undefined)
			obj.f_lname = '';
			
		if (obj.f_fname == undefined)
			obj.f_fname = '';

		return(obj);
		},
	checkForAppVersionUpdate:async function()
		{
		console.log('processing checkversion...')

		if (navigator.onLine != true)
			return;
			
		//upload any queued objects
		await gptcomm.processLocalDBUpload();
			
		gptmain.processAppVersionUpdate(function()
			{
			// version update required
			if (gptmain.version != version.version)
				{
				//console.log('process local storage cleanup');
				gptmain.showReloadDialog(true)
			
				console.log('process page reload');
				window.location.reload(false);
				}
			});
		},
};

if ((typeof (module) !== 'undefined') && (module.exports) ) 
	{
    module.exports = gptmain;
    };
