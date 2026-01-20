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
      
	buildYearDropdown:function(cntId,nowYear)
		{
		var $elem = $('#'+ cntId);
		$elem.find('option').remove();
		var startYear = 2026;
		var endYear = startyear + 50;;
		for (var i = startYear; i <= endYear; i++) 
			{
			var option = new Option (i, i);
            $elem.append($(option));
			}
		$elem.val(nowYear);
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
	getItemFromList:function (id,list)
		{
		for (var i = 0; i < list.length; i++)
			{
			if (id == list[i].f_id)
				return(list[i]);
			}
		return(null);
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
		
	listPropertyCallback:function(results,params)
		{
		var $elem = $("#" + params.listId);
		$elem.find('option').remove();
		for (var i = 0; i < results.length; i++)
			{
			//var option = new Option ();
			//option.value = results[i].Field;
			//option.label = results[i].DisplayName;
			var option = new Option (results[i].DisplayName, results[i].Field);
			$elem.append(option);
			}
			
		// this is set for back button return to search screen
		if (gptcomm.gblListParams != undefined)
			$elem.val(gptcomm.gblListParams.fieldName)
		else
			$elem.val("");
		},

	listProperty:function(tblName,listId)
		{
		var listParams = new defines.objListParams('propertylist');
		listParams.tblName = tblName;
		listParams.listId = listId;

		gptcomm.getObjList(listParams, this.listPropertyCallback);
		},
	
	listValueCallback:function(results,params)
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
		},
		
	listValue:function(tblName, fieldName,listId)
		{
		var listParams = new defines.objListParams('valuelist');
		listParams.tblName = tblName;
		listParams.fieldName = fieldName;
		listParams.listId = listId;

		gptcomm.getObjList(listParams, this.listValueCallback);
		},
		
	listOptionValueCallback:function(results,params)
		{
		var $elem = $('#' + params.listId);
		$elem.find('option').remove();

		if (results.length <= 0)
			return;
			
		for (var i = 0; i < results.length; i++)
			{
			var val = results[i].trim();
			
			var option = new Option (val);
			$elem.append($(option));
			}

		$elem.val('');
		},
		
	listOptionValue:function(tblName, fieldName,listId)
		{
		var listParams = new defines.objListParams('valuelist');
		listParams.tblName = tblName;
		listParams.fieldName = fieldName;
		listParams.listId = listId;

		gptcomm.getObjList(listParams, this.listOptionValueCallback);
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




