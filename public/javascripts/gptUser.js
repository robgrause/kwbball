var gptuser = 
	{
	cmdid : '',

	listParams : null,
	
	initializePitchTypeList:function (tblName)
		{
		gpttb.tableClear(tblName);
		
		var columns = [	{ title: 'Pitch', data: 'f_name'},
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
		
	onclickPitchTypeTbl:function (e)
		{
		var tblName = 'tblPitchType';
		
		var objs = gpttb.getTblSelectedObjs(tblName);
		
		if ($(e).hasClass('selectedRow') )
			$(e).removeClass('selectedRow')

		else
			$(e).addClass('selectedRow');	
		},

	setFieldsInPropertiesForm:function(obj)
		{
		if (obj == null)
			var obj = new defines.objUser();

		$('#f_user_fname').val(obj.f_fname);
		$('#f_user_lname').val(obj.f_lname);
		
		$('#f_user_id').val(obj.f_id);
		
		$('#f_user_team').val(obj.f_teamid);
		$('#f_user_classyear').val(obj.f_classyear);
		
		$('#throwLeftOptionId').prop('checked',(obj.f_throw == defines.leftright.left));
		$('#throwRightOptionId').prop('checked',(obj.f_throw == defines.leftright.right));
		
		$('#batLeftOptionId').prop('checked',(obj.f_bat == defines.leftright.left));
		$('#batRightOptionId').prop('checked',(obj.f_bat == defines.leftright.right));
		$('#batSwitchOptionId').prop('checked',(obj.f_bat == defines.leftright.both));

		if ( (obj.f_pitchids!= undefined) && (obj.f_pitchids.length > 0) )
			for(var i = 0; i < obj.f_pitchids.length; i++)
				gpttb.tableSelectRow('tblPitchType', 'f_id', obj.f_pitchids[i])
		
		var displaydate = '';
		if ( (obj.f_date_created != undefined) && (obj.f_date_created.length > 0)  )
			displaydate = gptdt.convertUTCToLocalDateFormat(obj.f_date_created, 'mm/dd/yyyy  ampmHH:ampmMM ampm');
		$('#f_user_date_created').val(displaydate);
		
		var displaydate = '';
		if ( (obj.f_date_lastmodified != undefined) && (obj.f_date_lastmodified.length > 0)  )
			displaydate = gptdt.convertUTCToLocalDateFormat(obj.f_date_lastmodified, 'mm/dd/yyyy  ampmHH:ampmMM ampm');
		$('#f_user_date_lastmodified').val(displaydate);
		
		$('#f_user_type').val(obj.f_typeid);
		
		$('#f_user_notes').val(obj.f_notes);
		},
		
	getFieldsFromPropertiesForm:function(obj)
		{
		if (obj == null)
			var obj = new defines.objUser();

		obj.f_fname = $('#f_user_fname').val();
		obj.f_lname = $('#f_user_lname').val();

		obj.f_fname = obj.f_fname.trim();
		obj.f_lname = obj.f_lname.trim();
		
		obj.f_fname = gptut.uppercaseFirstLetter(obj.f_fname);
		obj.f_lname = gptut.uppercaseFirstLetter(obj.f_lname);
				
		obj.f_teamid = parseInt($('#f_user_team').val());
		obj.f_classyear = parseInt($('#f_user_classyear').val());
		
		obj.f_throw = defines.leftright.right;
		if ($('#throwLeftOptionId').prop('checked'))
			obj.f_throw = defines.leftright.left;
		
		obj.f_bat = defines.leftright.both;
		if ($('#batLeftOptionId').prop('checked'))
			obj.f_bat = defines.leftright.left;
		else if ($('#batRightOptionId').prop('checked'))
			obj.f_bat = defines.leftright.right;
	
		var pitchobjs = gpttb.getTblSelectedObjs('tblPitchType')
	
		obj.f_pitchids = [];
		for (var i = 0; i < pitchobjs.length; i++)
			obj.f_pitchids.push(pitchobjs[i].f_id);
			
		obj.f_typeid = parseInt($('#f_user_type').val());
		
		obj.f_id = parseInt($('#f_user_id').val());
		obj.f_notes = $('#f_user_notes').val();
		
		return(obj);
		},
	
	onchangePropertyName:function(e)
		{
		if (e.target.value.length > 0)
			gptlist.listValue(defines.tblUsers,e.target.value,'list_UserSearchValue');
		},
/*	
	callbackCmd:function(obj,apiCmd)
		{
		if (apiCmd == 'userdelete')
			{
			gptmain.activeUser = obj;
			gptmain.setStatusLabel("user deleted");
			gptmain.activeUser = new defines.objUser();
			gptuser.setFieldsInPropertiesForm(gptmain.activeUser);
			gptmain.replaceMainBackCmd('cmdUserEdit', 'cmdUserNew');
			gptmain.processMainBack();
			}
		},
*/
	validate:function(obj)
		{
		if (obj.f_fname.length <= 0)
			{
			modal.displayModalOpen ("WARNING","'USER FIRST NAME' must be specified.",
								null, null,	modal.modalParams.mode.modeOk,null);
			return (false);
			}
			
		if (obj.f_lname.length <= 0)
			{
			modal.displayModalOpen ("WARNING","'USER LAST NAME' must be specified.",
								null, null,	modal.modalParams.mode.modeOk,null);
			return (false);
			}			
		
		return(true);
		},
			
	updateUser:function(user,apicmd,callback)
		{
		gptmain.waitingFlag = true;

		gptcomm.processServerApi(apicmd, user, async function(obj,apiCmd)
			{
			gptmain.waitingFlag = false;
			});

		gptmain.waitToComplete(callback);
		},
		
	callbackSave:function()
		{
		var user = gptuser.getFieldsFromPropertiesForm(gptmain.selectedItem);

		if (user.f_id <= 0)
			var apiCmd = 'useradd';
		else
			var apiCmd = 'userupdate';

		if (gptuser.validate(user) != true)
			return;
			
		gptuser.updateUser(user,apiCmd,function()
			{
			if (apiCmd == 'useradd')
				{
				if (user.f_typeid == defines.usertype.player)
					{
					gptmain.setStatusLabel("player added");
					gptmain.replaceMainBackCmd('cmdPlayerNew', 'cmdPlayerEdit');
					}
				else
					{
					gptmain.setStatusLabel("coach added");
					gptmain.replaceMainBackCmd('cmdCoachNew', 'cmdCoachEdit');
					}
				}
			else if (apiCmd == 'userupdate')
				{
				if (gptuser.cmdid == 'cmdUserProfile')
					{
					gptmain.setStatusLabel("profile updated");
					gptmain.loginUser = user;
					}
				else
					{
					if (user.f_typeid == defines.usertype.player)
						gptmain.setStatusLabel("player updated");
					else
						gptmain.setStatusLabel("coach updated");
					}
				}
			gptuser.setFieldsInPropertiesForm(user);
			
			gptmain.getStartupData();
			});
		},
	callbackDelete:function(){gptmain.cmdCentral('cmdUserDelete');},
			
	callbackDeleteConfirm:function(retMode, apicmd)
		{
		if (retMode == modal.modalParams.exit.exitYes)
			{
			if (gptmain.selectedItem.f_id > 0)
				{
				gptuser.updateUser(gptmain.selectedItem,'userdelete',function()
					{
					if (gptmain.selectedItem.f_typeid == defines.usertype.player)
						gptmain.setStatusLabel("player deleted");
					else
						gptmain.setStatusLabel("coach deleted");
			
					gptmain.getStartupData();
					});
				}
			}
		else
			gptmain.processMainBack();
		},
	
	getLoginUser:function(obj)
		{				
		gptmain.waitingFlag = true;

		gptcomm.processServerApi('userget', obj, async function(obj,apiCmd)
			{
			gptmain.waitingFlag = false;
		
			if ( (obj == undefined) || (obj.f_id <= 0) )
				{
				modal.displayModalOpen ("WARNING","Contact your coach",
								null, null,	modal.modalParams.mode.modeOk,
								function(retMode, apicmd)
					{
					gptuser.loadConfig('cmdUserLogin');
					});
				}
			else
				{
				gptmain.loginUser = obj;

				await gptindb.writeToDB(gptindb.dbobj_login,gptmain.loginUser)

				gptmain.getStartupData(function()
					{
					gptmain.showFrontPage();
					kwbball.buildBottomMenu(gptmain.loginUser.f_typeid);
					});
				}
			});

		gptmain.waitToComplete(null);
		},
	
	onclickLoginSubmit:function(e)
		{
		var obj = new defines.objUser();
		
		obj.f_fname = $('#f_user_login_fname').val();
		obj.f_lname = $('#f_user_login_lname').val();

		if (gptuser.validate(obj) == true)
			gptuser.getLoginUser(obj);
		},
			
	onclickLoginClose:function(e)
		{
		document.getElementById('KWBBallBody').style.display = 'none';
		},
	loadConfig:async function (cmdId,args)
		{
		gptuser.cmdid = cmdId;
		// need to do this here
		gptut.setDivShowState('idMainCmdContent',false,false);

		if ( 	(cmdId == 'cmdPlayerNew') || 
					(cmdId == 'cmdPlayerEdit') || 
					(cmdId == 'cmdCoachNew') || 
					(cmdId == 'cmdCoachEdit') || 
					(cmdId == 'cmdUserProfile') )
			{
			gptut.setShowState('divUserProperties',true);
			
			gptut.setShowState('divPlayerProperties',(cmdId == 'cmdPlayerNew') || 
								(cmdId == 'cmdPlayerEdit') || 
							(	(cmdId == 'cmdUserProfile') && 
								(gptmain.loginUser.f_typeid >= defines.usertype.player) ) )
			
			gptlist.buildTeamDropdown('f_user_team',gptmain.teamList);
			gptlist.buildClassYearDropdown('f_user_classyear');
			gptuser.initializePitchTypeList('tblPitchType');

			gpttb.tableAddResultsToTable(gptmain.pitchtypeList,null,'tblPitchType',null,function()
				{
				var cmds = new gptmain.objMainCmds();
				cmds.f_callbackSave = gptuser.callbackSave;
				gptmain.registerCmds(cmds);

				if (cmdId == 'cmdPlayerNew')
					{
					var user = new defines.objUser();
					user.f_typeid = defines.usertype.player;
					}
				else if (cmdId == 'cmdCoachNew')
					{
					var user = new defines.objUser();
					user.f_typeid = defines.usertype.coach;
					}
				else if (cmdId == 'cmdUserProfile')
					var user = gptmain.loginUser;
				else if (cmdId == 'cmdPlayerEdit')
					var user = gptmain.selectedItem;
				else if (cmdId == 'cmdCoachEdit')
					var user = gptmain.selectedItem;

				gptuser.setFieldsInPropertiesForm(user);
				});
			}

		else if ( (cmdId == 'cmdPlayerDelete') || (cmdId == 'cmdCoachDelete') )
			{
			if (gptmain.selectedItem == undefined)
				return;
		
			var username = gptmain.selectedItem.f_fname + ' ' + gptmain.selectedItem.f_lname;
			var type = 'PLAYER';
			if (gptmain.selectedItem.f_typeid == defines.usertype.coach)
				var type = 'COACH';
				
			modal.displayDeleteConfirmation("Confirm", 
					"Are you sure you want to delete " + type + ": '" + username + " ' from the system", null, null,
					gptuser.callbackDeleteConfirm);
			}
	
		else if (cmdId == 'cmdUserRefresh')
			{
/*
			var obj = gptmain.activeUser;
			gptuser.loadConfig(gptuser.cmdid, {'getobject':false});
			gptmain.activeUser = obj;
			gptuser.setFieldsInPropertiesForm(gptmain.activeUser);
			gptmain.cmdDisplayLabel(gptuser.cmdid);
*/
			}
		else if (cmdId == 'cmdUserLogin')
			{
			var obj = await gptmain.getIndexDBLogin();

			if ( (obj != undefined) && (obj.f_id > 0) )
				{
				gptuser.getLoginUser(obj);
				return;
				}
			else
				{
				gptut.setShowState('divUserLogin',true);
				$('#f_user_login_fname').val('');
				$('#f_user_login_lname').val('');
				
				var elem = document.getElementById('btnUserLoginSubmit');
				elem.addEventListener("click", this.onclickLoginSubmit);

				var elem = document.getElementById('btnLoginClose');
				elem.addEventListener("click", this.onclickLoginClose);

				gptut.setShowState('cmdMainBack',false);
				}
			}
		},
};




