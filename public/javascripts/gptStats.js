var gptstat = 
	{
	activePitchlist = undefined,
	activePitchtypelist = undefined,
	
	interpolateValue:function(value) 
		{
		value = parseInt(value);

		if (value >= 85)
			{
			var bgcolor = 'rgb(255,0,0)'; //red
			var color = '#FFFFFF';
			}
		else if ( (value < 85) && (value > 70) )
			{
			var bgcolor = 'rgb(' + 255 + ',' + 125 + ',' + 0 + ')'; //orange
			var color = '#FFFFFF';
			}
		else if ( (value < 70) && (value > 55) )
			{
			var bgcolor = 'rgb(' + 255 + ',' + 255 + ',' + 0 + ')'; //yellow
			var color = '#000000';
			}
		else if ( (value < 60) && (value > 40) )
			{
			var bgcolor = 'rgb(' + 0 + ',' + 255 + ',' + 0 + ')'; //green
			var color = '#000000';
			}
		else if ( (value < 40) && (value > 25) )
			{
			var bgcolor = 'rgb(' + 0 + ',' + 255 + ',' + 125 + ')'; //turquose
			var color = '#000000';
			}
		else if ( (value < 25) && (value > 10) )
			{
			var bgcolor = 'rgb(' + 0 + ',' + 255 + ',' + 255 + ')'; //cyan
			var color = '#000000';
			}
		else if (value < 10)
			{
			var bgcolor = 'rgb(0,0,255)'; //blue
			var color = '#FFFFFF';
			}
			
		return({'color':color,'bgcolor':bgcolor});
		},
   
	onchangeStatShowPitchType:function(e)
		{
		if (e)
			e.stopPropagation();
		
		typeid = $('#f_statshow_pitchtype').val();

		var pitchtypelist = gptstat.activePitchtypelist;

		for(var i = 0; i < pitchtypelist.length; i++)
			{
			if (typeid == pitchtypelist[i].f_typeid)
				{
				document.getElementById('labelStatShowPitchCount').textContent = pitchtypelist[i].f_pc;
				var percent = 100 * gptma.mathTrunc(pitchtypelist[i].f_percent,2);
				document.getElementById('labelStatShowPercent').textContent = percent + '%';
				document.getElementById('labelStatShowHitCount').textContent = pitchtypelist[i].f_hl;
				}
			}

		var regions = gptsession.buildRegionsArray();
		var pitchlist = gptstat.activePitchlist;

		for (var i = 0; i < regions.length; i++)
			{
			var region = regions[i];
			
			for (var j = 0; j < pitchlist.length; j++)
				{
				var pitch = pitchlist[j];
			
				if ( (typeid == 0) || (typeid == pitch.f_typeid) )
					{
					var callregion = gptsession.getRegionByPitchBox(pitch.f_cl);
					var hitregion = gptsession.getRegionByPitchBox(pitch.f_hl);

					if (region.f_name == callregion)
						{
						region.f_numcall++;
					
						if (callregion == hitregion)
							region.f_numhit++;
						}
					}
				}
			}
		
		for (var i = 0; i < regions.length; i++)
			{
			var region = regions[i];
			
			if (region.f_numcall > 0)
				{
				var percent = 0;
				percent = gptma.mathTrunc(region.f_numhit / region.f_numcall, 2) * 100;
				var colorset = gptstat.interpolateValue(percent)
				region.f_bgcolor = colorset.bgcolor;
				region.f_color = colorset.color;
				region.f_label = percent + '%';
				}
			else
				{
//				region.f_bgcolor = region.f_base_bgcolor;
//				region.f_color = region.f_base_color;
//				region.f_label = '';
				}
			}
	
		gptsession.buildPitchBox(regions,gptsession.divMapPitchId);
		},
		
	buildStatShowPitchTypeList:function(pitchlist)
		{
		objPitchData = function(name,typeid)
			{
			this.f_name = name;
			this.f_typeid = typeid;
			this.f_pc = 0;
			this.f_hl = 0;
			this.f_percent = 0;
			};		
		var compresslist = [];
		compresslist.push(new objPitchData('ALL',0));
		for (var i = 0; i < pitchlist.length; i++) 
            {
			var found = false;
			for (var j = 0; j < compresslist.length; j++)
				{
				if (pitchlist[i].f_typeid == compresslist[j].f_typeid)
					{
					found = true;
					break;
					}
				}
			if (found == false)
				{
				var name = gptlist.getIdFromList(gptmain.pitchtypeList,'f_id',pitchlist[i].f_typeid,'f_name')
				compresslist.push(new objPitchData(name,pitchlist[i].f_typeid))
				}
				
			for (var j = 0; j < compresslist.length; j++)
				{
				if ( 	(compresslist[j].f_typeid == 0) ||
						(pitchlist[i].f_typeid == compresslist[j].f_typeid) )
					{
					compresslist[j].f_pc++;
					
					if (pitchlist[i].f_cl == pitchlist[i].f_hl)
						compresslist[j].f_hl++;
					}
				}

			for (var j = 0; j < compresslist.length; j++)
				{
				if (compresslist[j].f_pc <= 0)
					compresslist[j].f_percent = 0;
				else
					compresslist[j].f_percent = compresslist[j].f_hl / compresslist[j].f_pc;
				}
			}
		return(compresslist)
		},
		
	buildStatShowPitchTypeDropdown:function(list)
		{
		var $elem = $('#'+ 'f_statshow_pitchtype');

		$elem.find('option').remove();

		for (var i = 0; i < list.length; i++) 
			{
			var option = new Option (list[i].f_name,list[i].f_typeid);
            $elem.append($(option));
			}
			
		$elem.val(0);
		},
		
	showPitchMap:function(pitchlist)
		{
		if ( (pitchlist == undefined) || (pitchlist.length <= 0) )
			return;
		
		gptstat.activePitchlist = pitchlist;	
		gptstat.activePitchtypelist = gptstat.buildStatShowPitchTypeList(pitchlist)
		
		gptstat.buildStatShowPitchTypeDropdown(gptstat.activePitchtypelist);
		
		var selectElem = document.getElementById("f_statshow_pitchtype");
		selectElem.addEventListener("change",gptstat.onchangeStatShowPitchType);

		gptstat.onchangeStatShowPitchType();
		},
	processonclickMap:async function (id, showMap)
		{
		gptut.removeClassAllElements('selectedRow');
		gptut.removeClassAllElements('aPush');
		
		if (showMap != true)
			{
			var divElem = document.getElementById('divStatResultsTable')
			divElem.style.flex = '0 0 100%';

			var divElem = document.getElementById('divStatResultsMap')
			divElem.style.flex = '0 0 0%';
			
			return;
			}
		else
			{
			var divElem = document.getElementById('divStatResultsTable')
			divElem.style.flex = '0 0 50%';

			var divElem = document.getElementById('divStatResultsMap')
			divElem.style.flex = '0 0 50%';

			var btnElem = document.getElementById(id)
			var trElem =  document.getElementById('tr_' + id)
			
			if (! btnElem)
				return;
	
			btnElem.classList.add('aPush');
			trElem.classList.add('selectedRow');
		
			var pitchlist = btnElem.getAttribute('data-pitchlist');

			if (pitchlist != undefined)
				{
				pitchlist = JSON.parse(pitchlist);
				gptstat.showPitchMap(pitchlist);
				}
			else
				{
				await gptstat.getSessionPitchList(id,function(results,apiCmd)
					{
					var pitchlist = results;
					btnElem.setAttribute('data-pitchlist',JSON.stringify(pitchlist));
				
					gptstat.showPitchMap(pitchlist);
					});
				}
			}
		},
	onclickMap:function (e)
		{
		e.stopPropagation();
		
		var btnElem = e.target;

		var showMap = ! btnElem.classList.contains ('aPush');
		
		gptstat.processonclickMap(e.target.id,showMap);
		},
		
	getSessionPitchList:function(sessionid,callback)
		{
		gptmain.waitingFlag = true;
		var obj = {'sessionid': sessionid};
		gptcomm.processServerApi('getpitchlistbysessionid', obj, function(results,apiCmd)
			{
			callback(results,apiCmd)
		
			gptmain.waitingFlag = false;
			});

		gptmain.waitToComplete();
		},
		
	generateSummaryResultTable:function(tblName,results,search)
		{
		gptut.setShowState('divStatResultsParentId',false);
		gptut.deleteElementChildren('divStatResultsParentId');
		
		if ( (results == undefined) || (results.length <= 0) )
			return;
			
		var tablePitchTypeOrder = [];
		// first build list of pitchtypes and the order
		for (var i = 0; i < results.length; i++)
			{
			for (var j = 0; j < results[i].f_results.length; j++)
				{
				var pitchtype = results[i].f_results[j];
		
				var found = false;
				for (var k = 0; k < tablePitchTypeOrder.length; k++)
					{
					if (tablePitchTypeOrder[k].f_typeid == pitchtype.f_typeid)
						{
						found = true;
						break;
						}
					}
				
				if (found != true)
					tablePitchTypeOrder.push(pitchtype)
				}
			}
			
			
		//build table
		var tableElem = document.createElement('table');
		tableElem.id = tblName;
		tableElem.classList.add('pitchtable');
		tableElem.classList.add('display');
		tableElem.classList.add('table');
		tableElem.classList.add('table-striped');
		tableElem.classList.add('table-bordered');
		tableElem.classList.add('table-sm');
		
		var parentElem = document.getElementById('divStatResultsParentId');
		parentElem.appendChild(tableElem);
		
		var theadElem = document.createElement('thead');
		tableElem.appendChild(theadElem)
		
		var tr1Elem = document.createElement('tr');
		theadElem.appendChild(tr1Elem);
		
		var tr2Elem = document.createElement('tr');
		theadElem.appendChild(tr2Elem)
		
		var thElem = document.createElement('th');
		tr1Elem.appendChild(thElem)
		thElem.colSpan = 5;
		thElem.innerHTML = ' '
	
		// header rows
		var thElem = document.createElement('th');
		tr2Elem.appendChild(thElem)
		thElem.innerHTML = 'Pitch Map';
			
		if (search.primarysearchtypeid == defines.searchtype.player)
			{		
			var thElem = document.createElement('th');
			tr2Elem.appendChild(thElem)
			thElem.innerHTML = 'Opponent'
			
			var thElem = document.createElement('th');
			tr2Elem.appendChild(thElem)
			thElem.innerHTML = 'Umpire';
			}
		else if (	(search.primarysearchtypeid == defines.searchtype.umpire) ||
					(search.primarysearchtypeid == defines.searchtype.team) ||
					(search.primarysearchtypeid == defines.searchtype.classyear) )
			{
			var thElem = document.createElement('th');
			tr2Elem.appendChild(thElem)
			thElem.innerHTML = 'Player';
			
			var thElem = document.createElement('th');
			tr2Elem.appendChild(thElem)
			thElem.innerHTML = 'Opponent';			
			}
		else if (search.primarysearchtypeid == defines.searchtype.opponent)
			{
			var thElem = document.createElement('th');
			tr2Elem.appendChild(thElem)
			thElem.innerHTML = 'Player';
			
			var thElem = document.createElement('th');
			tr2Elem.appendChild(thElem)
			thElem.innerHTML = 'Umpire';
			}
		
		var thElem = document.createElement('th');
		tr2Elem.appendChild(thElem)
		thElem.innerHTML = 'Type';
		
		var thElem = document.createElement('th');
		tr2Elem.appendChild(thElem)
		thElem.innerHTML = 'Date';

		for (var i = 0; i < tablePitchTypeOrder.length; i++)
			{
			// top header row - pitchtype (2 seam / 4 seam / etc)
			if ( (tablePitchTypeOrder[i].f_name != undefined) && (tablePitchTypeOrder[i].f_name != '') )
				var pitchtypeStr = tablePitchTypeOrder[i].f_name;
			else
				{
				if (	(search.primarysearchtypeid == defines.searchtype.player) &&
						(search.secondarysearchtypeid == defines.searchtype.pitchaction) )
					var pitchtypeStr = gptlist.getIdFromList(gptmain.pitchactionList,'f_id',tablePitchTypeOrder[i].f_typeid,'f_name')
				else
					var pitchtypeStr = gptlist.getIdFromList(gptmain.pitchtypeList,'f_id',tablePitchTypeOrder[i].f_typeid,'f_name')
				}
			var thElem = document.createElement('th');
			tr1Elem.appendChild(thElem)
			thElem.colSpan = pitchtype.f_results.length;
			thElem.innerHTML = pitchtypeStr;		

			// second header row - action type (called balled / foul / etc)
			var pitchtype = results[0].f_results[0];

			for (var j = 0; j < pitchtype.f_results.length; j++)
				{
				var result = pitchtype.f_results[j];

				if ( (result.f_name == undefined) || (result.f_name == '') )
					result.f_name = gptlist.getIdFromList(gptmain.pitchactionList,'f_id',result.f_id,'f_name')
		
				var thElem = document.createElement('th');
				tr2Elem.appendChild(thElem)
				thElem.innerHTML = result.f_name;
				}
			}

		// add body rows
		var tbodyElem = document.createElement('tbody');
		tableElem.appendChild(tbodyElem)

		for (var k = 0; k < results.length; k++)
			{
			var resultrow = results[k];

			var trElem = document.createElement('tr');
			trElem.id = 'tr_' + resultrow.f_id;

			tbodyElem.appendChild(trElem)
			
			// add map button
			var tdElem = document.createElement('td');
			var btnElem = document.createElement('button');
			btnElem.id = resultrow.f_id; // session id
			btnElem.textContent = "VIEW";
			btnElem.onclick = function(e) { gptstat.onclickMap(e); };
			btnElem.classList.add('aTable');
			tdElem.appendChild(btnElem);
			trElem.appendChild(tdElem);
			
			if (search.primarysearchtypeid == defines.searchtype.player)
				{
				var tdElem = document.createElement('td');
				trElem.appendChild(tdElem)
				tdElem.innerHTML = resultrow.f_opponent;
				
				var tdElem = document.createElement('td');
				trElem.appendChild(tdElem)
				tdElem.innerHTML = resultrow.f_umpire;
				}
			else if (search.primarysearchtypeid == defines.searchtype.opponent)
				{
				var playerName = gptlist.getIdFromList(gptmain.playerList,'f_id',resultrow.f_playerid,'f_fullname')
				var tdElem = document.createElement('td');
				trElem.appendChild(tdElem)
				tdElem.innerHTML = playerName;
				
				var tdElem = document.createElement('td');
				trElem.appendChild(tdElem)
				tdElem.innerHTML = resultrow.f_umpire;
				}
			else if (	(search.primarysearchtypeid == defines.searchtype.umpire) ||
						(search.primarysearchtypeid == defines.searchtype.team) ||
						(search.primarysearchtypeid == defines.searchtype.classyear) )
				{
				var playerName = gptlist.getIdFromList(gptmain.playerList,'f_id',resultrow.f_playerid,'f_fullname')
				var tdElem = document.createElement('td');
				trElem.appendChild(tdElem)
				tdElem.innerHTML = playerName;
				
				var tdElem = document.createElement('td');
				trElem.appendChild(tdElem)
				tdElem.innerHTML = resultrow.f_opponent;
				}
			var typeStr = gptlist.getIdFromList(gptmain.sessionList,'f_id',resultrow.f_typeid,'f_name');
			var tdElem = document.createElement('td');
			trElem.appendChild(tdElem)
			tdElem.innerHTML = typeStr;
			
			var dateStr = gptdt.convertUTCToLocalDateFormat(resultrow.f_date_startdateandtime,'mm/dd/yyyy ampmHH:ampmMM ampm');
			var tdElem = document.createElement('td');
			trElem.appendChild(tdElem)
			tdElem.innerHTML = dateStr;

			for (var i = 0; i < tablePitchTypeOrder.length; i++)
				{
				var typeIndex = -1;
				for (var n = 0; n < resultrow.f_results.length; n++)
					{	
					var pitchtype = resultrow.f_results[n];
					if (tablePitchTypeOrder[i].f_typeid == pitchtype.f_typeid)
						{
						typeIndex = n;
						break;
						}
					}

				if (typeIndex >= 0)
					{
					var pitchtype = resultrow.f_results[typeIndex];
					
					for (var m = 0; m < pitchtype.f_results.length; m++)		
						{	
						var tdElem = document.createElement('td');
						trElem.appendChild(tdElem)
						tdElem.innerHTML = pitchtype.f_results[m].f_c;
						}
					}
				else
					{
					var pitchtype = resultrow.f_results[0];
					for (var m = 0; m < pitchtype.f_results.length; m++)		
						{	
						var tdElem = document.createElement('td');
						trElem.appendChild(tdElem)
						tdElem.innerHTML = '';
						}
					}
				}
			}
/*
		var table = $('#' + tblName).dataTable({
					searching: false,
					info: false,
					paging:false,
					scrollX:true,
					scrollY:"400px",
					scrollCollapse:true,
					ordering:false,
					fixedColumns:true
					});				
*/
		gptut.setShowState('divStatResultsParentId',true);    
	
		gptmain.browserResize();
		},
		
	onclickStatResultTable:function(e)
		{
		var elem = document.getElementById('divStatsResults');
		
		if (elem.style.display === "none")
			var show = true;
		else 
			var show = false;

		gptut.setDivShowState('idMainCmdContent',false,false);
	
		gptut.setShowState('divStats',!show);
		
		gptstat.processonclickMap('',false);
		
		gptmain.registerCmds(null);
		if (show == true)
			{
			gptut.setShowState('divStatsResults',show);
			
			var cmds = new gptmain.objMainCmds();
			cmds.f_callbackBack = function(){gptstat.onclickStatResultTable()};
			gptmain.registerCmds(cmds);
			}
		},

	showStatResults:function(results,search)
		{
		var tblName = "tblStatResults";

		if (search.primarysearchtypeid == defines.searchtype.player)
			{
			var playerName = gptlist.getIdFromList(gptmain.playerList,'f_id',search.primaryvalue,'f_fullname')
		
			if (search.secondarysearchtypeid == defines.searchtype.pitchtype)
				var sublabel = 'Pitch Type: ' + gptlist.getIdFromList(gptmain.pitchtypeList,'f_id',
															search.secondaryvalue,'f_name')
			else if (search.secondarysearchtypeid == defines.searchtype.pitchaction)
				var sublabel = 'Pitch Action: ' + gptlist.getIdFromList(gptmain.pitchactionList,'f_id',
															search.secondaryvalue,'f_name')
			else if (search.secondarysearchtypeid == defines.searchtype.batter)
				var sublabel = 'Batter Stance: ' + gptlist.getIdFromList(gptmain.batterList,'f_id',
															search.secondaryvalue,'f_name')
			else
				var sublabel = 'Summary'
			
			document.getElementById('labelResultsHeader').innerHTML = 'Player: ' + playerName + ' - ' + sublabel;
			}
						
		else if (search.primarysearchtypeid == defines.searchtype.umpire)
			document.getElementById('labelResultsHeader').innerHTML = 'Umpire: ' + search.primaryvalue;	

		else if (search.primarysearchtypeid == defines.searchtype.opponent)
			document.getElementById('labelResultsHeader').innerHTML = 'Opponent: ' + search.primaryvalue;	

		else if (search.primarysearchtypeid == defines.searchtype.classyear)
			document.getElementById('labelResultsHeader').innerHTML = 'Class: ' + search.primaryvalue;	

		else if (search.primarysearchtypeid == defines.searchtype.team)
			{
			var label = gptlist.getIdFromList(gptmain.teamList,'f_id',search.primaryvalue,'f_name');
			document.getElementById('labelResultsHeader').innerHTML = 'Team: ' + label;
			}

		if ( (results == undefined) || (results.length <= 0) )
			{
			gptmain.cmdCentral('cmdStatsNoResults');
			return;	
			}

		gptstat.generateSummaryResultTable(tblName,results,search);

		var divElem = document.getElementById('divStatResultsParentId'); //('divStatsResults')
		divElem.addEventListener('click', gptstat.onclickStatResultTable);
		
		gptstat.onclickStatResultTable();
		},	
		
	validateSearch:function(search)
		{
		if ( (search.primaryvalue == undefined) || (search.primaryvalue.length <= 0) )
			{
			var name = gptlist.getIdFromList(gptmain.statsearchList,'f_id',search.primarysearchtypeid,'f_name')
			
			modal.displayModalOpen ("WARNING","You must select a '" + name + "' from list",
								null, null,	modal.modalParams.mode.modeOk,null);
			return (false);
			}
		
		return(true);
		},
	
	onclickStatSearchFind:function(e)
		{
		var selectElem = document.getElementById('divStatSearchSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))
	
		var search_primarysearchtypeid = list[index].f_id;
		var search_primaryvalue = $('#f_statsearch_primary_value').val();
		
		var search_secondarysearchtypeid = $('#f_statsearch_secondary_select').val();
		if (search_secondarysearchtypeid == undefined)
			search_secondarysearchtypeid = 0;
		var search_secondaryvalue = $('#f_statsearch_secondary_value').val();
		var search_sessiontypeid = $('#f_statsearch_sessiontype').val();
		var search_daterange = $('#f_statsearch_daterange').val();
			
		var pitchtypelist = gptmain.pitchtypeList;
		var pitchactionlist = gptmain.pitchactionList;
			
		if (search_primarysearchtypeid == defines.searchtype.player)
			{
			var player = gptlist.getItemFromList(search_primaryvalue,gptmain.playerList)
			
			if (player != undefined)
				{
				var pitchtypelist = gptlist.getPlayerPitchList(player.f_pitchids,gptmain.pitchtypeList);
				var pitchactionlist = gptmain.pitchactionList;
				}			
			}

		search = {	'sessiontypeid': parseInt(search_sessiontypeid),
					'primarysearchtypeid':  parseInt(search_primarysearchtypeid),
					'primaryvalue' :  parseInt(search_primaryvalue),
					'secondarysearchtypeid':  parseInt(search_secondarysearchtypeid),
					'secondaryvalue' :  parseInt(search_secondaryvalue),
					'daterange': search_daterange,
					'pitchtypelist': pitchtypelist,
					'pitchactionlist': pitchactionlist
					};

		if ( 	(search.primarysearchtypeid == defines.searchtype.team) ||
				(search.primarysearchtypeid == defines.searchtype.umpire) ||
				(search.primarysearchtypeid == defines.searchtype.opponent) ||
				(search.primarysearchtypeid == defines.searchtype.classyear) )
			search.primaryvalue = search_primaryvalue;
		else
			search.primaryvalue = parseInt(search_primaryvalue);
			
		if (gptstat.validateSearch(search) != true)
			return(false);

		gptmain.waitingFlag = true;
		gptcomm.processServerApi('statsearch', search, function(results,apiCmd)
			{
			gptstat.showStatResults(results,search)
		
			gptmain.waitingFlag = false;
			});

		gptmain.waitToComplete();
		},
		
	onchangeStatSearchSecondary:function(e)
		{
		var secondaryid = $('#f_statsearch_secondary_select').val();

		if (secondaryid == undefined)
			secondaryid = 0;

		gptut.setShowState('f_statsearch_secondary_value',(secondaryid != 0))
	
		if (secondaryid == defines.searchtype.player)
			gptlist.listFromList(gptmain.playerList,'f_fullname','f_id','f_statsearch_secondary_value');

		else if (secondaryid == defines.searchtype.classyear)
			gptlist.listFromList(gptmain.classyearList,null,null,'f_statsearch_secondary_value');
			
		else if	(secondaryid == defines.searchtype.team)
			gptlist.listFromList(gptmain.teamList,'f_name','f_id','f_statsearch_secondary_value')
			
		else if (secondaryid == defines.searchtype.umpire)
			gptlist.listOptionValue(defines.tblSessions,'f_umpire','f_statsearch_secondary_value')

		else if	(secondaryid == defines.searchtype.opponent)
			gptlist.listOptionValue(defines.tblSessions,'f_opponent','f_statsearch_secondary_value')

		else if (secondaryid == defines.searchtype.batter)
			gptlist.listFromList(gptmain.batterList,'f_name','f_id','f_statsearch_secondary_value')

		else if (secondaryid == defines.searchtype.pitchtype)
			gptlist.listFromList(gptmain.pitchtypeList,'f_name','f_id','f_statsearch_secondary_value');
			
		else if (secondaryid == defines.searchtype.pitchaction)
			gptlist.listFromList(gptmain.pitchactionList,'f_name','f_id','f_statsearch_secondary_value')

		$('#f_statsearch_secondary_value').val('');		
	
		var label = gptlist.getIdFromList(gptmain.statsearchList,'f_id',secondaryid,'f_name');

		document.getElementById ('labelStatSearchSecondaryValueId').innerHTML = label;	
		
		gptut.setShowState('divStatSearchSecondaryValue',true);	
		},
	buildSecondarySearchSelect:function()
		{
		var selectElem = document.getElementById('divStatSearchSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))

		var secondarylist = [];
		if (list[index].f_id == defines.searchtype.player)
			{
			var secondarylist = [
							{'f_name':'Summary', 'f_id':0},
							{'f_name':defines.searchtype.str.batter, 'f_id':defines.searchtype.batter},
							{'f_name':defines.searchtype.str.pitchtype, 'f_id':defines.searchtype.pitchtype},
							{'f_name':defines.searchtype.str.pitchaction, 'f_id':defines.searchtype.pitchaction}
							];
			}
			
		gptut.setShowState('divStatSearchSecondarySelect',(secondarylist.length > 0))

		if (secondarylist.length > 0)
			{
			gptlist.listFromList(secondarylist,'f_name','f_id','f_statsearch_secondary_select');

//			var label = gptlist.getIdFromList(secondarylist,'f_id',secondarylist[0].f_id,'f_name');
//			document.getElementById ('labelStatSearchSecondaryValueId').innerHTML = label;
			
			var btnElem = document.getElementById('f_statsearch_secondary_select');
			btnElem.addEventListener("change",this.onchangeStatSearchSecondary);
			
			gptstat.onchangeStatSearchSecondary();
			}
		},
		
	onchangeStatSearchPrimaryValue:function()
		{
		gptut.setShowState('divStatSearchSecondarySelect',true);
		gptstat.buildSecondarySearchSelect();
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
		
		document.getElementById ('labelStatSearchPrimaryValueId').innerHTML = list[index].f_name;

		if (list[index].f_id == defines.searchtype.player)
			gptlist.listFromList(gptmain.playerList,'f_fullname','f_id','f_statsearch_primary_value');

		else if (list[index].f_id == defines.searchtype.classyear)
			gptlist.listFromList(gptmain.classyearList,null,null,'f_statsearch_primary_value');
			
		else if	(list[index].f_id == defines.searchtype.team)
			gptlist.listFromList(gptmain.teamList,'f_name','f_id','f_statsearch_primary_value')
			
		else if (list[index].f_id == defines.searchtype.umpire)
			gptlist.listOptionValue(defines.tblSessions,'f_umpire','f_statsearch_primary_value')

		else if	(list[index].f_id == defines.searchtype.opponent)
			gptlist.listOptionValue(defines.tblSessions,'f_opponent','f_statsearch_primary_value')

		else if (list[index].f_id == defines.searchtype.batter)
			gptlist.listFromList(gptmain.batterList,'f_name','f_id','f_statsearch_primary_value')

		else if (list[index].f_id == defines.searchtype.pitchtype)
			gptlist.listFromList(gptmain.pitchtypeList,'f_name','f_id','f_statsearch_primary_value');
			
		else if (list[index].f_id == defines.searchtype.pitchaction)
			gptlist.listFromList(gptmain.pitchactionList,'f_name','f_id','f_statsearch_primary_value')

		gptut.setShowState('divStatSearchPrimaryValue',true);
		$('#f_statsearch_primary_value').val('');		
	
		var btnElem = document.getElementById('f_statsearch_primary_value');
		btnElem.addEventListener("change",this.onchangeStatSearchPrimaryValue);
				
		gptut.setShowState('divStatSearchPrimaryValue',true);
		gptut.setShowState('divStatSearchSecondarySelect',false);
		gptut.setShowState('divStatSearchSecondaryValue',false);
			
		gptlist.buildSearchDateRangeDropdown('f_statsearch_daterange',(list[index].f_id == defines.searchtype.player));
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
					{'f_name':defines.searchtype.str.opponent, 'f_id':defines.searchtype.opponent}
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
			
			gptut.setShowState('divStatSearchPrimaryValue',false);
			gptut.setShowState('divStatSearchSecondarySelect',false);
			gptut.setShowState('divStatSearchSecondaryValue',false);
	
			gptstat.buildStatSearchList()
			
			gptlist.buildSessionTypeDropdown('f_statsearch_sessiontype',false);
		
			var findElem = document.getElementById('btnStatFind');
			findElem.addEventListener("click",this.onclickStatSearchFind);
	
			var cmds = new gptmain.objMainCmds();
			gptmain.registerCmds(cmds);
			}
		else if (cmdId == 'cmdStatsNoResults')
			{
			gptut.setShowState('divStatNoResultsMsg',true);
			}
		},
};
