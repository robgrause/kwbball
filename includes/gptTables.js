var gpttb = 
	{
	tableClear:function (tblName)
		{
		if ($.fn.DataTable.isDataTable('#' + tblName) )
			{
			var table = $('#' + tblName).DataTable();
			table.clear();
			table.destroy();
			$('#' + tblName).find('tr:first').remove();
			}
		},
				
	tableMoveRow:function(tblName, moveUp)
		{
		if ($("#" + tblName).find('tr.selectedRow').length <= 0)
			return (null);
			
		var table = $("#" + tblName).DataTable();
		var index1 = table.row('.selectedRow').index();

		if (moveUp == true)
			var order = -1;
		else
			var order = 1;
		
		var index2 = index1 + order;

		var data1 = table.row(index1).data();
		var data2 = table.row(index2).data();

		table.row(index1).data(data2);
		table.row(index2).data(data1);

		gpttb.tableSelectRowByIndex(tblName, index2);

		//table.draw(false);
		return(index2);
	},

	tableUpdate:function (obj, apiCmd, tblName)
		{
		if (tblName == null)
			return;

		if ( ! $.fn.DataTable.isDataTable('#' + tblName) )
			return;

		var index = -1;
		var dataTable = $("#" + tblName).DataTable();

		var selectedRow = dataTable.rows('.selectedRow');
		var selectedIndex = dataTable.row('.selectedRow').index();

		if ( (apiCmd == 'delete') && (selectedRow) )
			dataTable.row(selectedRow).remove();

		else if ( (apiCmd == 'update') && (selectedRow) )
			{
			//dataTable.row(selectedRow).remove();
			//dataTable.row.add(obj);
			dataTable.row(selectedIndex).data(obj);
			}
		else if ( (apiCmd == 'up') && (selectedRow) )
			index = gpttb.tableMoveRow(tblName, true);

		else if ( (apiCmd == 'down') && (selectedRow) )
			index = gpttb.tableMoveRow(tblName, false);

		else if (apiCmd == 'add')
			dataTable.row.add(obj);
			
		dataTable.draw(false);

		return(index);
		},
	
	tableUpdateByField:function (newobj, field, apiCmd, tblName)
		{
		var tblElem = "#" + tblName;
		
		if ($(tblElem).find('tr').length <= 0)
			return (undefined);
			
		var table = $(tblElem).DataTable();

		table.rows().every(function (index) 
			{
			var obj = this.data();

			if (obj[field] == newobj[field])
				{
				if (apiCmd == 'delete')
					table.row(index).remove();

				else if (apiCmd == 'update')
					{
					//dataTable.row(selectedRow).remove();
					//dataTable.row.add(obj);
					table.row(index).data(newobj);
					}
			
				table.draw(false);
				}
			});

		return;
		},
		
	tableUpdateByIndex:function (newobj, updateIndex, apiCmd, tblName)
		{
		var tblElem = "#" + tblName;
		
		if ($(tblElem).find('tr').length <= 0)
			return (undefined);
			
		var table = $(tblElem).DataTable();

		table.rows().every(function (index) 
			{
			if (updateIndex == index)
				{
				var obj = this.data();

				if (apiCmd == 'delete')
					table.row(index).remove();

				else if (apiCmd == 'update')
					{
					//dataTable.row(selectedRow).remove();
					//dataTable.row.add(obj);
					table.row(index).data(newobj);
					}
			
				table.draw(false);
				}
			});

		return;
		},
		
	tableGetByField:function (field,value,tblName)
		{
		var tblElem = "#" + tblName;
		
		if ($(tblElem).find('tr').length <= 0)
			return (undefined);
			
		var table = $(tblElem).DataTable();

		var retObj = null;
		table.rows().every(function (index) 
			{
			var obj = this.data();

			if (obj[field] == value)
				retObj = obj;
			});
		return(retObj)
		},
		
	tableGetCount:function(tblName)
		{		
		var tblSum = $('#' + tblName).DataTable();

		return(tblSum.data().length);
		},
	tableAddObjectToTable:function(obj, tblName)
		{		
		var tblSum = $('#' + tblName).DataTable();

		tblSum.row.add(obj).draw();
		},
	tableAddResultsToTable:async function(results, selectedobj, tblName, progressbarId,callback)
		{
		var tblSum = $('#' + tblName).DataTable();

		tblSum.clear();
		
		if ( (results == undefined) || (results.length <= 0) )
			{
			if (callback)
				callback(results, selectedobj, tblName);
			return;
			}
					
		var $progressbar = null;

		if (progressbarId)
			{
			gptut.setDivShowState(progressbarId,true,true)

			var barElem = gptut.getChildWithClass(progressbarId,'progress-bar');

			if (barElem)
				$progressbar = $('#' + barElem.id);
			}

		var percent;
		var id = setInterval(dowork,1);
		var  redrawcnt = 200;
		if (results.length == 1)
			redrawcnt = 1;
		else if (results.length <= 200)
			redrawcnt = results.length - 1;
		var i = 0;

		async function dowork()
			{
			if (i >= results.length)
				{
				clearInterval(id);
				
				percent = 0;
				if ($progressbar)
					$progressbar.attr('aria-valuenow',percent).css('width',percent + '%').text(percent + '%');

				if (callback)
					callback(results, selectedobj, tblName);
					
				if (progressbarId)
					gptut.setDivShowState(progressbarId,false,true)
				}
			else
				{
				percent = Math.round((i / results.length) * 100);
				if ($progressbar)
					$progressbar.attr('aria-valuenow',percent).css('width',percent + '%').text(percent + '%');

				if ( (results.length <= 10) || ((i % redrawcnt) == 0) )
					tblSum.row.add(results[i]).draw();
				else
					tblSum.row.add(results[i]); //.draw();
				i++;
				}
			};
		},
		
	tableAddResultsToTableSync:function(results, tblName)
		{
		var tblSum = $('#' + tblName).DataTable();

		tblSum.clear();
		
		if ( (results == undefined) || (results.length <= 0) )
			return;
			
		for (var i = 0; i < results.length; i++)
			tblSum.row.add(results[i]).draw();
		},
	
	getTblSelectedObj:function(tblName)
		{
		if ($("#" + tblName).find('tr.selectedRow').length <= 0)
			return (null);

		var dataTable = $("#" + tblName).DataTable();
		var selectedRow = dataTable.rows('.selectedRow');
		
		if (selectedRow)
			return (dataTable.row(selectedRow).data());
		else
			return (null);
		},
		
	getTblSelectedObjs:function(tblName)
		{
		var results = [];
		
		if ($("#" + tblName).find('tr.selectedRow').length <= 0)
			return ([]);

		var dataTable = $("#" + tblName).DataTable();
		var selectedRows = dataTable.rows('.selectedRow');

		for (var i = 0; i < selectedRows.data().length; i++)
			{
			var obj = dataTable.row(selectedRows[0][i]).data();
			
			if (obj != undefined)
				results.push(obj);
			}
			
		if (results.length <= 0)
			return([]);
		else
			return (results);
		},
		
	deSelectAllTblObjs:function(tblName)
		{
		if ($("#" + tblName).find('tr.selectedRow').length <= 0)
			return (null);

		var table = $("#" + tblName).DataTable();
		table.$('tr.selectedRow').removeClass('selectedRow');
		},
		
	tableGetDataObjects:function(tblName)
		{
		var tblElem = "#" + tblName;
		
		if ($(tblElem).find('tr').length <= 0)
			return (undefined);

		var results = [];
		var table = $(tblElem).DataTable();

		table.rows().every(function (index) 
			{
			var obj = this.data();
			results.push(obj);
			});

		return(results);
		},

	tableGetColumnHeaders:function(tblName)
		{
		var table = $("#" + tblName).DataTable();
		var headers = [];

		table.columns().every( function () 
			{
			var hdr = this.header();
			
			var header = {	'text' : $(hdr).html(),
							'classlist': $(hdr).attr("class").split(/\s+/),
							'color' : $(hdr).css('color'),
							'background' : $(hdr).css('background'),
							'fontweight' :$(hdr).css('font-weight'),
							'fontsize' :$(hdr).css('font-size'),
							'width' :$(hdr).css('width'),
							'border' :$(hdr).css('border')
						}; 
			headers.push(header);
			});
			
		return(headers)
		},
	tableGetDataInArray:function(tblName)
		{
		var table = $("#" + tblName).DataTable();
		
		var allData = [];

		$('#' + tblName + ' tbody>tr').each(function () 
			{  
			var rowData = [];
			$('td', this).each(function () 	
				{
				var celldata = {'text' : $(this).html(),
								'classlist': $(this).attr("class").split(/\s+/),
								'color' : $(this).css('color'),
								'background' : $(this).css('background'),
								'fontweight' :$(this).css('font-weight'),
								'fontsize' :$(this).css('font-size'),
								'width' :$(this).css('width'),
								'border' :$(this).css('border')
								}; 
					
				rowData.push(celldata);
				});  
			
			allData.push(rowData)
			});

		return(allData)
		},

	tableSelectRowByIndex:function (tblName, index)
		{
		gpttb.deSelectAllTblObjs(tblName);

		var table = $("#" + tblName).DataTable();
		$(table.row(index).node()).addClass('selectedRow');
		//$(table).draw(true);
		},	
	
	tableSelectRow:function (tblName, fieldname, fieldvalue)
		{
		var table = $("#" + tblName).DataTable();
		var selected = false;
		table.rows().every(function (index) 
			{
			var tblobj = this.data();

			if ( (tblobj) && (tblobj[fieldname] == fieldvalue) )
				{
				var tblRow = this.node();
				$(tblRow).addClass('selectedRow'); //.draw(true);
				selected = true;
				}
			});
		return(selected);
		},
		
	tableSelectRows:function (results, tblName, fieldname)
		{
		gpttb.deSelectAllTblObjs(tblName);

		var table = $("#" + tblName).DataTable();

		if ( (results == undefined) || (results.length <= 0) )
			return(false);

		var selected = false;
		table.rows().every(function (index) 
			{
			var tblobj = this.data();

			for (var i = 0; i < results.length; i++)
				{
				if ( (tblobj) && (tblobj[fieldname] == results[i][fieldname]) )
					{
					var tblRow = this.node();
					$(tblRow).addClass('selectedRow'); //.draw(true);
					selected = true;
					}
				}
			});
		return(selected);
		},
		
	deleteTblSelectedObj:function(tblName)
		{
		if ($("#" + tblName).find('tr.selectedRow').length <= 0)
			return (null);

		var dataTable = $("#" + tblName).DataTable();
		var selectedRow = dataTable.rows('.selectedRow');

		if (selectedRow)
			{
			dataTable.row(selectedRow).remove();
			dataTable.draw(false);
			}
		},
		
	tableRedraw:function (tblName)
		{
		if (tblName == null)
			return;

		if ( ! $.fn.DataTable.isDataTable('#' + tblName) )
			return;

		//var dataTable = $("#" + tblName).DataTable();
		
		//dataTable.columns.adjust().draw();
		
		$.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
		},

};

if (typeof (module) !== 'undefined' && module.exports) 
	{
    module.exports = gpttb
    };




