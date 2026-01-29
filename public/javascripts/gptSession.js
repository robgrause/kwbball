var gptsession = 
	{	
	divPitchId: 'divPitchParentId',
	typeid:undefined,
	player:undefined,
	session:undefined,
	
	results: [],
	regions : [],
	
	
	getDisplayString:function(data,fieldType,row,meta)
		{
		var retVal = '';
		if (fieldType == 'f_pitchtypeid')
			retVal = gptlist.getIdFromList(gptmain.pitchtypeList,'f_id',row.f_typeid,'f_name')
		else
			{
			var pc = 0;
			for (var i = 0; i < row.f_results.length; i++)
				{
				if (row.f_results[i].f_pc != 0)
					{
					pc = row.f_results[i].f_c;
					break;
					}
				}
			var colName = meta.settings.aoColumns[meta.col].ariaTitle;
			for (var i = 0; i < row.f_results.length; i++)
				{
				if (row.f_results[i].f_name != undefined)
					var testColname = row.f_results[i].f_name;
				else
					var testColname = gptlist.getIdFromList(gptmain.pitchactionList,'f_id',row.f_results[i].f_id,'f_name')

				if (colName == testColname)
					{
					if (row.f_results[i].f_pct != 0)
						{
						if (pc == 0)
							var percentage = ' (0%)';
						else
							{
							var percentage = 
								gptma.mathRoundup ((row.f_results[i].f_c / pc) * 100, 0);

							percentage = ' (' + percentage + '%)';
							}
						retVal = row.f_results[i].f_c + percentage;
						}
					else
						retVal = row.f_results[i].f_c;
					break;
					}
				}
			}
		return (retVal);
		},
	initializeSessionPitchList:function (tblName,columnlist)
		{
		gpttb.tableClear(tblName);
		
		var columns = [
						{ title: 'Pitch', data: null,
									render: function (data,type,row,meta){
									return (gptsession.getDisplayString(data, 'f_pitchtypeid', row,meta)); }},
						];
						
		var numtargets = [0];
		for (var i = 0; i < columnlist.length; i++)
			{
			if (columnlist[i].f_name != undefined)
				var field = columnlist[i].f_name;
			else
				var field = gptlist.getIdFromList(gptmain.pitchactionList,'f_id',columnlist[i].f_id,'f_name')
			
			columns.push (	{ title:field, data: null,
					render: function (data,type,row,meta){
					return (gptsession.getDisplayString(data,'',row,meta)); }})

			numtargets.push(numtargets.length)
			}
		
		var dataTable = $('#' + tblName).dataTable({
					columns: columns,
					columnDefs: [	{ className: 'text-center', targets:numtargets}, 
									{ targets:numtargets, 'width': '10px' }
									],
					searching: false,
					info: false,
					paging:false,
					scrollX:true,
					scrollY:"400px",
					scrollCollapse:true,
					ordering:false,
					fixedColumns:true,
					
					footerCallback: function (row, data, start, end, display) 
						{
						var totalPitchCount = 0;
						var totalStrikeCount = 0;
						for (var i = 0;	i < gptsession.session.f_results.length; i++) 
							{
							var result = gptsession.session.f_results[i];
							
							for(var k = 0; k < result.f_results.length; k++)
								{
								if (result.f_results[k].f_pc != 0)
									totalPitchCount = parseInt(totalPitchCount) +
												parseInt(result.f_results[k].f_c);
								
								else if (result.f_results[k].f_sc != 0)
									totalStrikeCount = parseInt(totalStrikeCount) +
												parseInt(result.f_results[k].f_c);
								}
							}
						for (var iCol = 0; 
								iCol < gptsession.session.f_results[0].f_results.length; iCol++) 
							{
							var total = 0;
							for (var iRow = 0; 
									iRow < gptsession.session.f_results.length; iRow++) 
								{
								var result = gptsession.session.f_results[iRow];
								
								total = parseInt(total) + parseInt(result.f_results[iCol].f_c);
								}
							
							if (gptsession.session.f_results[0].f_results[iCol].f_pct != 0) 
								{
								if (totalPitchCount == 0)
									var percent = 0;
								else
									var percent = gptma.mathRoundup ((total / totalPitchCount) * 100,0);
								
								total = total + ' (' + percent + '%)';
								}
							// update footer
							// need to add 1 to column index because first column
							// is not included in results array
							$($(row).children().get(iCol + 1)).html(total);
							}
						}
					});
		},
		
	initializeSessionResults:function(session)
		{
		var selectElem = document.getElementById('divPitchTypeSelectId');
		var typelist = JSON.parse(selectElem.getAttribute('data-list'));
		
		var selectElem = document.getElementById('divPitchActionSelectId');
		var actionlist = JSON.parse(selectElem.getAttribute('data-list'));

		session.f_results = 
					defines.initializeSessionResultSummary(typelist,actionlist,session.f_typeid);

		return(session);
		},	
		
	onclickPitchResultTable:function(e)
		{	
		var elem = document.getElementById('divPitchTableParentId');
		var parentElem = elem.parentNode;

		if (parentElem.id == 'divPitchDataId')
			{
			var newId = 'idMainCmdContent';
			var show = false;
			}	
		else if (parentElem.id == 'idMainCmdContent')
			{
			var newId =  'divPitchDataId';
			var show = true;
			}
			
		gptut.setShowState('divPitchMainId',show);
		
		var newparentElem = document.getElementById(newId);
		newparentElem.appendChild(elem);
		elem.style.width = document.documentElement.offsetWidth;
		elem.style.zIndex = 20000;
		},

	buildPitchTable:function()
		{	
		if (gptsession.session.f_results.length > 0)
			{
			// Dynamically add th elements to footer before initialization
			var footerTrElem = document.getElementById('tableFooterRow');
			for (var i = 0; i < gptsession.session.f_results[0].f_results.length; i++)
				{
				var thElem = document.createElement('th');
				footerTrElem.appendChild(thElem)
				}

			gptsession.initializeSessionPitchList('tblSessionPitches',
													gptsession.session.f_results[0].f_results);
													
			gpttb.tableAddResultsToTable(gptsession.session.f_results,null,'tblSessionPitches',null,null);
			}
			
		var tableElem = document.getElementById('tblSessionPitches')
		tableElem.addEventListener('click', gptsession.onclickPitchResultTable);
		},
		
	buildRegionsArray:function()
		{				
		//upper left
		var region1 = {'f_name':'region1','boxes':['c3r3','c3r4','c3r5','c4r3','c4r4','c4r5','c5r3','c5r4','c5r5']};
		//upper middle
		var region2 = {'f_name':'region2','boxes':['c6r3','c6r4','c6r5','c7r3','c7r4','c7r5','c8r3','c8r4','c8r5']};
		//upper right
		var region3 = {'f_name':'region3','boxes':['c9r3','c9r4','c9r5','c10r3','c10r4','c10r5','c11r3','c11r4','c11r5']};
	
		//middle left
		var region4 = {'f_name':'region4','boxes':['c3r6','c3r7','c3r8','c4r6','c4r7','c4r8','c5r6','c5r7','c5r8']};
		//middle middle
		var region5 = {'f_name':'region5','boxes':['c6r6','c6r7','c6r8','c7r6','c7r7','c7r8','c8r6','c8r7','c8r8']};
		//middle right
		var region6 = {'f_name':'region6','boxes':['c9r6','c9r7','c9r8','c10r6','c10r7','c10r8','c11r6','c11r7','c11r8']};
	
		//bottom left
		var region7 = {'f_name':'region7','boxes':['c3r9','c3r10','c3r11','c4r9','c4r10','c4r11','c5r9','c5r10','c5r11']};
		//bottom bottom
		var region8 = {'f_name':'region8','boxes':['c6r9','c6r10','c6r11','c7r9','c7r10','c7r11','c8r9','c8r10','c8r11']};
		//bottom right
		var region9 = {'f_name':'region9','boxes':['c9r9','c9r10','c9r11','c10r9','c10r10','c10r11','c11r9','c11r10','c11r11']};
	
	
		gptsession.regions = [];
		gptsession.regions.push(region1);
		gptsession.regions.push(region2);
		gptsession.regions.push(region3);
		gptsession.regions.push(region4);
		gptsession.regions.push(region5);
		gptsession.regions.push(region6);
		gptsession.regions.push(region7);
		gptsession.regions.push(region8);
		gptsession.regions.push(region9);
		},
				
	getRegionByPitchBox:function(pitchboxId)
		{
		for (var i = 0; i < gptsession.regions.length; i++)
			{
			var region = gptsession.regions[i];

			for (var j = 0; j < region.boxes.length; j++)
				{
				if (region.boxes[j] == pitchboxId)
					return(region)
				}
			}

		return(undefined);
		},
	
	onclickPitchBox:function(e)
		{
		var callelems = document.getElementsByClassName('pitchbox_call_highlight');
		var throwelems = document.getElementsByClassName('pitchbox_throw_highlight');

		if (callelems.length <= 0)
			gptsession.highlightElement(e.target.id,'pitchbox_call_highlight',true)
			
		else if (throwelems.length <= 0)
			gptsession.highlightElement(e.target.id,'pitchbox_throw_highlight',true)
			
		else 
			{
			gptut.removeClassAllElements('pitchbox_throw_highlight')
			gptsession.highlightElement(e.target.id,'pitchbox_call_highlight',true);
			}
		},
		
	highlightElement:function(id,highlightclass,highlight)
		{
		gptut.removeClassAllElements(highlightclass);
			
		var elem = document.getElementById(id);

		if (! elem)
			return;

		if (highlight == true)
			{
			if (!elem.classList.contains(highlightclass) )
				elem.classList.add(highlightclass);
				
			var region = gptsession.getRegionByPitchBox(id);
			if (region == undefined)
				return;
			
			for (var i = 0; i < region.boxes.length; i++)
				{
				var elem = document.getElementById(region.boxes[i]);

				if (! elem)
					continue;

				if (!elem.classList.contains(highlightclass) )
					elem.classList.add(highlightclass);
				}
			}
		},
	mouseoverAddToPitchBox:function (idElem)
		{
return
		var elem = document.getElementById(idElem);
		if (elem != undefined)
			elem.addEventListener('mouseover', gptsession.mouseoverPitchBox);
		},
	mouseleaveAddToPitchBox:function (idElem)
		{
return;
		var elem = document.getElementById(idElem);
		if (elem != undefined)
			elem.addEventListener('mouseleave', gptsession.mouseleavePitchBox);
		},
	mouseoverPitchBox:function(e)
		{
		var id = e.target.id;
		var elem = document.getElementById(id);
		
		gptsession.highlightElement(id,'pitchbox_highlight',true);
		},
	mouseleavePitchBox:function(e)
		{		
		var id = e.target.id;
		var elem = document.getElementById(id);

		gptsession.highlightElement(id,'pitchbox_highlight',false);		
		},
		
	onclickAddToPitchBox:function (idElem)
		{
		var elem = document.getElementById(idElem);
		if (elem != undefined)
			elem.addEventListener('click', gptsession.onclickPitchBox);
		},
	createDiv:function (elemid,classnames,attrs)
		{
		var parentid = gptsession.divPitchId;
		
		var divElem = document.createElement('div');
		divElem.id = elemid;
	
		if (classnames != undefined)
			{
			for (var i = 0; i < classnames.length; i++)
				divElem.classList.add(classnames[i])
			}
			
		if (attrs != undefined)
			gptut.applyAttrsToElem(divElem, attrs)
			
		var parentElem = document.getElementById(parentid);
		parentElem.appendChild(divElem)
		
		gptsession.mouseoverAddToPitchBox(divElem.id);
		gptsession.mouseleaveAddToPitchBox(divElem.id);
		gptsession.onclickAddToPitchBox(divElem.id);
		},
		
	buildPitchBox:function()
		{
		gptut.deleteElementChildren(gptsession.divPitchId);
			
		gptsession.buildRegionsArray()

		//--------------------------------------------------------------------------
		//								High
		//	------------------------------------------------------------------------
		//  |              |      |      |      |      |      |      |             |
		//  |     H1-H2    |       H3-H5        |        H6-H8       |    H9-H10   |  
		//  |              |      |      |      |      |      |      |             |
		//  ------------------------------------------------------------------------
		//  |              |      |      |      |      |      |      |             |
		//  |     H11-H12  |       H13-H15      |       H16-H18      |   H19-H20   |
		//  ------------------------------------------------------------------------
		//  |      |       |-----------------------------------------|      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |    Chalk line||                   |                   ||Chalk Line   |
		//  |      |       ||                   |                   ||      |      |
		//  |  R1  |  R2   ||---------------------------------------||  L1  |  L2  |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  ------------------------------------------------------------------------
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |  R3  |  R4   ||                   |                   ||  L3  |  L4  |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  ------------------------------------------------------------------------
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |  R5  |  R6   ||                   |                   ||  L5  |  L6  |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       ||                   |                   ||      |      |
		//  |      |       |-----------------------------------------|      |      |
		//  ------------------------------------------------------------------------
		//						Bottom Strike Zone
		//  |              |                    |                    |             |
		//  |     D1-D2    |      D3-D5         |      D6-D8         |   D9-D10    |
		//  |              |                    |                    |             |
		//  ---------------------------------------------------------
		//  |              |                    |                    |             |
		//  |     D11-D12  |      D13-D15       |      D16-D18       |     D19-D20 |
		//  |              |                    |                    |             |
		//  ------------------------------------------------------------------------
		//								 Low
		//--------------------------------------------------------------------------
		var attrs = [];
		var classes = ['pitchbox_ball','c1r1'];
		var pvElem = gptsession.createDiv('c1r1',classes,attrs);

		var classes = ['pitchbox_ball','c2r1'];
		var pvElem = gptsession.createDiv('c2r1',classes,attrs);

		var classes = ['pitchbox_ball','c3r1'];
		var pvElem = gptsession.createDiv('c3r1',classes,attrs);

		var classes = ['pitchbox_ball','c4r1'];
		var pvElem = gptsession.createDiv('c4r1',classes,attrs);

		var classes = ['pitchbox_ball','c5r1'];
		var pvElem = gptsession.createDiv('c5r1',classes,attrs);

		var classes = ['pitchbox_ball','c6r1'];
		var pvElem = gptsession.createDiv('c6r1',classes,attrs);

		var classes = ['pitchbox_ball','c7r1'];
		var pvElem = gptsession.createDiv('c7r1',classes,attrs);

		var classes = ['pitchbox_ball','c8r1'];
		var pvElem = gptsession.createDiv('c8r1',classes,attrs);

		var classes = ['pitchbox_ball','c9r1'];
		var pvElem = gptsession.createDiv('c9r1',classes,attrs);

		var classes = ['pitchbox_ball','c10r1'];
		var pvElem = gptsession.createDiv('c10r1',classes,attrs);
			
		var classes = ['pitchbox_ball','c11r1'];
		var pvElem = gptsession.createDiv('c11r1',classes,attrs);
		
		var classes = ['pitchbox_ball','c12r1'];
		var pvElem = gptsession.createDiv('c12r1',classes,attrs);
		
		var classes = ['pitchbox_ball','c13r1'];
		var pvElem = gptsession.createDiv('c13r1',classes,attrs);
		
		var classes = ['pitchbox_ball','c1r2'];
		var pvElem = gptsession.createDiv('c1r2',classes,attrs);

		var classes = ['pitchbox_ball','c2r2'];
		var pvElem = gptsession.createDiv('c2r2',classes,attrs);

		var classes = ['pitchbox_ball','c3r2'];
		var pvElem = gptsession.createDiv('c3r2',classes,attrs);

		var classes = ['pitchbox_ball','c4r2'];
		var pvElem = gptsession.createDiv('c4r2',classes,attrs);

		var classes = ['pitchbox_ball','c5r2'];
		var pvElem = gptsession.createDiv('c5r2',classes,attrs);

		var classes = ['pitchbox_ball','c6r2'];
		var pvElem = gptsession.createDiv('c6r2',classes,attrs);

		var classes = ['pitchbox_ball','c7r2'];
		var pvElem = gptsession.createDiv('c7r2',classes,attrs);

		var classes = ['pitchbox_ball','c8r2'];
		var pvElem = gptsession.createDiv('c8r2',classes,attrs);

		var classes = ['pitchbox_ball','c9r2'];
		var pvElem = gptsession.createDiv('c9r2',classes,attrs);

		var classes = ['pitchbox_ball','c10r2'];
		var pvElem = gptsession.createDiv('c10r2',classes,attrs);
			
		var classes = ['pitchbox_ball','c11r2'];
		var pvElem = gptsession.createDiv('c11r2',classes,attrs);

		var classes = ['pitchbox_ball','c12r2'];
		var pvElem = gptsession.createDiv('c12r2',classes,attrs);

		var classes = ['pitchbox_ball','c13r2'];
		var pvElem = gptsession.createDiv('c13r2',classes,attrs);

		var classes = ['pitchbox_ball','c1r3'];
		var pvElem = gptsession.createDiv('c1r3',classes,attrs);

		var classes = ['pitchbox_ball','c2r3'];
		var pvElem = gptsession.createDiv('c2r3',classes,attrs);

		var classes = ['pitchbox_strike','c3r3'];
		var pvElem = gptsession.createDiv('c3r3',classes,attrs);

		var classes = ['pitchbox_strike','c4r3'];
		var pvElem = gptsession.createDiv('c4r3',classes,attrs);

		var classes = ['pitchbox_strike','c5r3'];
		var pvElem = gptsession.createDiv('c5r3',classes,attrs);

		var classes = ['pitchbox_strike','c6r3'];
		var pvElem = gptsession.createDiv('c6r3',classes,attrs);

		var classes = ['pitchbox_strike','c7r3'];
		var pvElem = gptsession.createDiv('c7r3',classes,attrs);

		var classes = ['pitchbox_strike','c8r3'];
		var pvElem = gptsession.createDiv('c8r3',classes,attrs);

		var classes = ['pitchbox_strike','c9r3'];
		var pvElem = gptsession.createDiv('c9r3',classes,attrs);

		var classes = ['pitchbox_strike','c10r3'];
		var pvElem = gptsession.createDiv('c10r3',classes,attrs);
			
		var classes = ['pitchbox_strike','c11r3'];
		var pvElem = gptsession.createDiv('c11r3',classes,attrs);
			
		var classes = ['pitchbox_ball','c12r3'];
		var pvElem = gptsession.createDiv('c12r3',classes,attrs);
			
		var classes = ['pitchbox_ball','c13r3'];
		var pvElem = gptsession.createDiv('c13r3',classes,attrs);

		var classes = ['pitchbox_ball','c1r4'];
		var pvElem = gptsession.createDiv('c1r4',classes,attrs);

		var classes = ['pitchbox_ball','c2r4'];
		var pvElem = gptsession.createDiv('c2r4',classes,attrs);

		var classes = ['pitchbox_strike','c3r4'];
		var pvElem = gptsession.createDiv('c3r4',classes,attrs);

		var classes = ['pitchbox_strike','c4r4'];
		var pvElem = gptsession.createDiv('c4r4',classes,attrs);

		var classes = ['pitchbox_strike','c5r4'];
		var pvElem = gptsession.createDiv('c5r4',classes,attrs);

		var classes = ['pitchbox_strike','c6r4'];
		var pvElem = gptsession.createDiv('c6r4',classes,attrs);

		var classes = ['pitchbox_strike','c7r4'];
		var pvElem = gptsession.createDiv('c7r4',classes,attrs);

		var classes = ['pitchbox_strike','c8r4'];
		var pvElem = gptsession.createDiv('c8r4',classes,attrs);

		var classes = ['pitchbox_strike','c9r4'];
		var pvElem = gptsession.createDiv('c9r4',classes,attrs);

		var classes = ['pitchbox_strike','c10r4'];
		var pvElem = gptsession.createDiv('c10r4',classes,attrs);

		var classes = ['pitchbox_strike','c11r4'];
		var pvElem = gptsession.createDiv('c11r4',classes,attrs);
			
		var classes = ['pitchbox_ball','c12r4'];
		var pvElem = gptsession.createDiv('c12r4',classes,attrs);
			
		var classes = ['pitchbox_ball','c13r4'];
		var pvElem = gptsession.createDiv('c13r4',classes,attrs);
			
		var classes = ['pitchbox_ball','c1r5'];
		var pvElem = gptsession.createDiv('c1r5',classes,attrs);

		var classes = ['pitchbox_ball','c2r5'];
		var pvElem = gptsession.createDiv('c2r5',classes,attrs);

		var classes = ['pitchbox_strike','c3r5'];
		var pvElem = gptsession.createDiv('c3r5',classes,attrs);

		var classes = ['pitchbox_strike','c4r5'];
		var pvElem = gptsession.createDiv('c4r5',classes,attrs);

		var classes = ['pitchbox_strike','c5r5'];
		var pvElem = gptsession.createDiv('c5r5',classes,attrs);

		var classes = ['pitchbox_strike','c6r5'];
		var pvElem = gptsession.createDiv('c6r5',classes,attrs);

		var classes = ['pitchbox_strike','c7r5'];
		var pvElem = gptsession.createDiv('c7r5',classes,attrs);

		var classes = ['pitchbox_strike','c8r5'];
		var pvElem = gptsession.createDiv('c8r5',classes,attrs);

		var classes = ['pitchbox_strike','c9r5'];
		var pvElem = gptsession.createDiv('c9r5',classes,attrs);

		var classes = ['pitchbox_strike','c10r5'];
		var pvElem = gptsession.createDiv('c10r5',classes,attrs);

		var classes = ['pitchbox_strike','c11r5'];
		var pvElem = gptsession.createDiv('c11r5',classes,attrs);
			
		var classes = ['pitchbox_ball','c12r5'];
		var pvElem = gptsession.createDiv('c12r5',classes,attrs);
			
		var classes = ['pitchbox_ball','c13r5'];
		var pvElem = gptsession.createDiv('c13r5',classes,attrs);
			
		var classes = ['pitchbox_ball','c1r6'];
		var pvElem = gptsession.createDiv('c1r6',classes,attrs);

		var classes = ['pitchbox_ball','c2r6'];
		var pvElem = gptsession.createDiv('c2r6',classes,attrs);

		var classes = ['pitchbox_strike','c3r6'];
		var pvElem = gptsession.createDiv('c3r6',classes,attrs);

		var classes = ['pitchbox_strike','c4r6'];
		var pvElem = gptsession.createDiv('c4r6',classes,attrs);

		var classes = ['pitchbox_strike','c5r6'];
		var pvElem = gptsession.createDiv('c5r6',classes,attrs);

		var classes = ['pitchbox_strike','c6r6'];
		var pvElem = gptsession.createDiv('c6r6',classes,attrs);

		var classes = ['pitchbox_strike','c7r6'];
		var pvElem = gptsession.createDiv('c7r6',classes,attrs);

		var classes = ['pitchbox_strike','c8r6'];
		var pvElem = gptsession.createDiv('c8r6',classes,attrs);

		var classes = ['pitchbox_strike','c9r6'];
		var pvElem = gptsession.createDiv('c9r6',classes,attrs);

		var classes = ['pitchbox_strike','c10r6'];
		var pvElem = gptsession.createDiv('c10r6',classes,attrs);
						
		var classes = ['pitchbox_strike','c11r6'];
		var pvElem = gptsession.createDiv('c11r6',classes,attrs);

		var classes = ['pitchbox_ball','c12r6'];
		var pvElem = gptsession.createDiv('c12r6',classes,attrs);

		var classes = ['pitchbox_ball','c13r6'];
		var pvElem = gptsession.createDiv('c13r6',classes,attrs);

		var classes = ['pitchbox_ball','c1r7'];
		var pvElem = gptsession.createDiv('c1r7',classes,attrs);

		var classes = ['pitchbox_ball','c2r7'];
		var pvElem = gptsession.createDiv('c2r7',classes,attrs);

		var classes = ['pitchbox_strike','c3r7'];
		var pvElem = gptsession.createDiv('c3r7',classes,attrs);

		var classes = ['pitchbox_strike','c4r7'];
		var pvElem = gptsession.createDiv('c4r7',classes,attrs);

		var classes = ['pitchbox_strike','c5r7'];
		var pvElem = gptsession.createDiv('c5r7',classes,attrs);

		var classes = ['pitchbox_strike','c6r7'];
		var pvElem = gptsession.createDiv('c6r7',classes,attrs);

		var classes = ['pitchbox_strike','c7r7'];
		var pvElem = gptsession.createDiv('c7r7',classes,attrs);

		var classes = ['pitchbox_strike','c8r7'];
		var pvElem = gptsession.createDiv('c8r7',classes,attrs);

		var classes = ['pitchbox_strike','c9r7'];
		var pvElem = gptsession.createDiv('c9r7',classes,attrs);

		var classes = ['pitchbox_strike','c10r7'];
		var pvElem = gptsession.createDiv('c10r7',classes,attrs);

		var classes = ['pitchbox_strike','c11r7'];
		var pvElem = gptsession.createDiv('c11r7',classes,attrs);

		var classes = ['pitchbox_ball','c12r7'];
		var pvElem = gptsession.createDiv('c12r7',classes,attrs);

		var classes = ['pitchbox_ball','c13r7'];
		var pvElem = gptsession.createDiv('c13r7',classes,attrs);

		var classes = ['pitchbox_ball','c1r8'];
		var pvElem = gptsession.createDiv('c1r8',classes,attrs);

		var classes = ['pitchbox_ball','c2r8'];
		var pvElem = gptsession.createDiv('c2r8',classes,attrs);

		var classes = ['pitchbox_strike','c3r8'];
		var pvElem = gptsession.createDiv('c3r8',classes,attrs);

		var classes = ['pitchbox_strike','c4r8'];
		var pvElem = gptsession.createDiv('c4r8',classes,attrs);

		var classes = ['pitchbox_strike','c5r8'];
		var pvElem = gptsession.createDiv('c5r8',classes,attrs);

		var classes = ['pitchbox_strike','c6r8'];
		var pvElem = gptsession.createDiv('c6r8',classes,attrs);

		var classes = ['pitchbox_strike','c7r8'];
		var pvElem = gptsession.createDiv('c7r8',classes,attrs);

		var classes = ['pitchbox_strike','c8r8'];
		var pvElem = gptsession.createDiv('c8r8',classes,attrs);

		var classes = ['pitchbox_strike','c9r8'];
		var pvElem = gptsession.createDiv('c9r8',classes,attrs);

		var classes = ['pitchbox_strike','c10r8'];
		var pvElem = gptsession.createDiv('c10r8',classes,attrs);

		var classes = ['pitchbox_strike','c11r8'];
		var pvElem = gptsession.createDiv('c11r8',classes,attrs);
			
		var classes = ['pitchbox_ball','c12r8'];
		var pvElem = gptsession.createDiv('c12r8',classes,attrs);
			
		var classes = ['pitchbox_ball','c13r8'];
		var pvElem = gptsession.createDiv('c13r8',classes,attrs);
			
		var classes = ['pitchbox_ball','c1r9'];
		var pvElem = gptsession.createDiv('c1r9',classes,attrs);

		var classes = ['pitchbox_ball','c2r9'];
		var pvElem = gptsession.createDiv('c2r9',classes,attrs);

		var classes = ['pitchbox_strike','c3r9'];
		var pvElem = gptsession.createDiv('c3r9',classes,attrs);

		var classes = ['pitchbox_strike','c4r9'];
		var pvElem = gptsession.createDiv('c4r9',classes,attrs);

		var classes = ['pitchbox_strike','c5r9'];
		var pvElem = gptsession.createDiv('c5r9',classes,attrs);

		var classes = ['pitchbox_strike','c6r9'];
		var pvElem = gptsession.createDiv('c6r9',classes,attrs);

		var classes = ['pitchbox_strike','c7r9'];
		var pvElem = gptsession.createDiv('c7r9',classes,attrs);

		var classes = ['pitchbox_strike','c8r9'];
		var pvElem = gptsession.createDiv('c8r9',classes,attrs);

		var classes = ['pitchbox_strike','c9r9'];
		var pvElem = gptsession.createDiv('c9r9',classes,attrs);

		var classes = ['pitchbox_strike','c10r9'];
		var pvElem = gptsession.createDiv('c10r9',classes,attrs);

		var classes = ['pitchbox_strike','c11r9'];
		var pvElem = gptsession.createDiv('c11r9',classes,attrs);

		var classes = ['pitchbox_ball','c12r9'];
		var pvElem = gptsession.createDiv('c12r9',classes,attrs);

		var classes = ['pitchbox_ball','c13r9'];
		var pvElem = gptsession.createDiv('c13r9',classes,attrs);

		var classes = ['pitchbox_ball','c1r10'];
		var pvElem = gptsession.createDiv('c1r10',classes,attrs);

		var classes = ['pitchbox_ball','c2r10'];
		var pvElem = gptsession.createDiv('c2r10',classes,attrs);

		var classes = ['pitchbox_strike','c3r10'];
		var pvElem = gptsession.createDiv('c3r10',classes,attrs);

		var classes = ['pitchbox_strike','c4r10'];
		var pvElem = gptsession.createDiv('c4r10',classes,attrs);

		var classes = ['pitchbox_strike','c5r10'];
		var pvElem = gptsession.createDiv('c5r10',classes,attrs);

		var classes = ['pitchbox_strike','c6r10'];
		var pvElem = gptsession.createDiv('c6r10',classes,attrs);

		var classes = ['pitchbox_strike','c7r10'];
		var pvElem = gptsession.createDiv('c7r10',classes,attrs);

		var classes = ['pitchbox_strike','c8r10'];
		var pvElem = gptsession.createDiv('c8r10',classes,attrs);

		var classes = ['pitchbox_strike','c9r10'];
		var pvElem = gptsession.createDiv('c9r10',classes,attrs);

		var classes = ['pitchbox_strike','c10r10'];
		var pvElem = gptsession.createDiv('c10r10',classes,attrs);
			
		var classes = ['pitchbox_strike','c11r10'];
		var pvElem = gptsession.createDiv('c11r10',classes,attrs);

		var classes = ['pitchbox_ball','c12r10'];
		var pvElem = gptsession.createDiv('c12r10',classes,attrs);

		var classes = ['pitchbox_ball','c13r10'];
		var pvElem = gptsession.createDiv('c13r10',classes,attrs);
			
		var classes = ['pitchbox_ball','c1r11'];
		var pvElem = gptsession.createDiv('c1r11',classes,attrs);

		var classes = ['pitchbox_ball','c2r11'];
		var pvElem = gptsession.createDiv('c2r11',classes,attrs);

		var classes = ['pitchbox_strike','c3r11'];
		var pvElem = gptsession.createDiv('c3r11',classes,attrs);

		var classes = ['pitchbox_strike','c4r11'];
		var pvElem = gptsession.createDiv('c4r11',classes,attrs);

		var classes = ['pitchbox_strike','c5r11'];
		var pvElem = gptsession.createDiv('c5r11',classes,attrs);

		var classes = ['pitchbox_strike','c6r11'];
		var pvElem = gptsession.createDiv('c6r11',classes,attrs);

		var classes = ['pitchbox_strike','c7r11'];
		var pvElem = gptsession.createDiv('c7r11',classes,attrs);

		var classes = ['pitchbox_strike','c8r11'];
		var pvElem = gptsession.createDiv('c8r11',classes,attrs);

		var classes = ['pitchbox_strike','c9r11'];
		var pvElem = gptsession.createDiv('c9r11',classes,attrs);

		var classes = ['pitchbox_strike','c10r11'];
		var pvElem = gptsession.createDiv('c10r11',classes,attrs);
			
		var classes = ['pitchbox_strike','c11r11'];
		var pvElem = gptsession.createDiv('c11r11',classes,attrs);

		var classes = ['pitchbox_ball','c12r11'];
		var pvElem = gptsession.createDiv('c12r11',classes,attrs);

		var classes = ['pitchbox_ball','c13r11'];
		var pvElem = gptsession.createDiv('c13r11',classes,attrs);
			
		var classes = ['pitchbox_ball','c1r12'];
		var pvElem = gptsession.createDiv('c1r12',classes,attrs);

		var classes = ['pitchbox_ball','c2r12'];
		var pvElem = gptsession.createDiv('c2r12',classes,attrs);

		var classes = ['pitchbox_ball','c3r12'];
		var pvElem = gptsession.createDiv('c3r12',classes,attrs);

		var classes = ['pitchbox_ball','c4r12'];
		var pvElem = gptsession.createDiv('c4r12',classes,attrs);

		var classes = ['pitchbox_ball','c5r12'];
		var pvElem = gptsession.createDiv('c5r12',classes,attrs);

		var classes = ['pitchbox_ball','c6r12'];
		var pvElem = gptsession.createDiv('c6r12',classes,attrs);

		var classes = ['pitchbox_ball','c7r12'];
		var pvElem = gptsession.createDiv('c7r12',classes,attrs);

		var classes = ['pitchbox_ball','c8r12'];
		var pvElem = gptsession.createDiv('c8r12',classes,attrs);

		var classes = ['pitchbox_ball','c9r12'];
		var pvElem = gptsession.createDiv('c9r12',classes,attrs);

		var classes = ['pitchbox_ball','c10r12'];
		var pvElem = gptsession.createDiv('c10r12',classes,attrs);
			
		var classes = ['pitchbox_ball','c11r12'];
		var pvElem = gptsession.createDiv('c11r12',classes,attrs);

		var classes = ['pitchbox_ball','c12r12'];
		var pvElem = gptsession.createDiv('c12r12',classes,attrs);

		var classes = ['pitchbox_ball','c13r12'];
		var pvElem = gptsession.createDiv('c13r12',classes,attrs);
					
		var classes = ['pitchbox_ball','c1r13'];
		var pvElem = gptsession.createDiv('c1r13',classes,attrs);

		var classes = ['pitchbox_ball','c2r13'];
		var pvElem = gptsession.createDiv('c2r13',classes,attrs);

		var classes = ['pitchbox_ball','c3r13'];
		var pvElem = gptsession.createDiv('c3r13',classes,attrs);

		var classes = ['pitchbox_ball','c4r13'];
		var pvElem = gptsession.createDiv('c4r13',classes,attrs);

		var classes = ['pitchbox_ball','c5r13'];
		var pvElem = gptsession.createDiv('c5r13',classes,attrs);

		var classes = ['pitchbox_ball','c6r13'];
		var pvElem = gptsession.createDiv('c6r13',classes,attrs);

		var classes = ['pitchbox_ball','c7r13'];
		var pvElem = gptsession.createDiv('c7r13',classes,attrs);

		var classes = ['pitchbox_ball','c8r13'];
		var pvElem = gptsession.createDiv('c8r13',classes,attrs);

		var classes = ['pitchbox_ball','c9r13'];
		var pvElem = gptsession.createDiv('c9r13',classes,attrs);

		var classes = ['pitchbox_ball','c10r13'];
		var pvElem = gptsession.createDiv('c10r13',classes,attrs);
			
		var classes = ['pitchbox_ball','c11r13'];
		var pvElem = gptsession.createDiv('c11r13',classes,attrs);

		var classes = ['pitchbox_ball','c12r13'];
		var pvElem = gptsession.createDiv('c12r13',classes,attrs);

		var classes = ['pitchbox_ball','c13r13'];
		var pvElem = gptsession.createDiv('c13r13',classes,attrs);
		},
			
	onclickSessionType:function(e)
		{
		if (e.target.id == 'cmdSessionBullpen')
			gptsession.typeid = defines.sessiontype.bullpen;
		else if (e.target.id == 'cmdSessionScrimmage')
			gptsession.typeid = defines.sessiontype.scrimmage;
		else if (e.target.id == 'cmdSessionGame')
			gptsession.typeid = defines.sessiontype.game;
	
		gptmain.cmdCentral('cmdSessionNew');
		},
	
	onclickPitchType:function(e)
		{
		var selectElem = document.getElementById('divPitchTypeSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))
		
		if (e.target.id == 'divPitchTypeDownId')
			index--;
		else
			index++;

		if (index < 0)
			index = list.length - 1;
		else if (index >= list.length)
			index = 0;

		selectElem.setAttribute('data-index',index);
		selectElem.innerHTML = list[index].f_name;
		},
	buildPitchTypeList:function(list)
		{
		var downElem = document.getElementById('divPitchTypeDownId');
		downElem.addEventListener("click",this.onclickPitchType);
		downElem.innerHTML = '<';
		
		var upElem = document.getElementById('divPitchTypeUpId');
		upElem.addEventListener("click",this.onclickPitchType);
		upElem.innerHTML = '>';
		
		if ( (list == undefined) || (list.length <= 0) )
			var list = gptmain.pitchtypeList;
			
		var selectElem = document.getElementById('divPitchTypeSelectId');
		selectElem.addEventListener("click",this.onclickPitchType);
		selectElem.setAttribute('data-list',JSON.stringify(list));
		selectElem.setAttribute('data-index',0);
		
		selectElem.innerHTML = list[0].f_name;
		},
	onclickPitchAction:function(e)
		{
		var selectElem = document.getElementById('divPitchActionSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))
		
		if (e.target.id == 'divPitchActionDownId')
			index--;
		else
			index++;

		if (index < 0)
			index = list.length - 1;
		else if (index >= list.length)
			index = 0;

		selectElem.setAttribute('data-index',index);
		selectElem.innerHTML = list[index].f_name;
		},
	buildPitchActionList:function(type)
		{
		var downElem = document.getElementById('divPitchActionDownId');
		downElem.addEventListener("click",this.onclickPitchAction);
		downElem.innerHTML = '<';
		
		var upElem = document.getElementById('divPitchActionUpId');
		upElem.addEventListener("click",this.onclickPitchAction);
		upElem.innerHTML = '>';
		
		var list = [];
		
		for (var i = 0; i < gptmain.pitchactionList.length; i++)
			{
			var action = gptmain.pitchactionList[i].f_name.toLowerCase();
			
			if (type == defines.sessiontype.bullpen)
				{
				continue;
				}
			else if (type == defines.sessiontype.scrimmage)
				{
					
				}
			else if (type == defines.sessiontype.game)
				{
					
				}
			list.push(gptmain.pitchactionList[i]);
			}
			
		var selectElem = document.getElementById('divPitchActionSelectId');
		selectElem.addEventListener("click",this.onclickPitchAction);
		selectElem.setAttribute('data-list',JSON.stringify(list));
		selectElem.setAttribute('data-index',0);
		
		if (list.length > 0)
			selectElem.innerHTML = list[0].f_name;
		},

	getPitchProperties:function()
		{
		var pitch = new defines.objPitch()
		
		pitch.f_sessionid = gptsession.session.f_id;
		pitch.f_playerid = gptsession.player.f_id;
		
		var selectElem = document.getElementById('divPitchTypeSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))
		if ( (list.length > 0) && (index < list.length) )
			pitch.f_typeid = list[index].f_id;
		
		var selectElem = document.getElementById('divPitchActionSelectId');
		var list = JSON.parse(selectElem.getAttribute('data-list'));
		var index = parseInt(selectElem.getAttribute('data-index'))
		if ( (list.length > 0) && (index < list.length) )
			pitch.f_actionid = list[index].f_id;
		
/*		
		
		this.f_vel = 0;
		this.f_inning = 0;
*/		
		var callelems = document.getElementsByClassName('pitchbox_call_highlight')
		var callregion = '';
		if (callelems.length > 0)
			{
			callregion = callelems[0].id;
			var region = gptsession.getRegionByPitchBox(callelems[0].id);
			if (region)
				callregion = region.f_name;
			}
			
		var throwelems = document.getElementsByClassName('pitchbox_throw_highlight');
		var throwregion = '';
		if (throwelems.length > 0)
			{
			throwregion = throwelems[0].id;
			var region = gptsession.getRegionByPitchBox(throwelems[0].id);
			if (region)
				throwregion = region.f_name;
			}

		pitch.f_cl = callregion;
		pitch.f_hl = throwregion;

		gptut.removeClassAllElements('pitchbox_call_highlight')
		gptut.removeClassAllElements('pitchbox_throw_highlight')
		
		pitch.f_bstance = defines.leftright.right;
		if ($('#pitchbatterLeftOptionId').prop('checked') == true)
			pitch.f_bstance = defines.leftright.left;
		
		return(pitch)
		},
	onclickPitchRecord:function(e)
		{
		// get pitch properties
		var pitch = gptsession.getPitchProperties();
		
		gptut.removeClassAllElements('pitchbox_call_highlight')
		gptut.removeClassAllElements('pitchbox_throw_highlight')
		
		var hlIndex = -1;
		var scIndex = -1;
		var pcIndex = -1;
		var result  = gptsession.session.f_results[0];
			
		for (var j = 0; j < result.f_results.length; j++)
			{
			if (result.f_results[j].f_pc != 0)
				pcIndex = j;
			else if (result.f_results[j].f_sc != 0)
				scIndex = j;
			else if (result.f_results[j].f_hl != 0)
				hlIndex = j;
			}
			
		// add to results
		for (var i = 0; i < gptsession.session.f_results.length; i++)
			{
			var result = gptsession.session.f_results[i];
			
			if (pitch.f_typeid != result.f_typeid)
				continue;
				
			if (	(gptsession.session.f_typeid != defines.sessiontype.bullpen) &&
					(pitch.f_actionid <= 0)	)
				continue;

			for (var j = 0; j < result.f_results.length; j++)
				{
				if (	(gptsession.session.f_typeid != defines.sessiontype.bullpen) &&
						(pitch.f_actionid != result.f_results[j].f_id) )
					continue;
				
				if (pcIndex >= 0)
					result.f_results[pcIndex].f_c++;

				if ( (scIndex >= 0) && (result.f_results[j].f_iss != 0) )
					result.f_results[scIndex].f_c++;

				if ( (hlIndex >= 0) && (pitch.f_cl != '') && (pitch.f_cl == pitch.f_hl) )
					result.f_results[hlIndex].f_c++;	
												
				if (result.f_results[j].f_id != 0)
					result.f_results[j].f_c++;
					
				var tableDataObjs = gpttb.tableGetDataObjects('tblSessionPitches');
				for (var k = 0; k < tableDataObjs.length; k++)
					{
					if (tableDataObjs[k].f_typeid == result.f_typeid)
						{
						gpttb.tableUpdateByIndex (result, k, 'update', 'tblSessionPitches');

						gptsession.session.f_pitches.push(pitch);

						break;
						}
					}
							
				gptindb.writeToDB(gptindb.dbobj_session,gptsession.session);
				return;
				}	
			}
		},
		
	onclickPitchStop:async function(e)
		{
		var session = await gptindb.readFromDB(gptindb.dbobj_session,gptsession.session.f_id)

		if(session.f_pitches.length <= 0)
			{
			modal.displayModalOpen ("WARNING","NO PITCHES have been record during this session.",
								null, null,	modal.modalParams.mode.modeOk,null);
				
			gptmain.processMainBack();
			return;
			}
			
		modal.displayModalOpen ("INFORMATION","Do you want to upload this session to server?.",
								null, null,	modal.modalParams.mode.modeYesNo,async function(retMode,apiCmd)
			{
			if (retMode == modal.modalParams.exit.exitYes)
				{
				var session = await gptindb.readFromDB(gptindb.dbobj_session,gptsession.session.f_id)
				
				await gptindb.writeToDB(gptindb.dbobj_sessionsubmitted,session);
				await gptindb.deleteFromDB(gptindb.dbobj_session,session.f_id);

				// always check to make sure everything is uploaded
				gptcomm.processLocalDBUpload();
			
				gptsession.session = {};
				gptsession.player = {};
				gptmain.showFrontPage();
				}
			else
				gptmain.showFrontPage();
			});					
		},
	buildPitchView:function(session,player)
		{
		if (session.f_typeid == defines.sessiontype.bullpen)
			;
		else if (session.f_typeid == defines.sessiontype.scrimmage)
			;
		else if (session.f_typeid == defines.sessiontype.game)
			;
	
		var recordElem = document.getElementById('divPitchRecordId');
		recordElem.addEventListener("click",this.onclickPitchRecord);
		recordElem.innerHTML = 'RECORD';
		
		var stopElem = document.getElementById('divPitchStopId');
		stopElem.addEventListener("click",this.onclickPitchStop);
		stopElem.innerHTML = 'STOP';
		
		var username = player.f_fname + ' ' + player.f_lname;
		document.getElementById('labelPlayerId').innerHTML = username;
			
		// display div
		gptut.setShowState('divPitchMainId',true);
		
		gptsession.buildPitchBox();
		
		var list = gptlist.getPlayerPitchList(player.f_pitchids,gptmain.pitchtypeList)
	
		gptsession.buildPitchTypeList(list);
	
		gptsession.buildPitchActionList(session.f_typeid);

		// initialize results
		return(gptsession.initializeSessionResults(session));
		},
		
	validateSession:function(session)
		{
		if ( (session.f_playerid == undefined) || (session.f_playerid <= 0) )
			{
			modal.displayModalOpen ("WARNING","You must select a player(pitcher) first.",
								null, null,	modal.modalParams.mode.modeOk,null);	
			return(false);
			}

		return(true);
		},
	onclickSessionStart:function(e)
		{
		gptsession.session = gptsession.getSessionProperties()
		gptsession.session.f_typeid = gptsession.typeid;

		if (gptsession.validateSession(gptsession.session) != true)
			return;
			
		gptsession.player = gptlist.getItemFromList(gptsession.session.f_playerid, gptmain.playerList);
		
		if (gptsession.player == undefined)
			return;	
		
		gptsession.session.f_id = 0;
		gptindb.writeToDB(gptindb.dbobj_session,gptsession.session);
		
		if (gptsession.session.f_typeid == defines.sessiontype.bullpen)
			gptsession.loadConfig('cmdSessionBullpen');
		else if (gptsession.session.f_typeid == defines.sessiontype.scrimmage)
			gptsession.loadConfig('cmdSessionScrimmage');
		else if (gptsession.session.f_typeid == defines.sessiontype.game)
			gptsession.loadConfig('cmdSessionGame');
		},
	getSessionProperties:function()
		{
		var session = new defines.objSession();
		//var elapsed = gptdt.formatElapsedTime(session.f_duration);
		//$("#labelSessionLengthId").text(elapsed);

		session.f_playerid = $("#f_session_playerid").val();	
		if (session.f_playerid == null)
			session.f_playerid = 0;
		else
			session.f_playerid = parseInt(session.f_playerid);
			 
		session.f_date_startdateandtime = $("#f_session_date").val();
		
		session.f_opponent = $("#f_session_opponent").val();
		session.f_umpire = $("#f_session_umpire").val();
		
		return(session);
		},
	setSessionProperties:function(session)
		{
		if (session == undefined)
			var session = new defines.objSession();
	
		var elapsed = gptdt.formatElapsedTime(session.f_duration);
		$("#labelSessionLengthId").text(elapsed);
		
		if (session.f_date_startdateandtime == undefined)
			session.f_date_startdateandtime = new Date();
			
		var displaydate = gptdt.convertUTCToLocalDateFormat(session.f_date_startdateandtime,
							'yyyy-mm-ddTHH:MM');
		$("#f_session_date").val(displaydate);
							
		$("#f_session_playerid").val(session.f_playerid);
		$("#f_session_opponent").val(session.f_opponent);
		$("#f_session_umpire").val(session.f_umpire);
		},
		
	loadConfig:function (cmdId,args)
		{
		if (cmdId == 'cmdSessions')
			{
			gptut.setDivShowState('idMainCmdContent',false,false);
			gptut.setShowState('divSessions',true);
			
			var elem = document.getElementById('cmdSessionBullpen');
			elem.addEventListener("click",this.onclickSessionType);
			
			var elem = document.getElementById('cmdSessionScrimmage');
			elem.addEventListener("click",this.onclickSessionType);
			
			var elem = document.getElementById('cmdSessionGame');
			elem.addEventListener("click",this.onclickSessionType);
			}
		else if (cmdId == 'cmdSessionNew')
			{
			gptut.setDivShowState('idMainCmdContent',false,false);
			gptut.setShowState('divSessionNew',true);
			
			gptut.setDivShowState('divSessionDataId',false,false);
			
			gptlist.buildPlayerDropdown('f_session_playerid',gptmain.playerList)
			if (gptsession.typeid == defines.sessiontype.bullpen)
				{
				gptut.setShowState('divBullpenDataId',true);
				var lbl = 'NEW BULLPEN';
				}
			else if (gptsession.typeid == defines.sessiontype.scrimmage)
				{
				gptut.setShowState('divScrimmageDataId',true);
				var lbl = 'NEW SCRIMMAGE';
				}
			else if (gptsession.typeid == defines.sessiontype.game)
				{
				gptut.setShowState('divGameDataId',true);
				var lbl = 'NEW GAME';
				
				gptlist.listValue(defines.tblSessions,'f_opponent','list_Opponent');
				gptut.setShowState("list_Opponent", false);
				
				gptlist.listValue(defines.tblSessions,'f_opponent','list_Umpire');
				gptut.setShowState("list_Umpire", false);
				}
			document.getElementById('labelSessionType').innerHTML = lbl;
		
			gptsession.setSessionProperties()
			
			var elem = document.getElementById('btnSessionStart');
			elem.addEventListener("click",this.onclickSessionStart);
			}
		else if (cmdId == 'cmdSessionBullpen')
			{
			gptut.setDivShowState('idMainCmdContent',false,false);
			gptut.setShowState('idMainBottomMenu', false);
			gptut.setShowState('cmdMainBack', false);
			
			gptut.setShowState('divSessionBullpen',true);
			gptut.setShowState('divPitchBatterId',false);
			gptut.setShowState('divPitchActionId',false);
				
			gptut.setDivShowState('divSessionDataId',false,false);
			gptut.setShowState('divBullpenDataId',true);
				
			gptsession.session = gptsession.buildPitchView(gptsession.session,gptsession.player);
			gptsession.buildPitchTable();
			
			gptmain.startSessionLengthInterval(5);
			}
		else if (cmdId == 'cmdSessionScrimmage')
			{
			gptut.setDivShowState('idMainCmdContent',false,false);
			gptut.setShowState('idMainBottomMenu', false);
			gptut.setShowState('cmdMainBack', false);
			
			gptut.setShowState('divSessionScrimmage',true);
			gptut.setShowState('divPitchBatterId',true);
			gptut.setShowState('divPitchActionId',true);
			
			gptut.setDivShowState('divSessionDataId',false,false);
			gptut.setShowState('divScrimmageDataId',true);

			gptsession.session = gptsession.buildPitchView(gptsession.session,gptsession.player);
			gptsession.buildPitchTable();
			
			gptmain.startSessionLengthInterval(5);
			}
		else if (cmdId == 'cmdSessionGame')
			{
			gptut.setDivShowState('idMainCmdContent',false,false);
			gptut.setShowState('idMainBottomMenu', false);
			gptut.setShowState('cmdMainBack', false);
			
			gptut.setShowState('divSessionGame',true);
			
			gptut.setDivShowState('divSessionDataId',false,false);
			gptut.setShowState('divGameDataId',true);
			gptut.setShowState('divPitchBatterId',true);
			gptut.setShowState('divPitchActionId',true);
			
			gptsession.session = gptsession.buildPitchView(gptsession.session,gptsession.player);
			gptsession.buildPitchTable();
			
			gptmain.startSessionLengthInterval(5);
			}
		},
};




