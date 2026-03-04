var gptsession = 
	{
	divSessionPitchId: 'divSessionPitchParentId',
	divMapPitchId: 'divMapPitchParentId',
	divHistoryPitchId: 'divHistoryPitchParentId',
	
	typeid:undefined,
	player:undefined,
	session:undefined,
	
	results: [],
	regions : [],

	objRegion:function(strike,name,label,label_region,boxes)
		{
		this.f_name = '';
		this.f_label = '';
		this.f_label_region = '';
		this.f_boxes = [];
		this.f_numcall = 0;
		this.f_numhit = 0;

		if (strike)
			{
			this.f_base_bgcolor = 'rgba(150, 75, 0, 0.2)';
			this.f_base_color = '#000000';
			}
		else
			{
			this.f_base_bgcolor = 'rgba(150, 75, 0, 0.4)';
			this.f_base_color = '#000000';
			}
			
		this.f_bgcolor = this.f_base_bgcolor;
		this.f_color = this.f_base_color
		
		if (name)
			this.f_name = name;
			
		if (label)
			this.f_label = label;
			
		if (label_region)
			this.f_label_region = label_region;
			
		if (boxes)
			this.f_boxes = boxes;
		},
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
							
						// update pitch count
						document.getElementById('labelPitchCountId').innerHTML = 'PC: ' + totalPitchCount;
		
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
		var bstanceElem = document.getElementById('pitchbatterLeftOptionId');
		bstance = (bstanceElem.checked == true) ? defines.leftright.left : defines.leftright.right;
		
		//upper left
		var label = (bstance == defines.leftright.right) ? '1-1' : '1-3';
		var region1 = new gptsession.objRegion(true,'region1',label,'c4r4',
						['c3r3','c3r4','c3r5','c4r3','c4r4','c4r5','c5r3','c5r4','c5r5']);
		//upper middle	
		var label = (bstance == defines.leftright.right) ? '1-2' : '1-2';
		var region2 = new gptsession.objRegion(true,'region2',label,'c7r4',
						['c6r3','c6r4','c6r5','c7r3','c7r4','c7r5','c8r3','c8r4','c8r5']);
		//upper right
		var label = (bstance == defines.leftright.right) ? '1-3' : '1-1';
		var region3 = new gptsession.objRegion(true,'region3',label,'c10r4',
						['c9r3','c9r4','c9r5','c10r3','c10r4','c10r5','c11r3','c11r4','c11r5']);
		//middle left
		var label = (bstance == defines.leftright.right) ? '2-1' : '2-3';
		var region4 = new gptsession.objRegion(true,'region4',label,'c4r7',
						['c3r6','c3r7','c3r8','c4r6','c4r7','c4r8','c5r6','c5r7','c5r8']);
		//middle middle
		var label = (bstance == defines.leftright.right) ? '2-2' : '2-2';
		var region5 = new gptsession.objRegion(true,'region5',label,'c7r7',
						['c6r6','c6r7','c6r8','c7r6','c7r7','c7r8','c8r6','c8r7','c8r8']);
		//middle right
		var label = (bstance == defines.leftright.right) ? '2-3' : '2-1';
		var region6 = new gptsession.objRegion(true,'region6',label,'c10r7',
						['c9r6','c9r7','c9r8','c10r6','c10r7','c10r8','c11r6','c11r7','c11r8']);
		//bottom left
		var label = (bstance == defines.leftright.right) ? '3-1' : '3-3';
		var region7 = new gptsession.objRegion(true,'region7',label,'c4r10',
						['c3r9','c3r10','c3r11','c4r9','c4r10','c4r11','c5r9','c5r10','c5r11']);
		//bottom bottom
		var label = (bstance == defines.leftright.right) ? '3-3' : '3-3';
		var region8 = new gptsession.objRegion(true,'region8',label,'c7r10',
						['c6r9','c6r10','c6r11','c7r9','c7r10','c7r11','c8r9','c8r10','c8r11']);
		//bottom right
		var label = (bstance == defines.leftright.right) ? '3-3' : '3-1';
		var region9 = new gptsession.objRegion(true,'region9',label,'c10r10',
						['c9r9','c9r10','c9r11','c10r9','c10r10','c10r11','c11r9','c11r10','c11r11']);
		//high left
		var label = (bstance == defines.leftright.right) ? '4-1' : '4-2';
		var region10 = new gptsession.objRegion(false,'region10',label,'c4r1',
						['c1r1','c2r1','c3r1','c4r1','c5r1','c6r1']);
		//high right		
		var label = (bstance == defines.leftright.right) ? '4-2' : '4-1';
		var region11 = new gptsession.objRegion(false,'region11',label,'c10r1',
						['c7r1','c8r1','c9r1','c10r1','c11r1','c12r1','c13r1']);
		//high left
		var region12 = new gptsession.objRegion(false,'region12','','c4r2',
						['c1r2','c2r2','c3r2','c4r2','c5r2','c6r2']);
		//high right			
		var region13 = new gptsession.objRegion(false,'region13','','c10r2',
						['c7r2','c8r2','c9r2','c10r2','c11r2','c12r2','c13r2']);
		//low left
		var region14 = new gptsession.objRegion(false,'region14','','c4r12',
						['c1r12','c2r12','c3r12','c4r12','c5r12','c6r12']);
		//low right			
		var region15 = new gptsession.objRegion(false,'region15','','c10r12',
						['c7r12','c8r12','c9r12','c10r12','c11r12','c12r12','c13r12']);
		//low left
		var label = (bstance == defines.leftright.right) ? '5-1' : '5-2';
		var region16 = new gptsession.objRegion(false,'region16',label,'c4r13',
						['c1r13','c2r13','c3r13','c4r13','c5r13','c6r13'])
		//low right			
		var label = (bstance == defines.leftright.right) ? '5-2' : '5-1';
		var region17 = new gptsession.objRegion(false,'region17',label,'c10r13',
						['c7r13','c8r13','c9r13','c10r13','c11r13','c12r13','c13r13']);
		//inside left
		var label = (bstance == defines.leftright.right) ? '6' : '7';
		var region18 = new gptsession.objRegion(false,'region18',label,'c1r7',
						['c1r3','c1r4','c1r5','c1r6','c1r7','c1r8','c1r9','c1r10','c1r11']);		
		//inside left		
		var region19 = new gptsession.objRegion(false,'region19','','c2r7',
						['c2r3','c2r4','c2r5','c2r6','c2r7','c2r8','c2r9','c2r10','c2r11']);
		//inside left		
		var region20 = new gptsession.objRegion(false,'region20','','c12r7',
						['c12r3','c12r4','c12r5','c12r6','c12r7','c12r8','c12r9','c12r10','c12r11']);		
		//inside left
		var label = (bstance == defines.leftright.right) ? '7' : '6';
		var region21 = new gptsession.objRegion(false,'region21',label,'c13r7',
						['c13r3','c13r4','c13r5','c13r6','c13r7','c13r8','c13r9','c13r10','c13r11']);
			
		regions = [];
		regions.push(region1);
		regions.push(region2);
		regions.push(region3);
		regions.push(region4);
		regions.push(region5);
		regions.push(region6);
		regions.push(region7);
		regions.push(region8);
		regions.push(region9);
		regions.push(region10);
		regions.push(region11);
		regions.push(region12);
		regions.push(region13);
		regions.push(region14);
		regions.push(region15);
		regions.push(region16);
		regions.push(region17);
		regions.push(region18);
		regions.push(region19);
		regions.push(region20);
		regions.push(region21);
		
		return(regions);
		},
				
	getRegionByPitchBox:function(pitchboxId)
		{
		var regions = gptsession.buildRegionsArray();
		
		for (var i = 0; i < regions.length; i++)
			{
			var region = regions[i];

			for (var j = 0; j < region.f_boxes.length; j++)
				{
				if (region.f_boxes[j] == pitchboxId)
					return(region)
				}
			}

		return(pitchboxId);
		},
	
	onclickPitchBox:function(e)
		{
		var callelems = document.getElementsByClassName('pitchbox_call_highlight');
		var throwelems = document.getElementsByClassName('pitchbox_throw_highlight');

		if (callelems.length <= 0)
			gptsession.highlightElement(e.target.id,true,true)
			
		else if (throwelems.length <= 0)
			gptsession.highlightElement(e.target.id,false,true)
			
		else 
			{
			gptsession.highlightElement(e.target.id,false,false)
			gptsession.highlightElement(e.target.id,true,true)
			}
		},
		
	highlightElement:function(id,call,highlight)
		{
		var elem = document.getElementById(id);
		if (! elem)
			return;

		if (elem.nodeName.toLowerCase() != 'div')
			elem = elem.parentNode;

		var region = gptsession.getRegionByPitchBox(elem.id);
		if (region == undefined)
			return;

		if (call)
			{
			var highlightclass = 'pitchbox_call_highlight';
			var bgcolor = 'var(--pitchbox_call_highlight_bgcolor)';
			var color = 'var(--pitchbox_call_highlight_color)';
			}
		else //throw
			{
			var highlightclass = 'pitchbox_throw_highlight';
			var bgcolor = 'var(--pitchbox_throw_highlight_bgcolor)';
			var color = 'var(--pitchbox_throw_highlight_color)';
			}

		// delete existing highlighted element
		var classElems = document.getElementsByClassName(highlightclass);
		for (var i = 0; i < classElems.length; i++)
			{
			classElems[i].style.color = region.f_base_color;
			classElems[i].style.backgroundColor = region.f_base_bgcolor;
			}
		
		gptut.removeClassAllElements(highlightclass);

		for (var i = 0; i < region.f_boxes.length; i++)
			{
			var elem = document.getElementById(region.f_boxes[i]);

			if (! elem)
				continue;

			if  ((highlight == true) && (!elem.classList.contains(highlightclass) ) )
				elem.classList.add(highlightclass);
			
			elem.style.color = color;
			elem.style.backgroundColor = bgcolor;
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
	createDiv:function (elemid,parentid,classnames,attrs)
		{
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
		parentElem.appendChild(divElem);
								
		// see if this is a box div with a region label
		for (var i = 0; i < gptsession.regions.length; i ++)
			{
			var region = gptsession.regions[i];
			
			if (elemid == region.f_label_region)
				{
				var regionElem = document.getElementById(elemid);
				regionElem.style.color = region.f_color;
				
				elem = gptut.createLabel(elemid + '_lbl',region.f_label,
								null,elemid);
				elem.classList.add('pitchbox_label')
				elem.style.color = region.f_color;
				break;
				}

			for (var j = 0; j < region.f_boxes.length; j++)
				{
				var regionElem = document.getElementById(region.f_boxes[j]);
				if (regionElem)
					{
					regionElem.style.backgroundColor = region.f_bgcolor;
					regionElem.style.color = region.f_color;
					}
				}
			}

		if (parentid != gptsession.divMapPitchId)
			{
			gptsession.mouseoverAddToPitchBox(divElem.id);
			gptsession.mouseleaveAddToPitchBox(divElem.id);
			gptsession.onclickAddToPitchBox(divElem.id);
			}
		},

	buildPitchBox:function(regions,parentid)
		{
		gptsession.regions = regions;
		
		gptut.deleteElementChildren(gptsession.divSessionPitchId);
		gptut.deleteElementChildren(gptsession.divMapPitchId);
		
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
		var pvElem = gptsession.createDiv('c1r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r1'];
		var pvElem = gptsession.createDiv('c2r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c3r1'];
		var pvElem = gptsession.createDiv('c3r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c4r1'];
		var pvElem = gptsession.createDiv('c4r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c5r1'];
		var pvElem = gptsession.createDiv('c5r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c6r1'];
		var pvElem = gptsession.createDiv('c6r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c7r1'];
		var pvElem = gptsession.createDiv('c7r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c8r1'];
		var pvElem = gptsession.createDiv('c8r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c9r1'];
		var pvElem = gptsession.createDiv('c9r1',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c10r1'];
		var pvElem = gptsession.createDiv('c10r1',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c11r1'];
		var pvElem = gptsession.createDiv('c11r1',parentid,classes,attrs);
		
		var classes = ['pitchbox_ball','c12r1'];
		var pvElem = gptsession.createDiv('c12r1',parentid,classes,attrs);
		
		var classes = ['pitchbox_ball','c13r1'];
		var pvElem = gptsession.createDiv('c13r1',parentid,classes,attrs);
		
		var classes = ['pitchbox_ball','c1r2'];
		var pvElem = gptsession.createDiv('c1r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r2'];
		var pvElem = gptsession.createDiv('c2r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c3r2'];
		var pvElem = gptsession.createDiv('c3r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c4r2'];
		var pvElem = gptsession.createDiv('c4r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c5r2'];
		var pvElem = gptsession.createDiv('c5r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c6r2'];
		var pvElem = gptsession.createDiv('c6r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c7r2'];
		var pvElem = gptsession.createDiv('c7r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c8r2'];
		var pvElem = gptsession.createDiv('c8r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c9r2'];
		var pvElem = gptsession.createDiv('c9r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c10r2'];
		var pvElem = gptsession.createDiv('c10r2',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c11r2'];
		var pvElem = gptsession.createDiv('c11r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c12r2'];
		var pvElem = gptsession.createDiv('c12r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c13r2'];
		var pvElem = gptsession.createDiv('c13r2',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c1r3'];
		var pvElem = gptsession.createDiv('c1r3',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r3'];
		var pvElem = gptsession.createDiv('c2r3',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r3'];
		var pvElem = gptsession.createDiv('c3r3',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r3'];
		var pvElem = gptsession.createDiv('c4r3',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r3'];
		var pvElem = gptsession.createDiv('c5r3',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r3'];
		var pvElem = gptsession.createDiv('c6r3',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r3'];
		var pvElem = gptsession.createDiv('c7r3',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r3'];
		var pvElem = gptsession.createDiv('c8r3',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r3'];
		var pvElem = gptsession.createDiv('c9r3',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r3'];
		var pvElem = gptsession.createDiv('c10r3',parentid,classes,attrs);
			
		var classes = ['pitchbox_strike','c11r3'];
		var pvElem = gptsession.createDiv('c11r3',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c12r3'];
		var pvElem = gptsession.createDiv('c12r3',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c13r3'];
		var pvElem = gptsession.createDiv('c13r3',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c1r4'];
		var pvElem = gptsession.createDiv('c1r4',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r4'];
		var pvElem = gptsession.createDiv('c2r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r4'];
		var pvElem = gptsession.createDiv('c3r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r4'];
		var pvElem = gptsession.createDiv('c4r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r4'];
		var pvElem = gptsession.createDiv('c5r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r4'];
		var pvElem = gptsession.createDiv('c6r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r4'];
		var pvElem = gptsession.createDiv('c7r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r4'];
		var pvElem = gptsession.createDiv('c8r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r4'];
		var pvElem = gptsession.createDiv('c9r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r4'];
		var pvElem = gptsession.createDiv('c10r4',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c11r4'];
		var pvElem = gptsession.createDiv('c11r4',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c12r4'];
		var pvElem = gptsession.createDiv('c12r4',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c13r4'];
		var pvElem = gptsession.createDiv('c13r4',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c1r5'];
		var pvElem = gptsession.createDiv('c1r5',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r5'];
		var pvElem = gptsession.createDiv('c2r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r5'];
		var pvElem = gptsession.createDiv('c3r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r5'];
		var pvElem = gptsession.createDiv('c4r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r5'];
		var pvElem = gptsession.createDiv('c5r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r5'];
		var pvElem = gptsession.createDiv('c6r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r5'];
		var pvElem = gptsession.createDiv('c7r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r5'];
		var pvElem = gptsession.createDiv('c8r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r5'];
		var pvElem = gptsession.createDiv('c9r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r5'];
		var pvElem = gptsession.createDiv('c10r5',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c11r5'];
		var pvElem = gptsession.createDiv('c11r5',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c12r5'];
		var pvElem = gptsession.createDiv('c12r5',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c13r5'];
		var pvElem = gptsession.createDiv('c13r5',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c1r6'];
		var pvElem = gptsession.createDiv('c1r6',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r6'];
		var pvElem = gptsession.createDiv('c2r6',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r6'];
		var pvElem = gptsession.createDiv('c3r6',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r6'];
		var pvElem = gptsession.createDiv('c4r6',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r6'];
		var pvElem = gptsession.createDiv('c5r6',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r6'];
		var pvElem = gptsession.createDiv('c6r6',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r6'];
		var pvElem = gptsession.createDiv('c7r6',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r6'];
		var pvElem = gptsession.createDiv('c8r6',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r6'];
		var pvElem = gptsession.createDiv('c9r6',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r6'];
		var pvElem = gptsession.createDiv('c10r6',parentid,classes,attrs);
						
		var classes = ['pitchbox_strike','c11r6'];
		var pvElem = gptsession.createDiv('c11r6',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c12r6'];
		var pvElem = gptsession.createDiv('c12r6',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c13r6'];
		var pvElem = gptsession.createDiv('c13r6',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c1r7'];
		var pvElem = gptsession.createDiv('c1r7',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r7'];
		var pvElem = gptsession.createDiv('c2r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r7'];
		var pvElem = gptsession.createDiv('c3r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r7'];
		var pvElem = gptsession.createDiv('c4r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r7'];
		var pvElem = gptsession.createDiv('c5r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r7'];
		var pvElem = gptsession.createDiv('c6r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r7'];
		var pvElem = gptsession.createDiv('c7r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r7'];
		var pvElem = gptsession.createDiv('c8r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r7'];
		var pvElem = gptsession.createDiv('c9r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r7'];
		var pvElem = gptsession.createDiv('c10r7',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c11r7'];
		var pvElem = gptsession.createDiv('c11r7',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c12r7'];
		var pvElem = gptsession.createDiv('c12r7',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c13r7'];
		var pvElem = gptsession.createDiv('c13r7',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c1r8'];
		var pvElem = gptsession.createDiv('c1r8',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r8'];
		var pvElem = gptsession.createDiv('c2r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r8'];
		var pvElem = gptsession.createDiv('c3r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r8'];
		var pvElem = gptsession.createDiv('c4r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r8'];
		var pvElem = gptsession.createDiv('c5r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r8'];
		var pvElem = gptsession.createDiv('c6r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r8'];
		var pvElem = gptsession.createDiv('c7r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r8'];
		var pvElem = gptsession.createDiv('c8r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r8'];
		var pvElem = gptsession.createDiv('c9r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r8'];
		var pvElem = gptsession.createDiv('c10r8',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c11r8'];
		var pvElem = gptsession.createDiv('c11r8',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c12r8'];
		var pvElem = gptsession.createDiv('c12r8',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c13r8'];
		var pvElem = gptsession.createDiv('c13r8',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c1r9'];
		var pvElem = gptsession.createDiv('c1r9',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r9'];
		var pvElem = gptsession.createDiv('c2r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r9'];
		var pvElem = gptsession.createDiv('c3r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r9'];
		var pvElem = gptsession.createDiv('c4r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r9'];
		var pvElem = gptsession.createDiv('c5r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r9'];
		var pvElem = gptsession.createDiv('c6r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r9'];
		var pvElem = gptsession.createDiv('c7r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r9'];
		var pvElem = gptsession.createDiv('c8r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r9'];
		var pvElem = gptsession.createDiv('c9r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r9'];
		var pvElem = gptsession.createDiv('c10r9',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c11r9'];
		var pvElem = gptsession.createDiv('c11r9',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c12r9'];
		var pvElem = gptsession.createDiv('c12r9',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c13r9'];
		var pvElem = gptsession.createDiv('c13r9',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c1r10'];
		var pvElem = gptsession.createDiv('c1r10',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r10'];
		var pvElem = gptsession.createDiv('c2r10',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r10'];
		var pvElem = gptsession.createDiv('c3r10',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r10'];
		var pvElem = gptsession.createDiv('c4r10',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r10'];
		var pvElem = gptsession.createDiv('c5r10',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r10'];
		var pvElem = gptsession.createDiv('c6r10',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r10'];
		var pvElem = gptsession.createDiv('c7r10',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r10'];
		var pvElem = gptsession.createDiv('c8r10',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r10'];
		var pvElem = gptsession.createDiv('c9r10',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r10'];
		var pvElem = gptsession.createDiv('c10r10',parentid,classes,attrs);
			
		var classes = ['pitchbox_strike','c11r10'];
		var pvElem = gptsession.createDiv('c11r10',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c12r10'];
		var pvElem = gptsession.createDiv('c12r10',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c13r10'];
		var pvElem = gptsession.createDiv('c13r10',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c1r11'];
		var pvElem = gptsession.createDiv('c1r11',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r11'];
		var pvElem = gptsession.createDiv('c2r11',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c3r11'];
		var pvElem = gptsession.createDiv('c3r11',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c4r11'];
		var pvElem = gptsession.createDiv('c4r11',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c5r11'];
		var pvElem = gptsession.createDiv('c5r11',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c6r11'];
		var pvElem = gptsession.createDiv('c6r11',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c7r11'];
		var pvElem = gptsession.createDiv('c7r11',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c8r11'];
		var pvElem = gptsession.createDiv('c8r11',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c9r11'];
		var pvElem = gptsession.createDiv('c9r11',parentid,classes,attrs);

		var classes = ['pitchbox_strike','c10r11'];
		var pvElem = gptsession.createDiv('c10r11',parentid,classes,attrs);
			
		var classes = ['pitchbox_strike','c11r11'];
		var pvElem = gptsession.createDiv('c11r11',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c12r11'];
		var pvElem = gptsession.createDiv('c12r11',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c13r11'];
		var pvElem = gptsession.createDiv('c13r11',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c1r12'];
		var pvElem = gptsession.createDiv('c1r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r12'];
		var pvElem = gptsession.createDiv('c2r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c3r12'];
		var pvElem = gptsession.createDiv('c3r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c4r12'];
		var pvElem = gptsession.createDiv('c4r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c5r12'];
		var pvElem = gptsession.createDiv('c5r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c6r12'];
		var pvElem = gptsession.createDiv('c6r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c7r12'];
		var pvElem = gptsession.createDiv('c7r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c8r12'];
		var pvElem = gptsession.createDiv('c8r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c9r12'];
		var pvElem = gptsession.createDiv('c9r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c10r12'];
		var pvElem = gptsession.createDiv('c10r12',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c11r12'];
		var pvElem = gptsession.createDiv('c11r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c12r12'];
		var pvElem = gptsession.createDiv('c12r12',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c13r12'];
		var pvElem = gptsession.createDiv('c13r12',parentid,classes,attrs);
					
		var classes = ['pitchbox_ball','c1r13'];
		var pvElem = gptsession.createDiv('c1r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c2r13'];
		var pvElem = gptsession.createDiv('c2r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c3r13'];
		var pvElem = gptsession.createDiv('c3r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c4r13'];
		var pvElem = gptsession.createDiv('c4r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c5r13'];
		var pvElem = gptsession.createDiv('c5r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c6r13'];
		var pvElem = gptsession.createDiv('c6r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c7r13'];
		var pvElem = gptsession.createDiv('c7r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c8r13'];
		var pvElem = gptsession.createDiv('c8r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c9r13'];
		var pvElem = gptsession.createDiv('c9r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c10r13'];
		var pvElem = gptsession.createDiv('c10r13',parentid,classes,attrs);
			
		var classes = ['pitchbox_ball','c11r13'];
		var pvElem = gptsession.createDiv('c11r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c12r13'];
		var pvElem = gptsession.createDiv('c12r13',parentid,classes,attrs);

		var classes = ['pitchbox_ball','c13r13'];
		var pvElem = gptsession.createDiv('c13r13',parentid,classes,attrs);
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
		var callbox = '';
		if (callelems.length > 0)
			{
			callbox = callelems[0].id;
			//var region = gptsession.getRegionByPitchBox(callelems[0].id);
			//if (region)
			//	callregion = region.f_name;
			}
			
		var throwelems = document.getElementsByClassName('pitchbox_throw_highlight');
		var throwbox = '';
		if (throwelems.length > 0)
			{
			throwbox = throwelems[0].id;
		//	var region = gptsession.getRegionByPitchBox(throwelems[0].id);
		//	if (region)
		//		throwregion = region.f_name;
			}

		pitch.f_cl = callbox;
		pitch.f_hl = throwbox;

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
/*
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
*/		
		
		
		
	onclickPitchStop:async function(e)
		{
		var session = await gptindb.readFromDB(gptindb.dbobj_session,gptsession.session.f_id)

		if(session.f_pitches.length <= 0)
			{
			modal.displayModalOpen ("WARNING","NO PITCHES have been record during this session.",
								null, null,	modal.modalParams.mode.modeOk,null);
				
			gptmain.showFrontPage();
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
				
			kwbball.buildBottomMenu(gptmain.loginUser.f_typeid);
			});					
		},
	
	onclickPitchBStance:function()
		{
		var bStance = defines.leftright.right;
	
		var bstanceElem = document.getElementById('pitchbatterLeftOptionId');
		if (bstanceElem.checked == true)
			bStance = defines.leftright.left;
	
		var regions = gptsession.buildRegionsArray();
		gptsession.buildPitchBox(regions, gptsession.divSessionPitchId);
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
		
		var bstanceElem = document.getElementById('pitchbatterRightOptionId');
		bstanceElem.addEventListener("click",this.onclickPitchBStance);
		
		var bstanceElem = document.getElementById('pitchbatterLeftOptionId');
		bstanceElem.addEventListener("click",this.onclickPitchBStance);
		
		var username = player.f_fname + ' ' + player.f_lname;
		document.getElementById('labelPlayerId').innerHTML = username;
			
		// display div
		gptut.setShowState('divPitchMainId',true);
		
		var regions = gptsession.buildRegionsArray();
		gptsession.buildPitchBox(regions, gptsession.divSessionPitchId);

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
		
		gptsession.pitchcount = 0;
		
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
			
			kwbball.buildBottomMenu(gptmain.loginUser.f_typeid);
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

			kwbball.buildBottomMenu(gptmain.loginUser.f_typeid);
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
			
			kwbball.buildBottomMenu(gptmain.loginUser.f_typeid);
			}
		},
};




