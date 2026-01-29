// this function has to be loaded here. Causing it to run right away.
$(window).on('load', function()
	{
	setTimeout(kwbball.removeLoadingSymbol, 1000);

	window.addEventListener("online", gptmain.online);
	window.addEventListener("offline", gptmain.offline);
	gptmain.setOnlineStatus(navigator.onLine);

	window.history.replaceState({'gptApp': version.client_cache, 'state':1 }, 'kwbball',location.href);
	window.history.pushState({'gptApp': version.client_cache, 'state':2 }, 'kwbball','');
	
	window.addEventListener('popstate', function(e) 
		{
		var state = e.state;
		if ( (state) && (state.gptApp == version.client_cache) ) 
			{
			if (state.state == 1)
				{
				kwbball.onclickMainBack();
				window.history.go(1);
				}
			}
		});
	});

var kwbball = 
	{
	togglePaused : false,
	
	intervalLoginId : 0, // used to logout user everyday
	
	ro : null,

	installPrompt : null,

	// this function is used to force a relogin every day.
	startRefreshInterval:function(refreshrate)
		{
		if ( (refreshrate == undefined) || (refreshrate <= 0) )
			var refreshrate = 10;
			
		var intervalTime = refreshrate * 60; // rate in minutes
		kwbball.stopRefreshInterval()
		kwbball.intervalRefreshId = setInterval('kwbball.processRefreshIntervalFunc()', intervalTime * 1000);
		},
		
	stopRefreshInterval:function()
		{
		if (kwbball.intervalRefreshId > 0)
			clearInterval(kwbball.intervalRefreshId);

		kwbball.intervalRefreshId = 0;
		},
	
	processRefreshIntervalFunc:function()
		{
		gptmain.checkForAppVersionUpdate()
		},

	onclickMainBack:function (e) 
		{
		if (gptmain.maincmds.f_callbackBack != undefined)
			gptmain.maincmds.f_callbackBack();
		else
			gptmain.cmdCentral('cmdMainBack',{'forward':false});
		},
	onclickMainSearch:function (e) 
		{
		if (gptmain.maincmds.f_callbackSearch != undefined)
			gptmain.maincmds.f_callbackSearch();
		},
	onclickMainNew:function (e) 
		{
		if (gptmain.maincmds.f_callbackNew != undefined)
			gptmain.maincmds.f_callbackNew();
		},
	onclickMainEdit:function (e) 
		{
		if (gptmain.maincmds.f_callbackEdit != undefined)
			gptmain.maincmds.f_callbackEdit();
		},
	onclickMainSave:function (e) 
		{
		if (gptmain.maincmds.f_callbackSave != undefined)
			gptmain.maincmds.f_callbackSave();
		},
	onclickMainProcess:function (e) 
		{
		if (gptmain.maincmds.f_callbackProcess != undefined)
			gptmain.maincmds.f_callbackProcess();
		},
	onclickMainPrint:function (e) 
		{
		if (gptmain.maincmds.f_callbackPrint != undefined)
			gptmain.maincmds.f_callbackPrint();
		},
	onclickMainDelete:function (e) 
		{
		if (gptmain.maincmds.f_callbackDelete != undefined)
			gptmain.maincmds.f_callbackDelete();
		},
		
	onclickMainInstall:async function (e) 
		{
		if (kwbball.installPrompt !== null) 
			{
			kwbball.installPrompt.prompt();
			const { outcome } = await kwbball.installPrompt.userChoice;

			if (outcome === 'accepted')
				kwbball.installPrompt = null;
				
			gptut.setShowState('cmdMainInstall',(kwbball.installPrompt != null));
			}
		},
	
	onscrollList:function(e)
		{
		var $open = $($(e.target).data('parent')).find('.collapse.show');
		var $card = $(e.target).closest('.accordion-item');

		var additionalOffset = 90; //30;
		if($card.prevAll().filter($open.closest('.accordion-item')).length !== 0)
			additionalOffset = $open.height();

		$('html,body').animate({scrollTop: $card.offset().top - additionalOffset}, 0); //300
		},

	startLoadingSymbol:function()
		{
		//gptcomm.apicmdStackUpdate('LoadSymbol',true);
		
		// 	NOTE: Thw window 'load' function is at topof this file. Needs to run before all 
		//	of the javascript is loaded
/*
		$(window).on('load', function()
			{
			setTimeout(kwbball.removeLoadingSymbol, 2000);
			});
*/
		},

	removeLoadingSymbol:function()
		{
		//gptcomm.apicmdStackUpdate('LoadSymbol',false);
		
		gptut.setShowState('KWBALL', true);
		},
	
	beforeInstallPrompt:function(e){kwbball.installPrompt = e;},
	
	onclickMainBottomCmd:function(e)
		{
		var cmdid = e.target.getAttribute('data-command');
		gptmain.cmdCentral(cmdid,null)
		},
	
	createCommand:function(cmddata,parentid)
		{
		var cmdDiv = document.createElement('div')
		cmdDiv.id = cmddata.cmdid + '_Div';
		cmdDiv.classList.add(cmddata.menupos)
		
		var cmdA = document.createElement('a');
		cmdA.id = cmddata.cmdid + '_A';
		cmdA.setAttribute('data-command',cmddata.cmdid)
		cmdA.addEventListener("click",kwbball.onclickMainBottomCmd);

		var cmdI = document.createElement('i');
		cmdI.id = cmddata.cmdid + '_I';
		cmdI.setAttribute('data-command',cmddata.cmdid)
		cmdI.classList.add ('cmdmainicon');
		for (var i = 0; i < cmddata.icon.length; i++)
			cmdI.classList.add (cmddata.icon[i]);
		
		var cmdB = document.createElement('b');
		cmdB.id = cmddata.cmdid + '_B';
		cmdB.setAttribute('data-command',cmddata.cmdid)
		cmdB.classList.add ('cmdmainlabel');
		cmdB.innerHTML = cmddata.label;
		
		cmdA.appendChild(cmdI)
		cmdA.appendChild(cmdB)
		cmdDiv.appendChild(cmdA)
				
		var parentElem = document.getElementById (parentid)
		parentElem.appendChild(cmdDiv);
		
		if (cmddata.cmdid == 'cmdStats')
			{
			gptut.setDisabledState(cmdI.id,!navigator.onLine)
			gptut.setDisabledState(cmdB.id,!navigator.onLine)
			gptut.setDisabledState(cmdA.id,!navigator.onLine)
			gptut.setDisabledState(cmdDiv.id,!navigator.onLine)
			}
		},
		
	buildBottomMenu:function(menutype)
		{
		var cmds = [];

		if (menutype == defines.usertype.admin)
			{
			cmds.push({'label':'SETTINGS','menupos':'cmd1','cmdid':'cmdSettings','icon':['bi','bi-gear']});
			cmds.push({'label':'SESSIONS','menupos':'cmd2','cmdid':'cmdSessions','icon':['bi','bi-bullseye']});
			cmds.push({'label':'STATS','menupos':'cmd3','cmdid':'cmdStats','icon':['bi','bi-clipboard-data']});
			}
		else if (menutype == defines.usertype.coach)
			{
			cmds.push({'label':'SETTINGS','menupos':'cmd1','cmdid':'cmdSettings','icon':['bi','bi-gear']});
			cmds.push({'label':'SESSIONS','menupos':'cmd2','cmdid':'cmdSessions','icon':['bi','bi-bullseye']});
			cmds.push({'label':'STATS','menupos':'cmd3','cmdid':'cmdStats','icon':['bi','bi-clipboard-data']});
			}
		else if (menutype == defines.usertype.player)
			{
			cmds.push({'label':'ME','menupos':'cmd1','cmdid':'cmdSettingsProfile','icon':['bi','bi-person-fill']});
			//cmds.push({'label':'SESSIONS','menupos':'cmd2','cmdid':'cmdSessions','icon':['bi','bi-bullseye']});
			cmds.push({'label':'STATS','menupos':'cmd2','cmdid':'cmdStats','icon':['bi','bi-clipboard-data']});
			}
				
		gptut.deleteElementChildren('idMainBottomMenu')
		
		for (var i = 0; i < cmds.length; i++)
			kwbball.createCommand(cmds[i],'idMainBottomMenu');
			
		gptut.setShowState('idMainBottomMenu', true);
		},
		
	loadConfig:async function (credentials)
		{
		gptmain.setStatusLabel('');
		gptmain.registerCmds(null);
		
		if (credentials == undefined)
			var credentials = {'f_organization_name':defines.ORGANIZATION_NAME, 
								'f_database_name':defines.DATABASE_NAME};

		gptcomm.gblCredentials = credentials;
		gptcomm.gblCredentials.f_localtimezone = gptdt.getLocalSystemTimezone();
		
		if (gptcomm.gblCredentials.client != undefined)
			gptcomm.gblCredentials.client = parseInt(gptcomm.gblCredentials.client);		

		var elem = document.getElementById('cmdMainSearch');
		elem.addEventListener("click",this.onclickMainSearch);
		
		var elem = document.getElementById('cmdMainSave');
		elem.addEventListener("click",this.onclickMainSave);
				
		var elem = document.getElementById('cmdMainEdit');
		elem.addEventListener("click",this.onclickMainEdit);
			
		var elem = document.getElementById('cmdMainNew');
		elem.addEventListener("click",this.onclickMainNew);
		
		var elem = document.getElementById('cmdMainDelete');
		elem.addEventListener("click",this.onclickMainDelete);
		
		var elem = document.getElementById('cmdMainProcess');
		elem.addEventListener("click",this.onclickMainProcess);

		var elem = document.getElementById('cmdMainPrint');
		elem.addEventListener("click",this.onclickMainPrint);

		var elem = document.getElementById('cmdMainBack');
		elem.addEventListener("click",this.onclickMainBack);

		var elem = document.getElementById('cmdMainInstall');
		elem.addEventListener("click",this.onclickMainInstall);

		$('#tblPlayersList tbody').on('click', 'tr', function (){gptsystem.onclickTbl(this) });
		$('#tblCoachesList tbody').on('click', 'tr', function (){gptsystem.onclickTbl(this) });
		$('#tblNameList tbody').on('click', 'tr', function (){gptsystem.onclickTbl(this) });
		
		$('#tblPitchType tbody').on('click', 'tr', function (){gptuser.onclickPitchTypeTbl(this) });

		window.addEventListener('beforeinstallprompt', function(e){kwbball.beforeInstallPrompt(e)});
		window.addEventListener('beforeunload', function(e){gptmain.unloadKWBBall(e)});
		
		if ("serviceWorker" in navigator) 
			gptmain.loadKWBBall('/getswkwbball');
			// NOTE: the onload event is not always called
			//window.addEventListener("load", function(e){kwbball.loadKWBBall(e)});

		kwbball.ro = new ResizeObserver(entries => {gptmain.browserResize();});
		kwbball.ro.observe(document.getElementById('idMainTopMenu'));
				
		gptut.setDivShowState('idMainCmdContent',false,false);
		gptut.setShowState('idMainCmdContent', true);
		gptmain.browserResize();
		
		gptmain.cmdCentral('cmdUserLogin')
		},
};

