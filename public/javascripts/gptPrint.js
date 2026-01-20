var html2canvas = undefined;
var jspdf = undefined;

var gptprint = 
	{
/*
	callbackUpload:function(obj,apiCmd)	
		{
		if (obj.f_url.length > 0)
			{
			var newwindow = window.open(obj.f_url,'_blank');
			}
		},
		
	sendPDFToServer:function(pdf)
		{
		var blob = pdf.output('blob');
		
		var formData = new FormData();
		formData.append('uploadFile',blob);
		var objUpload = new defines.objFileUpload();

		objUpload.f_uploaddirectory = defines.TMPUPLOAD_DIRECTORY;
		objUpload.f_fileext = 'PDF';

		formData.append('objUpload', JSON.stringify(objUpload));		
		gptcomm.processServerUpload('reportupload', formData,null,null,gptprint.callbackUpload);
		},
*/				
	sendPDFToPrinter:function(pdf)
		{	
		pdf.autoPrint();
        pdf.output("dataurlnewwindow");
		},
		
	applyPageCount:function(pdf,report)
		{
		var pageCount = pdf.internal.getNumberOfPages(); //Total Page Number
	
		var printTime = new Date(Date.now());
		var displayTime = gptdt.formatLocalDate(printTime, 'mm/dd/yyyy - ampmHH:ampmMM ampm')
		var pageWidth = pdf.internal.pageSize.width;
		var pageHeight = pdf.internal.pageSize.height;
		for(i = 0; i < pageCount; i++) 				
			{ 
			pdf.setPage(i); 
			var pageCurrent = pdf.internal.getCurrentPageInfo().pageNumber; //Current Page
			pdf.setFontSize(10);

			pdf.text(pageCurrent + ' / ' + pageCount, pageWidth - 10, pageHeight - 10,{align:'right'});				
			pdf.text(displayTime, 10, pageHeight - 10, {align:'left'});	
			pdf.text(report.f_title, pageWidth / 2.0, pageHeight - 10, {align:'center'});
			}
		},
	generatePDF:function (idPrintDiv,pdf,report) 
		{
		window.html2canvas = html2canvas;
		
		var Pad = 0;
		var paperwidth = pdf.internal.pageSize.getWidth() - (2.0 * Pad);
		// add a small amount for page numbering 
		var paperheight = pdf.internal.pageSize.getHeight() - (3.0 * Pad);
		var parent = document.getElementById(idPrintDiv);
		html2canvas(parent,{
							useCORS: true,
							allowTaint: false
							})
			.then(function (canvas)
				{
				var imgData = canvas.toDataURL('image/png',1.0);		
							
				var widthRatio = paperwidth / canvas.width;
				var heightRatio = paperheight / canvas.height;
				var ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

				// small adjustment for page number
				pdf.addImage(imgData,'PNG',Pad,Pad,canvas.width * ratio,canvas.height * ratio,
							undefined, 'FAST')

				gptut.setDivShowState('divPrint',false,true);
				gptprint.applyPageCount(pdf,report);
				gptprint.sendPDFToPrinter(pdf);
				});
		},
	
	calcNewFontSize:function(fontsize,scale)
		{
		var size = fontsize.split('px');
		var newSize = gptma.mathTrunc((size[0] * scale),2) + 'px';
		return(newSize)
		},
	
	buildHeaderRow:function (headers,scaleFactor)
		{
		var parentId = 'idPrintTableHeaderParent';
		
		// delete any existing 
		gptut.deleteElementChildren(parentId);
	
		var parentElem = document.getElementById(parentId);
		var headerHTML = '';
		
		var rowElem = document.createElement('div');
		rowElem.classList.add("printRow")
		parentElem.appendChild(rowElem)

		for (var i = 0; i < headers.length; i++)
			{
			var colElem = document.createElement('label');
			colElem.classList.add("printHeaderCell")
			for(var k = 0; k < headers[i].classlist.length; k++)
				colElem.classList.add(headers[i].classlist[k]);
				
			colElem.style.color = headers[i].color;
			colElem.style.background = headers[i].background;
			colElem.style.fontWeight = headers[i].fontweight;
			colElem.style.fontSize = gptprint.calcNewFontSize(headers[i].fontsize,scaleFactor);
			colElem.style.width = headers[i].width + 'px';
			colElem.style.border = headers[i].border;
			
			var colHTML = headers[i].text;
			colElem.innerHTML = colHTML;
			rowElem.appendChild(colElem)
			}
		},		
		
	buildDataRows:function (rows,scaleFactor)
		{
		var parentId = 'idPrintTableBodyParent';
		
		// delete any existing 
		gptut.deleteElementChildren(parentId);
	
		var parentElem = document.getElementById(parentId);

		var rowHTML = '';

		for (var i = 0; i < rows.length; i++)
			{
			var row = rows[i];
		
			var rowElem = document.createElement('div');
			rowElem.classList.add("printRow")
			parentElem.appendChild(rowElem)
			
			for(var j = 0; j < row.length; j++)
				{
				var colElem = document.createElement('label');
				colElem.classList.add("printDataCell")
				for(var k = 0; k < row[j].classlist.length; k++)
					colElem.classList.add(row[j].classlist[k]);
					
				colElem.style.color = row[j].color;
				colElem.style.background = row[j].background;
				colElem.style.fontWeight = row[j].fontweight;
				colElem.style.fontSize = gptprint.calcNewFontSize(row[j].fontsize,scaleFactor);
				colElem.style.width = row[j].width + 'px';
				colElem.style.border = row[j].border;
				
				var colHTML = row[j].text;
				colElem.innerHTML = colHTML;
				rowElem.appendChild(colElem)
				}
			}
		},		

	calcAdjustedColumnWidths:function(headers,rows,pdf)
		{
		// need only loop thru first row
		var totalWidth = 0.0;
		for (var i = 0; i < rows[0].length; i++) 
			totalWidth += parseFloat(rows[0][i].width);
			
		//	Adjusting Column Widths
		var pageWidth = pdf.internal.pageSize.getWidth();
		var scaleFactor = gptma.mathTrunc((parseFloat(pageWidth) / parseFloat(totalWidth)),2);
 
		for (var i = 0; i < rows.length; i++) 
			for (var j = 0; j < rows[i].length; j++)
				rows[i][j].width = parseFloat(rows[i][j].width) * parseFloat(scaleFactor);

		for (var i = 0; i < headers.length; i++)
			headers[i].width = parseFloat(headers[i].width) * parseFloat(scaleFactor);
		
		return(scaleFactor);
		},
		
	buildPrintPage:function(headers,rows,pdf)
		{
		//calculate adjusted column width
		var scaleFactor = gptprint.calcAdjustedColumnWidths(headers,rows,pdf);
		gptprint.buildHeaderRow(headers,scaleFactor);
		gptprint.buildDataRows(rows,scaleFactor)
		},

	prepPrintReportResults:function(pdf,report)
		{
		var tblName = report.f_table;
		var rows = gpttb.tableGetDataInArray(tblName);
		var headers = gpttb.tableGetColumnHeaders(tblName);

		if ( (!rows) || (rows.length <= 0) )
			return(false)

		gptprint.buildPrintPage(headers,rows,pdf)
		
		return(true);
		},
	
	printProcess:function(report)
		{	
		
		jsPDF = jspdf.jsPDF;
		var paperorientation = 'l';
		var pdf = new jsPDF({'orientation':paperorientation,'unit':'pt','formt':'letter',
									'putOnlyUsedFonts':true});

		if (gptprint.prepPrintReportResults(pdf,report) != true)
			return;

		gptut.setDivShowState('divPrint',true,true);

		gptprint.generatePDF('divPrint',pdf,report);
		},
		
	printReportResults:function(report)
		{	
		if (report == undefined)
			return;
			
		var loadArray = [];
		
		if (html2canvas == undefined)
			loadArray.push({'url':'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js',
							'type':'text/javascript'});
		if (jspdf == undefined)
			loadArray.push({'url':'https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js',
							'type':'text/javascript'});
		if (loadArray.length <= 0)
			gptprint.printProcess(report);
		else
			gptut.include(loadArray,function ()	{gptprint.printProcess(report);	});
		},
};
