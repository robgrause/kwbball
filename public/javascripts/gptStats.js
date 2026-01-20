var gptstat = 
	{	
	onclickStatSearchFind:function(e)
		{
		var selectElem = document.getElementById('divStatSearchSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))
	
	
		var searchstring = $('#f_statsearch_value').val();
console.log(searchstring);

		if (list[index].f_id == defines.searchtype.player)
			;
			
		else if (list[index].f_id == defines.searchtype.classyear)
			;
			
		else if	(list[index].f_id == defines.searchtype.team)
			;
			
		else if (list[index].f_id == defines.searchtype.umpire)
			;
			
		else if	(list[index].f_id == defines.searchtype.opponent)
			;
		else if (list[index].f_id == defines.searchtype.batter)
			;
		else if (list[index].f_id == defines.searchtype.pitchtype)
			;
			
		else if (list[index].f_id == defines.searchtype.pitchaction)
			;
		},
		
	onclickStatSearch:function(e)
		{
		var selectElem = document.getElementById('divStatSearchSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))
		
		if (e == undefined)
			index = 0;
		else if (e.target.id == 'divStatSearchDownId')
			index--;
		else
			index++;

		if (index < 0)
			index = list.length - 1;
		else if (index >= list.length)
			index = 0;

		selectElem.setAttribute('data-index',index);
		selectElem.innerHTML = list[index].f_name;
	
		if (list[index].f_id == defines.searchtype.player)
			gptlist.listFromList(gptmain.playerList,'f_fullname','f_fullname','list_StatSearch_Value');
			
		else if (list[index].f_id == defines.searchtype.classyear)
			gptlist.listFromList(gptmain.classyearList,null,null,'list_StatSearch_Value');
			
		else if	(list[index].f_id == defines.searchtype.team)
			gptlist.listFromList(gptmain.teamList,'f_name','f_name','list_StatSearch_Value')
			
		else if (list[index].f_id == defines.searchtype.umpire)
			gptlist.listValue(defines.tblSessions,'f_umpire','list_StatSearch_Value');
			
		else if	(list[index].f_id == defines.searchtype.opponent)
			gptlist.listValue(defines.tblSessions,'f_opponent','list_StatSearch_Value');
			
		else if (list[index].f_id == defines.searchtype.batter)
			gptlist.listFromList(gptmain.batterList,'f_name','f_name','list_StatSearch_Value')

		else if (list[index].f_id == defines.searchtype.pitchtype)
			gptlist.listFromList(gptmain.pitchtypeList,'f_name','f_name','list_StatSearch_Value');
			
		else if (list[index].f_id == defines.searchtype.pitchaction)
			gptlist.listFromList(gptmain.pitchactionList,'f_name','f_name','list_StatSearch_Value')

		gptut.setShowState("list_StatSearch_Value", false);
		
		$('#f_statsearch_value').val('');
		
		
		},
	buildStatSearchList:function()
		{
		var downElem = document.getElementById('divStatSearchDownId');
		downElem.addEventListener("click",this.onclickStatSearch);
		downElem.innerHTML = '<';
		
		var upElem = document.getElementById('divStatSearchUpId');
		upElem.addEventListener("click",this.onclickStatSearch);
		upElem.innerHTML = '>';

		var list = [
					{'f_name':defines.searchtype.str.player, 'f_id':defines.searchtype.player},
					{'f_name':defines.searchtype.str.classyear, 'f_id':defines.searchtype.classyear},
					{'f_name':defines.searchtype.str.team, 'f_id':defines.searchtype.team},
					{'f_name':defines.searchtype.str.umpire, 'f_id':defines.searchtype.umpire},
					{'f_name':defines.searchtype.str.opponent, 'f_id':defines.searchtype.opponent},
					{'f_name':defines.searchtype.str.batter, 'f_id':defines.searchtype.batter},
					{'f_name':defines.searchtype.str.pitchtype, 'f_id':defines.searchtype.pitchtype},
					{'f_name':defines.searchtype.str.pitchaction, 'f_id':defines.searchtype.pitchaction}
					];
		
		var selectElem = document.getElementById('divStatSearchSelectId');
		selectElem.addEventListener("click",this.onclickStatSearch);
		selectElem.setAttribute('data-list',JSON.stringify(list));
		selectElem.setAttribute('data-index',0);
		
		if (list.length > 0)
			selectElem.innerHTML = list[0].f_name;
			
		gptstat.onclickStatSearch();
		},
		
	loadConfig:function (cmdId,args)
		{
		if (cmdId == 'cmdStats')
			{
			gptut.setShowState('divStats',true);
			
			gptstat.buildStatSearchList()
			
			var findElem = document.getElementById('divStatSearchFindId');
			findElem.addEventListener("click",this.onclickStatSearchFind);
			findElem.innerHTML = 'FIND';
			}
		},
};
