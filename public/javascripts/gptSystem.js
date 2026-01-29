var gptsystem = 
	{
	cmdid:'',
	list : [],
			
	getPlayersList:function(apicmd,obj,callback)
		{
		gptmain.waitingFlag = true;
		
		gptsystem.list = [];
		gptcomm.processServerApi(apicmd,obj,function(obj,apiCmd)
			{
			if (obj != undefined)
				gptsystem.list = obj;
			
			gptmain.waitingFlag = false;
			});

		gptmain.waitToComplete(callback);
		},
		
	enableListCmds:function(tblName)
		{	
		var items = gpttb.tableGetDataObjects (tblName);

		var show = true;
		if ( (items == undefined) || (items.length <= 0) )
			show = false;

		gptut.setShowState('cmdMainNew', true);
		gptut.setShowState('cmdMainEdit', show);
		gptut.setShowState('cmdMainDelete', show);
		
		if (show == true)
			{
			var item = gpttb.getTblSelectedObj(tblName);
			gptut.setDisabledState('cmdMainEdit', (item == undefined));		
			gptut.setDisabledState('cmdMainDelete', (item == undefined));
			}
		},
		
	enableNameListCmds:function(tblName)
		{	
		var items = gpttb.tableGetDataObjects (tblName);

		var show = true;
		if ( (items == undefined) || (items.length <= 0) )
			show = false;

		gptut.setShowState('cmdMainNew', true);
		gptut.setShowState('cmdMainEdit', show);
		
		if (show == true)
			{
			var item = gpttb.getTblSelectedObj(tblName);
			gptut.setDisabledState('cmdMainEdit', (item == undefined));		
			}
		},
	getCoachesList:function(callback)
		{
		gptmain.coachList = [];
	
		gptmain.waitingFlag = true;
		gptcomm.processServerApi('usergetcoaches', null, function(obj,apiCmd)
			{
			if (obj != undefined)
				gptmain.coachList = obj;
		
			gptmain.waitingFlag = false;
			});
			
		gptmain.waitToComplete(callback);
		},
		
	callbackPlayerNew:function(){gptuser.loadConfig('cmdPlayerNew');},
	callbackPlayerEdit:function(){gptuser.loadConfig('cmdPlayerEdit');},
	callbackPlayerDelete:function(){gptuser.loadConfig('cmdPlayerDelete');},
	callbackCoachNew:function(){gptuser.loadConfig('cmdCoachNew');},
	callbackCoachEdit:function(){gptuser.loadConfig('cmdCoachEdit');},
	callbackCoachDelete:function(){gptuser.loadConfig('cmdCoachDelete');},

	getDisplayString:function(data,fieldType,row)
		{
		var retVal = '';
		if (fieldType == 'f_teamid')
			{
			var item = gptlist.getItemFromList(data.f_teamid,gptmain.teamList);
			
			if(item)
				retVal = item.f_name;
			}
		return (retVal);
		},
	initializePlayerList:function (tblName)
		{
		gpttb.tableClear(tblName);
		
		var columns = [	{ title: 'First', data: 'f_fname'},
						{ title: 'Last', data: 'f_lname'},
						{ title: 'Class Year', data: 'f_classyear'},
						{ title: 'Team', data: null,
									render: function (data,type,row){
												return (gptsystem.getDisplayString(data, 'f_teamid', row)); }},
						];
						
		var dataTable = $('#' + tblName).dataTable({
					columns: columns,
					columnDefs: [	{ className: 'text-start', targets: [ 0,1,2,3 ] }, 
									{ targets: [ 0,1,2,3 ], 'width': '10px' }
									],
					searching: false,
					info: false,
					paging:false,
					scrollX:true,
					scrollY:"400px",
					scrollCollapse:true,
					fixedColumns:false,
					});
		},
		
	initializeCoachList:function (tblName)
		{
		gpttb.tableClear(tblName);
		
		var columns = [	{ title: 'First', data: 'f_fname'},
						{ title: 'Last', data: 'f_lname'},
						];
						
		var dataTable = $('#' + tblName).dataTable({
					columns: columns,
					columnDefs: [	{ className: 'text-start', targets: [ 0,1 ] }, 
									{ targets: [ 0,1 ], 'width': '10px' }
									],
					searching: false,
					info: false,
					paging:false,
					scrollX:true,
					scrollY:"400px",
					scrollCollapse:true,
					fixedColumns:false,
					});
		},
	onclickTbl:function (e)
		{
		if (gptsystem.cmdid == 'cmdSettingsPlayers')
			var tblName = 'tblPlayersList';
		else if (gptsystem.cmdid == 'cmdSettingsCoaches')
			var tblName = 'tblCoachesList';
		else 
			var tblName = 'tblNameList';
			
		gptmain.selectedItem = undefined;
		if ($(e).hasClass('selectedRow') )
			{
			$(e).removeClass('selectedRow')
			}
		else
			{
			$(e).siblings().removeClass('selectedRow');
			$(e).addClass('selectedRow');
			gptmain.selectedItem = gpttb.getTblSelectedObj(tblName);
			
			if (gptmain.selectedItem == undefined)
				$(e).removeClass('selectedRow');
			}
		
		if (tblName == 'tblNameList')
			gptsystem.enableNameListCmds(tblName);
		else
			gptsystem.enableListCmds(tblName);
		},
		
	buildPlayerSearchDropDown:function()
		{
		var selectElem = document.getElementById('divPlayerTypeSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))
		
		var show = true;
		if (list[index].cmd == 'usergetallbylastname')
			{
			var list = gptmain.playerList;
			var field = 'f_lname';
			}
		else if (list[index].cmd == 'usergetallbyclassyear')
			{
			var list = gptmain.classyearList;
			var field = '';
			}
		else if (list[index].cmd == 'usergetallbyteam')
			{
			var list = gptmain.teamList;
			var field = 'f_id';
			}
		else
			show = false;
		
		gptut.setShowState('inputPlayerPropertyListId',show)
		
		if (show == true)
			gptlist.listFromList(list, field, field,'datalistPlayerPropertyListId')
		},
		
	onclickPlayerType:function(e)
		{
		var valueElem = document.getElementById('inputPlayerPropertyListId');
		valueElem.value = '';
		
		var selectElem = document.getElementById('divPlayerTypeSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'));
		
		if (e.target.id == 'divPlayerTypeDownId')
			index--;
		else
			index++;

		if (index < 0)
			index = list.length - 1;
		else if (index >= list.length)
			index = 0;

		selectElem.setAttribute('data-index',index);
		selectElem.innerHTML = list[index].label;
		
		gptsystem.buildPlayerSearchDropDown()
		},
	onclickPlayerFind:function(e)
		{
		var selectElem = document.getElementById('divPlayerTypeSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'));
	
		var valueElem = document.getElementById('inputPlayerPropertyListId');

		obj = {};
		if (list[index].cmd == 'usergetallbylastname')
			obj.f_lname = valueElem.value;
		else if (list[index].cmd == 'usergetallbyclassyear')
			obj.f_classyear = valueElem.value;
		else if (list[index].cmd == 'usergetallbyteam')
			obj.f_teamid = valueElem.value;
			
		gptsystem.getPlayersList(list[index].cmd,obj,function()
			{
			gptsystem.initializePlayerList('tblPlayersList')
			gpttb.tableAddResultsToTable(gptsystem.list,null,'tblPlayersList',null,null);
			
			var cmds = new gptmain.objMainCmds();
			cmds.f_callbackNew = gptsystem.callbackPlayerNew;
			cmds.f_callbackEdit = gptsystem.callbackPlayerEdit;
			cmds.f_callbackDelete = gptsystem.callbackPlayerDelete;
			cmds.f_showDelete = true;
			gptmain.registerCmds(cmds);
			
			gptsystem.enableListCmds('tblPlayersList')
			});
		},
	buildPlayerSearchTypeList:function()
		{
		var divElem = document.getElementById('divPlayerTypeId')
		var divSearchElem = document.getElementById('divPlayerSearchId')
		if (document.documentElement.offsetWidth < 700)
			var width = '100%';
		else
			var width = '60%';
			
		divElem.style.width = width;
		divSearchElem.style.width = width;
					
		var downElem = document.getElementById('divPlayerTypeDownId');
		downElem.addEventListener("click",this.onclickPlayerType);
		downElem.innerHTML = '<';
		
		var upElem = document.getElementById('divPlayerTypeUpId');
		upElem.addEventListener("click",this.onclickPlayerType);
		upElem.innerHTML = '>';
		
		var findElem = document.getElementById('divPlayerFindId');
		findElem.addEventListener("click",this.onclickPlayerFind);
		findElem.innerHTML = 'FIND';
		
		var list = [
					{'label':'Last Name','cmd':'usergetallbylastname'},
					{'label':'Team','cmd':'usergetallbyteam'},
					{'label':'Class Year','cmd':'usergetallbyclassyear'},
					{'label':'Current Players','cmd':'usergetallcurrent'},
					{'label':'Past Players','cmd':'usergetallpast'}
					];
		var selectElem = document.getElementById('divPlayerTypeSelectId');
		selectElem.addEventListener("click",this.onclickPlayerType);
		selectElem.setAttribute('data-list',JSON.stringify(list));
		selectElem.setAttribute('data-index',0);
		
		selectElem.innerHTML = list[0].label;
		
		gptsystem.buildPlayerSearchDropDown();
		},
	
	showNameList:function()
		{
		var selectElem = document.getElementById('divListTypeSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'));
		
		gptsystem.getNameList(list[index].cmd,function ()
			{
			gptsystem.initializeNameList('tblNameList');
			gpttb.tableAddResultsToTable(gptsystem.list,null,'tblNameList',null,null);
				
			var cmds = new gptmain.objMainCmds();
			cmds.f_callbackNew = gptsystem.callbackNameListNew;
			cmds.f_callbackEdit = gptsystem.callbackNameListEdit;
			//cmds.f_callbackDelete = gptsystem.callbackNameListDelete;
			//cmds.f_showDelete = true;
			gptmain.registerCmds(cmds);
			
			gptsystem.enableNameListCmds('tblNameList')
			});
		},
	onclickListType:function(e)
		{
		var selectElem = document.getElementById('divListTypeSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'));
		
		if (e.target.id == 'divListTypeDownId')
			index--;
		else
			index++;

		if (index < 0)
			index = list.length - 1;
		else if (index >= list.length)
			index = 0;

		selectElem.setAttribute('data-index',index);
		selectElem.innerHTML = list[index].label;
		
		gptsystem.showNameList();
		},
	buildListTypeList:function()
		{
		var divElem = document.getElementById('divListTypeId')
		if (document.documentElement.offsetWidth < 900)
			divElem.style.width = '100%';
		else
			divElem.style.width = '60%';
					
		var downElem = document.getElementById('divListTypeDownId');
		downElem.addEventListener("click",this.onclickListType);
		downElem.innerHTML = '<';
		
		var upElem = document.getElementById('divListTypeUpId');
		upElem.addEventListener("click",this.onclickListType);
		upElem.innerHTML = '>';
		
		var list = [
					{'label':'Pitch Types','singlelabel':'Pitch Type',
							'cmd':'pitchtypeget','cmdupdate':'pitchtypeupdate'},
					{'label':'Pitch Calls','singlelabel':'Pitch Call',
							'cmd':'pitchactionget','cmdupdate':'pitchactionupdate'},
					{'label':'Teams','singlelabel':'Team','cmd':'teamget',
							'cmd':'teamget','cmdupdate':'teamupdate'}
					];
		var selectElem = document.getElementById('divListTypeSelectId');
		selectElem.addEventListener("click",this.onclickListType);
		selectElem.setAttribute('data-list',JSON.stringify(list));
		selectElem.setAttribute('data-index',0);
		
		selectElem.innerHTML = list[0].label;
		
		gptsystem.showNameList();
		},
	initializeNameList:function (tblName)
		{
		gpttb.tableClear(tblName);
		
		var columns = [	{ title: 'Name', data: 'f_name'},
						];
						
		var dataTable = $('#' + tblName).dataTable({
					columns: columns,
					columnDefs: [	{ className: 'text-start', targets: [ 0 ] }, 
									{ targets: [ 0 ], 'width': '10px' }
									],
					searching: false,
					info: false,
					paging:false,
					scrollX:true,
					scrollY:"400px",
					scrollCollapse:true,
					fixedColumns:false,
					});
		},
	
	getNameList:function(apicmd,callback)
		{
		gptsystem.list = [];
	
		gptmain.waitingFlag = true;
		gptcomm.processServerApi(apicmd, null, function(obj,apiCmd)
			{
			if (obj != undefined)
				gptsystem.list = obj;
			
			gptmain.waitingFlag = false;
			});
			
		gptmain.waitToComplete(callback);
		},

	getNamelistProperties:function()
		{
		// initialize obj as objPitchType,
		// objTeam and objPitchAction are same
		var item = new defines.objPitchType()
		item.f_name = $('#f_system_namelist_name').val();
		
		return(item);
		},
	validateNameItem:function(item)
		{
		if (item.f_name.length <= 0)
			{
			modal.displayModalOpen ("WARNING","'NAME' must be specified.",
								null, null,	modal.modalParams.mode.modeOk,null);
			return (false);
			}
		},
	callbackSaveNameList:function()
		{
		var selectElem = document.getElementById('divListTypeSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'));

		var apicmd = list[index].cmdupdate;
		
		vat item = gptsystem.getNamelistProperties();	
		
		if (gptsystem.validateNameItem(item) != true)
			return;
		
		gptmain.waitingFlag = true;
		gptcomm.processServerApi(apicmd, item, async function(obj,apiCmd)
			{
			gptmain.waitingFlag = false;
			});

		gptmain.waitToComplete(callback);
		},
	callbackNameListNew:function(){gptmain.cmdCentral('cmdNameListNew');},
	callbackNameListEdit:function()	{gptmain.cmdCentral('cmdNameListEdit');},
		
	setSystemInPropertiesForm:function(obj)
		{
		if (obj == null)
			var obj = new defines.objSystem();

		var displaydate = '';
		if ( (obj.f_date_created != undefined) && (obj.f_date_created.length > 0)  )
			displaydate = gptdt.convertUTCToLocalDateFormat(obj.f_date_created, 'mm/dd/yyyy ampmHH:ampmMM ampm');
		$('#f_system_date_created').val(displaydate);
		
		var displaydate = '';
		if ( (obj.f_date_lastmodified != undefined) && (obj.f_date_lastmodified.length > 0)  )
			displaydate = gptdt.convertUTCToLocalDateFormat(obj.f_date_lastmodified, 'mm/dd/yyyy ampmHH:ampmMM ampm');
		$('#f_system_date_lastmodified').val(displaydate);
		
		$('#f_system_name').val(obj.f_name);

		$('#f_system_original_backgroundimage').val(obj.f_original_backgroundimage);
		$('#f_system_opacity_backgroundimage').val(obj.f_opacity_backgroundimage);
		$('#opacity_backgroundimage_value').val(obj.f_opacity_backgroundimage);
		$('#f_system_color_backgroundimage').val(obj.f_color_backgroundimage);
		
		$('#f_system_original_bullpenimage').val(obj.f_original_bullpenimage);
		$('#f_system_opacity_bullpenimage').val(obj.f_opacity_bullpenimage);
		$('#opacity_bullpenimage_value').val(obj.f_opacity_bullpenimage);
		$('#f_system_color_bullpenimage').val(obj.f_color_bullpenimage);
		
		$('#f_system_original_scrimmageimage').val(obj.f_original_scrimmageimage);
		$('#f_system_opacity_scrimmageimage').val(obj.f_opacity_scrimmageimage);
		$('#opacity_scrimmageimage_value').val(obj.f_opacity_scrimmageimage);
		$('#f_system_color_scrimmageimage').val(obj.f_color_scrimmageimage);
		
		$('#f_system_original_gameimage').val(obj.f_original_gameimage);
		$('#f_system_opacity_gameimage').val(obj.f_opacity_gameimage);
		$('#opacity_gameimage_value').val(obj.f_opacity_gameimage);
		$('#f_system_color_gameimage').val(obj.f_color_gameimage);
		
		$("#f_systems_client_refreshrate").val(obj.f_clientrefresh);
		},
		
	getSystemFromPropertiesForm:function(obj)
		{
		if (obj == null)
			var obj = new defines.objSystem();
		
		obj.f_clientrefresh = $("#f_system_client_refreshrate").val();
		
		obj.f_original_backgroundimage = $('#f_system_original_backgroundimage').val();
		obj.f_opacity_backgroundimage = $('#f_system_opacity_backgroundimage').val();
		obj.f_color_backgroundimage = $('#f_system_color_backgroundimage').val();
		
		obj.f_original_bullpenimage = $('#f_system_original_bullpenimage').val();
		obj.f_opacity_bullpenimage = $('#f_system_opacity_bullpenimage').val();
		obj.f_color_bullpenimage = $('#f_system_color_bullpenimage').val();
		
		obj.f_original_scrimmageimage = $('#f_system_original_scrimmageimage').val();
		obj.f_opacity_scrimmageimage = $('#f_system_opacity_scrimmageimage').val();
		obj.f_color_scrimmageimage = $('#f_system_color_scrimmageimage').val();
		
		obj.f_original_gameimage = $('#f_system_original_gameimage').val();
		obj.f_opacity_gameimage = $('#f_system_opacity_gameimage').val();
		obj.f_color_gameimage = $('#f_system_color_gameimage').val();
		
		return(obj);
		},
	
	
		
	callbackSave:function()
		{
		var obj = gptsystem.getSystemFromPropertiesForm();
		gptcomm.processServerApi('systemupdate',obj,function(obj,apiCmd)
			{
			gptmain.setStatusLabel("system settings updated");
			gptmain.activeSystem = obj;
			
			gptindb.writeToDB(gptindb.dbobj_system,gptmain.activeSystem)
			});
		},
		
	getSystemSettings:function(callback)
		{
		// NEED to wait for return with data before moving on.
		gptmain.waitingFlag = true;
		gptcomm.processServerApi('systemget', null, function(obj,apiCmd)
			{
			gptmain.setStatusLabel("system settings retrieved");
					
			if (obj != undefined)
				gptmain.activeSystem = obj;
			else
				gptmain.activeSystem = new defines.objSystem();
			
			gptindb.writeToDB(gptindb.dbobj_system,gptmain.activeSystem)
			
			gptmain.waitingFlag = false;
			});
			
		gptmain.waitToComplete(callback);
		},
		
	onclickSystemDefaults:function(e)
		{
		gptcomm.processServerApi('systemdefaults', null, function (obj,apiCmd)
			{
			gptmain.setStatusLabel("system file uploaded");
			gptmain.activeSystem = obj;
				
			gptsystem.setSystemInPropertiesForm(gptmain.activeSystem);
			});	
		},
		
	onclickSystemCleanup:function(e)
		{
		gptcomm.processServerApi('systemcleanup', null, function ()
			{
				
			});	
		},
	filetypeValidation:function(filename)
		{
		var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif|\.svg)$/i;
		var displayExts = '[ jpg | jpeg | png | gif | svg ]';

		if(!allowedExtensions.exec(filename))
			{
			modal.displayModalOpen ("WARNING","Allowable file types are: " + displayExts,
								null, null,	modal.modalParams.mode.modeOk,null);
			return (false);
			}
		return(true);
		},
	onclickImageUpload:function(e)
		{
		var obj = gptsystem.getSystemFromPropertiesForm();
		
		var objUpload = new defines.objFileUpload();

		if (e.target.id == 'btnSystemBackgroundImageUpload')
			{
			var file = document.getElementById('f_system_background_image_select').files[0];
			obj.f_original_backgroundimage = defines.BACKGROUND_IMAGE_FILE;
			objUpload.f_system_filename = defines.BACKGROUND_IMAGE_FILE;
			}
		else if (e.target.id == 'btnSystemBullpenImageUpload')
			{
			var file = document.getElementById('f_system_bullpen_image_select').files[0];
			obj.f_original_bullpenimage = defines.BULLPEN_IMAGE_FILE;
			objUpload.f_system_filename = defines.BULLPEN_IMAGE_FILE;
			}
		else if (e.target.id == 'btnSystemScrimmageImageUpload')
			{
			var file = document.getElementById('f_system_scrimmage_image_select').files[0];
			obj.f_original_scrimmageimage = defines.SCRIMMAGE_IMAGE_FILE;
			objUpload.f_system_filename = defines.SCRIMMAGE_IMAGE_FILE;
			}
		else if (e.target.id == 'btnSystemGameImageUpload')
			{
			var file = document.getElementById('f_system_game_image_select').files[0];
			obj.f_original_gameimage = defines.GAME_IMAGE_FILE;
			objUpload.f_system_filename = defines.GAME_IMAGE_FILE;
			}
					
		objUpload.f_uploaddirectory = defines.IMAGE_DIRECTORY;
		objUpload.f_original_filename = file.name;
		objUpload.f_obj = obj;
		
		if ( (gptsystem.filetypeValidation(file.name) == true) )
			{
			var formData = new FormData();
			formData.append('uploadFile',file);
			
			formData.append('objUpload', JSON.stringify(objUpload));
			gptcomm.processServerUpload('systemuploadimage', formData,null,null, 
										function(obj,apiCmd)
				{
				gptmain.setStatusLabel("system file uploaded");
				gptmain.activeSystem = obj;
				
				gptsystem.setSystemInPropertiesForm(gptmain.activeSystem);
				
				gptindb.writeToDB(gptindb.dbobj_system,gptmain.activeSystem)
				});
			}
		},
	
	closeSideMenu:async function ()
		{
		var menuElem = document.getElementById('divSettingsMenu');

		menuElem.style.position = "absolute";
		menuElem.style.width = '0px';
				
		// need to delay, so that anamation works
		await gptut.waitdelay(300); 
				
		gptut.setShowState("divSettingsMenu",false);
		gptut.setDivShowState('idMainCmdContent',false,false);
		},
		
	onclickMenuCmd:function(e){gptmain.cmdCentral(e.target.id,null)},
	
	buildSideMenu:function()
		{
		var menuElem = document.getElementById('cmdSettingsProfile');
		menuElem.addEventListener("click",this.onclickMenuCmd);
		
		var menuElem = document.getElementById('cmdSettingsPlayers');
		menuElem.addEventListener("click",this.onclickMenuCmd);
	
		var menuElem = document.getElementById('cmdSettingsCoaches');
		menuElem.addEventListener("click",this.onclickMenuCmd);
		
		var menuElem = document.getElementById('cmdSettingsLists');
		menuElem.addEventListener("click",this.onclickMenuCmd);
		
		var menuElem = document.getElementById('cmdSettingsSystem');
		menuElem.addEventListener("click",this.onclickMenuCmd);
		},
	loadConfig:function (cmdId)
		{
		gptsystem.cmdid = cmdId;

		if (cmdId == 'cmdSettings')
			{
			var menuElem = document.getElementById('divSettingsMenu');

			gptsystem.buildSideMenu();
			if (menuElem.style.display == 'none')
				{
				// first always set width to zero. This insures the animatiom works
				menuElem.style.position = "absolute";
				menuElem.style.width = '0px';
				
				gptut.setShowState("divSettingsMenu", true);

				if (document.documentElement.offsetWidth < 900)
					menuElem.style.width = '100%';
				else
					menuElem.style.width = '60%';
				}
			else
				{
				gptsystem.closeSideMenu();
				}
			}	
		else if (cmdId == 'cmdSettingsProfile')
			{
			gptuser.loadConfig('cmdUserProfile');
			}
		else if (cmdId == 'cmdSettingsPlayers')
			{
			gptut.setShowState('divSettingsPlayers', true);
			
			gptsystem.initializePlayerList('tblPlayersList');
			gptsystem.buildPlayerSearchTypeList();
			
			var cmds = new gptmain.objMainCmds();
			cmds.f_callbackNew = gptsystem.callbackPlayerNew;
			cmds.f_callbackEdit = gptsystem.callbackPlayerEdit;
			cmds.f_callbackDelete = gptsystem.callbackPlayerDelete;
			cmds.f_showDelete = true;
			gptmain.registerCmds(cmds);
			
			gptsystem.enableListCmds('tblPlayersList');
			}
		else if (cmdId == 'cmdSettingsCoaches')
			{
			gptut.setShowState('divSettingsCoaches', true);
			gptsystem.initializeCoachList('tblCoachesList')
			gptsystem.getCoachesList(function()
				{
				gptsystem.initializeCoachList('tblCoachesList')
				gpttb.tableAddResultsToTable(gptmain.coachList,null,'tblCoachesList',null,null);
			
				var cmds = new gptmain.objMainCmds();
				cmds.f_callbackNew = gptsystem.callbackCoachNew;
				cmds.f_callbackEdit = gptsystem.callbackCoachEdit;
				cmds.f_callbackDelete = gptsystem.callbackCoachDelete;
				cmds.f_showDelete = true;
				gptmain.registerCmds(cmds);
			
				gptsystem.enableListCmds('tblCoachesList')
				});
			}
		else if (cmdId == 'cmdSettingsLists')
			{
			gptut.setShowState('divSettingsLists', true);
			
			gptsystem.buildListTypeList();
			}
		else if (cmdId == 'cmdSettingsSystem')
			{
			gptut.setDivShowState('divSettingsSystem',true);
			
			gptsystem.getSystemSettings(function()
				{
				var elem = document.getElementById('btnSystemDefaults');
				elem.addEventListener("click", gptsystem.onclickSystemDefaults);
				
				var elem = document.getElementById('btnSystemCleanup');
				elem.addEventListener("click", gptsystem.onclickSystemCleanup);
				
				var elem = document.getElementById('btnSystemBackgroundImageUpload');
				elem.addEventListener("click", gptsystem.onclickImageUpload);

				var elem = document.getElementById('btnSystemBullpenImageUpload');
				elem.addEventListener("click", gptsystem.onclickImageUpload);

				var elem = document.getElementById('btnSystemScrimmageImageUpload');
				elem.addEventListener("click", gptsystem.onclickImageUpload);

				var elem = document.getElementById('btnSystemGameImageUpload');
				elem.addEventListener("click", gptsystem.onclickImageUpload);

				var cmds = new gptmain.objMainCmds();
				cmds.f_callbackSave = gptsystem.callbackSave;
				cmds.f_callbackDelete = null;
				cmds.f_showDelete = false;
				gptmain.registerCmds(cmds);
				
				gptsystem.setSystemInPropertiesForm(gptmain.activeSystem);
				});
			}
		else if (	(cmdId == 'cmdNameListNew') || (cmdId == 'cmdNameListEdit') )
			{
			gptut.setDivShowState('divSettingsListProperties',true);
			
			var selectElem = document.getElementById('divListTypeSelectId');
			var list = JSON.parse(selectElem.getAttribute('data-list'));
			var index = parseInt(selectElem.getAttribute('data-index'));

			var labelElem = document.getElementById('labelNameList');
			labelElem.innerHTML = list[index].singlelabel;

			var cmds = new gptmain.objMainCmds();
			cmds.f_callbackSave = gptsystem.callbackSaveNameList;
			cmds.f_callbackDelete = null;
			cmds.f_showDelete = false;
			gptmain.registerCmds(cmds);
			}
		},
};
