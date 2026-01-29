var gptlist = 
	{
	mode : 'admin',
	cmdBackIds : [],

	getDisplayWeekDay:function(strDate)
		{
		var date = new Date(strDate);

		var displayDay = defines.dayNames[date.getDay()];
		return(displayDay);
		},

	getDisplayDayFromDayMonthYear:function(strDate)
		{
		var date = new Date(strDate);

		var displayDay = defines.dayNames[date.getDay()];
		var displayMonth = defines.monthAbbrevations[date.getMonth()];
		var displayDate = date.getDate();
		var displayYear = date.getFullYear();
		var display = displayDay + ', ' + displayMonth + ' ' + displayDate + ' ' + displayYear;
		return(display);
		},
    
    buildMonthDropdown:function(cntId)
		{
		var $elem = $('#'+ cntId);

		$elem.find('option').remove();

		for (var i = 0; i < defines.monthNames.length; i++) 
            {
			var option = new Option (defines.monthNames[i], i);
            $elem.append($(option));
			}
			
		$elem.val(0);
		},
 
 	buildMonthAbbrevationDropdown:function(cntId, nowMth)
        {
		var $elem = $('#'+ cntId);

		$elem.find('option').remove();
        for (var i = 0; i < defines.monthAbbrevations.length; i++) 
            {
			var option = new Option (defines.monthAbbrevations[i], i);
            $elem.append($(option));
			}
			
		$elem.val(nowMth);
        },
      
	buildSearchDateRangeDropdown:function(cntId,includecareer)
		{
		var $elem = $('#'+ cntId);
		$elem.find('option').remove();
		
		var option = new Option (defines.daterange.str.week, defines.daterange.week);
		$elem.append($(option));
		var option = new Option (defines.daterange.str.month, defines.daterange.month);
		$elem.append($(option));
		var option = new Option (defines.daterange.str.season, defines.daterange.season);
		$elem.append($(option));
	
		if ( (includecareer != undefined) && (includecareer == true) )
			{
			var option = new Option (defines.daterange.str.career, defines.daterange.career);
			$elem.append($(option));
			}

		var option = new Option (defines.daterange.str.all, defines.daterange.all);
		$elem.append($(option));

		$elem.val(defines.daterange.season);
		},
		
	getStatusName:function(status)
		{
		if (status == defines.status.active)
			return(defines.status.str.active);
		else if (status == defines.status.inactive)
			return(defines.status.str.inactive);
		},
	
	buildTeamDropdown:function(cntId,list)
		{
		var $elem = $('#'+ cntId);

		$elem.find('option').remove();
		for (var i = 0; i < list.length; i++)
			{
			var option = new Option (list[i].f_name, list[i].f_id);
			$elem.append($(option));
			}
		if (list.length > 0)
			$elem.val(list[0].f_name)
		},
	
	buildPlayerDropdown:function(cntId,list)
		{
		var $elem = $('#'+ cntId);

		$elem.find('option').remove();
		for (var i = 0; i < list.length; i++)
			{
			var username = list[i].f_fname + ' ' + list[i].f_lname;
			
			var option = new Option (username, list[i].f_id);
			$elem.append($(option));
			}
		if (list.length > 0)
			$elem.val(list[0].f_id)
		},
	
	getPlayerPitchList:function(pitchids,pitchlist)	
		{
		var list = [];	
		for (var i = 0; i < pitchids.length; i++)
			{
			var item = gptlist.getItemFromList(pitchids[i],pitchlist)
			if (item)
				list.push(item);
			}
			
		if (list.length <= 0)
			return(pitchlist)
		else
			return(list);
		},
	getItemFromList:function (id,list)
		{
		for (var i = 0; i < list.length; i++)
			{
			if (id == list[i].f_id)
				return(list[i]);
			}
		return(null);
		},
	
		
	getIdFromList:function(list,fieldSearchId,value,fieldId)
		{
		for (var i = 0; i < list.length; i++)
			{
			if (value == list[i][fieldSearchId])
				return(list[i][fieldId]);
			}
		return('')
		},
		
	buildClassYearDropdown:function(cntId)
		{
		var $elem = $('#'+ cntId);

		$elem.find('option').remove();
		for (var i = 2026; i < 2050; i++)
			{
			var option = new Option (i, i);
			$elem.append($(option));
			}
		
		$elem.val(2027)
		},
	buildStatusDropdown:function(cntId,includeAll)
		{
		var $elem = $('#'+ cntId);

		$elem.find('option').remove();
		
		if (includeAll == true)
			{
			var option = new Option (defines.status.str.all, defines.status.all);
			$elem.append($(option));
			}
		var option = new Option (defines.status.str.active, defines.status.active);
		$elem.append($(option));
		var option = new Option (defines.status.str.inactive, defines.status.inactive);
		$elem.append($(option));

		$elem.val(defines.status.active);
		},
	
	buildSessionTypeDropdown:function(cntId,includeAll)
		{
		var $elem = $('#'+ cntId);

		$elem.find('option').remove();
		
		if (includeAll == true)
			{
			var option = new Option (defines.sessiontype.str.all, defines.sessiontype.all);
			$elem.append($(option));
			}
			
		var option = new Option (defines.sessiontype.str.bullpen, defines.sessiontype.bullpen);
		$elem.append($(option));
		
		var option = new Option (defines.sessiontype.str.scrimmage, defines.sessiontype.scrimmage);
		$elem.append($(option));
		
		var option = new Option (defines.sessiontype.str.game, defines.sessiontype.game);
		$elem.append($(option));
		
		$elem.val(defines.sessiontype.game);
		},

	listFromList:function(results,fieldStr,fieldId,listId)
		{
		var $elem = $('#' + listId);
		$elem.find('option').remove();
		
		if (results.length <= 0)
			return;

		for (var i = 0; i < results.length; i++)
			{
			if ( (fieldStr != undefined) && (fieldStr.length > 0) )
				var option = new Option (results[i][fieldStr], results[i][fieldId]);
			else
				var option = new Option (results[i], results[i]);
				
			$elem.append($(option));
			}

		$elem.val('');
		},

	listValue:function(tblName, fieldName,listId,callback)
		{
		var listParams = new defines.objListParams('valuelist');
		listParams.tblName = tblName;
		listParams.fieldName = fieldName;
		listParams.listId = listId;
		
		gptmain.waitingFlag = true;
		gptcomm.getObjList(listParams, function(results,params)
			{
			var $elem = $('#' + params.listId);
			$elem.find('option').remove();
			if (results.length <= 0)
				return;

			for (var i = 0; i < results.length; i++)
				{
				var val = results[i];
			
				var option = new Option ();
				option.value = val;
				$elem.append($(option));
				}

			$elem.val('');
			
			gptmain.waitingFlag = false;
			});
			
		gptmain.waitToComplete(callback);
		},
		
	listOptionValue:function(tblName, fieldName,listId,callback)
		{
		var listParams = new defines.objListParams('valuelist');
		listParams.tblName = tblName;
		listParams.fieldName = fieldName;
		listParams.listId = listId;

		var $elem = $('#' + listId);
		$elem.find('option').remove();
			
		gptmain.waitingFlag = true;
		gptcomm.getObjList(listParams,function(results,params)
			{
			if (results.length <= 0)
				return;
			
			for (var i = 0; i < results.length; i++)
				{
				var val = results[i].trim();
			
				var option = new Option (val, val);
				$elem.append($(option));
				}

			$elem.val('');
			gptmain.waitingFlag = false;
			});
			
		gptmain.waitToComplete(callback);
		},
	listBuildFromList:function(list,cntlId)
		{
		var $elem = $('#' + cntlId);
		$elem.find('option').remove();

		if (list.length <= 0)
			return;
			
		for (var i = 0; i < list.length; i++)
			{
			var val = list[i].trim();
			
			var option = new Option (val);
			
			$elem.append($(option));
			}

		$elem.val('');
		},
};




